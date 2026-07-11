(function () {
  var EP = 'https://script.google.com/macros/s/AKfycbw_v86WCB4X9IDygjf2Iiyeq-fugaLLUMVaZxcBAR8bQzC9NkSVDKIWscp63hgwM5Gu/exec';
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
    '.cmts .cmts-note{font-size:12px;color:var(--muted)}';
  document.head.appendChild(css);

  function imgId(fig) {
    var img = fig.querySelector('img');
    if (!img) return null;
    var f = img.getAttribute('src').split('/').pop();
    return f.replace(/\.[a-z]+$/i, '');
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function render(box, items) {
    var list = box.querySelector('.cmts-list');
    list.innerHTML = items.map(function (c) {
      var d = c.ts ? new Date(c.ts) : null;
      var when = d ? d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear() : '';
      return '<div class="cmt"><b>' + esc(c.name || 'Anonymous') + '</b><time>' + when + '</time>' +
        '<p>' + esc(c.comment) + '</p></div>';
    }).join('');
  }

  var boxes = {};
  document.querySelectorAll('.grid figure').forEach(function (fig) {
    var id = imgId(fig);
    if (!id) return;
    var box = document.createElement('div');
    box.className = 'cmts';
    box.innerHTML =
      '<div class="cmts-list"></div>' +
      '<form><input name="name" placeholder="Name (optional)" maxlength="80">' +
      '<textarea name="comment" placeholder="Add a comment about this image..." maxlength="1500" required></textarea>' +
      '<button type="submit">Send</button><span class="cmts-note"></span></form>';
    fig.appendChild(box);
    boxes[id] = box;

    var form = box.querySelector('form');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('button');
      var note = form.querySelector('.cmts-note');
      var payload = {
        product: product,
        image: id,
        name: form.name.value.trim(),
        comment: form.comment.value.trim()
      };
      if (!payload.comment) return;
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
        all.forEach(function (c) { (byImg[c.image] = byImg[c.image] || []).push(c); });
        Object.keys(boxes).forEach(function (id) { render(boxes[id], byImg[id] || []); });
      })
      .catch(function () {});
  }
  load();
})();
