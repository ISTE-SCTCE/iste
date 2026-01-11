
// JS/chroma-effect.js

export function initChromaEffect() {
    const grid = document.querySelector('.grid-cards');
    const fade = document.querySelector('.chroma-fade');

    // Config
    const damping = 0.45;
    const ease = 'power3.out';
    const fadeOut = 0.6;

    if (!grid || !fade || typeof gsap === 'undefined') {
        console.warn('Chroma Effect Init Failed: Missing element or GSAP');
        return;
    }

    // GSAP Setters for performance
    const setX = gsap.quickSetter(grid, '--x', 'px');
    const setY = gsap.quickSetter(grid, '--y', 'px');

    // Internal position state
    const pos = { x: 0, y: 0 };

    // Initial positioning
    const { width, height } = grid.getBoundingClientRect();
    pos.x = width / 2;
    pos.y = height / 2;
    setX(pos.x);
    setY(pos.y);

    const moveTo = (x, y) => {
        gsap.to(pos, {
            x,
            y,
            duration: damping,
            ease: ease,
            onUpdate: () => {
                setX(pos.x);
                setY(pos.y);
            },
            overwrite: true
        });
    };

    const handleMove = (e) => {
        if (e.pointerType === 'touch') return;
        const r = grid.getBoundingClientRect();
        // Calculate relative to the grid container
        // Note: pointer-events: none on overlay allows this event to fire on grid or cards
        moveTo(e.clientX - r.left, e.clientY - r.top);

        // Reveal effect: Fade out the grayscale mask (opacity 0)
        gsap.to(fade, { opacity: 0, duration: 0.25, overwrite: true });
    };

    const handleLeave = (e) => {
        if (e && e.pointerType === 'touch') return;
        // Fade back to full grayscale (opacity 1)
        gsap.to(fade, {
            opacity: 1,
            duration: fadeOut,
            overwrite: true
        });
    };

    // Attach listeners to the grid container
    grid.addEventListener('pointermove', handleMove);
    grid.addEventListener('pointerleave', handleLeave);
}

// Auto-init
document.addEventListener('DOMContentLoaded', initChromaEffect);
