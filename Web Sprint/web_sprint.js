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
    currentTurn = 'Player';
    gameActive = true;
    statusText.textContent = 'You start. Pick a cell to begin.';
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
