(function () {
    'use strict';

    // =========================================================
    // LAMPA DISCOVERY v5
    // Native Lampa Main -> Line -> Card architecture.
    // Genre row is horizontal and uses the real Lampa Card.
    // TMDB: Russian localization + high rating + minimum votes.
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
        { id: 12,  title: 'Приключения' }
    ];

    function getTMDB() {
        return Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
    }

    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    // Получаем один реальный TMDB фильм для изображения жанровой карточки.
    // Саму карточку создаёт Lampa.Maker.make('Card'), поэтому внешний вид
    // остаётся полностью штатным для Lampa.
    function loadGenreCard(genre, callback) {
        var source = getTMDB();

        if (!source || typeof source.get !== 'function') {
            callback({
                id: genre.id,
                title: genre.title,
                type: 'movie',
                source: 'tmdb'
            });
            return;
        }

        var url = 'discover/movie?with_genres=' + genre.id +
            '&sort_by=vote_average.desc' +
            '&vote_count.gte=' + MIN_VOTES +
            '&primary_release_date.lte=' + today();

        source.get(url, {
            page: 1,
            langs: 'ru-RU'
        }, function (json) {
            var results = json && Array.isArray(json.results) ? json.results : [];
            var item = results.length ? results[0] : null;

            callback({
                id: genre.id,
                title: genre.title,
                type: 'movie',
                source: 'tmdb',
                poster_path: item && item.poster_path ? item.poster_path : null,
                backdrop_path: item && item.backdrop_path ? item.backdrop_path : null,
                vote_average: item && item.vote_average ? item.vote_average : 0,
                vote_count: item && item.vote_count ? item.vote_count : 0,
                params: {
                    // Важно: не меняем стиль карточки. Используется штатный Card.
                }
            });
        }, function () {
            callback({
                id: genre.id,
                title: genre.title,
                type: 'movie',
                source: 'tmdb'
            });
        });
    }

    function loadGenres(callback) {
        var result = new Array(GENRES.length);
        var left = GENRES.length;

        GENRES.forEach(function (genre, index) {
            loadGenreCard(genre, function (data) {
                result[index] = data;
                left--;
                if (left === 0) callback(result);
            });
        });
    }

    // Открываем стандартную Lampa category_full напрямую.
    // Не используем Router.category_full, потому что он может выбросить
    // sort_by/url при нормализации параметров.
    function openGenre(data) {
        if (!Lampa.Activity || typeof Lampa.Activity.push !== 'function') return;

        Lampa.Activity.push({
            url: 'movie',
            component: 'category_full',
            source: 'tmdb',
            page: 1,
            title: data.title,
            genres: String(data.id),
            sort_by: 'vote_average.desc',
            langs: 'ru-RU',
            filter: {
                'vote_count.gte': MIN_VOTES,
                'primary_release_date.lte': today()
            }
        });
    }

    // =========================================================
    // Native Lampa Main
    // =========================================================

    function component(object) {
        if (!Lampa.Maker || typeof Lampa.Maker.make !== 'function') {
            return null;
        }

        var main = Lampa.Maker.make('Main', object);

        main.use({
            onCreate: function () {
                var self = this;

                loadGenres(function (genres) {
                    // Именно массив строк для Main -> Line.
                    // Никаких своих grid/flex/overflow-контейнеров.
                    self.build([
                        {
                            title: 'Жанры',
                            results: genres
                        }
                    ]);
                });
            },

            // Main -> Line -> Card. Это штатная модульная цепочка Lampa.
            onInstance: function (line) {
                line.use({
                    onInstance: function (card, cardData) {
                        card.use({
                            onlyEnter: function () {
                                openGenre(cardData);
                            }
                        });
                    }
                });
            }
        });

        return main;
    }

    // =========================================================
    // Menu
    // =========================================================

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

        // Современный Lampa API.
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

        // Совместимость со старыми сборками.
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
        if (window.__lampa_discovery_v5_ready) return;
        window.__lampa_discovery_v5_ready = true;

        if (!Lampa.Component || typeof Lampa.Component.add !== 'function') {
            console.error('[Lampa Discovery v5] Component API unavailable');
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
        console.log('[Lampa Discovery v5] Native Main -> Line -> Card ready');
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
