/**
 * Scroll Animations - ISTE Frontend
 * Adds smooth animations to elements as they enter the viewport
 */

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
});

function initScrollAnimations() {
    // Configuration for Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before element enters viewport
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] // Multiple thresholds for progressive animations
    };

    // Create the observer
    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Select all elements that should be animated on scroll
    const animatedElements = document.querySelectorAll(`
        .about-box,
        .stat-card,
        .news-card,
        .event-card,
        .forum-card,
        .member-card,
        .section-title,
        .section-title-large,
        .hero-title,
        .hero-subtitle,
        .hero-buttons,
        .cta-button,
        .footer-section,
        .about-text,
        p,
        h1, h2, h3, h4, h5, h6,
        .workshop-card,
        .forum-box,
        .swas-header,
        .swas-card,
        .execom-section,
        .registration-container,
        .form-group,
        .course-card,
        .course-module,
        .lesson-item,
        .info-box
    `);

    // Add animation classes and observe each element
    animatedElements.forEach((element, index) => {
        // Add base animation class
        element.classList.add('scroll-animate');

        // Add varied animation types based on element type
        if (element.classList.contains('stat-card') ||
            element.classList.contains('forum-card') ||
            element.classList.contains('member-card') ||
            element.classList.contains('news-card') ||
            element.classList.contains('event-card') ||
            element.classList.contains('workshop-card') ||
            element.classList.contains('course-card')) {
            element.classList.add('animate-scale');
            // Add staggered delay for cards in a row
            element.style.setProperty('--animation-delay', `${(index % 4) * 0.1}s`);
        } else if (element.tagName === 'H1' ||
            element.tagName === 'H2' ||
            element.classList.contains('section-title') ||
            element.classList.contains('section-title-large')) {
            element.classList.add('animate-slide-down');
        } else if (element.classList.contains('about-box') ||
            element.classList.contains('info-box')) {
            element.classList.add('animate-fade-scale');
        } else if (element.classList.contains('footer-section')) {
            element.classList.add('animate-slide-up');
            element.style.setProperty('--animation-delay', `${(index % 4) * 0.15}s`);
        } else if (element.classList.contains('cta-button') ||
            element.classList.contains('hero-buttons')) {
            element.classList.add('animate-bounce-in');
        } else {
            element.classList.add('animate-fade-up');
        }

        // Start observing the element
        observer.observe(element);
    });
}

/**
 * Handle intersection events
 */
function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add visible class when element enters viewport
            entry.target.classList.add('is-visible');

            // Optional: Stop observing after animation (for performance)
            // Uncomment if you want one-time animations only
            // observer.unobserve(entry.target);
        } else {
            // Optional: Remove visible class when element leaves viewport
            // This allows re-animation when scrolling back
            // Comment out if you want one-time animations
            if (entry.boundingClientRect.top > 0) {
                entry.target.classList.remove('is-visible');
            }
        }
    });
}

/**
 * Additional scroll effects - Parallax for specific sections
 * Reduced intensity to 75% for lighter scrolling feel
 */


// Add scroll progress indicator
function createScrollProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Initialize scroll progress bar
createScrollProgressBar();
