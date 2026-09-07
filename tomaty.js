(function () {
    'use strict';

    if (window.rt_ratings_plugin_v12) return;
    window.rt_ratings_plugin_v12 = true;

    var NAME = 'RT Ratings';
    var SETTINGS = 'rt_ratings_settings_v12';
    var CACHE = 'rt_ratings_cache_v12';

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

    /*
     * Получаем IMDb ID из объекта Lampa.
     */
    function getImdbId(movie) {
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

        if (!id && movie.source && typeof movie.source === 'object') {
            id =
                movie.source.imdb_id ||
                movie.source.imdb ||
                movie.source.imdbId ||
                '';
        }

        id = String(id || '').trim();

        return /^tt\d{7,9}$/.test(id) ? id : '';
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
        var date =
            movie.release_date ||
            movie.first_air_date ||
            movie.year ||
            '';

        var match = String(date).match(/\b(19|20)\d{2}\b/);

        return match ? match[0] : '';
    }

    function parseScore(value) {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return null;
        }

        var number = parseInt(
            String(value).replace('%', '').trim(),
            10
        );

        if (isNaN(number)) return null;

        return Math.max(0, Math.min(100, number));
    }

    /*
     * Универсальный разбор ответа RT API.
     */
    function normalizeResponse(response) {
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
            parseScore(data.tomatometer);

        if (critic === null) {
            critic = parseScore(data.criticScore);
        }

        if (critic === null) {
            critic = parseScore(data.critic_score);
        }

        var audience =
            parseScore(data.audience_score);

        if (audience === null) {
            audience = parseScore(data.audienceScore);
        }

        if (audience === null) {
            audience = parseScore(data.audience);
        }

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
        if (value >= 75) return 'rt-good';
        if (value >= 60) return 'rt-mid';

        return 'rt-bad';
    }

    /*
     * Стиль НЕ меняем относительно рабочей версии.
     */
    function addStyles() {
        if (
            document.getElementById(
                'rt-ratings-v12-style'
            )
        ) {
            return;
        }

        var style = document.createElement('style');

        style.id = 'rt-ratings-v12-style';

        style.textContent =
            '.rt-ratings-v12{' +
                'display:flex;' +
                'align-items:center;' +
                'gap:7px;' +
                'margin:.35em 0 .65em;' +
                'flex-wrap:wrap;' +
            '}' +

            '.rt-ratings-v12__badge{' +
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

            '.rt-ratings-v12__badge.rt-good{' +
                'border-color:rgba(78,190,102,.65);' +
            '}' +

            '.rt-ratings-v12__badge.rt-mid{' +
                'border-color:rgba(220,177,66,.65);' +
            '}' +

            '.rt-ratings-v12__badge.rt-bad{' +
                'border-color:rgba(220,75,75,.65);' +
            '}' +

            '.rt-ratings-v12__label{' +
                'opacity:.72;' +
                'font-size:.78em;' +
                'font-weight:500;' +
            '}' +

            '.rt-ratings-v12__icon{' +
                'font-size:1.05em;' +
            '}' +

            '.rt-ratings-card-v12{' +
                'position:relative!important;' +
            '}' +

            '.rt-ratings-card-badge-v12{' +
                'position:absolute;' +
                'left:5px;' +
                'bottom:5px;' +
                'z-index:30;' +
                'display:flex;' +
                'gap:4px;' +
                'pointer-events:none;' +
            '}' +

            '.rt-ratings-card-badge-v12 span{' +
                'padding:3px 5px;' +
                'border-radius:6px;' +
                'background:rgba(8,10,12,.9);' +
                'font:700 11px/1 Arial,sans-serif;' +
                'color:#fff;' +
                'border:1px solid rgba(255,255,255,.16);' +
            '}' +

            '.rt-ratings-card-badge-v12 .rt-good{' +
                'border-color:rgba(78,190,102,.7);' +
            '}' +

            '.rt-ratings-card-badge-v12 .rt-mid{' +
                'border-color:rgba(220,177,66,.7);' +
            '}' +

            '.rt-ratings-card-badge-v12 .rt-bad{' +
                'border-color:rgba(220,75,75,.7);' +
            '}';

        document.head.appendChild(style);
    }

    function makeFullBadge(data) {
        if (!data) return '';

        var html =
            '<div class="rt-ratings-v12">';

        if (
            cfg.critic &&
            data.critic !== null
        ) {
            html +=
                '<div class="rt-ratings-v12__badge ' +
                scoreClass(data.critic) +
                '">' +
                '<span class="rt-ratings-v12__icon">🍅</span>' +
                '<span>' +
                data.critic +
                '%</span>' +
                '<span class="rt-ratings-v12__label">критики</span>' +
                '</div>';
        }

        if (
            cfg.audience &&
            data.audience !== null
        ) {
            html +=
                '<div class="rt-ratings-v12__badge ' +
                scoreClass(data.audience) +
                '">' +
                '<span class="rt-ratings-v12__icon">🍿</span>' +
                '<span>' +
                data.audience +
                '%</span>' +
                '<span class="rt-ratings-v12__label">зрители</span>' +
                '</div>';
        }

        html += '</div>';

        return html;
    }

    /*
     * Основной запрос:
     *
     * IMDb ID используется как ключ.
     *
     * Если IMDb ID присутствует, отправляем:
     * ?imdb_id=ttXXXXXXX
     *
     * Это исключает ситуацию, когда разные фильмы
     * получают один и тот же результат поиска.
     */
    function requestByImdb(movie, callback) {
        if (!cfg.enabled || !movie) return;

        var imdb = getImdbId(movie);

        if (!imdb) {
            /*
             * Если Lampa не передала IMDb ID,
             * используем резервный поиск.
             */
            requestByTitle(movie, callback);
            return;
        }

        var key = 'imdb:' + imdb;

        var ttl =
            Number(cfg.cache_days || 7) *
            86400000;

        if (
            cache[key] &&
            cache[key].time &&
            Date.now() - cache[key].time < ttl
        ) {
            callback(cache[key].data);
            return;
        }

        if (inFlight[key]) {
            inFlight[key].push(callback);
            return;
        }

        inFlight[key] = [callback];

        var url =
            String(cfg.api).replace(/\/+$/, '') +
            '?imdb_id=' +
            encodeURIComponent(imdb);

        var request = new Lampa.Reguest();

        request.silent(
            url,
            function (response) {

                var data =
                    normalizeResponse(response);

                /*
                 * Если API вернул IMDb ID,
                 * проверяем соответствие.
                 */
                if (
                    data &&
                    data.imdb_id &&
                    String(data.imdb_id).toLowerCase() !==
                    imdb.toLowerCase()
                ) {
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
            },
            function () {
                finish(key, null);
            }
        );
    }

    /*
     * Резервный поиск.
     *
     * Используется только если Lampa
     * вообще не передала IMDb ID.
     */
    function requestByTitle(movie, callback) {
        var title = getTitle(movie);

        if (!title) return;

        var year = getYear(movie);

        var key =
            'title:' +
            title.toLowerCase() +
            ':' +
            year;

        var ttl =
            Number(cfg.cache_days || 7) *
            86400000;

        if (
            cache[key] &&
            cache[key].time &&
            Date.now() - cache[key].time < ttl
        ) {
            callback(cache[key].data);
            return;
        }

        if (inFlight[key]) {
            inFlight[key].push(callback);
            return;
        }

        inFlight[key] = [callback];

        var query =
            title +
            (year ? ' ' + year : '');

        var url =
            String(cfg.api).replace(/\/+$/, '') +
            '?movie=' +
            encodeURIComponent(query);

        var request = new Lampa.Reguest();

        request.silent(
            url,
            function (response) {

                var data =
                    normalizeResponse(response);

                if (data) {
                    cache[key] = {
                        time: Date.now(),
                        data: data
                    };

                    saveCache();
                }

                finish(key, data);
            },
            function () {
                finish(key, null);
            }
        );
    }

    function finish(key, data) {
        var list = inFlight[key] || [];

        delete inFlight[key];

        list.forEach(function (callback) {
            try {
                callback(data);
            } catch (e) {}
        });
    }

    /*
     * Страница фильма / сериала.
     */
    function hookFull() {

        Lampa.Listener.follow(
            'full',
            function (event) {

                if (
                    event.type !==
                    'complite'
                ) {
                    return;
                }

                if (!cfg.enabled) return;

                var movie =
                    event.data;

                if (!movie) return;

                var activity =
                    event.object &&
                    event.object.activity;

                if (!activity) return;

                var root =
                    activity.render();

                if (!root) return;

                requestByImdb(
                    movie,
                    function (data) {

                        if (!data) return;

                        var $root =
                            $(root);

                        $root.find(
                            '.rt-ratings-v12'
                        ).remove();

                        var html =
                            $(makeFullBadge(data));

                        if (!html.length) {
                            return;
                        }

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
                            info.after(html);
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
                            buttons.before(html);
                        }
                    }
                );
            }
        );
    }

    /*
     * Карточки каталога.
     */
    function hookCards() {

        if (
            !Lampa.Listener ||
            !Lampa.Listener.follow
        ) {
            return;
        }

        Lampa.Listener.follow(
            'card',
            function (event) {

                if (!cfg.enabled) return;

                if (!event) return;

                var movie =
                    event.data ||
                    event.card;

                var element =
                    event.element;

                if (!movie || !element) {
                    return;
                }

                var el =
                    element.jquery ?
                    element[0] :
                    element;

                if (!el) return;

                requestByImdb(
                    movie,
                    function (data) {

                        if (!data) return;

                        var old =
                            el.querySelector(
                                '.rt-ratings-card-badge-v12'
                            );

                        if (old) {
                            old.remove();
                        }

                        var html =
                            '<div class="rt-ratings-card-badge-v12">';

                        if (
                            cfg.critic &&
                            data.critic !== null
                        ) {
                            html +=
                                '<span class="' +
                                scoreClass(data.critic) +
                                '">🍅 ' +
                                data.critic +
                                '%</span>';
                        }

                        if (
                            cfg.audience &&
                            data.audience !== null
                        ) {
                            html +=
                                '<span class="' +
                                scoreClass(data.audience) +
                                '">🍿 ' +
                                data.audience +
                                '%</span>';
                        }

                        html += '</div>';

                        el.classList.add(
                            'rt-ratings-card-v12'
                        );

                        el.insertAdjacentHTML(
                            'beforeend',
                            html
                        );
                    }
                );
            }
        );
    }

    function setupSettings() {

        if (!Lampa.SettingsApi) {
            return;
        }

        var icon =
            '<svg xmlns="http://www.w3.org/2000/svg" ' +
            'width="24" height="24" viewBox="0 0 24 24" ' +
            'fill="none">' +
            '<circle cx="12" cy="12" r="9" ' +
            'stroke="currentColor" stroke-width="1.7"/>' +
            '<path d="M8 8.5h8M8 12h8M8 15.5h5" ' +
            'stroke="currentColor" stroke-width="1.7" ' +
            'stroke-linecap="round"/>' +
            '</svg>';

        Lampa.SettingsApi.addComponent({
            component:
                'rt_ratings_v12',
            name: NAME,
            icon: icon
        });

        Lampa.SettingsApi.addParam({
            component:
                'rt_ratings_v12',

            param: {
                name: 'rt_enabled',
                type: 'select',

                values: {
                    1: 'Включено',
                    0: 'Выключено'
                },

                default:
                    cfg.enabled ? 1 : 0
            },

            field: {
                name:
                    'Показывать RT на карточках'
            },

            onChange: function (value) {
                cfg.enabled =
                    Number(value) === 1;

                saveCfg();
            }
        });

        Lampa.SettingsApi.addParam({
            component:
                'rt_ratings_v12',

            param: {
                name: 'rt_critic',
                type: 'select',

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

            onChange: function (value) {
                cfg.critic =
                    Number(value) === 1;

                saveCfg();
            }
        });

        Lampa.SettingsApi.addParam({
            component:
                'rt_ratings_v12',

            param: {
                name: 'rt_audience',
                type: 'select',

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

            onChange: function (value) {
                cfg.audience =
                    Number(value) === 1;

                saveCfg();
            }
        });

        Lampa.SettingsApi.addParam({
            component:
                'rt_ratings_v12',

            param: {
                name: 'rt_clear',
                type: 'trigger'
            },

            field: {
                name:
                    'Очистить кэш',

                description:
                    'Удалить сохранённые RT-рейтинги'
            },

            onChange: function () {

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

        hookCards();

        console.log(
            '[RT Ratings] v1.2 started'
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
