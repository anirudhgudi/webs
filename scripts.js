document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const body = document.body;
    const themeToggleButton = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const canvas = document.getElementById('shooting-stars-canvas');
    const ctx = canvas.getContext('2d');
    
    let floatingMotes = [];
    let shimmerPoints = [];
    const GRID_SIZE = 50; // Size of the grid cells in pixels

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

    // --- Light Mode: Floating Motes ---
    class FloatingMote {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.speedY = -Math.random() * 0.3 - 0.1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.y < -this.radius) {
                this.y = canvas.height + this.radius;
                this.x = Math.random() * canvas.width;
            }
        }
        draw() {
            const moteColor = 'rgba(74, 93, 80, 0.7)';
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = moteColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function createFloatingMotes() {
        floatingMotes = [];
        const count = 30;
        for (let i = 0; i < count; i++) {
            floatingMotes.push(new FloatingMote());
        }
    }

    // --- Dark Mode: Grid Shimmer ---
    function drawGrid() {
        ctx.save();
        ctx.strokeStyle = '#3a443e'; // var(--divider-color-dark)
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    class ShimmerPoint {
        constructor() { this.reset(); }
        reset() {
            const col = Math.floor(Math.random() * (canvas.width / GRID_SIZE));
            const row = Math.floor(Math.random() * (canvas.height / GRID_SIZE));
            this.x = col * GRID_SIZE;
            this.y = row * GRID_SIZE;
            this.opacity = 0;
            this.maxOpacity = Math.random() * 0.7 + 0.2;
            this.speed = Math.random() * 0.015 + 0.005;
            this.fadingIn = true;
        }
        update() {
            if (this.fadingIn) {
                this.opacity += this.speed;
                if (this.opacity >= this.maxOpacity) {
                    this.opacity = this.maxOpacity;
                    this.fadingIn = false;
                }
            } else {
                this.opacity -= this.speed;
                if (this.opacity <= 0) {
                    this.reset(); // Re-assign to a new random point
                }
            }
        }
        draw() {
            const shimmerColor = '#8fbc8f'; // var(--accent-color-dark)
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = shimmerColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.shadowColor = shimmerColor;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        }
    }
    
    function createShimmerPoints() {
        shimmerPoints = [];
        const count = 75;
        for (let i = 0; i < count; i++) {
            shimmerPoints.push(new ShimmerPoint());
        }
    }

    // --- Main Animation Loop ---
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (body.classList.contains('dark')) {
            drawGrid();
            shimmerPoints.forEach(point => {
                point.update();
                point.draw();
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
        createFloatingMotes();
        createShimmerPoints();
    });

    // --- Start Everything ---
    initializeTheme();
    resizeCanvas();
    createFloatingMotes();
    createShimmerPoints();
    animate();
});