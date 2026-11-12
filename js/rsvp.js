// RSVP form. Talks to the Google Apps Script web app (see apps-script/Code.gs).
// Paste your web app URL (ends in /exec) here after deploying the script:
var RSVP_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';

(function () {
  var $ = function (id) { return document.getElementById(id); };
  var state = null; // { party, members:[{name,attending,allergy}], extras:[{name,allergy}], hadPrev }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function show(id, on) { $(id).hidden = !on; }
  function configured() { return /^https:\/\/script\.google\.com\//.test(RSVP_URL); }

  $('find').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('q').value.trim();
    show('notfound', false); show('err', false); show('found', false);
    if (!configured()) { $('err').textContent = 'The RSVP isn’t connected yet. Check back soon!'; show('err', true); return; }
    $('findbtn').disabled = true;
    fetch(RSVP_URL + '?name=' + encodeURIComponent(name))
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) { show('notfound', true); return; }
        render(res.data);
      })
      .catch(function () { $('err').textContent = 'Something went wrong. Try again in a minute, or text us!'; show('err', true); })
      .then(function () { $('findbtn').disabled = false; });
  });

  function render(d) {
    var prev = d.prev;
    state = {
      party: d.party, hadPrev: !!prev,
      members: d.members.map(function (n) {
        var o = prev && prev.members.filter(function (m) { return m.name === n; })[0];
        return { name: n, attending: o ? o.attending : '', allergy: o ? o.allergy : '' };
      }),
      extras: []
    };
    for (var i = 0; i < d.extra; i++) {
      var o = prev && prev.extras[i];
      state.extras.push({ name: o ? o.name : '', allergy: o ? o.allergy : '' });
    }
    var first = state.members.map(function (m) { return m.name.split(' ')[0]; });
    $('greeting').textContent = 'hi ' + first.join(' & ') + '!';
    $('addl').textContent = d.extra > 0
      ? 'Your invitation includes ' + d.extra + ' additional guest' + (d.extra > 1 ? 's' : '') + '. Add their names below.'
      : 'Your invitation is for the ' + (state.members.length > 1 ? 'two of you' : 'one of you') + ', no additional guests.';

    $('people').innerHTML = state.members.map(function (m, i) {
      return '<fieldset class="person"><legend class="serif">' + esc(m.name) + '</legend>' +
        '<div class="choices">' +
        '<label><input type="radio" name="att' + i + '" value="yes"' + (m.attending === 'yes' ? ' checked' : '') + '><span>joyfully accepts</span></label>' +
        '<label class="no"><input type="radio" name="att' + i + '" value="no"' + (m.attending === 'no' ? ' checked' : '') + '><span>regretfully declines</span></label></div>' +
        '<label class="sr" for="al' + i + '">Allergies for ' + esc(m.name) + '</label>' +
        '<input class="field" id="al' + i + '" value="' + esc(m.allergy) + '" placeholder="Allergies or dietary needs (or &quot;none&quot;)"></fieldset>';
    }).join('') + state.extras.map(function (x, i) {
      return '<fieldset class="person extra"><legend class="serif">Additional guest ' + (i + 1) + '</legend>' +
        '<label class="sr" for="xn' + i + '">Name</label><input class="field" id="xn' + i + '" value="' + esc(x.name) + '" placeholder="Their full name" style="margin-bottom:8px">' +
        '<label class="sr" for="xa' + i + '">Allergies</label><input class="field" id="xa' + i + '" value="' + esc(x.allergy) + '" placeholder="Their allergies or dietary needs (or &quot;none&quot;)"></fieldset>';
    }).join('');

    $('email').value = (prev && prev.email) || '';
    $('note').value = (prev && prev.note) || '';
    $('send').textContent = state.hadPrev ? 'UPDATE MY RSVP' : 'SEND IT';
    show('need', false); show('saved', false); show('found', true);
  }

  $('reply').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!state) return;
    var missing = false;
    state.members.forEach(function (m, i) {
      var c = document.querySelector('input[name="att' + i + '"]:checked');
      m.attending = c ? c.value : '';
      m.allergy = $('al' + i).value;
      if (!m.attending) missing = true;
    });
    state.extras.forEach(function (x, i) { x.name = $('xn' + i).value; x.allergy = $('xa' + i).value; });
    show('saved', false);
    if (missing) { show('need', true); return; }
    show('need', false);
    $('send').disabled = true;
    fetch(RSVP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids a CORS preflight
      body: JSON.stringify({ party: state.party, members: state.members, extras: state.extras, email: $('email').value, note: $('note').value })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error);
        state.hadPrev = true; $('send').textContent = 'UPDATE MY RSVP'; show('saved', true);
      })
      .catch(function () { $('err').textContent = 'That didn’t save. Try again in a minute, or text us!'; show('err', true); })
      .then(function () { $('send').disabled = false; });
  });
})();
