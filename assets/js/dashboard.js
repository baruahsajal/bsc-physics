/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - DASHBOARD MODULE
 * File: assets/js/dashboard.js
 * Architecture: ES6 / Modular / Data-Driven UI
 * ==========================================================================
 */

class DashboardManager {
    constructor() {
        this.animationDelayStep = 100; // ms between card reveals
        this.init();
    }

    /**
     * Initializes the Dashboard Manager
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            // Check if there's a designated container for dynamic dashboard injection
            const dynamicGrid = document.querySelector('[data-dynamic-grid]');
            if (dynamicGrid) {
                const dataSource = dynamicGrid.getAttribute('data-source');
                if (dataSource) {
                    this.fetchAndRenderData(dataSource, dynamicGrid);
                }
            }
        });
    }

    /**
     * Fetches configuration data and routes to the appropriate renderer
     * @param {string} url - The JSON endpoint or file path
     * @param {HTMLElement} container - The DOM element to inject content into
     */
    async fetchAndRenderData(url, container) {
        try {
            if (window.AppCore) {
                window.AppCore.notify('Establishing uplink to databanks...', 'info');
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            const gridType = container.getAttribute('data-grid-type') || 'semester';

            container.innerHTML = ''; // Clear loading states

            if (gridType === 'semester') {
                this.renderSemesterMatrix(data, container);
            } else if (gridType === 'laboratory') {
                this.renderLabMatrix(data, container);
            }

            if (window.AppCore) {
                window.AppCore.notify('Uplink successful. Dashboard populated.', 'success');
            }

        } catch (error) {
            console.error('[DASHBOARD] Data Fetch Error:', error);
            container.innerHTML = `
                <div class="glass-panel" style="padding: var(--space-xl); text-align: center; border-color: var(--accent-danger);">
                    <i class="fas fa-exclamation-triangle" style="color: var(--accent-danger); font-size: 2rem; margin-bottom: var(--space-md);"></i>
                    <h3 class="heading-display" style="color: var(--accent-danger);">Data Retrieval Failed</h3>
                    <p style="color: var(--text-secondary);">Unable to connect to the central databanks. Operating in offline cache mode if available.</p>
                </div>
            `;
            if (window.AppCore) window.AppCore.notify('System Error: Data retrieval failed.', 'danger');
        }
    }

    /**
     * Renders the B.Sc Physics Semester Grid dynamically
     * @param {Array} semesters - Array of semester objects
     * @param {HTMLElement} container - The grid container
     */
    renderSemesterMatrix(semesters, container) {
        semesters.forEach((sem, index) => {
            const delay = index * this.animationDelayStep;
            const cardHTML = this.buildSemesterCard(sem, delay);
            container.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    /**
     * Renders the Interactive Laboratory Hub Grid
     * @param {Array} experiments - Array of experiment objects
     * @param {HTMLElement} container - The grid container
     */
    renderLabMatrix(experiments, container) {
        experiments.forEach((exp, index) => {
            const delay = index * this.animationDelayStep;
            const cardHTML = this.buildLabCard(exp, delay);
            container.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    /**
     * Builds the HTML string for a single Semester Card
     * @param {Object} data - Semester configuration data
     * @param {number} delay - Animation delay in ms
     * @returns {string} HTML string
     */
    buildSemesterCard(data, delay) {
        // Status Badge Logic
        let badgeClass = 'badge-progress';
        let badgeText = 'In Progress';
        let borderStyle = 'border-top: 3px solid var(--accent-physics);';
        let cardOpacity = '1';
        let pointerEvents = 'auto';

        if (data.status === 'completed') {
            badgeClass = 'badge-completed';
            badgeText = 'Completed';
            borderStyle = 'border-top: 3px solid var(--accent-success);';
        } else if (data.status === 'locked') {
            badgeClass = 'badge-locked';
            badgeText = 'Locked';
            borderStyle = 'border-top: 3px solid var(--border-glass);';
            cardOpacity = '0.6';
            pointerEvents = 'none';
        }

        // Subject List Generation
        const subjectsHTML = data.subjects.map(sub => `
            <li style="margin-bottom: var(--space-sm); padding-bottom: var(--space-sm); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div class="font-mono" style="font-size: 0.75rem; color: var(--accent-physics);">${sub.code}</div>
                    <div style="font-size: 0.9rem; color: var(--text-primary);">${sub.name}</div>
                </div>
                ${sub.url ? `
                <a href="${sub.url}" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.7rem;">
                    <i class="fas fa-book"></i>
                </a>` : ''}
            </li>
        `).join('');

        return `
            <div class="glass-panel card animate-fade-up" style="animation-delay: ${delay}ms; ${borderStyle} opacity: ${cardOpacity}; pointer-events: ${pointerEvents};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <h2 class="heading-display" style="font-size: 1.25rem; ${data.status === 'in-progress' ? 'color: var(--accent-physics);' : ''}">${data.title}</h2>
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
                <ul style="list-style: none; margin: 0 0 var(--space-md) 0; flex-grow: 1;">
                    ${subjectsHTML}
                </ul>
                <a href="${data.dashboardUrl || '#'}" class="btn ${data.status === 'in-progress' ? 'btn-primary' : 'btn-outline'}" style="width: 100%;">
                    ${data.status === 'locked' ? '<i class="fas fa-lock"></i> Encrypted' : 'Initialize Module'}
                </a>
            </div>
        `;
    }

    /**
     * Builds the HTML string for a single Laboratory Card
     * @param {Object} data - Experiment configuration data
     * @param {number} delay - Animation delay in ms
     * @returns {string} HTML string
     */
    buildLabCard(data, delay) {
        return `
            <div class="glass-panel card animate-fade-up" style="animation-delay: ${delay}ms;">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                    <span class="badge badge-system">${data.category}</span>
                    <span class="font-mono" style="font-size: 0.8rem; color: var(--text-secondary);">${data.id}</span>
                </div>
                
                <h2 class="heading-display" style="font-size: 1.25rem; margin-bottom: var(--space-xs);">${data.title}</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem; flex-grow: 1;">${data.description}</p>
                
                <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
                    <a href="${data.manualUrl || '#'}" class="btn btn-outline" style="flex: 1; padding: 0.4rem; font-size: 0.75rem;">
                        <i class="fas fa-book-open"></i> Manual
                    </a>
                    <a href="${data.simulationUrl || '#'}" class="btn btn-primary" style="flex: 1; padding: 0.4rem; font-size: 0.75rem;">
                        <i class="fas fa-play"></i> Simulate
                    </a>
                </div>
                
                <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-xs);">
                    <a href="${data.obsSheetUrl || '#'}" class="btn btn-outline" style="flex: 1; padding: 0.4rem; font-size: 0.75rem; border-color: rgba(255,255,255,0.2); color: var(--text-secondary);">
                        <i class="fas fa-table"></i> Obs. Sheet
                    </a>
                    <a href="${data.vivaUrl || '#'}" class="btn btn-outline" style="flex: 1; padding: 0.4rem; font-size: 0.75rem; border-color: rgba(255,255,255,0.2); color: var(--text-secondary);">
                        <i class="fas fa-comments"></i> Viva Qs
                    </a>
                </div>
            </div>
        `;
    }
}

// Initialize Dashboard Manager globally
window.DashboardModule = new DashboardManager();
