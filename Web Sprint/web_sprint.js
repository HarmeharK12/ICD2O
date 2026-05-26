const boardElement = document.getElementById('board');
const statusText = document.getElementById('status');
const btnReset = document.getElementById('reset-btn');
const winOverlay = document.getElementById('win-overlay');
const confettiContainer = document.getElementById('confetti-container');

let board = Array(9).fill('');
let currentTurn = 'Player';
let playerSymbol = 'X';
let aiSymbol = 'O';
let gameActive = true;

function renderBoard() {
    boardElement.innerHTML = '';

    board.forEach((value, index) => {
        const cell = document.createElement('button');
        cell.className = 'cell';
        cell.dataset.index = index;
        cell.textContent = value;

        if (!gameActive || value) {
            cell.classList.add('disabled');
        }

        cell.addEventListener('click', onBoardCellClick);
        boardElement.appendChild(cell);
    });
}

function resetGame() {
    board = Array(9).fill('');
<<<<<<< HEAD
    currentTurn = 'Player';
    gameActive = true;
    statusText.textContent = 'You start. Pick a cell to begin.';
=======
    currentTurn = null; // will be decided by coin toss
    gameActive = false; // disabled until coin toss finishes
    statusText.textContent = 'Pick Heads or Tails and flip the coin to decide who goes first.';
>>>>>>> 6cb1f07ade9125f7e174f03965f3702ce2401606
    btnReset.classList.add('hidden');
    renderBoard();
}

function onBoardCellClick(event) {
    if (!gameActive || currentTurn !== 'Player') {
        return;
    }

    const index = Number(event.currentTarget.dataset.index);
    if (board[index] !== '') {
        return;
    }

    board[index] = playerSymbol;
    renderBoard();

    if (checkWinner(playerSymbol)) {
        endGame('You Win!');
        return;
    }

    if (checkDraw()) {
        endGame("It's a Draw!");
        return;
    }

    currentTurn = 'AI';
    statusText.textContent = 'AI is choosing a move...';
    setTimeout(runAiTurn, 700);
}

function runAiTurn() {
    if (!gameActive || currentTurn !== 'AI') {
        return;
    }

    const emptyIndices = board
        .map((value, index) => (value === '' ? index : null))
        .filter(index => index !== null);

    if (emptyIndices.length === 0) {
        endGame("It's a Draw!");
        return;
    }

    const chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    board[chosenIndex] = aiSymbol;
    renderBoard();

    if (checkWinner(aiSymbol)) {
        endGame('AI Wins!');
        return;
    }

    if (checkDraw()) {
        endGame("It's a Draw!");
        return;
    }

    currentTurn = 'Player';
    statusText.textContent = 'Your turn. Pick an empty cell.';
}

function checkWinner(symbol) {
    const winningLines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    return winningLines.some(line => line.every(index => board[index] === symbol));
}

function checkDraw() {
    return board.every(cell => cell !== '') && !checkWinner(playerSymbol) && !checkWinner(aiSymbol);
}

function createConfetti() {
    const confettiTypes = ['rect', 'circle', 'triangle', 'square', 'diamond', 'star'];
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ffd3b6', '#ffaaa5'];
    
    confettiContainer.innerHTML = '';
    
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        const type = confettiTypes[Math.floor(Math.random() * confettiTypes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.className = `confetti ${type}`;
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = type === 'triangle' || type === 'star' ? 'transparent' : color;
        
        if (type === 'triangle' || type === 'star') {
            if (type === 'triangle') {
                confetti.style.borderTopColor = color;
            } else {
                confetti.style.background = color;
            }
        }
        
        const duration = 2 + Math.random() * 1;
        const delay = Math.random() * 0.2;
        const sway = Math.random() > 0.5 ? 'sway-left' : 'sway-right';
        
        confetti.style.animation = `fall ${duration}s linear ${delay}s forwards, ${sway} ${0.6 + Math.random() * 0.4}s ease-in-out ${delay}s infinite`;
        confetti.style.top = '-10px';
        
        confettiContainer.appendChild(confetti);
    }
}

function endGame(message) {
    gameActive = false;
    currentTurn = null;
    statusText.textContent = message;
    btnReset.classList.remove('hidden');
    
    if (message === 'You Win!') {
        createConfetti();
        winOverlay.classList.remove('hidden');
        setTimeout(() => {
            winOverlay.classList.add('hidden');
        }, 4000);
    }
    
    renderBoard();
}

btnReset.addEventListener('click', resetGame);
resetGame();

// --- Coin toss UI + logic ---
const btnChooseHeads = document.getElementById('choose-heads');
const btnChooseTails = document.getElementById('choose-tails');
const btnFlip = document.getElementById('flip-btn');
const coin = document.getElementById('coin');
const coinResultEl = document.getElementById('coin-result');
const coinChoicePara = document.querySelector('.coin-choice');

let userChoice = null; // 'heads' or 'tails'
let isFlipping = false;

function clearSelection() {
    btnChooseHeads.classList.remove('selected');
    btnChooseTails.classList.remove('selected');
}

btnChooseHeads.addEventListener('click', () => {
    clearSelection();
    btnChooseHeads.classList.add('selected');
    userChoice = 'heads';
    coinChoicePara.textContent = 'You chose Heads. Press Flip to toss.';
});

btnChooseTails.addEventListener('click', () => {
    clearSelection();
    btnChooseTails.classList.add('selected');
    userChoice = 'tails';
    coinChoicePara.textContent = 'You chose Tails. Press Flip to toss.';
});

btnFlip.addEventListener('click', () => {
    if (isFlipping) return;
    if (!userChoice) {
        coinChoicePara.textContent = 'Please choose Heads or Tails first.';
        return;
    }
    doCoinFlip();
});

function doCoinFlip() {
    isFlipping = true;
    coinResultEl.classList.add('hidden');
    coinChoicePara.textContent = 'Flipping...';

    // random result
    const result = Math.random() < 0.5 ? 'heads' : 'tails';

    // spins and degrees: land with front (heads) at 0deg, back (tails) at 180deg
    const spins = Math.floor(Math.random() * 4) + 4; // 4-7 spins
    const degrees = 360 * spins + (result === 'heads' ? 0 : 180);

    // Apply transform to coin (rotateY). Use a timeout to allow CSS transition
    coin.style.transform = `rotateY(${degrees}deg)`;

    // wait for transition to finish
    function onTransitionEnd() {
        coin.removeEventListener('transitionend', onTransitionEnd);
        isFlipping = false;
        coinResultEl.classList.remove('hidden');
        coinResultEl.textContent = `Coin landed on ${result.toUpperCase()}!`;

        // determine who goes first
        if (userChoice === result) {
            statusText.textContent = 'You won the toss — you go first.';
            currentTurn = 'Player';
            playerSymbol = 'X';
            aiSymbol = 'O';
            gameActive = true;
            renderBoard();
        } else {
            statusText.textContent = 'Computer won the toss — it goes first.';
            currentTurn = 'AI';
            playerSymbol = 'X';
            aiSymbol = 'O';
            gameActive = true;
            renderBoard();
            setTimeout(runAiTurn, 800);
        }

        // show reset button once the game is active
        btnReset.classList.remove('hidden');
    }

    coin.addEventListener('transitionend', onTransitionEnd);
}

// Initialize small transform so first flip animates from known state
coin.style.transform = 'rotateY(0deg)';
