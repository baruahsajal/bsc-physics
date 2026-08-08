/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - LEDGER MODULE
 * File: assets/js/ledger.js
 * Architecture: ES6 / Modular / Automated Databank Fetch
 * ==========================================================================
 */

class LedgerSystem {
    constructor() {
        // Path to the database file in your repository
        this.dataSource = 'database/payment_history.json';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            const ledgerTableBody = document.getElementById('payment-history-table');
            if (ledgerTableBody) {
                this.fetchLedgerData(ledgerTableBody);
            }
        });
    }

    async fetchLedgerData(container) {
        try {
            if (window.AppCore) {
                window.AppCore.notify('Establishing uplink to financial databanks...', 'info');
            }

            // Fetch the JSON. We append a timestamp query parameter to bypass aggressive browser caching
            const response = await fetch(`${this.dataSource}?t=${new Date().getTime()}`);
            
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            const transactions = await response.json();
            this.renderTransactions(transactions, container);

            if (window.AppCore) {
                window.AppCore.notify('Ledger synchronization complete.', 'success');
            }

        } catch (error) {
            console.error('[LEDGER] Databank connection failed:', error);
            container.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--accent-danger); padding: var(--space-md); font-family: var(--font-mono);">
                        <i class="fas fa-exclamation-triangle"></i> Transmission Interrupted: Unable to load secure ledger.
                    </td>
                </tr>
            `;
            if (window.AppCore) {
                window.AppCore.notify('Failed to access financial databanks.', 'danger');
            }
        }
    }

    renderTransactions(transactions, container) {
        container.innerHTML = ''; 

        // Reverse the array so newest transactions appear at the top
        transactions.reverse().forEach(tx => {
            // Check status to color code the badge
            const badgeStyle = tx.status === 'Verified' 
                ? 'background: rgba(0, 255, 157, 0.1); color: var(--accent-science); border-color: var(--accent-science);' 
                : 'background: rgba(245, 158, 11, 0.1); color: var(--accent-warning); border-color: var(--accent-warning);';

            const rowHTML = `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.3s;" onmouseover="this.style.background='rgba(0, 243, 255, 0.05)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 12px; color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.85rem;">${tx.date}</td>
                    <td style="padding: 12px; color: var(--text-primary); font-family: var(--font-rajdhani); font-weight: 600;">
                        ${tx.name} <br>
                        <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono);">[REF: ${tx.id}]</span>
                    </td>
                    <td style="padding: 12px; color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.85rem;">Monthly Fee</td>
                    <td style="padding: 12px; color: var(--text-primary); font-family: var(--font-mono);">₹${tx.amount}</td>
                    <td style="padding: 12px;">
                        <span class="badge" style="${badgeStyle}">
                            ${tx.status}
                        </span>
                    </td>
                </tr>
            `;
            container.insertAdjacentHTML('beforeend', rowHTML);
        });
    }
}

// Initialize globally
window.LedgerModule = new LedgerSystem();