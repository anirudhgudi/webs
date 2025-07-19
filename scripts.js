document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const body = document.body;
    const themeToggleButton = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const canvas = document.getElementById('shooting-stars-canvas');
    const ctx = canvas.getContext('2d');

    let shootingStars = [];

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

    // --- Canvas & Star Definitions ---
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

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
            const isDark = body.classList.contains('dark');
            const starColor = isDark ? 'rgba(143, 188, 143, 0.85)' : 'rgba(74, 93, 80, 0.85)';

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
        shootingStars.forEach(star => {
            star.update();
            star.draw();
        });
        requestAnimationFrame(animate);
    }

    // --- Project Logbook Scroll Sync ---
    const projectNavLinks = document.querySelectorAll('.project-nav-item a');
    const projectDetails = document.querySelectorAll('.project-detail-item');

    const observerOptions = {
        root: null,
        rootMargin: "-40% 0px -60% 0px",
        threshold: 0
    };

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

    // --- Project Slideshow Logic ---
    const sliders = document.querySelectorAll('.project-media-slider');
    sliders.forEach(slider => {
        const slides = slider.querySelectorAll('.slide');
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
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
    });

    // --- Start Everything ---
    initializeTheme();
    resizeCanvas();
    createShootingStars();
    animate();
});