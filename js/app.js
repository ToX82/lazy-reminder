import { Config } from './config.js';
import { Reminder } from './models/Reminder.js';
import { StorageService } from './services/StorageService.js';
import { NotificationService } from './services/NotificationService.js';
import { Modal } from './ui/Modal.js';
import { ThemeManager } from './ui/ThemeManager.js';
import { TimeInputManager } from './ui/TimeInputManager.js';
import { ReminderUI } from './ui/ReminderUI.js';

/**
 * Classe principale dell'applicazione
 */
class App {
    constructor() {
        this.reminders = [];
        this.initializeServices();
        this.initializeUI();
        this.loadData();
        this.startTimers();
    }

    /**
     * Inizializza i servizi
     */
    initializeServices() {
        // Inizializza il servizio delle notifiche
        NotificationService.init();
    }

    /**
     * Inizializza l'interfaccia utente
     */
    initializeUI() {
        // Inizializza il gestore del tema
        this.themeManager = new ThemeManager('theme-toggle');

        // Inizializza il gestore degli input di tempo
        this.timeManager = new TimeInputManager({
            typeSelectId: 'time-type',
            singleTimeId: 'reminder-time-single',
            intervalStartId: 'reminder-time-start',
            intervalEndId: 'reminder-time-end',
            intervalMinutesId: 'reminder-interval',
            intervalPresetId: 'interval-preset',
            timesContainerId: 'times-container',
            addTimeButtonId: 'add-time'
        });

        // Inizializza la modal
        this.modal = new Modal('reminder-modal', 'open-modal', 'close-modal', () => {
            this.resetForm();
        });

        // Inizializza l'interfaccia dei promemoria
        this.reminderUI = new ReminderUI('reminders-list', {
            onEdit: reminder => this.editReminder(reminder),
            onDelete: reminder => this.deleteReminder(reminder),
            onComplete: reminder => this.completeReminder(reminder),
            onPostpone: reminder => this.postponeReminder(reminder)
        });

        // Aggiungi event listener per il form
        document.getElementById('add-reminder').addEventListener('click', () => {
            this.addReminder();
        });
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
        setInterval(() => this.checkReminders(), Config.notifications.checkInterval);
        setInterval(() => this.resetNotificationStatus(), Config.notifications.resetInterval);
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
     * Aggiunge un nuovo promemoria
     */
    addReminder() {
        const title = document.getElementById('reminder-title').value.trim();
        const timeConfig = this.timeManager.getTimeConfig();
        const days = Array.from(document.getElementById('reminder-days').selectedOptions)
            .map(option => option.value);

        if (title && days.length > 0 && (
            (timeConfig.type === 'single' && timeConfig.time) ||
            (timeConfig.type === 'interval' && timeConfig.start && timeConfig.end && timeConfig.interval) ||
            (timeConfig.type === 'multiple' && timeConfig.times.length > 0)
        )) {
            const reminder = new Reminder({
                title,
                timeConfig,
                days,
                status: 'pending',
                history: []
            });

            this.reminders.push(reminder);
            this.saveAndRender();
            this.resetForm();
            this.modal.close();
        }
    }

    /**
     * Modifica un promemoria esistente
     * @param {Reminder} reminder
     */
    editReminder(reminder) {
        document.getElementById('reminder-title').value = reminder.title;
        this.timeManager.setTimeConfig(reminder.timeConfig);

        const daysSelect = document.getElementById('reminder-days');
        Array.from(daysSelect.options).forEach(option => {
            option.selected = reminder.days.includes(option.value);
        });

        this.reminders = this.reminders.filter(r => r !== reminder);
        this.saveAndRender();
        this.modal.open();
    }

    /**
     * Elimina un promemoria
     * @param {Reminder} reminder
     */
    deleteReminder(reminder) {
        if (confirm('Sei sicuro di voler eliminare questo promemoria?')) {
            this.reminders = this.reminders.filter(r => r !== reminder);
            this.saveAndRender();
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
     * Posticipa un promemoria
     * @param {Reminder} reminder
     */
    postponeReminder(reminder) {
        const minutes = prompt('Di quanti minuti vuoi posticipare il promemoria?', '15');
        if (minutes && !isNaN(minutes)) {
            reminder.postpone(parseInt(minutes));
            this.saveAndRender();
        }
    }

    /**
     * Controlla i promemoria per le notifiche
     */
    checkReminders() {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

        this.reminders.forEach(reminder => {
            if (reminder.shouldNotify(currentDay, currentTime)) {
                NotificationService.notify(reminder);
                reminder.status = 'notified';
                this.saveAndRender();
            }
        });
    }

    /**
     * Resetta lo stato delle notifiche a mezzanotte
     */
    resetNotificationStatus() {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            this.reminders.forEach(reminder => {
                reminder.status = 'pending';
            });
            this.saveAndRender();
        }
    }

    /**
     * Resetta il form
     */
    resetForm() {
        document.getElementById('reminder-title').value = '';
        this.timeManager.reset();
        Array.from(document.getElementById('reminder-days').options)
            .forEach(option => option.selected = false);
    }
}

// Avvia l'applicazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    new App();
});