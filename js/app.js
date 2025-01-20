import { Config } from './config.js';
import { Reminder } from './models/Reminder.js';
import { StorageService } from './services/StorageService.js';
import { NotificationService } from './services/NotificationService.js';
import { Modal } from './ui/Modal.js';
import { ThemeManager } from './ui/ThemeManager.js';
import { TimeInputManager } from './ui/TimeInputManager.js';
import { ReminderUI } from './ui/ReminderUI.js';
import { NotificationModal } from './ui/NotificationModal.js';
import { DialogModal } from './ui/DialogModal.js';

/**
 * Classe principale dell'applicazione
 */
class App {
    constructor() {
        this.reminders = [];
        this.editingReminder = null;
        this.initializeServices();
        this.initializeUI();
        this.loadData();
        this.startTimers();
    }

    /**
     * Inizializza i servizi
     */
    initializeServices() {
        // Imposta la modalità development se non è già impostata
        if (!localStorage.getItem(Config.storage.isDevelopment)) {
            localStorage.setItem(Config.storage.isDevelopment, 'true'); // Per il testing
        }

        // Inizializza il servizio delle notifiche
        const notificationConfig = Config.getNotificationConfig();
        NotificationService.debug = notificationConfig.debug;

        if (!NotificationService.init()) {
            console.error('Impossibile inizializzare il servizio notifiche');
        }
    }

    /**
     * Inizializza l'interfaccia utente
     */
    initializeUI() {
        // Inizializza il gestore del tema
        this.themeManager = new ThemeManager('theme-toggle');

        // Inizializza il gestore degli input di tempo
        this.timeManager = new TimeInputManager({
            timeTypeContainerId: 'time-type-container',
            singleTimeId: 'reminder-time-single',
            intervalStartId: 'reminder-time-start',
            intervalEndId: 'reminder-time-end',
            intervalMinutesId: 'reminder-interval',
            intervalPresetId: 'interval-preset',
            timesContainerId: 'times-container',
            addTimeButtonId: 'add-time'
        });

        // Inizializza la modal
        this.modal = new Modal();

        // Inizializza la modal delle notifiche
        this.notificationModal = new NotificationModal({
            onComplete: reminder => this.completeReminder(reminder),
            onPostpone: (reminder, minutes) => this.postponeReminder(reminder, minutes),
            onReject: reminder => this.rejectReminder(reminder)
        });

        // Inizializza la modal di dialogo
        this.dialogModal = new DialogModal();

        // Inizializza l'interfaccia dei promemoria
        this.reminderUI = new ReminderUI('reminders-list', {
            onEdit: reminder => this.editReminder(reminder),
            onDelete: reminder => this.deleteReminder(reminder),
            onComplete: reminder => this.completeReminder(reminder),
            onPostpone: reminder => this.postponeReminder(reminder),
            onReject: reminder => this.rejectReminder(reminder)
        });

        // Aggiungi event listener per il form
        const reminderForm = document.getElementById('reminder-form');
        reminderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addReminder();
        });

        // Aggiungi event listener per il pulsante di apertura modale
        const openModalButton = document.getElementById('open-modal');
        openModalButton.addEventListener('click', () => {
            this.modal.open();
        });

        // Gestione dei pulsanti dei giorni
        const daysContainer = document.getElementById('days-container');
        daysContainer.querySelectorAll('.day-button').forEach(button => {
            const checkbox = button.querySelector('input[type="checkbox"]');
            const div = button.querySelector('div');
            const span = button.querySelector('span');

            button.addEventListener('click', () => {
                checkbox.checked = !checkbox.checked;
                this.updateDayButtonStyle(checkbox, div, span);
            });

            // Applica lo stile iniziale se la checkbox è già selezionata
            if (checkbox.checked) {
                this.updateDayButtonStyle(checkbox, div, span);
            }
        });
    }

    /**
     * Applica le classi di stile in base allo stato della checkbox
     * @param {HTMLInputElement} checkbox
     * @param {HTMLElement} div
     * @param {HTMLElement} span
     */
    updateDayButtonStyle(checkbox, div, span) {
        if (checkbox.checked) {
            div.classList.add('bg-indigo-50', 'border-indigo-500');
            div.classList.remove('border-gray-200', 'dark:border-gray-600');
            span.classList.add('text-indigo-600');
            span.classList.remove('text-gray-700', 'dark:text-gray-300');

            if (document.documentElement.classList.contains('dark')) {
                div.classList.add('bg-indigo-900/20', 'border-indigo-400');
                span.classList.add('text-indigo-400');
            }
        } else {
            div.classList.remove('bg-indigo-50', 'border-indigo-500', 'bg-indigo-900/20', 'border-indigo-400');
            div.classList.add('border-gray-200', 'dark:border-gray-600');
            span.classList.remove('text-indigo-600', 'text-indigo-400');
            span.classList.add('text-gray-700', 'dark:text-gray-300');
        }
    }

    /**
     * Carica i dati dal localStorage
     */
    loadData() {
        this.reminders = StorageService.loadReminders();
        this.renderReminders();
    }

    /**
     * Avvia i timer per il controllo dei promemoria
     */
    startTimers() {
        const notificationConfig = Config.getNotificationConfig();

        // Log dello stato iniziale
        if (notificationConfig.debug) {
            console.log('Avvio timers con configurazione:', notificationConfig);
            console.log('Stato permessi notifiche:', Notification.permission);
            console.log('Numero promemoria:', this.reminders.length);
        }

        // Ferma eventuali timer esistenti
        this.stopTimers();

        // Controlla subito all'avvio
        this.checkReminders();
        this.resetNotificationStatus();

        // Imposta gli intervalli di controllo
        this.checkInterval = setInterval(() => this.checkReminders(), notificationConfig.checkInterval);
        this.resetInterval = setInterval(() => this.resetNotificationStatus(), notificationConfig.resetInterval);

        // Log di conferma
        if (notificationConfig.debug) {
            console.log(`Timer avviati: controllo ogni ${notificationConfig.checkInterval / 1000}s, reset ogni ${notificationConfig.resetInterval / 1000}s`);
        }
    }

    /**
     * Renderizza la lista dei promemoria
     */
    renderReminders() {
        this.reminderUI.renderList(this.reminders);
    }

    /**
     * Salva i promemoria e aggiorna l'interfaccia
     */
    saveAndRender() {
        StorageService.saveReminders(this.reminders);
        this.renderReminders();
    }

    /**
     * Modifica un promemoria esistente
     * @param {Reminder} reminder
     */
    editReminder(reminder) {
        // Salva il promemoria corrente per la modifica
        this.editingReminder = reminder;

        // Popola il form con i dati del promemoria
        document.getElementById('reminder-name').value = reminder.title;
        this.timeManager.setTimeConfig(reminder.timeConfig);

        // Seleziona i giorni
        const daysContainer = document.getElementById('days-container');
        daysContainer.querySelectorAll('.day-button').forEach(button => {
            const checkbox = button.querySelector('input[type="checkbox"]');
            const div = button.querySelector('div');
            const span = button.querySelector('span');

            checkbox.checked = reminder.days.includes(checkbox.value);
            this.updateDayButtonStyle(checkbox, div, span);
        });

        // Cambia il titolo della modale
        document.getElementById('modal-title').textContent = 'Modifica Promemoria';

        // Apri la modale
        this.modal.open();
    }

    /**
     * Aggiunge un nuovo promemoria o salva le modifiche a uno esistente
     */
    addReminder() {
        const title = document.getElementById('reminder-name').value.trim();
        const timeConfig = this.timeManager.getTimeConfig();
        const days = Array.from(document.getElementById('days-container').querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        if (title && days.length > 0 && (
            (timeConfig.type === 'single' && timeConfig.time) ||
            (timeConfig.type === 'interval' && timeConfig.start && timeConfig.end && timeConfig.interval) ||
            (timeConfig.type === 'multiple' && timeConfig.times.length > 0)
        )) {
            if (this.editingReminder) {
                // Aggiorna il promemoria esistente
                const index = this.reminders.indexOf(this.editingReminder);
                if (index !== -1) {
                    this.reminders[index] = new Reminder({
                        title,
                        timeConfig,
                        days,
                        status: this.editingReminder.status,
                        history: this.editingReminder.history || [],
                        notifiedTimes: Array.from(this.editingReminder.notifiedTimes || new Set())
                    });
                }
                this.editingReminder = null;
            } else {
                // Crea un nuovo promemoria
                const reminder = new Reminder({
                    title,
                    timeConfig,
                    days,
                    status: 'pending',
                    history: []
                });
                this.reminders.push(reminder);
            }

            // Debug log
            console.log('Promemoria salvato:', {
                title,
                timeConfig,
                days,
                status: this.editingReminder ? this.editingReminder.status : 'pending',
                history: this.editingReminder ? this.editingReminder.history : []
            });

            this.saveAndRender();
            this.resetForm();
            this.modal.close();
        }
    }

    /**
     * Elimina un promemoria
     * @param {Reminder} reminder
     */
    async deleteReminder(reminder) {
        const confirmed = await this.dialogModal.showConfirm('Sei sicuro di voler eliminare questo promemoria?');
        if (confirmed) {
            const index = this.reminders.indexOf(reminder);
            if (index !== -1) {
                this.reminders.splice(index, 1);
                this.saveAndRender();
            }
        }
    }

    /**
     * Segna un promemoria come completato
     * @param {Reminder} reminder
     */
    completeReminder(reminder) {
        reminder.complete();
        this.saveAndRender();
    }

    /**
     * Rifiuta un promemoria
     * @param {Reminder} reminder
     */
    rejectReminder(reminder) {
        reminder.reject();
        this.saveAndRender();
    }

    /**
     * Posticipa un promemoria
     * @param {Reminder} reminder
     * @param {number} minutes - Minuti di posticipo (opzionale)
     */
    async postponeReminder(reminder, minutes = null) {
        if (minutes === null) {
            const result = await this.dialogModal.showPrompt('Di quanti minuti vuoi posticipare il promemoria?', '15');
            if (result !== false) {
                minutes = parseInt(result);
            }
        }

        if (minutes && !isNaN(minutes)) {
            reminder.postpone(parseInt(minutes));
            this.saveAndRender();
        }
    }

    /**
     * Controlla i promemoria per le notifiche
     */
    async checkReminders() {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const notificationConfig = Config.getNotificationConfig();

        if (notificationConfig.debug) {
            console.log(`[${now.toLocaleTimeString()}] Controllo promemoria...`);
        }

        for (const reminder of this.reminders) {
            try {
                if (reminder.shouldNotify(currentDay, now)) {
                    if (notificationConfig.debug) {
                        console.log(`Tentativo di notifica per: ${reminder.title}`);
                    }

                    const notified = await NotificationService.notify(reminder, (reminder) => {
                        if (this.notificationModal) {
                            this.notificationModal.show(reminder);
                        } else {
                            console.warn('Modal delle notifiche non inizializzata');
                        }
                    });

                    if (notified) {
                        reminder.status = 'notified';
                        this.saveAndRender();
                        if (notificationConfig.debug) {
                            console.log(`Notifica inviata con successo per: ${reminder.title}`);
                        }
                    } else {
                        console.warn(`Impossibile notificare il promemoria: ${reminder.title}`);
                    }
                }
            } catch (error) {
                console.error(`Errore durante il controllo del promemoria ${reminder.title}:`, error);
            }
        }
    }

    /**
     * Resetta lo stato delle notifiche a mezzanotte
     */
    resetNotificationStatus() {
        const now = new Date();
        const notificationConfig = Config.getNotificationConfig();

        // Reset a mezzanotte
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            if (notificationConfig.debug) {
                console.log('Reset dello stato delle notifiche...');
            }

            this.reminders.forEach(reminder => {
                reminder.status = 'pending';
            });
            this.saveAndRender();

            if (notificationConfig.debug) {
                console.log('Reset completato');
            }
        }
    }

    /**
     * Resetta il form
     */
    resetForm() {
        // Resetta il titolo della modale
        document.getElementById('modal-title').textContent = 'Nuovo Promemoria';

        // Resetta i campi
        document.getElementById('reminder-name').value = '';
        this.timeManager.reset();
        document.getElementById('days-container')
            .querySelectorAll('input[type="checkbox"]')
            .forEach(checkbox => checkbox.checked = false);

        // Resetta lo stato di modifica
        this.editingReminder = null;
    }

    /**
     * Ferma i timer
     */
    stopTimers() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        if (this.resetInterval) {
            clearInterval(this.resetInterval);
        }
    }
}

// Avvia l'applicazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    new App();
});