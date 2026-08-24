/* ============================================================
   cert-qr.js  -  renders a scannable QR code into every
   .cert-qr[data-url] element produced by cert-sheet.js.
   Self-initializing (MutationObserver + initial scan) so it
   works on the student dashboard, the admin issue/preview
   modal, the verify page, and the standalone print window.
   Uses qrcode-generator from CDN; if the library cannot load
   the verifyUrl is still shown as text by cert-sheet.js.
   ============================================================ */
(function () {
  var LIB_URL = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
  var libReady = (typeof window.qrcode === 'function');
  var libFailed = false;

  function ensureLib(done) {
    if (libReady) { done(); return; }
    if (libFailed) { done(); return; }
    var existing = document.querySelector('script[src="' + LIB_URL + '"]');
    if (existing) {
      existing.addEventListener('load', function () { libReady = (typeof window.qrcode === 'function'); done(); });
      existing.addEventListener('error', function () { libFailed = true; done(); });
      return;
    }
    var s = document.createElement('script');
    s.src = LIB_URL;
    s.async = true;
    s.onload = function () { libReady = (typeof window.qrcode === 'function'); done(); };
    s.onerror = function () { libFailed = true; done(); };
    document.head.appendChild(s);
  }

  function renderOne(el) {
    if (!libReady || el.getAttribute('data-qr-done')) return;
    var url = el.getAttribute('data-url');
    if (!url) { el.setAttribute('data-qr-done', '1'); return; }
    try {
      var qr = window.qrcode(0, 'L');
      qr.addData(url);
      qr.make();
      var svg = qr.createSvgTag({ cellSize: 2, margin: 0, scalable: true });
      el.innerHTML = svg;
    } catch (e) {
      // graceful: leave the text fallback visible
    }
    el.setAttribute('data-qr-done', '1');
  }

  function scan(root) {
    var nodes = (root || document).querySelectorAll('.cert-qr[data-url]:not([data-qr-done])');
    if (!nodes.length) return;
    ensureLib(function () {
      nodes.forEach(function (el) { renderOne(el); });
    });
  }

  // initial scan
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { scan(document); });
  } else {
    scan(document);
  }

  // catch sheets injected after load (print window, modals, verify render)
  if ('MutationObserver' in window) {
    var mo = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.classList && n.classList.contains('cert-qr')) renderOne(n);
          else if (n.querySelector) scan(n);
        }
      }
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }

  // expose for explicit calls if ever needed
  window.PEL_CERT_RENDER_QR = scan;
})();
