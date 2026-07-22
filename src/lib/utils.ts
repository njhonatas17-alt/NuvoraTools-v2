import confetti from 'canvas-confetti';

export function triggerConfetti() {
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#3b82f6', '#10b981', '#6366f1', '#f59e0b']
  });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

export function updateMetaTags(title: string, description: string) {
  document.title = `${title} | NuvoraTools`;
  
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);
}

// LocalStorage helpers for Favorites and Recently Used Tools
const FAVORITES_KEY = 'nuvoratools_favorites';
const RECENT_KEY = 'nuvoratools_recently_used';

export function getFavoriteToolIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY) || localStorage.getItem('toolhub_favorites');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteTool(id: string): string[] {
  const current = getFavoriteToolIds();
  const exists = current.includes(id);
  const updated = exists ? current.filter(item => item !== id) : [...current, id];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function getRecentlyUsedToolIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY) || localStorage.getItem('toolhub_recently_used');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function trackRecentlyUsedTool(id: string): string[] {
  const current = getRecentlyUsedToolIds();
  const filtered = current.filter(item => item !== id);
  const updated = [id, ...filtered].slice(0, 8); // Keep last 8
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return updated;
}
