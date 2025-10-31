(function () {
    'use strict';

    const API_URL = 'https://4kino.cc';

    class Plugin4kino {
        async manifest() {
            return {
                name: '4Kino',
                version: '1.0',
                provider: '4kino',
                icon: '',
            };
        }

        async search(card) {
            try {
                // Загружаем главную страницу
                const html = await new Promise((resolve, reject) => {
                    new Lampa.Reguest().silent(API_URL, resolve, reject);
                });

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const query = (card.title || card.name || '').toLowerCase();

                // Ищем картинки с совпадением по названию
                const images = doc.querySelectorAll('img[src*="/uploads/"]');
                for (const img of images) {
                    const alt = (img.alt || img.title || '').toLowerCase();
                    const link = img.closest('a[href]');
                    if (link && alt.includes(query)) {
                        const movieUrl = new URL(link.href, API_URL).href;
                        // Так как на сайте нет плееров — просто возвращаем ссылку на сайт
                        return [
                            {
                                url: movieUrl,
                                quality: '4K',
                                source: '4Kino',
                                type: 'video',
                                title: alt,
                            },
                        ];
                    }
                }

                return []; // не найдено

            } catch (e) {
                console.error('[4Kino] Search error:', e);
                return [];
            }
        }
    }

    function init() {
        // Регистрация как online-источника
        Lampa.Component.add('online', {
            name: '4Kino',
            component: new Plugin4kino(),
        });

        // Добавляем в манифест
        if (Lampa.Manifest?.plugins) {
            Lampa.Manifest.plugins.push({
                name: '4Kino',
                author: '@custom',
                descr: 'Фильмы в 4K с 4kino.cc',
                version: '1.0',
            });
        }

        console.log('[4Kino] Registered as online source');
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') init();
        });
    }
})();
