// In your content script that intercepts the XHR
const script = document.createElement('script');
script.textContent = `
  // Save original XHR methods
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  // Override open method
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this._interceptedUrl = url;
    return originalXHROpen.apply(this, arguments);
  };
  
  // Override send method
  XMLHttpRequest.prototype.send = function(body) {
    const xhr = this;
    const url = xhr._interceptedUrl || '';
    
    if (url.includes('/api/afl/draft/v1/userteams/') && url.includes('statsPlayers')) {
      xhr.addEventListener('load', function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          window.postMessage({
            action: 'teamStatsData',
            data: xhr.responseText
          }, '*');
        }
      });
    }
    
    return originalXHRSend.apply(this, arguments);
  };
`;

// Inject the script
(document.head || document.documentElement).appendChild(script);

// Listen for the data from the injected script
// In your content script
window.addEventListener('message', function (event) {
  if (event.source !== window) return;

  if (event.data && event.data.action === 'teamStatsData') {
    try {
      const teamData = JSON.parse(event.data.data);

      // Store data based on available API
      if (typeof browser !== 'undefined') {
        // Firefox
        browser.storage.local.set({ teamStatsData: teamData })
          .then(() => {
            browser.runtime.sendMessage({ action: 'teamStatsDataReady' });
          })
          .catch(err => console.error('Error saving data:', err));
      }
      else if (typeof chrome !== 'undefined' && chrome.storage) {
        // Chrome
        chrome.storage.local.set({ teamStatsData: teamData });
      }
      else {
        // Fallback to localStorage
        console.log('Using localStorage fallback');
        localStorage.setItem('teamStatsData', JSON.stringify(teamData));
        document.dispatchEvent(new CustomEvent('teamStatsDataReady'));
      }
    } catch (error) {
      console.error('Error processing team data:', error);
    }
  }
});


export function getTeamStatsData(): Promise<any> {
  return new Promise((resolve) => {
    if (typeof browser !== 'undefined') {
      // Firefox
      browser.storage.local.get('teamStatsData')
        .then(result => resolve(result.teamStatsData || null))
        .catch(err => {
          console.error('Error getting data:', err);
          resolve(null);
        });
    }
    else if (typeof chrome !== 'undefined' && chrome.storage) {
      // Chrome
      chrome.storage.local.get('teamStatsData');
    }
    else {
      // Fallback to localStorage
      const data = localStorage.getItem('teamStatsData');
      resolve(data ? JSON.parse(data) : null);
    }
  });
}

