// Treat Collector Game

// Leaderboard functionality
let leaderboard = [];
let currentPlayerName = "";

// Load leaderboard from localStorage if available
function loadLeaderboard() {
    const savedLeaderboard = localStorage.getItem('treatCollectorLeaderboard');
    if (savedLeaderboard) {
        leaderboard = JSON.parse(savedLeaderboard);
    }
    updateLeaderboardDisplay();
}

// Save leaderboard to localStorage
function saveLeaderboard() {
    localStorage.setItem('treatCollectorLeaderboard', JSON.stringify(leaderboard));
}

// Add a new score to the leaderboard
function addScoreToLeaderboard(name, score) {
    leaderboard.push({ name, score, date: new Date().toLocaleDateString() });
    
    // Sort leaderboard by score (highest first)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores
    if (leaderboard.length > 10) {
        leaderboard = leaderboard.slice(0, 10);
    }
    
    saveLeaderboard();
    updateLeaderboardDisplay();
}

// Update the leaderboard display in the HTML
function updateLeaderboardDisplay() {
    const leaderboardEntriesElement = document.getElementById('leaderboard-entries');
    leaderboardEntriesElement.innerHTML = '';
    
    // Show a message if no scores yet
    if (leaderboard.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '20px 10px';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.textContent = 'No treats collected yet!';
        leaderboardEntriesElement.appendChild(emptyMessage);
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.className = 'leaderboard-entry';
        
        // Add trophy emoji for top 3
        let prefix = `${index + 1}.`;
        if (index === 0) prefix = '🏆 ' + prefix;
        else if (index === 1) prefix = '🥈 ' + prefix;
        else if (index === 2) prefix = '🥉 ' + prefix;
        
        entryElement.innerHTML = `
            <span>${prefix} ${entry.name}</span>
            <span>${entry.score} 🦴</span>
        `;
        leaderboardEntriesElement.appendChild(entryElement);
    });
}

// Initialize name input functionality
function initNameInput() {
    const nameInputContainer = document.getElementById('name-input-container');
    const playerNameInput = document.getElementById('player-name');
    const submitNameButton = document.getElementById('submit-name');
    
    // Show name input when clicking start button
    document.addEventListener('showNameInput', function() {
        nameInputContainer.style.display = 'block';
        playerNameInput.focus();
    });
    
    // Handle name submission
    submitNameButton.addEventListener('click', function() {
        submitPlayerName();
    });
    
    // Also submit when pressing Enter
    playerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitPlayerName();
        }
    });
    
    function submitPlayerName() {
        const name = playerNameInput.value.trim();
        if (name) {
            currentPlayerName = name;
            nameInputContainer.style.display = 'none';
            document.dispatchEvent(new Event('startGameWithName'));
        } else {
            playerNameInput.placeholder = 'Please enter a name';
        }
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadLeaderboard();
    initNameInput();
});

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth - 250, // Account for leaderboard width
    height: window.innerHeight,
    parent: 'game-container', // Render in game-container div
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    backgroundColor: '#7cba5d', // Base green color for grass
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    input: {
        gamepad: true // Enable gamepad input
    }
};

// Global variables
let game;
let player;
let treats;
let cursors;
let gamepad; // Controller variable
let score = 0;
let scoreText;
let timeLeft = 30;
let timerText;
let timerEvent;
let gameStarted = false;
let gameOver = false;
let startButton;
let gameOverText;
let finalScoreText;
let restartButton;
// leaderboard and currentPlayerName are already declared at the top of the file
let menuMusic = null;
let gameMusic = null;
let endMusic = null;
let biteSfx = null; // Sound effect for collecting treats
let musicEnabled = true;
let controllerConnected = false; // Track if controller is connected

// Initialize the game when the window loads
window.onload = function() {
    try {
        game = new Phaser.Game(config);
    } catch (error) {
        console.error('Error initializing game:', error);
        // Show an error message to the user
        document.getElementById('game-container').innerHTML = '<div style="text-align: center; padding: 20px;"><h2>Error loading game</h2><p>Please refresh the page and try again.</p></div>';
    }
};

// Preload assets
function preload() {
    // Load dog sprite sheet
    this.load.spritesheet('dog', 'assets/sprites/bella-forrest.png', { 
        frameWidth: 32, 
        frameHeight: 32 
    });
    
    // Load treat image
    this.load.image('treat', 'assets/sprites/treat.png');
    
    // Load music tracks
    this.load.audio('menu-music', 'assets/music/Mischief in Motion.mp3');
    this.load.audio('game-music', 'assets/music/Playful Chase.mp3');
    this.load.audio('end-music', 'assets/music/Silly Stroll.mp3');
    
    // Load sound effects
    this.load.audio('bite-sfx', 'assets/music/bite.wav');
    
    // Create grass pattern texture
    this.textures.addBase64('grass-pattern', createGrassPattern());
}

// Create game objects
function create() {
    // Create grass background
    createGrassBackground(this);
    
    // We'll set up the music in a separate function to avoid blocking game initialization
    this.events.once('create', function() {
        setupMusic(this);
    }, this);
    
    // Setup controller input detection
    this.input.gamepad.on('connected', function (pad) {
        console.log('Controller connected:', pad.id);
        gamepad = pad;
        controllerConnected = true;
    });
    
    this.input.gamepad.on('disconnected', function (pad) {
        console.log('Controller disconnected:', pad.id);
        controllerConnected = false;
    });
    
    // Check for already connected gamepads
    if (this.input.gamepad.total) {
        gamepad = this.input.gamepad.getPad(0);
        controllerConnected = true;
        console.log('Controller already connected:', gamepad.id);
    }
    
    // Create player (dog sprite)
    player = this.physics.add.sprite(config.width / 2, config.height / 2, 'dog');
    player.setScale(2); // Make the dog a bit larger
    player.body.setCollideWorldBounds(true);
    player.body.setSize(20, 20); // Adjust hitbox to be smaller than the sprite
    player.body.setOffset(6, 10); // Center the hitbox
    
    // Create animations
    this.anims.create({
        key: 'walk-right',
        frames: this.anims.generateFrameNumbers('dog', { frames: [4, 5, 6] }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'walk-left',
        frames: this.anims.generateFrameNumbers('dog', { frames: [28, 29, 30] }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'walk-up',
        frames: this.anims.generateFrameNumbers('dog', { frames: [12, 13, 14] }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'walk-down',
        frames: this.anims.generateFrameNumbers('dog', { frames: [20, 21, 22] }),
        frameRate: 10,
        repeat: -1
    });
    
    // Default animation
    player.anims.play('walk-down');
    player.anims.pause(); // Start with still frame
    
    // Create treats group
    treats = this.physics.add.group();
    
    // If the treat image isn't loaded yet, we'll create a fallback
    this.textures.addBase64('treat-fallback', createTreatImage());
    
    // Setup collision detection
    this.physics.add.overlap(player, treats, collectTreat, null, this);
    
    // Setup controls
    cursors = this.input.keyboard.createCursorKeys();
    
    // Create UI elements with styled background panels
    // Score panel
    const scorePanel = this.add.graphics();
    scorePanel.fillStyle(0xf8d56c, 0.9); // Yellow background
    scorePanel.fillRoundedRect(10, 10, 180, 50, 15);
    scorePanel.lineStyle(4, 0xd9842b, 1); // Orange border
    scorePanel.strokeRoundedRect(10, 10, 180, 50, 15);
    
    // Timer panel
    const timerPanel = this.add.graphics();
    timerPanel.fillStyle(0xf8d56c, 0.9); // Yellow background
    timerPanel.fillRoundedRect(config.width - 190, 10, 170, 50, 15);
    timerPanel.lineStyle(4, 0xd9842b, 1); // Orange border
    timerPanel.strokeRoundedRect(config.width - 190, 10, 170, 50, 15);
    
    // Add treat icon next to score
    const treatIcon = this.add.image(40, 35, 'treat').setScale(0.8);
    
    // Create text with shadow effect
    scoreText = this.add.text(75, 20, 'Treats: 0', { 
        fontFamily: 'Bubblegum Sans', 
        fontSize: '28px', 
        fill: '#5b3a29',
        stroke: '#ffffff',
        strokeThickness: 2
    });
    
    timerText = this.add.text(config.width - 170, 20, 'Time: 30', { 
        fontFamily: 'Bubblegum Sans', 
        fontSize: '28px', 
        fill: '#5b3a29',
        stroke: '#ffffff',
        strokeThickness: 2
    });
    
    // Create start button (simple version)
    startButton = this.add.text(config.width / 2, config.height / 2, 'START', { 
        fontSize: '64px', 
        fill: '#fff',
        backgroundColor: '#4CAF50',
        padding: { x: 30, y: 15 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', function() {
        // Show name input dialog
        document.getElementById('name-input-container').style.display = 'block';
        // Hide the start button
        this.setVisible(false);
    });
    
    // Create game over text (hidden initially)
    gameOverText = this.add.text(config.width / 2, config.height / 2 - 100, 'GAME OVER!', { 
        fontSize: '64px', 
        fill: '#fff' 
    })
    .setOrigin(0.5)
    .setVisible(false);
    
    finalScoreText = this.add.text(config.width / 2, config.height / 2, '', { 
        fontSize: '48px', 
        fill: '#fff' 
    })
    .setOrigin(0.5)
    .setVisible(false);
    
    // Create restart button (hidden initially)
    restartButton = this.add.text(config.width / 2, config.height / 2 + 100, 'PLAY AGAIN', { 
        fontSize: '48px', 
        fill: '#fff',
        backgroundColor: '#4CAF50',
        padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', restartGame.bind(this))
    .setVisible(false);
    
    // Hide player initially
    player.setVisible(false);
}

// Update game state
function update() {
    if (!gameStarted || gameOver) {
        // Check for controller input on start/game over screens
        if (controllerConnected && gamepad) {
            // A button to start/restart game
            if (gamepad.buttons[0].pressed) {
                if (!gameStarted && !gameOver) {
                    onStartButtonClick();
                } else if (gameOver && restartButton && restartButton.visible) {
                    restartGame();
                }
            }
        }
        return;
    }
    
    // Player movement
    player.body.setVelocity(0);
    let isMoving = false;
    let currentAnim = '';
    
    // Faster movement speed (300 instead of 200)
    const moveSpeed = 300;
    
    // Keyboard controls
    if (cursors.left.isDown) {
        player.body.setVelocityX(-moveSpeed);
        currentAnim = 'walk-left';
        isMoving = true;
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(moveSpeed);
        currentAnim = 'walk-right';
        isMoving = true;
    }
    
    if (cursors.up.isDown) {
        player.body.setVelocityY(-moveSpeed);
        // Only change to up animation if not moving horizontally
        if (!isMoving) {
            currentAnim = 'walk-up';
            isMoving = true;
        }
    } else if (cursors.down.isDown) {
        player.body.setVelocityY(moveSpeed);
        // Only change to down animation if not moving horizontally
        if (!isMoving) {
            currentAnim = 'walk-down';
            isMoving = true;
        }
    }
    
    // Controller input
    if (controllerConnected && gamepad) {
        // Left analog stick for movement
        const leftStickX = gamepad.axes[0].value;
        const leftStickY = gamepad.axes[1].value;
        
        // Add a small deadzone to prevent drift
        const deadzone = 0.2;
        
        // Horizontal movement with left stick
        if (Math.abs(leftStickX) > deadzone) {
            player.body.setVelocityX(moveSpeed * leftStickX);
            if (leftStickX < 0) {
                currentAnim = 'walk-left';
            } else {
                currentAnim = 'walk-right';
            }
            isMoving = true;
        }
        
        // Vertical movement with left stick
        if (Math.abs(leftStickY) > deadzone) {
            player.body.setVelocityY(moveSpeed * leftStickY);
            // Only change to up/down animation if not moving horizontally
            if (!isMoving) {
                if (leftStickY < 0) {
                    currentAnim = 'walk-up';
                } else {
                    currentAnim = 'walk-down';
                }
                isMoving = true;
            }
        }
        
        // D-pad movement
        if (gamepad.buttons[14].pressed) { // D-pad left
            player.body.setVelocityX(-moveSpeed);
            currentAnim = 'walk-left';
            isMoving = true;
        } else if (gamepad.buttons[15].pressed) { // D-pad right
            player.body.setVelocityX(moveSpeed);
            currentAnim = 'walk-right';
            isMoving = true;
        }
        
        if (gamepad.buttons[12].pressed) { // D-pad up
            player.body.setVelocityY(-moveSpeed);
            if (!isMoving) {
                currentAnim = 'walk-up';
                isMoving = true;
            }
        } else if (gamepad.buttons[13].pressed) { // D-pad down
            player.body.setVelocityY(moveSpeed);
            if (!isMoving) {
                currentAnim = 'walk-down';
                isMoving = true;
            }
        }
    }
    
    // Normalize velocity for diagonal movement
    player.body.velocity.normalize().scale(moveSpeed);
    
    // Handle animations
    if (isMoving) {
        if (player.anims.getName() !== currentAnim) {
            player.anims.play(currentAnim, true);
        }
        if (player.anims.paused) {
            player.anims.resume();
        }
    } else {
        // Pause animation when not moving
        if (!player.anims.paused) {
            player.anims.pause();
        }
    }
}

// Handle click on start button
function onStartButtonClick() {
    // Hide start button
    startButton.setVisible(false);
    
    // Show name input dialog
    document.dispatchEvent(new Event('showNameInput'));
}

// Start the game after name is entered
document.addEventListener('startGameWithName', function() {
    if (game && game.scene.scenes[0]) {
        const mainScene = game.scene.scenes[0];
        startGameWithName.call(mainScene);
    }
});

// Start the game with player name
function startGameWithName() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    timeLeft = 30;
    
    // Switch from menu music to game music
    if (musicEnabled) {
        if (menuMusic && menuMusic.isPlaying) {
            menuMusic.stop();
        }
        if (endMusic && endMusic.isPlaying) {
            endMusic.stop();
        }
        if (gameMusic) {
            gameMusic.play();
        }
    }
    
    // Show player
    player.setVisible(true);
    
    // Reset score
    scoreText.setText('Treats: 0');
    
    // Start by spawning multiple treats
    for (let i = 0; i < 3; i++) {
        spawnTreat(this);
    }
    
    // Set up a timer to spawn new treats regularly
    this.time.addEvent({
        delay: 3000, // Spawn a new treat every 3 seconds
        callback: function() {
            if (gameStarted && !gameOver) {
                // Keep a minimum of 3 treats on screen at all times
                if (treats.getChildren().length < 3) {
                    spawnTreat(this);
                }
            }
        },
        callbackScope: this,
        loop: true
    });
    
    // Start the timer
    timerEvent = this.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });
}

// Restart the game
function restartGame() {
    // Hide game over elements
    gameOverText.setVisible(false);
    finalScoreText.setVisible(false);
    restartButton.setVisible(false);
    
    // Switch back to menu music
    if (musicEnabled) {
        if (endMusic && endMusic.isPlaying) {
            endMusic.stop();
        }
        if (gameMusic && gameMusic.isPlaying) {
            gameMusic.stop();
        }
        if (menuMusic) {
            menuMusic.play();
        }
    }
    
    // Show name input again
    document.dispatchEvent(new Event('showNameInput'));
}

// Update the timer
function updateTimer() {
    timeLeft--;
    timerText.setText('Time: ' + timeLeft);
    
    if (timeLeft <= 0) {
        endGame.call(this);
    }
}

// End the game
function endGame() {
    gameStarted = false;
    gameOver = true;
    
    // Stop the timer
    timerEvent.remove();
    
    // Clear all treats
    treats.clear(true, true);
    
    // Hide player
    player.setVisible(false);
    
    // Switch from game music to end music
    if (musicEnabled) {
        if (gameMusic && gameMusic.isPlaying) {
            gameMusic.stop();
        }
        if (menuMusic && menuMusic.isPlaying) {
            menuMusic.stop();
        }
        if (endMusic) {
            endMusic.play();
        }
    }
    
    // Add score to leaderboard
    addScoreToLeaderboard(currentPlayerName, score);
    
    // Show stylish game over screen
    showGameOverScreen(this, currentPlayerName, score);
}

// Collect a treat
function collectTreat(player, treat) {
    treat.destroy();
    score++;
    scoreText.setText('Treats: ' + score);
    
    // Play bite sound effect
    if (biteSfx && musicEnabled) {
        biteSfx.play();
    }
    
    // Spawn a new treat immediately to keep the game flowing
    // Add a small delay so it doesn't appear in the exact same spot
    this.time.delayedCall(100, function() {
        spawnTreat(this);
    }, [], this);
}

// Spawn a treat at a random position
function spawnTreat(scene) {
    const x = Phaser.Math.Between(50, config.width - 50);
    const y = Phaser.Math.Between(50, config.height - 50);
    
    // Try to use the loaded treat image, fall back to a circle if not available
    let treat;
    if (scene.textures.exists('treat')) {
        treat = scene.physics.add.sprite(x, y, 'treat');
        treat.setScale(0.5); // Adjust scale as needed
    } else {
        treat = scene.physics.add.sprite(x, y, 'treat-fallback');
    }
    
    treats.add(treat);
    
    // Add a tween to make the treat pulse
    scene.tweens.add({
        targets: treat,
        scale: treat.scale * 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1
    });
}

// Create a fallback treat image if the asset isn't loaded
function createTreatImage() {
    // Create a canvas for the treat
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Draw a bone shape
    ctx.fillStyle = '#f5d742';
    
    // Draw bone ends
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(24, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(8, 24, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(24, 24, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bone middle
    ctx.fillRect(12, 10, 8, 12);
    
    return canvas.toDataURL();
}

// Create a grass pattern texture
function createGrassPattern() {
    // Create a canvas for the grass pattern
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Base color
    ctx.fillStyle = '#7cba5d';
    ctx.fillRect(0, 0, 64, 64);
    
    // Add grass blades
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        const height = 5 + Math.random() * 10;
        const width = 1 + Math.random() * 2;
        
        // Vary the green colors
        const greenVariation = Math.floor(Math.random() * 40);
        ctx.fillStyle = `rgb(100, ${170 + greenVariation}, 80)`;
        
        // Draw a grass blade
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + width/2, y);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fill();
    }
    
    // Add some subtle texture
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        const radius = 0.5 + Math.random() * 1;
        
        // Random dots for texture
        ctx.fillStyle = Math.random() > 0.5 ? '#6baa4c' : '#8cca6d';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    return canvas.toDataURL();
}

// Create a tiled grass background
function createGrassBackground(scene) {
    // Get game dimensions
    const width = config.width;
    const height = config.height;
    
    // Create a tiled sprite for the grass background
    const grassBackground = scene.add.tileSprite(0, 0, width, height, 'grass-pattern');
    grassBackground.setOrigin(0, 0);
    grassBackground.setDepth(-1); // Ensure it's behind everything else
}

// Setup music after the game has loaded
function setupMusic(scene) {
    try {
        // Create music objects
        menuMusic = scene.sound.add('menu-music', { loop: true, volume: 0.5 });
        gameMusic = scene.sound.add('game-music', { loop: true, volume: 0.5 });
        endMusic = scene.sound.add('end-music', { loop: true, volume: 0.5 });
        
        // Create sound effects
        biteSfx = scene.sound.add('bite-sfx', { loop: false, volume: 0.7 });
        
        // Start menu music
        menuMusic.play();
        
        // Music is successfully enabled
        musicEnabled = true;
    } catch (error) {
        console.error('Error setting up music:', error);
        // Disable music if there's an error
        musicEnabled = false;
    }
}

// Show a clean game over screen
function showGameOverScreen(scene, playerName, finalScore) {
    // Create a container for game over elements
    const gameOverContainer = scene.add.container(scene.cameras.main.width / 2, scene.cameras.main.height / 2);
    
    // Add a colorful background
    const background = scene.add.rectangle(
        0, 0,
        scene.cameras.main.width * 0.8,
        scene.cameras.main.height * 0.7,
        0x7cba5d, 0.9 // Green background matching the game theme
    );
    background.setStrokeStyle(4, 0xffffff);
    gameOverContainer.add(background);
    
    // Add a treat icon
    const treatIcon = scene.add.image(0, -120, 'treat');
    treatIcon.setScale(3);
    gameOverContainer.add(treatIcon);
    
    // Add game over text - clean, no shadow
    const gameOverText = scene.add.text(
        0, -70,
        'TREAT COLLECTOR',
        { fontFamily: 'Impact', fontSize: '48px', fill: '#ffffff', align: 'center' }
    ).setOrigin(0.5);
    
    gameOverContainer.add(gameOverText);
    
    // Display final score - clean, no shadow
    const finalScoreText = scene.add.text(
        0, -20,
        `${playerName} collected ${finalScore} treats!`,
        { fontFamily: 'Comic Sans MS', fontSize: '26px', fill: '#ffffff', align: 'center' }
    ).setOrigin(0.5);
    
    gameOverContainer.add(finalScoreText);
    
    // Create a simple, clean restart button
    const buttonBackground = scene.add.graphics();
    buttonBackground.fillStyle(0xff9900, 1); // Orange button
    buttonBackground.fillRoundedRect(-100, 30, 200, 60, 15); // Simple rounded rectangle
    gameOverContainer.add(buttonBackground);
    
    const restartButton = scene.add.text(
        0, 60,
        'Play Again',
        { fontFamily: 'Comic Sans MS', fontSize: '28px', fill: '#ffffff', fontStyle: 'bold' }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
    
    gameOverContainer.add(restartButton);
    
    // Add hover effect - simple color change
    restartButton.on('pointerover', () => {
        buttonBackground.clear();
        buttonBackground.fillStyle(0xffb340, 1); // Lighter orange on hover
        buttonBackground.fillRoundedRect(-100, 30, 200, 60, 15);
    });
    
    restartButton.on('pointerout', () => {
        buttonBackground.clear();
        buttonBackground.fillStyle(0xff9900, 1); // Back to normal orange
        buttonBackground.fillRoundedRect(-100, 30, 200, 60, 15);
    });
    
    // Add click effect and handler - simple
    restartButton.on('pointerdown', () => {
        buttonBackground.clear();
        buttonBackground.fillStyle(0xe68a00, 1); // Darker orange when clicked
        buttonBackground.fillRoundedRect(-100, 30, 200, 60, 15);
        
        // Add a small delay for button press effect
        scene.time.delayedCall(100, () => {
            // Remove game over elements
            gameOverContainer.destroy();
            
            // Show name input
            document.getElementById('name-input-container').style.display = 'block';
        });
    });
    
    // Add a subtle animation to the container
    scene.tweens.add({
        targets: gameOverContainer,
        y: gameOverContainer.y - 5, // Reduced movement
        duration: 1500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });
    
    // Add a subtle animation to the treat icon
    scene.tweens.add({
        targets: treatIcon,
        angle: 5, // Reduced rotation
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });
}

// ... (rest of the code remains the same)

// Handle window resize
window.addEventListener('resize', function() {
    const gameWidth = window.innerWidth - 250; // Account for leaderboard width
    game.scale.resize(gameWidth, window.innerHeight);
    
    // Reposition UI elements if needed
    if (scoreText) scoreText.setPosition(20, 20);
    if (timerText) timerText.setPosition(gameWidth - 200, 20);
    if (startButton) startButton.setPosition(gameWidth / 2, window.innerHeight / 2);
    if (gameOverText) gameOverText.setPosition(gameWidth / 2, window.innerHeight / 2 - 100);
    if (finalScoreText) finalScoreText.setPosition(gameWidth / 2, window.innerHeight / 2);
    if (restartButton) restartButton.setPosition(gameWidth / 2, window.innerHeight / 2 + 100);
});