// Cloud-like color leaking transition effect
class CloudTransition {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
        `;
        document.body.appendChild(this.canvas);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.leakPoints = [];
        this.isAnimating = false;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Create random leak points with varying properties
    createLeakPoints(count = 8) {
        this.leakPoints = [];
        for (let i = 0; i < count; i++) {
            this.leakPoints.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 0,
                maxRadius: Math.random() * 300 + 200,
                speed: Math.random() * 0.3 + 0.5,
                delay: Math.random() * 200
            });
        }
    }

    // Animate the cloud-like expansion - revealing new page underneath
    animate(onComplete) {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.canvas.style.opacity = '1';
        this.createLeakPoints(12);

        const startTime = Date.now();
        const duration = 1000; // 1 second

        const draw = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Start with full black screen
            this.ctx.fillStyle = 'rgb(0, 0, 0)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Cut out transparent holes that expand (revealing content underneath)
            this.ctx.globalCompositeOperation = 'destination-out';

            this.leakPoints.forEach(point => {
                const pointProgress = Math.max(0, (elapsed - point.delay) / duration);

                if (pointProgress > 0) {
                    const eased = 1 - Math.pow(1 - pointProgress, 3);
                    point.radius = point.maxRadius * eased;

                    // Create expanding transparent circles (holes in the black)
                    const gradient = this.ctx.createRadialGradient(
                        point.x, point.y, 0,
                        point.x, point.y, point.radius
                    );

                    // Fully transparent in center (reveals background)
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
                    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 1)');
                    // Soft feathered edges
                    gradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.5)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });

            // Reset composite operation
            this.ctx.globalCompositeOperation = 'source-over';

            if (progress < 1) {
                requestAnimationFrame(draw);
            } else {
                // Animation complete - stay visible during page load
                this.isAnimating = false;
                if (onComplete) onComplete();
            }
        };

        draw();
    }

    // Hide the overlay smoothly
    hide() {
        this.canvas.style.transition = 'opacity 0.5s ease';
        this.canvas.style.opacity = '0';
        setTimeout(() => {
            this.canvas.style.transition = '';
        }, 500);
    }

    // Trigger the transition
    start(callback) {
        this.animate(callback);
    }
}

// Export for use
window.CloudTransition = CloudTransition;
