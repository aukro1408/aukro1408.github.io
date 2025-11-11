// ==UserScript==
// @name         Lampa Menu Хрень (ATV Safe)
// @namespace    lampa.menu.hren
// @version      3.0
// @description  Добавляет пункт меню "Хрень" с радужным сердцем (ATV совместим)
// ==/UserScript==

(function() {
    'use strict';

    function addHrenButton() {
        // Проверяем, не добавлена ли уже
        if (document.querySelector('.menu__item[data-action="hren"]')) return;

        const menuList = document.querySelector('.menu .menu__list');
        if (!menuList) {
            setTimeout(addHrenButton, 500);
            return;
        }

        const li = document.createElement('li');
        li.className = 'menu__item selector';
        li.dataset.action = 'hren';
        li.innerHTML = `
            <div class="menu__ico"><div class="hren-heart">💖</div></div>
            <div class="menu__text">Хрень</div>
        `;

        li.addEventListener('hover:enter', () => {
            try {
                Lampa.Activity.push({
                    title: 'Хрень',
                    component: 'category',
                    source: 'tmdb',
                    page: 1,
                    url: 'movie',
                    card_type: true,
                    filter: {
                        genres: ['27'] // жанр "ужасы"
                    }
                });
            } catch (e) {
                Lampa.Noty.show('Ошибка при открытии категории 😢');
                console.error('Хрень ошибка:', e);
            }
        });

        // Вставляем под "Главная"
        const firstItem = menuList.querySelector('.menu__item');
        if (firstItem) menuList.insertBefore(li, firstItem.nextSibling);
        else menuList.appendChild(li);

        // 🌈 Радужная анимация сердца
        const style = document.createElement('style');
        style.textContent = `
            .hren-heart {
                animation: rainbow 3s linear infinite;
            }
            @keyframes rainbow {
                0% { color: #ff0000; }
                16% { color: #ff7f00; }
                33% { color: #ffff00; }
                50% { color: #00ff00; }
                66% { color: #0000ff; }
                83% { color: #4b0082; }
                100% { color: #8b00ff; }
            }
        `;
        document.head.appendChild(style);

        console.log('✅ Меню "Хрень" добавлено');
    }

    // Дожидаемся готовности приложения
    if (window.appready) addHrenButton();
    else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') addHrenButton();
        });
    }
})();
