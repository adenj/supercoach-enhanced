import { Player } from './constructPlayerTeam';
import byes from './data/byes.json';
interface ByeWeeks {
  rounds: {
    [round: string]: number[];
  };
}

const byeWeeks: ByeWeeks = byes;

export const createByeWeeksDropdown = (enrichedTeam: any) => {
  const dropdownContainer = document.createElement('div');
  dropdownContainer.className = 'bye-weeks-dropdown-container';
  dropdownContainer.style.display = 'flex';
  dropdownContainer.style.width = '200px';
  dropdownContainer.style.alignItems = "center";

  const label = document.createElement('label');
  label.textContent = 'Highlight Players with Bye: ';
  label.style.display = 'block';
  label.style.marginBottom = '5px';
  label.style.fontWeight = 'bold';
  // dropdownContainer.appendChild(label);

  const dropdown = document.createElement('select');
  dropdown.style.padding = '5px';
  dropdown.style.width = '100%';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Show Byes';
  dropdown.appendChild(defaultOption);

  Object.keys(byeWeeks.rounds).forEach(round => {
    const teamIds = byeWeeks.rounds[round];
    const option = document.createElement('option');
    option.value = round;
    option.textContent = `Round ${round} (${teamIds.length} teams)`;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener('change', (event) => {
    resetPlayerOpacity();
    if ((event.target as HTMLSelectElement).value === '') return;

    const selectedRound = (event.target as HTMLSelectElement).value;
    if (selectedRound) {
      const teamIdsWithBye = byeWeeks.rounds[selectedRound];
      highlightPlayersWithBye(teamIdsWithBye, enrichedTeam);
    }
  });

  dropdownContainer.appendChild(dropdown);

  // Use MutationObserver to wait for the target element to appear
  waitForElement('.vm-AppViewSidebarComponent-pageNavSecondary').then((targetElement) => {
    console.log('Target element found, appending dropdown');
    targetElement.replaceChild(dropdownContainer, targetElement.children[0]);
  }).catch(() => {
    console.log('Target element not found, appending to body as fallback');
    document.body.appendChild(dropdownContainer);
  });
}

// Function to wait for an element to exist in the DOM
const waitForElement = (selector: string): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      return resolve(element);
    }

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within timeout`));
    }, 10000); // 10 second timeout

    const observer = new MutationObserver((mutations, observerInstance) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        observerInstance.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
}

const highlightPlayersWithBye = (teamIdsWithBye: number[], team: Player[]) => {
  const playerCells = document.querySelectorAll('vm-field-cell');

  playerCells.forEach(cell => {
    const firstName = cell.querySelector('.vm-FieldCellComponent-firstName')?.textContent?.trim() || '';
    const lastName = cell.querySelector('.vm-FieldCellComponent-lastName')?.textContent?.trim() || '';
    const playerName = `${firstName} ${lastName}`;

    const playerEntry = Object.values(team).find((player: any) =>
      player.name === playerName
    );


    if (playerEntry && teamIdsWithBye.includes(playerEntry.team.id)) {
      (cell as HTMLElement).style.opacity = '0.3';
      (cell as HTMLElement).style.position = 'relative';

      if (!cell.querySelector('.bye-indicator')) {
        const byeIndicator = document.createElement('div');
        byeIndicator.className = 'bye-indicator';
        byeIndicator.textContent = 'BYE 👋';
        byeIndicator.style.position = 'absolute';
        byeIndicator.style.top = '50%';
        byeIndicator.style.left = '50%';
        byeIndicator.style.transform = 'translate(-50%, -50%)';
        byeIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        byeIndicator.style.color = 'white';
        byeIndicator.style.padding = '2px 6px';
        byeIndicator.style.borderRadius = '3px';
        byeIndicator.style.fontWeight = 'bold';
        byeIndicator.style.fontSize = '14px';
        byeIndicator.style.zIndex = '1';
        (cell as HTMLElement).appendChild(byeIndicator);
      }
    }
  });
}

const resetPlayerOpacity = () => {
  const playerCells = document.querySelectorAll('vm-field-cell');

  playerCells.forEach(cell => {
    (cell as HTMLElement).style.opacity = '1';

    const byeIndicator = cell.querySelector('.bye-indicator');
    if (byeIndicator) {
      byeIndicator.remove();
    }
  });
}