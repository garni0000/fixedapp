import { useState, useEffect } from 'react';
import { Fixed } from '@/types';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useFetchFixed = () => {
  const [fixed, setFixed] = useState<Fixed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotaUsed, setQuotaUsed] = useState(0);
  const maxQuota = 10;

  useEffect(() => {
    fetchFixed();
  }, []);

  const fetchFixed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - replace with actual API call
      // const data = await apiClient.get('/fixed/today');
      
      const mockData: Fixed[] = [
        {
          id: '1',
          date: new Date().toISOString(),
          homeTeam: 'Real Madrid',
          awayTeam: 'Barcelona',
          market: 'Over 2.5',
          confidence: 92,
          shortAnalysis: 'High scoring match expected',
          fullAnalysis: 'Based on recent form and head-to-head statistics, both teams are likely to score multiple goals...',
          isVIP: false,
          status: 'pending'
        },
        {
          id: '2',
          date: new Date().toISOString(),
          homeTeam: 'Manchester City',
          awayTeam: 'Liverpool',
          market: '1X',
          confidence: 87,
          shortAnalysis: 'City dominance at home',
          fullAnalysis: 'Manchester City has an exceptional home record this season...',
          isVIP: true,
          status: 'pending'
        }
      ];
      
      setFixed(mockData);
      setQuotaUsed(mockData.length);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des fixed');
      toast.error('Impossible de charger les fixed');
    } finally {
      setLoading(false);
    }
  };

  return {
    fixed,
    loading,
    error,
    quotaUsed,
    maxQuota,
    refetch: fetchFixed
  };
};
