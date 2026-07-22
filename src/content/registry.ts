import { ToolDefinition } from '../types/tool';
import { ToolSEOContent } from '../types/seoContent';
import { generateSEOContent } from '../lib/seoEngine';

import { aiInvoiceGeneratorSEO } from './tools/ai-invoice-generator';
import { qrCodeGeneratorSEO } from './tools/qr-code-generator';
import { passwordGeneratorSEO } from './tools/password-generator';
import { uuidGeneratorSEO } from './tools/uuid-generator';
import { loremIpsumGeneratorSEO } from './tools/lorem-ipsum-generator';
import { wordCounterSEO } from './tools/word-counter';
import { percentageCalculatorSEO } from './tools/percentage-calculator';
import { bmiCalculatorSEO } from './tools/bmi-calculator';
import { unitConverterSEO } from './tools/unit-converter';
import { colorPickerConverterSEO } from './tools/color-picker-converter';

/**
 * Custom SEO content registry map for hand-crafted tool content files.
 */
const CUSTOM_SEO_MAP: Record<string, ToolSEOContent> = {
  'ai-invoice-generator': aiInvoiceGeneratorSEO,
  'qr-code-generator': qrCodeGeneratorSEO,
  'password-generator': passwordGeneratorSEO,
  'uuid-generator': uuidGeneratorSEO,
  'lorem-ipsum-generator': loremIpsumGeneratorSEO,
  'word-counter': wordCounterSEO,
  'percentage-calculator': percentageCalculatorSEO,
  'bmi-calculator': bmiCalculatorSEO,
  'unit-converter': unitConverterSEO,
  'color-picker-converter': colorPickerConverterSEO,
};

/**
 * Retrieves structured SEO content for any tool.
 * Loads dedicated content file if available, or automatically generates complete, unique,
 * compliant SEO content via the automated SEO Engine (enabling seamless scaling to 500+ tools).
 */
export function getToolSEOContent(tool: ToolDefinition): ToolSEOContent {
  if (!tool) return generateSEOContent(tool);

  const customContent = CUSTOM_SEO_MAP[tool.id] || CUSTOM_SEO_MAP[tool.slug];
  if (customContent) {
    return customContent;
  }

  // Fallback to dynamic automated generation engine for scalable 500+ tools
  return generateSEOContent(tool);
}
