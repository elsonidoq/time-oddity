
### ✅ **Step-by-Step Implementation**

#### 1. **Set up platform and player**

Both the platform and player must be Arcade Physics bodies.

javascript

CopyEdit

`this.platform = this.physics.add.sprite(200, 300, 'platform'); this.platform.body.allowGravity = false; this.platform.body.immovable = true; this.player = this.physics.add.sprite(200, 250, 'player');` 

#### 2. **Add collision between player and platform**

javascript

CopyEdit

`this.physics.add.collider(this.player, this.platform);` 

#### 3. **Track the platform's delta movement**

Store the platform’s **previous position** every frame.

javascript

CopyEdit

`this.lastPlatformX = this.platform.x; this.lastPlatformY = this.platform.y;` 

Then in the `update()` method:

javascript

CopyEdit

`const deltaX = this.platform.x - this.lastPlatformX; const deltaY = this.platform.y - this.lastPlatformY; this.lastPlatformX = this.platform.x; this.lastPlatformY = this.platform.y;` 

#### 4. **Check if player is standing on the platform**

A simple approach is:

javascript

CopyEdit

`const touchingDown = this.player.body.touching.down && this.platform.body.touching.up;` 

If the player is standing on the platform, manually move the player with the platform's delta:

javascript

CopyEdit

`if (touchingDown) { this.player.x += deltaX; this.player.y += deltaY;
}` 

----------

### 🧠 Tips

-   This approach works well for horizontal or vertical movement.
    
-   Use `.setVelocityX()` or `.tween` the platform to move it.
    
-   For complex physics, consider using **MatterJS** (Phaser supports it too), which handles this more naturally.