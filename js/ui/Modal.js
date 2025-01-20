/**
 * Classe per la gestione della modale
 */
export class Modal {
    constructor() {
        this.modal = document.getElementById('reminder-modal');
        this.overlay = document.getElementById('modal-overlay');
        this.modalContent = this.modal.querySelector('.modal-content');
        this.closeButton = document.getElementById('close-modal');
        this.cancelButton = document.getElementById('cancel-reminder');
        this.form = document.getElementById('reminder-form');

        this.isOpen = false;
        this.setupEventListeners();
    }

    /**
     * Imposta gli event listener
     */
    setupEventListeners() {
        // Chiusura modale
        this.closeButton.addEventListener('click', () => this.close());
        this.cancelButton.addEventListener('click', () => this.close());

        // Chiudi quando si clicca fuori
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Chiudi con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Previeni la chiusura quando si clicca sulla modal stessa
        this.modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Apre la modale con animazione
     */
    open() {
        if (this.isOpen) return;

        this.isOpen = true;

        // Mostra modal e overlay
        this.modal.classList.remove('hidden');
        this.modal.classList.add('visible');
        this.overlay.classList.remove('hidden');
        this.overlay.classList.add('active');

        // Blocca lo scroll del body
        document.body.style.overflow = 'hidden';
    }

    /**
     * Chiude la modale con animazione
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;

        // Nascondi modal e overlay
        this.modal.classList.remove('visible');
        this.overlay.classList.remove('active');

        // Attendi fine animazione
        setTimeout(() => {
            this.modal.classList.add('hidden');
            this.overlay.classList.add('hidden');

            // Ripristina lo scroll del body
            document.body.style.overflow = '';

            // Reset form
            this.form.reset();
        }, 300);
    }

    /**
     * Resetta il form della modale
     */
    reset() {
        this.form.reset();
    }
}