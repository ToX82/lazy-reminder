import { Config } from '../config.js';
import { Reminder } from '../models/Reminder.js';

/**
 * Servizio per la gestione del localStorage
 */
export class StorageService {
    /**
     * Carica i promemoria dal localStorage
     * @returns {Reminder[]}
     */
    static loadReminders() {
        const data = localStorage.getItem(Config.storage.reminders);
        if (!data) return [];

        try {
            const json = JSON.parse(data);
            return json.map(item => Reminder.fromJSON(item));
        } catch (e) {
            console.error('Errore nel caricamento dei promemoria:', e);
            return [];
        }
    }

    /**
     * Salva i promemoria nel localStorage
     * @param {Reminder[]} reminders
     */
    static saveReminders(reminders) {
        try {
            localStorage.setItem(
                Config.storage.reminders,
                JSON.stringify(reminders.map(r => r.toJSON()))
            );
        } catch (e) {
            console.error('Errore nel salvataggio dei promemoria:', e);
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