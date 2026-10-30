/* Плагин для Lampa: экран предзагрузки торрента.
 *
 * Установка: Настройки Lampa → Плагины → добавить URL:
 *   https://aukro1408.github.io/files/torrent-preload.js
 * (или через каталог «Мои плагины»: Синхронизировать каталог → включить).
 *
 * Как работает:
 *  - Экран — порт HTML-файла Denis 1:1 (блюр-постер, ведёрко попкорна SVG,
 *    полоса 5px, янтарь #f0b24a, взрыв попкорна на 100%). Изменены только
 *    технические детали: id префиксованы tp-, стили ограничены контейнером
 *    #tp-root (чтобы не задеть стили самой Лампы), имена анимаций tpglide/
 *    tppop (чтобы не пересечься с анимациями Лампы). Демо-режим HTML-файла
 *    вырезан — плагин никогда ничего не показывает сам по себе.
 *  - До v2.2 плагин только наблюдал и рисовал экран поверх плеера, не трогая
 *    воспроизведение. С v2.2 Player.play торрентов задерживается до «Смотреть»
 *    (иначе видео стартовало бы само при ~95% из-под экрана).
 *  - ВАЖНО (v2, причина, почему v1 не показывался): штатная предзагрузка
 *    Лампы работает ДО вызова Lampa.Player.play — сначала Loading-экран
 *    Лампы и опрос TorrServer, и только при >=95% вызывается Player.play.
 *    Поэтому хук только на Player.play физически не мог показать экран во
 *    время предзагрузки. v2 цепляется раньше — за Lampa.Loading.start:
 *    как только Лампа открывает свой Loading-экран с торрентом
 *    (media.url содержит &preload), поверх встаёт наш экран, а штатный
 *    остаётся под ним (наш фон непрозрачный). Player.play-хок оставлен
 *    как запасной путь для торрентов без предзагрузки.
 *  - При запуске торрента плагин показывает экран и опрашивает TorrServer
 *    (адрес берётся из настроек Лампы: torrserver_url / torrserver_url_two,
 *    хеш — из объекта воспроизведения или из URL потока) — ровно тем же
 *    кодом, что режим 1 HTML-файла: POST /torrents {action:"get", hash},
 *    стадии и прогресс по preload_size / preloaded_bytes.
 *  - Экран прячется по «Смотреть» (тогда же стартует видео), по «Отмена»
 *    (выход без запуска) либо при закрытии/ошибке плеера. На 100% сам НЕ
 *    уходит — ждёт нажатия (вердикт Denis, как в приложении v0.25).
 *  - Если хеш найти не удалось или TorrServer недоступен (например,
 *    включена авторизация TorrServer) — живые %/пиры/скорость недоступны:
 *    экран всё равно показывается с бегущей полосой и прячется при старте
 *    видео. Это честный fallback, а не выдуманные цифры.
 *  - Лучше всего работает при включённой настройке Лампы
 *    Настройки → TorrServer → Предзагрузка: тогда поток стартует только
 *    после предзагрузки, и экран виден весь процесс. При выключенной
 *    предзагрузке экран просто мелькнёт и уйдёт при старте видео.
 *  - v2.2 (кнопки + ручной режим): на экране всегда две кнопки — «Смотреть»
 *    и «Отмена», как на фото. Опрос приведён к приложению: ответ
 *    разворачивается ({torrent}), фолбэк на /cache, готовность без
 *    preload_size — min(50МБ, 5% размера).
 *  - DEBUG-плашка (временно) остаётся до диагноза 0%.
 */
(function () {
    'use strict';

    if (window.__denis_tp_loaded) return;
    window.__denis_tp_loaded = true;

    /* ---------- стили: CSS HTML-файла, ограничен контейнером #tp-root ---------- */
    var CSS = [
        '#tp-root{--bg:#08080a;--ink:#f4e9d6;--dim:rgba(244,233,214,.58);--track:rgba(244,233,214,.16);--amber:#f0b24a;',
        'color-scheme:dark;position:fixed;inset:0;z-index:99999;background:var(--bg);color:var(--ink);',
        'font-family:"Manrope",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow:hidden;display:none;pointer-events:none;opacity:1;transition:opacity .4s}',
        '#tp-root,#tp-root *,#tp-root *::before,#tp-root *::after{box-sizing:border-box}',
        '#tp-root .tp-poster{position:absolute;inset:-5%;background:var(--bg) center/cover no-repeat;filter:blur(18px) brightness(.38);transform:scale(1.1);will-change:filter,transform}',
        '#tp-root .tp-scrim{position:absolute;inset:0;pointer-events:none;',
        'background:radial-gradient(ellipse at 50% 55%,rgba(6,6,8,.5) 0%,rgba(6,6,8,0) 68%),linear-gradient(to bottom,rgba(6,6,8,.6) 0%,rgba(6,6,8,.18) 34%,rgba(6,6,8,.72) 100%)}',
        '#tp-root main{position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 24px 28px;text-align:center}',
        '#tp-root header{position:absolute;top:30px;left:0;right:0;padding:0 24px;text-shadow:0 2px 18px rgba(0,0,0,.6)}',
        '#tp-root h1{margin:0;font-size:clamp(20px,4vw,26px);font-weight:700;letter-spacing:-.01em}',
        '#tp-root header p{margin:5px 0 0;font-size:14px;font-weight:500;color:var(--dim)}',
        '#tp-root .art{width:min(46vw,200px);filter:drop-shadow(0 18px 28px rgba(0,0,0,.5))}',
        '#tp-root .art svg{display:block;width:100%;overflow:visible}',
        '#tp-root .pct{margin-top:10px;font-size:clamp(56px,14vw,76px);font-weight:300;letter-spacing:-.035em;line-height:1;font-variant-numeric:tabular-nums;text-shadow:0 2px 26px rgba(0,0,0,.55)}',
        '#tp-root .pct small{font-size:.38em;font-weight:500;letter-spacing:0;margin-left:.2em;opacity:.5}',
        '#tp-root .bar{position:relative;width:min(80vw,360px);height:5px;margin-top:16px;border-radius:5px;background:var(--track);overflow:hidden}',
        '#tp-root .fill{position:absolute;inset:0;border-radius:inherit;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#f4e9d6,var(--amber));box-shadow:0 0 14px rgba(240,178,74,.55);transition:opacity .7s}',
        '#tp-root .seg{position:absolute;top:0;bottom:0;left:0;width:34%;border-radius:inherit;background:linear-gradient(90deg,transparent,rgba(244,233,214,.9),transparent);animation:tpglide 1.9s cubic-bezier(.45,0,.55,1) infinite;transition:opacity .7s}',
        '#tp-root .buffering .seg{opacity:0}',
        '#tp-root .dead .seg{animation-duration:4.5s;opacity:.35}',
        '#tp-root .stage{margin-top:18px;min-height:24px;font-size:clamp(16px,4vw,18px);font-weight:500;text-shadow:0 2px 16px rgba(0,0,0,.6);transition:opacity .35s}',
        '#tp-root .stage.swap{opacity:0}',
        '#tp-root .stats{margin-top:20px;display:flex;gap:34px;justify-content:center;text-shadow:0 2px 14px rgba(0,0,0,.6)}',
        '#tp-root .stats b{display:block;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums}',
        '#tp-root .stats span{display:block;margin-top:3px;font-size:12px;font-weight:500;color:var(--dim)}',
        '#tp-root button{margin-top:22px;font:inherit;font-size:14px;font-weight:700;color:var(--ink);background:rgba(8,8,10,.35);border:1px solid rgba(244,233,214,.4);border-radius:999px;padding:11px 24px;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .6s,border-color .2s}',
        '#tp-root .tp-actions{display:flex;gap:.8em;margin-top:22px}',
        '#tp-root .tp-btn{font:inherit;font-size:14px;font-weight:700;color:var(--ink);background:rgba(8,8,10,.35);border:1px solid rgba(244,233,214,.4);border-radius:999px;padding:11px 24px;cursor:pointer;opacity:1;pointer-events:auto;transition:border-color .2s,background .2s}',
        '#tp-root .tp-btn.primary{border-color:var(--amber)}',
        '#tp-root .tp-btn.focused{border-color:var(--ink);background:rgba(244,233,214,.14)}',
        '@keyframes tpglide{from{transform:translateX(-100%)}to{transform:translateX(300%)}}',
        '@keyframes tppop{0%{transform:scale(1)}35%{transform:scale(1.09)}100%{transform:scale(1)}}',
        '#tp-root .pct.pop{animation:tppop .8s cubic-bezier(.2,.9,.3,1.3)}',
        '@media (prefers-reduced-motion:reduce){#tp-root .seg{animation:none;left:33%}}',
        '@media (max-height:600px){#tp-root .art{width:min(30vh,150px)}#tp-root .pct{font-size:44px}#tp-root .stats{margin-top:12px}}',
        '#tp-root .tpfx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
    ].join('\n');

    /* ---------- разметка: body HTML-файла (id префиксованы tp-) ---------- */
    var BUCKET_SVG = [
        '<svg viewBox="0 0 240 262" aria-hidden="true">',
        '<defs>',
        '<radialGradient id="tp-gl"><stop offset="0" stop-color="#f0b24a" stop-opacity=".5"/><stop offset=".55" stop-color="#f0b24a" stop-opacity=".14"/><stop offset="1" stop-color="#f0b24a" stop-opacity="0"/></radialGradient>',
        '<linearGradient id="tp-sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>',
        '<linearGradient id="tp-vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".3" stop-color="#000" stop-opacity="0"/></linearGradient>',
        '</defs>',
        '<circle id="tp-glow" cx="120" cy="100" r="150" fill="url(#tp-gl)" opacity="0"/>',
        '<ellipse id="tp-shadow" cx="120" cy="248" rx="62" ry="7" fill="#000" opacity=".4"/>',
        '<g id="tp-bucket">',
        '<g id="tp-corn"></g>',
        '<g id="tp-parts"></g>',
        '<g id="tp-stripes"></g>',
        '<polygon points="45,122 195,122 176,240 64,240" fill="url(#tp-sh)"/>',
        '<polygon points="45,122 195,122 176,240 64,240" fill="url(#tp-vg)"/>',
        '<rect x="38" y="112" width="164" height="17" rx="8.5" fill="#a8321f"/>',
        '<rect x="45" y="114.5" width="150" height="4" rx="2" fill="#fff" opacity=".2"/>',
        '<rect x="64" y="236" width="112" height="6" rx="3" fill="#7d2415"/>',
        '</g>',
        '</svg>'
    ].join('');

    var HTML = [
        '<div class="tp-poster" id="tp-poster"></div>',
        '<div class="tp-scrim"></div>',
        '<main id="tp-main">',
        '<header><h1 id="tp-title"></h1><p id="tp-sub"></p></header>',
        '<div class="art" id="tp-art">' + BUCKET_SVG + '</div>',
        '<div class="pct" id="tp-pct" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">0<small>%</small></div>',
        '<div class="bar"><div class="fill" id="tp-fill"></div><div class="seg"></div></div>',
        '<div class="stage" id="tp-stage" aria-live="polite">Поиск источников</div>',
        '<div class="stats">',
        '<div><b id="tp-mPeers">0</b><span>пиры</span></div>',
        '<div><b id="tp-mSpeed">—</b><span>скорость</span></div>',
        '<div><b id="tp-mLoaded">—</b><span>в буфере</span></div>',
        '</div>',
        '<div class="tp-actions"><button class="tp-btn primary" id="tp-watch">Смотреть</button><button class="tp-btn" id="tp-cancel">Отмена</button></div>',
        '</main>',
        '<svg id="tp-fx" class="tpfx" aria-hidden="true"><defs><g id="tp-pf"></g></defs><g id="tp-fxg"></g></svg>'
    ].join('');

    /* ---------- движок анимации: логика HTML-файла, без демо и query-режимов ---------- */
    var NS = 'http://www.w3.org/2000/svg';
    var $ = function (id) { return document.getElementById(id); };
    /* ---------- DEBUG v2.1 (временно): плашка внизу слева ---------- */
    var dbgEl = null, dbgLines = [], dbgStatusText = '';
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function dbgRender() {
        if (!dbgEl) return;
        var html = dbgStatusText ? '<div><b>' + esc(dbgStatusText) + '</b></div>' : '';
        html += dbgLines.map(function (l) { return '<div>' + esc(l) + '</div>'; }).join('');
        dbgEl.innerHTML = html;
    }
    function dbgStatus(t) { dbgStatusText = t; dbgRender(); }
    function dbgLog(t) {
        var d = new Date();
        var p = function (n) { return ('0' + n).slice(-2); };
        dbgLines.push(p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + ' ' + t);
        if (dbgLines.length > 5) dbgLines.shift();
        dbgRender();
    }
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var easeBack = function (t) { var u = t - 1; return 1 + 2.4 * u * u * u + 1.4 * u * u; };

    var built = false, raf = 0, visible = false;
    var main, poster, fill, pct, stageEl, corn, bucket, parts, shadow, glow, fxg;

    function build() {
        if (built) return;
        built = true;
        var st = document.createElement('style');
        st.textContent = CSS;
        document.head.appendChild(st);
        if (!document.querySelector('link[href*="family=Manrope"]')) {
            var lk = document.createElement('link');
            lk.rel = 'stylesheet';
            lk.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;500;700&display=swap';
            document.head.appendChild(lk);
        }
        var root = document.createElement('div');
        root.id = 'tp-root';
        root.innerHTML = HTML;
        document.body.appendChild(root);
        dbgEl = document.createElement('div');
        dbgEl.id = 'tp-dbg';
        dbgEl.setAttribute('style', 'position:fixed;left:8px;bottom:8px;z-index:100000;max-width:92vw;background:rgba(0,0,0,.78);color:#fff;font:13px/1.45 monospace;white-space:pre-wrap;word-break:break-all;padding:8px 10px;border-radius:8px;pointer-events:none;');
        dbgEl.textContent = 'TP DEBUG v2.2';
        document.body.appendChild(dbgEl);
        $('tp-watch').addEventListener('click', doWatch);
        $('tp-cancel').addEventListener('click', doCancel);
        document.addEventListener('keydown', function (e) {
            if (!visible) return;
            var k = e.key;
            if (k === 'ArrowLeft' || k === 'ArrowRight') {
                setBtnFocus(focusBtn === 0 ? 1 : 0);
                e.preventDefault(); e.stopPropagation();
            } else if (k === 'Enter') {
                if (focusBtn === 0) doWatch(); else doCancel();
                e.preventDefault(); e.stopPropagation();
            } else if (k === 'Escape' || k === 'Backspace') {
                doCancel();
            }
        }, true);
        main = $('tp-main'); poster = $('tp-poster'); fill = $('tp-fill'); pct = $('tp-pct');
        stageEl = $('tp-stage'); corn = $('tp-corn'); bucket = $('tp-bucket');
        parts = $('tp-parts'); shadow = $('tp-shadow'); glow = $('tp-glow'); fxg = $('tp-fxg');
        buildBucket();
        $('tp-pf').innerHTML = inner;
    }

    /* ведёрко: полосы и попкорн — как в файле */
    var pc = [], els = [], P = [], FX = [];
    var inner = '';
    (function () {
        function puff(c, dy) {
            var o = dy || 0;
            return '<circle cx="-8" cy="' + (2 + o) + '" r="11" fill="' + c + '"/><circle cx="8" cy="' + (2 + o) + '" r="11" fill="' + c + '"/><circle cx="0" cy="' + (-7 + o) + '" r="12" fill="' + c + '"/><circle cx="0" cy="' + (6 + o) + '" r="10" fill="' + c + '"/>';
        }
        inner = '<g>' + puff('#d9b878', 2.5) + puff('#fbf0d4') + '<circle cx="5" cy="3" r="3.4" fill="#f2c864" opacity=".9"/><circle cx="-4" cy="-9" r="3" fill="#fff" opacity=".65"/></g>';
        var rows = [[108, [58, 82, 106, 130, 154, 178]], [88, [70, 96, 122, 148, 170]], [68, [84, 110, 136, 160]], [50, [98, 124, 148]], [34, [112, 136]]];
        rows.forEach(function (r, ri) {
            r[1].forEach(function (x, j) {
                pc.push({ x: x + ((j * 7 + ri) % 5) - 2, y: r[0] + ((j * 5 + ri) % 4) - 2, r: ((j * 37 + ri * 11) % 36) - 18, s: .92 + ((j * 13 + ri * 5) % 9) / 45 });
            });
        });
    })();

    function buildBucket() {
        var sg = $('tp-stripes'), K = 6, i;
        for (i = 0; i < K; i++) {
            var p = document.createElementNS(NS, 'polygon');
            p.setAttribute('points', (45 + 150 * i / K) + ',122 ' + (45 + 150 * (i + 1) / K) + ',122 ' + (64 + 112 * (i + 1) / K) + ',240 ' + (64 + 112 * i / K) + ',240');
            p.setAttribute('fill', i % 2 ? '#f1e6d0' : '#c9402c');
            sg.appendChild(p);
        }
        var N = pc.length;
        for (var k = N - 1; k >= 0; k--) {
            var g = document.createElementNS(NS, 'g');
            g.innerHTML = inner;
            corn.appendChild(g);
            els[k] = g;
        }
        for (var m = 0; m < 10; m++) {
            var c = document.createElementNS(NS, 'circle');
            c.setAttribute('r', 2.6 + (m % 3) * .5);
            c.setAttribute('fill', '#fbf0d4');
            c.setAttribute('opacity', '0');
            parts.appendChild(c);
            P.push({ el: c, life: 0, x: 0, y: 0, vx: 0, vy: 0 });
        }
    }

    var STAGES = ['Поиск источников', 'Подключение к пирам', 'Получение метаданных', 'Буферизация', 'Запуск'];
    var S = { stage: 0, target: 0, shown: 0, peers: 0, total: 0, speed: 0, loaded: null, waited: false };
    var lastTxt = '', lastCount = 0, dy = 0, vy = 0, last = 0, lastBlur = '', doneKicked = false, pi = 0;
    var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

    function fmtSpeed(b) {
        if (!b) return '—';
        var m = b / 1048576;
        return (m >= 1 ? m.toFixed(1) : Math.round(b / 1024)).toString().replace('.', ',') + (m >= 1 ? ' МБ/с' : ' КБ/с');
    }
    function fmtSize(b) {
        if (b == null) return '—';
        var m = b / 1048576;
        return m >= 1024 ? (m / 1024).toFixed(1).replace('.', ',') + ' ГБ' : Math.round(m) + ' МБ';
    }
    function setText(t) {
        if (t === lastTxt) return;
        lastTxt = t;
        stageEl.classList.add('swap');
        setTimeout(function () { stageEl.textContent = t; stageEl.classList.remove('swap'); }, 280);
    }
    function spawn(px, py) {
        if (reduce) return;
        for (var n = 0; n < 2; n++) {
            var o = P[pi++ % P.length];
            o.life = .8; o.x = px; o.y = py - 8;
            o.vx = (Math.random() - .5) * 50; o.vy = -(110 + Math.random() * 80);
        }
    }
    function addFx(tag, attrs) {
        var e = document.createElementNS(NS, tag);
        for (var a in attrs) e.setAttribute(a, attrs[a]);
        fxg.appendChild(e);
        return e;
    }
    function burst() {
        if (reduce) return;
        var r = $('tp-art').getBoundingClientRect(), u = r.width / 240, ox = r.left + r.width / 2, oy = r.top + r.height * .44, kk = Math.max(.7, Math.min(1.5, innerHeight / 720));
        fxg.innerHTML = ''; FX = [];
        FX.push({ t: 'flash', el: addFx('circle', { cx: ox, cy: oy, r: 230 * kk, fill: 'url(#tp-gl)', opacity: 0 }), age: 0, life: .85 });
        FX.push({ t: 'ring', el: addFx('circle', { cx: ox, cy: oy, r: 10, fill: 'none', stroke: '#f0b24a', 'stroke-width': 3, opacity: 0 }), age: 0, life: .95, k: kk });
        for (var i = 0; i < 40; i++) {
            var kern = i >= 28, a = -Math.PI / 2 + (Math.random() - .5) * 2.4, sp = (kern ? 300 + Math.random() * 500 : 340 + Math.random() * 560) * kk, el;
            if (kern) el = addFx('circle', { r: 2.5 + Math.random() * 2, fill: '#f0b24a', opacity: 0 });
            else { el = addFx('use', { href: '#tp-pf', opacity: 0 }); el.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#tp-pf'); }
            FX.push({ t: 'p', el: el, x: ox + (Math.random() - .5) * r.width * .45, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: Math.random() * 360, vr: (Math.random() - .5) * 620, s: u * (.7 + Math.random() * .85), age: 0, life: 1.7 + Math.random() * .7, kern: kern, g: 1150 * kk });
        }
        pct.classList.remove('pop'); void pct.offsetWidth; pct.classList.add('pop');
    }
    function stepFx(dt) {
        for (var i = FX.length - 1; i >= 0; i--) {
            var f = FX[i]; f.age += dt; var t = f.age / f.life;
            if (t >= 1) { fxg.removeChild(f.el); FX.splice(i, 1); continue; }
            if (f.t === 'p') {
                f.vy += f.g * dt; f.vx *= Math.exp(-dt * .7); f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
                var pop = Math.min(1, f.age / .14), al = t > .7 ? 1 - (t - .7) / .3 : 1;
                f.el.setAttribute('opacity', al.toFixed(2));
                if (f.kern) { f.el.setAttribute('cx', f.x.toFixed(1)); f.el.setAttribute('cy', f.y.toFixed(1)); }
                else f.el.setAttribute('transform', 'translate(' + f.x.toFixed(1) + ' ' + f.y.toFixed(1) + ') rotate(' + f.rot.toFixed(0) + ') scale(' + Math.max(.001, f.s * easeBack(pop)).toFixed(3) + ')');
            } else if (f.t === 'ring') {
                var e = 1 - Math.pow(1 - t, 3);
                f.el.setAttribute('r', (14 + 280 * f.k * e).toFixed(1)); f.el.setAttribute('opacity', ((1 - t) * .75).toFixed(2)); f.el.setAttribute('stroke-width', (4 * (1 - t) + .6).toFixed(1));
            } else f.el.setAttribute('opacity', ((1 - t) * (1 - t) * .9).toFixed(2));
        }
    }

    function frame(ts) {
        if (!visible) return;
        var dt = Math.min(.05, ((ts - last) / 1000) || .016); last = ts;
        S.shown += (S.target - S.shown) * (1 - Math.exp(-dt * 4.2));
        if (Math.abs(S.target - S.shown) < 0.0003) S.shown = S.target;
        var pr = clamp(S.shown), buf = S.stage >= 3, dead = S.stage <= 1 && S.peers === 0 && S.waited, done = S.stage >= 4 && pr > 0.995;
        var N = pc.length;

        var v = Math.round(pr * 100);
        pct.firstChild.nodeValue = v;
        pct.setAttribute('aria-valuenow', v);
        fill.style.transform = 'scaleX(' + pr.toFixed(4) + ')';
        fill.style.opacity = buf ? 1 : 0;

        var pp = pr * N;
        for (var i = 0; i < N; i++) {
            var l = clamp(pp - i), e = l > 0 ? easeBack(l) : 0, o = pc[i];
            els[i].setAttribute('transform', 'translate(' + o.x + ' ' + (o.y + (1 - l) * 12).toFixed(2) + ') rotate(' + (o.r * l).toFixed(1) + ') scale(' + Math.max(.001, o.s * e).toFixed(3) + ')');
            els[i].setAttribute('opacity', l < .2 ? (l / .2).toFixed(2) : 1);
        }
        var count = Math.floor(pp + 0.001);
        if (count > lastCount) { var c = pc[Math.min(N - 1, count - 1)]; spawn(c.x, c.y); vy -= 34; }
        lastCount = count;
        if (done && !doneKicked) { doneKicked = true; vy -= 120; burst(); }
        if (!done) doneKicked = false;

        var acc = -140 * dy - 15 * vy; vy += acc * dt; dy += vy * dt;
        var breath = reduce ? 0 : Math.sin(ts / 1000 * 1.3) * 1.2, y = dy + breath;
        bucket.setAttribute('transform', 'translate(0 ' + y.toFixed(2) + ') rotate(' + (dy * 0.12).toFixed(2) + ' 120 240)');
        shadow.setAttribute('rx', (62 - y * .5).toFixed(1)); shadow.setAttribute('opacity', (.4 - y * .01).toFixed(2));
        glow.setAttribute('opacity', (pr * pr * .9).toFixed(2));

        for (var n = 0; n < P.length; n++) {
            var o2 = P[n];
            if (o2.life > 0) {
                o2.life -= dt; o2.vy += 520 * dt; o2.x += o2.vx * dt; o2.y += o2.vy * dt;
                o2.el.setAttribute('cx', o2.x.toFixed(1)); o2.el.setAttribute('cy', o2.y.toFixed(1)); o2.el.setAttribute('opacity', Math.max(0, o2.life / .8).toFixed(2));
            } else if (o2.el.getAttribute('opacity') !== '0') o2.el.setAttribute('opacity', '0');
        }

        stepFx(dt);

        var b = (18 - 16 * pr).toFixed(1), f = 'blur(' + b + 'px) brightness(' + (.38 + .24 * pr).toFixed(2) + ')';
        if (f !== lastBlur) { lastBlur = f; poster.style.filter = f; poster.style.transform = 'scale(' + (1.1 - .07 * pr).toFixed(3) + ')'; }

        main.classList.toggle('buffering', buf);
        main.classList.toggle('dead', dead);
        setText(dead ? 'Пока нет источников, ждём' : STAGES[S.stage]);
        $('tp-mPeers').textContent = S.total ? S.peers + ' из ' + S.total : S.peers;
        $('tp-mSpeed').textContent = fmtSpeed(S.speed);
        $('tp-mLoaded').textContent = buf ? fmtSize(S.loaded) : '—';
        raf = requestAnimationFrame(frame);
    }

    /* API как в файле: torrentPreload.update({...}) + reset для нового запуска */
    window.torrentPreload = {
        update: function (o) {
            if (o.stage != null) S.stage = o.stage;
            if (o.progress != null) S.target = o.progress;
            if (o.peers != null) S.peers = o.peers;
            if (o.total != null) S.total = o.total;
            if (o.speed != null) S.speed = o.speed;
            if (o.loaded != null) S.loaded = o.loaded;
            if (o.waited != null) S.waited = o.waited;
            if (o.title) $('tp-title').textContent = o.title;
            if (o.sub != null) $('tp-sub').textContent = o.sub;
            if (o.poster) poster.style.backgroundImage = 'url("' + o.poster + '")';
        },
        reset: function () {
            S.stage = 0; S.target = 0; S.shown = 0; S.peers = 0; S.total = 0;
            S.speed = 0; S.loaded = null; S.waited = false;
            lastCount = 0; doneKicked = false; lastTxt = '';
            poster.style.backgroundImage = '';
        }
    };

    function startLoop() {
        if (raf) return;
        last = 0;
        raf = requestAnimationFrame(frame);
    }
    function stopLoop() {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    /* ---------- сторона Лампы: показать при запуске торрента, спрятать при старте видео ---------- */
    var pollTimer = 0, hideTimer = 0, videoTimer = 0, videoEl = null, playerDone = null;
    var currentHash = '', pendingCancelHide = 0;
    var playStash = null, earlyWatch = false, cancelledHash = '', focusBtn = 0;

    function tsBase() {
        try {
            var u = (Lampa.Storage && (Lampa.Storage.get('torrserver_url') || Lampa.Storage.get('torrserver_url_two'))) || '';
            return String(u).replace(/\/$/, '');
        } catch (e) { return ''; }
    }
    function findHash(obj) {
        try {
            if (!obj || typeof obj !== 'object') return '';
            var cands = [obj.hash, obj.torrent_hash, obj.magnet];
            if (obj.torrent) cands.push(typeof obj.torrent === 'string' ? obj.torrent : obj.torrent.hash);
            if (obj.url) cands.push(obj.url);
            if (obj.link) cands.push(obj.link);
            for (var i = 0; i < cands.length; i++) {
                var s = String(cands[i] || '');
                if (!s) continue;
                var m = s.match(/[?&]link=([0-9a-fA-F]{40})/) || s.match(/btih:([0-9a-fA-F]{40})/) || s.match(/([0-9a-fA-F]{40})/);
                if (m) return m[1].toLowerCase();
            }
        } catch (e) { /* молча — fallback ниже */ }
        return '';
    }
    /* Заголовок — название фильма, а не имя файла; постер — бэкдроп карточки.
       У торрент-файлов Лампы img по умолчанию — битая заглушка, её пропускаем. */
    function pickStr(obj) {
        try {
            var card = obj.card || {};
            var title = obj.first_title || card.title || card.name || obj.title || obj.name || 'Торрент';
            var sub = obj.size || obj.sub || obj.quality || '';
            var poster = '';
            if (card.backdrop_path) poster = 'https://image.tmdb.org/t/p/w1280' + card.backdrop_path;
            else if (card.poster_path) poster = 'https://image.tmdb.org/t/p/w500' + card.poster_path;
            else if (obj.img && obj.img.indexOf('img_broken') === -1) poster = obj.img;
            else if (obj.poster) poster = obj.poster;
            else if (obj.image) poster = obj.image;
            return { title: title, sub: sub, poster: poster };
        } catch (e) { return { title: 'Торрент', sub: '', poster: '' }; }
    }
    function isTorrent(obj) {
        try {
            if (!obj || typeof obj !== 'object') return false;
            if (obj.torrent || obj.magnet || obj.hash || obj.torrent_hash) return true;
            var url = String(obj.url || '');
            if (!url) return false;
            if (url.indexOf('magnet:') === 0) return true;
            if (url.indexOf('/stream/') !== -1) return true;
            var base = tsBase();
            if (base) {
                var host = base.replace(/^https?:\/\//, '').split('/')[0];
                if (host && url.indexOf(host) !== -1) return true;
            }
        } catch (e) { /* молча */ }
        return false;
    }

    function stopPoll() { if (pollTimer) { clearTimeout(pollTimer); pollTimer = 0; } }
    function stopVideoWatch() { if (videoTimer) { clearInterval(videoTimer); videoTimer = 0; } }

    function hide(reason) {
        if (!visible) return;
        visible = false;
        dbgLog('HIDE: ' + (reason || '?'));
        currentHash = '';
        if (pendingCancelHide) { clearTimeout(pendingCancelHide); pendingCancelHide = 0; }
        stopPoll(); stopVideoWatch();
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = 0; }
        var root = $('tp-root');
        if (root) root.style.opacity = '0';
        setTimeout(function () {
            var r = $('tp-root');
            if (r) r.style.display = 'none';
            stopLoop();
        }, 450);
        try {
            if (videoEl) { videoEl.removeEventListener('playing', onPlaying); videoEl = null; }
            if (playerDone && Lampa.Player && Lampa.Player.listener && typeof Lampa.Player.listener.remove === 'function') {
                Lampa.Player.listener.remove('destroy', playerDone);
                Lampa.Player.listener.remove('ended', playerDone);
                Lampa.Player.listener.remove('error', playerDone);
            }
            playerDone = null;
        } catch (e) { /* молча */ }
    }
    function onPlaying() { hide('playing-event'); }

    function watchVideo() {
        stopVideoWatch();
        videoTimer = setInterval(function () {
            if (!visible) { stopVideoWatch(); return; }
            try {
                var v = null;
                if (Lampa.Player && typeof Lampa.Player.video === 'function') v = Lampa.Player.video();
                if (!v) v = document.querySelector('video');
                if (v && v !== videoEl) {
                    videoEl = v;
                    videoEl.addEventListener('playing', onPlaying);
                    if (!videoEl.paused && videoEl.readyState > 2) { hide('video-already-playing'); return; }
                }
            } catch (e) { /* молча */ }
        }, 300);
    }

    function hasStat(t) {
        return !!(t && (t.torrent_size || t.preload_size || t.preloaded_bytes || t.active_peers || t.total_peers));
    }
    function poll(base, hash, t0) {
        if (!visible) return;
        fetch(base + '/torrents', { method: 'POST', body: JSON.stringify({ action: 'get', hash: hash }) })
            .then(function (r) { return r.json(); })
            .then(function (t) {
                if (!visible) return;
                /* как в приложении на фото: сервер может вернуть обёртку {torrent:{...}} */
                var tor = t && (t.torrent || t);
                if (!hasStat(tor)) return pollCache(base, hash, t0);
                pollStat(tor, base, hash, t0);
            })
            .catch(function (e) {
                if (!visible) return;
                dbgStatus('poll ERROR: ' + (e && e.message ? e.message : 'fetch failed'));
                pollTimer = setTimeout(function () { poll(base, hash, t0); }, 2000);
            });
    }
    function pollCache(base, hash, t0) {
        fetch(base + '/cache', { method: 'POST', body: JSON.stringify({ action: 'get', hash: hash }) })
            .then(function (r) { return r.json(); })
            .then(function (j) {
                if (!visible) return;
                var c = j && (j.Torrent || j.torrent || j);
                if (!hasStat(c)) {
                    dbgStatus('poll: нет статистики (/torrents+/cache)');
                    pollTimer = setTimeout(function () { poll(base, hash, t0); }, 2000);
                    return;
                }
                pollStat(c, base, hash, t0);
            })
            .catch(function (e) {
                if (!visible) return;
                dbgStatus('poll ERROR(cache): ' + (e && e.message ? e.message : 'fetch failed'));
                pollTimer = setTimeout(function () { poll(base, hash, t0); }, 2000);
            });
    }
    function pollStat(tor, base, hash, t0) {
        var need = tor.preload_size || 0, got = tor.preloaded_bytes || 0, size = tor.torrent_size || 0;
        /* как в приложении (v0.23): без preload_size готовность — min(50МБ, 5% размера),
           а прогресс — got/size, а не вечный 0 */
        var prog = need > 0 ? Math.min(1, got / need) : (size > 0 ? Math.min(1, got / size) : 0);
        var ready = need > 0 ? got >= need : (size > 0 && got > 0 && got >= Math.min(50 * 1048576, size * 0.05));
        var st = ready ? 4 : (!tor.torrent_size ? ((tor.total_peers || 0) ? 2 : (tor.active_peers ? 1 : 0)) : 3);
        window.torrentPreload.update({
            stage: st, progress: ready ? 1 : prog,
            peers: tor.active_peers || 0, total: tor.total_peers || 0,
            speed: tor.download_speed || 0, loaded: got, waited: Date.now() - t0 > 8000
        });
        dbgStatus('poll st=' + st + ' prog=' + Math.round(100 * (ready ? 1 : prog)) + '% peers=' + (tor.active_peers || 0) + '/' + (tor.total_peers || 0) + ' got=' + got + ' need=' + need + ' size=' + size);
        if (ready) {
            /* вердикт Denis (как в приложении v0.25): автозапуска НЕТ — экран остаётся
               на 100% «Запуск» (взрыв играет сам движком), запуск только по «Смотреть» */
            stopPoll();
            setBtnFocus(0);
            dbgLog('READY 100% — ждём Смотреть/Отмена');
            return;
        }
        pollTimer = setTimeout(function () { poll(base, hash, t0); }, 1000);
    }

    function setBtnFocus(i) {
        focusBtn = i;
        var w = $('tp-watch'), c = $('tp-cancel');
        if (w) w.classList.toggle('focused', i === 0);
        if (c) c.classList.toggle('focused', i === 1);
    }
    function doWatch() {
        if (!visible) return;
        dbgLog('WATCH pressed');
        if (playStash) {
            var s = playStash; playStash = null;
            stopPoll(); stopVideoWatch();
            hide('watch-play');
            if (typeof origPlay === 'function') { try { origPlay.apply(s.ctx, s.args); } catch (e) {} }
        } else {
            earlyWatch = true;
            hide('watch-early');
        }
    }
    function doCancel() {
        if (!visible) return;
        dbgLog('CANCEL pressed');
        if (currentHash) cancelledHash = currentHash;
        playStash = null; earlyWatch = false;
        stopPoll(); stopVideoWatch();
        hide('cancel');
        try { if (Lampa.Player && typeof Lampa.Player.close === 'function') Lampa.Player.close(); } catch (e) {}
    }

    function show(obj, src) {
        try { build(); } catch (e) { return; }
        /* повторный показ того же торрента (Loading → Player.play) — не сбрасывать прогресс */
        var hash = findHash(obj);
        if (visible && hash && hash === currentHash) { dbgLog('SHOW-again from=' + (src || '?') + ' same hash, skip'); return; }
        dbgLog('SHOW from=' + (src || '?') + ' hash=' + (hash ? hash.slice(0, 8) + '...' : 'НЕТ'));
        currentHash = hash;
        playStash = null;
        if (src === 'loading') { earlyWatch = false; if (hash && hash === cancelledHash) cancelledHash = ''; }
        stopPoll(); stopVideoWatch();
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = 0; }
        try {
            window.torrentPreload.reset();
            var info = pickStr(obj);
            window.torrentPreload.update({ stage: 0, progress: 0, peers: 0, total: 0, speed: 0, loaded: 0, title: info.title, sub: info.sub, poster: info.poster });
            var root = $('tp-root');
            root.style.display = 'block';
            root.style.opacity = '1';
            visible = true;
            setBtnFocus(0);
            startLoop();
            watchVideo();
            var base = tsBase(), hash = findHash(obj);
            if (base && hash) {
                dbgStatus('poll: base=' + base + ' hash=' + hash.slice(0, 8) + '...');
                window.torrentPreload.update({ stage: 1 });
                poll(base, hash, Date.now());
            } else {
                dbgStatus('NO POLL: base=' + (base || 'НЕТ') + ' hash=' + (hash ? hash.slice(0, 8) + '...' : 'НЕТ'));
                /* fallback: живых данных нет — бегущая полоса, уход при старте видео */
                window.torrentPreload.update({ stage: 1 });
            }
            try {
                if (Lampa.Player && Lampa.Player.listener && typeof Lampa.Player.listener.follow === 'function') {
                    playerDone = function () { hide('player-destroy/ended/error'); };
                    Lampa.Player.listener.follow('destroy', playerDone);
                    Lampa.Player.listener.follow('ended', playerDone);
                    Lampa.Player.listener.follow('error', playerDone);
                }
            } catch (e) { /* молча */ }
        } catch (e) { /* экран не должен ломать плеер */ }
    }

    /* v2.2: Player.play торрентов задерживаем до «Смотреть» — иначе Лампа сама
       стартует видео при ~95% предзагрузки, и оно играло бы из-под нашего экрана
       ещё до нажатия (а по вердикту Denis до нажатия не должно происходить ничего) */
    try {
        if (window.Lampa && Lampa.Player && typeof Lampa.Player.play === 'function' && !Lampa.Player.play.__denis_tp) {
            var origPlay = Lampa.Player.play;
            var wrapped = function () {
                var obj = arguments[0];
                try {
                    /* финиш предзагрузки: отменяем отложенное скрытие по отмене */
                    if (pendingCancelHide) { clearTimeout(pendingCancelHide); pendingCancelHide = 0; }
                    if (isTorrent(obj)) {
                        var h = findHash(obj);
                        if (h && h === cancelledHash) { dbgLog('play swallowed (cancelled)'); return; }
                        if (earlyWatch) {
                            earlyWatch = false;
                            dbgLog('play after early Watch — пускаем сразу');
                            return origPlay.apply(this, arguments);
                        }
                        show(obj, 'play');
                        if (earlyWatch) {
                            earlyWatch = false;
                            stopPoll(); stopVideoWatch();
                            hide('watch-early-play');
                            return origPlay.apply(this, arguments);
                        }
                        if (visible && h && h === currentHash) {
                            playStash = { ctx: this, args: Array.prototype.slice.call(arguments) };
                            dbgLog('play DELAYED — ждём Смотреть');
                            return;
                        }
                    }
                } catch (e) { /* молча — при ошибке пускаем как раньше */ }
                return origPlay.apply(this, arguments);
            };
            wrapped.__denis_tp = true;
            Lampa.Player.play = wrapped;
        }
    } catch (e) { /* молча */ }

    /* главный хук v2: штатный Loading-экран предзагрузки открывается ДО Player.play.
       Показываем наш экран поверх него в тот же момент. Оригинальный Loading
       всё равно вызываем — его stop/setProgress продолжают работать под нами. */
    try {
        if (window.Lampa && Lampa.Loading && typeof Lampa.Loading.start === 'function' && !Lampa.Loading.start.__denis_tp) {
            var origStart = Lampa.Loading.start;
            var wrappedStart = function () {
                try {
                    var opts = arguments[2];
                    var media = opts && opts.media;
                    if (media && typeof media.url === 'string' && media.url.indexOf('&preload') !== -1) {
                        show(media, 'loading');
                        if (typeof arguments[0] === 'function' && !arguments[0].__denis_tp) {
                            var origStop = arguments[0];
                            var wrappedStop = function () {
                                var r = origStop.apply(this, arguments);
                                /* финиш: следом придёт Player.play и отменит таймер;
                                   отмена по Назад: Player.play не придёт — прячемся сами */
                                if (pendingCancelHide) clearTimeout(pendingCancelHide);
                                pendingCancelHide = setTimeout(function () { if (visible) hide('loading-stop+400ms'); }, 400);
                                return r;
                            };
                            wrappedStop.__denis_tp = true;
                            arguments[0] = wrappedStop;
                        }
                    }
                } catch (e) { /* молча */ }
                return origStart.apply(this, arguments);
            };
            wrappedStart.__denis_tp = true;
            Lampa.Loading.start = wrappedStart;
        }
    } catch (e) { /* молча */ }
})();
