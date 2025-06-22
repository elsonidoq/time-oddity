import Entity from './Entity.js';
import StateMachine from '../systems/StateMachine.js';
import { IdleState } from '../states/IdleState.js';
import { RunState } from '../states/RunState.js';
import { JumpState } from '../states/JumpState.js';
import { FallState } from '../states/FallState.js';

/**
 * Player - The main player character class
 */
export class Player extends Entity {
    constructor(scene, x, y, inputManager) {
        super(scene, x, y, 'characters', 'character_beige_idle.png');

        // Player-specific properties
        this.speed = 160;
        this.jumpPower = 550;
        this.inputManager = inputManager;

        // Set physics properties
        this.body.setGravityY(300);
        this.body.setCollideWorldBounds(true);
        this.body.setSize(18, 28).setOffset(8, 5);
        
        // State machine
        this.stateMachine = new StateMachine(this);
        this.stateMachine.addState('idle', IdleState);
        this.stateMachine.addState('run', RunState);
        this.stateMachine.addState('jump', JumpState);
        this.stateMachine.addState('fall', FallState);
        
        this.stateMachine.changeState('idle');
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.stateMachine.update(delta);
    }
}

export default Player; 