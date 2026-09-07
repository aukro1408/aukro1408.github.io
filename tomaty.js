(function () {
    'use strict';

    if (window.rt_ratings_plugin_v111) return;
    window.rt_ratings_plugin_v111 = true;

    var NAME = 'RT Ratings';
    var SETTINGS = 'rt_ratings_settings_v111';
    var CACHE = 'rt_ratings_cache_v111';

    var cfg = Object.assign({
        enabled: true,
        critic: true,
        audience: true,
        cache_days: 7,
        api: 'https://rt-api-jade.vercel.app/api/rotten-tomatoes'
    }, Lampa.Storage.get(SETTINGS, {}) || {});

    var cache = Lampa.Storage.get(CACHE, {}) || {};
    var inFlight = {};

    function saveCfg() {
        Lampa.Storage.set(SETTINGS, cfg);
    }

    function saveCache() {
        Lampa.Storage.set(CACHE, cache);
    }

    function esc(v) {
        return String(v == null ? '' : v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
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
        if (v === null || v === undefined || v === '') return null;
        var n = parseInt(String(v).replace('%', '').trim(), 10);
        return isNaN(n) ? null : Math.max(0, Math.min(100, n));
    }

    function normalizeResponse(res) {
        if (!res) return null;

        // API documentation returns:
        // { success:true, data:{ tomatometer:"87%", audience_score:"91%" } }
        var data = res.data && typeof res.data === 'object' ? res.data : res;

        if (data.data && typeof data.data === 'object') {
            data = data.data;
        }

        var critic = parseScore(data.tomatometer);
        if (critic === null) critic = parseScore(data.criticScore);
        if (critic === null) critic = parseScore(data.critic_score);

        var audience = parseScore(data.audience_score);
        if (audience === null) audience = parseScore(data.audienceScore);
        if (audience === null) audience = parseScore(data.audience);

        if (critic === null && audience === null) return null;

        return {
            critic: critic,
            audience: audience,
            title: data.title || '',
            year: data.year || '',
            url: data.url || ''
        };
    }

    function scoreClass(n) {
        if (n >= 75) return 'rt-good';
        if (n >= 60) return 'rt-mid';
        return 'rt-bad';
    }

    function styles() {
        if (document.getElementById('rt-ratings-v111-style')) return;

        var s = document.createElement('style');
        s.id = 'rt-ratings-v111-style';
        s.textContent =
            '.rt-ratings-v111{display:flex;align-items:center;gap:7px;margin:.35em 0 .65em;flex-wrap:wrap;}' +
            '.rt-ratings-v111__badge{display:inline-flex;align-items:center;gap:5px;padding:.42em .68em;border-radius:.55em;' +
            'background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);color:#fff;' +
            'font-size:1em;font-weight:600;line-height:1;box-shadow:0 2px 9px rgba(0,0,0,.18);}' +
            '.rt-ratings-v111__badge.rt-good{border-color:rgba(78,190,102,.65);}' +
            '.rt-ratings-v111__badge.rt-mid{border-color:rgba(220,177,66,.65);}' +
            '.rt-ratings-v111__badge.rt-bad{border-color:rgba(220,75,75,.65);}' +
            '.rt-ratings-v111__label{opacity:.72;font-size:.78em;font-weight:500;}' +
            '.rt-ratings-v111__icon{font-size:1.05em;}' +
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

        var html = '<div class="rt-ratings-v111">';

        if (cfg.critic && data.critic !== null) {
            html += '<div class="rt-ratings-v111__badge ' + scoreClass(data.critic) + '">' +
                '<span class="rt-ratings-v111__icon">🍅</span>' +
                '<span>' + data.critic + '%</span>' +
                '<span class="rt-ratings-v111__label">критики</span>' +
                '</div>';
        }

        if (cfg.audience && data.audience !== null) {
            html += '<div class="rt-ratings-v111__badge ' + scoreClass(data.audience) + '">' +
                '<span class="rt-ratings-v111__icon">🍿</span>' +
                '<span>' + data.audience + '%</span>' +
                '<span class="rt-ratings-v111__label">зрители</span>' +
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

        if (!responseTitle) return true;
        if (!requestedTitle) return true;

        /*
         * RT may return punctuation/subtitle differences.
         * We only reject a clearly unrelated title.
         */
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

        var title = getTitle(movie);
        if (!title) return;

        var year = getYear(movie);

        /*
         * Prefer a stable Lampa/TMDB/IMDb identifier for CACHE only.
         * The RT API itself still receives the movie title, because
         * the working v1.1.1 endpoint supports ?movie=.
         */
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
            callback(cache[key].data);
            return;
        }

        if (inFlight[key]) {
            inFlight[key].push(callback);
            return;
        }

        inFlight[key] = [callback];

        /*
         * IMPORTANT:
         * The API documentation defines "movie" as the movie name.
         * v1.1.1 appended the year, which can cause bad matching.
         * Here we send the actual original title only.
         */
        var url = cfg.api +
            '?movie=' +
            encodeURIComponent(title);

        console.log(
            '[RT Ratings] REQUEST:',
            title,
            year,
            url
        );

        var net = new Lampa.Reguest();

        net.silent(url, function (res) {
            console.log(
                '[RT Ratings] RESPONSE:',
                title,
                res
            );

            var data = normalizeResponse(res);

            /*
             * Do not display a result for a clearly different movie.
             * This prevents one API result from being shown everywhere.
             */
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
    }


    function finish(key, data) {
        var list = inFlight[key] || [];
        delete inFlight[key];

        list.forEach(function (cb) {
            try { cb(data); } catch (e) {}
        });
    }

    function injectFull(root, data) {
        if (!root || !data) return;
        if (!cfg.critic && !cfg.audience) return;

        var old = root.find ? root.find('.rt-ratings-v111') : $(root).find('.rt-ratings-v111');
        if (old && old.length) old.remove();

        var html = $(badgeHtml(data));
        if (!html.length) return;

        // New Lampa layout: put RT directly below the main metadata/status row.
        var info =
            root.find('.full-start-new__info') ||
            root.find('.full-start__info');

        if (info && info.length) {
            info.after(html);
            return;
        }

        // Fallbacks for different Lampa themes.
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
            if (e.type !== 'complite') return;
            if (!cfg.enabled) return;

            var root = e.object && e.object.activity ? e.object.activity.render() : null;
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
        // Some Lampa builds expose the card event directly.
        if (Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('card', function (e) {
                if (!cfg.enabled || !e) return;

                var movie = e.data || e.card;
                var element = e.element;

                if (e.type && e.type !== 'render' && e.action && e.action !== 'render') return;
                if (!movie || !element) return;

                var el = element.jquery ? element[0] : element;
                if (!el) return;

                request(movie, function (data) {
                    if (data) cardBadge(el, data);
                });
            });
        }
    }

    function settings() {
        if (!Lampa.SettingsApi) return;

        var icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
            '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/>' +
            '<path d="M8 8.5h8M8 12h8M8 15.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
            '</svg>';

        Lampa.SettingsApi.addComponent({
            component: 'rt_ratings_v111',
            name: NAME,
            icon: icon
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_v111',
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
            component: 'rt_ratings_v111',
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
            component: 'rt_ratings_v111',
            param: {
                name: 'rt_audience',
                type: 'select',
                values: {1: 'Да', 0: 'Нет'},
                default: cfg.audience ? 1 : 0
            },
            field: {name: 'Popcornmeter 🍿'},
            onChange: function (v) {
                cfg.audience = Number(v) === 1;
                saveCfg();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'rt_ratings_v111',
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
                if (Lampa.Noty) Lampa.Noty.show('Кэш RT очищен');
            }
        });
    }

    function start() {
        styles();
        settings();
        hookFull();
        hookCards();
        console.log('[RT Ratings] v1.1.1 started');
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
