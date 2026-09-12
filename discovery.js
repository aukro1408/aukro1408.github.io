(function () {
    'use strict';

    // =========================================================
    // LAMPA DISCOVERY v4
    // Native Lampa Main + native Lampa Card.
    // Genre cards are real Lampa cards in a horizontal row.
    // =========================================================

    var COMPONENT = 'lampa_discovery_genres';
    var MENU_ADDED = false;

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

    function tmdb() {
        return Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
    }

    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    // Берём для каждой категории реальный фильм TMDB с высоким рейтингом.
    // Его poster_path используется стандартной карточкой Lampa.
    function loadGenre(genre, callback) {
        var source = tmdb();

        if (!source || typeof source.get !== 'function') {
            callback({ id: genre.id, title: genre.title });
            return;
        }

        source.get(
            'discover/movie?with_genres=' + genre.id,
            {
                page: 1,
                sort_by: 'vote_average.desc',
                'vote_count.gte': 200,
                'primary_release_date.lte': today(),
                langs: 'ru-RU'
            },
            function (data) {
                var item = data && data.results && data.results.length ? data.results[0] : null;

                callback({
                    id: genre.id,
                    title: genre.title,
                    poster_path: item && item.poster_path ? item.poster_path : null,
                    backdrop_path: item && item.backdrop_path ? item.backdrop_path : null,
                    vote_average: item && item.vote_average ? item.vote_average : 0
                });
            },
            function () {
                callback({ id: genre.id, title: genre.title });
            }
        );
    }

    function loadGenres(done) {
        var result = [];
        var left = GENRES.length;

        GENRES.forEach(function (genre, index) {
            loadGenre(genre, function (data) {
                result[index] = data;
                left--;
                if (!left) done(result);
            });
        });
    }

    // Открываем обычную Lampa category_full напрямую, чтобы не терять
    // sort_by/filter на этапе Router.category_full.
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
                'vote_count.gte': 200,
                'primary_release_date.lte': today()
            }
        });
    }

    // =========================================================
    // Native Main
    // =========================================================

    function component(object) {
        // В Lampa 3.x Main создаётся через Maker.
        if (Lampa.Maker && typeof Lampa.Maker.make === 'function') {
            var main = Lampa.Maker.make('Main', object);

            main.use({
                onCreate: function () {
                    var self = this;
                    loadGenres(function (genres) {
                        self.build([
                            {
                                title: 'Жанры',
                                results: genres
                            }
                        ]);
                    });
                },

                onInstance: function (line, rowData) {
                    line.use({
                        onInstance: function (card, cardData) {
                            card.use({
                                onEnter: function () {
                                    openGenre(cardData);
                                }
                            });
                        }
                    });
                }
            });

            return main;
        }

        // Fallback для старых сборок Lampa.
        var legacy = new Lampa.InteractionMain(object);

        legacy.create = function () {
            var self = this;
            loadGenres(function (genres) {
                self.build({
                    title: 'Жанры',
                    results: genres
                });
            });
            return this.render();
        };

        legacy.cardRender = function (object, element, card) {
            card.onMenu = false;
            element.addEventListener('hover:enter', function () {
                openGenre(object);
            });
        };

        return legacy;
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

    function addMenu() {
        if (MENU_ADDED || !window.appready) return;

        // Используем родной Lampa.Menu в новых версиях.
        if (Lampa.Menu && typeof Lampa.Menu.addButton === 'function') {
            var button = Lampa.Menu.addButton(
                discoveryIcon(),
                'Discovery',
                function () {
                    Lampa.Activity.push({
                        url: '',
                        title: 'Discovery',
                        component: COMPONENT,
                        page: 1
                    });
                }
            );

            if (button && button.addClass) button.addClass('ldg-menu-item');
            MENU_ADDED = true;
            return;
        }

        // Fallback для старого API.
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

        fallback.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Discovery',
                component: COMPONENT,
                page: 1
            });
        });

        list.append(fallback);
        MENU_ADDED = true;
    }

    function startPlugin() {
        if (window.__lampa_discovery_native_ready) return;
        window.__lampa_discovery_native_ready = true;

        Lampa.Component.add(COMPONENT, component);

        var observer = new MutationObserver(function () {
            addMenu();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        addMenu();

        console.log('[Lampa Discovery] Native Main/Card ready');
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
