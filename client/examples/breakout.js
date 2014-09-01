
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-game', { preload: preload, create: create, update: update });

function preload() {

    game.load.atlas('breakout', 'assets/games/breakout/breakout.png', 'assets/games/breakout/breakout.json');
    game.load.image('starfield', 'assets/misc/starfield.jpg');
    game.load.image('v_paddle', 'assets/v_paddle.png');
    game.load.image('h_paddle', 'assets/h_paddle.png');
}

var ball;
var paddle;
var paddles = [];
var bricks;

var ballOnPaddle = true;

var lives = 3;
var margin = 30;
var startingLives = 3;
var rem_lives = [];

var scoreText;
var livesText;
var introText;
var myPlayerIndex;

var s;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  We check bounds collisions against all walls to start. When a player loses, their wall starts colliding.
    game.physics.arcade.checkCollision.down = false;
    game.physics.arcade.checkCollision.up = false;
    game.physics.arcade.checkCollision.left = false;
    game.physics.arcade.checkCollision.right = false;

    s = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    bricks = game.add.group();
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    paddles[0] = game.add.sprite(game.world.centerX, game.height - margin, 'breakout', 'paddle_big.png'); // Bottom
    paddles[1] = game.add.sprite(game.width - margin, game.world.centerY, 'v_paddle');                    // Right
    paddles[2] = game.add.sprite(game.world.centerX, margin, 'breakout', 'paddle_big.png');               // Top
    paddles[3] = game.add.sprite(margin, game.world.centerY, 'v_paddle');                                 // Left

    // Set up paddles and starting lives and lives text
    for (var i = 0; i < paddles.length; i++) {
        paddles[i].anchor.setTo(0.5, 0.5);
        game.physics.enable(paddles[i], Phaser.Physics.ARCADE);
        paddles[i].body.collideWorldBounds = true;
        paddles[i].body.bounce.set(1);
        paddles[i].body.immovable = true;
        rem_lives[i] = startingLives;
    }

    paddle = game.add.sprite(game.world.centerX, 550, 'breakout', 'paddle_big.png');
    paddle.anchor.setTo(0.5, 0.5);

    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    paddle.body.collideWorldBounds = true;
    paddle.body.bounce.set(1);
    paddle.body.immovable = true;

    ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;

    game.physics.enable(ball, Phaser.Physics.ARCADE);

    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);

    ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);

    ball.events.onOutOfBounds.add(ballLost, this);

//    scoreText = game.add.text(32, 550, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
//    livesText = game.add.text(680, 550, 'lives: 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(releaseBall, this);

}

function update () {

    //  Fun, but a little sea-sick inducing :) Uncomment if you like!
//    s.tilePosition.x += (game.input.speed.x / 2);

    paddle.body.x = game.input.x - 24;


    paddles[0].body.x = ball.body.x - 24;
    paddles[1].body.y = ball.body.y - 24;
    paddles[2].body.x = ball.body.x - 24;
    paddles[3].body.y = ball.body.y - 24;

    if (paddle.x < 24)
    {
        paddle.x = 24;
    }
    else if (paddle.x > game.width - 24)
    {
        paddle.x = game.width - 24;
    }

    if (ballOnPaddle)
    {
        ball.body.x = paddle.x;
    }
    else
    {
        game.physics.arcade.collide(ball, paddle, ballHitHPaddle, null, this);
        for (var i = 0; i < paddles.length; i++) {
            if (i % 2 == 0) {
                game.physics.arcade.collide(ball, paddles[i], ballHitHPaddle, null, this);
            } else {
                game.physics.arcade.collide(ball, paddles[i], ballHitVPaddle, null, this);
            }
        }
    }

}

function releaseBall () {

    if (ballOnPaddle)
    {
        ballOnPaddle = false;
        ball.body.velocity.y = -300;
        ball.body.velocity.x = -75;
        ball.animations.play('spin');
        introText.visible = false;
    }

}

function ballLost () {

    if (ball.body.x < 0) {
        // left player loses life
    } else if (ball.body.x > game.width) {
        // right player lost
    } else if (ball.body.y < 0) {
        // top player lost
    } else if (ball.body.y > game.height) {
        // bottom player lost
    }

    lives--;
//    livesText.text = 'lives: ' + lives;

    if (lives === 0)
    {
        gameOver();
    }
    else
    {
        ballOnPaddle = true;

        ball.reset(paddle.body.x + 16, paddle.y - 16);
        
        ball.animations.stop();
    }
}


function gameOver () {

    ball.body.velocity.setTo(0, 0);
    
    introText.text = 'Game Over!';
    introText.visible = true;

}

function ballHitHPaddle (_ball, _paddle) {

    var diff = 0;

    if (_ball.x < _paddle.x)
    {
        //  Ball is on the left-hand side of the paddle
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x += (-10 * diff);
    }
    else if (_ball.x > _paddle.x)
    {
        //  Ball is on the right-hand side of the paddle
        diff = _ball.x -_paddle.x;
        _ball.body.velocity.x += (10 * diff);
    }
    else
    {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        _ball.body.velocity.x = 2 + Math.random() * 8;
    }
    _ball.body.velocity.y *= 1.1; // Speed up ball
}

function ballHitVPaddle(_ball, _paddle) {
    var diff = 0;

    if (_ball.y < _paddle.y)
    {
        //  Ball is on the left-hand side of the paddle
        diff = _paddle.y - _ball.y;
        _ball.body.velocity.y += (-10 * diff);
    }
    else if (_ball.y > _paddle.y)
    {
        //  Ball is on the right-hand side of the paddle
        diff = _ball.y -_paddle.y;
        _ball.body.velocity.y += (10 * diff);
    }
    else
    {
        //  Ball is perfectly in the middle
        //  Add a little random y to stop it bouncing straight up!
        _ball.body.velocity.y = 2 + Math.random() * 8;
    }
    _ball.body.velocity.x *= 1.1; // Speed up ball
}
