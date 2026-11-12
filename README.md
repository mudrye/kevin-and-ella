# Kevin & Ella — wedding website

Static site hosted on GitHub Pages. RSVPs are stored in a Google Sheet via Google Apps Script.

## Pages
| File | Page |
|---|---|
| `index.html` | Password gate (password set in `js/site.js`) |
| `home.html` | Home |
| `story.html` | Our story |
| `big-day.html` | The big day |
| `rsvp.html` | RSVP |
| `registry.html` | Registry |
| `faq.html` | FAQs |

Anything in `[BRACKETS]` is placeholder text to fill in.

## Drawings for the big day page
Add these to `img/` (any that are missing are simply hidden):
`venue-sketch.png`, `doodle-pine.png`, `doodle-sunrise.png`, `doodle-sunglasses.png`, `doodle-fish.png`, `just-married-van.jpg`

## RSVP setup (one time, ~5 minutes)
1. Create a Google Sheet. Rename the first tab to **Guests** and import `apps-script/guests-template.csv`
   (File → Import → Upload → Replace current sheet), then replace the sample rows with your guest list.
   - Everyone on one invitation shares a `party_id` (a couple = two rows with the same id), so the partner shows up automatically.
   - `additional_guests` = how many extra people that party may bring.
2. In the sheet: **Extensions → Apps Script**. Delete what's there, paste in `apps-script/Code.gs`, save.
3. **Deploy → New deployment → Web app**. Execute as **Me**, Who has access **Anyone**. Authorize, then copy the URL ending in `/exec`.
4. Paste that URL into `js/rsvp.js` (`RSVP_URL`) and commit.

Responses land in a **Responses** tab (created on the first RSVP). A guest who RSVPs again overwrites their earlier answer.
To get a CSV: open the Responses tab → File → Download → Comma-separated values.

If you ever edit `Code.gs`, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## A note on privacy
GitHub Pages has no server, so the password only keeps casual visitors out — anyone determined can read it in the page source.
Guest names and RSVPs live only in your Google Sheet, never in this repo. Pages are marked `noindex` so search engines skip them.
