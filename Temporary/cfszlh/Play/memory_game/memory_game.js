/* ================== 配置 ================== */
const IMAGES = [
    '../../images/char/char_laohei1.jpg',
    '../../images/char/char_laohei2.jpg',
    '../../images/char/char_laohei3.jpg',
    '../../images/char/char_female.jpg',
    '../../images/char/char_male.jpg'
];

let level = 1, moves = 0, timer = 0, timerInterval;
let firstCard = null, lock = true, matched = 0, totalPairs = 0;
let cardsData = [];

/* ================== 工具 ================== */
const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

/* 记忆时间：5 → 1 秒 */
const getShowTime = () =>
    Math.max(1, parseFloat((5 - (level - 1) * 0.15).toFixed(1)));

/* ================== 关卡 ================== */
function startLevel() {
    matched = 0;
    moves = 0;
    firstCard = null;
    lock = true;

    document.getElementById('level').textContent = level;
    document.getElementById('moves').textContent = moves;
    document.getElementById('timer').textContent = 0;
    clearInterval(timerInterval);
    timer = 0;

    /* 牌数递增（最多 25 对 = 50 张） */
    totalPairs = Math.min(25, 2 + level - 1);

    /* 图片不够 → 自动复用 */
    let pool = [];
    while (pool.length < totalPairs) {
        pool.push(...IMAGES);
    }
    pool = shuffle(pool).slice(0, totalPairs);

    const cards = shuffle([...pool, ...pool]);
    cardsData = cards;

    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    /* 自适应列数 */
    const cols = Math.min(5, Math.ceil(Math.sqrt(cards.length)));
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    cards.forEach((src, i) => {
        const card = document.createElement('div');
        card.className = 'card memorize flipped';
        card.dataset.src = src;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-back">?</div>
                <div class="card-face card-front"><img src="${src}"></div>
            </div>`;
        grid.appendChild(card);
    });

    /* 记忆倒计时 */
    const memoOverlay = document.getElementById('memoOverlay');
    const memoCountdown = document.getElementById('memoCountdown');
    memoOverlay.classList.add('active');

    let t = Math.ceil(getShowTime());
    memoCountdown.textContent = t;

    const interval = setInterval(() => {
        t--;
        if (t <= 0) {
            clearInterval(interval);
            memoOverlay.classList.remove('active');

            /* 全部扣回去 */
            document.querySelectorAll('.card').forEach(c => {
                c.classList.remove('memorize');
                c.classList.remove('flipped');
                c.addEventListener('click', () => flipCard(c));
            });

            lock = false;
            startTimer();
        } else {
            memoCountdown.textContent = t;
        }
    }, 1000);
}

/* ================== 计时 ================== */
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        document.getElementById('timer').textContent = timer;
    }, 1000);
}

/* ================== 翻牌 ================== */
function flipCard(card) {
    if (lock) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    moves++;
    document.getElementById('moves').textContent = moves;

    if (!firstCard) {
        firstCard = card;
    } else {
        lock = true;
        const second = card;

        if (firstCard.dataset.src === second.dataset.src) {
            firstCard.classList.add('matched');
            second.classList.add('matched');
            matched++;

            firstCard = null;
            lock = false;

            if (matched === totalPairs) {
                clearInterval(timerInterval);
                setTimeout(showWin, 500);
            }
        } else {
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                second.classList.remove('flipped');
                firstCard = null;
                lock = false;
            }, 800);
        }
    }
}

/* ================== 胜利 ================== */
function showWin() {
    const msgs = [
        "记忆力不错嘛！",
        "还行，继续加油！",
        "有点东西啊！",
        "卧槽，开智了！",
        "这都不忘？牛！"
    ];
    document.getElementById('msg').textContent =
        msgs[Math.min(level - 1, msgs.length - 1)];
    document.getElementById('overlay').classList.add('active');
}

function nextLevel() {
    document.getElementById('overlay').classList.remove('active');
    level++;
    startLevel();
}

startLevel();
