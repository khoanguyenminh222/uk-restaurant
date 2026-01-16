export const runtime = 'edge';

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { useLandingConfig } from '@/hooks/useLandingConfig';
import Toast from '@/components/Toast/Toast';
import { defaultAboutConfig } from '@/lib/models/AboutConfig';
import {
  Settings, Save, RotateCcw, Loader2, X, Plus, Edit2, Trash2,
  ArrowUp, ArrowDown, BookOpen, Sparkles, Info, Users, Award,
  Heart, Star, ChefHat, Utensils, Clock, ArrowRight, Phone, Leaf,
  ChevronDown, CheckCircle2
} from 'lucide-react';
import * as lucideIcons from 'lucide-react';
import { adminFetch } from '@/lib/adminAuth';

// Helper function để chuyển đổi kebab-case sang PascalCase
const toPascalCase = (str) => {
  if (!str) return str;
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Helper function để kiểm tra icon có tồn tại trong lucide-react không
const isValidLucideIcon = (iconName) => {
  if (!iconName || typeof iconName !== 'string') return false;
  try {
    const variants = [
      iconName,
      toPascalCase(iconName),
      iconName + 'Icon',
      toPascalCase(iconName) + 'Icon',
    ];

    const uniqueVariants = [...new Set(variants)];

    let icon = null;
    for (const variant of uniqueVariants) {
      icon = lucideIcons[variant];
      if (icon) break;
    }

    if (!icon) return false;

    return icon && (
      typeof icon === 'function' ||
      (typeof icon === 'object' && icon.$$typeof) ||
      (typeof icon === 'object' && icon.default)
    );
  } catch (error) {
    return false;
  }
};

// Helper function để lấy icon component
const getLucideIcon = (iconName) => {
  if (!iconName || typeof iconName !== 'string') return null;
  try {
    const variants = [
      iconName,
      toPascalCase(iconName),
      iconName + 'Icon',
      toPascalCase(iconName) + 'Icon',
    ];

    const uniqueVariants = [...new Set(variants)];

    let icon = null;
    for (const variant of uniqueVariants) {
      icon = lucideIcons[variant];
      if (icon) break;
    }

    if (!icon) return null;

    if (typeof icon === 'object' && icon.default) {
      return icon.default;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) {
      return icon;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const TABS = [
  { id: 'hero', label: 'Hero', icon: Sparkles },
  { id: 'mission', label: 'Mission', icon: Info },
  { id: 'values', label: 'Values/Features', icon: Star },
  // Stats tab removed - using from whyChooseUs instead
  { id: 'team', label: 'Team', icon: Users },
  { id: 'cta', label: 'CTA', icon: ArrowRight },
  { id: 'seo', label: 'SEO', icon: Settings },
];

// Default icons
const FEATURE_ICONS = [
  'Leaf', 'ChefHat', 'Zap', 'Shield', 'Heart', 'Star', 'Award',
  'Clock', 'Truck', 'Users', 'ThumbsUp', 'Gift', 'TrendingUp', 'Sparkles'
];

const STAT_ICONS = [
  'Users', 'Star', 'Clock', 'Award', 'TrendingUp', 'Heart',
  'Zap', 'Shield', 'CheckCircle2', 'Gift', 'Truck', 'ThumbsUp'
];

const TEAM_ICONS = [
  'ChefHat', 'Users', 'Utensils', 'Award', 'Star', 'Heart'
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

export default function AdminAboutConfig() {
  const { isAuthorized, isChecking } = useRoleCheck(['admin', 'super_admin']);
  const { config: landingConfig } = useLandingConfig();

  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [toast, setToast] = useState({ message: '', isVisible: false });

  // Check if stats are using whyChooseUs from landing config
  const isUsingLandingStats = landingConfig?.whyChooseUs?.stats && landingConfig.whyChooseUs.stats.length > 0;

  // Form states
  const [heroData, setHeroData] = useState({
    badge: '',
    title: '',
    description: '',
    image: '',
    cta_primary: { text: '', link: '' },
    cta_secondary: { text: '', link: '' },
  });
  const [missionData, setMissionData] = useState({
    badge: '',
    title: '',
    description: '',
    image: '',
    items: [],
  });
  const [valuesData, setValuesData] = useState({
    title: '',
    description: '',
  });
  const [features, setFeatures] = useState([]);
  const [stats, setStats] = useState([]);
  const [teamData, setTeamData] = useState({
    title: '',
    description: '',
    members: [],
  });
  const [ctaData, setCtaData] = useState({
    title: '',
    description: '',
    button_primary: { text: '', link: '' },
    button_secondary: { text: '', link: '' },
  });
  const [seoData, setSeoData] = useState(defaultAboutConfig.seo);

  // Modal states
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [featureForm, setFeatureForm] = useState({
    title: '',
    description: '',
    icon: 'Leaf',
    color: 'from-green-500/20 to-emerald-600/10',
    borderColor: 'border-green-500/30',
    order: 1,
  });

  const [showStatModal, setShowStatModal] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [statForm, setStatForm] = useState({
    icon: 'Users',
    value: '',
    label: '',
    color: 'from-blue-500/20 to-blue-600/10',
  });

  const [showMissionItemModal, setShowMissionItemModal] = useState(false);
  const [editingMissionItem, setEditingMissionItem] = useState(null);
  const [missionItemForm, setMissionItemForm] = useState({
    icon: 'Award',
    title: '',
    description: '',
  });

  const [showTeamMemberModal, setShowTeamMemberModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [teamMemberForm, setTeamMemberForm] = useState({
    name: '',
    role: '',
    specialty: '',
    icon: 'ChefHat',
  });

  // Icon suggestions states
  const [featureIconSuggestions, setFeatureIconSuggestions] = useState([]);
  const [showFeatureIconDropdown, setShowFeatureIconDropdown] = useState(false);
  const [teamIconSuggestions, setTeamIconSuggestions] = useState([]);
  const [showTeamIconDropdown, setShowTeamIconDropdown] = useState(false);
  const [missionIconSuggestions, setMissionIconSuggestions] = useState([]);
  const [showMissionIconDropdown, setShowMissionIconDropdown] = useState(false);

  // Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSections, setResetSections] = useState({
    hero: false,
    mission: false,
    values: false,
    stats: false,
    team: false,
    cta: false,
    seo: false,
  });

  // Delete modal states
  const [showDeleteFeatureModal, setShowDeleteFeatureModal] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState(null);
  const [showDeleteMissionItemModal, setShowDeleteMissionItemModal] = useState(false);
  const [missionItemToDelete, setMissionItemToDelete] = useState(null);
  const [showDeleteTeamMemberModal, setShowDeleteTeamMemberModal] = useState(false);
  const [teamMemberToDelete, setTeamMemberToDelete] = useState(null);

  // Modal refs for click outside
  const featureModalRef = useRef(null);
  const statModalRef = useRef(null);
  const missionItemModalRef = useRef(null);
  const teamMemberModalRef = useRef(null);
  const resetModalRef = useRef(null);
  const deleteFeatureModalRef = useRef(null);
  const deleteMissionItemModalRef = useRef(null);
  const deleteTeamMemberModalRef = useRef(null);

  useEffect(() => {
    if (!isChecking) {
      fetchConfig();
    }
  }, [isChecking]);

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
      const res = await adminFetch('/api/config/about');
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        if (data.data.hero) setHeroData(data.data.hero);
        if (data.data.mission) setMissionData(data.data.mission);
        if (data.data.values) setValuesData(data.data.values);
        if (data.data.features) setFeatures(data.data.features || []);
        if (data.data.stats) setStats(data.data.stats || []);
        if (data.data.team) setTeamData(data.data.team);
        if (data.data.cta) setCtaData(data.data.cta);
        if (data.data.seo) {
          setSeoData({ ...defaultAboutConfig.seo, ...data.data.seo });
        } else {
          setSeoData(defaultAboutConfig.seo);
        }
      } else {
        showToast('Lỗi khi tải cấu hình', 'error');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      showToast('Lỗi khi tải cấu hình', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { message, type },
        })
      );
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData = {
        hero: heroData,
        mission: missionData,
        values: valuesData,
        features: features,
        stats: stats,
        team: teamData,
        cta: ctaData,
        seo: seoData,
      };

      const res = await adminFetch('/api/config/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Lưu thành công!', 'success');
        setConfig(data.data);
      } else {
        showToast(
          data.errors ? data.errors.join(', ') : (data.error || 'Lỗi khi lưu cấu hình'),
          'error'
        );
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showToast('Lỗi khi lưu cấu hình', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const sectionNames = {
      hero: 'Hero',
      mission: 'Mission',
      values: 'Values/Features',
      stats: 'Stats',
      team: 'Team',
      cta: 'CTA',
      seo: 'SEO',
    };

    // Kiểm tra xem có phần nào được chọn không
    const selectedSections = Object.entries(resetSections)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);

    if (selectedSections.length === 0) {
      showToast('Vui lòng chọn ít nhất một phần để reset', 'error');
      return;
    }

    try {
      setSaving(true);
      setShowResetModal(false);

      // Tạo object chứa các giá trị mặc định cho các phần được chọn
      const resetData = {};

      if (resetSections.hero) {
        resetData.hero = defaultAboutConfig.hero;
      }
      if (resetSections.mission) {
        resetData.mission = defaultAboutConfig.mission;
      }
      if (resetSections.values) {
        resetData.values = defaultAboutConfig.values;
        resetData.features = defaultAboutConfig.features;
      }
      if (resetSections.stats) {
        resetData.stats = defaultAboutConfig.stats;
      }
      if (resetSections.team) {
        resetData.team = defaultAboutConfig.team;
      }
      if (resetSections.cta) {
        resetData.cta = defaultAboutConfig.cta;
      }
      if (resetSections.seo) {
        resetData.seo = defaultAboutConfig.seo;
      }

      // Gửi request reset
      const res = await adminFetch('/api/config/about', {
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

        showToast(`Đã reset phần "${resetParts}" về giá trị mặc định!`, 'success');
        fetchConfig(); // Reload dữ liệu từ database
      } else {
        showToast(data.error || 'Lỗi khi reset', 'error');
      }
    } catch (error) {
      console.error('Error resetting config:', error);
      showToast('Lỗi khi reset', 'error');
    } finally {
      setSaving(false);
      setResetSections({
        hero: false,
        mission: false,
        values: false,
        stats: false,
        team: false,
        cta: false,
        seo: false,
      });
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
      if (showMissionItemModal && missionItemModalRef.current && !missionItemModalRef.current.contains(event.target)) {
        setShowMissionItemModal(false);
        setEditingMissionItem(null);
      }
      if (showTeamMemberModal && teamMemberModalRef.current && !teamMemberModalRef.current.contains(event.target)) {
        setShowTeamMemberModal(false);
        setEditingTeamMember(null);
      }
      if (showResetModal && resetModalRef.current && !resetModalRef.current.contains(event.target)) {
        setShowResetModal(false);
      }
      if (showDeleteFeatureModal && deleteFeatureModalRef.current && !deleteFeatureModalRef.current.contains(event.target)) {
        setShowDeleteFeatureModal(false);
        setFeatureToDelete(null);
      }
      if (showDeleteMissionItemModal && deleteMissionItemModalRef.current && !deleteMissionItemModalRef.current.contains(event.target)) {
        setShowDeleteMissionItemModal(false);
        setMissionItemToDelete(null);
      }
      if (showDeleteTeamMemberModal && deleteTeamMemberModalRef.current && !deleteTeamMemberModalRef.current.contains(event.target)) {
        setShowDeleteTeamMemberModal(false);
        setTeamMemberToDelete(null);
      }
    };

    const isAnyModalOpen = showFeatureModal || showStatModal || showMissionItemModal ||
      showTeamMemberModal || showResetModal || showDeleteFeatureModal ||
      showDeleteMissionItemModal || showDeleteTeamMemberModal;

    if (isAnyModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFeatureModal, showStatModal, showMissionItemModal, showTeamMemberModal, showResetModal,
    showDeleteFeatureModal, showDeleteMissionItemModal, showDeleteTeamMemberModal, saving]);

  // Handle scroll lock when any modal is open
  useEffect(() => {
    const isAnyModalOpen = showFeatureModal || showStatModal || showMissionItemModal ||
      showTeamMemberModal || showResetModal || showDeleteFeatureModal ||
      showDeleteMissionItemModal || showDeleteTeamMemberModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFeatureModal, showStatModal, showMissionItemModal, showTeamMemberModal, showResetModal,
    showDeleteFeatureModal, showDeleteMissionItemModal, showDeleteTeamMemberModal]);

  // Icon change handlers
  const handleFeatureIconChange = (value) => {
    setFeatureForm({ ...featureForm, icon: value });
    const filtered = FEATURE_ICONS.filter(icon =>
      icon.toLowerCase().includes(value.toLowerCase())
    );
    setFeatureIconSuggestions(filtered.length > 0 ? filtered : FEATURE_ICONS);
    setShowFeatureIconDropdown(true);
  };

  const handleTeamIconChange = (value) => {
    setTeamMemberForm({ ...teamMemberForm, icon: value });
    const filtered = TEAM_ICONS.filter(icon =>
      icon.toLowerCase().includes(value.toLowerCase())
    );
    setTeamIconSuggestions(filtered.length > 0 ? filtered : TEAM_ICONS);
    setShowTeamIconDropdown(true);
  };

  const handleMissionIconChange = (value) => {
    setMissionItemForm({ ...missionItemForm, icon: value });
    const filtered = FEATURE_ICONS.filter(icon =>
      icon.toLowerCase().includes(value.toLowerCase())
    );
    setMissionIconSuggestions(filtered.length > 0 ? filtered : FEATURE_ICONS);
    setShowMissionIconDropdown(true);
  };

  // Feature handlers
  const handleAddFeature = () => {
    setEditingFeature(null);
    setFeatureForm({
      title: '',
      description: '',
      icon: 'Leaf',
      color: 'from-green-500/20 to-emerald-600/10',
      borderColor: 'border-green-500/30',
      order: features.length + 1,
    });
    setShowFeatureModal(true);
  };

  const handleEditFeature = (index) => {
    setEditingFeature(index);
    setFeatureForm({ ...features[index] });
    setShowFeatureModal(true);
  };

  const handleSaveFeature = () => {
    if (!featureForm.title || !featureForm.description) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    const newFeatures = [...features];
    if (editingFeature !== null) {
      newFeatures[editingFeature] = { ...featureForm };
    } else {
      newFeatures.push({ ...featureForm });
    }
    setFeatures(newFeatures);
    setShowFeatureModal(false);
    setEditingFeature(null);
  };

  const handleDeleteFeature = (index) => {
    setFeatureToDelete(index);
    setShowDeleteFeatureModal(true);
  };

  const handleConfirmDeleteFeature = () => {
    if (featureToDelete !== null) {
      const newFeatures = features.filter((_, i) => i !== featureToDelete);
      setFeatures(newFeatures);
      setShowDeleteFeatureModal(false);
      setFeatureToDelete(null);
      showToast('Đã xóa feature', 'success');
    }
  };

  const handleMoveFeature = (index, direction) => {
    const newFeatures = [...features];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newFeatures.length) {
      [newFeatures[index], newFeatures[targetIndex]] = [newFeatures[targetIndex], newFeatures[index]];
      newFeatures[index].order = index + 1;
      newFeatures[targetIndex].order = targetIndex + 1;
      setFeatures(newFeatures);
    }
  };

  // Stat handlers
  const handleAddStat = () => {
    setEditingStat(null);
    setStatForm({
      icon: 'Users',
      value: '',
      label: '',
      color: 'from-blue-500/20 to-blue-600/10',
    });
    setShowStatModal(true);
  };

  const handleEditStat = (index) => {
    setEditingStat(index);
    setStatForm({ ...stats[index] });
    setShowStatModal(true);
  };

  const handleSaveStat = () => {
    if (!statForm.value || !statForm.label) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    const newStats = [...stats];
    if (editingStat !== null) {
      newStats[editingStat] = { ...statForm };
    } else {
      newStats.push({ ...statForm });
    }
    setStats(newStats);
    setShowStatModal(false);
    setEditingStat(null);
  };

  const handleDeleteStat = (index) => {
    // Stats không thể xóa nếu đang dùng từ landing config
    if (isUsingLandingStats) {
      showToast('Không thể xóa stats đang dùng từ Why Choose Us', 'error');
      return;
    }
    if (confirm('Bạn có chắc muốn xóa stat này?')) {
      const newStats = stats.filter((_, i) => i !== index);
      setStats(newStats);
    }
  };

  // Mission item handlers
  const handleAddMissionItem = () => {
    setEditingMissionItem(null);
    setMissionItemForm({
      icon: 'Award',
      title: '',
      description: '',
    });
    setShowMissionItemModal(true);
  };

  const handleEditMissionItem = (index) => {
    setEditingMissionItem(index);
    setMissionItemForm({ ...missionData.items[index] });
    setShowMissionItemModal(true);
  };

  const handleSaveMissionItem = () => {
    if (!missionItemForm.title || !missionItemForm.description) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    const newItems = [...missionData.items];
    if (editingMissionItem !== null) {
      newItems[editingMissionItem] = { ...missionItemForm };
    } else {
      newItems.push({ ...missionItemForm });
    }
    setMissionData({ ...missionData, items: newItems });
    setShowMissionItemModal(false);
    setEditingMissionItem(null);
  };

  const handleDeleteMissionItem = (index) => {
    setMissionItemToDelete(index);
    setShowDeleteMissionItemModal(true);
  };

  const handleConfirmDeleteMissionItem = () => {
    if (missionItemToDelete !== null) {
      const newItems = missionData.items.filter((_, i) => i !== missionItemToDelete);
      setMissionData({ ...missionData, items: newItems });
      setShowDeleteMissionItemModal(false);
      setMissionItemToDelete(null);
      showToast('Đã xóa mission item', 'success');
    }
  };

  // Team member handlers
  const handleAddTeamMember = () => {
    setEditingTeamMember(null);
    setTeamMemberForm({
      name: '',
      role: '',
      specialty: '',
      icon: 'ChefHat',
    });
    setShowTeamMemberModal(true);
  };

  const handleEditTeamMember = (index) => {
    setEditingTeamMember(index);
    setTeamMemberForm({ ...teamData.members[index] });
    setShowTeamMemberModal(true);
  };

  const handleSaveTeamMember = () => {
    if (!teamMemberForm.name || !teamMemberForm.role) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    const newMembers = [...teamData.members];
    if (editingTeamMember !== null) {
      newMembers[editingTeamMember] = { ...teamMemberForm };
    } else {
      newMembers.push({ ...teamMemberForm });
    }
    setTeamData({ ...teamData, members: newMembers });
    setShowTeamMemberModal(false);
    setEditingTeamMember(null);
  };

  const handleDeleteTeamMember = (index) => {
    setTeamMemberToDelete(index);
    setShowDeleteTeamMemberModal(true);
  };

  const handleConfirmDeleteTeamMember = () => {
    if (teamMemberToDelete !== null) {
      const newMembers = teamData.members.filter((_, i) => i !== teamMemberToDelete);
      setTeamData({ ...teamData, members: newMembers });
      setShowDeleteTeamMemberModal(false);
      setTeamMemberToDelete(null);
      showToast('Đã xóa thành viên', 'success');
    }
  };

  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-foreground">Cấu hình Trang About</h1>
          </div>
          <p className="text-muted-foreground">Quản lý tất cả nội dung text động trên trang About</p>
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

        {/* Tab Content */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-card-foreground mb-4">Hero Section</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Badge</label>
                <input
                  type="text"
                  value={heroData.badge}
                  onChange={(e) => setHeroData({ ...heroData, badge: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="🍽️ Khám Phá Câu Chuyện Của Chúng Tôi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={heroData.title}
                  onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Ẩm Thực Không Chỉ Là Thức Ăn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Description</label>
                <textarea
                  value={heroData.description}
                  onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Đó là một hành trình tình yêu, sáng tạo và đam mê..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Image URL</label>
                <input
                  type="text"
                  value={heroData.image || ''}
                  onChange={(e) => setHeroData({ ...heroData, image: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="https://example.com/image.jpg hoặc /images/hero.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Đường dẫn ảnh nền cho Hero section (URL đầy đủ hoặc đường dẫn tương đối)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">CTA Primary Text</label>
                  <input
                    type="text"
                    value={heroData.cta_primary?.text || ''}
                    onChange={(e) => setHeroData({
                      ...heroData,
                      cta_primary: { ...heroData.cta_primary, text: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                    placeholder="Khám Phá Thực Đơn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">CTA Primary Link</label>
                  <input
                    type="text"
                    value={heroData.cta_primary?.link || ''}
                    onChange={(e) => setHeroData({
                      ...heroData,
                      cta_primary: { ...heroData.cta_primary, link: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                    placeholder="/menu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">CTA Secondary Text</label>
                  <input
                    type="text"
                    value={heroData.cta_secondary?.text || ''}
                    onChange={(e) => setHeroData({
                      ...heroData,
                      cta_secondary: { ...heroData.cta_secondary, text: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                    placeholder="Liên Hệ Chúng Tôi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">CTA Secondary Link</label>
                  <input
                    type="text"
                    value={heroData.cta_secondary?.link || ''}
                    onChange={(e) => setHeroData({
                      ...heroData,
                      cta_secondary: { ...heroData.cta_secondary, link: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                    placeholder="#contact"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mission Tab */}
          {activeTab === 'mission' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-card-foreground mb-4">Mission Section</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Badge</label>
                <input
                  type="text"
                  value={missionData.badge}
                  onChange={(e) => setMissionData({ ...missionData, badge: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="✨ Sứ Mệnh Của Chúng Tôi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={missionData.title}
                  onChange={(e) => setMissionData({ ...missionData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Nấu Ăn Với Tâm Và Tay"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Description</label>
                <textarea
                  value={missionData.description}
                  onChange={(e) => setMissionData({ ...missionData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Tại nhà hàng chúng tôi..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Image URL</label>
                <input
                  type="text"
                  value={missionData.image || ''}
                  onChange={(e) => setMissionData({ ...missionData, image: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="https://example.com/image.jpg hoặc /images/mission.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Đường dẫn ảnh cho Mission section (URL đầy đủ hoặc đường dẫn tương đối). Ảnh sẽ hiển thị cùng với text.
                </p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">Mission Items</h3>
                <button
                  onClick={handleAddMissionItem}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Item
                </button>
              </div>
              <div className="space-y-2">
                {missionData.items?.map((item, index) => {
                  const Icon = getLucideIcon(item.icon) || Award;
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditMissionItem(index)}
                          className="p-2 hover:bg-muted rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMissionItem(index)}
                          className="p-2 hover:bg-muted rounded-lg text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Values/Features Tab */}
          {activeTab === 'values' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-card-foreground mb-4">Values Section</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={valuesData.title}
                  onChange={(e) => setValuesData({ ...valuesData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Những Giá Trị Cốt Lõi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Description</label>
                <textarea
                  value={valuesData.description}
                  onChange={(e) => setValuesData({ ...valuesData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Những nguyên tắc này hướng dẫn..."
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">Features</h3>
                <button
                  onClick={handleAddFeature}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Feature
                </button>
              </div>
              <div className="space-y-2">
                {features.map((feature, index) => {
                  const Icon = getLucideIcon(feature.icon) || Leaf;
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {index > 0 && (
                          <button
                            onClick={() => handleMoveFeature(index, 'up')}
                            className="p-2 hover:bg-muted rounded-lg cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        )}
                        {index < features.length - 1 && (
                          <button
                            onClick={() => handleMoveFeature(index, 'down')}
                            className="p-2 hover:bg-muted rounded-lg cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditFeature(index)}
                          className="p-2 hover:bg-muted rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFeature(index)}
                          className="p-2 hover:bg-muted rounded-lg text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-card-foreground mb-4">Team Section</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={teamData.title}
                  onChange={(e) => setTeamData({ ...teamData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Đội Ngũ Tài Năng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Description</label>
                <textarea
                  value={teamData.description}
                  onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Những người tài năng, đam mê..."
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">Team Members</h3>
                <button
                  onClick={handleAddTeamMember}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Thành Viên
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teamData.members?.map((member, index) => {
                  const Icon = getLucideIcon(member.icon) || ChefHat;
                  return (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-8 h-8 text-primary" />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditTeamMember(index)}
                            className="p-2 hover:bg-muted rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeamMember(index)}
                            className="p-2 hover:bg-muted rounded-lg text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="font-semibold text-card-foreground">{member.name}</p>
                      <p className="text-sm text-primary">{member.role}</p>
                      <p className="text-xs text-muted-foreground">{member.specialty}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA Tab */}
          {activeTab === 'cta' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-card-foreground mb-4">CTA Section</h2>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={ctaData.title}
                  onChange={(e) => setCtaData({ ...ctaData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Sẵn Sàng Trải Nghiệm Điều Kỳ Diệu?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Description</label>
                <textarea
                  value={ctaData.description}
                  onChange={(e) => setCtaData({ ...ctaData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Hãy đến thăm chúng tôi ngay hôm nay..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Image URL (Background)</label>
                <input
                  type="text"
                  value={ctaData.image || ''}
                  onChange={(e) => setCtaData({ ...ctaData, image: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="https://example.com/cta-bg.jpg hoặc /images/cta-bg.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ảnh nền cho CTA section. Nếu để trống sẽ hiển thị gradient mặc định.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Button Primary Text</label>
                  <input
                    type="text"
                    value={ctaData.button_primary?.text || ''}
                    onChange={(e) => setCtaData({
                      ...ctaData,
                      button_primary: { ...ctaData.button_primary, text: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                    placeholder="Xem Thực Đơn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Button Primary Link</label>
                  <input
                    type="text"
                    value={ctaData.button_primary?.link || ''}
                    onChange={(e) => setCtaData({
                      ...ctaData,
                      button_primary: { ...ctaData.button_primary, link: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                    placeholder="/menu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Button Secondary Text</label>
                  <input
                    type="text"
                    value={ctaData.button_secondary?.text || ''}
                    onChange={(e) => setCtaData({
                      ...ctaData,
                      button_secondary: { ...ctaData.button_secondary, text: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                    placeholder="Gọi Đặt Bàn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Button Secondary Link</label>
                  <input
                    type="text"
                    value={ctaData.button_secondary?.link || ''}
                    onChange={(e) => setCtaData({
                      ...ctaData,
                      button_secondary: { ...ctaData.button_secondary, link: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                    placeholder="tel:+84123456789"
                  />
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
                    placeholder="Về Chúng Tôi - Nhà Hàng UK Restaurant"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(seoData.meta_title || '').length}/100 ký tự. Tiêu đề hiển thị trên tab trình duyệt và kết quả tìm kiếm Google.
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
                    placeholder="Mô tả ngắn gọn về trang About (150-160 ký tự là lý tưởng)"
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
                    placeholder="về chúng tôi, giới thiệu, nhà hàng uk, đội ngũ, sứ mệnh"
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
                      Chọn "Website" cho trang About
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

      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={featureModalRef}
            className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-card-foreground">
                {editingFeature !== null ? 'Chỉnh sửa Feature' : 'Thêm Feature mới'}
              </h3>
              <button
                onClick={() => {
                  if (saving) return;
                  setShowFeatureModal(false);
                  setEditingFeature(null);
                }}
                disabled={saving}
                className="p-2 hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={featureForm.title}
                  onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Description</label>
                <textarea
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Icon</label>
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
                            setShowFeatureIconDropdown(true);
                          } else {
                            setFeatureIconSuggestions(FEATURE_ICONS);
                            setShowFeatureIconDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowFeatureIconDropdown(false), 200);
                        }}
                        placeholder="Nhập tên icon (ví dụ: Leaf, Zap, Heart...)"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {showFeatureIconDropdown && featureIconSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {featureIconSuggestions.map((icon) => {
                            const IconComponent = getLucideIcon(icon) || Leaf;
                            return (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => {
                                  setFeatureForm({ ...featureForm, icon });
                                  setShowFeatureIconDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted text-left text-sm text-card-foreground cursor-pointer"
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
                            return <IconComponent className="w-6 h-6 text-primary" />;
                          }
                        } catch (e) {
                          console.error('Error rendering icon:', e);
                        }
                        return <Leaf className="w-6 h-6 text-muted-foreground" />;
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
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Xem tất cả icons →
                    </a>
                  </div>
                </div>
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
                  <div className="grid grid-cols-6 gap-2">
                    {FEATURE_COLORS.map((colorOption, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFeatureForm({ ...featureForm, color: colorOption.color, borderColor: colorOption.borderColor })}
                        className={`h-10 rounded border-2 cursor-pointer ${featureForm.color === colorOption.color ? 'border-primary' : 'border-border'
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
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Order</label>
                <input
                  type="number"
                  value={featureForm.order}
                  onChange={(e) => setFeatureForm({ ...featureForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowFeatureModal(false); setEditingFeature(null); }}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveFeature}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat Modal */}
      {showStatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={statModalRef}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-card-foreground">
                {editingStat !== null ? 'Chỉnh sửa Stat' : 'Thêm Stat mới'}
              </h3>
              <button
                onClick={() => {
                  if (saving) return;
                  setShowStatModal(false);
                  setEditingStat(null);
                }}
                disabled={saving}
                className="p-2 hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Icon</label>
                <select
                  value={statForm.icon}
                  onChange={(e) => setStatForm({ ...statForm, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                >
                  {STAT_ICONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Value</label>
                <input
                  type="text"
                  value={statForm.value}
                  onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="10,000+"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Label</label>
                <input
                  type="text"
                  value={statForm.label}
                  onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                  placeholder="Khách hàng tin tưởng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Color</label>
                <select
                  value={statForm.color}
                  onChange={(e) => setStatForm({ ...statForm, color: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                >
                  {STAT_COLORS.map((color, index) => (
                    <option key={index} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowStatModal(false); setEditingStat(null); }}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveStat}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission Item Modal */}
      {showMissionItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={missionItemModalRef}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-card-foreground">
                {editingMissionItem !== null ? 'Chỉnh sửa Mission Item' : 'Thêm Mission Item mới'}
              </h3>
              <button
                onClick={() => {
                  if (saving) return;
                  setShowMissionItemModal(false);
                  setEditingMissionItem(null);
                }}
                disabled={saving}
                className="p-2 hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Icon</label>
                <div className="space-y-2">
                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={missionItemForm.icon}
                        onChange={(e) => handleMissionIconChange(e.target.value)}
                        onFocus={() => {
                          if (missionItemForm.icon) {
                            const filtered = FEATURE_ICONS.filter(icon =>
                              icon.toLowerCase().includes(missionItemForm.icon.toLowerCase())
                            );
                            setMissionIconSuggestions(filtered.length > 0 ? filtered : FEATURE_ICONS);
                            setShowMissionIconDropdown(true);
                          } else {
                            setMissionIconSuggestions(FEATURE_ICONS);
                            setShowMissionIconDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowMissionIconDropdown(false), 200);
                        }}
                        placeholder="Nhập tên icon (ví dụ: Award, Globe, Clock...)"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {showMissionIconDropdown && missionIconSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {missionIconSuggestions.map((icon) => {
                            const IconComponent = getLucideIcon(icon) || Award;
                            return (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => {
                                  setMissionItemForm({ ...missionItemForm, icon });
                                  setShowMissionIconDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted text-left text-sm text-card-foreground cursor-pointer"
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
                      {missionItemForm.icon && (() => {
                        try {
                          const IconComponent = getLucideIcon(missionItemForm.icon);
                          if (IconComponent) {
                            return <IconComponent className="w-6 h-6 text-primary" />;
                          }
                        } catch (e) {
                          console.error('Error rendering icon:', e);
                        }
                        return <Award className="w-6 h-6 text-muted-foreground" />;
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {missionItemForm.icon && isValidLucideIcon(missionItemForm.icon) ? (
                        <span className="text-green-400">✓ Icon hợp lệ</span>
                      ) : missionItemForm.icon ? (
                        <span className="text-red-400">✗ Icon không tồn tại</span>
                      ) : (
                        'Xem trước icon'
                      )}
                    </p>
                    <a
                      href="https://lucide.dev/icons"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Xem tất cả icons →
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={missionItemForm.title}
                  onChange={(e) => setMissionItemForm({ ...missionItemForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Description</label>
                <textarea
                  value={missionItemForm.description}
                  onChange={(e) => setMissionItemForm({ ...missionItemForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowMissionItemModal(false); setEditingMissionItem(null); }}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveMissionItem}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Member Modal */}
      {showTeamMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={teamMemberModalRef}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-card-foreground">
                {editingTeamMember !== null ? 'Chỉnh sửa Thành viên' : 'Thêm Thành viên mới'}
              </h3>
              <button
                onClick={() => {
                  if (saving) return;
                  setShowTeamMemberModal(false);
                  setEditingTeamMember(null);
                }}
                disabled={saving}
                className="p-2 hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Icon</label>
                <div className="space-y-2">
                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={teamMemberForm.icon}
                        onChange={(e) => handleTeamIconChange(e.target.value)}
                        onFocus={() => {
                          if (teamMemberForm.icon) {
                            const filtered = TEAM_ICONS.filter(icon =>
                              icon.toLowerCase().includes(teamMemberForm.icon.toLowerCase())
                            );
                            setTeamIconSuggestions(filtered.length > 0 ? filtered : TEAM_ICONS);
                            setShowTeamIconDropdown(true);
                          } else {
                            setTeamIconSuggestions(TEAM_ICONS);
                            setShowTeamIconDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowTeamIconDropdown(false), 200);
                        }}
                        placeholder="Nhập tên icon (ví dụ: ChefHat, Users, Utensils...)"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {showTeamIconDropdown && teamIconSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {teamIconSuggestions.map((icon) => {
                            const IconComponent = getLucideIcon(icon) || ChefHat;
                            return (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => {
                                  setTeamMemberForm({ ...teamMemberForm, icon });
                                  setShowTeamIconDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted text-left text-sm text-card-foreground cursor-pointer"
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
                      {teamMemberForm.icon && (() => {
                        try {
                          const IconComponent = getLucideIcon(teamMemberForm.icon);
                          if (IconComponent) {
                            return <IconComponent className="w-6 h-6 text-primary" />;
                          }
                        } catch (e) {
                          console.error('Error rendering icon:', e);
                        }
                        return <ChefHat className="w-6 h-6 text-muted-foreground" />;
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {teamMemberForm.icon && isValidLucideIcon(teamMemberForm.icon) ? (
                        <span className="text-green-400">✓ Icon hợp lệ</span>
                      ) : teamMemberForm.icon ? (
                        <span className="text-red-400">✗ Icon không tồn tại</span>
                      ) : (
                        'Xem trước icon'
                      )}
                    </p>
                    <a
                      href="https://lucide.dev/icons"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Xem tất cả icons →
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Name</label>
                <input
                  type="text"
                  value={teamMemberForm.name}
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Role</label>
                <input
                  type="text"
                  value={teamMemberForm.role}
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, role: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Specialty</label>
                <input
                  type="text"
                  value={teamMemberForm.specialty}
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, specialty: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowTeamMemberModal(false); setEditingTeamMember(null); }}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-card-foreground rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveTeamMember}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded-lg cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Feature Modal */}
      {showDeleteFeatureModal && featureToDelete !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={deleteFeatureModalRef}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-card-foreground">
                Xác nhận xóa Feature
              </h3>
              <button
                onClick={() => {
                  if (saving) return;
                  setShowDeleteFeatureModal(false);
                  setFeatureToDelete(null);
                }}
                disabled={saving}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Bạn có chắc muốn xóa feature <strong>{features[featureToDelete]?.title}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteFeatureModal(false);
                    setFeatureToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDeleteFeature}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Mission Item Modal */}
      {showDeleteMissionItemModal && missionItemToDelete !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={deleteMissionItemModalRef}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-card-foreground">
                Xác nhận xóa Mission Item
              </h3>
              <button
                onClick={() => {
                  if (saving) return;
                  setShowDeleteMissionItemModal(false);
                  setMissionItemToDelete(null);
                }}
                disabled={saving}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Bạn có chắc muốn xóa mission item <strong>{missionData.items[missionItemToDelete]?.title}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteMissionItemModal(false);
                    setMissionItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDeleteMissionItem}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Team Member Modal */}
      {showDeleteTeamMemberModal && teamMemberToDelete !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div
            ref={deleteTeamMemberModalRef}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-card-foreground">
                Xác nhận xóa Thành viên
              </h3>
              <button
                onClick={() => {
                  if (saving) return;
                  setShowDeleteTeamMemberModal(false);
                  setTeamMemberToDelete(null);
                }}
                disabled={saving}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Bạn có chắc muốn xóa thành viên <strong>{teamData.members[teamMemberToDelete]?.name}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteTeamMemberModal(false);
                    setTeamMemberToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDeleteTeamMember}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
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
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-20"
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

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
