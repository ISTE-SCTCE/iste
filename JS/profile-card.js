
/* Helper Functions */
const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v, precision = 3) => parseFloat(v.toFixed(precision));
const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

const ANIMATION_CONFIG = {
    INITIAL_DURATION: 1200,
    INITIAL_X_OFFSET: 70,
    INITIAL_Y_OFFSET: 60,
    DEVICE_BETA_OFFSET: 20,
    ENTER_TRANSITION_MS: 180
};

class TiltEngine {
    constructor(element, enableTilt = true) {
        this.wrap = element;
        this.shell = element.querySelector('.pc-card-shell');
        this.enableTilt = enableTilt;

        this.rafId = null;
        this.running = false;
        this.lastTs = 0;

        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;

        this.initialUntil = 0;
        this.DEFAULT_TAU = 0.14;
        this.INITIAL_TAU = 0.6;
    }

    setVarsFromXY(x, y) {
        if (!this.shell || !this.wrap) return;

        const width = this.shell.clientWidth || 1;
        const height = this.shell.clientHeight || 1;

        const percentX = clamp((100 / width) * x);
        const percentY = clamp((100 / height) * y);

        const centerX = percentX - 50;
        const centerY = percentY - 50;

        const properties = {
            '--pointer-x': `${percentX}%`,
            '--pointer-y': `${percentY}%`,
            '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
            '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
            '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
            '--pointer-from-top': `${percentY / 100}`,
            '--pointer-from-left': `${percentX / 100}`,
            '--rotate-x': `${round(-(centerX / 5))}deg`,
            '--rotate-y': `${round(centerY / 4)}deg`
        };

        for (const [k, v] of Object.entries(properties)) {
            this.wrap.style.setProperty(k, v);
        }
    }

    step(ts) {
        if (!this.running) return;
        if (this.lastTs === 0) this.lastTs = ts;
        const dt = (ts - this.lastTs) / 1000;
        this.lastTs = ts;

        const tau = ts < this.initialUntil ? this.INITIAL_TAU : this.DEFAULT_TAU;
        const k = 1 - Math.exp(-dt / tau);

        this.currentX += (this.targetX - this.currentX) * k;
        this.currentY += (this.targetY - this.currentY) * k;

        this.setVarsFromXY(this.currentX, this.currentY);

        const stillFar = Math.abs(this.targetX - this.currentX) > 0.05 || Math.abs(this.targetY - this.currentY) > 0.05;

        if (stillFar || document.hasFocus()) {
            this.rafId = requestAnimationFrame(this.step.bind(this));
        } else {
            this.running = false;
            this.lastTs = 0;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTs = 0;
        this.rafId = requestAnimationFrame(this.step.bind(this));
    }

    setImmediate(x, y) {
        this.currentX = x;
        this.currentY = y;
        this.setVarsFromXY(this.currentX, this.currentY);
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.start();
    }

    toCenter() {
        if (!this.shell) return;
        this.setTarget(this.shell.clientWidth / 2, this.shell.clientHeight / 2);
    }

    beginInitial(durationMs) {
        this.initialUntil = performance.now() + durationMs;
        this.start();
    }

    getCurrent() {
        return { x: this.currentX, y: this.currentY, tx: this.targetX, ty: this.targetY };
    }

    cancel() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = null;
        this.running = false;
        this.lastTs = 0;
    }
}

function initProfileCard(cardWrapper) {
    const shell = cardWrapper.querySelector('.pc-card-shell');
    if (!shell) return;

    // Config
    const enableTilt = true;
    const mobileTiltSensitivity = 5;
    const enableMobileTilt = false; // Kept false as per default in React code

    const tiltEngine = new TiltEngine(cardWrapper, enableTilt);

    // Initial Animation
    const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
    tiltEngine.setImmediate(initialX, initialY);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);

    let enterTimer = null;
    let leaveRaf = null;

    const getOffsets = (evt, el) => {
        const rect = el.getBoundingClientRect();
        return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    };

    const handlePointerMove = (event) => {
        if (!enableTilt || event.pointerType === 'touch') return;
        const { x, y } = getOffsets(event, shell);
        tiltEngine.setTarget(x, y);
    };

    const handlePointerEnter = (event) => {
        if (!enableTilt || event.pointerType === 'touch') return;
        shell.classList.add('active');
        shell.classList.add('entering');

        if (enterTimer) clearTimeout(enterTimer);
        enterTimer = setTimeout(() => {
            shell.classList.remove('entering');
        }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);

        const { x, y } = getOffsets(event, shell);
        tiltEngine.setTarget(x, y);
    };

    const handlePointerLeave = (event) => {
        if (!enableTilt || (event && event.pointerType === 'touch')) return;
        tiltEngine.toCenter();

        const checkSettle = () => {
            const { x, y, tx, ty } = tiltEngine.getCurrent();
            const settled = Math.hypot(tx - x, ty - y) < 0.6;
            if (settled) {
                shell.classList.remove('active');
                leaveRaf = null;
            } else {
                leaveRaf = requestAnimationFrame(checkSettle);
            }
        };
        if (leaveRaf) cancelAnimationFrame(leaveRaf);
        leaveRaf = requestAnimationFrame(checkSettle);
    };

    const handleDeviceOrientation = (event) => {
        if (!shell) return;
        const { beta, gamma } = event;
        if (beta == null || gamma == null) return;

        const centerX = shell.clientWidth / 2;
        const centerY = shell.clientHeight / 2;
        const x = clamp(centerX + gamma * mobileTiltSensitivity, 0, shell.clientWidth);
        const y = clamp(
            centerY + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
            0,
            shell.clientHeight
        );

        tiltEngine.setTarget(x, y);
    };

    shell.addEventListener('pointerenter', handlePointerEnter);
    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', handlePointerLeave);

    // Only attaching click listener if mobile tilt is enabled and https
    if (enableMobileTilt && location.protocol === 'https:') {
        shell.addEventListener('click', () => {
            const anyMotion = window.DeviceMotionEvent;
            if (anyMotion && typeof anyMotion.requestPermission === 'function') {
                anyMotion.requestPermission()
                    .then(state => {
                        if (state === 'granted') {
                            window.addEventListener('deviceorientation', handleDeviceOrientation);
                        }
                    })
                    .catch(console.error);
            } else {
                window.addEventListener('deviceorientation', handleDeviceOrientation);
            }
        });
    }

    // Handle Contact Button Click if present
    const contactBtn = cardWrapper.querySelector('.pc-contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            // Define your contact click action here, maybe passed via dataset
            console.log('Contact clicked for', cardWrapper);
            e.stopPropagation(); // Prevent card tilt maybe? or let it be
        });
    }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.pc-card-wrapper');
    cards.forEach(card => initProfileCard(card));
});
