const DialogueSystem = (function () {
    // 内部状态
    let dialogueData = [];
    let currentIndex = 0;
    let playerData = null;
    let onCompleteCallback = null;

    // DOM 元素缓存
    const elements = {
        screen: document.getElementById('dialogue-screen'),
        leftCharImg: document.getElementById('left-char-img'),
        rightCharImg: document.getElementById('right-char-img'),
        leftContainer: document.querySelector('.left-char'),
        rightContainer: document.querySelector('.right-char'),
        speakerName: document.getElementById('speaker-name'),
        text: document.getElementById('dialogue-text'),
        box: document.querySelector('.dialogue-box')
    };

    /**
     * 初始化并启动对话
     * @param {Object} config - 配置对象
     */
    async function start(config) {
        if (!config || (!config.data && !config.jsonPath)) {
            console.error("DialogueSystem: data or jsonPath is required");
            return;
        }

        playerData = config.player || {};
        onCompleteCallback = config.onComplete || null;
        currentIndex = 0;

        setBackground(config.background);

        if (elements.screen) {
            elements.screen.classList.remove('hidden');
            elements.screen.style.opacity = 1;
        }

        if (config.data) {
            dialogueData = config.data;

            if (elements.box) {
                elements.box.onclick = nextDialogue;
            }
            renderDialogue();
            return;
        }
    }


    function setBackground(bg) {
        if (!elements.screen) return;

        if (bg) {
            if (bg.includes('.') || bg.includes('/')) {
                elements.screen.style.backgroundImage = `url('${bg}')`;
                elements.screen.style.backgroundSize = 'cover';
                elements.screen.style.backgroundPosition = 'center';
                elements.screen.style.backgroundColor = '#000';
            } else {
                elements.screen.style.backgroundImage = 'none';
                elements.screen.style.backgroundColor = bg;
            }
        } else {
            elements.screen.style.background = 'radial-gradient(circle at center, #2b2b2b 0%, #000000 100%)';
        }
    }

    function renderDialogue() {
        if (currentIndex >= dialogueData.length) {
            endDialogue();
            return;
        }

        const line = dialogueData[currentIndex];

        // 1. 更新名字
        if (elements.speakerName) {
            elements.speakerName.textContent = (line.speaker === "玩家") ? (playerData.name || "玩家") : line.speaker;
        }

        // 2. 更新文本
        if (elements.text) {
            elements.text.textContent = line.text;
            elements.text.style.opacity = 0;
            setTimeout(() => {
                elements.text.style.transition = 'opacity 0.3s';
                elements.text.style.opacity = 1;
            }, 50);
        }

        // 3. 更新立绘
        updateCharacters(line);
    }

    function updateCharacters(line) {
        const { leftContainer, rightContainer, leftCharImg, rightCharImg } = elements;
        if (!leftContainer || !rightContainer) return;

        let showLeft = false;
        let showRight = false;
        let dimLeft = false;
        let dimRight = false;

        // --- 左侧人物逻辑 (NPC) ---
        if (line.leftChar) {
            leftCharImg.src = line.leftChar;
            showLeft = true;
            // 如果焦点不在左边，则变暗
            if (line.focus !== 'left') dimLeft = true;
        } else {
            // 如果JSON没配左图，通常隐藏，除非有特殊需求
            showLeft = false;
        }

        // --- 右侧人物逻辑 (玩家优先) ---
        if (line.speaker === "玩家") {
            showRight = true;

            // 【关键修改】优先使用自定义头像 (Base64)，否则根据性别选择默认图
            if (playerData.avatar && playerData.avatar.startsWith('data:image')) {
                rightCharImg.src = playerData.avatar;
            } else {
                const genderSuffix = (playerData.gender === 'female') ? 'female' : 'male';
                const playerAvatarPath = `./images/char/char_${genderSuffix}.jpg`;
                rightCharImg.src = playerAvatarPath;
            }

            // 玩家说话时，右侧通常高亮，左侧如果有NPC则变暗
            dimRight = false;
            if (showLeft && line.focus !== 'left') {
                dimLeft = true;
            }

        } else {
            // 如果不是玩家说话，则按照 JSON 配置显示右侧 NPC
            if (line.rightChar) {
                rightCharImg.src = line.rightChar;
                showRight = true;
                if (line.focus !== 'right') dimRight = true;
            } else {
                showRight = false;
            }
        }

        // 应用显示/隐藏
        leftContainer.style.display = showLeft ? 'block' : 'none';
        rightContainer.style.display = showRight ? 'block' : 'none';

        // 应用变暗效果
        if (showLeft) {
            leftContainer.classList.toggle('dimmed', dimLeft);
        }
        if (showRight) {
            rightContainer.classList.toggle('dimmed', dimRight);
        }
    }

    function nextDialogue() {
        currentIndex++;
        renderDialogue();
    }

    function endDialogue() {
        if (elements.screen) {
            elements.screen.style.transition = 'opacity 0.5s';
            elements.screen.style.opacity = 0;

            setTimeout(() => {
                elements.screen.classList.add('hidden');
                if (typeof onCompleteCallback === 'function') {
                    onCompleteCallback();
                }
            }, 500);
        } else if (typeof onCompleteCallback === 'function') {
            onCompleteCallback();
        }
    }

    return {
        start: start
    };
})();

window.DialogueSystem = DialogueSystem;