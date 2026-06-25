document.addEventListener('DOMContentLoaded', () => {
    const charCards = document.querySelectorAll('.char-card');
    const confirmBtn = document.getElementById('confirm-char-btn');
    const nameInput = document.getElementById('player-name-input');
    const errorMsg = document.getElementById('error-msg');
    const avatarUpload = document.getElementById('avatar-upload');
    const previewContainer = document.getElementById('preview-container');
    const avatarPreview = document.getElementById('avatar-preview');

    // 获取登录界面的按钮
    const startBtn = document.getElementById('start-btn');
    const agreementCheck = document.getElementById('agreement-check');

    let selectedGender = null;
    let selectedCharImg = '';
    let customAvatarBase64 = null;

    // 辅助函数：隐藏所有屏幕
    function hideAllScreens() {
        document.getElementById('login-screen')?.classList.add('hidden');
        document.getElementById('character-select-screen')?.classList.add('hidden');
        document.getElementById('dialogue-screen')?.classList.add('hidden');
        document.getElementById('game-play-area')?.classList.add('hidden');
    }

    // 【核心逻辑】初始化检查
    function initGameFlow() {
        // 1. 检查 URL 参数
        const urlParams = new URLSearchParams(window.location.search);
        const isFromBattle = urlParams.get('from_battle') === 'win';

        // 2. 如果是从战斗胜利回来的，立即清理 URL 参数，防止刷新后重复触发
        if (isFromBattle) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const savedPlayer = localStorage.getItem('escape_game_player');
        const gameProgress = localStorage.getItem('game_progress');

        // 3. 判断逻辑
        if (isFromBattle && savedPlayer && gameProgress === 'boss_defeated') {
            console.log("检测到胜利返回，跳过登录，直接进入游戏");
            showGamePlayArea(JSON.parse(savedPlayer));
        } else {
            console.log("正常启动，显示登录界面");
            hideAllScreens();
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) loginScreen.classList.remove('hidden');
        }
        if (avatarUpload) {
            avatarUpload.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        customAvatarBase64 = event.target.result;
                        // 显示预览
                        avatarPreview.src = customAvatarBase64;
                        previewContainer.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // 执行初始化
    initGameFlow();
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    customAvatarBase64 = event.target.result;
                    // 显示预览
                    if (avatarPreview) avatarPreview.src = customAvatarBase64;
                    if (previewContainer) previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 【关键】监听登录按钮点击（处理正常登录流程）
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (agreementCheck && !agreementCheck.checked) {
                alert("请先同意用户协议！");
                return;
            }

            // 点击登录后，执行正常的进入游戏逻辑
            handleGameStartAfterLogin();
        });
    }

    // 处理登录后的逻辑分支
    function handleGameStartAfterLogin() {
        const savedPlayer = localStorage.getItem('escape_game_player');
        const gameProgress = localStorage.getItem('game_progress');

        if (savedPlayer) {
            const playerData = JSON.parse(savedPlayer);
            if (gameProgress === 'boss_defeated') {
                showGamePlayArea(playerData);
            } else {
                launchStory(playerData);
            }
        } else {
            // 无存档，去选人
            hideAllScreens();
            const selectScreen = document.getElementById('character-select-screen');
            if (selectScreen) selectScreen.classList.remove('hidden');
        }
    }

    // 角色选择交互
    charCards.forEach(card => {
        card.addEventListener('click', () => {
            charCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedGender = card.dataset.gender;
            selectedCharImg = card.querySelector('img').src;
        });
    });

    confirmBtn.addEventListener('click', () => {
        const playerName = nameInput.value.trim();
        if (!selectedGender && !customAvatarBase64) {
            errorMsg.textContent = "请先选择一个角色或上传自定义头像！";
            return;
        }
        if (!playerName) {
            errorMsg.textContent = "你几班的？叫啥名！！！";
            return;
        }
        const finalAvatar = customAvatarBase64 || selectedCharImg;

        const playerData = {
            name: playerName,
            gender: selectedGender || 'custom',
            avatar: finalAvatar
        };

        localStorage.setItem('escape_game_player', JSON.stringify(playerData));
        launchStory(playerData);
    });

    /**
     * 启动剧情流程
     */
    function launchStory(playerData) {
        hideAllScreens();
        const dialogueScreen = document.getElementById('dialogue-screen');
        if (dialogueScreen) dialogueScreen.classList.remove('hidden');

        if (typeof DialogueSystem !== 'undefined') {
            DialogueSystem.start({
                data: window.DIALOGUE_PLAY1,   // ✅ 关键
                background: '../images/bg/bg1.png',
                player: playerData,
                onComplete: () => {
                    sessionStorage.setItem('game_source', 'dialogue_complete');
                    window.location.href = 'Play/Airplane_Battle/Airplane_Battle.html';
                }
            });
        }
    }


    /**
     * 直接显示 #game-play-area
     */
    function showGamePlayArea(playerData) {
        hideAllScreens();

        const gameContainer = document.getElementById('game-container');
        const gamePlayArea = document.getElementById('game-play-area');

        if (gameContainer) {
            gameContainer.style.display = 'flex';
            gameContainer.style.width = '100%';
            gameContainer.style.height = '100vh';
        }

        if (gamePlayArea) {
            gamePlayArea.classList.remove('hidden');
            initGameLogic(playerData);
        }
    }

    function initGameLogic(playerData) {
        const infoSpan = document.getElementById('display-player-info');
        console.log("主游戏逻辑已启动", playerData);
    }
});