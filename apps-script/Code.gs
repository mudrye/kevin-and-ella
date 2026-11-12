/**
 * Kevin & Ella RSVP backend (Google Apps Script).
 *
 * The spreadsheet needs two tabs:
 *   Guests     party_id | guest_name | additional_guests
 *   Responses  (created automatically on the first RSVP)
 *
 * Put everyone invited together under the same party_id (e.g. a couple = P02 twice).
 * additional_guests = how many extra people that party may bring (put it on any one row of the party).
 *
 * Deploy: Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 * Paste the /exec URL into js/rsvp.js (RSVP_URL).
 * Download responses any time: File > Download > Comma-separated values (.csv) on the Responses tab.
 */

var RESP_HEAD = ['party_id', 'guest_name', 'role', 'attending', 'allergies', 'email', 'note', 'updated_at'];

function norm_(s) {
  return String(s || '').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function guests_() {
  var sh = SpreadsheetApp.getActive().getSheetByName('Guests');
  if (!sh) throw new Error('Missing "Guests" tab');
  return sh.getDataRange().getValues().slice(1)
    .filter(function (r) { return r[0] && r[1]; })
    .map(function (r) { return { party: String(r[0]).trim(), name: String(r[1]).trim(), extra: parseInt(r[2], 10) || 0 }; });
}

function responsesSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName('Responses');
  if (!sh) {
    sh = ss.insertSheet('Responses');
    sh.appendRow(RESP_HEAD);
    sh.setFrozenRows(1);
  }
  return sh;
}

function partyInfo_(party, all) {
  var people = all.filter(function (g) { return g.party === party; });
  var extra = people.reduce(function (m, g) { return Math.max(m, g.extra); }, 0);
  var rows = responsesSheet_().getDataRange().getValues().slice(1)
    .filter(function (r) { return String(r[0]) === party; });
  var prev = null;
  if (rows.length) {
    prev = {
      members: rows.filter(function (r) { return r[2] === 'invited'; })
        .map(function (r) { return { name: r[1], attending: r[3], allergy: r[4] }; }),
      extras: rows.filter(function (r) { return r[2] === 'additional guest'; })
        .map(function (r) { return { name: r[1], allergy: r[4] }; }),
      email: rows[0][5], note: rows[0][6]
    };
  }
  return { party: party, members: people.map(function (g) { return g.name; }), extra: extra, prev: prev };
}

function doGet(e) {
  try {
    var q = norm_(e && e.parameter && e.parameter.name);
    if (q.length < 3) return json_({ ok: false, error: 'not_found' });
    var all = guests_();
    var hit = all.filter(function (g) { return norm_(g.name) === q; })[0];
    if (!hit) return json_({ ok: false, error: 'not_found' });
    return json_({ ok: true, data: partyInfo_(hit.party, all) });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents);
    var all = guests_();
    var party = String(body.party || '');
    var invited = all.filter(function (g) { return g.party === party; });
    if (!invited.length) return json_({ ok: false, error: 'unknown_party' });
    var extraMax = invited.reduce(function (m, g) { return Math.max(m, g.extra); }, 0);
    var names = invited.map(function (g) { return g.name; });

    var clip = function (s, n) { return String(s == null ? '' : s).slice(0, n); };
    var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    var email = clip(body.email, 200), note = clip(body.note, 1000);
    var out = [];
    (body.members || []).forEach(function (m) {
      if (names.indexOf(m.name) < 0) return; // only people actually on the invite
      var att = m.attending === 'yes' ? 'yes' : m.attending === 'no' ? 'no' : '';
      out.push([party, m.name, 'invited', att, clip(m.allergy, 300), email, note, now]);
    });
    (body.extras || []).slice(0, extraMax).forEach(function (x) {
      if (!String(x.name || '').trim()) return;
      out.push([party, clip(x.name, 120), 'additional guest', 'yes', clip(x.allergy, 300), email, note, now]);
    });
    if (!out.length) return json_({ ok: false, error: 'empty' });

    // Replace this party's earlier answers so updates overwrite instead of duplicating.
    var sh = responsesSheet_();
    var vals = sh.getDataRange().getValues();
    for (var i = vals.length - 1; i >= 1; i--) {
      if (String(vals[i][0]) === party) sh.deleteRow(i + 1);
    }
    // Guard against spreadsheet formula injection.
    out = out.map(function (r) { return r.map(function (v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }); });
    sh.getRange(sh.getLastRow() + 1, 1, out.length, RESP_HEAD.length).setValues(out);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
