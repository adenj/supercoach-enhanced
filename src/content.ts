// Content script for SuperCoach domain
const injuryListUrl = "https://raw.githubusercontent.com/adenj/supercoach-enhanced/master/injuryData.json";

// Define the injury data interface
interface InjuryData {
  data: {
    name: string;
    injury: string;
    timeline: string;
    team: string;
  }[];
}

// Function to fetch injury data
const fetchInjuryData = async (): Promise<InjuryData | null> => {
  try {
    const response = await fetch(injuryListUrl);
    const data: InjuryData = await response.json();

    console.log('Successfully fetched injury data');
    return data;
  } catch (error) {
    console.error('Error fetching injury data:', error);
    return null;
  }
};

// Keep track of players we've already processed to avoid infinite loops
const processedPlayers = new Set<string>();

const highlightInjuredPlayers = (injuryData: InjuryData) => {
  // Get all player tiles and cast to HTMLElement array to access style property
  const playerTiles = Array.from(document.getElementsByTagName('vm-field-cell')) as HTMLElement[];

  for (const playerTile of playerTiles) {
    // Skip already processed players
    if (playerTile.dataset.injuryProcessed === 'true') {
      continue;
    }

    // Using optional chaining to avoid errors if elements don't exist
    const firstName = playerTile.querySelector('.vm-FieldCellComponent-firstName')?.textContent?.trim() || '';
    const lastName = playerTile.querySelector('.vm-FieldCellComponent-lastName')?.textContent?.trim() || '';
    const name = `${firstName} ${lastName}`;

    // Skip empty names
    if (!name || name === ' ') continue;

    const exactMatch = injuryData.data.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (exactMatch) {

      // Now TypeScript recognizes style property
      playerTile.style.background = '#d61414';
      playerTile.style.borderRadius = '6px';

      // Add injury emoji to status element if it exists
      const statusElements = playerTile.getElementsByTagName('vm-field-cell-status');
      if (statusElements.length > 0) {
        const statusElement = statusElements[0] as HTMLElement;

        // Create tooltip text
        const tooltipText = `${exactMatch.injury} - Available: ${exactMatch.timeline}`;

        const emoji = exactMatch.injury.toLowerCase().includes('suspended') ? '🚫' : '🤕';

        // Set the emoji and tooltip
        statusElement.textContent = emoji;
        statusElement.title = tooltipText;

        // We could also add some styling to make the emoji more noticeable
        statusElement.style.fontSize = '1.2em';
        statusElement.style.cursor = 'pointer';
        statusElement.style.margin = "4px 4px 4px auto";
      }

      // Mark as processed to avoid infinite loops
      playerTile.dataset.injuryProcessed = 'true';
      playerTile.dataset.injury = exactMatch.injury;
      playerTile.dataset.timeline = exactMatch.timeline;
    } else {
      // Still mark as processed even if not injured
      playerTile.dataset.injuryProcessed = 'true';
    }
  }
};



(async () => {
  if (window.location.hostname.includes('supercoach.com.au')) {
    console.log('SuperCoach domain detected, fetching injury data...');
    const injuryData = await fetchInjuryData();

    if (injuryData) {
      // Initial run after a short delay to let the page load
      setTimeout(() => highlightInjuredPlayers(injuryData), 1000);

      // Set up mutation observer with care to avoid infinite loops
      const observer = new MutationObserver((mutations) => {
        // Check if the mutations include any vm-field-cell elements or their children
        const shouldProcess = mutations.some(mutation => {
          // Check added nodes
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof HTMLElement) {
              if (node.tagName.toLowerCase() === 'vm-field-cell' ||
                node.querySelector('vm-field-cell')) {
                return true;
              }
            }
          }
          return false;
        });

        if (shouldProcess) {
          highlightInjuredPlayers(injuryData);
        }
      });

      // Only observe specific changes - adding elements, not attributes or text
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        // Don't observe attribute or text changes to avoid loops
        attributes: false,
        characterData: false
      });
    }
  }
})();