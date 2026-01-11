'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { defaultContactConfig } from '@/lib/models/ContactConfig';
import Toast from '@/components/Toast/Toast';
import {
    Settings, Save, RotateCcw, Loader2, X, Plus, Edit2, Trash2,
    Sparkles, Info, Users, ArrowRight, MapPin, MessageCircle,
    Phone, Mail, Clock, Send, Globe, Star, Image as ImageIcon,
    CheckCircle2, AlertCircle, HelpCircle
} from 'lucide-react';
import * as lucideIcons from 'lucide-react';
import { adminFetch } from '@/lib/adminAuth';

const TABS = [
    { id: 'hero', label: 'Hero', icon: Sparkles },
    { id: 'info', label: 'Thông tin LH', icon: Info },
    { id: 'social', label: 'Mạng xã hội', icon: Globe },
    { id: 'form', label: 'Form liên hệ', icon: MessageCircle },
    { id: 'map', label: 'Bản đồ', icon: MapPin },
    { id: 'stats', label: 'Trust Stats', icon: Star },
    { id: 'cta', label: 'CTA', icon: ArrowRight },
    { id: 'seo', label: 'SEO', icon: Settings },
];

const COMMON_SOCIAL_ICONS = [
    'Facebook', 'Instagram', 'Twitter', 'Youtube', 'Linkedin', 'MessageCircle', 'Phone', 'Mail', 'Github', 'Globe'
];

export default function AdminContactConfig() {
    const { isAuthorized, isChecking } = useRoleCheck(['admin', 'super_admin']);

    const [activeTab, setActiveTab] = useState('hero');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ message: '', isVisible: false });

    // Data states
    const [heroData, setHeroData] = useState(defaultContactConfig.hero);
    const [infoData, setInfoData] = useState(defaultContactConfig.info);
    const [socialMedia, setSocialMedia] = useState(defaultContactConfig.social_media || []);
    const [socialSection, setSocialSection] = useState(defaultContactConfig.social_section || {});
    const [formData, setFormData] = useState(defaultContactConfig.contact_form);
    const [sectionMap, setSectionMap] = useState(defaultContactConfig.section_map || {});
    const [trustStats, setTrustStats] = useState(defaultContactConfig.trustStats || {});
    const [ctaData, setCtaData] = useState(defaultContactConfig.cta);
    const [seoData, setSeoData] = useState(defaultContactConfig.seo);

    // Social Modal States
    const [showSocialModal, setShowSocialModal] = useState(false);
    const [editingSocial, setEditingSocial] = useState(null);
    const [socialForm, setSocialForm] = useState({
        name: '',
        url: '',
        icon: 'Globe',
        description: '',
        color: 'text-blue-500',
        order: 0
    });

    // Delete Confirmation Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);

    // Reset Modal
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetSections, setResetSections] = useState({
        hero: false,
        info: false,
        social: false,
        form: false,
        map: false,
        stats: false,
        cta: false,
        seo: false,
    });

    // Modal refs
    const socialModalRef = useRef(null);
    const deleteModalRef = useRef(null);
    const resetModalRef = useRef(null);

    useEffect(() => {
        if (!isChecking) {
            fetchConfig();
        }
    }, [isChecking]);

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

    // Handle click outside for all modals
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Don't close if saving
            if (saving) return;

            if (showSocialModal && socialModalRef.current && !socialModalRef.current.contains(event.target)) {
                setShowSocialModal(false);
                setEditingSocial(null);
            }
            if (showDeleteModal && deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
                setShowDeleteModal(false);
                setDeleteIndex(null);
            }
            if (showResetModal && resetModalRef.current && !resetModalRef.current.contains(event.target)) {
                setShowResetModal(false);
            }
        };

        const isAnyModalOpen = showSocialModal || showDeleteModal || showResetModal;

        if (isAnyModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSocialModal, showDeleteModal, showResetModal, saving]);

    // Handle scroll lock when any modal is open
    useEffect(() => {
        const isAnyModalOpen = showSocialModal || showDeleteModal || showResetModal;

        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showSocialModal, showDeleteModal, showResetModal]);



    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await adminFetch('/api/config/contact');
            const data = await res.json();
            if (data.success) {
                const config = data.data;
                if (config.hero) setHeroData(config.hero);
                if (config.info) setInfoData(config.info);
                if (config.social_media) setSocialMedia(config.social_media);
                if (config.social_section) setSocialSection(config.social_section);
                if (config.contact_form) setFormData(config.contact_form);

                // Handle Map (checking both new and legacy)
                if (config.section_map) {
                    setSectionMap(config.section_map);
                } else if (config.map_embed_url) {
                    setSectionMap(prev => ({ ...prev, embed_url: config.map_embed_url }));
                }

                if (config.trustStats) setTrustStats(config.trustStats);
                if (config.cta) setCtaData(config.cta);
                if (config.seo) setSeoData(config.seo);
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
            const updateData = {
                hero: heroData,
                info: infoData,
                social_media: socialMedia,
                social_section: socialSection,
                contact_form: formData,
                section_map: sectionMap,
                trustStats: trustStats,
                cta: ctaData,
                seo: seoData
            };

            const res = await adminFetch('/api/config/contact', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            const data = await res.json();
            if (data.success) {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                        new CustomEvent('showToast', {
                            detail: { message: 'Lưu cấu hình thành công!', type: 'success' },
                        })
                    );
                }
            } else {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                        new CustomEvent('showToast', {
                            detail: { message: data.error || 'Lỗi khi lưu cấu hình', type: 'error' },
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
        const sectionNames = {
            hero: 'Hero',
            info: 'Thông tin LH',
            social: 'Mạng xã hội',
            form: 'Form liên hệ',
            map: 'Bản đồ',
            stats: 'Trust Stats',
            cta: 'CTA',
            seo: 'SEO',
        };

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

            if (resetSections.hero) {
                resetData.hero = defaultContactConfig.hero;
            }
            if (resetSections.info) {
                resetData.info = defaultContactConfig.info;
            }
            if (resetSections.social) {
                resetData.social_media = defaultContactConfig.social_media || [];
                resetData.social_section = defaultContactConfig.social_section || {};
            }
            if (resetSections.form) {
                resetData.contact_form = defaultContactConfig.contact_form;
            }
            if (resetSections.map) {
                resetData.section_map = defaultContactConfig.section_map || {};
            }
            if (resetSections.stats) {
                resetData.trustStats = defaultContactConfig.trustStats || {};
            }
            if (resetSections.cta) {
                resetData.cta = defaultContactConfig.cta;
            }
            if (resetSections.seo) {
                resetData.seo = defaultContactConfig.seo;
            }

            // Gửi request reset
            const res = await adminFetch('/api/config/contact', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resetData),
            });

            const data = await res.json();
            if (data.success) {
                const resetParts = Object.entries(resetSections)
                    .filter(([_, checked]) => checked)
                    .map(([key, _]) => sectionNames[key])
                    .join(', ');

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                        new CustomEvent('showToast', {
                            detail: { message: `Đã reset phần "${resetParts}" về giá trị mặc định!`, type: 'success' },
                        })
                    );
                }
                fetchConfig(); // Reload dữ liệu từ database
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
            setResetSections({
                hero: false,
                info: false,
                social: false,
                form: false,
                map: false,
                stats: false,
                cta: false,
                seo: false,
            });
        }
    };

    // Social Media Handlers
    const handleAddSocial = () => {
        setEditingSocial(null);
        setSocialForm({
            name: '',
            url: '',
            icon: 'Globe',
            description: '',
            color: 'text-blue-500',
            order: socialMedia.length + 1
        });
        setShowSocialModal(true);
    };

    const handleEditSocial = (index) => {
        setEditingSocial(index);
        setSocialForm({ ...socialMedia[index] });
        setShowSocialModal(true);
    };

    const handleDeleteSocialClick = (index) => {
        setDeleteIndex(index);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (deleteIndex !== null) {
            const newList = socialMedia.filter((_, i) => i !== deleteIndex);
            setSocialMedia(newList);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(
                    new CustomEvent('showToast', {
                        detail: { message: 'Đã xóa liên kết', type: 'success' },
                    })
                );
            }
            setShowDeleteModal(false);
            setDeleteIndex(null);
        }
    };

    const handleSaveSocial = () => {
        if (!socialForm.name || !socialForm.url) {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(
                    new CustomEvent('showToast', {
                        detail: { message: 'Tên và URL là bắt buộc', type: 'error' },
                    })
                );
            }
            return;
        }

        const newSocials = [...socialMedia];
        if (editingSocial !== null) {
            newSocials[editingSocial] = { ...socialForm };
        } else {
            newSocials.push({ ...socialForm });
        }
        setSocialMedia(newSocials);
        setShowSocialModal(false);
        setEditingSocial(null);
    };

    if (isChecking || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            {/* Toast Notification */}
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                type={toast.type}
                onClose={() => setToast({ message: '', isVisible: false })}
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-foreground">Cấu hình Trang Liên Hệ</h1>
                    </div>
                    <p className="text-muted-foreground">Quản lý nội dung, hình ảnh và thông tin liên hệ</p>
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
                                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${activeTab === tab.id
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

                {/* Content Area */}
                <div className="bg-card border border-border rounded-lg p-6 mb-6 min-h-[500px]">

                    {/* Hero Tab */}
                    {activeTab === 'hero' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-card-foreground mb-4">Hero Section</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-2">Badge (Nhãn)</label>
                                        <input
                                            type="text"
                                            value={heroData.badge}
                                            onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                            placeholder="📞 Liên Hệ Với Chúng Tôi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-2">Tiêu đề lớn</label>
                                        <input
                                            type="text"
                                            value={heroData.title}
                                            onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground font-bold text-lg"
                                            placeholder="Chúng Tôi Luôn Sẵn Sàng..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-2">Mô tả</label>
                                        <textarea
                                            rows={4}
                                            value={heroData.description}
                                            onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                            placeholder="Hãy liên hệ với chúng tôi..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-card-foreground">CTA Chính (Primary Button)</label>
                                        <div className="flex gap-2">
                                            <input
                                                placeholder="Text (e.g. Gọi Ngay)"
                                                value={heroData.cta_primary?.text}
                                                onChange={(e) => setHeroData({ ...heroData, cta_primary: { ...heroData.cta_primary, text: e.target.value } })}
                                                className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                            />
                                            <input
                                                placeholder="Link (e.g. tel:...)"
                                                value={heroData.cta_primary?.link}
                                                onChange={(e) => setHeroData({ ...heroData, cta_primary: { ...heroData.cta_primary, link: e.target.value } })}
                                                className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-card-foreground">CTA Phụ (Secondary Button)</label>
                                        <div className="flex gap-2">
                                            <input
                                                placeholder="Text (e.g. Xem Thực Đơn)"
                                                value={heroData.cta_secondary?.text}
                                                onChange={(e) => setHeroData({ ...heroData, cta_secondary: { ...heroData.cta_secondary, text: e.target.value } })}
                                                className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                            />
                                            <input
                                                placeholder="Link (e.g. /menu)"
                                                value={heroData.cta_secondary?.link}
                                                onChange={(e) => setHeroData({ ...heroData, cta_secondary: { ...heroData.cta_secondary, link: e.target.value } })}
                                                className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-2">Hình nền (URL)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={heroData.image || ''}
                                                onChange={(e) => setHeroData({ ...heroData, image: e.target.value })}
                                                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                                placeholder="https://... (để trống nếu muốn dùng màu gradient mặc định)"
                                            />
                                        </div>
                                        {heroData.image && (
                                            <div className="mt-4 relative h-48 w-full rounded-lg overflow-hidden border border-border shadow-md">
                                                <img
                                                    src={heroData.image}
                                                    alt="Hero Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL'}
                                                />
                                            </div>
                                        )}
                                        {!heroData.image && (
                                            <div className="mt-4 h-48 w-full rounded-lg bg-linear-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center border border-border border-dashed">
                                                <span className="text-muted-foreground text-sm flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4" /> Hiển thị gradient mặc định
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-card-foreground mb-4">Thông tin liên hệ hiển thị</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phone Config */}
                                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Phone className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold">Điện thoại</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Tiêu đề (VD: Điện thoại)"
                                            value={infoData.phone_title || 'Điện thoại'}
                                            onChange={(e) => setInfoData({ ...infoData, phone_title: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Số điện thoại"
                                            value={infoData.phone}
                                            onChange={(e) => setInfoData({ ...infoData, phone: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm font-semibold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Mô tả dưới"
                                            value={infoData.phone_description || ''}
                                            onChange={(e) => setInfoData({ ...infoData, phone_description: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-muted-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Email Config */}
                                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Mail className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold">Email</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Tiêu đề (VD: Email)"
                                            value={infoData.email_title || 'Email'}
                                            onChange={(e) => setInfoData({ ...infoData, email_title: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Email Address"
                                            value={infoData.email}
                                            onChange={(e) => setInfoData({ ...infoData, email: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm font-semibold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Mô tả dưới"
                                            value={infoData.email_description || ''}
                                            onChange={(e) => setInfoData({ ...infoData, email_description: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-muted-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Address Config */}
                                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold">Địa chỉ</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Tiêu đề (VD: Địa chỉ)"
                                            value={infoData.address_title || 'Địa chỉ'}
                                            onChange={(e) => setInfoData({ ...infoData, address_title: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm"
                                        />
                                        <textarea
                                            rows={2}
                                            placeholder="Địa chỉ chi tiết"
                                            value={infoData.address}
                                            onChange={(e) => setInfoData({ ...infoData, address: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm font-semibold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Mô tả dưới"
                                            value={infoData.address_description || ''}
                                            onChange={(e) => setInfoData({ ...infoData, address_description: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-muted-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Working Hours Config */}
                                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold">Giờ làm việc</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Tiêu đề (VD: Giờ mở cửa)"
                                            value={infoData.working_hours_title || 'Giờ mở cửa'}
                                            onChange={(e) => setInfoData({ ...infoData, working_hours_title: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm"
                                        />
                                        <textarea
                                            rows={2}
                                            placeholder="Thời gian"
                                            value={infoData.working_hours}
                                            onChange={(e) => setInfoData({ ...infoData, working_hours: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm font-semibold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Mô tả dưới"
                                            value={infoData.working_hours_description || ''}
                                            onChange={(e) => setInfoData({ ...infoData, working_hours_description: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-muted-foreground"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Tab */}
                    {activeTab === 'social' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Section Header Inputs */}
                            <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
                                <h3 className="font-semibold mb-3">Tiêu đề Section</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">Badge (Nhãn)</label>
                                        <input
                                            value={socialSection.badge || 'Kết Nối'}
                                            onChange={(e) => setSocialSection({ ...socialSection, badge: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">Tiêu đề lớn</label>
                                        <input
                                            value={socialSection.title || 'Theo Dõi Chúng Tôi'}
                                            onChange={(e) => setSocialSection({ ...socialSection, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md font-semibold"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs text-muted-foreground mb-1">Mô tả</label>
                                        <input
                                            value={socialSection.description || ''}
                                            onChange={(e) => setSocialSection({ ...socialSection, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-card-foreground">Danh sách mạng xã hội</h2>
                                <button
                                    onClick={handleAddSocial}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors font-medium border border-primary/20 cursor-pointer"
                                    type="button"
                                >
                                    <Plus className="w-4 h-4" /> Thêm mới
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {socialMedia.map((social, index) => (
                                    <div key={index} className="flex flex-col p-5 border border-border rounded-lg bg-card hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="p-2 bg-muted rounded-md"><Globe className="w-4 h-4 text-muted-foreground" /></span>
                                                <span className="font-semibold text-card-foreground">{social.name}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEditSocial(index)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteSocialClick(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-blue-500 truncate mb-1 hover:underline cursor-pointer">{social.url}</p>
                                        <p className="text-xs text-muted-foreground">{social.description}</p>
                                    </div>
                                ))}
                                {socialMedia.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/20">
                                        <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Chưa có liên kết mạng xã hội nào</p>
                                        <p className="text-sm">Bấm "Thêm mới" để tạo liên kết đầu tiên</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form Tab */}
                    {activeTab === 'form' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-card-foreground mb-6">Cấu hình Form Liên Hệ</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border rounded-lg bg-card/50">
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Badge (Nhãn)</label>
                                    <input
                                        value={formData.badge || 'Gửi Tin Nhắn'}
                                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Tiêu đề Form</label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground font-bold"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Mô tả Form</label>
                                    <textarea
                                        rows={2}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Thông báo thành công</label>
                                    <input
                                        value={formData.success_message || 'Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn...'}
                                        onChange={(e) => setFormData({ ...formData, success_message: e.target.value })}
                                        className="w-full px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 font-medium"
                                    />
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <h4 className="col-span-full font-medium text-sm text-muted-foreground">Nhãn các trường (Labels)</h4>
                                    {Object.entries(formData.fields || {}).filter(([key]) => key !== 'submit_icon').map(([key, value]) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-card-foreground mb-1 capitalize">{key.replace('_', ' ')}</label>
                                            <input
                                                value={value}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    fields: { ...formData.fields, [key]: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
                                            />
                                        </div>
                                    ))}

                                    <div className="col-span-full">
                                        <label className="block text-xs font-medium text-card-foreground mb-1">Submit Icon</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={formData.fields?.submit_icon || 'Send'}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    fields: { ...formData.fields, submit_icon: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground text-sm font-mono"
                                                placeholder="Lucide Icon Name"
                                            />
                                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                                                {(() => {
                                                    try {
                                                        const PreviewIcon = lucideIcons[formData.fields?.submit_icon || 'Send'];
                                                        return PreviewIcon ? <PreviewIcon className="w-5 h-5" /> : <Send className="w-5 h-5" />;
                                                    } catch {
                                                        return <Send className="w-5 h-5" />;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Map Tab */}
                    {activeTab === 'map' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-card-foreground mb-4">Cấu hình Bản đồ</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-2">Badge (Nhãn)</label>
                                        <input
                                            value={sectionMap.badge || 'Vị Trí'}
                                            onChange={(e) => setSectionMap({ ...sectionMap, badge: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-2">Tiêu đề</label>
                                        <input
                                            value={sectionMap.title || 'Đến Thăm Chúng Tôi'}
                                            onChange={(e) => setSectionMap({ ...sectionMap, title: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-2">Text khi trống</label>
                                        <input
                                            value={sectionMap.empty_text || 'Chưa có bản đồ'}
                                            onChange={(e) => setSectionMap({ ...sectionMap, empty_text: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
                                        />
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground border border-border">
                                        <p>Lưu ý: Địa chỉ text sẽ được hiển thị tự động từ tab "Thông tin LH" (phần Địa chỉ).</p>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Google Maps Embed URL</label>
                                    <input
                                        type="text"
                                        value={sectionMap.embed_url || ''}
                                        onChange={(e) => {
                                            setSectionMap({ ...sectionMap, embed_url: e.target.value });
                                        }}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground font-mono text-sm mb-2"
                                        placeholder="https://www.google.com/maps/embed?..."
                                    />
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Hướng dẫn: Vào Google Maps {'>'} Chia sẻ {'>'} Nhúng bản đồ {'>'} Copy link trong src="..."
                                    </p>

                                    <div className="border rounded-lg overflow-hidden bg-muted h-[250px] relative shadow-inner">
                                        {sectionMap.embed_url ? (
                                            <iframe
                                                src={sectionMap.embed_url}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                title="Map Preview"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                                <MapPin className="w-12 h-12 mb-2 opacity-20" />
                                                <p>{sectionMap.empty_text || 'Chưa có URL bản đồ hợp lệ'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trust Stats Tab */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-card-foreground mb-6">Cấu hình Trust Stats (Chỉ số uy tín)</h2>

                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 rounded-lg flex gap-3 text-sm text-blue-700 dark:text-blue-400">
                                <Info className="w-5 h-5 shrink-0" />
                                <p>Các con số thống kê (Rating, Tổng đánh giá, Khách hàng xác minh) sẽ được tự động đồng bộ từ hệ thống đánh giá khách hàng (giống Landing Page) để đảm bảo tính xác thực.</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="showStats"
                                    checked={trustStats.show ?? true}
                                    onChange={(e) => setTrustStats({ ...trustStats, show: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="showStats" className="text-sm font-medium cursor-pointer">Hiển thị section này</label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border rounded-lg bg-card/50">
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Badge</label>
                                        <input
                                            value={trustStats.badge || 'Uy Tín'}
                                            onChange={(e) => setTrustStats({ ...trustStats, badge: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tiêu đề chính</label>
                                        <input
                                            value={trustStats.title || 'Khách Hàng Tin Tưởng'}
                                            onChange={(e) => setTrustStats({ ...trustStats, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md font-bold"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                                        <input
                                            value={trustStats.description || ''}
                                            onChange={(e) => setTrustStats({ ...trustStats, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-linear-to-br from-primary/10 via-blue-50/50 to-primary/5 dark:from-primary/20 dark:via-blue-900/10 dark:to-primary/10 border-2 border-primary/20 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 p-3 bg-primary/20 rounded-lg">
                                        <Info className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            Số liệu tự động từ Landing Page
                                        </h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Các chỉ số thống kê (Đánh giá trung bình, Tổng đánh giá, Khách hàng đã xác minh) được tự động đồng bộ từ hệ thống đánh giá khách hàng và cấu hình tại trang <strong>Landing Config</strong>. Bạn không cần cấu hình lại ở đây.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                            <div className="flex items-center gap-2 p-2 bg-card/50 rounded-lg">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                <span className="text-xs font-medium">Đánh giá trung bình</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-card/50 rounded-lg">
                                                <MessageCircle className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-medium">Tổng đánh giá</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-card/50 rounded-lg">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                <span className="text-xs font-medium">Khách hàng xác minh</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA Tab */}
                    {activeTab === 'cta' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-card-foreground mb-6">Cấu hình CTA Section</h2>

                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 rounded-lg flex gap-3 text-sm text-blue-700 dark:text-blue-400">
                                <Info className="w-5 h-5 shrink-0" />
                                <p>Section CTA hiển thị ở cuối trang contact với hình nền và các nút kêu gọi hành động.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border rounded-lg bg-card/50">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Tiêu đề CTA</label>
                                    <input
                                        type="text"
                                        value={ctaData.title || ''}
                                        onChange={(e) => setCtaData({ ...ctaData, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground font-bold"
                                        placeholder="Sẵn Sàng Đặt Món Ngay?"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Mô tả CTA</label>
                                    <textarea
                                        rows={3}
                                        value={ctaData.description || ''}
                                        onChange={(e) => setCtaData({ ...ctaData, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        placeholder="Gọi điện hoặc đến thăm chúng tôi để trải nghiệm hương vị tuyệt vời"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Hình nền (URL)</label>
                                    <input
                                        type="text"
                                        value={ctaData.image || ''}
                                        onChange={(e) => setCtaData({ ...ctaData, image: e.target.value })}
                                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        placeholder="https://... (URL hình nền cho section CTA)"
                                    />
                                    {ctaData.image && (
                                        <div className="mt-4 relative h-48 w-full rounded-lg overflow-hidden border border-border shadow-md">
                                            <img
                                                src={ctaData.image}
                                                alt="CTA Background Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL'}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-card-foreground mb-2">Nút Chính (Primary Button)</label>
                                        <input
                                            placeholder="Text (VD: Gọi Đặt Bàn)"
                                            value={ctaData.button_primary?.text || ''}
                                            onChange={(e) => setCtaData({ ...ctaData, button_primary: { ...ctaData.button_primary, text: e.target.value } })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground mb-2"
                                        />
                                        <input
                                            placeholder="Link (VD: tel:+84969606095)"
                                            value={ctaData.button_primary?.link || ''}
                                            onChange={(e) => setCtaData({ ...ctaData, button_primary: { ...ctaData.button_primary, link: e.target.value } })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-card-foreground mb-2">Nút Phụ (Secondary Button)</label>
                                        <input
                                            placeholder="Text (VD: Xem Thực Đơn)"
                                            value={ctaData.button_secondary?.text || ''}
                                            onChange={(e) => setCtaData({ ...ctaData, button_secondary: { ...ctaData.button_secondary, text: e.target.value } })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground mb-2"
                                        />
                                        <input
                                            placeholder="Link (VD: /menu)"
                                            value={ctaData.button_secondary?.link || ''}
                                            onChange={(e) => setCtaData({ ...ctaData, button_secondary: { ...ctaData.button_secondary, link: e.target.value } })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEO Tab */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-card-foreground mb-6">Cấu hình SEO</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Basic Meta</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-1">Meta Title</label>
                                        <p className="text-xs text-muted-foreground mb-1">Tiêu đề hiển thị trên tab trình duyệt và kết quả Google.</p>
                                        <input
                                            value={seoData.meta_title || ''}
                                            onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-1">Meta Description</label>
                                        <p className="text-xs text-muted-foreground mb-1">Mô tả ngắn gọn nội dung trang, xuất hiện dưới tiêu đề trên Google.</p>
                                        <textarea
                                            rows={3}
                                            value={seoData.meta_description || ''}
                                            onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-1">Meta Keywords</label>
                                        <p className="text-xs text-muted-foreground mb-1">Các từ khóa liên quan, phân cách bằng dấu phẩy.</p>
                                        <input
                                            value={seoData.meta_keywords || ''}
                                            onChange={(e) => setSeoData({ ...seoData, meta_keywords: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                            placeholder="keyword1, keyword2..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Open Graph (Facebook/Zalo)</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-1">OG Title</label>
                                        <p className="text-xs text-muted-foreground mb-1">Tiêu đề khi chia sẻ link lên Facebook/Zalo (thường giống Meta Title).</p>
                                        <input
                                            value={seoData.og_title || ''}
                                            onChange={(e) => setSeoData({ ...seoData, og_title: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-1">OG Description</label>
                                        <p className="text-xs text-muted-foreground mb-1">Mô tả khi chia sẻ link lên MXH.</p>
                                        <textarea
                                            rows={2}
                                            value={seoData.og_description || ''}
                                            onChange={(e) => setSeoData({ ...seoData, og_description: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-1">OG Image URL</label>
                                        <p className="text-xs text-muted-foreground mb-1">Link ảnh thumbnail khi chia sẻ (khuyên dùng tỉ lệ 1200x630).</p>
                                        <input
                                            value={seoData.og_image || ''}
                                            onChange={(e) => setSeoData({ ...seoData, og_image: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Twitter Card</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-1">Twitter Title</label>
                                        <input
                                            value={seoData.twitter_title || ''}
                                            onChange={(e) => setSeoData({ ...seoData, twitter_title: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-card-foreground mb-1">Twitter Description</label>
                                        <textarea
                                            rows={2}
                                            value={seoData.twitter_description || ''}
                                            onChange={(e) => setSeoData({ ...seoData, twitter_description: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Robots</h3>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={seoData.robots_index ?? true}
                                                onChange={(e) => setSeoData({ ...seoData, robots_index: e.target.checked })}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span>Index (Cho phép Google tìm thấy trang)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={seoData.robots_follow ?? true}
                                                onChange={(e) => setSeoData({ ...seoData, robots_follow: e.target.checked })}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span>Follow (Cho phép Google đi theo các link)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowResetModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset về mặc định
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Social Modal */}
            {showSocialModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div
                        ref={socialModalRef}
                        className="bg-background rounded-xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{editingSocial !== null ? 'Sửa Liên Kết' : 'Thêm Mạng Xã Hội'}</h3>
                            <button
                                onClick={() => {
                                    if (saving) return;
                                    setShowSocialModal(false);
                                    setEditingSocial(null);
                                }}
                                disabled={saving}
                                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên mạng xã hội</label>
                                <input
                                    type="text"
                                    value={socialForm.name}
                                    onChange={(e) => setSocialForm({ ...socialForm, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                    placeholder="Facebook, Zalo..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Icon</label>
                                <p className="text-xs text-muted-foreground mb-2">Chọn icon phổ biến hoặc nhập tên Icon từ thư viện Lucide</p>

                                {/* Common Icons Chips */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {COMMON_SOCIAL_ICONS.map(iconName => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setSocialForm({ ...socialForm, icon: iconName })}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${socialForm.icon === iconName
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-muted hover:bg-muted/80 border-transparent'
                                                }`}
                                        >
                                            {iconName}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            value={socialForm.icon}
                                            onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
                                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground font-mono text-sm"
                                            placeholder="Tên icon (VD: FacebookIcon, Globe...)"
                                        />
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                                        {(() => {
                                            try {
                                                const PreviewIcon = lucideIcons[socialForm.icon] || Globe;
                                                return <PreviewIcon className="w-5 h-5" />;
                                            } catch {
                                                return <AlertCircle className="w-5 h-5 text-red-500" />;
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">URL Liên kết</label>
                                <input
                                    type="text"
                                    value={socialForm.url}
                                    onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Mô tả ngắn</label>
                                <input
                                    type="text"
                                    value={socialForm.description}
                                    onChange={(e) => setSocialForm({ ...socialForm, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                                    placeholder="Theo dõi chúng tôi..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowSocialModal(false)}
                                className="px-4 py-2 rounded-lg hover:bg-muted font-medium transition-colors cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveSocial}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors cursor-pointer"
                            >
                                {editingSocial !== null ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div
                        ref={deleteModalRef}
                        className="bg-background rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200"
                    >
                        <div className="text-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Xác nhận xóa</h3>
                            <p className="text-sm text-muted-foreground mt-1">Bạn có chắc chắn muốn xóa liên kết này không? Hành động này không thể hoàn tác.</p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={saving}
                                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Không
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={saving}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Có, xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Modal */}
            {showResetModal && (
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
                                {TABS.map((tab) => {
                                    const sectionKey = tab.id;
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
                                                <span className="text-card-foreground font-medium">{tab.label}</span>
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
            )}
        </div>
    );
}
