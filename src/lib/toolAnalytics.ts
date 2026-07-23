import { ToolDefinition } from '../types/tool';

const USAGE_STORAGE_KEY = 'nuvoratools_usage_analytics_v1';

/**
 * Get local usage counts for all tools from localStorage.
 */
export function getLocalToolUsage(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to read local tool usage', e);
    return {};
  }
}

/**
 * Increment usage counter for a given tool ID.
 */
export function recordLocalToolUsage(toolId: string): void {
  if (typeof window === 'undefined' || !toolId) return;
  try {
    const usage = getLocalToolUsage();
    usage[toolId] = (usage[toolId] || 0) + 1;
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
  } catch (e) {
    console.error('Failed to record local tool usage', e);
  }
}

/**
 * Dynamically calculate and rank popular tools based on:
 * - Base popularity score
 * - User favorites
 * - Local usage frequency
 * - Featured & Popular badges
 */
export function getRankedPopularTools(
  tools: ToolDefinition[],
  favoriteIds: string[] = [],
  limit = 6
): ToolDefinition[] {
  const usageMap = getLocalToolUsage();

  const scoredTools = tools.map((tool) => {
    let score = tool.popularityScore ?? 50;

    // Favorited bonus (+30)
    if (favoriteIds.includes(tool.id)) {
      score += 30;
    }

    // Local usage visits (+5 per visit, capped at +50)
    const visits = usageMap[tool.id] || 0;
    score += Math.min(visits * 5, 50);

    // Badge / Featured bonus
    if (tool.badge === 'Popular') score += 20;
    if (tool.featured) score += 15;
    if (tool.badge === 'AI') score += 10;

    return { tool, score };
  });

  // Sort descending by score
  scoredTools.sort((a, b) => b.score - a.score);

  return scoredTools.slice(0, limit).map((item) => item.tool);
}
