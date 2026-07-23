import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Download,
  Trash2,
  QrCode as QrIcon,
  RefreshCw,
  Search,
  Globe,
  Sparkles,
  Star,
  History,
  Send,
  Smartphone,
  Smile,
  Info,
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Palette
} from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';
import {
  copyToClipboard,
  triggerConfetti,
  getFavoriteToolIds,
  toggleFavoriteTool,
  trackRecentlyUsedTool,
} from '../lib/utils';

interface CountryData {
  code: string;
  name: string;
  ddi: string;
  flag: string;
  placeholder: string;
  sampleDigits: string;
}

const COUNTRIES: CountryData[] = [
  { code: 'BR', name: 'Brazil', ddi: '55', flag: '🇧🇷', placeholder: '(11) 99999-9999', sampleDigits: '11999999999' },
  { code: 'US', name: 'United States / Canada', ddi: '1', flag: '🇺🇸', placeholder: '(555) 000-0000', sampleDigits: '2025550143' },
  { code: 'ES', name: 'Spain', ddi: '34', flag: '🇪🇸', placeholder: '612 34 56 78', sampleDigits: '612345678' },
  { code: 'PT', name: 'Portugal', ddi: '351', flag: '🇵🇹', placeholder: '912 345 678', sampleDigits: '912345678' },
  { code: 'MX', name: 'Mexico', ddi: '52', flag: '🇲🇽', placeholder: '55 1234 5678', sampleDigits: '5512345678' },
  { code: 'AR', name: 'Argentina', ddi: '54', flag: '🇦🇷', placeholder: '9 11 1234-5678', sampleDigits: '91112345678' },
  { code: 'CO', name: 'Colombia', ddi: '57', flag: '🇨🇴', placeholder: '300 123 4567', sampleDigits: '3001234567' },
  { code: 'CL', name: 'Chile', ddi: '56', flag: '🇨🇱', placeholder: '9 1234 5678', sampleDigits: '912345678' },
  { code: 'PE', name: 'Peru', ddi: '51', flag: '🇵🇪', placeholder: '912 345 678', sampleDigits: '912345678' },
  { code: 'GB', name: 'United Kingdom', ddi: '44', flag: '🇬🇧', placeholder: '07123 456789', sampleDigits: '7123456789' },
  { code: 'DE', name: 'Germany', ddi: '49', flag: '🇩🇪', placeholder: '0151 12345678', sampleDigits: '15112345678' },
  { code: 'FR', name: 'France', ddi: '33', flag: '🇫🇷', placeholder: '06 12 34 56 78', sampleDigits: '612345678' },
  { code: 'IT', name: 'Italy', ddi: '39', flag: '🇮🇹', placeholder: '312 345 6789', sampleDigits: '3123456789' },
  { code: 'IN', name: 'India', ddi: '91', flag: '🇮🇳', placeholder: '98765 43210', sampleDigits: '9876543210' },
  { code: 'JP', name: 'Japan', ddi: '81', flag: '🇯🇵', placeholder: '090-1234-5678', sampleDigits: '9012345678' },
  { code: 'AU', name: 'Australia', ddi: '61', flag: '🇦🇺', placeholder: '0412 345 678', sampleDigits: '412345678' },
  { code: 'AE', name: 'United Arab Emirates', ddi: '971', flag: '🇦🇪', placeholder: '50 123 4567', sampleDigits: '501234567' },
  { code: 'AO', name: 'Angola', ddi: '244', flag: '🇦🇴', placeholder: '912 345 678', sampleDigits: '912345678' },
  { code: 'MZ', name: 'Mozambique', ddi: '258', flag: '🇲🇿', placeholder: '82 123 4567', sampleDigits: '821234567' },
  { code: 'UY', name: 'Uruguay', ddi: '598', flag: '🇺🇾', placeholder: '099 123 456', sampleDigits: '99123456' },
  { code: 'EC', name: 'Ecuador', ddi: '593', flag: '🇪🇨', placeholder: '099 123 4567', sampleDigits: '991234567' },
  { code: 'VE', name: 'Venezuela', ddi: '58', flag: '🇻🇪', placeholder: '0412 1234567', sampleDigits: '4121234567' },
  { code: 'PY', name: 'Paraguay', ddi: '595', flag: '🇵🇾', placeholder: '0981 123456', sampleDigits: '981123456' },
  { code: 'BO', name: 'Bolivia', ddi: '591', flag: '🇧🇴', placeholder: '71234567', sampleDigits: '71234567' },
  { code: 'CR', name: 'Costa Rica', ddi: '506', flag: '🇨🇷', placeholder: '8123 4567', sampleDigits: '81234567' },
  { code: 'DO', name: 'Dominican Republic', ddi: '1', flag: '🇩🇴', placeholder: '(809) 123-4567', sampleDigits: '8091234567' },
  { code: 'GT', name: 'Guatemala', ddi: '502', flag: '🇬🇹', placeholder: '5123 4567', sampleDigits: '51234567' },
  { code: 'HN', name: 'Honduras', ddi: '504', flag: '🇭🇳', placeholder: '9123-4567', sampleDigits: '91234567' },
  { code: 'SV', name: 'El Salvador', ddi: '503', flag: '🇸🇻', placeholder: '7123 4567', sampleDigits: '71234567' },
  { code: 'PA', name: 'Panama', ddi: '507', flag: '🇵🇦', placeholder: '6123-4567', sampleDigits: '61234567' },
  { code: 'NL', name: 'Netherlands', ddi: '31', flag: '🇳🇱', placeholder: '06 12345678', sampleDigits: '612345678' },
  { code: 'CH', name: 'Switzerland', ddi: '41', flag: '🇨🇭', placeholder: '079 123 45 67', sampleDigits: '791234567' },
  { code: 'SE', name: 'Sweden', ddi: '46', flag: '🇸🇪', placeholder: '070 123 45 67', sampleDigits: '701234567' },
  { code: 'NO', name: 'Norway', ddi: '47', flag: '🇳🇴', placeholder: '412 34 567', sampleDigits: '41234567' },
  { code: 'DK', name: 'Denmark', ddi: '45', flag: '🇩🇰', placeholder: '12 34 56 78', sampleDigits: '12345678' },
  { code: 'PL', name: 'Poland', ddi: '48', flag: '🇵🇱', placeholder: '512 345 678', sampleDigits: '512345678' },
  { code: 'TR', name: 'Turkey', ddi: '90', flag: '🇹🇷', placeholder: '512 345 67 89', sampleDigits: '5123456789' },
  { code: 'SA', name: 'Saudi Arabia', ddi: '966', flag: '🇸🇦', placeholder: '51 234 5678', sampleDigits: '512345678' },
  { code: 'ZA', name: 'South Africa', ddi: '27', flag: '🇿🇦', placeholder: '071 234 5678', sampleDigits: '712345678' },
  { code: 'KR', name: 'South Korea', ddi: '82', flag: '🇰🇷', placeholder: '010-1234-5678', sampleDigits: '1012345678' },
  { code: 'CN', name: 'China', ddi: '86', flag: '🇨🇳', placeholder: '138 1234 5678', sampleDigits: '13812345678' },
];

const EMOJI_LIST = [
  '😀', '👋', '🛒', '💬', '📅', '🏷️', '🎁', '🚀', '💡', '📞',
  '📍', '💳', '❓', '🤝', '✍️', '⭐', '🏢', '📌', '🔥', '✅',
  '🎯', '📧', '📦', '⏰', '✨', '💼', '📊', '🎉', '🏷️', '❤️'
];

interface HistoryItem {
  id: string;
  countryCode: string;
  ddi: string;
  phone: string;
  fullPhone: string;
  message: string;
  shortUrl: string;
  apiUrl: string;
  timestamp: number;
}

const HISTORY_KEY = 'nuvoratools_wa_link_history';

export default function WhatsAppLinkGenerator() {
  const { t } = useTranslation();

  // State
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Link format selection ('wa.me' or 'api')
  const [linkFormat, setLinkFormat] = useState<'wame' | 'api'>('wame');

  // Copy status indicators
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedApiLink, setCopiedApiLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedQrCode, setCopiedQrCode] = useState(false);

  // QR Code Styling
  const [qrFgColor, setQrFgColor] = useState('#0f172a');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(260);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Track tool usage on mount
  useEffect(() => {
    trackRecentlyUsedTool('whatsapp-link-generator');
    const favs = getFavoriteToolIds();
    setIsFavorite(favs.includes('whatsapp-link-generator'));

    // Load history
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleToggleFavorite = () => {
    const updated = toggleFavoriteTool('whatsapp-link-generator');
    setIsFavorite(updated.includes('whatsapp-link-generator'));
  };

  // Clean phone digits only
  const cleanPhoneDigits = useMemo(() => {
    return phoneNumber.replace(/\D/g, '');
  }, [phoneNumber]);

  // Combined full phone number with DDI
  const fullPhoneNumber = useMemo(() => {
    const ddiClean = selectedCountry.ddi.replace(/\D/g, '');
    return cleanPhoneDigits ? `${ddiClean}${cleanPhoneDigits}` : '';
  }, [selectedCountry, cleanPhoneDigits]);

  // Validate phone digit count
  const isValidPhone = useMemo(() => {
    return cleanPhoneDigits.length >= 7 && cleanPhoneDigits.length <= 15;
  }, [cleanPhoneDigits]);

  // Formatted WhatsApp URLs
  const encodedText = useMemo(() => {
    return encodeURIComponent(message);
  }, [message]);

  const waMeLink = useMemo(() => {
    if (!fullPhoneNumber) return 'https://wa.me/';
    return encodedText
      ? `https://wa.me/${fullPhoneNumber}?text=${encodedText}`
      : `https://wa.me/${fullPhoneNumber}`;
  }, [fullPhoneNumber, encodedText]);

  const apiLink = useMemo(() => {
    if (!fullPhoneNumber) return 'https://api.whatsapp.com/send';
    return encodedText
      ? `https://api.whatsapp.com/send?phone=${fullPhoneNumber}&text=${encodedText}`
      : `https://api.whatsapp.com/send?phone=${fullPhoneNumber}`;
  }, [fullPhoneNumber, encodedText]);

  const primaryLink = linkFormat === 'wame' ? waMeLink : apiLink;

  // Generate QR Code on Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const targetUrl = primaryLink || 'https://wa.me/';

    QRCode.toCanvas(
      canvasRef.current,
      targetUrl,
      {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrFgColor,
          light: qrBgColor,
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) console.error(err);
      }
    );
  }, [primaryLink, qrFgColor, qrBgColor, qrSize]);

  // Filter countries for search dropdown
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.ddi.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  // Actions
  const handleCopyLink = async (url: string, type: 'primary' | 'api' = 'primary') => {
    const success = await copyToClipboard(url);
    if (success) {
      if (type === 'primary') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedApiLink(true);
        setTimeout(() => setCopiedApiLink(false), 2000);
      }
      triggerConfetti();
      saveToHistory();
    }
  };

  const handleCopyMessage = async () => {
    if (!message) return;
    const success = await copyToClipboard(message);
    if (success) {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!fullPhoneNumber) return;
    window.open(primaryLink, '_blank', 'noopener,noreferrer');
    saveToHistory();
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('wa.shareTitle', 'WhatsApp Chat Link'),
          text: message || t('wa.shareDesc', 'Contact me on WhatsApp'),
          url: primaryLink,
        });
        saveToHistory();
        return;
      } catch {
        // User cancelled or share failed
      }
    }
    handleCopyLink(primaryLink);
  };

  const saveToHistory = useCallback(() => {
    if (!fullPhoneNumber) return;

    const newItem: HistoryItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      countryCode: selectedCountry.code,
      ddi: selectedCountry.ddi,
      phone: phoneNumber,
      fullPhone: fullPhoneNumber,
      message,
      shortUrl: waMeLink,
      apiUrl: apiLink,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((item) => item.fullPhone !== fullPhoneNumber || item.message !== message);
      const updated = [newItem, ...filtered].slice(0, 15);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, [fullPhoneNumber, selectedCountry, phoneNumber, message, waMeLink, apiLink]);

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    const foundCountry = COUNTRIES.find((c) => c.code === item.countryCode) || COUNTRIES[0];
    setSelectedCountry(foundCountry);
    setPhoneNumber(item.phone);
    setMessage(item.message);
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `whatsapp_qr_${fullPhoneNumber || 'link'}.png`;
    link.click();
    triggerConfetti();
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(primaryLink, {
        type: 'svg',
        margin: 2,
        color: {
          dark: qrFgColor,
          light: qrBgColor,
        },
        errorCorrectionLevel: 'M',
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp_qr_${fullPhoneNumber || 'link'}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      triggerConfetti();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const handleLoadExample = () => {
    setSelectedCountry(COUNTRIES[0]); // Brazil
    setPhoneNumber('11988887777');
    setMessage(t('wa.presetExampleMsg', 'Hi! I saw your website and would like to request a quote for your services. 😀'));
  };

  const handleClearForm = () => {
    setPhoneNumber('');
    setMessage('');
  };

  // Preset templates
  const presets = [
    {
      label: t('wa.presetSupport', 'Customer Support'),
      text: t('wa.presetSupportText', 'Hello! I need assistance with my recent order.'),
    },
    {
      label: t('wa.presetSales', 'Sales & Quote'),
      text: t('wa.presetSalesText', 'Hi there! I would like to request a price quote for your products.'),
    },
    {
      label: t('wa.presetBooking', 'Appointment Booking'),
      text: t('wa.presetBookingText', 'Hello! I would like to schedule an appointment.'),
    },
    {
      label: t('wa.presetGeneral', 'General Inquiry'),
      text: t('wa.presetGeneralText', 'Hi! I have a quick question regarding your services.'),
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Tool Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                {t('badge.utility', 'Utility')}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/30 text-xs font-semibold text-emerald-200">
                100% Client-Side
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('tool.whatsapp-link-generator.title', 'WhatsApp Link Generator')}
            </h1>
            <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
              {t('tool.whatsapp-link-generator.desc', 'Create custom official wa.me WhatsApp direct chat links with custom phone numbers, pre-filled messages, flags, and downloadable QR codes.')}
            </p>
          </div>

          <button
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
              isFavorite
                ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-950' : ''}`} />
            {isFavorite ? t('wa.inFavorites', 'In Favorites') : t('wa.addFavorite', 'Add to Favorites')}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Preview & QR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                {t('wa.formTitle', 'Phone & Message Configuration')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadExample}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {t('wa.loadExample', 'Load Demo')}
                </button>
                <button
                  onClick={handleClearForm}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t('wa.clear', 'Clear')}
                </button>
              </div>
            </div>

            {/* Country & Phone Number Inputs */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('wa.phoneLabel', 'Country Code & Phone Number')} *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Country Selector Button (4 cols on sm) */}
                <div className="sm:col-span-5 relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-left flex items-center justify-between hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-xs text-slate-900 dark:text-white"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-base">{selectedCountry.flag}</span>
                      <span className="font-bold">+{selectedCountry.ddi}</span>
                      <span className="text-slate-500 dark:text-slate-400 truncate">
                        ({selectedCountry.code})
                      </span>
                    </span>
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {/* Country Dropdown Modal/Popover */}
                  {isCountryDropdownOpen && (
                    <div className="absolute z-30 top-12 left-0 right-0 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder={t('wa.searchCountry', 'Search country or DDI...')}
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="max-h-52 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsCountryDropdownOpen(false);
                              setCountrySearch('');
                            }}
                            className={`w-full px-3 py-2 text-left rounded-lg text-xs flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors ${
                              selectedCountry.code === c.code
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span>{c.name}</span>
                            </span>
                            <span className="font-mono text-slate-400">+{c.ddi}</span>
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <p className="text-center py-4 text-xs text-slate-400">
                            {t('wa.noCountriesFound', 'No countries match search')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Input (7 cols on sm) */}
                <div className="sm:col-span-7 relative">
                  <input
                    type="tel"
                    placeholder={selectedCountry.placeholder}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                  {phoneNumber && (
                    <div className="absolute right-3 top-3">
                      {isValidPhone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {t('wa.fullTarget', 'Full DDI Target')}:{' '}
                  <strong className="font-mono text-slate-700 dark:text-slate-300">
                    +{fullPhoneNumber || `${selectedCountry.ddi}...`}
                  </strong>
                </span>

                {cleanPhoneDigits && (
                  <span
                    className={`font-semibold ${
                      isValidPhone ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isValidPhone
                      ? t('wa.validPhone', 'Valid number format ✓')
                      : t('wa.invalidPhone', 'Check digit count (7-15 digits)')}
                  </span>
                )}
              </div>
            </div>

            {/* Custom Pre-filled Message Textarea */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('wa.messageLabel', 'Pre-filled Custom Message')}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-600 dark:text-slate-300 transition-colors text-xs flex items-center gap-1 font-semibold"
                  >
                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                    {t('wa.emojis', 'Emojis')}
                  </button>

                  {message && (
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-xs flex items-center gap-1 font-semibold"
                    >
                      {copiedMessage ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {t('wa.copied', 'Copied')}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          {t('wa.copyMsgOnly', 'Copy Message')}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-10 gap-1.5 text-center">
                  {EMOJI_LIST.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-white dark:hover:bg-slate-700"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <textarea
                  ref={messageInputRef}
                  rows={4}
                  placeholder={t('wa.messagePlaceholder', 'Type the automated message your recipient will see pre-filled in their WhatsApp text box...')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Character & Word Counters */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span>
                    {t('wa.charCount', 'Characters')}:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">{message.length}</strong>
                  </span>
                  <span>
                    {t('wa.wordCount', 'Words')}:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {message.trim() ? message.trim().split(/\s+/).length : 0}
                    </strong>
                  </span>
                </div>
                <span>
                  {message.length > 1000 ? (
                    <span className="text-amber-500 font-semibold">{t('wa.longMsgNotice', 'Long text (WhatsApp compatible)')}</span>
                  ) : (
                    <span>100% encoded for wa.me</span>
                  )}
                </span>
              </div>

              {/* Quick Preset Message Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase text-slate-400">
                  {t('wa.presetsTitle', 'Quick Message Templates')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessage(p.text)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-all"
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('wa.actionsTitle', 'Generated Link Actions')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Copy Primary Link */}
              <button
                type="button"
                onClick={() => handleCopyLink(primaryLink, 'primary')}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('wa.copiedLink', 'Link Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('wa.copyLink', 'Copy WhatsApp Link')}
                  </>
                )}
              </button>

              {/* Open in WhatsApp */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                disabled={!fullPhoneNumber}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                {t('wa.openWhatsApp', 'Open in WhatsApp')}
              </button>

              {/* Share Link */}
              <button
                type="button"
                onClick={handleShareLink}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4 text-emerald-500" />
                {t('wa.share', 'Share Link')}
              </button>
            </div>

            {/* Display Generated Links */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Format Toggle */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('wa.generatedUrl', 'Generated URL')}
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLinkFormat('wame')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                      linkFormat === 'wame'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    wa.me
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkFormat('api')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                      linkFormat === 'api'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    api.whatsapp.com
                  </button>
                </div>
              </div>

              {/* Link Input Display Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-emerald-700 dark:text-emerald-400 break-all select-all flex items-center justify-between gap-2">
                <span className="truncate">{primaryLink}</span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(primaryLink, 'primary')}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 shrink-0"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Secondary Link Option */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {t('wa.altFormat', 'Alternative format')}:{' '}
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {linkFormat === 'wame' ? apiLink : waMeLink}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(linkFormat === 'wame' ? apiLink : waMeLink, 'api')}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline shrink-0"
                >
                  {copiedApiLink ? t('wa.copied', 'Copied') : t('wa.copyAlt', 'Copy Alt Link')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Preview & QR Code (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Chat Bubble Preview Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              {t('wa.chatPreviewTitle', 'WhatsApp Chat Preview')}
            </h3>

            {/* Simulated WhatsApp Phone Frame */}
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 text-white overflow-hidden shadow-md">
              {/* WhatsApp Header */}
              <div className="bg-emerald-700 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-900 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-200">
                  {selectedCountry.flag}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">
                    +{fullPhoneNumber || `${selectedCountry.ddi} ...`}
                  </h4>
                  <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t('wa.directLinkActive', 'WhatsApp Direct Link')}
                  </p>
                </div>
              </div>

              {/* Chat Canvas Area */}
              <div className="p-4 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-slate-950 min-h-[140px] flex flex-col justify-end space-y-2">
                <div className="max-w-[85%] ml-auto p-3 rounded-2xl rounded-tr-none bg-emerald-800/90 text-white text-xs leading-relaxed space-y-1 shadow-sm">
                  <p className="whitespace-pre-wrap break-words">
                    {message || t('wa.previewMessagePlaceholder', 'Your custom message will appear here pre-filled when the user opens WhatsApp...')}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200/80">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-emerald-300">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Generated QR Code Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <QrIcon className="w-4 h-4 text-emerald-500" />
                {t('wa.qrTitle', 'Auto-Generated QR Code')}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                Static & Perpetual
              </span>
            </div>

            {/* Canvas Container */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center min-h-[220px]">
              <canvas ref={canvasRef} className="rounded-xl shadow-xs" />
            </div>

            {/* QR Styling Options */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {t('wa.qrFgColor', 'QR Color')}
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={qrFgColor}
                    onChange={(e) => setQrFgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{qrFgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {t('wa.qrBgColor', 'Background')}
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={qrBgColor}
                    onChange={(e) => setQrBgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{qrBgColor}</span>
                </div>
              </div>
            </div>

            {/* Export QR Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                PNG
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                SVG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Local Link Generation History Section */}
      {history.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-500" />
              {t('wa.historyTitle', 'Recent Links History')} ({history.length})
            </h3>
            <button
              onClick={handleClearHistory}
              className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('wa.clearHistory', 'Clear History')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                    <span>{COUNTRIES.find((c) => c.code === item.countryCode)?.flag || '📱'}</span>
                    +{item.fullPhone}
                  </span>
                  <button
                    onClick={() => handleDeleteHistoryItem(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {item.message || t('wa.noMessage', '(No pre-filled message)')}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[10px]">
                  <span className="text-slate-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadHistoryItem(item)}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      {t('wa.load', 'Load')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.shortUrl)}
                      className="text-slate-600 dark:text-slate-300 font-bold hover:underline"
                    >
                      {t('wa.copy', 'Copy')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Value Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              {t('wa.feat1Title', 'Zero Page Reloads')}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t('wa.feat1Desc', 'Instant client-side link and QR code generation.')}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              {t('wa.feat2Title', 'Global DDI Codes')}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t('wa.feat2Desc', 'Automatic flag detection for 40+ countries.')}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500 shrink-0">
            <QrIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              {t('wa.feat3Title', 'PNG & SVG Downloads')}
            </h4>
            <p className="text-[11px] text-slate-500">
              {t('wa.feat3Desc', 'Vector & high-resolution QR image exports.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
