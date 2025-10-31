(function () {
    'use strict';

    const API_URL = 'https://4kino.cc';

    class Plugin4kino {
        constructor() {
            this.network = new Lampa.Reguest();
        }

        // Главный метод — вызывается Lampa автоматически
        async manifest() {
            return {
                version: '1.0',
                provider: '4kino',
                name: '4Kino',
                icon: '', // можно оставить пустым
            };
        }

        async search(card) {
            try {
                // Парсим главную страницу (поиск на сайте не работает)
                const html = await this.request(API_URL);
                const results = this.parseMainPage(html, card);

                if (results.length === 0) return [];

                // Берём первый совпадающий
                const moviePage = await this.request(results[0].url);
                const links = this.parsePlayerLinks(moviePage);

                return links.map((link) => ({
                    url: link.url,
                    quality: link.quality,
                    source: '4Kino',
                    type: 'video',
                }));
            } catch (e) {
                console.error('[4Kino] Search error:', e);
                return [];
            }
        }

        request(url) {
            return new Promise((resolve, reject) => {
                this.network.silent(url, resolve, reject);
            });
        }

        parseMainPage(html, card) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const results = [];

            const images = doc.querySelectorAll('img[src*="/uploads/"]');
            const query = (card.title || card.name || '').toLowerCase();

            images.forEach((img) => {
                const alt = (img.alt || img.title || '').toLowerCase();
                const link = img.closest('a[href]');
                if (link && alt && alt.includes(query)) {
                    results.push({
                        url: new URL(link.href, API_URL).href,
                        title: alt,
                    });
                }
            });

            return results;
        }

        parsePlayerLinks(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = [];

            doc.querySelectorAll('iframe[src*="http"]').forEach((iframe) => {
                links.push({
                    url: iframe.src,
                    quality: '4K',
                });
            });

            // Можно добавить парсинг скриптов, если нужно

            return links;
        }
    }

    // Регистрация плагина в системе Lampa
    function init() {
        const plugin = new Plugin4kino();

        // Добавляем как online-источник
        Lampa.Component.add('online', {
            name: '4Kino',
            component: plugin,
        });

        // Добавляем в манифест для отображения в настройках
        if (Lampa.Manifest?.plugins) {
            Lampa.Manifest.plugins.push({
                author: '@custom',
                name: '4Kino',
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
