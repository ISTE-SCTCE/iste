/**
 * MasonryGallery - A high-performance, GSAP-powered Masonry layout class.
 * Adapted from React component for Vanilla JS.
 */

export class MasonryGallery {
    constructor(container, items, config = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.items = items;
        this.config = {
            ease: 'power3.out',
            duration: 0.6,
            stagger: 0.05,
            animateFrom: 'bottom',
            scaleOnHover: true,
            hoverScale: 0.95,
            blurToFocus: true,
            colorShiftOnHover: false,
            gap: 24,
            ...config
        };

        this.gridItems = [];
        this.cols = 1;
        this.resizeObserver = null;

        this.init();
    }

    async init() {
        if (!this.container) {
            console.error('MasonryGallery: Container not found');
            return;
        }

        // Clear container
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.width = '100%';

        // Wait for images/content if needed (simplified for video/mixed content)
        // For actual images, we'd preload.

        this.setupResizeObserver();
        this.updateLayout();
        this.render();
        this.animateIn();

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        this.updateLayout();
        this.updatePositions();
    }

    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            this.updateLayout();
            this.updatePositions();
        });
        this.resizeObserver.observe(this.container);
    }

    getColumns() {
        const width = window.innerWidth;
        if (width >= 1500) return 4; // reduced max cols for cleaner look on wide screens vs 5
        if (width >= 1000) return 3;
        if (width >= 600) return 2;
        return 1;
    }

    updateLayout() {
        const width = this.container.getBoundingClientRect().width;
        this.cols = this.getColumns();

        const gap = this.config.gap;
        const totalGaps = (this.cols - 1) * gap;
        const columnWidth = (width - totalGaps) / this.cols;

        const colHeights = new Array(this.cols).fill(0);

        this.gridItems = this.items.map((item, index) => {
            // Find shortest column
            const col = colHeights.indexOf(Math.min(...colHeights));

            const x = col * (columnWidth + gap);
            const y = colHeights[col];

            // Calculate height maintaining aspect ratio or using fixed height
            // Logic: provided height is based on a reference, say 400px width.
            // item.height is the "visual weight".
            // If item has no height, default to square-ish
            const itemBaseHeight = item.height || 300;
            const height = (itemBaseHeight / 400) * columnWidth;

            colHeights[col] += height + gap;

            return {
                ...item,
                x,
                y,
                w: columnWidth,
                h: height,
                id: item.id || `item-${index}`
            };
        });

        const containerHeight = Math.max(...colHeights);
        this.container.style.height = `${containerHeight}px`;
    }

    render() {
        // Only render new items or re-render implementation could be smarter,
        // but for vanilla adapter simple innerHTML/append is okay for initial load.
        // Or better: create elements and append.

        this.gridItems.forEach(item => {
            let el = document.getElementById(`masonry-item-${item.id}`);

            if (!el) {
                el = document.createElement('div');
                el.id = `masonry-item-${item.id}`;
                el.className = 'masonry-item glass-card'; // Reusing glass-card style
                el.style.position = 'absolute';
                el.style.padding = '0'; // Override glass-card padding
                el.style.overflow = 'hidden';
                el.style.cursor = 'pointer';

                // Add content
                if (item.type === 'video') {
                    el.innerHTML = `
                        <video src="${item.src}" muted loop playsinline style="width: 100%; height: 100%; object-fit: cover; display: block;"></video>
                        <div class="card-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 1.5rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); opacity: 0; transition: opacity 0.3s;">
                            <h3 style="color: white; margin: 0; font-size: 1.1rem;">${item.title || ''}</h3>
                        </div>
                    `;
                } else {
                    el.innerHTML = `
                        <div style="width: 100%; height: 100%; background-image: url('${item.src}'); background-size: cover; background-position: center;"></div>
                        ${this.config.colorShiftOnHover ? '<div class="color-overlay" style="position: absolute; inset: 0; background: linear-gradient(45deg, rgba(112,0,223,0.4), rgba(0,198,255,0.4)); opacity: 0; transition: opacity 0.4s;"></div>' : ''}
                        <div class="card-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 1.5rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); opacity: 0; transition: opacity 0.3s;">
                            <h3 style="color: white; margin: 0; font-size: 1.1rem;">${item.title || ''}</h3>
                        </div>
                    `;
                }

                // Interaction
                el.addEventListener('mouseenter', () => this.onMouseEnter(el));
                el.addEventListener('mouseleave', () => this.onMouseLeave(el));
                if (item.url) {
                    el.addEventListener('click', () => window.open(item.url, '_blank'));
                } else if (item.onClick) {
                    el.addEventListener('click', item.onClick);
                }

                this.container.appendChild(el);
            }

            // Set Position
            gsap.set(el, {
                x: item.x,
                y: item.y,
                width: item.w,
                height: item.h
            });
        });
    }

    updatePositions() {
        this.gridItems.forEach(item => {
            const el = document.getElementById(`masonry-item-${item.id}`);
            if (el) {
                gsap.to(el, {
                    x: item.x,
                    y: item.y,
                    width: item.w,
                    height: item.h,
                    duration: this.config.duration,
                    ease: this.config.ease
                });
            }
        });
    }

    getInitialPosition(item, rect) {
        // Simplified Logic for Vanilla
        switch (this.config.animateFrom) {
            case 'bottom': return { y: window.innerHeight + 100 };
            case 'top': return { y: -200 };
            case 'left': return { x: -200 };
            case 'right': return { x: window.innerWidth + 200 };
            default: return { y: item.y + 100, opacity: 0 };
        }
    }

    animateIn() {
        this.gridItems.forEach((item, index) => {
            const el = document.getElementById(`masonry-item-${item.id}`);
            if (!el) return;

            const startPos = this.getInitialPosition(item);

            gsap.fromTo(el,
                {
                    opacity: 0,
                    ...startPos,
                    ...(this.config.blurToFocus && { filter: 'blur(10px)' })
                },
                {
                    opacity: 1,
                    x: item.x,
                    y: item.y,
                    filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'power3.out',
                    delay: index * this.config.stagger
                }
            );
        });
    }

    onMouseEnter(el) {
        if (this.config.scaleOnHover) {
            gsap.to(el, { scale: this.config.hoverScale || 0.98, duration: 0.4, ease: 'power2.out' });
        }
        const overlay = el.querySelector('.card-overlay');
        if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.3 });

        const colorOverlay = el.querySelector('.color-overlay');
        if (colorOverlay) gsap.to(colorOverlay, { opacity: 1, duration: 0.4 });

        const video = el.querySelector('video');
        if (video) {
            video.currentTime = 0;
            video.play().catch(e => console.log('Autoplay prevented:', e));
        }
    }

    onMouseLeave(el) {
        if (this.config.scaleOnHover) {
            gsap.to(el, { scale: 1, duration: 0.4, ease: 'power2.out' });
        }
        const overlay = el.querySelector('.card-overlay');
        if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });

        const colorOverlay = el.querySelector('.color-overlay');
        if (colorOverlay) gsap.to(colorOverlay, { opacity: 0, duration: 0.4 });

        const video = el.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    }
}
