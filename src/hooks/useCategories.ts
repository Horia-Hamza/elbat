import { useState, useEffect } from 'react';
import { categoriesApi } from '../api/categories';
import type { Category } from '../types/api';

const CACHE_KEY = 'elbat_cached_categories';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(() => categories.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchCategories() {
      try {
        if (categories.length === 0) setLoading(true);
        const data = await categoriesApi.getCategories();
        if (isMounted) {
          const items = Array.isArray(data) ? data : (data as any)?.items || [];
          setCategories(items);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(items));
          } catch (e) {
            // Ignore quota errors
          }
          setError(null);
        }
      } catch (err: any) {
        if (isMounted && categories.length === 0) {
          setError(err.message || 'فشل في جلب الفئات');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchTrigger]);

  return { categories, loading, error, refetch };
}
