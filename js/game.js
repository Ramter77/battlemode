var inputAllowed = true;
var spawning = true;
var collisionInputOn = true;
var debugOn = false;
var map, layer1, layer2;
var jumpV = 500;
var g = 720;    //GRAVITY

//Locations
var leftTunnelx = 20;
var leftTunnely = 120;
var rightTunnelx = 1260;
var rightTunnely = 120;
var leftCoinIconX = leftTunnelx+390;
var rightCoinIconX = rightTunnelx-400;

//PLAYER
function Player(game, x, y, player) {
    if (player == "player1") {
        var player = game.add.sprite(x, y, 'player1', 52);
        player.animations.add("idle", [52, 53, 52, 54, 52, 52], 4, true);
    }
    else if (player == "player2") {
        var player = game.add.sprite(x, y, 'player2', 52);   
        player.animations.add("idle", [52, 53, 52, 54, 52, 52], 5, true);
    }
    //Physical properties
    player.animations.add("left", [81, 82, 81, 83], 8, true);
    player.animations.add("right", [78, 79, 78, 80], 8, true);
    player.animations.add("spin", [56, 55,79, 78 ,53, 54, 82, 81, 56, 55,79, 78 ,53, 54, 82, 81], 15, true);
    player.animations.play("idle");
    player.scale.setTo(1, 1);
    game.physics.enable(player);
    
    //Logical properties and methods
    player.sizeL = true;
    player.gotCoins = 0;
    player.invincible = false;
    player.disableInvincability = function () {
        player.invincible = false;
    }
    player.spin = function () {                     //Spin
        this.body.enable = false;                   //disable body before destroying so it doesnt collide anymore
        this.animations.play('spin');
    };
    player.move = function (direction) {            //move
        if (inputAllowed) {
            var moveV = 6;
            player.x += direction * moveV;
            if (direction == -1) {                      //left
                player.animations.play("left");
            }
            else if (direction == 1) {                  //right
                player.animations.play("right");
            }
            else {
                player.animations.play("idle");
            }
        }
    };
    player.jump = function () {                     //jump
        if (inputAllowed) {
            var jump = player.body.onFloor();
            if (jump) {
                player.body.velocity.y = -jumpV;
            }
            return jump;
        }
    };
    return player;
};

//ENEMIES
function Enemy(game, x, y, type) {    //WORM
    if (type == "worm") {
        var enemy = game.add.sprite(x, y, 'enemy'); 
        enemy.animations.add('walk', [0, 1, 2, 3], 5, true);
        enemy.animations.add('die', [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0], 28);
        enemy.move = function (dir) {                   //MOVE
            enemy.speed = 100;
            enemy.body.velocity.x = enemy.speed * dir;
        };
    }
    else if (type == "bat") {
        var enemy = game.add.sprite(x, y, 'enemy2');
        enemy.scale.setTo(1.4, 1.4);
        enemy.animations.add('walk', [5, 6, 7], 5, true);
        enemy.animations.add('die', [3, 3, 3, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0], 28);
        enemy.move = function (dir) {                   //MOVE
            enemy.speed = 60;        
            enemy.body.velocity.x = enemy.speed * dir;
            enemy.body.bounce.set(0.99);                //BOUNCE  
        };
    }
    else if (type == "frog") {
        var enemy = game.add.sprite(x, y, 'enemy3');    
        enemy.scale.setTo(0.8, 0.8);
        enemy.animations.add('walk', [4, 3, 2, 2, 1, 0, 0, 1, 2, 2, 3, 4, 4], 15, true);
        enemy.animations.add('die', [4, 5, 6, 5, 4, 3, 3, 4, 5, 6, 5, 4, 3, 3, 3, 3, 3], 28);
        enemy.move = function (dir) {                   //MOVE
            enemy.speed = 100;        
            enemy.body.velocity.x = enemy.speed * dir;
            if (enemy.body.onFloor()){
                enemy.body.velocity.y = -400;           //JUMP
            }
            else if (enemy.body.touching.down){
                enemy.body.velocity.y = -400;           //JUMP
            }
        };
    }
    enemy.anchor.setTo(0.5, 0.5);
    enemy.animations.play('walk');
    game.physics.enable(enemy);
    enemy.body.collideWorldBounds = true;

    enemy.die = function () {                       //DIE
        this.body.enable = false;                   //disable body before destroying so it doesnt collide anymore
        this.animations.play('die').onComplete.addOnce(function () {
            this.kill();
            this.destroy();
        }, this);
    };
    return enemy;
}

function PowerUp(game, x, y, type) { //setup powerups
    if (type == "coin") {
        var powerup = game.add.sprite(x, y, 'coin'); 
        powerup.scale.setTo(1.2, 1.2);
        powerup.animations.add('rotate', [0, 1, 2, 3, 4, 5, 6, 7], 6, true);
        powerup.speed = 100;
    }
    else if (type == "shroom") {
        var powerup = game.add.sprite(x, y, 'shroom'); 
        powerup.scale.setTo(2.5, 2.5);
        powerup.animations.add('rotate', [0, 1, 2, 3], 5, true);
        powerup.speed = 50;
    }
    else if (type == "orb") {
        var powerup = game.add.sprite(x, y, 'orb'); 
        powerup.scale.setTo(0.2, 0.2);
        powerup.animations.add('rotate', [0, 1, 2, 3, 4, 5, 6, 7], 30, true);
        powerup.speed = 400;
    }
    powerup.anchor.setTo(0.5, 0.5);
    powerup.animations.play('rotate');
    game.physics.enable(powerup);
    powerup.body.collideWorldBounds = true;

    powerup.move = function (dir) {
        powerup.body.velocity.x = powerup.speed * dir;
    };
    return powerup;
}

function Pow(game, x, y) {  //setup POWs
    var pow = game.add.sprite(x, y, 'pow');
    pow.anchor.setTo(0.5, 0.5);
    pow.scale.setTo(0.25, 0.25);
    game.physics.enable(pow);
    pow.body.allowGravity = false;
    pow.body.immovable = true;
    
    pow.lives = 2;
    pow.invincible = false;
    pow.disableInvincability = function () {
        pow.invincible = false;  
        if (pow.body.enable == false || pow != null){
            pow.body.enable = true;  
        }
    }
    return pow;
}

function killSwitch(game, x, y) {   //setup killSwitches
    var killswitch = game.add.sprite(x, y, '');     
    killswitch.anchor.setTo(0.5, 0.5);
    killswitch.scale.setTo(4, 4);
    game.physics.enable(killswitch);
    killswitch.body.allowGravity = false;
    killswitch.body.immovable = true;
    return killswitch;
}

////////////////////////////////////////////////////////////////////////
// PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY /
////////////////////////////////////////////////////////////////////////

var Play = {
    init: function () {
        this.game.renderer.renderSession.roundPixels = true;    //fix blurryness
        this.keys = this.game.input.keyboard.addKeys({          //add player1 & player2 keys
            left: Phaser.KeyCode.LEFT,
            right: Phaser.KeyCode.RIGHT,
            up: Phaser.KeyCode.UP,
            left2: Phaser.KeyCode.A,
            right2: Phaser.KeyCode.D,
            up2: Phaser.KeyCode.W,
        }); 
        //JUMPING
        this.keys.up.onDown.add(function () {
            var jumped = Play.player1.jump();
            if (jumped) {                      //if successful play sound
                this.audio.jump.play();
            }
        }, this);
        this.keys.up2.onDown.add(function () {
            var jumped2 = Play.player2.jump();
            if (jumped2) {
                this.audio.jump.play();
            }
        }, this);
    },
    preload: function () {
        //IMAGES
        this.load.crossOrigin = "Anonymous";
        this.game.load.image("background", "./images/backg.jpg");
        this.game.load.tilemap("map", "./map/map.json", null, Phaser.Tilemap.TILED_JSON);   //map
        this.game.load.image("Landscape", "./images/kenneyrpgpack/Spritesheet/RPGpack_sheet.png");
        this.game.load.spritesheet("player1", './images/kenney_sokobanpack/Tilesheet/sokoban_tilesheet2.png', 64, 64);
        this.game.load.spritesheet("player2", './images/kenney_sokobanpack/Tilesheet/sokoban_tilesheet1.png', 64, 64);
        this.game.load.spritesheet("enemy", 'images/enemy_spritesheet.png', 64, 31);
        this.game.load.spritesheet("enemy2", 'images/enemy2_spritesheet.png', 32, 32);
        this.game.load.spritesheet("enemy3", 'images/enemy3_spritesheet.png', 62.5, 62.5);
        this.game.load.spritesheet("shroom", 'images/tomatohead.png', 12, 12);
        this.game.load.spritesheet("orb", 'images/orbs.png', 128, 128);
        this.game.load.spritesheet("coin", 'images/coin_spritesheet.png', 18, 20);
        this.game.load.image('pow', 'images/POW.png');
        //Icons
        this.game.load.spritesheet("icon:coin", 'images/coin_icon.png');
        this.game.load.image('icon:p1', 'images/p1icon.png');
        this.game.load.image('icon:p2', 'images/p2icon.png');
        this.game.load.image('icon:winM', 'images/winTextM.png');
        this.game.load.image('icon:winL', 'images/winTextL.png');
        //AUDIO
        this.game.load.audio('audio:jump', 'audio/jump.wav');
        this.game.load.audio('audio:hit', 'audio/hit.wav');
        this.game.load.audio('audio:teleport', 'audio/teleport.mp3');
        this.game.load.audio('audio:scale1', 'audio/scale1.wav');
        this.game.load.audio('audio:scale2', 'audio/scale3.wav');
        this.game.load.audio('audio:pow', 'audio/pow.wav');
        this.game.load.audio('audio:gameover', 'audio/gameover.wav');
        this.game.load.audio('audio:coin', 'audio/coin.wav'); 
        this.game.load.audio('audio:music', 'audio/music.mp3');
    },
    create: function () {
        //Setup audio
        this.audio = {    //sound
            jump: this.game.add.audio('audio:jump'),
            hit: this.game.add.audio('audio:hit'),
            teleport: this.game.add.audio('audio:teleport'),
            scale2: this.game.add.audio('audio:scale1'),
            scale1: this.game.add.audio('audio:scale2'),
            pow: this.game.add.audio('audio:pow'),
            gameover: this.game.add.audio('audio:gameover'),
            coin: this.game.add.audio('audio:coin')
        };
        var music = this.game.add.audio('audio:music'); //music
        music.loop = true;
        music.volume -= 0.5;
        music.play();
        this.game.physics.arcade.gravity.y = g;       //setup gravity
        this.setupTilemap();                          //setup map
        this.HUD();                                   //setup HUD
        this.spawn();                                 //spawn players and enemies 
    },
    update: function () {
        if (collisionInputOn) {
            this._Input();                           //handle input
            this._Collisions();                      //handle collisions    
        }
        //DEBUG
        if (debugOn) {
            this.game.debug.physicsGroup(this.players);
            this.game.debug.physicsGroup(this.enemies);
            this.game.debug.physicsGroup(this.coins);
            this.game.debug.physicsGroup(this.shrooms);
            this.game.debug.physicsGroup(this.orbs);
            this.game.debug.physicsGroup(this.pows);
            this.game.debug.physicsGroup(this.killswitches); 
            if (debugOn){layer2.debug = true;}              //debug layer   
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY /// PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY   PLAY /
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Play.setupTilemap = function () {                   //setup Tilemap and create the two layers
    this.game.add.sprite(0, 0, 'background');       //insert background before map
    map = this.game.add.tilemap("map");
    map.addTilesetImage("Landscape");
    layer1 = map.createLayer(0);
    layer2 = map.createLayer(1);
    map.setCollisionBetween(1, 1040, true, 1);      //set collision to all tiles
};

Play.spawn = function () {    //add to groups
    //GROUPS
    this.players = this.game.add.group();
    this.enemies = this.game.add.group();
    this.coins = this.game.add.group();
    this.shrooms = this.game.add.group();
    this.orbs = this.game.add.group();
    this.pows = this.game.add.group();
    this.killswitches = this.game.add.group();
    
    //Players
    this.player1 = this.players.add(Player(this.game, leftTunnelx+100, 270, "player1"));
    this.player2 = this.players.add(Player(this.game, rightTunnelx-160, 270, "player2"));
    
    //LEFT & RIGHT SPAWN    
    this.game.time.events.loop(Phaser.Timer.SECOND * 3.5, this.spawnLeft, this);
    this.game.time.events.loop(Phaser.Timer.SECOND * 3.7, this.spawnRight, this);

    //POW
    this.pow = this.pows.add(Pow(this.game, this.game.width/2+20, 450));
    this.pow2 = this.pows.add(Pow(this.game, this.game.width/2-313, 320));
    this.pow3 = this.pows.add(Pow(this.game, this.game.width/2+323, 320));
    
    //KILLSWITCHES
    this.killswitch = this.killswitches.add(killSwitch(this.game, leftTunnelx-70, 545));
    this.killswitch2 = this.killswitches.add(killSwitch(this.game, rightTunnelx+70, 545));
};

Play.spawnLeft = function () {
    if (spawning) {                                         //if spawning allowed
        var random = Math.floor((Math.random() * 8) + 1);   //get a random number and spawn the corresponding element
        switch (random) {
            case 1:
                this.enemies.add(Enemy(this.game, leftTunnelx, leftTunnely, "worm")); 
                break;
            case 2:
                this.enemies.add(Enemy(this.game, leftTunnelx, leftTunnely, "worm")); 
                break;
            case 3:
                this.enemies.add(Enemy(this.game, leftTunnelx, leftTunnely-30, "bat"));
                break;
            case 4:
                this.enemies.add(Enemy(this.game, leftTunnelx, leftTunnely, "frog")); 
                break;
            case 5:
                this.coins.add(PowerUp(this.game, leftTunnelx, leftTunnely, "coin"));
                break;
            case 6:
                this.shrooms.add(PowerUp(this.game, leftTunnelx, leftTunnely, "shroom"));
                break;
            case 7:
                this.shrooms.add(PowerUp(this.game, leftTunnelx, leftTunnely, "shroom"));
                break;
            case 8:
                this.orbs.add(PowerUp(this.game, leftTunnelx, leftTunnely, "orb"));
                break;
        }      
    }
}

Play.spawnRight = function () {
    if (spawning) {                     
        var random = Math.floor((Math.random() * 6) + 1);
        switch (random) {
            case 1:
                this.enemies.add(Enemy(this.game, rightTunnelx, rightTunnely, "worm")); 
                break;
            case 2:
                this.enemies.add(Enemy(this.game, rightTunnelx, rightTunnely, "worm")); 
                break;
            case 3:
                this.enemies.add(Enemy(this.game, rightTunnelx, rightTunnely-30, "bat"));
                break;
            case 4:
                this.enemies.add(Enemy(this.game, rightTunnelx, rightTunnely, "frog")); 
                break;
            case 5:
                this.coins.add(PowerUp(this.game, rightTunnelx, rightTunnely, "coin"));
                break;
            case 6:
                this.shrooms.add(PowerUp(this.game, rightTunnelx, rightTunnely, "shroom"));
                break;
            case 7:
                this.shrooms.add(PowerUp(this.game, rightTunnelx, rightTunnely, "shroom"));
                break;
            case 8:
                this.orbs.add(PowerUp(this.game, rightTunnelx, rightTunnely, "orb"));
                break;
        }
    }
}

Play.HUD = function () {      //add mario & luigi icons
    var p1Icon = this.game.make.image(leftTunnelx+320, 60, 'icon:p1');
    var p2Icon = this.game.make.image(rightTunnelx-380, 60, 'icon:p2');
    p1Icon.anchor.set(0, 0.5);
    p2Icon.anchor.set(0, 0.5);
    this.hud = this.game.add.group();
    this.hud.add(p1Icon);
    this.hud.add(p2Icon);
}

Play._Input = function () {        //move and play corresponding animations
    //PLAYER1
    if (this.keys.left.isDown) {
        Play.player1.move(-1);
    }   
    else if (this.keys.right.isDown) {
        Play.player1.move(1);
    }
    else { //stop completely
        Play.player1.move(0);
    }
    //PLAYER2
    if (this.keys.left2.isDown) {
        Play.player2.move(-1);
    }   
    else if (this.keys.right2.isDown) {
        Play.player2.move(1);
    }
    else { //stop completely
        Play.player2.move(0);
    } 
};

Play._Collisions = function () {
    //WRAP
    Play.game.world.wrap(Play.player1, 0, true, true, false);
    Play.game.world.wrap(Play.player2, 0, true, true, false);
    //Play.enemies.forEach(function (enemy, index){                 //each enemy in the group enemies
    //    if (enemy.alive) {                                        //only check if alive
    //        Play.game.world.wrap(enemy, 0, true, true, false);    //wrap all enemies
    //    }
    //});
    //Bounce off same
    this.game.physics.arcade.collide(this.players, this.players, this.hitPlayer, null, this);
    this.game.physics.arcade.collide(this.enemies, this.enemies, this.hitSame, null, this);

    //Collisions with obstacles layer2
    this.game.physics.arcade.collide(this.players, layer2);
    this.game.physics.arcade.collide(this.enemies, layer2);
    this.game.physics.arcade.collide(this.coins, layer2);
    this.game.physics.arcade.collide(this.shrooms, layer2);
    this.game.physics.arcade.collide(this.orbs, layer2);
    
    //hitByEnemy
    this.game.physics.arcade.collide(this.players, this.enemies, this.hitByEnemy, null, this);
    
    //hitPowerup
    this.game.physics.arcade.collide(this.players, this.coins, this.hitCoin, null, this);
    this.game.physics.arcade.collide(this.players, this.shrooms, this.hitShroom, null, this);
    this.game.physics.arcade.collide(this.players, this.orbs, this.hitorb, null, this);
    
    //hitPow
    this.game.physics.arcade.collide(this.players, this.pows, this.hitPow, null, this);
    this.game.physics.arcade.collide(this.enemies, this.pows, this.hitPow, null, this); //enemies can hit pow
    //this.game.physics.arcade.collide(this.enemies, this.pows);                        //enemies can't hit pow
    
    //hitKill
    this.game.physics.arcade.overlap(this.enemies, this.killswitches, this.hitKill, null, this);
    this.game.physics.arcade.overlap(this.coins, this.killswitches, this.hitKill, null, this);
    this.game.physics.arcade.overlap(this.shrooms, this.killswitches, this.hitKill, null, this);
    this.game.physics.arcade.overlap(this.orbs, this.killswitches, this.hitKill, null, this);
    
    this.flipEnemies();
}

Play.flipEnemies = function () {             //flip enemies when they hit walls
    this.enemies.forEach(function (enemy, index){
        if (enemy.alive) {                   //only do so if alive
            if(enemy.body.blocked.right){
                enemy.scale.x *= -1;         //flip direction of sprite to the left
            }
            else if(enemy.body.blocked.left){
                enemy.scale.x *= -1;         //flip direction of sprite to the right
            }
            enemy.move(enemy.scale.x);       //move in the direction of the flip (sprite)
        }
    });
    this.coins.forEach(function (coin, index){
        if (coin.alive) {                   
            if(coin.body.blocked.right){
                coin.scale.x *= -1; 
            }
            else if(coin.body.blocked.left){
                coin.scale.x *= -1;
            }
            coin.move(coin.scale.x);
        }
    });
    this.shrooms.forEach(function (shroom, index){
        if (shroom.alive) {                   
            if(shroom.body.blocked.right){
                shroom.scale.x *= -1; 
            }
            else if(shroom.body.blocked.left){
                shroom.scale.x *= -1;
            }
            shroom.move(shroom.scale.x);
        }
    });
    this.orbs.forEach(function (orb, index){
        if (orb.alive) {                   
            if(orb.body.blocked.right){
                orb.scale.x *= -1; 
            }
            else if(orb.body.blocked.left){
                orb.scale.x *= -1;
            }
            orb.move(orb.scale.x);
        }
    });
}

Play.hitPlayer = function (obj1, obj2) {   //obj1:player, obj2:player   
    obj1.body.velocity.x = 0;              //stop velocity
    obj2.body.velocity.x = 0;
    //JUMP
    if (obj1.body.touching.down && obj2.body.touching.up){
        obj1.body.velocity.y = -jumpV/1.4;
    }
    if (obj2.body.touching.down && obj1.body.touching.up){
        obj2.body.velocity.y = -jumpV/1.4;
    }
    //PUSH
    else {
        if ((obj1.body.x-obj2.body.x) > 0) {        //means that obj1 is on the left
            if ((obj1.body.x-obj2.body.x) < 60) {
                obj1.body.x += 3;                   //drift apart
                obj2.body.x -= 3;
            }
        }
        else if ((obj1.body.x-obj2.body.x) < 0) {     
            if ((obj1.body.x-obj2.body.x) < -60) {
                obj1.body.x -= 3;
                obj2.body.x += 3;
            }
        }
    }
}

Play.hitSame = function (obj1, obj2) {  //if enemies hit each other
    //If one is on top of another move them
    if (obj1.body.touching.up) {
        obj2.body.velocity.y = -20;
    }
    else if (obj2.body.touching.up) {
        obj1.body.velocity.y = -20;
    }
    else {   //else flip them
        obj1.scale.x *= -1;
        obj2.scale.x *= -1; 
    }
}

Play.hitByEnemy = function (obj1, obj2) {   //obj1:player, obj2:enemy 
    if (!obj1.invincible) {
        console.log("hit enemy");   
        this.audio.hit.play();
        obj1.body.velocity.x = 0;
        obj1.body.velocity.y = 0;
        if (this.enemies.children.indexOf(obj2) > -1){       //needed?     
            if (obj2.body.touching.up){              //if a player jumped on an enemy then kill it
                obj1.body.velocity.y -= jumpV-80;    //make the player jump less than normal
                obj2.die();
            }
            else {
                if (obj1.sizeL == false) {
                    this.gameOver(obj1, false);
                }
                else if (obj1.sizeL == true) {    //rescale big players if hit by an enemy
                    Play.shrinkG(obj1, false);    //shrink
                }     
            }
        }
    }
}

Play.upOrDown = function (obj1, big, pos) {
    //SHRINKING/GROWING
    if (pos) {
        if (big) {
            scale = 1;
            obj1.sizeL = true;
        } 
        else if (!big) {
            scale = 0.5;
            obj1.sizeL = false;
        }     
    }
   else if (!pos){      //adjust position
        if (big) {
            obj1.body.y -= 12;
            obj1.body.x -= 12;
        } 
        else if (!big) {
            obj1.body.y += 12;
            obj1.body.x += 12;
        } 
    }
}

Play.shrinkG = function (obj1, big) {   //if big false then shrink
    inputAllowed = false;         //no Input
    spawning = false;             //stop spawning
    obj1.invincible = true;       //invincible while shrinking
    Play.togglePause();           //pause for shirnking
    Play.upOrDown(obj1, big, false);
    
    Play.game.time.events.add(120, function () {
    Play.resize(obj1, scale);
    Play.audio.scale1.play();     
        Play.game.time.events.add(120, function () {
            Play.resize(obj1, scale);
            Play.audio.scale2.play();          
            Play.game.time.events.add(120, function () {
                Play.resize(obj1, scale);
                Play.audio.scale1.play();
                Play.game.time.events.add(120, function () {
                    Play.audio.scale2.play();
                    Play.resize(obj1, scale);
                    inputAllowed = true;                //yes Input
                   
                    Play.togglePause();               //unpause           
                    Play.game.time.events.add(800, function () {    //800ms of invincibility
                        //at last disable invincability after another delay
                        Play.player1.disableInvincability();
                        Play.player2.disableInvincability();
                    });
                });
            });
        });
    });
    spawning = true;                        //resume spawning
    Play.upOrDown(obj1, big, true);
}

Play.resize = function (obj, scale) {          //resizing when hit
    if (scale == 1) {
        obj.body.y -= 24;
        obj.body.x -= 24;
    } 
    else if (scale == 0.5) {
        obj.body.y += 24;
        obj.body.x += 24;
    } 
    obj.scale.setTo(scale);
}

Play.togglePause = function () {              
    this.game.physics.arcade.isPaused = (this.game.physics.arcade.isPaused) ? false : true;
}

//POWERUP COLLISION
Play.hitCoin = function (obj1, obj2) {     //obj1:player, obj2:coin
    console.log("picked up COIN");
    this.audio.coin.play();
    obj1.body.velocity.x = 0;
    obj1.gotCoins += 1;                    //add coins
    this.addCoin(obj1);
    obj2.destroy();
}

Play.hitShroom = function (obj1, obj2) {     //obj1:player, obj2:shroom
    console.log("picked up SHROOM");
    obj1.body.velocity.x = 0;
    obj1.body.velocity.y = 0;
    if (obj1.sizeL == false) {               //if small size go big
        obj1.body.y -= 24;                   //adjust coordinates a bit
        obj1.body.x += 12;
        Play.shrinkG(obj1, true);
        obj1.sizeL = true;
        obj2.destroy();                      //only destroy if used
    }
}

Play.hitorb = function (obj1, obj2) {     //obj1:player, obj2:orb (teleport)
    console.log("picked up orb");
    this.audio.teleport.play();
    obj1.body.y -= 24;   //so they dont fall through floor
    obj2.body.y -= 24;
    //stop movement before teleporting
    this.player1.body.velocity.x = 0;
    this.player1.body.velocity.y = 0;
    this.player2.body.velocity.x = 0;      
    this.player2.body.velocity.y = 0;
    Play.switchPlaces();
    obj2.destroy();
}

Play.switchPlaces = function () {
    //TELEPORT by exchanging coordinates 
    var tempX = Play.player1.body.x;
    var tempY = Play.player1.body.y;
    Play.player1.body.x = Play.player2.body.x; 
    Play.player1.body.y = Play.player2.body.y;
    Play.player2.body.x = tempX;
    Play.player2.body.y = tempY;
}

Play.hitPow = function (obj1, obj2) {    //obj1:player, obj2:pow
    this.audio.pow.play();
    console.log("hit POW");
    obj1.body.velocity.x = 0;
    obj1.body.velocity.y = 0;

    //JUMP and disable POW body
    if (obj1.body.touching) {
        obj1.body.velocity.y = -jumpV/2.15;
        obj2.body.enable = false;
    }
    if (!obj2.invincible) {
        obj2.invincible = true;

        this.game.time.events.add(Phaser.Timer.SECOND * 0.65, obj2.disableInvincability, this);    //disable invincability after 0.65 sec

        //Handle POW scale behaviour
        if (obj2.lives == 2) {
            obj2.scale.setTo(0.25, 0.14);
            obj2.lives -= 1;
        }
        else if (obj2.lives == 1) { 
            obj2.scale.setTo(0.25, 0.07);
            obj2.lives -= 1;
        }
        else {
            obj2.kill();                 //if no more lives then kill it  
        }
        
        //Make other player jump
        var powV = -400;
        if (obj1 == this.player1) {
            this.player2.body.velocity.y = powV;    
        }
        else if (obj1 == this.player2) {
            this.player1.body.velocity.y = powV;         
        }
        //Make enemies jump
        this.enemies.forEach(function (enemy, index){
            enemy.body.velocity.y = powV;
        });
        this.coins.forEach(function (coin, index){
            coin.body.velocity.y = powV;
        });
        this.shrooms.forEach(function (shroom, index){
            shroom.body.velocity.y = powV;
        });
        this.orbs.forEach(function (orb, index){
            orb.body.velocity.y = powV;
        });  
    }
}

Play.hitKill = function (obj1, obj2) {     //obj1:enemy, obj2:killSwitch    
    console.log("hit KILLSWITCH");
    this.audio.hit.play();
    //play death animations for enemies or else just kill
    if ((obj1.parent) == this.enemies) {
        obj1.die();
    }
    else {
        obj1.kill();
    }
}

Play.addCoin = function (obj1) {    
    //add coin icons
    if (obj1 == this.player1) {
        var coinIcon = this.game.make.image(leftCoinIconX, 50, 'icon:coin');    
        leftCoinIconX += 23;
    }
    else if (obj1 == this.player2) {
        var coinIcon = this.game.make.image(rightCoinIconX, 50, 'icon:coin');    
        rightCoinIconX -= 23;
    }
    this.hud.add(coinIcon);    //add to HUD
    //If a player has more than 4 coins call gameOver
    if (obj1.gotCoins > 4) {   //4
        if (obj1 == this.player1) {
            this.gameOver(this.player2, true);
        }
        else if (obj1 == this.player2) {
            this.gameOver(this.player1, true);
        }
    }
}

Play.gameOver = function (loser, coinWin) {         //LOSE win condition
    this.game.sound.stopAll();
    this.audio.gameover.play();
    Play.player1.body.velocity.x = 0;
    Play.player1.body.velocity.y = 0;
    Play.player2.body.velocity.x = 0;      
    Play.player2.body.velocity.y = 0;
    
    console.log("GAMEOVER");
    var winner, winT;
    //Determine the winner and add the win text
    if ((coinWin || loser == this.player1) && (loser == this.player1)) {
        winner = this.player2; 
        winT = this.game.make.image(this.game.width/2-240, 310, 'icon:winL');
    }
    else if ((coinWin || loser == this.player2) && (loser == this.player2)) {
        winner = this.player1; 
        winT = this.game.make.image(this.game.width/2-240, 310, 'icon:winM');
    }
    Play.hud.add(winT);
    
    console.log("Winner: " + winner.key)    
    //Disable variables 
    collisionInputOn = false;
    inputAllowed = false;
    spawning = false;
    
    //Freeze and spin winner
    winner.body.immovable = true;
    winner.body.allowGravity = false;
    winner.animations.play('spin');

    //DISABLE COLLISION DETECTION FOR ALL ELEMENTS
    this.enemies.forEach(function (enemy, index){
        if (enemy.alive) {                   //only check if alive
            enemy.body.collideWorldBounds=false;
        }
    });
    this.coins.forEach(function (enemy, index){
        if (enemy.alive) {                   //only check if alive
            enemy.body.collideWorldBounds=false;
        }
    });
    this.shrooms.forEach(function (enemy, index){
        if (enemy.alive) {                   //only check if alive
            enemy.body.collideWorldBounds=false;
        }
    });
    this.orbs.forEach(function (enemy, index){
        if (enemy.alive) {                   //only check if alive
            enemy.body.collideWorldBounds=false;
        }
    });
    this.pows.forEach(function (pow, index){
        if (pow.alive) {                     //only check if alive
            pow.body.collideWorldBounds=false;
            pow.body.immovable = false;
            pow.body.allowGravity = true;    //allow pow to fall
        }
    });  
    
    //after certain delay restart the state
    this.game.time.events.add(7000, function () {           //restart after 7 seconds
        //Play.game.state.startt('play', true, true);
    });
}

/////////START/////////

function init () {   //on window load initialize
    var game = new Phaser.Game(1280, 640, Phaser.WEBGL, 'game');
    game.state.add('play', Play);
    game.state.start('play');   
}

window.onload = function () {   
   init();
};