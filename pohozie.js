// ==UserScript==
// @name         Lampa Similar Movies Gold
// @namespace    lampa.similar.movies.gold
// @version      1.2
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    'use strict';

    // защита от повторного запуска
    if (window.similar_movies_gold) return;
    window.similar_movies_gold = true;

    // =====================================================
    // STYLES
    // =====================================================

    function injectStyles() {

        if ($('#similar_movies_gold_styles').length) return;

        $('<style id="similar_movies_gold_styles">').text([

            '.similar--button{',
            'border-radius:14px;',
            'background:linear-gradient(',
            '135deg,',
            'rgba(232,184,75,.18),',
            'rgba(232,184,75,.05)',
            ');',

            'border:1px solid rgba(232,184,75,.35)!important;',
            'transition:all .2s ease;',
            'overflow:hidden;',
            '}',

            '.similar--button.focus{',
            'transform:scale(1.05);',

            'background:linear-gradient(',
            '135deg,',
            'rgba(232,184,75,.35),',
            'rgba(232,184,75,.12)',
            ');',

            'box-shadow:0 0 30px rgba(232,184,75,.25);',
            '}',

            '.similar--button svg{',
            'width:24px;',
            'height:24px;',
            '}',

            '.similar--button span{',
            'font-weight:600;',
            'letter-spacing:.2px;',
            '}'

        ].join('')).appendTo('head');
    }

    // =====================================================
    // BUTTON
    // =====================================================

    function addButton(e) {

        if (!e || !e.render || !e.render.length) return;

        // защита от дублей
        if (e.render.next('.similar--button').length) return;

        var movie = e.movie || {};

        // movie / tv
        var type = movie.number_of_seasons || movie.name
            ? 'tv'
            : 'movie';

        // =================================================
        // BUTTON UI
        // =================================================

        var button = $([
            '<div class="full-start__button selector similar--button">',

            '   <svg xmlns="http://www.w3.org/2000/svg"',
            '        viewBox="0 0 24 24"',
            '        fill="none"',
            '        stroke="#f1c761"',
            '        stroke-width="1.7"',
            '        stroke-linecap="round"',
            '        stroke-linejoin="round"',
            '        width="24"',
            '        height="24">',

            '       <circle cx="11" cy="11" r="7"/>',
            '       <line x1="16.5" y1="16.5" x2="22" y2="22"/>',
            '       <line x1="11" y1="7" x2="11" y2="15"/>',
            '       <line x1="7" y1="11" x2="15" y2="11"/>',

            '   </svg>',

            '   <span>Похожие</span>',

            '</div>'
        ].join(''));

        // =================================================
        // OPEN
        // =================================================

        button.on('hover:enter', function () {

            if (!movie.id) {

                Lampa.Noty.show('Нет ID фильма');

                return;
            }

            // именно этот формат работает в твоей Lampa
            var url =
                type +
                '/' +
                movie.id +
                '/recommendations';

            Lampa.Activity.push({

                component: 'category_full',

                title: 'Похожие',

                source: 'tmdb',

                url: url,

                page: 1
            });
        });

        // вставляем после torrent
        e.render.after(button);
    }

    // =====================================================
    // INIT
    // =====================================================

    function init() {

        injectStyles();

        // слушаем открытие карточки
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

        // если карточка уже открыта
        try {

            if (Lampa.Activity.active().component === 'full') {

                addButton({

                    render: Lampa.Activity.active()
                        .activity
                        .render()
                        .find('.view--torrent'),

                    movie: Lampa.Activity.active().card
                });
            }

        } catch (e) {}

        console.log('✔ Similar Movies Gold loaded');
    }

    // =====================================================
    // START
    // =====================================================

    if (window.appready) {

        init();

    } else {

        Lampa.Listener.follow('app', function (e) {

            if (e.type === 'ready') {

                init();
            }
        });
    }

})();
