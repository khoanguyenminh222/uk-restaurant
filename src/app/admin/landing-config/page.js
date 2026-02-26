'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import Toast from '@/components/Toast/Toast';
import { defaultLandingConfig } from '@/lib/models/LandingConfig';
import {
  Settings, Save, RotateCcw, Loader2, X, Plus, Edit2, Trash2,
  ArrowUp, ArrowDown, Home, Sparkles, BookOpen, Info, Phone,
  Mail, MapPin, Share2, Link as LinkIcon, CheckCircle2, Zap, Heart, MessageCircle, Shield, Star, MessageSquare, Users, TrendingUp, Gavel
} from 'lucide-react';
import { adminFetch } from '@/lib/adminAuth';
import * as lucideIcons from 'lucide-react';
import RichTextEditor from '@/components/Admin/RichTextEditor';

// Helper function để chuyển đổi kebab-case sang PascalCase
// Ví dụ: "circle-user" -> "CircleUser", "check-circle-2" -> "CheckCircle2"
const toPascalCase = (str) => {
  if (!str) return str;
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Helper function để kiểm tra icon có tồn tại trong lucide-react không
const isValidLucideIcon = (iconName) => {
  if (!iconName || typeof iconName !== 'string') {
    //console.log('[isValidLucideIcon] Invalid iconName:', iconName);
    return false;
  }
  try {
    // Thử các format khác nhau:
    // 1. Tên gốc (có thể là PascalCase hoặc kebab-case)
    // 2. PascalCase (nếu input là kebab-case)
    // 3. Với suffix 'Icon'
    const variants = [
      iconName, // Tên gốc
      toPascalCase(iconName), // Chuyển kebab-case sang PascalCase
      iconName + 'Icon', // Với suffix Icon
      toPascalCase(iconName) + 'Icon', // PascalCase + Icon
    ];

    // Loại bỏ duplicates
    const uniqueVariants = [...new Set(variants)];

    let icon = null;
    let foundVariant = null;

    for (const variant of uniqueVariants) {
      icon = lucideIcons[variant];
      if (icon) {
        foundVariant = variant;
        break;
      }
    }

    if (!icon) {
      // console.log(`[isValidLucideIcon] Icon "${iconName}" not found. Tried variants:`, uniqueVariants);
      // console.log(`[isValidLucideIcon] Sample available keys:`, Object.keys(lucideIcons).filter(k => {
      //   const lowerK = k.toLowerCase();
      //   const lowerName = iconName.toLowerCase();
      //   return lowerK.includes(lowerName) || lowerName.split('-').some(part => lowerK.includes(part));
      // }).slice(0, 10));
      return false;
    }

    // Icon có thể là function (React component) hoặc object (React component được wrap)
    // Kiểm tra xem có phải là React component không
    const isValid = icon && (
      typeof icon === 'function' ||
      (typeof icon === 'object' && icon.$$typeof) || // React element type
      (typeof icon === 'object' && icon.default) // Default export
    );

    // console.log(`[isValidLucideIcon] Result for "${iconName}":`, isValid, {
    //   foundVariant,
    //   type: typeof icon,
    //   isFunction: typeof icon === 'function',
    //   hasTypeof: icon?.$$typeof,
    //   hasDefault: icon?.default ? true : false,
    // });

    return !!isValid;
  } catch (error) {
    console.error('[isValidLucideIcon] Error checking icon:', error);
    return false;
  }
};

// Helper function để lấy icon component
const getLucideIcon = (iconName) => {
  if (!iconName || typeof iconName !== 'string') {
    //console.log('[getLucideIcon] Invalid iconName:', iconName);
    return null;
  }
  try {
    // Thử các format khác nhau:
    // 1. Tên gốc (có thể là PascalCase hoặc kebab-case)
    // 2. PascalCase (nếu input là kebab-case)
    // 3. Với suffix 'Icon'
    const variants = [
      iconName, // Tên gốc
      toPascalCase(iconName), // Chuyển kebab-case sang PascalCase
      iconName + 'Icon', // Với suffix Icon
      toPascalCase(iconName) + 'Icon', // PascalCase + Icon
    ];

    // Loại bỏ duplicates
    const uniqueVariants = [...new Set(variants)];

    let icon = null;
    let foundVariant = null;

    for (const variant of uniqueVariants) {
      icon = lucideIcons[variant];
      if (icon) {
        foundVariant = variant;
        break;
      }
    }

    if (!icon) {
      // console.log(`[getLucideIcon] Icon "${iconName}" not found. Tried variants:`, uniqueVariants);
      // console.log(`[getLucideIcon] Sample available keys:`, Object.keys(lucideIcons).filter(k => {
      //   const lowerK = k.toLowerCase();
      //   const lowerName = iconName.toLowerCase();
      //   return lowerK.includes(lowerName) || lowerName.split('-').some(part => lowerK.includes(part));
      // }).slice(0, 10));
      return null;
    }

    // Nếu là object với default export, lấy default
    if (typeof icon === 'object' && icon.default) {
      //console.log(`[getLucideIcon] Using default export for "${iconName}" (variant: ${foundVariant})`);
      return icon.default;
    }
    // Nếu là function hoặc React component, trả về trực tiếp
    if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) {
      //console.log(`[getLucideIcon] Using direct export for "${iconName}" (variant: ${foundVariant})`);
      return icon;
    }

    //console.log(`[getLucideIcon] Icon "${iconName}" found but not usable. Type:`, typeof icon, 'Keys:', Object.keys(icon || {}).slice(0, 10));
    return null;
  } catch (error) {
    //console.error('[getLucideIcon] Error getting icon:', error);
    return null;
  }
};

const TABS = [
  { id: 'general', label: 'Cấu hình chung', icon: Settings },
  { id: 'seo', label: 'Cấu hình SEO', icon: Settings },
  { id: 'spam', label: 'Ngăn chặn Spam', icon: Shield },
  { id: 'header', label: 'Header', icon: Home },
  { id: 'hero', label: 'Hero', icon: Sparkles },
  { id: 'menu', label: 'Menu', icon: BookOpen },
  { id: 'whyChooseUs', label: 'Why Choose Us', icon: Star },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'footer', label: 'Footer', icon: LinkIcon },
  { id: 'legal', label: 'Pháp lý', icon: Gavel },
];

// Default icons cho features (lucide-react)
const FEATURE_ICONS = [
  'CheckCircle2', 'Zap', 'Heart', 'Star', 'Award', 'Shield',
  'Clock', 'Truck', 'Users', 'ThumbsUp', 'Gift', 'TrendingUp',
  'Leaf', 'ChefHat', 'Sparkles'
];

// Default icons cho stats (lucide-react)
const STAT_ICONS = [
  'Users', 'Star', 'Clock', 'Award', 'TrendingUp', 'Heart',
  'Zap', 'Shield', 'CheckCircle2', 'Gift', 'Truck', 'ThumbsUp'
];

// Default colors cho features
const FEATURE_COLORS = [
  { color: 'from-green-500/20 to-emerald-600/10', borderColor: 'border-green-500/30' },
  { color: 'from-orange-500/20 to-amber-600/10', borderColor: 'border-orange-500/30' },
  { color: 'from-blue-500/20 to-cyan-600/10', borderColor: 'border-blue-500/30' },
  { color: 'from-purple-500/20 to-violet-600/10', borderColor: 'border-purple-500/30' },
  { color: 'from-pink-500/20 to-rose-600/10', borderColor: 'border-pink-500/30' },
  { color: 'from-yellow-500/20 to-amber-600/10', borderColor: 'border-yellow-500/30' },
];

// Default colors cho stats
const STAT_COLORS = [
  'from-blue-500/20 to-blue-600/10',
  'from-yellow-500/20 to-yellow-600/10',
  'from-green-500/20 to-green-600/10',
  'from-primary/20 to-primary-light/10',
  'from-purple-500/20 to-purple-600/10',
  'from-pink-500/20 to-pink-600/10',
];

export default function AdminLandingConfig() {
  // Check if user has permission (only admin and super_admin)
  const { isAuthorized, isChecking } = useRoleCheck(['admin', 'super_admin']);

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [legalData, setLegalData] = useState({
    privacy_policy: { title: '', content: '' },
    terms_of_service: { title: '', content: '' }
  });
  const [toast, setToast] = useState({ message: '', isVisible: false });

  // Form states cho từng section
  const [restaurantName, setRestaurantName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [headerData, setHeaderData] = useState({
    restaurant_name: '',
    menu_items: []
  });
  const [heroData, setHeroData] = useState({
    title: '', subtitle: '', description: '', cta_button_text: '', cta_secondary_button_text: '', cta_secondary_button_link: ''
  });
  const [menuData, setMenuData] = useState({
    section_title: '',
    section_description: '',
    popular_title: '',
    popular_icon: '',
    popular_lucide_icon: '',
  });
  const [whyChooseUsData, setWhyChooseUsData] = useState({
    section_title: '', section_description: '', features: [], stats: [], auto_calculate_stats: false
  });
  const [testimonialsData, setTestimonialsData] = useState({
    section_title: '',
    section_description: '',
    trustStats: { averageRating: 0, totalReviews: 0, verifiedCustomers: 0 },
    testimonials: [],
    auto_calculate_stats: false
  });
  const [reviewStats, setReviewStats] = useState(null); // Stats từ reviews API
  const [footerData, setFooterData] = useState({
    restaurant_name: '', slogan: '', description: '',
    copyright_text: '', links: []
  });
  const [seoData, setSeoData] = useState({
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
    icon_favicon: '/favicon.ico',
    icon_apple: '/apple-icon.png',
  });
  const [spamData, setSpamData] = useState({
    max_orders: 5,
    order_rate_limit_ttl: 1800,
    order_rate_limit_blacklist_hours: 24,
    verification_code_ttl: 600,
    verified_session_ttl: 1800,
    max_verify_attempts: 5,
    max_send_code: 5,
    send_code_rate_limit_ttl: 3600,
  });

  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [featureForm, setFeatureForm] = useState({
    title: '',
    description: '',
    icon: 'CheckCircle2',
    color: 'from-green-500/20 to-emerald-600/10',
    borderColor: 'border-green-500/30',
    order: 1
  });
  const [featureIconSuggestions, setFeatureIconSuggestions] = useState([]);
  const [showFeatureIconDropdown, setShowFeatureIconDropdown] = useState(false);

  const [showStatModal, setShowStatModal] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [statForm, setStatForm] = useState({
    icon: 'Users',
    value: '',
    label: '',
    color: 'from-blue-500/20 to-blue-600/10'
  });
  const [statIconSuggestions, setStatIconSuggestions] = useState([]);
  const [showStatIconDropdown, setShowStatIconDropdown] = useState(false);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkForm, setLinkForm] = useState({ text: '', url: '#', order: 1 });

  const [showDeleteFeatureModal, setShowDeleteFeatureModal] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState(null);

  const [showDeleteStatModal, setShowDeleteStatModal] = useState(false);
  const [statToDelete, setStatToDelete] = useState(null);

  const [showResetModal, setShowResetModal] = useState(false);

  // Modal refs
  const featureModalRef = useRef(null);
  const statModalRef = useRef(null);
  const linkModalRef = useRef(null);
  const deleteFeatureModalRef = useRef(null);
  const deleteStatModalRef = useRef(null);
  const resetModalRef = useRef(null);
  const [resetSections, setResetSections] = useState({
    general: false,
    header: false,
    hero: false,
    menu: false,
    whyChooseUs: false,
    testimonials: false,
    footer: false,
    seo: false,
    spam: false,
  });

  useEffect(() => {
    fetchConfig();
    fetchLegalConfig();
  }, []);

  const fetchLegalConfig = async () => {
    try {
      const res = await adminFetch('/api/config/legal');
      const data = await res.json();
      if (data.success && data.data) {
        setLegalData(data.data);
      }
    } catch (error) {
      console.error('Error fetching legal config:', error);
    }
  };

  // Handle click outside for all modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if saving
      if (saving) return;

      if (showFeatureModal && featureModalRef.current && !featureModalRef.current.contains(event.target)) {
        setShowFeatureModal(false);
        setEditingFeature(null);
      }
      if (showStatModal && statModalRef.current && !statModalRef.current.contains(event.target)) {
        setShowStatModal(false);
        setEditingStat(null);
      }
      if (showLinkModal && linkModalRef.current && !linkModalRef.current.contains(event.target)) {
        setShowLinkModal(false);
        setEditingLink(null);
      }
      if (showDeleteFeatureModal && deleteFeatureModalRef.current && !deleteFeatureModalRef.current.contains(event.target)) {
        setShowDeleteFeatureModal(false);
        setFeatureToDelete(null);
      }
      if (showDeleteStatModal && deleteStatModalRef.current && !deleteStatModalRef.current.contains(event.target)) {
        setShowDeleteStatModal(false);
        setStatToDelete(null);
      }
      if (showResetModal && resetModalRef.current && !resetModalRef.current.contains(event.target)) {
        setShowResetModal(false);
      }
    };

    const isAnyModalOpen = showFeatureModal || showStatModal || showLinkModal || showDeleteFeatureModal || showDeleteStatModal || showResetModal;

    if (isAnyModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFeatureModal, showStatModal, showLinkModal, showDeleteFeatureModal, showDeleteStatModal, showResetModal, saving]);

  // Handle scroll lock when any modal is open
  useEffect(() => {
    const isAnyModalOpen = showFeatureModal || showStatModal || showLinkModal || showDeleteFeatureModal || showDeleteStatModal || showResetModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFeatureModal, showStatModal, showLinkModal, showDeleteFeatureModal, showDeleteStatModal, showResetModal]);

  // Listen for toast events
  useEffect(() => {
    const handleShowToast = (event) => {
      setToast({
        message: event.detail.message,
        isVisible: true,
        type: event.detail.type || 'success',
      });
    };

    window.addEventListener('showToast', handleShowToast);
    return () => window.removeEventListener('showToast', handleShowToast);
  }, []);

  const fetchReviewStats = async () => {
    try {
      const res = await adminFetch('/api/reviews/stats');
      const data = await res.json();
      if (data.success) {
        setReviewStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await adminFetch('/api/config/landing');
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        // Populate form data
        if (data.data.restaurant_name) setRestaurantName(data.data.restaurant_name);
        if (data.data.slogan) setSlogan(data.data.slogan);
        if (data.data.header) {
          // Đảm bảo luôn có đủ 6 menu items mặc định
          const defaultMenuItems = [
            { id: 'home', label: 'Trang chủ', icon: 'Home', order: 1, is_visible: true },
            { id: 'menu', label: 'Thực đơn', icon: 'Utensils', order: 2, is_visible: true },
            { id: 'why-choose-us', label: 'Tại sao chọn chúng tôi', icon: 'Star', order: 3, is_visible: true },
            { id: 'testimonials', label: 'Đánh giá', icon: 'MessageSquare', order: 4, is_visible: true },
            { id: 'about', label: 'Giới thiệu', icon: 'BookOpen', order: 5, is_visible: true },
            { id: 'contact', label: 'Liên hệ', icon: 'Phone', order: 6, is_visible: true },
          ];

          const existingMenuItems = data.data.header.menu_items || [];
          const menuItems = defaultMenuItems.map(defaultItem => {
            const existing = existingMenuItems.find(item => item.id === defaultItem.id);
            return existing || defaultItem;
          });

          setHeaderData({
            ...data.data.header,
            menu_items: menuItems
          });
        }
        if (data.data.hero) {
          setHeroData({
            ...data.data.hero,
            cta_secondary_button_text: data.data.hero.cta_secondary_button_text || '',
            cta_secondary_button_link: data.data.hero.cta_secondary_button_link || '',
          });
        }
        if (data.data.menu) setMenuData(data.data.menu);
        if (data.data.whyChooseUs) {
          setWhyChooseUsData({
            section_title: data.data.whyChooseUs.section_title || '',
            section_description: data.data.whyChooseUs.section_description || '',
            features: data.data.whyChooseUs.features || [],
            stats: data.data.whyChooseUs.stats || [],
            auto_calculate_stats: data.data.whyChooseUs.auto_calculate_stats || false,
          });
        }
        if (data.data.testimonials) {
          setTestimonialsData({
            section_title: data.data.testimonials.section_title || '',
            section_description: data.data.testimonials.section_description || '',
            trustStats: data.data.testimonials.trustStats || { averageRating: 0, totalReviews: 0, verifiedCustomers: 0 },
            testimonials: data.data.testimonials.testimonials || [],
            auto_calculate_stats: data.data.testimonials.auto_calculate_stats || false,
          });
        }

        // Load review stats để hiển thị
        fetchReviewStats();
        if (data.data.footer) setFooterData(data.data.footer);
        if (data.data.seo) setSeoData(data.data.seo);
        if (data.data.spam) setSpamData(data.data.spam);
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Lỗi khi tải cấu hình', type: 'error' },
            })
          );
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi tải cấu hình', type: 'error' },
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Đảm bảo header có đủ 6 menu items
      const defaultMenuItems = [
        { id: 'home', label: 'Trang chủ', icon: 'Home', order: 1 },
        { id: 'menu', label: 'Thực đơn', icon: 'Utensils', order: 2 },
        { id: 'why-choose-us', label: 'Tại sao chọn chúng tôi', icon: 'Star', order: 3 },
        { id: 'testimonials', label: 'Đánh giá', icon: 'MessageSquare', order: 4 },
        { id: 'about', label: 'Giới thiệu', icon: 'BookOpen', order: 5 },
        { id: 'contact', label: 'Liên hệ', icon: 'Phone', order: 6 },
      ];

      const existingMenuItems = headerData.menu_items || [];
      const menuItems = defaultMenuItems.map(defaultItem => {
        const existing = existingMenuItems.find(item => item.id === defaultItem.id);
        return existing || defaultItem;
      });

      const updateData = {
        restaurant_name: restaurantName,
        slogan: slogan,
        header: {
          ...headerData,
          menu_items: menuItems
        },
        hero: heroData,
        menu: menuData,
        whyChooseUs: whyChooseUsData,
        testimonials: testimonialsData,
        footer: footerData,
        seo: seoData,
        spam: spamData,
      };

      const res = await adminFetch('/api/config/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (data.success) {
        // Also save legal config when saving landing config
        try {
          await adminFetch('/api/config/legal', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(legalData),
          });
        } catch (legalError) {
          console.error('Error saving legal config during global save:', legalError);
          // We don't necessarily want to fail the whole save if legal fails,
          // but we should at least log it. The main config saved successfully.
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Lưu thành công!', type: 'success' },
            })
          );
        }
        setConfig(data.data);
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.errors ? data.errors.join(', ') : (data.error || 'Lỗi khi lưu cấu hình'), type: 'error' },
            })
          );
        }
      }
    } catch (error) {
      console.error('Error saving config:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi lưu cấu hình', type: 'error' },
          })
        );
      }
    } finally {
      setSaving(false);
    }
  };


  const handleOpenResetModal = () => {
    setResetSections({
      general: false,
      header: false,
      hero: false,
      menu: false,
      whyChooseUs: false,
      testimonials: false,
      footer: false,
      seo: false,
      spam: false,
    });
    setShowResetModal(true);
  };

  const handleReset = async () => {
    // Kiểm tra xem có phần nào được chọn không
    const selectedSections = Object.entries(resetSections)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);

    if (selectedSections.length === 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Vui lòng chọn ít nhất một phần để reset', type: 'error' },
          })
        );
      }
      return;
    }

    try {
      setSaving(true);
      setShowResetModal(false);

      // Tạo object chứa các giá trị mặc định cho các phần được chọn
      const resetData = {};

      if (resetSections.general) {
        resetData.restaurant_name = defaultLandingConfig.restaurant_name;
        resetData.slogan = defaultLandingConfig.slogan;
      }
      if (resetSections.header) {
        resetData.header = defaultLandingConfig.header;
      }
      if (resetSections.hero) {
        resetData.hero = defaultLandingConfig.hero;
      }
      if (resetSections.menu) {
        resetData.menu = defaultLandingConfig.menu;
      }
      if (resetSections.whyChooseUs) {
        resetData.whyChooseUs = defaultLandingConfig.whyChooseUs;
      }
      if (resetSections.testimonials) {
        resetData.testimonials = defaultLandingConfig.testimonials;
      }
      if (resetSections.footer) {
        resetData.footer = defaultLandingConfig.footer;
      }
      if (resetSections.seo) {
        resetData.seo = defaultLandingConfig.seo;
      }
      if (resetSections.spam) {
        resetData.spam = defaultLandingConfig.spam;
      }

      // Gửi request reset
      const res = await adminFetch('/api/config/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      });

      const data = await res.json();
      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: `Đã reset ${selectedSections.length} phần về mặc định!`, type: 'success' },
            })
          );
        }
        fetchConfig();
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: data.error || 'Lỗi khi reset', type: 'error' },
            })
          );
        }
      }
    } catch (error) {
      console.error('Error resetting config:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Lỗi khi reset', type: 'error' },
          })
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // Feature management
  const handleOpenFeatureModal = (feature = null) => {
    if (feature) {
      setEditingFeature(feature);
      setFeatureForm({
        ...feature,
        color: feature.color || 'from-green-500/20 to-emerald-600/10',
        borderColor: feature.borderColor || 'border-green-500/30'
      });
    } else {
      setEditingFeature(null);
      const maxOrder = whyChooseUsData.features.length > 0
        ? Math.max(...whyChooseUsData.features.map(f => f.order || 0))
        : 0;
      const colorIndex = whyChooseUsData.features.length % FEATURE_COLORS.length;
      setFeatureForm({
        title: '',
        description: '',
        icon: 'CheckCircle2',
        color: FEATURE_COLORS[colorIndex].color,
        borderColor: FEATURE_COLORS[colorIndex].borderColor,
        order: maxOrder + 1
      });
    }
    setShowFeatureModal(true);
    setShowFeatureIconDropdown(false);
  };

  // Handle feature icon input change
  const handleFeatureIconChange = (value) => {
    setFeatureForm({ ...featureForm, icon: value });
    // Luôn cho phép nhập bất kỳ giá trị nào, suggestions chỉ là gợi ý
    if (value) {
      const filtered = FEATURE_ICONS.filter(icon =>
        icon.toLowerCase().includes(value.toLowerCase())
      );
      setFeatureIconSuggestions(filtered);
      // Hiển thị dropdown nếu có suggestions hoặc nếu đang focus
      setShowFeatureIconDropdown(filtered.length > 0);
    } else {
      setFeatureIconSuggestions(FEATURE_ICONS);
      setShowFeatureIconDropdown(false);
    }
  };

  const handleSaveFeature = () => {
    if (!featureForm.title || !featureForm.description) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Vui lòng điền đầy đủ thông tin', type: 'error' },
          })
        );
      }
      return;
    }

    const newFeatures = [...whyChooseUsData.features];
    if (editingFeature) {
      const index = newFeatures.findIndex(f => f === editingFeature);
      if (index !== -1) {
        newFeatures[index] = { ...featureForm };
      }
    } else {
      newFeatures.push({ ...featureForm });
    }

    setWhyChooseUsData({ ...whyChooseUsData, features: newFeatures });
    setShowFeatureModal(false);
    setEditingFeature(null);
    setFeatureForm({
      title: '',
      description: '',
      icon: 'CheckCircle2',
      color: 'from-green-500/20 to-emerald-600/10',
      borderColor: 'border-green-500/30',
      order: 1
    });
  };

  const handleDeleteFeature = (feature) => {
    setFeatureToDelete(feature);
    setShowDeleteFeatureModal(true);
  };

  const confirmDeleteFeature = () => {
    if (featureToDelete) {
      const newFeatures = whyChooseUsData.features.filter(f => f !== featureToDelete);
      setWhyChooseUsData({ ...whyChooseUsData, features: newFeatures });
    }
    setShowDeleteFeatureModal(false);
    setFeatureToDelete(null);
  };

  // Stat management
  const handleOpenStatModal = (stat = null) => {
    if (stat) {
      setEditingStat(stat);
      setStatForm({
        ...stat,
        color: stat.color || 'from-blue-500/20 to-blue-600/10'
      });
    } else {
      setEditingStat(null);
      setStatForm({
        icon: 'Users',
        value: '',
        label: '',
        color: 'from-blue-500/20 to-blue-600/10'
      });
    }
    setShowStatModal(true);
    setShowStatIconDropdown(false);
  };

  const handleStatIconChange = (value) => {
    setStatForm({ ...statForm, icon: value });
    if (value) {
      const filtered = STAT_ICONS.filter(icon =>
        icon.toLowerCase().includes(value.toLowerCase())
      );
      setStatIconSuggestions(filtered);
      setShowStatIconDropdown(filtered.length > 0);
    } else {
      setStatIconSuggestions(STAT_ICONS);
      setShowStatIconDropdown(false);
    }
  };

  const handleSaveStat = () => {
    if (!statForm.icon || !statForm.value || !statForm.label) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Vui lòng điền đầy đủ thông tin', type: 'error' },
          })
        );
      }
      return;
    }

    const newStats = [...(whyChooseUsData.stats || [])];
    if (editingStat) {
      const index = newStats.findIndex(s => s === editingStat);
      if (index !== -1) {
        newStats[index] = { ...statForm };
      }
    } else {
      newStats.push({ ...statForm });
    }

    setWhyChooseUsData({ ...whyChooseUsData, stats: newStats });
    setShowStatModal(false);
    setEditingStat(null);
    setStatForm({ icon: 'Users', value: '', label: '', color: 'from-blue-500/20 to-blue-600/10' });
  };

  const handleDeleteStat = (stat) => {
    setStatToDelete(stat);
    setShowDeleteStatModal(true);
  };

  const confirmDeleteStat = () => {
    if (statToDelete) {
      const newStats = (whyChooseUsData.stats || []).filter(s => s !== statToDelete);
      setWhyChooseUsData({ ...whyChooseUsData, stats: newStats });
    }
    setShowDeleteStatModal(false);
    setStatToDelete(null);
  };

  // Handler khi toggle auto_calculate_stats
  const handleToggleAutoCalculateStats = async (checked) => {
    let newStats = [...(whyChooseUsData.stats || [])];

    if (checked) {
      // Khi bật auto_calculate_stats, đảm bảo có 2 stats đầu tiên (Users và Star)
      const hasUsers = newStats.some(s => s.icon === 'Users');
      const hasStar = newStats.some(s => s.icon === 'Star');

      // Lấy giá trị từ reviewStats nếu có, nếu không thì fetch
      let usersValue = '0+';
      let starValue = '0/5';

      // Fetch reviewStats nếu chưa có hoặc cần cập nhật
      if (!reviewStats) {
        try {
          const res = await adminFetch('/api/reviews/stats');
          const data = await res.json();
          if (data.success && data.data) {
            setReviewStats(data.data);
            usersValue = `${data.data.totalReviews.toLocaleString('vi-VN')}+`;
            starValue = `${data.data.averageRating}/5`;
          }
        } catch (error) {
          console.error('Error fetching review stats:', error);
        }
      } else {
        // Sử dụng giá trị từ reviewStats hiện có
        usersValue = `${reviewStats.totalReviews.toLocaleString('vi-VN')}+`;
        starValue = `${reviewStats.averageRating}/5`;
      }

      // Tạo hoặc cập nhật stat Users
      if (!hasUsers) {
        newStats.unshift({
          icon: 'Users',
          value: usersValue,
          label: 'Khách hàng tin tưởng',
          color: 'from-blue-500/20 to-blue-600/10'
        });
      } else {
        // Cập nhật giá trị nếu đã có
        const usersIndex = newStats.findIndex(s => s.icon === 'Users');
        if (usersIndex !== -1) {
          newStats[usersIndex] = {
            ...newStats[usersIndex],
            value: usersValue,
            label: newStats[usersIndex].label || 'Khách hàng tin tưởng'
          };
        }
      }

      // Tạo hoặc cập nhật stat Star
      if (!hasStar) {
        // Tìm vị trí sau Users
        const usersIndex = newStats.findIndex(s => s.icon === 'Users');
        if (usersIndex !== -1) {
          newStats.splice(usersIndex + 1, 0, {
            icon: 'Star',
            value: starValue,
            label: 'Đánh giá trung bình',
            color: 'from-yellow-500/20 to-yellow-600/10'
          });
        } else {
          // Nếu không có Users, thêm Star vào đầu
          newStats.unshift({
            icon: 'Star',
            value: starValue,
            label: 'Đánh giá trung bình',
            color: 'from-yellow-500/20 to-yellow-600/10'
          });
        }
      } else {
        // Cập nhật giá trị nếu đã có
        const starIndex = newStats.findIndex(s => s.icon === 'Star');
        if (starIndex !== -1) {
          newStats[starIndex] = {
            ...newStats[starIndex],
            value: starValue,
            label: newStats[starIndex].label || 'Đánh giá trung bình'
          };
        }
      }

      // Đảm bảo Users và Star luôn ở đầu (sắp xếp lại)
      const usersStat = newStats.find(s => s.icon === 'Users');
      const starStat = newStats.find(s => s.icon === 'Star');
      const otherStats = newStats.filter(s => s.icon !== 'Users' && s.icon !== 'Star');

      newStats = [];
      if (usersStat) newStats.push(usersStat);
      if (starStat) newStats.push(starStat);
      newStats.push(...otherStats);
    }

    setWhyChooseUsData({
      ...whyChooseUsData,
      auto_calculate_stats: checked,
      stats: newStats
    });
  };

  // Footer links management
  const handleOpenLinkModal = (link = null) => {
    if (link) {
      setEditingLink(link);
      setLinkForm({ ...link });
    } else {
      setEditingLink(null);
      const maxOrder = footerData.links.length > 0
        ? Math.max(...footerData.links.map(l => l.order || 0))
        : 0;
      setLinkForm({ text: '', url: '#', order: maxOrder + 1 });
    }
    setShowLinkModal(true);
  };

  const handleSaveLink = () => {
    if (!linkForm.text || !linkForm.url) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Vui lòng điền đầy đủ thông tin', type: 'error' },
          })
        );
      }
      return;
    }

    const newLinks = [...footerData.links];
    if (editingLink) {
      const index = newLinks.findIndex(l => l === editingLink);
      if (index !== -1) {
        newLinks[index] = { ...linkForm };
      }
    } else {
      newLinks.push({ ...linkForm });
    }

    setFooterData({ ...footerData, links: newLinks });
    setShowLinkModal(false);
    setEditingLink(null);
    setLinkForm({ text: '', url: '#', order: 1 });
  };

  const handleDeleteLink = (link) => {
    if (!confirm('Bạn có chắc muốn xóa link này?')) return;
    const newLinks = footerData.links.filter(l => l !== link);
    setFooterData({ ...footerData, links: newLinks });
  };

  // Show loading while checking auth or fetching data
  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <Settings className="w-5 h-5 md:w-8 md:h-8 text-primary shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Cấu hình Trang chủ</h1>
          </div>
          <p className="text-sm text-muted-foreground">Quản lý tất cả nội dung text động trên landing page</p>
        </div>

        {/* Tabs */}
        <div className="mb-4 md:mb-6 border-b border-border overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-full pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap text-sm ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5 md:p-6 mb-4 md:mb-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình chung</h2>
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-400">
                  <strong>Lưu ý:</strong> Tên cửa hàng này sẽ được sử dụng trong email, metadata (SEO), admin panel và các nơi khác trong hệ thống.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Tên cửa hàng <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="UK Restaurant"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {restaurantName.length}/50 ký tự
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  <p className="mb-1">Tên cửa hàng này sẽ hiển thị trong:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Email gửi đến khách hàng (xác thực, đặt lại mật khẩu, xác nhận đơn hàng)</li>
                    <li>Metadata của website (title, description, Open Graph, Twitter Card)</li>
                    <li>Admin panel header</li>
                    <li>Các nơi khác trong hệ thống</li>
                  </ul>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Slogan/Tagline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder='Ăn no khỏi "bàn"'
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {slogan.length}/100 ký tự
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  <p className="mb-1">Slogan này sẽ hiển thị trong:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Email gửi đến khách hàng (header của email)</li>
                    <li>Metadata của website (title, Open Graph, Twitter Card)</li>
                    <li>Các nơi khác trong hệ thống</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Header Tab */}
          {activeTab === 'header' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình Header</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Tên nhà hàng <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={headerData.restaurant_name}
                  onChange={(e) => setHeaderData({ ...headerData, restaurant_name: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="UK Restaurant"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {headerData.restaurant_name.length}/50 ký tự
                </p>
              </div>

              {/* Display Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Chế độ hiển thị <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="display_mode"
                      value="name"
                      checked={headerData.display_mode === 'name' || !headerData.display_mode}
                      onChange={(e) => setHeaderData({ ...headerData, display_mode: e.target.value })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-card-foreground">Hiển thị tên nhà hàng</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="display_mode"
                      value="logo"
                      checked={headerData.display_mode === 'logo'}
                      onChange={(e) => setHeaderData({ ...headerData, display_mode: e.target.value })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-card-foreground">Hiển thị logo</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Chọn hiển thị tên nhà hàng (text) hoặc logo (hình ảnh) trong header
                </p>
              </div>

              {/* Logo URL - Only show when Logo mode is selected */}
              {headerData.display_mode === 'logo' && (
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Logo URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={headerData.logo_url || ''}
                    onChange={(e) => setHeaderData({ ...headerData, logo_url: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/logo.png hoặc /logo.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Đường dẫn đến file logo (URL đầy đủ hoặc đường dẫn tương đối)
                  </p>
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">💡 Khuyến nghị kích thước logo:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5 ml-4 list-disc">
                      <li><strong>Chiều rộng:</strong> 120-200px (tối đa 250px)</li>
                      <li><strong>Chiều cao:</strong> 40-60px (header cao 64-80px)</li>
                      <li><strong>Tỷ lệ:</strong> Logo ngang hoặc vuông (tránh logo dọc)</li>
                      <li><strong>Format:</strong> PNG với nền trong suốt (.png)</li>
                      <li><strong>Dung lượng:</strong> Dưới 100KB để tải nhanh</li>
                    </ul>
                  </div>
                  {headerData.logo_url && (
                    <div className="mt-2 p-2 bg-muted rounded border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Xem trước logo:</p>
                      <img
                        src={headerData.logo_url}
                        alt="Logo preview"
                        className="h-12 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'block';
                        }}
                      />
                      <p className="text-xs text-red-400" style={{ display: 'none' }}>Không thể tải logo. Kiểm tra lại URL.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Menu Items Management */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Menu Items
                  </label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Chỉnh sửa tên hiển thị, icon và thứ tự cho các menu items. Các section là cố định.
                  </p>
                </div>
                <div className="space-y-3">
                  {headerData.menu_items?.map((item, index) => {
                    const MenuIcon = item.icon ? (getLucideIcon(item.icon) || Home) : Home;
                    // Map section ID to display name
                    const sectionNames = {
                      home: 'Trang chủ',
                      menu: 'Thực đơn',
                      'why-choose-us': 'Tại sao chọn chúng tôi',
                      testimonials: 'Đánh giá',
                      about: 'Giới thiệu',
                      contact: 'Liên hệ'
                    };
                    return (
                      <div
                        key={item.id || index}
                        className="p-4 bg-muted border border-border rounded-lg space-y-3"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg text-primary shrink-0">
                            <MenuIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-card-foreground">
                              {sectionNames[item.id] || item.id}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Section: <code className="bg-background px-1 py-0.5 rounded">{item.id}</code>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-card-foreground mb-1">
                              Tên hiển thị <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const newItems = [...headerData.menu_items];
                                newItems[index].label = e.target.value;
                                setHeaderData({ ...headerData, menu_items: newItems });
                              }}
                              className="w-full px-3 py-2 bg-input border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              placeholder="Trang chủ"
                              maxLength={50}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.label.length}/50 ký tự
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-card-foreground mb-1">
                              Icon
                            </label>
                            <input
                              type="text"
                              value={item.icon || ''}
                              onChange={(e) => {
                                const newItems = [...headerData.menu_items];
                                newItems[index].icon = e.target.value;
                                setHeaderData({ ...headerData, menu_items: newItems });
                              }}
                              className="w-full px-3 py-2 bg-input border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              placeholder="Home"
                              maxLength={50}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Tên icon từ lucide-react (ví dụ: Home, Utensils, BookOpen, Phone)
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.is_visible !== false}
                              onChange={(e) => {
                                const newItems = [...headerData.menu_items];
                                newItems[index].is_visible = e.target.checked;
                                setHeaderData({ ...headerData, menu_items: newItems });
                              }}
                              className="w-4 h-4 rounded border-border cursor-pointer"
                            />
                            <span className="text-sm text-card-foreground">
                              Hiển thị mục này (Trang chủ & Menu)
                            </span>
                          </label>
                          <p className="text-xs text-muted-foreground mt-1 ml-6">
                            Bỏ chọn để ẩn mục này trên cả menu và trang chủ
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                          <button
                            onClick={() => {
                              if (index > 0) {
                                const newItems = [...headerData.menu_items];
                                [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
                                newItems[index - 1].order = index;
                                newItems[index].order = index + 1;
                                setHeaderData({ ...headerData, menu_items: newItems });
                              }
                            }}
                            disabled={index === 0}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Di chuyển lên"
                          >
                            <ArrowUp className="w-4 h-4" />
                            Lên
                          </button>
                          <button
                            onClick={() => {
                              if (index < headerData.menu_items.length - 1) {
                                const newItems = [...headerData.menu_items];
                                [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                                newItems[index].order = index + 1;
                                newItems[index + 1].order = index + 2;
                                setHeaderData({ ...headerData, menu_items: newItems });
                              }
                            }}
                            disabled={index === headerData.menu_items.length - 1}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown className="w-4 h-4" />
                            Xuống
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(!headerData.menu_items || headerData.menu_items.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">Chưa có menu item nào</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình Hero Section</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={heroData.title}
                  onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="UK Restaurant"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">{heroData.title.length}/100 ký tự</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Subtitle (Slogan) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={heroData.subtitle}
                  onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder='Ăn no khỏi "bàn"'
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">{heroData.subtitle.length}/200 ký tự</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={heroData.description}
                  onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Khám phá hương vị đặc biệt..."
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{heroData.description.length}/500 ký tự</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroData.cta_button_text || ''}
                    onChange={(e) => setHeroData({ ...heroData, cta_button_text: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Xem thực đơn"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(heroData.cta_button_text || '').length}/50 ký tự
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroData.cta_secondary_button_text || ''}
                    onChange={(e) => setHeroData({ ...heroData, cta_secondary_button_text: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Liên hệ"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(heroData.cta_secondary_button_text || '').length}/50 ký tự
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Secondary CTA Button Link
                </label>
                <input
                  type="text"
                  value={heroData.cta_secondary_button_link || ''}
                  onChange={(e) => setHeroData({ ...heroData, cta_secondary_button_link: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="/contact"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(heroData.cta_secondary_button_link || '').length}/200 ký tự
                </p>
              </div>
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình Menu Section</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Section Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={menuData.section_title}
                  onChange={(e) => setMenuData({ ...menuData, section_title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Thực đơn"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">{menuData.section_title.length}/100 ký tự</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Section Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={menuData.section_description}
                  onChange={(e) => setMenuData({ ...menuData, section_description: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Khám phá những món ăn được yêu thích nhất"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {menuData.section_description.length}/300 ký tự
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Tiêu đề Món nổi bật
                </label>
                <input
                  type="text"
                  value={menuData.popular_title || ''}
                  onChange={(e) => setMenuData({ ...menuData, popular_title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Món nổi bật"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(menuData.popular_title || '').length}/50 ký tự
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Icon Món nổi bật (Emoji hoặc text)
                </label>
                <input
                  type="text"
                  value={menuData.popular_icon || ''}
                  onChange={(e) => setMenuData({ ...menuData, popular_icon: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="🔥"
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(menuData.popular_icon || '').length}/10 ký tự (ví dụ: 🔥, ⭐, 💯)
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Truy cập <a href="https://emojipedia.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">emojipedia.org</a> để tìm emoji
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Icon lucide cho Món nổi bật (tùy chọn)
                </label>
                <input
                  type="text"
                  value={menuData.popular_lucide_icon || ''}
                  onChange={(e) => setMenuData({ ...menuData, popular_lucide_icon: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="TrendingUp"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nhập tên icon trong <code>lucide-react</code>, ví dụ: TrendingUp, Star, Flame. Nếu để trống sẽ dùng TrendingUp.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Truy cập <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lucide.dev</a> để tìm icon
                </p>
                {menuData.popular_lucide_icon && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    {isValidLucideIcon(menuData.popular_lucide_icon) ? (
                      <>
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card">
                          {(() => {
                            const Icon = getLucideIcon(menuData.popular_lucide_icon);
                            return Icon ? <Icon className="w-4 h-4 text-primary" /> : null;
                          })()}
                        </span>
                        <span>Preview: <code>{menuData.popular_lucide_icon}</code></span>
                      </>
                    ) : (
                      <span>
                        Icon không hợp lệ, frontend sẽ fallback về <code>TrendingUp</code>.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WhyChooseUs Tab */}
          {activeTab === 'whyChooseUs' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình Why Choose Us Section</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Section Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={whyChooseUsData.section_title}
                  onChange={(e) => setWhyChooseUsData({ ...whyChooseUsData, section_title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Giới thiệu"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">{whyChooseUsData.section_title.length}/100 ký tự</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Section Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={whyChooseUsData.section_description}
                  onChange={(e) => setWhyChooseUsData({ ...whyChooseUsData, section_description: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Cam kết mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời nhất"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {whyChooseUsData.section_description.length}/300 ký tự
                </p>
              </div>

              {/* Features Management */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <label className="block text-sm font-medium text-card-foreground">
                    Features <span className="text-red-400">*</span> ({whyChooseUsData.features.length}/6)
                  </label>
                  <button
                    onClick={() => handleOpenFeatureModal()}
                    disabled={whyChooseUsData.features.length >= 6}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {whyChooseUsData.features.map((feature, index) => {
                    const FeatureIcon = feature.icon ? (getLucideIcon(feature.icon) || CheckCircle2) : CheckCircle2;
                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted border border-border rounded-lg gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg text-primary shrink-0">
                            <FeatureIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-card-foreground text-sm sm:text-base truncate">{feature.title}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">{feature.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
                          <button
                            onClick={() => handleOpenFeatureModal(feature)}
                            className="p-2 text-primary hover:bg-primary/10 rounded cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(feature)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {whyChooseUsData.features.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">Chưa có feature nào</p>
                  )}
                </div>
              </div>

              {/* Stats Management */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <label className="block text-sm font-medium text-card-foreground">
                    Stats (Số liệu thống kê)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleOpenStatModal()}
                      disabled={whyChooseUsData.auto_calculate_stats}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Stat
                    </button>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whyChooseUsData.auto_calculate_stats || false}
                        onChange={(e) => handleToggleAutoCalculateStats(e.target.checked)}
                        className="w-4 h-4 rounded border-border cursor-pointer"
                      />
                      <span>Tự động tính</span>
                    </label>
                  </div>
                </div>

                {whyChooseUsData.auto_calculate_stats && reviewStats && (
                  <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-400 font-medium mb-2">📊 Stats từ đánh giá:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex justify-between sm:block">
                        <span className="text-muted-foreground">Tổng đánh giá:</span>
                        <span className="ml-2 font-bold text-foreground">{reviewStats.totalReviews}</span>
                      </div>
                      <div className="flex justify-between sm:block">
                        <span className="text-muted-foreground">Điểm TB:</span>
                        <span className="ml-2 font-bold text-foreground">{reviewStats.averageRating}/5</span>
                      </div>
                      <div className="flex justify-between sm:block">
                        <span className="text-muted-foreground">Đã xác minh:</span>
                        <span className="ml-2 font-bold text-foreground">{reviewStats.verifiedCustomers}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {whyChooseUsData.stats?.map((stat, index) => {
                    const StatIcon = stat.icon ? (getLucideIcon(stat.icon) || TrendingUp) : TrendingUp;
                    // Kiểm tra nếu là 2 stats đầu tiên (Users và Star) và auto_calculate_stats = true thì không cho chỉnh sửa/xóa
                    const isFixedStat = whyChooseUsData.auto_calculate_stats &&
                      (stat.icon === 'Users' || stat.icon === 'Star') &&
                      index < 2;

                    return (
                      <div
                        key={index}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 ${isFixedStat ? 'bg-muted/50 border-primary/30' : 'bg-muted border-border'
                          }`}
                      >
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg text-primary shrink-0">
                            <StatIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-card-foreground text-sm sm:text-base flex items-center gap-2">
                              <span className="truncate">{stat.label}</span>
                              {isFixedStat && (
                                <span className="text-[10px] sm:text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">Tự động</span>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">Giá trị: <code className="bg-background/50 px-1 rounded">{stat.value}</code></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
                          <button
                            onClick={() => handleOpenStatModal(stat)}
                            className="p-2 text-primary hover:bg-primary/10 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={whyChooseUsData.auto_calculate_stats || isFixedStat}
                            title={isFixedStat ? 'Không thể chỉnh sửa stat tự động tính' : 'Chỉnh sửa'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStat(stat)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={whyChooseUsData.auto_calculate_stats || isFixedStat}
                            title={isFixedStat ? 'Không thể xóa stat tự động tính' : 'Xóa'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(!whyChooseUsData.stats || whyChooseUsData.stats.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">Chưa có stats nào</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Testimonials Tab */}
          {
            activeTab === 'testimonials' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình Testimonials Section</h2>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Section Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={testimonialsData.section_title}
                    onChange={(e) => setTestimonialsData({ ...testimonialsData, section_title: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Đánh giá từ khách hàng"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {testimonialsData.section_title.length}/100 ký tự
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Section Description
                  </label>
                  <textarea
                    value={testimonialsData.section_description}
                    onChange={(e) => setTestimonialsData({ ...testimonialsData, section_description: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Những phản hồi chân thật từ khách hàng đã sử dụng dịch vụ của chúng tôi"
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {testimonialsData.section_description.length}/300 ký tự
                  </p>
                </div>

                {/* Trust Stats Management */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-card-foreground">
                      Trust Stats (Thống kê đánh giá)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={testimonialsData.auto_calculate_stats || false}
                          onChange={(e) => setTestimonialsData({ ...testimonialsData, auto_calculate_stats: e.target.checked })}
                          className="w-4 h-4 rounded border-border cursor-pointer"
                        />
                        <span>Tự động tính từ đánh giá</span>
                      </label>
                    </div>
                  </div>

                  {testimonialsData.auto_calculate_stats && reviewStats && (
                    <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-400 font-medium mb-2">📊 Stats từ đánh giá:</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tổng đánh giá:</span>
                          <span className="ml-2 font-bold text-foreground">{reviewStats.totalReviews}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Điểm TB:</span>
                          <span className="ml-2 font-bold text-foreground">{reviewStats.averageRating}/5</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Đã xác minh:</span>
                          <span className="ml-2 font-bold text-foreground">{reviewStats.verifiedCustomers}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Điểm đánh giá trung bình
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={testimonialsData.trustStats?.averageRating || 0}
                        onChange={(e) =>
                          setTestimonialsData({
                            ...testimonialsData,
                            trustStats: { ...(testimonialsData.trustStats || {}), averageRating: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        disabled={testimonialsData.auto_calculate_stats}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Tổng số đánh giá
                      </label>
                      <input
                        type="text"
                        value={testimonialsData.trustStats?.totalReviews || 0}
                        onChange={(e) =>
                          setTestimonialsData({
                            ...testimonialsData,
                            trustStats: { ...(testimonialsData.trustStats || {}), totalReviews: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        disabled={testimonialsData.auto_calculate_stats}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        % Khách hàng đã xác minh
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={testimonialsData.trustStats?.verifiedCustomers || 0}
                        onChange={(e) =>
                          setTestimonialsData({
                            ...testimonialsData,
                            trustStats: { ...(testimonialsData.trustStats || {}), verifiedCustomers: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        disabled={testimonialsData.auto_calculate_stats}
                      />
                    </div>
                  </div>
                </div>

                {/* Testimonials Note */}
                <div className="p-4 bg-muted border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Lưu ý:</strong> Testimonials được quản lý từ hệ thống đánh giá. Admin có thể duyệt và chọn hiển thị các đánh giá từ trang quản lý Reviews riêng.
                  </p>
                </div>
              </div>
            )
          }

          {/* Footer Tab */}
          {
            activeTab === 'footer' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình Footer</h2>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Restaurant Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={footerData.restaurant_name}
                    onChange={(e) => setFooterData({ ...footerData, restaurant_name: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="UK Restaurant"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {footerData.restaurant_name.length}/50 ký tự
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Slogan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={footerData.slogan}
                    onChange={(e) => setFooterData({ ...footerData, slogan: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder='Ăn no khỏi "bàn"'
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{footerData.slogan.length}/200 ký tự</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={footerData.description}
                    onChange={(e) => setFooterData({ ...footerData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Khám phá hương vị đặc biệt..."
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {footerData.description.length}/500 ký tự
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Copyright Text
                  </label>
                  <input
                    type="text"
                    value={footerData.copyright_text || ''}
                    onChange={(e) => setFooterData({ ...footerData, copyright_text: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tất cả quyền được bảo lưu."
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(footerData.copyright_text || '').length}/200 ký tự
                  </p>
                </div>

                {/* Footer Links Management */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-card-foreground">Footer Links</label>
                    <button
                      onClick={() => handleOpenLinkModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Link
                    </button>
                  </div>
                  <div className="space-y-2">
                    {footerData.links.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-card-foreground">{link.text}</div>
                          <div className="text-sm text-muted-foreground">{link.url}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenLinkModal(link)}
                            className="p-2 text-primary hover:bg-primary/10 rounded cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {footerData.links.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">Chưa có link nào</p>
                    )}
                  </div>
                </div>

                {/* Social Media Note */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm text-foreground/80 leading-relaxed">
                    <strong>Thông tin:</strong> Các liên kết mạng xã hội hiển thị ở Footer được lấy từ cấu hình trang
                    <a href="/admin/contact-config" className="text-primary hover:underline font-medium mx-1">Liên Hệ</a>.
                    Vui lòng sang trang cấu hình Liên Hệ để chỉnh sửa các liên kết này.
                  </div>
                </div>
              </div>
            )
          }

          {/* Legal Tab */}
          {
            activeTab === 'legal' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình Trang Pháp lý</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Privacy Policy */}
                  <div className="space-y-4 p-6 bg-muted border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-medium text-card-foreground">Chính sách bảo mật</h3>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Tiêu đề trang
                      </label>
                      <input
                        type="text"
                        value={legalData.privacy_policy?.title || ''}
                        onChange={(e) => setLegalData({
                          ...legalData,
                          privacy_policy: { ...legalData.privacy_policy, title: e.target.value }
                        })}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Chính sách bảo mật"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Nội dung
                      </label>
                      <RichTextEditor
                        value={legalData.privacy_policy?.content || ''}
                        onChange={(content) => setLegalData({
                          ...legalData,
                          privacy_policy: { ...legalData.privacy_policy, content }
                        })}
                        placeholder="Nhập nội dung chính sách bảo mật..."
                      />
                    </div>
                  </div>

                  {/* Terms of Service */}
                  <div className="space-y-4 p-6 bg-muted border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Gavel className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-medium text-card-foreground">Điều khoản sử dụng</h3>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Tiêu đề trang
                      </label>
                      <input
                        type="text"
                        value={legalData.terms_of_service?.title || ''}
                        onChange={(e) => setLegalData({
                          ...legalData,
                          terms_of_service: { ...legalData.terms_of_service, title: e.target.value }
                        })}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Điều khoản sử dụng"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Nội dung
                      </label>
                      <RichTextEditor
                        value={legalData.terms_of_service?.content || ''}
                        onChange={(content) => setLegalData({
                          ...legalData,
                          terms_of_service: { ...legalData.terms_of_service, content }
                        })}
                        placeholder="Nhập nội dung điều khoản sử dụng..."
                      />
                    </div>
                  </div>
                </div>

              </div>
            )
          }

          {/* SEO Tab */}
          {
            activeTab === 'seo' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình SEO</h2>

                {/* Icons */}
                <div className="space-y-4 border-t border-b border-border pt-6 pb-6">
                  <h3 className="text-lg font-medium text-card-foreground">Icons (Favicon & Apple Icon)</h3>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Favicon URL <span className="text-muted-foreground font-normal">(Icon hiển thị trên tab browser)</span>
                    </label>
                    <input
                      type="text"
                      value={seoData.icon_favicon || ''}
                      onChange={(e) => setSeoData({ ...seoData, icon_favicon: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="/favicon.ico"
                    />
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Hướng dẫn:</strong>
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Đường dẫn tương đối: <code className="bg-background px-1 rounded">/favicon.ico</code> (file trong thư mục <code className="bg-background px-1 rounded">public</code>)</li>
                        <li>URL đầy đủ: <code className="bg-background px-1 rounded">https://example.com/favicon.ico</code></li>
                        <li>Kích thước khuyến nghị: <strong>32x32px</strong> hoặc <strong>16x16px</strong></li>
                        <li>Định dạng: ICO, PNG, hoặc SVG</li>
                        <li>Ví dụ: <code className="bg-background px-1 rounded">/images/favicon.ico</code></li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Apple Touch Icon URL <span className="text-muted-foreground font-normal">(Icon hiển thị khi thêm vào home screen trên iOS)</span>
                    </label>
                    <input
                      type="text"
                      value={seoData.icon_apple || ''}
                      onChange={(e) => setSeoData({ ...seoData, icon_apple: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="/apple-icon.png"
                    />
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Hướng dẫn:</strong>
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Đường dẫn tương đối: <code className="bg-background px-1 rounded">/apple-icon.png</code> (file trong thư mục <code className="bg-background px-1 rounded">public</code>)</li>
                        <li>URL đầy đủ: <code className="bg-background px-1 rounded">https://example.com/apple-icon.png</code></li>
                        <li>Kích thước khuyến nghị: <strong>180x180px</strong> (cho iPhone)</li>
                        <li>Định dạng: PNG (không trong suốt)</li>
                        <li>Ví dụ: <code className="bg-background px-1 rounded">/images/apple-icon.png</code></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Basic Meta Tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-card-foreground">Meta Tags Cơ Bản</h3>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={seoData.meta_title || ''}
                      onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Để trống sẽ dùng: {Tên cửa hàng} - {Slogan}"
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(seoData.meta_title || '').length}/100 ký tự. Để trống sẽ tự động dùng "{restaurantName || 'UK Restaurant'} - {slogan || 'Ăn no khỏi \"bàn\"'}"
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={seoData.meta_description || ''}
                      onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Mô tả ngắn gọn về website (150-160 ký tự là lý tưởng)"
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(seoData.meta_description || '').length}/200 ký tự
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={seoData.meta_keywords || ''}
                      onChange={(e) => setSeoData({ ...seoData, meta_keywords: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="nhà hàng, đặt món online, đồ ăn, giao hàng"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(seoData.meta_keywords || '').length}/500 ký tự. Phân cách bằng dấu phẩy
                    </p>
                  </div>
                </div>

                {/* Open Graph */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-lg font-medium text-card-foreground">Open Graph (Facebook, LinkedIn)</h3>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      OG Title
                    </label>
                    <input
                      type="text"
                      value={seoData.og_title || ''}
                      onChange={(e) => setSeoData({ ...seoData, og_title: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Để trống sẽ dùng Meta Title"
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(seoData.og_title || '').length}/100 ký tự
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      OG Description
                    </label>
                    <textarea
                      value={seoData.og_description || ''}
                      onChange={(e) => setSeoData({ ...seoData, og_description: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Để trống sẽ dùng Meta Description"
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(seoData.og_description || '').length}/200 ký tự
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      OG Image URL <span className="text-muted-foreground font-normal">(Hình ảnh hiển thị khi chia sẻ trên Facebook, LinkedIn...)</span>
                    </label>
                    <input
                      type="text"
                      value={seoData.og_image || ''}
                      onChange={(e) => setSeoData({ ...seoData, og_image: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="/og-image.jpg"
                    />
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Hướng dẫn:</strong>
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Đường dẫn tương đối: <code className="bg-background px-1 rounded">/og-image.jpg</code> (file trong thư mục <code className="bg-background px-1 rounded">public</code>)</li>
                        <li>URL đầy đủ: <code className="bg-background px-1 rounded">https://example.com/image.jpg</code></li>
                        <li>Kích thước khuyến nghị: <strong>1200x630px</strong> (tỷ lệ 1.91:1)</li>
                        <li>Định dạng: JPG, PNG, hoặc WebP</li>
                        <li>Ví dụ: <code className="bg-background px-1 rounded">/images/og-image.jpg</code> hoặc <code className="bg-background px-1 rounded">https://yourdomain.com/og-image.jpg</code></li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        OG Type <span className="text-muted-foreground font-normal text-xs">(Loại nội dung)</span>
                      </label>
                      <select
                        value={seoData.og_type || 'website'}
                        onChange={(e) => setSeoData({ ...seoData, og_type: e.target.value })}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="website">Website - Trang web thông thường (Khuyến nghị)</option>
                        <option value="article">Article - Bài viết/Blog</option>
                        <option value="product">Product - Sản phẩm</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Chọn "Website" cho trang chủ/landing page
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        OG Locale
                      </label>
                      <input
                        type="text"
                        value={seoData.og_locale || 'vi_VN'}
                        onChange={(e) => setSeoData({ ...seoData, og_locale: e.target.value })}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="vi_VN"
                      />
                    </div>
                  </div>
                </div>

                {/* Twitter Card */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-lg font-medium text-card-foreground">Twitter Card</h3>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Twitter Card Type <span className="text-muted-foreground font-normal">(Định dạng hiển thị khi chia sẻ trên Twitter/X)</span>
                    </label>
                    <select
                      value={seoData.twitter_card || 'summary_large_image'}
                      onChange={(e) => setSeoData({ ...seoData, twitter_card: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="summary">Summary - Hiển thị nhỏ (120x120px)</option>
                      <option value="summary_large_image">Summary Large Image - Hiển thị lớn (1200x628px) - Khuyến nghị</option>
                    </select>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Giải thích:</strong>
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li><strong>Summary:</strong> Hiển thị hình ảnh nhỏ (120x120px) bên cạnh nội dung</li>
                        <li><strong>Summary Large Image:</strong> Hiển thị hình ảnh lớn (1200x628px) phía trên nội dung - <strong>Khuyến nghị dùng</strong></li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 <strong>Lưu ý:</strong> Nên chọn "Summary Large Image" để hình ảnh hiển thị đẹp và thu hút hơn khi chia sẻ trên Twitter/X.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Twitter Title
                    </label>
                    <input
                      type="text"
                      value={seoData.twitter_title || ''}
                      onChange={(e) => setSeoData({ ...seoData, twitter_title: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Để trống sẽ dùng OG Title"
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(seoData.twitter_title || '').length}/100 ký tự
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Twitter Description
                    </label>
                    <textarea
                      value={seoData.twitter_description || ''}
                      onChange={(e) => setSeoData({ ...seoData, twitter_description: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Để trống sẽ dùng OG Description"
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(seoData.twitter_description || '').length}/200 ký tự
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Twitter Image URL <span className="text-muted-foreground font-normal">(Tùy chọn - để trống sẽ dùng OG Image)</span>
                    </label>
                    <input
                      type="text"
                      value={seoData.twitter_image || ''}
                      onChange={(e) => setSeoData({ ...seoData, twitter_image: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Để trống sẽ dùng OG Image"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Đường dẫn tương đối (bắt đầu với /) hoặc URL đầy đủ. Nếu để trống, Twitter sẽ tự động dùng hình ảnh từ OG Image.
                    </p>
                  </div>
                </div>

                {/* Robots */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-lg font-medium text-card-foreground">Search Engine Robots</h3>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={seoData.robots_index !== false}
                        onChange={(e) => setSeoData({ ...seoData, robots_index: e.target.checked })}
                        className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary"
                      />
                      <span className="text-sm text-card-foreground">Cho phép index (robots: index)</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={seoData.robots_follow !== false}
                        onChange={(e) => setSeoData({ ...seoData, robots_follow: e.target.checked })}
                        className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary"
                      />
                      <span className="text-sm text-card-foreground">Cho phép follow links (robots: follow)</span>
                    </label>
                  </div>
                </div>
              </div>
            )
          }

          {
            activeTab === 'spam' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình ngăn chặn Spam</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Cấu hình các giới hạn và thời gian hiệu lực để bảo vệ hệ thống khỏi spam và lạm dụng.
                </p>

                {/* Giới hạn đặt hàng */}
                <div className="space-y-4 border-t border-b border-border pt-6 pb-6">
                  <h3 className="text-lg font-medium text-card-foreground">1. Giới hạn đặt hàng</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ngăn chặn việc đặt quá nhiều đơn hàng trong thời gian ngắn từ cùng một email.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Số đơn hàng tối đa <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={spamData.max_orders || 5}
                      onChange={(e) => setSpamData({ ...spamData, max_orders: parseInt(e.target.value) || 5 })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Số đơn hàng tối đa mà một email có thể đặt trong khoảng thời gian giới hạn (theo "Thời gian giới hạn đặt hàng" bên dưới).
                      <br />
                      <strong>Ví dụ:</strong> Nếu đặt là 5 và thời gian là 30 phút, thì một email chỉ có thể đặt tối đa 5 đơn trong 30 phút.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Thời gian giới hạn đặt hàng (giây) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="86400"
                      value={spamData.order_rate_limit_ttl || 1800}
                      onChange={(e) => setSpamData({ ...spamData, order_rate_limit_ttl: parseInt(e.target.value) || 1800 })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Khoảng thời gian (tính bằng giây) để đếm số đơn hàng. Hệ thống sẽ đếm số đơn trong khoảng thời gian này.
                      <br />
                      <strong>Gợi ý:</strong> 1800 giây = 30 phút, 3600 giây = 1 giờ, 7200 giây = 2 giờ
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Thời gian blacklist khi vượt quá (giờ) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={spamData.order_rate_limit_blacklist_hours || 24}
                      onChange={(e) => setSpamData({ ...spamData, order_rate_limit_blacklist_hours: parseInt(e.target.value) || 24 })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Khi email đặt quá số đơn cho phép (vượt "Số đơn hàng tối đa"), hệ thống sẽ tự động chặn email này trong bao nhiêu giờ.
                      <br />
                      <strong>Ví dụ:</strong> 24 giờ = 1 ngày, 168 giờ = 1 tuần
                    </p>
                  </div>
                </div>

                {/* Xác thực email */}
                <div className="space-y-4 border-t border-b border-border pt-6 pb-6">
                  <h3 className="text-lg font-medium text-card-foreground">2. Xác thực email</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cấu hình thời gian hiệu lực của mã xác thực và số lần thử nhập mã.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Thời gian mã xác thực có hiệu lực (giây) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="3600"
                      value={spamData.verification_code_ttl || 600}
                      onChange={(e) => setSpamData({ ...spamData, verification_code_ttl: parseInt(e.target.value) || 600 })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Sau thời gian này, mã xác thực sẽ hết hạn và người dùng phải gửi lại mã mới.
                      <br />
                      <strong>Gợi ý:</strong> 600 giây = 10 phút, 300 giây = 5 phút
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Thời gian session sau khi verify (giây) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="86400"
                      value={spamData.verified_session_ttl || 1800}
                      onChange={(e) => setSpamData({ ...spamData, verified_session_ttl: parseInt(e.target.value) || 1800 })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Sau khi xác thực email thành công, session sẽ có hiệu lực trong khoảng thời gian này. Trong thời gian này, người dùng không cần xác thực lại khi đặt hàng.
                      <br />
                      <strong>Gợi ý:</strong> 1800 giây = 30 phút, 3600 giây = 1 giờ
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Số lần thử nhập mã sai tối đa <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={spamData.max_verify_attempts || 5}
                      onChange={(e) => setSpamData({ ...spamData, max_verify_attempts: parseInt(e.target.value) || 5 })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Nếu nhập sai mã quá số lần này, người dùng phải gửi lại mã mới.
                    </p>
                  </div>
                </div>

                {/* Giới hạn gửi mã */}
                <div className="space-y-4 border-t border-b border-border pt-6 pb-6">
                  <h3 className="text-lg font-medium text-card-foreground">3. Giới hạn gửi mã</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ngăn chặn việc yêu cầu gửi quá nhiều mã xác thực trong thời gian ngắn.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Số lần gửi mã tối đa <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={spamData.max_send_code || 5}
                      onChange={(e) => setSpamData({ ...spamData, max_send_code: parseInt(e.target.value) || 5 })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Số lần gửi mã xác thực tối đa mà một email có thể yêu cầu trong khoảng thời gian giới hạn (theo "Thời gian giới hạn gửi mã" bên dưới).
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Thời gian giới hạn gửi mã (giây) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="86400"
                      value={spamData.send_code_rate_limit_ttl || 3600}
                      onChange={(e) => setSpamData({ ...spamData, send_code_rate_limit_ttl: parseInt(e.target.value) || 3600 })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Khoảng thời gian (tính bằng giây) để đếm số lần gửi mã. Hệ thống sẽ đếm số lần gửi mã trong khoảng thời gian này.
                      <br />
                      <strong>Gợi ý:</strong> 3600 giây = 1 giờ, 1800 giây = 30 phút, 7200 giây = 2 giờ
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Thời gian chờ giữa các lần gửi mã (giây) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      value={spamData.resend_code_cooldown || 60}
                      onChange={(e) => setSpamData({ ...spamData, resend_code_cooldown: parseInt(e.target.value) || 60 })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Thời gian người dùng phải đợi để gửi lại mã xác thực (Cooldown timer của nút gửi lại).
                      <br />
                      <strong>Gợi ý:</strong> 60 giây = 1 phút
                    </p>
                  </div>
                </div>
              </div>
            )
          }
        </div >

        {/* Action Buttons */}
        < div className="fixed sm:relative bottom-0 left-0 right-0 p-4 sm:p-0 bg-card sm:bg-transparent border-t sm:border-0 border-border z-10 sm:z-auto shadow-[0_-4px_10px_rgba(0,0,0,0.1)] sm:shadow-none flex items-center justify-between gap-3" >
          <button
            onClick={handleOpenResetModal}
            disabled={saving}
            className="flex-1 sm:flex-none flex cursor-pointer items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Reset về mặc định</span>
            <span className="sm:hidden">Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none flex cursor-pointer items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium text-sm sm:text-base shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 shrink-0" />
                <span>Lưu cấu hình</span>
              </>
            )}
          </button>
        </div >
      </div >

      {/* Spacer cho mobile để không bị đè bởi fixed footer */}
      < div className="h-20 sm:hidden" ></div >

      {/* Feature Modal */}
      {
        showFeatureModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div
              ref={featureModalRef}
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-card-foreground">
                  {editingFeature ? 'Sửa Feature' : 'Thêm Feature'}
                </h3>
                <button
                  onClick={() => {
                    if (saving) return;
                    setShowFeatureModal(false);
                    setEditingFeature(null);
                  }}
                  disabled={saving}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={featureForm.title}
                    onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={featureForm.description}
                    onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    maxLength={300}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Icon <span className="text-red-400">*</span>
                  </label>
                  <div className="space-y-2">
                    <div className="relative flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={featureForm.icon}
                          onChange={(e) => handleFeatureIconChange(e.target.value)}
                          onFocus={() => {
                            if (featureForm.icon) {
                              const filtered = FEATURE_ICONS.filter(icon =>
                                icon.toLowerCase().includes(featureForm.icon.toLowerCase())
                              );
                              setFeatureIconSuggestions(filtered.length > 0 ? filtered : FEATURE_ICONS);
                              setShowFeatureIconDropdown(filtered.length > 0);
                            } else {
                              setFeatureIconSuggestions(FEATURE_ICONS);
                              setShowFeatureIconDropdown(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay để cho phép click vào suggestion
                            setTimeout(() => setShowFeatureIconDropdown(false), 200);
                          }}
                          placeholder="Nhập tên icon (ví dụ: CheckCircle2, Zap, Heart...)"
                          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {showFeatureIconDropdown && featureIconSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {featureIconSuggestions.map((icon) => {
                              const IconComponent = getLucideIcon(icon) || CheckCircle2;
                              return (
                                <button
                                  key={icon}
                                  type="button"
                                  onClick={() => {
                                    setFeatureForm({ ...featureForm, icon });
                                    setShowFeatureIconDropdown(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted text-left text-sm text-card-foreground"
                                >
                                  <IconComponent className="w-4 h-4 text-primary" />
                                  <span>{icon}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 bg-muted border border-border rounded-lg shrink-0">
                        {featureForm.icon && (() => {
                          try {
                            const IconComponent = getLucideIcon(featureForm.icon);
                            if (IconComponent) {
                              return (
                                <div className="text-primary">
                                  <IconComponent className="w-6 h-6" />
                                </div>
                              );
                            }
                          } catch (e) {
                            console.error('Error rendering icon:', e);
                          }
                          return <CheckCircle2 className="w-6 h-6 text-muted-foreground" />;
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {featureForm.icon && isValidLucideIcon(featureForm.icon) ? (
                          <span className="text-green-400">✓ Icon hợp lệ</span>
                        ) : featureForm.icon ? (
                          <span className="text-red-400">✗ Icon không tồn tại</span>
                        ) : (
                          'Xem trước icon'
                        )}
                      </p>
                      <a
                        href="https://lucide.dev/icons"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Xem tất cả icons →
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Order</label>
                  <input
                    type="number"
                    value={featureForm.order}
                    onChange={(e) => setFeatureForm({ ...featureForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Color (Gradient) <span className="text-muted-foreground text-xs">(ví dụ: from-green-500/20 to-emerald-600/10)</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={featureForm.color}
                      onChange={(e) => setFeatureForm({ ...featureForm, color: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="from-green-500/20 to-emerald-600/10"
                    />
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {FEATURE_COLORS.map((colorOption, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFeatureForm({ ...featureForm, color: colorOption.color, borderColor: colorOption.borderColor })}
                          className={`h-10 rounded border-2 ${featureForm.color === colorOption.color ? 'border-primary' : 'border-border'
                            }`}
                          style={{
                            background: `linear-gradient(to bottom right, ${colorOption.color.includes('green') ? 'rgba(34, 197, 94, 0.2)' :
                              colorOption.color.includes('orange') ? 'rgba(249, 115, 22, 0.2)' :
                                colorOption.color.includes('blue') ? 'rgba(59, 130, 246, 0.2)' :
                                  colorOption.color.includes('purple') ? 'rgba(168, 85, 247, 0.2)' :
                                    colorOption.color.includes('pink') ? 'rgba(236, 72, 153, 0.2)' :
                                      'rgba(234, 179, 8, 0.2)'}, ${colorOption.color.includes('green') ? 'rgba(5, 150, 105, 0.1)' :
                                        colorOption.color.includes('orange') ? 'rgba(217, 119, 6, 0.1)' :
                                          colorOption.color.includes('blue') ? 'rgba(37, 99, 235, 0.1)' :
                                            colorOption.color.includes('purple') ? 'rgba(124, 58, 237, 0.1)' :
                                              colorOption.color.includes('pink') ? 'rgba(219, 39, 119, 0.1)' :
                                                'rgba(217, 119, 6, 0.1)'})`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Border Color <span className="text-muted-foreground text-xs">(ví dụ: border-green-500/30)</span>
                  </label>
                  <input
                    type="text"
                    value={featureForm.borderColor}
                    onChange={(e) => setFeatureForm({ ...featureForm, borderColor: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="border-green-500/30"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (saving) return;
                      setShowFeatureModal(false);
                      setEditingFeature(null);
                    }}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveFeature}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Stat Modal */}
      {
        showStatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div
              ref={statModalRef}
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[100vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-card-foreground">
                  {editingStat ? 'Sửa Stat' : 'Thêm Stat'}
                </h3>
                <button
                  onClick={() => {
                    if (saving) return;
                    setShowStatModal(false);
                    setEditingStat(null);
                  }}
                  disabled={saving}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Icon <span className="text-red-400">*</span>
                  </label>
                  <div className="space-y-2">
                    <div className="relative flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={statForm.icon}
                          onChange={(e) => handleStatIconChange(e.target.value)}
                          onFocus={() => {
                            if (statForm.icon) {
                              const filtered = STAT_ICONS.filter(icon =>
                                icon.toLowerCase().includes(statForm.icon.toLowerCase())
                              );
                              setStatIconSuggestions(filtered.length > 0 ? filtered : STAT_ICONS);
                              setShowStatIconDropdown(filtered.length > 0);
                            } else {
                              setStatIconSuggestions(STAT_ICONS);
                              setShowStatIconDropdown(true);
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => setShowStatIconDropdown(false), 200);
                          }}
                          placeholder="Nhập tên icon (ví dụ: Users, Star, Clock...)"
                          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {showStatIconDropdown && statIconSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {statIconSuggestions.map((icon) => {
                              const IconComponent = getLucideIcon(icon) || Users;
                              return (
                                <button
                                  key={icon}
                                  type="button"
                                  onClick={() => {
                                    setStatForm({ ...statForm, icon });
                                    setShowStatIconDropdown(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted text-left text-sm text-card-foreground"
                                >
                                  <IconComponent className="w-4 h-4 text-primary" />
                                  <span>{icon}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 bg-muted border border-border rounded-lg shrink-0">
                        {statForm.icon && (() => {
                          try {
                            const IconComponent = getLucideIcon(statForm.icon);
                            if (IconComponent) {
                              return (
                                <div className="text-primary">
                                  <IconComponent className="w-6 h-6" />
                                </div>
                              );
                            }
                          } catch (e) {
                            console.error('Error rendering icon:', e);
                          }
                          return <Users className="w-6 h-6 text-muted-foreground" />;
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {statForm.icon && isValidLucideIcon(statForm.icon) ? (
                          <span className="text-green-400">✓ Icon hợp lệ</span>
                        ) : statForm.icon ? (
                          <span className="text-red-400">✗ Icon không tồn tại</span>
                        ) : (
                          'Xem trước icon'
                        )}
                      </p>
                      <a
                        href="https://lucide.dev/icons"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Xem tất cả icons →
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Value <span className="text-red-400">*</span> <span className="text-muted-foreground text-xs">(ví dụ: 10,000+, 4.9/5, 30')</span>
                  </label>
                  <input
                    type="text"
                    value={statForm.value}
                    onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="10,000+"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Label <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={statForm.label}
                    onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Khách hàng tin tưởng"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Color (Gradient) <span className="text-muted-foreground text-xs">(ví dụ: from-blue-500/20 to-blue-600/10)</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={statForm.color}
                      onChange={(e) => setStatForm({ ...statForm, color: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="from-blue-500/20 to-blue-600/10"
                    />
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {STAT_COLORS.map((colorOption, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setStatForm({ ...statForm, color: colorOption })}
                          className={`h-10 rounded border-2 ${statForm.color === colorOption ? 'border-primary' : 'border-border'
                            }`}
                          style={{
                            background: `linear-gradient(to bottom right, ${colorOption.includes('blue') ? 'rgba(59, 130, 246, 0.2)' :
                              colorOption.includes('yellow') ? 'rgba(234, 179, 8, 0.2)' :
                                colorOption.includes('green') ? 'rgba(34, 197, 94, 0.2)' :
                                  colorOption.includes('primary') ? 'rgba(59, 130, 246, 0.2)' :
                                    colorOption.includes('purple') ? 'rgba(168, 85, 247, 0.2)' :
                                      'rgba(236, 72, 153, 0.2)'}, ${colorOption.includes('blue') ? 'rgba(37, 99, 235, 0.1)' :
                                        colorOption.includes('yellow') ? 'rgba(217, 119, 6, 0.1)' :
                                          colorOption.includes('green') ? 'rgba(5, 150, 105, 0.1)' :
                                            colorOption.includes('primary') ? 'rgba(37, 99, 235, 0.1)' :
                                              colorOption.includes('purple') ? 'rgba(124, 58, 237, 0.1)' :
                                                'rgba(219, 39, 119, 0.1)'})`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (saving) return;
                      setShowStatModal(false);
                      setEditingStat(null);
                    }}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveStat}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Link Modal */}
      {
        showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div
              ref={linkModalRef}
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-card-foreground">
                  {editingLink ? 'Sửa Link' : 'Thêm Link'}
                </h3>
                <button
                  onClick={() => {
                    if (saving) return;
                    setShowLinkModal(false);
                    setEditingLink(null);
                  }}
                  disabled={saving}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Text <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={linkForm.text}
                    onChange={(e) => setLinkForm({ ...linkForm, text: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={linkForm.url}
                    onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="#"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Order</label>
                  <input
                    type="number"
                    value={linkForm.order}
                    onChange={(e) => setLinkForm({ ...linkForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    min={1}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (saving) return;
                      setShowLinkModal(false);
                      setEditingLink(null);
                    }}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveLink}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Feature Confirmation Modal */}
      {
        showDeleteFeatureModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div
              ref={deleteFeatureModalRef}
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-card-foreground">
                  Xác nhận xóa Feature
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteFeatureModal(false);
                    setFeatureToDelete(null);
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-card-foreground">
                  Bạn có chắc muốn xóa feature <strong>"{featureToDelete?.title}"</strong>?
                </p>
                <p className="text-sm text-muted-foreground">
                  Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (saving) return;
                      setShowDeleteFeatureModal(false);
                      setFeatureToDelete(null);
                    }}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmDeleteFeature}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Stat Confirmation Modal */}
      {
        showDeleteStatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div
              ref={deleteStatModalRef}
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-card-foreground">
                  Xác nhận xóa Stat
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteStatModal(false);
                    setStatToDelete(null);
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-card-foreground">
                  Bạn có chắc muốn xóa stat <strong>"{statToDelete?.label}"</strong>?
                </p>
                {statToDelete && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      <div>Icon: <code>{statToDelete.icon}</code></div>
                      <div>Giá trị: <code>{statToDelete.value}</code></div>
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (saving) return;
                      setShowDeleteStatModal(false);
                      setStatToDelete(null);
                    }}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmDeleteStat}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Reset Config Modal */}
      {
        showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div
              ref={resetModalRef}
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-card-foreground">
                  Chọn phần muốn reset
                </h3>
                <button
                  onClick={() => {
                    if (saving) return;
                    setShowResetModal(false);
                  }}
                  disabled={saving}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Chọn các phần bạn muốn reset về giá trị mặc định. Các phần không được chọn sẽ giữ nguyên.
                </p>

                <div className="space-y-3">
                  {TABS.filter(tab => tab.id !== 'general' || true).map((tab) => {
                    const sectionKey = tab.id === 'whyChooseUs' ? 'whyChooseUs' :
                      tab.id === 'general' ? 'general' : tab.id;
                    const sectionLabel = tab.id === 'whyChooseUs' ? 'Why Choose Us' : tab.label;

                    return (
                      <label
                        key={tab.id}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={resetSections[sectionKey] || false}
                          onChange={(e) => {
                            setResetSections({
                              ...resetSections,
                              [sectionKey]: e.target.checked
                            });
                          }}
                          className="w-4 h-4 rounded border-border cursor-pointer"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <tab.icon className="w-4 h-4 text-primary" />
                          <span className="text-card-foreground font-medium">{sectionLabel}</span>
                        </div>
                      </label>
                    );
                  })}


                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowResetModal(false)}
                      className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={saving || Object.values(resetSections).every(v => !v)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang reset...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>Reset</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ message: '', isVisible: false })}
        type={toast.type || 'success'}
      />
    </div >
  );
}

