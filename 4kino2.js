(function () {
    'use strict';

    const API_URL = 'https://4kino.cc'; // ← без пробела!

    class Plugin4kino {
        constructor() {
            this.network = new Lampa.Reguest();
        }

        async playMovie(card) {
            try {
                const title = (card.title || card.name || 'Фильм').trim();
                Lampa.Noty.show(`Поиск: ${title}`);
                Lampa.Loading.start();

                // Загружаем главную
                const html = await new Promise((resolve, reject) => {
                    this.network.silent(API_URL, resolve, reject);
                });

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const query = title.toLowerCase();
                let found = false;

                // Ищем по alt/title картинок
                doc.querySelectorAll('img[src*="/uploads/"]').forEach((img) => {
                    const alt = (img.alt || img.title || '').toLowerCase();
                    if (alt.includes(query)) {
                        found = true;
                        Lampa.Noty.show(`Найдено: ${alt}`);
                        setTimeout(() => {
                            Lampa.Utils.open(API_URL);
                            Lampa.Loading.stop();
                        }, 1200);
                    }
                });

                if (!found) {
                    Lampa.Noty.show('Не найдено на 4Kino');
                    Lampa.Loading.stop();
                }
            } catch (e) {
                console.error('[4Kino] Ошибка:', e);
                Lampa.Noty.show('Ошибка: ' + (e.message || 'сеть'));
                Lampa.Loading.stop();
            }
        }
    }

    // === НАДЁЖНОЕ ДОБАВЛЕНИЕ КНОПКИ ЧЕРЕЗ OBSERVER ===
    function waitForButtons(e, plugin) {
        const targetNode = document.body;
        if (!targetNode) return;

        const observer = new MutationObserver(() => {
            const container = document.querySelector('.full-start__buttons');
            if (container && !container.querySelector('.view--4kino')) {
                add4kinoButton(container, e, plugin);
                observer.disconnect(); // останавливаем наблюдение
            }
        });

        observer.observe(targetNode, {
            childList: true,
            subtree: true,
        });

        // Защита от вечного ожидания
        setTimeout(() => observer.disconnect(), 5000);
    }

    function add4kinoButton(container, e, plugin) {
        const button = document.createElement('div');
        button.className = 'full-start__button selector view--4kino';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                <rect width="48" height="48" rx="8" fill="currentColor" fill-opacity="0.3"/>
                <text x="50%" y="55%" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">4K</text>
            </svg>
            <span>4Kino</span>
        `;

        button.addEventListener('click', () => {
            const movie = e.data?.movie || e.data?.card;
            if (movie) plugin.playMovie(movie);
        });

        container.appendChild(button);
        console.log('[4Kino] Кнопка добавлена');
    }

    function startPlugin() {
        const plugin = new Plugin4kino();

        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                waitForButtons(e, plugin);
            }
        });
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
