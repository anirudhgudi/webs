document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggleButton = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    // --- Theme Toggle Functionality ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            body.classList.remove('dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }

    // Function to initialize the theme based on saved preference or system setting
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            // If the user has manually set a theme, use it
            applyTheme(savedTheme);
        } else {
            // Otherwise, use the system's preferred theme
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(systemPrefersDark ? 'dark' : 'light');
        }
    }

    // Listen for clicks on the theme toggle button
    themeToggleButton.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark') ? 'light' : 'dark';
        // When the user clicks the button, save their choice to localStorage
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // Listen for changes in the user's system theme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only change the theme if the user has NOT made a manual choice
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // --- Interactive Spotlight Effect ---
    body.addEventListener('mousemove', (e) => {
        body.style.setProperty('--mouse-x', e.clientX + 'px');
        body.style.setProperty('--mouse-y', e.clientY + 'px');
    });

    // --- Project Logbook Scroll Sync ---
    const projectNavLinks = document.querySelectorAll('.project-nav-item a');
    const projectDetails = document.querySelectorAll('.project-detail-item');

    const observerOptions = {
        root: null,
        rootMargin: "-40% 0px -60% 0px", // Trigger when a project is in the middle 20% of the screen
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector(`.project-nav-item a[href="#${id}"]`);

            if (entry.isIntersecting) {
                // Activate the nav link and fade in the project
                projectNavLinks.forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
                entry.target.classList.add('is-visible');
            } else {
                // De-activate when it leaves the target area
                navLink.classList.remove('active');
                entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);

    projectDetails.forEach(detail => observer.observe(detail));

    // Initialize the theme when the page loads
    initializeTheme();
});
