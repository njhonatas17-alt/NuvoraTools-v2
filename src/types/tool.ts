import { ComponentType } from 'react';

export type ToolCategory = 'generator' | 'calculator' | 'converter' | 'developer' | 'text';

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  iconName: string;
  color: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type ToolDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type SearchIntent = 'informational' | 'transactional' | 'navigational' | 'tool';

export interface ToolSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface ToolDefinition {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: ToolCategory;
  icon: string;
  badge?: 'AI' | 'Popular' | 'New' | 'Utility';
  featured?: boolean;
  tags: string[];
  seo: ToolSEO;
  faq: FAQItem[];
  relatedToolIds: string[];
  component: ComponentType<any>;

  // Extended Metadata for Tool Expansion System
  difficulty?: ToolDifficulty;
  popularityScore?: number; // 0-100 base score
  seoTags?: string[];
  searchIntent?: SearchIntent;
  createdAt?: string; // ISO date YYYY-MM-DD
  howToSteps?: Array<{ stepNumber: number; title: string; description: string }>;
}

export type ThemeMode = 'light' | 'dark' | 'system';
