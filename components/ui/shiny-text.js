/**
 * ShinyText Component (Vanilla JS)
 * Adapts React motion animation logic to vanilla JS.
 */
export default class ShinyText {
    constructor(element, options = {}) {
        this.element = element;

        // Default options
        this.options = {
            speed: 2,
            color: '#b5b5b5',
            shineColor: '#ffffff',
            spread: 120,
            yoyo: false,
            pauseOnHover: false,
            direction: 'left',
            delay: 0,
            disabled: false,
            ...options
        };

        // State
        this.isPaused = false;
        this.progress = 0; // 0 to 100
        this.elapsed = 0;
        this.lastTime = null;
        this.direction = this.options.direction === 'left' ? 1 : -1;
        this.animationId = null;

        this.init();
    }

    init() {
        this.element.classList.add('shiny-text');
        this.applyGradient();

        // Event listeners
        if (this.options.pauseOnHover) {
            this.element.addEventListener('mouseenter', () => this.isPaused = true);
            this.element.addEventListener('mouseleave', () => this.isPaused = false);
        }

        // Start loop
        this.startAnimation();
    }

    applyGradient() {
        const { spread, color, shineColor } = this.options;
        // linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)
        this.element.style.backgroundImage = `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`;
    }

    startAnimation() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    animate(time) {
        if (this.options.disabled) {
            this.lastTime = null;
            this.animationId = requestAnimationFrame(this.animate.bind(this));
            return;
        }

        if (this.isPaused) {
            this.lastTime = null;
            this.animationId = requestAnimationFrame(this.animate.bind(this));
            return;
        }

        if (this.lastTime === null) {
            this.lastTime = time;
            this.animationId = requestAnimationFrame(this.animate.bind(this));
            return;
        }

        const deltaTime = (time - this.lastTime) / 1000; // seconds
        this.lastTime = time;
        this.elapsed += deltaTime;

        const { speed, delay, yoyo } = this.options;
        const animationDuration = speed; // speed is in seconds
        const delayDuration = delay;

        let p = 0; // progress 0 to 100

        if (yoyo) {
            const cycleDuration = animationDuration + delayDuration;
            const fullCycle = cycleDuration * 2;
            const cycleTime = this.elapsed % fullCycle;

            if (cycleTime < animationDuration) {
                // Forward: 0 -> 100
                const rawP = (cycleTime / animationDuration) * 100;
                p = this.direction === 1 ? rawP : 100 - rawP;
            } else if (cycleTime < cycleDuration) {
                // Delay at end
                p = this.direction === 1 ? 100 : 0;
            } else if (cycleTime < cycleDuration + animationDuration) {
                // Reverse: 100 -> 0
                const reverseTime = cycleTime - cycleDuration;
                const rawP = 100 - (reverseTime / animationDuration) * 100;
                p = this.direction === 1 ? rawP : 100 - rawP;
            } else {
                // Delay at start
                p = this.direction === 1 ? 0 : 100;
            }
        } else {
            const cycleDuration = animationDuration + delayDuration;
            const cycleTime = this.elapsed % cycleDuration;

            if (cycleTime < animationDuration) {
                // Animation: 0 -> 100
                const rawP = (cycleTime / animationDuration) * 100;
                p = this.direction === 1 ? rawP : 100 - rawP;
            } else {
                // Delay: hold at end
                p = this.direction === 1 ? 100 : 0;
            }
        }

        this.progress = p;
        this.updateBackgroundPosition();

        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }

    updateBackgroundPosition() {
        // Transform: p=0 -> 150% (shine off right), p=100 -> -50% (shine off left)
        // 150 - p * 2
        // User logic: const backgroundPosition = useTransform(progress, p => `${150 - p * 2}% center`);
        const pos = 150 - (this.progress * 2);
        this.element.style.backgroundPosition = `${pos}% center`;
    }
}
