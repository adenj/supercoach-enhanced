import { getPlayerIndicators } from './playerIndicators';

(async () => {
  if (window.location.hostname.includes('supercoach.com.au')) {
    console.log('SuperCoach domain detected, initializing features...');

    await getPlayerIndicators();
  }
})();