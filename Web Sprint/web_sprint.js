const boardElement = document.getElementById('board');
const statusText = document.getElementById('status');
const btnReset = document.getElementById('reset-btn');
const headsBtn = document.getElementById('choose-heads');
const tailsBtn = document.getElementById('choose-tails');
const flipBtn = document.getElementById('flip-btn');
const coin = document.getElementById('coin');
const coinResultEl = document.getElementById('coin-result');

let board = Array(9).fill('');
let currentTurn = null;
let userChoice = null;
let isFlipping = false;
let gameActive = false;

const playerSymbol = 'X';
const aiSymbol = 'O';

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
    currentTurn = null;
    userChoice = null;
    isFlipping = false;
    gameActive = false;
    coinResultEl.textContent = '';
    statusText.textContent = 'Pick Heads or Tails, then flip the coin to decide who goes first.';
    clearSelection();
    btnReset.classList.add('hidden');
    coin.style.transform = 'rotateY(0deg)';
    renderBoard();
}

function clearSelection() {
    headsBtn.classList.remove('selected');
    tailsBtn.classList.remove('selected');
}

function selectChoice(choice) {
    userChoice = choice;
    headsBtn.classList.toggle('selected', choice === 'heads');
    tailsBtn.classList.toggle('selected', choice === 'tails');
    statusText.textContent = `You chose ${choice}. Press Flip to toss the coin.`;
}

function flipCoin() {
    if (isFlipping) return;
    if (!userChoice) {
        statusText.textContent = 'Please choose Heads or Tails first.';
        return;
    }

    isFlipping = true;
    coinResultEl.textContent = '';
    statusText.textContent = 'Flipping the coin...';

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const spins = Math.floor(Math.random() * 4) + 4;
    const degrees = 360 * spins + (result === 'heads' ? 0 : 180);

    coin.style.transform = `rotateY(${degrees}deg)`;

    function onTransitionEnd() {
        coin.removeEventListener('transitionend', onTransitionEnd);
        isFlipping = false;
        coinResultEl.textContent = `Coin landed on ${result.toUpperCase()}!`;

        if (userChoice === result) {
            statusText.textContent = 'You won the toss — you go first.';
            currentTurn = 'Player';
            gameActive = true;
            renderBoard();
        } else {
            statusText.textContent = 'Computer won the toss — it goes first.';
            currentTurn = 'AI';
            gameActive = true;
            renderBoard();
            setTimeout(runAiTurn, 900);
        }

        btnReset.classList.remove('hidden');
    }

    coin.addEventListener('transitionend', onTransitionEnd, { once: true });
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
    statusText.textContent = 'Computer is choosing a move...';
    setTimeout(runAiTurn, 800);
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
        endGame('Computer Wins!');
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

headsBtn.addEventListener('click', () => selectChoice('heads'));
tailsBtn.addEventListener('click', () => selectChoice('tails'));
flipBtn.addEventListener('click', flipCoin);
btnReset.addEventListener('click', resetGame);
resetGame();
