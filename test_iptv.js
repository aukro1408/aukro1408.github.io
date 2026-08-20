(function () {
    'use strict';

    if (!window.Lampa || !Lampa.Component) return;
    if (window.__iptv_v3_loaded) return;
    window.__iptv_v3_loaded = true;

    var COMPONENT = 'iptv_v3';
    var STORAGE_PLAYLISTS = 'iptv_v3_playlists';
    var STORAGE_ACTIVE = 'iptv_v3_active';
    var STORAGE_FAV = 'iptv_v3_favorites';
    var STORAGE_EPG = 'iptv_v3_epg_cache';

    var css = `
        .iptv3{height:100%;width:100%;box-sizing:border-box;padding:0 1.5em 1.5em;color:#fff;}
        .iptv3 *{box-sizing:border-box;}
        .iptv3__head{display:flex;align-items:center;gap:1em;margin-bottom:1em;}
        .iptv3__title{font-size:2.2em;font-weight:700;flex:1;}
        .iptv3__action{padding:.55em .9em;border-radius:.7em;background:rgba(255,255,255,.09);font-size:1.05em;}
        .iptv3__action.focus{background:#fff;color:#000;}
        .iptv3__layout{display:flex;height:calc(100% - 4.2em);min-height:0;gap:1.2em;}
        .iptv3__groups{width:18em;flex:0 0 18em;min-height:0;}
        .iptv3__channels{flex:1;min-width:0;min-height:0;}
        .iptv3__group{padding:.72em .9em;border-radius:.7em;font-size:1.1em;opacity:.72;margin-bottom:.35em;}
        .iptv3__group.active{opacity:1;background:rgba(255,255,255,.1);}
        .iptv3__group.focus{background:#fff;color:#000;opacity:1;}
        .iptv3__channel{display:flex;align-items:center;gap:1em;width:100%;min-height:5.2em;padding:.75em 1em;margin-bottom:.65em;border-radius:.9em;background:rgba(255,255,255,.075);position:relative;}
        .iptv3__channel.focus{background:#fff;color:#000;}
        .iptv3__logo{width:5.5em;height:3.7em;flex:0 0 5.5em;border-radius:.65em;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(255,255,255,.1);font-size:1.35em;font-weight:800;}
        .iptv3__logo img{width:100%;height:100%;object-fit:contain;}
        .iptv3__channel-main{min-width:0;flex:1;}
        .iptv3__channel-name{font-size:1.2em;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .iptv3__meta{display:flex;gap:.6em;align-items:center;opacity:.58;margin-top:.35em;font-size:.88em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .iptv3__program{width:43%;min-width:16em;}
        .iptv3__now{font-size:1em;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .iptv3__next{opacity:.5;font-size:.84em;margin-top:.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .iptv3__progress{height:.22em;background:rgba(255,255,255,.13);border-radius:1em;margin-top:.55em;overflow:hidden;}
        .iptv3__progress>div{height:100%;background:currentColor;border-radius:1em;width:0;}
        .iptv3__empty{height:100%;display:flex;align-items:center;justify-content:center;opacity:.6;text-align:center;padding:2em;font-size:1.2em;}
        .iptv3__loader{height:100%;display:flex;align-items:center;justify-content:center;opacity:.7;font-size:1.2em;}
        .iptv3__mobile-groups{display:none;}
        .iptv3__mobile-group{display:inline-block;padding:.55em .85em;border-radius:.7em;background:rgba(255,255,255,.08);margin-right:.5em;margin-bottom:.5em;white-space:nowrap;}
        .iptv3__mobile-group.active{background:rgba(255,255,255,.2);}
        .iptv3__playlist{padding:1em;background:rgba(255,255,255,.07);border-radius:1em;margin-bottom:.7em;}
        .iptv3__playlist.focus{background:#fff;color:#000;}
        .iptv3__playlist-name{font-size:1.15em;font-weight:650;}
        .iptv3__playlist-url{opacity:.5;font-size:.82em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:.35em;}
        .iptv3__add{padding:1em;text-align:center;background:rgba(255,255,255,.07);border-radius:1em;margin-bottom:1em;}
        .iptv3__add.focus{background:#fff;color:#000;}
        .iptv3__settings-note{opacity:.55;font-size:.9em;line-height:1.45;margin-top:.8em;}
        @media(max-width:767px){
            .iptv3{padding:0 1em 1em;}
            .iptv3__head{margin-bottom:.65em;}
            .iptv3__title{font-size:1.65em;}
            .iptv3__action{font-size:.9em;}
            .iptv3__layout{display:block;height:calc(100% - 3.2em);}
            .iptv3__groups{display:none;}
            .iptv3__mobile-groups{display:block;overflow:hidden;white-space:nowrap;margin-bottom:.65em;}
            .iptv3__channel{min-height:5.7em;padding:.65em .7em;gap:.7em;margin-bottom:.5em;}
            .iptv3__logo{width:4.2em;height:3.1em;flex-basis:4.2em;}
            .iptv3__channel-name{font-size:1em;}
            .iptv3__meta{font-size:.76em;}
            .iptv3__program{width:40%;min-width:0;}
            .iptv3__now{font-size:.82em;}
            .iptv3__next{font-size:.7em;}
        }
    `;

    function addCss() {
        if (document.getElementById('iptv3-style')) return;
        var style = document.createElement('style');
        style.id = 'iptv3-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function uid() {
        return 'iptv3_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    function getStorage(key, fallback) {
        try { return Lampa.Storage.get(key, fallback); } catch (e) { return fallback; }
    }

    function setStorage(key, value) {
        try { Lampa.Storage.set(key, value); } catch (e) {}
    }

    function playlists() {
        var value = getStorage(STORAGE_PLAYLISTS, '[]');
        if (typeof value === 'string') {
            try { value = JSON.parse(value); } catch (e) { value = []; }
        }
        return Array.isArray(value) ? value : [];
    }

    function savePlaylists(value) { setStorage(STORAGE_PLAYLISTS, value); }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function decodeEntities(s) {
        var t = document.createElement('textarea');
        t.innerHTML = s || '';
        return t.value;
    }

    function parseAttrs(line) {
        var attrs = {};
        var re = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s,]+))/g;
        var m;
        while ((m = re.exec(line))) attrs[m[1].toLowerCase()] = decodeEntities(m[2] != null ? m[2] : (m[3] != null ? m[3] : m[4]));
        return attrs;
    }

    function validUrl(url) {
        try {
            var u = new URL(url);
            return u.protocol === 'http:' || u.protocol === 'https:';
        } catch (e) { return false; }
    }

    function parsePipe(urlLine) {
        var parts = String(urlLine || '').trim().split('|');
        var url = parts.shift() || '';
        var params = {};
        parts.join('|').split('&').forEach(function (p) {
            var idx = p.indexOf('=');
            if (idx > 0) params[p.slice(0, idx).trim().toLowerCase()] = decodeURIComponent(p.slice(idx + 1).trim());
        });
        return { url: url, params: params };
    }

    // Parser follows the reference IPTV implementation: EXTINF + EXTVLCOPT + EXTGRP,
    // pipe parameters, tvg metadata and HTTP headers are preserved.
    function parseM3U(content) {
        if (typeof content !== 'string') throw new Error('Ответ не является текстом');
        content = content.replace(/^\uFEFF/, '');
        var lines = content.replace(/\r/g, '').split('\n');
        var first = -1;
        for (var fi = 0; fi < lines.length; fi++) {
            if (lines[fi].trim()) { first = fi; break; }
        }
        if (first < 0 || !/^#EXTM3U/i.test(lines[first].trim())) throw new Error('Файл не является M3U');

        var header = lines[first].trim();
        var headerAttrs = parseAttrs(header);
        var items = [];
        var current = null;

        function finish(urlLine) {
            if (!current) return;
            var parsed = parsePipe(urlLine);
            if (parsed.url && validUrl(parsed.url)) {
                current.url = parsed.url;
                if (parsed.params['user-agent']) current.userAgent = parsed.params['user-agent'];
                if (parsed.params['referer']) current.referer = parsed.params['referer'];
                if (parsed.params['http-referrer']) current.referer = parsed.params['http-referrer'];
                items.push(current);
            }
            current = null;
        }

        for (var i = first + 1; i < lines.length; i++) {
            var raw = lines[i];
            var line = raw.trim();
            if (!line) continue;

            if (/^#EXTINF:/i.test(line)) {
                var comma = line.indexOf(',');
                var meta = comma >= 0 ? line.slice(0, comma) : line;
                var name = comma >= 0 ? line.slice(comma + 1).trim() : '';
                var a = parseAttrs(meta);
                current = {
                    id: a['tvg-id'] || '',
                    name: decodeEntities(name || a['tvg-name'] || 'Без названия'),
                    tvgName: a['tvg-name'] || '',
                    logo: a['tvg-logo'] || '',
                    group: a['group-title'] || '',
                    tvgUrl: a['tvg-url'] || '',
                    catchup: { type: a['catchup'] || '', days: a['catchup-days'] || '', source: a['catchup-source'] || '' },
                    timeshift: a['timeshift'] || '',
                    userAgent: a['user-agent'] || '',
                    referer: a['http-referrer'] || a['referer'] || ''
                };
            } else if (/^#EXTVLCOPT:/i.test(line) && current) {
                var opt = line.slice(line.indexOf(':') + 1);
                var eq = opt.indexOf('=');
                if (eq > 0) {
                    var key = opt.slice(0, eq).trim().toLowerCase();
                    var val = opt.slice(eq + 1).trim().replace(/^"|"$/g, '');
                    if (key === 'http-user-agent') current.userAgent = val;
                    if (key === 'http-referrer' || key === 'http-referer') current.referer = val;
                }
            } else if (/^#EXTGRP:/i.test(line) && current) {
                current.group = line.slice(8).trim() || current.group;
            } else if (line.charAt(0) !== '#') {
                finish(line);
            }
        }

        var groups = [{ name: '', count: items.length }];
        items.forEach(function (item) {
            var group = item.group || 'Без категории';
            var found = groups.find(function (g) { return g.name === group; });
            if (found) found.count++;
            else groups.push({ name: group, count: 1 });
        });

        return { header: header, headerAttrs: headerAttrs, items: items, groups: groups };
    }

    function requestText(url, success, error) {
        var req;
        try { req = new Lampa.Reguest(); } catch (e) { error(e); return; }
        try { req.timeout(25000); } catch (e) {}

        // На Android/Tizen используем native: он обходит браузерный CORS и
        // является тем же способом, который использует референсный IPTV.
        var isNativePlatform = false;
        try {
            isNativePlatform = !!(Lampa.Platform && (
                Lampa.Platform.is('android') ||
                Lampa.Platform.is('tizen') ||
                Lampa.Platform.is('webos')
            ));
        } catch (e) {}

        var method = (isNativePlatform || window.god_enabled) && typeof req.native === 'function'
            ? 'native'
            : (typeof req.silent === 'function' ? 'silent' : 'native');

        if (typeof req[method] !== 'function') {
            error(new Error('Lampa.Reguest не поддерживает загрузку M3U'));
            return;
        }

        var done = false;
        function ok(data) {
            if (done) return;
            done = true;
            success(data);
        }
        function fail(e) {
            if (done) return;
            done = true;
            error(e || new Error('Сетевая ошибка'));
        }

        try {
            req[method](url, ok, fail, false, { dataType: 'text' });
        } catch (e) { fail(e); }
    }

    function loadM3U(url) {
        return new Promise(function (resolve, reject) {
            requestText(url, function (text) {
                try { resolve(parseM3U(text)); }
                catch (e) { e.from_error = 'IPTV v3: ошибка разбора M3U'; reject(e); }
            }, function (e) {
                e = e || new Error('Не удалось загрузить плейлист');
                e.from_error = 'IPTV v3: ошибка загрузки M3U';
                reject(e);
            });
        });
    }

    function normalizeXmlText(v) { return decodeEntities(String(v || '').replace(/<[^>]*>/g, '').trim()); }

    function parseXmlTv(xml) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xml, 'text/xml');
        if (doc.getElementsByTagName('parsererror').length) throw new Error('EPG: некорректный XML');
        var programs = {};
        Array.prototype.forEach.call(doc.getElementsByTagName('programme'), function (p) {
            var channel = p.getAttribute('channel') || '';
            if (!channel) return;
            var start = parseXmlDate(p.getAttribute('start'));
            var stop = parseXmlDate(p.getAttribute('stop'));
            var titleNode = p.getElementsByTagName('title')[0];
            var descNode = p.getElementsByTagName('desc')[0];
            var title = titleNode ? normalizeXmlText(titleNode.textContent) : '';
            if (!title) return;
            if (!programs[channel]) programs[channel] = [];
            programs[channel].push({ start: start, stop: stop, title: title, desc: descNode ? normalizeXmlText(descNode.textContent) : '' });
        });
        Object.keys(programs).forEach(function (id) { programs[id].sort(function (a,b) { return a.start - b.start; }); });
        return programs;
    }

    function parseXmlDate(v) {
        if (!v) return 0;
        var m = String(v).trim().match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?/);
        if (!m) return Date.parse(v) || 0;
        var base = Date.UTC(+m[1], +m[2]-1, +m[3], +m[4], +m[5], +m[6]);
        if (m[7]) {
            var sign = m[7].charAt(0) === '+' ? 1 : -1;
            var mins = (+m[7].slice(1,3) * 60) + (+m[7].slice(3,5));
            base -= sign * mins * 60000;
        }
        return base;
    }

    function loadEPG(url) {
        if (!url || !validUrl(url)) return Promise.resolve({});
        return new Promise(function (resolve, reject) {
            requestText(url, function (text) {
                try {
                    var data = parseXmlTv(text);
                    setStorage(STORAGE_EPG, { url: url, time: Date.now(), data: data });
                    resolve(data);
                } catch (e) { reject(e); }
            }, reject);
        });
    }

    function getCachedEpg(url) {
        var c = getStorage(STORAGE_EPG, null);
        if (typeof c === 'string') { try { c = JSON.parse(c); } catch (e) { c = null; } }
        if (c && c.url === url && c.data) return c.data;
        return null;
    }

    function formatTime(ts) {
        if (!ts) return '--:--';
        var d = new Date(ts);
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function findPrograms(epg, ch) {
        var keys = [ch.id, ch.tvgName, ch.name].filter(Boolean).map(function (x) { return String(x).toLowerCase(); });
        var all = epg || {};
        var found = [];
        Object.keys(all).some(function (k) {
            if (keys.indexOf(String(k).toLowerCase()) >= 0) { found = all[k]; return true; }
            return false;
        });
        return found || [];
    }

    function currentProgram(epg, ch) {
        var now = Date.now();
        var arr = findPrograms(epg, ch);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].start <= now && (!arr[i].stop || arr[i].stop > now)) return { now: arr[i], next: arr[i + 1] || null };
        }
        for (var j = 0; j < arr.length; j++) if (arr[j].start > now) return { now: null, next: arr[j] };
        return { now: null, next: null };
    }

    function favorites() {
        var f = getStorage(STORAGE_FAV, '[]');
        if (typeof f === 'string') { try { f = JSON.parse(f); } catch (e) { f = []; } }
        return Array.isArray(f) ? f : [];
    }

    function isFav(ch) { return favorites().indexOf(ch.id || ch.url) >= 0; }
    function toggleFav(ch) {
        var key = ch.id || ch.url;
        var f = favorites(), i = f.indexOf(key);
        if (i >= 0) f.splice(i,1); else f.push(key);
        setStorage(STORAGE_FAV, f);
    }

    function showError(message) {
        var text = message && message.message ? message.message : String(message || 'Ошибка');
        try { Lampa.Noty.show('IPTV: ' + text); } catch (e) {}
        console.error('[IPTV v3]', message);
    }

    function input(title, value, cb) {
        Lampa.Input.edit({ title: title, free: true, nosave: true, value: value || '' }, cb);
    }

    function addPlaylist() {
        input('URL M3U плейлиста', '', function (url) {
            if (!url) return;
            if (!validUrl(url)) return showError('Неверный URL');
            input('Название плейлиста', '', function (name) {
                var list = playlists();
                var item = { id: uid(), name: name || 'IPTV', url: url };
                list.push(item);
                savePlaylists(list);
                try { Lampa.Noty.show('Плейлист добавлен'); } catch (e) {}
                window.dispatchEvent(new CustomEvent('iptv3:refresh'));
            });
        });
    }

    function editPlaylist(item) {
        Lampa.Select.show({
            title: item.name || 'Плейлист',
            items: [
                { title: 'Изменить URL', name: 'url' },
                { title: 'Изменить название', name: 'name' },
                { title: 'Указать URL EPG', name: 'epg' },
                { title: 'Удалить', name: 'delete' }
            ],
            onSelect: function (a) {
                if (a.name === 'url') input('URL M3U плейлиста', item.url, function (v) { if (v) { item.url = v; savePlaylists(playlists()); try { Lampa.Noty.show('URL изменён'); } catch(e){}; window.dispatchEvent(new CustomEvent('iptv3:refresh')); } });
                if (a.name === 'name') input('Название плейлиста', item.name, function (v) { if (v) { item.name = v; savePlaylists(playlists()); window.dispatchEvent(new CustomEvent('iptv3:refresh')); } });
                if (a.name === 'epg') input('URL XMLTV EPG (необязательно)', item.epg || '', function (v) { item.epg = v || ''; savePlaylists(playlists()); try { Lampa.Noty.show(v ? 'EPG URL сохранён' : 'EPG URL очищен'); } catch(e){} });
                if (a.name === 'delete') {
                    var p = playlists().filter(function (x) { return x.id !== item.id; });
                    savePlaylists(p);
                    if (getStorage(STORAGE_ACTIVE, '') === item.id) setStorage(STORAGE_ACTIVE, '');
                    window.dispatchEvent(new CustomEvent('iptv3:refresh'));
                }
            }
        });
    }

    function PlaylistView(root, owner) {
        this.root = root;
        this.owner = owner;
        this.render = function () {
            var self = this;
            root.innerHTML = '';
            var wrap = document.createElement('div'); wrap.className = 'iptv3';
            wrap.innerHTML = '<div class="iptv3__head"><div class="iptv3__title">IPTV</div><div class="iptv3__action selector">Закрыть</div></div><div class="iptv3__add selector">＋ Добавить плейлист</div><div class="iptv3__settings-note">Добавьте ссылку на M3U/M3U8. Плейлист разбирается непосредственно в Lampa, включая tvg-id, tvg-logo, group-title, EXTVLCOPT и параметры после |.</div><div class="iptv3__list"></div>';
            root.appendChild(wrap);
            var close = wrap.querySelector('.iptv3__action');
            close.addEventListener('hover:enter', function () { owner.activity.backward(); });
            var add = wrap.querySelector('.iptv3__add');
            add.addEventListener('hover:enter', function () { addPlaylist(); });
            var list = wrap.querySelector('.iptv3__list');
            var ps = playlists();
            if (!ps.length) list.innerHTML = '<div class="iptv3__empty" style="height:15em">Нет плейлистов.<br>Добавьте первый M3U.</div>';
            ps.forEach(function (item) {
                var el = document.createElement('div');
                el.className = 'iptv3__playlist selector';
                el.innerHTML = '<div class="iptv3__playlist-name">' + esc(item.name || 'IPTV') + '</div><div class="iptv3__playlist-url">' + esc(item.url) + '</div>';
                el.addEventListener('hover:enter', function () { owner.openPlaylist(item); });
                el.addEventListener('hover:long', function () { editPlaylist(item); });
                list.appendChild(el);
            });
            owner.setController(wrap);
        };
        this.render();
    }

    function ChannelView(root, owner, playlist, parsed) {
        this.root = root; this.owner = owner; this.playlist = playlist; this.parsed = parsed;
        this.group = '';
        this.epg = {};
        this.render = function () { this.draw(); };
        this.draw = function () {
            var self = this;
            root.innerHTML = '';
            var wrap = document.createElement('div'); wrap.className = 'iptv3';
            wrap.innerHTML = '<div class="iptv3__head"><div class="iptv3__title">' + esc(playlist.name || 'IPTV') + '</div><div class="iptv3__action selector">Плейлисты</div><div class="iptv3__action selector">Избранное</div></div><div class="iptv3__mobile-groups"></div><div class="iptv3__layout"><div class="iptv3__groups"></div><div class="iptv3__channels"></div></div>';
            root.appendChild(wrap);
            var headActions = wrap.querySelectorAll('.iptv3__action');
            headActions[0].addEventListener('hover:enter', function () { owner.showPlaylists(); });
            headActions[1].addEventListener('hover:enter', function () { self.group = '__fav'; self.drawChannels(wrap); });
            var groups = parsed.groups.slice();
            var groupBox = wrap.querySelector('.iptv3__groups');
            var mobile = wrap.querySelector('.iptv3__mobile-groups');
            groups.forEach(function (g, idx) {
                var item = document.createElement('div'); item.className = 'iptv3__group selector' + ((!self.group && idx === 0) ? ' active' : '');
                item.innerHTML = esc(g.name || 'Все каналы') + ' <span style="opacity:.5;float:right">' + g.count + '</span>';
                item.addEventListener('hover:enter', function () { self.group = g.name; self.drawChannels(wrap); });
                groupBox.appendChild(item);
                var mi = document.createElement('span'); mi.className = 'iptv3__mobile-group selector' + ((!self.group && idx === 0) ? ' active' : ''); mi.textContent = g.name || 'Все каналы';
                mi.addEventListener('hover:enter', function () { self.group = g.name; self.drawChannels(wrap); });
                mobile.appendChild(mi);
            });
            self.drawChannels(wrap);
            owner.setController(wrap);
        };
        this.drawChannels = function (wrap) {
            var self = this, box = wrap.querySelector('.iptv3__channels');
            box.innerHTML = '';
            var channels = this.parsed.items.filter(function (ch) {
                if (self.group === '__fav') return isFav(ch);
                if (!self.group) return true;
                return (ch.group || 'Без категории') === (self.group || 'Без категории');
            });
            if (!channels.length) { box.innerHTML = '<div class="iptv3__empty">В этой категории каналов нет.</div>'; return; }
            channels.forEach(function (ch) {
                var el = document.createElement('div'); el.className = 'iptv3__channel selector';
                var initial = (ch.name || '?').replace(/[^\p{L}\p{N}]/gu, '').slice(0,3).toUpperCase() || 'TV';
                var prog = currentProgram(self.epg, ch);
                var now = prog.now ? '<div class="iptv3__now">' + esc(formatTime(prog.now.start) + '  ' + prog.now.title) + '</div>' : '<div class="iptv3__now">Программа недоступна</div>';
                var next = prog.next ? '<div class="iptv3__next">Далее ' + esc(formatTime(prog.next.start) + '  ' + prog.next.title) + '</div>' : '';
                var progress = prog.now && prog.now.stop > prog.now.start ? Math.max(0, Math.min(100, (Date.now()-prog.now.start)/(prog.now.stop-prog.now.start)*100)) : 0;
                el.innerHTML = '<div class="iptv3__logo">' + (ch.logo && validUrl(ch.logo) ? '<img src="' + esc(ch.logo) + '">' : esc(initial)) + '</div><div class="iptv3__channel-main"><div class="iptv3__channel-name">' + esc(ch.name) + '</div><div class="iptv3__meta">' + esc(ch.group || 'Без категории') + (isFav(ch) ? ' · ★' : '') + '</div></div><div class="iptv3__program">' + now + next + '<div class="iptv3__progress"><div style="width:' + progress.toFixed(1) + '%"></div></div></div>';
                el.addEventListener('hover:enter', function () { owner.playChannel(ch, channels); });
                el.addEventListener('hover:long', function () { toggleFav(ch); try { Lampa.Noty.show(isFav(ch) ? 'Добавлено в избранное' : 'Удалено из избранного'); } catch(e){}; self.drawChannels(wrap); });
                box.appendChild(el);
            });
            this.refreshTimer = this.refreshTimer || setInterval(function () { if (document.body.contains(wrap)) self.drawChannels(wrap); }, 60000);
        };
        this.draw();
    }

    function Component() {
        var html = document.createElement('div');
        var currentView = null;
        var self = this;
        this.create = function () { addCss(); return html; };
        this.initialize = function () { this.showPlaylists(); };
        this.showPlaylists = function () { currentView = new PlaylistView(html, self); };
        this.setController = function (wrap) {
            Lampa.Controller.add('content', {
                toggle: function () { Lampa.Controller.collectionSet(wrap); Lampa.Controller.collectionFocus(false, wrap); },
                left: function () { Lampa.Controller.toggle('menu'); },
                up: function () { Lampa.Controller.toggle('head'); },
                back: function () { self.activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };
        this.openPlaylist = function (item) {
            setStorage(STORAGE_ACTIVE, item.id);
            html.innerHTML = '<div class="iptv3"><div class="iptv3__loader">Загрузка плейлиста…</div></div>';
            loadM3U(item.url).then(function (parsed) {
                var epgUrl = item.epg || parsed.headerAttrs['x-tvg-url'] || parsed.headerAttrs['url-tvg'] || '';
                var cached = getCachedEpg(epgUrl);
                var view = new ChannelView(html, self, item, parsed);
                if (epgUrl) {
                    if (cached) view.epg = cached;
                    else loadEPG(epgUrl).then(function (epg) { view.epg = epg; view.draw(); }).catch(function (e) { console.warn('[IPTV v3] EPG', e); });
                }
                currentView = view;
            }).catch(function (e) {
                var message = e && e.message ? e.message : String(e || 'Неизвестная ошибка');
                console.error('[IPTV v3] M3U', e);
                html.innerHTML = '<div class="iptv3"><div class="iptv3__empty"><div><div style="font-size:1.35em;margin-bottom:.7em">Не удалось загрузить плейлист</div><div style="opacity:.65;max-width:32em;margin:0 auto 1.2em;line-height:1.5">' + esc(message) + '</div><div class="iptv3__action selector" id="iptv3-retry">Повторить</div><div class="iptv3__action selector" id="iptv3-back" style="margin-left:.5em">Плейлисты</div></div></div></div>';
                var retry = html.querySelector('#iptv3-retry');
                var back = html.querySelector('#iptv3-back');
                if (retry) retry.addEventListener('hover:enter', function () { self.openPlaylist(item); });
                if (back) back.addEventListener('hover:enter', function () { self.showPlaylists(); });
                self.setController(html.querySelector('.iptv3'));
                try { Lampa.Noty.show('IPTV: ' + message); } catch (_) {}
            });
        };
        this.playChannel = function (ch, playlist) {
            try {
                Lampa.Player.runas(Lampa.Storage.field('player_iptv'));
                Lampa.Player.play({ title: ch.name, url: ch.url, tv: true, headers: { 'User-Agent': ch.userAgent || '', 'Referer': ch.referer || '' } });
                Lampa.Player.playlist(playlist.map(function (a) { return { title: a.name, url: a.url, tv: true }; }));
            } catch (e) { showError(e); }
        };
        this.start = function () { this.activity.loader(false); this.initialize(); };
        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () { html.innerHTML = ''; };
    }

    function registerSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;
        try {
            Lampa.SettingsApi.addComponent({
                component: COMPONENT,
                icon: '<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="34" height="21" rx="3" stroke="currentColor" stroke-width="3"/><line x1="13" y1="2" x2="16" y2="7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="25" y1="2" x2="22" y2="7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="9" y1="34" x2="29" y2="34" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
                name: 'IPTV v3'
            });
            Lampa.SettingsApi.addParam({ component: COMPONENT, param: { type: 'button' }, field: { name: 'Открыть IPTV', onChange: function () { Lampa.Activity.push({ url:'', title:'IPTV', component:COMPONENT, page:1 }); } } });
        } catch (e) { console.warn('[IPTV v3] settings', e); }
    }

    function addMenu() {
        var add = function () {
            if ($('.menu .menu__list').eq(0).find('[data-iptv-v3]').length) return;
            var button = $('<li class="menu__item selector" data-iptv-v3="1"><div class="menu__ico"><svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="34" height="21" rx="3" stroke="currentColor" stroke-width="3"/><line x1="13" y1="2" x2="16" y2="7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="25" y1="2" x2="22" y2="7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="9" y1="34" x2="29" y2="34" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></div><div class="menu__text">IPTV</div></li>');
            button.on('hover:enter', function () { Lampa.Activity.push({ url:'', title:'IPTV', component:COMPONENT, page:1 }); });
            $('.menu .menu__list').eq(0).append(button);
        };
        if (window.appready) add(); else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') add(); });
    }

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};
    Lampa.Manifest.plugins[COMPONENT] = { type:'video', version:'3.0.0', name:'IPTV v3', description:'IPTV M3U/M3U8 client', component:COMPONENT };
    Lampa.Component.add(COMPONENT, Component);
    registerSettings();
    addMenu();
})();
