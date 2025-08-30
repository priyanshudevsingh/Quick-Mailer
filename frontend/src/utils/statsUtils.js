// Utility function to trigger dashboard stats refresh
export const refreshDashboardStats = () => {
  // Add a small delay to ensure backend operations are completed
  setTimeout(() => {
    // Dispatch custom event to notify dashboard to refresh stats
    window.dispatchEvent(new CustomEvent('statsUpdate'));
  }, 100);
};

export default { refreshDashboardStats };
