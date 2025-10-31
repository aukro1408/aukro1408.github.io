(function () {
    'use strict';

    const PLUGIN_NAME = 'YouTube';
    const PLUGIN_ID = 'youtube';

    // Очень простой плагин
    class YouTubePlugin {
        constructor() {
            this.name = PLUGIN_NAME;
            this.id = PLUGIN_ID;
        }

        init() {
            console.log(`[${PLUGIN_NAME}] Plugin initialized`);
            // Просто добавляем кнопку через DOM
            this.addButton();
        }

        addButton() {
            // Проверяем, есть ли уже кнопка
            if (document.getElementById('youtube-menu-button')) {
                return;
            }

            // Ищем меню
            const menu = document.querySelector('.menu');
            if (!menu) {
                // Повторяем попытку
                setTimeout(() => this.addButton(), 500);
                return;
            }

            // Создаем кнопку
            const button = document.createElement('div');
            button.id = 'youtube-menu-button';
            button.className = 'menu__item';
            button.innerHTML = `
                <div class="menu__item-icon" style="color: #FF0000; font-weight: bold; font-size: 18px;">YT</div>
                <div class="menu__item-title" style="font-size: 16px; color: white;">${this.name}</div>
            `;

            // Обработчик клика (очень простой)
            button.onclick = function() {
                console.log(`[${PLUGIN_NAME}] Button clicked`);
                // Открываем YouTube в новой вкладке
                window.open('https://www.youtube.com', '_blank');
            };

            try {
                menu.appendChild(button);
                console.log(`[${PLUGIN_NAME}] Button added`);
            } catch (e) {
                console.error(`[${PLUGIN_NAME}] Error adding button:`, e);
            }
        }
    }

    // Запуск
    function start() {
        console.log(`[${PLUGIN_NAME}] Starting plugin`);
        const plugin = new YouTubePlugin();
        plugin.init();
    }

    // Запуск при готовности Lampa
    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') {
                start();
            }
        });
    }
})();
