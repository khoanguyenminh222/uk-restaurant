import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { getAdminFromToken } from '@/lib/auth';

export async function GET(request) {
    try {
        // Check admin authentication
        const admin = await getAdminFromToken(request);
        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const revStatus = searchParams.get('rev_status'); // Comma separated statuses

        const client = await clientPromise;
        const db = client.db(getDatabaseName());

        // Timezone offset for Vietnam (ICT +07:00)
        const ICT_OFFSET = 7 * 60 * 60 * 1000;

        // "Today" calculation in ICT
        const now = new Date();
        const nowICT = new Date(now.getTime() + ICT_OFFSET);
        const startOfTodayICT = new Date(nowICT.getFullYear(), nowICT.getMonth(), nowICT.getDate());
        const startOfTodayUTC = new Date(startOfTodayICT.getTime() - ICT_OFFSET);

        const startOfYesterdayUTC = new Date(startOfTodayUTC.getTime() - 24 * 60 * 60 * 1000);

        // Date filter for total stats
        const totalFilter = {};

        // Revenue filter - default to delivered and completed
        let revenueStatuses = ['delivered', 'completed'];
        if (revStatus) {
            revenueStatuses = revStatus.split(',').map(s => s.trim()).filter(Boolean);
        }
        const revenueFilter = { status: { $in: revenueStatuses } };

        if (from || to) {
            totalFilter.created_at = {};
            revenueFilter.created_at = {};
            if (from) {
                // "2026-01-25" becomes 2026-01-25 00:00:00 in ICT -> 2026-01-24 17:00:00Z
                const fromDate = new Date(from);
                const fromDateUTC = new Date(fromDate.getTime() - (fromDate.getTimezoneOffset() * 60000)); // Ensure local interp
                // But better to just assume YYYY-MM-DD input is local date
                const [y, m, d] = from.split('-').map(Number);
                const localFrom = new Date(y, m - 1, d);
                const utcFrom = new Date(localFrom.getTime() - ICT_OFFSET);

                totalFilter.created_at.$gte = utcFrom;
                revenueFilter.created_at.$gte = utcFrom;
            }
            if (to) {
                const [y, m, d] = to.split('-').map(Number);
                const localTo = new Date(y, m - 1, d, 23, 59, 59, 999);
                const utcTo = new Date(localTo.getTime() - ICT_OFFSET);

                totalFilter.created_at.$lte = utcTo;
                revenueFilter.created_at.$lte = utcTo;
            }
        }

        // 1. Total Stats (Filtered by period if provided)
        const [totalRevenueResult, orderStats, totalCustomers, totalDiscountResult] = await Promise.all([
            db.collection('orders').aggregate([
                { $match: revenueFilter },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $toDouble: '$total_price' } }
                    }
                }
            ]).toArray(),
            db.collection('orders').aggregate([
                { $match: totalFilter },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]).toArray(),
            db.collection('orders').distinct('customer_phone', totalFilter),
            db.collection('orders').countDocuments({
                ...totalFilter,
                discount_percent: { $gt: 0 }
            })
        ]);

        const totalRevenue = totalRevenueResult[0]?.total || 0;
        const discountedOrdersCount = totalDiscountResult || 0;
        const totalOrders = orderStats.reduce((acc, curr) => acc + curr.count, 0);
        const pendingOrders = orderStats.find(s => s._id === 'pending')?.count || 0;
        const confirmedOrders = orderStats.find(s => s._id === 'confirmed')?.count || 0;
        const cancelledOrders = orderStats.find(s => s._id === 'cancelled')?.count || 0;

        // 2. Today's Stats
        const [todayRevenueResult, todayOrders] = await Promise.all([
            db.collection('orders').aggregate([
                {
                    $match: {
                        status: { $in: ['delivered', 'completed'] },
                        created_at: { $gte: startOfTodayUTC }
                    }
                },
                { $group: { _id: null, total: { $sum: { $toDouble: '$total_price' } } } }
            ]).toArray(),
            db.collection('orders').countDocuments({
                created_at: { $gte: startOfTodayUTC }
            })
        ]);

        const todayRevenue = todayRevenueResult[0]?.total || 0;

        // 3. Yesterday's Stats (for comparison)
        const [yesterdayRevenueResult, yesterdayOrders] = await Promise.all([
            db.collection('orders').aggregate([
                {
                    $match: {
                        status: { $in: ['delivered', 'completed'] },
                        created_at: { $gte: startOfYesterdayUTC, $lt: startOfTodayUTC }
                    }
                },
                { $group: { _id: null, total: { $sum: { $toDouble: '$total_price' } } } }
            ]).toArray(),
            db.collection('orders').countDocuments({
                created_at: { $gte: startOfYesterdayUTC, $lt: startOfTodayUTC }
            })
        ]);

        const yesterdayRevenue = yesterdayRevenueResult[0]?.total || 0;

        return NextResponse.json({
            success: true,
            data: {
                total: {
                    revenue: totalRevenue,
                    orders: totalOrders,
                    customers: totalCustomers.length,
                    pending: pendingOrders,
                    confirmed: confirmedOrders,
                    cancelled: cancelledOrders,
                    discounted_orders: discountedOrdersCount,
                    success: orderStats.filter(s => ['delivered', 'completed'].includes(s._id)).reduce((acc, curr) => acc + curr.count, 0),
                    processing: orderStats.filter(s => ['pending', 'confirmed', 'preparing', 'ready'].includes(s._id)).reduce((acc, curr) => acc + curr.count, 0),
                },
                today: {
                    revenue: todayRevenue,
                    orders: todayOrders,
                },
                yesterday: {
                    revenue: yesterdayRevenue,
                    orders: yesterdayOrders,
                }
            }
        });
    } catch (error) {
        console.error('Error fetching summary stats:', error);
        console.error('Stack trace:', error.stack);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
