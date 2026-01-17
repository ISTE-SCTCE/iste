/**
 * Bubble Menu - Vanilla JS Port
 * Handles the mobile bubble menu logic.
 */
export default class BubbleMenu {
    constructor(options = {}) {
        this.options = {
            menuBg: 'rgba(255, 255, 255, 0.03)',
            menuContentColor: '#fff',
            animationDuration: 0.4, // Reduced from 0.5
            staggerDelay: 0.06, // Reduced from 0.1
            items: [], // { label, href, rotation, hoverStyles }
            logoSrc: '../IMAGES/isteofficiallogo.png',
            ...options
        };

        this.isOpen = false;
        this.init();
    }

    init() {
        // 1. Create Markup
        this.createMarkup();

        // 2. Select Elements
        this.container = document.querySelector('.bubble-menu');
        this.toggleBtn = this.container.querySelector('.toggle-bubble');
        this.overlay = document.querySelector('.bubble-menu-overlay');
        this.bubbles = Array.from(this.overlay.querySelectorAll('.pill-link'));
        this.labels = Array.from(this.overlay.querySelectorAll('.pill-label'));
        this.menuLines = this.toggleBtn.querySelectorAll('.menu-line');

        // 3. Events
        this.toggleBtn.addEventListener('click', () => this.toggle());

        // 4. Handle Existing Mobile Menu Conflict
        const oldToggle = document.querySelector('.glass-nav .menu-toggle');
        if (oldToggle) oldToggle.style.display = 'none'; // Hide old toggle

        // 5. Scroll Handling with requestAnimationFrame optimization
        this.lastScrollTop = 0;
        this.scrollThreshold = 50;
        this.ticking = false;

        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });
    }

    handleScroll() {
        if (this.isOpen) return; // Don't hide if menu is open

        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll < 0) return; // Ignore negative scrolling (iOS)

        if (Math.abs(currentScroll - this.lastScrollTop) < 10) return; // Small threshold to avoid jitter

        if (currentScroll > this.lastScrollTop && currentScroll > this.scrollThreshold) {
            // Scrolling Down -> Hide
            this.container.classList.add('hidden');
        } else if (currentScroll < this.lastScrollTop) {
            // Scrolling Up -> Show
            this.container.classList.remove('hidden');
        }

        this.lastScrollTop = currentScroll;
    }

    createMarkup() {
        // Don't duplicate if already exists
        if (document.querySelector('.bubble-menu')) return;

        const { items, logoSrc } = this.options;

        // Generate Items HTML
        const itemsHtml = items.map((item, i) => `
            <li class="pill-col">
                <a href="${item.href}" class="pill-link" style="background: ${item.bgColor || 'rgba(255,255,255,0.05)'}; color: ${item.textColor || '#fff'}">
                    <span class="pill-label">${item.label}</span>
                </a>
            </li>
        `).join('');

        const markup = `
            <nav class="bubble-menu" aria-label="Mobile Navigation">
                <div class="bubble logo-bubble">
                    <img src="${logoSrc}" alt="Logo" class="bubble-logo">
                </div>
                <button type="button" class="bubble toggle-bubble" aria-label="Toggle menu">
                    <span class="menu-line"></span>
                    <span class="menu-line short"></span>
                </button>
            </nav>

            <div class="bubble-menu-overlay">
                <div class="bubble-menu-items">
                    <ul class="pill-list">
                        ${itemsHtml}
                    </ul>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', markup);
    }

    toggle() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.open();
        } else {
            this.close();
        }
    }

    open() {
        // Toggle Button Animation
        gsap.to(this.menuLines[0], { y: 4, rotation: 45, duration: 0.3 });
        gsap.to(this.menuLines[1], { y: -4, rotation: -45, duration: 0.3 });

        // Show Overlay
        this.overlay.classList.add('active');

        // Animate Bubbles
        gsap.killTweensOf(this.bubbles);
        gsap.killTweensOf(this.labels);

        // Reset
        gsap.set(this.bubbles, { scale: 0, transformOrigin: '50% 50%' });
        gsap.set(this.labels, { y: 24, autoAlpha: 0 });

        // Stagger In
        this.bubbles.forEach((bubble, i) => {
            const delay = i * this.options.staggerDelay;

            // Force3D for smoother animation
            gsap.to(bubble, {
                scale: 1,
                duration: this.options.animationDuration,
                ease: 'back.out(1.2)',
                delay: delay,
                force3D: true
            });

            gsap.to(this.labels[i], {
                y: 0,
                autoAlpha: 1,
                duration: this.options.animationDuration,
                ease: 'power3.out',
                delay: delay + 0.05,
                force3D: true
            });
        });

        // Disable body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        // Toggle Button Animation Reset
        gsap.to(this.menuLines[0], { y: 0, rotation: 0, duration: 0.3 });
        gsap.to(this.menuLines[1], { y: 0, rotation: 0, duration: 0.3 });

        // Animate Out
        gsap.to(this.labels, {
            y: 24,
            autoAlpha: 0,
            duration: 0.15,
            ease: 'power3.in',
            force3D: true
        });

        gsap.to(this.bubbles, {
            scale: 0,
            duration: 0.2,
            ease: 'power3.in',
            force3D: true,
            onComplete: () => {
                this.overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}
