self.addEventListener('install', function () {
  console.log('sw: install')
  return self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  console.log('sw: activate')
  // all pages that registered this SW
  // will immediately get their requests intercepted
  clients.claim();
})

let mocks = {}

self.addEventListener('message', (event) => {
  console.log('sw: message', event.data)

  switch (event.data) {
    case 'clear': {
      mocks = {};
      return;
    }

    case 'list': {
      // TODO: would it make more sense to use self-addressed?
      event.source.postMessage({
        cmd: 'list',
        mocks: mocks
      }, '*');
      return;
    }

    default: {
      if (event.data.url) {
        console.log('registering mock response for', event.data.method, 'url', event.data.url);

        mocks = mocks || {};
        mocks[event.data.url] = event.data;
      } else {
        console.log('sw: ignoring message', event.data)
      }
    }
  }
})

self.addEventListener('fetch', function onServiceWorkerFetch(event) {
  console.log('sw: fetch event %s %s %s %s',
    event.request.method, event.request.url, event.request.cache, event.request.mode)

  // workaround for "Failed to execute 'fetch' on 'WorkerGlobalScope': 'only-if-cached' can be set only with 'same-origin' mode"
  // https://stackoverflow.com/questions/48463483/what-causes-a-failed-to-execute-fetch-on-serviceworkerglobalscope-only-if
  // https://bugs.chromium.org/p/chromium/issues/detail?id=823392
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }

  event.respondWith(fetch(event.request))
})
