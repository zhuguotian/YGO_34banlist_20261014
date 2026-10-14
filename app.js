// TCG banlist predictor — static site, everything runs in the browser.
(() => {
  const MAX_F = 34, MAX_L = 8;
  const LS = { draft: 'ygoban.draft', lang: 'ygoban.lang', nick: 'ygoban.nick', custom: 'ygoban.custom' };
  const MAX_CUSTOM = 50;

  const I18N = {
    zh: {
      skip: '跳到卡池',
      title: 'TCG 禁卡表预测',
      lede: 'Konami 宣布为 <strong>Magnificent Maestros</strong> 更新禁限表：<strong>34 张新禁止、8 张新限制</strong>，在 YCS Houston 分五次公布。下面是近一个月 TCG 上位卡组最常用的 150 张卡，选出你心中的 42 张，导出图片和朋友对答案。',
      forbidden: '禁止', limited: '限制',
      search: '搜索卡名', sortLabel: '排序', sortRank: '按使用热度', sortName: '按卡名',
      typeLabel: '卡片种类', typeAll: '全部种类', typeMonster: '主卡组怪兽', typeSpell: '魔法', typeTrap: '陷阱', typeExtra: '额外卡组',
      pickedOnly: '只看已选', allDecks: '全部卡组', showing: '显示 {n} / {total} 张',
      cov: '覆盖 {x}% 上位', covTitle: '包含此卡的卡组类型合计占近一个月 TCG 上位的 {x}%',
      curLimited: '现限制', curSemi: '现准限制',
      actF: '禁止', actL: '限制', alreadyLimited: '已是限制卡，只能投禁止',
      myBallot: '我的预测', close: '关闭', remove: '移除 {name}',
      emptyBallot: '在卡片上点“禁止”或“限制”开始挑选。',
      nickLabel: '图片署名（可选）', nickPh: '你的昵称',
      hintIncomplete: '还差 {f} 张禁止、{l} 张限制。没选满也可以导出。', hintDone: '42 张都选好了，导出图片分享吧。',
      exportMine: '导出预测图', clear: '清空',
      fullF: '禁止已选满 34 张，先移除一张再选。', fullL: '限制已选满 8 张，先移除一张再选。',
      confirmClear: '清空当前所有选择？',
      exportTitle: '你的预测图', exportTip: '手机上可以长按图片保存。', download: '下载 PNG',
      posterTitle: '我的 TCG 禁卡表预测', posterTitleNick: '{nick}的 TCG 禁卡表预测',
      posterSub: '禁止 {f}/34，限制 {l}/8', posterF: '禁止', posterL: '限制', posterNone: '未选择',
      posterFoot: '卡池：yugiohmeta.com 近一个月 TCG 上位统计（2026-10-14）',
      nothingToExport: '还没有选任何卡。', rendering: '正在生成图片…', exportFailed: '图片生成失败，请换个浏览器再试。',
      loadFailed: '读不到卡池数据（cards.json）。',
      loadFailedFile: '直接双击打开 index.html 时浏览器不允许读取卡池数据。请在项目文件夹里运行 <code>npm run preview</code>，或者部署到 GitHub Pages 后再访问。',
      method: '卡池怎么来的：取 yugiohmeta.com（Duel Links Meta 旗下的 TCG 站）近一个月的 TCG 上位统计（{tops} 份上位卡组，以 2026 年 9 月 21 日禁限表生效后的比赛为主），汇总占比最高的 {n} 个卡组类型（合计 {share}%）的常见构筑，按卡组占比和卡在构筑中的使用顺位加权排序，取前 150 张，已禁止的卡已排除。“覆盖”是包含该卡的卡组类型合计占比，不是逐卡投入率。你的选择只保存在这台设备的浏览器里。',
      disclaimer: '非官方粉丝项目，与 Konami 无关。卡图来自 YGOPRODeck。',
      addLabel: '不在这 150 张里？按卡名添加', addPh: '输入英文卡名，例如 Maxx',
      addLoading: '正在载入卡片数据库…', addMissing: '卡片数据库还没生成（需要先运行 npm run setup）。', addNoMatch: '没有找到这个卡名。试试换个关键词。',
      tagInPool: '已在卡池', tagForbidden: '现已禁止',
      added: '已把 {name} 加入{kind}。', customTag: '你添加的卡', removeCustom: '从卡池移除 {name}',
      chipCustom: '我添加的', customCap: '最多添加 50 张卡池外的卡。',
    },
    en: {
      skip: 'Skip to card pool',
      title: 'TCG Banlist Prediction',
      lede: 'Konami is updating the Forbidden & Limited List ahead of <strong>Magnificent Maestros</strong>: <strong>34 newly Forbidden and 8 Limited cards</strong>, revealed in five parts at YCS Houston. Below are the 150 cards seen most in TCG tops over the last month. Pick your 42, export the image, and compare with friends.',
      forbidden: 'Forbidden', limited: 'Limited',
      search: 'Search card name', sortLabel: 'Sort', sortRank: 'Most played first', sortName: 'By name',
      typeLabel: 'Card type', typeAll: 'All types', typeMonster: 'Main Deck monsters', typeSpell: 'Spells', typeTrap: 'Traps', typeExtra: 'Extra Deck',
      pickedOnly: 'Picked only', allDecks: 'All decks', showing: 'Showing {n} of {total}',
      cov: 'In {x}% of tops', covTitle: 'Deck types that play this card made up {x}% of TCG tops last month',
      curLimited: 'Limited now', curSemi: 'Semi-Limited now',
      actF: 'Forbid', actL: 'Limit', alreadyLimited: 'Already Limited, can only be Forbidden',
      myBallot: 'My prediction', close: 'Close', remove: 'Remove {name}',
      emptyBallot: 'Tap “Forbid” or “Limit” on a card to start.',
      nickLabel: 'Name on the image (optional)', nickPh: 'Your name or handle',
      hintIncomplete: '{f} Forbidden and {l} Limited left. You can export before filling every slot.', hintDone: 'All 42 slots filled. Export it and share.',
      exportMine: 'Export image', clear: 'Clear',
      fullF: 'All 34 Forbidden slots are used. Remove one first.', fullL: 'All 8 Limited slots are used. Remove one first.',
      confirmClear: 'Clear every pick?',
      exportTitle: 'Your prediction', exportTip: 'On mobile, long-press the image to save it.', download: 'Download PNG',
      posterTitle: 'My TCG banlist prediction', posterTitleNick: '{nick}’s TCG banlist prediction',
      posterSub: 'Forbidden {f}/34, Limited {l}/8', posterF: 'Forbidden', posterL: 'Limited', posterNone: 'None picked',
      posterFoot: 'Card pool: yugiohmeta.com TCG tops, last month (2026-10-14)',
      nothingToExport: 'You haven’t picked any cards yet.', rendering: 'Rendering image…', exportFailed: 'Couldn’t render the image. Try another browser.',
      loadFailed: 'Couldn’t load the card pool (cards.json).',
      loadFailedFile: 'Browsers block reading the card pool when index.html is opened by double-click. Run <code>npm run preview</code> in the project folder, or open the GitHub Pages address instead.',
      method: 'How the pool was built: yugiohmeta.com (Duel Links Meta’s TCG site) TCG tops from the last month ({tops} topping decks, mostly after the 21 Sep 2026 list took effect). Cards from the typical builds of the {n} biggest deck types ({share}% of tops combined) were weighted by deck share and by their position in each build’s usage order; the top 150 are shown, with currently Forbidden cards removed. “In X% of tops” is the combined share of deck types that play the card, not a per-card inclusion rate. Your picks are saved only in this browser.',
      disclaimer: 'Unofficial fan project, not affiliated with Konami. Card images via YGOPRODeck.',
      addLabel: 'Not in these 150? Add any card by name', addPh: 'Type a card name, e.g. Maxx',
      addLoading: 'Loading the card database…', addMissing: 'The card database hasn’t been built yet (run npm run setup).', addNoMatch: 'No card matches that name. Try another keyword.',
      tagInPool: 'Already in the pool', tagForbidden: 'Forbidden now',
      added: 'Added {name} to {kind}.', customTag: 'Added by you', removeCustom: 'Remove {name} from the pool',
      chipCustom: 'Added by me', customCap: 'You can add up to 50 extra cards.',
    },
  };
  const DECK_SHORT = { 'Dark Magician Chaos Ritual': 'DM Chaos Ritual' };

  const S = {
    lang: 'zh', cards: [], pool: [], custom: [], byKey: new Map(), poolKeyByName: new Map(), poolKeyById: new Map(), meta: {},
    f: [], l: [], nick: '',
    filter: { q: '', deck: 'all', picked: false, sort: 'rank', type: 'all' },
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cssEsc = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/[^a-zA-Z0-9_-]/g, (c) => '\\' + c));
  function t(key, vars = {}) {
    const str = (I18N[S.lang] && I18N[S.lang][key]) ?? I18N.zh[key] ?? key;
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
  }
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  // ---------- icons ----------
  const BAN_GLYPH = '<circle cx="20" cy="20" r="17" fill="#111" stroke="#C8102E" stroke-width="5"/><path d="M8.6 31.4 31.4 8.6" stroke="#C8102E" stroke-width="5"/>';
  const LIM_GLYPH = (d) => `<circle cx="20" cy="20" r="17" fill="#111" stroke="#C8102E" stroke-width="5"/><text x="20" y="27.6" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="21" fill="#FFCE00">${d}</text>`;
  const svg = (inner) => `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">${inner}</svg>`;
  const banSvg = () => svg(BAN_GLYPH);
  const limSvg = (d = 1) => svg(LIM_GLYPH(d));

  // ---------- card helpers ----------
  function frameOf(c) {
    const base = (c.frameType || '').split('_')[0];
    return ['effect', 'normal', 'ritual', 'fusion', 'synchro', 'xyz', 'link', 'spell', 'trap'].includes(base) ? base : 'unknown';
  }
  function category(c) {
    const ft = c.frameType || '';
    if (!ft) return 'unknown';
    if (ft === 'spell') return 'spell';
    if (ft === 'trap') return 'trap';
    if (/fusion|synchro|xyz|link/.test(ft)) return 'extra';
    return 'monster';
  }
  const imgSrc = (c) => (c && c.id ? `img/${c.id}.jpg` : null); // relative: works under /<repo>/ on GitHub Pages
  const deckLabel = (d) => DECK_SHORT[d] || d;

  // ---------- i18n ----------
  function applyI18n() {
    document.documentElement.lang = S.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('title');
    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (key === 'lede') el.innerHTML = t(key); else el.textContent = t(key);
    });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === S.lang)));
    $$('[data-icon="ban"]').forEach((el) => { el.innerHTML = banSvg(); });
    $$('[data-icon="lim"]').forEach((el) => { el.innerHTML = limSvg(1); });
    const m = S.meta;
    if (m && m.sampledDeckTypes) {
      $('#methodNote').textContent = t('method', { tops: m.tops, n: Object.keys(m.sampledDeckTypes).length, share: m.sampledShare });
    }
  }

  // ---------- tally ----------
  function buildTally() {
    const mk = (n, glyph) => Array.from({ length: n }, () =>
      `<span class="slot">${svg(`<circle class="ring" cx="20" cy="20" r="17"/><g class="glyph">${glyph}</g>`)}</span>`).join('');
    $('#tallyF').innerHTML = mk(MAX_F, BAN_GLYPH);
    $('#tallyL').innerHTML = mk(MAX_L, LIM_GLYPH(1));
  }
  function updateTally() {
    $$('#tallyF .slot').forEach((s, i) => s.classList.toggle('on', i < S.f.length));
    $$('#tallyL .slot').forEach((s, i) => s.classList.toggle('on', i < S.l.length));
    $('#countF').textContent = S.f.length; $('#countL').textContent = S.l.length;
    $('#mbF').textContent = S.f.length; $('#mbL').textContent = S.l.length;
  }

  // ---------- grid ----------
  function tileHTML(c, maxCov) {
    const src = imgSrc(c); // added cards use img/<id>.jpg too when it was downloaded; otherwise a text tile
    const cur = c.status === 'limited' ? `<span class="cur">${limSvg(1)}${esc(t('curLimited'))}</span>`
      : c.status === 'semi' ? `<span class="cur">${limSvg(2)}${esc(t('curSemi'))}</span>` : '';
    const decks = c.decks.map(deckLabel).join(', ');
    const limDisabled = c.status === 'limited';
    return `<article class="tile${c.custom ? ' custom' : ''}" data-key="${esc(c.key)}" style="--frame: var(--fr-${frameOf(c)})">
      <div class="art">
        ${src ? `<img src="${src}" alt="" loading="lazy" decoding="async" width="168" height="246">` : `<div class="ph">${esc(c.name)}</div>`}
        <span class="mark mark-f">${banSvg()}</span><span class="mark mark-l">${limSvg(1)}</span>${cur}
        ${c.custom ? `<button type="button" class="tile-del" data-del="${esc(c.key)}" aria-label="${esc(t('removeCustom', { name: c.name }))}" title="${esc(t('removeCustom', { name: c.name }))}">×</button>` : ''}
      </div>
      <div class="tile-body">
        <h3>${esc(c.name)}</h3>
        ${c.custom ? `<span class="custom-tag">${esc(t('customTag'))}</span>` : `
        <span class="cov" title="${esc(t('covTitle', { x: c.coverage }))}">${esc(t('cov', { x: c.coverage }))}</span>
        <span class="cov-bar"><i style="width:${Math.round((c.coverage / maxCov) * 100)}%"></i></span>
        <span class="decks" title="${esc(decks)}">${esc(decks)}</span>`}
      </div>
      <div class="acts">
        <button type="button" class="act act-f" data-act="f" aria-pressed="false" aria-label="${esc(t('actF'))}: ${esc(c.name)}">${banSvg()}<span>${esc(t('actF'))}</span></button>
        <button type="button" class="act act-l" data-act="l" aria-pressed="false" ${limDisabled ? `disabled title="${esc(t('alreadyLimited'))}"` : ''} aria-label="${esc(t('actL'))}: ${esc(c.name)}">${limSvg(1)}<span>${esc(t('actL'))}</span></button>
      </div>
    </article>`;
  }
  function renderGrid() {
    const maxCov = Math.max(...S.pool.map((x) => x.coverage), 1);
    $('#grid').innerHTML = S.cards.map((c) => tileHTML(c, maxCov)).join('');
    applyFilter();
    updatePicks();
  }
  function renderChips() {
    const decks = Object.entries(S.meta.sampledDeckTypes || {}).sort((a, b) => b[1] - a[1]);
    const chip = (val, label, small) => `<button type="button" class="chip" data-deck="${esc(val)}" aria-pressed="${S.filter.deck === val}">${esc(label)}${small ? `<small>${esc(small)}</small>` : ''}</button>`;
    if (S.filter.deck === 'custom' && !S.custom.length) S.filter.deck = 'all';
    $('#deckChips').innerHTML = chip('all', t('allDecks'))
      + (S.custom.length ? chip('custom', t('chipCustom'), String(S.custom.length)) : '')
      + decks.map(([d, s]) => chip(d, deckLabel(d), `${s}%`)).join('');
  }
  function applyFilter() {
    const { q, deck, picked, sort, type } = S.filter;
    const query = q.trim().toLowerCase();
    const order = [...S.cards].sort(sort === 'name'
      ? (a, b) => a.name.localeCompare(b.name)
      : (a, b) => (b.custom ? 1 : 0) - (a.custom ? 1 : 0) || a.rank - b.rank); // stable: your added cards first
    const grid = $('#grid');
    let shown = 0;
    for (const c of order) {
      const el = grid.querySelector(`.tile[data-key="${cssEsc(c.key)}"]`);
      if (!el) continue;
      const ok = (!query || c.name.toLowerCase().includes(query))
        && (deck === 'all' || (deck === 'custom' ? !!c.custom : c.decks.includes(deck)))
        && (!picked || S.f.includes(c.key) || S.l.includes(c.key))
        && (type === 'all' || category(c) === type);
      el.hidden = !ok;
      if (ok) shown++;
      grid.appendChild(el);
    }
    $('#resultLine').textContent = t('showing', { n: shown, total: S.cards.length });
  }

  // ---------- picks ----------
  function saveDraft() { store.set(LS.draft, JSON.stringify({ f: S.f, l: S.l })); }
  function afterPicksChanged() {
    saveDraft();
    updatePicks();
    if (S.filter.picked) applyFilter();
  }
  // Put a card into Forbidden or Limited (moving it from the other list if needed). Returns true if it ends up there.
  function pick(key, kind) {
    const c = S.byKey.get(key);
    if (!c) return false;
    if (kind === 'f') {
      if (S.f.includes(key)) return true;
      if (S.f.length >= MAX_F) { toast(t('fullF')); return false; }
      S.l = S.l.filter((k) => k !== key); S.f = [...S.f, key];
    } else {
      if (c.status === 'limited') { toast(t('alreadyLimited')); return false; }
      if (S.l.includes(key)) return true;
      if (S.l.length >= MAX_L) { toast(t('fullL')); return false; }
      S.f = S.f.filter((k) => k !== key); S.l = [...S.l, key];
    }
    afterPicksChanged();
    return true;
  }
  function toggle(key, kind) {
    if (kind === 'f' && S.f.includes(key)) { S.f = S.f.filter((k) => k !== key); return afterPicksChanged(); }
    if (kind === 'l' && S.l.includes(key)) { S.l = S.l.filter((k) => k !== key); return afterPicksChanged(); }
    pick(key, kind);
  }

  // ---------- your own cards (outside the pool) ----------
  function saveCustom() {
    store.set(LS.custom, JSON.stringify(S.custom.map(({ key, id, name, frameType, status }) => ({ key, id, name, frameType, status }))));
  }
  function rebuildCards() {
    S.cards = [...S.custom, ...S.pool];
    S.byKey = new Map(S.cards.map((c) => [c.key, c]));
  }
  function makeCustom(o) {
    return { key: o.key, id: o.id, name: o.name, frameType: o.frameType || '', status: o.status || 'unlimited', custom: true, decks: [], coverage: 0, rank: 0 };
  }
  function addCustom(item) {
    const key = `c${item.id}`;
    if (S.byKey.has(key)) return key;
    if (S.custom.length >= MAX_CUSTOM) { toast(t('customCap')); return null; }
    S.custom = [makeCustom({ key, id: item.id, name: item.name, frameType: item.frameType,
      status: item.st === 'L' ? 'limited' : item.st === 'S' ? 'semi' : 'unlimited' }), ...S.custom];
    saveCustom(); rebuildCards(); renderChips(); renderGrid();
    return key;
  }
  function removeCustom(key) {
    S.custom = S.custom.filter((c) => c.key !== key);
    S.f = S.f.filter((k) => k !== key); S.l = S.l.filter((k) => k !== key);
    saveCustom(); saveDraft(); rebuildCards(); renderChips(); renderGrid();
  }

  // ---------- card database search (allcards.json, built by npm run setup) ----------
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  let allCards = null;          // null = not loaded yet, false = unavailable
  let allLoading = null;
  let lastResults = [];
  function loadAll() {
    if (!allLoading) {
      allLoading = fetch('allcards.json')
        .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
        .then((j) => { allCards = j.cards.map(([id, name, frameType, st]) => ({ id, name, frameType, st, n: norm(name) })); })
        .catch(() => { allCards = false; });
    }
    return allLoading;
  }
  function searchAll(q) {
    const nq = norm(q);
    const hits = [];
    for (const c of allCards) {
      const i = c.n.indexOf(nq);
      if (i < 0) continue;
      const where = i === 0 ? 0 : c.n[i - 1] === ' ' ? 1 : 2; // name start, word start, anywhere
      hits.push([where * 1000 + c.n.length, c]);
    }
    hits.sort((a, b) => a[0] - b[0]);
    return hits.slice(0, 8).map((h) => h[1]);
  }
  const poolKeyFor = (c) => S.poolKeyById.get(c.id) || S.poolKeyByName.get(c.name.toLowerCase());
  function optionHTML(c, i) {
    const poolKey = poolKeyFor(c);
    const key = poolKey || `c${c.id}`;
    const poolCard = poolKey && S.byKey.get(poolKey);
    const status = poolCard ? poolCard.status : c.st === 'L' ? 'limited' : c.st === 'S' ? 'semi' : c.st === 'F' ? 'forbidden' : 'unlimited';
    const banned = status === 'forbidden';
    const tag = poolKey ? t('tagInPool') : banned ? t('tagForbidden') : status === 'limited' ? t('curLimited') : status === 'semi' ? t('curSemi') : '';
    const fOn = S.f.includes(key), lOn = S.l.includes(key);
    return `<li class="opt" role="option" aria-selected="false" data-i="${i}" style="--frame: var(--fr-${frameOf(c)})">
      <span class="opt-thumb" aria-hidden="true"><img src="img/${c.id}.jpg" alt="" loading="lazy" width="28" height="41"></span>
      <span class="opt-name">${esc(c.name)}</span>
      ${tag ? `<span class="opt-tag${banned ? ' bad' : ''}">${esc(tag)}</span>` : ''}
      <span class="opt-acts">
        <button type="button" data-add="f" aria-pressed="${fOn}" ${banned ? 'disabled' : ''} aria-label="${esc(t('actF'))}: ${esc(c.name)}">${esc(t('actF'))}</button>
        <button type="button" data-add="l" aria-pressed="${lOn}" ${banned || status === 'limited' ? 'disabled' : ''} aria-label="${esc(t('actL'))}: ${esc(c.name)}">${esc(t('actL'))}</button>
      </span></li>`;
  }
  function showAddList(content) {
    const list = $('#addList');
    list.innerHTML = Array.isArray(content) ? content.map(optionHTML).join('') : `<li class="opt-msg">${esc(content)}</li>`;
    list.hidden = false;
    $('#addQ').setAttribute('aria-expanded', 'true');
  }
  function closeAddList() {
    $('#addList').hidden = true;
    $('#addQ').setAttribute('aria-expanded', 'false');
  }
  async function runAddSearch() {
    const q = $('#addQ').value;
    if (norm(q).length < 2) { lastResults = []; return closeAddList(); }
    if (allCards === null) { showAddList(t('addLoading')); await loadAll(); }
    if ($('#addQ').value !== q) return; // user kept typing; a newer search will run
    if (allCards === false) return showAddList(t('addMissing'));
    lastResults = searchAll(q);
    showAddList(lastResults.length ? lastResults : t('addNoMatch'));
  }
  function addFromSearch(item, kind) {
    const poolKey = poolKeyFor(item);
    const key = poolKey || addCustom(item);
    if (!key) return;
    if (pick(key, kind)) toast(t('added', { name: item.name, kind: kind === 'f' ? t('forbidden') : t('limited') }));
    $('#addQ').value = '';
    lastResults = [];
    closeAddList();
    $('#addQ').focus();
  }

  function updatePicks() {
    const fs = new Set(S.f), ls = new Set(S.l);
    $$('#grid .tile').forEach((el) => {
      const k = el.dataset.key, isF = fs.has(k), isL = ls.has(k);
      el.classList.toggle('is-f', isF); el.classList.toggle('is-l', isL);
      el.querySelector('.act-f').setAttribute('aria-pressed', String(isF));
      el.querySelector('.act-l').setAttribute('aria-pressed', String(isL));
    });
    updateTally();
    renderBallot();
  }
  function renderBallot() {
    const li = (k, i, kind) => {
      const c = S.byKey.get(k);
      return `<li><span class="num">${i + 1}</span><span class="nm" title="${esc(c.name)}">${esc(c.name)}</span><button type="button" class="rm" data-rm="${esc(k)}" data-kind="${kind}" aria-label="${esc(t('remove', { name: c.name }))}">×</button></li>`;
    };
    $('#listF').innerHTML = S.f.map((k, i) => li(k, i, 'f')).join('');
    $('#listL').innerHTML = S.l.map((k, i) => li(k, i, 'l')).join('');
    $('#bnF').textContent = `${S.f.length}/${MAX_F}`;
    $('#bnL').textContent = `${S.l.length}/${MAX_L}`;
    const empty = S.f.length + S.l.length === 0;
    $('#ballotEmpty').hidden = !empty;
    $('#exportMine').disabled = empty;
    const leftF = MAX_F - S.f.length, leftL = MAX_L - S.l.length;
    $('#ballotHint').textContent = empty ? '' : (leftF || leftL ? t('hintIncomplete', { f: leftF, l: leftL }) : t('hintDone'));
  }

  // ---------- poster ----------
  const P = { paper: '#E7ECF2', band: '#15203B', ink: '#15203B', muted: '#59657C', bandMuted: '#A9B4C8', line: '#C7D0DC', ban: '#C8102E', lim: '#E3A400' };
  const FRAME_HEX = { effect: '#C47A3A', normal: '#D8B36A', ritual: '#5B8BD0', fusion: '#8A5CB0', synchro: '#D9DBE2', xyz: '#2A2A2E', link: '#2C6CB0', spell: '#1F9A78', trap: '#B4527F', unknown: '#9AA4B5' };
  const FONT_D = '"Barlow Condensed", "Arial Narrow", "PingFang SC", "Microsoft YaHei", sans-serif';
  const FONT_B = '"Barlow", "PingFang SC", "Microsoft YaHei", sans-serif';

  function loadImg(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      const timer = setTimeout(() => resolve(null), 8000);
      img.onload = () => { clearTimeout(timer); resolve(img); };
      img.onerror = () => { clearTimeout(timer); resolve(null); };
      img.src = src;
    });
  }
  function wrapText(ctx, text, maxW, maxLines) {
    const lines = []; let line = '';
    for (const w of text.split(/(\s+)/).filter(Boolean)) {
      const test = line + w;
      if (ctx.measureText(test).width <= maxW) { line = test; continue; }
      if (line.trim()) { lines.push(line.trim()); line = w.trimStart(); }
      else line = test;
      while (ctx.measureText(line).width > maxW) { // a single word wider than the cell
        let cut = line.length - 1;
        while (cut > 1 && ctx.measureText(line.slice(0, cut)).width > maxW) cut--;
        lines.push(line.slice(0, cut)); line = line.slice(cut);
      }
    }
    if (line.trim()) lines.push(line.trim());
    if (lines.length <= maxLines) return lines;
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
    kept[maxLines - 1] = last + '…';
    return kept;
  }
  function drawIcon(ctx, x, y, r, digit) {
    ctx.save(); ctx.lineWidth = r * 0.28;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill(); ctx.strokeStyle = '#C8102E'; ctx.stroke();
    if (digit) {
      ctx.fillStyle = '#FFCE00'; ctx.font = `700 ${Math.round(r * 1.2)}px Arial, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(digit, x, y + r * 0.06);
    } else {
      const d = r * 0.68; ctx.beginPath(); ctx.moveTo(x - d, y + d); ctx.lineTo(x + d, y - d); ctx.stroke();
    }
    ctx.restore();
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function siteLabel() {
    const path = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    return location.protocol.startsWith('http') ? location.host + path : '';
  }

  async function makePoster() {
    try {
      await Promise.all([document.fonts.load(`700 40px ${FONT_D}`), document.fonts.load(`600 16px ${FONT_D}`), document.fonts.load(`500 16px ${FONT_B}`)]);
    } catch { /* fall back to system fonts */ }
    const fItems = S.f.map((k) => S.byKey.get(k)), lItems = S.l.map((k) => S.byKey.get(k));
    const W = 1200, PAD = 48, COLS = 8, GAP = 14;
    const cellW = (W - PAD * 2 - GAP * (COLS - 1)) / COLS;
    const imgH = Math.round((cellW * 246) / 168);
    const cellH = imgH + 52;
    const gridH = (n) => (n ? Math.ceil(n / COLS) * (cellH + GAP) : 40);
    const HEAD = 176, SEC = 76, FOOT = 74;
    const H = HEAD + SEC + gridH(fItems.length) + 18 + SEC + gridH(lItems.length) + FOOT;
    const scale = 1.5;
    const cv = document.createElement('canvas');
    cv.width = W * scale; cv.height = H * scale;
    const ctx = cv.getContext('2d');
    ctx.scale(scale, scale);
    const imgs = await Promise.all([...fItems, ...lItems].map((c) => loadImg(imgSrc(c))));

    ctx.fillStyle = P.paper; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = P.band; ctx.fillRect(0, 0, W, HEAD);
    const title = S.nick ? t('posterTitleNick', { nick: S.nick }) : t('posterTitle');
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillStyle = '#EEF2F8';
    let size = 60; ctx.font = `700 ${size}px ${FONT_D}`;
    while (size > 34 && ctx.measureText(title).width > W - PAD * 2 - 130) { size -= 2; ctx.font = `700 ${size}px ${FONT_D}`; }
    ctx.fillText(title, PAD, 86);
    ctx.fillStyle = P.bandMuted; ctx.font = `500 22px ${FONT_B}`;
    ctx.fillText(t('posterSub', { f: fItems.length, l: lItems.length }), PAD, 126);
    ctx.textAlign = 'right'; ctx.font = `500 18px ${FONT_B}`;
    ctx.fillText(new Date().toLocaleDateString(S.lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W - PAD, 126);
    drawIcon(ctx, W - PAD - 70, 64, 22); drawIcon(ctx, W - PAD - 18, 64, 22, '1');

    let y = HEAD, idx = 0;
    const section = (label, items, kind) => {
      y += 22;
      drawIcon(ctx, PAD + 16, y + 20, 16, kind === 'l' ? '1' : null);
      ctx.textAlign = 'left'; ctx.fillStyle = P.ink; ctx.font = `700 34px ${FONT_D}`;
      ctx.fillText(`${label}  ${items.length}`, PAD + 44, y + 32);
      y += SEC - 22;
      if (!items.length) {
        ctx.fillStyle = P.muted; ctx.font = `500 18px ${FONT_B}`; ctx.fillText(t('posterNone'), PAD, y + 24);
      }
      items.forEach((c, i) => {
        const x = PAD + (i % COLS) * (cellW + GAP), cy = y + Math.floor(i / COLS) * (cellH + GAP);
        const img = imgs[idx++];
        const fr = frameOf(c);
        ctx.save(); roundRect(ctx, x, cy, cellW, imgH, 6); ctx.clip();
        if (img) ctx.drawImage(img, x, cy, cellW, imgH);
        else {
          ctx.fillStyle = FRAME_HEX[fr]; ctx.fillRect(x, cy, cellW, imgH);
          ctx.fillStyle = fr === 'xyz' ? '#FFFFFF' : P.ink; ctx.font = `600 17px ${FONT_D}`; ctx.textAlign = 'center';
          const ls = wrapText(ctx, c.name, cellW - 16, 6);
          ls.forEach((ln, j) => ctx.fillText(ln, x + cellW / 2, cy + imgH / 2 - (ls.length - 1) * 10 + j * 20));
        }
        ctx.restore();
        ctx.save(); roundRect(ctx, x, cy, cellW, imgH, 6); ctx.lineWidth = 3; ctx.strokeStyle = kind === 'f' ? P.ban : P.lim; ctx.stroke(); ctx.restore();
        ctx.fillStyle = P.band; roundRect(ctx, x, cy, 30, 24, 4); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.font = `700 16px ${FONT_D}`; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), x + 15, cy + 18);
        ctx.textAlign = 'left'; ctx.fillStyle = P.ink; ctx.font = `600 16px ${FONT_D}`;
        wrapText(ctx, c.name, cellW, 2).forEach((ln, j) => ctx.fillText(ln, x, cy + imgH + 22 + j * 17));
      });
      y += gridH(items.length);
    };
    section(t('posterF'), fItems, 'f');
    y += 18;
    section(t('posterL'), lItems, 'l');

    ctx.fillStyle = P.line; ctx.fillRect(PAD, H - FOOT + 10, W - PAD * 2, 1);
    ctx.textAlign = 'left'; ctx.fillStyle = P.muted; ctx.font = `500 16px ${FONT_B}`;
    ctx.fillText(t('posterFoot'), PAD, H - FOOT + 42);
    ctx.textAlign = 'right'; ctx.fillText(siteLabel(), W - PAD, H - FOOT + 42);

    return new Promise((resolve, reject) => {
      try { cv.toBlob((b) => (b ? resolve(b) : reject(new Error('empty'))), 'image/png'); } catch (e) { reject(e); }
    });
  }

  let lastUrl = null;
  async function exportImage() {
    if (!S.f.length && !S.l.length) return toast(t('nothingToExport'));
    toast(t('rendering'));
    let blob;
    try { blob = await makePoster(); } catch { return toast(t('exportFailed')); }
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = URL.createObjectURL(blob);
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    $('#modalImg').src = lastUrl;
    const dl = $('#modalDownload');
    dl.href = lastUrl; dl.download = `banlist-prediction-${stamp}.png`;
    openBallot(false);
    $('#modal').hidden = false;
    $('#modalClose').focus();
  }

  // ---------- ui plumbing ----------
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }
  function openBallot(open) { $('#ballot').classList.toggle('open', open); }

  function bind() {
    $('#grid').addEventListener('click', (e) => {
      const del = e.target.closest('.tile-del');
      if (del) return removeCustom(del.dataset.del);
      const btn = e.target.closest('.act');
      if (btn) toggle(btn.closest('.tile').dataset.key, btn.dataset.act);
    });
    let addTimer = null;
    $('#addQ').addEventListener('input', () => { clearTimeout(addTimer); addTimer = setTimeout(runAddSearch, 120); });
    $('#addQ').addEventListener('focus', () => { loadAll(); if (norm($('#addQ').value).length >= 2) runAddSearch(); });
    $('#addQ').addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeAddList(); return; }
      if (e.key === 'ArrowDown') {
        const first = $('#addList button:not(:disabled)');
        if (first) { e.preventDefault(); first.focus(); }
      }
    });
    $('#addList').addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.remove(); }, true); // no image -> coloured block
    $('#addList').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-add]');
      if (!btn || btn.disabled) return;
      const item = lastResults[Number(btn.closest('.opt').dataset.i)];
      if (item) addFromSearch(item, btn.dataset.add);
    });
    $('#addList').addEventListener('keydown', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (e.key === 'Escape') { e.stopPropagation(); closeAddList(); $('#addQ').focus(); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const rows = $$('#addList .opt');
      const i = rows.indexOf(btn.closest('.opt'));
      const next = rows[i + (e.key === 'ArrowDown' ? 1 : -1)];
      if (!next) { if (e.key === 'ArrowUp') $('#addQ').focus(); return; }
      (next.querySelector(`button[data-add="${btn.dataset.add}"]:not(:disabled)`) || next.querySelector('button:not(:disabled)'))?.focus();
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('#adder')) closeAddList(); });
    $('#grid').addEventListener('error', (e) => { // missing image -> name placeholder
      if (e.target.tagName !== 'IMG') return;
      const tile = e.target.closest('.tile'); const c = tile && S.byKey.get(tile.dataset.key);
      const ph = document.createElement('div'); ph.className = 'ph'; ph.textContent = c ? c.name : '';
      e.target.replaceWith(ph);
    }, true);
    $('#ballot').addEventListener('click', (e) => {
      const rm = e.target.closest('[data-rm]');
      if (rm) toggle(rm.dataset.rm, rm.dataset.kind);
    });
    $('#q').addEventListener('input', (e) => { S.filter.q = e.target.value; applyFilter(); });
    $('#sort').addEventListener('change', (e) => { S.filter.sort = e.target.value; applyFilter(); });
    $('#type').addEventListener('change', (e) => { S.filter.type = e.target.value; applyFilter(); });
    $('#pickedOnly').addEventListener('change', (e) => { S.filter.picked = e.target.checked; applyFilter(); });
    $('#deckChips').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      S.filter.deck = chip.dataset.deck;
      $$('#deckChips .chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      applyFilter();
    });
    $('#nick').addEventListener('input', (e) => { S.nick = e.target.value.trim(); store.set(LS.nick, S.nick); });
    $('#exportMine').addEventListener('click', exportImage);
    $('#clearBtn').addEventListener('click', () => {
      if (!S.f.length && !S.l.length) return;
      if (!confirm(t('confirmClear'))) return;
      S.f = []; S.l = []; saveDraft(); updatePicks(); if (S.filter.picked) applyFilter();
    });
    $('#openBallot').addEventListener('click', () => openBallot(true));
    $('#ballotClose').addEventListener('click', () => openBallot(false));
    $('#modalClose').addEventListener('click', () => { $('#modal').hidden = true; });
    $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') $('#modal').hidden = true; });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!$('#modal').hidden) $('#modal').hidden = true;
      else if (!$('#addList').hidden) closeAddList();
      else openBallot(false);
    });
    $$('.lang button').forEach((b) => b.addEventListener('click', () => {
      S.lang = b.dataset.lang; store.set(LS.lang, S.lang);
      closeAddList(); applyI18n(); renderChips(); renderGrid();
    }));
  }

  async function init() {
    const saved = store.get(LS.lang);
    S.lang = saved === 'en' || saved === 'zh' ? saved : ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
    S.nick = store.get(LS.nick) || '';
    $('#nick').value = S.nick;
    bind();
    buildTally();
    applyI18n();
    try {
      const res = await fetch('cards.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(String(res.status));
      const pool = await res.json();
      S.pool = pool.cards; S.meta = pool.meta;
      S.poolKeyByName = new Map(S.pool.map((c) => [c.name.toLowerCase(), c.key]));
      S.poolKeyById = new Map(S.pool.filter((c) => c.id).map((c) => [c.id, c.key]));
      try {
        const saved = JSON.parse(store.get(LS.custom) || '[]');
        const poolKeys = new Set(S.pool.map((c) => c.key));
        S.custom = saved.filter((c) => c && /^c\d+$/.test(c.key) && c.name && !poolKeys.has(c.key)
          && !S.poolKeyByName.has(c.name.toLowerCase()) && !S.poolKeyById.has(c.id)).slice(0, MAX_CUSTOM).map(makeCustom);
      } catch { S.custom = []; }
      rebuildCards();
    } catch {
      const msg = location.protocol === 'file:' ? t('loadFailedFile') : esc(t('loadFailed'));
      $('#grid').innerHTML = `<div class="load-error">${msg}</div>`;
      return;
    }
    $('#typeWrap').hidden = !S.pool.some((c) => c.frameType);
    try {
      const draft = JSON.parse(store.get(LS.draft) || 'null');
      if (draft) {
        S.f = (draft.f || []).filter((k) => S.byKey.has(k)).slice(0, MAX_F);
        S.l = (draft.l || []).filter((k) => S.byKey.has(k) && S.byKey.get(k).status !== 'limited' && !S.f.includes(k)).slice(0, MAX_L);
      }
    } catch { /* ignore a corrupted draft */ }
    applyI18n();
    renderChips();
    renderGrid();
  }

  init();
})();
