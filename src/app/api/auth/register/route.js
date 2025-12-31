import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { validateUserRegistration } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/register
 * Đăng ký user mới
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

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

    // Check if email already exists
    const existingEmail = await db.collection('users').findOne({ email: body.email });
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

    // Create user object
    const user = {
      user_id,
      phone: body.phone,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: hashedPassword,
      address: body.address?.trim() || '',
      created_at: new Date(),
      last_login: null,
    };

    // Insert user
    const result = await db.collection('users').insertOne(user);

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

