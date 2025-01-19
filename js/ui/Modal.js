/**
 * Classe per la gestione della modal
 */
export class Modal {
    /**
     * @param {string} modalId - ID dell'elemento modal
     * @param {string} openButtonId - ID del pulsante di apertura
     * @param {string} closeButtonId - ID del pulsante di chiusura
     * @param {Function} onClose - Callback da eseguire alla chiusura
     */
    constructor(modalId, openButtonId, closeButtonId, onClose = () => {}) {
        this.modal = document.getElementById(modalId);
        this.openButton = document.getElementById(openButtonId);
        this.closeButton = document.getElementById(closeButtonId);
        this.onClose = onClose;
        this.previousActiveElement = null;

        this.init();
    }

    /**
     * Inizializza gli event listener
     */
    init() {
        this.openButton.addEventListener('click', () => this.open());
        this.closeButton.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Gestione tasto ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.close();
            }
        });
    }

    /**
     * Apre la modal con animazione
     */
    open() {
        // Salva l'elemento attivo precedente
        this.previousActiveElement = document.activeElement;

        // Rimuove hidden e aggiunge le classi per l'animazione
        this.modal.classList.remove('hidden');
        this.modal.classList.add('animate-fade-in');

        // Aggiunge la classe per il blur dell'overlay
        this.modal.classList.add('backdrop-blur-sm');

        // Blocca lo scroll del body
        document.body.style.overflow = 'hidden';

        // Imposta il focus sul primo elemento focusabile della modal
        const firstFocusable = this.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }

        // Aggiunge l'animazione di scale alla modal
        const modalContent = this.modal.querySelector('.relative');
        if (modalContent) {
            modalContent.classList.add('animate-modal-open');
        }
    }

    /**
     * Chiude la modal con animazione
     */
    close() {
        const modalContent = this.modal.querySelector('.relative');

        // Aggiunge l'animazione di chiusura
        this.modal.classList.add('animate-fade-out');
        if (modalContent) {
            modalContent.classList.add('animate-modal-close');
        }

        // Attende la fine dell'animazione prima di nascondere
        setTimeout(() => {
            this.modal.classList.add('hidden');
            this.modal.classList.remove('animate-fade-out', 'backdrop-blur-sm');
            if (modalContent) {
                modalContent.classList.remove('animate-modal-open', 'animate-modal-close');
            }

            // Ripristina lo scroll del body
            document.body.style.overflow = 'auto';

            // Ripristina il focus sull'elemento precedente
            if (this.previousActiveElement) {
                this.previousActiveElement.focus();
            }

            this.onClose();
        }, 200);
    }
}