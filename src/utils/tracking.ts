import { getStoreSettings } from './storeSettings';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    ttq: any;
    TiktokAnalyticsObject: any;
  }
}

/**
 * Initialize Facebook (Meta) and TikTok Pixels using localStorage/env IDs.
 */
export const initTracking = () => {
  const settings = getStoreSettings();
  
  // 1. Meta Pixel
  const fbId = settings.fbPixelId;
  if (fbId && !window.fbq) {
    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', fbId);
    window.fbq('track', 'PageView');
  }

  // 2. TikTok Pixel
  const ttId = settings.tiktokPixelId;
  if (ttId && !window.ttq) {
    /* eslint-disable */
    (function (w: any, d: any, t: any) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
      ttq.setAndDefer = function (t: any, e: any) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function (t: any) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) {
          ttq.setAndDefer(e, ttq.methods[n]);
        }
        return e;
      };
      ttq.load = function (e: any, n: any) {
        var r = "https://analytics.tiktok.com/i18n/pixel/events.js", o = n && n.mixpool;
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = r;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        var a = d.createElement("script");
        a.type = "text/javascript";
        a.async = !0;
        a.src = r + "?sdkid=" + e + "&lib=" + t;
        var c = d.getElementsByTagName("script")[0];
        c.parentNode.insertBefore(a, c);
      };
    })(window, document, 'ttq');
    /* eslint-enable */
    window.ttq.load(ttId);
    window.ttq.page();
  }
};

/**
 * Track page view on route transitions.
 */
export const trackPageView = () => {
  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
  // TikTok Pixel
  if (window.ttq) {
    window.ttq.page();
  }
};

/**
 * Track ViewContent (Viewing product page).
 */
export const trackViewContent = (product: { id: number | string; name: string; price: number }) => {
  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: product.name,
      content_ids: [String(product.id)],
      content_type: 'product',
      value: product.price,
      currency: 'EGP',
    });
  }
  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track('ViewContent', {
      contents: [{
        content_id: String(product.id),
        content_name: product.name,
        price: product.price,
      }],
      value: product.price,
      currency: 'EGP',
    });
  }
};

/**
 * Track AddToCart.
 */
export const trackAddToCart = (product: { id: number | string; name: string; price: number }, quantity: number = 1) => {
  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: product.name,
      content_ids: [String(product.id)],
      content_type: 'product',
      value: product.price * quantity,
      currency: 'EGP',
    });
  }
  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track('AddToCart', {
      contents: [{
        content_id: String(product.id),
        content_name: product.name,
        quantity: quantity,
        price: product.price,
      }],
      value: product.price * quantity,
      currency: 'EGP',
    });
  }
};

/**
 * Track InitiateCheckout.
 */
export const trackInitiateCheckout = (cartItems: Array<{ product: { id: number | string; price: number }; quantity: number }>) => {
  const totalValue = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const itemIds = cartItems.map(item => String(item.product.id));

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: itemIds,
      content_type: 'product',
      num_items: cartItems.length,
      value: totalValue,
      currency: 'EGP',
    });
  }
  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track('InitiateCheckout', {
      contents: cartItems.map(item => ({
        content_id: String(item.product.id),
        quantity: item.quantity,
        price: item.product.price,
      })),
      value: totalValue,
      currency: 'EGP',
    });
  }
};

/**
 * Track Purchase (CompletePayment).
 */
export const trackPurchase = (orderId: string, cartItems: Array<{ product: { id: number | string; price: number }; quantity: number }>) => {
  const totalValue = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const itemIds = cartItems.map(item => String(item.product.id));

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: itemIds,
      content_type: 'product',
      value: totalValue,
      currency: 'EGP',
      order_id: orderId,
    });
  }
  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track('CompletePayment', {
      contents: cartItems.map(item => ({
        content_id: String(item.product.id),
        quantity: item.quantity,
        price: item.product.price,
      })),
      value: totalValue,
      currency: 'EGP',
      order_id: orderId,
    });
  }
};
