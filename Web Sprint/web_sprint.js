const homePage = document.getElementById('home-page');
const ticPage = document.getElementById('tic-page');
const btnHangman = document.getElementById('btn-hangman');
const btnTicTacToe = document.getElementById('btn-tic-tac-toe');
const btnBackHome = document.getElementById('btn-back-home');
const btnFlipCoin = document.getElementById('btn-flip-coin');
const coinChoice = document.getElementById('coin-choice');
const coinResult = document.getElementById('coin-result');
const coinResultText = document.getElementById('coin-result-text');
const coinAnimation = document.getElementById('coin-animation');
const boardElement = document.getElementById('board');
const statusText = document.getElementById('status-text');
const btnReset = document.getElementById('btn-reset');
const playerSymbols = document.getElementById('player-symbols');
const aiSymbols = document.getElementById('ai-symbols');

let board = Array(9).fill('');
let currentTurn = null;
let playerSymbol = 'X';
let aiSymbol = 'O';
let gameActive = false;
let playerChoice = null;
let aiChoice = null;

function showPage(pageId) {
    homePage.classList.toggle('active', pageId === 'home-page');
    ticPage.classList.toggle('active', pageId === 'tic-page');
}

function updateSymbolGroups() {
    playerSymbols.innerHTML = Array.from({ length: 3 }, () => '<span class="symbol-pill">X</span>').join('');
    aiSymbols.innerHTML = Array.from({ length: 3 }, () => '<span class="symbol-pill">O</span>').join('');
}

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
    gameActive = false;
    currentTurn = null;
    playerChoice = null;
    aiChoice = null;
    coinChoice.classList.add('hidden');
    coinResult.classList.add('hidden');
    btnReset.classList.add('hidden');
    statusText.textContent = 'Press "Flip a Coin" to begin.';
    renderBoard();
}

function enableCoinSelection() {
    coinChoice.classList.remove('hidden');
    coinResult.classList.add('hidden');
    btnReset.classList.add('hidden');
    statusText.textContent = 'Pick a coin side to decide who starts.';
}

function showCoinResult(text) {
    coinResultText.textContent = text;
    coinResult.classList.remove('hidden');
    coinAnimation.classList.add('spin');
    setTimeout(() => coinAnimation.classList.remove('spin'), 900);
}

function chooseCoinSide(side) {
    playerChoice = side;
    aiChoice = side === 'Heads' ? 'Tails' : 'Heads';
    const coinResultValue = Math.random() < 0.5 ? 'Heads' : 'Tails';
    showCoinResult(`Coin landed on ${coinResultValue}`);

    if (playerChoice === coinResultValue) {
        currentTurn = 'Player';
        statusText.textContent = 'You have the first move.';
    } else {
        currentTurn = 'AI';
        statusText.textContent = 'AI has the first move.';
    }

    gameActive = true;
    coinChoice.classList.add('hidden');
    renderBoard();

    if (currentTurn === 'AI') {
        setTimeout(runAiTurn, 800);
    }
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
        if (checkDraw()) {
            endGame("It's a Draw!");
        }
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

function endGame(message) {
    gameActive = false;
    currentTurn = null;
    statusText.textContent = message;
    btnReset.classList.remove('hidden');
    renderBoard();
}

btnTicTacToe.addEventListener('click', () => {
    showPage('tic-page');
    enableCoinSelection();
});

btnHangman.addEventListener('click', () => {
    alert('Hangman is coming soon!');
});

btnBackHome.addEventListener('click', () => {
    showPage('home-page');
    resetGame();
});

btnFlipCoin.addEventListener('click', () => {
    coinChoice.classList.toggle('hidden');
    coinResult.classList.add('hidden');
    btnReset.classList.add('hidden');
    statusText.textContent = 'Choose Heads or Tails.';
});

coinChoice.querySelectorAll('.coin-side').forEach(button => {
    button.addEventListener('click', () => chooseCoinSide(button.dataset.side));
});

btnReset.addEventListener('click', () => {
    resetGame();
    enableCoinSelection();
});

updateSymbolGroups();
resetGame();
