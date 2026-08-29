import { useState, useEffect } from 'react';
import { productsApi } from '../api/products';
import type { ApiProduct, ProductFilterParams } from '../types/api';

export function useProducts(params: ProductFilterParams) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // We stringify params in a safe way to use it as a dependency array trigger
  const paramsKey = JSON.stringify(params);

  const refetch = () => setRefetchTrigger((prev) => prev + 1);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
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
        }
      } catch (err: any) {
        if (isMounted) {
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
