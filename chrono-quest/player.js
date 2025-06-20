const PLAYER_SPEED = 5;

class Player {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.size = 50;
        this.velocity = createVector(0, 0);
        this.gravity = createVector(0, 0.5);
        this.isOnGround = false;
    }
    
    move(dir) {
        this.pos.x += dir * PLAYER_SPEED;
    }
    
    update() {
        this.velocity.add(this.gravity);
        let nextPos = this.pos.copy().add(this.velocity);
        // Simple ground check
        if (nextPos.y + this.size >= height) {
            this.pos.y = height - this.size;
            this.velocity.y = 0;
            this.isOnGround = true;
        } else {
            // Platform collision check
            let landed = false;
            for (let plat of (typeof platforms !== 'undefined' ? platforms : [])) {
                // Check if player is falling and will cross the platform top
                let wasAbove = this.pos.y + this.size <= plat.pos.y;
                let willBeBelow = nextPos.y + this.size >= plat.pos.y;
                let falling = this.velocity.y > 0;
                let withinX = this.pos.x + this.size > plat.pos.x && this.pos.x < plat.pos.x + plat.size.x;
                if (wasAbove && willBeBelow && falling && withinX) {
                    this.pos.y = plat.pos.y - this.size;
                    this.velocity.y = 0;
                    this.isOnGround = true;
                    landed = true;
                    break;
                }
            }
            if (!landed) {
                this.pos.add(this.velocity);
                this.isOnGround = false;
            }
        }
    }
    
    show() {
        rect(this.pos.x, this.pos.y, this.size, this.size);
    }
}
