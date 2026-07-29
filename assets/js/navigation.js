/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - NAVIGATION MODULE
 * File: assets/js/navigation.js
 * Architecture: ES6 / Modular / Command HUD
 * ==========================================================================
 */

class NavigationSystem {
    constructor() {
        // Core elements
        this.navLinks = document.querySelectorAll('.nav-link, .nav-item');
        this.centerViewport = document.querySelector('.center-viewport') || document.querySelector('main');
        
        this.init();
    }

    /**
     * Initializes the Navigation System
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.resolveActiveState();
            this.setupSmoothScrolling();
            this.setupPageTransitions();
            this.setupMobileMenuToggle();
        });

        // Listen for browser back/forward buttons to re-resolve active states
        window.addEventListener('popstate', () => {
            this.resolveActiveState();
        });
    }

    /**
     * Automatically detects the current URL and applies the 'active' class
     * to the corresponding navigation link in the sidebar or navbar.
     */
    resolveActiveState() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        this.navLinks.forEach(link => {
            // Remove active class from all links
            link.classList.remove('active', 'active-acc');

            const linkPath = new URL(link.href, window.location.origin).pathname;
            const linkHash = new URL(link.href, window.location.origin).hash;

            // Strict match for paths, or home page fallback
            const isPathMatch = currentPath === linkPath || (currentPath.endsWith('/') && linkPath.endsWith('index.html'));
            const isHashMatch = currentHash === linkHash;

            if (isPathMatch && (currentHash === '' || isHashMatch)) {
                link.classList.add('active');
                
                // If it's a sidebar item, ensure it's scrolled into view
                if (link.classList.contains('nav-item')) {
                    link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });
    }

    /**
     * Sets up smooth scrolling for anchor links (e.g., #section-id)
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Determine which scroll container to use (viewport or window)
                    const scrollContainer = this.centerViewport || window;
                    
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Update URL hash without jumping
                    history.pushState(null, null, targetId);
                    
                    // Trigger active state update
                    this.resolveActiveState();
                }
            });
        });
    }

    /**
     * Intercepts standard navigation to apply a futuristic fade-out/glitch transition
     * before the browser loads the new page.
     */
    setupPageTransitions() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetUrl = link.href;
                const isInternal = targetUrl.startsWith(window.location.origin);
                const isAnchor = targetUrl.includes('#') && targetUrl.split('#')[0] === window.location.href.split('#')[0];
                const isNewTab = link.target === '_blank';
                const isDownload = link.hasAttribute('download');

                // Only animate for standard internal page transitions
                if (isInternal && !isAnchor && !isNewTab && !isDownload) {
                    e.preventDefault();

                    // Apply a sweeping transition to the viewport
                    if (this.centerViewport) {
                        this.centerViewport.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        this.centerViewport.style.opacity = '0';
                        this.centerViewport.style.transform = 'translateY(20px) scale(0.98)';
                    } else {
                        document.body.style.transition = 'opacity 0.3s ease';
                        document.body.style.opacity = '0';
                    }

                    // Log telemetry event if AppCore is available
                    if (window.AppCore) {
                        window.AppCore.notify(`Routing to: ${new URL(targetUrl).pathname}`, 'info');
                    }

                    // Navigate after animation completes
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 300);
                }
            });
        });
    }

    /**
     * Re-implements and enhances the mobile menu toggle for responsive layouts
     */
    setupMobileMenuToggle() {
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const navLinksContainer = document.getElementById('nav-links');

        if (mobileBtn && navLinksContainer) {
            mobileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isExpanded = navLinksContainer.style.display === 'flex';
                
                if (isExpanded) {
                    navLinksContainer.style.opacity = '0';
                    navLinksContainer.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        navLinksContainer.style.display = 'none';
                    }, 200);
                } else {
                    navLinksContainer.style.display = 'flex';
                    navLinksContainer.style.flexDirection = 'column';
                    navLinksContainer.style.position = 'absolute';
                    navLinksContainer.style.top = '4.5rem';
                    navLinksContainer.style.left = '0';
                    navLinksContainer.style.right = '0';
                    navLinksContainer.style.background = 'var(--bg-glass-heavy)';
                    navLinksContainer.style.backdropFilter = 'var(--blur-heavy)';
                    navLinksContainer.style.padding = 'var(--space-md)';
                    navLinksContainer.style.borderBottom = 'var(--border-glass)';
                    navLinksContainer.style.boxShadow = 'var(--shadow-glass-elevated)';
                    navLinksContainer.style.zIndex = 'var(--z-dropdown)';
                    
                    // Animate in
                    requestAnimationFrame(() => {
                        navLinksContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                        navLinksContainer.style.opacity = '1';
                        navLinksContainer.style.transform = 'translateY(0)';
                    });
                }
            });
        }
    }
}

// Initialize navigation system
window.NavigationModule = new NavigationSystem();
