(function () {
    'use strict';

    const API_URL = 'https://v4.fanfilm4k.media';

    class PluginFanFilm4K {
        constructor() {
            this.network = new Lampa.Request();
        }

        buildSearchQuery(card) {
            let query = card.title || card.name || card.original_title || '';
            if (card.release_date) query += ' ' + card.release_date.split('-')[0];
            else if (card.first_air_date) query += ' ' + card.first_air_date.split('-')[0];
            return query.trim();
        }

        async searchMovie(card) {
            const query = this.buildSearchQuery(card);
            const url = API_URL + '/index.php?do=search';

            try {
                const html = await Lampa.Utils.request(url, {
                    method: 'POST',
                    body: Lampa.Utils.makeFormData({
                        do: 'search',
                        subaction: 'search',
                        story: query
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Referer': API_URL + '/',
                        'User-Agent': 'Mozilla/5.0 (LampaPlugin)'
                    }
                });

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // !!! Обновите селектор под актуальный на сайте !!!
                const items = doc.querySelectorAll('.movie-item a'); 
                const results = [];

                items.forEach(item => {
                    const url = item.href.startsWith('http') ? item.href : API_URL + item.href;
                    const title = item.textContent.trim();
                    results.push({ title, url });
                });

                return results;

            } catch (err) {
                console.error('[FanFilm4K] Ошибка поиска:', err);
                return [];
            }
        }

        async getPlayerLinks(movieUrl) {
            try {
                const html = await Lampa.Utils.request(movieUrl, {
                    headers: {
                        'Referer': API_URL + '/',
                        'User-Agent': 'Mozilla/5.0 (LampaPlugin)'
                    }
                });

                const links = [];
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // iframe
                doc.querySelectorAll('iframe').forEach(frame => {
                    if (frame.src && frame.src.startsWith('http')) {
                        links.push({ url: frame.src, quality: 'HD', source: 'FanFilm4K' });
                    }
                });

                // ссылки из скриптов
                doc.querySelectorAll('script').forEach(script => {
                    const regex = /['"](https?:\/\/[^'"]+)['"]/g;
                    let match;
                    while ((match = regex.exec(script.textContent)) !== null) {
                        if (match[1].includes('player') || match[1].includes('video')) {
                            links.push({ url: match[1], quality: 'HD', source: 'FanFilm4K' });
                        }
                    }
                });

                return links;

            } catch (err) {
                console.error('[FanFilm4K] Ошибка плееров:', err);
                return [];
            }
        }
    }

    // --- Добавление источника в Lampa ---
    function startPlugin() {
        const plugin = new PluginFanFilm4K();

        Lampa.Component.add('online_fanfilm4k', {
            name: 'FanFilm4K',
            icon: 'https://v4.fanfilm4k.media/favicon.ico',
            component: {
                search: async (card) => {
                    const results = await plugin.searchMovie(card);
                    const items = [];

                    for (const r of results) {
                        const links = await plugin.getPlayerLinks(r.url);
                        for (const l of links) {
                            items.push({
                                title: r.title,
                                url: l.url,
                                quality: l.quality,
                                source: l.source
                            });
                        }
                    }

                    return items;
                }
            }
        });

        console.log('[FanFilm4K] Источник добавлен в список источников');
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', (e) => { if (e.type === 'ready') startPlugin(); });

})();
