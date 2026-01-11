// ISTE Society Website - Main JavaScript
// Optimized for performance

// Handles smooth scrolling for anchor links and sets session flags for navigation.
const NavigationHandler = (() => {
    // Sets a session storage item.
    const setSessionFlag = (key, value) => {
        try {
            sessionStorage.setItem(key, value);
        } catch (e) {
            console.warn('SessionStorage is not available.');
        }
    };

    // Handles clicks on anchor links for smooth scrolling.
    const handleAnchorClick = (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Initializes the navigation handlers.
    const init = () => {
        document.addEventListener('click', handleAnchorClick);
    };

    return { init };
})();

// Handles smooth page transitions (fade out on click)
const PageTransitionHandler = (() => {
    const init = () => {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            // Ignore if not a link, or if it has a target="_blank", or if it's a hash link on the same page
            if (!link || link.target === '_blank' || link.getAttribute('href').startsWith('#') ||
                (link.href === window.location.href) || link.href.includes('mailto:') || link.href.includes('tel:')) {
                return;
            }

            // Check if it's an internal link to another HTML page
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('//')) {
                e.preventDefault();
                document.body.classList.add('page-exit');

                setTimeout(() => {
                    window.location.href = link.href;
                }, 400); // Match the CSS transition duration
            }
        });

        // Handle browser back/forward cache (bfcache)
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                document.body.classList.remove('page-exit');
            }
        });
    };

    return { init };
})();

// Initializes the mobile menu functionality.
const MobileMenuHandler = (() => {
    const hamburger = document.querySelector('.hamburger-menu');
    const closeBtn = document.querySelector('.mobile-menu-overlay .close-btn');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const navLinks = document.querySelectorAll('.mobile-nav-menu a');

    // Toggles the mobile menu's visibility.
    const toggleMenu = () => {
        overlay.classList.toggle('open');
        document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    };

    // Closes the mobile menu.
    const closeMenu = () => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    // Initializes the mobile menu event listeners.
    const init = () => {
        if (hamburger && closeBtn && overlay) {
            hamburger.addEventListener('click', toggleMenu);
            closeBtn.addEventListener('click', closeMenu);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeMenu();
            });
            navLinks.forEach(link => link.addEventListener('click', closeMenu));
        }
    };

    return { init };
})();

// Creates an interactive starfield background - OPTIMIZED
function createInteractiveStarfield() {
    const container = document.querySelector('.meteors');
    if (!container) return;

    // Reduced star count for better performance
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const starCount = isMobile ? 30 : 80; // Further reduced for performance

    container.innerHTML = '';
    let stars = [];

    // Use window height since background is fixed
    const height = window.innerHeight;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * height;
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        // Assign size and animations.
        const sizeRand = Math.random();
        if (sizeRand < 0.5) star.classList.add('tiny');
        else if (sizeRand < 0.8) star.classList.add('small');
        else if (sizeRand < 0.95) star.classList.add('medium');
        else star.classList.add('large');

        // Reduced twinkle percentage for better performance
        if (Math.random() < 0.2) { // Reduced from 0.3
            star.classList.add('twinkle');
            star.style.setProperty('--twinkle-duration', `${2 + Math.random() * 3}s`);
        }

        star.style.setProperty('--float-duration', `${8 + Math.random() * 8}s`);
        star.style.setProperty('--float-delay', `${Math.random() * 5}s`);
        star.style.setProperty('--base-opacity', 0.7 + Math.random() * 0.3);

        container.appendChild(star);
    }
}

// Sets up Intersection Observer to reveal elements on scroll.
function observeElements() {
    const elements = document.querySelectorAll('.reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const delay = entry.target.dataset.revealDelay ? Number(entry.target.dataset.revealDelay) : 0;
            if (entry.isIntersecting) {
                if (delay) entry.target.style.transitionDelay = `${delay}ms`;
                entry.target.classList.add('in-view');
            } else {
                entry.target.classList.remove('in-view');
                setTimeout(() => { entry.target.style.transitionDelay = ''; }, 180);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

    elements.forEach((el, i) => {
        if (!el.dataset.revealDelay) el.dataset.revealDelay = i * 20;
        observer.observe(el);
    });
}

// Controls the header's visibility on scroll - OPTIMIZED
function setupHeaderScrollHide() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = window.pageYOffset || 0;
    const delta = 10;
    let headerTicking = false;

    window.addEventListener('scroll', () => {
        if (!headerTicking) {
            window.requestAnimationFrame(() => {
                const current = window.pageYOffset || 0;
                if (current <= 40) {
                    header.classList.remove('header-hidden');
                } else if (Math.abs(current - lastScroll) > delta) {
                    if (current > lastScroll) header.classList.add('header-hidden');
                    else header.classList.remove('header-hidden');
                }
                lastScroll = current;
                headerTicking = false;
            });
            headerTicking = true;
        }
    }, { passive: true });
}

// Manages the 'More' menu dropdown.
function setupMoreMenu() {
    document.querySelectorAll('.more-menu').forEach(menu => {
        const button = menu.querySelector('.more-button');
        const dropdown = menu.querySelector('.more-dropdown');
        if (!button || !dropdown) return;

        const openMenu = () => {
            dropdown.classList.add('show');
            button.setAttribute('aria-expanded', 'true');
        };
        const closeMenu = () => {
            dropdown.classList.remove('show');
            button.setAttribute('aria-expanded', 'false');
        };

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.contains('show') ? closeMenu() : openMenu();
        });

        document.addEventListener('click', (ev) => {
            if (!menu.contains(ev.target)) closeMenu();
        });

        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') closeMenu();
        });

        dropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // Allow the link to navigate normally, just close the menu
                setTimeout(closeMenu, 100);
            });
        });
    });
}

// Typewriter effect for the hero title.
function setupTypewriter() {
    const hero = document.querySelector('.hero-title');
    if (!hero) return;

    const text = hero.getAttribute('data-text') || hero.textContent.trim();
    hero.textContent = '';
    const typedSpan = document.createElement('span');
    typedSpan.className = 'typed';
    hero.appendChild(typedSpan);
    const caret = document.createElement('span');
    caret.className = 'caret';
    hero.appendChild(caret);

    const typeSpeed = Number(hero.dataset.typeSpeed) || 40;
    let i = 0;

    const typeNext = () => {
        if (i <= text.length) {
            typedSpan.textContent = text.slice(0, i++);
            setTimeout(typeNext, typeSpeed);
        } else {
            setTimeout(() => { if (caret) caret.style.display = 'none'; }, 800);
        }
    };

    setTimeout(typeNext, Number(hero.dataset.startDelay) || 200);
}

// Handles parallax scrolling effect for the background - DISABLED FOR PERFORMANCE
function setupParallax() {
    // Parallax disabled to improve performance and prevent black space issues
    // Background is now static and fixed
    return;
}

// Controls the visibility of the fixed join button based on scroll position
function setupJoinButtonScroll() {
    const joinButton = document.querySelector('.join-button-fixed');
    const aboutSection = document.querySelector('.about-section');

    if (!joinButton || !aboutSection) return;

    // Use a simple scroll listener for reliability
    const handleScroll = () => {
        const rect = aboutSection.getBoundingClientRect();
        // Trigger when the top of the About section is near the bottom of the viewport
        // or if we have scrolled past it (rect.top is negative)
        const triggerPoint = window.innerHeight - 100;

        if (rect.top <= triggerPoint) {
            joinButton.classList.add('visible');
        } else {
            joinButton.classList.remove('visible');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial state
    handleScroll();
}



// General initialization on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
    NavigationHandler.init();
    MobileMenuHandler.init();
    PageTransitionHandler.init();
    createInteractiveStarfield();
    observeElements();
    setupHeaderScrollHide();
    setupMoreMenu();
    setupTypewriter();
    setupParallax();
    setupTypewriter();
    setupParallax();
    setupJoinButtonScroll();
    setupLogoClick();

    // If we are NOT on the index page (checked by presence of hero-title), 
    // mark the intro as visited so that navigating back to index doesn't trigger it.
    if (!document.querySelector('.hero-title')) {
        try {
            sessionStorage.setItem('iste_visited', '1');
        } catch (e) {
            console.warn('SessionStorage not available');
        }
    }

    console.log('%cISTE SCTCE Website', 'background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-size: 1.2rem; font-weight: bold; padding: 5px;');
});

// Handle ISTE Logo Click to trigger animation
function setupLogoClick() {
    const logoLink = document.querySelector('.logo-link');
    if (!logoLink) return;

    logoLink.addEventListener('click', (e) => {
        // Check if we are on the index page
        const isIndex = document.querySelector('.hero-title') !== null;

        if (isIndex) {
            // If on index, play animation immediately if function exists
            if (typeof window.showIntro === 'function') {
                e.preventDefault();
                window.showIntro(5000);
                window.scrollTo(0, 0);
            }
        } else {
            // If on another page, set flag to force play on next load
            try {
                sessionStorage.setItem('iste_play_intro', '1');
            } catch (e) {
                console.warn('SessionStorage not available');
            }
        }
    });
}

// Re-create starfield on window resize - DEBOUNCED
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        createInteractiveStarfield();
    }, 300); // Reduced from 500ms for faster response
});
