'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Settings, Save, RotateCcw, Loader2, X, Plus, Edit2, Trash2, 
  ArrowUp, ArrowDown, Home, Sparkles, BookOpen, Info, Phone, 
  Mail, MapPin, Share2, Link as LinkIcon, CheckCircle2, Zap, Heart
} from 'lucide-react';

const TABS = [
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
  const [activeTab, setActiveTab] = useState('header');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states cho từng section
  const [headerData, setHeaderData] = useState({ restaurant_name: '' });
  const [heroData, setHeroData] = useState({ 
    title: '', subtitle: '', description: '', cta_button_text: '' 
  });
  const [menuData, setMenuData] = useState({ 
    section_title: '', section_description: '' 
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

  // Modal states
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', icon: 'CheckCircle2', order: 1 });

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [editingSocial, setEditingSocial] = useState(null);
  const [socialForm, setSocialForm] = useState({ 
    name: '', url: '', icon: 'FacebookIcon', description: '', color: 'text-blue-400', order: 1 
  });

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkForm, setLinkForm] = useState({ text: '', url: '#', order: 1 });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config/landing');
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        // Populate form data
        if (data.data.header) setHeaderData(data.data.header);
        if (data.data.hero) setHeroData(data.data.hero);
        if (data.data.menu) setMenuData(data.data.menu);
        if (data.data.about) setAboutData(data.data.about);
        if (data.data.contact) setContactData(data.data.contact);
        if (data.data.footer) setFooterData(data.data.footer);
      } else {
        setError('Lỗi khi tải cấu hình');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      setError('Lỗi khi tải cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updateData = {
        header: headerData,
        hero: heroData,
        menu: menuData,
        about: aboutData,
        contact: contactData,
        footer: footerData,
      };

      const res = await fetch('/api/config/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Lưu thành công!');
        setConfig(data.data);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Lỗi khi lưu cấu hình');
        if (data.errors) {
          setError(data.errors.join(', '));
        }
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setError('Lỗi khi lưu cấu hình');
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
        setSuccess('Đã reset về mặc định!');
        fetchConfig();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Lỗi khi reset');
      }
    } catch (error) {
      console.error('Error resetting config:', error);
      setError('Lỗi khi reset');
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
  };

  const handleSaveFeature = () => {
    if (!featureForm.title || !featureForm.description) {
      setError('Vui lòng điền đầy đủ thông tin');
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
  };

  const handleSaveSocial = () => {
    if (!socialForm.name || !socialForm.url) {
      setError('Vui lòng điền đầy đủ thông tin');
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
      setError('Vui lòng điền đầy đủ thông tin');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
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
          {/* Header Tab */}
          {activeTab === 'header' && (
            <div className="space-y-4">
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
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {aboutData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-card-foreground">{feature.title}</div>
                        <div className="text-sm text-muted-foreground">{feature.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenFeatureModal(feature)}
                          className="p-2 text-primary hover:bg-primary/10 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFeature(feature)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Social Media
                  </button>
                </div>
                <div className="space-y-2">
                  {contactData.social_media.map((social, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-card-foreground">{social.name}</div>
                        <div className="text-sm text-muted-foreground">{social.url}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenSocialModal(social)}
                          className="p-2 text-primary hover:bg-primary/10 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSocial(social)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark"
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
                          className="p-2 text-primary hover:bg-primary/10 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded"
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset về mặc định
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark disabled:opacity-50"
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
                className="text-muted-foreground hover:text-foreground"
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
                <label className="block text-sm font-medium text-card-foreground mb-2">Icon</label>
                <select
                  value={featureForm.icon}
                  onChange={(e) => setFeatureForm({ ...featureForm, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {FEATURE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
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
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveFeature}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark"
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
                className="text-muted-foreground hover:text-foreground"
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
                <select
                  value={socialForm.icon}
                  onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SOCIAL_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
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
                className="text-muted-foreground hover:text-foreground"
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
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveLink}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

