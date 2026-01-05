import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { validateOrder } from '@/lib/models/Order';
import { validateOrderLog } from '@/lib/models/OrderLog';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { checkBlacklist, autoBlacklistIfNeeded } from '@/lib/blacklist';
import { isEmailVerified } from '@/lib/emailVerification';
import cache from '@/lib/cache';
import { getSpamConfig } from '@/lib/restaurantConfig';

/**
 * GET /api/orders
 * Lấy danh sách đơn hàng
 * Query params: 
 *   - order_id (optional) - tra cứu đơn hàng theo mã đơn hàng (ưu tiên)
 *   - user_id (optional) - tra cứu đơn hàng theo user_id (cho lịch sử đơn hàng)
 *   - phone (optional) - tra cứu đơn hàng theo số điện thoại (fallback)
 *   - status (optional) - filter theo status
 *   - search (optional) - search theo order_id, customer_name, customer_phone
 *   - page (optional) - số trang
 *   - limit (optional) - số lượng/trang
 * Admin: lấy tất cả đơn hàng
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const orderId = searchParams.get('order_id');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const customerType = searchParams.get('customer_type');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const query = {};
    
    // Specific lookups (for track order)
    if (orderId) {
      query.order_id = orderId;
    } else if (userId) {
      query.user_id = userId;
    } else if (phone) {
      query.customer_phone = phone;
    } else {
      // Admin view - apply filters
      if (status && status !== 'all') {
        query.status = status;
      }

      // Filter by customer type
      if (customerType === 'logged_in') {
        query.user_id = { $exists: true, $ne: null };
      } else if (customerType === 'guest') {
        query.$or = [
          { user_id: { $exists: false } },
          { user_id: null }
        ];
      }

      // Filter by date range
      if (dateFrom || dateTo) {
        query.created_at = {};
        if (dateFrom) {
          // Start of day
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          query.created_at.$gte = fromDate;
        }
        if (dateTo) {
          // End of day
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          query.created_at.$lte = toDate;
        }
      }

      if (search) {
        // If customer type filter already has $or, we need to combine
        if (query.$or) {
          // Customer type filter exists, combine with search
          const customerTypeQuery = { $or: query.$or };
          query.$and = [
            customerTypeQuery,
            {
              $or: [
                { order_id: { $regex: search, $options: 'i' } },
                { customer_name: { $regex: search, $options: 'i' } },
                { customer_phone: { $regex: search, $options: 'i' } },
              ]
            }
          ];
          delete query.$or;
        } else {
          query.$or = [
            { order_id: { $regex: search, $options: 'i' } },
            { customer_name: { $regex: search, $options: 'i' } },
            { customer_phone: { $regex: search, $options: 'i' } },
          ];
        }
      }
    }

    // Get total count
    const total = await db.collection('orders').countDocuments(query);

    // Get orders with pagination
    const orders = await db
      .collection('orders')
      .find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      { 
        success: true, 
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
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
    const db = client.db(getDatabaseName());

    // Get email from body (required for spam check)
    const email = body.customer_email || body.email;
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email là bắt buộc để đặt hàng' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Step 1: Check blacklist
    const blacklistCheck = await checkBlacklist(normalizedEmail);
    if (blacklistCheck.isBlocked) {
      let errorMessage = 'Email này đã bị chặn.';
      
      // Nếu không phải permanent và có blocked_until, hiển thị thời gian hết hạn
      if (!blacklistCheck.is_permanent && blacklistCheck.blocked_until) {
        const blockedUntil = new Date(blacklistCheck.blocked_until);
        const now = new Date();
        const hoursRemaining = Math.ceil((blockedUntil - now) / (1000 * 60 * 60));
        
        if (hoursRemaining > 0) {
          errorMessage += ` Email sẽ được mở khóa sau ${hoursRemaining} giờ.`;
        } else {
          errorMessage += ' Email sẽ được mở khóa sớm.';
        }
      } else if (blacklistCheck.is_permanent) {
        errorMessage += ' Email bị chặn vĩnh viễn. Vui lòng liên hệ hỗ trợ.';
      } else {
        errorMessage += ' Vui lòng liên hệ hỗ trợ.';
      }
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          error_code: 'BLACKLISTED',
          reason: blacklistCheck.reason,
          blocked_until: blacklistCheck.blocked_until,
          is_permanent: blacklistCheck.is_permanent,
        },
        { status: 403 }
      );
    }

    // Step 2: Check email verified
    if (!isEmailVerified(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email chưa được xác thực. Vui lòng xác thực email trước khi đặt hàng.',
          error_code: 'EMAIL_NOT_VERIFIED',
        },
        { status: 400 }
      );
    }

    // Step 3: Check rate limit
    const spamConfig = await getSpamConfig();
    const MAX_ORDERS = spamConfig.max_orders || parseInt(process.env.SPAM_MAX_ORDERS || '5');
    const ORDER_RATE_LIMIT_TTL = spamConfig.order_rate_limit_ttl || parseInt(process.env.SPAM_ORDER_RATE_LIMIT_TTL || '1800');
    const ORDER_RATE_LIMIT_BLACKLIST_HOURS = spamConfig.order_rate_limit_blacklist_hours || parseInt(process.env.SPAM_ORDER_RATE_LIMIT_BLACKLIST_HOURS || '24');
    
    const rateLimitKey = `order_count:${normalizedEmail}:${ORDER_RATE_LIMIT_TTL}s`;
    const orderCount = cache.increment(rateLimitKey, ORDER_RATE_LIMIT_TTL);

    if (orderCount > MAX_ORDERS) {
      // Auto blacklist email
      await autoBlacklistIfNeeded(normalizedEmail, 'too_many_orders', ORDER_RATE_LIMIT_BLACKLIST_HOURS);
      
      return NextResponse.json(
        {
          success: false,
          error: `Bạn đã đặt quá nhiều đơn trong thời gian ngắn. Vui lòng thử lại sau ${ORDER_RATE_LIMIT_BLACKLIST_HOURS} giờ.`,
          error_code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // Validate order
    const validation = validateOrder(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate order_id theo format: ORD-yyyymmdd-XXXX (XXXX là số thứ tự trong ngày)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`; // yyyymmdd
    
    // Tính số đơn hàng trong ngày hiện tại
    const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const ordersToday = await db.collection('orders').countDocuments({
      created_at: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    // Số thứ tự = số đơn hàng hiện tại + 1 (bắt đầu từ 0001)
    const sequenceNumber = ordersToday + 1;
    const sequenceStr = String(sequenceNumber).padStart(4, '0'); // Format thành 4 chữ số
    
    body.order_id = `ORD-${dateStr}-${sequenceStr}`;

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

    // Use email from body (required for spam check) or get from user if logged in
    let customerEmail = normalizedEmail;
    if (body.user_id && !normalizedEmail) {
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

