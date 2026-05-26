const wordList = [
    'javascript',
    'programming',
    'hangman',
    'developer',
    'computer',
    'algorithm',
    'database',
    'network',
    'security',
    'interface',
    'function',
    'variable',
    'debugging',
    'compile',
    'execute',
    'memory',
    'storage',
    'framework',
    'library',
    'server'
];

const statusText = document.getElementById('status');
const wordBlanksDisplay = document.getElementById('word-blanks');
const keyboardDisplay = document.getElementById('keyboard');
const guessedLettersDisplay = document.getElementById('guessed-letters');
const wrongCountDisplay = document.getElementById('wrong-count');
const resetBtn = document.getElementById('reset-btn');
const gameOverOverlay = document.getElementById('game-over-overlay');
const gameOverText = document.getElementById('game-over-text');
const wordReveal = document.getElementById('word-reveal');

let currentWord = '';
let guessedLetters = [];
let wrongGuesses = 0;
let gameActive = true;

const bodyParts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];

function initializeGame() {
    currentWord = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
    guessedLetters = [];
    wrongGuesses = 0;
    gameActive = true;
    gameOverOverlay.classList.add('hidden');
    
    renderWordDisplay();
    renderKeyboard();
    updateDisplay();
    hideBodyParts();
}

function hideBodyParts() {
    bodyParts.forEach(part => {
        document.getElementById(part).style.display = 'none';
    });
}

function renderWordDisplay() {
    const displayWord = currentWord.split('').map(letter => {
        return guessedLetters.includes(letter) ? letter : '_';
    }).join(' ');
    
    wordBlanksDisplay.textContent = displayWord;
}

function renderKeyboard() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    keyboardDisplay.innerHTML = '';
    
    alphabet.forEach(letter => {
        const btn = document.createElement('button');
        btn.textContent = letter;
        btn.className = 'letter-btn';
        
        if (guessedLetters.includes(letter)) {
            btn.classList.add('guessed');
            btn.disabled = true;
        }
        
        btn.addEventListener('click', () => guessLetter(letter, btn));
        keyboardDisplay.appendChild(btn);
    });
}

function guessLetter(letter, btn) {
    if (!gameActive || guessedLetters.includes(letter)) {
        return;
    }
    
    guessedLetters.push(letter);
    btn.classList.add('guessed');
    btn.disabled = true;
    
    if (!currentWord.includes(letter)) {
        wrongGuesses++;
        if (wrongGuesses <= bodyParts.length) {
            document.getElementById(bodyParts[wrongGuesses - 1]).style.display = 'block';
        }
    }
    
    updateDisplay();
    checkGameStatus();
}

function updateDisplay() {
    renderWordDisplay();
    wrongCountDisplay.textContent = wrongGuesses;
    
    const lettersDisplay = guessedLetters
        .filter(letter => !currentWord.includes(letter))
        .join(', ');
    guessedLettersDisplay.textContent = lettersDisplay ? `Wrong: ${lettersDisplay}` : '';
}

function checkGameStatus() {
    const wordComplete = currentWord.split('').every(letter => guessedLetters.includes(letter));
    
    if (wordComplete) {
        endGame(true);
        return;
    }
    
    if (wrongGuesses >= 6) {
        endGame(false);
        return;
    }
}

function endGame(isWin) {
    gameActive = false;
    gameOverOverlay.classList.remove('hidden');
    
    if (isWin) {
        gameOverText.textContent = 'YOU WIN!';
        gameOverText.style.color = '#ffd700';
        wordReveal.textContent = `The word was: ${currentWord}`;
    } else {
        gameOverText.textContent = 'GAME OVER';
        gameOverText.style.color = '#ff6b6b';
        wordReveal.textContent = `The word was: ${currentWord}`;
    }
    
    setTimeout(() => {
        gameOverOverlay.classList.add('hidden');
    }, 4000);
}

resetBtn.addEventListener('click', initializeGame);

// Start the game
initializeGame();
