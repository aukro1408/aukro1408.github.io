(function () {
    'use strict';

    if (window.rt_ratings_plugin_v13) return;
    window.rt_ratings_plugin_v13 = true;

    var NAME = 'RT Ratings';
    var SETTINGS = 'rt_ratings_settings_v13';
    var CACHE = 'rt_ratings_cache_v13';

    /*
     * ВАЖНО:
     * Используем тот же рабочий endpoint, что был в v1.1:
     * ?movie=Название Год
     *
     * В v1.2 был ошибочно добавлен ?imdb_id=,
     * из-за чего API перестал отвечать.
     */

    var cfg = Object.assign({
        enabled: true,
        critic: true,
        audience: true,
        cache_days: 7,
        api: 'https://rt-api-jade.vercel.app/api/rotten-tomatoes'
    }, Lampa.Storage.get(SETTINGS, {}) || {});

    /*
     * Намеренно используем НОВЫЙ ключ кэша.
     * Это исключает старые неправильные значения.
     */
    var cache = Lampa.Storage.get(CACHE, {}) || {};
    var requests = {};

    function log() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[RT Ratings v1.3]');
        try {
            console.log.apply(console, args);
        } catch (e) {}
    }

    function saveCfg() {
        Lampa.Storage.set(SETTINGS, cfg);
    }

    function saveCache() {
        Lampa.Storage.set(CACHE, cache);
    }

    function title(movie) {
        if (!movie) return '';

        return String(
            movie.original_title ||
            movie.original_name ||
            movie.title ||
            movie.name ||
            ''
        ).trim();
    }

    function year(movie) {
        if (!movie) return '';

        var value =
            movie.release_date ||
            movie.first_air_date ||
            movie.year ||
            '';

        var match =
            String(value).match(/\b(19|20)\d{2}\b/);

        return match ? match[0] : '';
    }

    function imdb(movie) {
        if (!movie) return '';

        var id =
            movie.imdb_id ||
            movie.imdb ||
            movie.imdbId ||
            '';

        if (!id && movie.external_ids) {
            id =
                movie.external_ids.imdb_id ||
                movie.external_ids.imdb ||
                '';
        }

        return String(id || '').trim();
    }

    function describe(movie) {
        return {
            title: title(movie),
            year: year(movie),
            imdb: imdb(movie),
            id: movie && movie.id,
            type: movie && (
                movie.media_type ||
                movie.type ||
                ''
            )
        };
    }

    function score(value) {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return null;
        }

        var n =
            parseInt(
                String(value)
                    .replace('%', '')
                    .trim(),
                10
            );

        return isNaN(n)
            ? null
            : Math.max(0, Math.min(100, n));
    }

    /*
     * Разбираем ВСЕ варианты структуры ответа,
     * чтобы увидеть фактический ответ в консоли.
     */
    function normalize(response) {

        if (!response) return null;

        var data = response;

        if (
            response.data &&
            typeof response.data === 'object'
        ) {
            data = response.data;
        }

        if (
            data.data &&
            typeof data.data === 'object'
        ) {
            data = data.data;
        }

        var critic =
            score(data.tomatometer);

        if (critic === null)
            critic = score(data.criticScore);

        if (critic === null)
            critic = score(data.critic_score);

        var audience =
            score(data.audience_score);

        if (audience === null)
            audience = score(data.audienceScore);

        if (audience === null)
            audience = score(data.audience);

        if (
            critic === null &&
            audience === null
        ) {
            return null;
        }

        return {
            critic: critic,
            audience: audience,
            imdb_id:
                data.imdb_id ||
                data.imdb ||
                '',
            title: data.title || '',
            year: data.year || '',
            url: data.url || ''
        };
    }

    function scoreClass(value) {
        if (value >= 75)
            return 'rt-good';

        if (value >= 60)
            return 'rt-mid';

        return 'rt-bad';
    }

    /*
     * Дизайн оставлен таким же, как рабочий.
     */
    function addStyles() {

        if (
            document.getElementById(
                'rt-ratings-v13-style'
            )
        ) {
            return;
        }

        var style =
            document.createElement('style');

        style.id =
            'rt-ratings-v13-style';

        style.textContent =
            '.rt-ratings-v13{' +
                'display:flex;' +
                'align-items:center;' +
                'gap:7px;' +
                'margin:.35em 0 .65em;' +
                'flex-wrap:wrap;' +
            '}' +

            '.rt-ratings-v13__badge{' +
                'display:inline-flex;' +
                'align-items:center;' +
                'gap:5px;' +
                'padding:.42em .68em;' +
                'border-radius:.55em;' +
                'background:rgba(255,255,255,.09);' +
                'border:1px solid rgba(255,255,255,.12);' +
                'color:#fff;' +
                'font-size:1em;' +
                'font-weight:600;' +
                'line-height:1;' +
                'box-shadow:0 2px 9px rgba(0,0,0,.18);' +
            '}' +

            '.rt-ratings-v13__badge.rt-good{' +
                'border-color:rgba(78,190,102,.65);' +
            '}' +

            '.rt-ratings-v13__badge.rt-mid{' +
                'border-color:rgba(220,177,66,.65);' +
            '}' +

            '.rt-ratings-v13__badge.rt-bad{' +
                'border-color:rgba(220,75,75,.65);' +
            '}' +

            '.rt-ratings-v13__label{' +
                'opacity:.72;' +
                'font-size:.78em;' +
                'font-weight:500;' +
            '}' +

            '.rt-ratings-v13__icon{' +
                'font-size:1.05em;' +
            '}';

        document.head.appendChild(style);
    }

    function makeBadge(data) {

        if (!data) return '';

        var html =
            '<div class="rt-ratings-v13">';

        if (
            cfg.critic &&
            data.critic !== null
        ) {
            html +=
                '<div class="rt-ratings-v13__badge ' +
                scoreClass(data.critic) +
                '">' +
                '<span class="rt-ratings-v13__icon">🍅</span>' +
                '<span>' +
                data.critic +
                '%</span>' +
                '<span class="rt-ratings-v13__label">критики</span>' +
                '</div>';
        }

        if (
            cfg.audience &&
            data.audience !== null
        ) {
            html +=
                '<div class="rt-ratings-v13__badge ' +
                scoreClass(data.audience) +
                '">' +
                '<span class="rt-ratings-v13__icon">🍿</span>' +
                '<span>' +
                data.audience +
                '%</span>' +
                '<span class="rt-ratings-v13__label">зрители</span>' +
                '</div>';
        }

        html += '</div>';

        return html;
    }

    function request(movie, callback) {

        if (!cfg.enabled || !movie)
            return;

        var t = title(movie);

        if (!t) {
            log(
                'Пропуск: у объекта нет названия',
                describe(movie)
            );
            return;
        }

        var y = year(movie);

        /*
         * Ключ кэша:
         * название + год.
         *
         * Старый v1.1 кэш НЕ используется.
         */
        var key =
            (
                t +
                '|' +
                y
            ).toLowerCase();

        var ttl =
            Number(cfg.cache_days || 7) *
            86400000;

        if (
            cache[key] &&
            cache[key].time &&
            Date.now() -
            cache[key].time <
            ttl
        ) {

            log(
                'CACHE',
                describe(movie),
                cache[key].data
            );

            callback(
                cache[key].data
            );

            return;
        }

        if (requests[key]) {

            requests[key].push(
                callback
            );

            return;
        }

        requests[key] = [
            callback
        ];

        var query =
            t +
            (y ? ' ' + y : '');

        var url =
            String(cfg.api)
                .replace(/\/+$/, '') +
            '?movie=' +
            encodeURIComponent(query);

        log(
            'REQUEST',
            url
        );

        var request =
            new Lampa.Reguest();

        request.silent(
            url,

            function (response) {

                log(
                    'RAW RESPONSE',
                    describe(movie),
                    response
                );

                var data =
                    normalize(response);

                log(
                    'NORMALIZED',
                    describe(movie),
                    data
                );

                if (data) {

                    cache[key] = {
                        time: Date.now(),
                        data: data
                    };

                    saveCache();
                }

                finish(
                    key,
                    data
                );
            },

            function (error) {

                log(
                    'API ERROR',
                    describe(movie),
                    error
                );

                finish(
                    key,
                    null
                );
            }
        );
    }

    function finish(key, data) {

        var list =
            requests[key] || [];

        delete requests[key];

        list.forEach(
            function (callback) {

                try {
                    callback(data);
                } catch (e) {
                    log(
                        'callback error',
                        e
                    );
                }
            }
        );
    }

    /*
     * Полная карточка фильма.
     */
    function hookFull() {

        if (
            !Lampa.Listener ||
            !Lampa.Listener.follow
        ) {
            return;
        }

        Lampa.Listener.follow(
            'full',
            function (event) {

                if (
                    event.type !==
                    'complite'
                ) {
                    return;
                }

                if (!cfg.enabled)
                    return;

                var movie =
                    event.data;

                if (!movie)
                    return;

                log(
                    'FULL OBJECT',
                    describe(movie),
                    movie
                );

                var activity =
                    event.object &&
                    event.object.activity;

                if (!activity)
                    return;

                var root =
                    activity.render();

                if (!root)
                    return;

                request(
                    movie,
                    function (data) {

                        if (!data) {
                            log(
                                'RT не найден:',
                                describe(movie)
                            );
                            return;
                        }

                        var $root =
                            $(root);

                        $root.find(
                            '.rt-ratings-v13'
                        ).remove();

                        var badge =
                            $(makeBadge(data));

                        if (!badge.length)
                            return;

                        var info =
                            $root.find(
                                '.full-start-new__info'
                            );

                        if (
                            !info.length
                        ) {
                            info =
                                $root.find(
                                    '.full-start__info'
                                );
                        }

                        if (
                            info.length
                        ) {
                            info.after(
                                badge
                            );

                            return;
                        }

                        var buttons =
                            $root.find(
                                '.full-start-new__buttons'
                            );

                        if (
                            !buttons.length
                        ) {
                            buttons =
                                $root.find(
                                    '.full-start__buttons'
                                );
                        }

                        if (
                            buttons.length
                        ) {
                            buttons.before(
                                badge
                            );
                        }
                    }
                );
            }
        );
    }

    function setupSettings() {

        if (!Lampa.SettingsApi)
            return;

        var icon =
            '<svg xmlns="http://www.w3.org/2000/svg" ' +
            'width="24" height="24" ' +
            'viewBox="0 0 24 24" fill="none">' +
            '<circle cx="12" cy="12" r="9" ' +
            'stroke="currentColor" stroke-width="1.7"/>' +
            '<path d="M8 8.5h8M8 12h8M8 15.5h5" ' +
            'stroke="currentColor" stroke-width="1.7" ' +
            'stroke-linecap="round"/>' +
            '</svg>';

        Lampa.SettingsApi.addComponent({
            component:
                'rt_ratings_v13',
            name: NAME,
            icon: icon
        });

        Lampa.SettingsApi.addParam({
            component:
                'rt_ratings_v13',

            param: {
                name:
                    'rt_enabled',

                type:
                    'select',

                values: {
                    1: 'Включено',
                    0: 'Выключено'
                },

                default:
                    cfg.enabled ? 1 : 0
            },

            field: {
                name:
                    'Показывать RT'
            },

            onChange:
                function (value) {

                    cfg.enabled =
                        Number(value) === 1;

                    saveCfg();
                }
        });

        Lampa.SettingsApi.addParam({
            component:
                'rt_ratings_v13',

            param: {
                name:
                    'rt_critic',

                type:
                    'select',

                values: {
                    1: 'Да',
                    0: 'Нет'
                },

                default:
                    cfg.critic ? 1 : 0
            },

            field: {
                name:
                    'Tomatometer 🍅'
            },

            onChange:
                function (value) {

                    cfg.critic =
                        Number(value) === 1;

                    saveCfg();
                }
        });

        Lampa.SettingsApi.addParam({
            component:
                'rt_ratings_v13',

            param: {
                name:
                    'rt_audience',

                type:
                    'select',

                values: {
                    1: 'Да',
                    0: 'Нет'
                },

                default:
                    cfg.audience ? 1 : 0
            },

            field: {
                name:
                    'Popcornmeter 🍿'
            },

            onChange:
                function (value) {

                    cfg.audience =
                        Number(value) === 1;

                    saveCfg();
                }
        });

        Lampa.SettingsApi.addParam({
            component:
                'rt_ratings_v13',

            param: {
                name:
                    'rt_clear',

                type:
                    'trigger'
            },

            field: {
                name:
                    'Очистить кэш',

                description:
                    'Удалить все сохранённые RT-рейтинги'
            },

            onChange:
                function () {

                    cache = {};

                    saveCache();

                    if (Lampa.Noty) {
                        Lampa.Noty.show(
                            'Кэш RT очищен'
                        );
                    }
                }
        });
    }

    function start() {

        addStyles();

        setupSettings();

        hookFull();

        log(
            'v1.3 started'
        );
    }

    function boot() {

        if (
            typeof Lampa ===
            'undefined'
        ) {
            setTimeout(
                boot,
                200
            );

            return;
        }

        if (window.appready) {

            start();

            return;
        }

        if (
            Lampa.Listener &&
            Lampa.Listener.follow
        ) {

            Lampa.Listener.follow(
                'app',
                function (event) {

                    if (
                        event.type ===
                        'ready'
                    ) {
                        start();
                    }
                }
            );

        } else {
            start();
        }
    }

    boot();

})();
