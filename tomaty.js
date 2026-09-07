(function () {
    'use strict';

    var PLUGIN_NAME = 'RT Ratings';
    var STORAGE_KEY = 'rt_ratings_settings_v1';
    var CACHE_KEY = 'rt_ratings_cache_v1';

    var DEFAULTS = {
        api_url: 'https://rt-api-jade.vercel.app/api/rotten-tomatoes',
        enabled: true,
        show_critic: true,
        show_audience: true,
        cache_days: 7
    };

    var settings = Object.assign({}, DEFAULTS, Lampa.Storage.get(STORAGE_KEY, {}) || {});
    var cache = Lampa.Storage.get(CACHE_KEY, {}) || {};
    var requests = {};

    var ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
        '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/>' +
        '<path d="M8 8.5h8M8 12h8M8 15.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
        '</svg>';

    function saveSettings() {
        Lampa.Storage.set(STORAGE_KEY, settings);
    }

    function saveCache() {
        Lampa.Storage.set(CACHE_KEY, cache);
    }

    function esc(v) {
        return String(v == null ? '' : v)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function getTitle(card) {
        return card.original_title || card.original_name || card.title || card.name || '';
    }

    function getYear(card) {
        var d = card.release_date || card.first_air_date || '';
        return String(d).slice(0, 4);
    }

    function cacheKey(card) {
        var imdb = card.imdb_id || card.imdb || '';
        if (imdb) return 'imdb:' + imdb;
        return ('title:' + getTitle(card) + ':' + getYear(card)).toLowerCase();
    }

    function parseScore(v) {
        if (v === null || v === undefined || v === '') return null;
        var n = parseInt(String(v).replace('%', '').trim(), 10);
        return isNaN(n) ? null : Math.max(0, Math.min(100, n));
    }

    function scoreClass(v) {
        if (v >= 75) return 'rt-good';
        if (v >= 60) return 'rt-mid';
        return 'rt-bad';
    }

    function addStyles() {
        if (document.getElementById('rt-ratings-style')) return;

        var s = document.createElement('style');
        s.id = 'rt-ratings-style';
        s.textContent =
            '.rt-ratings-box{position:absolute;left:5px;bottom:5px;z-index:20;display:flex;gap:4px;pointer-events:none;}' +
            '.rt-ratings-badge{display:flex;align-items:center;gap:3px;padding:4px 6px;border-radius:7px;' +
            'background:rgba(12,14,18,.88);border:1px solid rgba(255,255,255,.14);' +
            'box-shadow:0 2px 8px rgba(0,0,0,.35);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
            'font:700 11px/1 Arial,sans-serif;color:#fff;white-space:nowrap;}' +
            '.rt-ratings-badge.rt-good{border-color:rgba(77,190,99,.7);}' +
            '.rt-ratings-badge.rt-mid{border-color:rgba(220,175,55,.7);}' +
            '.rt-ratings-badge.rt-bad{border-color:rgba(220,70,70,.7);}' +
            '.rt-ratings-badge span{font-size:11px;}' +
            '.rt-ratings-host{position:relative!important;}';
        document.head.appendChild(s);
    }

    function renderBadge(element, data) {
        if (!element || !data) return;

        var critic = parseScore(data.tomatometer);
        if (critic === null) critic = parseScore(data.criticScore);

        var audience = parseScore(data.audience_score);
        if (audience === null) audience = parseScore(data.audienceScore);

        if (!settings.show_critic) critic = null;
        if (!settings.show_audience) audience = null;
        if (critic === null && audience === null) return;

        var old = element.querySelector('.rt-ratings-box');
        if (old) old.remove();

        var html = '<div class="rt-ratings-box">';

        if (critic !== null) {
            html += '<div class="rt-ratings-badge ' + scoreClass(critic) + '">' +
                '<span>🍅</span>' + critic + '%</div>';
        }

        if (audience !== null) {
            html += '<div class="rt-ratings-badge ' + scoreClass(audience) + '">' +
                '<span>🍿</span>' + audience + '%</div>';
        }

        html += '</div>';

        element.classList.add('rt-ratings-host');
        element.insertAdjacentHTML('beforeend', html);
    }

    function fetchRT(card, element) {
        if (!settings.enabled) return;

        var title = getTitle(card);
        if (!title) return;

        var key = cacheKey(card);
        var now = Date.now();
        var ttl = Number(settings.cache_days || 7) * 86400000;

        if (cache[key] && cache[key].time && now - cache[key].time < ttl) {
            renderBadge(element, cache[key].data);
            return;
        }

        if (requests[key]) {
            requests[key].push(function (data) { renderBadge(element, data); });
            return;
        }

        requests[key] = [function (data) { renderBadge(element, data); }];

        var query = title;
        var year = getYear(card);
        if (year) query += ' ' + year;

        var url = String(settings.api_url || DEFAULTS.api_url).replace(/\/+$/, '') +
            '?movie=' + encodeURIComponent(query);

        Lampa.Network.silent(url, function (response) {
            var data = response && response.data ? response.data : response;

            if (!data) {
                finish(key, null);
                return;
            }

            cache[key] = { time: Date.now(), data: data };
            saveCache();
            finish(key, data);
        }, function () {
            finish(key, null);
        });
    }

    function finish(key, data) {
        var list = requests[key] || [];
        delete requests[key];
        list.forEach(function (fn) {
            try { fn(data); } catch (e) {}
        });
    }

    function setupCardListener() {
        Lampa.Listener.follow('card', function (e) {
            if (e.action !== 'render' || !e.card || !e.element) return;
            if (e.card.is_load_more) return;
            if (!settings.enabled) return;

            fetchRT(e.card, e.element[0] || e.element);
        });
    }

    function setupSettings() {
        if (!Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: 'rt_ratings_cfg',
            name: PLUGIN_NAME,
            icon: ICON
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_cfg',
            param: {
                name: 'rt_ratings_enabled',
                type: 'select',
                values: { 1: 'Включено', 0: 'Выключено' },
                default: settings.enabled ? 1 : 0
            },
            field: { name: 'Показывать RT на карточках' },
            onChange: function (v) {
                settings.enabled = Number(v) === 1;
                saveSettings();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_cfg',
            param: {
                name: 'rt_ratings_critic',
                type: 'select',
                values: { 1: 'Да', 0: 'Нет' },
                default: settings.show_critic ? 1 : 0
            },
            field: { name: 'Tomatometer 🍅' },
            onChange: function (v) {
                settings.show_critic = Number(v) === 1;
                saveSettings();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_cfg',
            param: {
                name: 'rt_ratings_audience',
                type: 'select',
                values: { 1: 'Да', 0: 'Нет' },
                default: settings.show_audience ? 1 : 0
            },
            field: { name: 'Popcornmeter 🍿' },
            onChange: function (v) {
                settings.show_audience = Number(v) === 1;
                saveSettings();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_cfg',
            param: {
                name: 'rt_ratings_api',
                type: 'trigger'
            },
            field: {
                name: 'API Rotten Tomatoes',
                description: 'Сторонний API без ключа'
            },
            onRender: function (item) {
                item.find('.settings-param__value').text('Готово');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_cfg',
            param: {
                name: 'rt_ratings_cache',
                type: 'trigger'
            },
            field: {
                name: 'Очистить кэш'
            },
            onRender: function (item) {
                item.on('hover:enter', function () {
                    cache = {};
                    saveCache();
                    if (Lampa.Noty) Lampa.Noty.show('Кэш RT очищен');
                });
            }
        });
    }

    function start() {
        addStyles();
        setupSettings();
        setupCardListener();
    }

    if (window.Lampa) {
        if (Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') start();
            });
        } else {
            start();
        }
    }
})();
