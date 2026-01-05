import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { validateUserRegistration } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/create-admin
 * Super admin tạo tài khoản admin mới
 * Requires: Super admin authentication
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    // Check super admin authentication from request headers
    // Get admin info from Authorization header or body
    const adminPhone = body.currentAdminPhone || request.headers.get('x-admin-phone');
    
    if (adminPhone) {
      const currentAdmin = await db.collection('users').findOne({ phone: adminPhone });
      if (!currentAdmin || currentAdmin.role !== 'super_admin') {
        return NextResponse.json(
          { success: false, error: 'Chỉ Super Admin mới có quyền tạo tài khoản admin' },
          { status: 403 }
        );
      }
    } else {
      // TODO: Implement proper authentication check (JWT/session)
      // For now, allow if no adminPhone provided (development mode)
      // In production, this should be required
      console.warn('Warning: No admin authentication provided. Allowing in development mode.');
    }

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

    // Validate role (only allow admin or manager, not super_admin)
    const allowedRoles = ['admin', 'manager'];
    const role = body.role && allowedRoles.includes(body.role) ? body.role : 'admin';

    // Create admin user object
    const adminUser = {
      user_id,
      phone: body.phone,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: hashedPassword,
      address: body.address?.trim() || '',
      role: role, // Set role as admin or manager (not super_admin)
      email_verified: true, // Admin accounts are auto-verified
      verification_code: null,
      verification_code_expires: null,
      created_at: new Date(),
      last_login: null,
    };

    // Insert admin user
    const result = await db.collection('users').insertOne(adminUser);

    // Return admin user without password
    const { password, verification_code, verification_code_expires, ...adminWithoutPassword } = adminUser;

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          ...adminWithoutPassword,
        },
        message: 'Đã tạo tài khoản admin thành công',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo tài khoản admin. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
