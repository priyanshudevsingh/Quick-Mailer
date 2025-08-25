// Service Worker temporarily disabled to fix asset loading issues
console.log('Service Worker disabled for debugging');

// Skip all service worker functionality
self.addEventListener('install', (event) => {
  console.log('Service Worker install skipped');
  // Skip waiting and activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activate skipped');
  // Claim all clients
  event.waitUntil(self.clients.claim());
});

// Disable fetch interception
self.addEventListener('fetch', (event) => {
  console.log('Service Worker fetch skipped');
  // Let the browser handle all requests normally
  return;
});

// Handle errors
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});
