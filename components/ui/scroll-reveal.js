/**
 * ScrollReveal Component (Vanilla JS)
 * Adapts React GSAP ScrollTrigger logic to vanilla JS.
 */
export default class ScrollReveal {
    constructor(element, options = {}) {
        this.element = element;

        // Default options matching the React component props
        this.options = {
            enableBlur: true,
            baseOpacity: 0.1,
            baseRotation: 3,
            blurStrength: 4,
            rotationEnd: 'bottom bottom',
            wordAnimationEnd: 'bottom 80%', // Adjusted default for better visibility
            ...options
        };

        if (!window.gsap || !window.ScrollTrigger) {
            console.warn('ScrollReveal: GSAP or ScrollTrigger not found.');
            return;
        }

        this.init();
    }

    init() {
        // 1. Prepare structure
        this.element.classList.add('scroll-reveal');

        // We assume the element itself contains the text. 
        // If it has children elements, this might break them, but for "About Us" paragraph it's fine.
        const text = this.element.textContent;
        this.splitText(text);

        // 2. Animate
        this.animate();
    }

    splitText(text) {
        // Split by spaces but keep spaces to preserve layout
        const words = text.split(/(\s+)/);
        this.element.innerHTML = ''; // Clear content

        // Wrap words
        words.forEach(word => {
            if (!word) return;
            if (word.match(/^\s+$/)) {
                this.element.appendChild(document.createTextNode(word));
                return;
            }

            const span = document.createElement('span');
            span.textContent = word;
            span.className = 'word';
            this.element.appendChild(span);
        });
    }

    animate() {
        const {
            enableBlur,
            baseOpacity,
            baseRotation,
            blurStrength,
            rotationEnd,
            wordAnimationEnd
        } = this.options;

        const wordElements = this.element.querySelectorAll('.word');

        // Container rotation
        gsap.fromTo(
            this.element,
            { transformOrigin: '0% 50%', rotate: baseRotation },
            {
                ease: 'none',
                rotate: 0,
                scrollTrigger: {
                    trigger: this.element,
                    start: 'top bottom',
                    end: rotationEnd,
                    scrub: true
                }
            }
        );

        // Words Opacity
        gsap.fromTo(
            wordElements,
            { opacity: baseOpacity, willChange: 'opacity' },
            {
                ease: 'none',
                opacity: 1,
                stagger: 0.05,
                scrollTrigger: {
                    trigger: this.element,
                    start: 'top bottom-=20%', // Start slightly before fully in view
                    end: wordAnimationEnd,
                    scrub: true
                }
            }
        );

        // Words Blur
        if (enableBlur) {
            gsap.fromTo(
                wordElements,
                { filter: `blur(${blurStrength}px)` },
                {
                    ease: 'none',
                    filter: 'blur(0px)',
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: this.element,
                        start: 'top bottom-=20%',
                        end: wordAnimationEnd,
                        scrub: true
                    }
                }
            );
        }
    }
}
