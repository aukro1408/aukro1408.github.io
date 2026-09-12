(function () {
    'use strict';

    // =========================================================
    // LAMPA DISCOVERY — GENRES TEST
    // Test plugin: image-based genre cards + TMDB genre pages
    // =========================================================

    var COMPONENT = 'lampa_discovery_genres';
    var MENU_ADDED = false;

    var GENRES = [
        { id: 27,  title: 'Ужасы',       query: 'horror' },
        { id: 878, title: 'Фантастика', query: 'science fiction' },
        { id: 53,  title: 'Триллеры',    query: 'thriller' },
        { id: 35,  title: 'Комедии',     query: 'comedy' },
        { id: 18,  title: 'Драмы',       query: 'drama' },
        { id: 28,  title: 'Боевики',     query: 'action' },
        { id: 14,  title: 'Фэнтези',     query: 'fantasy' },
        { id: 12,  title: 'Приключения', query: 'adventure' }
    ];

    var network = new Lampa.Reguest();

    function tmdb() {
        return Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
    }

    // ---------------------------------------------------------
    // Genre image
    // ---------------------------------------------------------

    function loadGenreImage(genre, callback) {
        var source = tmdb();

        if (!source || typeof source.get !== 'function') {
            callback(null);
            return;
        }

        source.get(
            'discover/movie?with_genres=' + genre.id,
            {
                sort_by: 'popularity.desc',
                page: 1,
                langs: 'ru-RU'
            },
            function (data) {
                var item = data && data.results && data.results.length
                    ? data.results[0]
                    : null;

                if (item && item.backdrop_path) {
                    callback(item.backdrop_path);
                } else {
                    callback(null);
                }
            },
            function () {
                callback(null);
            }
        );
    }

    // ---------------------------------------------------------
    // Genre card
    // ---------------------------------------------------------

    function GenreCard(data) {
        this.data = data;

        this.build = function () {
            this.item = Lampa.Template.js('lampa_discovery_genre');
            this.img = this.item.find('.ldg-card__img');
            this.title = this.item.find('.ldg-card__title');

            this.title.text(data.title);
            this.item.addEventListener('visible', this.visible.bind(this));
        };

        this.visible = function () {
            if (data.backdrop_path) {
                this.img.src = Lampa.Api.img(data.backdrop_path, 'w500');
            } else {
                this.img.src = './img/img_load.svg';
            }
        };

        this.create = function () {
            this.build();

            this.item.addEventListener('hover:enter', function () {
                openGenre(data);
            });

            this.item.addEventListener('hover:focus', function () {
                if (this.item) this.item.classList.add('ldg-card--focus');
            }.bind(this));

            // Не перехватываем touch-жесты.
            // Скроллинг оставляем полностью на стандартной навигации Lampa.
        };

        this.destroy = function () {
            if (this.img) {
                this.img.onload = function () {};
                this.img.onerror = function () {};
                this.img.src = '';
            }
            if (this.item) this.item.remove();
            this.item = null;
            this.img = null;
        };

        this.render = function (js) {
            return js ? this.item : $(this.item);
        };
    }

    // ---------------------------------------------------------
    // Open full genre page
    // ---------------------------------------------------------

    function openGenre(data) {
        if (!Lampa.Activity || typeof Lampa.Activity.push !== 'function') return;

        Lampa.Activity.push({
            url: 'movie',
            component: 'category_full',
            source: 'tmdb',
            page: 1,
            title: data.title,
            genres: String(data.id),
            sort_by: 'primary_release_date.desc',
            langs: 'ru-RU'
        });
    }

    // ---------------------------------------------------------
    // Load all genre images
    // ---------------------------------------------------------

    function loadGenres(done) {
        var result = [];
        var left = GENRES.length;

        GENRES.forEach(function (genre, index) {
            loadGenreImage(genre, function (backdrop) {
                result[index] = {
                    id: genre.id,
                    title: genre.title,
                    backdrop_path: backdrop
                };

                left--;
                if (!left) done(result);
            });
        });
    }

    // ---------------------------------------------------------
    // Main component
    // ---------------------------------------------------------

    function component(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function () {
            var self = this;

            this.activity.loader(true);

            loadGenres(function (data) {
                self.build({
                    results: data,
                    total_pages: 1,
                    page: 1,
                    cardClass: function (elem, param) {
                        return new GenreCard(elem, param);
                    }
                });

                try {
                    comp.render().find('.category-full').addClass('mapping--grid cols--4');
                } catch (e) {}

                self.activity.loader(false);
            });

            return this.render();
        };

        comp.cardRender = function (object, element, card) {
            card.onMenu = false;
        };

        return comp;
    }

    // ---------------------------------------------------------
    // Menu item
    // ---------------------------------------------------------

    function addMenu() {
        if (MENU_ADDED) return;
        if (!window.appready) return;
        if (!Lampa.Component || !Lampa.Component.add) return;

        var list = $('.menu .menu__list').eq(0);
        if (!list.length) return;

        if (list.find('.ldg-menu-item').length) {
            MENU_ADDED = true;
            return;
        }

        var button = $(
            '<li class="menu__item selector ldg-menu-item">' +
                '<div class="menu__ico">' +
                    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
                        '<path d="M4 5.5C4 4.67 4.67 4 5.5 4h13C19.33 4 20 4.67 20 5.5v13c0 .83-.67 1.5-1.5 1.5h-13C4.67 20 4 19.33 4 18.5v-13Z" stroke="currentColor" stroke-width="1.7"/>' +
                        '<path d="m7.5 16 3.1-4 2.4 2.8 1.8-2.2 2.7 3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
                        '<circle cx="9" cy="8.5" r="1.2" fill="currentColor"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">Жанры</div>' +
            '</li>'
        );

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Жанры',
                component: COMPONENT,
                page: 1
            });
        });

        list.append(button);
        MENU_ADDED = true;
    }

    // ---------------------------------------------------------
    // Styles
    // ---------------------------------------------------------

    function addStyle() {
        if (document.getElementById('lampa-discovery-genres-style')) return;

        var style = document.createElement('style');
        style.id = 'lampa-discovery-genres-style';
        style.textContent = `
            .ldg-card {
                position:relative;
                overflow:hidden;
                border-radius:1em;
                background:#111 !important;
                box-shadow:0 0.35em 1.4em rgba(0,0,0,.28);
            }

            .ldg-card .card__view {
                position:relative;
                overflow:hidden;
                border-radius:inherit;
            }

            .ldg-card__img {
                display:block;
                width:100%;
                height:100%;
                object-fit:cover;
                background:#101010;
                transition:transform .35s ease, filter .35s ease;
            }

            .ldg-card::after {
                content:'';
                position:absolute;
                left:0;
                right:0;
                bottom:0;
                height:58%;
                pointer-events:none;
                background:linear-gradient(to top, rgba(0,0,0,.82), rgba(0,0,0,0));
            }

            .ldg-card__title {
                position:absolute;
                left:.75em;
                right:.75em;
                bottom:.7em;
                z-index:3;
                color:#fff;
                font-size:1.05em;
                font-weight:600;
                line-height:1.15;
                text-shadow:0 2px 7px rgba(0,0,0,.8);
            }

            .ldg-card.selector.focus,
            .ldg-card:hover {
                outline:none !important;
                box-shadow:0 0 0 .16em rgba(255,255,255,.82), 0 .5em 1.6em rgba(0,0,0,.42) !important;
            }

            .ldg-card.selector.focus .ldg-card__img,
            .ldg-card:hover .ldg-card__img {
                transform:scale(1.045);
                filter:saturate(1.08) brightness(1.05);
            }

            @media screen and (max-width:767px) {
                .category-full .ldg-card { width:50%; }
            }
        `;
        document.head.appendChild(style);
    }

    // ---------------------------------------------------------
    // Start
    // ---------------------------------------------------------

    function startPlugin() {
        if (window.__lampa_discovery_genres_ready) return;
        window.__lampa_discovery_genres_ready = true;

        addStyle();

        Lampa.Template.add('lampa_discovery_genre',
            '<div class="card selector ldg-card layer--visible layer--render">' +
                '<div class="card__view">' +
                    '<img class="ldg-card__img" src="./img/img_load.svg">' +
                    '<div class="ldg-card__title"></div>' +
                '</div>' +
            '</div>'
        );

        Lampa.Component.add(COMPONENT, component);

        var observer = new MutationObserver(function () {
            addMenu();
        });

        observer.observe(document.body, { childList:true, subtree:true });
        addMenu();

        console.log('[Lampa Discovery Genres] Ready');
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
