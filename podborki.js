(function () {
    'use strict';

    /* Lampa Collections v0.8 — author: aukro1408 */
    var COMPONENT = 'lampa_collections_standard';
    var MENU_ID = 'lampa_collections_standard_menu';
    var started = false;
    var countCache = {};

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
            title: 'Реальность сломалась',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M8 8l3 3-2 4M16 8l-3 3 2 4M9 16h6"/></svg>',
            description: 'Когда мир выглядит нормальным, но что-то явно не так',
            image: 'https://image.tmdb.org/t/p/w500/7p5MzMb4h0Y2WUn73r4MHKNeh3X.jpg',
            url: 'discover/movie?with_genres=878|53&with_keywords=2340&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Другая версия тебя',
            icon: '<svg viewBox="0 0 24 24"><circle cx="9" cy="9" r="4"/><circle cx="15" cy="15" r="4"/><path d="M12 5v14M5 12h14"/></svg>',
            description: 'Двойники, подмена и чужая жизнь',
            image: 'https://image.tmdb.org/t/p/w500/rQifCStdJ7uJt1JMY3TDx1J5yWI.jpg',
            url: 'discover/movie?with_keywords=161891&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Время пошло не так',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2M5 5l2 2M19 5l-2 2"/></svg>',
            description: 'Петли, повторения и сломанная хронология',
            image: 'https://image.tmdb.org/t/p/w500/26OxTMSHoUW50XK3zkjOqodcvTc.jpg',
            url: 'discover/movie?with_keywords=563&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Ничего не сходится',
            icon: '<svg viewBox="0 0 24 24"><path d="M5 6h6v5H5zM13 13h6v5h-6zM13 5h6v5h-6zM5 14h6v5H5z"/><path d="m11 8 2 3M11 16l2-3"/></svg>',
            description: 'Чем дальше, тем меньше понятно, что происходит',
            image: 'https://image.tmdb.org/t/p/w500/rQifCStdJ7uJt1JMY3TDx1J5yWI.jpg',
            url: 'discover/movie?with_genres=53,9648&with_keywords=2340&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Что-то не так',
            icon: '<svg viewBox="0 0 24 24"><path d="M12 3 21 20H3z"/><path d="M12 8v6M12 17h.01"/></svg>',
            description: 'Тревожное чувство, что реальность скрывает что-то ужасное',
            image: 'https://image.tmdb.org/t/p/w500/ooTB3486ybRLrIr46vdjEhoYcsy.jpg',
            url: 'discover/movie?with_genres=27,53&with_keywords=256183&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'За тобой наблюдают',
            icon: '<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/><path d="M18 5l2-2M6 5 4 3"/></svg>',
            description: 'Камеры, слежка и ощущение чужого взгляда',
            image: 'https://image.tmdb.org/t/p/w500/gAw5nJGNDI2hyw2ghBLoD6rSk3Y.jpg',
            url: 'discover/movie?with_keywords=18420&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'За дверью что-то есть',
            icon: '<svg viewBox="0 0 24 24"><path d="M6 21V4h11v17M6 21h13M14 13h.01"/><path d="M17 8c2 0 3 1 3 3s-1 3-3 3"/></svg>',
            description: 'Порталы, тайные пространства и места, куда не стоило входить',
            image: 'https://image.tmdb.org/t/p/w500/ebzumprgCpfFUZOTJNZ407FA9IH.jpg',
            url: 'discover/movie?with_genres=27&with_keywords=7939&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Неизвестный сигнал',
            icon: '<svg viewBox="0 0 24 24"><path d="M4 12h3M17 12h3M7 9a4 4 0 0 1 0 6M17 9a4 4 0 0 0 0 6M9.5 6.5a8 8 0 0 1 0 11M14.5 6.5a8 8 0 0 0 0 11"/><circle cx="12" cy="12" r="1.5"/></svg>',
            description: 'Странные контакты, неизвестные сущности и внеземной след',
            image: 'https://image.tmdb.org/t/p/w500/gAw5nJGNDI2hyw2ghBLoD6rSk3Y.jpg',
            url: 'discover/movie?with_genres=878,53&with_keywords=12553&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Найденная запись',
            icon: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M8 5l1-2h6l1 2M8 17h.01M16 17h.01"/></svg>',
            description: 'Камеры, кассеты и последние записи исчезнувших людей',
            image: 'https://image.tmdb.org/t/p/w500/uSx9GZIdrYv8MQtDq6eaT0kYfTY.jpg',
            url: 'discover/movie?with_genres=27&with_keywords=163053&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'За пределами мира',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2 2.2 3 4.9 3 8s-1 5.8-3 8M12 4c-2 2.2-3 4.9-3 8s1 5.8 3 8"/></svg>',
            description: 'Другие измерения, порталы и невозможные пространства',
            image: 'https://image.tmdb.org/t/p/w500/26OxTMSHoUW50XK3zkjOqodcvTc.jpg',
            url: 'discover/movie?with_genres=878,27&with_keywords=7939&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
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

            /*
             * Aurora Glass — крупная живая пилюля количества.
             * Не меняем размеры самой карточки Lampa.
             */
            .lcs-count {
                position: absolute;
                top: .7em;
                right: .7em;
                z-index: 8;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 5.6em;
                height: 2.35em;
                padding: 0 .95em;
                box-sizing: border-box;
                border-radius: 999px;

                color: #fff;
                font-size: .82em;
                font-weight: 700;
                letter-spacing: .01em;
                line-height: 1;
                white-space: nowrap;

                background:
                    linear-gradient(
                        115deg,
                        rgba(63, 111, 255, .78) 0%,
                        rgba(116, 62, 255, .76) 36%,
                        rgba(218, 63, 174, .78) 72%,
                        rgba(255, 116, 192, .72) 100%
                    );

                border: 1px solid rgba(255,255,255,.42);

                box-shadow:
                    0 0 0 1px rgba(255,255,255,.08) inset,
                    0 .35em 1.1em rgba(117, 64, 255, .28),
                    0 .2em .8em rgba(0,0,0,.30);

                backdrop-filter: blur(14px) saturate(150%);
                -webkit-backdrop-filter: blur(14px) saturate(150%);

                overflow: hidden;
                pointer-events: none;

                animation: lcsAuroraPulse 5s ease-in-out infinite;
            }

            .lcs-count::before {
                content: '';
                position: absolute;
                inset: -45% -20%;
                background:
                    radial-gradient(
                        circle at 18% 50%,
                        rgba(120, 205, 255, .58) 0%,
                        rgba(120, 205, 255, 0) 42%
                    ),
                    radial-gradient(
                        circle at 82% 50%,
                        rgba(255, 150, 225, .55) 0%,
                        rgba(255, 150, 225, 0) 44%
                    );
                filter: blur(7px);
                opacity: .85;
                transform: translateX(-8%);
                animation: lcsAuroraFlow 6s ease-in-out infinite alternate;
            }

            .lcs-count::after {
                content: '';
                position: absolute;
                left: 12%;
                right: 12%;
                top: 8%;
                height: 32%;
                border-radius: 999px;
                background: linear-gradient(
                    180deg,
                    rgba(255,255,255,.42),
                    rgba(255,255,255,0)
                );
                opacity: .72;
            }

            .lcs-count {
                text-shadow:
                    0 1px 2px rgba(0,0,0,.35),
                    0 0 10px rgba(255,255,255,.18);
            }

            @keyframes lcsAuroraPulse {
                0%, 100% {
                    filter: saturate(100%) brightness(100%);
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,.08) inset,
                        0 .35em 1.1em rgba(117, 64, 255, .28),
                        0 .2em .8em rgba(0,0,0,.30);
                }
                50% {
                    filter: saturate(125%) brightness(108%);
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,.12) inset,
                        0 .35em 1.35em rgba(213, 66, 188, .34),
                        0 .2em .8em rgba(0,0,0,.30);
                }
            }

            @keyframes lcsAuroraFlow {
                0% {
                    transform: translateX(-8%) scale(1);
                }
                100% {
                    transform: translateX(8%) scale(1.08);
                }
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

    function loadCount(item, pill) {
        if (countCache[item.url] !== undefined) {
            pill.text(countCache[item.url] + ' фильмов');
            return;
        }

        function applyCount(data) {
            var total = data && Number(data.total_results);
            if (!isFinite(total)) total = 0;
            countCache[item.url] = total;
            pill.text(total ? (total + ' фильмов') : '0 фильмов');
        }

        try {
            if (Lampa.Api && typeof Lampa.Api.list === 'function') {
                Lampa.Api.list({
                    url: item.url,
                    source: 'tmdb',
                    page: 1
                }, applyCount, function () {
                    pill.remove();
                });
                return;
            }
        } catch (e) {
            console.log('[Подборки] count error', e);
        }

        pill.remove();
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

        var countPill = $('<span class="lcs-count">...</span>');
        card.find('.card__view').append(countPill);

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

        loadCount(item, countPill);

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
