// ==UserScript==
// @name         Lampa Top Kino
// @namespace    lampa.simple.top.kino
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    // защита от повторного запуска
    if (window.top_kino_plugin) return;
    window.top_kino_plugin = true;

    function createMenuItem(text, className, url, icon) {

        // ВАЖНО:
        // li + selector = нормальная работа пульта
        const item = $('<li class="menu__item selector ' + className + '"></li>');

        item.html(`
            <div class="menu__ico">${icon}</div>
            <div class="menu__text">${text}</div>
        `);

        // ВАЖНО:
        // hover:enter вместо click
        item.on('hover:enter', function () {

            Lampa.Activity.push({
                component: 'category_full',
                source: 'tmdb',
                title: text,
                url: url,
                page: 1
            });

        });

        return item;
    }

    function addButtons() {

        if (!window.Lampa) return;

        const menu = $('.menu .menu__list').eq(0);

        if (!menu.length) return;

        // защита от дублей
        if ($('.top-kino').length) return;

        // Топ кино: ужасы + триллеры, только фильмы, популярные и с высоким рейтингом
        const topKino = createMenuItem(
            'Топ кино',
            'top-kino',
            'discover/movie?with_genres=27|53&sort_by=popularity.desc&vote_average.gte=7&vote_count.gte=500&include_adult=false',
            '★'
        );

        // вставляем вверх меню
        menu.prepend(topKino);

        console.log('✔ Lampa Top Kino loaded');
    }

    // ждём загрузку лампы
    if (window.appready) {
        addButtons();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                addButtons();
            }
        });
    }

    // если меню перерисуется
    Lampa.Listener.follow('activity', function () {
        setTimeout(addButtons, 500);
    });

})();
