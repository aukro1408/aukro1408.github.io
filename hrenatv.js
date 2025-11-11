// ==UserScript==
// @name         Lampa Add "Хрень" Menu Item (ATV + Rainbow Heart)
// @namespace    lampa.menu.hren
// @version      2.0
// @description  Добавляет пункт меню "Хрень" с радужным сердцем и поддержкой пульта
// @author       GPT
// ==/UserScript==

(function() {
    'use strict';

    function init() {
        if (!window.Lampa || !Lampa.Menu) {
            return setTimeout(init, 500);
        }

        // Если уже есть пункт "Хрень" — не добавляем второй
        if (Lampa.Menu.get('hren')) return;

        // Добавляем новый пункт меню
        Lampa.Menu.add({
            id: 'hren',
            title: 'Хрень',
            icon: '💖',
            action: function() {
                // Пример действия: открывает категорию фильмов "ужасы"
                Lampa.Activity.push({
                    title: 'Хрень',
                    component: 'category',
                    url: 'movie',
                    source: 'tmdb',
                    card_type: true,
                    page: 1,
                    filter: {
                        genres: ['27'] // жанр "ужасы"
                    }
                });
            }
        });

        // Добавляем CSS-анимацию для сердечка
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { color: #ff0000; }
                16% { color: #ff7f00; }
                33% { color: #ffff00; }
                50% { color: #00ff00; }
                66% { color: #0000ff; }
                83% { color: #4b0082; }
                100% { color: #8b00ff; }
            }

            .menu__list .menu__item[data-action="hren"] .menu__ico {
                animation: rainbow 3s linear infinite;
            }
        `;
        document.head.appendChild(style);
    }

    init();
})();
