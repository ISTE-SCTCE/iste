// Modern Animation Engine
// Imports (assuming CDN loading in HTML for Three, GSAP, Lenis)

document.addEventListener("DOMContentLoaded", () => {
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    // 1. Initialize Lenis Smooth Scroll (Desktop only for performance)
    let lenis;
    if (!isMobile) {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }


    // Auto-hide navigation logic REMOVED to keep nav always visible as per requirements.
    // window.addEventListener('scroll', ...);

    // Mobile Menu Toggle logic REMOVED (No hamburger menu)

    // 2. Glass Pebble Navigation
    const nav = document.querySelector('.glass-nav');
    const pebble = document.querySelector('.nav-pebble');
    const links = document.querySelectorAll('.nav-link');

    if (pebble && nav) {
        links.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                const rect = e.target.getBoundingClientRect();
                const navRect = nav.getBoundingClientRect();
                const left = rect.left - navRect.left;
                const width = rect.width;

                gsap.to(pebble, {
                    left: left,
                    width: width,
                    opacity: 1,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.5)"
                });
            });
        });

        nav.addEventListener('mouseleave', () => {
            gsap.to(pebble, {
                opacity: 0,
                duration: 0.3
            });
        });
    }

    // 3. Magnetic Buttons (Desktop only for performance)
    if (!isMobile) {
        const magnets = document.querySelectorAll('.magnetic-btn');
        magnets.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });
    }

    // 4. Scroll Animations
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.reveal-text').forEach(text => {
        gsap.fromTo(text, { y: 50, opacity: 0 }, {
            y: 0, opacity: 1, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: text, start: "top 85%" }
        });
    });

    document.querySelectorAll('.fade-left').forEach(el => {
        gsap.fromTo(el, { x: -60, opacity: 0 }, {
            x: 0, opacity: 1, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" }
        });
    });

    document.querySelectorAll('.fade-right').forEach(el => {
        gsap.fromTo(el, { x: 60, opacity: 0 }, {
            x: 0, opacity: 1, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" }
        });
    });

    document.querySelectorAll('.scale-in').forEach(el => {
        gsap.fromTo(el, { scale: 0.8, opacity: 0 }, {
            scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)",
            scrollTrigger: { trigger: el, start: "top 85%" }
        });
    });

    document.querySelectorAll('.stagger-container').forEach(container => {
        const items = container.querySelectorAll('.glass-card, .nav-link, li, .grid-item');
        gsap.fromTo(items, { y: 30, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: container, start: "top 85%" }
        });
    });

    document.querySelectorAll('.glass-card:not(.reveal-text):not(.fade-left):not(.fade-right):not(.scale-in)').forEach((card, index) => {
        gsap.fromTo(card, { y: 40, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.8, delay: index * 0.05, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 90%" }
        });
    });

    // Glass Cards Tilt Effect (Desktop only for performance)
    if (!isMobile) {
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -1.5;
                const rotateY = ((x - centerX) / centerX) * 1.5;

                gsap.to(card, {
                    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    transform: `perspective(1000px) rotateX(0) rotateY(0)`,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        });
    }

    // 4.5 Logo Click Handler (Intro Animation)
    const logos = document.querySelectorAll('.logo-link, .logo-link-right');
    logos.forEach(logo => {
        logo.addEventListener('click', (e) => {
            // Check if we are on Home page (hero-super-title exists)
            const isHome = document.querySelector('.hero-super-title');

            if (isHome) {
                // On Home: Play animation immediately without reload
                e.preventDefault();
                e.stopImmediatePropagation(); // Stop generic page transition

                if (typeof window.showIntro === 'function') {
                    window.scrollTo(0, 0);
                    window.showIntro(5000);
                } else {
                    // Fallback
                    window.location.reload();
                    sessionStorage.setItem('iste_play_intro', '1');
                }
            } else {
                // On Other Pages: Set flag to play intro on next load (Home)
                try {
                    sessionStorage.setItem('iste_play_intro', '1');
                } catch (err) {
                    console.warn('SessionStorage failed', err);
                }
                // Allow event to propagate to generic handler for navigation flow
            }
        });
    });

    // 5. Page Transition
    const fadeOverlay = document.querySelector('.page-fade-overlay');

    if (fadeOverlay) {
        setTimeout(() => {
            fadeOverlay.classList.add('fade-out');
        }, 100);
    }

    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

            if (href.includes('.html')) {
                e.preventDefault();

                const mainContent = document.querySelectorAll('.hero-content, .content-section, footer, main');
                gsap.to(mainContent, {
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });

                if (fadeOverlay) {
                    fadeOverlay.classList.remove('fade-out');
                }

                setTimeout(() => {
                    window.location.href = href;
                }, 800);
            }
        });
    });



    // 6. Mobile Nav More Button Logic
    const navMoreBtn = document.querySelector('.nav-more-btn');
    const navLinksContainer = document.querySelector('.nav-links');

    if (navMoreBtn && navLinksContainer) {
        navMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navLinksContainer.classList.toggle('expanded');

            const span = navMoreBtn.querySelector('span');
            if (navLinksContainer.classList.contains('expanded')) {
                if (span) span.textContent = 'Less';
                navMoreBtn.classList.add('active');
            } else {
                if (span) span.textContent = 'More';
                navMoreBtn.classList.remove('active');
            }
        });
    }

});
