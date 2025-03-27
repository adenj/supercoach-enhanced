import { createByeWeeksDropdown } from './byeWeeksDropdown';
import { constructUserTeam } from './constructPlayerTeam';
import { getPlayerIndicators } from './playerIndicators';


(async () => {
  if (window.location.hostname.includes('supercoach.com.au')) {
    console.log('SuperCoach domain detected, initializing features...');

    await getPlayerIndicators();
    const players = await constructUserTeam();

    window.addEventListener('message', function (event) {
      if (event.source !== window) return;

      if (event.data && event.data.action === 'teamStatsData') {
        try {
          if (players) {
            console.log(players)
            createByeWeeksDropdown(players);
          }
        } catch (error) {
          console.error('Error processing team data:', error);
        }
      }
    });

  }
})();