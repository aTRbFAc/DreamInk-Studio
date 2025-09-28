        var style = document.createElement('style');
        style.textContent = `
            @keyframes moonGlow {
                0% { 
                    box-shadow: 
                        0 0 clamp(30px, 6vw, 60px) rgba(255, 215, 0, 0.6),
                        0 0 clamp(60px, 12vw, 120px) rgba(255, 237, 78, 0.4);
                }
                100% { 
                    box-shadow: 
                        0 0 clamp(40px, 8vw, 80px) rgba(255, 215, 0, 0.8),
                        0 0 clamp(80px, 16vw, 160px) rgba(255, 237, 78, 0.6);
                }
            }
            @keyframes cloudFloat {
                0% { transform: translateX(0); opacity: 0; }
                10% { opacity: 0.3; }
                90% { opacity: 0.3; }
                100% { transform: translateX(calc(100vw + 200px)); opacity: 0; }
            }
            @keyframes starTwinkle {
                0%, 100% { 
                    opacity: 0.4; 
                    transform: scale(1) rotate(0deg);
                }
                50% { 
                    opacity: 1; 
                    transform: scale(1.3) rotate(180deg);
                }
            }
            @keyframes mooncakeBounce {
                0%, 100% { transform: translateX(-50%) translateY(0px); }
                50% { transform: translateX(-50%) translateY(-10px); }
            }
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(clamp(20px, 4vw, 40px));
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes lanternFloat {
                0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -150vh) scale(0.5);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        document.addEventListener('DOMContentLoaded', function() {
            const banner = document.querySelector('.mid-autumn-celebration');
            const stars = document.querySelectorAll('.star');
            const clouds = document.querySelectorAll('div[style*="background: rgba(255, 255, 255, 0.1)"]');
            const moon = document.querySelector('.moon-background');

            function handleResize() {
                const width = window.innerWidth;
                if (width < 480) {
                    banner.style.aspectRatio = '16/9';
                    if (moon) moon.style.display = 'none';
                } else if (width < 768) {
                    banner.style.aspectRatio = '16/8';
                    if (moon) moon.style.display = 'block';
                } else {
                    banner.style.aspectRatio = '16/7';
                    if (moon) moon.style.display = 'block';
                }
            }

            window.addEventListener('resize', handleResize);
            handleResize();

            function createLantern(x, y) {
                const lantern = document.createElement('div');
                lantern.innerHTML = '🏮';
                lantern.style.position = 'fixed';
                lantern.style.left = x + 'px';
                lantern.style.top = y + 'px';
                lantern.style.fontSize = 'clamp(24px, 5vw, 48px)';
                lantern.style.pointerEvents = 'none';
                lantern.style.zIndex = '1000';
                lantern.style.transform = 'translate(-50%, -50%)';
                lantern.style.animation = 'lanternFloat 3s ease-out forwards';

                document.body.appendChild(lantern);

                setTimeout(() => {
                    if (lantern.parentNode) {
                        lantern.parentNode.removeChild(lantern);
                    }
                }, 3000);
            }

            banner.addEventListener('click', function(e) {
                e.stopPropagation();
                createLantern(e.clientX, e.clientY);
            });

            var cloudElements = document.querySelectorAll('div[style*="background: rgba(255, 255, 255, 0.1)"]');
            cloudElements.forEach(cloud => {
                const randomSpeed = 15 + Math.random() * 10;
                cloud.style.animationDuration = randomSpeed + 's';
            });

            if (window.innerWidth > 768) {
                setInterval(() => {
                    const randomX = Math.random() * window.innerWidth;
                    const randomY = Math.random() * window.innerHeight / 3;
                    createLantern(randomX, randomY);
                }, 4000);
            }
        });