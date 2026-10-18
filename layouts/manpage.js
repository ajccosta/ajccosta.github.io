// less(1) for the man page layout: the keys move and search the page the way `man` does in a
// terminal, and the bottom row is less's prompt. Acts only while <html data-layout="manpage">.
//
// Add a command: one entry in COMMANDS (what it does) and its keys in KEYS. The help screen
// (h) is built from the same table, so it lists every key that works.
(function () {
  var LAYOUT = 'manpage';
  var root = document.documentElement;
  function active() { return root.dataset.layout === LAYOUT; }

  var prompt, help, lastSearch = null, lastHit = null, lastDir = 1, count = '', mode = 'start', input = '', message = '', escPending = false;
  var previousLayout = null;

  // ---- scrolling: the page, or the help screen while it is open --------------------------------
  function row() { return parseFloat(getComputedStyle(document.body).lineHeight) || 18; }
  function rows() { return Math.max(1, Math.floor(innerHeight / row()) - 1); }  // minus the prompt row
  function scroller() { return help && !help.hidden ? help : null; }
  function top() { var s = scroller(); return s ? s.scrollTop : scrollY; }
  function maxTop() {
    var s = scroller();
    return s ? s.scrollHeight - s.clientHeight : document.documentElement.scrollHeight - innerHeight;
  }
  function goTo(y) {
    y = Math.max(0, Math.min(Math.round(y), maxTop()));
    var s = scroller();
    if (s) s.scrollTop = y; else scrollTo({ top: y, behavior: 'instant' });
  }
  function by(lines) { goTo(top() + lines * row()); }

  // ---- search ----------------------------------------------------------------------------------
  // Matches in text are wrapped in <mark>; section names drawn by CSS (NAME, CONTACT, ...) are
  // searched through their ::before content and marked with a class.
  var PSEUDO_HEADINGS = '.title-block, .contacts, .lede, .toc';
  function clearHits() {
    document.querySelectorAll('mark.less-hit').forEach(function (m) {
      var p = m.parentNode; m.replaceWith(document.createTextNode(m.textContent)); p.normalize();
    });
    document.querySelectorAll('.less-hit-before').forEach(function (e) { e.classList.remove('less-hit-before'); });
  }
  function regex(pattern) {
    try { return new RegExp(pattern, 'gi'); }                       // man runs less with -I: ignore case
    catch (e) { return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); }
  }
  function highlight(pattern) {
    clearHits();
    var re = regex(pattern), hits = [], sheet = document.querySelector('.sheet');
    var walk = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var el = n.parentElement;
        var folded = el.closest('details:not([open])') && !el.closest('summary');
        return el.closest('select, script, style') || (!folded && !el.getClientRects().length) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(function (n) {
      var text = n.textContent, m, last = 0, frag = null;
      re.lastIndex = 0;
      while ((m = re.exec(text)) && m[0].length) {
        frag = frag || document.createDocumentFragment();
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var mark = document.createElement('mark'); mark.className = 'less-hit'; mark.textContent = m[0];
        frag.appendChild(mark); hits.push(mark); last = m.index + m[0].length;
      }
      if (frag) { frag.appendChild(document.createTextNode(text.slice(last))); n.replaceWith(frag); }
    });
    document.querySelectorAll(PSEUDO_HEADINGS).forEach(function (el) {
      var c = getComputedStyle(el, '::before').content.replace(/^"|"$/g, '');
      re.lastIndex = 0;
      if (c && c !== 'none' && re.test(c)) { el.classList.add('less-hit-before'); hits.push(el); }
    });
    return hits;
  }
  function search(pattern, dir) {
    // Only a new / or ? sets the direction; n and N repeat it or reverse it without changing it.
    if (pattern != null) { lastDir = dir; lastHit = null; }
    if (pattern === '' || pattern == null) pattern = lastSearch;
    if (pattern == null) return say('No previous regular expression');
    lastSearch = pattern;
    // A hit inside a folded explanation sits at its summary line; going to it unfolds it, as in vim.
    function at(h) { var f = h.closest('details:not([open])'); return (f ? f.querySelector('summary') : h).getBoundingClientRect().top + scrollY; }
    var hits = highlight(pattern).map(function (h) { return { el: h, y: at(h) }; })
      .sort(function (a, b) { return a.y - b.y; });
    if (!hits.length) return say('Pattern not found  (press RETURN)');
    // Count from the last match we went to while the page is still where we left it (near the
    // bottom, a match can't reach the top line), else from the top line.
    var from = lastHit && lastHit.top === top() ? lastHit.y : top(), eps = row() / 2, hit, wrapped = '';
    if (dir > 0) hit = hits.find(function (h) { return h.y > from + eps; });   // starts below the top line
    else hit = hits.filter(function (h) { return h.y < from - eps; }).pop();
    if (!hit) {   // past the last match: carry on from the other end, as vim does
      hit = dir > 0 ? hits[0] : hits[hits.length - 1];
      wrapped = dir > 0 ? 'search hit BOTTOM, continuing at TOP' : 'search hit TOP, continuing at BOTTOM';
    }
    var fold = hit.el.closest('details:not([open])');
    if (fold) fold.open = true;
    document.querySelectorAll('.less-now').forEach(function (e) { e.classList.remove('less-now'); });
    hit.el.classList.add('less-now');
    var y = hit.el.getBoundingClientRect().top + scrollY;
    goTo(y);
    lastHit = { y: y, top: top() };
    if (wrapped) return say(wrapped);
    status();
  }

  // ---- folds: the explanations under each research entry -------------------------------------
  // The fold a command acts on: the focused one (Tab to it), else the first whose line is on screen.
  function folds() { return Array.prototype.slice.call(document.querySelectorAll('details.more')); }
  function currentFold() {
    var f = document.activeElement && document.activeElement.closest && document.activeElement.closest('details.more');
    return f || folds().find(function (d) {
      var r = d.querySelector('summary').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight - row();
    });
  }
  function fold(open) {
    var f = currentFold();
    if (!f) return say('No fold on screen');
    f.open = open === undefined ? !f.open : open;
  }

  // ---- commands --------------------------------------------------------------------------------
  // Each takes n, the number typed before the key (0 if none).
  var COMMANDS = {
    down:     { help: 'Forward  one line   (or N lines)', run: function (n) { by(n || 1); } },
    up:       { help: 'Backward one line   (or N lines)', run: function (n) { by(-(n || 1)); } },
    pageDown: { help: 'Forward  one window (or N lines)', run: function (n) { by(n || rows()); } },
    pageUp:   { help: 'Backward one window (or N lines)', run: function (n) { by(-(n || rows())); } },
    halfDown: { help: 'Forward  one half-window',          run: function (n) { by(n || Math.floor(rows() / 2)); } },
    halfUp:   { help: 'Backward one half-window',          run: function (n) { by(-(n || Math.floor(rows() / 2))); } },
    first:    { help: 'Go to first line   (or line N)',    run: function (n) { goTo((Math.max(n, 1) - 1) * row()); } },
    last:     { help: 'Go to last line    (or line N)',    run: function (n) { goTo(n ? (n - 1) * row() : maxTop()); } },
    percent:  { help: 'Go to N percent into the page',     run: function (n) { goTo(maxTop() * Math.min(n, 100) / 100); } },
    search:   { help: 'Search forward for a pattern',      run: function () { startInput('/'); } },
    searchBack: { help: 'Search backward for a pattern',   run: function () { startInput('?'); } },
    next:     { help: 'Repeat previous search',            run: function () { search(null, lastDir); } },
    prev:     { help: 'Repeat previous search in reverse', run: function () { search(null, -lastDir); } },
    info:     { help: 'Print current line and position',   run: function () { info(); } },
    help:     { help: 'Display this help',                 run: function () { openHelp(); } },
    quit:     { help: 'Exit (back to the previous layout)', run: function () { quit(); } },
    repaint:  { help: 'Repaint the screen',                run: function () { status(); } },
    foldToggle: { help: 'Open or close the fold on screen', run: function () { fold(); } },
    foldOpen:   { help: 'Open the fold on screen',          run: function () { fold(true); } },
    foldClose:  { help: 'Close the fold on screen',         run: function () { fold(false); } },
    foldsOpen:  { help: 'Open every fold',                  run: function () { folds().forEach(function (d) { d.open = true; }); } },
    foldsClose: { help: 'Close every fold',                 run: function () { folds().forEach(function (d) { d.open = false; }); } }
  };
  // Keys as less names them: ^D is Ctrl-D, ESC-u is Escape then u.
  var KEYBOARD = !matchMedia('(hover: none) and (pointer: coarse)').matches;
  var KEYS = {
    down: ['j', 'e', '^E', '^N', 'RETURN', 'DOWN'],
    up: ['k', 'y', '^Y', '^P', '^K', 'UP'],
    pageDown: ['SPACE', 'f', '^F', '^V', 'PAGEDOWN'],
    pageUp: ['b', 'w', '^B', 'ESC-v', 'PAGEUP'],
    halfDown: ['d', '^D'],
    halfUp: ['u', '^U'],
    first: ['g', '<', 'HOME', 'ESC-<'],
    last: ['G', '>', 'END', 'ESC->'],
    percent: ['p', '%'],
    search: ['/'],
    searchBack: ['?'],
    next: ['n'],
    prev: ['N'],
    info: ['=', '^G'],
    help: ['h', 'H'],
    quit: ['q', 'Q', ':q', 'ZZ'],
    repaint: ['r', '^R', '^L'],
    foldToggle: ['za'],
    foldOpen: ['zo'],
    foldClose: ['zc'],
    foldsOpen: ['zR'],
    foldsClose: ['zM']
  };
  // q goes back to the previous layout, so it only exists when visitors have another one.
  if (OFFERED.length < 2) { delete KEYS.quit; delete COMMANDS.quit; }
  var BY_KEY = {};
  Object.keys(KEYS).forEach(function (c) { KEYS[c].forEach(function (k) { BY_KEY[k] = c; }); });
  // Two-key commands (:q, ZZ, za): their first key waits for the second.
  var PREFIX = {};
  Object.keys(BY_KEY).forEach(function (k) { if (/^[^^]{2}$/.test(k)) PREFIX[k[0]] = 1; });
  // Escape-u turns search highlighting off, as in less.
  BY_KEY['ESC-u'] = 'unhighlight';
  COMMANDS.unhighlight = { run: function () { clearHits(); } };

  var NAMED = { Enter: 'RETURN', ' ': 'SPACE', ArrowDown: 'DOWN', ArrowUp: 'UP', PageDown: 'PAGEDOWN',
                PageUp: 'PAGEUP', Home: 'HOME', End: 'END' };
  function keyName(e) {
    if (e.ctrlKey && e.key.length === 1) return '^' + e.key.toUpperCase();
    return NAMED[e.key] || (e.key.length === 1 ? e.key : null);
  }

  // ---- the prompt row --------------------------------------------------------------------------
  function render(text, reverse, cursor) {
    prompt.textContent = '';
    var t = document.createElement('span'); t.textContent = text;
    if (reverse) t.className = 'less-rev';
    prompt.appendChild(t);
    if (cursor) { var c = document.createElement('span'); c.className = 'less-cursor'; prompt.appendChild(c); }
  }
  function atEnd() { return top() >= maxTop() - 1; }
  function status() {
    if (!prompt) return;
    if (mode === 'input') return render(input, false, true);
    if (message) return render(message, true, true);
    if (help && !help.hidden) return render(atEnd() ? 'HELP -- END -- Press q when done' : 'HELP -- Press SPACE for more, or q when done', true, true);
    // Touch screens have no keys to press, so they get the page name alone.
    if (mode === 'start') return render('Manual page costa(1) line 1' + (!KEYBOARD ? '' : ' (press h for help' + (KEYS.quit ? ' or q to quit)' : ')')), true, true);
    if (atEnd()) return render('(END)', true, true);
    render(':' + count, false, true);
  }
  function say(text) { message = text; status(); }
  function info() {
    var lh = row(), line = Math.floor(scrollY / lh) + 1, total = Math.ceil(document.documentElement.scrollHeight / lh);
    var pct = Math.round(100 * Math.min(scrollY + innerHeight, document.documentElement.scrollHeight) / document.documentElement.scrollHeight);
    say('Manual page costa(1) line ' + line + '/' + total + ' ' + pct + '%');
  }
  function startInput(ch) { mode = 'input'; input = ch; status(); }

  // ---- help screen, quit -----------------------------------------------------------------------
  function openHelp() {
    if (!help) {
      help = document.createElement('pre'); help.className = 'less-help';
      var lines = ['                   SUMMARY OF LESS COMMANDS', '',
        '      Commands marked with * may be preceded by a number, N.', '',
        '  MOVING', ''];
      var groups = { MOVING: ['down', 'up', 'pageDown', 'pageUp', 'halfDown', 'halfUp', 'first', 'last', 'percent'],
                     SEARCHING: ['search', 'searchBack', 'next', 'prev'],
                     FOLDS: ['foldToggle', 'foldOpen', 'foldClose', 'foldsOpen', 'foldsClose'],
                     OTHER: ['info', 'repaint', 'help', 'quit'].filter(function (c) { return KEYS[c]; }) };
      var NUM = { down: 1, up: 1, pageDown: 1, pageUp: 1, first: 1, last: 1, percent: 1 };
      Object.keys(groups).forEach(function (g, gi) {
        if (gi) lines.push('', '  ' + g, '');
        groups[g].forEach(function (c) {
          var keys = KEYS[c].join('  ');
          lines.push('  ' + (NUM[c] ? '*' : ' ') + ' ' + (keys + new Array(32).join(' ')).slice(0, 32) + COMMANDS[c].help);
        });
      });
      lines.push('', '  ESC-u               Undo search highlighting',
                 '  TAB  RETURN         Move to the next fold or link, and open it', '');
      help.textContent = lines.join('\n');
      help.addEventListener('scroll', status);
      document.body.appendChild(help);
    }
    help.hidden = false; help.scrollTop = 0;
  }
  function closeHelp() { help.hidden = true; }
  function quit() {
    var to = previousLayout && previousLayout !== LAYOUT ? previousLayout : OFFERED.filter(function (l) { return l !== LAYOUT; })[0];
    setLayout(to);
    var sel = document.querySelector('.layout-switch'); if (sel) sel.value = to;
    try { localStorage.setItem('layout', to); } catch (e) {}
  }

  // ---- keyboard --------------------------------------------------------------------------------
  function onKey(e) {
    if (!active() || e.metaKey || e.altKey) return;
    if (e.target.closest && e.target.closest('select, input, textarea, [contenteditable]')) return;
    if (mode === 'input') return onInputKey(e);
    if (e.key === 'Shift' || e.key === 'Control') return;
    var k = keyName(e);
    if (e.key === 'Escape') { escPending = true; e.preventDefault(); return; }
    if (escPending && k) { k = 'ESC-' + k; escPending = false; }
    if (!k) return;
    // RETURN on something Tab has focused (a fold's line, a link) does what a click does.
    if (k === 'RETURN' && !message && e.target.closest && e.target.closest('summary, a, button')) return;
    e.preventDefault();
    if (message) { message = ''; if (k === 'RETURN') return status(); }
    if (help && !help.hidden && (k === 'q' || k === 'Q')) { closeHelp(); mode = 'ready'; return status(); }
    if (/^[0-9]$/.test(k)) { count += k; mode = 'ready'; return status(); }
    if (pendingTwo) { k = pendingTwo + k; pendingTwo = ''; }
    else if (PREFIX[k]) { pendingTwo = k; return; }
    var cmd = BY_KEY[k];
    var n = parseInt(count, 10) || 0; count = '';
    if (mode === 'start') mode = 'ready';
    if (cmd) COMMANDS[cmd].run(n);
    status();
  }
  var pendingTwo = '';
  function onInputKey(e) {
    e.preventDefault();
    if (e.key === 'Enter') {
      var dir = input[0] === '/' ? 1 : -1, pattern = input.slice(1);
      mode = 'ready'; input = '';
      return search(pattern, dir);
    }
    if (e.key === 'Escape' || (e.key === 'Backspace' && input.length === 1) || (e.ctrlKey && e.key.toLowerCase() === 'c')) {
      mode = 'ready'; input = ''; return status();
    }
    if (e.key === 'Backspace') input = input.slice(0, -1);
    else if (e.ctrlKey && e.key.toLowerCase() === 'u') input = input[0];
    else if (e.key.length === 1 && !e.ctrlKey) input += e.key;
    status();
  }

  // ---- on and off with the layout ---------------------------------------------------------------
  // A man page puts SYNOPSIS right after NAME, so the contents move into the title block while
  // this layout is on and go back where every other layout expects them when it is off.
  function placeContents(on) {
    var toc = document.querySelector('.toc'), title = document.querySelector('.title-block');
    if (!toc || !title) return;
    if (on && toc.parentNode !== title) title.appendChild(toc);
    if (!on && toc.parentNode === title) title.after(toc);
  }
  function sync() {
    var on = active();
    placeContents(on);
    prompt.hidden = !on;
    if (help && !on) closeHelp();
    if (!on) { clearHits(); mode = 'start'; message = ''; count = ''; }
    status();
  }
  function init() {
    prompt = document.createElement('div'); prompt.className = 'less-prompt';
    document.body.appendChild(prompt);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { if (m.oldValue && m.oldValue !== LAYOUT) previousLayout = m.oldValue; });
      sync();
    }).observe(root, { attributes: true, attributeFilter: ['data-layout'], attributeOldValue: true });
    document.addEventListener('keydown', onKey);
    addEventListener('scroll', function () { if (active() && mode !== 'input' && !message) status(); }, { passive: true });
    addEventListener('resize', function () { if (active()) status(); });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
