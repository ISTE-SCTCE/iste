
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. HERO ANIMATION (More dynamic)
    const tl = gsap.timeline();

    tl.fromTo(".about-title",
        { y: 100, opacity: 0, rotateX: -20 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.2, ease: "power4.out" }
    )
        .fromTo(".about-subtitle",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
            "-=0.8"
        );

    // 2. BENTO GRID STAGGERED ENTRY
    // We select all cards within the grid
    const cards = document.querySelectorAll(".bento-card");

    // Set initial state to avoid flash of unstyled content if CSS didn't hide them
    gsap.set(cards, { y: 50, opacity: 0, scale: 0.95 });

    ScrollTrigger.batch(cards, {
        onEnter: batch => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                scale: 1,
                stagger: 0.1,
                duration: 0.8,
                ease: "back.out(1.2)", // Subtle bounce for "pop" effect
                overwrite: true
            });
        },
        start: "top 90%",
        once: true // Only animate once for better performance
    });

    // 3. OPTIMIZED TILT EFFECT (Mouse interaction)
    // Using requestAnimationFrame for 60fps performance and avoiding layout thrashing
    const tiltCards = document.querySelectorAll(".bento-card");

    tiltCards.forEach(card => {
        let bounds;

        function rotateToMouse(e) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const leftX = mouseX - bounds.x;
            const topY = mouseY - bounds.y;
            const center = {
                x: leftX - bounds.width / 2,
                y: topY - bounds.height / 2
            }
            const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

            card.style.transform = `
                scale3d(1.02, 1.02, 1.02)
                rotate3d(
                    ${center.y / 100},
                    ${-center.x / 100},
                    0,
                    ${Math.log(distance) * 2}deg
                )
            `;

            // Dynamic Glow Effect
            card.style.backgroundImage = `
                radial-gradient(
                    circle at ${center.x * 2 + bounds.width / 2}px ${center.y * 2 + bounds.height / 2}px,
                    rgba(255,255,255,0.07),
                    transparent 40%
                )
            `;
        }

        card.addEventListener('mouseenter', () => {
            bounds = card.getBoundingClientRect();
            document.addEventListener('mousemove', rotateToMouse);
        });

        card.addEventListener('mouseleave', () => {
            document.removeEventListener('mousemove', rotateToMouse);
            card.style.transform = '';
            card.style.background = ''; // Reset gradient

            // Smooth reset
            gsap.to(card, {
                scale: 1,
                rotationX: 0,
                rotationY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });
});
