(function () {
    'use strict';

    if (window.kp_ratings_plugin_v105) return;
    window.kp_ratings_plugin_v105 = true;

    var NAME = 'KP Ratings';
    var SETTINGS = 'kp_ratings_settings_v105';

    var cfg = Object.assign({
        enabled: true,
        cache_days: 7,
        api: 'https://kinopoiskapiunofficial.tech/'
    }, Object.assign({},
        Lampa.Storage.get('kp_ratings_settings_v100', {}) || {},
        Lampa.Storage.get('kp_ratings_settings_v101', {}) || {},
        Lampa.Storage.get('kp_ratings_settings_v102', {}) || {},
        Lampa.Storage.get('kp_ratings_settings_v103', {}) || {},
        Lampa.Storage.get('kp_ratings_settings_v104', {}) || {},
        Lampa.Storage.get(SETTINGS, {}) || {}
    ));

    var cache = Lampa.Storage.cache('kp_rating_v105', 500, {});

    try {
        var oldCache100 = Lampa.Storage.cache('kp_rating_v100', 500, {});
        var oldCache101 = Lampa.Storage.cache('kp_rating_v101', 500, {});
        var oldCache102 = Lampa.Storage.cache('kp_rating_v102', 500, {});
        var oldCache103 = Lampa.Storage.cache('kp_rating_v103', 500, {});
        var oldCache104 = Lampa.Storage.cache('kp_rating_v105', 500, {});
        [oldCache100, oldCache101, oldCache102, oldCache103, oldCache104].forEach(function (oldCache) {
            Object.keys(oldCache || {}).forEach(function (key) {
                if (!cache[key] && oldCache[key]) cache[key] = oldCache[key];
            });
        });
    } catch (e) {}
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
            votes: arguments.length > 2 && arguments[2] !== null && arguments[2] !== undefined ?
                Number(arguments[2]) : 0,
            timestamp: Date.now()
        };

        cache[key] = item;
        Lampa.Storage.set('kp_rating_v105', cache);

        return item;
    }

    function getCache(key) {
        var item = cache[key];
        if (!item) return null;

        var ttl = Number(cfg.cache_days || 7) * 86400000;

        if (Date.now() - Number(item.timestamp || 0) > ttl) {
            delete cache[key];
            Lampa.Storage.set('kp_rating_v105', cache);
            return null;
        }

        return item;
    }

    function showRating(data) {
        if (!data || data.kp === null || data.kp === undefined) return;

        var rating = Number(data.kp);
        var votes = Number(data.votes || 0);

        if (isNaN(rating) || rating <= 0) return;

        var active = Lampa.Activity.active();
        var render = active && active.activity && active.activity.render();

        if (!render) return;

        $('.kp-rating-v105', render).remove();

        var value = rating.toFixed(1);
        var percent = Math.max(0, Math.min(100, rating * 10));

        var votesText = '';

        if (votes > 0) {
            votesText = String(Math.round(votes)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }

        var quality = rating >= 8 ? 'Отлично' :
            rating >= 7 ? 'Хорошо' :
            rating >= 6 ? 'Неплохо' :
            rating >= 5 ? 'Средне' : 'Низкая оценка';

        var block =
            '<div class="kp-rating-v105">' +
                '<div class="kp-rating-v105__top">' +
                    '<div class="kp-rating-v105__brand">' +
                        '<img class="kp-rating-v105__logo" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5NjAgOTYwIj4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiAjZjUwOwogICAgICAgIGZpbGwtcnVsZTogZXZlbm9kZDsKICAgICAgICBzdHJva2Utd2lkdGg6IDBweDsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzQ1Ljg2LDQ4MC4wNGMwLTM0LjEzLDE3LjEyLTYxLjQ0LDQ4LTYxLjQ0czQ4LDI3LjMxLDQ4LDYxLjQ0LTE3LjEyLDYxLjQ0LTQ3Ljk5LDYxLjQ0LTQ4LTI3LjMtNDgtNjEuNDRaTTM5My44Niw1MjQuNDRjMTIuMDEsMCwxNy4xMi0yMC40OCwxNy4xMi00NC4zNXMtNS4xNS00NC4zNS0xNy4xMi00NC4zNS0xNy4xMiwyMC40OC0xNy4xMiw0NC4zNWMtLjA0LDIzLjg3LDUuMTEsNDQuMzUsMTcuMTIsNDQuMzVaTTI2Ljk5LDQyMC4zNHYzMi40M2gxLjdsMjIuMjctMzIuNDNoMzAuODNsLTQxLjE0LDM3LjUyLDEuNywxLjcsNzUuNDMtMzkuMjZ2MjcuMzFsLTY2Ljg3LDIzLjg3djEuNjlsNjYuODctNS45NnYyNS42MWwtNjYuODctNS45NnYxLjdsNjYuODcsMjMuODd2MjcuMzFsLTc1LjQzLTM5LjI3LTEuNywxLjcsNDEuMTQsMzcuNTJoLTMwLjgzbC0yMi4yNy0zMi40M2gtMS43djMyLjQzSDQuNzF2LTExOS40NGgyMi4yN3YuMDhaTTEzOC40NSw0MjAuMzRoMjkuMTRsLTEuNyw3MS42NmgxLjdsMzQuMjgtNzEuNjZoMjUuNzJ2MTE5LjQ0aC0yOS4xM2wxLjctNzEuNjZoLTEuN2wtMzQuMyw3MS42N2gtMjUuNzJ2LTExOS40NWgwWk0yNzcuMjksNDIwLjM0aC0yOS4xM3YxMTkuNDRoMjkuMTN2LTUyLjkyaDIzLjk4djUyLjkyaDI5LjEzdi0xMTkuNDRoLTI5LjEzdjQ2LjA5aC0yMy45OHYtNDYuMDlaTTUzOS41Niw0MjAuMzRoLTgyLjI1djExOS40NGgyOS4xNHYtOTguOTdoMjMuOTh2OTguOTdoMjkuMTN2LTExOS40NFpNNTU0Ljk4LDQ4MC4wNGMwLTM0LjEzLDE3LjEyLTYxLjQ0LDQ4LTYxLjQ0czQ4LDI3LjMxLDQ4LDYxLjQ0LTE3LjEyLDYxLjQ0LTQ4LDYxLjQ0LTQ4LTI3LjMtNDgtNjEuNDRaTTYwMi45OCw1MjQuNDRjMTIuMDEsMCwxNy4xMi0yMC40OCwxNy4xMi00NC4zNXMtNS4xNS00NC4zNS0xNy4xMi00NC4zNS0xNy4xMiwyMC40OC0xNy4xMiw0NC4zNSw1LjExLDQ0LjM1LDE3LjEyLDQ0LjM1Wk02OTUuNTMsNDIwLjM0aC0yOS4xM3YxMTkuNDRoMjUuNzJsMzQuMjktNzEuNjZoMS43bC0xLjcsNzEuNjZoMjkuMTN2LTExOS40NGgtMjUuNzJsLTM0LjI5LDcxLjY2aC0xLjdsMS43LTcxLjY2Wk04MzIuNzEsNDk4LjgzbDI3LjQzLDMuMzljLTUuMTUsMjMuODgtMTcuMTIsMzkuMjYtNDIuNjgsMzkuMjYtMzAuODMsMC00Ni40Ni0yNy4zLTQ2LjQ2LTYxLjQ0czE1LjU5LTYxLjQ0LDQ2LjQ2LTYxLjQ0YzI1LjAyLDAsMzcuNTMsMTUuMzUsNDIuNjgsMzcuNTNsLTI3LjQzLDYuODJjLTEuNy0xMS45Ni02LjY5LTI3LjMtMTUuMjYtMjcuMy0xMC4yNiwwLTE1LjU5LDIwLjQ4LTE1LjU5LDQ0LjM1czUuMzIsNDQuMzUsMTUuNTksNDQuMzVjOC40LjA5LDEzLjUtMTMuNTcsMTUuMjYtMjUuNTNaTTkwMS4yOCw0MjAuMzVoLTI3LjQzdjExOS40NGgyNy40M3YtNTIuOTJoMS43bDIwLjU3LDUyLjkyaDMxLjcxbC0zMC4wMS02MS40NCwyOS4xMy01OC4wMWgtMjkuMTNsLTIyLjI3LDUyLjkyaC0xLjd2LTUyLjkyaDBaIi8+Cjwvc3ZnPg==" alt="КиноПоиск">' +
                    '</div>' +
                    '<span class="kp-rating-v105__quality">' + quality + '</span>' +
                '</div>' +
                '<div class="kp-rating-v105__main">' +
                    '<div class="kp-rating-v105__score">' +
                        '<span>' + value + '</span>' +
                        '<small>/10</small>' +
                    '</div>' +
                    '<div class="kp-rating-v105__votes">' +
                        (votesText ?
                            '<strong>' + votesText + '</strong><span>голосов</span>' :
                            '<span>рейтинг пользователей</span>') +
                    '</div>' +
                '</div>' +
                '<div class="kp-rating-v105__bar">' +
                    '<i style="width:' + percent + '%"></i>' +
                '</div>' +
            '</div>';

        var info = $('.info__rate', render);

        if (info.length) {
            info.after(block);
            return;
        }

        var rates = $('.full-start-new__rates', render);

        if (!rates.length) rates = $('.full-start__rates', render);

        if (rates.length) {
            rates.after(block);
            return;
        }

        var details = $('.full-start-new__details', render);

        if (!details.length) details = $('.full-start__details', render);

        if (details.length) {
            details.prepend(block);
            return;
        }

        $(render).append(block);
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
                    var kp = data && data.ratingKinopoisk;
                    var ratingObject = data && data.ratingKinopoisk;
                    var votes = data && (
                        data.ratingKinopoiskVoteCount ||
                        data.ratingKinopoiskVotes ||
                        data.ratingKinopoiskVoteCountTotal ||
                        (ratingObject && typeof ratingObject === 'object' && (ratingObject.voteCount || ratingObject.votes)) ||
                        data.voteCount ||
                        0
                    );

                    if (ratingObject && typeof ratingObject === 'object') {
                        kp = ratingObject.value || ratingObject.rating || ratingObject.rate;
                    }

                    if (kp === undefined || kp === null) {
                        finish(saveRating(key, 0, 0));
                        return;
                    }

                    finish(saveRating(key, kp, votes));
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
                        finish(saveRating(key, 0, 0));
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
            component: 'kp_ratings_v105',
            name: NAME,
            icon:
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ' +
                'viewBox="0 0 24 24" fill="none">' +
                '<path d="M12 3.5l2.65 5.37 5.92.86-4.28 4.17 1.01 5.9L12 17.02l-5.3 2.78 1.01-5.9L3.43 9.73l5.92-.86L12 3.5z" ' +
                'stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
                '</svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'kp_ratings_v105',
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
            component: 'kp_ratings_v105',
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
            component: 'kp_ratings_v105',
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
                Lampa.Storage.set('kp_rating_v105', cache);
                Lampa.Noty.show('Кэш КП очищен');
            }
        });
    }

    function start() {

        if (!document.getElementById('kp-ratings-v105-style')) {
            var style = document.createElement('style');
            style.id = 'kp-ratings-v105-style';
            style.textContent =
                '.kp-rating-v105{' +
                    'display:inline-block!important;' +
                    'width:calc(50% - .55em)!important;' +
                    'box-sizing:border-box!important;' +
                    'margin:.75em 0 .7em!important;' +
                    'padding:.75em .9em .72em!important;' +
                    'border-radius:.85em!important;' +
                    'background:linear-gradient(135deg,rgba(38,32,18,.78),rgba(20,20,20,.94))!important;' +
                    'border:1px solid rgba(245,180,45,.34)!important;' +
                    'box-shadow:0 5px 18px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.05)!important;' +
                    'color:#fff!important;' +
                    'font-size:1em!important;' +
                'vertical-align:top!important;' +
                '}' +
                '.kp-rating-v105__top{' +
                    'display:flex!important;' +
                    'align-items:center!important;' +
                    'justify-content:space-between!important;' +
                    'gap:.5em!important;' +
                    'margin-bottom:.25em!important;' +
                '}' +
                '.kp-rating-v105__brand{' +
                    'display:flex!important;' +
                    'align-items:center!important;' +
                    'height:1.15em!important;' +
                '}' +
                '.kp-rating-v105__logo{' +
                    'display:block!important;' +
                    'width:7.2em!important;' +
                    'height:1.05em!important;' +
                    'object-fit:contain!important;' +
                    'object-position:left center!important;' +
                    'filter:drop-shadow(0 0 5px rgba(255,85,0,.16))!important;' +
                '}' +
                '.kp-rating-v105__quality{' +
                    'font-size:.68em!important;' +
                    'font-weight:600!important;' +
                    'color:rgba(255,255,255,.55)!important;' +
                '}' +
                '.kp-rating-v105__main{' +
                    'display:flex!important;' +
                    'align-items:center!important;' +
                    'justify-content:flex-start!important;' +
                    'gap:1.15em!important;' +
                '}' +
                '.kp-rating-v105__score{' +
                    'display:flex!important;' +
                    'align-items:baseline!important;' +
                    'white-space:nowrap!important;' +
                '}' +
                '.kp-rating-v105__score span{' +
                    'font-size:2em!important;' +
                    'font-weight:800!important;' +
                    'letter-spacing:-.035em!important;' +
                    'line-height:1!important;' +
                '}' +
                '.kp-rating-v105__score small{' +
                    'margin-left:.18em!important;' +
                    'font-size:.62em!important;' +
                    'font-weight:500!important;' +
                    'color:rgba(255,255,255,.42)!important;' +
                '}' +
                '.kp-rating-v105__votes{' +
                    'display:flex!important;' +
                    'flex-direction:column!important;' +
                    'line-height:1.15!important;' +
                '}' +
                '.kp-rating-v105__votes strong{' +
                    'font-size:.95em!important;' +
                    'font-weight:700!important;' +
                    'color:#fff!important;' +
                '}' +
                '.kp-rating-v105__votes span{' +
                    'margin-top:.16em!important;' +
                    'font-size:.62em!important;' +
                    'color:rgba(255,255,255,.52)!important;' +
                    'white-space:nowrap!important;' +
                '}' +
                '.kp-rating-v105__bar{' +
                    'height:3px!important;' +
                    'margin-top:.65em!important;' +
                    'overflow:hidden!important;' +
                    'border-radius:99px!important;' +
                    'background:rgba(255,255,255,.10)!important;' +
                '}' +
                '.kp-rating-v105__bar i{' +
                    'display:block!important;' +
                    'height:100%!important;' +
                    'border-radius:99px!important;' +
                    'background:linear-gradient(90deg,#d99419,#ffd35a)!important;' +
                    'box-shadow:0 0 8px rgba(245,184,46,.38)!important;' +
                '}';
            document.head.appendChild(style);
        }
        settings();

        Lampa.Listener.follow('full', function (e) {
            if (!e || e.type !== 'complite') return;
            if (!cfg.enabled) return;

            var render = e.object.activity.render();

            if ($('.kp-rating-v105', render).length) return;

            var movie = e.data && e.data.movie;

            if (!movie) return;

            inject(movie);
        });

        console.log('[KP Ratings] v1.0.5 started');
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
