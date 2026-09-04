import { useState, useEffect } from 'react';
import { productsApi } from '../api/products';
import type { ApiProduct, ProductFilterParams } from '../types/api';

export function useProducts(params: ProductFilterParams) {
  // We stringify params in a safe way to use it as a dependency array trigger
  const paramsKey = JSON.stringify(params);
  const cacheKey = `elbat_products_cache_${paramsKey}`;

  const [products, setProducts] = useState<ApiProduct[]>(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [totalCount, setTotalCount] = useState<number>(() => {
    try {
      const cached = localStorage.getItem(`elbat_products_count_${paramsKey}`);
      if (cached) return Number(cached) || 0;
    } catch {}
    return 0;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch {}
    return true;
  });

  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger((prev) => prev + 1);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        // If we have no cached products, show loading indicator
        if (products.length === 0) {
          setLoading(true);
        }
        // Strip null and undefined values to produce clean JSON body payload for POST /api/Product/filter
        const cleanPayload = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== null && v !== undefined)
        );
        const data = await productsApi.filterProducts(cleanPayload);
        if (isMounted) {
          const items = Array.isArray(data) ? data : data?.items || (data as any)?.data || [];
          const total = Array.isArray(data) ? data.length : data?.totalCount || 0;
          setProducts(items);
          setTotalCount(total);
          setError(null);
          try {
            if (items.length > 0) {
              localStorage.setItem(cacheKey, JSON.stringify(items));
              localStorage.setItem(`elbat_products_count_${paramsKey}`, String(total));
            }
          } catch {}
        }
      } catch (err: any) {
        if (isMounted && products.length === 0) {
          setError(err.message || 'فشل في جلب المنتجات');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, refetchTrigger]);

  return { products, totalCount, loading, error, refetch };
}
