import { useQueryClient } from '@tanstack/react-query';

// Utility function to trigger dashboard stats refresh using React Query
export const refreshDashboardStats = () => {
  // Add a small delay to ensure backend operations are completed
  setTimeout(() => {
    // Dispatch custom event to notify dashboard to refresh stats
    window.dispatchEvent(new CustomEvent('statsUpdate'));
  }, 100);
};

// React Query version - use this in components that have access to QueryClient
export const useRefreshDashboardStats = () => {
  const queryClient = useQueryClient();
  
  return () => {
    // Add a small delay to ensure backend operations are completed
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }, 100);
  };
};

export default { refreshDashboardStats, useRefreshDashboardStats };
