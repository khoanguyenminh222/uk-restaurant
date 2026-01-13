import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { validateUserRegistration } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';
import { checkBlacklist } from '@/lib/blacklist';

/**
 * POST /api/auth/register
 * Đăng ký user mới
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Validate input
    const validation = validateUserRegistration(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existingPhone = await db.collection('users').findOne({ phone: body.phone });
    if (existingPhone) {
      // Nếu đã tồn tại và đã verify -> Báo lỗi
      if (existingPhone.email_verified) {
        return NextResponse.json(
          { success: false, error: 'Số điện thoại đã được sử dụng' },
          { status: 400 }
        );
      }
      // Nếu chưa verify -> Cho phép ghi đè/update (User đang đăng ký lại/sửa thông tin)
    }

    // Check if email is blacklisted
    const normalizedEmail = body.email.trim().toLowerCase();
    const blacklistCheck = await checkBlacklist(normalizedEmail);
    if (blacklistCheck.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email này đã bị chặn. Vui lòng liên hệ hỗ trợ.',
          error_code: 'BLACKLISTED',
        },
        { status: 403 }
      );
    }

    // Check if email already exists
    // Cần check xem email có thuộc về user k
    const existingEmail = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingEmail) {
      // Nếu email đã có người dùng
      // 1. Nếu là người khác (phone khác)
      if (existingEmail.phone !== body.phone) {
        if (existingEmail.email_verified) {
          return NextResponse.json(
            { success: false, error: 'Email đã được sử dụng' },
            { status: 400 }
          );
        }
        // Nếu email thuộc về user chưa verify khác -> Có thể báo lỗi hoặc cho phép (tùy policy).
        // Ở đây báo lỗi cho an toàn để tránh confuse
        return NextResponse.json(
          { success: false, error: 'Email đã được sử dụng bởi tài khoản khác đang chờ xác thực' },
          { status: 400 }
        );
      }
      // 2. Nếu là chính user này (phone giống) -> OK, sẽ update bên dưới
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Generate user_id (use phone as user_id)
    const user_id = body.phone;

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user object payload
    const userPayload = {
      phone: body.phone,
      name: body.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      address: body.address?.trim() || '',
      role: existingPhone ? existingPhone.role : 'user', // Keep existing role if updating, else default
      email_verified: false,
      verification_code: verificationCode,
      verification_code_expires: verificationCodeExpires,
      created_at: existingPhone ? existingPhone.created_at : new Date(), // Keep original created_at if updating
      updated_at: new Date(),
      last_login: null,
    };

    let result;
    if (existingPhone) {
      // Update existing unverified user
      await db.collection('users').updateOne(
        { phone: body.phone },
        { $set: userPayload }
      );
      result = { insertedId: existingPhone._id }; // Mock result for response
    } else {
      // Insert new user
      userPayload.user_id = user_id; // Add user_id only for new insert
      result = await db.collection('users').insertOne(userPayload);
    }

    // Send verification email
    // Verification code expires in 15 minutes (from verificationCodeExpires)
    const expiresInMinutes = 15;
    let emailSent = true;
    let emailError = null;

    try {
      const emailResult = await sendVerificationEmail(
        userPayload.email,
        verificationCode,
        userPayload.name,
        expiresInMinutes
      );

      if (!emailResult.success) {
        throw new Error('Please configure email settings in Admin > Notification Config or set environment variables (EMAIL_USER, EMAIL_PASSWORD).');
      }
    } catch (err) {
      console.error('Error sending verification email:', err);
      emailSent = false;
      emailError = err.message || 'Error sending email';
    }

    // Return user without password
    const { password, verification_code, verification_code_expires, ...userWithoutPassword } = userPayload;

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          ...userWithoutPassword,
        },
        emailSent,
        emailError: emailSent ? null : (emailError || 'Không thể gửi email xác thực. Vui lòng kiểm tra lại email hoặc thử gửi lại sau.'),
      },
      { status: existingPhone ? 200 : 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi đăng ký. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

