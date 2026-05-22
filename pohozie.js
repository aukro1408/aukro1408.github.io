// ==UserScript==
// @name         Lampa Similar Movies Working
// @namespace    lampa.similar.movies.working
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    'use strict';

    // защита от повторного запуска
    if (window.similar_movies_working) return;
    window.similar_movies_working = true;

    // =====================================================
    // API KEY
    // =====================================================

    var TMDB_KEY = '58e6fb66b91aa8f0e1f2b8cf3bb1342e';

    function getKey() {

        if (TMDB_KEY) return TMDB_KEY;

        return Lampa.Storage.get('tmdb_api_key')
            || Lampa.Storage.get('tmdb_key')
            || '';
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
        // OPEN SIMILAR
        // =================================================

        button.on('hover:enter', function () {

            var id = movie.id;

            if (!id) {

                Lampa.Noty.show('Не удалось получить ID');

                return;
            }

            var url =
                'https://api.themoviedb.org/3/' +
                type +
                '/' +
                id +
                '/recommendations?api_key=' +
                getKey() +
                '&language=ru-RU&page=1';

            var request = new Lampa.Reguest();

            request.timeout(10000);

            request.silent(url, function (json) {

                if (!json || !json.results || !json.results.length) {

                    Lampa.Noty.show('Похожие фильмы не найдены');

                    return;
                }

                // ВАЖНО:
                // открываем встроенный category_full
                // со встроенным скроллом Lampa

                Lampa.Activity.push({

                    component: 'category_full',

                    title: 'Похожее',

                    results: json.results,

                    source: 'tmdb',

                    page: 1
                });

            }, function () {

                Lampa.Noty.show('Ошибка загрузки TMDB');
            });
        });

        // вставляем кнопку
        e.render.after(button);
    }

    // =====================================================
    // INIT
    // =====================================================

    function init() {

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

        console.log('✔ Similar Movies Working loaded');
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
