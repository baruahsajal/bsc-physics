/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - TABS MODULE
 * File: assets/js/tabs.js
 * Architecture: ES6 / Modular / Component Logic
 * ==========================================================================
 */

class TabManager {
    constructor() {
        this.init();
    }

    /**
     * Initializes the Tab Manager
     */
    init() {
        // Setup on initial DOM load
        document.addEventListener('DOMContentLoaded', () => {
            this.setupTabs();
        });

        // Re-initialize if dynamic content is injected into the DOM (e.g., via Dashboard module)
        window.addEventListener('contentInjected', () => {
            this.setupTabs();
        });
    }

    /**
     * Locates all tab buttons and attaches event listeners
     */
    setupTabs() {
        // Target standard .tab-btn and specialized .auth-tab classes
        const tabButtons = document.querySelectorAll('.tab-btn, .auth-tab');

        tabButtons.forEach(btn => {
            // Remove existing listeners to prevent duplicates during re-initialization
            btn.removeEventListener('click', this.handleTabClick);
            
            // Attach new listener, binding 'this' to the TabManager instance
            btn.addEventListener('click', this.handleTabClick.bind(this));
        });
    }

    /**
     * Handles the tab click event, managing active states for buttons and content panels
     * @param {Event} e - The click event object
     */
    handleTabClick(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        
        // Retrieve the target ID (supporting both data-tab and legacy data-target attributes)
        const targetId = btn.getAttribute('data-tab') || btn.getAttribute('data-target');
        if (!targetId) {
            console.warn('[TABS] Clicked tab button is missing a data-tab or data-target attribute.');
            return;
        }

        // Isolate the tab group container to allow multiple independent tab widgets per page
        // Falls back to document if no specific container wrapper is found
        const container = btn.closest('.container') || btn.closest('.auth-container') || btn.closest('.glass-panel') || document;
        
        const targetContent = document.getElementById(targetId);
        if (!targetContent) {
            console.warn(`[TABS] Target content panel with ID '${targetId}' not found.`);
            return;
        }

        // 1. Deactivate all buttons within the same container
        const groupButtons = container.querySelectorAll('.tab-btn, .auth-tab');
        groupButtons.forEach(b => b.classList.remove('active'));

        // 2. Deactivate all content panels within the same container
        const groupContents = container.querySelectorAll('.tab-content');
        groupContents.forEach(c => c.classList.remove('active'));

        // 3. Activate the clicked button and its corresponding content panel
        btn.classList.add('active');
        targetContent.classList.add('active');

        // Dispatch a custom event so other modules (like Animations) can react to the layout change
        window.dispatchEvent(new CustomEvent('tabChanged', {
            detail: {
                targetId: targetId,
                container: container
            }
        }));

        // Optional telemetry logging via AppCore
        if (window.AppCore && window.AppCore.state && window.AppCore.state.debugMode) {
            console.log(`[TABS] Switched to tab: ${targetId}`);
        }
    }
}

// Initialize globally for automatic execution
window.TabModule = new TabManager();
