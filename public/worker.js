// v 04/09/2019 nice v2123123ssss123
// Flag for enabling cache in production
var doCache = true;
var CACHE_NAME = 'pwa-app-cache';

// Delete old caches
self.addEventListener('activate', event => {
    const currentCachelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys()
            .then(keyList =>
                Promise.all(keyList.map(key => {
                    if (!currentCachelist.includes(key)) {
                        return caches.delete(key);
                    }
                }))
            )
    );
});

// This triggers when user starts the app
self.addEventListener('install', function (event) {
    if (doCache) {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(function (cache) {
                    fetch('asset-manifest.json')
                        .then(response => {
                            response.json();
                        })
                        .then(assets => {
                            const urlsToCache = [
                                '/',
                                '/index.html',
                                '/favicon.ico',
                                '/manifest.json',
                                '/logo192.png',
                            ];
                            cache.addAll(urlsToCache);
                        })
                        .catch((e) => {
                            // failing first time?
                        })
                })
        );
    }
});




// Here we intercept request and serve up the matching files
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((r) => {
            console.log('[Service Worker] Fetching resource: '+e.request.url);
            return r || fetch(e.request).then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    console.log('[Service Worker] Caching new resource: '+e.request.url);
                    cache.put(e.request, response.clone());
                    return response;
                });
            });
        })
    );
});