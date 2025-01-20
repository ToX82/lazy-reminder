/**
 * Classe per la gestione della modal delle notifiche
 */
export class NotificationModal {
    /**
     * @param {Object} options - Opzioni di configurazione
     * @param {Function} options.onComplete - Callback per il completamento
     * @param {Function} options.onPostpone - Callback per il posticipo
     */
    constructor({ onComplete, onPostpone }) {
        this.createModal();
        this.onComplete = onComplete;
        this.onPostpone = onPostpone;
        this.currentReminder = null;
        this.initializeEventListeners();
    }

    /**
     * Crea la struttura HTML della modal
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'notification-modal';
        modal.className = 'fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 hidden transition-opacity z-50';

        modal.innerHTML = `
            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="modal-content relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-md animate-modal-open">
                        <div class="p-6">
                            <div class="flex items-center mb-4">
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

                            <div class="mt-6 flex flex-col gap-3">
                                <button id="complete-notification" class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Completa
                                </button>

                                <div class="flex gap-3">
                                    <select id="postpone-time" class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm transition-colors">
                                        <option value="5">5 minuti</option>
                                        <option value="15">15 minuti</option>
                                        <option value="30">30 minuti</option>
                                        <option value="60">1 ora</option>
                                    </select>

                                    <button id="postpone-notification" class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Posticipa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
    }

    /**
     * Inizializza gli event listener
     */
    initializeEventListeners() {
        const completeButton = document.getElementById('complete-notification');
        const postponeButton = document.getElementById('postpone-notification');
        const postponeSelect = document.getElementById('postpone-time');

        completeButton.addEventListener('click', () => {
            if (this.currentReminder) {
                this.onComplete(this.currentReminder);
                this.hide();
            }
        });

        postponeButton.addEventListener('click', () => {
            if (this.currentReminder) {
                const minutes = parseInt(postponeSelect.value);
                this.onPostpone(this.currentReminder, minutes);
                this.hide();
            }
        });

        // Chiudi la modal cliccando fuori
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Chiudi con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.hide();
            }
        });
    }

    /**
     * Mostra la modal per un promemoria
     * @param {Reminder} reminder - Il promemoria da mostrare
     */
    show(reminder) {
        this.currentReminder = reminder;
        document.getElementById('notification-title').textContent = reminder.title;
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Nasconde la modal
     */
    hide() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.currentReminder = null;
    }
}