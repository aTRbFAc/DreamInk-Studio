// 等待页面完全加载后再执行
window.addEventListener('load', function () {
  // 获取元素
  const scene1 = document.getElementById('scene1');
  const scene2 = document.getElementById('scene2');
  const startBtn = document.getElementById('start-btn');
  const scoreDisplay = document.getElementById('score');
  const laohei2 = document.getElementById('laohei2');
  const bgm = document.getElementById('bgm');
  const dpbltSound = document.getElementById('dpblt');

  // 设置音量
  dpbltSound.volume = 1.0;

  // 当前状态
  let currentScene = 1;
  let score = 0;
  let laoheiJumping = false;
  let laoheiJumpOffset = 0;
  let laoheiJumpSpeed = 4;
  const laoheiJumpGravity = 0.2;
  let laoheiJumpPhase = "falling";

  const bzyInstances = [];

  // ========== 修复：确保按钮存在再绑定事件 ==========
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      console.log("开始按钮被点击！");
      currentScene = 2;
      scene1.style.display = 'none';
      scene2.style.display = 'block';

      // 尝试播放背景音乐（需用户交互）
      bgm.play().catch(e => {
        console.warn("音频播放被阻止，请手动点一下屏幕", e);
      });
    });
  }

  // ========== 游戏主场景点击事件 ==========
  scene2.addEventListener('click', (e) => {
    const laoheiRect = laohei2.getBoundingClientRect();
    
    // 1. 计算图片的中间 1/3 区域范围
    const heightStep = laoheiRect.height / 3;
    const middleSectionTop = laoheiRect.top + heightStep;       
    const middleSectionBottom = laoheiRect.top + (heightStep * 2); 

    // 2. 判断点击是否在图片范围内 且 在垂直方向的中间 1/3 区域内
    if (
      e.clientX >= laoheiRect.left &&
      e.clientX <= laoheiRect.right &&
      e.clientY >= middleSectionTop &&
      e.clientY <= middleSectionBottom
    ) {
      const scene2Rect = scene2.getBoundingClientRect();
  
      const relativeX = e.clientX - scene2Rect.left - 30;
      const relativeY = e.clientY - scene2Rect.top - 30;

      // 创建巴掌
      const bzy = document.createElement('img');
      bzy.src = './image/bzy.png';
      bzy.classList.add('bzy');
      bzy.style.zIndex = '100'; 
      bzy.style.position = 'absolute';

      scene2.appendChild(bzy); 

      const angle = Math.random() * 180 - 90;
      
      // 使用计算后的相对坐标
      bzy.style.left = `${relativeX}px`;
      bzy.style.top = `${relativeY}px`;
      bzy.style.transform = `rotate(${angle}deg)`;

      // 存储实例
      const instance = {
        element: bzy,
        x: relativeX, // 存储相对坐标
        y: relativeY,
        angle: angle,
        jumpOffset: 0,
        jumpSpeed: 4,
        jumpPhase: 'falling',
        jumping: true
      };
      bzyInstances.push(instance);

      // 播放音效
      dpbltSound.currentTime = 0;
      dpbltSound.play();

      // 更新分数
      score++;
      scoreDisplay.textContent = `Score: ${score}`;

      // 触发跳跃（如果没在跳）
      if (!laoheiJumping) {
        laoheiJumping = true;
        laoheiJumpPhase = 'falling';
        laoheiJumpSpeed = 4;
        bzyInstances.forEach(b => { b.jumping = true; });
      }
    }
  });


  // ========== 主动画循环 ==========
  function gameLoop() {
    // 老黑跳跃
    if (laoheiJumping) {
      if (laoheiJumpPhase === 'falling') {
        laoheiJumpOffset += laoheiJumpSpeed;
        laoheiJumpSpeed -= laoheiJumpGravity;
        if (laoheiJumpSpeed <= 0) {
          laoheiJumpPhase = 'rising';
        }
      } else if (laoheiJumpPhase === 'rising') {
        laoheiJumpSpeed += laoheiJumpGravity;
        laoheiJumpOffset -= laoheiJumpSpeed;
        if (laoheiJumpOffset <= 0) {
          laoheiJumpOffset = 0;
          laoheiJumping = false;
          laoheiJumpPhase = 'falling';
          laoheiJumpSpeed = 4;
        }
      }

      laohei2.style.transform = `translate(-50%, -50%) translateY(${-laoheiJumpOffset}px)`;
    } else {
      // 如果没有在跳跃，也要保持居中状态，否则跳完会复位到左上角
      laohei2.style.transform = `translate(-50%, -50%)`;
    }

    // 巴掌动画
    bzyInstances.forEach(b => {
      if (b.jumping) {
        if (b.jumpPhase === 'falling') {
          b.jumpOffset += b.jumpSpeed;
          b.jumpSpeed -= laoheiJumpGravity;
          if (b.jumpSpeed <= 0) {
            b.jumpPhase = 'rising';
          }
        } else {
          b.jumpSpeed += laoheiJumpGravity;
          b.jumpOffset -= b.jumpSpeed;
          if (b.jumpOffset <= 0) {
            b.jumpOffset = 0;
            b.jumping = false;
          }
        }
        b.element.style.transform = `rotate(${b.angle}deg) translateY(${-b.jumpOffset}px)`;
      }
    });

    requestAnimationFrame(gameLoop);
  }


  gameLoop();

  // 允许用户点击任意位置恢复音频（以防被拦截）
  document.body.addEventListener('touchstart', () => {
    if (bgm.paused) bgm.play().catch(() => {});
  }, { once: false });
});
