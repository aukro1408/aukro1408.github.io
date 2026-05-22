// ==UserScript==
// @name         Lampa Similar Movies Final
// @namespace    lampa.similar.movies.final
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    'use strict';

    // защита от повторного запуска
    if (window.similar_movies_final) return;
    window.similar_movies_final = true;

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

        // кнопка
        var button = $([
            '<div class="full-start__button selector similar--button">',
            '   <svg xmlns="http://www.w3.org/2000/svg"',
            '        viewBox="0 0 24 24"',
            '        fill="none"',
            '        stroke="currentColor"',
            '        stroke-width="1.5"',
            '        width="24"',
            '        height="24">',
            '       <circle cx="11" cy="11" r="7"/>',
            '       <line x1="16.5" y1="16.5" x2="22" y2="22"/>',
            '   </svg>',
            '   <span>Похожее</span>',
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

            // ВАЖНО:
            // category_full понимает ТОЛЬКО discover / movie / tv URL

            var url =
                type +
                '/' +
                movie.id +
                '/recommendations';

            Lampa.Activity.push({

                component: 'category_full',

                title: 'Похожее',

                source: 'tmdb',

                url: url,

                page: 1
            });
        });

        // вставляем кнопку
        e.render.after(button);
    }

    // =====================================================
    // INIT
    // =====================================================

    function init() {

        // слушаем открытие full карточки
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

        console.log('✔ Similar Movies Final loaded');
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
