console.log("background.ts loaded")
// Listen for when a tab is updated to check if it's supercoach
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if the URL contains supercoach.com.au
    if (tab.url.includes('supercoach.com.au')) {
      console.log('SuperCoach page detected in background script');
      // We don't need to do anything here as the content script will handle the data fetching
    }
  }
});