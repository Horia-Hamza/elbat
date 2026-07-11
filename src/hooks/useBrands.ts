import { useState, useEffect } from 'react';
import { brandsApi } from '../api/brands';
import type { Brand } from '../types/api';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchBrands() {
      try {
        setLoading(true);
        const data = await brandsApi.getBrands();
        if (isMounted) {
          setBrands(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'فشل في جلب الماركات');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchBrands();

    return () => {
      isMounted = false;
    };
  }, [refetchTrigger]);

  return { brands, loading, error, refetch };
}
