import { BaseModal } from './BaseModal.js';

/**
 * Modal per dialoghi semplici (conferma, prompt)
 */
export class DialogModal extends BaseModal {
    constructor() {
        super({ id: 'dialog-modal' });
        this.resolve = null;
    }

    /**
     * Restituisce il contenuto HTML della modal
     */
    getModalContent() {
        return `
            <div class="p-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4" id="dialog-title"></h3>
                <div id="dialog-content" class="mb-4"></div>
                <div class="flex justify-end gap-3">
                    <button id="dialog-cancel" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        Annulla
                    </button>
                    <button id="dialog-confirm" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        Conferma
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Mostra un dialogo di conferma
     * @param {string} message - Messaggio da mostrare
     * @returns {Promise<boolean>} True se confermato, false altrimenti
     */
    async showConfirm(message) {
        document.getElementById('dialog-title').textContent = 'Conferma';
        document.getElementById('dialog-content').textContent = message;
        document.getElementById('dialog-confirm').textContent = 'Conferma';

        return new Promise(resolve => {
            this.resolve = resolve;

            const confirmBtn = document.getElementById('dialog-confirm');
            const cancelBtn = document.getElementById('dialog-cancel');

            const handleConfirm = () => {
                this.hide();
                resolve(true);
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            const handleCancel = () => {
                this.hide();
                resolve(false);
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);

            super.show();
        });
    }

    /**
     * Mostra un dialogo di input
     * @param {string} message - Messaggio da mostrare
     * @param {string} defaultValue - Valore di default
     * @returns {Promise<string|false>} Il valore inserito o false se annullato
     */
    async showPrompt(message, defaultValue = '') {
        document.getElementById('dialog-title').textContent = 'Input';
        document.getElementById('dialog-content').innerHTML = `
            <p class="mb-2">${message}</p>
            <input type="text" id="dialog-input" value="${defaultValue}" class="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm transition-colors">
        `;
        document.getElementById('dialog-confirm').textContent = 'OK';

        return new Promise(resolve => {
            this.resolve = resolve;

            const confirmBtn = document.getElementById('dialog-confirm');
            const cancelBtn = document.getElementById('dialog-cancel');
            const input = document.getElementById('dialog-input');

            const handleConfirm = () => {
                this.hide();
                resolve(input.value);
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            const handleCancel = () => {
                this.hide();
                resolve(false);
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);

            super.show();
            input.focus();
        });
    }

    /**
     * Nasconde la modal
     */
    hide() {
        super.hide();
        if (this.resolve) {
            this.resolve(false);
            this.resolve = null;
        }
    }
}