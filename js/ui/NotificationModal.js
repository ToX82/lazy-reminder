import { BaseModal } from './BaseModal.js';

/**
 * Modal per la gestione delle notifiche dei promemoria
 */
export class NotificationModal extends BaseModal {
    /**
     * @param {Object} options - Opzioni di configurazione
     * @param {Function} options.onComplete - Callback per il completamento
     * @param {Function} options.onPostpone - Callback per il posticipo
     * @param {Function} options.onReject - Callback per il rifiuto
     */
    constructor(options) {
        super({ id: 'notification-modal' });
        this.callbacks = options;
        this.currentReminder = null;
        this.initializeEventListeners();
    }

    /**
     * Restituisce il contenuto HTML della modal
     */
    getModalContent() {
        return `
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Promemoria</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400" id="notification-title"></p>
                        </div>
                    </div>
                    <button type="button" id="close-notification" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <span class="sr-only">Chiudi</span>
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="mt-6 flex flex-col gap-3">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Di quanti minuti vuoi posticipare il promemoria?</p>

                    <div class="flex gap-3">
                        <div class="flex-1">
                            <input type="number" id="postpone-custom-time" placeholder="Minuti" min="1" value="15" class="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm transition-colors">
                        </div>

                        <button id="postpone-notification" class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Posticipa
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Inizializza gli event listener specifici
     */
    initializeEventListeners() {
        const postponeButton = document.getElementById('postpone-notification');
        const postponeInput = document.getElementById('postpone-custom-time');
        const closeButton = document.getElementById('close-notification');

        if (!postponeButton || !postponeInput || !closeButton) {
            console.error('Elementi della modal non trovati');
            return;
        }

        // Rimuovi eventuali listener esistenti
        this.removeEventListeners();

        // Salva i riferimenti per la rimozione
        this.handlePostpone = () => {
            if (this.currentReminder && this.callbacks.onPostpone) {
                const minutes = parseInt(postponeInput.value);

                if (isNaN(minutes) || minutes < 1) {
                    alert('Inserisci un numero valido di minuti (minimo 1)');
                    return;
                }

                this.callbacks.onPostpone(this.currentReminder, minutes);
                this.hide();
            }
        };

        this.handleClose = () => {
            this.hide();
        };

        // Aggiungi gli event listener
        postponeButton.addEventListener('click', this.handlePostpone);
        closeButton.addEventListener('click', this.handleClose);

        // Gestione invio da tastiera per l'input
        postponeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handlePostpone();
            }
        });

        // Aggiungi handler per click fuori e ESC
        this.handleOutsideClick = (e) => {
            if (e.target === this.modal) {
                this.handleClose();
            }
        };

        this.handleEscape = (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.handleClose();
            }
        };

        this.modal.addEventListener('click', this.handleOutsideClick);
        document.addEventListener('keydown', this.handleEscape);
    }

    /**
     * Rimuove gli event listener
     */
    removeEventListeners() {
        const postponeButton = document.getElementById('postpone-notification');
        const postponeInput = document.getElementById('postpone-custom-time');
        const closeButton = document.getElementById('close-notification');

        if (!postponeButton || !postponeInput || !closeButton) return;

        if (this.handlePostpone) {
            postponeButton.removeEventListener('click', this.handlePostpone);
        }
        if (this.handleClose) {
            closeButton.removeEventListener('click', this.handleClose);
        }
        if (this.handleOutsideClick) {
            this.modal.removeEventListener('click', this.handleOutsideClick);
        }
        if (this.handleEscape) {
            document.removeEventListener('keydown', this.handleEscape);
        }
    }

    /**
     * Mostra la modal per un promemoria
     * @param {Reminder} reminder - Il promemoria da mostrare
     */
    show(reminder) {
        if (!reminder) {
            console.error('Nessun promemoria fornito');
            return;
        }

        this.currentReminder = reminder;
        const titleElement = document.getElementById('notification-title');
        if (titleElement) {
            titleElement.textContent = reminder.title;
        }

        this.initializeEventListeners(); // Reinizializza i listener
        super.show();
    }

    /**
     * Nasconde la modal
     */
    hide() {
        super.hide();
        this.removeEventListeners();
        this.currentReminder = null;
    }
}