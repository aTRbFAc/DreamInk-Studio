document.addEventListener('DOMContentLoaded', () => {
    // --- 元素获取 ---
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalSpan = document.querySelector('.close-modal');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const contactDevBtn = document.getElementById('contact-dev-btn');
    const submitContentBtn = document.getElementById('submit-content-btn');
    // 只选择未锁定的章节
    const chapterCards = document.querySelectorAll('.chapter-card:not(.locked)');

    // --- 模态窗控制 ---
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });
    }

    if (closeModalSpan && settingsModal) {
        closeModalSpan.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }

    if (settingsModal) {
        window.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    // --- 按钮功能实现 ---
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('确定要清除所有本地存档数据吗？此操作不可恢复！')) {
                localStorage.clear();
                alert('数据已清除，页面将刷新。');
                location.reload();
            }
        });
    }

    if (contactDevBtn) {
        contactDevBtn.addEventListener('click', () => {
            window.location.href = 'https://atrbfac.top';
        });
    }

    if (submitContentBtn) {
        submitContentBtn.addEventListener('click', () => {
            alert('请联系：\n微信：aTRbFAc\nQQ：1848548731\n邮箱：<atrbfac@163.com>');
        });
    }

    // --- 章节跳转 ---
    chapterCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-target');
            if (targetPage) {
                // 可以在这里添加过渡动画
                console.log(`正在跳转到: ${targetPage}`);
                window.location.href = targetPage;
            }
        });
    });
});