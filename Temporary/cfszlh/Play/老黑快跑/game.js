// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_DURATION = 180;
const ATTACK_RANGE = 130;

const RANKS = {
    S: { min: 50000, title: '完美演奏！', desc: '传说中的节奏大师！', color: '#ffd700' },
    A: { min: 30000, title: '精彩表现！', desc: '出色的节奏感！', color: '#ff6b6b' },
    B: { min: 15000, title: '不错哦！', desc: '还有进步空间！', color: '#4ecdc4' },
    C: { min: 5000, title: '勉强及格', desc: '需要多加练习！', color: '#95e1d3' },
    D: { min: 0, title: '继续努力', desc: '别放弃，再试一次！', color: '#a8a8a8' }
};

const scenes = {
    candy: {
        name: '糖果工厂',
        bgColors: ['#ffb6c1', '#ff69b4', '#dda0dd'],
        groundColor: '#ff1493',
        accentColor: '#00fa9a',
        themeColor: '#ff69b4',
        particleColors: ['#ffb6c1', '#ffa07a', '#98fb98', '#ffd700'],
        enemyGroundColor: '#ff1493',
        enemyAirColor: '#00fa9a',
        gridColor: 'rgba(255,20,147,0.3)',
        shadowColor: '#ff69b4',
        mountainColor: '#ffb6c1',
        musicScale: ['C4', 'E4', 'G4', 'B4', 'D5', 'F#5'],
        bpm: 128,
        baseFreq: 261.63
    },
    neon: {
        name: '霓虹都市',
        bgColors: ['#0f0c29', '#302b63', '#24243e'],
        groundColor: '#00f3ff',
        accentColor: '#ff00ff',
        themeColor: '#00f3ff',
        particleColors: ['#00f3ff', '#ff00ff', '#ffff00', '#ff006e'],
        enemyGroundColor: '#ff00ff',
        enemyAirColor: '#00f3ff',
        gridColor: 'rgba(0,243,255,0.3)',
        shadowColor: '#00f3ff',
        mountainColor: '#1a1a2e',
        musicScale: ['C3', 'C4', 'G3', 'Eb4', 'Bb3', 'F4'],
        bpm: 140,
        baseFreq: 130.81
    },
    ghost: {
        name: '幽灵城堡',
        bgColors: ['#1a1a2e', '#16213e', '#0f3460'],
        groundColor: '#9d4edd',
        accentColor: '#c77dff',
        themeColor: '#9d4edd',
        particleColors: ['#9d4edd', '#c77dff', '#e0aaff', '#10002b'],
        enemyGroundColor: '#5a189a',
        enemyAirColor: '#c77dff',
        gridColor: 'rgba(157,78,221,0.3)',
        shadowColor: '#9d4edd',
        mountainColor: '#10002b',
        musicScale: ['A3', 'C4', 'E4', 'A4', 'C5', 'E5'],
        bpm: 110,
        baseFreq: 220.00
    },
    pixel: {
        name: '像素迷宫',
        bgColors: ['#0d0208', '#003b00', '#008f11'],
        groundColor: '#39ff14',
        accentColor: '#ff0000',
        themeColor: '#39ff14',
        particleColors: ['#39ff14', '#ff0000', '#ffff00', '#008f11'],
        enemyGroundColor: '#ff0000',
        enemyAirColor: '#39ff14',
        gridColor: 'rgba(57,255,20,0.3)',
        shadowColor: '#39ff14',
        mountainColor: '#003b00',
        musicScale: ['C4', 'G4', 'C5', 'E5', 'G5', 'C6'],
        bpm: 150,
        baseFreq: 261.63
    }
};

let currentScene = 'candy';
let musicEnabled = true;

let audioCtx = null;
let masterGain = null;
let bgmOscillators = [];
let bgmInterval = null;
let beatIndex = 0;

const noteFrequencies = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
    'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
    'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
    'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
    'C6': 1046.50
};

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.4;
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playKick(time = 0) {
    if (!musicEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);
    const now = audioCtx.currentTime + time;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(0.001, now + 0.5);
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
}

function playSnare(time = 0) {
    if (!musicEnabled || !audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = audioCtx.createGain();
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    const now = audioCtx.currentTime + time;
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    noise.start(now);
    noise.stop(now + 0.2);
    
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    const oscGain = audioCtx.createGain();
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.frequency.setValueAtTime(250, now);
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
}

function playHihat(time = 0, open = false) {
    if (!musicEnabled || !audioCtx) return;
    const bufferSize = audioCtx.sampleRate * (open ? 0.3 : 0.05);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    const gain = audioCtx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    const now = audioCtx.currentTime + time;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (open ? 0.3 : 0.05));
    noise.start(now);
    noise.stop(now + (open ? 0.3 : 0.05));
}

function playNote(frequency, duration = 0.1, type = 'square', time = 0) {
    if (!musicEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(masterGain);
    const now = audioCtx.currentTime + time;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    osc.start(now);
    osc.stop(now + duration);
}

function playHitSound(comboCount) {
    if (!musicEnabled || !audioCtx) return;
    const scene = scenes[currentScene];
    const scale = scene.musicScale;
    const noteIndex = Math.min(Math.floor(comboCount / 5), scale.length - 1);
    const freq = noteFrequencies[scale[noteIndex]];
    playNote(freq, 0.15, 'square', 0);
    playNote(freq * 1.5, 0.1, 'sawtooth', 0.05);
    setTimeout(() => playKick(0), 0);
    if (comboCount > 10) {
        setTimeout(() => playSnare(0), 100);
    }
}

function playJumpSound() {
    if (!musicEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(masterGain);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function playMissSound() {
    if (!musicEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(masterGain);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

function playFeverSound() {
    if (!musicEnabled || !audioCtx) return;
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            playNote(440 + i * 100, 0.3, 'sawtooth', 0);
            playKick(0);
        }, i * 50);
    }
}

function playResultSound(rank) {
    if (!musicEnabled || !audioCtx) return;
    const rankNotes = {
        'S': ['C5', 'E5', 'G5', 'C6'],
        'A': ['C5', 'E5', 'G5'],
        'B': ['C5', 'E5'],
        'C': ['C5'],
        'D': ['G3']
    };
    const notes = rankNotes[rank] || rankNotes['C'];
    notes.forEach((note, i) => {
        setTimeout(() => {
            playNote(noteFrequencies[note], 0.4, 'square', 0);
            if (i === notes.length - 1) playKick(0);
        }, i * 150);
    });
}

function startBackgroundMusic() {
    if (!musicEnabled || !audioCtx) return;
    const scene = scenes[currentScene];
    const beatDuration = 60 / scene.bpm;
    const scale = scene.musicScale;
    if (bgmInterval) clearInterval(bgmInterval);
    beatIndex = 0;
    bgmInterval = setInterval(() => {
        if (gameState !== 'playing') return;
        const now = audioCtx.currentTime;
        if (beatIndex % 4 === 0) {
            playKick(0);
        } else if (beatIndex % 4 === 2) {
            playSnare(0);
        }
        if (beatIndex % 2 === 0) {
            playHihat(0);
        }
        if (beatIndex % 8 === 0) {
            playNote(noteFrequencies[scale[0]] / 2, 0.3, 'sawtooth', 0);
        } else if (beatIndex % 8 === 4) {
            playNote(noteFrequencies[scale[2]] / 2, 0.3, 'sawtooth', 0);
        }
        if (isFever) {
            if (beatIndex % 2 === 1) {
                playHihat(0, true);
            }
            if (beatIndex % 4 === 1 || beatIndex % 4 === 3) {
                playNote(noteFrequencies[scale[beatIndex % scale.length]], 0.1, 'square', 0);
            }
        }
        beatIndex = (beatIndex + 1) % 16;
    }, beatDuration * 1000 / 4);
}

function stopBackgroundMusic() {
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    const btn = document.getElementById('musicToggle');
    btn.textContent = musicEnabled ? '🎵' : '🔇';
    btn.classList.toggle('muted', !musicEnabled);
    if (!musicEnabled) {
        stopBackgroundMusic();
    } else if (gameState === 'playing') {
        initAudio();
        startBackgroundMusic();
    }
}

function setTheme(sceneKey) {
    const scene = scenes[sceneKey];
    document.documentElement.style.setProperty('--theme-color', scene.themeColor);
    document.documentElement.style.setProperty('--theme-accent', scene.accentColor);
    currentScene = sceneKey;
}

let gameState = 'menu';
let score = 0;
let combo = 0;
let maxCombo = 0;
let fever = 0;
let gameSpeed = 2.5;
let frame = 0;
let isFever = false;
let timeRemaining = GAME_DURATION;
let feverCount = 0;
let enemiesHit = 0;
let totalEnemies = 0;
let timerInterval = null;
let attackCooldown = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const GROUND_HEIGHT = 140;
const GRAVITY = 0.6;
const JUMP_FORCE = -14;

const player = {
    x: 150,
    y: 0,
    width: 80,
    height: 100,
    vy: 0,
    grounded: true,
    animFrame: 0,
    isAttacking: false,
    attackType: null,
    attackTimer: 0
};

// ========== 在这里修改图片路径 ==========
const PLAYER_FACE_IMAGE = 'lh.png';

let faceImage = null;
let imageLoaded = false;

function loadFaceImage() {
    return new Promise((resolve) => {
        faceImage = new Image();
        faceImage.onload = () => {
            imageLoaded = true;
            resolve();
        };
        faceImage.onerror = () => {
            console.error('Failed to load face image, using fallback');
            imageLoaded = false;
            resolve();
        };
        faceImage.src = PLAYER_FACE_IMAGE;
    });
}

let enemies = [];
let particles = [];
let bgLayers = [];
let shockwaves = [];
let slashEffects = [];

function initBackground() {
    bgLayers = [];
    const scene = scenes[currentScene];
    for(let i = 0; i < 3; i++) {
        bgLayers.push({
            type: 'mountain',
            x: i * 500,
            y: canvas.height - GROUND_HEIGHT - 200,
            width: 500,
            height: 250,
            speed: 0.2,
            color: scene.mountainColor
        });
    }
    for(let i = 0; i < 2; i++) {
        bgLayers.push({
            type: 'torii',
            x: 800 + i * 1000,
            y: canvas.height - GROUND_HEIGHT - 250,
            width: 160,
            height: 250,
            speed: 0.5,
            color: scene.themeColor
        });
    }
    for(let i = 0; i < 8; i++) {
        bgLayers.push({
            type: 'note',
            x: Math.random() * canvas.width,
            y: 50 + Math.random() * 200,
            size: 30 + Math.random() * 20,
            speed: 0.6 + Math.random() * 1.2,
            rotation: Math.random() * Math.PI * 2,
            color: `rgba(255,255,255,${0.1 + Math.random() * 0.15})`
        });
    }
}

function spawnEnemy() {
    const isGround = Math.random() > 0.45;
    const scene = scenes[currentScene];
    const enemy = {
        x: canvas.width + 80,
        y: isGround ? canvas.height - GROUND_HEIGHT - 55 : canvas.height - GROUND_HEIGHT - 160,
        width: 60,
        height: 55,
        type: isGround ? 'ground' : 'air',
        vx: -gameSpeed,
        vy: 0,
        vRot: 0,
        rotation: 0,
        scale: 1,
        hit: false,
        color: isGround ? scene.enemyGroundColor : scene.enemyAirColor,
        floatOffset: Math.random() * Math.PI * 2,
        inRange: false
    };
    enemies.push(enemy);
    totalEnemies++;
}

function createExplosion(x, y, color, count = 15) {
    const scene = scenes[currentScene];
    for(let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const speed = 4 + Math.random() * 6;
        const colorToUse = color || scene.particleColors[Math.floor(Math.random() * scene.particleColors.length)];
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color: colorToUse,
            size: 5 + Math.random() * 8,
            gravity: 0.4
        });
    }
}

function createShockwave(x, y) {
    shockwaves.push({
        x: x,
        y: y,
        radius: 10,
        maxRadius: 60,
        alpha: 1,
        color: '#fff'
    });
}

function createSlashEffect(type) {
    const colors = type === 'air' ? ['#00d9ff', '#66ccff'] : ['#ff006e', '#ff4d9e'];
    slashEffects.push({
        x: player.x + 40,
        y: player.y + 50,
        type: type,
        life: 1,
        color: colors[0],
        secondaryColor: colors[1],
        angle: type === 'air' ? -Math.PI/3 : Math.PI/6
    });
}

function createJumpEffect() {
    for(let i = 0; i < 8; i++) {
        const angle = Math.PI + (Math.PI / 8) * i;
        const speed = 3 + Math.random() * 2;
        particles.push({
            x: player.x + 40,
            y: player.y + 100,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color: 'rgba(255,255,255,0.8)',
            size: 4,
            gravity: 0.2
        });
    }
}

function createHitText(x, y, text) {
    const scene = scenes[currentScene];
    const el = document.createElement('div');
    el.className = 'hit-text';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = isFever ? scene.themeColor : (combo > 15 ? '#ffdd00' : scene.accentColor);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function attackAir() {
    if(gameState !== 'playing' || attackCooldown > 0) return;
    
    if(player.grounded) {
        player.vy = JUMP_FORCE;
        player.grounded = false;
        player.isAttacking = true;
        player.attackType = 'air';
        player.attackTimer = 20;
        createJumpEffect();
        playJumpSound();
        
        setTimeout(() => {
            performAttack('air');
        }, 80);
    } else {
        performAttack('air');
    }
    
    attackCooldown = 20;
}

function attackGround() {
    if(gameState !== 'playing' || attackCooldown > 0) return;
    
    player.isAttacking = true;
    player.attackType = 'ground';
    player.attackTimer = 15;
    performAttack('ground');
    attackCooldown = 20;
}

function performAttack(type) {
    createSlashEffect(type);
    
    let hitEnemy = null;
    let hitIndex = -1;
    let minDist = Infinity;
    
    for(let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if(e.hit) continue;
        
        const dist = e.x - (player.x + player.width);
        if(dist > -30 && dist < ATTACK_RANGE) {
            if((type === 'air' && e.type === 'air') || (type === 'ground' && e.type === 'ground')) {
                if(dist < minDist) {
                    minDist = dist;
                    hitEnemy = e;
                    hitIndex = i;
                }
            }
        }
    }
    
    if(hitEnemy) {
        hitEnemy.hit = true;
        enemiesHit++;
        
        if(type === 'air') {
            hitEnemy.vx = 8 + Math.random() * 4;
            hitEnemy.vy = -18 - Math.random() * 8;
            hitEnemy.vRot = 0.5;
        } else {
            hitEnemy.vx = 18 + Math.random() * 6;
            hitEnemy.vy = -8 - Math.random() * 4;
            hitEnemy.vRot = 0.3;
        }
        
        createShockwave(hitEnemy.x + 30, hitEnemy.y + 27);
        
        const baseScore = isFever ? 200 : 100;
        score += baseScore + (combo * 15);
        combo++;
        if(combo > maxCombo) maxCombo = combo;
        fever = Math.min(fever + 25, 200);
        if(fever >= 200 && !isFever) activateFever();
        
        createExplosion(hitEnemy.x + 30, hitEnemy.y + 27, null, 20);
        
        const hitWords = isFever ? 'PERFECT!!' : combo > 20 ? 'AMAZING!' : combo > 10 ? 'GREAT!' : 'GOOD!';
        createHitText(hitEnemy.x + 30, hitEnemy.y, hitWords);
        playHitSound(combo);
    } else {
        combo = 0;
        fever = Math.max(fever - 10, 0);
        createHitText(player.x + 50, player.y, 'MISS');
        playMissSound();
    }
    
    updateUI();
}

function activateFever() {
    isFever = true;
    feverCount++;
    gameSpeed *= 1.2;
    playFeverSound();
    setTimeout(() => {
        isFever = false;
        gameSpeed = 2.5 + (frame / 1200) * 0.1;
        fever = 0;
        updateUI();
    }, 6000);
}

function endGame() {
    gameState = 'over';
    stopBackgroundMusic();
    clearInterval(timerInterval);
    document.getElementById('attackButtons').style.display = 'none';
    const rank = calculateRank();
    showResultScreen(rank);
}

function calculateRank() {
    for (let r of ['S', 'A', 'B', 'C', 'D']) {
        if (score >= RANKS[r].min) return r;
    }
    return 'D';
}

function showResultScreen(rank) {
    const rankInfo = RANKS[rank];
    const accuracy = totalEnemies > 0 ? Math.round((enemiesHit / totalEnemies) * 100) : 0;
    document.getElementById('rankDisplay').textContent = rank;
    document.getElementById('rankDisplay').className = 'rank-display rank-' + rank;
    document.getElementById('rankDesc').textContent = rankInfo.title;
    document.getElementById('finalScore').textContent = score.toLocaleString();
    document.getElementById('finalCombo').textContent = maxCombo;
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    document.getElementById('finalFever').textContent = feverCount;
    document.getElementById('resultScreen').classList.remove('hidden');
    playResultSound(rank);
}

function updateTimer() {
    timeRemaining--;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const timerEl = document.getElementById('timerDisplay');
    timerEl.textContent = display;
    if (timeRemaining <= 10) {
        timerEl.classList.add('warning');
        if (musicEnabled && audioCtx) {
            playNote(880, 0.1, 'square', 0);
        }
    }
    if (timeRemaining <= 0) {
        endGame();
    }
}

function update() {
    if(gameState !== 'playing') return;
    frame++;
    if(attackCooldown > 0) attackCooldown--;
    if(player.attackTimer > 0) {
        player.attackTimer--;
        if(player.attackTimer === 0) {
            player.isAttacking = false;
            player.attackType = null;
        }
    }
    
    if(frame % 1200 === 0) gameSpeed += 0.1;
    
    const spawnRate = isFever ? 80 : 140 + Math.floor(Math.random() * 60);
    if(frame % spawnRate === 0) spawnEnemy();
    
    if(!player.grounded) {
        player.vy += GRAVITY;
        player.y += player.vy;
        
        const groundY = canvas.height - GROUND_HEIGHT - player.height;
        if(player.y >= groundY) {
            player.y = groundY;
            player.vy = 0;
            player.grounded = true;
            player.isAttacking = false;
            for(let i = 0; i < 5; i++) {
                particles.push({
                    x: player.x + 40,
                    y: player.y + 100,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -Math.random() * 3,
                    life: 1,
                    color: 'rgba(255,255,255,0.5)',
                    size: 3,
                    gravity: 0.1
                });
            }
        }
    } else {
        player.animFrame += 0.15;
    }
    
    for(let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        if(!e.hit) {
            e.x -= gameSpeed;
            if(e.type === 'air') {
                e.floatOffset += 0.08;
                e.y += Math.sin(e.floatOffset) * 0.8;
            }
            
            const dist = e.x - (player.x + player.width);
            e.inRange = (dist > -30 && dist < ATTACK_RANGE);
            
            if(e.x < player.x - 30) {
                enemies.splice(i, 1);
                combo = 0;
                fever = Math.max(fever - 15, 0);
                createHitText(player.x, player.y - 50, 'MISS');
                playMissSound();
                updateUI();
            }
        } else {
            e.x += e.vx;
            e.y += e.vy;
            e.vy += GRAVITY * 0.8;
            e.rotation += e.vRot;
            e.scale -= 0.015;
            if(e.scale <= 0 || e.y > canvas.height + 100) {
                enemies.splice(i, 1);
            }
        }
    }
    
    for(let i = slashEffects.length - 1; i >= 0; i--) {
        let s = slashEffects[i];
        s.life -= 0.1;
        if(s.life <= 0) slashEffects.splice(i, 1);
    }
    
    for(let i = shockwaves.length - 1; i >= 0; i--) {
        let s = shockwaves[i];
        s.radius += 3;
        s.alpha -= 0.05;
        if(s.alpha <= 0) shockwaves.splice(i, 1);
    }
    
    bgLayers.forEach(bg => {
        bg.x -= bg.speed * (isFever ? 1.5 : 1);
        if(bg.x + bg.width < -300) {
            bg.x = canvas.width + 300;
        }
        if(bg.type === 'note') {
            bg.rotation += 0.02;
            bg.x -= bg.speed;
            if(bg.x < -50) bg.x = canvas.width + 50;
        }
    });
    
    for(let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= 0.025;
        if(p.life <= 0) particles.splice(i, 1);
    }
}

function drawPlayer() {
    const centerX = player.x + player.width/2;
    const centerY = player.y + player.height/2;
    
    const shadowScale = player.grounded ? 1 : Math.max(0.5, 1 - (canvas.height - GROUND_HEIGHT - player.height - player.y) / 200);
    ctx.fillStyle = `rgba(0,0,0,${0.3 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(centerX, player.y + player.height + 10, 40 * shadowScale, 12 * shadowScale, 0, 0, Math.PI*2);
    ctx.fill();
    
    let bodyBounce = 0;
    let bodyRotation = 0;
    let leftArmAngle = 0, rightArmAngle = 0;
    let leftLegAngle = 0, rightLegAngle = 0;
    
    if (!player.grounded) {
        bodyBounce = -10;
        bodyRotation = -0.1;
        if (player.attackType === 'air' && player.isAttacking) {
            leftArmAngle = -2.2;
            rightArmAngle = -2.2;
        } else {
            leftArmAngle = -0.5;
            rightArmAngle = 0.5;
            leftLegAngle = -0.3;
            rightLegAngle = 0.3;
        }
    } else if (player.attackType === 'ground' && player.isAttacking) {
        bodyBounce = 5;
        bodyRotation = 0.1;
        leftArmAngle = 0.3;
        rightArmAngle = -1.3;
        leftLegAngle = -0.2;
        rightLegAngle = 0.2;
    } else {
        const runCycle = Math.sin(player.animFrame * 4);
        bodyBounce = Math.abs(runCycle) * 3;
        leftArmAngle = runCycle * 0.8;
        rightArmAngle = -runCycle * 0.8;
        leftLegAngle = -runCycle * 0.6;
        rightLegAngle = runCycle * 0.6;
    }
    
    const bodyY = centerY + bodyBounce;
    
    // 左腿
    ctx.save();
    ctx.translate(centerX - 15, bodyY + 35);
    ctx.rotate(leftLegAngle);
    ctx.fillStyle = '#ff69b4';
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-8, 0, 16, 35, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff006e';
    ctx.beginPath();
    ctx.ellipse(0, 38, 12, 8, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    
    // 右腿
    ctx.save();
    ctx.translate(centerX + 15, bodyY + 35);
    ctx.rotate(rightLegAngle);
    ctx.fillStyle = '#ff69b4';
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-8, 0, 16, 35, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff006e';
    ctx.beginPath();
    ctx.ellipse(0, 38, 12, 8, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    
    // 身体/头部（图片）
    ctx.save();
    ctx.translate(centerX, bodyY);
    ctx.rotate(bodyRotation);
    
    // 绘制图片（无圆形边框）
    if (imageLoaded && faceImage) {
        const imgSize = 90;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-imgSize/2, -imgSize/2, imgSize, imgSize, 15);
        ctx.clip();
        ctx.drawImage(faceImage, -imgSize/2, -imgSize/2, imgSize, imgSize);
        ctx.restore();
    } else {
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.roundRect(-45, -45, 90, 90, 15);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FACE', 0, 5);
    }
    
    ctx.restore();
    
    // 左臂
    ctx.save();
    ctx.translate(centerX - 35, bodyY + 10);
    ctx.rotate(leftArmAngle);
    ctx.fillStyle = '#ff69b4';
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-7, 0, 14, 30, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(0, 35, 10, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    // 右臂（拿锤子的手）- 修复锤子位置，手握锤柄
    ctx.save();
    ctx.translate(centerX + 35, bodyY + 10);
    ctx.rotate(rightArmAngle);
    ctx.fillStyle = '#ff69b4';
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-7, 0, 14, 30, 7);
    ctx.fill();
    ctx.stroke();
    
    // 手的位置（握锤柄的位置）
    const handX = 0;
    const handY = 35;
    
    // 移动到手的末端
    ctx.translate(handX, handY);
    
    // 根据攻击状态旋转锤子
    let hammerAngle = 0;
    if (player.attackType === 'air' && player.isAttacking) {
        hammerAngle = -Math.PI/2;
    } else if (player.attackType === 'ground' && player.isAttacking) {
        hammerAngle = Math.PI/3;
    }
    ctx.rotate(hammerAngle);
    
    // 绘制锤柄（手在锤柄中间位置）
    ctx.fillStyle = '#8b4513';
    // 锤柄从手的位置向下延伸，手在锤柄中部
    ctx.fillRect(-4, -15, 8, 45);
    
    // 绘制锤头（在锤柄顶部）
    ctx.fillStyle = isFever ? scenes[currentScene].themeColor : '#ff006e';
    // 锤头在锤柄顶端（-15位置向上）
    ctx.fillRect(-20, -35, 40, 20);
    
    // 锤头高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(-18, -33, 36, 6);
    
    // 锤头边框
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-20, -35, 40, 20);
    
    // 锤柄顶部装饰（与锤头连接处）
    ctx.fillStyle = '#654321';
    ctx.fillRect(-5, -15, 10, 3);
    
    ctx.restore();
}

function draw() {
    const scene = scenes[currentScene];
    
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, scene.bgColors[0]);
    grad.addColorStop(0.6, scene.bgColors[1]);
    grad.addColorStop(1, scene.bgColors[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    bgLayers.forEach(bg => {
        if(bg.type === 'mountain') {
            ctx.fillStyle = bg.color;
            ctx.beginPath();
            ctx.moveTo(bg.x, bg.y + bg.height);
            ctx.lineTo(bg.x + bg.width * 0.2, bg.y);
            ctx.lineTo(bg.x + bg.width * 0.5, bg.y + 80);
            ctx.lineTo(bg.x + bg.width * 0.8, bg.y + 20);
            ctx.lineTo(bg.x + bg.width, bg.y + bg.height);
            ctx.fill();
        } else if(bg.type === 'torii') {
            ctx.fillStyle = bg.color;
            ctx.fillRect(bg.x + 30, bg.y, 15, bg.height);
            ctx.fillRect(bg.x + bg.width - 45, bg.y, 15, bg.height);
            ctx.fillRect(bg.x - 10, bg.y, bg.width + 20, 18);
            ctx.fillRect(bg.x + 10, bg.y + 30, bg.width - 20, 12);
            ctx.fillStyle = '#000';
            ctx.fillRect(bg.x + bg.width/2 - 20, bg.y + 50, 40, 50);
        } else if(bg.type === 'note') {
            ctx.save();
            ctx.translate(bg.x, bg.y);
            ctx.rotate(bg.rotation);
            ctx.fillStyle = bg.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, bg.size, bg.size * 0.6, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(bg.size * 0.8, -5);
            ctx.lineTo(bg.size * 0.8, -bg.size * 1.2);
            ctx.lineWidth = 4;
            ctx.strokeStyle = bg.color;
            ctx.stroke();
            ctx.restore();
        }
    });
    
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    
    ctx.strokeStyle = isFever ? scene.themeColor : scene.groundColor;
    ctx.lineWidth = 5;
    ctx.shadowBlur = 20;
    ctx.shadowColor = isFever ? scene.themeColor : scene.groundColor;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - GROUND_HEIGHT);
    ctx.lineTo(canvas.width, canvas.height - GROUND_HEIGHT);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = isFever ? scene.gridColor.replace('0.3', '0.5') : scene.gridColor;
    ctx.lineWidth = 2;
    const gridOffset = (frame * gameSpeed * 0.8) % 50;
    ctx.beginPath();
    for(let i = -50; i < canvas.width; i += 50) {
        let x = i - gridOffset;
        ctx.moveTo(x, canvas.height - GROUND_HEIGHT);
        ctx.lineTo(x - 30, canvas.height);
    }
    ctx.stroke();
    
    slashEffects.forEach(s => {
        ctx.save();
        ctx.globalAlpha = s.life;
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        
        const gradient = ctx.createLinearGradient(-50, 0, 50, 0);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, s.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-60, 0);
        ctx.lineTo(60, 0);
        ctx.stroke();
        
        ctx.strokeStyle = s.secondaryColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-50, -10);
        ctx.lineTo(50, 10);
        ctx.stroke();
        
        ctx.restore();
    });
    
    shockwaves.forEach(s => {
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
        ctx.stroke();
        ctx.restore();
    });
    
    enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x + e.width/2, e.y + e.height/2);
        ctx.rotate(e.rotation);
        ctx.scale(e.scale, e.scale);
        
        if(e.inRange && !e.hit) {
            ctx.strokeStyle = e.type === 'air' ? '#00d9ff' : '#ff006e';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, 50, frame * 0.1, frame * 0.1 + Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = e.type === 'air' ? 'rgba(0,217,255,0.3)' : 'rgba(255,0,110,0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, 40, 0, Math.PI * 2);
            ctx.fill();
        }
        
        if(e.type === 'ground') {
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.ellipse(0, 10, 28, 22, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-12, -12, 10, 22, -0.2, 0, Math.PI*2);
            ctx.ellipse(12, -12, 10, 22, 0.2, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-10, 5, 5, 0, Math.PI*2);
            ctx.arc(10, 5, 5, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-18, 12, 6, 0, Math.PI*2);
            ctx.arc(18, 12, 6, 0, Math.PI*2);
            ctx.fill();
        } else {
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.moveTo(-25, 0);
            ctx.quadraticCurveTo(0, -25, 25, 0);
            ctx.quadraticCurveTo(0, 15, -25, 0);
            ctx.fill();
            ctx.fillStyle = scene.accentColor;
            const wingFlap = Math.sin(frame * 0.3 + e.floatOffset) * 10;
            ctx.beginPath();
            ctx.ellipse(-20, -5 + wingFlap, 15, 10, -0.3, 0, Math.PI*2);
            ctx.ellipse(20, -5 - wingFlap, 15, 10, 0.3, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-8, -2, 6, 0, Math.PI*2);
            ctx.arc(8, -2, 6, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-8, -2, 3, 0, Math.PI*2);
            ctx.arc(8, -2, 3, 0, Math.PI*2);
            ctx.fill();
        }
        
        ctx.restore();
    });
    
    drawPlayer();
    
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    if(isFever) {
        ctx.fillStyle = scene.themeColor + '26';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const gradient = ctx.createRadialGradient(
            canvas.width/2, canvas.height/2, 100,
            canvas.width/2, canvas.height/2, canvas.width
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, scene.themeColor + '4D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function updateUI() {
    document.getElementById('score').textContent = score.toLocaleString();
    const comboBox = document.getElementById('comboBox');
    const comboNum = document.getElementById('comboNum');
    if(combo > 0) {
        comboBox.classList.add('show');
        comboNum.textContent = combo;
        if(combo > 30) comboNum.style.color = scenes[currentScene].themeColor;
        else if(combo > 15) comboNum.style.color = '#ffdd00';
        else comboNum.style.color = scenes[currentScene].accentColor;
    } else {
        comboBox.classList.remove('show');
    }
    document.getElementById('feverFill').style.width = (fever / 200 * 100) + '%';
    
    const feverText = document.getElementById('feverText');
    if(isFever) {
        feverText.style.color = scenes[currentScene].themeColor;
        feverText.style.textShadow = `0 0 20px ${scenes[currentScene].themeColor}, 0 0 40px ${scenes[currentScene].themeColor}`;
    } else {
        feverText.style.color = '#fff';
        feverText.style.textShadow = '0 0 10px rgba(0,0,0,0.9), 0 0 20px currentColor';
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function showMainMenu() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('attackButtons').style.display = 'none';
    gameState = 'menu';
}

function showSceneSelect() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('sceneSelect').classList.remove('hidden');
    document.getElementById('attackButtons').style.display = 'none';
}

function selectScene(scene) {
    setTheme(scene);
    initAudio();
    startGame();
}

function startGame() {
    gameState = 'playing';
    score = 0;
    combo = 0;
    maxCombo = 0;
    fever = 0;
    isFever = false;
    gameSpeed = 2.5;
    frame = 0;
    timeRemaining = GAME_DURATION;
    feverCount = 0;
    enemiesHit = 0;
    totalEnemies = 0;
    attackCooldown = 0;
    
    player.y = canvas.height - GROUND_HEIGHT - player.height;
    player.vy = 0;
    player.grounded = true;
    player.isAttacking = false;
    player.attackType = null;
    
    enemies = [];
    particles = [];
    shockwaves = [];
    slashEffects = [];
    initBackground();
    
    document.getElementById('timerDisplay').textContent = '03:00';
    document.getElementById('timerDisplay').classList.remove('warning');
    document.getElementById('attackButtons').style.display = 'flex';
    
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    if(musicEnabled) startBackgroundMusic();
    
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    updateUI();
}

function restartGame() {
    showSceneSelect();
    document.getElementById('resultScreen').classList.add('hidden');
}

function backToMenu() {
    showMainMenu();
    document.getElementById('resultScreen').classList.add('hidden');
}

document.addEventListener('keydown', (e) => {
    if(gameState !== 'playing') return;
    if(e.code === 'KeyA' || e.code === 'ArrowLeft' || e.code === 'Space') {
        attackAir();
        document.getElementById('btnAir').style.transform = 'scale(0.92)';
        setTimeout(() => {
            document.getElementById('btnAir').style.transform = '';
        }, 100);
    }
    if(e.code === 'KeyD' || e.code === 'ArrowRight') {
        attackGround();
        document.getElementById('btnGround').style.transform = 'scale(0.92)';
        setTimeout(() => {
            document.getElementById('btnGround').style.transform = '';
        }, 100);
    }
});

setTheme('candy');
loadFaceImage().then(() => {
    gameLoop();
});
