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
            
            banner.addEventListener('mousemove', function(e) {
                if (window.innerWidth > 768) {
                    const moveX = (e.clientX - window.innerWidth / 2) / 25;
                    const moveY = (e.clientY - window.innerHeight / 2) / 25;
                    
                    this.style.transform = `translateY(clamp(-3px, -0.3vw, -5px)) translateX(${moveX}px) translateY(${moveY}px) scale(1.01)`;
                    
                    stars.forEach(star => {
                        const speed = 0.02;
                        const x = (e.clientX - window.innerWidth / 2) * speed;
                        const y = (e.clientY - window.innerHeight / 2) * speed;
                        star.style.transform = `translate(${x}px, ${y}px)`;
                    });
                }
            });
            
            banner.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(clamp(-3px, -0.3vw, -5px)) scale(1.01)';
                stars.forEach(star => {
                    star.style.transform = 'translate(0, 0)';
                });
            });
            
            banner.addEventListener('click', function(e) {
                createFirework(e.clientX, e.clientY);
            });
            
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