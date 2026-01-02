import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { defaultLandingConfig, validateLandingConfig, mergeWithDefaults } from '@/lib/models/LandingConfig';

/**
 * GET /api/config/landing
 * Lấy cấu hình landing page (public)
 * Trả về document duy nhất từ collection landingConfig
 * Nếu chưa có → trả về default values (không tự động tạo)
 */
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // Lấy document duy nhất (singleton pattern)
    const config = await db
      .collection('landingConfig')
      .findOne({ config_type: 'landing' });

    // Nếu chưa có → trả về default values
    if (!config) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ...defaultLandingConfig,
            created_at: null,
            updated_at: null,
          },
        },
        { status: 200 }
      );
    }

    // Merge với defaults để đảm bảo có đầy đủ fields
    const mergedConfig = mergeWithDefaults(config);

    // Convert _id thành string
    const result = {
      ...mergedConfig,
      _id: config._id.toString(),
      created_at: config.created_at || null,
      updated_at: config.updated_at || null,
    };

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching landing config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy cấu hình landing page' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config/landing
 * Cập nhật cấu hình landing page (admin only)
 * Body: Object chứa các fields cần update (có thể update từng phần)
 * Nếu document chưa tồn tại → tự động tạo với default values + data từ body
 * Nếu document đã tồn tại → update các fields được gửi lên
 */
export async function PUT(request) {
  try {
    // TODO: Thêm admin authentication check
    // const user = await getUserFromRequest(request);
    // if (!user || !(await isAdmin(user.user_id))) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();

    // Validate
    const validation = validateLandingConfig(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', errors: validation.errors },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('uk-restaurant');

    // Kiểm tra document đã tồn tại chưa
    const existing = await db
      .collection('landingConfig')
      .findOne({ config_type: 'landing' });

    const now = new Date();

    if (!existing) {
      // Tạo mới: merge với defaults
      const newConfig = mergeWithDefaults(body);
      newConfig.config_type = 'landing';
      newConfig.created_at = now;
      newConfig.updated_at = now;

      const result = await db.collection('landingConfig').insertOne(newConfig);

      return NextResponse.json(
        {
          success: true,
          message: 'Tạo cấu hình thành công',
          data: { ...newConfig, _id: result.insertedId.toString() },
        },
        { status: 201 }
      );
    } else {
      // Update: merge với existing config và defaults
      const mergedExisting = mergeWithDefaults(existing);
      const mergedNew = mergeWithDefaults(body);

      // Deep merge: chỉ update các fields được gửi lên
      const updateData = { ...mergedExisting };

      if (body.header) {
        updateData.header = { ...updateData.header, ...body.header };
      }
      if (body.hero) {
        updateData.hero = { ...updateData.hero, ...body.hero };
      }
      if (body.menu) {
        updateData.menu = { ...updateData.menu, ...body.menu };
      }
      if (body.about) {
        updateData.about = { ...updateData.about, ...body.about };
        if (body.about.features) {
          updateData.about.features = body.about.features;
        }
      }
      if (body.contact) {
        updateData.contact = { ...updateData.contact, ...body.contact };
        if (body.contact.info) {
          updateData.contact.info = { ...updateData.contact.info, ...body.contact.info };
        }
        if (body.contact.social_media !== undefined) {
          updateData.contact.social_media = body.contact.social_media;
        }
      }
      if (body.footer) {
        updateData.footer = { ...updateData.footer, ...body.footer };
        if (body.footer.links !== undefined) {
          updateData.footer.links = body.footer.links;
        }
      }

      updateData.updated_at = now;

      const result = await db
        .collection('landingConfig')
        .updateOne(
          { config_type: 'landing' },
          { $set: updateData }
        );

      return NextResponse.json(
        {
          success: true,
          message: 'Cập nhật thành công',
          data: { ...updateData, _id: existing._id.toString() },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error updating landing config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật cấu hình landing page' },
      { status: 500 }
    );
  }
}

