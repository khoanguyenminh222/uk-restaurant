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
      return NextResponse.json(
        { success: false, error: 'Số điện thoại đã được sử dụng' },
        { status: 400 }
      );
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
    const existingEmail = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Generate user_id (use phone as user_id)
    const user_id = body.phone;

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user object
    const user = {
      user_id,
      phone: body.phone,
      name: body.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      address: body.address?.trim() || '',
      role: 'user', // Default role for regular users
      email_verified: false,
      verification_code: verificationCode,
      verification_code_expires: verificationCodeExpires,
      created_at: new Date(),
      last_login: null,
    };

    // Insert user
    const result = await db.collection('users').insertOne(user);

    // Send verification email
    // Verification code expires in 15 minutes (from verificationCodeExpires)
    const expiresInMinutes = 15;
    try {
      await sendVerificationEmail(
        user.email,
        verificationCode,
        user.name,
        expiresInMinutes
      );
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue even if email fails (user can request resend later)
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          ...userWithoutPassword,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi đăng ký. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

