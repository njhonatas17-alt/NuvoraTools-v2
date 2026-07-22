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
  component: ComponentType;
}

export type ThemeMode = 'light' | 'dark' | 'system';
