(function () {
    'use strict';

    const API_URL = 'https://4kino.cc';

    class Plugin4Kino {
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

                const list = [];
                const regex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
                let match;
                while ((match = regex.exec(html)) !== null) {
                    const link = match[1].startsWith('http') ? match[1] : API_URL + match[1];
                    list.push({ title: match[2], url: link });
                }

                console.log('[4Kino] search result:', list);
                return list;

            } catch (e) {
                console.error('[4Kino] Ошибка запроса:', e);
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
                        links.push({ url: frame.src, quality: 'HD', source: '4Kino' });
                    }
                });

                // скрипты
                doc.querySelectorAll('script').forEach(script => {
                    const regex = /['"](https?:\/\/[^'"]+)['"]/g;
                    let match;
                    while ((match = regex.exec(script.textContent)) !== null) {
                        if (match[1].includes('player') || match[1].includes('video')) {
                            links.push({ url: match[1], quality: 'HD', source: '4Kino' });
                        }
                    }
                });

                return links;
            } catch (e) {
                console.error('[4Kino] Ошибка плееров:', e);
                return [];
            }
        }

        async playMovie(card) {
            try {
                Lampa.Noty.show('Поиск на 4Kino...');
                Lampa.Loading.start();

                const searchResults = await this.searchMovie(card);
                if (!searchResults.length) {
                    Lampa.Noty.show('Фильм не найден на 4Kino');
                    Lampa.Loading.stop();
                    return;
                }

                const movieUrl = searchResults[0].url;
                const links = await this.getPlayerLinks(movieUrl);

                if (!links.length) {
                    Lampa.Noty.show('Плееры не найдены');
                    Lampa.Loading.stop();
                    return;
                }

                if (links.length === 1) this.openPlayer(links[0], card);
                else this.showQualitySelector(links, card);

            } catch (e) {
                console.error('[4Kino] Ошибка:', e);
                Lampa.Noty.show('Ошибка загрузки 4Kino');
                Lampa.Loading.stop();
            }
        }

        showQualitySelector(links, card) {
            const items = links.map(link => ({ title: `${link.quality} - ${link.source}`, url: link.url }));
            Lampa.Select.show({
                title: 'Выберите качество',
                items,
                onSelect: (item) => this.openPlayer({ url: item.url, quality: item.title }, card),
                onBack: () => Lampa.Controller.toggle('content')
            });
            Lampa.Loading.stop();
        }

        openPlayer(link, card) {
            Lampa.Loading.stop();
            Lampa.Player.play({ title: card.title || card.name, url: link.url, quality: link.quality });
            Lampa.Player.playlist([{ title: card.title || card.name, url: link.url }]);
        }
    }

    // --- Вставка кнопки через MutationObserver ---
    function add4KinoButton(plugin, e) {
        const observer = new MutationObserver((mutations, obs) => {
            const container = document.querySelector('.full-start__buttons, .full-start__buttons.scroll');
            if (container) {
                if (container.querySelector('.view--4kino')) {
                    obs.disconnect();
                    return;
                }

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
                    const movie = e.data.movie || e.data.card || e.data.data;
                    if (!movie) {
                        Lampa.Noty.show('Ошибка: нет данных фильма');
                        return;
                    }
                    plugin.playMovie(movie);
                });

                container.appendChild(button);
                console.log('[4Kino] Button added!');
                obs.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function startPlugin() {
        const plugin = new Plugin4Kino();
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') add4KinoButton(plugin, e);
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', (e) => { if (e.type === 'ready') startPlugin(); });

})();
