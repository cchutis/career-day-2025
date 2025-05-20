// Cody the Coding Robot - Interactive Chatbot for 2nd Graders

// DOM Elements
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-btn');
const micButton = document.getElementById('mic-btn');
const soundToggle = document.getElementById('sound-toggle');
const chips = document.querySelectorAll('.chip');

// Speech synthesis setup
const speechSynthesis = window.speechSynthesis;
let robotVoice = null;

// Initialize speech synthesis voices
function initVoices() {
    const voices = speechSynthesis.getVoices();
    // Try to find a friendly, child-appropriate voice
    robotVoice = voices.find(voice => voice.name.includes('Kid') || voice.name.includes('Child'));
    if (!robotVoice) {
        // Fallback to any available voice
        robotVoice = voices.find(voice => voice.lang.includes('en')) || voices[0];
    }
}

// Initialize voices when they're loaded
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = initVoices;
}

// Speech recognition setup (for mic button)
let recognition = null;
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        sendMessage();
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error', event.error);
        addBotMessage('I couldn\'t hear you clearly. Can you type your message instead?');
    };
}

// Robot animations using Anime.js
const robotAnime = {
    blink: function() {
        anime({
            targets: '.eye',
            scaleY: [
                {value: 0.1, duration: 100},
                {value: 1, duration: 100}
            ],
            easing: 'linear',
            autoplay: true
        });
    },
    
    talk: function() {
        anime({
            targets: '.mouth',
            height: [
                {value: 5, duration: 100},
                {value: 10, duration: 100},
                {value: 5, duration: 100},
                {value: 10, duration: 100}
            ],
            easing: 'linear',
            loop: true
        });
    },
    
    stopTalking: function() {
        anime({
            targets: '.mouth',
            height: 10,
            duration: 100
        });
    },
    
    happy: function() {
        anime({
            targets: '.mouth',
            width: 50,
            height: 15,
            borderRadius: '50%',
            duration: 300,
            complete: function() {
                setTimeout(() => {
                    anime({
                        targets: '.mouth',
                        width: 40,
                        height: 10,
                        borderRadius: '10px',
                        duration: 300
                    });
                }, 1000);
            }
        });
    },
    
    think: function() {
        anime({
            targets: '.eye',
            translateY: [
                {value: 5, duration: 1000},
                {value: 0, duration: 1000}
            ],
            direction: 'alternate',
            loop: true
        });
    },
    
    stopThinking: function() {
        anime({
            targets: '.eye',
            translateY: 0,
            duration: 300
        });
    },
    
    excited: function() {
        anime({
            targets: '.robot',
            translateY: [
                {value: -10, duration: 100},
                {value: 0, duration: 100}
            ],
            direction: 'alternate',
            loop: 3
        });
    },
    
    buttonBlink: function() {
        anime({
            targets: '.button',
            backgroundColor: [
                {value: '#ffcc00', duration: 300},
                {value: '#ff6b6b', duration: 300},
                {value: '#4a6bdf', duration: 300},
                {value: '#ffcc00', duration: 300}
            ],
            loop: 2
        });
    }
};

// Start blinking periodically
setInterval(robotAnime.blink, 3000);

// Chatbot responses
const responses = {
    greeting: [
        "Hi there! I'm Cody the Coding Robot. What would you like to talk about?",
        "Hello, friend! I'm Cody. I can tell you about coding and what software engineers do!",
        "Hey there! I'm Cody the Robot. I love talking about computers and coding!"
    ],
    
    coding: [
        "Coding is like giving instructions to a computer. It's like when you tell a friend how to make a sandwich, but for computers! Computers need very specific instructions because they can't think for themselves.",
        "Coding is writing special instructions that tell computers what to do. It's like creating a recipe for a computer to follow. With coding, you can make games, websites, and even control robots like me!"
    ],
    
    engineers: [
        "Software engineers are people who write code to create cool things like games, apps, and websites! They solve problems using computers and make technology that helps people.",
        "Software engineers are like inventors who use code instead of tools. They build the games you play, the websites you visit, and apps that do amazing things. They're really good at solving puzzles and thinking creatively!"
    ],
    
    languages: [
        "There are many coding languages! Some popular ones are Scratch for kids, Python, JavaScript, and HTML. Each language is good for different things, like making websites, games, or apps.",
        "Coding languages are like different human languages, but for talking to computers! Scratch is great for beginners. Python is good for lots of things. HTML helps make websites. There are many more!"
    ],
    
    jokes: [
        "Why did the computer go to the doctor? Because it had a virus! 🤣",
        "What do you call a computer that sings? A-Dell! 🎵",
        "Why was the computer cold? Because it left its Windows open! 🌬️",
        "What did the computer do at lunchtime? It had a byte to eat! 🍔",
        "Why did the computer keep sneezing? It had a case of the humans! 🤧"
    ],
    
    facts: [
        "Did you know the first computer programmer was a woman named Ada Lovelace? She lived almost 200 years ago!",
        "The first computer bug was a real bug! In 1947, a moth got stuck in a computer and caused problems. That's why we call computer problems 'bugs'!",
        "The world's first computer game was created in 1958. It was a tennis game similar to Pong!",
        "There are more than 700 different coding languages that programmers can use!",
        "Computers only understand two numbers: 0 and 1. This is called binary code!"
    ],
    
    games: {
        guessNumber: {
            name: "Number Guessing Game",
            description: "I'm thinking of a number between 1 and 10. Can you guess it?"
        },
        wordScramble: {
            name: "Word Scramble",
            description: "Can you unscramble these coding words?",
            words: ["CODE", "ROBOT", "GAME", "COMPUTER", "PROGRAM"]
        },
        rockPaperScissors: {
            name: "Rock Paper Scissors",
            description: "Let's play Rock, Paper, Scissors!"
        }
    },
    
    unknown: [
        "I'm not sure I understand. Can you try asking something about coding or software engineers?",
        "Hmm, I don't know about that yet. I'm still learning! Want to ask me about coding instead?",
        "That's an interesting question! I'm not programmed to answer that yet. Try asking me about coding, software engineers, or let's play a game!"
    ]
};

// Active game state
let activeGame = null;

// Add a user message to the chat
function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Add a bot message to the chat
function addBotMessage(message) {
    // Create thinking animation
    const thinkingElement = document.createElement('div');
    thinkingElement.className = 'thinking';
    thinkingElement.innerHTML = `
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
    `;
    chatWindow.appendChild(thinkingElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
    // Start thinking animation
    robotAnime.think();
    
    // Simulate thinking time
    setTimeout(() => {
        // Remove thinking animation
        chatWindow.removeChild(thinkingElement);
        
        // Stop thinking animation
        robotAnime.stopThinking();
        
        // Add the actual message
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.textContent = message;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        
        // Speak the message if sound is enabled
        if (soundToggle.checked) {
            speakMessage(message);
        }
        
        // Show happy animation
        robotAnime.happy();
        robotAnime.buttonBlink();
    }, 1000);
}

// Speak a message using speech synthesis
function speakMessage(message) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Set voice if available
    if (robotVoice) {
        utterance.voice = robotVoice;
    }
    
    // Set properties for a kid-friendly voice
    utterance.pitch = 1.2;
    utterance.rate = 0.9;
    
    // Start talking animation
    robotAnime.talk();
    
    // Speak the message
    speechSynthesis.speak(utterance);
    
    // Stop talking animation when done
    utterance.onend = function() {
        robotAnime.stopTalking();
    };
}

// Process user input and generate a response
function processMessage(message) {
    message = message.toLowerCase().trim();
    
    // Check if we're in a game
    if (activeGame) {
        handleGameInput(message);
        return;
    }
    
    // Check for greetings
    if (message.match(/^(hi|hello|hey|howdy|hola)/)) {
        return getRandomResponse(responses.greeting);
    }
    
    // Check for coding questions
    if (message.includes('coding') || message.includes('code') || message.includes('program')) {
        if (message.includes('what is') || message.includes('what\'s')) {
            return getRandomResponse(responses.coding);
        }
        if (message.includes('language')) {
            return getRandomResponse(responses.languages);
        }
    }
    
    // Check for software engineer questions
    if ((message.includes('software') && message.includes('engineer')) || 
        (message.includes('what') && message.includes('engineers') && message.includes('do'))) {
        return getRandomResponse(responses.engineers);
    }
    
    // Check for joke requests
    if (message.includes('joke') || message.includes('funny')) {
        robotAnime.excited();
        return getRandomResponse(responses.jokes);
    }
    
    // Check for fact requests
    if (message.includes('fact') || message.includes('cool') && message.includes('coding')) {
        return getRandomResponse(responses.facts);
    }
    
    // Check for game requests
    if (message.includes('game') || message.includes('play')) {
        return startGameMenu();
    }
    
    // Handle specific game selections
    if (message.includes('number') || message.includes('guess')) {
        return startGame('guessNumber');
    }
    if (message.includes('scramble') || message.includes('word')) {
        return startGame('wordScramble');
    }
    if (message.includes('rock') || message.includes('paper') || message.includes('scissors')) {
        return startGame('rockPaperScissors');
    }
    
    // Default response for unknown inputs
    return getRandomResponse(responses.unknown);
}

// Get a random response from an array
function getRandomResponse(responseArray) {
    const index = Math.floor(Math.random() * responseArray.length);
    return responseArray[index];
}

// Start a game menu
function startGameMenu() {
    const games = responses.games;
    let message = "I know several fun games! Which one would you like to play?\n\n";
    
    // Create game options
    for (const gameKey in games) {
        message += `- ${games[gameKey].name}\n`;
    }
    
    message += "\nJust tell me which one you want to play!";
    return message;
}

// Start a specific game
function startGame(gameType) {
    const game = responses.games[gameType];
    
    if (!game) {
        return "I don't know that game. Let's try another one!";
    }
    
    activeGame = {
        type: gameType,
        ...game
    };
    
    // Initialize game-specific properties
    switch (gameType) {
        case 'guessNumber':
            activeGame.targetNumber = Math.floor(Math.random() * 10) + 1;
            activeGame.attempts = 0;
            break;
            
        case 'wordScramble':
            const randomIndex = Math.floor(Math.random() * game.words.length);
            activeGame.currentWord = game.words[randomIndex];
            activeGame.scrambledWord = scrambleWord(activeGame.currentWord);
            break;
            
        case 'rockPaperScissors':
            activeGame.playerScore = 0;
            activeGame.botScore = 0;
            activeGame.rounds = 0;
            break;
    }
    
    // Create game UI
    createGameUI(gameType);
    
    return game.description;
}

// Create game UI elements
function createGameUI(gameType) {
    // Remove any existing game area
    const existingGameArea = document.querySelector('.game-area');
    if (existingGameArea) {
        existingGameArea.remove();
    }
    
    // Create new game area
    const gameArea = document.createElement('div');
    gameArea.className = 'game-area';
    
    // Add game-specific UI
    switch (gameType) {
        case 'guessNumber':
            gameArea.innerHTML = `
                <p>I'm thinking of a number between 1 and 10.</p>
                <p>Type your guess in the chat!</p>
            `;
            break;
            
        case 'wordScramble':
            gameArea.innerHTML = `
                <p>Unscramble this word: <strong>${activeGame.scrambledWord}</strong></p>
                <p>Type your answer in the chat!</p>
            `;
            break;
            
        case 'rockPaperScissors':
            gameArea.innerHTML = `
                <p>Let's play Rock, Paper, Scissors!</p>
                <div>
                    <button class="game-button" data-choice="rock">✊ Rock</button>
                    <button class="game-button" data-choice="paper">✋ Paper</button>
                    <button class="game-button" data-choice="scissors">✌️ Scissors</button>
                </div>
                <p>Score: You <span id="player-score">0</span> - <span id="bot-score">0</span> Cody</p>
            `;
            
            // Add event listeners to game buttons
            setTimeout(() => {
                const buttons = gameArea.querySelectorAll('.game-button');
                buttons.forEach(button => {
                    button.addEventListener('click', function() {
                        const choice = this.getAttribute('data-choice');
                        handleRockPaperScissors(choice);
                    });
                });
            }, 100);
            break;
    }
    
    // Add quit button
    const quitButton = document.createElement('button');
    quitButton.className = 'game-button';
    quitButton.textContent = 'Quit Game';
    quitButton.addEventListener('click', endGame);
    gameArea.appendChild(quitButton);
    
    // Add game area to chat window
    chatWindow.appendChild(gameArea);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Handle game input
function handleGameInput(message) {
    if (!activeGame) return;
    
    switch (activeGame.type) {
        case 'guessNumber':
            handleNumberGuess(message);
            break;
            
        case 'wordScramble':
            handleWordScramble(message);
            break;
            
        case 'rockPaperScissors':
            // This is handled by the buttons, but we can also accept text input
            if (message.includes('rock')) {
                handleRockPaperScissors('rock');
            } else if (message.includes('paper')) {
                handleRockPaperScissors('paper');
            } else if (message.includes('scissors')) {
                handleRockPaperScissors('scissors');
            }
            break;
    }
}

// Handle number guessing game
function handleNumberGuess(message) {
    // Extract number from message
    const guess = parseInt(message.match(/\d+/));
    
    if (isNaN(guess) || guess < 1 || guess > 10) {
        addBotMessage("Please guess a number between 1 and 10.");
        return;
    }
    
    activeGame.attempts++;
    
    if (guess === activeGame.targetNumber) {
        robotAnime.excited();
        addBotMessage(`You got it! The number was ${activeGame.targetNumber}. It took you ${activeGame.attempts} ${activeGame.attempts === 1 ? 'try' : 'tries'}. You're a great guesser!`);
        endGame();
    } else if (guess < activeGame.targetNumber) {
        addBotMessage(`${guess} is too low. Try a higher number!`);
    } else {
        addBotMessage(`${guess} is too high. Try a lower number!`);
    }
}

// Handle word scramble game
function handleWordScramble(message) {
    const guess = message.toUpperCase().trim();
    
    if (guess === activeGame.currentWord) {
        robotAnime.excited();
        addBotMessage(`That's correct! You unscrambled ${activeGame.scrambledWord} to ${activeGame.currentWord}. Great job!`);
        endGame();
    } else {
        addBotMessage(`That's not right. Keep trying to unscramble ${activeGame.scrambledWord}!`);
    }
}

// Handle rock paper scissors game
function handleRockPaperScissors(playerChoice) {
    // Prevent multiple clicks while processing
    const buttons = document.querySelectorAll('.game-button');
    buttons.forEach(btn => btn.disabled = true);
    
    // Disable input temporarily
    chatInput.disabled = true;
    sendButton.disabled = true;
    if (micButton) micButton.disabled = true;
    
    const choices = ['rock', 'paper', 'scissors'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    
    // Update round count
    activeGame.rounds++;
    
    // Determine winner
    let result;
    if (playerChoice === botChoice) {
        result = "It's a tie!";
    } else if (
        (playerChoice === 'rock' && botChoice === 'scissors') ||
        (playerChoice === 'paper' && botChoice === 'rock') ||
        (playerChoice === 'scissors' && botChoice === 'paper')
    ) {
        result = "You win this round!";
        activeGame.playerScore++;
    } else {
        result = "I win this round!";
        activeGame.botScore++;
    }
    
    // Update score display
    const playerScoreElement = document.getElementById('player-score');
    const botScoreElement = document.getElementById('bot-score');
    if (playerScoreElement && botScoreElement) {
        playerScoreElement.textContent = activeGame.playerScore;
        botScoreElement.textContent = activeGame.botScore;
    }
    
    // Show result
    const emoji = {
        rock: '✊',
        paper: '✋',
        scissors: '✌️'
    };
    
    // Create a single message with the result
    const message = `You chose ${emoji[playerChoice]} ${playerChoice}. I chose ${emoji[botChoice]} ${botChoice}. ${result}`;
    
    // Add the message to the chat
    addBotMessage(message);
    
    // Check if game should end (best of 5)
    if (activeGame.rounds >= 5 || activeGame.playerScore >= 3 || activeGame.botScore >= 3) {
        // Wait for the first message to complete
        setTimeout(() => {
            let finalResult;
            if (activeGame.playerScore > activeGame.botScore) {
                finalResult = `You won the game ${activeGame.playerScore}-${activeGame.botScore}! Congratulations!`;
                robotAnime.excited();
            } else if (activeGame.botScore > activeGame.playerScore) {
                finalResult = `I won the game ${activeGame.botScore}-${activeGame.playerScore}! Better luck next time!`;
            } else {
                finalResult = `It's a tie game ${activeGame.playerScore}-${activeGame.botScore}! Good playing!`;
            }
            
            // Add the final message and end the game
            addBotMessage(finalResult);
            
            // End the game after the message is displayed
            setTimeout(() => {
                endGame();
                
                // Re-enable input
                chatInput.disabled = false;
                sendButton.disabled = false;
                if (micButton) micButton.disabled = false;
            }, 2000);
        }, 2500); // Wait longer to ensure first message is complete
    } else {
        // Re-enable buttons after a delay
        setTimeout(() => {
            buttons.forEach(btn => btn.disabled = false);
            chatInput.disabled = false;
            sendButton.disabled = false;
            if (micButton) micButton.disabled = false;
        }, 1500);
    }
}

// Scramble a word for the word scramble game
function scrambleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    // Make sure the scrambled word is different from the original
    const scrambled = letters.join('');
    return scrambled === word ? scrambleWord(word) : scrambled;
}

// End the current game
function endGame() {
    activeGame = null;
    
    // Remove game UI
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
        gameArea.remove();
    }
    
    // Add a message if not already added by the game
    if (!document.querySelector('.bot-message:last-child')) {
        addBotMessage("Game over! Want to play another game or learn about coding?");
    }
}

// Send a message
function sendMessage() {
    const message = chatInput.value.trim();
    if (message === '') return;
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    chatInput.value = '';
    
    // Process message and get response
    const response = processMessage(message);
    
    // Add bot response to chat
    addBotMessage(response);
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Mic button (if speech recognition is available)
if (micButton && recognition) {
    micButton.addEventListener('click', function() {
        recognition.start();
        addBotMessage("I'm listening... Speak now!");
    });
} else if (micButton) {
    // Hide mic button if speech recognition is not available
    micButton.style.display = 'none';
}

// Suggestion chips
chips.forEach(chip => {
    chip.addEventListener('click', function() {
        const message = this.getAttribute('data-message');
        chatInput.value = message;
        sendMessage();
    });
});

// Welcome message when page loads
window.addEventListener('load', function() {
    setTimeout(() => {
        addBotMessage("Hi there! I'm Cody the Coding Robot. I can tell you about coding, software engineering, or we can play some fun games! What would you like to do?");
        initVoices(); // Initialize voices
    }, 500);
});

