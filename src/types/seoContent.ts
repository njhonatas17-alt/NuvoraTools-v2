export interface HowToStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolSEOContent {
  toolId: string;
  seoTitle: string; // Max 60 characters
  metaDescription: string; // Max 160 characters
  h1: string;
  introduction: string; // 300-500 words
  howToSteps: HowToStep[];
  features: string[];
  benefits: string[];
  commonUseCases: string[];
  tipsAndBestPractices: string[];
  faq: FAQItem[]; // 8-10 questions and answers
  relatedToolIds?: string[];
  conclusion: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
}
