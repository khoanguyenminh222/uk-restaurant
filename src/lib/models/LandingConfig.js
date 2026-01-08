/**
 * LandingConfig Model
 * Schema cho cấu hình nội dung động của landing page
 * Singleton pattern - chỉ có 1 document duy nhất trong collection landingConfig
 */

/**
 * Default values cho LandingConfig
 */
export const defaultLandingConfig = {
  config_type: 'landing',
  restaurant_name: 'UK Restaurant', // Tên cửa hàng chính (dùng cho email, metadata, admin panel)
  slogan: 'Ăn no khỏi "bàn"', // Slogan/tagline của cửa hàng (dùng cho email, metadata)
  header: {
    restaurant_name: 'UK Restaurant',
    menu_items: [
      { id: 'home', label: 'Trang chủ', icon: 'Home', order: 1 },
      { id: 'menu', label: 'Thực đơn', icon: 'Utensils', order: 2 },
      { id: 'why-choose-us', label: 'Tại sao chọn chúng tôi', icon: 'Star', order: 3 },
      { id: 'testimonials', label: 'Đánh giá', icon: 'MessageSquare', order: 4 },
      { id: 'about', label: 'Giới thiệu', icon: 'BookOpen', order: 5 },
      { id: 'contact', label: 'Liên hệ', icon: 'Phone', order: 6 },
    ],
  },
  hero: {
    title: 'UK Restaurant',
    subtitle: 'Ăn no khỏi "bàn"',
    description: 'Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm',
    cta_button_text: 'Xem thực đơn',
  },
  menu: {
    section_title: 'Thực đơn',
    section_description: 'Khám phá những món ăn được yêu thích nhất',
    popular_title: 'Món nổi bật',
    popular_icon: '🔥',
    // Tên icon lucide cho phần Món nổi bật (dùng trong component Menu)
    // Ví dụ: 'TrendingUp', 'Star', 'Flame'
    popular_lucide_icon: 'TrendingUp',
  },
  whyChooseUs: {
    section_title: 'Tại sao chọn chúng tôi',
    section_description: 'Khám phá những lý do khiến chúng tôi trở thành lựa chọn hàng đầu của hàng nghìn khách hàng',
    features: [
      {
        icon: 'Leaf',
        title: 'Nguyên liệu tươi ngon',
        description: 'Chúng tôi chỉ sử dụng nguyên liệu tươi sống, được nhập mỗi ngày từ các nhà cung cấp uy tín. Mỗi món ăn đều được chế biến với tình yêu và sự cẩn thận.',
        color: 'from-green-500/20 to-emerald-600/10',
        borderColor: 'border-green-500/30',
        order: 1,
      },
      {
        icon: 'ChefHat',
        title: 'Đầu bếp chuyên nghiệp',
        description: 'Đội ngũ đầu bếp giàu kinh nghiệm, được đào tạo bài bản. Mỗi món ăn là một tác phẩm nghệ thuật được tạo ra từ đôi bàn tay tài hoa.',
        color: 'from-orange-500/20 to-amber-600/10',
        borderColor: 'border-orange-500/30',
        order: 2,
      },
      {
        icon: 'Zap',
        title: 'Giao hàng siêu tốc',
        description: 'Cam kết giao hàng trong vòng 30 phút. Hệ thống logistics hiện đại đảm bảo món ăn luôn nóng hổi, tươi ngon khi đến tay khách hàng.',
        color: 'from-blue-500/20 to-cyan-600/10',
        borderColor: 'border-blue-500/30',
        order: 3,
      },
      {
        icon: 'Shield',
        title: 'An toàn vệ sinh',
        description: 'Tuân thủ nghiêm ngặt các tiêu chuẩn vệ sinh an toàn thực phẩm. Nhà bếp được kiểm tra định kỳ, đảm bảo môi trường sạch sẽ, an toàn.',
        color: 'from-purple-500/20 to-violet-600/10',
        borderColor: 'border-purple-500/30',
        order: 4,
      },
      {
        icon: 'Heart',
        title: 'Dịch vụ tận tâm',
        description: 'Đội ngũ nhân viên nhiệt tình, chuyên nghiệp. Luôn lắng nghe và đáp ứng mọi nhu cầu của khách hàng với thái độ phục vụ chu đáo nhất.',
        color: 'from-pink-500/20 to-rose-600/10',
        borderColor: 'border-pink-500/30',
        order: 5,
      },
      {
        icon: 'Star',
        title: 'Giá cả hợp lý',
        description: 'Chất lượng cao nhưng giá cả phải chăng. Chúng tôi cam kết mang đến giá trị tốt nhất cho từng đồng bạn bỏ ra.',
        color: 'from-yellow-500/20 to-amber-600/10',
        borderColor: 'border-yellow-500/30',
        order: 6,
      },
    ],
    stats: [
      {
        icon: 'Users',
        value: '10,000+',
        label: 'Khách hàng tin tưởng',
        color: 'from-blue-500/20 to-blue-600/10',
      },
      {
        icon: 'Star',
        value: '4.9/5',
        label: 'Đánh giá trung bình',
        color: 'from-yellow-500/20 to-yellow-600/10',
      },
      {
        icon: 'Clock',
        value: "30'",
        label: 'Giao hàng nhanh',
        color: 'from-green-500/20 to-green-600/10',
      },
      {
        icon: 'Award',
        value: '15+',
        label: 'Năm kinh nghiệm',
        color: 'from-primary/20 to-primary-light/10',
      },
    ],
  },
  testimonials: {
    section_title: 'Đánh giá từ khách hàng',
    section_description: 'Những phản hồi chân thật từ khách hàng đã sử dụng dịch vụ của chúng tôi',
    trustStats: {
      averageRating: 4.9,
      totalReviews: 1247,
      verifiedCustomers: 98,
    },
    testimonials: [
      {
        name: 'Nguyễn Văn A',
        role: 'Khách hàng thân thiết',
        rating: 5,
        comment: 'Món ăn rất ngon, giao hàng nhanh chóng. Nhà hàng luôn đảm bảo chất lượng và dịch vụ tận tâm. Tôi sẽ quay lại đặt món nhiều lần nữa!',
        avatar: '👨‍💼',
        color: 'from-blue-500/20 to-blue-600/10',
        borderColor: 'border-blue-500/30',
        verified: true,
        date: '2 tuần trước',
        order: 1,
      },
      {
        name: 'Trần Thị B',
        role: 'Khách hàng mới',
        rating: 5,
        comment: 'Lần đầu tiên đặt món và tôi rất hài lòng. Thực đơn đa dạng, giá cả hợp lý. Đặc biệt là món phở bò rất ngon và đậm đà!',
        avatar: '👩‍💼',
        color: 'from-pink-500/20 to-pink-600/10',
        borderColor: 'border-pink-500/30',
        verified: true,
        date: '1 tuần trước',
        order: 2,
      },
      {
        name: 'Lê Văn C',
        role: 'Food Blogger',
        rating: 5,
        comment: 'Chất lượng món ăn vượt ngoài mong đợi. Nguyên liệu tươi ngon, cách chế biến cẩn thận. Đây là một trong những nhà hàng tốt nhất mà tôi từng thử!',
        avatar: '👨‍🍳',
        color: 'from-primary/20 to-primary-light/10',
        borderColor: 'border-primary/30',
        verified: true,
        date: '3 ngày trước',
        order: 3,
      },
    ],
  },
  email_config: {
    // Email gửi đi từ hệ thống (dùng cho xác thực, đặt hàng, etc)
    sender_email: process.env.EMAIL_USER || 'no-reply@restaurant.com',
    sender_password: process.env.EMAIL_PASSWORD || '',
    // Cấu hình gửi email thông báo trạng thái đơn hàng
    // Mặc định chỉ gửi cho các status quan trọng để tránh spam
    email_notifications: {
      confirmed: true,      // Đơn hàng đã được xác nhận
      preparing: false,     // Đơn hàng đang được chuẩn bị
      ready: false,        // Đơn hàng đã sẵn sàng
      delivered: true,     // Đơn hàng đã được giao
      completed: false,    // Đơn hàng đã hoàn thành
      cancelled: true,     // Đơn hàng bị hủy
    },
  },
  telegram_config: {
    // Telegram Bot configuration
    enabled: process.env.TELEGRAM_ENABLED !== 'false', // Default: true
    bot_token: process.env.TELEGRAM_BOT_TOKEN || '',
    chat_id: process.env.TELEGRAM_CHAT_ID || '',
  },
  footer: {
    restaurant_name: 'UK Restaurant',
    slogan: 'Ăn no khỏi "bàn"',
    description: 'Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm.',
    copyright_text: 'Tất cả quyền được bảo lưu.',
    links: [
      {
        text: 'Chính sách bảo mật',
        url: '#',
        order: 1,
      },
      {
        text: 'Điều khoản sử dụng',
        url: '#',
        order: 2,
      },
    ],
  },
  seo: {
    meta_title: '', // Nếu để trống sẽ dùng: {restaurant_name} - {slogan}
    meta_description: '', // Nếu để trống sẽ dùng description mặc định
    meta_keywords: '', // Keywords cho SEO
    og_title: '', // Open Graph title (nếu để trống dùng meta_title)
    og_description: '', // Open Graph description (nếu để trống dùng meta_description)
    og_image: '/og-image.jpg', // Open Graph image URL
    og_type: 'website',
    og_locale: 'vi_VN',
    twitter_card: 'summary_large_image', // summary, summary_large_image
    twitter_title: '', // Twitter title (nếu để trống dùng og_title)
    twitter_description: '', // Twitter description (nếu để trống dùng og_description)
    twitter_image: '', // Twitter image (nếu để trống dùng og_image)
    robots_index: true, // Cho phép search engine index
    robots_follow: true, // Cho phép search engine follow links
    icon_favicon: '/favicon.ico', // Favicon URL (hiển thị trên tab browser)
    icon_apple: '/apple-icon.png', // Apple touch icon (hiển thị khi thêm vào home screen trên iOS)
  },
  spam: {
    // Giới hạn đặt hàng
    max_orders: 5, // Số đơn hàng tối đa mà 1 email có thể đặt trong khoảng thời gian
    order_rate_limit_ttl: 1800, // Thời gian giới hạn đặt hàng (giây) - 30 phút
    order_rate_limit_blacklist_hours: 24, // Thời gian blacklist khi vượt quá giới hạn (giờ)
    
    // Xác thực email
    verification_code_ttl: 600, // Thời gian mã xác thực có hiệu lực (giây) - 10 phút
    verified_session_ttl: 1800, // Thời gian session sau khi verify (giây) - 30 phút
    max_verify_attempts: 5, // Số lần thử nhập mã xác thực sai tối đa
    
    // Giới hạn gửi mã
    max_send_code: 5, // Số lần gửi mã xác thực tối đa trong khoảng thời gian
    send_code_rate_limit_ttl: 3600, // Thời gian giới hạn gửi mã (giây) - 1 giờ
  },
};

/**
 * Validate landing config data
 */
export function validateLandingConfig(data) {
  const errors = [];

  // Validate restaurant_name (root level)
  if (data.restaurant_name !== undefined) {
    if (!data.restaurant_name || typeof data.restaurant_name !== 'string' || data.restaurant_name.trim().length === 0) {
      errors.push('Restaurant name là bắt buộc');
    } else if (data.restaurant_name.length > 50) {
      errors.push('Restaurant name không được vượt quá 50 ký tự');
    }
  }

  // Validate slogan (root level)
  if (data.slogan !== undefined) {
    if (!data.slogan || typeof data.slogan !== 'string' || data.slogan.trim().length === 0) {
      errors.push('Slogan là bắt buộc');
    } else if (data.slogan.length > 100) {
      errors.push('Slogan không được vượt quá 100 ký tự');
    }
  }

  // Validate header
  if (data.header) {
    if (!data.header.restaurant_name || typeof data.header.restaurant_name !== 'string' || data.header.restaurant_name.trim().length === 0) {
      errors.push('Header: Restaurant name là bắt buộc');
    } else if (data.header.restaurant_name.length > 50) {
      errors.push('Header: Restaurant name không được vượt quá 50 ký tự');
    }

    // Validate menu_items
    if (data.header.menu_items) {
      if (!Array.isArray(data.header.menu_items)) {
        errors.push('Header: Menu items phải là một array');
      } else {
        if (data.header.menu_items.length < 1) {
          errors.push('Header: Phải có ít nhất 1 menu item');
        } else if (data.header.menu_items.length > 10) {
          errors.push('Header: Không được có quá 10 menu items');
        }

        data.header.menu_items.forEach((item, index) => {
          if (!item.id || typeof item.id !== 'string' || item.id.trim().length === 0) {
            errors.push(`Header: Menu item ${index + 1}: ID là bắt buộc`);
          } else if (item.id.length > 50) {
            errors.push(`Header: Menu item ${index + 1}: ID không được vượt quá 50 ký tự`);
          }

          if (!item.label || typeof item.label !== 'string' || item.label.trim().length === 0) {
            errors.push(`Header: Menu item ${index + 1}: Label là bắt buộc`);
          } else if (item.label.length > 50) {
            errors.push(`Header: Menu item ${index + 1}: Label không được vượt quá 50 ký tự`);
          }

          if (item.icon && typeof item.icon !== 'string') {
            errors.push(`Header: Menu item ${index + 1}: Icon phải là string`);
          }

          if (item.order !== undefined) {
            const order = parseInt(item.order);
            if (isNaN(order) || order < 1) {
              errors.push(`Header: Menu item ${index + 1}: Order phải là số >= 1`);
            }
          }
        });
      }
    }
  }

  // Validate hero
  if (data.hero) {
    if (!data.hero.title || typeof data.hero.title !== 'string' || data.hero.title.trim().length === 0) {
      errors.push('Hero: Title là bắt buộc');
    } else if (data.hero.title.length > 100) {
      errors.push('Hero: Title không được vượt quá 100 ký tự');
    }

    if (!data.hero.subtitle || typeof data.hero.subtitle !== 'string' || data.hero.subtitle.trim().length === 0) {
      errors.push('Hero: Subtitle là bắt buộc');
    } else if (data.hero.subtitle.length > 200) {
      errors.push('Hero: Subtitle không được vượt quá 200 ký tự');
    }

    if (!data.hero.description || typeof data.hero.description !== 'string' || data.hero.description.trim().length === 0) {
      errors.push('Hero: Description là bắt buộc');
    } else if (data.hero.description.length > 500) {
      errors.push('Hero: Description không được vượt quá 500 ký tự');
    }

    if (data.hero.cta_button_text && data.hero.cta_button_text.length > 50) {
      errors.push('Hero: CTA button text không được vượt quá 50 ký tự');
    }
  }

  // Validate menu
  if (data.menu) {
    if (!data.menu.section_title || typeof data.menu.section_title !== 'string' || data.menu.section_title.trim().length === 0) {
      errors.push('Menu: Section title là bắt buộc');
    } else if (data.menu.section_title.length > 100) {
      errors.push('Menu: Section title không được vượt quá 100 ký tự');
    }

    if (!data.menu.section_description || typeof data.menu.section_description !== 'string' || data.menu.section_description.trim().length === 0) {
      errors.push('Menu: Section description là bắt buộc');
    } else if (data.menu.section_description.length > 300) {
      errors.push('Menu: Section description không được vượt quá 300 ký tự');
    }
  }

  // Validate whyChooseUs
  if (data.whyChooseUs) {
    if (!data.whyChooseUs.section_title || typeof data.whyChooseUs.section_title !== 'string' || data.whyChooseUs.section_title.trim().length === 0) {
      errors.push('WhyChooseUs: Section title là bắt buộc');
    } else if (data.whyChooseUs.section_title.length > 100) {
      errors.push('WhyChooseUs: Section title không được vượt quá 100 ký tự');
    }

    if (!data.whyChooseUs.section_description || typeof data.whyChooseUs.section_description !== 'string' || data.whyChooseUs.section_description.trim().length === 0) {
      errors.push('WhyChooseUs: Section description là bắt buộc');
    } else if (data.whyChooseUs.section_description.length > 300) {
      errors.push('WhyChooseUs: Section description không được vượt quá 300 ký tự');
    }

    // Validate features
    if (data.whyChooseUs.features) {
      if (!Array.isArray(data.whyChooseUs.features)) {
        errors.push('WhyChooseUs: Features phải là một array');
      } else {
        if (data.whyChooseUs.features.length < 1) {
          errors.push('WhyChooseUs: Phải có ít nhất 1 feature');
        } else if (data.whyChooseUs.features.length > 6) {
          errors.push('WhyChooseUs: Không được có quá 6 features');
        }

        data.whyChooseUs.features.forEach((feature, index) => {
          if (!feature.icon || typeof feature.icon !== 'string' || feature.icon.trim().length === 0) {
            errors.push(`WhyChooseUs: Feature ${index + 1}: Icon là bắt buộc`);
          }

          if (!feature.title || typeof feature.title !== 'string' || feature.title.trim().length === 0) {
            errors.push(`WhyChooseUs: Feature ${index + 1}: Title là bắt buộc`);
          } else if (feature.title.length > 100) {
            errors.push(`WhyChooseUs: Feature ${index + 1}: Title không được vượt quá 100 ký tự`);
          }

          if (!feature.description || typeof feature.description !== 'string' || feature.description.trim().length === 0) {
            errors.push(`WhyChooseUs: Feature ${index + 1}: Description là bắt buộc`);
          } else if (feature.description.length > 500) {
            errors.push(`WhyChooseUs: Feature ${index + 1}: Description không được vượt quá 500 ký tự`);
          }

          if (feature.color && feature.color.length > 100) {
            errors.push(`WhyChooseUs: Feature ${index + 1}: Color không được vượt quá 100 ký tự`);
          }

          if (feature.borderColor && feature.borderColor.length > 100) {
            errors.push(`WhyChooseUs: Feature ${index + 1}: BorderColor không được vượt quá 100 ký tự`);
          }
        });
      }
    }

    // Validate stats
    if (data.whyChooseUs.stats) {
      if (!Array.isArray(data.whyChooseUs.stats)) {
        errors.push('WhyChooseUs: Stats phải là một array');
      } else {
        if (data.whyChooseUs.stats.length > 10) {
          errors.push('WhyChooseUs: Không được có quá 10 stats');
        }

        data.whyChooseUs.stats.forEach((stat, index) => {
          if (!stat.icon || typeof stat.icon !== 'string' || stat.icon.trim().length === 0) {
            errors.push(`WhyChooseUs: Stat ${index + 1}: Icon là bắt buộc`);
          }

          if (!stat.value || typeof stat.value !== 'string' || stat.value.trim().length === 0) {
            errors.push(`WhyChooseUs: Stat ${index + 1}: Value là bắt buộc`);
          } else if (stat.value.length > 50) {
            errors.push(`WhyChooseUs: Stat ${index + 1}: Value không được vượt quá 50 ký tự`);
          }

          if (!stat.label || typeof stat.label !== 'string' || stat.label.trim().length === 0) {
            errors.push(`WhyChooseUs: Stat ${index + 1}: Label là bắt buộc`);
          } else if (stat.label.length > 100) {
            errors.push(`WhyChooseUs: Stat ${index + 1}: Label không được vượt quá 100 ký tự`);
          }

          if (stat.color && stat.color.length > 100) {
            errors.push(`WhyChooseUs: Stat ${index + 1}: Color không được vượt quá 100 ký tự`);
          }
        });
      }
    }
  }

  // Validate testimonials
  if (data.testimonials) {
    if (!data.testimonials.section_title || typeof data.testimonials.section_title !== 'string' || data.testimonials.section_title.trim().length === 0) {
      errors.push('Testimonials: Section title là bắt buộc');
    } else if (data.testimonials.section_title.length > 100) {
      errors.push('Testimonials: Section title không được vượt quá 100 ký tự');
    }

    // Validate trustStats
    if (data.testimonials.trustStats) {
      if (data.testimonials.trustStats.averageRating !== undefined) {
        const rating = parseFloat(data.testimonials.trustStats.averageRating);
        if (isNaN(rating) || rating < 0 || rating > 5) {
          errors.push('Testimonials: TrustStats averageRating phải là số từ 0 đến 5');
        }
      }

      if (data.testimonials.trustStats.totalReviews !== undefined) {
        const reviews = parseInt(data.testimonials.trustStats.totalReviews);
        if (isNaN(reviews) || reviews < 0) {
          errors.push('Testimonials: TrustStats totalReviews phải là số nguyên dương');
        }
      }

      if (data.testimonials.trustStats.verifiedCustomers !== undefined) {
        const verified = parseInt(data.testimonials.trustStats.verifiedCustomers);
        if (isNaN(verified) || verified < 0 || verified > 100) {
          errors.push('Testimonials: TrustStats verifiedCustomers phải là số từ 0 đến 100');
        }
      }
    }

    // Validate testimonials array
    if (data.testimonials.testimonials) {
      if (!Array.isArray(data.testimonials.testimonials)) {
        errors.push('Testimonials: Testimonials phải là một array');
      } else {
        if (data.testimonials.testimonials.length > 20) {
          errors.push('Testimonials: Không được có quá 20 testimonials');
        }

        data.testimonials.testimonials.forEach((testimonial, index) => {
          if (!testimonial.name || typeof testimonial.name !== 'string' || testimonial.name.trim().length === 0) {
            errors.push(`Testimonials: Testimonial ${index + 1}: Name là bắt buộc`);
          } else if (testimonial.name.length > 100) {
            errors.push(`Testimonials: Testimonial ${index + 1}: Name không được vượt quá 100 ký tự`);
          }

          if (testimonial.role && testimonial.role.length > 100) {
            errors.push(`Testimonials: Testimonial ${index + 1}: Role không được vượt quá 100 ký tự`);
          }

          if (testimonial.rating !== undefined) {
            const rating = parseInt(testimonial.rating);
            if (isNaN(rating) || rating < 1 || rating > 5) {
              errors.push(`Testimonials: Testimonial ${index + 1}: Rating phải là số từ 1 đến 5`);
            }
          }

          if (!testimonial.comment || typeof testimonial.comment !== 'string' || testimonial.comment.trim().length === 0) {
            errors.push(`Testimonials: Testimonial ${index + 1}: Comment là bắt buộc`);
          } else if (testimonial.comment.length > 500) {
            errors.push(`Testimonials: Testimonial ${index + 1}: Comment không được vượt quá 500 ký tự`);
          }

          if (testimonial.avatar && testimonial.avatar.length > 10) {
            errors.push(`Testimonials: Testimonial ${index + 1}: Avatar không được vượt quá 10 ký tự`);
          }

          if (testimonial.color && testimonial.color.length > 100) {
            errors.push(`Testimonials: Testimonial ${index + 1}: Color không được vượt quá 100 ký tự`);
          }

          if (testimonial.borderColor && testimonial.borderColor.length > 100) {
            errors.push(`Testimonials: Testimonial ${index + 1}: BorderColor không được vượt quá 100 ký tự`);
          }

          if (testimonial.date && testimonial.date.length > 50) {
            errors.push(`Testimonials: Testimonial ${index + 1}: Date không được vượt quá 50 ký tự`);
          }
        });
      }
    }
  }

  // Validate email config
  if (data.email_config) {
    if (data.email_config.sender_email && typeof data.email_config.sender_email === 'string') {
      if (data.email_config.sender_email.length > 100) {
        errors.push('Email Config: Sender email không được vượt quá 100 ký tự');
      } else if (!data.email_config.sender_email.includes('@')) {
        errors.push('Email Config: Sender email không hợp lệ');
      }
    }

    if (data.email_config.sender_password && typeof data.email_config.sender_password === 'string') {
      if (data.email_config.sender_password.length > 200) {
        errors.push('Email Config: Sender password không được vượt quá 200 ký tự');
      }
    }

    // Validate email_notifications
    if (data.email_config.email_notifications) {
      const validStatuses = ['confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'];
      const notifications = data.email_config.email_notifications;
      
      if (typeof notifications !== 'object') {
        errors.push('Email Config: email_notifications phải là object');
      } else {
        Object.keys(notifications).forEach(status => {
          if (!validStatuses.includes(status)) {
            errors.push(`Email Config: email_notifications.${status} không phải là status hợp lệ`);
          } else if (typeof notifications[status] !== 'boolean') {
            errors.push(`Email Config: email_notifications.${status} phải là boolean`);
          }
        });
      }
    }
  }

  // Validate telegram config
  if (data.telegram_config) {
    if (data.telegram_config.bot_token && typeof data.telegram_config.bot_token === 'string') {
      if (data.telegram_config.bot_token.length > 200) {
        errors.push('Telegram Config: Bot token không được vượt quá 200 ký tự');
      }
    }

    if (data.telegram_config.chat_id && typeof data.telegram_config.chat_id === 'string') {
      if (data.telegram_config.chat_id.length > 50) {
        errors.push('Telegram Config: Chat ID không được vượt quá 50 ký tự');
      }
    }

    if (data.telegram_config.enabled !== undefined && typeof data.telegram_config.enabled !== 'boolean') {
      errors.push('Telegram Config: Enabled phải là boolean');
    }
  }

  // Validate footer
  if (data.footer) {
    if (!data.footer.restaurant_name || typeof data.footer.restaurant_name !== 'string' || data.footer.restaurant_name.trim().length === 0) {
      errors.push('Footer: Restaurant name là bắt buộc');
    } else if (data.footer.restaurant_name.length > 50) {
      errors.push('Footer: Restaurant name không được vượt quá 50 ký tự');
    }

    if (!data.footer.slogan || typeof data.footer.slogan !== 'string' || data.footer.slogan.trim().length === 0) {
      errors.push('Footer: Slogan là bắt buộc');
    } else if (data.footer.slogan.length > 200) {
      errors.push('Footer: Slogan không được vượt quá 200 ký tự');
    }

    if (!data.footer.description || typeof data.footer.description !== 'string' || data.footer.description.trim().length === 0) {
      errors.push('Footer: Description là bắt buộc');
    } else if (data.footer.description.length > 500) {
      errors.push('Footer: Description không được vượt quá 500 ký tự');
    }

    if (data.footer.copyright_text && data.footer.copyright_text.length > 200) {
      errors.push('Footer: Copyright text không được vượt quá 200 ký tự');
    }

    // Validate footer links
    if (data.footer.links) {
      if (!Array.isArray(data.footer.links)) {
        errors.push('Footer: Links phải là một array');
      } else {
        data.footer.links.forEach((link, index) => {
          if (!link.text || typeof link.text !== 'string' || link.text.trim().length === 0) {
            errors.push(`Footer: Link ${index + 1}: Text là bắt buộc`);
          } else if (link.text.length > 100) {
            errors.push(`Footer: Link ${index + 1}: Text không được vượt quá 100 ký tự`);
          }

          if (!link.url || typeof link.url !== 'string' || link.url.trim().length === 0) {
            errors.push(`Footer: Link ${index + 1}: URL là bắt buộc`);
          } else if (link.url !== '#' && !link.url.startsWith('http://') && !link.url.startsWith('https://')) {
            errors.push(`Footer: Link ${index + 1}: URL phải là "#" hoặc bắt đầu với http:// hoặc https://`);
          }
        });
      }
    }
  }

  // Validate SEO
  if (data.seo) {
    if (data.seo.meta_title && data.seo.meta_title.length > 100) {
      errors.push('SEO: Meta title không được vượt quá 100 ký tự');
    }

    if (data.seo.meta_description && data.seo.meta_description.length > 200) {
      errors.push('SEO: Meta description không được vượt quá 200 ký tự');
    }

    if (data.seo.meta_keywords && data.seo.meta_keywords.length > 500) {
      errors.push('SEO: Meta keywords không được vượt quá 500 ký tự');
    }

    if (data.seo.og_title && data.seo.og_title.length > 100) {
      errors.push('SEO: OG title không được vượt quá 100 ký tự');
    }

    if (data.seo.og_description && data.seo.og_description.length > 200) {
      errors.push('SEO: OG description không được vượt quá 200 ký tự');
    }

    if (data.seo.og_image && !data.seo.og_image.startsWith('/') && !data.seo.og_image.startsWith('http://') && !data.seo.og_image.startsWith('https://')) {
      errors.push('SEO: OG image phải là đường dẫn tương đối (bắt đầu với /) hoặc URL đầy đủ');
    }

    if (data.seo.twitter_title && data.seo.twitter_title.length > 100) {
      errors.push('SEO: Twitter title không được vượt quá 100 ký tự');
    }

    if (data.seo.twitter_description && data.seo.twitter_description.length > 200) {
      errors.push('SEO: Twitter description không được vượt quá 200 ký tự');
    }

    if (data.seo.twitter_image && !data.seo.twitter_image.startsWith('/') && !data.seo.twitter_image.startsWith('http://') && !data.seo.twitter_image.startsWith('https://')) {
      errors.push('SEO: Twitter image phải là đường dẫn tương đối (bắt đầu với /) hoặc URL đầy đủ');
    }

    if (data.seo.twitter_card && !['summary', 'summary_large_image'].includes(data.seo.twitter_card)) {
      errors.push('SEO: Twitter card phải là "summary" hoặc "summary_large_image"');
    }

    if (data.seo.icon_favicon && !data.seo.icon_favicon.startsWith('/') && !data.seo.icon_favicon.startsWith('http://') && !data.seo.icon_favicon.startsWith('https://')) {
      errors.push('SEO: Icon favicon phải là đường dẫn tương đối (bắt đầu với /) hoặc URL đầy đủ');
    }

    if (data.seo.icon_apple && !data.seo.icon_apple.startsWith('/') && !data.seo.icon_apple.startsWith('http://') && !data.seo.icon_apple.startsWith('https://')) {
      errors.push('SEO: Icon apple phải là đường dẫn tương đối (bắt đầu với /) hoặc URL đầy đủ');
    }
  }

  // Validate spam config
  if (data.spam) {
    if (data.spam.max_orders !== undefined) {
      const maxOrders = parseInt(data.spam.max_orders);
      if (isNaN(maxOrders) || maxOrders < 1 || maxOrders > 100) {
        errors.push('Spam: Số đơn hàng tối đa phải là số từ 1 đến 100');
      }
    }

    if (data.spam.order_rate_limit_ttl !== undefined) {
      const ttl = parseInt(data.spam.order_rate_limit_ttl);
      if (isNaN(ttl) || ttl < 60 || ttl > 86400) {
        errors.push('Spam: Thời gian giới hạn đặt hàng phải là số từ 60 đến 86400 giây (1 phút đến 24 giờ)');
      }
    }

    if (data.spam.order_rate_limit_blacklist_hours !== undefined) {
      const hours = parseInt(data.spam.order_rate_limit_blacklist_hours);
      if (isNaN(hours) || hours < 1 || hours > 720) {
        errors.push('Spam: Thời gian blacklist phải là số từ 1 đến 720 giờ (1 giờ đến 30 ngày)');
      }
    }

    if (data.spam.verification_code_ttl !== undefined) {
      const ttl = parseInt(data.spam.verification_code_ttl);
      if (isNaN(ttl) || ttl < 60 || ttl > 3600) {
        errors.push('Spam: Thời gian mã xác thực phải là số từ 60 đến 3600 giây (1 phút đến 1 giờ)');
      }
    }

    if (data.spam.verified_session_ttl !== undefined) {
      const ttl = parseInt(data.spam.verified_session_ttl);
      if (isNaN(ttl) || ttl < 60 || ttl > 86400) {
        errors.push('Spam: Thời gian session sau khi verify phải là số từ 60 đến 86400 giây (1 phút đến 24 giờ)');
      }
    }

    if (data.spam.max_verify_attempts !== undefined) {
      const attempts = parseInt(data.spam.max_verify_attempts);
      if (isNaN(attempts) || attempts < 1 || attempts > 20) {
        errors.push('Spam: Số lần thử nhập mã sai tối đa phải là số từ 1 đến 20');
      }
    }

    if (data.spam.max_send_code !== undefined) {
      const maxSend = parseInt(data.spam.max_send_code);
      if (isNaN(maxSend) || maxSend < 1 || maxSend > 50) {
        errors.push('Spam: Số lần gửi mã tối đa phải là số từ 1 đến 50');
      }
    }

    if (data.spam.send_code_rate_limit_ttl !== undefined) {
      const ttl = parseInt(data.spam.send_code_rate_limit_ttl);
      if (isNaN(ttl) || ttl < 60 || ttl > 86400) {
        errors.push('Spam: Thời gian giới hạn gửi mã phải là số từ 60 đến 86400 giây (1 phút đến 24 giờ)');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Merge config với default values (deep merge)
 */
export function mergeWithDefaults(config) {
  const merged = JSON.parse(JSON.stringify(defaultLandingConfig));

  if (config.restaurant_name !== undefined) {
    merged.restaurant_name = config.restaurant_name;
  }

  if (config.slogan !== undefined) {
    merged.slogan = config.slogan;
  }

  if (config.header) {
    merged.header = { ...merged.header, ...config.header };
    if (config.header.menu_items) {
      merged.header.menu_items = config.header.menu_items;
    }
  }

  if (config.hero) {
    merged.hero = { ...merged.hero, ...config.hero };
  }

  if (config.menu) {
    merged.menu = { ...merged.menu, ...config.menu };
  }

  if (config.whyChooseUs) {
    merged.whyChooseUs = { ...merged.whyChooseUs, ...config.whyChooseUs };
    if (config.whyChooseUs.features) {
      merged.whyChooseUs.features = config.whyChooseUs.features;
    }
    if (config.whyChooseUs.stats) {
      merged.whyChooseUs.stats = config.whyChooseUs.stats;
    }
  }

  if (config.testimonials) {
    merged.testimonials = { ...merged.testimonials, ...config.testimonials };
    if (config.testimonials.trustStats) {
      merged.testimonials.trustStats = { ...merged.testimonials.trustStats, ...config.testimonials.trustStats };
    }
    if (config.testimonials.testimonials) {
      merged.testimonials.testimonials = config.testimonials.testimonials;
    }
  }

  if (config.footer) {
    merged.footer = { ...merged.footer, ...config.footer };
    if (config.footer.links) {
      merged.footer.links = config.footer.links;
    }
  }

  if (config.seo) {
    merged.seo = { ...merged.seo, ...config.seo };
  }

  if (config.spam) {
    merged.spam = { ...merged.spam, ...config.spam };
  }

  if (config.email_config) {
    merged.email_config = { ...merged.email_config, ...config.email_config };
  }

  if (config.telegram_config) {
    merged.telegram_config = { ...merged.telegram_config, ...config.telegram_config };
  }

  return merged;
}

