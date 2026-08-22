import { useState, useEffect } from 'react';
import { subCategoriesApi } from '../api/subcategories';
import type { SubCategory } from '../types/api';

const CACHE_KEY = 'elbat_cached_subcategories';

export function useSubCategories() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(() => subCategories.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchSubCategories() {
      try {
        if (subCategories.length === 0) setLoading(true);
        const data = await subCategoriesApi.getSubCategories();
        if (isMounted) {
          const items = Array.isArray(data) ? data : (data as any)?.items || [];
          setSubCategories(items);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(items));
          } catch (e) {
            // Ignore quota errors
          }
          setError(null);
        }
      } catch (err: any) {
        if (isMounted && subCategories.length === 0) {
          setError(err.message || 'فشل في جلب الأقسام الفرعية');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSubCategories();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchTrigger]);

  return { subCategories, loading, error, refetch };
}
