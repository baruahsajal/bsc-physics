/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - THEME MODULE
 * File: assets/js/theme.js
 * Architecture: ES6 / Modular / CSS Variable Manipulation
 * ==========================================================================
 */

class ThemeManager {
    constructor() {
        // Define color matrix overrides for different HUD skins
        this.themes = {
            'cyberpunk': {
                '--bg-base': '#050508',
                '--bg-surface': '#0f1016',
                '--accent-cyan': '#00f3ff',
                '--accent-physics': '#bd00ff',
                '--grad-physics': 'linear-gradient(135deg, #00f3ff 0%, #bd00ff 100%)',
                '--shadow-glow-cyan': '0 0 20px rgba(0, 243, 255, 0.2)'
            },
            'matrix': {
                '--bg-base': '#020a04',
                '--bg-surface': '#051408',
                '--accent-cyan': '#00ff41',
                '--accent-physics': '#008f11',
                '--grad-physics': 'linear-gradient(135deg, #00ff41 0%, #008f11 100%)',
                '--shadow-glow-cyan': '0 0 20px rgba(0, 255, 65, 0.2)'
            },
            'mars': {
                '--bg-base': '#120505',
                '--bg-surface': '#1a0808',
                '--accent-cyan': '#ff4b4b',
                '--accent-physics': '#ff8c00',
                '--grad-physics': 'linear-gradient(135deg, #ff4b4b 0%, #ff8c00 100%)',
                '--shadow-glow-cyan': '0 0 20px rgba(255, 75, 75, 0.2)'
            },
            'deep-space': {
                '--bg-base': '#000000',
                '--bg-surface': '#05050a',
                '--accent-cyan': '#ffffff',
                '--accent-physics': '#4444ff',
                '--grad-physics': 'linear-gradient(135deg, #ffffff 0%, #4444ff 100%)',
                '--shadow-glow-cyan': '0 0 20px rgba(255, 255, 255, 0.2)'
            }
        };

        this.currentTheme = 'cyberpunk';
        this.init();
    }

    /**
     * Initializes the Theme Manager
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadSavedTheme();
            this.setupThemeToggleButtons();
        });

        // Listen for core state changes if another module triggers a theme update
        window.addEventListener('stateChange', (e) => {
            if (e.detail && e.detail.key === 'theme' && e.detail.value !== this.currentTheme) {
                this.applyTheme(e.detail.value, false); // false to prevent infinite loop
            }
        });
    }

    /**
     * Loads the theme from AppCore state or localStorage on boot
     */
    loadSavedTheme() {
        let savedTheme = 'cyberpunk';

        if (window.AppCore && window.AppCore.state && window.AppCore.state.theme) {
            savedTheme = window.AppCore.state.theme;
        } else {
            // Fallback if AppCore isn't loaded yet
            try {
                const localState = localStorage.getItem('eduos_state');
                if (localState) {
                    const parsed = JSON.parse(localState);
                    if (parsed.theme) savedTheme = parsed.theme;
                }
            } catch (e) {
                console.warn('[THEME] Unable to read local storage for theme.');
            }
        }

        if (this.themes[savedTheme]) {
            this.applyTheme(savedTheme, false);
        }
    }

    /**
     * Locates any buttons with data-theme attributes and attaches click listeners
     */
    setupThemeToggleButtons() {
        const themeButtons = document.querySelectorAll('[data-theme]');
        
        themeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedTheme = btn.getAttribute('data-theme');
                if (this.themes[selectedTheme]) {
                    this.applyTheme(selectedTheme, true);
                    
                    // Update active state on buttons if they are part of a selector group
                    themeButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });
    }

    /**
     * Applies the selected theme by overriding CSS variables on the :root element
     * @param {string} themeName - The key of the theme in the this.themes dictionary
     * @param {boolean} saveState - Whether to broadcast this change to the state manager
     */
    applyTheme(themeName, saveState = true) {
        if (!this.themes[themeName]) {
            console.error(`[THEME] Theme '${themeName}' does not exist.`);
            return;
        }

        const themeData = this.themes[themeName];
        const root = document.documentElement;

        // Apply a smooth transition to the body background for a futuristic crossfade
        document.body.style.transition = 'background-color 0.5s ease';

        // Loop through the dictionary and apply variables
        Object.keys(themeData).forEach(property => {
            root.style.setProperty(property, themeData[property]);
        });

        this.currentTheme = themeName;

        // Persist via Core module if requested
        if (saveState && window.AppCore) {
            window.AppCore.setState('theme', themeName);
            window.AppCore.notify(`HUD Protocol Switched: ${themeName.toUpperCase()}`, 'info');
        }

        // Dispatch specific event for UI components that might need manual redraws
        window.dispatchEvent(new CustomEvent('themeSwitched', { detail: { theme: themeName } }));
    }

    /**
     * Programmatically toggle to the next theme in the sequence (useful for a single toggle button)
     */
    cycleNextTheme() {
        const themeKeys = Object.keys(this.themes);
        let currentIndex = themeKeys.indexOf(this.currentTheme);
        
        currentIndex = (currentIndex + 1) % themeKeys.length;
        this.applyTheme(themeKeys[currentIndex], true);
    }
}

// Initialize Theme System globally
window.ThemeModule = new ThemeManager();
