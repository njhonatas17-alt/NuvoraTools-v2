export interface ToolCollection {
  id: string;
  title: string;
  description: string;
  icon: string;
  toolIds: string[];
}

export const TOOL_COLLECTIONS: ToolCollection[] = [
  {
    id: 'developer-essentials',
    title: 'Developer Essentials',
    description: 'Cryptographic security, UUID identifiers, and code utilities.',
    icon: 'Code',
    toolIds: ['password-generator', 'uuid-generator', 'color-picker-converter', 'qr-code-generator'],
  },
  {
    id: 'business-finance',
    title: 'Business & Billing',
    description: 'Instant AI invoice generators and percentage markup calculators.',
    icon: 'FileText',
    toolIds: ['ai-invoice-generator', 'percentage-calculator'],
  },
  {
    id: 'writing-content',
    title: 'Content & Copywriting',
    description: 'Word counters, reading time estimators, and placeholder generators.',
    icon: 'Sparkles',
    toolIds: ['word-counter', 'lorem-ipsum-generator'],
  },
  {
    id: 'health-converters',
    title: 'Health & Universal Converters',
    description: 'Metric/Imperial converters and BMI health statistics.',
    icon: 'Activity',
    toolIds: ['unit-converter', 'bmi-calculator'],
  },
];
