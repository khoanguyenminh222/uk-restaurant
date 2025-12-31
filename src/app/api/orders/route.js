import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { validateOrder } from '@/lib/models/Order';
import { validateOrderLog } from '@/lib/models/OrderLog';
import { sendOrderConfirmationEmail } from '@/lib/email';

/**
 * GET /api/orders
 * Lấy danh sách đơn hàng
 * Query params: 
 *   - phone (optional) - tra cứu đơn hàng theo số điện thoại
 *   - order_id (optional) - tra cứu đơn hàng theo mã đơn hàng
 * Admin: lấy tất cả đơn hàng
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const orderId = searchParams.get('order_id');

    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    const query = {};
    if (orderId) {
      query.order_id = orderId;
    } else if (phone) {
      query.customer_phone = phone;
    }

    const orders = await db
      .collection('orders')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json(
      { success: true, data: orders },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy danh sách đơn hàng' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Tạo đơn hàng mới (Public - không cần đăng nhập)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // Validate order
    const validation = validateOrder(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate order_id
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    body.order_id = `ORD-${timestamp}-${random}`;

    // Set default status
    if (!body.status) {
      body.status = 'pending';
    }

    // Set timestamps
    body.created_at = new Date();
    body.updated_at = new Date();

    // Insert order
    const result = await db.collection('orders').insertOne(body);

    // Create order log entries
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      // Multiple items from cart
      const logEntries = body.items.map((item) => ({
        order_id: body.order_id,
        user_id: body.user_id || null,
        món_id: item.món_id,
        tên_món: item.tên_món,
        giá: item.giá,
        quantity: item.quantity,
        category_id: item.category_id,
        category_name: item.category_name,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_address: body.customer_address || '',
        timestamp: new Date(),
      }));

      // Validate and insert logs
      for (const logEntry of logEntries) {
        const logValidation = validateOrderLog(logEntry);
        if (logValidation.isValid) {
          await db.collection('orderLog').insertOne(logEntry);
        }
      }
    } else if (body.món_id) {
      // Single item
      const logEntry = {
        order_id: body.order_id,
        user_id: body.user_id || null,
        món_id: body.món_id,
        tên_món: body.tên_món || '',
        giá: body.giá || 0,
        quantity: body.quantity || 1,
        category_id: body.category_id || 0,
        category_name: body.category_name || '',
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_address: body.customer_address || '',
        timestamp: new Date(),
      };

      const logValidation = validateOrderLog(logEntry);
      if (logValidation.isValid) {
        await db.collection('orderLog').insertOne(logEntry);
      }
    }

    // Get user email if user_id exists
    let customerEmail = null;
    if (body.user_id) {
      try {
        const user = await db.collection('users').findOne({ user_id: body.user_id });
        if (user && user.email) {
          customerEmail = user.email;
        }
      } catch (userError) {
        console.error('Error fetching user email:', userError);
        // Continue without email
      }
    }

    // Send order confirmation email if email is available
    if (customerEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const trackOrderUrl = `${baseUrl}/track-order?order_id=${body.order_id}`;
        
        await sendOrderConfirmationEmail(
          customerEmail,
          body.customer_name,
          body.order_id,
          trackOrderUrl,
          body
        );
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Continue even if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          order_id: body.order_id,
          ...body,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo đơn hàng' },
      { status: 500 }
    );
  }
}

