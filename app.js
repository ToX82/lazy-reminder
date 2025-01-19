const remindersList = document.getElementById('reminders-list');
const addReminderButton = document.getElementById('add-reminder');
const reminderTitleInput = document.getElementById('reminder-title');
const reminderTimeInput = document.getElementById('reminder-time');
const reminderDaysSelect = document.getElementById('reminder-days');
const themeToggleButton = document.getElementById('theme-toggle');

// Theme Management
const theme = localStorage.getItem('theme') || 'light';
document.documentElement.className = theme;

themeToggleButton.addEventListener('click', () => {
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    document.documentElement.className = newTheme;
    localStorage.setItem('theme', newTheme);
});

// Reminders Management
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];

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

function createReminderElement(reminder) {
    const reminderElement = document.createElement('div');
    reminderElement.className = 'bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in';

    const statusClass = reminder.status === 'notified'
        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';

    reminderElement.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${reminder.title}</h3>
                <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center text-gray-600 dark:text-gray-300">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ${reminder.time}
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
    `;

    const editButton = reminderElement.querySelector('.edit-reminder');
    const deleteButton = reminderElement.querySelector('.delete-reminder');

    editButton.addEventListener('click', () => editReminder(reminder));
    deleteButton.addEventListener('click', () => deleteReminder(reminder));

    return reminderElement;
}

function editReminder(reminder) {
    reminderTitleInput.value = reminder.title;
    reminderTimeInput.value = reminder.time;
    Array.from(reminderDaysSelect.options).forEach(option => {
        option.selected = reminder.days.includes(option.value);
    });

    reminders = reminders.filter(r => r !== reminder);
    saveReminders();
    renderReminders();

    reminderTitleInput.focus();
}

function deleteReminder(reminder) {
    if (confirm('Sei sicuro di voler eliminare questo promemoria?')) {
        reminders = reminders.filter(r => r !== reminder);
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
    const time = reminderTimeInput.value;
    const days = Array.from(reminderDaysSelect.selectedOptions).map(option => option.value);

    if (title && time && days.length > 0) {
        reminders.push({ title, time, days, status: 'pending' });
        saveReminders();
        renderReminders();

        reminderTitleInput.value = '';
        reminderTimeInput.value = '';
        Array.from(reminderDaysSelect.options).forEach(option => option.selected = false);

        // Feedback visivo
        addReminderButton.classList.add('scale-95', 'opacity-75');
        setTimeout(() => addReminderButton.classList.remove('scale-95', 'opacity-75'), 200);
    }
});

function checkReminders() {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    reminders.forEach(reminder => {
        if (reminder.days.includes(currentDay) && reminder.time === currentTime && reminder.status === 'pending') {
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
            icon: '/favicon.ico'
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
