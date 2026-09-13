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

    // Безопасная иконка «Новинки».
    // Анимированный SVG преобразован в компактный PNG-кадр,
    // чтобы сложная SVG/SMIL-разметка не могла ломать загрузку плагина.
    var NEW_ICON = '<img class="ldg-new-icon" src="data:image/png;base64,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' alt="" aria-hidden="true">';

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
                        width: '1.05em',
                        height: '1.05em',
                        'vertical-align': '-0.16em',
                        'margin-right': '0.28em',
                        'flex-shrink': '0',
                        'object-fit': 'contain'
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
        if (window.__lampa_discovery_v14_ready) return;
        window.__lampa_discovery_v14_ready = true;

        if (!Lampa.Component || typeof Lampa.Component.add !== 'function') {
            console.error('[Lampa Discovery v14] Component API unavailable');
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
        console.log('[Lampa Discovery v14] Discovery rows ready');
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
