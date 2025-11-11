// ==UserScript==
// @name         Lampa Menu Хрень — Под Главная
// @namespace    lampa.hren
// @version      1.0
// @description  Добавляет пункт "Хрень" с кастомной страницей под "Главная"
// @match        *://*/lampa*
// ==/UserScript==

(function () {
    'use strict';

    function insertHrenMenu() {
        const menuList = $(".menu .menu__list").eq(0);
        if (!menuList.length) return setTimeout(insertHrenMenu, 300);

        // ищем пункт "Главная"
        const mainItem = menuList.find('.menu__item .menu__text')
            .filter((i, el) => el.textContent.trim() === "Головна"); // или "Главная" для русской версии
        if (!mainItem.length) return setTimeout(insertHrenMenu, 300);

        // создаём пункт Хрень
        const menuItem = $(`
            <li class="menu__item selector" data-action="hren">
                <div class="menu__ico">💖</div>
                <div class="menu__text">Хрень</div>
            </li>
        `);

        // обработчик нажатия
        menuItem.on("hover:enter", () => {
            Lampa.Activity.push({
                title: 'Хрень',
                component: 'simple',
                html: `
                    <div style="padding:40px; text-align:center; color:white; background:#111; height:100%;">
                        <h1 class="hren-title">Добро пожаловать в Хрень!</h1>
                        <p style="font-size:18px; margin-top:20px;">
                            Здесь можно разместить любой контент: текст, ссылки, изображения или видео.
                        </p>
                    </div>
                    <style>
                        @keyframes rainbow {
                            0% { color: #ff0000; }
                            16% { color: #ff7f00; }
                            33% { color: #ffff00; }
                            50% { color: #00ff00; }
                            66% { color: #0000ff; }
                            83% { color: #4b0082; }
                            100% { color: #8b00ff; }
                        }
                        .hren-title {
                            font-size: 36px;
                            animation: rainbow 3s linear infinite;
                        }
                    </style>
                `
            });
        });

        // вставляем сразу после "Главная"
        menuItem.insertAfter(mainItem.closest('.menu__item'));
    }

    // ждем готовности приложения
    if (window.appready) insertHrenMenu();
    else Lampa.Listener.follow("app", (e) => {
        if (e.type === "ready") insertHrenMenu();
    });

})();
