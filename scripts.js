document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const body = document.body;
    const themeToggleButton = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const canvas = document.getElementById('shooting-stars-canvas');
    const ctx = canvas.getContext('2d');

    let shootingStars = [];
    let floatingMotes = [];

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

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(systemPrefersDark ? 'dark' : 'light');
        }
    }

    // --- Canvas & Animation Definitions ---
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // NEW: Class for the light mode "Floating Motes" effect
    class FloatingMote {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.2; // Slow horizontal drift
            this.speedY = -Math.random() * 0.3 - 0.1; // Slow upward drift
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Reset if it drifts off-screen
            if (this.y < -this.radius) {
                this.y = canvas.height + this.radius;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            const moteColor = 'rgba(74, 93, 80, 0.7)'; // Muted olive color
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = moteColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Class for the dark mode "Shooting Stars" effect
    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.length = Math.random() * 80 + 80;
            this.x = Math.random() * (canvas.width + canvas.height) - canvas.height * 0.5;
            this.y = Math.random() * -canvas.height * 0.3;
            this.speed = Math.random() * 4 + 3;
            this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.1;
            this.opacity = Math.random() * 0.4 + 0.5;
            this.width = Math.random() * 1.2 + 1.2;
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.x > canvas.width + this.length || this.y > canvas.height + this.length) {
                this.reset();
            }
        }

        draw() {
            const starColor = 'rgba(143, 188, 143, 0.85)'; // Muted sea green color
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.strokeStyle = starColor;
            ctx.lineWidth = this.width;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x - Math.cos(this.angle) * this.length,
                this.y - Math.sin(this.angle) * this.length
            );
            ctx.shadowColor = starColor;
            ctx.shadowBlur = 16;
            ctx.stroke();
            ctx.restore();
        }
    }

    function createFloatingMotes() {
        floatingMotes = [];
        const count = 30; // More motes for a gentle, full-screen effect
        for (let i = 0; i < count; i++) {
            floatingMotes.push(new FloatingMote());
        }
    }

    function createShootingStars() {
        shootingStars = [];
        const count = 6;
        for (let i = 0; i < count; i++) {
            shootingStars.push(new ShootingStar());
        }
    }

    // --- Animation Loop ---
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // UPDATED: Check for theme and draw the correct effect
        if (body.classList.contains('dark')) {
            shootingStars.forEach(star => {
                star.update();
                star.draw();
            });
        } else {
            floatingMotes.forEach(mote => {
                mote.update();
                mote.draw();
            });
        }

        requestAnimationFrame(animate);
    }

    // --- Project Logbook & Slideshow Logic (Unchanged) ---
    const projectNavLinks = document.querySelectorAll('.project-nav-item a');
    const projectDetails = document.querySelectorAll('.project-detail-item');
    const observerOptions = { root: null, rootMargin: "-40% 0px -60% 0px", threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector(`.project-nav-item a[href="#${id}"]`);
            if (navLink) {
                if (entry.isIntersecting) {
                    projectNavLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                    entry.target.classList.add('is-visible');
                } else {
                    navLink.classList.remove('active');
                    entry.target.classList.remove('is-visible');
                }
            }
        });
    }, observerOptions);
    projectDetails.forEach(detail => {
        if (detail) observer.observe(detail);
    });

    const sliders = document.querySelectorAll('.project-media-slider');
    sliders.forEach(slider => {
        const slides = slider.querySelectorAll('.slide');
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) slide.classList.add('active');
            });
        }

        if (prevBtn && nextBtn && slides.length > 0) {
            prevBtn.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
            });
            nextBtn.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            });
        }
    });

    // --- Event Listeners & Initialization ---
    themeToggleButton.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    window.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            body.style.setProperty('--cursor-x', `${e.clientX}px`);
            body.style.setProperty('--cursor-y', `${e.clientY}px`);
        });
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
        createShootingStars();
        createFloatingMotes(); // Create both so they're ready for theme switch
    });

    // --- Start Everything ---
    initializeTheme();
    resizeCanvas();
    createShootingStars();
    createFloatingMotes(); // Create both initially
    animate();
});