(function () {
    'use strict';

    const API_URL = 'https://4kino.cc';

    // Парсим главную — это всё, что есть на сайте
    function parseMainPage(html, card) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const query = (card.title || card.name || '').toLowerCase().trim();

        // Ищем картинки с alt/title
        const images = doc.querySelectorAll('img[src*="/uploads/"]');
        for (const img of images) {
            const alt = (img.alt || img.title || '').toLowerCase();
            const link = img.closest('a[href]');
            if (link && alt && alt.includes(query)) {
                return new URL(link.href, API_URL).href;
            }
        }
        return null;
    }

    // Ищем плеер на странице фильма
    function parsePlayer(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const iframes = doc.querySelectorAll('iframe[src*="http"]');
        return Array.from(iframes)
            .map((f) => f.src)
            .filter(Boolean);
    }

    // Основной класс плагина
    class Plugin4kino {
        async manifest() {
            return { name: '4Kino', version: '1.0' };
        }

        async search(card) {
            try {
                // Загружаем главную
                const html = await new Promise((resolve, reject) => {
                    new Lampa.Reguest().silent(API_URL, resolve, reject);
                });

                const movieUrl = parseMainPage(html, card);
                if (!movieUrl) return [];

                // Загружаем страницу фильма
                const pageHtml = await new Promise((resolve, reject) => {
                    new Lampa.Reguest().silent(movieUrl, resolve, reject);
                });

                const urls = parsePlayer(pageHtml);
                return urls.map((url) => ({
                    url,
                    quality: '4K',
                    source: '4Kino',
                    type: 'video',
                }));
            } catch (e) {
                console.error('[4Kino] Error:', e);
                return [];
            }
        }
    }

    // Регистрация
    function init() {
        Lampa.Component.add('online', {
            name: '4Kino',
            component: new Plugin4kino(),
        });

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
