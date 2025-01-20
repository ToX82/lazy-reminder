const CACHE_NAME = 'lazy-reminder-v1';
const ASSETS_TO_CACHE = [
    '.',
    'index.html',
    'manifest.json',
    'css/base.css',
    'css/light.css',
    'css/dark.css',
    'js/app.js',
    'js/ui/DialogModal.js',
    'js/ui/Modal.js',
    'js/ui/ReminderUI.js',
    'js/ui/ThemeManager.js',
    'js/ui/TimeInputManager.js',
    'js/ui/NotificationModal.js',
    'js/models/Reminder.js',
    'js/services/NotificationService.js',
    'js/services/StorageService.js',
    'icons/icon-72x72.png',
    'icons/icon-96x96.png',
    'icons/icon-128x128.png',
    'icons/icon-144x144.png',
    'icons/icon-152x152.png',
    'icons/icon-192x192.png',
    'icons/icon-384x384.png',
    'icons/icon-512x512.png'
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Attivazione del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Gestione delle richieste di rete
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - ritorna la risposta dalla cache
                if (response) {
                    return response;
                }

                // Clona la richiesta
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    (response) => {
                        // Controlla se abbiamo ricevuto una risposta valida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clona la risposta
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});