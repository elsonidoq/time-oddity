import { store } from '../state/store.js';

export default class TimeManager {
  togglePause() {
    if (Date.now() - store.lastPauseTimestamp > store.pauseCooldown) {
      store.isPaused = !store.isPaused;
      store.lastPauseTimestamp = Date.now();
      console.log(`Game is Paused: ${store.isPaused}`);
      return true;
    }
    return false;
  }
} 