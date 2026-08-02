/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - ANIMATIONS MODULE
 * File: assets/js/animations.js
 * Architecture: ES6 / Modular / Performance-Optimized (IntersectionObserver)
 * ==========================================================================
 */

class AnimationSystem {
    constructor() {
        this.observers = [];
        this.init();
    }

    /**
     * Initializes the Animation System
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupScrollReveal();
            this.setupHolographicTilt();
            this.setupDynamicGlow();
            
            // Initialize new HUD upgrades
            this.setupTelemetryClock();
            this.setupAmbientParticles();
        });

        // Re-initialize animations when dynamic content is injected (e.g., dashboard load)
        window.addEventListener('contentInjected', () => {
            this.setupScrollReveal();
            this.setupHolographicTilt();
        });
    }

    /**
     * Sets up Intersection Observers to trigger fade-up animations 
     * only when elements enter the viewport to save CPU/GPU cycles.
     */
    setupScrollReveal() {
        // Elements that should animate on scroll, but haven't been animated yet
        const revealElements = document.querySelectorAll('.animate-fade-up:not(.revealed)');

        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Trigger the animation by resetting inline animation-play-state
                        // or adding a specific class that fires the keyframes
                        entry.target.style.animationPlayState = 'running';
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                rootMargin: '0px 0px -50px 0px', // Trigger slightly before the bottom
                threshold: 0.1
            });

            revealElements.forEach(el => {
                // Pause animation initially until it scrolls into view
                el.style.animationPlayState = 'paused';
                revealObserver.observe(el);
                this.observers.push(revealObserver);
            });
        } else {
            // Fallback for ancient browsers: just reveal them immediately
            revealElements.forEach(el => el.classList.add('revealed'));
        }
    }

    /**
     * Implements a subtle 3D tilt effect on interactive HUD cards.
     * Gives a physical depth feel similar to holographic projections.
     */
    setupHolographicTilt() {
        const cards = document.querySelectorAll('.card');

        cards.forEach(card => {
            // Remove existing listeners to prevent duplication if called multiple times
            card.removeEventListener('mousemove', this.handleTilt);
            card.removeEventListener('mouseleave', this.resetTilt);

            card.addEventListener('mousemove', this.handleTilt);
            card.addEventListener('mouseleave', this.resetTilt);
        });
    }

    /**
     * Calculates and applies the 3D rotation transform based on mouse position
     * @param {MouseEvent} e 
     */
    handleTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();

        // Calculate mouse position relative to the center of the card
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation limits (max 5 degrees for subtlety)
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        // Apply transform via requestAnimationFrame for 60fps smoothness
        requestAnimationFrame(() => {
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            card.style.transition = 'transform 0.1s ease-out';
        });
    }

    /**
     * Resets the card to its original flat state when mouse leaves
     * @param {MouseEvent} e 
     */
    resetTilt(e) {
        const card = e.currentTarget;
        requestAnimationFrame(() => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
            card.style.transition = 'transform 0.5s ease-out'; // Slower, snapping back transition
        });
    }

    /**
     * Creates a dynamic glowing orb effect that follows the user's cursor
     * across the background, enhancing the Cyberpunk terminal aesthetic.
     */
    setupDynamicGlow() {
        // Create the glow element
        const glow = document.createElement('div');
        glow.id = 'cursor-glow';
        glow.style.position = 'fixed';
        glow.style.width = '400px';
        glow.style.height = '400px';
        glow.style.background = 'radial-gradient(circle, rgba(0, 243, 255, 0.03) 0%, transparent 70%)';
        glow.style.borderRadius = '50%';
        glow.style.pointerEvents = 'none';
        glow.style.zIndex = '0';
        glow.style.transform = 'translate(-50%, -50%)';
        glow.style.transition = 'opacity 0.3s ease';
        glow.style.opacity = '0';

        document.body.appendChild(glow);

        let isMoving = false;
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            glow.style.opacity = '1';

            if (!isMoving) {
                isMoving = true;
                requestAnimationFrame(this.updateGlowPosition.bind(this, glow, () => {
                    glow.style.left = `${mouseX}px`;
                    glow.style.top = `${mouseY}px`;
                    isMoving = false;
                }));
            }
        });

        // Hide glow when cursor leaves the window
        document.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
        });
    }

    /**
     * Helper to execute position updates on the next animation frame
     */
    updateGlowPosition(element, callback) {
        callback();
    }

    /**
     * =========================================
     * IST TELEMETRY CLOCK
     * =========================================
     */
    setupTelemetryClock() {
        const clockDisplay = document.getElementById('system-ist-clock');
        if (!clockDisplay) return;

        function updateTick() {
            const now = new Date();
            
            // Force Indian Standard Time (IST) formatting
            const timeOptions = { 
                timeZone: 'Asia/Kolkata', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: true 
            };
            
            // Generates format: "05:30:36 PM"
            const formattedTime = new Intl.DateTimeFormat('en-IN', timeOptions).format(now);
            clockDisplay.textContent = formattedTime;
        }

        // Fire immediately, then lock to 1-second interval loops
        updateTick();
        setInterval(updateTick, 1000);
    }

    /**
     * =========================================
     * AMBIENT PARTICLE MESH (3D Depth)
     * =========================================
     */
    setupAmbientParticles() {
        // Establish canvas layer at the base of the DOM
        let meshContainer = document.getElementById('ambient-particle-mesh');
        if (!meshContainer) {
            meshContainer = document.createElement('div');
            meshContainer.id = 'ambient-particle-mesh';
            document.body.prepend(meshContainer);
        }

        // Keep particle count moderate to protect client-side rendering performance
        const maxOrbs = 30; 

        const spawnOrb = () => {
            const orb = document.createElement('div');
            orb.classList.add('cyber-orb');
            
            // Randomized volumetric sizing (2px to 7px)
            const diameter = Math.random() * 5 + 2;
            orb.style.width = `${diameter}px`;
            orb.style.height = `${diameter}px`;
            
            // Spawn randomly across the X-axis of the viewport
            orb.style.left = `${Math.random() * 100}vw`;
            
            // Randomized velocity (Duration between 15s and 25s for a slow, deep-space feel)
            const flightTime = Math.random() * 10 + 15;
            orb.style.animationDuration = `${flightTime}s`;
            
            // Staggered launch times
            orb.style.animationDelay = `${Math.random() * 5}s`;
            
            meshContainer.appendChild(orb);

            // Garbage collection: Remove orb after it leaves viewport, spawn a replacement
            setTimeout(() => {
                orb.remove();
                spawnOrb();
            }, (flightTime + 5) * 1000);
        };

        // Initial sequence burst
        for (let i = 0; i < maxOrbs; i++) {
            spawnOrb();
        }
    }
}

// Initialize Animation System globally
window.AnimationModule = new AnimationSystem();
