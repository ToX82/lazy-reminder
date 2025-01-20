/**
 * Classe per la gestione della modale
 */
export class Modal {
    constructor() {
        this.modal = document.getElementById('reminder-modal');
        this.overlay = document.getElementById('modal-overlay');
        this.modalContent = this.modal.querySelector('.bg-white');
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
    }

    /**
     * Apre la modale con animazione
     */
    open() {
        this.isOpen = true;
        this.modal.classList.remove('hidden');
        this.overlay.classList.remove('hidden');

        // Forza reflow
        this.modalContent.offsetHeight;

        // Anima overlay
        this.overlay.classList.remove('opacity-0');

        // Anima modale
        this.modalContent.classList.remove('scale-95', 'opacity-0');
        this.modalContent.classList.add('scale-100', 'opacity-100');

        // Blocca lo scroll del body
        document.body.style.overflow = 'hidden';
    }

    /**
     * Chiude la modale con animazione
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;

        // Anima overlay
        this.overlay.classList.add('opacity-0');

        // Anima modale
        this.modalContent.classList.remove('scale-100', 'opacity-100');
        this.modalContent.classList.add('scale-95', 'opacity-0');

        // Attendi fine animazione
        setTimeout(() => {
            this.modal.classList.add('hidden');
            this.overlay.classList.add('hidden');
            // Ripristina lo scroll del body
            document.body.style.overflow = '';
        }, 300);
    }

    /**
     * Resetta il form della modale
     */
    reset() {
        this.form.reset();
        // Resetta altri campi se necessario
    }
}