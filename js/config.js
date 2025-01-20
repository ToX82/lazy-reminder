/**
 * Configurazione dell'applicazione
 */
export const Config = {
    // Mappatura dei giorni della settimana
    dayMap: {
        'Monday': 'Lun',
        'Tuesday': 'Mar',
        'Wednesday': 'Mer',
        'Thursday': 'Gio',
        'Friday': 'Ven',
        'Saturday': 'Sab',
        'Sunday': 'Dom'
    },

    // Intervalli di tempo predefiniti (in minuti)
    timeIntervals: {
        default: 60,
        options: [
            { label: 'Ogni 30 minuti', value: 30 },
            { label: 'Ogni ora', value: 60 },
            { label: 'Ogni 2 ore', value: 120 },
            { label: 'Ogni 3 ore', value: 180 },
            { label: 'Ogni 4 ore', value: 240 }
        ]
    },

    // Chiavi per il localStorage
    storage: {
        reminders: 'reminders',
        theme: 'theme',
        isDevelopment: 'isDevelopment'
    },

    // Configurazione delle notifiche
    notifications: {
        // In development usiamo intervalli più brevi
        development: {
            checkInterval: 10000,      // Intervallo di controllo delle notifiche (10 secondi)
            resetInterval: 60000,      // Intervallo per resettare lo stato delle notifiche (1 minuto)
            gracePeriod: 5000,        // Periodo di tolleranza prima dell'orario previsto (5 secondi)
            maxMissedTime: 300000,    // Tempo massimo di ritardo per notifiche perse (5 minuti)
            debug: true               // Debug sempre attivo in development
        },
        // In production usiamo intervalli più lunghi per risparmiare risorse
        production: {
            checkInterval: 30000,     // Intervallo di controllo delle notifiche (30 secondi)
            resetInterval: 60000,     // Intervallo per resettare lo stato delle notifiche (1 minuto)
            gracePeriod: 30000,       // Periodo di tolleranza prima dell'orario previsto (30 secondi)
            maxMissedTime: 300000,    // Tempo massimo di ritardo per notifiche perse (5 minuti)
            debug: false              // Debug disattivato in production
        }
    },

    /**
     * Restituisce la configurazione delle notifiche in base all'ambiente
     * @returns {Object}
     */
    getNotificationConfig() {
        const isDevelopment = localStorage.getItem(this.storage.isDevelopment) === 'true';
        return isDevelopment ? this.notifications.development : this.notifications.production;
    }
};