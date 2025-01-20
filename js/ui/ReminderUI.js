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
     * @param {Function} onReject - Callback per il rifiuto
     */
    constructor(containerId, { onEdit, onDelete, onComplete, onPostpone, onReject }) {
        this.container = document.getElementById(containerId);
        this.callbacks = { onEdit, onDelete, onComplete, onPostpone, onReject };
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
        element.className = `bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-300 ${
            reminder.status === 'notified'
                ? 'border-2 border-yellow-500 dark:border-yellow-400 animate-pulse'
                : 'hover:shadow-xl'
        }`;

        // Determina lo stato e le classi
        const statusClass = reminder.status === 'completed'
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            : reminder.status === 'notified'
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 font-bold'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';

        const statusText = reminder.status === 'completed'
            ? 'Completato'
            : reminder.status === 'notified'
                ? 'In attesa di conferma'
                : 'In programma';

        // Verifica se il promemoria è stato posticipato recentemente
        const lastAction = reminder.history[reminder.history.length - 1];
        const isRecentlyPostponed = lastAction &&
            lastAction.action === 'postponed' &&
            reminder.status === 'pending';

        // Genera il contenuto HTML
        const mainContent = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${reminder.title}</h3>
                        <span class="px-2.5 py-0.5 rounded-full text-xs ${statusClass}">
                            ${statusText}
                        </span>
                    </div>
                    <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        ${this.formatDays(reminder.days)}
                    </div>
                    <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        ${reminder.formatTimes()}
                    </div>
                    ${isRecentlyPostponed ? `
                        <div class="mt-2 text-sm text-yellow-600 dark:text-yellow-400 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Posticipato di ${lastAction.minutes} minuti
                        </div>
                    ` : ''}
                </div>
                <div class="flex items-center space-x-2">
                    ${reminder.status === 'notified' ? `
                        <button class="complete-reminder p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Completa">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </button>
                        <button class="reject-reminder p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Rifiuta">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <button class="postpone-reminder p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors" title="Posticipa">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </button>
                    ` : ''}
                    <button class="edit-reminder p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Modifica">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="delete-reminder p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Elimina">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>`;

        // Genera l'HTML dello storico
        const historyContent = reminder.history && reminder.history.length > 0 ? `
            <div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div class="reminder-history">
                    ${reminder.history.map(action => `
                        <div
                            class="history-dot ${action.action}"
                            data-tooltip="${new Date(action.timestamp).toLocaleString()} - ${this.getActionText(action)}"
                        ></div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        // Assegna il contenuto all'elemento
        element.innerHTML = mainContent + historyContent;

        // Event listeners
        const editButton = element.querySelector('.edit-reminder');
        const deleteButton = element.querySelector('.delete-reminder');
        const completeButton = element.querySelector('.complete-reminder');
        const rejectButton = element.querySelector('.reject-reminder');
        const postponeButton = element.querySelector('.postpone-reminder');

        editButton.addEventListener('click', () => this.callbacks.onEdit(reminder));
        deleteButton.addEventListener('click', () => this.callbacks.onDelete(reminder));

        if (completeButton) {
            completeButton.addEventListener('click', () => this.callbacks.onComplete(reminder));
        }

        if (rejectButton) {
            rejectButton.addEventListener('click', () => this.callbacks.onReject(reminder));
        }

        if (postponeButton) {
            postponeButton.addEventListener('click', () => this.callbacks.onPostpone(reminder));
        }

        // Debug log
        console.log('Rendering reminder:', {
            title: reminder.title,
            status: reminder.status,
            history: reminder.history,
            hasHistoryContent: !!historyContent
        });

        return element;
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
                                action.action === 'completed' ? 'bg-green-500' :
                                action.action === 'postponed' ? 'bg-yellow-500' :
                                'bg-red-500'
                            }"></span>
                            <span class="text-gray-600 dark:text-gray-400">${action.timestamp}</span>
                            <span class="mx-2">-</span>
                            <span class="text-gray-800 dark:text-gray-200">${
                                action.action === 'completed' ? 'Completato' :
                                action.action === 'postponed' ? `Rimandato di ${action.minutes} minuti` :
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

    /**
     * Renderizza un singolo promemoria
     * @param {Reminder} reminder
     * @returns {HTMLElement}
     */
    renderReminder(reminder) {
        const card = document.createElement('div');
        card.className = `reminder-card ${reminder.status}`;

        const header = document.createElement('div');
        header.className = 'reminder-header';
        header.innerHTML = `
            <h3>${reminder.title}</h3>
            <div class="reminder-actions">
                <button class="icon-button edit" title="Modifica">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-button delete" title="Elimina">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        const content = document.createElement('div');
        content.className = 'reminder-content';
        content.innerHTML = `
            <p class="reminder-times">${reminder.formatTimes()}</p>
            <p class="reminder-days">${reminder.days.join(', ')}</p>
        `;

        const footer = document.createElement('div');
        footer.className = 'reminder-footer';

        // Aggiungi i pulsanti di azione se il promemoria è notificato
        if (reminder.status === 'notified') {
            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';
            actionButtons.innerHTML = `
                <button class="complete" title="Completa">
                    <i class="fas fa-check"></i>
                </button>
                <button class="reject" title="Rifiuta">
                    <i class="fas fa-times"></i>
                </button>
                <button class="postpone" title="Posticipa">
                    <i class="fas fa-clock"></i>
                </button>
            `;
            footer.appendChild(actionButtons);
        }

        // Aggiungi lo storico
        const history = document.createElement('div');
        history.className = 'reminder-history';

        reminder.history.forEach(action => {
            const dot = document.createElement('div');
            dot.className = `history-dot ${action.action}`;
            dot.setAttribute('data-tooltip', `${new Date(action.timestamp).toLocaleString()} - ${this.getActionText(action)}`);
            history.appendChild(dot);
        });

        footer.appendChild(history);

        card.appendChild(header);
        card.appendChild(content);
        card.appendChild(footer);

        // Event listeners
        card.querySelector('.edit').addEventListener('click', () => this.callbacks.onEdit(reminder));
        card.querySelector('.delete').addEventListener('click', () => this.callbacks.onDelete(reminder));

        if (reminder.status === 'notified') {
            card.querySelector('.complete').addEventListener('click', () => this.callbacks.onComplete(reminder));
            card.querySelector('.reject').addEventListener('click', () => this.callbacks.onReject(reminder));
            card.querySelector('.postpone').addEventListener('click', () => this.callbacks.onPostpone(reminder));
        }

        return card;
    }

    /**
     * Restituisce il testo descrittivo per un'azione dello storico
     * @param {Object} action L'azione da descrivere
     * @returns {string} Il testo descrittivo dell'azione
     */
    getActionText(action) {
        switch (action.action) {
            case 'completed':
                return 'Completato';
            case 'rejected':
                return 'Saltato';
            case 'postponed':
                return `Posticipato di ${action.minutes} minuti`;
            default:
                return action.action;
        }
    }
}