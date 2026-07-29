/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - MOBILE MODULE
 * File: assets/js/mobile.js
 * Architecture: ES6 / Modular / Touch-Optimized
 * ==========================================================================
 */

class MobileSystem {
    constructor() {
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 50; // Minimum distance in pixels to register a swipe
        
        this.init();
    }

    /**
     * Initializes the Mobile System
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.fixMobileViewportHeight();
            this.setupTouchHoverFix();
            this.setupSwipeGestures();
            this.enforceResponsiveLayout();
        });

        // Recalculate on orientation change or resize
        window.addEventListener('resize', () => {
            this.fixMobileViewportHeight();
            this.enforceResponsiveLayout();
        });
    }

    /**
     * Fixes the notorious mobile browser 100vh bug where the address bar
     * covers the bottom of the layout. Dynamically sets a CSS variable.
     */
    fixMobileViewportHeight() {
        // Calculate 1% of the actual viewport height
        const vh = window.innerHeight * 0.01;
        // Set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        /* Note: CSS should use height: calc(var(--vh, 1vh) * 100) instead of 100vh 
           for the main .portal-layout if exact fitting is required on mobile */
    }

    /**
     * Removes sticky hover states on touch devices to prevent buttons
     * from remaining visually "pressed" after being tapped.
     */
    setupTouchHoverFix() {
        // Detect if the device supports touch
        const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
        
        if (isTouchDevice) {
            // Add a class to body so we could potentially scope CSS hover states 
            // e.g., @media (hover: hover) { ... } is preferred, but this is a solid fallback
            document.body.classList.add('touch-device');
            
            // Remove focus/hover manually after click on buttons
            document.addEventListener('touchend', (e) => {
                const button = e.target.closest('.btn, .nav-link, .tab-btn, .card');
                if (button) {
                    setTimeout(() => {
                        button.blur(); // Remove focus state
                    }, 300);
                }
            });
        }
    }

    /**
     * Implements swipe gestures for mobile users to navigate the 3-column HUD
     * e.g., Swipe Right to open Left Sidebar, Swipe Left to open Telemetry.
     */
    setupSwipeGestures() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    /**
     * Determines the swipe direction and executes the corresponding UI action
     */
    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        const isMobileScreen = window.innerWidth <= 992;

        if (!isMobileScreen) return; // Only apply gestures on mobile/tablet screens

        if (Math.abs(swipeDistance) >= this.minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe Right -> Open Mobile Menu / Left Sidebar
                this.triggerMobileMenu(true);
            } else {
                // Swipe Left -> Close Mobile Menu / Open Telemetry (if implemented for mobile)
                this.triggerMobileMenu(false);
            }
        }
    }

    /**
     * Triggers the mobile menu toggle programmatically
     * @param {boolean} forceOpen - Whether to force it open or closed
     */
    triggerMobileMenu(forceOpen) {
        const navLinksContainer = document.getElementById('nav-links');
        const mobileBtn = document.getElementById('mobile-menu-btn');
        
        if (!navLinksContainer || !mobileBtn) return;

        const isCurrentlyOpen = navLinksContainer.style.display === 'flex';

        if (forceOpen && !isCurrentlyOpen) {
            mobileBtn.click(); // Programmatically click to utilize navigation.js logic
            if (window.AppCore) window.AppCore.notify('Command Menu Accessed', 'info');
        } else if (!forceOpen && isCurrentlyOpen) {
            mobileBtn.click();
        }
    }

    /**
     * Monitors window size to ensure correct display properties are restored
     * when a user resizes a desktop window back and forth past mobile breakpoints.
     */
    enforceResponsiveLayout() {
        const isDesktop = window.innerWidth > 992;
        const navLinksContainer = document.getElementById('nav-links');
        const mobileBtn = document.getElementById('mobile-menu-btn');

        if (isDesktop && navLinksContainer) {
            // Reset mobile styles when returning to desktop
            navLinksContainer.style.display = 'flex';
            navLinksContainer.style.flexDirection = 'row';
            navLinksContainer.style.position = 'static';
            navLinksContainer.style.background = 'transparent';
            navLinksContainer.style.backdropFilter = 'none';
            navLinksContainer.style.padding = '0';
            navLinksContainer.style.borderBottom = 'none';
            navLinksContainer.style.boxShadow = 'none';
            navLinksContainer.style.opacity = '1';
            navLinksContainer.style.transform = 'none';
            
            if (mobileBtn) mobileBtn.style.display = 'none';
        } else if (!isDesktop && navLinksContainer) {
            if (mobileBtn) mobileBtn.style.display = 'inline-flex';
            
            // Only hide it if it hasn't been explicitly opened by the user
            if (navLinksContainer.style.flexDirection !== 'column') {
                navLinksContainer.style.display = 'none';
            }
        }
    }
}

// Initialize Mobile System globally
window.MobileModule = new MobileSystem();
