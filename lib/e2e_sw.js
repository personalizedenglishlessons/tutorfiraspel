let mode = 'returning-ar';
const writes = [];
const requests = [];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (url.indexOf('/_e2e_flag') !== -1) {
    mode = new URL(url).searchParams.get('mode') || mode;
    event.respondWith(new Response('ok'));
    return;
  }
  if (url.indexOf('/_e2e_log') !== -1) {
    event.respondWith(new Response(JSON.stringify({ mode, writes, requests }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
    return;
  }

  if (url.indexOf('supabase.co') === -1) {
    event.respondWith(fetch(event.request));
    return;
  }

  const path = new URL(url).pathname;
  const method = event.request.method;
  requests.push({ m: method, p: path });
  let status = 401;
  let body = '{}';

  if (path.startsWith('/rest/v1/student_data')) {
    if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
      event.respondWith(event.request.clone().json().then((payload) => {
        const list = Array.isArray(payload) ? payload : [payload];
        for (const row of list) writes.push({ key: row.key, value: row.value, ts: Date.now() });
        return new Response(JSON.stringify(payload), { status: 201, headers: { 'Content-Type': 'application/json' } });
      }).catch(() => new Response('[]', { status: 201 })));
      return;
    }
    status = 200; body = '[]';
  } else if (path.startsWith('/rest/v1/student_state')) {
    status = 200;
    if (mode === 'firsttime-en') {
      body = '[]';
    } else {
      body = JSON.stringify([{
        xp: 120, streak: 2, longest_streak: 3, last_study_date: null,
        completed_lessons: [
          'english-foundations::the-alphabet',
          'english-foundations::greetings-goodbye',
          'english-foundations::introducing-yourself',
          'english-foundations::numbers-dates',
          'english-foundations::personal-information',
          'english-foundations::basic-questions'
        ],
        favorites: [], bookmarks: [], lesson_notes: {},
        vocab_store: [], notes_store: [], student_prefs: {}
      }]);
    }
  }

  event.respondWith(new Response(body, {
    status,
    headers: { 'Content-Type': 'application/json' }
  }));
});
