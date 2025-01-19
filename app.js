const remindersList = document.getElementById('reminders-list');
const addReminderButton = document.getElementById('add-reminder');
const reminderTitleInput = document.getElementById('reminder-title');
const reminderDaysSelect = document.getElementById('reminder-days');
const themeToggleButton = document.getElementById('theme-toggle');
const reminderModal = document.getElementById('reminder-modal');
const openModalButton = document.getElementById('open-modal');
const closeModalButton = document.getElementById('close-modal');

// Time inputs
const timeTypeSelect = document.getElementById('time-type');
const singleTimeInput = document.getElementById('reminder-time-single');
const intervalTimeStart = document.getElementById('reminder-time-start');
const intervalTimeEnd = document.getElementById('reminder-time-end');
const intervalMinutes = document.getElementById('reminder-interval');
const intervalPreset = document.getElementById('interval-preset');
const timesContainer = document.getElementById('times-container');
const addTimeButton = document.getElementById('add-time');

// Time input containers
const timeInputs = document.querySelectorAll('.time-input');
const singleTimeContainer = document.getElementById('single-time');
const intervalTimeContainer = document.getElementById('interval-time');
const multipleTimesContainer = document.getElementById('multiple-times');

// Theme Management
const theme = localStorage.getItem('theme') || 'light';
document.documentElement.className = theme;

themeToggleButton.addEventListener('click', () => {
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    document.documentElement.className = newTheme;
    localStorage.setItem('theme', newTheme);
});

// Time Management
timeTypeSelect.addEventListener('change', () => {
    timeInputs.forEach(input => input.classList.add('hidden'));
    switch(timeTypeSelect.value) {
        case 'single':
            singleTimeContainer.classList.remove('hidden');
            break;
        case 'interval':
            intervalTimeContainer.classList.remove('hidden');
            break;
        case 'multiple':
            multipleTimesContainer.classList.remove('hidden');
            break;
    }
});

intervalPreset.addEventListener('change', () => {
    if (intervalPreset.value) {
        intervalMinutes.value = intervalPreset.value;
    }
});

addTimeButton.addEventListener('click', () => {
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

    timesContainer.appendChild(timeInput);
});

// Reminders Management
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];

// Migrazione dei dati vecchi al nuovo formato
reminders = reminders.map(reminder => {
    if (!reminder.timeConfig && reminder.time) {
        return {
            ...reminder,
            timeConfig: {
                type: 'single',
                time: reminder.time
            },
            history: reminder.history || []
        };
    }
    return reminder;
});
saveReminders();

function saveReminders() {
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

function formatDays(days) {
    const dayMap = {
        'Monday': 'Lun',
        'Tuesday': 'Mar',
        'Wednesday': 'Mer',
        'Thursday': 'Gio',
        'Friday': 'Ven',
        'Saturday': 'Sab',
        'Sunday': 'Dom'
    };
    return days.map(day => dayMap[day] || day).join(', ');
}

function generateTimesList(timeConfig) {
    switch(timeConfig.type) {
        case 'single':
            return [timeConfig.time];
        case 'multiple':
            return timeConfig.times;
        case 'interval':
            const times = [];
            let currentTime = new Date(`2000-01-01T${timeConfig.start}`);
            const endTime = new Date(`2000-01-01T${timeConfig.end}`);

            while (currentTime <= endTime) {
                times.push(currentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
                currentTime.setMinutes(currentTime.getMinutes() + timeConfig.interval);
            }
            return times;
    }
}

function formatTimes(timeConfig) {
    if (!timeConfig) return 'Orario non specificato';

    switch(timeConfig.type) {
        case 'single':
            return timeConfig.time || 'Orario non valido';
        case 'multiple':
            return (timeConfig.times || []).join(', ') || 'Orari non validi';
        case 'interval':
            if (!timeConfig.start || !timeConfig.end || !timeConfig.interval) {
                return 'Intervallo non valido';
            }
            return `${timeConfig.start} - ${timeConfig.end} (ogni ${timeConfig.interval} min)`;
        default:
            return 'Formato orario non valido';
    }
}

function createReminderElement(reminder) {
    const reminderElement = document.createElement('div');
    reminderElement.className = 'bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in';

    const statusClass = reminder.status === 'notified'
        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';

    const history = reminder.history || [];
    const historyHtml = history.length > 0 ? `
        <div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storico Azioni</h4>
            <div class="space-y-2">
                ${history.map(action => `
                    <div class="flex items-center text-sm">
                        <span class="w-4 h-4 mr-2 rounded-full ${
                            action.type === 'completed' ? 'bg-green-500' :
                            action.type === 'postponed' ? 'bg-yellow-500' :
                            'bg-red-500'
                        }"></span>
                        <span class="text-gray-600 dark:text-gray-400">${action.timestamp}</span>
                        <span class="mx-2">-</span>
                        <span class="text-gray-800 dark:text-gray-200">${
                            action.type === 'completed' ? 'Completato' :
                            action.type === 'postponed' ? `Rimandato di ${action.postponeMinutes} minuti` :
                            'Saltato'
                        }</span>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    reminderElement.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${reminder.title}</h3>
                <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center text-gray-600 dark:text-gray-300">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ${formatTimes(reminder.timeConfig)}
                    </span>
                    <span class="inline-flex items-center text-gray-600 dark:text-gray-300">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        ${formatDays(reminder.days)}
                    </span>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">
                        ${reminder.status === 'notified' ? 'Completato' : 'In attesa'}
                    </span>
                </div>
            </div>
            <div class="flex space-x-2">
                ${reminder.status === 'notified' ? `
                    <button class="complete-reminder p-2 text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </button>
                    <button class="postpone-reminder p-2 text-gray-600 hover:text-yellow-600 dark:text-gray-300 dark:hover:text-yellow-400 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                ` : ''}
                <button class="edit-reminder p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>
                <button class="delete-reminder p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
        ${historyHtml}
    `;

    const editButton = reminderElement.querySelector('.edit-reminder');
    const deleteButton = reminderElement.querySelector('.delete-reminder');
    const completeButton = reminderElement.querySelector('.complete-reminder');
    const postponeButton = reminderElement.querySelector('.postpone-reminder');

    editButton.addEventListener('click', () => editReminder(reminder));
    deleteButton.addEventListener('click', () => deleteReminder(reminder));

    if (completeButton) {
        completeButton.addEventListener('click', () => completeReminder(reminder));
    }

    if (postponeButton) {
        postponeButton.addEventListener('click', () => postponeReminder(reminder));
    }

    return reminderElement;
}

function getTimeConfig() {
    switch(timeTypeSelect.value) {
        case 'single':
            return {
                type: 'single',
                time: singleTimeInput.value
            };
        case 'interval':
            return {
                type: 'interval',
                start: intervalTimeStart.value,
                end: intervalTimeEnd.value,
                interval: parseInt(intervalMinutes.value)
            };
        case 'multiple':
            return {
                type: 'multiple',
                times: Array.from(timesContainer.querySelectorAll('.multiple-time'))
                    .map(input => input.value)
                    .filter(time => time)
            };
    }
}

function setTimeConfig(timeConfig) {
    timeTypeSelect.value = timeConfig.type;
    timeTypeSelect.dispatchEvent(new Event('change'));

    switch(timeConfig.type) {
        case 'single':
            singleTimeInput.value = timeConfig.time;
            break;
        case 'interval':
            intervalTimeStart.value = timeConfig.start;
            intervalTimeEnd.value = timeConfig.end;
            intervalMinutes.value = timeConfig.interval;
            break;
        case 'multiple':
            // Rimuovi tutti gli input esistenti tranne il primo
            while (timesContainer.children.length > 1) {
                timesContainer.lastChild.remove();
            }
            // Imposta il primo orario
            if (timeConfig.times.length > 0) {
                timesContainer.querySelector('.multiple-time').value = timeConfig.times[0];
            }
            // Aggiungi gli altri orari
            for (let i = 1; i < timeConfig.times.length; i++) {
                addTimeButton.click();
                const inputs = timesContainer.querySelectorAll('.multiple-time');
                inputs[inputs.length - 1].value = timeConfig.times[i];
            }
            break;
    }
}

function editReminder(reminder) {
    reminderTitleInput.value = reminder.title;
    setTimeConfig(reminder.timeConfig);
    Array.from(reminderDaysSelect.options).forEach(option => {
        option.selected = reminder.days.includes(option.value);
    });

    reminders = reminders.filter(r => r !== reminder);
    saveReminders();
    renderReminders();

    openModalButton.click();
    reminderTitleInput.focus();
}

function deleteReminder(reminder) {
    if (confirm('Sei sicuro di voler eliminare questo promemoria?')) {
        reminders = reminders.filter(r => r !== reminder);
        saveReminders();
        renderReminders();
    }
}

function completeReminder(reminder) {
    if (!reminder.history) reminder.history = [];
    reminder.history.unshift({
        type: 'completed',
        timestamp: new Date().toLocaleString('it-IT')
    });
    reminder.status = 'pending';
    saveReminders();
    renderReminders();
}

function postponeReminder(reminder) {
    const minutes = prompt('Di quanti minuti vuoi posticipare il promemoria?', '15');
    if (minutes && !isNaN(minutes)) {
        if (!reminder.history) reminder.history = [];
        reminder.history.unshift({
            type: 'postponed',
            timestamp: new Date().toLocaleString('it-IT'),
            postponeMinutes: parseInt(minutes)
        });
        reminder.status = 'pending';
        saveReminders();
        renderReminders();
    }
}

function renderReminders() {
    remindersList.innerHTML = '';
    if (reminders.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'text-center py-12 animate-fade-in';
        emptyState.innerHTML = `
            <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">Nessun promemoria</h3>
            <p class="text-gray-500 dark:text-gray-400">Aggiungi il tuo primo promemoria usando il form sopra</p>
        `;
        remindersList.appendChild(emptyState);
        return;
    }

    reminders.forEach(reminder => {
        const reminderElement = createReminderElement(reminder);
        remindersList.appendChild(reminderElement);
    });
}

addReminderButton.addEventListener('click', () => {
    const title = reminderTitleInput.value.trim();
    const timeConfig = getTimeConfig();
    const days = Array.from(reminderDaysSelect.selectedOptions).map(option => option.value);

    if (title && days.length > 0 && (
        (timeConfig.type === 'single' && timeConfig.time) ||
        (timeConfig.type === 'interval' && timeConfig.start && timeConfig.end && timeConfig.interval) ||
        (timeConfig.type === 'multiple' && timeConfig.times.length > 0)
    )) {
        reminders.push({
            title,
            timeConfig,
            days,
            status: 'pending',
            history: []
        });
        saveReminders();
        renderReminders();

        resetForm();
        reminderModal.classList.add('hidden');
        document.body.style.overflow = 'auto';

        addReminderButton.classList.add('scale-95', 'opacity-75');
        setTimeout(() => addReminderButton.classList.remove('scale-95', 'opacity-75'), 200);
    }
});

function checkReminders() {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    reminders.forEach(reminder => {
        const times = generateTimesList(reminder.timeConfig);
        if (reminder.days.includes(currentDay) && times.includes(currentTime) && reminder.status === 'pending') {
            showNotification(reminder);
            reminder.status = 'notified';
            saveReminders();
            renderReminders();
        }
    });
}

function showNotification(reminder) {
    if (Notification.permission === 'granted') {
        new Notification(reminder.title, {
            body: `È ora di: ${reminder.title}!`,
            // Rimuovo il riferimento al favicon poiché non esiste
            // icon: '/favicon.ico'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(reminder);
            }
        });
    }
}

// Reset status dei promemoria a mezzanotte
function resetNotificationStatus() {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        reminders.forEach(reminder => {
            reminder.status = 'pending';
        });
        saveReminders();
        renderReminders();
    }
}

setInterval(checkReminders, 60000); // Controlla ogni minuto
setInterval(resetNotificationStatus, 60000); // Controlla ogni minuto per il reset

// Inizializzazione
renderReminders();

// Richiedi il permesso per le notifiche all'avvio
if (Notification.permission === 'default') {
    Notification.requestPermission();
}

// Modal Management
openModalButton.addEventListener('click', () => {
    reminderModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
});

closeModalButton.addEventListener('click', () => {
    reminderModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    resetForm();
});

reminderModal.addEventListener('click', (e) => {
    if (e.target === reminderModal) {
        reminderModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        resetForm();
    }
});

function resetForm() {
    reminderTitleInput.value = '';
    timeTypeSelect.value = 'single';
    timeTypeSelect.dispatchEvent(new Event('change'));
    singleTimeInput.value = '';
    intervalTimeStart.value = '';
    intervalTimeEnd.value = '';
    intervalMinutes.value = '60';
    timesContainer.innerHTML = `
        <div class="flex items-center space-x-2">
            <input type="time" class="multiple-time mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm transition-colors">
        </div>
    `;
    Array.from(reminderDaysSelect.options).forEach(option => option.selected = false);
}
