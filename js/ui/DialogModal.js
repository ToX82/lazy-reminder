/**
 * Classe per la gestione di dialog modali (alert e confirm)
 */
export class DialogModal {
    constructor() {
        this.createModal();
        this.initializeEventListeners();
        this.resolvePromise = null;
    }

    /**
     * Crea la struttura HTML della modal
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'dialog-modal';
        modal.className = 'fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 hidden opacity-0 transition-opacity duration-200 ease-out z-50';

        modal.innerHTML = `
            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="modal-content relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all duration-200 ease-out w-full max-w-md scale-95 opacity-0">
                        <div class="p-6">
                            <div class="flex items-center mb-4">
                                <div class="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                                    <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <div class="ml-4">
                                    <p class="text-base text-gray-900 dark:text-white" id="dialog-message"></p>
                                </div>
                            </div>

                            <div id="dialog-input-container" class="mt-4 hidden">
                                <input type="number" id="dialog-input"
                                    class="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm transition-colors"
                                    min="1" max="1440" value="15">
                            </div>

                            <div class="mt-6 flex gap-3 justify-end">
                                <button id="dialog-cancel" class="hidden inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                    Annulla
                                </button>
                                <button id="dialog-confirm" class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
        this.messageEl = document.getElementById('dialog-message');
        this.confirmButton = document.getElementById('dialog-confirm');
        this.cancelButton = document.getElementById('dialog-cancel');
        this.inputContainer = document.getElementById('dialog-input-container');
        this.input = document.getElementById('dialog-input');
    }

    /**
     * Inizializza gli event listener
     */
    initializeEventListeners() {
        this.confirmButton.addEventListener('click', () => {
            this.hide();
            if (this.resolvePromise) {
                // Se l'input è visibile, restituisci il suo valore
                if (!this.inputContainer.classList.contains('hidden')) {
                    this.resolvePromise(this.input.value);
                } else {
                    this.resolvePromise(true);
                }
                this.resolvePromise = null;
            }
        });

        this.cancelButton.addEventListener('click', () => {
            this.hide();
            if (this.resolvePromise) {
                this.resolvePromise(false);
                this.resolvePromise = null;
            }
        });

        // Chiudi con click fuori solo per alert
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal && this.cancelButton.classList.contains('hidden')) {
                this.hide();
                if (this.resolvePromise) {
                    this.resolvePromise(false);
                    this.resolvePromise = null;
                }
            }
        });

        // Chiudi con ESC solo per alert
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden') && this.cancelButton.classList.contains('hidden')) {
                this.hide();
                if (this.resolvePromise) {
                    this.resolvePromise(false);
                    this.resolvePromise = null;
                }
            }
        });

        // Gestione invio per input
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.confirmButton.click();
            }
        });
    }

    /**
     * Mostra un alert
     * @param {string} message - Il messaggio da mostrare
     * @returns {Promise<void>}
     */
    showAlert(message) {
        this.messageEl.textContent = message;
        this.cancelButton.classList.add('hidden');
        this.inputContainer.classList.add('hidden');
        this.confirmButton.textContent = 'OK';
        this.show();

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    /**
     * Mostra un dialog di conferma
     * @param {string} message - Il messaggio da mostrare
     * @returns {Promise<boolean>} True se confermato, false se annullato
     */
    showConfirm(message) {
        this.messageEl.textContent = message;
        this.cancelButton.classList.remove('hidden');
        this.inputContainer.classList.add('hidden');
        this.confirmButton.textContent = 'Conferma';
        this.show();

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    /**
     * Mostra un dialog con input
     * @param {string} message - Il messaggio da mostrare
     * @param {string} defaultValue - Valore predefinito dell'input
     * @returns {Promise<string|false>} Il valore inserito se confermato, false se annullato
     */
    showPrompt(message, defaultValue = '') {
        this.messageEl.textContent = message;
        this.cancelButton.classList.remove('hidden');
        this.inputContainer.classList.remove('hidden');
        this.input.value = defaultValue;
        this.confirmButton.textContent = 'Conferma';
        this.show();
        this.input.focus();

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    /**
     * Mostra la modal
     */
    show() {
        this.modal.classList.remove('hidden');
        // Forza reflow
        this.modal.offsetHeight;
        // Anima l'overlay
        this.modal.classList.add('opacity-100');
        this.modal.classList.remove('opacity-0');
        // Anima il contenuto
        const content = this.modal.querySelector('.modal-content');
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Nasconde la modal
     */
    hide() {
        // Anima l'overlay
        this.modal.classList.remove('opacity-100');
        this.modal.classList.add('opacity-0');
        // Anima il contenuto
        const content = this.modal.querySelector('.modal-content');
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');

        // Attendi la fine dell'animazione
        setTimeout(() => {
            this.modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 200);
    }
}