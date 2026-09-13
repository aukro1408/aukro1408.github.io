(function () {
    'use strict';

    // =========================================================
    // LAMPA DISCOVERY v11
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
            title: '⭐ Высокий рейтинг',
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
            title: '👀 Сейчас смотрят',
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
            title: '🎬 Фильмы 2026',
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

    function getFavorite(type) {
        try {
            if (Lampa.Favorite && typeof Lampa.Favorite.get === 'function') {
                var list = Lampa.Favorite.get({ type: type });
                return Array.isArray(list) ? list : [];
            }
        } catch (e) {}
        return [];
    }

    function cardGenres(card) {
        var ids = [];
        if (!card) return ids;
        if (Array.isArray(card.genre_ids)) ids = ids.concat(card.genre_ids);
        if (Array.isArray(card.genres)) card.genres.forEach(function (g) {
            var id = typeof g === 'object' ? g.id : g;
            if (id !== undefined && id !== null) ids.push(Number(id));
        });
        return ids.filter(function (id, index, arr) { return id && arr.indexOf(id) === index; });
    }

    function buildTaste() {
        var weights = {}, total = 0;
        [
            { type: 'like', weight: 5 },
            { type: 'book', weight: 4 },
            { type: 'wath', weight: 3 },
            { type: 'history', weight: 1 }
        ].forEach(function (group) {
            getFavorite(group.type).forEach(function (card) {
                total++;
                cardGenres(card).forEach(function (id) { weights[id] = (weights[id] || 0) + group.weight; });
            });
        });
        var sorted = Object.keys(weights).map(function (id) {
            return { id: Number(id), weight: weights[id] };
        }).sort(function (a, b) { return b.weight - a.weight; });
        return { genres: sorted.slice(0, 3).map(function (x) { return x.id; }), count: total };
    }

    function personalizedRow(taste) {
        if (!taste.genres.length) return {
            title: '🔥 Для тебя', url: 'trending/movie/week',
            more: { url: 'trending/movie/week', title: 'Для тебя', sort_by: 'popularity.desc' }
        };
        var genres = taste.genres.join(',');
        var url = 'discover/movie?with_genres=' + genres + '&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.lte=' + today();
        return {
            title: '🔥 Для тебя', url: url,
            more: { url: 'discover/movie', title: 'Для тебя', genres: genres, sort_by: 'vote_average.desc',
                filter: { 'vote_count.gte': 100, 'primary_release_date.lte': today() } }
        };
    }

    function surpriseRow(taste) {
        var preferred = taste.genres || [];
        var candidates = GENRES.map(function (g) { return g.id; }).filter(function (id) { return preferred.indexOf(id) === -1; });
        candidates.sort(function () { return Math.random() - 0.5; });
        var selected = candidates.slice(0, preferred.length ? 2 : 3);
        var url = 'discover/movie?sort_by=vote_average.desc&vote_count.gte=500&primary_release_date.lte=' + today();
        if (selected.length) url += '&with_genres=' + selected.join(',');
        return {
            title: '🎲 Удиви меня', url: url,
            more: { url: 'discover/movie', title: 'Удиви меня', genres: selected.join(','), sort_by: 'vote_average.desc',
                filter: { 'vote_count.gte': 500, 'primary_release_date.lte': today() } }
        };
    }

    function loadPersonalRows(callback) {
        var taste = buildTaste();
        var personal = personalizedRow(taste);
        var surprise = surpriseRow(taste);
        var rows = [], configs = [personal].concat(ROWS), left = configs.length;
        configs.forEach(function (row, index) {
            tmdbGet(row.url, function (payload) {
                rows[index] = { title: row.title, results: payload.results, total_pages: payload.total_pages,
                    total_results: payload.total_results, source: 'tmdb', page: 1, url: row.url, discovery_more: row.more };
                left--;
                if (!left) {
                    tmdbGet(surprise.url, function (sp) {
                        rows.push({ title: surprise.title, results: sp.results, total_pages: sp.total_pages,
                            total_results: sp.total_results, source: 'tmdb', page: 1, url: surprise.url, discovery_more: surprise.more });
                        callback(rows.filter(function (r) { return r && r.results && r.results.length; }));
                    });
                }
            });
        });
    }

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
                title: '🎲 Удиви меня',
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
        if (more.genres) activity.genres = more.genres;

        Lampa.Activity.push(activity);
    }

    // ---------------------------------------------------------
    // Иконка «Новинки».
    // Используем переданный SVG, но красим его в красный цвет.
    // SVG добавляется только в заголовок строки — штатные карточки,
    // горизонтальный скролл и остальная механика Lampa не меняются.
    // ---------------------------------------------------------

    var NEW_ICON = '<svg class="ldg-new-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">' +
        '<title>wind-toy</title>' +
        '<path fill="#e53935" d="M20.27,4.74a4.93,4.93,0,0,1,1.52,4.61,5.32,5.32,0,0,1-4.1,4.51,5.12,5.12,0,0,1-5.2-1.5,5.53,5.53,0,0,0,6.13-1.48A5.66,5.66,0,0,0,20.27,4.74ZM12.32,11.53a5.49,5.49,0,0,0-1.47-6.2A5.57,5.57,0,0,0,4.71,3.72,5.17,5.17,0,0,1,9.53,2.2,5.52,5.52,0,0,1,13.9,6.45,5.28,5.28,0,0,1,12.32,11.53ZM19.2,20.29a4.92,4.92,0,0,1-4.72,1.49,5.32,5.32,0,0,1-4.34-4.05A5.2,5.2,0,0,1,11.6,12.5a5.6,5.6,0,0,0,1.51,6.13A5.63,5.63,0,0,0,19.2,20.29ZM3.79,19.38A5.18,5.18,0,0,1,2.32,14a5.3,5.3,0,0,1,4.59-4,5,5,0,0,1,4.58,1.61,5.55,5.55,0,0,0-6.32,1.69A5.46,5.46,0,0,0,3.79,19.38ZM12.23,12a5.11,5.11,0,0,0,3.66-5,5.75,5.75,0,0,0-3.18-6,5,5,0,0,1,4.42,2.3,5.21,5.21,0,0,1,.24,5.92A5.4,5.4,0,0,1,12.23,12ZM11.76,12a5.18,5.18,0,0,0-3.68,5.09,5.58,5.58,0,0,0,3.19,5.79c-1,.35-2.9-.46-4-1.68A5.51,5.51,0,0,1,11.76,12ZM23,12.63a5.07,5.07,0,0,1-2.35,4.52,5.23,5.23,0,0,1-5.91.2,5.24,5.24,0,0,1-2.67-4.77,5.51,5.51,0,0,0,5.45,3.33A5.52,5.52,0,0,0,23,12.63ZM1,11.23a5,5,0,0,1,2.49-4.5,5.23,5.23,0,0,1,5.81-.06,5.3,5.3,0,0,1,2.61,4.74A5.56,5.56,0,0,0,6.56,8.06A5.71,5.71,0,0,0,1,11.23Z">' +
        '<animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>' +
        '</path></svg>';

    function decorateNewTitles() {
        try {
            $('.items-line__title').each(function () {
                var node = $(this);
                if (node.find('.ldg-new-icon').length) return;
                var text = $.trim(node.text());
                if (text === 'Новинки' || text === '🆕 Новинки') {
                    node.html(NEW_ICON + '<span class="ldg-new-title-text">Новинки</span>');
                    node.find('.ldg-new-icon').css({
                        display: 'inline-block',
                        width: '1em',
                        height: '1em',
                        'vertical-align': '-0.12em',
                        'margin-right': '0.28em',
                        'flex-shrink': '0'
                    });
                }
            });
        } catch (e) {}
    }

    function component(object) {
        if (!Lampa.Maker || typeof Lampa.Maker.make !== 'function') return null;

        var main = Lampa.Maker.make('Main', object);

        main.use({
            onCreate: function () {
                var self = this;

                loadPersonalRows(function (movieRows) {
                    loadGenres(function (genres) {
                        movieRows.push({
                            title: '🎭 Жанры',
                            results: genres,
                            total_pages: 1,
                            source: 'tmdb',
                            discovery_genres: true
                        });

                        self.build(movieRows.filter(function (row) {
                            return row && row.results && row.results.length;
                        }));
                        setTimeout(decorateNewTitles, 0);
                        setTimeout(decorateNewTitles, 250);
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

        if (typeof MutationObserver !== 'undefined' && main && main.render) {
            var titleObserver = new MutationObserver(function () {
                decorateNewTitles();
            });
            titleObserver.observe(document.body, { childList: true, subtree: true });
            setTimeout(decorateNewTitles, 300);
        }

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
        if (window.__lampa_discovery_v11_ready) return;
        window.__lampa_discovery_v11_ready = true;

        if (!Lampa.Component || typeof Lampa.Component.add !== 'function') {
            console.error('[Lampa Discovery v11] Component API unavailable');
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
        console.log('[Lampa Discovery v11] Discovery rows ready');
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
