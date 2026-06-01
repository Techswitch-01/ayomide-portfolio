// --- 1. PRECISION SMOOTH SCROLLING (With Navbar Offset) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return; // Ignore empty links

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        // Calculate exact position, accounting for the 90px height of the fixed navbar
        const headerOffset = 90;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        // Execute precision scroll
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// --- 2. THE CASCADE REVEAL ANIMATION (Staggered Loading) ---
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Triggers when 15% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    // Filter out only the entries that are currently intersecting (visible)
    const visibleEntries = entries.filter(entry => entry.isIntersecting);

    // Loop through visible entries and stagger their reveal times
    visibleEntries.forEach((entry, index) => {
        setTimeout(() => {
            entry.target.classList.add('visible');
        }, index * 150); // Multiplies the delay by 150ms per card (0ms, 150ms, 300ms)

        observer.unobserve(entry.target); // Stop watching once revealed
    });
}, observerOptions);

// Grab all elements we want to animate
const revealElements = document.querySelectorAll('.skill-card, .project-card, .section-title');

revealElements.forEach(el => {
    el.classList.add('hidden'); // Hide them initially
    observer.observe(el);       // Start watching them
});

// --- 3. MAGNETIC BUTTONS (Heavy Physical UI) ---
// Select all buttons on the page
const magnets = document.querySelectorAll('.btn-primary, .btn-secondary');

magnets.forEach(magnet => {
    // When the mouse moves over the button
    magnet.addEventListener('mousemove', function(e) {
        const position = magnet.getBoundingClientRect();
        
        // Calculate the distance between the mouse and the center of the button
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;

        // Move the button slightly towards the mouse (0.3 is the magnetic pull strength)
        magnet.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    // When the mouse leaves the button
    magnet.addEventListener('mouseleave', function() {
        // Snap back to the original position
        // The CSS transition we set earlier makes this snap feel heavy and expensive
        magnet.style.transform = 'translate(0px, 0px)';
    });
});