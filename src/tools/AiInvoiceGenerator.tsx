import React, { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { triggerConfetti } from '../lib/utils';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  numberPrefix: string;
  sequenceNumber: number;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  discount: number;
  notes: string;
  items: InvoiceItem[];
  logoUrl: string | null;
}

export interface SavedInvoice {
  id: string;
  savedAt: string;
  title: string;
  data: InvoiceData;
}

const TEMPLATES: Record<
  string,
  {
    name: string;
    icon: React.ReactNode;
    description: string;
    senderName: string;
    senderEmail: string;
    senderAddress: string;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    currency: string;
    taxRate: number;
    discount: number;
    notes: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
  }
> = {
  freelancer: {
    name: 'Freelancer',
    icon: <Briefcase className="w-3.5 h-3.5 text-blue-500" />,
    description: 'UI/UX Design & Frontend Development Services',
    senderName: 'Alex Rivera — Independent Designer',
    senderEmail: 'alex@riveradesign.io',
    senderAddress: '742 Evergreen Terrace, Portland, OR 97201',
    clientName: 'Starlight Tech Solutions',
    clientEmail: 'accounts@starlighttech.com',
    clientAddress: '100 Innovation Way, Suite 400, San Francisco, CA 94105',
    currency: 'USD',
    taxRate: 8.5,
    discount: 0,
    notes: 'Payment is due within 14 days via bank transfer or Stripe. Thank you for your business!',
    items: [
      { description: 'Mobile App Wireframing & UI/UX Design System', quantity: 1, unitPrice: 1800 },
      { description: 'Frontend React & Tailwind Integration (hrs)', quantity: 20, unitPrice: 85 },
    ],
  },
  consultant: {
    name: 'Consultant',
    icon: <Building2 className="w-3.5 h-3.5 text-purple-500" />,
    description: 'Strategic Business & Technology Advisory',
    senderName: 'Apex Business Advisory Group',
    senderEmail: 'billing@apexadvisory.com',
    senderAddress: '500 Corporate Parkway, New York, NY 10001',
    clientName: 'Vanguard Capital Partners',
    clientEmail: 'finance@vanguardcap.com',
    clientAddress: '250 Financial Center, Chicago, IL 60601',
    currency: 'USD',
    taxRate: 0,
    discount: 5,
    notes: 'Net 30 payment terms. Please reference invoice number on wire transfer confirmation.',
    items: [
      { description: 'Q3 Enterprise Digital Transformation Roadmap', quantity: 1, unitPrice: 3500 },
      { description: 'Executive Leadership Strategy Workshop & Audit', quantity: 4, unitPrice: 250 },
    ],
  },
  agency: {
    name: 'Agency',
    icon: <Layers className="w-3.5 h-3.5 text-indigo-500" />,
    description: 'Full-Service Digital Marketing & Creative Agency',
    senderName: 'Nexus Creative Digital Agency',
    senderEmail: 'finance@nexuscreative.agency',
    senderAddress: '120 Market Street, 8th Floor, Austin, TX 78701',
    clientName: 'Horizon Brands Inc.',
    clientEmail: 'ap@horizonbrands.com',
    clientAddress: '88 Commerce Blvd, Seattle, WA 98101',
    currency: 'USD',
    taxRate: 10,
    discount: 0,
    notes: 'Thank you for partnering with Nexus. Late payments subject to 1.5% monthly late fee.',
    items: [
      { description: 'Q3 Omni-channel Marketing Campaign Strategy', quantity: 1, unitPrice: 4200 },
      { description: 'Social Media Content Asset Creation & Copy', quantity: 1, unitPrice: 1800 },
      { description: 'SEO Optimization & Technical Site Performance', quantity: 1, unitPrice: 1200 },
    ],
  },
  contractor: {
    name: 'Contractor',
    icon: <Wrench className="w-3.5 h-3.5 text-amber-500" />,
    description: 'General Contracting & Site Engineering Services',
    senderName: 'Summit Construction Services LLC',
    senderEmail: 'invoices@summitbuilds.com',
    senderAddress: '410 Industrial Park Road, Denver, CO 80202',
    clientName: 'Pinnacle Commercial Properties',
    clientEmail: 'projects@pinnacleprop.com',
    clientAddress: '1200 Main Street, Suite 300, Denver, CO 80202',
    currency: 'USD',
    taxRate: 7.25,
    discount: 0,
    notes: 'Payment due upon site inspection & milestone sign-off.',
    items: [
      { description: 'Commercial Interior Framing & Structural Prep', quantity: 1, unitPrice: 4800 },
      { description: 'Electrical & Plumbing Prep Operations', quantity: 1, unitPrice: 2200 },
    ],
  },
  smallbusiness: {
    name: 'Small Business',
    icon: <Building2 className="w-3.5 h-3.5 text-emerald-500" />,
    description: 'Wholesale Orders & Merchandise Distribution',
    senderName: 'Artisan Crafted Goods Co.',
    senderEmail: 'orders@artisangoods.shop',
    senderAddress: '305 Heritage Lane, Nashville, TN 37201',
    clientName: 'Boutique Collection Store',
    clientEmail: 'purchasing@boutiquecollect.com',
    clientAddress: '55 Retail Square, Atlanta, GA 30301',
    currency: 'USD',
    taxRate: 9.5,
    discount: 10,
    notes: 'Items dispatched via Express Shipping. Returns accepted within 30 days of receipt.',
    items: [
      { description: 'Handcrafted Ceramic Vessel Sets (Batch A)', quantity: 25, unitPrice: 45 },
      { description: 'Organic Cotton Table Linen Bundles', quantity: 15, unitPrice: 60 },
      { description: 'Freight Cargo & Logistics Handling', quantity: 1, unitPrice: 150 },
    ],
  },
  photographer: {
    name: 'Photographer',
    icon: <Camera className="w-3.5 h-3.5 text-rose-500" />,
    description: 'Event, Commercial & Portrait Photography',
    senderName: 'Lumina Photography Studio',
    senderEmail: 'booking@luminaphoto.com',
    senderAddress: '88 Studio Alley, Los Angeles, CA 90012',
    clientName: 'Elevate Lifestyle Magazine',
    clientEmail: 'editor@elevatemag.com',
    clientAddress: '450 Wilshire Blvd, Los Angeles, CA 90036',
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    notes: 'High-resolution digital gallery download link provided upon settlement of invoice.',
    items: [
      { description: 'Half-Day Commercial Fashion Shoot Session', quantity: 1, unitPrice: 1400 },
      { description: 'High-Res Photo Color Grading & Retouching', quantity: 20, unitPrice: 30 },
      { description: 'Commercial Image Publishing License', quantity: 1, unitPrice: 600 },
    ],
  },
  designer: {
    name: 'Designer',
    icon: <Palette className="w-3.5 h-3.5 text-pink-500" />,
    description: 'Brand Identity, Graphic & Vector Design',
    senderName: 'Studio Chroma Design',
    senderEmail: 'hello@studiochroma.design',
    senderAddress: '92 Creative Way, Brooklyn, NY 11201',
    clientName: 'Pulse Fitness & Wellness',
    clientEmail: 'team@pulsefitness.com',
    clientAddress: '180 Broadway, New York, NY 10038',
    currency: 'USD',
    taxRate: 8.875,
    discount: 0,
    notes: 'Vector brand assets (.AI, .SVG, .PDF) will be transferred upon final invoice settlement.',
    items: [
      { description: 'Complete Brand Identity System & Logo Suite', quantity: 1, unitPrice: 3200 },
      { description: 'Brand Style Guidelines & Typography Deck', quantity: 1, unitPrice: 950 },
    ],
  },
  developer: {
    name: 'Developer',
    icon: <Code2 className="w-3.5 h-3.5 text-teal-500" />,
    description: 'Software Engineering, API Architecture & DevOps',
    senderName: 'DevCraft Software Engineering',
    senderEmail: 'dev@devcraft.io',
    senderAddress: '600 Tech Boulevard, Austin, TX 78702',
    clientName: 'DataSphere Cloud Inc.',
    clientEmail: 'billing@datasphere.cloud',
    clientAddress: '101 Cloud Way, San Jose, CA 95110',
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    notes: 'Source code deployed to staging. Production deployment scheduled immediately upon payment.',
    items: [
      { description: 'REST API & GraphQL Middleware Architecture (hrs)', quantity: 30, unitPrice: 110 },
      { description: 'Docker Containerization & CI/CD Pipeline Setup', quantity: 1, unitPrice: 1500 },
      { description: 'Automated Test Suite & Database Optimization', quantity: 1, unitPrice: 950 },
    ],
  },
};

const EMPTY_INVOICE: InvoiceData = {
  senderName: '',
  senderEmail: '',
  senderAddress: '',
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  numberPrefix: 'INV-',
  sequenceNumber: 1001,
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: 'USD',
  taxRate: 0,
  discount: 0,
  notes: '',
  items: [{ id: '1', description: '', quantity: 1, unitPrice: 0 }],
  logoUrl: null,
};

const SAMPLE_INVOICE: InvoiceData = { ...TEMPLATES.freelancer, numberPrefix: 'INV-', sequenceNumber: 1084, invoiceDate: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], items: TEMPLATES.freelancer.items.map((it, idx) => ({ ...it, id: String(idx + 1) })), logoUrl: null };

export default function AiInvoiceGenerator() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core State
  const [data, setData] = useState<InvoiceData>(() => {
    try {
      const savedDraft = localStorage.getItem('nuvoratools_invoice_draft') || localStorage.getItem('toolhub_invoice_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      // Ignore
    }
    return EMPTY_INVOICE;
  });

  // History State for Undo / Redo
  const [history, setHistory] = useState<InvoiceData[]>([data]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // UI State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [savedInvoicesModalOpen, setSavedInvoicesModalOpen] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [saveTitle, setSaveTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    BRL: 'R$',
    JPY: '¥',
    INR: '₹',
  };

  const currentSymbol = currencySymbols[data.currency] || '$';

  // Load saved invoices from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nuvoratools_saved_invoices') || localStorage.getItem('toolhub_saved_invoices');
      if (stored) {
        setSavedInvoices(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto-save draft to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('nuvoratools_invoice_draft', JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }, [data]);

  // Helper to push state to Undo/Redo history
  const updateData = (newData: InvoiceData | ((prev: InvoiceData) => InvoiceData)) => {
    setData((prev) => {
      const next = typeof newData === 'function' ? newData(prev) : newData;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(next);
      if (newHistory.length > 20) newHistory.shift(); // keep max 20
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return next;
    });
    setValidationError(null);
  };

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

  const fullInvoiceNumber = `${data.numberPrefix}${data.sequenceNumber}`;

  const calculateSubtotal = () => {
    return data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);
  };

  const subtotal = calculateSubtotal();
  const taxAmount = (subtotal * (data.taxRate || 0)) / 100;
  const discountAmount = (subtotal * (data.discount || 0)) / 100;
  const grandTotal = subtotal + taxAmount - discountAmount;

  // Form Validation
  const validateInvoice = (): boolean => {
    if (!data.senderName.trim()) {
      setValidationError('Please enter your Sender Business / Name.');
      return false;
    }
    if (!data.clientName.trim()) {
      setValidationError('Please enter the Client Name.');
      return false;
    }
    if (data.items.length === 0 || !data.items.some((it) => it.description.trim())) {
      setValidationError('Please add at least one line item with a description.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  // Actions
  const handleClearAll = () => {
    updateData(EMPTY_INVOICE);
    setValidationError(null);
    setAiSuccessMsg('All invoice fields cleared.');
  };

  const handleLoadSample = () => {
    updateData(SAMPLE_INVOICE);
    triggerConfetti();
    setAiSuccessMsg('Loaded realistic sample invoice data.');
  };

  const handleApplyTemplate = (templateKey: string) => {
    const tmpl = TEMPLATES[templateKey];
    if (!tmpl) return;

    updateData((prev) => ({
      ...prev,
      senderName: tmpl.senderName,
      senderEmail: tmpl.senderEmail,
      senderAddress: tmpl.senderAddress,
      clientName: tmpl.clientName,
      clientEmail: tmpl.clientEmail,
      clientAddress: tmpl.clientAddress,
      currency: tmpl.currency,
      taxRate: tmpl.taxRate,
      discount: tmpl.discount,
      notes: tmpl.notes,
      items: tmpl.items.map((it, idx) => ({ ...it, id: Date.now().toString() + idx })),
    }));
    triggerConfetti();
    setAiSuccessMsg(`Applied ${tmpl.name} template.`);
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

  const handleIncrementNumber = () => {
    updateData((prev) => ({
      ...prev,
      sequenceNumber: prev.sequenceNumber + 1,
    }));
  };

  const addItem = () => {
    updateData((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeItem = (id: string) => {
    if (data.items.length <= 1) return;
    updateData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    updateData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    }));
  };

  // Logo Upload & Drag and Drop
  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
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
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  // AI Fill
  const handleAiSmartFill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setAiSuccessMsg('');
    try {
      const res = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        updateData((prev) => ({
          ...prev,
          senderName: d.senderName || prev.senderName,
          senderEmail: d.senderEmail || prev.senderEmail,
          senderAddress: d.senderAddress || prev.senderAddress,
          clientName: d.clientName || prev.clientName,
          clientEmail: d.clientEmail || prev.clientEmail,
          clientAddress: d.clientAddress || prev.clientAddress,
          currency: d.currency && currencySymbols[d.currency] ? d.currency : prev.currency,
          taxRate: typeof d.taxRate === 'number' ? d.taxRate : prev.taxRate,
          discount: typeof d.discount === 'number' ? d.discount : prev.discount,
          notes: d.notes || prev.notes,
          items:
            Array.isArray(d.items) && d.items.length > 0
              ? d.items.map((it: any, idx: number) => ({
                  id: idx.toString() + Date.now(),
                  description: it.description || 'Service Item',
                  quantity: Number(it.quantity) || 1,
                  unitPrice: Number(it.unitPrice) || 100,
                }))
              : prev.items,
        }));
        setAiSuccessMsg('Invoice generated & populated from prompt!');
        triggerConfetti();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Invoice Summary
  const handleCopySummary = () => {
    if (!validateInvoice()) return;

    const itemsSummary = data.items
      .map((it) => `• ${it.description} (${it.quantity}x ${currentSymbol}${it.unitPrice.toFixed(2)}) = ${currentSymbol}${(it.quantity * it.unitPrice).toFixed(2)}`)
      .join('\n');

    const summaryText = `
INVOICE SUMMARY — ${fullInvoiceNumber}
Date: ${data.invoiceDate} | Due: ${data.dueDate}

FROM:
${data.senderName} (${data.senderEmail})
${data.senderAddress}

BILL TO:
${data.clientName} (${data.clientEmail})
${data.clientAddress}

ITEMS:
${itemsSummary}

----------------------------------------
Subtotal: ${currentSymbol}${subtotal.toFixed(2)}
${data.taxRate > 0 ? `Tax (${data.taxRate}%): +${currentSymbol}${taxAmount.toFixed(2)}\n` : ''}${data.discount > 0 ? `Discount (${data.discount}%): -${currentSymbol}${discountAmount.toFixed(2)}\n` : ''}TOTAL DUE: ${currentSymbol}${grandTotal.toFixed(2)}

Notes: ${data.notes || 'N/A'}
`.trim();

    navigator.clipboard.writeText(summaryText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Save to localStorage Saved Invoices
  const handleSaveLocally = () => {
    if (!validateInvoice()) return;

    const title = saveTitle.trim() || `${data.clientName || 'Invoice'} (${fullInvoiceNumber})`;
    const newSaved: SavedInvoice = {
      id: Date.now().toString(),
      savedAt: new Date().toLocaleString(),
      title,
      data: { ...data },
    };

    const updatedList = [newSaved, ...savedInvoices];
    setSavedInvoices(updatedList);
    localStorage.setItem('nuvoratools_saved_invoices', JSON.stringify(updatedList));
    setSaveTitle('');
    setAiSuccessMsg(`Saved "${title}" to local browser storage!`);
    triggerConfetti();
  };

  const handleLoadSavedInvoice = (saved: SavedInvoice) => {
    updateData(saved.data);
    setSavedInvoicesModalOpen(false);
    setAiSuccessMsg(`Loaded saved invoice: ${saved.title}`);
  };

  const handleDeleteSavedInvoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedInvoices.filter((s) => s.id !== id);
    setSavedInvoices(filtered);
    localStorage.setItem('nuvoratools_saved_invoices', JSON.stringify(filtered));
  };

  // PDF Generation with Custom Logo Integration
  const generatePdf = () => {
    if (!validateInvoice()) return;

    const doc = new jsPDF();

    // Dark header bar
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 36, 'F');

    let titleX = 14;
    // Embed custom logo if available
    if (data.logoUrl) {
      try {
        doc.addImage(data.logoUrl, 'PNG', 14, 6, 24, 24);
        titleX = 42;
      } catch (err) {
        console.warn('Logo embed in PDF failed:', err);
      }
    }

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('INVOICE', titleX, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`# ${fullInvoiceNumber}`, 196, 22, { align: 'right' });

    // Dates
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.text(`Date: ${data.invoiceDate}`, 14, 46);
    doc.text(`Due Date: ${data.dueDate}`, 14, 52);

    // Sender & Client Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('FROM:', 14, 64);
    doc.text('BILL TO:', 110, 64);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.senderName || 'N/A', 14, 70);
    doc.text(data.senderEmail || '', 14, 75);
    if (data.senderAddress) {
      const sAddrLines = doc.splitTextToSize(data.senderAddress, 85);
      doc.text(sAddrLines, 14, 80);
    }

    doc.text(data.clientName || 'N/A', 110, 70);
    doc.text(data.clientEmail || '', 110, 75);
    if (data.clientAddress) {
      const cAddrLines = doc.splitTextToSize(data.clientAddress, 85);
      doc.text(cAddrLines, 110, 80);
    }

    // Items Table Header
    let startY = 104;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, startY, 182, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Item Description', 18, startY + 5.5);
    doc.text('Qty', 125, startY + 5.5, { align: 'center' });
    doc.text('Unit Price', 155, startY + 5.5, { align: 'right' });
    doc.text('Total', 192, startY + 5.5, { align: 'right' });

    // Table Items
    let currentY = startY + 14;
    doc.setFont('helvetica', 'normal');

    data.items.forEach((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const descLines = doc.splitTextToSize(item.description || 'Item', 100);
      doc.text(descLines, 18, currentY);
      doc.text(item.quantity.toString(), 125, currentY, { align: 'center' });
      doc.text(`${currentSymbol}${item.unitPrice.toFixed(2)}`, 155, currentY, { align: 'right' });
      doc.text(`${currentSymbol}${lineTotal.toFixed(2)}`, 192, currentY, { align: 'right' });

      const lineIncrement = Math.max(10, descLines.length * 6);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, currentY + lineIncrement - 4, 196, currentY + lineIncrement - 4);
      currentY += lineIncrement;
    });

    // Totals Section
    currentY += 4;
    const totalsX = 130;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, currentY);
    doc.text(`${currentSymbol}${subtotal.toFixed(2)}`, 192, currentY, { align: 'right' });

    if (data.taxRate > 0) {
      currentY += 6;
      doc.text(`Tax (${data.taxRate}%):`, totalsX, currentY);
      doc.text(`${currentSymbol}${taxAmount.toFixed(2)}`, 192, currentY, { align: 'right' });
    }

    if (data.discount > 0) {
      currentY += 6;
      doc.text(`Discount (${data.discount}%):`, totalsX, currentY);
      doc.text(`-${currentSymbol}${discountAmount.toFixed(2)}`, 192, currentY, { align: 'right' });
    }

    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total Due:', totalsX, currentY);
    doc.text(`${currentSymbol}${grandTotal.toFixed(2)}`, 192, currentY, { align: 'right' });

    // Notes
    if (data.notes) {
      currentY += 18;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes & Payment Terms:', 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const notesLines = doc.splitTextToSize(data.notes, 180);
      doc.text(notesLines, 14, currentY + 5);
    }

    doc.save(`${fullInvoiceNumber.toLowerCase()}_invoice.pdf`);
    triggerConfetti();
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Load Sample */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-900 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Invoice</span>
          </button>

          {/* Clear All */}
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear All</span>
          </button>

          {/* Duplicate Invoice */}
          <button
            type="button"
            onClick={handleDuplicate}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
            title="Duplicate invoice with new number"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Duplicate</span>
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

        <div className="flex items-center gap-2">
          {/* Saved Invoices Modal Button */}
          <button
            type="button"
            onClick={() => setSavedInvoicesModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Saved ({savedInvoices.length})</span>
          </button>

          {/* Save Local */}
          <button
            type="button"
            onClick={handleSaveLocally}
            className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Local</span>
          </button>

          {/* Copy Summary */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copySuccess ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Validation Warning Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{validationError}</span>
          </div>
          <button onClick={() => setValidationError(null)} className="p-1 hover:text-red-800">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* AI Smart Fill Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/80 dark:border-blue-900/40 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>AI Natural Language Fill</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          Describe your work, client name, and rate in plain English to automatically fill out invoice fields.
        </p>
        <form onSubmit={handleAiSmartFill} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Invoice $2,400 to TechCorp for 30 hours of React Development with 10% tax..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Auto Fill</span>
          </button>
        </form>
        {aiSuccessMsg && (
          <div className="mt-2 text.xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{aiSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Industry Templates Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Profession Templates
          </h4>
          <span className="text-[10px] text-slate-400">Click to load preset fields & items</span>
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

      {/* Main Grid: Form Editor Left, Live Document Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Logo Section */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Invoice Identity & Logo</span>
              </span>
            </h3>

            {/* Logo Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleLogoDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                isDragging
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
                    <img src={data.logoUrl} alt="Company Logo" className="h-10 w-auto object-contain rounded border bg-white p-1" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Custom Logo Uploaded</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateData((prev) => ({ ...prev, logoUrl: null }));
                    }}
                    className="p-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg font-medium transition-colors"
                  >
                    Remove Logo
                  </button>
                </div>
              ) : (
                <div className="space-y-1 py-1">
                  <Upload className="w-5 h-5 text-indigo-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload Company Logo <span className="font-normal text-slate-400">(Drag & Drop or Click)</span>
                  </p>
                  <p className="text-[10px] text-slate-400">PNG, JPG, SVG, WebP up to 5MB</p>
                </div>
              )}
            </div>

            {/* Numbering & Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Prefix</label>
                <select
                  value={data.numberPrefix}
                  onChange={(e) => updateData((prev) => ({ ...prev, numberPrefix: e.target.value }))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                >
                  <option value="INV-">INV-</option>
                  <option value="FACT-">FACT-</option>
                  <option value="BILL-">BILL-</option>
                  <option value="2026-">2026-</option>
                  <option value="NO-">NO-</option>
                  <option value="">(None)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1 flex items-center justify-between">
                  <span>Seq Number</span>
                  <button
                    type="button"
                    onClick={handleIncrementNumber}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    title="Increment +1"
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
                  onChange={(e) => updateData((prev) => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="BRL">BRL (R$)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Sender */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Your Info (Sender)</span>
                <input
                  type="text"
                  placeholder="Your Business / Full Name *"
                  value={data.senderName}
                  onChange={(e) => updateData((prev) => ({ ...prev, senderName: e.target.value }))}
                  className={`w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white ${
                    validationError && !data.senderName ? 'border-red-400 bg-red-50/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                <input
                  type="email"
                  placeholder="Billing Email address"
                  value={data.senderEmail}
                  onChange={(e) => updateData((prev) => ({ ...prev, senderEmail: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                <textarea
                  placeholder="Address, Phone, Tax/VAT ID"
                  rows={2}
                  value={data.senderAddress}
                  onChange={(e) => updateData((prev) => ({ ...prev, senderAddress: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Client */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Bill To (Client)</span>
                <input
                  type="text"
                  placeholder="Client / Company Name *"
                  value={data.clientName}
                  onChange={(e) => updateData((prev) => ({ ...prev, clientName: e.target.value }))}
                  className={`w-full px-3 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white ${
                    validationError && !data.clientName ? 'border-red-400 bg-red-50/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                <input
                  type="email"
                  placeholder="Client Email"
                  value={data.clientEmail}
                  onChange={(e) => updateData((prev) => ({ ...prev, clientEmail: e.target.value }))}
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

          {/* Line Items Editor */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Line Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60"
                >
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Service or Product description *"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-right"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={data.items.length <= 1}
                      className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 rounded transition-colors"
                      title="Delete line item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations & Taxes */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={data.taxRate}
                  onChange={(e) => updateData((prev) => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={data.discount}
                  onChange={(e) => updateData((prev) => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">Notes & Terms</label>
              <textarea
                rows={2}
                value={data.notes}
                onChange={(e) => updateData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Payment terms, bank wire details, or thank you note..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Live Document Preview Right Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Document Preview
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
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

          {/* Document Sheet Container */}
          <div className="p-8 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-xl space-y-6 font-sans text-xs min-h-[580px]">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                {data.logoUrl && (
                  <img src={data.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
                )}
                <div>
                  <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">INVOICE</span>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">#{fullInvoiceNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{data.senderName || 'Sender Name'}</p>
                <p className="text-slate-500">{data.senderEmail}</p>
                <p className="text-slate-500 whitespace-pre-line text-[10px] mt-0.5">{data.senderAddress}</p>
              </div>
            </div>

            {/* Bill To & Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
                <p className="font-bold text-slate-800">{data.clientName || 'Client Name'}</p>
                <p className="text-slate-500">{data.clientEmail}</p>
                <p className="text-slate-500 whitespace-pre-line text-[10px] mt-0.5">{data.clientAddress}</p>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Date: </span>
                  <span className="font-medium text-slate-700">{data.invoiceDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Payment Due: </span>
                  <span className="font-semibold text-slate-900">{data.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="py-2.5 font-medium">{item.description || '(Blank item)'}</td>
                    <td className="py-2.5 text-center">{item.quantity}</td>
                    <td className="py-2.5 text-right">{currentSymbol}{item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {currentSymbol}{(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Breakdown */}
            <div className="flex justify-end pt-2 border-t border-slate-200">
              <div className="w-56 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{currentSymbol}{subtotal.toFixed(2)}</span>
                </div>
                {data.taxRate > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({data.taxRate}%):</span>
                    <span>+{currentSymbol}{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {data.discount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Discount ({data.discount}%):</span>
                    <span>-{currentSymbol}{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due:</span>
                  <span className="text-indigo-600">{currentSymbol}{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes Footer */}
            {data.notes && (
              <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400">
                <p className="font-bold text-slate-600 uppercase mb-0.5">Notes & Terms</p>
                <p className="whitespace-pre-line">{data.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Invoices Modal */}
      {savedInvoicesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-500" />
                <span>Saved Invoices ({savedInvoices.length})</span>
              </h3>
              <button
                onClick={() => setSavedInvoicesModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Save Current Section */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <label className="block text-slate-500 font-medium">Save Current Invoice</label>
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
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>

            {/* List of Saved */}
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {savedInvoices.length > 0 ? (
                savedInvoices.map((saved) => (
                  <div
                    key={saved.id}
                    onClick={() => handleLoadSavedInvoice(saved)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-950 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {saved.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">Saved at {saved.savedAt}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSavedInvoice(saved.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete saved invoice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No saved invoices found in local browser storage.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
