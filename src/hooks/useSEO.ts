import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  /** Optional JSON-LD structured data object (will be serialized to script tag) */
  jsonLd?: Record<string, unknown>;
  /** noindex — set true for admin/auth pages */
  noindex?: boolean;
}

const SITE_NAME = 'متجر البط';
const BASE_URL = 'https://www.elbat.store';
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(data: Record<string, unknown>) {
  const id = 'seo-json-ld';
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd() {
  const el = document.getElementById('seo-json-ld');
  if (el) el.remove();
}

export function useSEO({
  title,
  description = 'متجر البط — وجهتك الأولى لأفضل البيجامات وملابس النوم المريحة. شحن سريع لجميع أنحاء مصر.',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  jsonLd,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL + window.location.pathname;

    // Document title
    document.title = fullTitle;

    // Standard Meta Tags
    setMeta('description', description);
    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow');
    }

    // Canonical URL
    let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', image, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // JSON-LD
    if (jsonLd) {
      setJsonLd(jsonLd);
    } else {
      removeJsonLd();
    }

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = `${SITE_NAME} | أحدث صيحات البيجامات وملابس النوم المريحة`;
    };
  }, [title, description, image, url, type, jsonLd, noindex]);
}
