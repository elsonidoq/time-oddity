let player;
let platforms = [];

function setup() {
    createCanvas(800, 600);
    player = new Player(100, 100);
    platforms = [
        new Platform(200, 450, 200, 20),
        new Platform(500, 350, 150, 20)
    ];
}

function draw() {
    background(0);
    
    // Continuous movement
    if (keyIsDown(LEFT_ARROW)) {
        player.move(-1);
    }
    if (keyIsDown(RIGHT_ARROW)) {
        player.move(1);
    }
    
    player.update();
    player.show();
    for (let plat of platforms) {
        plat.show();
    }
}

function keyPressed() {
    if (key === 'ArrowUp' && player.isOnGround) {
        player.velocity.y = -15;
    }
}
