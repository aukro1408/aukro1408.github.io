// ==UserScript==
// @name         Lampa Horror + Thriller TV FIX
// @namespace    lampa.simple.genres.tvfix
// @version      2.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    // защита от повторного запуска
    if (window.genre_tv_fix) return;
    window.genre_tv_fix = true;

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
        if ($('.genre-horror').length) return;

        // 😱 Ужасы
        const horror = createMenuItem(
            'Ужасы 😱',
            'genre-horror',
            'discover/movie?with_genres=27&sort_by=popularity.desc',
            '😱'
        );

        // 🔪 Триллеры
        const thriller = createMenuItem(
            'Триллеры 🔪',
            'genre-thriller',
            'discover/movie?with_genres=53&sort_by=popularity.desc',
            '🔪'
        );

        // вставляем вверх меню
        menu.prepend(thriller);
        menu.prepend(horror);

        console.log('✔ Horror + Thriller TV FIX loaded');
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
