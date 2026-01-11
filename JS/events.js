/**
 * Events Page JavaScript
 * Handles filtering, searching, and interactive functionality
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeEventsPage();
    handleHashNavigation();
});

function initializeEventsPage() {
    // Get DOM elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('event-search');
    const eventCategories = document.querySelectorAll('.event-category');
    const eventCards = document.querySelectorAll('.event-card-wrapper');
    const noResults = document.getElementById('no-results');

    // Current filter state
    let currentFilter = 'all';
    let searchQuery = '';

    // Filter button click handlers
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Update current filter
            currentFilter = this.getAttribute('data-filter');

            // Apply filters
            applyFilters();
        });
    });

    // Search input handler with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = this.value.toLowerCase().trim();
            applyFilters();
        }, 300); // 300ms debounce
    });

    // Apply filters based on current state
    function applyFilters() {
        let visibleCount = 0;

        eventCategories.forEach(category => {
            const categoryType = category.getAttribute('data-category');
            const cards = category.querySelectorAll('.event-card-wrapper');
            let categoryHasVisibleCards = false;

            // Check if category should be shown based on filter
            const showCategory = currentFilter === 'all' || currentFilter === categoryType;

            if (showCategory) {
                cards.forEach(card => {
                    const eventCard = card.querySelector('.event-card');
                    const title = eventCard.querySelector('.event-title').textContent.toLowerCase();
                    const description = eventCard.querySelector('.event-description').textContent.toLowerCase();
                    const date = eventCard.querySelector('.event-date').textContent.toLowerCase();

                    // Check if card matches search query
                    const matchesSearch = searchQuery === '' ||
                        title.includes(searchQuery) ||
                        description.includes(searchQuery) ||
                        date.includes(searchQuery);

                    if (matchesSearch) {
                        card.style.display = 'block';
                        categoryHasVisibleCards = true;
                        visibleCount++;

                        // Add fade-in animation
                        card.style.animation = 'fadeInUp 0.5s ease-out forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });

                // Show/hide category based on whether it has visible cards
                if (categoryHasVisibleCards) {
                    category.classList.remove('hidden');
                } else {
                    category.classList.add('hidden');
                }
            } else {
                category.classList.add('hidden');
            }
        });

        // Show/hide no results message
        if (visibleCount === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }

    // Add fade-in animation for initial load
    eventCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`;
    });

    // Smooth scroll to top when filter changes
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const eventsGrid = document.querySelector('.events-grid');
            if (eventsGrid) {
                eventsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Add hover effect enhancement for event cards
    eventCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // Handle event card clicks (for analytics or tracking)
    eventCards.forEach(card => {
        card.addEventListener('click', function (e) {
            const eventTitle = this.querySelector('.event-title').textContent;
            console.log(`Event clicked: ${eventTitle}`);
            // Add analytics tracking here if needed
        });
    });

    // Add keyboard navigation for filter buttons
    filterButtons.forEach((button, index) => {
        button.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextButton = filterButtons[index + 1] || filterButtons[0];
                nextButton.focus();
                nextButton.click();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevButton = filterButtons[index - 1] || filterButtons[filterButtons.length - 1];
                prevButton.focus();
                prevButton.click();
            }
        });
    });

    // Clear search button (if user presses Escape)
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            this.value = '';
            searchQuery = '';
            applyFilters();
        }
    });

    // Intersection Observer for lazy loading animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all event cards
    eventCards.forEach(card => {
        observer.observe(card);
    });

    // Handle window resize for responsive adjustments
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate layouts if needed
            console.log('Window resized, adjusting layout...');
        }, 250);
    });

    // Add custom event for external filtering (if needed)
    window.filterEvents = function (filter) {
        const button = document.querySelector(`[data-filter="${filter}"]`);
        if (button) {
            button.click();
        }
    };

    // Add custom event for external search (if needed)
    window.searchEvents = function (query) {
        searchInput.value = query;
        searchQuery = query.toLowerCase().trim();
        applyFilters();
    };

    console.log('Events page initialized successfully');
}

// Handle hash navigation from View More buttons
function handleHashNavigation() {
    const hash = window.location.hash.substring(1); // Remove the # symbol

    if (hash) {
        // Wait a bit for the page to fully load
        setTimeout(() => {
            const filterButton = document.querySelector(`[data-filter="${hash}"]`);
            if (filterButton) {
                filterButton.click();

                // Scroll to the events grid
                const eventsGrid = document.querySelector('.events-grid');
                if (eventsGrid) {
                    eventsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }, 500);
    }
}

// Add CSS animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
