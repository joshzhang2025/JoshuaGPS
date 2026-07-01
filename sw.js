const CACHE = 'joshua-gps-v13';
const OFFLINE_URL = './offline.html';
const ASSETS = [
  './index.html',
  './offline.html',
  './company-intro.html',
  './report.html',
  './style.css',
  './script.js',
  './supabase-config.js',
  './cloud-sync.js',
  './tby-data.js',
  './tby-i18n.js',
  './tby.js',
  './manifest.json',
  './icon.svg',
  './data/gps.json',
  './data/today.json',
  './data/daily-logs.json',
  './data/project-notes.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // Use individual puts so one missing asset can't abort the whole install.
      .then(c => Promise.all(ASSETS.map(url =>
        c.add(url).catch(err => console.warn('[sw] precache skipped', url, err))
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navigations (opening the app / following a link): network-first so the
  // user gets fresh content, but fall back to cache and finally to the
  // offline page instead of a blank white screen.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .catch(() => caches.match(req)
          .then(cached => cached || caches.match('./index.html'))
          .then(res => res || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Other assets: cache-first, then network. If both fail, resolve with a
  // proper Response so the promise never rejects (a rejection blanks the page).
  e.respondWith(
    caches.match(req)
      .then(cached => cached || fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      }))
      .catch(() => caches.match(OFFLINE_URL).then(res =>
        res || new Response('', { status: 503, statusText: 'Offline' })
      ))
  );
});
