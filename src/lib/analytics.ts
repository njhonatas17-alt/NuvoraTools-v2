// Analytics & Telemetry Layer Ready for GA4, GSC & Clarity

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const ANALYTICS_CONFIG = {
  // Integration placeholders (Users can set these via env or runtime if desired)
  gaMeasurementId: ((import.meta as any).env?.VITE_GA_MEASUREMENT_ID) || '',
  clarityProjectId: ((import.meta as any).env?.VITE_CLARITY_PROJECT_ID) || '',
  googleSiteVerification: ((import.meta as any).env?.VITE_GSC_VERIFICATION_TAG) || '',
};

export function initAnalytics() {
  if (typeof window === 'undefined') return;

  // Google Search Console Meta Verification Tag
  if (ANALYTICS_CONFIG.googleSiteVerification) {
    let el = document.querySelector('meta[name="google-site-verification"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'google-site-verification');
      document.head.appendChild(el);
    }
    el.setAttribute('content', ANALYTICS_CONFIG.googleSiteVerification);
  }

  // GA4 Script Injection (if Measurement ID is present)
  if (ANALYTICS_CONFIG.gaMeasurementId && !document.getElementById('ga4-script')) {
    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.gaMeasurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_CONFIG.gaMeasurementId, {
      send_page_view: false, // We dispatch pageviews manually via SPA router
    });
  }

  // Microsoft Clarity Injection (if Project ID is present)
  if (ANALYTICS_CONFIG.clarityProjectId && !document.getElementById('clarity-script')) {
    const script = document.createElement('script');
    script.id = 'clarity-script';
    script.type = 'text/javascript';
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${ANALYTICS_CONFIG.clarityProjectId}");
    `;
    document.head.appendChild(script);
  }
}

// Track SPA Page Views
export function trackPageView(path: string, title?: string) {
  if (window.gtag && ANALYTICS_CONFIG.gaMeasurementId) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

// Track Tool Interactions & Tool Usage
export function trackToolUsage(toolSlug: string, actionName: string = 'use') {
  if (window.gtag) {
    window.gtag('event', 'tool_usage', {
      tool_slug: toolSlug,
      action: actionName,
    });
  }
  if (window.clarity) {
    window.clarity('event', `tool_${actionName}_${toolSlug}`);
  }
}

// Track Custom Search Queries
export function trackSearch(query: string, resultsCount: number) {
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: query,
      results_count: resultsCount,
    });
  }
}
