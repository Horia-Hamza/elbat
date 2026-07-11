import { useState, useEffect } from 'react';
import { subCategoriesApi } from '../api/subcategories';
import type { SubCategory } from '../types/api';

export function useSubCategories() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchSubCategories() {
      try {
        setLoading(true);
        const data = await subCategoriesApi.getSubCategories();
        if (isMounted) {
          const items = Array.isArray(data) ? data : (data as any)?.items || [];
          setSubCategories(items);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
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
  }, [refetchTrigger]);

  return { subCategories, loading, error, refetch };
}
