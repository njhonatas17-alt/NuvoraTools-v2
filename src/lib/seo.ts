import { ToolDefinition } from '../types/tool';
import { ToolSEOContent } from '../types/seoContent';

export interface SEOData {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogType?: string;
  ogImage?: string;
  tool?: ToolDefinition;
  seoContent?: ToolSEOContent;
  path?: string;
}

export function updateSEO(data: SEOData) {
  const fullTitle = data.title.includes('NuvoraTools') ? data.title : `${data.title} | NuvoraTools`;
  const canonicalDomain = 'https://nuvoratools.com';
  const currentPath = data.path !== undefined ? (data.path === '' ? '' : (data.path.startsWith('/') ? data.path : `/${data.path}`)) : window.location.pathname;
  const canonical = data.canonicalUrl || `${canonicalDomain}${currentPath}`;

  // Update Page Title
  document.title = fullTitle;

  // Helper to set or create meta tag
  const setMeta = (attrName: string, attrVal: string, contentVal: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', contentVal);
  };

  // Helper to set link tag
  const setLink = (relVal: string, hrefVal: string) => {
    let el = document.querySelector(`link[rel="${relVal}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', relVal);
      document.head.appendChild(el);
    }
    el.setAttribute('href', hrefVal);
  };

  // Standard Meta Tags
  setMeta('name', 'description', data.description);
  const keywordsList = data.seoContent?.keywords || data.keywords;
  if (keywordsList && keywordsList.length > 0) {
    setMeta('name', 'keywords', keywordsList.join(', '));
  }
  setLink('canonical', canonical);

  const imgUrl = data.ogImage || `${canonicalDomain}/pwa-icon.svg`;

  // Open Graph
  const ogTitle = data.seoContent?.ogTitle || fullTitle;
  const ogDesc = data.seoContent?.ogDescription || data.description;
  setMeta('property', 'og:title', ogTitle);
  setMeta('property', 'og:description', ogDesc);
  setMeta('property', 'og:type', data.ogType || 'website');
  setMeta('property', 'og:url', canonical);
  setMeta('property', 'og:site_name', 'NuvoraTools');
  setMeta('property', 'og:image', imgUrl);

  // Twitter Cards
  const twitterTitle = data.seoContent?.twitterTitle || fullTitle;
  const twitterDesc = data.seoContent?.twitterDescription || data.description;
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', twitterTitle);
  setMeta('name', 'twitter:description', twitterDesc);
  setMeta('name', 'twitter:image', imgUrl);

  // Inject JSON-LD Structured Data
  injectJSONLD(data, canonicalDomain, canonical);
}

function injectJSONLD(data: SEOData, domain: string, canonical: string) {
  // Remove existing dynamic JSON-LD scripts
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"].nuvoratools-jsonld');
  existingScripts.forEach((script) => script.remove());

  const schemas: any[] = [];

  // 1. Organization Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'NuvoraTools',
    'url': domain,
    'logo': `${domain}/pwa-icon.svg`,
    'description': 'Free online browser-based developer tools and utilities suite.',
  });

  // 2. WebSite Schema with SearchAction
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'NuvoraTools',
    'url': domain,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${domain}/?s={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  });

  // 3. BreadcrumbList Schema
  if (data.tool) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': domain
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': data.tool.category.toUpperCase(),
          'item': `${domain}/category/${data.tool.category}`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': data.tool.title,
          'item': canonical
        }
      ]
    });

    // 4. SoftwareApplication Schema for Tool
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': data.tool.title,
      'operatingSystem': 'Any / Web Browser',
      'applicationCategory': 'DeveloperApplication',
      'description': data.description || data.tool.shortDescription,
      'url': canonical,
      'offers': {
        '@type': 'Offer',
        'price': '0.00',
        'priceCurrency': 'USD'
      }
    });

    // 5. FAQPage Schema if FAQs present
    const faqItems = data.seoContent?.faq || data.tool.faq;
    if (faqItems && faqItems.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqItems.map((f) => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.answer
          }
        }))
      });
    }

    // 6. HowTo Schema if step-by-step instructions present
    if (data.seoContent?.howToSteps && data.seoContent.howToSteps.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': `How to use ${data.tool.title}`,
        'description': `Step by step guide on using ${data.tool.title} on NuvoraTools.`,
        'step': data.seoContent.howToSteps.map((s) => ({
          '@type': 'HowToStep',
          'position': s.stepNumber,
          'name': s.title,
          'text': s.description,
        }))
      });
    }
  }

  // Append script tags to document head
  schemas.forEach((schema) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.className = 'nuvoratools-jsonld';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

