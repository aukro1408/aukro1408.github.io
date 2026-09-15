(function () {
    'use strict';

    if (window.rt_ratings_plugin_v115) return;
    window.rt_ratings_plugin_v115 = true;

    var NAME = 'RT Ratings';
    var SETTINGS = 'rt_ratings_settings_v115';
    var CACHE = 'rt_ratings_cache_v115';

    // подхватываем настройки/кэш от предыдущих версий плагина
    var oldCfg = Object.assign(
        {},
        Lampa.Storage.get('rt_ratings_settings_v111', {}) || {},
        Lampa.Storage.get('rt_ratings_settings_v113', {}) || {},
        Lampa.Storage.get('rt_ratings_settings_v114', {}) || {}
    );
    var oldCache = Object.assign(
        {},
        Lampa.Storage.get('rt_ratings_cache_v111', {}) || {},
        Lampa.Storage.get('rt_ratings_cache_v113', {}) || {},
        Lampa.Storage.get('rt_ratings_cache_v114', {}) || {}
    );

    var cfg = Object.assign({
        enabled: true,
        critic: true,
        audience: true, // оставлено в настройках, но OMDb зрительский % не отдаёт — см. normalizeResponse
        cache_days: 7,
        api: 'https://www.omdbapi.com/',
        apikey: '' // получить бесплатно: https://www.omdbapi.com/apikey.aspx
    }, oldCfg, Lampa.Storage.get(SETTINGS, {}) || {});

    var cache = Object.assign({}, oldCache, Lampa.Storage.get(CACHE, {}) || {});
    var inFlight = {};

    function saveCfg() {
        Lampa.Storage.set(SETTINGS, cfg);
    }

    function saveCache() {
        Lampa.Storage.set(CACHE, cache);
    }

    function getMovie(data) {
        if (!data) return null;
        return data.movie || data;
    }

    function getTitle(movie) {
        return String(
            movie.original_title ||
            movie.original_name ||
            movie.title ||
            movie.name ||
            ''
        ).trim();
    }

    function getYear(movie) {
        var date = movie.release_date || movie.first_air_date || movie.year || '';
        var m = String(date).match(/\b(19|20)\d{2}\b/);
        return m ? m[0] : '';
    }

    function parseScore(v) {
        if (v === null || v === undefined || v === '' || v === 'N/A') return null;
        var n = parseInt(String(v).replace('%', '').trim(), 10);
        return isNaN(n) ? null : Math.max(0, Math.min(100, n));
    }

    function parseJsonIfNeeded(res) {
        if (typeof res !== 'string') return res;

        try {
            return JSON.parse(res);
        } catch (e) {
            console.warn('[RT Ratings] JSON PARSE ERROR:', res);
            return null;
        }
    }

    // --- OMDb-специфичный разбор ответа ---
    // Формат: { Response:"True", Title, Year, Ratings:[{Source:"Rotten Tomatoes", Value:"83%"}, ...], ... }
    function normalizeResponse(res) {
        res = parseJsonIfNeeded(res);
        if (!res || typeof res !== 'object') return null;

        console.log('[RT Ratings] PARSED:', res);

        if (res.Response === 'False') {
            console.warn('[RT Ratings] OMDb ERROR:', res.Error);
            return null;
        }

        var critic = null;
        var ratings = Array.isArray(res.Ratings) ? res.Ratings : [];

        ratings.forEach(function (r) {
            if (r && r.Source === 'Rotten Tomatoes') {
                critic = parseScore(r.Value);
            }
        });

        // на случай, если когда-нибудь снова заработают устаревшие tomato*-поля OMDb
        if (critic === null) critic = parseScore(res.tomatoMeter);

        // OMDb не отдаёт зрительский % (Popcornmeter) — публичного RT audience API нет
        var audience = null;

        if (critic === null && audience === null) {
            console.warn('[RT Ratings] NO RT SCORE IN RESPONSE:', res);
            return null;
        }

        return {
            critic: critic,
            audience: audience,
            title: res.Title || '',
            year: res.Year || '',
            url: ''
        };
    }

    function scoreClass(n) {
        if (n >= 75) return 'rt-good';
        if (n >= 60) return 'rt-mid';
        return 'rt-bad';
    }

    function styles() {
        if (document.getElementById('rt-ratings-v115-style')) return;

        var s = document.createElement('style');
        s.id = 'rt-ratings-v115-style';
        s.textContent =
            '.rt-ratings-v115{display:flex;align-items:center;gap:7px;margin:.35em 0 .65em;flex-wrap:wrap;}' +
            '.rt-ratings-v115__badge{display:inline-flex;align-items:center;gap:5px;padding:.42em .68em;border-radius:.55em;' +
            'background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);color:#fff;' +
            'font-size:1em;font-weight:600;line-height:1;box-shadow:0 2px 9px rgba(0,0,0,.18);}' +
            '.rt-ratings-v115__badge.rt-good{border-color:rgba(78,190,102,.65);}' +
            '.rt-ratings-v115__badge.rt-mid{border-color:rgba(220,177,66,.65);}' +
            '.rt-ratings-v115__badge.rt-bad{border-color:rgba(220,75,75,.65);}' +
            '.rt-ratings-v115__label{opacity:.72;font-size:.78em;font-weight:500;}' +
            '.rt-ratings-v115__icon{font-size:1.05em;}' +
            '.rt-ratings-card{position:relative!important;}' +
            '.rt-ratings-card-badge{position:absolute;left:5px;bottom:5px;z-index:30;display:flex;gap:4px;pointer-events:none;}' +
            '.rt-ratings-card-badge span{padding:3px 5px;border-radius:6px;background:rgba(8,10,12,.9);' +
            'font:700 11px/1 Arial,sans-serif;color:#fff;border:1px solid rgba(255,255,255,.16);}' +
            '.rt-ratings-card-badge .good{border-color:rgba(78,190,102,.7);}' +
            '.rt-ratings-card-badge .mid{border-color:rgba(220,177,66,.7);}' +
            '.rt-ratings-card-badge .bad{border-color:rgba(220,75,75,.7);}';
        document.head.appendChild(s);
    }

    function badgeHtml(data) {
        if (!data) return '';

        var html = '<div class="rt-ratings-v115">';

        if (cfg.critic && data.critic !== null) {
            html += '<div class="rt-ratings-v115__badge ' + scoreClass(data.critic) + '">' +
                '<span class="rt-ratings-v115__icon">🍅</span>' +
                '<span>' + data.critic + '%</span>' +
                '<span class="rt-ratings-v115__label">критики</span>' +
                '</div>';
        }

        if (cfg.audience && data.audience !== null) {
            html += '<div class="rt-ratings-v115__badge ' + scoreClass(data.audience) + '">' +
                '<span class="rt-ratings-v115__icon">🍿</span>' +
                '<span>' + data.audience + '%</span>' +
                '<span class="rt-ratings-v115__label">зрители</span>' +
                '</div>';
        }

        return html + '</div>';
    }

    function normalizeMatch(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9а-яё]+/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function responseMatchesMovie(data, movie) {
        if (!data) return false;

        var requestedTitle = normalizeMatch(getTitle(movie));
        var responseTitle = normalizeMatch(data.title);

        if (!responseTitle || !requestedTitle) return true;
        if (requestedTitle === responseTitle) return true;
        if (responseTitle.indexOf(requestedTitle) !== -1) return true;
        if (requestedTitle.indexOf(responseTitle) !== -1) return true;

        var a = requestedTitle.split(' ');
        var b = responseTitle.split(' ');
        var common = 0;

        a.forEach(function (word) {
            if (word.length > 2 && b.indexOf(word) !== -1) common++;
        });

        return common >= Math.min(2, a.length);
    }

    function request(movie, callback) {
        if (!cfg.enabled || !movie) return;

        if (!cfg.apikey) {
            console.warn('[RT Ratings] Нет API-ключа OMDb — задайте его в настройках плагина');
            callback(null);
            return;
        }

        var title = getTitle(movie);
        if (!title) return;

        var year = getYear(movie);

        var stableId =
            movie.imdb_id ||
            movie.imdb ||
            movie.id ||
            '';

        var key = (
            stableId
                ? String(stableId)
                : title + '|' + year
        ).toLowerCase();

        var ttl = Number(cfg.cache_days || 7) * 86400000;

        if (cache[key] && Date.now() - cache[key].time < ttl) {
            console.log('[RT Ratings] CACHE:', title, cache[key].data);
            callback(cache[key].data);
            return;
        }

        if (inFlight[key]) {
            inFlight[key].push(callback);
            return;
        }

        inFlight[key] = [callback];

        var url = cfg.api +
            '?apikey=' + encodeURIComponent(cfg.apikey) +
            '&t=' + encodeURIComponent(title) +
            (year ? '&y=' + encodeURIComponent(year) : '');

        console.log('[RT Ratings] REQUEST:', title, year, url);

        var net = new Lampa.Reguest();

        try {
            net.silent(url, function (res) {
                console.log('[RT Ratings] RESPONSE:', title, res);

                var data = normalizeResponse(res);

                if (data && !responseMatchesMovie(data, movie)) {
                    console.warn(
                        '[RT Ratings] REJECTED MISMATCH:',
                        title,
                        '=>',
                        data.title
                    );
                    data = null;
                }

                if (data) {
                    cache[key] = {
                        time: Date.now(),
                        data: data
                    };
                    saveCache();

                    console.log('[RT Ratings] SUCCESS:', title, data);
                }

                finish(key, data);
            }, function (error) {
                console.warn(
                    '[RT Ratings] API ERROR:',
                    title,
                    error
                );
                finish(key, null);
            });
        } catch (e) {
            console.error('[RT Ratings] REQUEST EXCEPTION:', title, e);
            finish(key, null);
        }
    }

    function finish(key, data) {
        var list = inFlight[key] || [];
        delete inFlight[key];

        list.forEach(function (cb) {
            try { cb(data); } catch (e) {
                console.error('[RT Ratings] CALLBACK ERROR:', e);
            }
        });
    }

    function injectFull(root, data) {
        if (!root || !data) return;
        if (!cfg.critic && !cfg.audience) return;

        var old = root.find('.rt-ratings-v115');
        if (old && old.length) old.remove();

        var html = $(badgeHtml(data));
        if (!html.length) return;

        var info = root.find('.full-start-new__info');
        if (info.length) {
            info.after(html);
            return;
        }

        info = root.find('.full-start__info');
        if (info.length) {
            info.after(html);
            return;
        }

        var buttons = root.find('.full-start-new__buttons');
        if (!buttons.length) buttons = root.find('.full-start__buttons');

        if (buttons.length) {
            buttons.before(html);
            return;
        }

        var poster = root.find('.full-start-new__poster');
        if (!poster.length) poster = root.find('.full-start__poster');

        if (poster.length) poster.after(html);
    }

    function hookFull() {
        Lampa.Listener.follow('full', function (e) {
            if (!e || e.type !== 'complite') return;
            if (!cfg.enabled) return;

            var root = e.object && e.object.activity ?
                e.object.activity.render() :
                null;

            var movie = getMovie(e.data);

            if (!root || !movie) return;

            request(movie, function (data) {
                if (!data) return;
                injectFull(root, data);
            });
        });
    }

    function cardBadge(element, data) {
        if (!element || !data) return;

        var box = element.querySelector('.rt-ratings-card-badge');
        if (box) box.remove();

        var html = '<div class="rt-ratings-card-badge">';

        if (cfg.critic && data.critic !== null) {
            html += '<span class="' + scoreClass(data.critic) + '">🍅 ' + data.critic + '%</span>';
        }

        if (cfg.audience && data.audience !== null) {
            html += '<span class="' + scoreClass(data.audience) + '">🍿 ' + data.audience + '%</span>';
        }

        html += '</div>';

        element.classList.add('rt-ratings-card');
        element.insertAdjacentHTML('beforeend', html);
    }

    function hookCards() {
        if (!Lampa.Listener || !Lampa.Listener.follow) return;

        Lampa.Listener.follow('card', function (e) {
            if (!cfg.enabled || !e) return;

            var movie = e.data || e.card;
            var element = e.element;

            if (e.type && e.type !== 'render' &&
                e.action && e.action !== 'render') return;

            if (!movie || !element) return;

            var el = element.jquery ? element[0] : element;
            if (!el) return;

            request(movie, function (data) {
                if (data) cardBadge(el, data);
            });
        });
    }

    function settings() {
        if (!Lampa.SettingsApi) return;

        var icon =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ' +
            'viewBox="0 0 24 24" fill="none">' +
            '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/>' +
            '<path d="M8 8.5h8M8 12h8M8 15.5h5" stroke="currentColor" ' +
            'stroke-width="1.7" stroke-linecap="round"/>' +
            '</svg>';

        Lampa.SettingsApi.addComponent({
            component: 'rt_ratings_v115',
            name: NAME,
            icon: icon
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_v115',
            param: {
                name: 'rt_apikey',
                type: 'trigger'
            },
            field: {
                name: 'OMDb API ключ',
                description: (cfg.apikey ? 'Ключ сохранён (нажмите, чтобы изменить)' : 'Не задан — нажмите, чтобы ввести') +
                    '. Бесплатно на omdbapi.com/apikey.aspx (1000 запросов/день)'
            },
            onChange: function () {
                if (!Lampa.Input || !Lampa.Input.edit) {
                    if (Lampa.Noty) Lampa.Noty.show('Ввод текста недоступен в этой версии Lampa');
                    return;
                }

                Lampa.Input.edit({
                    title: 'OMDb API ключ',
                    value: cfg.apikey || '',
                    free: true
                }, function (value) {
                    cfg.apikey = String(value || '').trim();
                    saveCfg();

                    if (Lampa.Noty) Lampa.Noty.show('Ключ сохранён');

                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_v115',
            param: {
                name: 'rt_enabled',
                type: 'select',
                values: {1: 'Включено', 0: 'Выключено'},
                default: cfg.enabled ? 1 : 0
            },
            field: {name: 'Показывать RT на карточках'},
            onChange: function (v) {
                cfg.enabled = Number(v) === 1;
                saveCfg();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_v115',
            param: {
                name: 'rt_critic',
                type: 'select',
                values: {1: 'Да', 0: 'Нет'},
                default: cfg.critic ? 1 : 0
            },
            field: {name: 'Tomatometer 🍅'},
            onChange: function (v) {
                cfg.critic = Number(v) === 1;
                saveCfg();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_v115',
            param: {
                name: 'rt_audience',
                type: 'select',
                values: {1: 'Да', 0: 'Нет'},
                default: cfg.audience ? 1 : 0
            },
            field: {
                name: 'Popcornmeter 🍿',
                description: 'OMDb не отдаёт зрительский % — поле оставлено на случай смены источника'
            },
            onChange: function (v) {
                cfg.audience = Number(v) === 1;
                saveCfg();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_v115',
            param: {
                name: 'rt_clear',
                type: 'trigger'
            },
            field: {
                name: 'Очистить кэш',
                description: 'Удалит сохранённые RT-рейтинги'
            },
            onChange: function () {
                cache = {};
                saveCache();

                if (Lampa.Noty) {
                    Lampa.Noty.show('Кэш RT очищен');
                }
            }
        });
    }

    function start() {
        styles();
        settings();
        hookFull();
        hookCards();

        console.log('[RT Ratings] v1.1.4 (OMDb) started');
    }

    function boot() {
        if (typeof Lampa === 'undefined') {
            setTimeout(boot, 200);
            return;
        }

        if (window.appready) {
            start();
        } else if (Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') start();
            });
        } else {
            start();
        }
    }

    boot();
})();
