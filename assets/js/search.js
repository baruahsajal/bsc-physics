/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - SEARCH & COMMAND MODULE
 * File: assets/js/search.js
 * Architecture: ES6 / Modular / Client-side Filtering
 * ==========================================================================
 */

class SearchSystem {
    constructor() {
        // Global search index for the Command Palette (Static routing map)
        this.searchIndex = [
            { title: "B.Sc Physics Dashboard", url: "/bsc-physics/portal-physics/index.html", tags: "home, main, physics, semester" },
            { title: "Laboratory Hub", url: "/bsc-physics/portal-physics/labs.html", tags: "experiments, practicals, viva, lab" },
            { title: "Class 9 Science Academy", url: "/bsc-physics/index.html", tags: "seba, class 9, science, biology, chemistry" },
            { title: "MDC-3: Land & People of Assam", url: "/bsc-physics/mdc3.html", tags: "mdc3, assam, geography, common course" },
            { title: "Chapter 1: Matter in Our Surroundings", url: "/bsc-physics/portal-science/chapter01/index.html", tags: "chemistry, states of matter, solid, liquid, gas" },
            { title: "Chapter 2: Is Matter Around Us Pure?", url: "/bsc-physics/portal-science/chapter02/index.html", tags: "chemistry, mixtures, solutions, pure" },
            { title: "Chapter 3: Atoms and Molecules", url: "/bsc-physics/portal-science/chapter03/index.html", tags: "chemistry, atoms, molecules, mole concept" },
            { title: "Chapter 12: Sound", url: "/bsc-physics/portal-science/chapter12/index.html", tags: "physics, sound, waves, frequency, amplitude" },
            { title: "Interactive Simulations Hub", url: "/bsc-physics/simulations/index.html", tags: "interactive, visual, simulations, physics, labs" },
            { title: "Student Notes Library", url: "/bsc-physics/notes.html", tags: "pdf, notes, downloads, study material" }
        ];

        this.init();
    }

    /**
     * Initializes the Search System
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupInPageFiltering();
            this.injectCommandPalette();
        });

        // Listen for the global shortcut trigger from core.js (Ctrl/Cmd + K)
        window.addEventListener('openCommandPalette', () => {
            this.toggleCommandPalette(true);
        });
    }

    /**
     * Sets up listeners for local search inputs to filter content on the current page
     */
    setupInPageFiltering() {
        // Target any input with type="search" or specific search classes
        const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Search"], input[type="search"]');

        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                this.filterPageContent(query);
            });
        });
    }

    /**
     * Filters DOM elements (cards, lists) based on the search query
     * @param {string} query - The search string
     */
    filterPageContent(query) {
        // 1. Filter subject lists inside semester cards
        const subjectItems = document.querySelectorAll('.subject-list li');
        subjectItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = 'flex';
                // Highlight match if query is not empty
                if (query.length > 0) item.classList.add('search-match-highlight');
            } else {
                item.style.display = 'none';
                item.classList.remove('search-match-highlight');
            }
        });

        // 2. Filter entire cards if they don't contain any visible list items (for Dashboard grids)
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            // If the card has a subject list, check if all items are hidden
            const listItems = card.querySelectorAll('.subject-list li');
            if (listItems.length > 0) {
                const visibleItems = Array.from(listItems).filter(item => item.style.display !== 'none');
                if (visibleItems.length === 0 && query !== '') {
                    card.style.display = 'none';
                } else {
                    card.style.display = 'flex';
                }
            } else {
                // If it's a generic card (e.g., Lab cards), filter by card title/text
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'flex' : 'none';
            }
        });
    }

    /**
     * Injects the Command Palette DOM structure into the document body
     */
    injectCommandPalette() {
        if (document.getElementById('command-palette')) return;

        const paletteHTML = `
            <div id="command-palette" class="palette-overlay hidden">
                <div class="glass-panel palette-container animate-fade-up">
                    <div class="palette-header">
                        <i class="fas fa-search" style="color: var(--accent-cyan);"></i>
                        <input type="text" id="palette-input" class="palette-input" placeholder="Search databanks, missions, or type a command..." autocomplete="off">
                        <span class="badge" style="background: rgba(255,255,255,0.1);">ESC</span>
                    </div>
                    <div class="palette-results" id="palette-results">
                        <!-- Results injected here -->
                        <div class="palette-empty-state">
                            <i class="fas fa-terminal pulse-slow"></i>
                            <p>Awaiting query input...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', paletteHTML);

        // Add specific styles for the Command Palette dynamically to keep CSS localized if desired,
        // though typically these go in components.css. Injecting minimal structural CSS here:
        const style = document.createElement('style');
        style.textContent = `
            .palette-overlay { position: fixed; inset: 0; background: rgba(5, 5, 8, 0.8); backdrop-filter: blur(8px); z-index: 3000; display: flex; align-items: flex-start; justify-content: center; padding-top: 10vh; }
            .palette-overlay.hidden { display: none !important; }
            .palette-container { width: 100%; max-width: 650px; border: 1px solid rgba(0, 243, 255, 0.3); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 243, 255, 0.15); display: flex; flex-direction: column; max-height: 60vh; }
            .palette-header { display: flex; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); gap: 1rem; }
            .palette-input { flex: 1; background: transparent; border: none; color: #fff; font-family: var(--font-sans); font-size: 1.2rem; outline: none; }
            .palette-input::placeholder { color: rgba(255, 255, 255, 0.3); }
            .palette-results { padding: 0.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; scrollbar-width: none; }
            .palette-result-item { padding: 1rem; display: flex; align-items: center; gap: 1rem; color: var(--text-secondary); text-decoration: none; border-radius: 6px; transition: 0.1s; border-left: 3px solid transparent; }
            .palette-result-item:hover, .palette-result-item.selected { background: rgba(0, 243, 255, 0.1); color: var(--text-primary); border-left-color: var(--accent-cyan); }
            .palette-result-title { font-family: var(--font-rajdhani); font-size: 1.1rem; font-weight: 600; }
            .palette-empty-state { padding: 3rem; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; gap: 1rem; font-family: var(--font-mono); font-size: 0.9rem; }
            .search-match-highlight { background: rgba(0, 243, 255, 0.1); border-radius: 4px; }
        `;
        document.head.appendChild(style);

        this.setupPaletteListeners();
    }

    /**
     * Attaches event listeners to the Command Palette DOM elements
     */
    setupPaletteListeners() {
        const overlay = document.getElementById('command-palette');
        const input = document.getElementById('palette-input');

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.toggleCommandPalette(false);
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
                this.toggleCommandPalette(false);
            }
        });

        // Search logic
        input.addEventListener('input', (e) => {
            this.handlePaletteSearch(e.target.value);
        });
    }

    /**
     * Toggles the visibility of the Command Palette overlay
     * @param {boolean} force - Force show (true) or hide (false)
     */
    toggleCommandPalette(force) {
        const overlay = document.getElementById('command-palette');
        const input = document.getElementById('palette-input');

        if (!overlay) return;

        const isHidden = overlay.classList.contains('hidden');
        const shouldShow = force !== undefined ? force : isHidden;

        if (shouldShow) {
            overlay.classList.remove('hidden');
            input.value = ''; // Reset input
            this.handlePaletteSearch(''); // Reset results
            // Focus input on the next animation frame
            requestAnimationFrame(() => input.focus());
        } else {
            overlay.classList.add('hidden');
            input.blur();
        }
    }

    /**
     * Executes the search against the global index and renders results in the Palette
     * @param {string} query - The search query
     */
    handlePaletteSearch(query) {
        const resultsContainer = document.getElementById('palette-results');
        const normalizedQuery = query.toLowerCase().trim();

        if (normalizedQuery === '') {
            resultsContainer.innerHTML = `
                <div class="palette-empty-state">
                    <i class="fas fa-terminal pulse-slow" style="font-size: 1.5rem;"></i>
                    <p>Awaiting query input... Try typing "quantum" or "labs".</p>
                </div>
            `;
            return;
        }

        // Simple relevance scoring (title match > tag match)
        const results = this.searchIndex.filter(item => {
            return item.title.toLowerCase().includes(normalizedQuery) || 
                   item.tags.toLowerCase().includes(normalizedQuery);
        }).sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(normalizedQuery);
            const bTitleMatch = b.title.toLowerCase().includes(normalizedQuery);
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            return 0;
        });

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="palette-empty-state">
                    <i class="fas fa-times-circle" style="color: var(--accent-danger); font-size: 1.5rem;"></i>
                    <p>No databank records found for "${query}".</p>
                </div>
            `;
            return;
        }

        // Ensure proper routing based on GitHub Pages environment
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoBase = isGitHubPages ? '/bsc-physics' : '';

        // Render results
        const resultsHTML = results.map(item => {
            // Strip the hardcoded /bsc-physics prefix if not needed (handling local vs deployed)
            let finalUrl = item.url;
            if (!isGitHubPages && finalUrl.startsWith('/bsc-physics')) {
                finalUrl = finalUrl.replace('/bsc-physics', '');
            } else if (isGitHubPages && !finalUrl.startsWith('/bsc-physics')) {
                finalUrl = repoBase + finalUrl;
            }

            return `
                <a href="${finalUrl}" class="palette-result-item">
                    <i class="fas fa-file-alt" style="color: var(--accent-physics);"></i>
                    <div>
                        <div class="palette-result-title">${item.title}</div>
                        <div style="font-size: 0.75rem; font-family: var(--font-mono); opacity: 0.6;">> SYS_LOC: ${item.tags.split(',')[0]}</div>
                    </div>
                    <i class="fas fa-arrow-right" style="margin-left: auto; opacity: 0.5;"></i>
                </a>
            `;
        }).join('');

        resultsContainer.innerHTML = resultsHTML;
    }
}

// Initialize globally
window.SearchModule = new SearchSystem();
