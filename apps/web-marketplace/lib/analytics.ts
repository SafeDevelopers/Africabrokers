/**
 * Analytics utility for tracking user events
 * Sends events to dataLayer if available, otherwise no-ops
 */

interface CtaEvent {
  name: string;
  context: string;
  url?: string;
}

interface SearchEvent {
  query: string;
  resultsCount?: number;
}

interface TenantEvent {
  tenant: string;
  previous?: string;
}

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Track CTA button clicks
 */
export function trackCta(event: CtaEvent): void {
  if (typeof window === 'undefined') return;
  
  const payload = {
    event: 'cta_click',
    cta_name: event.name,
    cta_context: event.context,
    cta_url: event.url || window.location.pathname,
    timestamp: new Date().toISOString(),
  };

  if (window.dataLayer) {
    window.dataLayer.push(payload);
  }
  
  if (window.gtag) {
    window.gtag('event', 'cta_click', {
      cta_name: event.name,
      cta_context: event.context,
      cta_url: event.url,
    });
  }
}

/**
 * Track search queries
 */
export function trackSearch(event: SearchEvent): void {
  if (typeof window === 'undefined') return;
  
  const payload = {
    event: 'search',
    search_query: event.query,
    search_results: event.resultsCount || 0,
    timestamp: new Date().toISOString(),
  };

  if (window.dataLayer) {
    window.dataLayer.push(payload);
  }
  
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: event.query,
      search_results: event.resultsCount,
    });
  }
}

/**
 * Track tenant changes
 */
export function trackTenantChange(event: TenantEvent): void {
  if (typeof window === 'undefined') return;
  
  const payload = {
    event: 'tenant_change',
    new_tenant: event.tenant,
    previous_tenant: event.previous,
    timestamp: new Date().toISOString(),
  };

  if (window.dataLayer) {
    window.dataLayer.push(payload);
  }
  
  if (window.gtag) {
    window.gtag('event', 'tenant_change', {
      new_tenant: event.tenant,
      previous_tenant: event.previous,
    });
  }
}

/**
 * Track page views
 */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined') return;
  
  const payload = {
    event: 'page_view',
    page_path: path,
    timestamp: new Date().toISOString(),
  };

  if (window.dataLayer) {
    window.dataLayer.push(payload);
  }
  
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
    });
  }
}

