/**
 * AboutConfig Model
 * Schema cho cấu hình trang About
 * Singleton pattern - chỉ có 1 document duy nhất trong collection aboutConfig
 */

/**
 * Default values cho AboutConfig
 */
export const defaultAboutConfig = {
  config_type: 'about',
  // Hero Section
  hero: {
    badge: '🍽️ Khám Phá Câu Chuyện Của Chúng Tôi',
    title: 'Ẩm Thực Không Chỉ Là Thức Ăn',
    description: 'Đó là một hành trình tình yêu, sáng tạo và đam mê. Chúng tôi tự hào mang đến những trải nghiệm ẩm thực tuyệt vời cho mỗi khách hàng.',
    image: '',
    cta_primary: { text: 'Khám Phá Thực Đơn', link: '/menu' },
    cta_secondary: { text: 'Liên Hệ Chúng Tôi', link: '#contact' },
  },
  // Mission Section
  mission: {
    badge: '✨ Sứ Mệnh Của Chúng Tôi',
    title: 'Nấu Ăn Với Tâm Và Tay',
    description: 'Tại nhà hàng chúng tôi, mỗi món ăn là một tác phẩm nghệ thuật được tạo ra từ những nguyên liệu tươi sống nhất. Chúng tôi tin rằng ẩm thực là ngôn ngữ quốc tế của tình yêu.',
    image: '',
    items: [
      { icon: 'Award', title: 'Chất Lượng Đảm Bảo', description: 'Kiểm tra chất lượng nghiêm ngặt cho mỗi thành phần trước khi vào bếp.' },
      { icon: 'Globe', title: 'Hương Vị Đa Sắc', description: 'Kết hợp các nền ẩm thực khác nhau để tạo ra những trải nghiệm độc đáo.' },
      { icon: 'Clock', title: 'Phục Vụ Nhanh Chóng', description: 'Từ đơn hàng đến bàn của bạn, tất cả đều được làm với tốc độ và chuyên môn.' },
    ],
  },
  // Values Section
  values: {
    title: 'Những Giá Trị Cốt Lõi',
    description: 'Những nguyên tắc này hướng dẫn mọi quyết định của chúng tôi, từ chọn nguyên liệu đến phục vụ khách hàng.',
  },
  section_title: 'Giới thiệu',
  section_description: 'Cam kết mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời nhất',
  content: 'Nội dung trang giới thiệu...',
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
  // Team Section
  team: {
    title: 'Đội Ngũ Tài Năng',
    description: 'Những người tài năng, đam mê và tận tâm làm nên sự khác biệt.',
    members: [
      { name: 'Nguyễn Văn A', role: 'Đầu Bếp Chính', specialty: 'Chuyên môn: Ẩm Thực Châu Á', icon: 'ChefHat' },
      { name: 'Trần Thị B', role: 'Quản Lý Nhà Hàng', specialty: 'Chuyên môn: Dịch Vụ Khách Hàng', icon: 'Users' },
      { name: 'Lê Văn C', role: 'Đầu Bếp Phụ', specialty: 'Chuyên môn: Nấu Ăn Hiện Đại', icon: 'Utensils' },
    ],
  },
  // CTA Section
  cta: {
    title: 'Sẵn Sàng Trải Nghiệm Điều Kỳ Diệu?',
    description: 'Hãy đến thăm chúng tôi ngay hôm nay. Chúng tôi đang mong chờ sự có mặt của bạn.',
    button_primary: { text: 'Xem Thực Đơn', link: '/menu' },
    button_secondary: { text: 'Gọi Đặt Bàn', link: 'tel:+84123456789' },
  },
  seo: {
    meta_title: 'Về Chúng Tôi - Nhà Hàng UK Restaurant',
    meta_description: 'Khám phá câu chuyện, sứ mệnh và đội ngũ đằng sau UK Restaurant. Chúng tôi cam kết mang đến trải nghiệm ẩm thực tuyệt vời nhất.',
    meta_keywords: 'về chúng tôi, giới thiệu, nhà hàng uk, đội ngũ, sứ mệnh, giá trị cốt lõi',
    og_title: 'Về Chúng Tôi - Nhà Hàng UK Restaurant',
    og_description: 'Khám phá câu chuyện, sứ mệnh và đội ngũ đằng sau UK Restaurant. Chúng tôi cam kết mang đến trải nghiệm ẩm thực tuyệt vời nhất.',
    og_image: '/og-image.jpg',
    og_type: 'website',
    og_locale: 'vi_VN',
    twitter_card: 'summary_large_image',
    twitter_title: 'Về Chúng Tôi - Nhà Hàng UK Restaurant',
    twitter_description: 'Khám phá câu chuyện, sứ mệnh và đội ngũ đằng sau UK Restaurant. Chúng tôi cam kết mang đến trải nghiệm ẩm thực tuyệt vời nhất.',
    twitter_image: '/og-image.jpg',
    robots_index: true,
    robots_follow: true,
    icon_favicon: '/favicon.ico',
    icon_apple: '/apple-icon.png',
  },
};

/**
 * Validate about config data
 */
export function validateAboutConfig(data) {
  const errors = [];

  if (data.section_title !== undefined) {
    if (!data.section_title || typeof data.section_title !== 'string' || data.section_title.trim().length === 0) {
      errors.push('Section title là bắt buộc');
    } else if (data.section_title.length > 100) {
      errors.push('Section title không được vượt quá 100 ký tự');
    }
  }

  if (data.section_description !== undefined) {
    if (!data.section_description || typeof data.section_description !== 'string' || data.section_description.trim().length === 0) {
      errors.push('Section description là bắt buộc');
    } else if (data.section_description.length > 300) {
      errors.push('Section description không được vượt quá 300 ký tự');
    }
  }

  if (data.content && data.content.length > 10000) {
    errors.push('Content không được vượt quá 10000 ký tự');
  }

  // Validate features
  if (data.features) {
    if (!Array.isArray(data.features)) {
      errors.push('Features phải là một array');
    } else {
      if (data.features.length > 10) {
        errors.push('Không được có quá 10 features');
      }

      data.features.forEach((feature, index) => {
        if (!feature.icon || typeof feature.icon !== 'string' || feature.icon.trim().length === 0) {
          errors.push(`Feature ${index + 1}: Icon là bắt buộc`);
        }

        if (!feature.title || typeof feature.title !== 'string' || feature.title.trim().length === 0) {
          errors.push(`Feature ${index + 1}: Title là bắt buộc`);
        } else if (feature.title.length > 100) {
          errors.push(`Feature ${index + 1}: Title không được vượt quá 100 ký tự`);
        }

        if (!feature.description || typeof feature.description !== 'string' || feature.description.trim().length === 0) {
          errors.push(`Feature ${index + 1}: Description là bắt buộc`);
        } else if (feature.description.length > 500) {
          errors.push(`Feature ${index + 1}: Description không được vượt quá 500 ký tự`);
        }

        if (feature.color && feature.color.length > 100) {
          errors.push(`Feature ${index + 1}: Color không được vượt quá 100 ký tự`);
        }

        if (feature.borderColor && feature.borderColor.length > 100) {
          errors.push(`Feature ${index + 1}: BorderColor không được vượt quá 100 ký tự`);
        }
      });
    }
  }

  // Validate stats
  if (data.stats) {
    if (!Array.isArray(data.stats)) {
      errors.push('Stats phải là một array');
    } else {
      if (data.stats.length > 10) {
        errors.push('Không được có quá 10 stats');
      }

      data.stats.forEach((stat, index) => {
        if (!stat.icon || typeof stat.icon !== 'string' || stat.icon.trim().length === 0) {
          errors.push(`Stat ${index + 1}: Icon là bắt buộc`);
        }

        if (!stat.value || typeof stat.value !== 'string' || stat.value.trim().length === 0) {
          errors.push(`Stat ${index + 1}: Value là bắt buộc`);
        } else if (stat.value.length > 50) {
          errors.push(`Stat ${index + 1}: Value không được vượt quá 50 ký tự`);
        }

        if (!stat.label || typeof stat.label !== 'string' || stat.label.trim().length === 0) {
          errors.push(`Stat ${index + 1}: Label là bắt buộc`);
        } else if (stat.label.length > 100) {
          errors.push(`Stat ${index + 1}: Label không được vượt quá 100 ký tự`);
        }

        if (stat.color && stat.color.length > 100) {
          errors.push(`Stat ${index + 1}: Color không được vượt quá 100 ký tự`);
        }
      });
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
  const merged = JSON.parse(JSON.stringify(defaultAboutConfig));

  if (config.hero) {
    merged.hero = { ...merged.hero, ...config.hero };
  }

  if (config.mission) {
    merged.mission = { ...merged.mission, ...config.mission };
    if (config.mission.items) {
      merged.mission.items = config.mission.items;
    }
  }

  if (config.values) {
    merged.values = { ...merged.values, ...config.values };
  }

  if (config.team) {
    merged.team = { ...merged.team, ...config.team };
    if (config.team.members) {
      merged.team.members = config.team.members;
    }
  }

  if (config.cta) {
    merged.cta = { ...merged.cta, ...config.cta };
  }

  if (config.section_title !== undefined) {
    merged.section_title = config.section_title;
  }

  if (config.section_description !== undefined) {
    merged.section_description = config.section_description;
  }

  if (config.content !== undefined) {
    merged.content = config.content;
  }

  if (config.features) {
    merged.features = config.features;
  }

  if (config.stats) {
    merged.stats = config.stats;
  }

  if (config.seo) {
    merged.seo = { ...merged.seo, ...config.seo };
  }

  return merged;
}

