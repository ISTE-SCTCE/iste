
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. HERO ANIMATION
    const tl = gsap.timeline();

    tl.fromTo(".join-title",
        { y: 80, opacity: 0, rotateX: -10 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1, ease: "power4.out" }
    )
        .fromTo(".join-subtitle",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
            "-=0.7"
        )
        .fromTo(".join-cta-container",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" },
            "-=0.5"
        );

    // 2. GRID ANIMATIONS
    const cards = document.querySelectorAll(".join-card");

    gsap.set(cards, { y: 60, opacity: 0, scale: 0.9 });

    ScrollTrigger.batch(cards, {
        onEnter: batch => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                scale: 1,
                stagger: 0.15,
                duration: 0.8,
                ease: "power3.out",
                overwrite: true
            });
        },
        start: "top 85%",
        once: true
    });

    // 3. TILT EFFECT (Reusing logic for consistency)
    cards.forEach(card => {
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
            card.style.background = '';

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
