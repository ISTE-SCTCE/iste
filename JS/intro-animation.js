// Optimized intro animation with better performance
const IntroAnimation = (() => {
    const DURATION = 5000;
    const LOGO_SRC = '../IMAGES/istelogofinal-removebg-preview.png';

    const createIntroElement = () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'intro-animation';
        const container = document.createElement('div');
        container.className = 'intro-logo-container';
        const img = document.createElement('img');
        img.src = LOGO_SRC;
        img.alt = 'ISTE Logo';
        img.className = 'intro-logo';
        img.loading = 'eager'; // Prioritize loading
        container.appendChild(img);
        wrapper.appendChild(container);
        return wrapper;
    };

    const showIntro = (duration = DURATION) => {
        // Remove existing intro if present
        const existing = document.querySelector('.intro-animation');
        if (existing) existing.remove();

        const el = createIntroElement();
        const prevOverflow = document.body.style.overflow;

        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
            document.body.appendChild(el);
            document.body.style.overflow = 'hidden';
        });

        // Cleanup after duration
        setTimeout(() => {
            requestAnimationFrame(() => {
                const intro = document.querySelector('.intro-animation');
                if (intro) intro.remove();
                document.body.style.overflow = prevOverflow || '';
                window._introEnded = true;
                window.dispatchEvent(new Event('intro:ended'));
            });
        }, duration);
    };

    return { showIntro };
})();

function showIntro(duration) {
    IntroAnimation.showIntro(duration);
}

// Expose globally so other scripts can call it (e.g., when clicking Home)
window.showIntro = showIntro;

// Play on first load
// Play on first load or when requested
document.addEventListener('DOMContentLoaded', () => {
    // Check if we should play the intro
    // 1. First visit (sessionStorage 'iste_visited' not set)
    // 2. Explicitly requested (sessionStorage 'iste_play_intro' is '1')

    const hasVisited = sessionStorage.getItem('iste_visited') === '1';
    const forcePlay = sessionStorage.getItem('iste_play_intro') === '1';

    // Play intro if it's the first visit OR if forced (e.g. by logo click)
    if (!hasVisited || forcePlay) {
        showIntro(5000);
        // Mark as visited so it doesn't auto-play on reload unless forced
        sessionStorage.setItem('iste_visited', '1');
    } else {
        // STRICTLY DO NOTHING VISUAL HERE
        // Just notify listeners that intro is "done" (skipped)
        try { window._introEnded = true; } catch (e) { }
        try { window.dispatchEvent(new Event('intro:ended')); } catch (e) { }
    }

    // Clear the force flag
    try { sessionStorage.removeItem('iste_play_intro'); } catch (e) { }


});