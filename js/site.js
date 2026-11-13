// Shared header, footer and the invitation password gate.
// Note: GitHub Pages has no server, so this password only keeps casual visitors out.
// It is not real security; don't put anything truly private on the site.
(function () {
  // Only a salted PBKDF2 hash of the password is stored here, never the password itself.
  // To change the password, run tools/hash-password.html in a browser and paste the result below.
  var PW_HASH = '2ff2a1f4bd459fd899ca0b144d06a4e62b2f75acc2bd07868def8bd48b82f4e8';
  var PW_SALT = 'kevin-and-ella-2027';
  var PW_ITER = 200000;
  var KEY = 'ke-welcome';

  window.KE = window.KE || {};
  KE.hashPassword = function (pw, salt, iter) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits'])
      .then(function (key) {
        return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: iter }, key, 256);
      })
      .then(function (bits) {
        return Array.prototype.map.call(new Uint8Array(bits), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      });
  };
  KE.checkPassword = function (pw) {
    return KE.hashPassword(pw.trim().toLowerCase(), PW_SALT, PW_ITER).then(function (h) { return h === PW_HASH; });
  };
  KE.KEY = KEY;

  function isIn() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  var page = document.body.getAttribute('data-page');
  if (page !== 'gate' && !isIn()) {
    location.replace('index.html?next=' + encodeURIComponent(location.pathname.split('/').pop() || 'home.html'));
    return;
  }

  KE.monogram = function (h) {
    return '<img src="img/monogram.svg" alt="K+E monogram" height="' + h + '" style="display:block;height:' + h + 'px;width:auto">';
  };

  var links = [
    ['home.html', 'home', 'home'], ['story.html', 'story', 'our story'], ['big-day.html', 'bigday', 'the big day'],
    ['rsvp.html', 'rsvp', 'rsvp'], ['registry.html', 'registry', 'registry'], ['faq.html', 'faq', 'faqs']
  ];

  var top = document.getElementById('topbar');
  if (top) {
    top.className = 'topbar';
    top.innerHTML = '<a class="logo" href="home.html">' + KE.monogram(60) + '</a><nav aria-label="Main">' +
      links.map(function (l) {
        return '<a href="' + l[0] + '"' + (l[1] === page ? ' aria-current="page"' : '') + '>' + l[2] + '</a>';
      }).join('') + '</nav>';
  }

  var foot = document.getElementById('foot');
  if (foot) {
    foot.className = 'site-foot';
    foot.innerHTML = '<h2 class="display">see you there</h2><div class="script">kevin + ella · July 11, 2027 · rocky hill, white salmon</div>';
  }
})();
