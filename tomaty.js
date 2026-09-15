(function () {
    'use strict';

    if (window.kp_ratings_plugin_v101) return;
    window.kp_ratings_plugin_v100 = true;

    var NAME = 'KP Ratings';
    var SETTINGS = 'kp_ratings_settings_v100';

    var cfg = Object.assign({
        enabled: true,
        cache_days: 7,
        api: 'https://kinopoiskapiunofficial.tech/'
    }, Lampa.Storage.get(SETTINGS, {}) || {});

    var cache = Lampa.Storage.cache('kp_rating_v100', 500, {});
    var inFlight = {};

    function saveCfg() {
        Lampa.Storage.set(SETTINGS, cfg);
    }

    function cleanTitle(str) {
        return String(str || '')
            .replace(/[\s.,:;’'`!?]+/g, ' ')
            .trim();
    }

    function kpCleanTitle(str) {
        return cleanTitle(str)
            .replace(/^[ \/\\]+/, '')
            .replace(/[ \/\\]+$/, '')
            .replace(/\+( *[+\/\\])+/g, '+')
            .replace(/([+\/\\] *)+\+/g, '+')
            .replace(/( *[\/\\]+ *)+/g, '+');
    }

    function normalizeTitle(str) {
        return cleanTitle(String(str || '').toLowerCase()
            .replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-')
            .replace(/ё/g, 'е'));
    }

    function equalTitle(a, b) {
        return typeof a === 'string' &&
            typeof b === 'string' &&
            normalizeTitle(a) === normalizeTitle(b);
    }

    function containsTitle(a, b) {
        return typeof a === 'string' &&
            typeof b === 'string' &&
            normalizeTitle(a).indexOf(normalizeTitle(b)) !== -1;
    }

    function getYear(card) {
        var date = card.release_date ||
            card.first_air_date ||
            card.last_air_date ||
            card.year || '0000';

        var m = String(date).match(/\b(19|20)\d{2}\b/);
        return m ? parseInt(m[0], 10) : 0;
    }

    function getImdb(card) {
        var id = card && (
            card.imdb_id ||
            card.imdb ||
            card.imdbId ||
            card.imdbID
        );

        return /^tt\d+$/i.test(String(id || '').trim()) ?
            String(id).trim() : '';
    }

    function getTitle(card) {
        return kpCleanTitle(
            card.original_title ||
            card.original_name ||
            card.title ||
            card.name ||
            ''
        );
    }

    function apiBase() {
        var base = String(cfg.api || '').trim();
        if (base.charAt(base.length - 1) !== '/') base += '/';
        return base;
    }

    function headers() {
        return {
            'X-API-KEY': String(cfg.apikey || '').trim()
        };
    }

    function request(url, success, error, timeout) {
        var net = new Lampa.Reguest();
        net.clear();
        net.timeout(timeout || 15000);

        console.log('[KP Ratings] REQUEST:', url);

        net.silent(url, function (data) {
            console.log('[KP Ratings] RESPONSE:', data);
            success(data);
        }, function (a, c) {
            var err = net.errorDecode(a, c);
            console.warn('[KP Ratings] ERROR:', err);
            if (error) error(err);
        }, false, {
            headers: headers()
        });

        return net;
    }

    function saveRating(key, kp) {
        var item = {
            kp: kp === null || kp === undefined ? 0 : Number(kp),
            timestamp: Date.now()
        };

        cache[key] = item;
        Lampa.Storage.set('kp_rating_v100', cache);

        return item;
    }

    function getCache(key) {
        var item = cache[key];
        if (!item) return null;

        var ttl = Number(cfg.cache_days || 7) * 86400000;

        if (Date.now() - Number(item.timestamp || 0) > ttl) {
            delete cache[key];
            Lampa.Storage.set('kp_rating_v100', cache);
            return null;
        }

        return item;
    }

    function showRating(data) {
        if (!data || data.kp === null || data.kp === undefined) return;

        var rating = Number(data.kp);

        if (isNaN(rating) || rating <= 0) return;

        var active = Lampa.Activity.active();
        var render = active && active.activity && active.activity.render();

        if (!render) return;

        var value = rating.toFixed(1);

        $('.kp-rating-v100', render).remove();

        var block =
            '<div class="kp-rating-v100">' +
                '<span class="kp-rating-v100__icon">⭐</span>' +
                '<span class="kp-rating-v100__value">' + value + '</span>' +
                '<span class="kp-rating-v100__label">КП</span>' +
            '</div>';

        var info = $('.info__rate', render);

        /*
         * Главное изменение:
         * KP теперь находится ВНУТРИ той же группы, где Lampa показывает TMDB,
         * а не отдельной строкой под жанрами.
         */
        if (info.length) {
            info.append(block);
            return;
        }

        var rates = $('.full-start-new__rates', render);

        if (!rates.length) rates = $('.full-start__rates', render);

        if (rates.length) {
            rates.append(block);
            return;
        }

        var details = $('.full-start-new__details', render);

        if (!details.length) details = $('.full-start__details', render);

        if (details.length) {
            details.prepend(block);
        }
    }

    function findFilm(card, items) {
        if (!items || !items.length) return null;

        var imdb = getImdb(card);
        var year = getYear(card);
        var original = card.original_title || card.original_name || '';
        var title = card.title || card.name || '';

        if (imdb) {
            var byImdb = items.filter(function (item) {
                return String(
                    item.imdb_id ||
                    item.imdbId ||
                    item.imdb ||
                    ''
                ).toLowerCase() === imdb.toLowerCase();
            });

            if (byImdb.length) return byImdb[0];
        }

        var exact = items.filter(function (item) {
            return equalTitle(
                item.orig_title || item.nameOriginal ||
                item.en_title || item.nameEn ||
                item.title || item.ru_title || item.nameRu,
                original || title
            );
        });

        if (exact.length) {
            if (year) {
                var exactYear = exact.filter(function (item) {
                    var y = parseInt(String(
                        item.start_date || item.year || '0000'
                    ).slice(0, 4), 10);

                    return y === year;
                });

                if (exactYear.length) return exactYear[0];
            }

            return exact[0];
        }

        var contains = items.filter(function (item) {
            var names = [
                item.orig_title,
                item.nameOriginal,
                item.en_title,
                item.nameEn,
                item.title,
                item.ru_title,
                item.nameRu
            ];

            return names.some(function (name) {
                return containsTitle(name, original || title) ||
                    containsTitle(name, title);
            });
        });

        if (contains.length) {
            if (year) {
                var nearYear = contains.filter(function (item) {
                    var y = parseInt(String(
                        item.start_date || item.year || '0000'
                    ).slice(0, 4), 10);

                    return y && Math.abs(y - year) <= 1;
                });

                if (nearYear.length) return nearYear[0];
            }

            return contains[0];
        }

        return null;
    }

    function getRating(card, callback) {
        if (!cfg.enabled) return callback(null);

        if (!cfg.apikey) {
            console.warn('[KP Ratings] API KEY IS EMPTY');
            return callback(null);
        }

        var imdb = getImdb(card);
        var title = getTitle(card);
        var year = getYear(card);

        if (!title && !imdb) return callback(null);

        var key = String(
            imdb || card.id || title + '|' + year
        ).toLowerCase();

        var old = getCache(key);

        if (old) {
            console.log('[KP Ratings] CACHE:', key, old);
            return callback(old);
        }

        if (inFlight[key]) {
            inFlight[key].push(callback);
            return;
        }

        inFlight[key] = [callback];

        var base = apiBase();
        var titleUrl = Lampa.Utils.addUrlComponent(
            base + 'api/v2.1/films/search-by-keyword',
            'keyword=' + encodeURIComponent(title)
        );

        function finish(data) {
            var list = inFlight[key] || [];
            delete inFlight[key];

            list.forEach(function (cb) {
                try { cb(data); } catch (e) {}
            });
        }

        function loadDetails(film) {
            var id = film && (
                film.kp_id ||
                film.kinopoisk_id ||
                film.kinopoiskId ||
                film.filmId
            );

            if (!id) {
                finish(null);
                return;
            }

            request(
                base + 'api/v2.2/films/' + encodeURIComponent(id),
                function (data) {
                    var kp = data && (
                        data.ratingKinopoisk !== undefined ?
                        data.ratingKinopoisk :
                        data.ratingKinopoiskVoteCount &&
                        data.ratingKinopoisk
                    );

                    if (kp === undefined || kp === null) {
                        finish(saveRating(key, 0));
                        return;
                    }

                    finish(saveRating(key, kp));
                },
                function () {
                    finish(null);
                }
            );
        }

        function searchByTitle() {
            request(
                titleUrl,
                function (json) {
                    var items = json && (
                        json.items || json.films || []
                    );

                    var film = findFilm(card, items);

                    if (film) {
                        loadDetails(film);
                    } else {
                        finish(saveRating(key, 0));
                    }
                },
                function () {
                    finish(null);
                }
            );
        }

        if (imdb) {
            var imdbUrl = Lampa.Utils.addUrlComponent(
                base + 'api/v2.2/films',
                'imdbId=' + encodeURIComponent(imdb)
            );

            request(
                imdbUrl,
                function (json) {
                    var items = json && (
                        json.items || json.films || []
                    );

                    var film = findFilm(card, items);

                    if (film) {
                        loadDetails(film);
                    } else {
                        searchByTitle();
                    }
                },
                function () {
                    searchByTitle();
                }
            );
        } else {
            searchByTitle();
        }
    }

    function inject(card) {
        getRating(card, function (data) {
            if (data && Number(data.kp) > 0) {
                showRating(data);
            }
        });
    }

    function settings() {
        if (!Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: 'kp_ratings_v100',
            name: NAME,
            icon:
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ' +
                'viewBox="0 0 24 24" fill="none">' +
                '<path d="M12 3.5l2.65 5.37 5.92.86-4.28 4.17 1.01 5.9L12 17.02l-5.3 2.78 1.01-5.9L3.43 9.73l5.92-.86L12 3.5z" ' +
                'stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
                '</svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'kp_ratings_v100',
            param: {
                name: 'kp_apikey',
                type: 'trigger'
            },
            field: {
                name: 'API-ключ КиноПоиска',
                description: cfg.apikey ?
                    'Ключ сохранён — нажмите для изменения' :
                    'Ключ не задан'
            },
            onChange: function () {
                if (!Lampa.Input || !Lampa.Input.edit) {
                    Lampa.Noty.show('Ввод текста недоступен');
                    return;
                }

                Lampa.Input.edit({
                    title: 'API-ключ КиноПоиска',
                    value: cfg.apikey || '',
                    free: true
                }, function (value) {
                    cfg.apikey = String(value || '').trim();
                    saveCfg();

                    Lampa.Noty.show(
                        cfg.apikey ?
                        'API-ключ КиноПоиска сохранён' :
                        'API-ключ очищен'
                    );

                    if (Lampa.Settings && Lampa.Settings.update) {
                        Lampa.Settings.update();
                    }
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'kp_ratings_v100',
            param: {
                name: 'kp_enabled',
                type: 'select',
                values: {
                    1: 'Включено',
                    0: 'Выключено'
                },
                default: cfg.enabled ? 1 : 0
            },
            field: {
                name: 'Показывать рейтинг КП'
            },
            onChange: function (v) {
                cfg.enabled = Number(v) === 1;
                saveCfg();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'kp_ratings_v100',
            param: {
                name: 'kp_clear',
                type: 'trigger'
            },
            field: {
                name: 'Очистить кэш',
                description: 'Удалить сохранённые рейтинги'
            },
            onChange: function () {
                cache = {};
                Lampa.Storage.set('kp_rating_v100', cache);
                Lampa.Noty.show('Кэш КП очищен');
            }
        });
    }

    function start() {

        if (!document.getElementById('kp-ratings-v100-style')) {
            var style = document.createElement('style');
            style.id = 'kp-ratings-v100-style';
            style.textContent =
                '.kp-rating-v100{' +
                    'display:inline-flex!important;' +
                    'align-items:center!important;' +
                    'vertical-align:middle!important;' +
                    'box-sizing:border-box!important;' +
                    'min-height:2.05em!important;' +
                    'margin:0 .45em 0 0!important;' +
                    'padding:.34em .62em!important;' +
                    'gap:.28em!important;' +
                    'border-radius:.55em!important;' +
                    'background:rgba(255,255,255,.10)!important;' +
                    'border:1px solid rgba(255,255,255,.14)!important;' +
                    'color:#fff!important;' +
                    'font-size:1em!important;' +
                    'font-weight:600!important;' +
                    'line-height:1!important;' +
                    'box-shadow:0 2px 8px rgba(0,0,0,.16)!important;' +
                '}' +
                '.kp-rating-v100__icon{' +
                    'font-size:1.05em!important;' +
                    'line-height:1!important;' +
                '}' +
                '.kp-rating-v100__value{' +
                    'font-size:1em!important;' +
                    'font-weight:700!important;' +
                '}' +
                '.kp-rating-v100__label{' +
                    'font-size:.78em!important;' +
                    'opacity:.72!important;' +
                    'font-weight:600!important;' +
                '}';
            document.head.appendChild(style);
        }
        settings();

        Lampa.Listener.follow('full', function (e) {
            if (!e || e.type !== 'complite') return;
            if (!cfg.enabled) return;

            var render = e.object.activity.render();

            if ($('.kp-rating-v100', render).length) return;

            var movie = e.data && e.data.movie;

            if (!movie) return;

            inject(movie);
        });

        console.log('[KP Ratings] v1.0.1 started');
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
