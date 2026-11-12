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
    return '<svg role="img" aria-label="K+E monogram" viewBox="860 50 440 800" height="' + h + '" style="display:block;overflow:visible">' +
      '<defs><filter id="sk1" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter>' +
      '<filter id="sk2" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".07" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter></defs>' +
      '<g filter="url(#sk1)" fill="none" stroke="#E5593C" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"><path d="M1085 118C1060 66 990 82 975 150C962 205 1000 235 995 262M995 262C930 275 895 320 905 400C915 470 990 520 1050 490C1090 475 1105 450 1115 425M1135 185L1068 350L1160 302C1192 312 1197 360 1196 450L1190 690C1190 760 1215 810 1282 826"/></g>' +
      '<g filter="url(#sk2)" fill="none" stroke="#E5593C" stroke-width="8" stroke-linecap="round" opacity=".85"><path d="M1078 112C1050 62 985 78 968 150M902 405C912 478 990 528 1058 498M1188 690C1188 768 1214 818 1276 836"/></g></svg>';
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
