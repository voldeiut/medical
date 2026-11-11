// ネット優先：つながれば最新版を取得して保存、圏外なら保存版を表示する
// HTTP キャッシュ（GitHub Pages は max-age=600）を使わず、毎回サーバーに更新を確認する
const CACHE = 'medical-20261111213230';
const FILES = ['./', './index.html', './manifest.json', './icon.png', './icon-192.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'no-cache' })))));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('medical-') && k !== CACHE).map(k => caches.delete(k))))   // 古い版の保存分を消す（同じサイトの HemaEvi の保存分には触れない）
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
