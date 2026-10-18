// Turns SITE (site.js) into the page every layout styles. This markup is the contract between
// data and layouts: layouts/*.css only ever see what this file builds, never site.js directly.
(function () {
  var S = SITE;
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  function ext(url) { return /^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ''; }
  function link(label, url, cls) {
    return url ? '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + url + '"' + ext(url) + '>' + label + '</a>' : label;
  }

  // People are keys into S.people; the site's owner ("me") is marked instead of linked.
  function person(k) {
    var p = S.people[k];
    if (!p) return esc(k);
    return k === 'me' ? '<u class="me">' + esc(p.name) + '</u>' : link(esc(p.name), p.url, 'person');
  }
  function people(keys, and) {
    var n = keys.map(person);
    return and && n.length > 1 ? n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1] : n.join(', ');
  }
  // {people:a,b} -> linked names; {sec} -> the section's number.
  function fill(html, sec) {
    return html.replace(/\{people:([\w,]+)\}/g, function (_, ks) { return people(ks.split(','), true); })
      .replace(/\{sec\}/g, sec);
  }

  // Sections that say "from": "<table>" are built here from that table of SITE.
  function hex(i) { return '0x' + ('0' + (i * 8).toString(16)).slice(-2); }
  function meta(rows) {
    return rows.length ? '<dl class="meta">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>' : '';
  }
  function citation(p) {
    return '<b>' + esc(p.title) + '</b>. ' + people(p.authors) + '. ' + esc(p.venue) + '.' +
      p.links.map(function (l) { return ' ' + link(esc(l[0]), l[1]); }).join('');
  }
  // Research shows in this order of status, newest first within each.
  var STATUS = {
    wip:       { cls: 'wip',    title: 'In progress',  tag: function () { return 'In progress'; } },
    review:    { cls: 'review', title: 'Under review', tag: function () { return 'Under review'; } },
    published: { cls: 'pub',    title: 'Published',    tag: function (r) { return r.papers.map(function (p) { return p.short; }).join(' · '); } }
  };
  var BUILD = {
    research: function (s) {
      var n = 0;
      return Object.keys(STATUS).map(function (st) {
        var rs = S.research.filter(function (r) { return r.status === st; }).sort(function (a, b) { return b.year - a.year; });
        if (!rs.length) return '';
        return '<div class="group"><h3 class="group-title">' + STATUS[st].title + '</h3>' + rs.map(function (r) {
          var rows = r.meta.slice(0, 1).concat((r.papers || []).map(function (p) { return ['Paper', citation(p)]; }), r.meta.slice(1));
          return '<article class="entry" id="' + r.id + '"><header><span class="addr">' + hex(n++) + '</span><h3>' + r.name + '</h3>' +
            '<span class="tag tag-' + STATUS[st].cls + '">' + esc(STATUS[st].tag(r)) + '</span></header>' +
            '<details class="more"><summary>' + esc(r.summary) + '</summary><p>' + r.text + '</p></details>' + meta(rows) + '</article>';
        }).join('') + '</div>';
      }).join('') + (s.note ? '<p class="note">' + s.note + '</p>' : '');
    },
    projects: function (s) {
      return '<p class="caption-above">' + s.caption + '</p>' +
        '<div class="filters" role="group" aria-label="Filter projects"><button class="on" data-filter="all">All</button>' +
        '<button data-filter="released">Released</button><button data-filter="unreleased">Not released yet</button></div>' +
        '<div class="cards">' + S.projects.map(function (p, i) {
          var shot = p.image ? '<figure class="shot"><img src="' + p.image.src + '" alt="' + esc(p.image.alt) + '" width="' + p.image.width +
            '" height="' + p.image.height + '" loading="lazy"></figure>' : '';
          return '<article class="card' + (p.image ? ' has-shot' : '') + '" data-state="' + (p.url ? 'released' : 'unreleased') + '">' +
            '<header><span class="addr">' + hex(i + 8) + '</span><h3>' + esc(p.name) + '</h3><span class="lang">' + esc(p.lang) + '</span></header>' +
            shot + '<p>' + p.text + '</p>' +
            (p.url ? link(esc(p.url.replace(/^https?:\/\//, '').replace(/\/$/, '')), p.url, 'go') : '<span class="unreleased">Not released yet</span>') + '</article>';
        }).join('') + '</div>';
    }
  };

  var head = '<div class="running-head"><span>' + esc(S.part + ' · ' + S.name) + '</span>' +
    '<select class="layout-switch" aria-label="Layout"></select></div>';

  var title = '<header class="title-block"><div class="part"><div class="part-no">' + esc(S.part) + '</div>' +
    '<figure class="die-shot"><img src="' + S.photo.src + '" alt="' + esc(S.photo.alt) + '" width="' + S.photo.width +
    '" height="' + S.photo.height + '"></figure>' +
    '<div class="part-kind">' + esc(S.kind) + '</div></div>' +
    '<div class="title-main"><h1>' + esc(S.name) + '</h1><p class="lede">' + fill(S.lede, '') + '</p>' +
    '<p class="contacts">' + S.contacts.map(function (c, i) {
      // An email is stored in pieces so no published file holds the address for scrapers to find.
      if (c.email) { var at = c.email[0] + '@' + c.email.slice(1).join('.'); c = { label: at, url: 'mailto:' + at }; }
      return '<span class="c">' + link(esc(c.label), c.url) + (i < S.contacts.length - 1 ? '<span class="dot"> ·</span>' : '') + '</span>';
    }).join(' ') + '</p></div>' +
    '<table class="rev-table" aria-label="Document">' +
    S.facts.map(function (f) { return '<tr><th>' + esc(f[0]) + '</th><td>' + f[1] + '</td></tr>'; }).join('') +
    '</table></header>';

  // Section numbers come from position, so removing or reordering a section renumbers everything.
  var toc = '<nav class="toc" aria-label="Contents">' + S.sections.map(function (s, i) {
    return '<a href="#' + s.id + '" data-id="' + s.id + '"><span>' + (i + 1) + '</span>' + esc(s.title) + '</a>';
  }).join('') + '</nav>';
  var body = S.sections.map(function (s, i) {
    return '<section id="' + s.id + '"><h2><span class="sec">' + (i + 1) + '</span>' + esc(s.title) + '</h2>' + fill(s.from ? BUILD[s.from](s) : s.html, i + 1) + '</section>';
  }).join('');
  var foot = '<footer class="sheet-foot">' + S.foot.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('') + '</footer>';

  document.getElementById('site').outerHTML = head + '<main class="sheet">' + title + toc + body + foot + '</main>';

  // Project filter: show all, released only, or not-yet-released only.
  document.querySelectorAll('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.filters button').forEach(function (x) { x.classList.toggle('on', x === b); });
      var f = b.dataset.filter;
      document.querySelectorAll('.card').forEach(function (c) { c.hidden = f !== 'all' && c.dataset.state !== f; });
    });
  });

  // Following a link to an entry (from the research map or the block diagram) unfolds it.
  function unfold() {
    var t = location.hash && document.getElementById(location.hash.slice(1));
    var d = t && t.matches('.entry') && t.querySelector('details.more'); if (d) d.open = true;
  }
  addEventListener('hashchange', unfold); unfold();

  // Layout picker: one option per offered layout (OFFERED in <head>), hidden when there is only one.
  var sel = document.querySelector('.layout-switch');
  sel.hidden = OFFERED.length < 2;
  OFFERED.forEach(function (k) {
    var o = document.createElement('option'); o.value = k; o.textContent = 'Layout: ' + LAYOUTS[k]; sel.appendChild(o);
  });
  sel.value = document.documentElement.dataset.layout;
  sel.addEventListener('change', function () {
    setLayout(sel.value);
    try { localStorage.setItem('layout', sel.value); } catch (err) {}
  });
})();
