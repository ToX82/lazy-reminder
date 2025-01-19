/**
 * Servizio per la gestione delle notifiche
 */
export class NotificationService {
    /**
     * Inizializza il servizio delle notifiche
     */
    static init() {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    /**
     * Mostra una notifica per un promemoria
     * @param {Reminder} reminder
     */
    static notify(reminder) {
        if (Notification.permission === 'granted') {
            new Notification(reminder.title, {
                body: `È ora di: ${reminder.title}!`
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.notify(reminder);
                }
            });
        }
    }

    /**
     * Verifica se le notifiche sono abilitate
     * @returns {boolean}
     */
    static isEnabled() {
        return Notification.permission === 'granted';
    }

    /**
     * Richiede il permesso per le notifiche
     * @returns {Promise<string>}
     */
    static requestPermission() {
        return Notification.requestPermission();
    }
}