import { GlowingEffect } from "../components/ui/glowing-effect.js";

function initGlowingEffect() {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        // Check if already initialized
        if (card.querySelector('.glowing-effect-target')) return;

        // Create and inject the target element for the glow
        const target = document.createElement('div');
        target.className = "glowing-effect-target absolute inset-0 rounded-inherit pointer-events-none";

        // Ensure the target is behind other content
        if (getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }
        card.insertBefore(target, card.firstChild);

        // Initialize the effect
        new GlowingEffect(target, {
            spread: 60,
            glow: true,
            disabled: false,
            proximity: 64,
            inactiveZone: 0.01,
            borderWidth: 2,
            movementDuration: 1.2
        });
    });
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlowingEffect);
} else {
    initGlowingEffect();
}
