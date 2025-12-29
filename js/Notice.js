(function() {
    // 弹窗样式
    const style = document.createElement('style');
    style.textContent = `
        .protocol-update-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.6);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: "Microsoft YaHei", Arial, sans-serif;
        }
        .modal-content {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .modal-text {
            line-height: 1.6;
            color: #333;
            margin-bottom: 15px;
        }
        .modal-btn-group {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 25px;
        }
        .modal-btn {
            padding: 8px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1em;
            transition: background-color 0.3s;
        }
        .modal-btn.confirm {
            background-color: #3498db;
            color: white;
        }
        .modal-btn.confirm:hover {
            background-color: #2980b9;
        }
        .modal-btn.cancel {
            background-color: #ecf0f1;
            color: #333;
        }
        .modal-btn.cancel:hover {
            background-color: #bdc3c7;
        }
        .modal-link {
            color: #3498db;
            text-decoration: none;
            font-weight: bold;
        }
        .modal-link:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);

    // 弹窗HTML结构
    const modalHTML = `
        <div class="protocol-update-modal">
            <div class="modal-content">
                <div class="modal-title">用户协议及隐私政策更新通知</div>
                <div class="modal-text">
                    尊敬的用户：我们已根据最新法律法规对《用户服务协议》和《隐私政策》进行了修订，主要优化了用户权益保障、个人信息保护等相关条款。
                </div>
                <div class="modal-text">
                    请您仔细阅读<a href="/agreement.html" target="_blank" class="modal-link">《用户服务协议》</a>和<a href="/privacy.html" target="_blank" class="modal-link">《隐私政策》</a>的变更内容。
                </div>
                <div class="modal-text">
                    点击"同意"即表示您已阅读并接受修订后的协议内容。
                </div>
                <div class="modal-btn-group">
                    <button class="modal-btn cancel" id="modalCancel">暂不查看</button>
                    <button class="modal-btn confirm" id="modalConfirm">同意并继续</button>
                </div>
            </div>
        </div>
    `;

    // 插入弹窗
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    // 关闭弹窗
    function closeModal() {
        document.querySelector('.protocol-update-modal').style.display = 'none';
        // 记录用户已关闭弹窗，7天内不再弹出
        localStorage.setItem('protocolModalClosed', Date.now().toString());
    }

    // 检查是否需要弹出（7天内只弹一次）
    const lastClosed = localStorage.getItem('protocolModalClosed');
    if (lastClosed) {
        const diff = Date.now() - parseInt(lastClosed);
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            closeModal();
        }
    }

    // 绑定事件
    document.getElementById('modalConfirm').addEventListener('click', closeModal);
    document.getElementById('modalCancel').addEventListener('click', closeModal);
})();
