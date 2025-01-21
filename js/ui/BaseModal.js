/**
 * Classe base per la gestione delle modal
 */
export class BaseModal {
    /**
     * @param {Object} options - Opzioni di configurazione
     * @param {string} options.id - ID della modal
     * @param {string} options.className - Classi CSS aggiuntive
     */
    constructor({ id, className = '' }) {
        this.createModal(id, className);
        this.initializeBaseEventListeners();
    }

    /**
     * Crea la struttura HTML base della modal
     */
    createModal(id, additionalClassName = '') {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = `modal fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 hidden opacity-0 transition-opacity duration-200 z-50 ${additionalClassName}`;

        modal.innerHTML = `
            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="modal-content relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all duration-200 w-full max-w-md scale-95 opacity-0">
                        ${this.getModalContent()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
    }

    /**
     * Metodo da sovrascrivere nelle classi figlie per il contenuto specifico
     * @returns {string} HTML del contenuto della modal
     */
    getModalContent() {
        return '<div class="p-6"></div>';
    }

    /**
     * Inizializza gli event listener di base
     */
    initializeBaseEventListeners() {
        // Chiudi la modal cliccando fuori
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Chiudi con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.hide();
            }
        });
    }

    /**
     * Mostra la modal con animazione
     */
    show() {
        this.modal.classList.remove('hidden');
        this.modal.classList.add('visible');
        // Forza reflow
        this.modal.offsetHeight;
        // Anima l'overlay
        this.modal.classList.add('opacity-100');
        this.modal.classList.remove('opacity-0');
        // Anima il contenuto
        const content = this.modal.querySelector('.modal-content');
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Nasconde la modal con animazione
     */
    hide() {
        // Anima l'overlay
        this.modal.classList.remove('opacity-100', 'visible');
        this.modal.classList.add('opacity-0');
        // Anima il contenuto
        const content = this.modal.querySelector('.modal-content');
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');

        // Attendi la fine dell'animazione
        setTimeout(() => {
            this.modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 200);
    }
}