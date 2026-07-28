(function () {
  var EP = 'https://script.google.com/macros/s/AKfycbw_v86WCB4X9IDygjf2Iiyeq-fugaLLUMVaZxcBAR8bQzC9NkSVDKIWscp63hgwM5Gu/exec';
  var APPROVED = '__APPROVED__';
  var product = location.pathname.split('/').pop().replace('.html', '');
  if (!product || product === 'index') return;

  var css = document.createElement('style');
  css.textContent =
    '.cmts{padding:0 18px 16px}' +
    '.cmts-list{margin:0 0 10px}' +
    '.cmt{font-size:13.5px;padding:8px 10px;border-radius:8px;background:rgba(157,180,138,.10);margin-bottom:6px}' +
    '.cmt b{color:var(--accent);font-size:12px}' +
    '.cmt time{color:var(--muted);font-size:11px;margin-left:6px}' +
    '.cmt p{margin:2px 0 0;color:var(--ink)}' +
    '.cmts form{display:flex;flex-direction:column;gap:6px}' +
    '.cmts input,.cmts textarea{font:13.5px/1.4 inherit;color:var(--ink);background:transparent;' +
    'border:1px solid rgba(138,131,120,.35);border-radius:8px;padding:7px 10px;outline:none}' +
    '.cmts textarea{resize:vertical;min-height:44px}' +
    '.cmts input:focus,.cmts textarea:focus{border-color:var(--accent)}' +
    '.cmts button{align-self:flex-end;font:600 12.5px inherit;letter-spacing:.04em;color:#fff;' +
    'background:var(--accent);border:0;border-radius:999px;padding:7px 18px;cursor:pointer}' +
    '.cmts button:disabled{opacity:.5;cursor:default}' +
    '.cmts .cmts-note{font-size:12px;color:var(--muted)}' +
    '.cmt.fix{background:rgba(157,180,138,.22)}' +
    '.cmt.fix p{font-weight:600}' +
    '.cmt.resolved{opacity:.55}' +
    '.cmt.resolved p{text-decoration:line-through}' +
    '.cmts-approve{display:flex;align-items:center;gap:10px;margin:0 0 10px}' +
    '.cmts-approve button.ok{align-self:auto;background:transparent;color:var(--accent);' +
    'border:1.5px solid var(--accent);border-radius:999px;padding:6px 16px;font:600 13px inherit;cursor:pointer}' +
    '.cmts-approve button.ok:hover{background:rgba(157,180,138,.12)}' +
    '.cmts-approve button.ok.done{background:var(--accent);color:#fff;cursor:default}' +
    '.cmts-approve .ok-count{font-size:12px;color:var(--muted)}';
  document.head.appendChild(css);

  function imgId(fig) {
    var el = fig.querySelector('img') || fig.querySelector('video');
    if (!el) return null;
    var src = el.getAttribute('src') || el.getAttribute('poster');
    if (!src) return null;
    var f = src.split('/').pop().split('?')[0];
    return f.replace(/\.[a-z]+$/i, '');
  }

  function cleanId(s) {
    return String(s == null ? '' : s).split('?')[0].replace(/\.[a-z]+$/i, '');
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function lsKey(id) { return 'approved:' + product + ':' + id; }

  function render(box, items, id) {
    var approvals = items.filter(function (c) { return c.comment === APPROVED; });
    var comments = items.filter(function (c) { return c.comment !== APPROVED; });
    var list = box.querySelector('.cmts-list');
    // a comment starting with the fix marker resolves every comment made before it
    var isFix = function (c) { return /^\s*✅/.test(c.comment || ''); };
    var lastFix = -1;
    comments.forEach(function (c, i) { if (isFix(c)) lastFix = i; });
    list.innerHTML = comments.map(function (c, i) {
      var d = c.ts ? new Date(c.ts) : null;
      var when = d ? d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear() : '';
      var cls = isFix(c) ? ' fix' : (i < lastFix ? ' resolved' : '');
      return '<div class="cmt' + cls + '"><b>' + esc(c.name || 'Anonymous') + '</b><time>' + when + '</time>' +
        '<p>' + esc(c.comment) + '</p></div>';
    }).join('');
    var btn = box.querySelector('.cmts-approve button.ok');
    var cnt = box.querySelector('.cmts-approve .ok-count');
    var mine = false;
    try { mine = !!localStorage.getItem(lsKey(id)); } catch (e) {}
    if (approvals.length > 0 || mine) {
      btn.classList.add('done');
      btn.disabled = true;
      btn.textContent = '✓ Potrjeno';
      var n = approvals.length || 1;
      cnt.textContent = n > 1 ? (n + '× potrjeno') : '';
    } else {
      btn.classList.remove('done');
      btn.disabled = false;
      btn.textContent = '✓ Slika je OK';
      cnt.textContent = '';
    }
  }

  var boxes = {};
  document.querySelectorAll('.grid figure').forEach(function (fig) {
    var id = imgId(fig);
    if (!id) return;
    var box = document.createElement('div');
    box.className = 'cmts';
    box.innerHTML =
      '<div class="cmts-approve"><button type="button" class="ok">✓ Slika je OK</button>' +
      '<span class="ok-count"></span></div>' +
      '<div class="cmts-list"></div>' +
      '<form><input name="name" placeholder="Name (optional)" maxlength="80">' +
      '<textarea name="comment" placeholder="Add a comment about this image..." maxlength="1500" required></textarea>' +
      '<button type="submit">Send</button><span class="cmts-note"></span></form>';
    fig.appendChild(box);
    boxes[id] = box;

    var okBtn = box.querySelector('.cmts-approve button.ok');
    okBtn.addEventListener('click', function () {
      if (okBtn.classList.contains('done')) return;
      okBtn.disabled = true;
      okBtn.textContent = 'Shranjujem…';
      var name = '';
      var nameInput = box.querySelector('form input[name="name"]');
      if (nameInput && nameInput.value.trim()) name = nameInput.value.trim();
      fetch(EP, { method: 'POST', body: JSON.stringify({ product: product, image: id, name: name, comment: APPROVED }) })
        .then(function () {
          try { localStorage.setItem(lsKey(id), '1'); } catch (e) {}
          return load();
        })
        .catch(function () {
          okBtn.disabled = false;
          okBtn.textContent = '✓ Slika je OK';
        });
    });

    var form = box.querySelector('form');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var note = form.querySelector('.cmts-note');
      var payload = {
        product: product,
        image: id,
        name: form.name.value.trim(),
        comment: form.comment.value.trim()
      };
      if (!payload.comment || payload.comment === APPROVED) return;
      btn.disabled = true;
      note.textContent = 'Sending...';
      fetch(EP, { method: 'POST', body: JSON.stringify(payload) })
        .then(function () {
          form.comment.value = '';
          note.textContent = 'Saved - thank you!';
          return load();
        })
        .catch(function () { note.textContent = 'Could not send, please try again.'; })
        .then(function () { btn.disabled = false; });
    });
  });

  function load() {
    return fetch(EP + '?product=' + encodeURIComponent(product))
      .then(function (r) { return r.json(); })
      .then(function (all) {
        var byImg = {};
        all.forEach(function (c) {
          var k = cleanId(c.image);
          (byImg[k] = byImg[k] || []).push(c);
        });
        Object.keys(boxes).forEach(function (id) { render(boxes[id], byImg[id] || [], id); });
      })
      .catch(function () {});
  }
  load();
})();
