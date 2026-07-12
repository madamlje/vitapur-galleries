# Vitapur Galleries Hub

Live site: **https://madamlje.github.io/vitapur-galleries/**

Static gallery hub for Vitapur product creatives. Every image has a comment box —
comments are saved to a shared Google Sheet ("Category Gallery Comments") and are
used to plan image reruns. No build step: whatever is pushed to `main` is live on
GitHub Pages about a minute later.

## How to add a new category (no git needed — all in the browser)

Say your new category is **pillows**. The "key" is the lowercase file name — keep it
short, no spaces (hyphens are fine).

1. **Upload images**: on github.com press `Add file → Upload files` and drop your
   JPGs so they end up in `img/pillows/` (type the folder path `img/pillows/` into
   the file-name field before dropping). Roughly square, ~1600 px, JPG.
2. **Create the page**: open `TEMPLATE.html`, copy its contents into a new file
   named `pillows.html` (`Add file → Create new file`). Follow the numbered
   comments inside: title, heading, one `<figure>` block per image, and replace
   every `YOUR-KEY` with `pillows`.
3. **Add a card on the homepage**: edit `index.html`, copy one existing
   `<div class="card">...</div>` block inside `<div class="grid">`, and point it at
   `pillows.html` + one of your images.
4. **Commit** each change (green button). Done — live in ~1 minute at
   `https://madamlje.github.io/vitapur-galleries/pillows.html`.

Comments work automatically on the new page — nothing to configure. They are keyed
by the page's file name, so don't rename pages after clients start commenting.

## Repo map

- `index.html` — homepage with one card per category
- `<key>.html` — one gallery page per category
- `img/<key>/*.jpg` — that category's images
- `comments.js` — shared comment widget (Google Apps Script backend); loaded by
  every gallery page
- `TEMPLATE.html` — starting point for new category pages
