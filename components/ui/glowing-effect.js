import { animate } from "motion";

export class GlowingEffect {
    /**
     * @param {HTMLElement} element - The DOM element to mount the effect into
     * @param {Object} options - Configuration options
     * @param {number} [options.blur=0] - Blur radius in pixels
     * @param {number} [options.inactiveZone=0.7] - Zone where the glow is inactive (0-1)
     * @param {number} [options.proximity=0] - Proximity in pixels to trigger the glow
     * @param {number} [options.spread=20] - Spread of the glow
     * @param {string} [options.variant="default"] - "default" or "white"
     * @param {boolean} [options.glow=false] - Whether the glow is active
     * @param {string} [options.className=""] - Additional classes
     * @param {number} [options.movementDuration=0.5] - Duration of the movement animation
     * @param {number} [options.borderWidth=1] - Width of the border
     * @param {boolean} [options.disabled=true] - Whether the effect is disabled
     */
    constructor(element, options = {}) {
        if (!element) {
            console.error("GlowingEffect: No element provided.");
            return;
        }

        this.element = element;
        this.options = {
            blur: 0,
            inactiveZone: 0.7,
            proximity: 0,
            spread: 20,
            variant: "default",
            glow: false,
            className: "",
            movementDuration: 0.5,
            borderWidth: 1,
            disabled: true,
            ...options,
        };

        this.lastPosition = { x: 0, y: 0 };
        this.animationFrameId = 0;
        this.container = null;
        this.rect = null;
        this.isVisible = false;
        this.activeAnimation = null;

        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateRect();
    }

    render() {
        this.element.innerHTML = "";
        this.element.classList.add("glowing-effect-wrapper");

        // 1. Create the Border Div
        const borderDiv = document.createElement("div");
        borderDiv.className = `pointer-events-none absolute -inset-px hidden rounded-inherit border opacity-0 transition-opacity`;

        if (this.options.glow) borderDiv.classList.add("opacity-100");
        if (this.options.variant === "white") borderDiv.classList.add("border-white");
        if (this.options.disabled) borderDiv.classList.add("!block");

        // 2. Create the Container Div
        const containerDiv = document.createElement("div");
        this.container = containerDiv;
        containerDiv.className = `pointer-events-none absolute inset-0 rounded-inherit opacity-100 transition-opacity ${this.options.className || ""}`;

        if (this.options.glow) containerDiv.classList.add("opacity-100");
        if (this.options.blur > 0) containerDiv.classList.add("blur-[var(--blur)]");
        if (this.options.disabled) containerDiv.classList.add("!hidden");

        // Set CSS Properties
        this.updateStyles();

        // 3. Create the Glow Child Div
        const glowDiv = document.createElement("div");
        glowDiv.className = "glow rounded-inherit";

        containerDiv.appendChild(glowDiv);
        this.element.appendChild(borderDiv);
        this.element.appendChild(containerDiv);
    }

    updateStyles() {
        if (!this.container) return;

        const { blur, spread, variant, borderWidth } = this.options;
        const repeatingConicGradientTimes = 5;
        const gradient =
            variant === "white"
                ? `repeating-conic-gradient(
            from 236.84deg at 50% 50%,
            var(--black),
            var(--black) calc(25% / ${repeatingConicGradientTimes})
          )`
                : `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
          radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
          radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), 
          radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
          repeating-conic-gradient(
            from 236.84deg at 50% 50%,
            #dd7bbb 0%,
            #d79f1e calc(25% / ${repeatingConicGradientTimes}),
            #5a922c calc(50% / ${repeatingConicGradientTimes}), 
            #4c7894 calc(75% / ${repeatingConicGradientTimes}),
            #dd7bbb calc(100% / ${repeatingConicGradientTimes})
          )`;

        this.container.style.setProperty("--blur", `${blur}px`);
        this.container.style.setProperty("--spread", spread);
        this.container.style.setProperty("--start", "0");
        this.container.style.setProperty("--active", "0");
        this.container.style.setProperty("--glowingeffect-border-width", `${borderWidth}px`);
        this.container.style.setProperty("--repeating-conic-gradient-times", String(repeatingConicGradientTimes));
        this.container.style.setProperty("--gradient", gradient);
    }

    updateRect() {
        if (this.container) {
            this.rect = this.container.getBoundingClientRect();
        }
    }

    handleMove(e) {
        if (!this.container || !this.isVisible || !this.rect) return;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        this.animationFrameId = requestAnimationFrame(() => {
            const mouseX = e?.x ?? this.lastPosition.x;
            const mouseY = e?.y ?? this.lastPosition.y;

            if (e) {
                this.lastPosition = { x: mouseX, y: mouseY };
            }

            const { left, top, width, height } = this.rect;
            const center = [left + width * 0.5, top + height * 0.5];
            const distanceFromCenter = Math.hypot(
                mouseX - center[0],
                mouseY - center[1]
            );
            const inactiveRadius = 0.5 * Math.min(width, height) * this.options.inactiveZone;

            if (distanceFromCenter < inactiveRadius) {
                this.container.style.setProperty("--active", "0");
                return;
            }

            const proximity = this.options.proximity;
            const isActive =
                mouseX > left - proximity &&
                mouseX < left + width + proximity &&
                mouseY > top - proximity &&
                mouseY < top + height + proximity;

            this.container.style.setProperty("--active", isActive ? "1" : "0");

            if (!isActive) return;

            const currentAngle =
                parseFloat(this.container.style.getPropertyValue("--start")) || 0;

            const targetAngle =
                (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
                Math.PI +
                90;

            const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
            const newAngle = currentAngle + angleDiff;

            if (this.activeAnimation) {
                this.activeAnimation.stop();
            }

            // Optimize for speed if movementDuration is low
            if (this.options.movementDuration <= 0.1) {
                this.container.style.setProperty("--start", String(newAngle));
            } else {
                this.activeAnimation = animate(currentAngle, newAngle, {
                    duration: this.options.movementDuration,
                    ease: "linear",
                    onUpdate: (value) => {
                        this.container.style.setProperty("--start", String(value));
                    },
                });
            }
        });
    }

    bindEvents() {
        if (this.options.disabled) return;

        this.handleResize = () => this.updateRect();
        this.handleScroll = () => {
            this.updateRect();
            this.handleMove();
        };
        this.handlePointerMove = (e) => this.handleMove(e);

        // Use IntersectionObserver to only update when visible
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                if (this.isVisible) {
                    this.updateRect();
                }
            });
        }, { threshold: 0 });

        this.observer.observe(this.element);

        window.addEventListener("resize", this.handleResize, { passive: true });
        window.addEventListener("scroll", this.handleScroll, { passive: true });
        document.body.addEventListener("pointermove", this.handlePointerMove, { passive: true });
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.observer) {
            this.observer.disconnect();
        }
        window.removeEventListener("resize", this.handleResize);
        window.removeEventListener("scroll", this.handleScroll);
        document.body.removeEventListener("pointermove", this.handlePointerMove);
    }
}
