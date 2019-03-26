var CACHE_NAME = 'my-pwa-cache-v1';

var urlsToCache = [
    '/',
    '/css/main.css',
    '/css/util.css',
    '/fonts/font-awesome-4.7.0/css/font-awesome.css',
    '/fonts/font-awesome-4.7.0/css/font-awesome.min.css',
    '/images/avatar-01.jpg',
    '/images/img-01.jpg',
    '/images/icons/favicon.ico',
    '/images/icons/icon-google.png',
    '/js/jquery.min.js',
    '/js/main.js',
    '/images/logo.png',
    '/manifest.json'
 ];
 
 self.addEventListener('install', function (event) {
     event.waitUntil(
         caches.open(CACHE_NAME).then(
             function (cache) {
                 console.log('service worker do install..', cache);
                 return cache.addAll(urlsToCache);
             }
         )
     )
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames){
            return Promise.all(
            // delete cache jika ada versi lebih baru
            cacheNames.filter(function(cacheName){
                return cacheName !== CACHE_NAME;
            }).map (function(cacheName){
                return caches.delete(cacheName);
            })
        );
    })
    );
});

// Fetch cache 
self.addEventListener('fetch', function(event){
    var request = event.request;
    var url = new URL (request.url);

    // Memisahkan cache file dgn cache data API
    if (url.origin === location.origin){
        event.respondWith (
            caches.match(request).then(function(response){
                return response || fetch (request);
            })
        )
    } else {
        event.respondWith (
            caches.open('list-mahasiswa-cache-v1')
            .then(function(cache){
                return fetch (request).then(function(liveRequest){
                    cache.put(request, liveRequest.clone());
                    return liveRequest;
                }).catch (function(){
                    return caches.match(request)
                    .then(function(response){
                        if(response) return response;
                        return caches.match('/fallback.json');
                    })
                })
            })
        )
    }
})

if ('serviceWorker' in navigator){
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/serviceworker.js').then(function (reg) {
            // console.log('SW regis sukses dgn skop',reg.scope)
            return navigator.serviceWorker.ready;
        }).then(function(reg){
            document.getElementById('req-sync').addEventListener('click', function (){
                reg.sync.register('image-fetch').then(() => {
                    console.log('sync-registered');
                }).catch(function(err){
                    console.log('unable to fetch image. Error: ', err);
                });
            });
        });
    })
} 
