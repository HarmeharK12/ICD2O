const boardElement = document.getElementById('board');
const statusText = document.getElementById('status');
const btnReset = document.getElementById('reset-btn');
const onePlayerBtn = document.getElementById('one-player-btn');
const twoPlayerBtn = document.getElementById('two-player-btn');
const headsBtn = document.getElementById('heads-btn');
const tailsBtn = document.getElementById('tails-btn');
const flipBtn = document.getElementById('flip-btn');
const coinOptions = document.getElementById('coin-options');
const coinResultText = document.getElementById('coin-result');

let board = Array(9).fill('');
let mode = null;
let coinChoice = null;
let currentTurn = null;
let currentPlayer = null;
let gameActive = false;
const playerSymbol = 'X';
const aiSymbol = 'O';
const player1Symbol = 'X';
const player2Symbol = 'O';

function renderBoard() {
    boardElement.innerHTML = '';

    board.forEach((value, index) => {
        const cell = document.createElement('button');
        cell.className = 'cell';
        cell.dataset.index = index;
        cell.textContent = value;

        if (!gameActive || currentTurn === null || value) {
            cell.classList.add('disabled');
        }

        cell.addEventListener('click', onBoardCellClick);
        boardElement.appendChild(cell);
    });
}

function resetGame() {
    board = Array(9).fill('');
    mode = null;
    coinChoice = null;
    currentTurn = null;
    currentPlayer = null;
    gameActive = false;
    updateModeButtons();
    showCoinOptions(false);
    coinResultText.textContent = '';
    statusText.textContent = 'Choose One Player or Two Players to start.';
    btnReset.classList.add('hidden');
    renderBoard();
}

function updateModeButtons() {
    onePlayerBtn.classList.toggle('active', mode === 'one-player');
    twoPlayerBtn.classList.toggle('active', mode === 'two-player');
}

function showCoinOptions(show) {
    coinOptions.classList.toggle('hidden', !show);
}

function setMode(newMode) {
    mode = newMode;
    coinChoice = null;
    coinResultText.textContent = '';
    updateModeButtons();

    if (mode === 'one-player') {
        showCoinOptions(false);
        startOnePlayerGame();
    } else if (mode === 'two-player') {
        showCoinOptions(true);
        gameActive = false;
        currentTurn = null;
        currentPlayer = null;
        statusText.textContent = 'Player 1, choose Heads or Tails then flip the coin.';
        renderBoard();
    }
}

function startOnePlayerGame() {
    gameActive = true;
    currentTurn = 'Player';
    currentPlayer = null;
    statusText.textContent = 'Your turn, Player X. Pick an empty cell.';
    btnReset.classList.add('hidden');
    renderBoard();
}

function setCoinChoice(choice) {
    coinChoice = choice;
    headsBtn.classList.toggle('active', choice === 'heads');
    tailsBtn.classList.toggle('active', choice === 'tails');
    statusText.textContent = `Player 1 chose ${choice}. Flip the coin to decide who starts.`;
}

function flipCoin() {
    if (mode !== 'two-player') {
        return;
    }

    if (!coinChoice) {
        statusText.textContent = 'Pick Heads or Tails before flipping.';
        return;
    }

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const starts = result === coinChoice ? 'Player 1' : 'Player 2';
    coinResultText.textContent = `Coin shows ${result}. ${starts} starts.`;
    currentPlayer = starts;
    currentTurn = starts;
    gameActive = true;
    statusText.textContent = `${currentTurn}'s turn. Pick an empty cell.`;
    btnReset.classList.add('hidden');
    renderBoard();
}

function getSymbolForPlayer(player) {
    return player === 'Player 1' ? player1Symbol : player2Symbol;
}

function toggleTwoPlayerTurn() {
    return currentTurn === 'Player 1' ? 'Player 2' : 'Player 1';
}

function onBoardCellClick(event) {
    if (!gameActive || currentTurn === null) {
        return;
    }

    const index = Number(event.currentTarget.dataset.index);
    if (board[index] !== '') {
        return;
    }

    if (mode === 'two-player') {
        board[index] = getSymbolForPlayer(currentTurn);
        renderBoard();

        if (checkWinner(getSymbolForPlayer(currentTurn))) {
            endGame(`${currentTurn} Wins!`);
            return;
        }

        if (checkDraw()) {
            endGame("It's a Draw!");
            return;
        }

        currentTurn = toggleTwoPlayerTurn();
        statusText.textContent = `${currentTurn}'s turn.`;
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

    let chosenIndex = findWinningMove(aiSymbol);
    if (chosenIndex === null) {
        chosenIndex = findWinningMove(playerSymbol);
    }
    if (chosenIndex === null) {
        chosenIndex = chooseBestMove(emptyIndices);
    }

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

function findWinningMove(symbol) {
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

    for (const line of winningLines) {
        const values = line.map(index => board[index]);
        const emptyIndex = line.find(index => board[index] === '');

        if (emptyIndex !== undefined) {
            const filledBySymbol = values.filter(value => value === symbol).length;
            const filledByOther = values.filter(value => value !== symbol && value !== '').length;

            if (filledBySymbol === 2 && filledByOther === 0) {
                return emptyIndex;
            }
        }
    }

    return null;
}

function chooseBestMove(emptyIndices) {
    const center = 4;
    if (board[center] === '') {
        return center;
    }

    const corners = [0, 2, 6, 8].filter(index => board[index] === '');
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
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
    currentPlayer = null;
    statusText.textContent = message;
    btnReset.classList.remove('hidden');
    renderBoard();
}

onePlayerBtn.addEventListener('click', () => setMode('one-player'));
twoPlayerBtn.addEventListener('click', () => setMode('two-player'));
headsBtn.addEventListener('click', () => setCoinChoice('heads'));
tailsBtn.addEventListener('click', () => setCoinChoice('tails'));
flipBtn.addEventListener('click', flipCoin);
btnReset.addEventListener('click', resetGame);
resetGame();
