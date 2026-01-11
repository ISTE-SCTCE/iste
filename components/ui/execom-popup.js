/**
 * ExecomPopup Component
 * A reusable, vanilla JS popup with rich animations and configuration.
 */

export default class ExecomPopup {
    constructor(config = {}) {
        this.config = {
            delay: 2000, // Default delay in ms
            heroImage: '../IMAGES/EXECOM%20call.png',
            title: 'Join the<br>Executive Committee',
            subtext: 'Be a part of a dynamic team driving innovation and excellence.',
            ctaLink: 'execom-call.html',
            ctaText: 'Apply Now',
            ...config
        };

        this.elements = {
            overlay: null,
            closeBtn: null,
            checkbox: null,
            ctaBtn: null
        };

        this.storageKey = 'iste_execom_popup_dismissed';
        this.sessionKey = 'iste_execom_popup_seen_session';

        // Bind methods
        this.close = this.close.bind(this);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    init() {
        // Check if permanently dismissed
        // Check if permanently dismissed (DISABLED FOR DEBUGGING)
        // if (localStorage.getItem(this.storageKey) === 'true') {
        //     console.log('ExecomPopup: Previously dismissed.');
        //     return;
        // }
        console.log('ExecomPopup: Initializing...');

        // Check if seen in this session (uncomment to limit to once per session)
        if (sessionStorage.getItem(this.sessionKey) === 'true') {
            // return; // Optional: Enable strictly once per session
        }

        // Wait for DOM to be ready if called in head
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        console.log('ExecomPopup: Setup started');
        // Find existing valid popup markup or warn
        this.elements.overlay = document.getElementById('execom-popup-overlay');

        if (!this.elements.overlay) {
            console.warn('ExecomPopup: HTML structure not found in DOM.');
            return;
        }

        this.elements.closeBtn = document.getElementById('execom-popup-close');
        this.elements.checkbox = document.getElementById('popup-dont-show-again');
        this.elements.ctaBtn = this.elements.overlay.querySelector('.popup-cta-btn');

        // Apply Config (Dynamic Content)
        // Only if config values differ from default/markup
        if (this.config.heroImage) {
            const img = document.getElementById('popup-hero-image');
            if (img) img.src = this.config.heroImage;
        }

        // Attach Event Listeners
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', this.close);
        }

        // Close on overlay click (if clicked outside container)
        this.elements.overlay.addEventListener('click', (e) => {
            if (e.target === this.elements.overlay) {
                this.close();
            }
        });

        // Close on ESC
        document.addEventListener('keydown', this.handleKeydown);

        // CTA Click
        if (this.elements.ctaBtn) {
            this.elements.ctaBtn.addEventListener('click', () => {
                // Normally allow navigation, but maybe we want to close/dismiss too?
                // Let's just track dismissal if needed.
                this.setSeenSession();
            });
        }

        // Trigger Show after delay
        setTimeout(() => {
            this.show();
        }, this.config.delay);
    }

    show() {
        console.log('ExecomPopup: Show called');
        if (!this.elements.overlay) return;

        // Show
        this.elements.overlay.style.display = 'flex';
        // Force reflow
        this.elements.overlay.offsetHeight;

        this.elements.overlay.classList.add('show');
        this.elements.overlay.setAttribute('aria-hidden', 'false');

        // Lock Scroll
        document.body.style.overflow = 'hidden';

        // Mark as seen in session
        this.setSeenSession();
    }

    close() {
        if (!this.elements.overlay) return;

        // Check dismissal preference
        this.handleDismiss();

        // Animate Out
        this.elements.overlay.classList.remove('show');
        this.elements.overlay.classList.add('closing');
        this.elements.overlay.setAttribute('aria-hidden', 'true');

        // Restore Scroll
        document.body.style.overflow = '';

        // Remove from DOM flow after animation
        setTimeout(() => {
            this.elements.overlay.style.display = 'none';
            this.elements.overlay.classList.remove('closing');
        }, 400); // Match CSS transition

        // Cleanup events
        document.removeEventListener('keydown', this.handleKeydown);
    }

    handleDismiss() {
        if (this.elements.checkbox && this.elements.checkbox.checked) {
            localStorage.setItem(this.storageKey, 'true');
        }
    }

    setSeenSession() {
        sessionStorage.setItem(this.sessionKey, 'true');
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.close();
        }
    }
}
