/**
 * A data object representing the state of a game object at a single point in time.
 * See Section 7.1 "The `TemporalState` Object" table in the comprehensive documentation.
 */
export default class TemporalState {
  /**
   * @param {object} state The state properties to store.
   */
  constructor(state) {
    this.x = state.x;
    this.y = state.y;
    this.velocityX = state.velocityX;
    this.velocityY = state.velocityY;
    this.animation = state.animation;
    this.isAlive = state.isAlive;
    this.isVisible = state.isVisible;
  }
} 