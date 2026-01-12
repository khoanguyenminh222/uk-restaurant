/**
 * ContactConfig Model
 * Schema cho cấu hình trang Contact
 * Singleton pattern - chỉ có 1 document duy nhất trong collection contactConfig
 */

/**
 * Default values cho ContactConfig
 */
export const defaultContactConfig = {
  config_type: 'contact',
  // Hero Section
  hero: {
    badge: '📞 Liên Hệ Với Chúng Tôi',
    title: 'Chúng Tôi Luôn Sẵn Sàng Phục Vụ Bạn',
    description: 'Hãy liên hệ với chúng tôi để được tư vấn, đặt bàn hoặc giải đáp mọi thắc mắc. Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.',
    image: '', // URL ảnh background hoặc side image
    cta_primary: { text: 'Gọi Ngay', link: 'tel:+84969606095' },
    cta_secondary: { text: 'Xem Thực Đơn', link: '/menu' },
  },

  // Info Section (Cards)
  info: {
    phone: '(+84) 096 960 6095',
    phone_title: 'Điện thoại',
    phone_description: 'Gọi ngay để đặt bàn hoặc đặt món',

    email: 'khoanguyenminh222@gmail.com',
    email_title: 'Email',
    email_description: 'Gửi email cho chúng tôi bất cứ lúc nào',

    address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
    address_title: 'Địa chỉ',
    address_description: 'Đến thăm chúng tôi tại cửa hàng',

    working_hours: 'Thứ 2 - Chủ Nhật: 8:00 - 22:00',
    working_hours_title: 'Giờ mở cửa',
    working_hours_description: 'Chúng tôi phục vụ bạn mỗi ngày',
  },

  // Map Section
  section_map: {
    badge: 'Vị Trí',
    title: 'Đến Thăm Chúng Tôi',
    embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1234567890!2d106.6297!3d10.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ5JzIzLjIiTiAxMDbCsDM3JzQ2LjkiRQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s',
    empty_text: 'Chưa có bản đồ',
  },

  // Social Section Titles
  social_section: {
    badge: 'Kết Nối',
    title: 'Theo Dõi Chúng Tôi',
    description: 'Kết nối với chúng tôi trên các mạng xã hội để cập nhật những món ăn mới và ưu đãi đặc biệt',
  },

  // Social Media Links
  social_media: [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/ukrestaurant',
      icon: 'FacebookIcon',
      description: 'Theo dõi chúng tôi trên Facebook',
      color: 'text-blue-400',
      order: 1,
    },
    {
      name: 'Zalo',
      url: 'https://zalo.me/0969606095',
      icon: 'MessageCircle',
      description: 'Chat với chúng tôi trên Zalo',
      color: 'text-blue-400',
      order: 2,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/ukrestaurant',
      icon: 'InstagramIcon',
      description: 'Xem hình ảnh món ăn trên Instagram',
      color: 'text-pink-400',
      order: 3,
    },
  ],

  // Contact Form Section
  contact_form: {
    badge: 'Gửi Tin Nhắn',
    title: 'Gửi Tin Nhắn Cho Chúng Tôi',
    description: 'Điền form bên dưới và chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất',
    success_message: 'Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất có thể.',
    fields: {
      name_label: 'Họ và tên',
      email_label: 'Email',
      phone_label: 'Số điện thoại',
      subject_label: 'Chủ đề',
      message_label: 'Tin nhắn',
      submit_text: 'Gửi tin nhắn',
      submit_icon: 'Send',
    },
  },

  // Trust Stats Section
  trustStats: {
    show: true,
    badge: 'Uy Tín',
    title: 'Khách Hàng Tin Tưởng',
    description: 'Những con số nói lên chất lượng dịch vụ của chúng tôi',
    averageRating: 4.9,
    averageRating_label: 'Đánh giá trung bình',
    totalReviews: 1247,
    totalReviews_label: 'Tổng đánh giá',
    verifiedCustomers: 98,
    verifiedCustomers_label: 'Khách hàng đã xác minh',
  },

  // CTA Section
  cta: {
    title: 'Sẵn Sàng Đặt Món Ngay?',
    description: 'Gọi điện hoặc đến thăm chúng tôi để trải nghiệm hương vị tuyệt vời',
    image: '', // URL hình nền cho section CTA
    button_primary: { text: 'Gọi Đặt Bàn', link: 'tel:+84969606095' },
    button_secondary: { text: 'Xem Thực Đơn', link: '/menu' },
  },

  testimonials: [], // Not used in contact page explicitly but part of data model

  seo: {
    meta_title: 'Liên Hệ - Nhà Hàng UK Restaurant',
    meta_description: 'Liên hệ với chúng tôi để đặt bàn và thưởng thức những món ăn ngon miệng.',
    meta_keywords: 'liên hệ, đặt bàn, nhà hàng, uk restaurant',
    og_title: 'Liên Hệ - Nhà Hàng UK Restaurant',
    og_description: 'Liên hệ với chúng tôi để đặt bàn và thưởng thức những món ăn ngon miệng.',
    og_image: '/og-image.jpg',
    og_type: 'website',
    og_locale: 'vi_VN',
    twitter_card: 'summary_large_image',
    twitter_title: 'Liên Hệ - Nhà Hàng UK Restaurant',
    twitter_description: 'Liên hệ với chúng tôi để đặt bàn và thưởng thức những món ăn ngon miệng.',
    twitter_image: '/og-image.jpg',
    robots_index: true,
    robots_follow: true,
    icon_favicon: '/favicon.ico',
    icon_apple: '/apple-icon.png',
  },
};

/**
 * Validate contact config data
 */
export function validateContactConfig(data) {
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

  if (data.info) {
    if (!data.info.phone || typeof data.info.phone !== 'string' || data.info.phone.trim().length === 0) {
      errors.push('Phone là bắt buộc');
    } else if (data.info.phone.length > 20) {
      errors.push('Phone không được vượt quá 20 ký tự');
    }

    if (!data.info.email || typeof data.info.email !== 'string' || data.info.email.trim().length === 0) {
      errors.push('Email là bắt buộc');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.info.email)) {
        errors.push('Email không hợp lệ');
      } else if (data.info.email.length > 100) {
        errors.push('Email không được vượt quá 100 ký tự');
      }
    }

    if (!data.info.address || typeof data.info.address !== 'string' || data.info.address.trim().length === 0) {
      errors.push('Address là bắt buộc');
    } else if (data.info.address.length > 200) {
      errors.push('Address không được vượt quá 200 ký tự');
    }
  }

  if (data.map_embed_url && !data.map_embed_url.startsWith('https://www.google.com/maps/embed')) {
    errors.push('Map embed URL phải bắt đầu với https://www.google.com/maps/embed');
  }

  // Validate social media
  if (data.social_media) {
    if (!Array.isArray(data.social_media)) {
      errors.push('Social media phải là một array');
    } else {
      data.social_media.forEach((social, index) => {
        if (!social.name || typeof social.name !== 'string' || social.name.trim().length === 0) {
          errors.push(`Social media ${index + 1}: Name là bắt buộc`);
        } else if (social.name.length > 50) {
          errors.push(`Social media ${index + 1}: Name không được vượt quá 50 ký tự`);
        }

        if (!social.url || typeof social.url !== 'string' || social.url.trim().length === 0) {
          errors.push(`Social media ${index + 1}: URL là bắt buộc`);
        } else if (!social.url.startsWith('http://') && !social.url.startsWith('https://')) {
          errors.push(`Social media ${index + 1}: URL phải bắt đầu với http:// hoặc https://`);
        }

        if (social.description && social.description.length > 200) {
          errors.push(`Social media ${index + 1}: Description không được vượt quá 200 ký tự`);
        }
      });
    }
  }

  // Validate trustStats
  if (data.trustStats) {
    if (data.trustStats.averageRating !== undefined) {
      const rating = parseFloat(data.trustStats.averageRating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        errors.push('TrustStats: Average rating phải là số từ 0 đến 5');
      }
    }

    if (data.trustStats.totalReviews !== undefined) {
      const reviews = parseInt(data.trustStats.totalReviews);
      if (isNaN(reviews) || reviews < 0) {
        errors.push('TrustStats: Total reviews phải là số nguyên dương');
      }
    }

    if (data.trustStats.verifiedCustomers !== undefined) {
      const verified = parseInt(data.trustStats.verifiedCustomers);
      if (isNaN(verified) || verified < 0 || verified > 100) {
        errors.push('TrustStats: Verified customers phải là số từ 0 đến 100');
      }
    }
  }

  // Validate testimonials
  if (data.testimonials) {
    if (!Array.isArray(data.testimonials)) {
      errors.push('Testimonials phải là một array');
    } else {
      if (data.testimonials.length > 20) {
        errors.push('Không được có quá 20 testimonials');
      }

      data.testimonials.forEach((testimonial, index) => {
        if (!testimonial.name || typeof testimonial.name !== 'string' || testimonial.name.trim().length === 0) {
          errors.push(`Testimonial ${index + 1}: Name là bắt buộc`);
        } else if (testimonial.name.length > 100) {
          errors.push(`Testimonial ${index + 1}: Name không được vượt quá 100 ký tự`);
        }

        if (testimonial.role && testimonial.role.length > 100) {
          errors.push(`Testimonial ${index + 1}: Role không được vượt quá 100 ký tự`);
        }

        if (testimonial.rating !== undefined) {
          const rating = parseInt(testimonial.rating);
          if (isNaN(rating) || rating < 1 || rating > 5) {
            errors.push(`Testimonial ${index + 1}: Rating phải là số từ 1 đến 5`);
          }
        }

        if (!testimonial.comment || typeof testimonial.comment !== 'string' || testimonial.comment.trim().length === 0) {
          errors.push(`Testimonial ${index + 1}: Comment là bắt buộc`);
        } else if (testimonial.comment.length > 500) {
          errors.push(`Testimonial ${index + 1}: Comment không được vượt quá 500 ký tự`);
        }

        if (testimonial.avatar && testimonial.avatar.length > 10) {
          errors.push(`Testimonial ${index + 1}: Avatar không được vượt quá 10 ký tự`);
        }

        if (testimonial.color && testimonial.color.length > 100) {
          errors.push(`Testimonial ${index + 1}: Color không được vượt quá 100 ký tự`);
        }

        if (testimonial.borderColor && testimonial.borderColor.length > 100) {
          errors.push(`Testimonial ${index + 1}: BorderColor không được vượt quá 100 ký tự`);
        }

        if (testimonial.date && testimonial.date.length > 50) {
          errors.push(`Testimonial ${index + 1}: Date không được vượt quá 50 ký tự`);
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
  const merged = JSON.parse(JSON.stringify(defaultContactConfig));

  if (config.hero) {
    merged.hero = { ...merged.hero, ...config.hero };
  }

  // Expanded Info merge
  if (config.info) {
    merged.info = { ...merged.info, ...config.info };
  }

  // Map section (replacing map_embed_url)
  if (config.section_map) {
    merged.section_map = { ...merged.section_map, ...config.section_map };
  } else if (config.map_embed_url) {
    // Legacy support
    merged.section_map.embed_url = config.map_embed_url;
  }

  // Social Section Titles
  if (config.social_section) {
    merged.social_section = { ...merged.social_section, ...config.social_section };
  }

  if (config.social_media) {
    merged.social_media = config.social_media;
  }

  if (config.trustStats) {
    merged.trustStats = { ...merged.trustStats, ...config.trustStats };
  }

  if (config.contact_form) {
    merged.contact_form = { ...merged.contact_form, ...config.contact_form };
    if (config.contact_form.fields) {
      merged.contact_form.fields = { ...merged.contact_form.fields, ...config.contact_form.fields };
    }
  }

  if (config.cta) {
    merged.cta = { ...merged.cta, ...config.cta };
  }

  // Note: testimonials not strictly used in Contact page default render but part of model

  if (config.seo) {
    merged.seo = { ...merged.seo, ...config.seo };
  }

  return merged;
}

