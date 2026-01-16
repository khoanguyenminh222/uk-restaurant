export const runtime = 'edge';

import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';

/**
 * GET /api/food/popular
 * Lấy danh sách món ăn nổi bật (đặt nhiều nhất) từ orderLog
 * Query params:
 *   - limit (optional) - số lượng món nổi bật (default: 8)
 * 
 * Logic:
 * 1. Query orderLog để lấy tất cả records
 * 2. Join với orders collection qua order_id
 * 3. Lọc chỉ lấy orders có status != 'cancelled'
 * 4. Group by món_id và sum quantity
 * 5. Sort giảm dần theo tổng quantity
 * 6. Lấy top N món và join với food collection để lấy thông tin đầy đủ
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Bước 1: Lấy tất cả orders không bị hủy
    const validOrders = await db
      .collection('orders')
      .find({ status: { $ne: 'cancelled' } })
      .project({ order_id: 1 })
      .toArray();

    const validOrderIds = validOrders.map(order => order.order_id);

    // Nếu không có order nào → trả về empty array
    if (validOrderIds.length === 0) {
      return NextResponse.json(
        { 
          success: true, 
          data: [],
          message: 'Chưa có đơn hàng nào'
        },
        { status: 200 }
      );
    }

    // Bước 2: Query orderLog và lọc theo validOrderIds
    const orderLogs = await db
      .collection('orderLog')
      .find({ order_id: { $in: validOrderIds } })
      .toArray();

    // Nếu không có orderLog → trả về empty array
    if (orderLogs.length === 0) {
      return NextResponse.json(
        { 
          success: true, 
          data: [],
          message: 'Chưa có dữ liệu đặt hàng'
        },
        { status: 200 }
      );
    }

    // Bước 3: Group by food_id và sum quantity
    const foodStats = {};
    orderLogs.forEach(log => {
      const foodId = log.food_id;
      if (!foodStats[foodId]) {
        foodStats[foodId] = {
          food_id: foodId,
          name: log.name,
          category_id: log.category_id,
          category_name: log.category_name,
          total_quantity: 0
        };
      }
      foodStats[foodId].total_quantity += log.quantity || 0;
    });

    // Bước 4: Convert to array và sort theo total_quantity giảm dần
    const popularFoods = Object.values(foodStats)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit);

    // Bước 5: Lấy thông tin đầy đủ từ food collection
    const foodIds = popularFoods.map(f => f.food_id);
    const foods = await db
      .collection('food')
      .find({ id: { $in: foodIds }, is_available: { $ne: false } })
      .toArray();

    // Tạo map để dễ lookup
    const foodMap = {};
    foods.forEach(food => {
      foodMap[food.id] = food;
    });

    // Merge data: thêm thông tin từ food collection và giữ nguyên thứ tự popular
    const result = popularFoods
      .map(popular => {
        const food = foodMap[popular.food_id];
        if (!food) return null; // Bỏ qua nếu món không còn tồn tại hoặc không available
        
        return {
          ...food,
          total_quantity: popular.total_quantity, // Thêm số lượng đã đặt
        };
      })
      .filter(food => food !== null); // Lọc bỏ null

    return NextResponse.json(
      { 
        success: true, 
        data: result,
        count: result.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching popular foods:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách món nổi bật' },
      { status: 500 }
    );
  }
}


