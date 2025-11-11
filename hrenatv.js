// ==UserScript==
// @name         Lampa Menu Hren
// @namespace    lampa.hren
// @version      1.0
// @description  Добавляет пункт "Хрень" в боковое меню Lampa
// @match        *://*/lampa*
// ==/UserScript==

(function () {
    'use strict';

    function initHrenMenu() {
        if (window.hren_ready) return;
        window.hren_ready = true;

        // Берем первый список меню
        const menuList = $(".menu .menu__list").eq(0);

        // Создаём пункт
        const menuItem = $(`
            <li class="menu__item selector" data-action="hren">
                <div class="menu__ico">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)">
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stop-color="#ff0055"/>
                                <stop offset="50%" stop-color="#ff9900"/>
                                <stop offset="100%" stop-color="#00ccff"/>
                            </linearGradient>
                        </defs>
                        <path d="M12 21s-8-6.3-8-11.5S7.5 2 12 6.5 20 2 20 9.5 12 21 12 21z" stroke-width="2" fill="none"/>
                    </svg>
                </div>
                <div class="menu__text">Хрень</div>
            </li>
        `);

        // Обработчик нажатия
        menuItem.on("hover:enter", () => {
            Lampa.Activity.push({
                url: 'discover/movie?with_genres=27&language=uk',
                title: 'Хрень',
                component: 'category_full',
                source: 'tmdb',
                page: 1
            });
        });

        // Вставляем пункт сразу после "Главная"
        const mainItem = $('.menu__list .menu__item').first();
        if (mainItem.length) {
            menuItem.insertAfter(mainItem);
        } else {
            menuList.prepend(menuItem);
        }
    }

    if (window.appready) {
        initHrenMenu();
    } else {
        Lampa.Listener.follow("app", (e) => {
            if (e.type === "ready") initHrenMenu();
        });
    }
})();
