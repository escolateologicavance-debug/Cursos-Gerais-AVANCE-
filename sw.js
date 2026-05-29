const CACHE_NAME = 'avance-v1';
const ASSETS_TO_CACHE = [
'index.html',
'manifest.json',
'logo-192.png'
];

// Instalação do Service Worker e armazenamento do esqueleto básico em cache
self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll(ASSETS_TO_CACHE);
}).then(() => self.skipWaiting())
);
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cache) => {
if (cache !== CACHE_NAME) {
return caches.delete(cache);
}
})
);
}).then(() => self.clients.claim())
);
});

// Estratégia de Rede com queda para Cache (Network First)
// Ideal para páginas de vendas que mudam preços ou cursos frequentemente
self.addEventListener('fetch', (event) => {
event.respondWith(
fetch(event.request)
.then((response) => {
// Se a resposta for válida, atualiza o cache dinamicamente
if (event.request.method === 'GET' && response.status === 200) {
const responseClone = response.clone();
caches.open(CACHE_NAME).then((cache) => {
cache.put(event.request, responseClone);
});
}
return response;
})
.catch(() => {
// Se falhar a rede (offline), busca no cache
return caches.match(event.request).then((cachedResponse) => {
if (cachedResponse) {
return cachedResponse;
}
// Caso não encontre nada em cache para requisições de página, retorna o index.html
if (event.request.mode === 'navigate') {
return caches.match('index.html');
}
});
})
);
});