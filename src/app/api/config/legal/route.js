import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { defaultLegalConfig, validateLegalConfig, mergeWithDefaults } from '@/lib/models/LegalConfig';
import { getAdminFromToken } from '@/lib/auth';

/**
 * GET /api/config/legal
 * Lấy cấu hình các trang pháp lý (public)
 */
export async function GET(request) {
    try {
        const client = await clientPromise;
        const db = client.db(getDatabaseName());

        const config = await db
            .collection('landingConfig')
            .findOne({ config_type: 'legal' });

        if (!config) {
            return NextResponse.json(
                {
                    success: true,
                    data: {
                        ...defaultLegalConfig,
                        created_at: null,
                        updated_at: null,
                    },
                },
                { status: 200 }
            );
        }

        const mergedConfig = mergeWithDefaults(config);

        return NextResponse.json(
            {
                success: true,
                data: {
                    ...mergedConfig,
                    _id: config._id.toString(),
                    created_at: config.created_at || null,
                    updated_at: config.updated_at || null,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching legal config:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi khi lấy cấu hình pháp lý' },
            { status: 500 }
        );
    }
}

/**
 * Sanitize HTML content from Quill editor
 * - Replaces &nbsp; with regular spaces
 */
function sanitizeHtml(html) {
    if (!html || typeof html !== 'string') return html;
    return html
        .replace(/&nbsp;/g, ' ')      // Replace non-breaking spaces with regular spaces
        .replace(/ +/g, ' ')          // Collapse multiple spaces into one
        .trim();
}

/**
 * PUT /api/config/legal
 * Cập nhật cấu hình pháp lý (admin only)
 */
export async function PUT(request) {
    try {
        const admin = await getAdminFromToken(request);
        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const validation = validateLegalConfig(body);
        if (!validation.isValid) {
            return NextResponse.json(
                { success: false, error: 'Dữ liệu không hợp lệ', errors: validation.errors },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(getDatabaseName());

        const existing = await db
            .collection('landingConfig')
            .findOne({ config_type: 'legal' });

        const now = new Date();

        // Sanitize HTML content to remove &nbsp; and extra spaces from Quill editor
        const privacyPolicy = body.privacy_policy || defaultLegalConfig.privacy_policy;
        const termsOfService = body.terms_of_service || defaultLegalConfig.terms_of_service;

        const updateData = {
            config_type: 'legal',
            privacy_policy: {
                ...privacyPolicy,
                content: sanitizeHtml(privacyPolicy.content),
            },
            terms_of_service: {
                ...termsOfService,
                content: sanitizeHtml(termsOfService.content),
            },
            updated_at: now,
        };

        if (!existing) {
            updateData.created_at = now;
            await db.collection('landingConfig').insertOne(updateData);
        } else {
            await db
                .collection('landingConfig')
                .updateOne(
                    { config_type: 'legal' },
                    { $set: updateData }
                );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Cập nhật thành công',
                data: updateData,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating legal config:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi khi cập nhật cấu hình pháp lý' },
            { status: 500 }
        );
    }
}
