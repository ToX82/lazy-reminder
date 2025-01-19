import { Config } from '../config.js';

/**
 * Classe per la gestione dell'interfaccia dei promemoria
 */
export class ReminderUI {
    /**
     * @param {string} containerId - ID del container dei promemoria
     * @param {Function} onEdit - Callback per la modifica
     * @param {Function} onDelete - Callback per l'eliminazione
     * @param {Function} onComplete - Callback per il completamento
     * @param {Function} onPostpone - Callback per il posticipo
     */
    constructor(containerId, { onEdit, onDelete, onComplete, onPostpone }) {
        this.container = document.getElementById(containerId);
        this.callbacks = { onEdit, onDelete, onComplete, onPostpone };
    }

    /**
     * Renderizza la lista dei promemoria
     * @param {Reminder[]} reminders
     */
    renderList(reminders) {
        this.container.innerHTML = '';

        if (reminders.length === 0) {
            this.renderEmptyState();
            return;
        }

        reminders.forEach(reminder => {
            this.container.appendChild(this.createReminderElement(reminder));
        });
    }

    /**
     * Crea l'elemento HTML per un promemoria
     * @param {Reminder} reminder
     * @returns {HTMLElement}
     */
    createReminderElement(reminder) {
        const element = document.createElement('div');
        element.className = 'bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in';

        const statusClass = reminder.status === 'notified'
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';

        element.innerHTML = this.getReminderHTML(reminder, statusClass);

        // Aggiungi event listeners
        const editButton = element.querySelector('.edit-reminder');
        const deleteButton = element.querySelector('.delete-reminder');
        const completeButton = element.querySelector('.complete-reminder');
        const postponeButton = element.querySelector('.postpone-reminder');

        editButton.addEventListener('click', () => this.callbacks.onEdit(reminder));
        deleteButton.addEventListener('click', () => this.callbacks.onDelete(reminder));

        if (completeButton) {
            completeButton.addEventListener('click', () => this.callbacks.onComplete(reminder));
        }

        if (postponeButton) {
            postponeButton.addEventListener('click', () => this.callbacks.onPostpone(reminder));
        }

        return element;
    }

    /**
     * Genera l'HTML per un promemoria
     * @param {Reminder} reminder
     * @param {string} statusClass
     * @returns {string}
     */
    getReminderHTML(reminder, statusClass) {
        return `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${reminder.title}</h3>
                    <div class="flex items-center space-x-2">
                        <span class="inline-flex items-center text-gray-600 dark:text-gray-300">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            ${reminder.formatTimes()}
                        </span>
                        <span class="inline-flex items-center text-gray-600 dark:text-gray-300">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            ${this.formatDays(reminder.days)}
                        </span>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">
                            ${reminder.status === 'notified' ? 'Completato' : 'In attesa'}
                        </span>
                    </div>
                </div>
                <div class="flex space-x-2">
                    ${reminder.status === 'notified' ? `
                        <button class="complete-reminder p-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </button>
                        <button class="postpone-reminder p-2 text-gray-600 hover:text-yellow-600 dark:text-gray-300 dark:hover:text-yellow-400 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </button>
                    ` : ''}
                    <button class="edit-reminder p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="delete-reminder p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
            ${this.getHistoryHTML(reminder.history)}
        `;
    }

    /**
     * Genera l'HTML per lo storico delle azioni
     * @param {Array} history
     * @returns {string}
     */
    getHistoryHTML(history) {
        if (!history || history.length === 0) return '';

        return `
            <div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storico Azioni</h4>
                <div class="space-y-2">
                    ${history.map(action => `
                        <div class="flex items-center text-sm">
                            <span class="w-4 h-4 mr-2 rounded-full ${
                                action.type === 'completed' ? 'bg-green-500' :
                                action.type === 'postponed' ? 'bg-yellow-500' :
                                'bg-red-500'
                            }"></span>
                            <span class="text-gray-600 dark:text-gray-400">${action.timestamp}</span>
                            <span class="mx-2">-</span>
                            <span class="text-gray-800 dark:text-gray-200">${
                                action.type === 'completed' ? 'Completato' :
                                action.type === 'postponed' ? `Rimandato di ${action.postponeMinutes} minuti` :
                                'Saltato'
                            }</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Renderizza lo stato vuoto
     */
    renderEmptyState() {
        this.container.innerHTML = `
            <div class="text-center py-12 animate-fade-in">
                <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">Nessun promemoria</h3>
                <p class="text-gray-500 dark:text-gray-400">Aggiungi il tuo primo promemoria usando il form sopra</p>
            </div>
        `;
    }

    /**
     * Formatta i giorni della settimana
     * @param {string[]} days
     * @returns {string}
     */
    formatDays(days) {
        return days.map(day => Config.dayMap[day] || day).join(', ');
    }

    /**
     * Gestisce il cambio del tipo di orario
     * @param {string} value - Il valore selezionato
     */
    handleTimeTypeChange(value) {
        document.querySelectorAll('.time-input').forEach(el => el.classList.add('hidden'));
        document.getElementById(`${value}-time`)?.classList.remove('hidden');
    }

    /**
     * Gestisce il cambio dell'intervallo preimpostato
     * @param {Event} e - L'evento change
     */
    handleIntervalPresetChange(e) {
        const customInterval = document.getElementById('custom-interval');
        const reminderInterval = document.getElementById('reminder-interval');

        if (e.target.value === 'custom') {
            customInterval.classList.remove('hidden');
        } else {
            customInterval.classList.add('hidden');
            reminderInterval.value = e.target.value;
        }
    }

    /**
     * Inizializza gli event listener per la UI
     */
    init() {
        // Gestione del cambio tipo orario
        const timeTypeSelect = document.getElementById('time-type');
        timeTypeSelect?.addEventListener('change', (e) => this.handleTimeTypeChange(e.target.value));

        // Gestione dell'intervallo personalizzato
        const intervalPreset = document.getElementById('interval-preset');
        intervalPreset?.addEventListener('change', (e) => this.handleIntervalPresetChange(e));

        // Imposta il tipo di orario iniziale
        this.handleTimeTypeChange('single');
    }
}