// --- SMOOTH SCROLLING FOR NAVIGATION ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// --- SCROLL REVEAL ANIMATION ---
// This watches elements and reveals them when they enter the screen
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Triggers when 15% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop watching once revealed
        }
    });
}, observerOptions);

// Grab all elements we want to animate
const revealElements = document.querySelectorAll('.skill-card, .project-card, .section-title');

revealElements.forEach(el => {
    el.classList.add('hidden'); // Hide them initially
    observer.observe(el);       // Start watching them
});