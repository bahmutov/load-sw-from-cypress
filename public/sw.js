// DO NOT USE
console.log('sw: ./public/sw.js')

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

  mocks = mocks || {};
  let responded

  Object.keys(mocks).forEach(function (url) {
    if (responded) {
      return
    }

    // var urlReg = new RegExp(url);
    // if (urlReg.test(event.request.url)) {
    if (url === event.request.url) {
      console.log('sw: matched url %s to mock %s', event.request.url, url)
      var mockData = mocks[url];
      var options = mockData.options || {};

      var responseOptions = {
        status: options.code || options.status || options.statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json; charset=utf-8'
        }
      };

      var body = JSON.stringify(options.body || options.data);
      var response = new Response(body, responseOptions);
      responded = true

      const delay = options.timeout || options.delay
      if (delay) {
        console.log('sw: delaying response by %dms', delay)
        return event.respondWith(new Promise(function (resolve) {
          setTimeout(function () {
            resolve(response);
          }, delay);
        }));

      } else {
        return event.respondWith(response);
      }
    }
  });

  if (!responded) {
    event.respondWith(fetch(event.request))
  }
})
