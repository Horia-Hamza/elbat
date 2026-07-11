import { useState, useEffect } from 'react';
import { categoriesApi } from '../api/categories';
import type { Category } from '../types/api';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchCategories() {
      try {
        setLoading(true);
        const data = await categoriesApi.getCategories();
        if (isMounted) {
          const items = Array.isArray(data) ? data : (data as any)?.items || [];
          setCategories(items);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
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
  }, [refetchTrigger]);

  return { categories, loading, error, refetch };
}
