import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { defaultAboutConfig, validateAboutConfig, mergeWithDefaults } from '@/lib/models/AboutConfig';

/**
 * GET /api/config/about
 * Lấy cấu hình trang About (public)
 */
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const config = await db
      .collection('aboutConfig')
      .findOne({ config_type: 'about' });

    if (!config) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ...defaultAboutConfig,
            created_at: null,
            updated_at: null,
          },
        },
        { status: 200 }
      );
    }

    const mergedConfig = mergeWithDefaults(config);

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
    console.error('Error fetching about config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy cấu hình trang About' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config/about
 * Cập nhật cấu hình trang About (admin only)
 */
export async function PUT(request) {
  try {
    const body = await request.json();

    const validation = validateAboutConfig(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', errors: validation.errors },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const existing = await db
      .collection('aboutConfig')
      .findOne({ config_type: 'about' });

    const now = new Date();

    if (!existing) {
      const newConfig = mergeWithDefaults(body);
      newConfig.config_type = 'about';
      newConfig.created_at = now;
      newConfig.updated_at = now;

      const result = await db.collection('aboutConfig').insertOne(newConfig);

      return NextResponse.json(
        {
          success: true,
          message: 'Tạo cấu hình thành công',
          data: { ...newConfig, _id: result.insertedId.toString() },
        },
        { status: 201 }
      );
    } else {
      const mergedExisting = mergeWithDefaults(existing);
      const mergedNew = mergeWithDefaults(body);

      const updateData = { ...mergedExisting };

      if (body.hero) {
        updateData.hero = { ...updateData.hero, ...body.hero };
      }
      if (body.mission) {
        updateData.mission = { ...updateData.mission, ...body.mission };
      }
      if (body.values) {
        updateData.values = { ...updateData.values, ...body.values };
      }
      if (body.team) {
        updateData.team = { ...updateData.team, ...body.team };
      }
      if (body.cta) {
        updateData.cta = { ...updateData.cta, ...body.cta };
      }
      if (body.section_title !== undefined) {
        updateData.section_title = body.section_title;
      }
      if (body.section_description !== undefined) {
        updateData.section_description = body.section_description;
      }
      if (body.content !== undefined) {
        updateData.content = body.content;
      }
      if (body.features !== undefined) {
        updateData.features = body.features;
      }
      if (body.stats !== undefined) {
        updateData.stats = body.stats;
      }
      if (body.seo) {
        updateData.seo = { ...updateData.seo, ...body.seo };
      }

      updateData.updated_at = now;

      const result = await db
        .collection('aboutConfig')
        .updateOne(
          { config_type: 'about' },
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
    console.error('Error updating about config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật cấu hình trang About' },
      { status: 500 }
    );
  }
}

