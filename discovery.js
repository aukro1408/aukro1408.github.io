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
            sort_by: 'vote_average.desc',
            'vote_count.gte': 200,
            'primary_release_date.lte': new Date().toISOString().slice(0, 10),
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
                    title: 'Discovery',
                    results: data,
                    total_pages: 1,
                    page: 1,
                    cardClass: function (elem, param) {
                        return new GenreCard(elem, param);
                    }
                });

                try {
                    comp.render().find('.category-full').addClass('mapping--grid');
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
                        '<circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.7"/>' +
                        '<path d="m15.7 8.3-2.2 4.1-4.1 2.2 2.2-4.1 4.1-2.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">Discovery</div>' +
            '</li>'
        );

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Discovery',
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
            /* Только стандартная геометрия карточки Lampa. Без собственного скролла,
               градиентов, теней и touch-обработчиков. */
            .ldg-card {
                position:relative;
                overflow:visible;
                background:transparent !important;
                box-shadow:none !important;
                border-radius:0;
            }

            .ldg-card .card__view {
                position:relative;
                overflow:hidden;
                border-radius:.35em;
                aspect-ratio:2 / 3;
                background:#111;
            }

            .ldg-card__img {
                display:block;
                width:100%;
                height:100%;
                object-fit:cover;
                background:#101010;
                transition:none;
            }

            .ldg-card__title {
                position:static;
                display:block;
                margin-top:.45em;
                color:inherit;
                font-size:1em;
                font-weight:400;
                line-height:1.2;
                text-align:left;
                text-shadow:none;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
            }

            .ldg-card.selector.focus .card__view {
                box-shadow:0 0 0 .16em rgba(255,255,255,.82);
            }

            .ldg-card.selector.focus .ldg-card__img {
                transform:none;
                filter:none;
            }

            .ldg-card:hover .ldg-card__img {
                transform:none;
                filter:none;
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
                '</div>' +
                '<div class="card__title ldg-card__title"></div>' +
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
