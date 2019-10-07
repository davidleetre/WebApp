// service-worker.js

// リソースCacheName
var cacheName4Res = 'KDKApp_V1';

// WebAPI CacheName
var cacheName4API = 'KDKApi_V1';

// cache必要なリソース
var cacheResources = [
  '/WebApp/' ,
  '/WebApp/login.html' ,
  '/WebApp/PwaTest.html' ,
  '/WebApp/js/audio_api.js' ,
  '/WebApp/js/service-worker.js'
];

// cache必要なWEBAPI　url
var cacheRequestUrls = [
  '/WebApp/webdata.html'
];

// installイベント：必要なリソースをcacheに投入する
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');

  var cachePromise = caches.open(cacheName4Res).then(
    cache => cache.addAll(
      //cacheResources.map(url => new Request(url, {credentials: 'same-origin'}))
      cacheResources
    )
  );
  e.waitUntil(cachePromise);
});

// activeイベント：cacheのkeysにより、cacheのリソースを更新する
self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');

  var cachePromise = caches.keys().then(
    keys => Promise.all(keys.map(
      key => {
        if( key !== cacheName4Res ){
          return caches.delete(key);
        }
      }))
    );
  e.waitUntil(cachePromise);
  return self.clients.claim();
});

// fetchイベント：リソースをアクセスすると、cacheにある場合、そのまま返す、存在しない場合、WEBサーバーへアクセス
self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch');
  console.log('URL：' + e.request.url);

  let needCache = cacheRequestUrls.some(url => e.request.url.indexOf(url) > -1);
  if ( needCache ) {
    caches.open(cacheName4API).then(
      cache => fetch(e.request).then(
        response => {
          cache.put(e.request.url, response.clone());
          return response;
      })
    )
  }
  else {
    e.responseWith(caches.match(e.request).then(
      cache => {
        console.log(e.request);
        return cache || fetch(e.request);
      }).catch(
      err => {
      console.log ('cache not exists')
      return fetch(e.request);
    })
    );
  }
});
