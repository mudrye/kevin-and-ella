// Shared header, footer and the invitation password gate.
// Note: GitHub Pages has no server, so this password only keeps casual visitors out.
// It is not real security; don't put anything truly private on the site.
(function () {
  var PASSWORD = 'kevinandella'; // change me (lowercase)
  var KEY = 'ke-welcome';

  window.KE = window.KE || {};
  KE.PASSWORD = PASSWORD;
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
