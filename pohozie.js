(function () {
    'use strict';

    // =========================================================
    // SETTINGS
    // =========================================================

    var TMDB_KEY = '';
    var TMDB_LANG = 'ru-RU';
    var IMG_BASE = 'https://image.tmdb.org/t/p/w300';
    var PLUGIN_ID = 'similar_movies';

    function getKey() {
        if (TMDB_KEY) return TMDB_KEY;

        return Lampa.Storage.get('tmdb_api_key')
            || Lampa.Storage.get('tmdb_key')
            || '';
    }

    // =========================================================
    // STYLES
    // =========================================================

    function injectStyles() {

        if ($('#similar_movies_styles').length) return;

        $('<style id="similar_movies_styles">').text([

            '.similar-plugin{padding:2em;}',

            '.similar-plugin__head{',
            'display:flex;',
            'align-items:baseline;',
            'gap:1em;',
            'margin-bottom:1.5em;',
            'border-bottom:1px solid rgba(255,255,255,.08);',
            'padding-bottom:.8em;',
            '}',

            '.similar-plugin__title{',
            'font-size:1.5em;',
            'font-weight:600;',
            'color:#fff;',
            '}',

            '.similar-plugin__count{',
            'font-size:.85em;',
            'color:rgba(255,255,255,.45);',
            '}',

            // КОНТЕЙНЕР
            '.items-line{',
            'display:flex;',
            'flex-wrap:wrap;',
            'gap:1.2em;',
            '}',

            // 3 В РЯД
            '.items-line .similar-plugin__card{',
            'width:calc(33.333% - .8em);',
            'flex-shrink:0;',
            '}',

            '.similar-plugin__card{',
            'cursor:pointer;',
            'transition:transform .15s;',
            '}',

            '.similar-plugin__card.focus{',
            'transform:scale(1.04);',
            '}',

            '.similar-plugin__card .card__view{',
            'position:relative;',
            'border-radius:12px;',
            'overflow:hidden;',
            'aspect-ratio:2/3;',
            'background:rgba(255,255,255,.05);',
            '}',

            '.similar-plugin__card .card__img{',
            'width:100%;',
            'height:100%;',
            'object-fit:cover;',
            'display:block;',
            '}',

            '.similar-plugin__badge{',
            'position:absolute;',
            'top:6px;',
            'right:6px;',
            'background:rgba(0,0,0,.75);',
            'color:#f7c65c;',
            'font-size:.72em;',
            'font-weight:700;',
            'padding:2px 7px;',
            'border-radius:5px;',
            '}',

            '.similar-plugin__card .card__title{',
            'margin-top:.55em;',
            'font-size:.9em;',
            'color:#fff;',
            'overflow:hidden;',
            'text-overflow:ellipsis;',
            'white-space:nowrap;',
            '}',

            '.similar-plugin__year{',
            'margin-top:.15em;',
            'font-size:.76em;',
            'color:rgba(255,255,255,.45);',
            '}',

            '.similar-plugin__loader{',
            'width:100%;',
            'display:flex;',
            'justify-content:center;',
            'padding:3em 0;',
            '}',

            '.similar-plugin__spinner{',
            'width:36px;',
            'height:36px;',
            'border:3px solid rgba(255,255,255,.1);',
            'border-top-color:#f7c65c;',
            'border-radius:50%;',
            'animation:similar_spin .7s linear infinite;',
            '}',

            '@keyframes similar_spin{',
            'to{transform:rotate(360deg);}',
            '}',

            '.similar-plugin__empty{',
            'width:100%;',
            'text-align:center;',
            'padding:4em 0;',
            'color:rgba(255,255,255,.35);',
            '}',

            '.similar-plugin__more{',
            'width:100%;',
            'display:flex;',
            'justify-content:center;',
            'padding:2em 0;',
            '}',

            '.similar-plugin__more-btn{',
            'padding:.8em 2.2em;',
            'border-radius:7px;',
            'border:1px solid rgba(255,255,255,.15);',
            'background:transparent;',
            'color:#fff;',
            '}',

            '.similar-plugin__more-btn.focus{',
            'border-color:#f7c65c;',
            'color:#f7c65c;',
            '}'

        ].join('')).appendTo('head');
    }

    // =========================================================
    // COMPONENT
    // =========================================================

    function SimilarComponent(object) {

        var network = new Lampa.Reguest();

        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });

        var page = 1;
        var total = 1;
        var loading = false;
        var last = false;

        var card = object.card || {};
        var type = object.movie_type || 'movie';
        var tmdb_id = card.id;

        var html = $('<div class="similar-plugin"></div>');

        var head = $([
            '<div class="similar-plugin__head">',
            '<div class="similar-plugin__title">',
            'Похожее на «' + (card.title || card.name || '') + '»',
            '</div>',
            '<div class="similar-plugin__count"></div>',
            '</div>'
        ].join(''));

        var count = head.find('.similar-plugin__count');

        var items = $('<div class="items-line"></div>');

        var loader = $([
            '<div class="similar-plugin__loader">',
            '<div class="similar-plugin__spinner"></div>',
            '</div>'
        ].join(''));

        var empty = $([
            '<div class="similar-plugin__empty">',
            'Похожие фильмы не найдены',
            '</div>'
        ].join(''));

        var more = $([
            '<div class="similar-plugin__more">',
            '<div class="similar-plugin__more-btn selector">Загрузить ещё</div>',
            '</div>'
        ].join(''));

        html.append(head);
        html.append(items);

        scroll.body().append(html);

        // =====================================================
        // RENDER CARDS
        // =====================================================

        function renderCards(results) {

            results.forEach(function (movie) {

                var poster = movie.poster_path
                    ? IMG_BASE + movie.poster_path
                    : '';

                var title = movie.title || movie.name || '';

                var year = (
                    movie.release_date
                    || movie.first_air_date
                    || ''
                ).slice(0, 4);

                var rating = movie.vote_average
                    ? parseFloat(movie.vote_average).toFixed(1)
                    : '—';

                var card_html = $([
                    '<div class="card focus--mouse similar-plugin__card">',
                    '   <div class="card__view">',
                    poster
                        ? '<img class="card__img" src="' + poster + '">'
                        : '<div class="card__img">🎬</div>',
                    '       <div class="similar-plugin__badge">' + rating + '</div>',
                    '   </div>',
                    '   <div class="card__title">' + title + '</div>',
                    '   <div class="similar-plugin__year">' + year + '</div>',
                    '</div>'
                ].join(''));

                card_html.on('hover:enter', function () {

                    Lampa.Activity.push({
                        url: '',
                        component: 'full',
                        id: movie.id,
                        method: type === 'tv' ? 'tv' : 'movie',
                        card: movie
                    });
                });

                items.append(card_html);

                // ВАЖНО
                Lampa.Controller.collectionAppend(card_html);
            });
        }

        // =====================================================
        // LOAD
        // =====================================================

        function loadPage() {

            if (loading || page > total) return;

            loading = true;

            items.append(loader);

            var endpoint = type === 'tv'
                ? 'tv'
                : 'movie';

            var url =
                'https://api.themoviedb.org/3/' +
                endpoint +
                '/' +
                tmdb_id +
                '/recommendations?api_key=' +
                getKey() +
                '&language=' +
                TMDB_LANG +
                '&page=' +
                page;

            network.timeout(10000);

            network.silent(url, function (data) {

                loading = false;

                loader.detach();

                if (!data || !data.results) {

                    if (page === 1) {
                        items.append(empty);
                    }

                    return;
                }

                total = data.total_pages || 1;

                count.text(
                    'Найдено: ' +
                    (data.total_results || 0)
                );

                if (!data.results.length && page === 1) {

                    items.append(empty);

                    return;
                }

                renderCards(data.results);

                page++;

                more.detach();

                if (page <= total) {

                    html.append(more);

                    more.find('.similar-plugin__more-btn')
                        .off('hover:enter')
                        .on('hover:enter', loadPage);
                }

                Lampa.Controller.enable('content');

            }, function () {

                loading = false;

                loader.detach();

                if (page === 1) {
                    items.append(empty);
                }
            });
        }

        // =====================================================
        // SYSTEM
        // =====================================================

        this.create = function () {

            loadPage();

            return scroll.render();
        };

        this.render = function () {
            return scroll.render();
        };

        this.update = function () {};
        this.pause = function () {};
        this.resume = function () {};

        this.destroy = function () {

            network.clear();

            scroll.destroy();
        };

        this.back = function () {

            Lampa.Activity.backward();
        };

        this.start = function () {

            Lampa.Background.immediately(
                Lampa.Utils.cardImgBackgroundBlur(card)
            );

            Lampa.Controller.add('content', {

                toggle: function () {

                    Lampa.Controller.collectionSet(
                        scroll.render()
                    );

                    Lampa.Controller.collectionFocus(
                        last || false,
                        scroll.render()
                    );
                },

                up: function () {

                    if (Navigator.canmove('up')) {
                        Navigator.move('up');
                    }
                    else {
                        Lampa.Controller.toggle('head');
                    }
                },

                down: function () {
                    Navigator.move('down');
                },

                right: function () {

                    if (Navigator.canmove('right')) {
                        Navigator.move('right');
                    }
                },

                left: function () {

                    if (Navigator.canmove('left')) {
                        Navigator.move('left');
                    }
                    else {
                        Lampa.Controller.toggle('menu');
                    }
                },

                back: this.back.bind(this)
            });

            Lampa.Controller.toggle('content');
        };
    }

    // =========================================================
    // BUTTON
    // =========================================================

    function addButton(e) {

        if (!e || !e.render || !e.render.length) return;

        if (e.render.next('.similar--button').length) return;

        var movie = e.movie || {};

        var type = (
            movie.number_of_seasons
            || movie.name
        ) ? 'tv' : 'movie';

        var btn = $([
            '<div class="full-start__button selector similar--button">',
            '<svg xmlns="http://www.w3.org/2000/svg"',
            'viewBox="0 0 24 24"',
            'fill="none"',
            'stroke="currentColor"',
            'stroke-width="1.5"',
            'width="24"',
            'height="24">',
            '<circle cx="11" cy="11" r="7"/>',
            '<line x1="16.5" y1="16.5" x2="22" y2="22"/>',
            '<line x1="11" y1="7" x2="11" y2="15"/>',
            '<line x1="7" y1="11" x2="15" y2="11"/>',
            '</svg>',
            '<span>Похожее</span>',
            '</div>'
        ].join(''));

        btn.on('hover:enter', function () {

            Lampa.Activity.push({
                url: '',
                title: 'Похожее кино',
                component: PLUGIN_ID,
                card: movie,
                movie_type: type
            });
        });

        e.render.after(btn);
    }

    // =========================================================
    // INIT
    // =========================================================

    function init() {

        injectStyles();

        Lampa.Component.add(
            PLUGIN_ID,
            SimilarComponent
        );

        Lampa.Listener.follow('full', function (e) {

            if (e.type === 'complite') {

                addButton({
                    render: e.object.activity
                        .render()
                        .find('.view--torrent'),

                    movie: e.data.movie
                });
            }
        });

        try {

            if (
                Lampa.Activity.active().component === 'full'
            ) {

                addButton({
                    render: Lampa.Activity.active()
                        .activity
                        .render()
                        .find('.view--torrent'),

                    movie: Lampa.Activity.active().card
                });
            }

        } catch (e) {}

        console.log('[SimilarMovies] loaded');
    }

    if (window.Lampa) init();
    else document.addEventListener('lampa:ready', init);

})();
