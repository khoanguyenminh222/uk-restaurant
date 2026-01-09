import { NextResponse } from 'next/server';
import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { defaultLandingConfig, validateLandingConfig, mergeWithDefaults } from '@/lib/models/LandingConfig';
import { calculateReviewStats } from '@/lib/models/Review';

/**
 * GET /api/config/landing
 * Lấy cấu hình landing page (public)
 * Trả về document duy nhất từ collection landingConfig
 * Nếu chưa có → trả về default values (không tự động tạo)
 */
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

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
    const db = client.db(getDatabaseName());

    // Kiểm tra document đã tồn tại chưa
    const existing = await db
      .collection('landingConfig')
      .findOne({ config_type: 'landing' });

    const now = new Date();

    if (!existing) {
      // Tạo mới: merge với defaults
      const newConfig = mergeWithDefaults(body);
      
      // Tự động thêm color và borderColor mặc định cho các feature thiếu
      if (newConfig.whyChooseUs && newConfig.whyChooseUs.features) {
        const defaultColors = [
          { color: 'from-green-500/20 to-emerald-600/10', borderColor: 'border-green-500/30' },
          { color: 'from-orange-500/20 to-amber-600/10', borderColor: 'border-orange-500/30' },
          { color: 'from-blue-500/20 to-cyan-600/10', borderColor: 'border-blue-500/30' },
          { color: 'from-purple-500/20 to-violet-600/10', borderColor: 'border-purple-500/30' },
          { color: 'from-pink-500/20 to-rose-600/10', borderColor: 'border-pink-500/30' },
          { color: 'from-yellow-500/20 to-amber-600/10', borderColor: 'border-yellow-500/30' },
        ];
        
        newConfig.whyChooseUs.features = newConfig.whyChooseUs.features.map((feature, index) => {
          if (feature.color && feature.borderColor) {
            return feature;
          }
          const colorIndex = index % defaultColors.length;
          return {
            ...feature,
            color: feature.color || defaultColors[colorIndex].color,
            borderColor: feature.borderColor || defaultColors[colorIndex].borderColor,
          };
        });
      }
      
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

      if (body.restaurant_name !== undefined) {
        updateData.restaurant_name = body.restaurant_name;
      }

      if (body.slogan !== undefined) {
        updateData.slogan = body.slogan;
      }

      if (body.header) {
        updateData.header = { ...updateData.header, ...body.header };
      }
      if (body.hero) {
        updateData.hero = { ...updateData.hero, ...body.hero };
      }
      if (body.menu) {
        updateData.menu = { ...updateData.menu, ...body.menu };
      }
      if (body.whyChooseUs) {
        updateData.whyChooseUs = { ...updateData.whyChooseUs, ...body.whyChooseUs };
        if (body.whyChooseUs.features) {
          // Tự động thêm color và borderColor mặc định cho các feature thiếu
          const defaultColors = [
            { color: 'from-green-500/20 to-emerald-600/10', borderColor: 'border-green-500/30' },
            { color: 'from-orange-500/20 to-amber-600/10', borderColor: 'border-orange-500/30' },
            { color: 'from-blue-500/20 to-cyan-600/10', borderColor: 'border-blue-500/30' },
            { color: 'from-purple-500/20 to-violet-600/10', borderColor: 'border-purple-500/30' },
            { color: 'from-pink-500/20 to-rose-600/10', borderColor: 'border-pink-500/30' },
            { color: 'from-yellow-500/20 to-amber-600/10', borderColor: 'border-yellow-500/30' },
          ];
          
          updateData.whyChooseUs.features = body.whyChooseUs.features.map((feature, index) => {
            // Nếu feature đã có color và borderColor, giữ nguyên
            if (feature.color && feature.borderColor) {
              return feature;
            }
            // Nếu không có, thêm từ mảng mặc định dựa trên index
            const colorIndex = index % defaultColors.length;
            return {
              ...feature,
              color: feature.color || defaultColors[colorIndex].color,
              borderColor: feature.borderColor || defaultColors[colorIndex].borderColor,
            };
          });
        }
        if (body.whyChooseUs.stats) {
          updateData.whyChooseUs.stats = body.whyChooseUs.stats;
        }
        // Nếu auto_calculate_stats = true, tính toán stats từ reviews
        if (body.whyChooseUs.auto_calculate_stats === true) {
          try {
            const reviews = await db
              .collection('reviews')
              .find({ is_approved: { $ne: false } })
              .toArray();
            
            const stats = calculateReviewStats(reviews);
            
            // Cập nhật stats từ reviews
            updateData.whyChooseUs.stats = updateData.whyChooseUs.stats || [];
            updateData.whyChooseUs.stats = updateData.whyChooseUs.stats.map(stat => {
              if (stat.icon === 'Users') {
                return { ...stat, value: `${stats.totalReviews.toLocaleString('vi-VN')}+` };
              }
              if (stat.icon === 'Star') {
                return { ...stat, value: `${stats.averageRating}/5` };
              }
              return stat;
            });
          } catch (error) {
            console.error('Error calculating stats from reviews:', error);
          }
        }
      }
      if (body.testimonials) {
        updateData.testimonials = { ...updateData.testimonials, ...body.testimonials };
        if (body.testimonials.trustStats) {
          updateData.testimonials.trustStats = { ...updateData.testimonials.trustStats, ...body.testimonials.trustStats };
        }
        if (body.testimonials.testimonials) {
          updateData.testimonials.testimonials = body.testimonials.testimonials;
        }
        // Nếu auto_calculate_stats = true, tính toán trustStats từ reviews
        if (body.testimonials.auto_calculate_stats === true) {
          try {
            const reviews = await db
              .collection('reviews')
              .find({ is_approved: { $ne: false } })
              .toArray();
            
            const stats = calculateReviewStats(reviews);
            
            updateData.testimonials.trustStats = {
              averageRating: stats.averageRating,
              totalReviews: stats.totalReviews,
              verifiedCustomers: stats.verifiedCustomers,
            };
          } catch (error) {
            console.error('Error calculating trustStats from reviews:', error);
          }
        }
      }
      if (body.footer) {
        updateData.footer = { ...updateData.footer, ...body.footer };
        if (body.footer.links !== undefined) {
          updateData.footer.links = body.footer.links;
        }
      }
      if (body.seo) {
        updateData.seo = { ...updateData.seo, ...body.seo };
      }
      if (body.spam) {
        updateData.spam = { ...updateData.spam, ...body.spam };
      }
      if (body.email_config) {
        updateData.email_config = { ...updateData.email_config, ...body.email_config };
      }
      if (body.telegram_config) {
        updateData.telegram_config = { ...updateData.telegram_config, ...body.telegram_config };
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

