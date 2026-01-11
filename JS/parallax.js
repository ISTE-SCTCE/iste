document.addEventListener('DOMContentLoaded', function () {
    // Snow effect disabled - return early to prevent snow creation
    return;
    
    const spaceBg = document.querySelector('.space-background');
    const meteors = document.querySelector('.meteors');

    if (!spaceBg || !meteors) return;

    const foregroundSnow = document.createElement('div');
    foregroundSnow.className = 'foreground-snow';
    foregroundSnow.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        pointer-events: none;
        z-index: 5;
        overflow: hidden;
    `;
    document.body.appendChild(foregroundSnow);

    const style = document.createElement('style');
    style.textContent = `
        body > *:not(.space-background):not(.foreground-snow) {
            position: relative;
            z-index: 1;
        }
        
        .space-background {
            z-index: -10 !important;
        }
        
        .footer {
            position: relative;
            z-index: 10000 !important;
        }
        
        .snowflake {
            position: absolute;
            background: radial-gradient(circle, 
                rgba(255, 255, 255, 1) 0%, 
                rgba(255, 255, 255, 0.9) 40%,
                rgba(230, 240, 255, 0.6) 100%);
            border-radius: 50%;
            pointer-events: none;
            /* Background snow is blurred */
            filter: blur(2px);
            box-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
        }
        
        /* Foreground snow is clear/sharp */
        .snowflake.foreground {
            filter: blur(0.5px);
            opacity: 0.95;
            box-shadow: 0 0 5px rgba(255, 255, 255, 0.9);
        }
        
        .snowflake.type-1 {
            opacity: 0.9;
            filter: blur(1.5px);
        }
        
        .snowflake.type-2 {
            opacity: 0.7;
            filter: blur(2.5px);
        }
        
        .snowflake.type-3 {
            opacity: 0.5;
            filter: blur(3.5px);
        }
    `;
    document.head.appendChild(style);

    function createSnowflake(container, isForeground = false) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';

        if (isForeground) {
            snowflake.classList.add('foreground');
        } else {
            const type = Math.floor(Math.random() * 3) + 1;
            snowflake.classList.add(`type-${type}`);
        }

        let size = isForeground ? Math.random() * 3 + 3 : Math.random() * 2 + 1;

        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.top = `${Math.random() * -100}px`;

        const duration = isForeground ?
            (18 - size * 0.5) + Math.random() * 4 :
            (25 - size * 1.2) + Math.random() * 6;

        const drift = (Math.random() - 0.5) * 60;
        const sway = Math.sin(Math.random() * 10) * 40;

        const id = `snow${Date.now()}${Math.random()}`.replace(/\./g, '');
        const keyframes = `
            @keyframes ${id} {
                0% {
                    transform: translateY(0) translateX(0) rotate(0deg);
                }
                25% {
                    transform: translateY(27.5vh) translateX(${sway * 0.3}px) rotate(${Math.random() * 90}deg);
                }
                50% {
                    transform: translateY(55vh) translateX(${sway * 0.7}px) rotate(${Math.random() * 180}deg);
                }
                75% {
                    transform: translateY(82.5vh) translateX(${sway}px) rotate(${Math.random() * 270}deg);
                }
                100% {
                    transform: translateY(110vh) translateX(${drift}px) rotate(360deg);
                }
            }
        `;

        const styleEl = document.createElement('style');
        styleEl.textContent = keyframes;
        document.head.appendChild(styleEl);

        snowflake.style.animation = `${id} ${duration}s linear infinite`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;

        container.appendChild(snowflake);
    }

    function createSnowflakes() {
        meteors.innerHTML = '';
        foregroundSnow.innerHTML = '';

        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        const bgCount = isMobile ? 60 : 100;
        for (let i = 0; i < bgCount; i++) {
            createSnowflake(meteors, false);
        }

        const fgCount = isMobile ? 15 : 30;
        for (let i = 0; i < fgCount; i++) {
            createSnowflake(foregroundSnow, true);
        }
    }

    createSnowflakes();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(createSnowflakes, 300);
    });
});
