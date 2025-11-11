// ==UserScript==
// @name         Lampa Add "Хрень" Menu Item (ATV Safe Rainbow)
// @namespace    lampa.menu.hren
// @version      2.1
// @description  Добавляет пункт меню "Хрень" с радужным сердцем, без ошибок на Android TV
// ==/UserScript==

(function() {
    'use strict';

    function waitForLampa(callback) {
        if (window.Lampa && Lampa.Menu && Lampa.Activity) {
            callback();
        } else {
            setTimeout(() => waitForLampa(callback), 700);
        }
    }

    waitForLampa(() => {
        // если уже добавлен — не добавляем снова
        if (Lampa.Menu.get('hren')) return;

        // безопасное добавление пункта меню
        try {
            Lampa.Menu.add({
                id: 'hren',
                title: 'Хрень',
                icon: '💖',
                action: function() {
                    try {
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
                    } catch (e) {
                        Lampa.Noty.show('Ошибка при открытии категории 😢');
                        console.error('Hren action error:', e);
                    }
                }
            });

            // плавная радужная анимация сердца
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

            console.log('✅ Пункт меню "Хрень" успешно добавлен');
        } catch (e) {
            console.error('Ошибка при добавлении меню "Хрень":', e);
        }
    });
})();
