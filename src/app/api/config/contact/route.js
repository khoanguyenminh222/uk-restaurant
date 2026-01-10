import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { defaultContactConfig, validateContactConfig, mergeWithDefaults } from '@/lib/models/ContactConfig';

/**
 * GET /api/config/contact
 * Lấy cấu hình trang Contact (public)
 */
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const config = await db
      .collection('contactConfig')
      .findOne({ config_type: 'contact' });

    if (!config) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ...defaultContactConfig,
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
    console.error('Error fetching contact config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy cấu hình trang Contact' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config/contact
 * Cập nhật cấu hình trang Contact (admin only)
 */
export async function PUT(request) {
  try {
    const body = await request.json();

    const validation = validateContactConfig(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', errors: validation.errors },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const existing = await db
      .collection('contactConfig')
      .findOne({ config_type: 'contact' });

    const now = new Date();

    if (!existing) {
      const newConfig = mergeWithDefaults(body);
      newConfig.config_type = 'contact';
      newConfig.created_at = now;
      newConfig.updated_at = now;

      const result = await db.collection('contactConfig').insertOne(newConfig);

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
      if (body.section_title !== undefined) {
        updateData.section_title = body.section_title;
      }
      if (body.section_description !== undefined) {
        updateData.section_description = body.section_description;
      }
      if (body.contact_form) {
        updateData.contact_form = { ...updateData.contact_form, ...body.contact_form };
        if (body.contact_form.fields) {
          updateData.contact_form.fields = { ...updateData.contact_form.fields, ...body.contact_form.fields };
        }
      }
      if (body.info) {
        updateData.info = { ...updateData.info, ...body.info };
      }
      if (body.map_embed_url !== undefined) {
        updateData.map_embed_url = body.map_embed_url;
      }
      if (body.social_media !== undefined) {
        updateData.social_media = body.social_media;
      }
      if (body.trustStats) {
        updateData.trustStats = { ...updateData.trustStats, ...body.trustStats };
      }
      if (body.cta) {
        updateData.cta = { ...updateData.cta, ...body.cta };
      }
      if (body.testimonials !== undefined) {
        updateData.testimonials = body.testimonials;
      }
      if (body.seo) {
        updateData.seo = { ...updateData.seo, ...body.seo };
      }

      updateData.updated_at = now;

      const result = await db
        .collection('contactConfig')
        .updateOne(
          { config_type: 'contact' },
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
    console.error('Error updating contact config:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật cấu hình trang Contact' },
      { status: 500 }
    );
  }
}

