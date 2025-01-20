/**
 * Servizio per la gestione delle notifiche
 */
export class NotificationService {
    static debug = false;
    static initialized = false;

    /**
     * Inizializza il servizio delle notifiche
     * @returns {boolean} True se l'inizializzazione è avvenuta con successo
     */
    static init() {
        this.log('Inizializzazione del servizio notifiche...');

        if (this.initialized) {
            this.log('Servizio già inizializzato');
            return true;
        }

        if (!('Notification' in window)) {
            console.warn('Questo browser non supporta le notifiche desktop');
            return false;
        }

        // Richiedi subito i permessi se non sono stati ancora concessi
        if (Notification.permission === 'default') {
            this.log('Richiedo i permessi per le notifiche...');
            this.requestPermission().then(permission => {
                this.log(`Permesso notifiche: ${permission}`);
            });
        } else {
            this.log(`Stato permessi notifiche: ${Notification.permission}`);
        }

        // Test di una notifica se siamo in debug
        if (this.debug && Notification.permission === 'granted') {
            this.testNotification();
        }

        this.initialized = true;
        return true;
    }

    /**
     * Invia una notifica di test
     */
    static async testNotification() {
        this.log('Invio notifica di test...');
        try {
            const notification = new Notification('Test Notifica', {
                body: 'Se vedi questa notifica, il sistema funziona correttamente!',
                requireInteraction: false,
                silent: true
            });

            setTimeout(() => notification.close(), 3000);
            this.log('Notifica di test inviata con successo');
        } catch (error) {
            console.error('Errore nel test della notifica:', error);
        }
    }

    /**
     * Richiede il permesso per le notifiche
     * @returns {Promise<string>}
     */
    static async requestPermission() {
        try {
            this.log('Richiesta permessi notifiche...');
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                this.log('Permessi notifiche concessi');
                return permission;
            } else {
                console.warn(`Permessi notifiche negati o non concessi: ${permission}`);
                return permission;
            }
        } catch (error) {
            console.error('Errore nella richiesta dei permessi:', error);
            return 'denied';
        }
    }

    /**
     * Mostra una notifica per un promemoria
     * @param {Reminder} reminder - Il promemoria da notificare
     * @param {Function} onClick - Callback da eseguire al click sulla notifica
     * @returns {Promise<boolean>} True se la notifica è stata mostrata con successo
     */
    static async notify(reminder, onClick) {
        this.log(`Tentativo di mostrare notifica per: ${reminder.title}`);

        if (!this.initialized) {
            console.error('Servizio notifiche non inizializzato');
            return false;
        }

        if (!this.isEnabled()) {
            this.log('Notifiche non abilitate, richiedo permessi...');
            const permission = await this.requestPermission();
            if (permission !== 'granted') {
                console.warn('Impossibile mostrare la notifica: permessi non concessi');
                return false;
            }
        }

        try {
            this.log('Creo la notifica...');
            const notification = new Notification(reminder.title, {
                body: `È ora di: ${reminder.title}!`,
                icon: '/icon.png',
                badge: '/badge.png',
                tag: `reminder-${reminder.title}`,
                renotify: true,
                requireInteraction: true,
                silent: false,
                timestamp: Date.now()
            });

            let notificationShown = false;

            notification.addEventListener('show', () => {
                this.log('Notifica mostrata');
                notificationShown = true;
                this.playNotificationSound();
            });

            notification.addEventListener('click', () => {
                this.log('Notifica cliccata');
                window.focus();
                notification.close();
                if (onClick && typeof onClick === 'function') {
                    onClick(reminder);
                }
            });

            notification.addEventListener('error', (e) => {
                console.error('Errore nella notifica:', e);
                return false;
            });

            // Attendiamo un po' per verificare che la notifica sia stata effettivamente mostrata
            await new Promise(resolve => setTimeout(resolve, 1000));
            return notificationShown;

        } catch (error) {
            console.error('Errore nella creazione della notifica:', error);
            return false;
        }
    }

    /**
     * Verifica se le notifiche sono abilitate
     * @returns {boolean}
     */
    static isEnabled() {
        const enabled = Notification.permission === 'granted';
        this.log(`Stato notifiche: ${enabled ? 'abilitate' : 'non abilitate'}`);
        return enabled;
    }

    /**
     * Riproduce un suono di notifica
     */
    static playNotificationSound() {
        try {
            this.log('Riproduco il suono di notifica');
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;

            const playPromise = audio.play();
            if (playPromise) {
                playPromise.catch(error => {
                    console.warn('Impossibile riprodurre il suono:', error);
                });
            }
        } catch (error) {
            console.warn('Errore nella riproduzione del suono:', error);
        }
    }

    /**
     * Logga un messaggio di debug
     * @param {string} message
     */
    static log(message) {
        if (this.debug) {
            console.log(`[NotificationService] ${message}`);
        }
    }
}