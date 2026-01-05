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
  },
  about: {
    section_title: 'Giới thiệu',
    section_description: 'Cam kết mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời nhất',
    features: [
      {
        title: 'Chất lượng',
        description: 'Nguyên liệu tươi ngon, được chọn lọc kỹ càng từ những nhà cung cấp uy tín',
        icon: 'CheckCircle2',
        order: 1,
      },
      {
        title: 'Nhanh chóng',
        description: 'Giao hàng nhanh chóng, đúng giờ như đã hứa với dịch vụ chuyên nghiệp',
        icon: 'Zap',
        order: 2,
      },
      {
        title: 'Tận tâm',
        description: 'Phục vụ với sự nhiệt tình và chuyên nghiệp, luôn đặt khách hàng lên hàng đầu',
        icon: 'Heart',
        order: 3,
      },
    ],
  },
  contact: {
    section_title: 'Liên hệ',
    info: {
      phone: '(+84) 096 960 6095',
      email: 'khoanguyenminh222@gmail.com',
      address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
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

  // Validate about
  if (data.about) {
    if (!data.about.section_title || typeof data.about.section_title !== 'string' || data.about.section_title.trim().length === 0) {
      errors.push('About: Section title là bắt buộc');
    } else if (data.about.section_title.length > 100) {
      errors.push('About: Section title không được vượt quá 100 ký tự');
    }

    if (!data.about.section_description || typeof data.about.section_description !== 'string' || data.about.section_description.trim().length === 0) {
      errors.push('About: Section description là bắt buộc');
    } else if (data.about.section_description.length > 300) {
      errors.push('About: Section description không được vượt quá 300 ký tự');
    }

    // Validate features
    if (data.about.features) {
      if (!Array.isArray(data.about.features)) {
        errors.push('About: Features phải là một array');
      } else {
        if (data.about.features.length < 1) {
          errors.push('About: Phải có ít nhất 1 feature');
        } else if (data.about.features.length > 6) {
          errors.push('About: Không được có quá 6 features');
        }

        data.about.features.forEach((feature, index) => {
          if (!feature.title || typeof feature.title !== 'string' || feature.title.trim().length === 0) {
            errors.push(`About: Feature ${index + 1}: Title là bắt buộc`);
          } else if (feature.title.length > 100) {
            errors.push(`About: Feature ${index + 1}: Title không được vượt quá 100 ký tự`);
          }

          if (!feature.description || typeof feature.description !== 'string' || feature.description.trim().length === 0) {
            errors.push(`About: Feature ${index + 1}: Description là bắt buộc`);
          } else if (feature.description.length > 300) {
            errors.push(`About: Feature ${index + 1}: Description không được vượt quá 300 ký tự`);
          }
        });
      }
    }
  }

  // Validate contact
  if (data.contact) {
    if (!data.contact.section_title || typeof data.contact.section_title !== 'string' || data.contact.section_title.trim().length === 0) {
      errors.push('Contact: Section title là bắt buộc');
    } else if (data.contact.section_title.length > 100) {
      errors.push('Contact: Section title không được vượt quá 100 ký tự');
    }

    if (data.contact.info) {
      if (!data.contact.info.phone || typeof data.contact.info.phone !== 'string' || data.contact.info.phone.trim().length === 0) {
        errors.push('Contact: Phone là bắt buộc');
      } else if (data.contact.info.phone.length > 20) {
        errors.push('Contact: Phone không được vượt quá 20 ký tự');
      }

      if (!data.contact.info.email || typeof data.contact.info.email !== 'string' || data.contact.info.email.trim().length === 0) {
        errors.push('Contact: Email là bắt buộc');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.contact.info.email)) {
          errors.push('Contact: Email không hợp lệ');
        } else if (data.contact.info.email.length > 100) {
          errors.push('Contact: Email không được vượt quá 100 ký tự');
        }
      }

      if (!data.contact.info.address || typeof data.contact.info.address !== 'string' || data.contact.info.address.trim().length === 0) {
        errors.push('Contact: Address là bắt buộc');
      } else if (data.contact.info.address.length > 200) {
        errors.push('Contact: Address không được vượt quá 200 ký tự');
      }
    }

    if (!data.contact.map_embed_url || typeof data.contact.map_embed_url !== 'string' || data.contact.map_embed_url.trim().length === 0) {
      errors.push('Contact: Map embed URL là bắt buộc');
    } else if (!data.contact.map_embed_url.startsWith('https://www.google.com/maps/embed')) {
      errors.push('Contact: Map embed URL phải bắt đầu với https://www.google.com/maps/embed');
    }

    // Validate social media
    if (data.contact.social_media) {
      if (!Array.isArray(data.contact.social_media)) {
        errors.push('Contact: Social media phải là một array');
      } else {
        data.contact.social_media.forEach((social, index) => {
          if (!social.name || typeof social.name !== 'string' || social.name.trim().length === 0) {
            errors.push(`Contact: Social media ${index + 1}: Name là bắt buộc`);
          } else if (social.name.length > 50) {
            errors.push(`Contact: Social media ${index + 1}: Name không được vượt quá 50 ký tự`);
          }

          if (!social.url || typeof social.url !== 'string' || social.url.trim().length === 0) {
            errors.push(`Contact: Social media ${index + 1}: URL là bắt buộc`);
          } else if (!social.url.startsWith('http://') && !social.url.startsWith('https://')) {
            errors.push(`Contact: Social media ${index + 1}: URL phải bắt đầu với http:// hoặc https://`);
          }

          if (social.description && social.description.length > 200) {
            errors.push(`Contact: Social media ${index + 1}: Description không được vượt quá 200 ký tự`);
          }
        });
      }
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
  }

  if (config.hero) {
    merged.hero = { ...merged.hero, ...config.hero };
  }

  if (config.menu) {
    merged.menu = { ...merged.menu, ...config.menu };
  }

  if (config.about) {
    merged.about = { ...merged.about, ...config.about };
    if (config.about.features) {
      merged.about.features = config.about.features;
    }
  }

  if (config.contact) {
    merged.contact = { ...merged.contact, ...config.contact };
    if (config.contact.info) {
      merged.contact.info = { ...merged.contact.info, ...config.contact.info };
    }
    if (config.contact.social_media) {
      merged.contact.social_media = config.contact.social_media;
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

  return merged;
}

