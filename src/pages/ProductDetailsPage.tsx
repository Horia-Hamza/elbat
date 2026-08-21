import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Plus, Minus, ShoppingCart, ArrowRight, ChevronLeft, ChevronRight, Loader2, Heart } from 'lucide-react';
import type { ApiProduct } from '../types/api';
import { productsApi, productImagesApi } from '../api/products';
import { productVariantsApi } from '../api/productVariants';
import { IMAGES_BASE_URL } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { trackViewContent } from '../utils/tracking';
import { useSEO } from '../hooks/useSEO';

interface ProductDetailsPageProps {
  onAddToCart: (product: ApiProduct, quantity: number, color?: string, size?: string) => void;
  onQuickAddToCart: (product: ApiProduct, e: React.MouseEvent) => void;
  onBuyNow: (product: ApiProduct, quantity: number, color?: string, size?: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  onAddToCart,
  onQuickAddToCart,
  onBuyNow,
  favorites,
  onToggleFavorite
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ApiProduct | null>(null);

  // Build SEO data from product
  const seoData = useMemo(() => {
    if (!product) return {
      title: 'جاري التحميل... | متجر البطّ',
      description: 'متجر البطّ — منتجات مبتكرة للمنزل والعناية الشخصية.',
    };
    const price = product.salePrice ?? product.basePrice;
    const mainImage = product.mainImageUrl
      ? (product.mainImageUrl.startsWith('http') ? product.mainImageUrl : `${IMAGES_BASE_URL}${product.mainImageUrl}`)
      : 'https://www.elbat.store/logo.png';
    const description = product.description || product.shortDescription
      || `اشتري ${product.name} من متجر البطّ بسعر ${price} ج.م. شحن سريع لجميع أنحاء مصر.`;

    const jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description,
      image: mainImage,
      sku: product.sku || String(product.id),
      brand: product.brandName || product.brand?.name
        ? { '@type': 'Brand', name: product.brandName || product.brand?.name }
        : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EGP',
        price: String(price),
        availability: product.inStock === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        url: `https://www.elbat.store/product/${product.id}`,
        seller: { '@type': 'Organization', name: 'متجر البطّ' },
      },
    };

    return {
      title: `${product.name} | متجر البطّ`,
      description: description.slice(0, 160),
      image: mainImage,
      url: `/product/${product.id}`,
      type: 'product' as const,
      jsonLd,
    };
  }, [product]);

  useSEO(seoData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [iframeHeight, setIframeHeight] = useState<string>('100vh');

  // Swipe logic
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const relatedScrollRef = useRef<HTMLDivElement>(null);

  const scrollRelated = (direction: 'left' | 'right') => {
    if (relatedScrollRef.current) {
      const scrollAmount = 300;
      relatedScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const productImages = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];

    const resolve = (u: string) => {
      if (!u) return '';
      return u.startsWith('http') ? u : `${IMAGES_BASE_URL}${u}`;
    };

    if (product.mainImageUrl) {
      const mainFull = resolve(product.mainImageUrl);
      if (mainFull) list.push(mainFull);
    }

    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        const u = img.imageUrl || img.url || '';
        if (u) {
          const full = resolve(u);
          if (full && !list.includes(full)) {
            list.push(full);
          }
        }
      });
    }

    return list;
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);

    if (id) {
      setLoading(true);
      productsApi.getProductById(Number(id))
        .then((data) => {
          setProduct(data);
          trackViewContent({
            id: data.id,
            name: data.name,
            price: data.salePrice !== null && data.salePrice !== undefined ? data.salePrice : data.basePrice
          });
          setQuantity(1);
          setError(null);

          // Fetch additional product images dynamically
          productImagesApi.getImagesByProductId(Number(id))
            .then((imgs) => {
              if (imgs && imgs.length > 0) {
                setProduct(prev => prev ? { ...prev, images: imgs } : prev);
              }
            })
            .catch(err => console.warn('Could not fetch product images:', err));

          // Fetch variants dynamically to guarantee full variants list is populated
          productVariantsApi.getByProduct(Number(id))
            .then((vars) => {
              if (vars && vars.length > 0) {
                setProduct(prev => prev ? { ...prev, variants: vars } : prev);
                const firstColor = vars.find(v => v.type === 1 || (v as any).color)?.name || vars.find(v => v.type === 1 || (v as any).color)?.value || '';
                const firstSize = vars.find(v => v.type === 2 || (v as any).size)?.value || vars.find(v => v.type === 2 || (v as any).size)?.name || '';
                if (firstColor) setSelectedColor(firstColor);
                if (firstSize) setSelectedSize(firstSize);
              }
            })
            .catch(err => console.warn('Could not fetch variants:', err));
        })
        .catch((err) => {
          setError(err.message || 'Error fetching product');
        })
        .finally(() => setLoading(false));

      productsApi.getRelatedProducts(Number(id), 5)
        .then((data) => {
          setRelatedProducts(data);
        })
        .catch((err) => {
          console.error('Error fetching related products:', err);
        });
    }
  }, [id]);

  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ADD_TO_CART') {
        const qty = event.data.quantity || 1;
        if (product) {
          onAddToCart(product, qty, selectedColor, selectedSize);
        }
      }
      if (event.data && event.data.type === 'BUY_NOW') {
        const qty = event.data.quantity || 1;
        if (product) {
          onBuyNow(product, qty, selectedColor, selectedSize);
        }
      }
      if (event.data && event.data.type === 'ADD_TO_WISHLIST') {
        if (product) {
          const mockEvent = {
            stopPropagation: () => { },
            preventDefault: () => { }
          } as unknown as React.MouseEvent;
          onToggleFavorite(String(product.id), mockEvent);
        }
      }
      if (event.data && event.data.type === 'RESIZE') {
        setIframeHeight(`${event.data.height}px`);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [product, selectedColor, selectedSize, onAddToCart, onToggleFavorite]);

  if (loading) {
    return (
      <div className="pdp-not-found" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="spinner" size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ marginTop: '1rem', color: 'var(--primary-dark)' }}>جاري تحميل المنتج...</h2>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pdp-not-found">
        <h2>عذراً، المنتج غير موجود!</h2>
        <p>{error || 'ربما تم حذفه أو الرابط غير صحيح.'}</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // If the product has a custom HTML template embedded in the response, resolve placeholders
  let customHtml = '';
  if (product.pageDesign) {
    const mainImgUrl = product.mainImageUrl
      ? (product.mainImageUrl.startsWith('http') ? product.mainImageUrl : `${IMAGES_BASE_URL}${product.mainImageUrl}`)
      : '/logo.png';

    const brand = product.brandName || product.brand?.name || '—';
    const subCat = product.subCategoryName || product.subCategory?.name || '—';
    const desc = product.description || product.shortDescription || '';
    const salePriceVal = product.salePrice !== null && product.salePrice !== undefined ? product.salePrice : product.basePrice;

    // Replace placeholders in the template
    const replaceAll = (t: string, p: string, v: string) => t.split(p).join(v);
    customHtml = product.pageDesign;

    // Strip hardcoded static variant selectors (like static S/M/L size buttons) from saved pageDesign string
    if (customHtml.includes('selectors-section')) {
      const selectorsRegex = /<div class="selectors-section"[\s\S]*?(?=<!-- Desktop Buttons -->|<div class="desktop-actions">)/i;
      customHtml = customHtml.replace(selectorsRegex, '<div class="selectors-section" id="selectors-section" style="display: none;"></div>\n');
    }

    customHtml = replaceAll(customHtml, '{{name}}', product.name || '');
    customHtml = replaceAll(customHtml, '{{mainImageUrl}}', mainImgUrl);
    customHtml = replaceAll(customHtml, '{{brandName}}', brand);
    customHtml = replaceAll(customHtml, '{{subCategoryName}}', subCat);
    customHtml = replaceAll(customHtml, '{{description}}', desc);
    customHtml = replaceAll(customHtml, '{{basePrice}}', `${product.basePrice}`);
    customHtml = replaceAll(customHtml, '{{salePrice}}', `${salePriceVal}`);
    customHtml = replaceAll(customHtml, '{{sku}}', product.sku || '');
    const variantsJson = JSON.stringify(product.variants || []);
    const variantScriptToInject = `
      try {
        function renderVariantsList(productVariants) {
          const container = document.getElementById('selectors-section') || document.querySelector('.selectors-section');
          if (!container) return;
          container.innerHTML = '';
          if (!productVariants || !Array.isArray(productVariants) || productVariants.length === 0) {
            container.style.display = 'none';
            return;
          }

          const TYPE_NAMES = {
            1: 'اللون المتوفر:',
            2: 'المقاس المتوفر:',
            3: 'الخامة المتوفرة:',
            4: 'الستايل المتوفر:',
            5: 'الخيارات المتاحة:'
          };

          const targetPid = "${product.id}";
          const activeVars = productVariants.filter(v => v && v.isActive !== false && (!v.productId || String(v.productId) === String(targetPid)));
          const groups = {};
          activeVars.forEach(v => {
            const t = (v.type !== undefined && v.type !== null && v.type !== 0) ? v.type : (v.color ? 1 : v.size ? 2 : 5);
            if (!groups[t]) groups[t] = [];
            groups[t].push(v);
          });

          const groupKeys = Object.keys(groups);
          if (groupKeys.length === 0) {
            container.style.display = 'none';
            container.innerHTML = '';
            return;
          }

          container.innerHTML = '';
          container.style.display = 'flex';
          container.style.flexDirection = 'column';

          groupKeys.forEach(typeStr => {
            const type = parseInt(typeStr);
            const items = groups[type];
            if (!items || items.length === 0) return;

            const groupDiv = document.createElement('div');
            groupDiv.className = 'selector-group';
            groupDiv.style.marginBottom = '1rem';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'selector-title';
            titleDiv.style.display = 'flex';
            titleDiv.style.alignItems = 'center';
            titleDiv.style.justifyContent = 'space-between';
            titleDiv.style.flexWrap = 'wrap';
            titleDiv.style.gap = '0.4rem';

            function updateTitleWithStock(t, item) {
              const qty = item.inventory ? (item.inventory.availableQuantity !== undefined ? item.inventory.availableQuantity : item.inventory.quantity) : null;
              let stockBadge = '';
              if (qty !== null && qty !== undefined) {
                const isLow = qty <= 5;
                const bg = isLow ? '#FEF3C7' : '#E6F4FA';
                const fg = isLow ? '#D97706' : '#236B93';
                const border = isLow ? '#F59E0B' : '#BAE6FD';
                stockBadge = '<span style="font-size:0.78rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:6px; background:' + bg + '; color:' + fg + '; border:1px solid ' + border + ';">المتبقي: ' + qty + ' قطعة</span>';
              }
              const nameVal = item.name || item.value || '';
              titleDiv.innerHTML = '<span>' + (TYPE_NAMES[t] || 'الخيار المتوفر:') + ' <span class="selected-val" style="color:var(--primary, #236B93); font-weight:800; margin-right:0.3rem;">' + nameVal + '</span></span>' + stockBadge;
            }

            updateTitleWithStock(type, items[0]);
            groupDiv.appendChild(titleDiv);

            let optionsDiv = document.createElement('div');

          function updateLowStockBanner(v) {
            let alertBanner = document.getElementById('low-stock-alert-banner');
            if (!v || !v.inventory) {
              if (alertBanner) alertBanner.style.display = 'none';
              return;
            }
            const inv = v.inventory;
            const isLow = inv.isLowStock === true || (inv.availableQuantity !== undefined && inv.lowStockThreshold !== undefined && inv.availableQuantity <= inv.lowStockThreshold && inv.availableQuantity > 0);
            const qty = inv.availableQuantity !== undefined ? inv.availableQuantity : inv.quantity;
            if (isLow && qty !== null && qty !== undefined && qty > 0) {
              if (!alertBanner) {
                alertBanner = document.createElement('div');
                alertBanner.id = 'low-stock-alert-banner';
                alertBanner.style.cssText = 'background: linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(254, 215, 170, 0.95) 100%); border: 1px solid #F59E0B; color: #B45309; border-radius: 12px; padding: 0.65rem 1rem; margin: 0.75rem 0 1rem 0; display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; font-weight: 700; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.15); transition: all 0.3s ease;';
                const refTarget = document.querySelector('.price-box') || container;
                if (refTarget && refTarget.parentNode) {
                  refTarget.parentNode.insertBefore(alertBanner, refTarget.nextSibling);
                } else if (container && container.parentNode) {
                  container.parentNode.insertBefore(alertBanner, container);
                }
              }
              alertBanner.style.display = 'flex';
              alertBanner.innerHTML = '<span style="font-size:1.25rem;">🔥</span> <span>سارع بالطلب! متبقي <strong style="color:#D97706; font-size:0.95rem;">' + qty + '</strong> قطع فقط في المخزون — اطلب الآن قبل نفاذ الكمية</span>';
            } else if (alertBanner) {
              alertBanner.style.display = 'none';
            }
          }

          if (type === 1) { // Color
              optionsDiv.className = 'color-options';
              optionsDiv.style.display = 'flex';
              optionsDiv.style.gap = '0.75rem';
              optionsDiv.style.flexWrap = 'wrap';
              optionsDiv.style.alignItems = 'center';
              items.forEach((v, idx) => {
                const dot = document.createElement('div');
                dot.className = 'color-dot' + (idx === 0 ? ' selected' : '');
                let val = (v.value || v.name || '').trim();
                let hex = val.startsWith('#') ? val : (val.length === 6 || val.length === 3 ? '#' + val : val);
                dot.style.backgroundColor = hex || '#236B93';
                dot.style.width = '34px';
                dot.style.height = '34px';
                dot.style.borderRadius = '50%';
                dot.style.cursor = 'pointer';
                dot.style.border = idx === 0 ? '3px solid var(--primary, #236B93)' : '2px solid white';
                dot.style.outline = idx === 0 ? '2px solid var(--primary, #236B93)' : '1px solid #E2E8F0';
                dot.title = v.name || v.value;
                dot.onclick = function() {
                  optionsDiv.querySelectorAll('.color-dot').forEach(d => {
                    d.classList.remove('selected');
                    d.style.border = '2px solid white';
                    d.style.outline = '1px solid #E2E8F0';
                  });
                  dot.classList.add('selected');
                  dot.style.border = '3px solid var(--primary, #236B93)';
                  dot.style.outline = '2px solid var(--primary, #236B93)';
                  updateTitleWithStock(type, v);
                  updateLowStockBanner(v);
                };
                optionsDiv.appendChild(dot);
              });
            } else if (type === 2) { // Size
              optionsDiv.className = 'size-options';
              optionsDiv.style.display = 'flex';
              optionsDiv.style.gap = '0.5rem';
              optionsDiv.style.flexWrap = 'wrap';
              items.forEach((v, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'size-btn' + (idx === 0 ? ' selected' : '');
                btn.textContent = (v.value || v.name).toUpperCase();
                btn.style.padding = '0.5rem 1rem';
                btn.style.borderRadius = '8px';
                btn.style.border = idx === 0 ? '2px solid var(--primary, #236B93)' : '1px solid #E2E8F0';
                btn.style.backgroundColor = idx === 0 ? '#E6F4FA' : 'white';
                btn.style.color = idx === 0 ? 'var(--primary, #236B93)' : '#0F172A';
                btn.style.fontWeight = idx === 0 ? '800' : '600';
                btn.style.cursor = 'pointer';
                btn.style.minWidth = '44px';
                btn.onclick = function() {
                  optionsDiv.querySelectorAll('.size-btn').forEach(b => {
                    b.classList.remove('selected');
                    b.style.border = '1px solid #E2E8F0';
                    b.style.backgroundColor = 'white';
                    b.style.color = '#0F172A';
                    b.style.fontWeight = '600';
                  });
                  btn.classList.add('selected');
                  btn.style.border = '2px solid var(--primary, #236B93)';
                  btn.style.backgroundColor = '#E6F4FA';
                  btn.style.color = 'var(--primary, #236B93)';
                  btn.style.fontWeight = '800';
                  updateTitleWithStock(type, v);
                  updateLowStockBanner(v);
                };
                optionsDiv.appendChild(btn);
              });
            } else if (type === 3) {
              optionsDiv.className = 'material-options';
              optionsDiv.style.display = 'flex';
              optionsDiv.style.gap = '0.5rem';
              optionsDiv.style.flexWrap = 'wrap';
              items.forEach((v, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'material-btn' + (idx === 0 ? ' selected' : '');
                btn.innerHTML = '🧵 ' + (v.name || v.value);
                btn.style.padding = '0.5rem 1rem';
                btn.style.borderRadius = '20px';
                btn.style.border = idx === 0 ? '2px solid var(--primary, #236B93)' : '1px solid #E2E8F0';
                btn.style.backgroundColor = idx === 0 ? '#E6F4FA' : '#F8FAFC';
                btn.style.color = idx === 0 ? 'var(--primary, #236B93)' : '#0F172A';
                btn.style.fontWeight = idx === 0 ? '800' : '600';
                btn.style.cursor = 'pointer';
                btn.onclick = function() {
                  optionsDiv.querySelectorAll('.material-btn').forEach(b => {
                    b.classList.remove('selected');
                    b.style.border = '1px solid #E2E8F0';
                    b.style.backgroundColor = '#F8FAFC';
                    b.style.color = '#0F172A';
                    b.style.fontWeight = '600';
                  });
                  btn.classList.add('selected');
                  btn.style.border = '2px solid var(--primary, #236B93)';
                  btn.style.backgroundColor = '#E6F4FA';
                  btn.style.color = 'var(--primary, #236B93)';
                  btn.style.fontWeight = '800';
                  updateTitleWithStock(type, v);
                  updateLowStockBanner(v);
                };
                optionsDiv.appendChild(btn);
              });
            } else if (type === 4) {
              optionsDiv.className = 'style-options';
              optionsDiv.style.display = 'flex';
              optionsDiv.style.gap = '0.5rem';
              optionsDiv.style.flexWrap = 'wrap';
              items.forEach((v, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'style-btn' + (idx === 0 ? ' selected' : '');
                btn.innerHTML = '✨ ' + (v.name || v.value);
                btn.style.padding = '0.55rem 1.1rem';
                btn.style.borderRadius = '10px';
                btn.style.border = idx === 0 ? '2px solid var(--primary, #236B93)' : '1px solid #E2E8F0';
                btn.style.backgroundColor = idx === 0 ? '#E6F4FA' : 'white';
                btn.style.color = idx === 0 ? 'var(--primary, #236B93)' : '#0F172A';
                btn.style.fontWeight = idx === 0 ? '800' : '600';
                btn.style.cursor = 'pointer';
                btn.onclick = function() {
                  optionsDiv.querySelectorAll('.style-btn').forEach(b => {
                    b.classList.remove('selected');
                    b.style.border = '1px solid #E2E8F0';
                    b.style.backgroundColor = 'white';
                    b.style.color = '#0F172A';
                    b.style.fontWeight = '600';
                  });
                  btn.classList.add('selected');
                  btn.style.border = '2px solid var(--primary, #236B93)';
                  btn.style.backgroundColor = '#E6F4FA';
                  btn.style.color = 'var(--primary, #236B93)';
                  btn.style.fontWeight = '800';
                  updateTitleWithStock(type, v);
                  updateLowStockBanner(v);
                };
                optionsDiv.appendChild(btn);
              });
            } else {
              optionsDiv.className = 'custom-options';
              optionsDiv.style.display = 'flex';
              optionsDiv.style.gap = '0.5rem';
              optionsDiv.style.flexWrap = 'wrap';
              items.forEach((v, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'custom-btn' + (idx === 0 ? ' selected' : '');
                btn.textContent = v.name || v.value;
                btn.style.padding = '0.5rem 1rem';
                btn.style.borderRadius = '8px';
                btn.style.border = idx === 0 ? '2px solid var(--primary, #236B93)' : '1px solid #E2E8F0';
                btn.style.backgroundColor = idx === 0 ? '#E6F4FA' : 'white';
                btn.style.color = idx === 0 ? 'var(--primary, #236B93)' : '#0F172A';
                btn.style.fontWeight = idx === 0 ? '800' : '600';
                btn.style.cursor = 'pointer';
                btn.onclick = function() {
                  optionsDiv.querySelectorAll('.custom-btn').forEach(b => {
                    b.classList.remove('selected');
                    b.style.border = '1px solid #E2E8F0';
                    b.style.backgroundColor = 'white';
                    b.style.color = '#0F172A';
                    b.style.fontWeight = '600';
                  });
                  btn.classList.add('selected');
                  btn.style.border = '2px solid var(--primary, #236B93)';
                  btn.style.backgroundColor = '#E6F4FA';
                  btn.style.color = 'var(--primary, #236B93)';
                  btn.style.fontWeight = '800';
                  updateTitleWithStock(type, v);
                  updateLowStockBanner(v);
                };
                optionsDiv.appendChild(btn);
              });
            }

            groupDiv.appendChild(optionsDiv);
            container.appendChild(groupDiv);
          });

          if (activeVars.length > 0) {
            updateLowStockBanner(activeVars[0]);
          }
        }

        const initialVars = ${variantsJson};
        renderVariantsList(initialVars);

        const currentPid = "${product.id}";
        if (currentPid) {
          fetch('/api/ProductVariant?productId=' + currentPid)
            .then(function(res) { return res.ok ? res.json() : null; })
            .then(function(resData) {
              const vList = resData && resData.success ? resData.data : (Array.isArray(resData) ? resData : []);
              if (vList && vList.length > 0) {
                renderVariantsList(vList);
              }
            })
            .catch(function(err) { console.warn("Could not fetch variants dynamically:", err); });
        }
      } catch(err) {
        console.warn("Could not process variant response:", err);
      }
    `;

    const imagesJson = JSON.stringify(product.images || []);
    const mainImgUrlStr = product.mainImageUrl
      ? (product.mainImageUrl.startsWith('http') ? product.mainImageUrl : `${IMAGES_BASE_URL}${product.mainImageUrl}`)
      : '';

    const galleryScriptToInject = `
      try {
        const initialImages = ${imagesJson};
        const mainImageResolved = "${mainImgUrlStr}";
        const currentPid = "${product.id}";
        const baseImgUrl = "${IMAGES_BASE_URL}";

        function setupProductGallery(imgList) {
          const allImgs = [];
          if (mainImageResolved) {
            allImgs.push(mainImageResolved);
          }
          if (Array.isArray(imgList)) {
            imgList.forEach(img => {
              const u = img.imageUrl || img.url || '';
              if (u) {
                const full = u.startsWith('http') ? u : baseImgUrl + u;
                if (!allImgs.includes(full)) {
                  allImgs.push(full);
                }
              }
            });
          }

          if (allImgs.length <= 1) return;

          let thumbsContainer = document.getElementById('thumbs-list') || document.querySelector('.thumbs-list') || document.querySelector('.product-thumbnails') || document.querySelector('.pdp-thumbnails') || document.querySelector('.thumbs');
          let mainImgEl = document.getElementById('main-image') || document.querySelector('.main-image-container img') || document.querySelector('.img-main img') || document.querySelector('.hero-image img') || document.querySelector('img[src*="uploads"]');

          if (!thumbsContainer && mainImgEl && mainImgEl.parentNode) {
            thumbsContainer = document.createElement('div');
            thumbsContainer.id = 'dynamic-thumbs-list';
            thumbsContainer.style.cssText = 'display: flex; gap: 0.6rem; overflow-x: auto; padding: 0.6rem 0; margin-top: 0.75rem; width: 100%; justify-content: center; align-items: center; border-radius: 8px;';
            mainImgEl.parentNode.insertBefore(thumbsContainer, mainImgEl.nextSibling);
          }

          if (thumbsContainer) {
            thumbsContainer.innerHTML = '';
            thumbsContainer.style.display = 'flex';
            thumbsContainer.style.gap = '0.6rem';
            thumbsContainer.style.overflowX = 'auto';
            thumbsContainer.style.padding = '0.5rem 0';
            thumbsContainer.style.justifyContent = 'center';

            allImgs.forEach((url, idx) => {
              const thumb = document.createElement('div');
              thumb.className = 'thumb' + (idx === 0 ? ' active' : '');
              thumb.style.cssText = 'width: 64px; height: 64px; border-radius: 10px; border: ' + (idx === 0 ? '3px solid #236B93' : '1px solid #E2E8F0') + '; cursor: pointer; flex-shrink: 0; overflow: hidden; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.06); transition: all 0.2s ease;';

              const img = document.createElement('img');
              img.src = url;
              img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
              img.onerror = function() { this.src = '/logo.png'; };

              thumb.appendChild(img);
              thumb.onclick = function() {
                if (mainImgEl) mainImgEl.src = url;
                thumbsContainer.querySelectorAll('div').forEach(t => {
                  t.style.border = '1px solid #E2E8F0';
                  t.classList.remove('active');
                });
                thumb.style.border = '3px solid #236B93';
                thumb.classList.add('active');
              };
              thumbsContainer.appendChild(thumb);
            });
          }
        }

        setupProductGallery(initialImages);

        if (currentPid) {
          fetch('/api/ProductImage/product/' + currentPid)
            .then(function(res) { return res.ok ? res.json() : null; })
            .then(function(resData) {
              const imgList = resData && resData.success ? resData.data : (Array.isArray(resData) ? resData : []);
              if (imgList && imgList.length > 0) {
                setupProductGallery(imgList);
              }
            })
            .catch(function(err) { console.warn("Could not fetch additional images dynamically:", err); });
        }
      } catch(err) {
        console.warn("Could not process gallery image response:", err);
      }
    `;

    // Inject script and style to bridge interactive buttons and hide selectors
    const scriptToInject = `
      <style>
        /* Allow dynamic variant selectors to display when present */
        /* Hide the top nav bar and brand·category tag from all custom designs */
        .nav { display: none !important; }
        .tag { display: none !important; }
        .category-tag { display: none !important; }
        ${!product.inStock ? `
          .btn-cart, button[class*="cart"], button[id*="cart"],
          .btn-buy-now, .btn-buy, button[class*="buy"], button[id*="buy"] {
            background-color: #bdbdbd !important;
            background-image: none !important;
            color: #ffffff !important;
            pointer-events: none !important;
            cursor: not-allowed !important;
          }
          /* Add an out of stock banner style */
          .oos-banner {
            background-color: #EF5350;
            color: white;
            text-align: center;
            padding: 10px;
            font-size: 16px;
            font-weight: bold;
            font-family: sans-serif;
            position: sticky;
            top: 0;
            z-index: 99999;
          }
        ` : ''}
      </style>
      <script>
        window.addEventListener('DOMContentLoaded', () => {
          ${variantScriptToInject}
          ${galleryScriptToInject}
          ${!product.inStock ? `
            // Inject an out-of-stock banner at the top of the body
            const banner = document.createElement('div');
            banner.className = 'oos-banner';
            banner.innerText = '⚠️ هذا المنتج غير متوفر حالياً (نفذت الكمية)';
            document.body.insertBefore(banner, document.body.firstChild);

            // Change button texts to out-of-stock
            document.querySelectorAll('.btn-cart, button[class*="cart"], button[id*="cart"], .btn-buy-now, .btn-buy, button[class*="buy"], button[id*="buy"]').forEach(btn => {
              btn.innerText = 'نفذت الكمية';
              btn.disabled = true;
            });
          ` : `
            const registeredCart = new Set();
            const registeredWish = new Set();
            const registeredBuy = new Set();

            const cartBtns = document.querySelectorAll('.btn-cart, button[class*="cart"], button[id*="cart"]');
            cartBtns.forEach(btn => {
              if (!registeredCart.has(btn)) {
                registeredCart.add(btn);
                btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  window.parent.postMessage({ type: 'ADD_TO_CART', quantity: 1 }, '*');
                });
              }
            });

            document.querySelectorAll('button').forEach(btn => {
              if (!registeredCart.has(btn)) {
                if (btn.textContent.includes('سلة') || btn.textContent.includes('السلة') || btn.textContent.includes('cart') || btn.textContent.includes('Cart')) {
                  registeredCart.add(btn);
                  btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.parent.postMessage({ type: 'ADD_TO_CART', quantity: 1 }, '*');
                  });
                }
              }
            });

            const buyBtns = document.querySelectorAll('.btn-buy-now, .btn-buy, button[class*="buy"], button[id*="buy"]');
            buyBtns.forEach(btn => {
              if (!registeredBuy.has(btn)) {
                registeredBuy.add(btn);
                btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  window.parent.postMessage({ type: 'BUY_NOW', quantity: 1 }, '*');
                });
              }
            });

            document.querySelectorAll('button').forEach(btn => {
              if (!registeredBuy.has(btn)) {
                if (btn.textContent.includes('شراء الآن') || btn.textContent.includes('الشراء الآن') || btn.textContent.includes('شراء') || btn.textContent.includes('buy') || btn.textContent.includes('Buy')) {
                  registeredBuy.add(btn);
                  btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.parent.postMessage({ type: 'BUY_NOW', quantity: 1 }, '*');
                  });
                }
              }
            });

            const wishBtns = document.querySelectorAll('.btn-wish, button[class*="wish"], button[id*="wish"]');
            wishBtns.forEach(btn => {
              if (!registeredWish.has(btn)) {
                registeredWish.add(btn);
                btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  window.parent.postMessage({ type: 'ADD_TO_WISHLIST' }, '*');
                });
              }
            });

            document.querySelectorAll('button').forEach(btn => {
              if (!registeredWish.has(btn)) {
                if (btn.textContent.includes('المفضلة') || btn.textContent.includes('مفضلة') || btn.textContent.includes('wish') || btn.textContent.includes('Wish')) {
                  registeredWish.add(btn);
                  btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.parent.postMessage({ type: 'ADD_TO_WISHLIST' }, '*');
                  });
                }
              }
            });
          `}

          // Dynamic height adjustment to prevent double scrollbars
          const reportHeight = () => {
            const height = document.documentElement.scrollHeight || document.body.scrollHeight;
            window.parent.postMessage({ type: 'RESIZE', height: height }, '*');
          };

          // Send height on load, DOM load and resize
          reportHeight();
          window.addEventListener('load', reportHeight);
          window.addEventListener('resize', reportHeight);

          // Watch for changes in the document body size
          if (window.ResizeObserver) {
            const observer = new ResizeObserver(reportHeight);
            observer.observe(document.body);
          }
        });
      </script>
    `;

    if (customHtml.includes('</body>')) {
      customHtml = customHtml.replace('</body>', `${scriptToInject}</body>`);
    } else {
      customHtml += scriptToInject;
    }
  }

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
  };

  const goToPrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      // RTL: swipe directions are reversed
      if (diff > 0) {
        goToPrevImage(); // swipe left in RTL = go prev
      } else {
        goToNextImage(); // swipe right in RTL = go next
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {product.pageDesign ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <iframe
            srcDoc={customHtml}
            style={{ width: '100%', height: iframeHeight, border: 'none', overflow: 'hidden' }}
            title={product.name}
            scrolling="no"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      ) : (
        <div className="pdp-container">
          <button onClick={() => navigate(-1)} className="pdp-back-btn">
            <ArrowRight size={20} />
            العودة للخلف
          </button>

          <div className="pdp-grid">

            {/* لوحة الوسائط والصور */}
            <div className="pdp-media-section">
              <div
                className="pdp-gallery"
                ref={galleryRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Navigation arrows */}
                {productImages.length > 1 && (
                  <>
                    <button className="pdp-gallery-arrow pdp-gallery-arrow-right" onClick={goToPrevImage}>
                      <ChevronRight size={22} />
                    </button>
                    <button className="pdp-gallery-arrow pdp-gallery-arrow-left" onClick={goToNextImage}>
                      <ChevronLeft size={22} />
                    </button>
                  </>
                )}

                {/* Images — each absolutely fills the gallery, active one fades/slides in */}
                {productImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} - صورة ${index + 1}`}
                    className="pdp-gallery-image"
                    style={{
                      opacity: activeImageIndex === index ? 1 : 0,
                      transform: activeImageIndex === index
                        ? 'translateX(0)'
                        : index < activeImageIndex
                          ? 'translateX(60px)'
                          : 'translateX(-60px)',
                      pointerEvents: activeImageIndex === index ? 'none' : 'none',
                      transition: 'opacity 0.35s ease, transform 0.35s ease',
                    }}
                  />
                ))}
              </div>

              {/* Thumbnail dots */}
              {productImages.length > 1 && (
                <div className="pdp-gallery-dots">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      className={`pdp-gallery-dot ${activeImageIndex === index ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(index)}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnail images */}
              {productImages.length > 1 && (
                <div className="pdp-thumbnails">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      className={`pdp-thumbnail ${activeImageIndex === index ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img src={img} alt={`معاينة ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* لوحة التفاصيل */}
            <div className="pdp-info">
              <div className="pdp-badges">
                {product.inStock === false && (
                  <span className="pdp-badge-origin" style={{ backgroundColor: '#EF5350', color: '#fff', fontWeight: 'bold' }}>
                    🚫 نفذت الكمية (غير متوفر)
                  </span>
                )}
                <span className="pdp-badge-category">
                  {product.subCategory?.name || 'تصنيف'}
                </span>
                <span className="pdp-badge-origin">
                  ✈️ مستورد
                </span>
              </div>

              <h1 className="pdp-title">{product.name}</h1>

              {/* التقييم */}
              <div className="pdp-rating">
                <Star style={{ color: '#FFD54F', fill: '#FFD54F' }} size={20} />
                <span className="pdp-rating-text">
                  {product.averageRating || 0}
                  <span className="pdp-rating-count">
                    ({product.reviewCount || 0} تقييم من المشترين)
                  </span>
                </span>
              </div>

              {/* السعر */}
              <div className="pdp-price-row">
                {product.salePrice && product.salePrice < product.basePrice ? (
                  <>
                    <span className="pdp-price">{product.salePrice} ج.م</span>
                    <span className="pdp-old-price">{product.basePrice} ج.م</span>
                  </>
                ) : (
                  <span className="pdp-price">{product.basePrice} ج.م</span>
                )}
              </div>

              {/* تنبيه انخفاض المخزون (Low Stock Alert displayed ONLY when isLowStock: true) */}
              {(() => {
                const clickedVariant = product.variants?.find(v => v.id === selectedVariantId);
                const targetVar = clickedVariant
                  || product.variants?.find(v => v.inventory?.isLowStock === true)
                  || product.variants?.find(v => v.inventory?.isLowStock);
                
                if (!targetVar || !targetVar.inventory) return null;
                const inv = targetVar.inventory;

                const isLow = inv.isLowStock === true || (inv.availableQuantity !== undefined && inv.lowStockThreshold !== undefined && inv.availableQuantity <= inv.lowStockThreshold && inv.availableQuantity > 0);
                if (!isLow) return null;

                const qty = inv.availableQuantity ?? inv.quantity;
                if (qty === undefined || qty === null || qty <= 0) return null;

                return (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(254, 215, 170, 0.95) 100%)',
                    border: '1px solid #F59E0B',
                    color: '#B45309',
                    borderRadius: '12px',
                    padding: '0.65rem 1rem',
                    margin: '0.75rem 0 1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.15)',
                    transition: 'all 0.3s ease',
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🔥</span>
                    <span>
                      سارع بالطلب! متبقي <strong style={{ color: '#D97706', fontSize: '0.95rem' }}>{qty}</strong> قطع فقط في المخزون — اطلب الآن قبل نفاذ الكمية
                    </span>
                  </div>
                );
              })()}

              {/* الوصف */}
              <p className="pdp-description">{product.description || product.shortDescription}</p>

              {/* Dynamic Variant Selector Groups (Types 1-5: Color, Size, Material, Style, Custom) */}
              {product.variants && product.variants.length > 0 && (() => {
                const TYPE_NAMES: Record<number, string> = {
                  1: 'الألوان المتاحة:',
                  2: 'المقاسات المتاحة:',
                  3: 'الخامات المتاحة:',
                  4: 'الستايلات المتاحة:',
                  5: 'الخيارات المتاحة:',
                };

                const groups: Record<number, typeof product.variants> = {};
                product.variants.forEach(v => {
                  if (v.isActive === false) return;
                  if (v.productId && product.id && Number(v.productId) !== Number(product.id)) return;
                  const t = (v.type !== undefined && v.type !== null && v.type !== 0) ? v.type : (v.color ? 1 : v.size ? 2 : 5);
                  if (!groups[t]) groups[t] = [];
                  groups[t].push(v);
                });

                return Object.entries(groups).map(([typeStr, items]) => {
                  const type = Number(typeStr);
                  if (!items || items.length === 0) return null;

                  const selectedItem = items.find(v => v.id === selectedVariantId || selectedColor === (v.name || v.value) || selectedSize === (v.value || v.name)) || items[0];
                  const selectedQty = selectedItem?.inventory ? (selectedItem.inventory.availableQuantity ?? selectedItem.inventory.quantity) : null;

                  return (
                    <div key={type} className="pdp-option-group" style={{ marginBottom: '1.25rem' }}>
                      <h4 className="pdp-option-label" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <span>
                          {TYPE_NAMES[type] || 'الخيار المتاح:'}
                          {selectedItem && (
                            <span style={{ color: '#236B93', fontWeight: 800, marginRight: '0.4rem' }}>
                              {selectedItem.name || selectedItem.value}
                            </span>
                          )}
                        </span>
                        {selectedQty !== null && selectedQty !== undefined && (
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: selectedQty <= 5 ? '#FEF3C7' : '#E6F4FA',
                            color: selectedQty <= 5 ? '#D97706' : '#236B93',
                            border: `1px solid ${selectedQty <= 5 ? '#F59E0B' : '#BAE6FD'}`,
                          }}>
                            المتبقي: {selectedQty} قطعة
                          </span>
                        )}
                      </h4>

                      {/* Type 1: Color */}
                      {type === 1 && (
                        <div className="pdp-color-dots" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {items.map((v) => {
                            const val = (v.value || v.name || '').trim();
                            const hex = val.startsWith('#') ? val : (val.length === 6 || val.length === 3 ? '#' + val : val);
                            const isSelected = selectedColor === (v.name || val) || selectedVariantId === v.id;
                            return (
                              <div
                                key={v.id}
                                className={`pdp-color-dot ${isSelected ? 'active' : ''}`}
                                style={{
                                  backgroundColor: hex || '#236B93',
                                  width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                                  border: isSelected ? '3px solid #236B93' : '2px solid white',
                                  outline: isSelected ? '2px solid #236B93' : '1px solid #E2E8F0',
                                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                                  transition: 'all 0.2s ease',
                                }}
                                title={v.name || val}
                                onClick={() => {
                                  setSelectedColor(v.name || val);
                                  setSelectedVariantId(v.id);
                                }}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Type 2: Size */}
                      {type === 2 && (
                        <div className="pdp-sizes" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {items.map((v) => {
                            const isSelected = selectedSize === (v.value || v.name) || selectedVariantId === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                className={`pdp-size-btn ${isSelected ? 'active' : ''}`}
                                style={{
                                  padding: '0.5rem 1rem', borderRadius: '8px', border: isSelected ? '2px solid #236B93' : '1px solid #E2E8F0',
                                  backgroundColor: isSelected ? '#E6F4FA' : 'white',
                                  color: isSelected ? '#236B93' : '#0F172A',
                                  fontWeight: isSelected ? 800 : 600, cursor: 'pointer', minWidth: 44,
                                }}
                                onClick={() => {
                                  setSelectedSize(v.value || v.name);
                                  setSelectedVariantId(v.id);
                                }}
                              >
                                {(v.value || v.name).toUpperCase()}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Type 3: Material */}
                      {type === 3 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {items.map((v) => {
                            const isSelected = selectedVariantId === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                style={{
                                  padding: '0.5rem 1.1rem', borderRadius: '20px', border: isSelected ? '2px solid #236B93' : '1px solid #E2E8F0',
                                  backgroundColor: isSelected ? '#E6F4FA' : '#F8FAFC',
                                  color: isSelected ? '#236B93' : '#0F172A',
                                  fontWeight: isSelected ? 800 : 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                }}
                                onClick={() => setSelectedVariantId(v.id)}
                              >
                                🧵 {v.name || v.value}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Type 4: Style */}
                      {type === 4 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {items.map((v) => {
                            const isSelected = selectedVariantId === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                style={{
                                  padding: '0.55rem 1.1rem', borderRadius: '10px', border: isSelected ? '2px solid #236B93' : '1px solid #E2E8F0',
                                  backgroundColor: isSelected ? '#E6F4FA' : 'white',
                                  color: isSelected ? '#236B93' : '#0F172A',
                                  fontWeight: isSelected ? 800 : 600, cursor: 'pointer',
                                }}
                                onClick={() => setSelectedVariantId(v.id)}
                              >
                                ✨ {v.name || v.value}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Type 5: Custom */}
                      {type === 5 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {items.map((v) => {
                            const isSelected = selectedVariantId === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                style={{
                                  padding: '0.5rem 1rem', borderRadius: '8px', border: isSelected ? '2px solid #236B93' : '1px solid #E2E8F0',
                                  backgroundColor: isSelected ? '#E6F4FA' : 'white',
                                  color: isSelected ? '#236B93' : '#0F172A',
                                  fontWeight: isSelected ? 800 : 600, cursor: 'pointer',
                                }}
                                onClick={() => setSelectedVariantId(v.id)}
                              >
                                {v.name || v.value}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}

              {/* التحكم في الكمية وإضافة للسلة */}
              <div className="pdp-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="pdp-qty-selector">
                  <button onClick={handleDecrease} className="pdp-qty-btn">
                    <Minus size={18} />
                  </button>
                  <span className="pdp-qty-val">{quantity}</span>
                  <button onClick={handleIncrease} className="pdp-qty-btn">
                    <Plus size={18} />
                  </button>
                </div>

                {product.inStock === false ? (
                  <button className="btn-primary pdp-add-btn disabled" disabled style={{ flex: 1, backgroundColor: '#bdbdbd', cursor: 'not-allowed' }}>
                    🚫 غير متوفر حالياً
                  </button>
                ) : (
                  <button className="btn-primary pdp-add-btn" onClick={handleAdd} style={{ flex: 1 }}>
                    <ShoppingCart size={22} />
                    إضافة إلى السلة
                  </button>
                )}

                <button
                  className={`favorite-toggle ${favorites.includes(String(product.id)) ? 'is-fav' : ''}`}
                  onClick={(e) => onToggleFavorite(String(product.id), e)}
                  style={{
                    position: 'relative', top: 'auto', left: 'auto',
                    width: '48px', height: '48px', flexShrink: 0,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', cursor: 'pointer', transition: 'var(--transition)'
                  }}
                  title={favorites.includes(String(product.id)) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                >
                  <Heart size={22} fill={favorites.includes(String(product.id)) ? "#E91E63" : "none"} color={favorites.includes(String(product.id)) ? "#E91E63" : "var(--text-muted)"} />
                </button>
              </div>

              {/* زر الشراء الآن */}
              {product.inStock === false ? (
                <button
                  className="pdp-buy-now-btn disabled"
                  disabled
                  style={{ backgroundColor: '#bdbdbd', cursor: 'not-allowed', marginTop: '1rem' }}
                >
                  🚫 نفذت الكمية
                </button>
              ) : (
                <button
                  className="pdp-buy-now-btn"
                  onClick={() => onBuyNow(product, quantity, selectedColor, selectedSize)}
                >
                  ⚡ شراء الآن
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* منتجات ذات صلة */}
      {relatedProducts.length > 0 && (
        <div className="pdp-container" style={{ marginTop: '2rem' }}>
          <div className="related-products-section">
            <div className="related-products-header">
              <h2 className="related-products-title">
                ✨ منتجات ذات صلة قد تعجبك
              </h2>
              {/* Arrows */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => scrollRelated('right')}
                  className="related-arrow-btn"
                  title="السابق"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => scrollRelated('left')}
                  className="related-arrow-btn"
                  title="التالي"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>

            {/* Slider list */}
            <div
              ref={relatedScrollRef}
              className="related-products-slider"
            >
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="related-products-slide"
                >
                  <ProductCard
                    product={p}
                    isFavorite={favorites.includes(String(p.id))}
                    onToggleFavorite={(pid, e) => onToggleFavorite(String(pid), e)}
                    onAddToCart={onQuickAddToCart}
                    onProductClick={(clickedProd) => navigate(`/product/${clickedProd.id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
