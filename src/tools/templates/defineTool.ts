import { ComponentType } from 'react';
import {
  ToolDefinition,
  ToolCategory,
  ToolDifficulty,
  SearchIntent,
  FAQItem,
  ToolSEO,
} from '../../types/tool';

export interface CreateToolConfig {
  id: string;
  slug?: string;
  title: string;
  shortDescription: string;
  category: ToolCategory;
  icon: string;
  badge?: 'AI' | 'Popular' | 'New' | 'Utility';
  featured?: boolean;
  tags?: string[];
  component: ComponentType<any>;

  // Optional Metadata
  difficulty?: ToolDifficulty;
  popularityScore?: number;
  seoTags?: string[];
  searchIntent?: SearchIntent;
  createdAt?: string;

  // Custom SEO & FAQs overrides
  seo?: Partial<ToolSEO>;
  faq?: FAQItem[];
  howToSteps?: Array<{ stepNumber: number; title: string; description: string }>;
  relatedToolIds?: string[];
}

/**
 * Standardized Tool Builder for NuvoraTools expansion.
 * Automatically generates fallbacks for SEO, FAQs, badges, and metadata.
 */
export function defineTool(config: CreateToolConfig): ToolDefinition {
  const slug = config.slug || config.id;
  const tags = config.tags || [config.category, slug];
  const difficulty = config.difficulty || 'beginner';
  const popularityScore = config.popularityScore ?? 50;
  const searchIntent = config.searchIntent || 'tool';
  const createdAt = config.createdAt || new Date().toISOString().split('T')[0];

  // Default automated SEO fallback
  const defaultSEO: ToolSEO = {
    metaTitle: `${config.title} — Free Online Utility | NuvoraTools`,
    metaDescription: `${config.shortDescription} 100% free, fast, browser-based tool with client-side privacy.`,
    keywords: [
      config.title.toLowerCase(),
      `${config.title.toLowerCase()} online`,
      `free ${config.title.toLowerCase()}`,
      ...tags,
    ],
    ...config.seo,
  };

  // Default automated FAQs fallback
  const defaultFAQ: FAQItem[] = config.faq || [
    {
      question: `Is the ${config.title} free to use?`,
      answer: `Yes, ${config.title} on NuvoraTools is 100% free with unlimited usage, zero paywalls, and no registration required.`,
    },
    {
      question: `Is my data private when using ${config.title}?`,
      answer: `Absolute privacy. All processing runs 100% locally inside your web browser sandbox memory. No inputs or outputs are ever uploaded to an external server.`,
    },
    {
      question: `Does ${config.title} work on mobile devices?`,
      answer: `Yes, NuvoraTools is fully responsive and optimized for smartphones, tablets, and desktop browsers.`,
    },
    {
      question: `Do I need to install any software?`,
      answer: `No installation needed! Everything runs directly in your browser with zero latency and instant results.`,
    },
  ];

  const defaultHowTo = config.howToSteps || [
    {
      stepNumber: 1,
      title: 'Enter Inputs',
      description: `Fill in the required fields or text for ${config.title}.`,
    },
    {
      stepNumber: 2,
      title: 'Process Data',
      description: 'Click the action button or press Cmd/Ctrl + Enter.',
    },
    {
      stepNumber: 3,
      title: 'Copy or Save',
      description: 'Copy the result to your clipboard or download it as a file.',
    },
  ];

  return {
    id: config.id,
    slug,
    title: config.title,
    shortDescription: config.shortDescription,
    category: config.category,
    icon: config.icon,
    badge: config.badge || 'Utility',
    featured: config.featured ?? false,
    tags,
    seo: defaultSEO,
    faq: defaultFAQ,
    relatedToolIds: config.relatedToolIds || [],
    component: config.component,

    difficulty,
    popularityScore,
    seoTags: config.seoTags || tags,
    searchIntent,
    createdAt,
    howToSteps: defaultHowTo,
  };
}
