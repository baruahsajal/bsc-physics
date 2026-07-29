/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - CORE SYSTEM
 * File: assets/js/core.js
 * Architecture: Modular ES6 / Command HUD / PWA
 * ==========================================================================
 */

class SystemCore {
    constructor() {
        this.version = '1.0.0';
        this.isOnline = navigator.onLine;
        this.state = this.loadState();

        this.init();
    }

    /**
     * Initializes the Core System
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.registerServiceWorker();
            this.setupNetworkListeners();
            this.setupKeyboardShortcuts();
            this.logSystemBoot();
        });
    }

    /**
     * Loads the saved system state from local storage
     * @returns {Object} Current state parameters
     */
    loadState() {
        const defaultState = {
            sidebarCollapsed: false,
            telemetryVisible: true,
            lastVisited: null,
            theme: 'cyberpunk'
        };
        
        try {
            const saved = localStorage.getItem('eduos_state');
            return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
        } catch (e) {
            console.error('Failed to load system state:', e);
            return defaultState;
        }
    }

    /**
     * Saves a specific key-value pair to the global state
     * @param {string} key - State key
     * @param {any} value - State value
     */
    setState(key, value) {
        this.state[key] = value;
        try {
            localStorage.setItem('eduos_state', JSON.stringify(this.state));
            
            // Dispatch a custom event so other modules can react to state changes
            window.dispatchEvent(new CustomEvent('stateChange', { 
                detail: { key, value } 
            }));
        } catch (e) {
            console.error('Failed to save system state:', e);
        }
    }

    /**
     * Registers the Service Worker for Offline Caching and PWA support
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Check if we are running on GitHub pages or local to set correct path
            const isGitHubPages = window.location.hostname.includes('github.io');
            const repoBase = isGitHubPages ? '/bsc-physics' : '';
            const swPath = `${repoBase}/sw.js`;

            // Note: sw.js file needs to be present in the root directory
            window.addEventListener('load', () => {
                navigator.serviceWorker.register(swPath).then(registration => {
                    console.log('[SYSTEM] ServiceWorker registration successful with scope: ', registration.scope);
                }).catch(err => {
                    console.warn('[SYSTEM] ServiceWorker registration failed (Normal if running locally without HTTPS or missing sw.js): ', err);
                });
            });
        }
    }

    /**
     * Monitors network status for the HUD telemetry
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notify('System Online. Uplink Restored.', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notify('System Offline. Running on cached databanks.', 'warning');
        });
    }

    /**
     * Sets up global keyboard shortcuts (Command HUD feel)
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in an input or textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Command Palette / Search (Ctrl + K or Cmd + K)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('openCommandPalette'));
                console.log('[SYSTEM] Command Palette Initiated');
            }

            // Toggle Telemetry Panel (Ctrl + B)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                const telemetryVisible = this.state.telemetryVisible;
                this.setState('telemetryVisible', !telemetryVisible);
            }
        });
    }

    /**
     * Global Notification System (To be hooked into HUD UI)
     * @param {string} message - The notification text
     * @param {string} type - 'info', 'success', 'warning', 'danger'
     */
    notify(message, type = 'info') {
        // Broadcast event so UI modules (like telemetry.js) can catch and render it
        window.dispatchEvent(new CustomEvent('systemNotification', {
            detail: { message, type, timestamp: Date.now() }
        }));
        
        // Fallback console log for debugging
        const colors = {
            info: '#00f3ff',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444'
        };
        console.log(`%c[NOTIFICATION] ${message}`, `color: ${colors[type] || colors.info}`);
    }

    /**
     * Visual console boot sequence
     */
    logSystemBoot() {
        console.log('%c========================================', 'color: #00f3ff');
        console.log('%c🚀 S.BARUAH ACADEMY OS INITIALIZED', 'color: #00f3ff; font-weight: bold; font-size: 14px;');
        console.log(`%cVersion: ${this.version}`, 'color: #bd00ff');
        console.log('%cStatus: ALL SYSTEMS NOMINAL', 'color: #10b981');
        console.log('%c========================================', 'color: #00f3ff');
    }

    // --- UTILITY METHODS --- //

    /**
     * Wrapper for querySelector
     */
    select(selector, parent = document) {
        return parent.querySelector(selector);
    }

    /**
     * Wrapper for querySelectorAll
     */
    selectAll(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }

    /**
     * Event listener wrapper with delegation support
     */
    on(event, selector, callback, parent = document) {
        parent.addEventListener(event, e => {
            if (e.target.closest(selector)) {
                callback(e);
            }
        });
    }
}

// Initialize and expose globally for other modules to use without complex bundling
window.AppCore = new SystemCore();
