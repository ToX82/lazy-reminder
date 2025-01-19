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
        theme: 'theme'
    },

    // Configurazione delle notifiche
    notifications: {
        checkInterval: 60000, // 1 minuto
        resetInterval: 60000  // 1 minuto
    }
};