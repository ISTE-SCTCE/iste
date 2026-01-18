import BubbleMenu from '../components/ui/bubble-menu.js';

let bubbleMenuInitialized = false;

function init() {
    // Only init on mobile (< 900px) and if not already done
    if (!bubbleMenuInitialized && window.innerWidth <= 900) {

        console.log("Initializing Bubble Menu...");

        new BubbleMenu({
            logo: '<a href="index.html"><img src="../IMAGES/isteofficiallogo.png" alt="ISTE" style="width: 48px; height: 48px;"></a>',
            items: [
                // Uniform glass style for all items
                { label: 'Home', href: 'index.html', bgColor: 'rgba(255, 255, 255, 0.05)', textColor: '#fff' },
                { label: 'Events', href: 'events.html', bgColor: 'rgba(255, 255, 255, 0.05)', textColor: '#fff' },
                { label: 'Execom', href: 'execom.html', bgColor: 'rgba(255, 255, 255, 0.05)', textColor: '#fff' },
                { label: 'Forums', href: 'forums.html', bgColor: 'rgba(255, 255, 255, 0.05)', textColor: '#fff' },
                { label: 'Sub Societies', href: 'sub-society.html', bgColor: 'rgba(255, 255, 255, 0.05)', textColor: '#fff' },
                { label: 'Gallery', href: 'gallery.html', bgColor: 'rgba(255, 255, 255, 0.05)', textColor: '#fff' },
                { label: 'Contact', href: 'contact.html', bgColor: 'rgba(255, 255, 255, 0.05)', textColor: '#fff' }
            ]
        });

        // Force hide old menu toggle if it exists
        const oldToggle = document.querySelector('.glass-nav .menu-toggle');
        if (oldToggle) {
            oldToggle.style.display = 'none';
            oldToggle.style.visibility = 'hidden'; // Double ensure
        }

        bubbleMenuInitialized = true;
        console.log("Bubble Menu Active");
    }
}

// Check on load
init();

// Check on resize (in case they start on desktop and resize down)
window.addEventListener('resize', () => {
    init();
});
