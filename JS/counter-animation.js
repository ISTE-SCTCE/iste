/**
 * Counter Animation
 * Animates numbers from 0 to data-target when they enter the viewport
 * Dependencies: GSAP, ScrollTrigger
 */

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter) => {
        const target = parseFloat(counter.getAttribute("data-target"));

        // Ensure we have a valid number
        if (isNaN(target)) return;

        gsap.fromTo(
            counter,
            {
                textContent: 0
            },
            {
                textContent: target,
                duration: 2,
                ease: "power2.out",
                snap: { textContent: 1 }, // Snap to whole numbers
                scrollTrigger: {
                    trigger: counter,
                    start: "top 85%", // Start animation when top of element hits 85% of viewport height
                    toggleActions: "play none none reverse", // Re-play when scrolling back up? or "play none none none" for once
                },
                // Format the number during update (optional, if you want commas etc, but snap handles integers)
                onUpdate: function () {
                    counter.textContent = Math.ceil(this.targets()[0].textContent);
                },
            }
        );
    });
});
