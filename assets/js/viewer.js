/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - UNIVERSAL VIEWER MODULE
 * File: assets/js/viewer.js
 * Architecture: ES6 / Modular / Iframe Management
 * ==========================================================================
 */

class ContentViewer {
    constructor() {
        // DOM Elements
        this.titleElement = document.getElementById('content-title');
        this.typeElement = document.getElementById('content-type');
        this.frameElement = document.getElementById('content-frame');
        this.downloadBtn = document.getElementById('download-content-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        
        // URL Parameters
        this.urlParams = new URLSearchParams(window.location.search);
        this.contentFile = this.urlParams.get('file');
        this.contentType = this.urlParams.get('type') || 'Data Module';
        this.contentTitle = this.urlParams.get('title') || 'Encrypted File';
        this.requiredPortal = this.urlParams.get('portal');

        this.init();
    }

    /**
     * Initializes the Viewer Engine
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.verifySecurityAccess();
            this.populateMetadata();
            this.loadContentPayload();
            this.setupFullscreenToggle();
            this.setupDownloadHandler();
            this.logTelemetry();
        });
    }

    /**
     * Checks if the current document requires authentication before loading
     */
    verifySecurityAccess() {
        if (this.requiredPortal && window.AuthSystem) {
            // Offload verification to the Auth module
            window.AuthSystem.verifyAccess(this.requiredPortal);
        }
    }

    /**
     * Populates the HUD header with the file's metadata
     */
    populateMetadata() {
        if (this.titleElement) {
            this.titleElement.textContent = decodeURIComponent(this.contentTitle);
        }
        
        if (this.typeElement) {
            const decodedType = decodeURIComponent(this.contentType);
            this.typeElement.textContent = decodedType;
            
            // Adjust badge styling based on content type for a dynamic HUD feel
            this.typeElement.className = 'badge';
            if (decodedType.toLowerCase().includes('simulation')) {
                this.typeElement.classList.add('badge-system'); // Cyan for interactives
            } else if (decodedType.toLowerCase().includes('notes')) {
                this.typeElement.classList.add('badge-completed'); // Green for text
            } else {
                this.typeElement.classList.add('badge-progress'); // Warning orange default
            }
        }
    }

    /**
     * Injects the target file into the secure iframe, or displays a fallback error
     */
    loadContentPayload() {
        if (this.frameElement && this.contentFile) {
            const decodedUrl = decodeURIComponent(this.contentFile);
            
            // Provide visual feedback while loading
            if (window.AppCore) {
                window.AppCore.notify(`Initiating neural link to: ${this.contentTitle}...`, 'info');
            }

            // Bind onload event to remove loading states or trigger telemetry
            this.frameElement.onload = () => {
                if (window.AppCore) {
                    window.AppCore.notify('Data link established successfully.', 'success');
                }
            };
            
            // Handle loading errors by intercepting iframe error (limited due to CORS, but helpful)
            this.frameElement.onerror = () => {
                this.renderErrorState('Transmission Interrupted', 'Unable to retrieve the requested databank.');
            };

            this.frameElement.src = decodedUrl;
        } else {
            this.renderErrorState('Missing Parameters', 'No valid target file specified in the URL vector.');
        }
    }

    /**
     * Replaces the iframe with a futuristic error state if loading fails
     * @param {string} title - Error title
     * @param {string} message - Error description
     */
    renderErrorState(title, message) {
        if (!this.frameElement) return;

        const errorHTML = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: var(--bg-base); color: var(--text-primary); font-family: var(--font-sans); text-align: center; padding: var(--space-xl);">
                <i class="fas fa-exclamation-triangle pulse-slow" style="font-size: 4rem; color: var(--accent-danger); margin-bottom: var(--space-md);"></i>
                <h2 style="font-family: var(--font-display); color: var(--accent-danger); margin-bottom: var(--space-xs); font-size: 1.5rem; text-transform: uppercase;">${title}</h2>
                <p style="color: var(--text-secondary); max-width: 400px; line-height: 1.6;">${message}</p>
                <button onclick="window.history.back()" style="margin-top: var(--space-lg); background: transparent; border: 1px solid var(--accent-danger); color: var(--accent-danger); padding: 0.5rem 1.5rem; border-radius: var(--radius-sm); font-family: var(--font-display); cursor: pointer; text-transform: uppercase;">Abort & Return</button>
            </div>
        `;
        
        // Use srcdoc to render raw HTML inside the iframe without triggering external requests
        this.frameElement.srcdoc = errorHTML;
        
        if (window.AppCore) {
            window.AppCore.notify(title, 'danger');
        }
    }

    /**
     * Enables fullscreen projection of the iframe content across all major browsers
     */
    setupFullscreenToggle() {
        if (this.fullscreenBtn && this.frameElement) {
            this.fullscreenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!document.fullscreenElement) {
                    // Enter fullscreen
                    if (this.frameElement.requestFullscreen) {
                        this.frameElement.requestFullscreen();
                    } else if (this.frameElement.webkitRequestFullscreen) { /* Safari */
                        this.frameElement.webkitRequestFullscreen();
                    } else if (this.frameElement.msRequestFullscreen) { /* IE11 */
                        this.frameElement.msRequestFullscreen();
                    }
                    this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                } else {
                    // Exit fullscreen
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) { /* Safari */
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) { /* IE11 */
                        document.msExitFullscreen();
                    }
                    this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                }
            });
            
            // Listen for native escape key fullscreen exits to update button icon
            document.addEventListener('fullscreenchange', () => {
                if (!document.fullscreenElement) {
                    this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                }
            });
        }
    }

    /**
     * Prepares the direct download link for offline databank storage
     */
    setupDownloadHandler() {
        if (this.downloadBtn && this.contentFile) {
            const decodedUrl = decodeURIComponent(this.contentFile);
            this.downloadBtn.href = decodedUrl;
            
            // Generate a clean filename for the download attribute
            const cleanTitle = decodeURIComponent(this.contentTitle).replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const extension = decodedUrl.split('.').pop() || 'html';
            this.downloadBtn.download = `${cleanTitle}_data.${extension}`;
            
            this.downloadBtn.addEventListener('click', () => {
                if (window.AppCore) {
                    window.AppCore.notify('Commencing local databank transfer...', 'success');
                }
            });
        } else if (this.downloadBtn) {
            this.downloadBtn.style.display = 'none';
        }
    }

    /**
     * Integrates with the Telemetry module to award XP for viewing material
     */
    logTelemetry() {
        if (this.contentFile && window.TelemetryModule) {
            // Wait a few seconds to ensure they didn't just accidentally click and immediately leave
            setTimeout(() => {
                const xpReward = this.contentType.toLowerCase().includes('simulation') ? 50 : 20;
                window.TelemetryModule.awardXP(xpReward, `Analyzed: ${decodeURIComponent(this.contentTitle)}`);
            }, 5000);
        }
    }
}

// Initialize Viewer System globally
window.ViewerModule = new ContentViewer();
