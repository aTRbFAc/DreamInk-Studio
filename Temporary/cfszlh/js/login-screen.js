document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const agreementCheck = document.getElementById('agreement-check');
    const loginScreen = document.getElementById('login-screen');
    const gameContainer = document.getElementById('game-container');
    const STORAGE_KEY = 'escape_shizhong_laohei_agreement';
    const bgVideo = document.getElementById('bg-video');

    // 检查URL参数，判断是否从战斗胜利返回
    const urlParams = new URLSearchParams(window.location.search);
    const fromBattle = urlParams.get('from_battle');

    // 1. 页面加载时检查本地存储
    const hasAgreed = localStorage.getItem(STORAGE_KEY);
    if (hasAgreed === 'true') {
        agreementCheck.checked = true;
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }

    // 如果是从战斗胜利返回，直接跳过登录界面
    if (fromBattle === 'win') {
        // 清除URL参数
        window.history.replaceState({}, document.title, window.location.pathname);

        // 暂停视频
        if (bgVideo) {
            bgVideo.pause();
            bgVideo.currentTime = 0;
        }

        // 直接显示游戏容器，隐藏登录界面
        loginScreen.style.display = 'none';
        gameContainer.style.display = 'flex';

        console.log("从战斗胜利返回，直接显示游戏区域");
        return; // 提前返回，不执行后续逻辑
    }

    // 2. 监听复选框变化
    agreementCheck.addEventListener('change', function () {
        if (this.checked) {
            startBtn.disabled = false;
            // 保存同意状态到本地存储
            localStorage.setItem(STORAGE_KEY, 'true');
        } else {
            startBtn.disabled = true;
            // 如果取消勾选，移除存储或设为false
            localStorage.removeItem(STORAGE_KEY);
        }
    });

    // 3. 监听按钮点击
    startBtn.addEventListener('click', function () {
        if (bgVideo) {
            bgVideo.pause();
            bgVideo.currentTime = 0;
        }
        // 淡出效果
        loginScreen.style.opacity = '0';

        // 等待过渡动画结束后隐藏登录层并显示游戏层
        setTimeout(() => {
            loginScreen.style.display = 'none';
            gameContainer.style.display = 'flex';

            // 这里可以触发游戏初始化函数
            console.log("游戏启动");
        }, 500);
    });
});