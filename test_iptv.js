/*!
 * Lampa IPTV Ref
 * Version 1.0.0
 * Custom IPTV interface for Lampa.
 * M3U/M3U8 + XMLTV EPG + groups + favorites + search.
 */
(function () {
    'use strict';

    var PLUGIN = {
        name: 'IPTV',
        version: '1.0.0',
        component: 'lampa_iptv_ref',
        key: 'lampa_iptv_ref',
        accent: '#42B7FF'
    };

    if (window[PLUGIN.key + '_loaded']) return;
    window[PLUGIN.key + '_loaded'] = true;

    var DEFAULT_M3U = 'http://pl.fox-tv.fun/42a589f9f/3cfc7404/tv.m3u';
    var state = {
        channels: [],
        groups: [],
        epg: {},
        epgLoaded: false,
        loading: false,
        lastLoad: 0
    };

    var icons = {};
    var timer = null;

    function storageGet(key, fallback) {
        return Lampa.Storage.get(PLUGIN.key + '_' + key, fallback);
    }

    function storageSet(key, value) {
        Lampa.Storage.set(PLUGIN.key + '_' + key, value);
    }

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function attr(text, name) {
        var re = new RegExp(name + '="([^"]*)"', 'i');
        var m = String(text || '').match(re);
        return m ? m[1] : '';
    }

    function normalizeName(name) {
        return String(name || '')
            .toLowerCase()
            .replace(/\[[^\]]*\]/g, '')
            .replace(/\([^)]*\)/g, '')
            .replace(/[._-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function parseM3U(text) {
        var lines = String(text || '').replace(/\r/g, '').split('\n');
        var result = [];
        var current = null;
        var epgUrl = '';

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            if (!line) continue;

            if (i === 0 && line.indexOf('#EXTM3U') === 0) {
                epgUrl = attr(line, 'x-tvg-url') || attr(line, 'url-tvg') || attr(line, 'tvg-url');
                continue;
            }

            if (line.indexOf('#EXTINF:') === 0) {
                var comma = line.indexOf(',');
                var title = comma >= 0 ? line.substring(comma + 1).trim() : 'Канал';

                current = {
                    id: attr(line, 'tvg-id') || '',
                    name: attr(line, 'tvg-name') || title,
                    logo: attr(line, 'tvg-logo') || '',
                    group: attr(line, 'group-title') || 'Разное',
                    number: attr(line, 'tvg-chno') || '',
                    url: '',
                    catchup: attr(line, 'catchup') || '',
                    catchupDays: attr(line, 'catchup-days') || ''
                };
                continue;
            }

            if (line.charAt(0) !== '#') {
                if (current) {
                    current.url = line;
                    current.uid = current.id || normalizeName(current.name) + '|' + current.url;
                    result.push(current);
                    current = null;
                }
            }
        }

        return {
            channels: result,
            epgUrl: epgUrl
        };
    }

    function parseXmltvDate(value) {
        if (!value) return 0;

        var m = String(value).match(
            /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\s*([+-])(\d{2})(\d{2}))?/
        );

        if (!m) return 0;

        var iso = m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4] + ':' + m[5] + ':' + m[6];
        var date = new Date(iso + 'Z');

        if (m[7]) {
            var offset = (parseInt(m[8], 10) * 60 + parseInt(m[9], 10)) * 60000;
            date = new Date(date.getTime() + (m[7] === '+' ? -offset : offset));
        }

        return date.getTime();
    }

    function parseEPG(xml) {
        var map = {};
        var parser = new DOMParser();
        var doc;

        try {
            doc = parser.parseFromString(String(xml || ''), 'text/xml');
        } catch (e) {
            return map;
        }

        var programmes = doc.getElementsByTagName('programme');

        for (var i = 0; i < programmes.length; i++) {
            var p = programmes[i];
            var channel = p.getAttribute('channel') || '';
            var start = parseXmltvDate(p.getAttribute('start'));
            var stop = parseXmltvDate(p.getAttribute('stop'));
            var titleNode = p.getElementsByTagName('title')[0];
            var descNode = p.getElementsByTagName('desc')[0];

            if (!channel || !start || !stop || !titleNode) continue;

            var title = titleNode.textContent || '';
            var desc = descNode ? (descNode.textContent || '') : '';

            if (!map[channel]) map[channel] = [];
            map[channel].push({
                start: start,
                stop: stop,
                title: title.trim(),
                desc: desc.trim()
            });
        }

        return map;
    }

    function currentProgram(channel) {
        var now = Date.now();
        var keys = [];
        if (channel.id) keys.push(channel.id);
        if (channel.name) keys.push(channel.name);
        if (channel.uid) keys.push(channel.uid);

        for (var i = 0; i < keys.length; i++) {
            var arr = state.epg[keys[i]];
            if (!arr) continue;

            for (var j = 0; j < arr.length; j++) {
                if (now >= arr[j].start && now < arr[j].stop) return arr[j];
            }
        }

        var normalized = normalizeName(channel.name);
        for (var key in state.epg) {
            if (!state.epg.hasOwnProperty(key)) continue;
            if (normalizeName(key) !== normalized) continue;

            var list = state.epg[key];
            for (var k = 0; k < list.length; k++) {
                if (now >= list[k].start && now < list[k].stop) return list[k];
            }
        }

        return null;
    }

    function progress(program) {
        if (!program || !program.stop || !program.start) return 0;
        var value = ((Date.now() - program.start) / (program.stop - program.start)) * 100;
        return Math.max(0, Math.min(100, value));
    }

    function getFavorites() {
        return storageGet('favorites', {});
    }

    function isFavorite(channel) {
        var fav = getFavorites();
        return !!fav[channel.uid];
    }

    function toggleFavorite(channel) {
        var fav = getFavorites();

        if (fav[channel.uid]) {
            delete fav[channel.uid];
            Lampa.Noty.show('Канал удалён из избранного');
        } else {
            fav[channel.uid] = {
                uid: channel.uid,
                name: channel.name,
                url: channel.url
            };
            Lampa.Noty.show('Канал добавлен в избранное');
        }

        storageSet('favorites', fav);
    }

    function favoriteChannels() {
        var fav = getFavorites();
        return state.channels.filter(function (channel) {
            return !!fav[channel.uid];
        });
    }

    function loadPlaylist(callback) {
        var url = storageGet('m3u', DEFAULT_M3U);

        if (!url) {
            callback(false, 'Не указан M3U-плейлист');
            return;
        }

        state.loading = true;

        var network = new Lampa.Reguest();
        network.timeout(20000);

        network.native(
            url,
            function (text) {
                state.loading = false;

                var parsed = parseM3U(text);
                state.channels = parsed.channels;
                state.groups = [];

                var groupMap = {};
                state.channels.forEach(function (channel) {
                    var group = channel.group || 'Разное';
                    if (!groupMap[group]) {
                        groupMap[group] = [];
                        state.groups.push(group);
                    }
                });

                state.lastLoad = Date.now();

                if (parsed.epgUrl) {
                    storageSet('epg', parsed.epgUrl);
                }

                loadEPG(parsed.epgUrl, function () {
                    callback(true);
                });
            },
            function () {
                state.loading = false;
                callback(false, 'Не удалось загрузить M3U. Проверьте URL и доступность плейлиста.');
            },
            false,
            { dataType: 'text' }
        );
    }

    function loadEPG(autoUrl, callback) {
        var epgUrl = storageGet('epg', '') || autoUrl || '';

        if (!epgUrl) {
            state.epg = {};
            state.epgLoaded = false;
            callback();
            return;
        }

        var network = new Lampa.Reguest();
        network.timeout(25000);

        network.native(
            epgUrl,
            function (xml) {
                state.epg = parseEPG(xml);
                state.epgLoaded = true;
                callback();
            },
            function () {
                state.epg = {};
                state.epgLoaded = false;
                callback();
            },
            false,
            { dataType: 'text' }
        );
    }

    function playChannel(channel) {
        if (!channel || !channel.url) return;

        var item = {
            url: channel.url,
            title: channel.name,
            isonline: true
        };

        try {
            Lampa.Player.play(item);
            Lampa.Player.playlist([item]);
        } catch (e) {
            Lampa.Noty.show('Не удалось запустить канал');
        }
    }

    function icon(name) {
        var paths = {
            tv: '<rect x="3" y="5" width="18" height="13" rx="2"></rect><path d="M8 22h8"></path><path d="M12 18v4"></path>',
            search: '<circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 5 5"></path>',
            filter: '<path d="M4 6h16"></path><path d="M7 12h10"></path><path d="M10 18h4"></path>',
            settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.1A1.7 1.7 0 0 0 7.7 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.6V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1V14h-.1a1.7 1.7 0 0 0-1.3 1z"></path>',
            refresh: '<path d="M20 11a8 8 0 0 0-14.9-4"></path><path d="M4 4v5h5"></path><path d="M4 13a8 8 0 0 0 14.9 4"></path><path d="M20 20v-5h-5"></path>'
        };

        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || paths.tv) + '</svg>';
    }

    function addStyles() {
        if ($('#lampa-iptv-ref-style').length) return;

        var css = ''
            + '.lampa-iptv-ref{height:100%;padding:0 0 4em;box-sizing:border-box;color:#fff}'
            + '.lampa-iptv-ref__source{margin:0 0 .55em;padding:.85em 1.1em;background:#30323a;border-radius:.45em;border-left:3px solid ' + PLUGIN.accent + '}'
            + '.lampa-iptv-ref__source-name{font-size:1.15em;font-weight:500}'
            + '.lampa-iptv-ref__source-url{font-size:.72em;color:#9296a0;margin-top:.28em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
            + '.lampa-iptv-ref__group{margin:.25em 0;background:#30323a;border-bottom:1px solid #202126}'
            + '.lampa-iptv-ref__group.selector{transition:background .15s}'
            + '.lampa-iptv-ref__group.focus{background:#3a3d47;box-shadow:inset 3px 0 0 ' + PLUGIN.accent + '}'
            + '.lampa-iptv-ref__group-inner{display:flex;align-items:center;min-height:3.9em;padding:0 1.05em}'
            + '.lampa-iptv-ref__group-title{font-size:1.1em;flex:1}'
            + '.lampa-iptv-ref__group-count{font-size:.85em;color:#a9adb5;margin-right:.8em}'
            + '.lampa-iptv-ref__chevron{font-size:1.7em;color:#6f747d}'
            + '.lampa-iptv-ref__channel{display:flex;align-items:center;min-height:5.7em;padding:.25em 1em;background:#30323a;border-bottom:1px solid #202126;box-sizing:border-box;position:relative}'
            + '.lampa-iptv-ref__channel.focus{background:#3a3d47;box-shadow:inset 3px 0 0 ' + PLUGIN.accent + '}'
            + '.lampa-iptv-ref__logo-wrap{width:4.9em;height:3.8em;flex:0 0 4.9em;display:flex;align-items:center;justify-content:center;margin-right:.7em}'
            + '.lampa-iptv-ref__logo{max-width:4.5em;max-height:3.3em;object-fit:contain}'
            + '.lampa-iptv-ref__logo-empty{width:3.7em;height:2.7em;border-radius:.35em;background:#202126;display:flex;align-items:center;justify-content:center;color:#737983;font-size:1.1em}'
            + '.lampa-iptv-ref__body{min-width:0;flex:1}'
            + '.lampa-iptv-ref__title{font-size:1.05em;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
            + '.lampa-iptv-ref__program{font-size:.8em;color:#d1d4da;margin-top:.28em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
            + '.lampa-iptv-ref__program.empty{color:#858991}'
            + '.lampa-iptv-ref__time{font-size:.68em;color:' + PLUGIN.accent + ';margin-top:.18em}'
            + '.lampa-iptv-ref__fav{width:2em;text-align:center;color:#777d86;font-size:1.2em;margin-left:.35em}'
            + '.lampa-iptv-ref__fav.active{color:' + PLUGIN.accent + '}'
            + '.lampa-iptv-ref__bar{height:3px;background:#22242a;position:absolute;left:0;right:0;bottom:0}'
            + '.lampa-iptv-ref__bar-fill{height:100%;background:' + PLUGIN.accent + ';width:0}'
            + '.lampa-iptv-ref__toolbar{display:flex;gap:.45em;padding:.65em 0}'
            + '.lampa-iptv-ref__toolbar .selector{background:#30323a;border-radius:.35em;padding:.55em .8em}'
            + '.lampa-iptv-ref__empty{padding:3em 1.5em;text-align:center;color:#989da6}'
            + '.lampa-iptv-ref__settings{padding:1.2em}'
            + '.lampa-iptv-ref__settings-row{padding:1em;background:#30323a;border-bottom:1px solid #202126}'
            + '.lampa-iptv-ref__settings-title{font-size:1em}'
            + '.lampa-iptv-ref__settings-value{font-size:.75em;color:#90959e;margin-top:.35em;word-break:break-all}'
            + '@media(max-width:600px){.lampa-iptv-ref__channel{min-height:5.25em}.lampa-iptv-ref__logo-wrap{width:4.4em;flex-basis:4.4em}.lampa-iptv-ref__title{font-size:1em}.lampa-iptv-ref__program{font-size:.76em}}';

        $('<style id="lampa-iptv-ref-style">' + css + '</style>').appendTo('head');
    }

    function buildGroupList(groups, object) {
        var wrap = $('<div class="lampa-iptv-ref"><div class="lampa-iptv-ref__source"></div><div class="lampa-iptv-ref__list"></div></div>');
        var source = wrap.find('.lampa-iptv-ref__source');
        var list = wrap.find('.lampa-iptv-ref__list');

        var url = storageGet('m3u', DEFAULT_M3U);
        source.html(
            '<div class="lampa-iptv-ref__source-name">IPTV</div>' +
            '<div class="lampa-iptv-ref__source-url">' + esc(url || 'M3U не настроен') + '</div>'
        );

        var favs = favoriteChannels();
        var favItem = $(
            '<div class="lampa-iptv-ref__group selector">' +
            '<div class="lampa-iptv-ref__group-inner">' +
            '<div class="lampa-iptv-ref__group-title">Избранное</div>' +
            '<div class="lampa-iptv-ref__group-count">' + favs.length + '</div>' +
            '<div class="lampa-iptv-ref__chevron">›</div>' +
            '</div></div>'
        );

        favItem.on('hover:enter', function () {
            openChannels('Избранное', favs);
        });

        list.append(favItem);

        groups.forEach(function (group) {
            var channels = state.channels.filter(function (channel) {
                return (channel.group || 'Разное') === group;
            });

            var item = $(
                '<div class="lampa-iptv-ref__group selector">' +
                '<div class="lampa-iptv-ref__group-inner">' +
                '<div class="lampa-iptv-ref__group-title">' + esc(group) + '</div>' +
                '<div class="lampa-iptv-ref__group-count">' + channels.length + '</div>' +
                '<div class="lampa-iptv-ref__chevron">›</div>' +
                '</div></div>'
            );

            item.on('hover:enter', function () {
                openChannels(group, channels);
            });

            list.append(item);
        });

        return {
            wrap: wrap,
            items: list
        };
    }

    function channelElement(channel) {
        var program = currentProgram(channel);
        var pct = progress(program);
        var favorite = isFavorite(channel);
        var logo = channel.logo
            ? '<img class="lampa-iptv-ref__logo" src="' + esc(channel.logo) + '" onerror="this.style.display=\'none\'">'
            : '<div class="lampa-iptv-ref__logo-empty">TV</div>';

        var programTitle = program ? program.title : 'Программа отсутствует';
        var programClass = program ? '' : ' empty';
        var time = '';

        if (program) {
            time = formatTime(program.start) + ' — ' + formatTime(program.stop);
        }

        var el = $(
            '<div class="lampa-iptv-ref__channel selector">' +
                '<div class="lampa-iptv-ref__logo-wrap">' + logo + '</div>' +
                '<div class="lampa-iptv-ref__body">' +
                    '<div class="lampa-iptv-ref__title">' + esc(channel.name) + '</div>' +
                    '<div class="lampa-iptv-ref__program' + programClass + '">' + esc(programTitle) + '</div>' +
                    '<div class="lampa-iptv-ref__time">' + esc(time) + '</div>' +
                '</div>' +
                '<div class="lampa-iptv-ref__fav' + (favorite ? ' active' : '') + '">' + (favorite ? '★' : '☆') + '</div>' +
                '<div class="lampa-iptv-ref__bar"><div class="lampa-iptv-ref__bar-fill" style="width:' + pct + '%"></div></div>' +
            '</div>'
        );

        el.on('hover:enter', function () {
            playChannel(channel);
        });

        el.on('hover:focus', function () {
            el.addClass('focus');
        });

        el.on('hover:blur', function () {
            el.removeClass('focus');
        });

        el.on('hover:long', function () {
            var menu = [
                {
                    title: isFavorite(channel) ? 'Удалить из избранного' : 'Добавить в избранное',
                    action: function () {
                        toggleFavorite(channel);
                        refreshCurrent();
                    }
                },
                {
                    title: 'Смотреть',
                    action: function () {
                        playChannel(channel);
                    }
                }
            ];

            var enabled = Lampa.Controller.enabled().name;
            Lampa.Select.show({
                title: channel.name,
                items: menu,
                onBack: function () {
                    Lampa.Controller.toggle(enabled);
                },
                onSelect: function (item) {
                    if (item && item.action) item.action();
                    Lampa.Select.close();
                    Lampa.Controller.toggle(enabled);
                }
            });
        });

        return el;
    }

    function formatTime(timestamp) {
        if (!timestamp) return '';
        var d = new Date(timestamp);
        return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }

    function buildChannelList(title, channels) {
        var wrap = $('<div class="lampa-iptv-ref"><div class="lampa-iptv-ref__source"></div><div class="lampa-iptv-ref__list"></div></div>');
        var source = wrap.find('.lampa-iptv-ref__source');
        var list = wrap.find('.lampa-iptv-ref__list');

        source.html(
            '<div class="lampa-iptv-ref__source-name">' + esc(title) + '</div>' +
            '<div class="lampa-iptv-ref__source-url">' + channels.length + ' каналов</div>'
        );

        channels.forEach(function (channel) {
            list.append(channelElement(channel));
        });

        return {
            wrap: wrap,
            items: list
        };
    }

    function searchChannels(query) {
        var q = normalizeName(query);
        var result = state.channels.filter(function (channel) {
            var name = normalizeName(channel.name);
            var group = normalizeName(channel.group);
            var program = currentProgram(channel);
            var p = normalizeName(program ? program.title : '');

            return name.indexOf(q) >= 0 || group.indexOf(q) >= 0 || p.indexOf(q) >= 0;
        });

        openChannels('Поиск: ' + query, result);
    }

    function openSearch() {
        Lampa.Input.edit({
            title: 'Поиск каналов',
            value: '',
            free: true,
            nosave: true
        }, function (value) {
            if (value) searchChannels(value);
        });
    }

    function openSettingsModal() {
        var html = $(
            '<div class="lampa-iptv-ref__settings">' +
                '<div class="lampa-iptv-ref__settings-row selector" data-action="m3u">' +
                    '<div class="lampa-iptv-ref__settings-title">M3U / M3U8 плейлист</div>' +
                    '<div class="lampa-iptv-ref__settings-value"></div>' +
                '</div>' +
                '<div class="lampa-iptv-ref__settings-row selector" data-action="epg">' +
                    '<div class="lampa-iptv-ref__settings-title">XMLTV EPG</div>' +
                    '<div class="lampa-iptv-ref__settings-value"></div>' +
                '</div>' +
                '<div class="lampa-iptv-ref__settings-row selector" data-action="refresh">' +
                    '<div class="lampa-iptv-ref__settings-title">Обновить плейлист</div>' +
                '</div>' +
            '</div>'
        );

        function updateValues() {
            html.find('[data-action="m3u"] .lampa-iptv-ref__settings-value').text(storageGet('m3u', DEFAULT_M3U) || 'Не задан');
            html.find('[data-action="epg"] .lampa-iptv-ref__settings-value').text(storageGet('epg', '') || 'Авто из M3U');
        }

        updateValues();

        html.find('[data-action="m3u"]').on('hover:enter', function () {
            Lampa.Input.edit({
                title: 'M3U URL',
                value: storageGet('m3u', DEFAULT_M3U),
                free: true,
                nosave: true
            }, function (value) {
                if (value !== undefined) {
                    storageSet('m3u', value);
                    updateValues();
                }
            });
        });

        html.find('[data-action="epg"]').on('hover:enter', function () {
            Lampa.Input.edit({
                title: 'XMLTV EPG URL',
                value: storageGet('epg', ''),
                free: true,
                nosave: true
            }, function (value) {
                if (value !== undefined) {
                    storageSet('epg', value);
                    updateValues();
                }
            });
        });

        html.find('[data-action="refresh"]').on('hover:enter', function () {
            Lampa.Modal.close();
            loadPlaylist(function (ok, error) {
                if (ok) {
                    Lampa.Noty.show('Плейлист обновлён: ' + state.channels.length + ' каналов');
                    refreshCurrent();
                } else {
                    Lampa.Noty.show(error || 'Ошибка обновления');
                }
            });
        });

        Lampa.Modal.open({
            title: 'Настройки IPTV',
            html: html,
            size: 'medium',
            onBack: function () {
                Lampa.Modal.close();
            }
        });
    }

    function openChannels(title, channels) {
        Lampa.Activity.push({
            title: title,
            component: PLUGIN.component,
            screen: 'channels',
            channelTitle: title,
            channelList: channels,
            page: 1
        });
    }

    function openGroups() {
        Lampa.Activity.push({
            title: 'IPTV',
            component: PLUGIN.component,
            screen: 'groups',
            page: 1
        });
    }

    function refreshCurrent() {
        try {
            var active = Lampa.Activity.active();
            if (active && active.activity && active.activity.component === PLUGIN.component) {
                active.activity.render().empty();
                active.activity.create();
            }
        } catch (e) {}
    }

    function IPTVComponent(object) {
        var self = this;
        var wrap;
        var items;
        var scroll;

        this.create = function () {
            addStyles();

            if (!state.channels.length) {
                this.activity.loader(true);

                var loadingHtml = $('<div class="lampa-iptv-ref"><div class="lampa-iptv-ref__empty">Загружаем IPTV…</div></div>');
                wrap = loadingHtml;

                loadPlaylist(function (ok, error) {
                    self.activity.loader(false);

                    if (!ok) {
                        wrap.find('.lampa-iptv-ref__empty').html(
                            esc(error || 'Не удалось загрузить плейлист') +
                            '<br><br><span style="color:' + PLUGIN.accent + '">Откройте ⚙ IPTV и проверьте M3U URL.</span>'
                        );
                    } else {
                        var loaded = buildGroupList(state.groups, object);
                        wrap.replaceWith(loaded.wrap);
                        wrap = loaded.wrap;
                        items = loaded.items;
                    }

                    self.activity.toggle();
                });

                return wrap;
            }

            var built;

            if (object.screen === 'channels') {
                built = buildChannelList(object.channelTitle || 'Каналы', object.channelList || []);
            } else {
                built = buildGroupList(state.groups, object);
            }

            wrap = built.wrap;
            items = built.items;

            return wrap;
        };

        this.start = function () {
            if (!items) {
                items = wrap ? wrap.find('.selector') : null;
            }

            if (!items || !items.length) return;

            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(items);
                    Lampa.Controller.collectionFocus(false, items);
                },
                back: function () {
                    Lampa.Activity.backward();
                },
                left: function () {
                    Lampa.Controller.toggle('menu');
                }
            });

            Lampa.Controller.toggle('content');
            startTimer();
        };

        this.pause = function () {};
        this.stop = function () {};

        this.destroy = function () {
            if (scroll && scroll.destroy) scroll.destroy();
            if (wrap) wrap.remove();
            stopTimer();
        };
    }

    function startTimer() {
        stopTimer();
        timer = setInterval(function () {
            if (!state.channels.length) return;
            try {
                $('.lampa-iptv-ref__channel').each(function () {
                    var el = $(this);
                    var index = el.data('iptv-index');
                    if (index === undefined) return;
                    var channel = state.channels[index];
                    var program = currentProgram(channel);
                    var pct = progress(program);

                    el.find('.lampa-iptv-ref__program').text(program ? program.title : 'Программа отсутствует');
                    el.find('.lampa-iptv-ref__time').text(program ? formatTime(program.start) + ' — ' + formatTime(program.stop) : '');
                    el.find('.lampa-iptv-ref__bar-fill').css('width', pct + '%');
                });
            } catch (e) {}
        }, 30000);
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function addHeadIcons() {
        if (!Lampa.Head || !Lampa.Head.addIcon) return;

        icons.search = Lampa.Head.addIcon(icon('search'), function () {
            openSearch();
        });

        icons.filter = Lampa.Head.addIcon(icon('filter'), function () {
            openGroups();
        });

        icons.refresh = Lampa.Head.addIcon(icon('refresh'), function () {
            loadPlaylist(function (ok, error) {
                if (ok) {
                    Lampa.Noty.show('Обновлено: ' + state.channels.length + ' каналов');
                    refreshCurrent();
                } else {
                    Lampa.Noty.show(error || 'Ошибка обновления');
                }
            });
        });

        icons.settings = Lampa.Head.addIcon(icon('settings'), function () {
            openSettingsModal();
        });

        Object.keys(icons).forEach(function (key) {
            icons[key].addClass('lampa-iptv-ref-head');
            icons[key].hide();
        });

        Lampa.Listener.follow('activity', function (e) {
            var active = e.object && e.object.component === PLUGIN.component;

            Object.keys(icons).forEach(function (key) {
                if (active) icons[key].show();
                else icons[key].hide();
            });
        });
    }

    function addMenu() {
        var menuIcon = icon('tv');

        Lampa.Menu.addButton(
            menuIcon,
            'IPTV',
            function () {
                if (!state.channels.length) {
                    loadPlaylist(function (ok, error) {
                        if (!ok) {
                            Lampa.Noty.show(error || 'Не удалось загрузить IPTV');
                            openSettingsModal();
                            return;
                        }
                        openGroups();
                    });
                } else {
                    openGroups();
                }
            }
        );
    }

    function addSettings() {
        if (!Lampa.SettingsApi) return;

        try {
            Lampa.SettingsApi.addComponent({
                component: PLUGIN.component,
                icon: icon('tv'),
                name: 'IPTV'
            });

            Lampa.SettingsApi.addParam({
                component: PLUGIN.component,
                param: {
                    name: PLUGIN.key + '_m3u',
                    type: 'input',
                    'default': DEFAULT_M3U
                },
                field: { name: 'M3U / M3U8 URL' }
            });

            Lampa.SettingsApi.addParam({
                component: PLUGIN.component,
                param: {
                    name: PLUGIN.key + '_epg',
                    type: 'input',
                    'default': ''
                },
                field: { name: 'XMLTV EPG URL' }
            });
        } catch (e) {
            console.log('IPTV SettingsApi:', e);
        }
    }

    function startPlugin() {
        addStyles();
        addSettings();
        addMenu();
        addHeadIcons();

        // Синхронизация значений из SettingsApi с основным хранилищем.
        setTimeout(function () {
            var m3u = Lampa.Storage.get(PLUGIN.key + '_m3u', '');
            var epg = Lampa.Storage.get(PLUGIN.key + '_epg', '');

            if (m3u) storageSet('m3u', m3u);
            else if (!storageGet('m3u', '')) storageSet('m3u', DEFAULT_M3U);

            if (epg) storageSet('epg', epg);
        }, 500);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

    Lampa.Component.add(PLUGIN.component, IPTVComponent);

})();
