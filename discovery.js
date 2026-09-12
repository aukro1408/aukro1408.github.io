(function () {
    'use strict';

    // =========================================================
    // LAMPA DISCOVERY v6
    // Native Lampa Main -> Line -> Card.
    // Несколько горизонтальных рядов как на главной Lampa.
    // TMDB: русская локализация + нормальные фильтры рейтинга.
    // =========================================================

    var COMPONENT = 'lampa_discovery_genres';
    var MENU_ADDED = false;
    var MIN_VOTES = 500;

    var GENRES = [
        { id: 27,  title: 'Ужасы' },
        { id: 878, title: 'Фантастика' },
        { id: 53,  title: 'Триллеры' },
        { id: 35,  title: 'Комедии' },
        { id: 18,  title: 'Драмы' },
        { id: 28,  title: 'Боевики' },
        { id: 14,  title: 'Фэнтези' },
        { id: 12,  title: 'Приключения' },
        { id: 9648, title: 'Детективы' },
        { id: 16,  title: 'Мультфильмы' }
    ];

    function getTMDB() {
        return Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
    }

    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    function cleanResults(json) {
        var results = json && Array.isArray(json.results) ? json.results : [];
        return results.filter(function (item) {
            return item && (item.poster_path || item.backdrop_path) &&
                (item.title || item.name);
        });
    }

    function tmdbGet(url, callback, page) {
        var source = getTMDB();
        if (!source || typeof source.get !== 'function') {
            callback({ results: [], total_pages: 0, total_results: 0 });
            return;
        }

        source.get(url, {
            page: page || 1,
            langs: 'ru-RU'
        }, function (json) {
            callback({
                results: cleanResults(json),
                total_pages: json && json.total_pages ? json.total_pages : 0,
                total_results: json && json.total_results ? json.total_results : 0
            });
        }, function () {
            callback({ results: [], total_pages: 0, total_results: 0 });
        });
    }

    // ---------------------------------------------------------
    // Обычные горизонтальные ряды фильмов.
    // ---------------------------------------------------------

    var ROWS = [
        {
            title: 'Для тебя',
            url: 'trending/movie/week',
            more: {
                url: 'trending/movie/week',
                title: 'Для тебя',
                sort_by: 'popularity.desc'
            }
        },
        {
            title: 'Новинки',
            url: 'discover/movie?sort_by=primary_release_date.desc&vote_count.gte=' + MIN_VOTES +
                '&primary_release_date.lte=' + today(),
            more: {
                url: 'discover/movie',
                title: 'Новинки',
                sort_by: 'primary_release_date.desc',
                filter: {
                    'vote_count.gte': MIN_VOTES,
                    'primary_release_date.lte': today()
                }
            }
        },
        {
            title: 'Высокий рейтинг',
            url: 'discover/movie?sort_by=vote_average.desc&vote_count.gte=' + MIN_VOTES +
                '&primary_release_date.lte=' + today(),
            more: {
                url: 'discover/movie',
                title: 'Высокий рейтинг',
                sort_by: 'vote_average.desc',
                filter: {
                    'vote_count.gte': MIN_VOTES,
                    'primary_release_date.lte': today()
                }
            }
        },
        {
            title: 'Сейчас смотрят',
            url: 'discover/movie?sort_by=popularity.desc&vote_count.gte=100&primary_release_date.lte=' + today(),
            more: {
                url: 'discover/movie',
                title: 'Сейчас смотрят',
                sort_by: 'popularity.desc',
                filter: {
                    'vote_count.gte': 100,
                    'primary_release_date.lte': today()
                }
            }
        },
        {
            title: 'Фильмы 2026',
            url: 'discover/movie?primary_release_year=2026&sort_by=popularity.desc&vote_count.gte=50',
            more: {
                url: 'discover/movie',
                title: 'Фильмы 2026',
                sort_by: 'popularity.desc',
                filter: {
                    'primary_release_year': 2026,
                    'vote_count.gte': 50
                }
            }
        }
    ];

    function loadMovieRows(callback) {
        var rows = new Array(ROWS.length);
        var left = ROWS.length;

        ROWS.forEach(function (row, index) {
            tmdbGet(row.url, function (payload) {
                rows[index] = {
                    title: row.title,
                    results: payload.results,
                    total_pages: payload.total_pages,
                    total_results: payload.total_results,
                    source: 'tmdb',
                    page: 1,
                    url: row.url,
                    discovery_more: row.more
                };

                left--;
                if (left === 0) callback(rows);
            });
        });
    }

    // ---------------------------------------------------------
    // Жанры.
    // Для каждого жанра берём отдельный постер TMDB.
    // Выбираем первый постер, который ещё не использовался,
    // поэтому все карточки жанров визуально разные.
    // ---------------------------------------------------------

    function loadGenreCard(genre, index, usedPosters, callback) {
        var url = 'discover/movie?with_genres=' + genre.id +
            '&sort_by=vote_average.desc' +
            '&vote_count.gte=' + MIN_VOTES +
            '&primary_release_date.lte=' + today();

        // Разные страницы дополнительно защищают от одинаковых первых
        // результатов, даже если TMDB отдаёт пересекающиеся подборки.
        var requestedPage = (index % 5) + 1;

        tmdbGet(url, function (payload) {
            var results = payload.results || [];
            var item = null;

            for (var i = 0; i < results.length; i++) {
                var candidate = results[(i + index) % results.length];
                var poster = candidate.poster_path;
                if (poster && !usedPosters[poster]) {
                    item = candidate;
                    usedPosters[poster] = true;
                    break;
                }
            }

            if (!item && results.length) item = results[index % results.length];

            callback({
                id: genre.id,
                title: genre.title,
                original_title: genre.title,
                type: 'movie',
                source: 'tmdb',
                poster_path: item ? item.poster_path : null,
                backdrop_path: item ? item.backdrop_path : null,
                vote_average: item && item.vote_average ? item.vote_average : 0,
                vote_count: item && item.vote_count ? item.vote_count : 0,
                discovery_genre: true,
                discovery_genre_id: genre.id,
                discovery_genre_title: genre.title
            });
        }, requestedPage);
    }

    function loadGenres(callback) {
        var result = new Array(GENRES.length);
        var usedPosters = {};
        var left = GENRES.length;

        GENRES.forEach(function (genre, index) {
            loadGenreCard(genre, index, usedPosters, function (data) {
                result[index] = data;
                left--;
                if (left === 0) callback(result);
            });
        });
    }

    function openGenre(data) {
        if (!Lampa.Activity || typeof Lampa.Activity.push !== 'function') return;

        Lampa.Activity.push({
            url: 'movie',
            component: 'category_full',
            source: 'tmdb',
            page: 1,
            title: data.discovery_genre_title || data.title,
            genres: String(data.discovery_genre_id || data.id),
            sort_by: 'vote_average.desc',
            langs: 'ru-RU',
            filter: {
                'vote_count.gte': MIN_VOTES,
                'primary_release_date.lte': today()
            }
        });
    }

    // ---------------------------------------------------------
    // Удиви меня — случайная подборка фильмов.
    // ---------------------------------------------------------

    function loadSurprise(callback) {
        var randomPage = Math.floor(Math.random() * 8) + 1;
        var url = 'discover/movie?sort_by=popularity.desc&vote_count.gte=100&primary_release_date.lte=' + today();

        tmdbGet(url, function (payload) {
            var results = payload.results || [];
            results.sort(function () { return Math.random() - 0.5; });

            callback({
                title: 'Удиви меня',
                results: results,
                total_pages: payload.total_pages,
                total_results: payload.total_results,
                source: 'tmdb',
                page: randomPage,
                url: url,
                discovery_more: {
                    url: 'discover/movie',
                    title: 'Удиви меня',
                    sort_by: 'popularity.desc',
                    filter: {
                        'vote_count.gte': 100,
                        'primary_release_date.lte': today()
                    }
                }
            });
        }, randomPage);
    }

    // ---------------------------------------------------------
    // Native Main.
    // Каждый объект Main строит штатный Lampa Line,
    // а Line создаёт штатные Lampa Card.
    // Никакого собственного grid/flex/scroll.
    // ---------------------------------------------------------

    function openRow(data) {
        if (!Lampa.Activity || typeof Lampa.Activity.push !== 'function' || !data) return;

        var more = data.discovery_more;
        if (!more) return;

        var activity = {
            url: more.url,
            component: 'category_full',
            source: 'tmdb',
            page: 1,
            title: more.title,
            sort_by: more.sort_by,
            langs: 'ru-RU'
        };

        if (more.filter) activity.filter = more.filter;

        Lampa.Activity.push(activity);
    }

    function component(object) {
        if (!Lampa.Maker || typeof Lampa.Maker.make !== 'function') return null;

        var main = Lampa.Maker.make('Main', object);

        main.use({
            onCreate: function () {
                var self = this;

                loadMovieRows(function (movieRows) {
                    loadGenres(function (genres) {
                        loadSurprise(function (surprise) {
                            // Жанры и Удиви меня идут после основных рядов.
                            movieRows.push({
                                title: 'Жанры',
                                results: genres,
                                total_pages: 1,
                                source: 'tmdb',
                                discovery_genres: true
                            });

                            movieRows.push(surprise);

                            self.build(movieRows.filter(function (row) {
                                return row && row.results && row.results.length;
                            }));
                        });
                    });
                });
            },

            onInstance: function (line, lineData) {
                line.use({
                    onMore: function (data) {
                        openRow(data);
                    },
                    onInstance: function (card, cardData) {
                        // Только для жанровых карточек меняем действие Enter.
                        // Сама карточка остаётся штатной Lampa Card.
                        if (cardData && cardData.discovery_genre) {
                            card.use({
                                onlyEnter: function () {
                                    openGenre(cardData);
                                }
                            });
                        }
                    }
                });
            }
        });

        return main;
    }

    // ---------------------------------------------------------
    // Menu
    // ---------------------------------------------------------

    function discoveryIcon() {
        return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.7"/>' +
            '<path d="m15.7 8.3-2.2 4.1-4.1 2.2 2.2-4.1 4.1-2.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>' +
        '</svg>';
    }

    function openDiscovery() {
        Lampa.Activity.push({
            url: '',
            title: 'Discovery',
            component: COMPONENT,
            page: 1
        });
    }

    function addMenu() {
        if (MENU_ADDED || !window.appready) return;

        if (Lampa.Menu && typeof Lampa.Menu.addButton === 'function') {
            var button = Lampa.Menu.addButton(
                discoveryIcon(),
                'Discovery',
                openDiscovery
            );

            if (button && button.addClass) button.addClass('ldg-menu-item');
            MENU_ADDED = true;
            return;
        }

        var list = $('.menu .menu__list').eq(0);
        if (!list.length) return;
        if (list.find('.ldg-menu-item').length) {
            MENU_ADDED = true;
            return;
        }

        var fallback = $(
            '<li class="menu__item selector ldg-menu-item">' +
                '<div class="menu__ico">' + discoveryIcon() + '</div>' +
                '<div class="menu__text">Discovery</div>' +
            '</li>'
        );

        fallback.on('hover:enter', openDiscovery);
        list.append(fallback);
        MENU_ADDED = true;
    }

    function startPlugin() {
        if (window.__lampa_discovery_v6_ready) return;
        window.__lampa_discovery_v6_ready = true;

        if (!Lampa.Component || typeof Lampa.Component.add !== 'function') {
            console.error('[Lampa Discovery v6] Component API unavailable');
            return;
        }

        Lampa.Component.add(COMPONENT, component);

        if (typeof MutationObserver !== 'undefined' && document.body) {
            var observer = new MutationObserver(function () {
                addMenu();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        addMenu();
        console.log('[Lampa Discovery v6] Discovery rows ready');
    }

    if (typeof Lampa === 'undefined') {
        setTimeout(function waitLampa() {
            if (typeof Lampa !== 'undefined') startPlugin();
            else setTimeout(waitLampa, 500);
        }, 500);
    } else if (window.appready) {
        startPlugin();
    } else if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    } else {
        startPlugin();
    }
})();
