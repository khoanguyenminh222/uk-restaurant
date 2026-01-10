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
    cta_primary: { text: 'Gọi Ngay', link: 'tel:+84969606095' },
    cta_secondary: { text: 'Xem Thực Đơn', link: '/menu' },
  },
  section_title: 'Liên hệ',
  section_description: 'Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn',
  info: {
    phone: '(+84) 096 960 6095',
    email: 'khoanguyenminh222@gmail.com',
    address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
    working_hours: 'Thứ 2 - Chủ Nhật: 8:00 - 22:00',
  },
  map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1234567890!2d106.6297!3d10.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ5JzIzLjIiTiAxMDbCsDM3JzQ2LjkiRQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s',
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
    title: 'Gửi Tin Nhắn Cho Chúng Tôi',
    description: 'Điền form bên dưới và chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất',
    fields: {
      name_label: 'Họ và tên',
      email_label: 'Email',
      phone_label: 'Số điện thoại',
      subject_label: 'Chủ đề',
      message_label: 'Tin nhắn',
      submit_text: 'Gửi tin nhắn',
    },
  },
  // Trust Stats Section
  trustStats: {
    show: true,
    title: 'Khách Hàng Tin Tưởng',
    description: 'Những con số nói lên chất lượng dịch vụ của chúng tôi',
    averageRating: 4.9,
    totalReviews: 1247,
    verifiedCustomers: 98,
  },
  // CTA Section
  cta: {
    title: 'Sẵn Sàng Đặt Món Ngay?',
    description: 'Gọi điện hoặc đến thăm chúng tôi để trải nghiệm hương vị tuyệt vời',
    button_primary: { text: 'Gọi Đặt Bàn', link: 'tel:+84969606095' },
    button_secondary: { text: 'Xem Thực Đơn', link: '/menu' },
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
  seo: {
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '/og-image.jpg',
    og_type: 'website',
    og_locale: 'vi_VN',
    twitter_card: 'summary_large_image',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    robots_index: true,
    robots_follow: true,
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

  if (config.section_title !== undefined) {
    merged.section_title = config.section_title;
  }

  if (config.hero) {
    merged.hero = { ...merged.hero, ...config.hero };
  }

  if (config.section_description !== undefined) {
    merged.section_description = config.section_description;
  }

  if (config.contact_form) {
    merged.contact_form = { ...merged.contact_form, ...config.contact_form };
    if (config.contact_form.fields) {
      merged.contact_form.fields = { ...merged.contact_form.fields, ...config.contact_form.fields };
    }
  }

  if (config.info) {
    merged.info = { ...merged.info, ...config.info };
  }

  if (config.map_embed_url !== undefined) {
    merged.map_embed_url = config.map_embed_url;
  }

  if (config.social_media) {
    merged.social_media = config.social_media;
  }

  if (config.trustStats) {
    merged.trustStats = { ...merged.trustStats, ...config.trustStats };
  }

  if (config.cta) {
    merged.cta = { ...merged.cta, ...config.cta };
  }

  if (config.testimonials) {
    merged.testimonials = config.testimonials;
  }

  if (config.seo) {
    merged.seo = { ...merged.seo, ...config.seo };
  }

  return merged;
}

