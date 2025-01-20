/**
 * Classe che rappresenta un promemoria
 */
export class Reminder {
    /**
     * @param {Object} data - Dati del promemoria
     * @param {string} data.title - Titolo del promemoria
     * @param {Object} data.timeConfig - Configurazione degli orari
     * @param {string[]} data.days - Giorni della settimana
     * @param {string} data.status - Stato del promemoria
     * @param {Object[]} data.history - Storico delle notifiche
     */
    constructor(data) {
        this.title = data.title;
        this.timeConfig = data.timeConfig;
        this.days = data.days;
        this.status = data.status || 'pending';
        this.history = data.history || [];
        this.notifiedTimes = new Set(); // Tiene traccia degli orari già notificati oggi
    }

    /**
     * Verifica se il promemoria deve essere notificato
     * @param {string} currentDay - Giorno corrente
     * @param {Date} now - Data/ora corrente
     * @returns {boolean}
     */
    shouldNotify(currentDay, now) {
        // Se il promemoria è già stato notificato oggi, non notificare di nuovo
        if (this.status === 'notified') {
            return false;
        }

        // Verifica se oggi è un giorno valido
        if (!this.days.includes(currentDay)) {
            return false;
        }

        const times = this.generateTimesList();
        const currentTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const [currentHours, currentMinutes] = currentTime.split(':').map(Number);

        // Verifica se c'è un posticipo attivo
        const lastAction = this.history[this.history.length - 1];
        if (lastAction && lastAction.action === 'postponed' && this.status === 'pending') {
            // Calcola l'orario posticipato
            const postponeDate = new Date(lastAction.timestamp);
            const postponeMinutes = lastAction.minutes;

            // Aggiungi i minuti di posticipo
            postponeDate.setMinutes(postponeDate.getMinutes() + postponeMinutes);

            // Formatta l'orario posticipato
            const postponedTime = postponeDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            const [postponedHours, postponedMinutes] = postponedTime.split(':').map(Number);

            // Verifica se siamo all'orario posticipato
            if (currentHours === postponedHours && currentMinutes === postponedMinutes) {
                const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const notificationKey = `${today}-${postponedTime}-postponed`;

                if (!this.notifiedTimes.has(notificationKey)) {
                    this.notifiedTimes.add(notificationKey);
                    return true;
                }
            }

            return false; // Se c'è un posticipo attivo, non controllare gli orari normali
        }

        // Per ogni orario configurato
        for (const time of times) {
            const [targetHours, targetMinutes] = time.split(':').map(Number);

            // Verifica se siamo esattamente all'ora della notifica
            if (targetHours === currentHours && targetMinutes === currentMinutes) {
                // Verifica se non abbiamo già notificato questo orario oggi
                const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const notificationKey = `${today}-${time}`;

                if (!this.notifiedTimes.has(notificationKey)) {
                    this.notifiedTimes.add(notificationKey);
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Rifiuta il promemoria
     */
    reject() {
        this.status = 'rejected';
        this.addToHistory('rejected');
        // Debug log
        console.log('Promemoria rifiutato, nuovo stato:', this.status, 'storico:', this.history);
    }

    /**
     * Posticipa il promemoria
     * @param {number} minutes - Minuti di posticipo
     */
    postpone(minutes) {
        this.status = 'pending';
        this.addToHistory('postponed', {
            minutes,
            timestamp: new Date().toISOString()
        });
        // Debug log
        console.log('Promemoria posticipato, nuovo stato:', this.status, 'storico:', this.history);
    }

    /**
     * Completa il promemoria
     */
    complete() {
        this.status = 'completed';
        this.addToHistory('completed');
        // Debug log
        console.log('Promemoria completato, nuovo stato:', this.status, 'storico:', this.history);
    }

    /**
     * Verifica se il promemoria è stato posticipato
     * @returns {boolean}
     */
    isPostponed() {
        const lastAction = this.history[this.history.length - 1];
        return lastAction && lastAction.action === 'postponed';
    }

    /**
     * Ottiene lo stato finale del promemoria
     * @returns {string} 'completed', 'rejected' o null se non ha uno stato finale
     */
    getFinalState() {
        const lastAction = this.history[this.history.length - 1];
        if (!lastAction) return null;
        return ['completed', 'rejected'].includes(lastAction.action) ? lastAction.action : null;
    }

    /**
     * Aggiunge un evento allo storico
     * @param {string} action - Azione eseguita
     * @param {Object} details - Dettagli aggiuntivi
     */
    addToHistory(action, details = {}) {
        // Assicura che history sia un array
        if (!Array.isArray(this.history)) {
            this.history = [];
        }

        const entry = {
            action,
            timestamp: new Date().toISOString(),
            ...details
        };

        this.history.push(entry);

        // Debug log
        console.log('Aggiunta azione allo storico:', {
            reminder: this.title,
            action: entry,
            historyLength: this.history.length
        });
    }

    /**
     * Genera la lista degli orari per il promemoria
     * @returns {string[]}
     */
    generateTimesList() {
        switch(this.timeConfig.type) {
            case 'single':
                return [this.timeConfig.time];
            case 'multiple':
                return this.timeConfig.times;
            case 'interval':
                const times = [];
                let currentTime = new Date(`2000-01-01T${this.timeConfig.start}`);
                const endTime = new Date(`2000-01-01T${this.timeConfig.end}`);

                while (currentTime <= endTime) {
                    times.push(currentTime.toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }));
                    currentTime.setMinutes(currentTime.getMinutes() + this.timeConfig.interval);
                }
                return times;
            default:
                return [];
        }
    }

    /**
     * Formatta gli orari per la visualizzazione
     * @returns {string}
     */
    formatTimes() {
        if (!this.timeConfig) return 'Orario non specificato';

        switch(this.timeConfig.type) {
            case 'single':
                return this.timeConfig.time || 'Orario non valido';
            case 'multiple':
                return (this.timeConfig.times || []).join(', ') || 'Orari non validi';
            case 'interval':
                if (!this.timeConfig.start || !this.timeConfig.end || !this.timeConfig.interval) {
                    return 'Intervallo non valido';
                }
                return `${this.timeConfig.start} - ${this.timeConfig.end} (ogni ${this.timeConfig.interval} min)`;
            default:
                return 'Formato orario non valido';
        }
    }

    /**
     * Converte il promemoria in un oggetto per il salvataggio
     * @returns {Object}
     */
    toJSON() {
        return {
            title: this.title,
            timeConfig: this.timeConfig,
            days: this.days,
            status: this.status,
            history: this.history || [], // Assicura che history sia sempre un array
            notifiedTimes: Array.from(this.notifiedTimes || new Set())
        };
    }

    /**
     * Crea un'istanza di Reminder da un oggetto JSON
     * @param {Object} json
     * @returns {Reminder}
     */
    static fromJSON(json) {
        // Assicura che i campi necessari esistano
        const data = {
            ...json,
            history: json.history || [],
            status: json.status || 'pending'
        };

        const reminder = new Reminder(data);

        // Ripristina le notifiedTimes come Set
        if (json.notifiedTimes) {
            reminder.notifiedTimes = new Set(json.notifiedTimes);
        }

        // Debug log
        console.log('Reminder ripristinato da JSON:', {
            title: reminder.title,
            status: reminder.status,
            history: reminder.history,
            notifiedTimes: Array.from(reminder.notifiedTimes)
        });

        return reminder;
    }
}