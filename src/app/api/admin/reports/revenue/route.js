import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { getAdminFromToken } from '@/lib/auth';

export async function GET(request) {
    try {
        const admin = await getAdminFromToken(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const revStatus = searchParams.get('rev_status');

        // Default statuses for revenue
        let revenueStatuses = ['delivered', 'completed'];
        if (revStatus) {
            revenueStatuses = revStatus.split(',').map(s => s.trim()).filter(Boolean);
        }

        const ICT_OFFSET = 7 * 60 * 60 * 1000;

        // Date boundaries in UTC based on local ICT input
        const endDateUTC = to
            ? new Date(new Date(to).getTime() + (23 * 3600 * 1000 + 59 * 60 * 1000 + 59 * 1000 + 999) - ICT_OFFSET)
            : new Date();
        if (!to) endDateUTC.setHours(23, 59, 59, 999);

        const startDateUTC = from
            ? new Date(new Date(from).getTime() - ICT_OFFSET)
            : new Date();
        if (!from) {
            startDateUTC.setHours(0, 0, 0, 0);
            startDateUTC.setDate(endDateUTC.getDate() - 30);
        } else {
            startDateUTC.setHours(0, 0, 0, 0);
        }

        const client = await clientPromise;
        const db = client.db(getDatabaseName());

        // Thực hiện aggregation để lấy doanh thu và số lượng đơn hàng theo trạng thái
        const revenueData = await db.collection('orders').aggregate([
            {
                $match: {
                    created_at: { $gte: startDateUTC, $lte: endDateUTC }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$created_at", timezone: "+0700" }
                    },
                    revenue: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", revenueStatuses] },
                                { $toDouble: "$total_price" },
                                0
                            ]
                        }
                    },
                    orders: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", revenueStatuses] },
                                1,
                                0
                            ]
                        }
                    },
                    successCount: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", revenueStatuses] },
                                1,
                                0
                            ]
                        }
                    },
                    cancelledCount: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "cancelled"] },
                                1,
                                0
                            ]
                        }
                    },
                    totalCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        // Fill in missing dates with zero
        const result = [];
        const current = new Date(startDateUTC.getTime() + ICT_OFFSET);
        const endLocal = new Date(endDateUTC.getTime() + ICT_OFFSET);

        while (current <= endLocal) {
            const dateStr = current.toISOString().split('T')[0];
            const found = revenueData.find(d => d._id === dateStr);
            result.push({
                date: dateStr,
                revenue: found ? found.revenue : 0,
                orders: found ? found.orders : 0,
                successCount: found ? found.successCount : 0,
                cancelledCount: found ? found.cancelledCount : 0,
                totalCount: found ? found.totalCount : 0
            });
            current.setDate(current.getDate() + 1);
        }

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        console.error('Stack trace:', error.stack);
        return NextResponse.json({ success: false, error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
