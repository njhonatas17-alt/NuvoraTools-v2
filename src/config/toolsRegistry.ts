import React, { lazy } from 'react';
import { ToolDefinition, CategoryInfo, ToolCategory } from '../types/tool';
import { defineTool } from '../tools/templates/defineTool';
import { getRankedPopularTools } from '../lib/toolAnalytics';

export { getRankedPopularTools };

// Lazy loaded component imports for code splitting and scalable 500+ tools architecture
const AiInvoiceGenerator = lazy(() => import('../tools/AiInvoiceGenerator'));
const QrCodeGenerator = lazy(() => import('../tools/QrCodeGenerator'));
const PasswordGenerator = lazy(() => import('../tools/PasswordGenerator'));
const UuidGenerator = lazy(() => import('../tools/UuidGenerator'));
const LoremIpsumGenerator = lazy(() => import('../tools/LoremIpsumGenerator'));
const WordCounter = lazy(() => import('../tools/WordCounter'));
const PercentageCalculator = lazy(() => import('../tools/PercentageCalculator'));
const BmiCalculator = lazy(() => import('../tools/BmiCalculator'));
const UnitConverter = lazy(() => import('../tools/UnitConverter'));
const ColorPickerConverter = lazy(() => import('../tools/ColorPickerConverter'));
const WhatsAppLinkGenerator = lazy(() => import('../tools/WhatsAppLinkGenerator'));
const TypingSpeedTest = lazy(() => import('../tools/TypingSpeedTest'));
const Base64Tool = lazy(() => import('../tools/Base64Tool'));
const PDFCompressorTool = lazy(() => import('../tools/PDFCompressorTool'));
const PDFMergerTool = lazy(() => import('../tools/PDFMergerTool'));

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'generator',
    name: 'Generators',
    description: 'Instant document, QR, password, UUID, and text generators.',
    iconName: 'Sparkles',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'calculator',
    name: 'Calculators',
    description: 'Financial, health, percentage, and mathematical calculators.',
    iconName: 'Calculator',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'converter',
    name: 'Converters',
    description: 'Unit, color, file, and data format converters.',
    iconName: 'ArrowLeftRight',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    description: 'Essential web utilities, identifiers, and color pickers.',
    iconName: 'Code',
    color: 'from-rose-500 to-orange-500',
  },
  {
    id: 'text',
    name: 'Text & Writing',
    description: 'Counters, case converters, and placeholder text tools.',
    iconName: 'FileText',
    color: 'from-amber-500 to-yellow-500',
  },
];

export const TOOLS_REGISTRY: ToolDefinition[] = [
  {
    id: 'ai-invoice-generator',
    slug: 'ai-invoice-generator',
    title: 'AI Invoice Generator',
    shortDescription: 'Generate professional invoices from text prompts or manual entries with instant PDF download.',
    category: 'generator',
    icon: 'FileText',
    badge: 'AI',
    featured: true,
    tags: ['invoice', 'pdf', 'billing', 'finance', 'business', 'ai'],
    seo: {
      metaTitle: 'Free AI Invoice Generator - Download PDF Invoices',
      metaDescription: 'Create clean, professional PDF invoices instantly using natural language AI prompts or manual line-item entry. Free, fast, and downloadable in browser.',
      keywords: ['invoice generator', 'ai invoice', 'pdf invoice maker', 'free invoice template', 'online billing tool'],
    },
    faq: [
      { question: 'Is this invoice generator free to use?', answer: 'Yes! You can generate, customize, and download unlimited PDF invoices completely free without creating an account.' },
      { question: 'Is my billing data saved on a server?', answer: 'No. All invoice generation and PDF rendering happens locally inside your browser.' },
      { question: 'How does the AI prompt generation work?', answer: 'You can type a simple phrase like "Invoice $1200 for UI Design for Acme Corp due in 14 days", and AI will parse it into structured items, taxes, and dates.' },
    ],
    relatedToolIds: ['qr-code-generator', 'percentage-calculator', 'word-counter'],
    component: AiInvoiceGenerator,
  },
  {
    id: 'qr-code-generator',
    slug: 'qr-code-generator',
    title: 'QR Code Generator',
    shortDescription: 'Custom QR codes for URLs, WiFi networks, vCards, SMS, emails, and plain text with PNG export.',
    category: 'generator',
    icon: 'QrCode',
    badge: 'Popular',
    featured: true,
    tags: ['qr', 'code', 'wifi', 'vcard', 'marketing', 'generator'],
    seo: {
      metaTitle: 'Free Custom QR Code Generator with Colors & PNG Download',
      metaDescription: 'Generate high-resolution custom QR codes for websites, WiFi passwords, vCard contacts, SMS, and emails. Download instantly as PNG.',
      keywords: ['qr code generator', 'custom qr code', 'wifi qr code', 'vcard qr code maker', 'free qr generator'],
    },
    faq: [
      { question: 'Do these QR codes expire?', answer: 'No! The generated QR codes encode static payload data and will work forever.' },
      { question: 'Can I create a QR code for my home WiFi?', answer: 'Yes, select the "WiFi Network" tab, enter your SSID and password, and guests can scan it to connect instantly!' },
    ],
    relatedToolIds: ['ai-invoice-generator', 'color-picker-converter', 'uuid-generator'],
    component: QrCodeGenerator,
  },
  {
    id: 'password-generator',
    slug: 'password-generator',
    title: 'Strong Password Generator',
    shortDescription: 'Cryptographically secure passwords and memorable passphrases with entropy and crack-time metrics.',
    category: 'developer',
    icon: 'Shield',
    badge: 'Utility',
    featured: true,
    tags: ['password', 'security', 'crypto', 'passphrase', 'generator'],
    seo: {
      metaTitle: 'Secure Password Generator & Passphrase Creator',
      metaDescription: 'Generate cryptographically random passwords and memorable passphrases with entropy analysis and crack time estimates.',
      keywords: ['password generator', 'random password', 'passphrase generator', 'secure password maker'],
    },
    faq: [
      { question: 'Are generated passwords secure?', answer: 'Yes. They use the browser\'s native Web Cryptography API (crypto.getRandomValues) for true randomness.' },
      { question: 'What is a passphrase?', answer: 'A passphrase combines several dictionary words (e.g. correct-horse-battery-staple) making it easy to remember while remaining uncrackable.' },
    ],
    relatedToolIds: ['uuid-generator', 'qr-code-generator'],
    component: PasswordGenerator,
  },
  {
    id: 'uuid-generator',
    slug: 'uuid-generator',
    title: 'UUID / GUID Generator',
    shortDescription: 'Generate bulk RFC4122 UUIDs (v4, v1, v7) with custom formatting, braces, and JSON/TXT export.',
    category: 'developer',
    icon: 'Hash',
    badge: 'Popular',
    featured: false,
    tags: ['uuid', 'guid', 'v4', 'v7', 'developer', 'generator'],
    seo: {
      metaTitle: 'UUID v4 / v1 / v7 Generator & Bulk Exporter',
      metaDescription: 'Generate unique RFC4122 v4, v1, and v7 UUID identifiers in bulk with uppercase, hyphens, and JSON export options.',
      keywords: ['uuid generator', 'guid generator', 'uuid v4', 'uuid v7', 'bulk uuid maker'],
    },
    faq: [
      { question: 'What is UUID v7?', answer: 'UUID v7 is a time-ordered UUID format that includes a 48-bit Unix epoch timestamp, making it ideal for primary keys in databases.' },
      { question: 'Can I generate multiple UUIDs at once?', answer: 'Yes! You can generate up to 100 UUIDs in a single click and download them as TXT or JSON.' },
    ],
    relatedToolIds: ['password-generator', 'lorem-ipsum-generator'],
    component: UuidGenerator,
  },
  {
    id: 'lorem-ipsum-generator',
    slug: 'lorem-ipsum-generator',
    title: 'Lorem Ipsum Generator',
    shortDescription: 'Flexible placeholder text generator with Latin, Developer Jargon, Startup Buzzwords, and HTML tags.',
    category: 'text',
    icon: 'FileText',
    badge: 'Utility',
    featured: false,
    tags: ['lorem', 'ipsum', 'placeholder', 'dummy', 'text', 'developer'],
    seo: {
      metaTitle: 'Lorem Ipsum & Developer Placeholder Text Generator',
      metaDescription: 'Generate clean placeholder text in paragraphs, sentences, or list items with classic Latin, developer, or startup vocabulary.',
      keywords: ['lorem ipsum generator', 'dummy text', 'placeholder text generator', 'developer ipsum'],
    },
    faq: [
      { question: 'What styles are available?', answer: 'Choose between Classic Latin, Developer Jargon (React, Tailwind, Docker), and Startup Tech Buzzwords!' },
    ],
    relatedToolIds: ['word-counter', 'uuid-generator'],
    component: LoremIpsumGenerator,
  },
  {
    id: 'word-counter',
    slug: 'word-counter',
    title: 'Word & Character Counter',
    shortDescription: 'Real-time text statistics, reading time, keyword density analysis, and multi-case converters.',
    category: 'text',
    icon: 'FileText',
    badge: 'Popular',
    featured: true,
    tags: ['word', 'character', 'counter', 'text', 'reading-time', 'case-converter'],
    seo: {
      metaTitle: 'Free Word Counter, Character Count & Reading Time Tool',
      metaDescription: 'Count words, characters, sentences, and paragraphs in real time. Calculate reading and speaking time and convert letter cases.',
      keywords: ['word counter', 'character count', 'reading time calculator', 'case converter'],
    },
    faq: [
      { question: 'Does this count spaces?', answer: 'It displays both Characters (with spaces) and Characters (without spaces) simultaneously.' },
    ],
    relatedToolIds: ['lorem-ipsum-generator', 'ai-invoice-generator'],
    component: WordCounter,
  },
  {
    id: 'percentage-calculator',
    slug: 'percentage-calculator',
    title: 'Percentage Calculator',
    shortDescription: 'Calculate X% of Y, percentage increase/decrease, margin/markup, and tip bill splitting with formulas.',
    category: 'calculator',
    icon: 'Percent',
    badge: 'Utility',
    featured: false,
    tags: ['percentage', 'calculator', 'math', 'tip', 'finance', 'increase'],
    seo: {
      metaTitle: 'Percentage Calculator - % Increase, Decrease & Tip Splitter',
      metaDescription: 'Easily calculate percentages, percentage changes, percentage of totals, and tip bill splitting with step-by-step math formulas.',
      keywords: ['percentage calculator', 'percent change', 'tip calculator', 'discount calculator'],
    },
    faq: [
      { question: 'How is percentage increase calculated?', answer: 'Percentage Increase = ((New Value - Original Value) ÷ Original Value) × 100.' },
    ],
    relatedToolIds: ['bmi-calculator', 'unit-converter'],
    component: PercentageCalculator,
  },
  {
    id: 'bmi-calculator',
    slug: 'bmi-calculator',
    title: 'BMI Health Calculator',
    shortDescription: 'Calculate Body Mass Index (Metric & Imperial), healthy weight range gauge, BMR, and daily calories.',
    category: 'calculator',
    icon: 'Activity',
    badge: 'Utility',
    featured: false,
    tags: ['bmi', 'health', 'fitness', 'weight', 'calories', 'calculator'],
    seo: {
      metaTitle: 'BMI Calculator - Body Mass Index & Ideal Weight Range',
      metaDescription: 'Calculate your BMI using metric (cm/kg) or imperial (ft/in/lbs) units. View your healthy weight range and estimated daily calorie needs.',
      keywords: ['bmi calculator', 'body mass index', 'ideal weight calculator', 'bmr calculator'],
    },
    faq: [
      { question: 'What is a normal BMI range?', answer: 'A normal healthy BMI range for adults is between 18.5 and 24.9.' },
    ],
    relatedToolIds: ['percentage-calculator', 'unit-converter'],
    component: BmiCalculator,
  },
  {
    id: 'unit-converter',
    slug: 'unit-converter',
    title: 'Universal Unit Converter',
    shortDescription: 'Convert length, weight, temperature, area, volume, digital storage, speed, and time with full conversion matrices.',
    category: 'converter',
    icon: 'ArrowLeftRight',
    badge: 'Popular',
    featured: true,
    tags: ['unit', 'converter', 'metric', 'imperial', 'length', 'weight', 'temperature'],
    seo: {
      metaTitle: 'Universal Unit Converter - Metric & Imperial Conversion',
      metaDescription: 'Instant unit converter for length, mass, volume, temperature, area, speed, and digital storage bytes with full unit comparison tables.',
      keywords: ['unit converter', 'metric to imperial', 'length converter', 'temperature converter'],
    },
    faq: [
      { question: 'What units are supported?', answer: 'We support Length, Weight, Temperature, Area, Volume, Digital Data (KB, MB, GB, TB), Speed, and Time!' },
    ],
    relatedToolIds: ['color-picker-converter', 'percentage-calculator'],
    component: UnitConverter,
  },
  {
    id: 'color-picker-converter',
    slug: 'color-picker-converter',
    title: 'Color Picker & HEX/RGB Converter',
    shortDescription: 'Pick colors, convert between HEX, RGB, HSL, CMYK, inspect WCAG contrast legibility, and export 10-step palettes.',
    category: 'converter',
    icon: 'Palette',
    badge: 'Popular',
    featured: true,
    tags: ['color', 'picker', 'hex', 'rgb', 'hsl', 'cmyk', 'wcag', 'palette'],
    seo: {
      metaTitle: 'Color Picker, HEX to RGB Converter & WCAG Contrast Checker',
      metaDescription: 'Convert color codes between HEX, RGB, HSL, and CMYK. Check WCAG AA legibility contrast ratings and generate 10-step color palettes.',
      keywords: ['color picker', 'hex to rgb', 'hsl converter', 'wcag contrast checker', 'color palette generator'],
    },
    faq: [
      { question: 'What is WCAG contrast compliance?', answer: 'WCAG guidelines require text to have a minimum contrast ratio of 4.5:1 against its background for AA readability.' },
    ],
    relatedToolIds: ['unit-converter', 'qr-code-generator'],
    component: ColorPickerConverter,
  },
  {
    id: 'whatsapp-link-generator',
    slug: 'whatsapp-link-generator',
    title: 'WhatsApp Link Generator',
    shortDescription: 'Generate official direct wa.me WhatsApp links with custom messages, country DDI codes, and downloadable QR codes.',
    category: 'generator',
    icon: 'MessageCircle',
    badge: 'Popular',
    featured: true,
    tags: ['whatsapp', 'wa.me', 'link', 'generator', 'qr', 'chat', 'message', 'marketing', 'business'],
    seo: {
      metaTitle: 'Free WhatsApp Link Generator with Pre-Filled Message & QR Code',
      metaDescription: 'Create official wa.me WhatsApp links with pre-filled messages, country flags, and vector PNG/SVG QR codes instantly.',
      keywords: ['whatsapp link generator', 'wa.me generator', 'whatsapp qr code', 'whatsapp direct chat link', 'whatsapp message link'],
    },
    faq: [
      { question: 'Is this WhatsApp link generator free?', answer: 'Yes! You can generate unlimited wa.me links and QR codes completely free.' },
      { question: 'Is my phone number or message saved on a server?', answer: 'No. All link generation and QR code creation execute locally in your client browser.' },
      { question: 'Do wa.me links expire?', answer: 'No. Official wa.me links use static WhatsApp URL structures and will work perpetually.' },
    ],
    relatedToolIds: ['qr-code-generator', 'ai-invoice-generator', 'word-counter'],
    component: WhatsAppLinkGenerator,
  },
  {
    id: 'typing-speed-test',
    slug: 'typing-speed-test',
    title: 'Typing Speed Test',
    shortDescription: 'Test your typing speed in WPM & CPM with real-time accuracy, programmer code mode, and historical records.',
    category: 'developer',
    icon: 'Keyboard',
    badge: 'New',
    featured: true,
    tags: ['typing', 'wpm', 'speed', 'cpm', 'keyboard', 'test', 'accuracy', 'developer', 'code'],
    seo: {
      metaTitle: 'Free Typing Speed Test (WPM & CPM) Online | NuvoraTools',
      metaDescription: 'Test and improve your typing speed in WPM and CPM with real-time accuracy, code modes, and historical performance tracking.',
      keywords: ['typing speed test', 'wpm test', 'words per minute', 'cpm test', 'keyboard speed test', 'code typing test'],
    },
    faq: [
      { question: 'Is this typing speed test free?', answer: 'Yes! You can test your typing speed and practice code modes completely free.' },
      { question: 'How is WPM calculated?', answer: 'WPM is calculated as (Correct Characters / 5) divided by (Time Elapsed in Minutes).' },
      { question: 'Is my typing data saved on a server?', answer: 'No. All score calculations and history run 100% locally in your browser.' },
    ],
    relatedToolIds: ['word-counter', 'uuid-generator', 'lorem-ipsum-generator'],
    component: TypingSpeedTest,
  },
  defineTool({
    id: 'base64-encoder-decoder',
    slug: 'base64-encoder-decoder',
    title: 'Base64 Encoder / Decoder',
    shortDescription: 'Encode text into Base64 or decode Base64 strings back to text instantly with client-side privacy.',
    category: 'developer',
    icon: 'Binary',
    badge: 'Utility',
    featured: false,
    difficulty: 'beginner',
    popularityScore: 75,
    tags: ['base64', 'encode', 'decode', 'developer', 'string', 'binary'],
    component: Base64Tool,
    relatedToolIds: ['uuid-generator', 'password-generator', 'typing-speed-test'],
  }),
  defineTool({
    id: 'pdf-compressor',
    slug: 'pdf-compressor',
    title: 'PDF Compressor',
    shortDescription: 'Comprima arquivos PDF online e gratuitamente no navegador com privacidade total e níveis personalizados.',
    category: 'converter',
    icon: 'FileCheck',
    badge: 'Popular',
    featured: true,
    difficulty: 'beginner',
    popularityScore: 92,
    tags: ['pdf', 'compress', 'reduce size', 'pdf size', 'documents', 'converter', 'optimize'],
    component: PDFCompressorTool,
    relatedToolIds: ['ai-invoice-generator', 'word-counter', 'unit-converter', 'base64-encoder-decoder'],
  }),
];

export function getAllTools(): ToolDefinition[] {
  return TOOLS_REGISTRY;
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS_REGISTRY.find((tool) => tool.slug === slug || tool.id === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS_REGISTRY.filter((tool) => tool.category === category);
}

export function getFeaturedTools(): ToolDefinition[] {
  return TOOLS_REGISTRY.filter((tool) => tool.featured);
}

export function searchTools(query: string): ToolDefinition[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return TOOLS_REGISTRY.filter((tool) => {
    const titleMatch = tool.title.toLowerCase().includes(q);
    const descMatch = tool.shortDescription.toLowerCase().includes(q);
    const categoryMatch = tool.category.toLowerCase().includes(q);
    const tagMatch = tool.tags.some((tag) => tag.toLowerCase().includes(q));
    const keywordMatch = tool.seo.keywords.some((kw) => kw.toLowerCase().includes(q));
    return titleMatch || descMatch || categoryMatch || tagMatch || keywordMatch;
  });
}

export function getRelatedTools(currentToolId: string): ToolDefinition[] {
  const current = TOOLS_REGISTRY.find((t) => t.id === currentToolId);
  if (!current) return [];

  if (current.relatedToolIds && current.relatedToolIds.length > 0) {
    const related = current.relatedToolIds
      .map((id) => TOOLS_REGISTRY.find((t) => t.id === id))
      .filter((t): t is ToolDefinition => Boolean(t));
    if (related.length >= 3) return related;
  }

  // Fallback: tools in same category
  return TOOLS_REGISTRY.filter((t) => t.id !== currentToolId && t.category === current.category).slice(0, 3);
}

export type ToolGoal = 'documents' | 'media' | 'develop' | 'convert' | 'marketing';

export function getToolsByGoal(goal: ToolGoal): ToolDefinition[] {
  switch (goal) {
    case 'documents':
      return TOOLS_REGISTRY.filter(
        (t) =>
          t.category === 'text' ||
          t.tags.some((tag) => ['invoice', 'pdf', 'billing', 'lorem', 'word', 'text', 'document'].includes(tag))
      );
    case 'media':
      return TOOLS_REGISTRY.filter(
        (t) =>
          t.tags.some((tag) => ['qr', 'image', 'color', 'picker', 'hex', 'palette', 'wifi', 'png', 'svg'].includes(tag))
      );
    case 'develop':
      return TOOLS_REGISTRY.filter(
        (t) =>
          t.category === 'developer' ||
          t.tags.some((tag) => ['uuid', 'guid', 'password', 'security', 'code', 'typing', 'wpm', 'developer', 'crypto'].includes(tag))
      );
    case 'convert':
      return TOOLS_REGISTRY.filter(
        (t) =>
          t.category === 'converter' ||
          t.category === 'calculator' ||
          t.tags.some((tag) => ['unit', 'metric', 'converter', 'percentage', 'bmi', 'color', 'conversion'].includes(tag))
      );
    case 'marketing':
      return TOOLS_REGISTRY.filter(
        (t) =>
          t.tags.some((tag) => ['marketing', 'business', 'billing', 'invoice', 'whatsapp', 'wa.me', 'qr', 'finance'].includes(tag))
      );
    default:
      return TOOLS_REGISTRY;
  }
}

