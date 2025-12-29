(function() {
    // 注入弹窗样式
    const style = document.createElement('style');
    style.textContent = `
        .full-protocol-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 20px 0;
            overflow-y: auto;
            font-family: "Microsoft YaHei", Arial, sans-serif;
        }
        .full-modal-content {
            background-color: white;
            padding: 35px;
            border-radius: 8px;
            max-width: 700px;
            width: 95%;
            max-height: 90vh;
            overflow-y: auto;
            line-height: 1.7;
        }
        .full-modal-title {
            font-size: 1.4em;
            font-weight: bold;
            color: #2c3e50;
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3498db;
        }
        .full-modal-subtitle {
            font-size: 1.2em;
            font-weight: bold;
            color: #3498db;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .full-modal-section-title {
            font-size: 1.1em;
            font-weight: bold;
            color: #2c3e50;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        .full-modal-text {
            color: #333;
            margin-bottom: 12px;
            text-indent: 2em;
        }
        .full-modal-list {
            padding-left: 4em;
            margin-bottom: 15px;
        }
        .full-modal-list li {
            margin-bottom: 8px;
            color: #333;
        }
        .full-modal-btn-group {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .full-modal-btn {
            padding: 10px 25px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1em;
            transition: background-color 0.3s;
        }
        .full-modal-btn.confirm {
            background-color: #3498db;
            color: white;
        }
        .full-modal-btn.confirm:hover {
            background-color: #2980b9;
        }
        .full-modal-btn.cancel {
            background-color: #ecf0f1;
            color: #333;
        }
        .full-modal-btn.cancel:hover {
            background-color: #bdc3c7;
        }
        .full-modal-link {
            color: #3498db;
            text-decoration: none;
            font-weight: bold;
        }
        .full-modal-link:hover {
            text-decoration: underline;
        }
        .full-modal-contact {
            margin-top: 25px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #3498db;
        }
    `;
    document.head.appendChild(style);

    // 完整弹窗HTML（包含全部变更内容）
    const modalHTML = `
        <div class="full-protocol-modal">
            <div class="full-modal-content">
                <div class="full-modal-title">用户服务协议及隐私政策变更公告</div>
                
                <div class="full-modal-text">
                    尊敬的用户：为进一步保障您的合法权益，践行更严格的合规标准，文幻工作室（以下简称“我们”）根据《中华人民共和国个人信息保护法》《网络安全法》《民法典》等相关法律法规的最新要求，结合业务发展需要，对《用户服务协议》和《隐私政策》进行了全面修订优化。现将全部变更内容详细告知如下：
                </div>

                <div class="full-modal-subtitle">一、《用户服务协议》变更内容</div>

                <div class="full-modal-section-title">1. 新增合规条款模块</div>
                <ul class="full-modal-list">
                    <li>新增<strong>个人信息保护专条</strong>：明确个人信息处理遵循的法律依据，细化用户信息查询、更正、删除的申请流程及7个工作日响应时限。</li>
                    <li>新增<strong>未成年人保护专条</strong>：要求18周岁以下未成年人在监护人同意下使用服务，明确监护人的权利和工作室的保护义务。</li>
                    <li>新增<strong>争议解决专条</strong>：约定争议优先通过友好协商解决，协商不成由工作室所在地有管辖权的人民法院管辖。</li>
                </ul>

                <div class="full-modal-section-title">2. 完善账号管理规则</div>
                <ul class="full-modal-list">
                    <li>细化账号注销流程：明确用户可通过官方客服申请注销，工作室在7个工作日内完成处理。</li>
                    <li>补充账号注销后信息处理规则：账号注销后15个工作日内删除用户个人信息，法律法规另有规定的除外。</li>
                    <li>新增账号找回机制：明确账号找回的官方渠道及身份核验要求。</li>
                    <li>强化账号使用规范：明确账号仅限本人使用，禁止转让、出租、出借或出售。</li>
                </ul>

                <div class="full-modal-section-title">3. 优化服务变更与终止条款</div>
                <ul class="full-modal-list">
                    <li>明确服务重大变更的通知义务：提前30日通过App内推送、官网公告、邮件等方式通知用户。</li>
                    <li>新增服务终止的用户保障：服务终止前30日通知用户，并提供数据导出通道。</li>
                    <li>限定不可抗力范围：明确自然灾害、战争、政策调整、重大网络攻击等为不可抗力，排除自身技术故障等情形。</li>
                </ul>

                <div class="full-modal-section-title">4. 细化违规行为与处理标准</div>
                <ul class="full-modal-list">
                    <li>补充违规行为具体情形：明确恶意攻击系统、滥用权限、非法收集他人信息等5类违规行为。</li>
                    <li>建立分级处理机制：区分首次违规、多次违规、严重违规对应的不同处理措施（警告、封禁账号、依法追责）。</li>
                    <li>明确违规处理的执行权限：工作室有权根据违规情节采取相应措施，情节严重者依法追究法律责任。</li>
                </ul>

                <div class="full-modal-section-title">5. 平衡权责义务与协议修改规则</div>
                <ul class="full-modal-list">
                    <li>限定免责条款范围：明确仅对不可归责于工作室的情形免责，因工作室故意或重大过失导致的损失需承担责任。</li>
                    <li>规范协议修改流程：协议重大变更提前30日通知用户，用户不同意修改可停止使用服务并注销账号。</li>
                    <li>优化用户反馈响应时限：将常规响应时间从15个工作日调整为7个工作日，紧急事项24小时内响应。</li>
                </ul>

                <div class="full-modal-subtitle">二、《隐私政策》变更内容</div>

                <div class="full-modal-section-title">1. 新增信息共享与披露专条</div>
                <ul class="full-modal-list">
                    <li>明确个人信息共享的前提条件：仅限获得用户同意、法律法规要求、公共安全需要等情形。</li>
                    <li>强调不向第三方出售个人信息：明确禁止任何形式的个人信息售卖行为。</li>
                    <li>细化合作方信息披露要求：向合作方披露信息需进行匿名化、去标识化处理，且不得用于约定外用途。</li>
                </ul>

                <div class="full-modal-section-title">2. 完善信息存储相关条款</div>
                <ul class="full-modal-list">
                    <li>明确存储地点：用户个人信息仅存储在中国大陆境内，如需跨境存储将单独获得用户同意。</li>
                    <li>区分存储期限：根据信息类型约定不同留存时长，符合个人信息最小必要存储原则。</li>
                    <li>补充服务终止后信息处理：服务终止后按法律法规要求删除或匿名化处理用户信息。</li>
                </ul>

                <div class="full-modal-section-title">3. 扩充用户法定权利</div>
                <ul class="full-modal-list">
                    <li>新增<strong>信息副本获取权</strong>：用户可申请获取本人个人信息的副本。</li>
                    <li>新增<strong>投诉举报权</strong>：用户认为信息处理行为违规时，可向工作室投诉举报。</li>
                    <li>明确撤回授权后的处理：撤回授权后不再收集相应信息，不影响此前已进行的信息处理。</li>
                </ul>

                <div class="full-modal-section-title">4. 细化儿童隐私保护</div>
                <ul class="full-modal-list">
                    <li>明确14岁以下儿童信息收集规则：必须获得监护人明确同意方可收集。</li>
                    <li>新增监护人权利：监护人发现儿童信息被不当收集时，可申请删除相关信息。</li>
                    <li>强化未成年人保护措施：设置未成年人模式、限制使用时长等功能。</li>
                </ul>

                <div class="full-modal-section-title">5. 补充权限使用说明</div>
                <ul class="full-modal-list">
                    <li>自启动权限：仅用于推送服务通知、重要公告，用户可通过系统设置关闭。</li>
                    <li>设备传感器权限：仅用于实现特定服务功能（如游戏体感操作），用户可自主管理权限。</li>
                    <li>Cookie及同类技术：明确使用目的，用户可通过浏览器设置管理Cookie权限。</li>
                </ul>

                <div class="full-modal-section-title">6. 新增第三方服务条款</div>
                <ul class="full-modal-list">
                    <li>明确第三方服务责任界定：不对第三方网站、插件的信息安全承担责任。</li>
                    <li>提醒用户关注第三方政策：建议用户仔细阅读第三方服务的隐私政策。</li>
                </ul>

                <div class="full-modal-section-title">7. 优化信息保护措施</div>
                <ul class="full-modal-list">
                    <li>补充技术防护手段：采用加密技术存储和传输敏感个人信息。</li>
                    <li>完善内部管理机制：建立严格的数据访问权限控制和安全培训制度。</li>
                </ul>

                <div class="full-modal-section-title">8. 缩短响应时限</div>
                <ul class="full-modal-list">
                    <li>常规反馈响应时间：从15个工作日调整为7个工作日。</li>
                    <li>紧急事项响应：24小时内响应账号封禁、数据丢失等紧急问题。</li>
                </ul>

                <div class="full-modal-subtitle">三、生效时间及相关说明</div>
                <ul class="full-modal-list">
                    <li>1. 本次修订后的《用户服务协议》和《隐私政策》将于<strong>2026年1月1日</strong>正式生效。</li>
                    <li>2. 您可以通过我们的<a href="/agreement.html" target="_blank" class="full-modal-link">官方网站</a>、应用内公告等渠道查阅修订后的完整协议文本。</li>
                    <li>3. 自生效之日起，您使用我们的服务即视为已充分阅读、理解并同意接受修订后的协议内容。若您不同意变更后的协议，可停止使用相关服务并注销账号。</li>
                </ul>

                <div class="full-modal-text">
                    我们始终致力于为您提供更安全、更优质的服务，本次协议修订旨在进一步规范服务流程、保障您的合法权益。如您对变更内容有任何疑问或建议，欢迎通过以下方式联系我们：
                </div>

                <div class="full-modal-contact">
                    <p><strong>邮箱：</strong> aTRbFAc@163.com</p>
                    <p><strong>QQ：</strong> 1848548731</p>
                    <p><strong>微信：</strong> aTRbFAc</p>
                    <p><strong>QQ交流群：</strong> 981642484</p>
                </div>

                <div class="full-modal-text" style="text-align: right; margin-top: 20px;">
                    文幻工作室<br>
                    2025年12月29日
                </div>

                <div class="full-modal-btn-group">
                    <button class="full-modal-btn cancel" id="fullModalCancel">暂不查看</button>
                    <button class="full-modal-btn confirm" id="fullModalConfirm">同意并继续</button>
                </div>
            </div>
        </div>
    `;

    // 插入弹窗到页面
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    // 关闭弹窗并记录状态
    function closeFullModal() {
        document.querySelector('.full-protocol-modal').style.display = 'none';
        // 记录关闭状态，30天内不再弹出
        localStorage.setItem('fullProtocolModalClosed', Date.now().toString());
    }

    // 检查是否需要弹出（30天内仅弹一次）
    const lastClosed = localStorage.getItem('fullProtocolModalClosed');
    if (lastClosed) {
        const diff = Date.now() - parseInt(lastClosed);
        if (diff < 30 * 24 * 60 * 60 * 1000) {
            closeFullModal();
        }
    }

    // 绑定关闭事件
    document.getElementById('fullModalConfirm').addEventListener('click', closeFullModal);
    document.getElementById('fullModalCancel').addEventListener('click', closeFullModal);
})();
