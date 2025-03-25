// Player indicators functionality
const injuryListUrl = "https://raw.githubusercontent.com/adenj/supercoach-enhanced/master/injuryData.json";


interface InjuryData {
  data: {
    name: string;
    injury: string;
    timeline: string;
    team: string;
  }[];
}

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

const highlightInjuredPlayers = (injuryData: InjuryData) => {
  const playerTiles = Array.from(document.getElementsByTagName('vm-field-cell')) as HTMLElement[];

  for (const playerTile of playerTiles) {
    if (playerTile.dataset.injuryProcessed === 'true') {
      continue;
    }

    const firstName = playerTile.querySelector('.vm-FieldCellComponent-firstName')?.textContent?.trim() || '';
    const lastName = playerTile.querySelector('.vm-FieldCellComponent-lastName')?.textContent?.trim() || '';
    const name = `${firstName} ${lastName}`;

    if (!name || name === ' ') continue;

    const exactMatch = injuryData.data.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (exactMatch) {
      console.log(`Marking injured player: ${name}: ${exactMatch.injury} (${exactMatch.timeline})`);

      playerTile.style.background = '#d61414';
      playerTile.style.borderRadius = '6px';

      const statusElements = playerTile.getElementsByTagName('vm-field-cell-status');
      if (statusElements.length > 0) {
        const statusElement = statusElements[0] as HTMLElement;

        const tooltipText = `${exactMatch.injury} - Return: ${exactMatch.timeline}`;
        const emoji = exactMatch.injury.toLowerCase().includes('suspended') ? '🚫' : '🤕';

        statusElement.textContent = emoji;
        statusElement.title = tooltipText;

        statusElement.style.fontSize = '1.2em';
        statusElement.style.cursor = 'help';
      }

      playerTile.dataset.injuryProcessed = 'true';
      playerTile.dataset.injury = exactMatch.injury;
      playerTile.dataset.timeline = exactMatch.timeline;
    } else {
      playerTile.dataset.injuryProcessed = 'true';
    }
  }
};

export const getPlayerIndicators = async (): Promise<void> => {
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
        console.log('New player elements detected, updating highlights');
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
};