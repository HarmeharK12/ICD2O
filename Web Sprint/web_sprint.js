const boardElement = document.getElementById('board');
const statusText = document.getElementById('status');
const headsBtn = document.getElementById('choose-heads');
const tailsBtn = document.getElementById('choose-tails');
const flipBtn = document.getElementById('flip-btn');
const coin = document.getElementById('coin');
const coinResultEl = document.getElementById('coin-result');
const winnerSound = document.getElementById('winner-sound');
const loserSound = document.getElementById('loser-sound');
const youtubeLoseFrame = document.getElementById('yt-lose-sound');

let board = Array(9).fill('');
let currentTurn = null;
let userChoice = null;
let isFlipping = false;
let gameActive = false;
let coinTransitionHandler = null;

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
    if (coinTransitionHandler) {
        coin.removeEventListener('transitionend', coinTransitionHandler);
        coinTransitionHandler = null;
    }
    isFlipping = false;
    gameActive = false;
    coinResultEl.textContent = '';
    statusText.textContent = 'Pick Heads or Tails, then flip the coin to decide who goes first.';
    clearSelection();
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
        coinTransitionHandler = null;
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
    }

    coinTransitionHandler = onTransitionEnd;
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

const endPopup = document.getElementById('end-popup');
const endMessage = document.getElementById('end-message');
const endPopupBtn = document.getElementById('end-popup-btn');
const confettiContainer = document.getElementById('confetti-container');
const thumbsContainer = document.getElementById('thumbs-container');

function checkDraw() {
    return board.every(cell => cell !== '') && !checkWinner(playerSymbol) && !checkWinner(aiSymbol);
}

function endGame(message) {
    gameActive = false;
    currentTurn = null;
    statusText.textContent = message;
    renderBoard();
    if (message.includes('Lose') || message.includes('Computer Wins')) {
        showEndPopup('YOU LOSE 😞', 'lose');
    } else if (message.includes('Win')) {
        showEndPopup('YOU WON 🎊', 'win');
    } else {
        showEndPopup(message, 'draw');
    }
}

function showEndPopup(text, type) {
    endMessage.textContent = text;
    const subtext = document.getElementById('end-subtext');
    if (type === 'win') {
        subtext.textContent = 'Great job — you beat the AI!';
        triggerConfetti();
        playWinnerSound();
    } else if (type === 'lose') {
        subtext.textContent = 'Better luck next time — the AI wins.';
        triggerThumbsDown();
        playLoseSound();
    } else {
        subtext.textContent = 'It was a draw — try again!';
    }
    endPopup.classList.remove('hidden');
}

function playWinnerSound() {
    if (winnerSound) {
        winnerSound.currentTime = 0;
        const playPromise = winnerSound.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                playCheerSound();
            });
        }
        return;
    }
    playCheerSound();
}

function playLoseSound() {
    if (loserSound) {
        loserSound.currentTime = 0;
        const playPromise = loserSound.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                playBooSound();
            });
        }
        return;
    }

    if (!youtubeLoseFrame) {
        playBooSound();
        return;
    }

    const videoId = 'LukyMYp2noo';
    youtubeLoseFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&playsinline=1&start=0&${Date.now()}`;
}

function hideEndPopup() {
    endPopup.classList.add('hidden');
    confettiContainer.innerHTML = '';
    thumbsContainer.innerHTML = '';
}

function triggerConfetti() {
    confettiContainer.innerHTML = '';
    const colors = ['#ff4d6d', '#f9c74f', '#90be6d', '#4d96ff', '#8d4dff', '#ffb703', '#00b4d8'];
    const count = 120;
    for (let i = 0; i < count; i += 1) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.top = `${-Math.random() * 20 - 5}%`;
        piece.style.width = `${6 + Math.random() * 12}px`;
        piece.style.height = `${14 + Math.random() * 18}px`;
        piece.style.animationDuration = `${2.8 + Math.random() * 1.2}s`;
        piece.style.animationDelay = `${Math.random() * 0.8}s`;
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(piece);
    }
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 4200);
}

function triggerThumbsDown() {
    thumbsContainer.innerHTML = '';
    for (let i = 0; i < 20; i += 1) {
        const thumb = document.createElement('div');
        thumb.className = 'thumbs-drop';
        thumb.textContent = '👎';
        thumb.style.left = `${Math.random() * 90 + 5}%`;
        thumb.style.animationDuration = `${1.8 + Math.random() * 0.6}s`;
        thumb.style.animationDelay = `${Math.random() * 0.3}s`;
        thumb.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
        thumbsContainer.appendChild(thumb);
    }
    setTimeout(() => {
        thumbsContainer.innerHTML = '';
    }, 2600);
}

function playCheerSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.24, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
}

function playBooSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 1.1);
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.4);
}

endPopupBtn.addEventListener('click', () => {
    hideEndPopup();
    resetGame();
});

headsBtn.addEventListener('click', () => selectChoice('heads'));
tailsBtn.addEventListener('click', () => selectChoice('tails'));
flipBtn.addEventListener('click', flipCoin);
resetGame();
