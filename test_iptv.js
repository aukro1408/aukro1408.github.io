(function () {
    'use strict';

    if (!window.Lampa || !Lampa.Component) return;
    if (window.__iptv_v37_loaded) return;
    window.__iptv_v37_loaded = true;

    var COMPONENT = 'iptv_v3_7';
    var STORAGE_PLAYLISTS = 'iptv_v3_playlists';
    var STORAGE_ACTIVE = 'iptv_v3_active';
    var STORAGE_FAV = 'iptv_v3_favorites';
    var STORAGE_EPG = 'iptv_v3_epg_cache';
    var STORAGE_SETTINGS_M3U = 'iptv_v3_settings_m3u';
    var STORAGE_SETTINGS_EPG = 'iptv_v3_settings_epg';
    var DEFAULT_EPG = 'https://iptvx.one/epg/epg_lite.xml.gz';

    var css = `
        .iptv3{height:100%;width:100%;box-sizing:border-box;padding:0 1.5em 1.5em;color:#fff;}
        .iptv3 *{box-sizing:border-box;}
        .iptv3__head{display:flex;align-items:center;gap:1em;margin-bottom:1em;}
        .iptv3__title{font-size:2.2em;font-weight:700;flex:1;}
        .iptv3__action{padding:.55em .9em;border-radius:.7em;background:rgba(255,255,255,.09);font-size:1.05em;}
        .iptv3__action.focus{background:#fff;color:#000;}
        .iptv3__layout{display:flex;height:calc(100% - 4.2em);min-height:0;gap:1.2em;}
        .iptv3__groups{width:18em;flex:0 0 18em;min-height:0;}
        .iptv3__channels{flex:1;min-width:0;min-height:0;height:100%;overflow-y:auto;overflow-x:hidden;padding-right:.25em;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;} .iptv3__channels::-webkit-scrollbar{width:0;} .iptv3__category-action{padding:.55em .9em;border-radius:.7em;background:rgba(255,255,255,.09);font-size:1.05em;max-width:18em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .iptv3__category-action.focus{background:#fff;color:#000;}
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
        .iptv3__guide{height:100%;display:flex;min-height:0;gap:1em;}
        .iptv3__guide-channels{width:22em;flex:0 0 22em;overflow-y:auto;min-height:0;}
        .iptv3__guide-programs{flex:1;min-width:0;overflow-y:auto;min-height:0;}
        .iptv3__guide-channel{padding:.8em 1em;border-radius:.7em;background:rgba(255,255,255,.07);margin-bottom:.45em;}
        .iptv3__guide-channel.focus,.iptv3__guide-channel.active{background:#fff;color:#000;}
        .iptv3__guide-program{padding:.8em 1em;border-radius:.7em;background:rgba(255,255,255,.07);margin-bottom:.55em;position:relative;}
        .iptv3__guide-program.current{box-shadow:inset 3px 0 0 currentColor;}
        .iptv3__guide-time{width:4.5em;display:inline-block;opacity:.65;vertical-align:top;}
        .iptv3__guide-title{display:inline-block;width:calc(100% - 5em);font-weight:600;}
        .iptv3__guide-desc{margin: .35em 0 0 4.5em;opacity:.5;font-size:.85em;}
        @media(max-width:767px){.iptv3__guide{display:block}.iptv3__guide-channels{width:100%;height:5em;display:flex;overflow-x:auto;overflow-y:hidden}.iptv3__guide-channel{flex:0 0 auto;margin-right:.5em}.iptv3__guide-programs{height:calc(100% - 6em);margin-top:.7em}}
        .iptv3__empty{height:100%;display:flex;align-items:center;justify-content:center;opacity:.6;text-align:center;padding:2em;font-size:1.2em;}
        .iptv3__loader{height:100%;display:flex;align-items:center;justify-content:center;opacity:.7;font-size:1.2em;}
        .iptv3__mobile-groups{display:none;}
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
            .iptv3__mobile-groups{display:none;}
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
        var channels = {};

        Array.prototype.forEach.call(doc.getElementsByTagName('channel'), function (c) {
            var id = c.getAttribute('id') || '';
            if (!id) return;
            var names = [];
            Array.prototype.forEach.call(c.getElementsByTagName('display-name'), function (n) {
                var v = normalizeXmlText(n.textContent);
                if (v) names.push(v);
            });
            channels[id] = names;
        });

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
        return { programs: programs, channels: channels };
    }

    function normalizeChannelName(v) {
        return String(v || '')
            .toLowerCase()
            .replace(/&amp;/g, '&')
            .replace(/[^\p{L}\p{N}]+/gu, '')
            .replace(/hd$/i, '');
    }

    function decodeUtf8(bytes) {
        try { return new TextDecoder('utf-8').decode(bytes); }
        catch (e) {
            var out = '', i = 0;
            while (i < bytes.length) {
                var c = bytes[i++];
                if (c < 128) out += String.fromCharCode(c);
                else if (c < 224) out += String.fromCharCode(((c & 31) << 6) | (bytes[i++] & 63));
                else if (c < 240) out += String.fromCharCode(((c & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63));
                else {
                    var cp = ((c & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
                    cp -= 0x10000; out += String.fromCharCode(0xD800 + (cp >> 10), 0xDC00 + (cp & 1023));
                }
            }
            return out;
        }
    }

    function looksGzipBytes(bytes) {
        return bytes && bytes.length >= 3 && bytes[0] === 31 && bytes[1] === 139 && bytes[2] === 8;
    }

    function requestEPG(url) {
        return new Promise(function (resolve, reject) {
            var settled = false;
            function finishOk(data) { if (!settled) { settled = true; resolve(data); } }
            function finishErr(err) { if (!settled) { settled = true; reject(err || new Error('EPG: ошибка сети')); } }
            function parseBytes(bytes) {
                try {
                    bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
                    if (!bytes.length) throw new Error('EPG: пустой ответ');
                    var done = function (text) { try { finishOk(parseXmlTv(text)); } catch (e) { finishErr(e); } };
                    if (looksGzipBytes(bytes)) {
                        if (typeof DecompressionStream !== 'undefined') {
                            try {
                                var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
                                new Response(stream).arrayBuffer().then(function (buf) { done(decodeUtf8(new Uint8Array(buf))); }).catch(finishErr);
                                return;
                            } catch (e) {}
                        }
                        finishErr(new Error('EPG .gz: WebView не поддерживает распаковку gzip'));
                        return;
                    }
                    done(decodeUtf8(bytes));
                } catch (e) { finishErr(e); }
            }
            function fallbackNative() {
                try {
                    var req = new Lampa.Reguest();
                    req.timeout(30000);
                    if (typeof req.native !== 'function') { finishErr(new Error('EPG: native HTTP недоступен')); return; }
                    req.native(url, function (data) {
                        if (data instanceof ArrayBuffer || data instanceof Uint8Array) parseBytes(data);
                        else if (typeof data === 'string') {
                            var text = data.replace(/^\uFEFF/, '');
                            try { finishOk(parseXmlTv(text)); } catch (e) { finishErr(e); }
                        } else finishErr(new Error('EPG: неизвестный тип ответа'));
                    }, function (e) { finishErr(e || new Error('EPG: native ошибка сети')); }, false, { dataType: 'arraybuffer' });
                } catch (e) { finishErr(e); }
            }
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function () {
                    if (xhr.status && (xhr.status < 200 || xhr.status >= 400)) { fallbackNative(); return; }
                    try { parseBytes(xhr.response || new ArrayBuffer(0)); } catch (e) { fallbackNative(); }
                };
                xhr.onerror = fallbackNative;
                xhr.ontimeout = fallbackNative;
                xhr.timeout = 30000;
                xhr.send();
            } catch (e) { fallbackNative(); }
        });
    }

    function loadEPG(url) {
        if (!url || !validUrl(url)) return Promise.resolve({ programs: {}, channels: {} });
        return requestEPG(url).then(function (data) {
            setStorage(STORAGE_EPG, { url: url, time: Date.now(), data: data });
            return data;
        });
    }

    function getCachedEpg(url) {
        var c = getStorage(STORAGE_EPG, null);
        if (typeof c === 'string') { try { c = JSON.parse(c); } catch (e) { c = null; } }
        if (c && c.url === url && c.data) {
            // Совместимость со старым кешем v3.5, где data был просто объектом программ.
            if (!c.data.programs) c.data = { programs: c.data, channels: {} };
            return c.data;
        }
        return null;
    }

    function formatTime(ts) {
        if (!ts) return '--:--';
        var d = new Date(ts);
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function findPrograms(epg, ch) {
        epg = epg || {};
        var all = epg.programs || epg || {};
        var aliases = epg.channels || {};
        var keys = [ch.id, ch.tvgName, ch.name].filter(Boolean);
        var normKeys = keys.map(normalizeChannelName);
        var found = [];

        for (var i = 0; i < keys.length; i++) {
            var k = String(keys[i]);
            if (all[k]) return all[k];
            var lk = k.toLowerCase();
            var exact = Object.keys(all).filter(function (id) { return String(id).toLowerCase() === lk; });
            if (exact.length) return all[exact[0]];
        }

        Object.keys(aliases).some(function (id) {
            var names = aliases[id] || [];
            var match = names.some(function (n) {
                var nn = normalizeChannelName(n);
                return normKeys.indexOf(nn) >= 0 || normKeys.some(function (x) { return x && nn && (x === nn || x.indexOf(nn) >= 0 || nn.indexOf(x) >= 0); });
            });
            if (match && all[id]) { found = all[id]; return true; }
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
                var item = { id: uid(), name: name || 'IPTV', url: url, epg: getStorage(STORAGE_SETTINGS_EPG, '') || '' };
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
        this.render = function () { this.draw(); return this.root; };
        this.draw = function () {
            var self = this;
            root.innerHTML = '';
            var wrap = document.createElement('div'); wrap.className = 'iptv3';
            wrap.innerHTML = '<div class="iptv3__head"><div class="iptv3__title">' + esc(playlist.name || 'IPTV') + '</div><div class="iptv3__category-action selector">Категория: Все каналы ▾</div><div class="iptv3__action selector">Телепрограмма</div><div class="iptv3__action selector">Плейлисты</div><div class="iptv3__action selector">Избранное</div></div><div class="iptv3__layout"><div class="iptv3__groups"></div><div class="iptv3__channels"></div></div>';
            root.appendChild(wrap);
            var categoryAction = wrap.querySelector('.iptv3__category-action');
            var headActions = wrap.querySelectorAll('.iptv3__action');
            categoryAction.addEventListener('hover:enter', function () { self.openCategoryMenu(categoryAction); });
            headActions[0].addEventListener('hover:enter', function () { self.openGuide(); });
            headActions[1].addEventListener('hover:enter', function () { owner.showPlaylists(); });
            headActions[2].addEventListener('hover:enter', function () { self.group = '__fav'; self.updateCategoryLabel(categoryAction); self.drawChannels(wrap); });
            var groups = parsed.groups.slice();
            var groupBox = wrap.querySelector('.iptv3__groups');
            groups.forEach(function (g, idx) {
                var item = document.createElement('div'); item.className = 'iptv3__group selector' + ((!self.group && idx === 0) ? ' active' : '');
                item.innerHTML = esc(g.name || 'Все каналы') + ' <span style="opacity:.5;float:right">' + g.count + '</span>';
                item.addEventListener('hover:enter', function () { self.group = g.name; self.updateCategoryLabel(categoryAction); self.drawChannels(wrap); });
                groupBox.appendChild(item);
            });
            self.drawChannels(wrap);
            owner.setController(wrap);
        };
        this.updateCategoryLabel = function (element) {
            var label = this.group === '__fav' ? 'Избранное' : (this.group || 'Все каналы');
            element.textContent = 'Категория: ' + label + ' ▾';
        };
        this.openCategoryMenu = function (element) {
            var selfView = this;
            var items = [{ title: 'Все каналы', value: '' }];
            parsed.groups.slice(1).forEach(function (g) { items.push({ title: g.name + ' (' + g.count + ')', value: g.name }); });
            items.push({ title: 'Избранное (' + favorites().length + ')', value: '__fav' });
            try {
                Lampa.Select.show({
                    title: 'Категория',
                    items: items.map(function (it) { return { title: it.title, value: it.value }; }),
                    onSelect: function (item) {
                        selfView.group = item && item.value !== undefined ? item.value : '';
                        selfView.updateCategoryLabel(element);
                        selfView.drawChannels(root.querySelector('.iptv3'));
                    }
                });
            } catch (e) {
                console.warn('[IPTV v3] category select', e);
            }
        };

        this.openGuide = function () {
            var selfView = this;
            var channels = this.parsed.items.slice();
            var current = channels.length ? channels[0] : null;
            var guideRoot = root;
            guideRoot.innerHTML = '';
            var wrap = document.createElement('div');
            wrap.className = 'iptv3';
            wrap.innerHTML = '<div class="iptv3__head"><div class="iptv3__title">Телепрограмма</div><div class="iptv3__action selector">Назад к каналам</div></div><div class="iptv3__guide"><div class="iptv3__guide-channels"></div><div class="iptv3__guide-programs"></div></div>';
            guideRoot.appendChild(wrap);
            var chBox = wrap.querySelector('.iptv3__guide-channels');
            var progBox = wrap.querySelector('.iptv3__guide-programs');
            var back = wrap.querySelector('.iptv3__action');
            back.addEventListener('hover:enter', function () { selfView.draw(); });

            function drawPrograms(channel) {
                current = channel;
                progBox.innerHTML = '';
                var list = findPrograms(selfView.epg, channel);
                var now = Date.now();
                if (!list.length) {
                    progBox.innerHTML = '<div class="iptv3__empty">Для канала «' + esc(channel.name) + '» программа передач не найдена.</div>';
                    return;
                }
                var startWindow = now - 6 * 60 * 60 * 1000;
                var endWindow = now + 30 * 60 * 60 * 1000;
                list.filter(function (p) { return (!p.stop || p.stop >= startWindow) && (!p.start || p.start <= endWindow); }).forEach(function (p) {
                    var cur = p.start <= now && (!p.stop || p.stop > now);
                    var el = document.createElement('div');
                    el.className = 'iptv3__guide-program selector' + (cur ? ' current' : '');
                    el.innerHTML = '<span class="iptv3__guide-time">' + esc(formatTime(p.start)) + '</span><span class="iptv3__guide-title">' + esc(p.title) + '</span>' + (p.desc ? '<div class="iptv3__guide-desc">' + esc(p.desc) + '</div>' : '');
                    el.addEventListener('hover:enter', function () { if (cur) selfView.owner.playChannel(channel, channels); });
                    progBox.appendChild(el);
                });
                Lampa.Controller.collectionSet(progBox);
                Lampa.Controller.collectionFocus(false, progBox);
            }

            channels.forEach(function (ch, idx) {
                var el = document.createElement('div');
                el.className = 'iptv3__guide-channel selector' + (idx === 0 ? ' active' : '');
                el.innerHTML = esc(ch.name);
                el.addEventListener('hover:focus', function () {
                    chBox.querySelectorAll('.iptv3__guide-channel').forEach(function (x) { x.classList.remove('active'); });
                    el.classList.add('active');
                });
                el.addEventListener('hover:enter', function () { drawPrograms(ch); });
                chBox.appendChild(el);
            });
            if (current) drawPrograms(current);
            Lampa.Controller.add('content', {
                toggle: function () { Lampa.Controller.collectionSet(chBox); Lampa.Controller.collectionFocus(false, chBox); },
                left: function () { Lampa.Controller.toggle('menu'); },
                up: function () { Lampa.Controller.toggle('head'); },
                back: function () { selfView.draw(); }
            });
            Lampa.Controller.toggle('content');
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
                el.addEventListener('hover:focus', function () {
                    try {
                        var target = el.offsetTop - (box.clientHeight / 2) + (el.offsetHeight / 2);
                        box.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
                    } catch (e) { box.scrollTop = Math.max(0, el.offsetTop - box.clientHeight / 2); }
                });
                el.addEventListener('click', function () { owner.playChannel(ch, channels); });
                el.addEventListener('hover:enter', function () { owner.playChannel(ch, channels); });
                el.addEventListener('hover:long', function () { toggleFav(ch); try { Lampa.Noty.show(isFav(ch) ? 'Добавлено в избранное' : 'Удалено из избранного'); } catch(e){}; self.drawChannels(wrap); });
                box.appendChild(el);
            });

        };
        this.draw();
        var viewSelf = this;
        this.refreshTimer = setInterval(function () {
            if (!document.body.contains(root)) return;
            var currentWrap = root.querySelector('.iptv3');
            if (currentWrap && currentWrap.querySelector('.iptv3__channels')) viewSelf.drawChannels(currentWrap);
        }, 60000);
        this.destroy = function () {
            try { if (this.refreshTimer) clearInterval(this.refreshTimer); } catch (e) {}
            this.refreshTimer = null;
            try { root.innerHTML = ''; } catch (e) {}
        };
    }

    function Component() {
        var html = document.createElement('div');
        var currentView = null;
        var self = this;
        this.create = function (object) { if (object && object.activity) this.activity = object.activity; addCss(); return html; };
        this.initialize = function () {
            var configured = getStorage(STORAGE_SETTINGS_M3U, '');
            var list = playlists();
            if (configured && validUrl(configured) && !list.length) {
                var epg = getStorage(STORAGE_SETTINGS_EPG, '');
                list.push({ id: uid(), name: 'Мой IPTV', url: configured, epg: epg || '' });
                savePlaylists(list);
            }
            this.showPlaylists();
        };
        this.showPlaylists = function () { currentView = new PlaylistView(html, self); };
        this.openGuideFromStart = function () { var list = playlists(); if (!list.length) { this.showPlaylists(); return; } this.openPlaylist(list[0], true); };
        this.setController = function (wrap) {
            Lampa.Controller.add('content', {
                toggle: function () { Lampa.Controller.collectionSet(wrap); Lampa.Controller.collectionFocus(false, wrap); },
                left: function () { Lampa.Controller.toggle('menu'); },
                up: function () { Lampa.Controller.toggle('head'); },
                back: function () { self.activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };
        this.openPlaylist = function (item, openGuide) {
            setStorage(STORAGE_ACTIVE, item.id);
            html.innerHTML = '<div class="iptv3"><div class="iptv3__loader">Загрузка плейлиста…</div></div>';
            loadM3U(item.url).then(function (parsed) {
                var epgUrl = effectiveEpgUrl(item, parsed);
                if (!item.epg && epgUrl) { item.epg = epgUrl; savePlaylists(playlists()); }
                var cached = getCachedEpg(epgUrl);
                var view = new ChannelView(html, self, item, parsed);
                if (epgUrl) {
                    if (cached) view.epg = cached;
                    else loadEPG(epgUrl).then(function (epg) {
                        view.epg = epg;
                        view.draw();
                        try { Lampa.Noty.show('EPG загружен: ' + Object.keys(epg.programs || {}).length + ' каналов'); } catch (e) {}
                        if (openGuide) setTimeout(function () { view.openGuide(); }, 80);
                    }).catch(function (e) {
                        console.warn('[IPTV v3.7] EPG', e);
                        if (openGuide) showError('EPG: ' + (e.message || e));
                    });
                }
                currentView = view;
                if (openGuide) {
                    if (view.epg && view.epg.programs && Object.keys(view.epg.programs).length) {
                        setTimeout(function () { view.openGuide(); }, 50);
                    }
                }
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
                var play = { title: ch.name, url: ch.url, tv: true };
                if (ch.userAgent || ch.referer) play.headers = { 'User-Agent': ch.userAgent || '', 'Referer': ch.referer || '' };
                Lampa.Player.play(play);
            } catch (e) { showError(e); }
        };
        this.start = function (object) {
            this.activity.loader(false);
            var obj = object || {};
            var list = playlists();
            if (obj.guide) {
                var wanted = list.filter(function (x) { return x.id === obj.playlistId; })[0] || list.filter(function (x) { return x.id === getStorage(STORAGE_ACTIVE, ''); })[0] || list[0];
                if (wanted) this.openPlaylist(wanted, true); else this.showPlaylists();
                return;
            }
            this.initialize();
        };
        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () {
            try { if (currentView && currentView.destroy) currentView.destroy(); } catch (e) {}
            currentView = null;
            html.innerHTML = '';
        };
    }

    function openIptvActivity() {
        try {
            Lampa.Activity.push({ url: '', title: 'IPTV', component: COMPONENT, page: 1 });
        } catch (e) {
            showError(e);
        }
    }

    function selfOpenGuide(item) {
        try {
            Lampa.Activity.push({ url: '', title: 'Телепрограмма', component: COMPONENT, page: 1, guide: true, playlistId: item && item.id });
        } catch (e) { showError(e); }
    }

    function openEpgSettings() {
        var list = playlists();
        var activeId = getStorage(STORAGE_ACTIVE, '');
        var item = list.filter(function (x) { return x.id === activeId; })[0] || list[0];

        if (!item) {
            showError('Сначала добавьте M3U-плейлист');
            return;
        }

        Lampa.Select.show({
            title: 'Телепрограмма — ' + (item.name || 'IPTV'),
            items: [
                { title: 'Указать / изменить EPG URL', name: 'set' },
                { title: 'Загрузить EPG сейчас', name: 'load' },
                { title: 'Очистить EPG URL', name: 'clear' },
                { title: 'Открыть телепрограмму', name: 'open' }
            ],
            onSelect: function (a) {
                if (!a) return;
                if (a.name === 'set') {
                    input('URL XMLTV EPG', item.epg || getStorage(STORAGE_SETTINGS_EPG, '') || DEFAULT_EPG, function (v) {
                        if (v === undefined) return;
                        item.epg = String(v || '').trim();
                        setStorage(STORAGE_SETTINGS_EPG, item.epg);
                        savePlaylists(playlists());
                        try { Lampa.Noty.show(item.epg ? 'EPG сохранён' : 'EPG отключён'); } catch (e) {}
                    });
                }
                if (a.name === 'load') {
                    var epgUrl = item.epg || getStorage(STORAGE_SETTINGS_EPG, '') || DEFAULT_EPG;
                    if (!epgUrl) { showError('Сначала укажите URL EPG'); return; }
                    try { Lampa.Noty.show('Загрузка EPG…'); } catch (e) {}
                    loadEPG(epgUrl).then(function (data) {
                        var count = Object.keys(data.programs || {}).length;
                        try { Lampa.Noty.show('EPG загружен: ' + count + ' каналов'); } catch (e) {}
                    }).catch(function (e) { showError(e); });
                }
                if (a.name === 'clear') {
                    item.epg = '';
                    setStorage(STORAGE_SETTINGS_EPG, '');
                    savePlaylists(playlists());
                    try { Lampa.Noty.show('EPG URL очищен'); } catch (e) {}
                }
                if (a.name === 'open') {
                    selfOpenGuide(item);
                }
            }
        });
    }

    function registerSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;
        try {
            // Важный момент: не используем SettingsApi input-поля напрямую.
            // На некоторых версиях Lampa они вызывают внутренний update с undefined.
            // Оригинальный IPTV также использует button -> Lampa.Settings.create().
            Lampa.SettingsApi.addComponent({
                component: COMPONENT,
                icon: '<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="34" height="21" rx="3" stroke="currentColor" stroke-width="3"/><line x1="13" y1="2" x2="16" y2="7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="25" y1="2" x2="22" y2="7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="9" y1="34" x2="29" y2="34" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
                name: 'IPTV'
            });

            Lampa.SettingsApi.addParam({
                component: COMPONENT,
                param: { type: 'button' },
                field: { name: 'Добавить плейлист M3U / M3U8' },
                onChange: function () { addPlaylist(); }
            });

            Lampa.SettingsApi.addParam({
                component: COMPONENT,
                param: { type: 'button' },
                field: { name: 'Мои плейлисты' },
                onChange: function () { openIptvActivity(); }
            });

            Lampa.SettingsApi.addParam({
                component: COMPONENT,
                param: { type: 'button' },
                field: { name: 'EPG / Телепрограмма' },
                onChange: function () { openEpgSettings(); }
            });

            Lampa.SettingsApi.addParam({
                component: COMPONENT,
                param: { type: 'button' },
                field: { name: 'Установить EPG Lite по умолчанию' },
                onChange: function () {
                    setStorage(STORAGE_SETTINGS_EPG, DEFAULT_EPG);
                    var list = playlists();
                    list.forEach(function (x) { if (!x.epg) x.epg = DEFAULT_EPG; });
                    savePlaylists(list);
                    try { Lampa.Noty.show('EPG Lite установлен'); } catch (e) {}
                }
            });

            Lampa.SettingsApi.addParam({
                component: COMPONENT,
                param: { type: 'button' },
                field: { name: 'Открыть IPTV' },
                onChange: function () { openIptvActivity(); }
            });
        } catch (e) {
            console.warn('[IPTV v3] settings registration', e);
        }
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
    Lampa.Manifest.plugins[COMPONENT] = { type:'video', version:'3.7.0', name:'IPTV v3.7', description:'IPTV M3U/M3U8 + EPG client', component:COMPONENT };
    Lampa.Component.add(COMPONENT, Component);
    registerSettings();
    addMenu();
})();
