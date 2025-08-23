// Utility function to trigger dashboard stats refresh
export const refreshDashboardStats = () => {
  // Dispatch custom event to notify dashboard to refresh stats
  window.dispatchEvent(new CustomEvent('statsUpdate'));
};

export default { refreshDashboardStats };
