(function () {
    'use strict';

    /* Lampa Collections v0.4 — author: aukro1408 */
    var COMPONENT = 'lampa_collections_standard';
    var MENU_ID = 'lampa_collections_standard_menu';
    var started = false;

    /*
     * Минимальный тест.
     *
     * Здесь намеренно НЕ используется собственный размер карточки.
     * Карточка строится с классами штатной Lampa .card/.card__view/.card__img,
     * поэтому её размеры берёт стандартный CSS Lampa.
     *
     * После проверки картинки можно заменить на TMDB-источники.
     */
    var COLLECTIONS = [
        {
            title: 'Зомби',
            icon: '<svg viewBox="0 0 24 24"><path d="M4 10.5c0-4.1 3.2-7 8-7s8 2.9 8 7v5.2c0 1.8-1.2 3.3-3 3.3H7c-1.8 0-3-1.5-3-3.3z"/><path d="M8 11h.01M16 11h.01M9 15.5c1.7 1.1 4.3 1.1 6 0M7 7.5l-1.5-2M17 7.5l1.5-2"/></svg>',
            description: 'Зомби, эпидемии и выживание',
            image: 'https://images.fandango.com/ImageRenderer/0/0/redesign/static/img/default_poster--dark-mode.png/0/images/masterrepository/Fandango/136726/WWZ523.jpg',
            url: 'discover/movie?with_genres=27&with_keywords=12377&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Космос',
            icon: '<svg viewBox="0 0 24 24"><path d="M14.8 4.1c2.5-1.1 4.3-1 5.1-.2.8.8.9 2.6-.2 5.1-1.3 3-4 6.1-7.1 7.7l-3.2-3.2c1.6-3.1 4.7-5.8 7.7-7.1z"/><path d="M9.4 14.6 6 18M7.3 16.7l-2.1.4.4-2.1M14.6 9.4l-1.2 1.2M17.5 6.5h.01"/><path d="M8.3 18.2c-.8 1.3-1.9 1.9-3.3 1.9 0-1.4.6-2.5 1.9-3.3"/></svg>',
            description: 'Космос, другие планеты и экспедиции',
            image: 'https://www.movieposters.com/cdn/shop/products/interstellar4_bed75630-9176-4725-b1cc-3bd45788905a_1024x1024.jpg?v=1762971876',
            url: 'discover/movie?with_genres=878&with_keywords=9882&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        }
    ];

    function esc(text) {
        return String(text || '').replace(/[&<>"']/g, function (c) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[c];
        });
    }

    function addStyle() {
        if (document.getElementById('lampa-collections-standard-style')) return;

        var style = document.createElement('style');
        style.id = 'lampa-collections-standard-style';
        style.textContent = `
            /*
             * НЕ задаём width/height/aspect-ratio для карточки.
             * Lampa сама задаёт стандартные размеры .card.
             */
            .lcs-page {
                padding: 1.2em 1.4em 5em;
            }

            .lcs-title {
                font-size: 2em;
                font-weight: 700;
                margin: 0 0 .2em;
            }

            .lcs-subtitle {
                opacity: .65;
                margin-bottom: 1.4em;
            }

            .lcs-row {
                display: flex;
                flex-wrap: wrap;
                gap: 1em;
                align-items: flex-start;
            }

            /*
             * Только небольшая подпись категории.
             * Размер самой карточки НЕ трогаем.
             */
            .lcs-card .card__title {
                display: block !important;
                white-space: normal !important;
                text-align: center !important;
                line-height: 1.2;
                margin-top: .4em;
            }

            .lcs-category {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: .38em;
            }

            .lcs-icon {
                width: 1.15em;
                height: 1.15em;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                flex: 0 0 auto;
            }

            .lcs-icon svg {
                width: 100%;
                height: 100%;
                fill: none;
                stroke: currentColor;
                stroke-width: 1.7;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .lcs-name {
                display: inline-block;
            }

            .lcs-card .lcs-category {
                font-size: 1em;
                font-weight: 600;
            }

            .lcs-card .lcs-desc {
                font-size: .78em;
                opacity: .6;
                margin-top: .18em;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            @media (max-width: 700px) {
                .lcs-row {
                    gap: .75em;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createCard(item) {
        /*
         * Берём именно штатный шаблон карточки Lampa, если он доступен.
         * Это тот же .card, который используется обычными фильмами.
         */
        var card;

        try {
            if (Lampa.Template && typeof Lampa.Template.js === 'function') {
                card = Lampa.Template.js('card');
            }
        } catch (e) {}

        if (!card || !card.length) {
            card = $(
                '<div class="card selector layer--visible layer--render lcs-card">' +
                    '<div class="card__view">' +
                        '<img class="card__img" src="./img/img_load.svg">' +
                    '</div>' +
                    '<div class="card__title"></div>' +
                '</div>'
            );
        }

        card.addClass('lcs-card card--loaded selector');

        var img = card.find('.card__img');
        var title = card.find('.card__title');

        img.attr('src', item.image);
        /*
         * Название подборки показываем под постером.
         * Это именно штатный .card__title, поэтому визуально
         * подпись остаётся частью стандартной карточки Lampa.
         */
        title.html(
            '<div class="lcs-category">' +
                '<span class="lcs-icon">' + item.icon + '</span>' +
                '<span class="lcs-name">' + esc(item.title) + '</span>' +
            '</div>' +
            '<div class="lcs-desc">' +
                esc(item.description) +
            '</div>'
        );
        title.css({
            'display': 'block',
            'white-space': 'normal',
            'text-align': 'center',
            'line-height': '1.2'
        });

        card.card_data = {
            title: item.title,
            original_title: item.title,
            poster: item.image,
            source: 'tmdb',
            category: true
        };

        card.on('hover:enter', function () {
            Lampa.Activity.push({
                component: 'category_full',
                source: 'tmdb',
                title: item.title,
                url: item.url,
                page: 1
            });
        });

        return card;
    }

    function CollectionsComponent(object) {
        var self = this;
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });

        var html = $('<div class="lcs-page"></div>');
        var last = false;

        html.append(
            '<div class="lcs-title">Подборки</div>' +
            '<div class="lcs-subtitle">Тематические фильмы</div>'
        );

        var row = $('<div class="lcs-row"></div>');
        html.append(row);

        COLLECTIONS.forEach(function (item) {
            var card = createCard(item);

            card.on('hover:focus', function () {
                last = card;
            });

            row.append(card);
        });

        scroll.append(html);

        this.create = function () {
            return this.render();
        };

        this.render = function () {
            return scroll.render();
        };

        this.start = function () {
            Lampa.Controller.add('lcs_content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('lcs_content');
        };

        this.pause = function () {};
        this.stop = function () {};

        this.destroy = function () {
            try {
                Lampa.Controller.clear();
            } catch (e) {}

            try {
                scroll.destroy();
            } catch (e) {}
        };
    }

    function addMenu() {
        if ($('#' + MENU_ID).length) return;

        var button = $(
            '<li id="' + MENU_ID + '" class="menu__item selector">' +
                '<div class="menu__ico">' +
                    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8">' +
                        '<rect x="3" y="3" width="7" height="7" rx="1"></rect>' +
                        '<rect x="14" y="3" width="7" height="7" rx="1"></rect>' +
                        '<rect x="3" y="14" width="7" height="7" rx="1"></rect>' +
                        '<rect x="14" y="14" width="7" height="7" rx="1"></rect>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">Подборки</div>' +
            '</li>'
        );

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Подборки',
                component: COMPONENT,
                page: 1
            });
        });

        $('.menu .menu__list').eq(0).append(button);
    }

    function start() {
        if (started || !window.Lampa) return;
        if (!Lampa.Component || !Lampa.Activity) return;

        started = true;

        addStyle();

        try {
            Lampa.Component.add(COMPONENT, CollectionsComponent);
        } catch (e) {
            console.log('[Подборки] Component add error', e);
        }

        if (window.appready) {
            addMenu();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') addMenu();
            });
        }

        console.log('[Lampa Подборки] standard cards test started');
    }

    if (window.Lampa) start();
    else setTimeout(start, 1500);
})();
