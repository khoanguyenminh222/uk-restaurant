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
        const limit = parseInt(searchParams.get('limit') || '10');
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const revStatus = searchParams.get('rev_status');

        // Revenue statuses
        let revenueStatuses = ['delivered', 'completed'];
        if (revStatus) {
            revenueStatuses = revStatus.split(',').map(s => s.trim()).filter(Boolean);
        }

        const ICT_OFFSET = 7 * 60 * 60 * 1000;
        const query = {};
        if (from || to) {
            query.timestamp = {};
            if (from) {
                const [y, m, d] = from.split('-').map(Number);
                const localFrom = new Date(y, m - 1, d);
                const utcFrom = new Date(localFrom.getTime() - ICT_OFFSET);
                query.timestamp.$gte = utcFrom;
            }
            if (to) {
                const [y, m, d] = to.split('-').map(Number);
                const localTo = new Date(y, m - 1, d, 23, 59, 59, 999);
                const utcTo = new Date(localTo.getTime() - ICT_OFFSET);
                query.timestamp.$lte = utcTo;
            }
        }

        const client = await clientPromise;
        const db = client.db(getDatabaseName());

        const topFood = await db.collection('orderLog').aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: 'order_id',
                    as: 'order_info'
                }
            },
            { $unwind: "$order_info" },
            {
                $match: {
                    "order_info.status": { $in: revenueStatuses }
                }
            },
            {
                $group: {
                    _id: "$food_id",
                    name: { $first: "$name" },
                    category_name: { $first: "$category_name" },
                    total_quantity: { $sum: { $toDouble: "$quantity" } },
                    total_revenue: { $sum: { $multiply: [{ $toDouble: "$price" }, { $toDouble: "$quantity" }] } }
                }
            },
            { $sort: { total_quantity: -1 } },
            { $limit: limit }
        ]).toArray();

        return NextResponse.json({
            success: true,
            data: topFood
        });
    } catch (error) {
        console.error('Error fetching top food stats:', error);
        console.error('Stack trace:', error.stack);
        return NextResponse.json({ success: false, error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
