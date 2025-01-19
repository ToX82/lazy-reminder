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
     * @param {Array} data.history - Storico delle azioni
     */
    constructor(data) {
        this.title = data.title;
        this.timeConfig = data.timeConfig;
        this.days = data.days;
        this.status = data.status || 'pending';
        this.history = data.history || [];
    }

    /**
     * Aggiunge un'azione allo storico
     * @param {Object} action - Azione da aggiungere
     */
    addToHistory(action) {
        this.history.unshift({
            ...action,
            timestamp: new Date().toLocaleString('it-IT')
        });
    }

    /**
     * Segna il promemoria come completato
     */
    complete() {
        this.addToHistory({ type: 'completed' });
        this.status = 'pending';
    }

    /**
     * Posticipa il promemoria
     * @param {number} minutes - Minuti di posticipo
     */
    postpone(minutes) {
        this.addToHistory({
            type: 'postponed',
            postponeMinutes: minutes
        });
        this.status = 'pending';
    }

    /**
     * Verifica se il promemoria deve essere notificato
     * @param {string} currentDay - Giorno corrente
     * @param {string} currentTime - Ora corrente
     * @returns {boolean}
     */
    shouldNotify(currentDay, currentTime) {
        return this.days.includes(currentDay) &&
               this.generateTimesList().includes(currentTime) &&
               this.status === 'pending';
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
     * Converte l'oggetto in formato JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            title: this.title,
            timeConfig: this.timeConfig,
            days: this.days,
            status: this.status,
            history: this.history
        };
    }

    /**
     * Crea un'istanza di Reminder da un oggetto JSON
     * @param {Object} json
     * @returns {Reminder}
     */
    static fromJSON(json) {
        return new Reminder(json);
    }
}