        // 内联的CSS动画样式
        var style = document.createElement('style');
        style.textContent = `
            @keyframes ribbonFlow {
                0% { transform: translateX(-100%); opacity: 0; }
                10% { opacity: 0.8; }
                90% { opacity: 0.8; }
                100% { transform: translateX(200%); opacity: 0; }
            }
            @keyframes starTwinkle {
                0%, 100% { 
                    opacity: 0.6; 
                    transform: scale(1) rotate(0deg);
                }
                50% { 
                    opacity: 1; 
                    transform: scale(1.2) rotate(180deg);
                }
            }
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(clamp(15px, 3vw, 30px));
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        document.addEventListener('DOMContentLoaded', function() {
            const banner = document.querySelector('.national-celebration');
            const stars = document.querySelectorAll('.decorative-star');
            const ribbons = document.querySelectorAll('.ribbon');
            
            function handleResize() {
                const width = window.innerWidth;
                if (width < 480) {
                    banner.style.aspectRatio = '16/8';
                } else if (width < 768) {
                    banner.style.aspectRatio = '16/7';
                } else {
                    banner.style.aspectRatio = '16/6';
                }
            }
            
            window.addEventListener('resize', handleResize);
            handleResize();
            
            function createFirework(x, y) {
                const firework = document.createElement('div');
                firework.style.position = 'fixed';
                firework.style.left = x + 'px';
                firework.style.top = y + 'px';
                firework.style.width = 'clamp(4px, 0.6vw, 6px)';
                firework.style.height = 'clamp(4px, 0.6vw, 6px)';
                firework.style.background = 'radial-gradient(circle, #ffd700, #ff6b35, #de2910)';
                firework.style.borderRadius = '50%';
                firework.style.pointerEvents = 'none';
                firework.style.zIndex = '1000';
                firework.style.boxShadow = '0 0 clamp(10px, 2vw, 20px) #ffd700, 0 0 clamp(20px, 4vw, 40px) #ff6b35';
                
                document.body.appendChild(firework);
                
                const explode = () => {
                    firework.style.transition = 'all 0.6s ease-out';
                    firework.style.transform = 'scale(15)';
                    firework.style.opacity = '0';
                    
                    setTimeout(() => {
                        if (firework.parentNode) {
                            firework.parentNode.removeChild(firework);
                        }
                    }, 600);
                };
                
                setTimeout(explode, 100);
            }
            
            ribbons.forEach(ribbon => {
                const randomSpeed = 6 + Math.random() * 4;
                ribbon.style.animationDuration = randomSpeed + 's';
            });
            
            if (window.innerWidth > 768) {
                setInterval(() => {
                    const randomX = Math.random() * window.innerWidth;
                    const randomY = Math.random() * window.innerHeight / 2;
                    createFirework(randomX, randomY);
                }, 3000);
            }
        });