/**
 * Classe per la gestione degli input di tempo
 */
export class TimeInputManager {
    /**
     * @param {Object} config - Configurazione degli input
     * @param {string} config.typeSelectId - ID del select per il tipo di input
     * @param {string} config.singleTimeId - ID dell'input per orario singolo
     * @param {string} config.intervalStartId - ID dell'input per inizio intervallo
     * @param {string} config.intervalEndId - ID dell'input per fine intervallo
     * @param {string} config.intervalMinutesId - ID dell'input per i minuti dell'intervallo
     * @param {string} config.intervalPresetId - ID del select per i preset dell'intervallo
     * @param {string} config.timesContainerId - ID del container per orari multipli
     * @param {string} config.addTimeButtonId - ID del pulsante per aggiungere orari
     */
    constructor(config) {
        this.typeSelect = document.getElementById(config.typeSelectId);
        this.singleTimeInput = document.getElementById(config.singleTimeId);
        this.intervalTimeStart = document.getElementById(config.intervalStartId);
        this.intervalTimeEnd = document.getElementById(config.intervalEndId);
        this.intervalMinutes = document.getElementById(config.intervalMinutesId);
        this.intervalPreset = document.getElementById(config.intervalPresetId);
        this.timesContainer = document.getElementById(config.timesContainerId);
        this.addTimeButton = document.getElementById(config.addTimeButtonId);

        this.timeInputs = document.querySelectorAll('.time-input');
        this.singleTimeContainer = document.getElementById('single-time');
        this.intervalTimeContainer = document.getElementById('interval-time');
        this.multipleTimesContainer = document.getElementById('multiple-times');

        this.init();
    }

    /**
     * Inizializza gli event listener
     */
    init() {
        this.typeSelect.addEventListener('change', () => this.handleTypeChange());
        this.intervalPreset.addEventListener('change', () => this.handlePresetChange());
        this.addTimeButton.addEventListener('click', () => this.addTimeInput());
    }

    /**
     * Gestisce il cambio del tipo di input
     */
    handleTypeChange() {
        this.timeInputs.forEach(input => input.classList.add('hidden'));
        switch(this.typeSelect.value) {
            case 'single':
                this.singleTimeContainer.classList.remove('hidden');
                break;
            case 'interval':
                this.intervalTimeContainer.classList.remove('hidden');
                break;
            case 'multiple':
                this.multipleTimesContainer.classList.remove('hidden');
                break;
        }
    }

    /**
     * Gestisce il cambio del preset dell'intervallo
     */
    handlePresetChange() {
        if (this.intervalPreset.value) {
            this.intervalMinutes.value = this.intervalPreset.value;
        }
    }

    /**
     * Aggiunge un nuovo input per orario multiplo
     */
    addTimeInput() {
        const timeInput = document.createElement('div');
        timeInput.className = 'flex items-center space-x-2';
        timeInput.innerHTML = `
            <input type="time" class="multiple-time mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm transition-colors">
            <button type="button" class="remove-time p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;

        timeInput.querySelector('.remove-time').addEventListener('click', () => {
            timeInput.remove();
        });

        this.timesContainer.appendChild(timeInput);
    }

    /**
     * Ottiene la configurazione del tempo corrente
     * @returns {Object}
     */
    getTimeConfig() {
        switch(this.typeSelect.value) {
            case 'single':
                return {
                    type: 'single',
                    time: this.singleTimeInput.value
                };
            case 'interval':
                return {
                    type: 'interval',
                    start: this.intervalTimeStart.value,
                    end: this.intervalTimeEnd.value,
                    interval: parseInt(this.intervalMinutes.value)
                };
            case 'multiple':
                return {
                    type: 'multiple',
                    times: Array.from(this.timesContainer.querySelectorAll('.multiple-time'))
                        .map(input => input.value)
                        .filter(time => time)
                };
        }
    }

    /**
     * Imposta la configurazione del tempo
     * @param {Object} timeConfig
     */
    setTimeConfig(timeConfig) {
        this.typeSelect.value = timeConfig.type;
        this.handleTypeChange();

        switch(timeConfig.type) {
            case 'single':
                this.singleTimeInput.value = timeConfig.time;
                break;
            case 'interval':
                this.intervalTimeStart.value = timeConfig.start;
                this.intervalTimeEnd.value = timeConfig.end;
                this.intervalMinutes.value = timeConfig.interval;
                break;
            case 'multiple':
                // Rimuovi tutti gli input esistenti tranne il primo
                while (this.timesContainer.children.length > 1) {
                    this.timesContainer.lastChild.remove();
                }
                // Imposta il primo orario
                if (timeConfig.times.length > 0) {
                    this.timesContainer.querySelector('.multiple-time').value = timeConfig.times[0];
                }
                // Aggiungi gli altri orari
                for (let i = 1; i < timeConfig.times.length; i++) {
                    this.addTimeInput();
                    const inputs = this.timesContainer.querySelectorAll('.multiple-time');
                    inputs[inputs.length - 1].value = timeConfig.times[i];
                }
                break;
        }
    }

    /**
     * Resetta tutti gli input
     */
    reset() {
        this.typeSelect.value = 'single';
        this.handleTypeChange();
        this.singleTimeInput.value = '';
        this.intervalTimeStart.value = '';
        this.intervalTimeEnd.value = '';
        this.intervalMinutes.value = '60';
        this.timesContainer.innerHTML = `
            <div class="flex items-center space-x-2">
                <input type="time" class="multiple-time mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm transition-colors">
            </div>
        `;
    }
}