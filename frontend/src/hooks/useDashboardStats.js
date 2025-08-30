import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/api';

const DASHBOARD_STATS_QUERY_KEY = ['dashboard-stats'];

export const useDashboardStats = () => {
  return useQuery({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: async () => {
      const response = await authAPI.getDashboardStats();
      return response.data?.data?.stats || response.data?.stats || {};
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - data is considered fresh for 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Always refetch when component mounts
  });
};

// Hook to invalidate dashboard stats (used when data changes)
export const useInvalidateDashboardStats = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_QUERY_KEY });
  };
};

// Hook to update dashboard stats optimistically
export const useUpdateDashboardStats = () => {
  const queryClient = useQueryClient();
  
  return (updater) => {
    queryClient.setQueryData(DASHBOARD_STATS_QUERY_KEY, (oldData) => {
      if (!oldData) return oldData;
      return typeof updater === 'function' ? updater(oldData) : updater;
    });
  };
};