
        // ================= 配置与初始化 =================

        // 定义 Boss 不同血量阶段的图片
        const BOSS_IMAGES = {
            stage1: new Image(), // > 200 HP
            stage2: new Image(), // 100 < HP <= 200
            stage3: new Image()  // HP <= 100
        };
        BOSS_IMAGES.stage1.src = "../../images/char/char_laohei1.jpg";
        BOSS_IMAGES.stage2.src = "../../images/char/char_laohei2.jpg";
        BOSS_IMAGES.stage3.src = "../../images/char/char_laohei3.jpg";

        const canvas = document.getElementById("game");
        const ctx = canvas.getContext("2d");

        // 设置画布大小
        function resizeCanvas() {
            // 保持比例或全屏，这里简单设置为固定逻辑分辨率，CSS控制显示大小
            canvas.width = 375;
            canvas.height = 667;
        }
        resizeCanvas();

        let gameFrame = 0;
        let touchX = canvas.width / 2;
        let touchY = canvas.height * 0.8;

        // 获取玩家数据并确定玩家图片
        let playerImgSrc = "../../images/char/char_male.jpg"; // 默认男性
        try {
            const savedPlayer = localStorage.getItem('escape_game_player');
            if (savedPlayer) {
                const pData = JSON.parse(savedPlayer);
                
                if (pData.avatar && pData.avatar.startsWith('data:image')) {
                    playerImgSrc = pData.avatar;
                    console.log("加载自定义玩家头像");
                } else if (pData.gender === 'female') {
                    playerImgSrc = "../../images/char/char_female.jpg";
                } else {
                    playerImgSrc = "../../images/char/char_male.jpg";
                }
                console.log("加载玩家角色:", pData.gender, playerImgSrc);
            }
        } catch (e) {
            console.warn("未找到玩家存档，使用默认男性角色", e);
        }

        // 游戏状态标记
        let isGameOver = false;
        let isGameWon = false;
        let hasTriggeredEndCallback = false; // 防止重复触发回调

        // 玩家对象
        const player = {
            img: new Image(),
            w: 60, h: 80, x: 0, y: 0,
            hp: 100, maxHp: 100,
            atk: 1,
            fireInterval: 12,
            invincible: false,
            invTime: 0
        };
        player.img.src = playerImgSrc;

        // Boss对象
        const boss = {
            img: BOSS_IMAGES.stage1,
            w: 80, h: 90,
            x: canvas.width / 2 - 40,
            y: 60,
            hp: 600, maxHp: 600,
            speed: 2
        };

        let bullets = [];
        let bossBullets = [];
        let items = [];

        // ================= 输入处理 =================
        canvas.addEventListener("touchmove", e => {
            if (isGameOver) return;
            e.preventDefault(); // 防止滚动
            const rect = canvas.getBoundingClientRect();
            // 计算缩放比例，确保触摸位置准确
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            touchX = (e.touches[0].clientX - rect.left) * scaleX;
            touchY = (e.touches[0].clientY - rect.top) * scaleY;
        }, { passive: false });
        canvas.addEventListener("mousemove", e => {
            if (isGameOver) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            touchX = (e.clientX - rect.left) * scaleX;
            touchY = (e.clientY - rect.top) * scaleY;
        });

        // ================= 游戏逻辑函数 =================

        function spawnItem() {
            if (Math.random() < 0.002) {
                items.push({
                    x: Math.random() * (canvas.width - 40),
                    y: -20,
                    type: Math.random() > 0.5 ? "atk" : "shield",
                    size: 30, speed: 2
                });
            }
        }

        function fireBullet() {
            if (gameFrame % player.fireInterval === 0) {
                bullets.push({
                    x: player.x + player.w / 2 - 2,
                    y: player.y - 10,
                    w: 4, h: 12,
                    speed: 6, atk: player.atk
                });
            }
        }

        function bossFire() {
            if (gameFrame % 50 === 0) {
                bossBullets.push({
                    x: boss.x + boss.w / 2 - 2,
                    y: boss.y + boss.h,
                    w: 4, h: 12, speed: 4
                });
            }
        }

        function bossMove() {
            const bossCenter = boss.x + boss.w / 2;
            const playerCenter = player.x + player.w / 2;

            if (bossCenter < playerCenter - 5) {
                boss.x += boss.speed;
            } else if (bossCenter > playerCenter + 5) {
                boss.x -= boss.speed;
            }

            if (boss.x < 0) boss.x = 0;
            if (boss.x + boss.w > canvas.width) boss.x = canvas.width - boss.w;
        }

        // 检查碰撞辅助函数
        function checkCollision(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.w &&
                rect1.x + rect1.w > rect2.x &&
                rect1.y < rect2.y + rect2.h &&
                rect1.y + rect1.h > rect2.y
            );
        }

        // 触发游戏结束回调
        function triggerGameEnd(win) {
            if (hasTriggeredEndCallback) return;
            hasTriggeredEndCallback = true;

            // 如果全局定义了 onGameEnd 且来源正确，则执行
            if (typeof window.onGameEnd === 'function') {
                console.log(win ? "游戏胜利！" : "游戏失败！");
                window.onGameEnd(win);
            } else {
                // 调试用：如果没有定义回调，直接在画布显示结果
                console.warn("未检测到 window.onGameEnd 回调，请检查跳转来源逻辑。");
            }
        }

        // ================= 主循环 =================
        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!isGameOver) {
                gameFrame++;

                // 1. 玩家移动
                player.x = touchX - player.w / 2;
                player.y = touchY - player.h / 2;
                // 边界限制
                player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
                player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

                // 2. Boss 行为
                bossMove();
                bossFire();

                // 3. 玩家行为
                fireBullet();
                spawnItem();

                // 4. 更新子弹位置
                for (let i = bullets.length - 1; i >= 0; i--) {
                    let b = bullets[i];
                    b.y -= b.speed;
                    if (b.y < -15) bullets.splice(i, 1);
                }

                for (let i = bossBullets.length - 1; i >= 0; i--) {
                    let b = bossBullets[i];
                    b.y += b.speed;
                    if (b.y > canvas.height + 15) bossBullets.splice(i, 1);
                }

                // 5. 更新道具
                for (let i = items.length - 1; i >= 0; i--) {
                    let o = items[i];
                    o.y += o.speed;
                    if (o.y > canvas.height) items.splice(i, 1);
                }

                // 6. 碰撞检测：玩家子弹 -> Boss
                for (let i = bullets.length - 1; i >= 0; i--) {
                    let b = bullets[i];
                    // 简单的矩形碰撞
                    if (checkCollision(b, boss)) {
                        boss.hp -= b.atk;
                        bullets.splice(i, 1);

                        // 【关键修改】检测 Boss 是否死亡
                        if (boss.hp <= 0) {
                            boss.hp = 0;
                            isGameOver = true;
                            isGameWon = true;
                            triggerGameEnd(true); // 触发胜利回调
                        }
                    }
                }

                // 7. 碰撞检测：Boss子弹 -> 玩家
                for (let i = bossBullets.length - 1; i >= 0; i--) {
                    let b = bossBullets[i];
                    if (checkCollision(b, player) && !player.invincible) {
                        player.hp -= 5;
                        bossBullets.splice(i, 1);

                        if (player.hp <= 0) {
                            player.hp = 0;
                            isGameOver = true;
                            isGameWon = false;
                            triggerGameEnd(false); // 触发失败回调
                        }
                    }
                }

                // 8. 碰撞检测：玩家 -> 道具
                for (let i = items.length - 1; i >= 0; i--) {
                    let o = items[i];
                    // 圆形碰撞检测更自然
                    let cx = o.x + o.size / 2;
                    let cy = o.y + o.size / 2;
                    let px = player.x + player.w / 2;
                    let py = player.y + player.h / 2;
                    let d = Math.hypot(cx - px, cy - py);

                    if (d < (o.size / 2 + player.w / 2)) {
                        if (o.type === "atk") {
                            player.fireInterval = 6;
                            player.atk = 3;
                            setTimeout(() => {
                                player.fireInterval = 12;
                                player.atk = 1;
                            }, 5000);
                        } else {
                            player.invincible = true;
                            player.invTime = gameFrame + 15 * 60; // 假设60fps
                        }
                        items.splice(i, 1);
                    }
                }

                // 9. 无敌时间倒计时
                if (player.invincible && gameFrame > player.invTime) {
                    player.invincible = false;
                }

                // 10.Boss 形态切换逻辑
                if (boss.hp > 600) {
                    if (boss.img !== BOSS_IMAGES.stage1) boss.img = BOSS_IMAGES.stage1;
                } else if (boss.hp > 200) {
                    if (boss.img !== BOSS_IMAGES.stage2) boss.img = BOSS_IMAGES.stage2;
                } else {
                    if (boss.img !== BOSS_IMAGES.stage3) boss.img = BOSS_IMAGES.stage3;
                }
            }

            // ==================== 绘制 ====================

            // 绘制 Boss
            if (boss.hp > 0) {
                ctx.drawImage(boss.img, boss.x, boss.y, boss.w, boss.h);
            }

            // 绘制玩家
            ctx.globalAlpha = player.invincible ? 0.5 : 1.0; // 无敌时半透明
            ctx.drawImage(player.img, player.x, player.y, player.w, player.h);
            ctx.globalAlpha = 1.0;

            // 绘制子弹
            ctx.fillStyle = "#ffeb3b"; // 黄色子弹
            bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

            ctx.fillStyle = "#ff0000"; // 红色敌弹
            bossBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

            // 绘制道具
            items.forEach(o => {
                let color = o.type === "atk" ? "#ff4444" : "#44aaff";
                let text = o.type === "atk" ? "暴" : "御";
                ctx.beginPath();
                ctx.arc(o.x + o.size / 2, o.y + o.size / 2, o.size / 2, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = "#fff";
                ctx.font = "bold 16px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(text, o.x + o.size / 2, o.y + o.size / 2);
            });

            // 绘制血条
            // Boss 血条
            let bossBarW = 300;
            let bossHpW = Math.max(0, (boss.hp / boss.maxHp) * bossBarW);
            ctx.fillStyle = "#333";
            ctx.fillRect(canvas.width / 2 - bossBarW / 2, 20, bossBarW, 12);
            ctx.fillStyle = "#ff3333";
            ctx.fillRect(canvas.width / 2 - bossBarW / 2, 20, bossHpW, 12);
            // Boss 血条文字
            ctx.fillStyle = "#fff";
            ctx.font = "12px Arial";
            ctx.fillText(`BOSS HP: ${boss.hp}/${boss.maxHp}`, canvas.width / 2, 15);

            // 玩家血条
            let pBarW = 50;
            let pHpW = Math.max(0, (player.hp / player.maxHp) * pBarW);
            ctx.fillStyle = "#333";
            ctx.fillRect(player.x + player.w / 2 - pBarW / 2, player.y - 14, pBarW, 6);
            ctx.fillStyle = "#00ff00";
            ctx.fillRect(player.x + player.w / 2 - pBarW / 2, player.y - 14, pHpW, 6);

            // 防御状态提示
            if (player.invincible) {
                ctx.fillStyle = "#44aaff";
                ctx.font = "14px Arial";
                ctx.textAlign = "center";
                ctx.fillText("无敌中", player.x + player.w / 2, player.y - 22);
            }

            // 游戏结束画面
            if (isGameOver) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = isGameWon ? "#ffd700" : "#ff0000";
                ctx.font = "bold 40px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(isGameWon ? "胜利！" : "失败！", canvas.width / 2, canvas.height / 2 - 20);
            }

            requestAnimationFrame(loop);
        }

        // ================= 页面加载与回调绑定 =================

        document.addEventListener('DOMContentLoaded', () => {
            const source = sessionStorage.getItem('game_source');

            if (source === 'dialogue_complete') {
                console.log("检测到来自对话系统的跳转，启用胜负监听模式");

                window.onGameEnd = function (isWin) {
                    if (isWin) {
                        sessionStorage.removeItem('game_source');
                        localStorage.setItem('game_progress', 'boss_defeated');

                        console.log("游戏胜利！进度已保存，即将返回主界面...");

                        setTimeout(() => {
                            window.location.href = '../../index.html?from_battle=win';
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    }
                };
            } else {
                console.log("普通模式启动，无特殊跳转逻辑");
            }

            window.onload = loop;
        });