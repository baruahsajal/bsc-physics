/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - ACCORDION MODULE
 * File: assets/js/accordion.js
 * Architecture: ES6 / Modular / Component Logic
 * ==========================================================================
 */

class AccordionManager {
    constructor() {
        this.init();
    }

    /**
     * Initializes the Accordion Manager
     */
    init() {
        // Setup on initial DOM load
        document.addEventListener('DOMContentLoaded', () => {
            this.setupAccordions();
            this.setupAnswerReveals();
        });

        // Re-initialize if dynamic content is injected into the DOM
        window.addEventListener('contentInjected', () => {
            this.setupAccordions();
            this.setupAnswerReveals();
        });

        // Recalculate heights on window resize for fluid responsiveness
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Locates all accordion buttons and attaches the toggle logic
     */
    setupAccordions() {
        const accordions = document.querySelectorAll('.accordion');

        accordions.forEach(acc => {
            // Remove existing listeners to prevent double-firing
            acc.removeEventListener('click', this.handleAccordionClick);
            
            // Attach new listener
            acc.addEventListener('click', this.handleAccordionClick.bind(this));
        });
    }

    /**
     * Handles the click event for an accordion, expanding or collapsing its panel
     * @param {Event} e - The click event
     */
    handleAccordionClick(e) {
        e.preventDefault();
        const acc = e.currentTarget;
        
        // Toggle the active class for styling (glow effects, borders)
        acc.classList.toggle('active-acc');
        
        // The panel content must immediately follow the accordion button in the DOM
        const panel = acc.nextElementSibling;
        if (!panel || !panel.classList.contains('panel')) {
            console.warn('[ACCORDION] No valid .panel element found next to the accordion.');
            return;
        }

        // Toggle the rotation of the chevron icon if it exists
        const icon = acc.querySelector('.fa-chevron-down');
        if (icon) {
            icon.style.transform = acc.classList.contains('active-acc') ? 'rotate(180deg)' : 'rotate(0)';
            icon.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }

        // Animate the panel height
        if (panel.style.maxHeight) {
            // Collapse
            panel.style.maxHeight = null;
        } else {
            // Expand (calculating exact scrollHeight for smooth transition)
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    }

    /**
     * Sets up the interactive "Reveal Answer" buttons within panels
     * Specifically designed for PYQ (Previous Year Questions) and Viva interfaces
     */
    setupAnswerReveals() {
        const revealBtns = document.querySelectorAll('.show-ans-btn');

        revealBtns.forEach(btn => {
            btn.removeEventListener('click', this.handleRevealClick);
            btn.addEventListener('click', this.handleRevealClick.bind(this));
        });
    }

    /**
     * Toggles the visibility of hidden answer boxes
     * @param {Event} e - The click event
     */
    handleRevealClick(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const targetId = btn.getAttribute('data-target');
        const answerBox = document.getElementById(targetId);

        if (!answerBox) {
            console.warn(`[ACCORDION] Answer box with ID '${targetId}' not found.`);
            return;
        }

        // Check computed display style to toggle correctly
        const isHidden = window.getComputedStyle(answerBox).display === 'none';

        if (!isHidden) {
            answerBox.style.display = "none";
            btn.innerHTML = btn.getAttribute('data-default-text') || 'Reveal Data';
            btn.classList.remove('active');
        } else {
            answerBox.style.display = "block";
            // Add a subtle slide-in animation class if available in CSS
            answerBox.style.animation = "fadeInUp 0.3s ease-out forwards";
            btn.innerHTML = '<i class="fas fa-eye-slash"></i> Conceal Data';
            btn.classList.add('active');
            
            // If the answer is inside an accordion panel, we must update the panel's maxHeight
            // so it doesn't get clipped.
            const parentPanel = answerBox.closest('.panel');
            if (parentPanel && parentPanel.style.maxHeight) {
                // Temporarily allow it to expand, then lock the new height
                parentPanel.style.maxHeight = 'none';
                const newHeight = parentPanel.scrollHeight;
                parentPanel.style.maxHeight = newHeight + 'px';
            }
        }
    }

    /**
     * Recalculates heights for active accordions if the user resizes the window,
     * ensuring text wrapping doesn't break the layout inside open panels.
     */
    handleResize() {
        const activeAccordions = document.querySelectorAll('.accordion.active-acc');
        activeAccordions.forEach(acc => {
            const panel = acc.nextElementSibling;
            if (panel && panel.classList.contains('panel')) {
                // Reset to calculate true height without bounds
                panel.style.maxHeight = 'none';
                const newHeight = panel.scrollHeight;
                panel.style.maxHeight = newHeight + "px";
            }
        });
    }
}

// Initialize globally
window.AccordionModule = new AccordionManager();
