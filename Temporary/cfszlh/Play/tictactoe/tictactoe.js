// ============ 图片路径 ============
const AI_IMG = "../../images/char/char_laohei2.jpg";

let playerImgSrc = "../../images/char/char_male.jpg";
try {
    const savedPlayer = localStorage.getItem('escape_game_player');
    if (savedPlayer) {
        const pData = JSON.parse(savedPlayer);
        if (pData.avatar && pData.avatar.startsWith('data:image')) {
            playerImgSrc = pData.avatar;
        } else if (pData.gender === 'female') {
            playerImgSrc = "../../images/char/char_female.jpg";
        }
    }
} catch (e) {
    console.warn("未找到玩家存档，使用默认男性角色", e);
}

// ============ 游戏状态 ============
const EMPTY = 0, PLAYER = 1, AI = 2;
let board = Array(9).fill(EMPTY);
let gameOver = false;
let isPlayerTurn = true;
let scores = { player: 0, ai: 0, draw: 0 };

/* ===== 耍赖模式 ===== */
let cheatCount = 0;
let cheatMode = false;
let cheatUsedThisRound = false; // ✅ 统一变量名

// DOM
const cells = document.querySelectorAll('.cell');
const infoEl = document.getElementById('info');
const modalEl = document.getElementById('modal');
const modalEmoji = document.getElementById('modalEmoji');
const modalMsg = document.getElementById('modalMsg');
const scorePlayerEl = document.getElementById('scorePlayer');
const scoreAIEl = document.getElementById('scoreAI');
const scoreDrawEl = document.getElementById('scoreDraw');

/* ===== 点击标题激活耍赖 ===== */
document.getElementById('title').addEventListener('click', () => {
    cheatCount++;

    if (cheatCount >= 10 && !cheatMode) {
        cheatMode = true;
        cheatUsedThisRound = false;
        const tip = document.getElementById('cheatTip');
        if (tip) tip.textContent = '🤡 耍赖模式已开启！本局可覆盖一次 AI 棋子';
    }
});

// ============ 落子 ============
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const i = +cell.dataset.i;

        // 正常空位
        if (board[i] === EMPTY) {
            if (gameOver || !isPlayerTurn) return;
            makeMove(i, PLAYER);
        }
        // 耍赖模式：覆盖 AI
        else if (
            cheatMode &&
            !cheatUsedThisRound &&
            board[i] === AI &&
            isPlayerTurn &&
            !gameOver
        ) {
            cheatUsedThisRound = true; // ✅ 这里必须一致
            overwriteAI(i);
        } else {
            return;
        }

        checkEnd(); // ✅ 覆盖后立刻判胜负

        if (gameOver) return;
        isPlayerTurn = false;
        infoEl.innerHTML = '老黑思考中<span class="ai-turn">…</span>';
        setTimeout(aiMove, 350);
    });
});

function makeMove(index, who) {
    board[index] = who;
    const img = document.createElement('img');
    img.src = who === PLAYER ? playerImgSrc : AI_IMG;
    img.alt = who === PLAYER ? '玩家' : '老黑';
    img.draggable = false;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    const cell = cells[index];
    cell.innerHTML = '';
    cell.appendChild(img);
    cell.classList.add('taken');
}

// ============ 覆盖 AI（核心） ============
function overwriteAI(index) {
    board[index] = PLAYER;

    const cell = cells[index];
    cell.innerHTML = '';
    cell.classList.add('taken', 'cheat-overwrite');

    const img = document.createElement('img');
    img.src = playerImgSrc;
    img.alt = '玩家';
    img.draggable = false;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    cell.appendChild(img);

    setTimeout(() => {
        cell.classList.remove('cheat-overwrite');
    }, 500);

    infoEl.innerHTML = '🤡 你强行覆盖了老黑的棋子！';
}

// ============ AI ============
function aiMove() {
    if (gameOver) return;
    const best = minimax(board, AI, -Infinity, Infinity);
    makeMove(best.index, AI);
    checkEnd();
    if (!gameOver) {
        isPlayerTurn = true;
        infoEl.innerHTML = '你的回合，请落子 <span class="turn">●</span>';
    }
}

// ============ Minimax ============
function minimax(b, player, alpha, beta) {
    const avail = getAvail(b);
    const winner = getWinner(b);

    if (winner === AI) return { score: 10 };
    if (winner === PLAYER) return { score: -10 };
    if (avail.length === 0) return { score: 0 };

    if (player === AI) {
        let best = { score: -Infinity, index: -1 };
        for (const i of avail) {
            b[i] = AI;
            const r = minimax(b, PLAYER, alpha, beta);
            b[i] = EMPTY;
            if (r.score > best.score) best = { ...r, index: i };
            alpha = Math.max(alpha, r.score);
            if (beta <= alpha) break;
        }
        return best;
    } else {
        let best = { score: Infinity, index: -1 };
        for (const i of avail) {
            b[i] = PLAYER;
            const r = minimax(b, AI, alpha, beta);
            b[i] = EMPTY;
            if (r.score < best.score) best = { ...r, index: i };
            beta = Math.min(beta, r.score);
            if (beta <= alpha) break;
        }
        return best;
    }
}

function getAvail(b) {
    return b.reduce((a, v, i) => (v === EMPTY ? a.concat(i) : a), []);
}

function getWinner(b) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (const [a,b1,c] of wins) {
        if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    return null;
}

// ============ 胜负判定 ============
function checkEnd() {
    const w = getWinner(board);
    if (w === PLAYER) {
        gameOver = true;
        scores.player++;
        updateScore();
        showModal('🎉', '卧槽，开智了！', 'win');
        return true;
    }
    if (w === AI) {
        gameOver = true;
        scores.ai++;
        updateScore();
        showModal('😈', '你连老黑都打不过，菜就多练！', 'lose');
        return true;
    }
    if (getAvail(board).length === 0) {
        gameOver = true;
        scores.draw++;
        updateScore();
        showModal('🤝', '彳亍！', 'draw');
        return true;
    }
    return false;
}

function updateScore() {
    scorePlayerEl.textContent = scores.player;
    scoreAIEl.textContent = scores.ai;
    scoreDrawEl.textContent = scores.draw;
}

// ============ 弹窗 ============
function showModal(emoji, text, type) {
    modalEmoji.textContent = emoji;
    modalMsg.textContent = text;
    modalMsg.className = 'msg ' + type;
    modalEl.classList.add('active');
}

function closeModal() {
    modalEl.classList.remove('active');
}

// ============ 重置 ============
function resetBoard() {
    board = Array(9).fill(EMPTY);
    gameOver = false;
    isPlayerTurn = true;
    cheatUsedThisRound = false;

    cells.forEach(c => {
        c.innerHTML = '';
        c.classList.remove('taken');
    });

    const tip = document.getElementById('cheatTip');
    if (tip) tip.textContent = cheatMode ? '🤡 耍赖模式已激活（本局剩余 1 次）' : '';

    infoEl.innerHTML = '你的回合，请落子 <span class="turn">●</span>';
}

document.getElementById('btnRestart').addEventListener('click', () => {
    closeModal();
    resetBoard();
});
