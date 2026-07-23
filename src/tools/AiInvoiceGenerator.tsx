import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import {
  Sparkles,
  Download,
  Plus,
  Trash2,
  Printer,
  RefreshCw,
  CheckCircle2,
  FileText,
  Upload,
  Copy,
  RotateCcw,
  RotateCw,
  Save,
  FolderOpen,
  AlertCircle,
  X,
  Briefcase,
  Code2,
  Camera,
  Palette,
  Building2,
  Layers,
  Wrench,
  Check,
  ArrowUp,
  ArrowDown,
  GripVertical,
  FileSpreadsheet,
  FileJson,
  Eye,
  Edit3,
  Globe,
  Share2,
  DollarSign,
  Percent,
  Tag,
  Calendar,
  CreditCard,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { triggerConfetti, copyToClipboard } from '../lib/utils';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  senderTaxId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientTaxId: string;
  numberPrefix: string;
  sequenceNumber: number;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  taxLabel: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  shipping: number;
  notes: string;
  paymentInstructions: string;
  items: InvoiceItem[];
  logoUrl: string | null;
  logoSize: 'sm' | 'md' | 'lg';
  themeColor: 'indigo' | 'navy' | 'emerald' | 'sky' | 'slate' | 'rose';
}

export interface SavedInvoice {
  id: string;
  savedAt: string;
  title: string;
  data: InvoiceData;
}

const CURRENCY_MAP: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  BRL: 'R$',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
  INR: '₹',
  CHF: 'CHF',
  MXN: 'MEX$',
};

const THEME_COLORS: Record<InvoiceData['themeColor'], { primary: string; text: string; bg: string; border: string; hex: string }> = {
  indigo: { primary: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-600', hex: '#4f46e5' },
  navy: { primary: 'bg-slate-800', text: 'text-slate-800', bg: 'bg-slate-100', border: 'border-slate-800', hex: '#1e293b' },
  emerald: { primary: 'bg-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-600', hex: '#059669' },
  sky: { primary: 'bg-sky-600', text: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-600', hex: '#0284c7' },
  slate: { primary: 'bg-slate-700', text: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-700', hex: '#334155' },
  rose: { primary: 'bg-rose-600', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-600', hex: '#e11d48' },
};

const SAMPLE_PROMPTS = [
  'Invoice John Smith $2500 for Nursing Services',
  'Invoice Acme Ltd 18 hours React Development at $80/hour',
  'Bill Maria Silva R$3500 Website Design',
  'Invoice Carlos for Logo Design $500 with 10% tax',
  'Invoice ABC Company €1200 Marketing Consulting',
];

const TEMPLATES: Record<string, { name: string; icon: React.ReactNode; description: string; data: Partial<InvoiceData> }> = {
  freelancer: {
    name: 'Freelance Tech',
    icon: <Briefcase className="w-3.5 h-3.5 text-indigo-500" />,
    description: 'UI/UX Design & Development Services',
    data: {
      senderName: 'Alex Rivera Design',
      senderEmail: 'alex@riveradesign.io',
      senderAddress: '742 Evergreen Terrace, Portland, OR 97201',
      senderTaxId: 'EIN-98-7654321',
      clientName: 'Starlight Tech Solutions',
      clientEmail: 'billing@starlighttech.com',
      clientAddress: '100 Innovation Way, Suite 400, San Francisco, CA 94105',
      currency: 'USD',
      currencySymbol: '$',
      taxRate: 8.5,
      taxLabel: 'Sales Tax',
      discount: 0,
      discountType: 'percentage',
      shipping: 0,
      paymentInstructions: 'Bank Transfer: Chase Bank | Routing: 123456789 | Account: 987654321',
      notes: 'Payment is due within 14 days. Thank you for your business!',
      items: [
        { id: '1', description: 'Mobile App Wireframing & UI/UX Design System', quantity: 1, unitPrice: 1800 },
        { id: '2', description: 'Frontend React & Tailwind Integration (hrs)', quantity: 20, unitPrice: 85 },
      ],
    },
  },
  agency: {
    name: 'Digital Agency',
    icon: <Building2 className="w-3.5 h-3.5 text-purple-500" />,
    description: 'Full-Service Marketing & Branding',
    data: {
      senderName: 'Nexus Creative Digital Agency',
      senderEmail: 'finance@nexuscreative.agency',
      senderAddress: '120 Market Street, 8th Floor, Austin, TX 78701',
      senderTaxId: 'TAX-11-2233445',
      clientName: 'Horizon Brands Inc.',
      clientEmail: 'ap@horizonbrands.com',
      clientAddress: '88 Commerce Blvd, Seattle, WA 98101',
      currency: 'USD',
      currencySymbol: '$',
      taxRate: 10,
      taxLabel: 'VAT',
      discount: 5,
      discountType: 'percentage',
      shipping: 0,
      paymentInstructions: 'ACH / Wire Transfer: Silicon Valley Bank | Swift: SVBKUS6S',
      notes: 'Net 30 payment terms. Reference invoice number on wire transfer confirmation.',
      items: [
        { id: '1', description: 'Q3 Omni-channel Marketing Campaign Strategy', quantity: 1, unitPrice: 4200 },
        { id: '2', description: 'Social Media Content Asset Creation & Copywriting', quantity: 1, unitPrice: 1800 },
        { id: '3', description: 'SEO Technical Site Performance Audit', quantity: 1, unitPrice: 1200 },
      ],
    },
  },
  brazil_service: {
    name: 'Serviços (Brasil)',
    icon: <Globe className="w-3.5 h-3.5 text-emerald-500" />,
    description: 'Design, Código & Consultoria em R$',
    data: {
      senderName: 'Maria Silva Desenvolvimento LTDA',
      senderEmail: 'financeiro@mariasilva.dev',
      senderAddress: 'Av. Paulista, 1000, Cj 42 - São Paulo, SP',
      senderTaxId: 'CNPJ: 12.345.678/0001-90',
      clientName: 'Acme Brasil Soluções Tecnológicas',
      clientEmail: 'contato@acmebrasil.com.br',
      clientAddress: 'Rua das Flores, 500 - Rio de Janeiro, RJ',
      currency: 'BRL',
      currencySymbol: 'R$',
      taxRate: 5,
      taxLabel: 'ISS',
      discount: 0,
      discountType: 'percentage',
      shipping: 0,
      paymentInstructions: 'PIX Chave CNPJ: 12.345.678/0001-90 | Banco Itaú Ag 0123 C/C 45678-9',
      notes: 'Pagamento em até 10 dias via PIX ou Transferência Bancária. Agradecemos a preferência!',
      items: [
        { id: '1', description: 'Desenvolvimento de Website Responsivo & PWA', quantity: 1, unitPrice: 3500 },
        { id: '2', description: 'Otimização de SEO e Velocidade de Carregamento', quantity: 1, unitPrice: 800 },
      ],
    },
  },
  europe_consulting: {
    name: 'EU Consulting',
    icon: <Layers className="w-3.5 h-3.5 text-sky-500" />,
    description: 'Strategy & Enterprise Advisory in €',
    data: {
      senderName: 'Apex Advisory Group Europe B.V.',
      senderEmail: 'invoices@apexadvisory.eu',
      senderAddress: 'Keizersgracht 421, 1016 EK Amsterdam, Netherlands',
      senderTaxId: 'VAT: NL812345678B01',
      clientName: 'Vanguard Capital Partners GmbH',
      clientEmail: 'accounting@vanguardcap.de',
      clientAddress: 'Taunusanlage 8, 60329 Frankfurt am Main, Germany',
      currency: 'EUR',
      currencySymbol: '€',
      taxRate: 21,
      taxLabel: 'VAT (BTW)',
      discount: 0,
      discountType: 'percentage',
      shipping: 0,
      paymentInstructions: 'IBAN: NL91 ABNA 0412 3456 78 | BIC/SWIFT: ABNANL2A',
      notes: 'Payment terms: Net 14 days upon receipt of invoice.',
      items: [
        { id: '1', description: 'Enterprise Digital Transformation Strategy Roadmap', quantity: 1, unitPrice: 5000 },
        { id: '2', description: 'Executive Leadership Workshop & Security Audit', quantity: 8, unitPrice: 250 },
      ],
    },
  },
};

const DEFAULT_INVOICE: InvoiceData = {
  status: 'pending',
  senderName: 'Nuvora Studio',
  senderEmail: 'billing@nuvoratools.com',
  senderAddress: '100 Tech Plaza, San Francisco, CA 94105',
  senderTaxId: 'Tax ID / EIN: 98-7654321',
  clientName: 'Global Client Inc.',
  clientEmail: 'accounts@clientcorp.com',
  clientAddress: '500 Market Street, Suite 200, New York, NY 10001',
  clientTaxId: '',
  numberPrefix: 'INV-',
  sequenceNumber: 1084,
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 10,
  taxLabel: 'Tax / VAT',
  discount: 0,
  discountType: 'percentage',
  shipping: 0,
  notes: 'Thank you for your business! Payment is due within 14 days of receipt.',
  paymentInstructions: 'Bank Transfer | ACH Routing: 123456789 | Account: 987654321',
  items: [
    { id: '1', description: 'Professional Software Development & Architecture', quantity: 20, unitPrice: 85 },
    { id: '2', description: 'UI/UX Interactive System Design & Wireframing', quantity: 1, unitPrice: 800 },
  ],
  logoUrl: null,
  logoSize: 'md',
  themeColor: 'indigo',
};

export default function AiInvoiceGenerator() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Core State
  const [data, setData] = useState<InvoiceData>(() => {
    try {
      const savedDraft = localStorage.getItem('nuvoratools_invoice_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_INVOICE, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_INVOICE;
  });

  // Undo / Redo History
  const [history, setHistory] = useState<InvoiceData[]>([data]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // UI States
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [saveTitle, setSaveTitle] = useState('');
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'history'>('editor');
  const [historySearch, setHistorySearch] = useState('');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Load saved invoices from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nuvoratools_saved_invoices');
      if (stored) {
        setSavedInvoices(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading saved invoices:', e);
    }
  }, []);

  // Auto-save draft to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('nuvoratools_invoice_draft', JSON.stringify(data));
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  }, [data]);

  // Update Data Helper with History Recording
  const updateData = useCallback((newData: InvoiceData | ((prev: InvoiceData) => InvoiceData)) => {
    setData((prev) => {
      const next = typeof newData === 'function' ? newData(prev) : newData;
      setHistory((oldHist) => {
        const sliced = oldHist.slice(0, historyIndex + 1);
        const updated = [...sliced, next];
        if (updated.length > 25) updated.shift();
        setHistoryIndex(updated.length - 1);
        return updated;
      });
      return next;
    });
    setValidationErrors({});
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setData(history[prevIdx]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setData(history[nextIdx]);
    }
  };

  // Calculations (100% Real-time & Accurate)
  const subtotal = useMemo(() => {
    return data.items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      return sum + Math.round(q * p * 100) / 100;
    }, 0);
  }, [data.items]);

  const discountAmount = useMemo(() => {
    if (!data.discount || data.discount <= 0) return 0;
    if (data.discountType === 'percentage') {
      return Math.round(((subtotal * data.discount) / 100) * 100) / 100;
    }
    return Math.min(subtotal, Math.round(data.discount * 100) / 100);
  }, [subtotal, data.discount, data.discountType]);

  const taxableBase = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const taxAmount = useMemo(() => {
    if (!data.taxRate || data.taxRate <= 0) return 0;
    return Math.round(((taxableBase * data.taxRate) / 100) * 100) / 100;
  }, [taxableBase, data.taxRate]);

  const shippingAmount = useMemo(() => {
    return Math.max(0, Number(data.shipping) || 0);
  }, [data.shipping]);

  const grandTotal = useMemo(() => {
    return Math.max(0, Math.round((taxableBase + taxAmount + shippingAmount) * 100) / 100);
  }, [taxableBase, taxAmount, shippingAmount]);

  const fullInvoiceNumber = `${data.numberPrefix}${data.sequenceNumber}`;

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!data.senderName.trim()) {
      errors.senderName = 'Sender Business or Full Name is required';
    }
    if (!data.clientName.trim()) {
      errors.clientName = 'Client Name is required';
    }
    if (data.items.length === 0) {
      errors.items = 'At least one line item is required';
    } else {
      data.items.forEach((item, idx) => {
        if (!item.description.trim()) {
          errors[`item_${idx}`] = 'Item description cannot be empty';
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Actions
  const handleClearAll = () => {
    updateData({
      ...DEFAULT_INVOICE,
      senderName: '',
      senderEmail: '',
      senderAddress: '',
      senderTaxId: '',
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      clientTaxId: '',
      notes: '',
      paymentInstructions: '',
      items: [{ id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }],
      logoUrl: null,
    });
    setAiSuccessMsg('Cleared all invoice fields.');
  };

  const handleApplyTemplate = (tmplKey: string) => {
    const tmpl = TEMPLATES[tmplKey];
    if (!tmpl) return;
    updateData((prev) => ({
      ...prev,
      ...tmpl.data,
      sequenceNumber: prev.sequenceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: (tmpl.data.items || []).map((it, idx) => ({ ...it, id: `${Date.now()}_${idx}` })),
    }));
    triggerConfetti();
    setAiSuccessMsg(`Applied "${tmpl.name}" template.`);
  };

  const handleDuplicate = () => {
    updateData((prev) => ({
      ...prev,
      sequenceNumber: prev.sequenceNumber + 1,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }));
    triggerConfetti();
    setAiSuccessMsg(`Invoice duplicated! Generated new number: ${data.numberPrefix}${data.sequenceNumber + 1}`);
  };

  // Line Item Operations
  const addItem = () => {
    updateData((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const duplicateItem = (index: number) => {
    const itemToDup = data.items[index];
    if (!itemToDup) return;
    const newItem = { ...itemToDup, id: Date.now().toString() };
    const updated = [...data.items];
    updated.splice(index + 1, 0, newItem);
    updateData((prev) => ({ ...prev, items: updated }));
  };

  const removeItem = (id: string) => {
    if (data.items.length <= 1) return;
    updateData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    updateData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= data.items.length) return;
    const updated = [...data.items];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    updateData((prev) => ({ ...prev, items: updated }));
  };

  // HTML5 Drag and Drop Handlers for Reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const updated = [...data.items];
    const [dragged] = updated.splice(draggedItemIndex, 1);
    updated.splice(index, 0, dragged);
    setDraggedItemIndex(index);
    updateData((prev) => ({ ...prev, items: updated }));
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  // Logo Upload & Handling
  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo image size must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      updateData((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  // AI Smart Fill Form Submit
  const handleAiSmartFill = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const query = customPrompt || prompt;
    if (!query.trim()) return;

    setIsGenerating(true);
    setAiSuccessMsg('');
    try {
      const res = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        const newCurrency = d.currency && CURRENCY_MAP[d.currency] ? d.currency : data.currency;
        const newSymbol = CURRENCY_MAP[newCurrency] || data.currencySymbol;

        updateData((prev) => ({
          ...prev,
          clientName: d.clientName || prev.clientName,
          clientEmail: d.clientEmail || prev.clientEmail,
          clientAddress: d.clientAddress || prev.clientAddress,
          senderName: d.senderName || prev.senderName,
          senderEmail: d.senderEmail || prev.senderEmail,
          senderAddress: d.senderAddress || prev.senderAddress,
          currency: newCurrency,
          currencySymbol: newSymbol,
          taxRate: typeof d.taxRate === 'number' ? d.taxRate : prev.taxRate,
          discount: typeof d.discount === 'number' ? d.discount : prev.discount,
          notes: d.notes || prev.notes,
          invoiceDate: d.invoiceDate || prev.invoiceDate,
          dueDate: d.dueDate || prev.dueDate,
          items:
            Array.isArray(d.items) && d.items.length > 0
              ? d.items.map((it: any, idx: number) => ({
                  id: `${Date.now()}_${idx}`,
                  description: it.description || 'Service Item',
                  quantity: Number(it.quantity) || 1,
                  unitPrice: Number(it.unitPrice) || 100,
                }))
              : prev.items,
        }));
        setAiSuccessMsg('Parsed and auto-filled invoice data with AI!');
        triggerConfetti();
      } else {
        alert('Could not parse invoice prompt. Please try again or rephrase.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to AI service. Please check your network or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Summary or Share Text
  const handleCopySummary = async () => {
    if (!validateForm()) return;

    const itemsText = data.items
      .map((it) => `• ${it.description} (${it.quantity}x ${data.currencySymbol}${it.unitPrice.toFixed(2)}) = ${data.currencySymbol}${(it.quantity * it.unitPrice).toFixed(2)}`)
      .join('\n');

    const summaryText = `
INVOICE ${fullInvoiceNumber}
Status: ${data.status.toUpperCase()}
Date: ${data.invoiceDate} | Due Date: ${data.dueDate}

FROM:
${data.senderName}
${data.senderEmail ? `Email: ${data.senderEmail}` : ''}
${data.senderTaxId ? `Tax ID: ${data.senderTaxId}` : ''}
${data.senderAddress}

BILL TO:
${data.clientName}
${data.clientEmail ? `Email: ${data.clientEmail}` : ''}
${data.clientAddress}

ITEMS:
${itemsText}

----------------------------------------
Subtotal: ${data.currencySymbol}${subtotal.toFixed(2)}
${discountAmount > 0 ? `Discount: -${data.currencySymbol}${discountAmount.toFixed(2)}\n` : ''}${taxAmount > 0 ? `${data.taxLabel} (${data.taxRate}%): +${data.currencySymbol}${taxAmount.toFixed(2)}\n` : ''}${shippingAmount > 0 ? `Shipping: +${data.currencySymbol}${shippingAmount.toFixed(2)}\n` : ''}TOTAL DUE: ${data.currencySymbol}${grandTotal.toFixed(2)}

${data.paymentInstructions ? `Payment Info:\n${data.paymentInstructions}\n` : ''}${data.notes ? `Notes:\n${data.notes}` : ''}
`.trim();

    const ok = await copyToClipboard(summaryText);
    if (ok) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  // JSON Export & Import
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${fullInvoiceNumber.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerConfetti();
    setAiSuccessMsg(`Exported ${fullInvoiceNumber}.json!`);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
          updateData({ ...DEFAULT_INVOICE, ...parsed });
          triggerConfetti();
          setAiSuccessMsg('Successfully imported invoice JSON data!');
        } else {
          alert('Invalid invoice JSON structure.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Save to Local History
  const handleSaveLocally = () => {
    if (!validateForm()) return;

    const title = saveTitle.trim() || `${data.clientName || 'Invoice'} (${fullInvoiceNumber})`;
    const newSaved: SavedInvoice = {
      id: Date.now().toString(),
      savedAt: new Date().toLocaleString(),
      title,
      data: { ...data },
    };

    const updatedList = [newSaved, ...savedInvoices.filter((s) => s.id !== newSaved.id)];
    setSavedInvoices(updatedList);
    localStorage.setItem('nuvoratools_saved_invoices', JSON.stringify(updatedList));
    setSaveTitle('');
    setAiSuccessMsg(`Saved "${title}" to history!`);
    triggerConfetti();
  };

  const handleLoadSavedInvoice = (saved: SavedInvoice) => {
    updateData(saved.data);
    setSavedModalOpen(false);
    setAiSuccessMsg(`Loaded saved invoice: ${saved.title}`);
  };

  const handleDeleteSavedInvoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedInvoices.filter((s) => s.id !== id);
    setSavedInvoices(filtered);
    localStorage.setItem('nuvoratools_saved_invoices', JSON.stringify(filtered));
  };

  // Filter Saved Invoices
  const filteredSavedInvoices = useMemo(() => {
    if (!historySearch.trim()) return savedInvoices;
    const query = historySearch.toLowerCase();
    return savedInvoices.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.data.clientName.toLowerCase().includes(query) ||
        `${s.data.numberPrefix}${s.data.sequenceNumber}`.toLowerCase().includes(query)
    );
  }, [savedInvoices, historySearch]);

  // PDF Generation with 1:1 Design Fidelity
  const generatePdf = () => {
    if (!validateForm()) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const theme = THEME_COLORS[data.themeColor] || THEME_COLORS.indigo;

    // Convert hex theme to RGB
    const hexToRgb = (hex: string) => {
      const bigint = parseInt(hex.replace('#', ''), 16);
      return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    };
    const rgb = hexToRgb(theme.hex);

    // Header Background Bar
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.rect(0, 0, 210, 36, 'F');

    let titleX = 14;
    // Embed Logo if available
    if (data.logoUrl) {
      try {
        doc.addImage(data.logoUrl, 'PNG', 14, 6, 24, 24);
        titleX = 42;
      } catch (err) {
        console.warn('PDF logo embed fallback:', err);
      }
    }

    // Header Title & Invoice Number
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('INVOICE', titleX, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`# ${fullInvoiceNumber}`, 196, 18, { align: 'right' });
    doc.setFontSize(9);
    doc.text(`Status: ${data.status.toUpperCase()}`, 196, 25, { align: 'right' });

    // Dates & Info Box
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Date: ${data.invoiceDate}`, 14, 46);
    doc.text(`Payment Due: ${data.dueDate}`, 14, 52);

    // Sender Block (Left) & Client Block (Right)
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 58, 88, 36, 'F');
    doc.rect(108, 58, 88, 36, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('BILLED FROM:', 18, 64);
    doc.text('BILLED TO:', 112, 64);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(data.senderName || 'Sender Name', 18, 71);
    doc.text(data.clientName || 'Client Name', 112, 71);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    let senderY = 76;
    if (data.senderEmail) {
      doc.text(data.senderEmail, 18, senderY);
      senderY += 4.5;
    }
    if (data.senderTaxId) {
      doc.text(data.senderTaxId, 18, senderY);
      senderY += 4.5;
    }
    if (data.senderAddress) {
      const lines = doc.splitTextToSize(data.senderAddress, 80);
      doc.text(lines, 18, senderY);
    }

    let clientY = 76;
    if (data.clientEmail) {
      doc.text(data.clientEmail, 112, clientY);
      clientY += 4.5;
    }
    if (data.clientTaxId) {
      doc.text(data.clientTaxId, 112, clientY);
      clientY += 4.5;
    }
    if (data.clientAddress) {
      const lines = doc.splitTextToSize(data.clientAddress, 80);
      doc.text(lines, 112, clientY);
    }

    // Line Items Table Header
    let startY = 102;
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.rect(14, startY, 182, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('DESCRIPTION', 18, startY + 5.5);
    doc.text('QTY', 125, startY + 5.5, { align: 'center' });
    doc.text(`UNIT PRICE (${data.currencySymbol})`, 155, startY + 5.5, { align: 'right' });
    doc.text(`AMOUNT (${data.currencySymbol})`, 192, startY + 5.5, { align: 'right' });

    // Table Body
    let currentY = startY + 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    data.items.forEach((item, index) => {
      const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      const descLines = doc.splitTextToSize(item.description || 'Service item', 100);

      // Alternate row background
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        const rowHeight = Math.max(8, descLines.length * 5);
        doc.rect(14, currentY - 4, 182, rowHeight, 'F');
      }

      doc.setTextColor(30, 41, 59);
      doc.text(descLines, 18, currentY);
      doc.text(item.quantity.toString(), 125, currentY, { align: 'center' });
      doc.text(`${data.currencySymbol}${(Number(item.unitPrice) || 0).toFixed(2)}`, 155, currentY, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`${data.currencySymbol}${lineTotal.toFixed(2)}`, 192, currentY, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      const lineIncrement = Math.max(9, descLines.length * 5 + 3);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, currentY + lineIncrement - 3, 196, currentY + lineIncrement - 3);
      currentY += lineIncrement;
    });

    // Totals Breakdown Section
    currentY += 4;
    const totalsX = 125;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    doc.text('Subtotal:', totalsX, currentY);
    doc.text(`${data.currencySymbol}${subtotal.toFixed(2)}`, 192, currentY, { align: 'right' });

    if (discountAmount > 0) {
      currentY += 5.5;
      doc.text(`Discount (${data.discount}${data.discountType === 'percentage' ? '%' : ''}):`, totalsX, currentY);
      doc.text(`-${data.currencySymbol}${discountAmount.toFixed(2)}`, 192, currentY, { align: 'right' });
    }

    if (taxAmount > 0) {
      currentY += 5.5;
      doc.text(`${data.taxLabel || 'Tax'} (${data.taxRate}%):`, totalsX, currentY);
      doc.text(`+${data.currencySymbol}${taxAmount.toFixed(2)}`, 192, currentY, { align: 'right' });
    }

    if (shippingAmount > 0) {
      currentY += 5.5;
      doc.text('Shipping / Delivery:', totalsX, currentY);
      doc.text(`+${data.currencySymbol}${shippingAmount.toFixed(2)}`, 192, currentY, { align: 'right' });
    }

    // Grand Total Highlight Box
    currentY += 8;
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.rect(120, currentY - 5, 76, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL DUE:', totalsX, currentY + 2);
    doc.text(`${data.currencySymbol}${grandTotal.toFixed(2)}`, 192, currentY + 2, { align: 'right' });

    // Payment Instructions & Notes
    currentY += 18;
    if (data.paymentInstructions) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('PAYMENT INSTRUCTIONS & BANK DETAILS:', 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const payLines = doc.splitTextToSize(data.paymentInstructions, 180);
      doc.text(payLines, 14, currentY + 4.5);
      currentY += payLines.length * 4 + 6;
    }

    if (data.notes) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('NOTES & TERMS:', 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const noteLines = doc.splitTextToSize(data.notes, 180);
      doc.text(noteLines, 14, currentY + 4.5);
    }

    // Footer Page Tag
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated via NuvoraTools AI Invoice Builder — 100% Client-Side Privacy', 105, 287, { align: 'center' });

    doc.save(`invoice_${fullInvoiceNumber.toLowerCase()}.pdf`);
    triggerConfetti();
  };

  return (
    <div className="space-y-6">
      {/* Print-Only CSS Stylesheet Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Main Top Action Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        {/* Left Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Apply Sample */}
          <button
            type="button"
            onClick={() => handleApplyTemplate('freelancer')}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-900 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Data</span>
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={handleDuplicate}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
            title="Duplicate invoice with incremented number"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Duplicate Invoice</span>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-0.5">
            <button
              type="button"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-400"
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-400"
              title="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Saved History */}
          <button
            type="button"
            onClick={() => setSavedModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>History ({savedInvoices.length})</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveLocally}
            className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          {/* JSON Export */}
          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
            title="Export invoice as JSON file"
          >
            <FileJson className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          {/* JSON Import Button */}
          <button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
            title="Import invoice JSON file"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Import JSON</span>
          </button>
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportJson}
          />
        </div>
      </div>

      {/* Validation Warnings */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              Please fix validation issues: {Object.values(validationErrors).join(' • ')}
            </span>
          </div>
          <button onClick={() => setValidationErrors({})} className="p-1 hover:text-red-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AI Smart Natural Language Parser Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/80 dark:border-blue-900/40 shadow-xs print:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>AI Natural Language Invoice Fill</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Gemini 3.6 Flash Powered</span>
        </div>

        <form onSubmit={(e) => handleAiSmartFill(e)} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Invoice John Smith $2500 for Nursing Services due in 14 days..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Auto Fill</span>
          </button>
        </form>

        {/* Example Prompt Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Try Examples:</span>
          {SAMPLE_PROMPTS.map((exPrompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPrompt(exPrompt);
                handleAiSmartFill(undefined, exPrompt);
              }}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-white/80 dark:bg-slate-900/80 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              "{exPrompt}"
            </button>
          ))}
        </div>

        {aiSuccessMsg && (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{aiSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Quick Profession Templates Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs print:hidden">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Profession Presets
          </h4>
          <span className="text-[10px] text-slate-400">Click to populate preset business details</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(TEMPLATES).map(([key, tmpl]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyTemplate(key)}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-950/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                {tmpl.icon}
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {tmpl.name}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">{tmpl.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden rounded-xl bg-slate-100 dark:bg-slate-900 p-1 text-xs font-semibold print:hidden">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'editor' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-500'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor Form</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'preview' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-500'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Preview & PDF</span>
        </button>
        <button
          onClick={() => setMobileTab('history')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'history' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-500'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Saved ({savedInvoices.length})</span>
        </button>
      </div>

      {/* Main Grid: Form Editor Left, Live Document Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form Column */}
        <div className={`lg:col-span-6 space-y-6 ${mobileTab !== 'editor' ? 'hidden lg:block' : ''} print:hidden`}>
          {/* Identity & Branding Section */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Invoice Identity & Theme</span>
              </span>
            </h3>

            {/* Custom Logo Upload Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingLogo(true);
              }}
              onDragLeave={() => setIsDraggingLogo(false)}
              onDrop={handleLogoDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                isDraggingLogo
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/50'
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleLogoFile(e.target.files[0]);
                  }
                }}
              />
              {data.logoUrl ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={data.logoUrl} alt="Logo" className="h-10 w-auto object-contain rounded border bg-white p-1" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Custom Logo Uploaded</p>
                      <p className="text-[10px] text-slate-400">Click or drag new image to replace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateData((prev) => ({ ...prev, logoUrl: null }));
                      }}
                      className="px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 py-1">
                  <Upload className="w-5 h-5 text-indigo-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload Business Logo <span className="font-normal text-slate-400">(PNG, JPG, SVG up to 5MB)</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Drag & Drop or click to browse</p>
                </div>
              )}
            </div>

            {/* Theme & Status Options */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Invoice Status</label>
                <select
                  value={data.status}
                  onChange={(e) => updateData((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="pending">Pending Payment</option>
                  <option value="paid">Paid</option>
                  <option value="draft">Draft</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Theme Color Accent</label>
                <select
                  value={data.themeColor}
                  onChange={(e) => updateData((prev) => ({ ...prev, themeColor: e.target.value as any }))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="indigo">Indigo Modern</option>
                  <option value="navy">Executive Navy</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="sky">Sky Blue</option>
                  <option value="slate">Graphite Slate</option>
                  <option value="rose">Rose Corporate</option>
                </select>
              </div>
            </div>

            {/* Sequence Numbering & Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Prefix</label>
                <input
                  type="text"
                  value={data.numberPrefix}
                  onChange={(e) => updateData((prev) => ({ ...prev, numberPrefix: e.target.value }))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  placeholder="e.g. INV-"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1 flex items-center justify-between">
                  <span>Seq Number</span>
                  <button
                    type="button"
                    onClick={() => updateData((prev) => ({ ...prev, sequenceNumber: prev.sequenceNumber + 1 }))}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    +1 Next
                  </button>
                </label>
                <input
                  type="number"
                  value={data.sequenceNumber}
                  onChange={(e) => updateData((prev) => ({ ...prev, sequenceNumber: parseInt(e.target.value) || 1 }))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-slate-500 font-medium mb-1">Currency</label>
                <select
                  value={data.currency}
                  onChange={(e) => {
                    const c = e.target.value;
                    updateData((prev) => ({ ...prev, currency: c, currencySymbol: CURRENCY_MAP[c] || c }));
                  }}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="BRL">BRL (R$)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CHF">CHF</option>
                  <option value="MXN">MXN (MEX$)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={data.invoiceDate}
                  onChange={(e) => updateData((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-2">
                <label className="block text-slate-500 font-medium mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={data.dueDate}
                  onChange={(e) => updateData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Sender & Client Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Sender */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Billed From (Your Info)</span>
                  {validationErrors.senderName && <span className="text-[10px] text-red-500 font-normal">*Required</span>}
                </span>
                <input
                  type="text"
                  placeholder="Your Business / Full Name *"
                  value={data.senderName}
                  onChange={(e) => updateData((prev) => ({ ...prev, senderName: e.target.value }))}
                  className={`w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white ${
                    validationErrors.senderName ? 'border-red-500 bg-red-50/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                <input
                  type="email"
                  placeholder="Billing Email address"
                  value={data.senderEmail}
                  onChange={(e) => updateData((prev) => ({ ...prev, senderEmail: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Tax ID / EIN / CNPJ (Optional)"
                  value={data.senderTaxId}
                  onChange={(e) => updateData((prev) => ({ ...prev, senderTaxId: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                <textarea
                  placeholder="Address Line, Phone, Country"
                  rows={2}
                  value={data.senderAddress}
                  onChange={(e) => updateData((prev) => ({ ...prev, senderAddress: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Client */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Billed To (Client)</span>
                  {validationErrors.clientName && <span className="text-[10px] text-red-500 font-normal">*Required</span>}
                </span>
                <input
                  type="text"
                  placeholder="Client / Company Name *"
                  value={data.clientName}
                  onChange={(e) => updateData((prev) => ({ ...prev, clientName: e.target.value }))}
                  className={`w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white ${
                    validationErrors.clientName ? 'border-red-500 bg-red-50/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                <input
                  type="email"
                  placeholder="Client Email"
                  value={data.clientEmail}
                  onChange={(e) => updateData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Client Tax ID / VAT ID (Optional)"
                  value={data.clientTaxId}
                  onChange={(e) => updateData((prev) => ({ ...prev, clientTaxId: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                <textarea
                  placeholder="Client Address"
                  rows={2}
                  value={data.clientAddress}
                  onChange={(e) => updateData((prev) => ({ ...prev, clientAddress: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Line Items Manager */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Line Items ({data.items.length})
                </h3>
                <p className="text-[10px] text-slate-400">Drag handle or use arrows to reorder items</p>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {data.items.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`grid grid-cols-12 gap-2 items-center text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border transition-all ${
                    draggedItemIndex === index ? 'opacity-50 border-indigo-500 scale-[0.99]' : 'border-slate-200/80 dark:border-slate-800/80'
                  }`}
                >
                  {/* Drag Handle & Reorder */}
                  <div className="col-span-1 flex items-center gap-0.5 text-slate-400">
                    <span className="cursor-grab hover:text-slate-600 dark:hover:text-slate-200" title="Drag to reorder">
                      <GripVertical className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col text-[10px]">
                      <button
                        type="button"
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="hover:text-indigo-500 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === data.items.length - 1}
                        className="hover:text-indigo-500 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-span-5 sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Service description *"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 sm:col-span-2">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-mono"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="col-span-3 sm:col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-right font-mono"
                    />
                  </div>

                  {/* Actions (Duplicate & Delete) */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => duplicateItem(index)}
                      className="p-1 text-slate-400 hover:text-indigo-500 rounded transition-colors"
                      title="Duplicate item"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={data.items.length <= 1}
                      className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 rounded transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations: Taxes, Discounts, Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {/* Discount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-500 font-medium">Discount</label>
                  <button
                    type="button"
                    onClick={() =>
                      updateData((prev) => ({
                        ...prev,
                        discountType: prev.discountType === 'percentage' ? 'fixed' : 'percentage',
                      }))
                    }
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Type: {data.discountType === 'percentage' ? '%' : data.currencySymbol}
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={data.discount}
                  onChange={(e) => updateData((prev) => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  placeholder="0"
                />
              </div>

              {/* Tax Rate & Label */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">Tax Rate (%)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={data.taxRate}
                    onChange={(e) => updateData((prev) => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    placeholder="10"
                  />
                  <input
                    type="text"
                    value={data.taxLabel}
                    onChange={(e) => updateData((prev) => ({ ...prev, taxLabel: e.target.value }))}
                    className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-[11px]"
                    placeholder="e.g. VAT"
                  />
                </div>
              </div>

              {/* Shipping */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">Shipping / Delivery</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.shipping}
                  onChange={(e) => updateData((prev) => ({ ...prev, shipping: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment Info & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Payment Instructions & Bank Wire</label>
                <textarea
                  rows={2}
                  value={data.paymentInstructions}
                  onChange={(e) => updateData((prev) => ({ ...prev, paymentInstructions: e.target.value }))}
                  placeholder="e.g. ACH Routing, IBAN, PIX key, PayPal email..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Notes & Terms</label>
                <textarea
                  rows={2}
                  value={data.notes}
                  onChange={(e) => updateData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Payment due terms, thank you note, late fee policies..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Document Preview Column (Right Side on Desktop) */}
        <div className={`lg:col-span-6 space-y-4 ${mobileTab !== 'preview' ? 'hidden lg:block' : ''}`}>
          {/* Action Toolbar for Preview */}
          <div className="flex items-center justify-between print:hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Document Preview
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5 transition-colors"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copySuccess ? 'Copied Summary!' : 'Copy Summary'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={generatePdf}
                className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* 1:1 Matching Printable Invoice Document Sheet */}
          <div
            id="printable-invoice"
            className="p-8 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-xl space-y-6 font-sans text-xs min-h-[620px] relative overflow-hidden"
          >
            {/* Theme Accent Color Top Stripe */}
            <div className={`h-2.5 -mx-8 -mt-8 mb-6 ${THEME_COLORS[data.themeColor]?.primary || 'bg-indigo-600'}`} />

            {/* Document Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                {data.logoUrl && (
                  <img src={data.logoUrl} alt="Logo" className="h-12 w-auto max-w-[120px] object-contain" />
                )}
                <div>
                  <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">INVOICE</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-500 font-mono text-[11px]">#{fullInvoiceNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        data.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : data.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : data.status === 'draft'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {data.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Dates & Payment</p>
                <p className="text-slate-700">
                  <span className="font-semibold">Invoice Date:</span> {data.invoiceDate}
                </p>
                <p className="text-slate-900 font-bold">
                  <span>Payment Due:</span> {data.dueDate}
                </p>
              </div>
            </div>

            {/* Billed From & Billed To Side-by-Side Boxes */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {/* Sender */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed From</p>
                <p className="font-bold text-slate-900 text-sm">{data.senderName || 'Sender Name'}</p>
                {data.senderEmail && <p className="text-slate-600">{data.senderEmail}</p>}
                {data.senderTaxId && <p className="text-slate-500 text-[10px]">{data.senderTaxId}</p>}
                {data.senderAddress && <p className="text-slate-500 whitespace-pre-line text-[10px] mt-1">{data.senderAddress}</p>}
              </div>

              {/* Client */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
                <p className="font-bold text-slate-900 text-sm">{data.clientName || 'Client Name'}</p>
                {data.clientEmail && <p className="text-slate-600">{data.clientEmail}</p>}
                {data.clientTaxId && <p className="text-slate-500 text-[10px]">{data.clientTaxId}</p>}
                {data.clientAddress && <p className="text-slate-500 whitespace-pre-line text-[10px] mt-1">{data.clientAddress}</p>}
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/80">
                  <th className="py-2.5 px-2">Description</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Price</th>
                  <th className="py-2.5 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item) => {
                  const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  return (
                    <tr key={item.id} className="text-slate-700 hover:bg-slate-50/50">
                      <td className="py-3 px-2 font-medium">{item.description || '(Empty item)'}</td>
                      <td className="py-3 px-2 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 px-2 text-right font-mono">
                        {data.currencySymbol}{(Number(item.unitPrice) || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                        {data.currencySymbol}{lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals Breakdown Section */}
            <div className="flex justify-end pt-2 border-t border-slate-200">
              <div className="w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{data.currencySymbol}{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({data.discount}{data.discountType === 'percentage' ? '%' : ''}):</span>
                    <span className="font-mono">-{data.currencySymbol}{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>{data.taxLabel || 'Tax'} ({data.taxRate}%):</span>
                    <span className="font-mono">+{data.currencySymbol}{taxAmount.toFixed(2)}</span>
                  </div>
                )}

                {shippingAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping:</span>
                    <span className="font-mono">+{data.currencySymbol}{shippingAmount.toFixed(2)}</span>
                  </div>
                )}

                <div
                  className={`flex justify-between text-sm font-black text-slate-900 p-2.5 rounded-xl border mt-2 ${
                    THEME_COLORS[data.themeColor]?.bg || 'bg-indigo-50'
                  } ${THEME_COLORS[data.themeColor]?.border || 'border-indigo-600'}`}
                >
                  <span>Total Due:</span>
                  <span className={`font-mono text-base ${THEME_COLORS[data.themeColor]?.text || 'text-indigo-600'}`}>
                    {data.currencySymbol}{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Instructions & Notes Footer */}
            {(data.paymentInstructions || data.notes) && (
              <div className="pt-4 border-t border-slate-100 text-[10px] space-y-3">
                {data.paymentInstructions && (
                  <div>
                    <p className="font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                      Payment Instructions & Bank Details
                    </p>
                    <p className="text-slate-600 whitespace-pre-line leading-relaxed">{data.paymentInstructions}</p>
                  </div>
                )}
                {data.notes && (
                  <div>
                    <p className="font-bold text-slate-700 uppercase tracking-wider mb-0.5">Notes & Terms</p>
                    <p className="text-slate-500 whitespace-pre-line leading-relaxed">{data.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Invoices History Modal */}
      {savedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-500" />
                <span>Invoice History & Drafts ({savedInvoices.length})</span>
              </h3>
              <button onClick={() => setSavedModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Save Current Section */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <label className="block text-slate-500 font-medium">Save Current Invoice State</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Custom title e.g. Acme Q3 Milestone..."
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleSaveLocally}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shrink-0"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Search Saved */}
            {savedInvoices.length > 0 && (
              <input
                type="text"
                placeholder="Search history by client name or invoice number..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            )}

            {/* List of Saved */}
            <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
              {filteredSavedInvoices.length > 0 ? (
                filteredSavedInvoices.map((saved) => (
                  <div
                    key={saved.id}
                    onClick={() => handleLoadSavedInvoice(saved)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-950 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {saved.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Saved at {saved.savedAt} • Client: {saved.data.clientName || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {saved.data.currencySymbol || '$'}
                        {saved.data.items
                          .reduce((s, it) => s + (it.quantity * it.unitPrice || 0), 0)
                          .toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedInvoice(saved.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {historySearch ? 'No invoices match search.' : 'No saved invoices found in browser history.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
