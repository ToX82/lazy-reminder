import { StorageService } from '../services/StorageService.js';

/**
 * Classe per la gestione del tema
 */
export class ThemeManager {
    /**
     * @param {string} toggleButtonId - ID del pulsante per cambiare tema
     */
    constructor(toggleButtonId) {
        this.toggleButton = document.getElementById(toggleButtonId);
        this.init();
    }

    /**
     * Inizializza il tema e gli event listener
     */
    init() {
        // Imposta il tema iniziale
        document.documentElement.className = StorageService.loadTheme();

        // Gestisce il cambio tema
        this.toggleButton.addEventListener('click', () => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            document.documentElement.className = newTheme;
            StorageService.saveTheme(newTheme);
        });
    }

    /**
     * Imposta un tema specifico
     * @param {string} theme - Tema da impostare ('light' o 'dark')
     */
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            document.documentElement.className = theme;
            StorageService.saveTheme(theme);
        }
    }

    /**
     * Ottiene il tema corrente
     * @returns {string}
     */
    getCurrentTheme() {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
}