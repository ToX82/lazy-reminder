import { Config } from '../config.js';
import { Reminder } from '../models/Reminder.js';

/**
 * Servizio per la gestione del localStorage
 */
export class StorageService {
    /**
     * Salva i promemoria nel localStorage
     * @param {Reminder[]} reminders - Lista dei promemoria da salvare
     */
    static saveReminders(reminders) {
        try {
            const data = reminders.map(reminder => reminder.toJSON());
            localStorage.setItem(Config.storage.reminders, JSON.stringify(data));

            // Debug log
            console.log('Promemoria salvati:', {
                count: reminders.length,
                reminders: data
            });
        } catch (error) {
            console.error('Errore durante il salvataggio dei promemoria:', error);
        }
    }

    /**
     * Carica i promemoria dal localStorage
     * @returns {Reminder[]}
     */
    static loadReminders() {
        try {
            const data = localStorage.getItem(Config.storage.reminders);
            if (!data) {
                console.log('Nessun promemoria salvato nel localStorage');
                return [];
            }

            const parsed = JSON.parse(data);
            const reminders = parsed.map(item => Reminder.fromJSON(item));

            // Debug log
            console.log('Promemoria caricati:', {
                count: reminders.length,
                reminders: reminders.map(r => ({
                    title: r.title,
                    status: r.status,
                    historyCount: r.history.length
                }))
            });

            return reminders;
        } catch (error) {
            console.error('Errore durante il caricamento dei promemoria:', error);
            return [];
        }
    }

    /**
     * Carica il tema dal localStorage
     * @returns {string}
     */
    static loadTheme() {
        return localStorage.getItem(Config.storage.theme) || 'light';
    }

    /**
     * Salva il tema nel localStorage
     * @param {string} theme
     */
    static saveTheme(theme) {
        localStorage.setItem(Config.storage.theme, theme);
    }
}