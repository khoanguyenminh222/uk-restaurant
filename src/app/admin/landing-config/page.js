'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import Toast from '@/components/Toast/Toast';
import {
  Settings, Save, RotateCcw, Loader2, X, Plus, Edit2, Trash2,
  ArrowUp, ArrowDown, Home, Sparkles, BookOpen, Info, Phone,
  Mail, MapPin, Share2, Link as LinkIcon, CheckCircle2, Zap, Heart, MessageCircle, Shield
} from 'lucide-react';
import * as lucideIcons from 'lucide-react';

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
  { id: 'about', label: 'About', icon: Info },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'footer', label: 'Footer', icon: LinkIcon },
];

// Default icons cho features (lucide-react)
const FEATURE_ICONS = [
  'CheckCircle2', 'Zap', 'Heart', 'Star', 'Award', 'Shield', 
  'Clock', 'Truck', 'Users', 'ThumbsUp', 'Gift', 'TrendingUp'
];

// Default icons cho social media
const SOCIAL_ICONS = [
  'FacebookIcon', 'MessageCircle', 'InstagramIcon', 'Twitter', 
  'Youtube', 'Tiktok', 'Linkedin', 'Share2'
];

export default function AdminLandingConfig() {
  // Check if user has permission (only admin and super_admin)
  const { isAuthorized, isChecking } = useRoleCheck(['admin', 'super_admin']);

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [toast, setToast] = useState({ message: '', isVisible: false });

  // Form states cho từng section
  const [restaurantName, setRestaurantName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [headerData, setHeaderData] = useState({ 
    restaurant_name: '',
    menu_items: []
  });
  const [heroData, setHeroData] = useState({ 
    title: '', subtitle: '', description: '', cta_button_text: '' 
  });
  const [menuData, setMenuData] = useState({ 
    section_title: '', 
    section_description: '',
    popular_title: '',
    popular_icon: '',
    popular_lucide_icon: '',
  });
  const [aboutData, setAboutData] = useState({ 
    section_title: '', section_description: '', features: [] 
  });
  const [contactData, setContactData] = useState({ 
    section_title: '', 
    info: { phone: '', email: '', address: '' },
    map_embed_url: '',
    social_media: []
  });
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

  // Modal states
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', icon: 'CheckCircle2', order: 1 });
  const [featureIconSuggestions, setFeatureIconSuggestions] = useState([]);
  const [showFeatureIconDropdown, setShowFeatureIconDropdown] = useState(false);

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [editingSocial, setEditingSocial] = useState(null);
  const [socialForm, setSocialForm] = useState({ 
    name: '', url: '', icon: 'FacebookIcon', description: '', color: 'text-blue-400', order: 1 
  });
  const [socialIconSuggestions, setSocialIconSuggestions] = useState([]);
  const [showSocialIconDropdown, setShowSocialIconDropdown] = useState(false);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkForm, setLinkForm] = useState({ text: '', url: '#', order: 1 });

  useEffect(() => {
    fetchConfig();
  }, []);

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

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config/landing');
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        // Populate form data
        if (data.data.restaurant_name) setRestaurantName(data.data.restaurant_name);
        if (data.data.slogan) setSlogan(data.data.slogan);
        if (data.data.header) {
          // Đảm bảo luôn có đủ 4 menu items mặc định
          const defaultMenuItems = [
            { id: 'home', label: 'Trang chủ', icon: 'Home', order: 1 },
            { id: 'menu', label: 'Thực đơn', icon: 'Utensils', order: 2 },
            { id: 'about', label: 'Giới thiệu', icon: 'BookOpen', order: 3 },
            { id: 'contact', label: 'Liên hệ', icon: 'Phone', order: 4 },
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
        if (data.data.hero) setHeroData(data.data.hero);
        if (data.data.menu) setMenuData(data.data.menu);
        if (data.data.about) setAboutData(data.data.about);
        if (data.data.contact) setContactData(data.data.contact);
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

      // Đảm bảo header có đủ 4 menu items
      const defaultMenuItems = [
        { id: 'home', label: 'Trang chủ', icon: 'Home', order: 1 },
        { id: 'menu', label: 'Thực đơn', icon: 'Utensils', order: 2 },
        { id: 'about', label: 'Giới thiệu', icon: 'BookOpen', order: 3 },
        { id: 'contact', label: 'Liên hệ', icon: 'Phone', order: 4 },
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
        about: aboutData,
        contact: contactData,
        footer: footerData,
        seo: seoData,
        spam: spamData,
      };

      const res = await fetch('/api/config/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (data.success) {
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

  const handleReset = async () => {
    if (!confirm('Bạn có chắc muốn reset về mặc định? Tất cả thay đổi sẽ bị mất.')) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/config/landing/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: { message: 'Đã reset về mặc định!', type: 'success' },
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
      setFeatureForm({ ...feature });
    } else {
      setEditingFeature(null);
      const maxOrder = aboutData.features.length > 0 
        ? Math.max(...aboutData.features.map(f => f.order || 0))
        : 0;
      setFeatureForm({ title: '', description: '', icon: 'CheckCircle2', order: maxOrder + 1 });
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

    const newFeatures = [...aboutData.features];
    if (editingFeature) {
      const index = newFeatures.findIndex(f => f === editingFeature);
      if (index !== -1) {
        newFeatures[index] = { ...featureForm };
      }
    } else {
      newFeatures.push({ ...featureForm });
    }

    setAboutData({ ...aboutData, features: newFeatures });
    setShowFeatureModal(false);
    setEditingFeature(null);
    setFeatureForm({ title: '', description: '', icon: 'CheckCircle2', order: 1 });
  };

  const handleDeleteFeature = (feature) => {
    if (!confirm('Bạn có chắc muốn xóa feature này?')) return;
    const newFeatures = aboutData.features.filter(f => f !== feature);
    setAboutData({ ...aboutData, features: newFeatures });
  };

  // Social media management
  const handleOpenSocialModal = (social = null) => {
    if (social) {
      setEditingSocial(social);
      setSocialForm({ ...social });
    } else {
      setEditingSocial(null);
      const maxOrder = contactData.social_media.length > 0 
        ? Math.max(...contactData.social_media.map(s => s.order || 0))
        : 0;
      setSocialForm({ name: '', url: '', icon: 'FacebookIcon', description: '', color: 'text-blue-400', order: maxOrder + 1 });
    }
    setShowSocialModal(true);
    setShowSocialIconDropdown(false);
  };

  // Handle social icon input change
  const handleSocialIconChange = (value) => {
    setSocialForm({ ...socialForm, icon: value });
    // Luôn cho phép nhập bất kỳ giá trị nào, suggestions chỉ là gợi ý
    if (value) {
      const filtered = SOCIAL_ICONS.filter(icon => 
        icon.toLowerCase().includes(value.toLowerCase())
      );
      setSocialIconSuggestions(filtered);
      // Hiển thị dropdown nếu có suggestions hoặc nếu đang focus
      setShowSocialIconDropdown(filtered.length > 0);
    } else {
      setSocialIconSuggestions(SOCIAL_ICONS);
      setShowSocialIconDropdown(false);
    }
  };

  const handleSaveSocial = () => {
    if (!socialForm.name || !socialForm.url) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Vui lòng điền đầy đủ thông tin', type: 'error' },
          })
        );
      }
      return;
    }

    const newSocial = [...contactData.social_media];
    if (editingSocial) {
      const index = newSocial.findIndex(s => s === editingSocial);
      if (index !== -1) {
        newSocial[index] = { ...socialForm };
      }
    } else {
      newSocial.push({ ...socialForm });
    }

    setContactData({ ...contactData, social_media: newSocial });
    setShowSocialModal(false);
    setEditingSocial(null);
    setSocialForm({ name: '', url: '', icon: 'FacebookIcon', description: '', color: 'text-blue-400', order: 1 });
  };

  const handleDeleteSocial = (social) => {
    if (!confirm('Bạn có chắc muốn xóa social media này?')) return;
    const newSocial = contactData.social_media.filter(s => s !== social);
    setContactData({ ...contactData, social_media: newSocial });
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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Cấu hình Landing Page</h1>
          </div>
          <p className="text-muted-foreground">Quản lý tất cả nội dung text động trên landing page</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
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

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình About Section</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Section Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={aboutData.section_title}
                  onChange={(e) => setAboutData({ ...aboutData, section_title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Giới thiệu"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">{aboutData.section_title.length}/100 ký tự</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Section Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={aboutData.section_description}
                  onChange={(e) => setAboutData({ ...aboutData, section_description: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Cam kết mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời nhất"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {aboutData.section_description.length}/300 ký tự
                </p>
              </div>

              {/* Features Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-card-foreground">
                    Features <span className="text-red-400">*</span> ({aboutData.features.length}/6)
                  </label>
                  <button
                    onClick={() => handleOpenFeatureModal()}
                    disabled={aboutData.features.length >= 6}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {aboutData.features.map((feature, index) => {
                    const FeatureIcon = feature.icon ? (getLucideIcon(feature.icon) || CheckCircle2) : CheckCircle2;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg text-primary">
                            <FeatureIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-card-foreground">{feature.title}</div>
                            <div className="text-sm text-muted-foreground">{feature.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenFeatureModal(feature)}
                            className="p-2 text-primary hover:bg-primary/10 rounded cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(feature)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {aboutData.features.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">Chưa có feature nào</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Cấu hình Contact Section</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Section Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={contactData.section_title}
                  onChange={(e) => setContactData({ ...contactData, section_title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Liên hệ"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {contactData.section_title.length}/100 ký tự
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contactData.info.phone}
                    onChange={(e) =>
                      setContactData({
                        ...contactData,
                        info: { ...contactData.info, phone: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="(+84) 096 960 6095"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactData.info.email}
                    onChange={(e) =>
                      setContactData({
                        ...contactData,
                        info: { ...contactData.info, email: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@example.com"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactData.info.address}
                    onChange={(e) =>
                      setContactData({
                        ...contactData,
                        info: { ...contactData.info, address: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="123 Đường ABC..."
                    maxLength={200}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Google Maps Embed URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={contactData.map_embed_url}
                  onChange={(e) => setContactData({ ...contactData, map_embed_url: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://www.google.com/maps/embed?..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lấy embed URL từ Google Maps → Share → Embed a map
                </p>
              </div>

              {/* Social Media Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-card-foreground">Social Media</label>
                  <button
                    onClick={() => handleOpenSocialModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Social Media
                  </button>
                </div>
                <div className="space-y-2">
                  {contactData.social_media.map((social, index) => {
                    // Render icon cho social media
                    let SocialIcon = MessageCircle;
                    if (social.icon === 'FacebookIcon') {
                      SocialIcon = () => (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      );
                    } else if (social.icon === 'InstagramIcon') {
                      SocialIcon = () => (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      );
                    } else if (social.icon) {
                      const lucideIcon = getLucideIcon(social.icon);
                      if (lucideIcon) {
                        SocialIcon = lucideIcon;
                      }
                    }
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${social.color || 'text-blue-400'}`}>
                            <SocialIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-card-foreground">{social.name}</div>
                            <div className="text-sm text-muted-foreground">{social.url}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenSocialModal(social)}
                            className="p-2 text-primary hover:bg-primary/10 rounded cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSocial(social)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {contactData.social_media.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">Chưa có social media nào</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Tab */}
          {activeTab === 'footer' && (
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
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
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
          )}

          {activeTab === 'spam' && (
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
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang reset...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Reset về mặc định</span>
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu cấu hình
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-card-foreground">
                {editingFeature ? 'Sửa Feature' : 'Thêm Feature'}
              </h3>
              <button
                onClick={() => {
                  setShowFeatureModal(false);
                  setEditingFeature(null);
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
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
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowFeatureModal(false);
                    setEditingFeature(null);
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveFeature}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-card-foreground">
                {editingSocial ? 'Sửa Social Media' : 'Thêm Social Media'}
              </h3>
              <button
                onClick={() => {
                  setShowSocialModal(false);
                  setEditingSocial(null);
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={socialForm.name}
                  onChange={(e) => setSocialForm({ ...socialForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={socialForm.url}
                  onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Icon</label>
                <div className="space-y-2">
                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={socialForm.icon}
                        onChange={(e) => handleSocialIconChange(e.target.value)}
                        onFocus={() => {
                          if (socialForm.icon) {
                            const filtered = SOCIAL_ICONS.filter(icon => 
                              icon.toLowerCase().includes(socialForm.icon.toLowerCase())
                            );
                            setSocialIconSuggestions(filtered.length > 0 ? filtered : SOCIAL_ICONS);
                            setShowSocialIconDropdown(filtered.length > 0);
                          } else {
                            setSocialIconSuggestions(SOCIAL_ICONS);
                            setShowSocialIconDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay để cho phép click vào suggestion
                          setTimeout(() => setShowSocialIconDropdown(false), 200);
                        }}
                        placeholder="Nhập tên icon (ví dụ: FacebookIcon, MessageCircle...)"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {showSocialIconDropdown && socialIconSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {socialIconSuggestions.map((icon) => {
                            let IconComponent = MessageCircle;
                            if (icon === 'FacebookIcon') {
                              IconComponent = () => (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                              );
                            } else if (icon === 'InstagramIcon') {
                              IconComponent = () => (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              );
                            } else {
                              const lucideIcon = getLucideIcon(icon);
                              if (lucideIcon) {
                                IconComponent = lucideIcon;
                              }
                            }
                            return (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => {
                                  setSocialForm({ ...socialForm, icon });
                                  setShowSocialIconDropdown(false);
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
                      {socialForm.icon && (() => {
                        try {
                          if (socialForm.icon === 'FacebookIcon') {
                            return (
                              <div className="text-primary">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                              </div>
                            );
                          } else if (socialForm.icon === 'InstagramIcon') {
                            return (
                              <div className="text-primary">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              </div>
                            );
                            } else {
                              const IconComponent = getLucideIcon(socialForm.icon);
                              if (IconComponent) {
                                return (
                                  <div className="text-primary">
                                    <IconComponent className="w-6 h-6" />
                                  </div>
                                );
                              }
                            }
                        } catch (e) {
                          console.error('Error rendering icon:', e);
                        }
                        return <MessageCircle className="w-6 h-6 text-muted-foreground" />;
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {socialForm.icon && (isValidLucideIcon(socialForm.icon) || socialForm.icon === 'FacebookIcon' || socialForm.icon === 'InstagramIcon') ? (
                        <span className="text-green-400">✓ Icon hợp lệ</span>
                      ) : socialForm.icon ? (
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
                <label className="block text-sm font-medium text-card-foreground mb-2">Description</label>
                <input
                  type="text"
                  value={socialForm.description || ''}
                  onChange={(e) => setSocialForm({ ...socialForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Color</label>
                <input
                  type="text"
                  value={socialForm.color}
                  onChange={(e) => setSocialForm({ ...socialForm, color: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="text-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Order</label>
                <input
                  type="number"
                  value={socialForm.order}
                  onChange={(e) => setSocialForm({ ...socialForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  min={1}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSocialModal(false);
                    setEditingSocial(null);
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSocial}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-card-foreground">
                {editingLink ? 'Sửa Link' : 'Thêm Link'}
              </h3>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setEditingLink(null);
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
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
                    setShowLinkModal(false);
                    setEditingLink(null);
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveLink}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ message: '', isVisible: false })}
        type={toast.type || 'success'}
      />
    </div>
  );
}

