/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - TELEMETRY MODULE
 * File: assets/js/telemetry.js
 * Architecture: ES6 / Modular / Real-time Data
 * ==========================================================================
 */

class TelemetrySystem {
    constructor() {
        this.clockInterval = null;
        this.healthInterval = null;
        
        // Base XP configuration
        this.xpConfig = {
            levelBase: 1000,
            multiplier: 1.5
        };

        this.init();
    }

    /**
     * Initializes the Telemetry System
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.startSystemClock();
            this.startHealthMonitor();
            this.loadUserProgress();
            this.setupNotificationListener();
        });
    }

    /**
     * Starts the real-time futuristic clock widget
     */
    startSystemClock() {
        const clockElement = document.getElementById('telemetry-clock');
        const dateElement = document.getElementById('telemetry-date');
        
        if (!clockElement) return;

        const updateClock = () => {
            const now = new Date();
            
            // Format: HH:MM:SS
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            // Format: YYYY.MM.DD
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');

            clockElement.textContent = `${hours}:${minutes}:${seconds}`;
            if (dateElement) {
                dateElement.textContent = `CYCLE ${year}.${month}.${day}`;
            }
        };

        updateClock();
        this.clockInterval = setInterval(updateClock, 1000);
    }

    /**
     * Simulates real-time server health and memory usage for the Cyberpunk feel
     */
    startHealthMonitor() {
        const cpuElement = document.getElementById('telemetry-cpu');
        const memElement = document.getElementById('telemetry-mem');
        const pingElement = document.getElementById('telemetry-ping');

        if (!cpuElement && !memElement && !pingElement) return;

        this.healthInterval = setInterval(() => {
            if (cpuElement) {
                // Fluctuate between 12% and 28%
                const cpu = Math.floor(Math.random() * 16) + 12;
                cpuElement.textContent = `${cpu}%`;
            }
            if (memElement) {
                // Fluctuate between 42% and 48%
                const mem = Math.floor(Math.random() * 6) + 42;
                memElement.textContent = `${mem}%`;
            }
            if (pingElement) {
                // Determine ping based on navigator.onLine state
                const isOnline = navigator.onLine;
                const ping = isOnline ? Math.floor(Math.random() * 15) + 12 : 999;
                pingElement.textContent = `${ping}ms`;
                pingElement.style.color = isOnline ? 'var(--accent-science)' : 'var(--accent-danger)';
            }
        }, 2000); // Update every 2 seconds
    }

    /**
     * Loads and calculates the user's XP and Level based on activity
     */
    loadUserProgress() {
        const xpElement = document.getElementById('telemetry-xp');
        const levelElement = document.getElementById('telemetry-level');
        const barElement = document.getElementById('telemetry-progress-bar');
        
        if (!xpElement || !levelElement || !barElement) return;

        // Retrieve XP from core state, default to 0
        let currentXP = 0;
        if (window.AppCore && window.AppCore.state && window.AppCore.state.userXP) {
            currentXP = parseInt(window.AppCore.state.userXP, 10);
        }

        // Calculate Level and Progress
        let level = 1;
        let xpForNextLevel = this.xpConfig.levelBase;
        let xpForCurrentLevel = 0;

        while (currentXP >= xpForNextLevel) {
            level++;
            xpForCurrentLevel = xpForNextLevel;
            xpForNextLevel = Math.floor(xpForNextLevel * this.xpConfig.multiplier);
        }

        const xpIntoLevel = currentXP - xpForCurrentLevel;
        const xpRequiredForNext = xpForNextLevel - xpForCurrentLevel;
        const progressPercentage = (xpIntoLevel / xpRequiredForNext) * 100;

        // Update UI
        xpElement.textContent = currentXP.toLocaleString();
        levelElement.textContent = level;
        
        // Animate the progress bar width
        setTimeout(() => {
            barElement.style.width = `${progressPercentage}%`;
        }, 500); // Slight delay for animation effect on load
    }

    /**
     * Awards XP to the user and triggers UI updates
     * @param {number} amount - Amount of XP to award
     * @param {string} reason - Description of the action (e.g., "Module Completed")
     */
    awardXP(amount, reason = 'Action Completed') {
        if (!window.AppCore) return;

        let currentXP = parseInt(window.AppCore.state.userXP || 0, 10);
        currentXP += amount;
        
        window.AppCore.setState('userXP', currentXP);
        this.loadUserProgress();
        
        // Notify the user via the HUD
        window.AppCore.notify(`+${amount} XP: ${reason}`, 'success');
    }

    /**
     * Listens for global system notifications from core.js and renders them
     * in the Telemetry Activity Log.
     */
    setupNotificationListener() {
        const logContainer = document.getElementById('telemetry-activity-log');
        
        window.addEventListener('systemNotification', (e) => {
            const { message, type, timestamp } = e.detail;
            
            // Map types to specific colors and icons
            const typeConfig = {
                'info': { color: 'var(--accent-cyan)', icon: 'fa-info-circle' },
                'success': { color: 'var(--accent-success)', icon: 'fa-check-circle' },
                'warning': { color: 'var(--accent-warning)', icon: 'fa-exclamation-triangle' },
                'danger': { color: 'var(--accent-danger)', icon: 'fa-times-circle' }
            };

            const config = typeConfig[type] || typeConfig['info'];
            
            // Format time for the log entry
            const date = new Date(timestamp);
            const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

            // Create notification element
            const logHTML = `
                <div class="log-entry animate-fade-up" style="display: flex; gap: var(--space-sm); align-items: flex-start; margin-bottom: var(--space-sm); font-size: 0.85rem; border-left: 2px solid ${config.color}; padding-left: var(--space-sm);">
                    <span class="font-mono" style="color: var(--text-muted); min-width: 45px;">${timeStr}</span>
                    <i class="fas ${config.icon}" style="color: ${config.color}; margin-top: 2px;"></i>
                    <span style="color: var(--text-primary); line-height: 1.4;">${message}</span>
                </div>
            `;

            if (logContainer) {
                // Prepend to the top of the log container
                logContainer.insertAdjacentHTML('afterbegin', logHTML);
                
                // Keep only the last 10 logs to prevent DOM bloat
                if (logContainer.children.length > 10) {
                    logContainer.removeChild(logContainer.lastElementChild);
                }
            }
        });
    }
}

// Initialize Telemetry System globally
window.TelemetryModule = new TelemetrySystem();
