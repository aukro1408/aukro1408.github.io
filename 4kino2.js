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

        async playMovie(card) {
            try {
                Lampa.Noty.show('Поиск на FanFilm4K...');
                Lampa.Loading.start();

                const searchResults = await this.searchMovie(card);
                if (!searchResults.length) {
                    Lampa.Noty.show('Фильм не найден');
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

            } catch (err) {
                console.error('[FanFilm4K] Ошибка:', err);
                Lampa.Noty.show('Ошибка загрузки');
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

    // --- Добавление кнопки рядом с uTorrent ---
    function addFanFilm4KButton(e, plugin) {
        const container = document.querySelector('.full-start__buttons');
        if (!container) return;

        // Проверка, чтобы кнопка не дублировалась
        if (container.querySelector('.view--fanfilm4k')) return;

        const button = document.createElement('div');
        button.className = 'full-start__button selector view--fanfilm4k';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                <rect width="48" height="48" rx="8" fill="currentColor" fill-opacity="0.3"/>
                <text x="50%" y="55%" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">4K</text>
            </svg>
            <span>FanFilm4K</span>
        `;

        button.addEventListener('click', () => {
            const movie = e.data?.movie || e.data?.card || e.data?.data;
            if (!movie) {
                Lampa.Noty.show('Ошибка: нет данных фильма');
                return;
            }
            plugin.playMovie(movie);
        });

        // Вставляем после кнопки uTorrent, если есть
        const uTorrentButton = container.querySelector('.view--torrent');
        if (uTorrentButton) uTorrentButton.after(button);
        else container.appendChild(button);

        console.log('[FanFilm4K] Кнопка добавлена рядом с uTorrent');
    }

    // --- Инициализация плагина ---
    function startPlugin() {
        const plugin = new PluginFanFilm4K();

        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') addFanFilm4KButton(e, plugin);
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', (e) => { if (e.type === 'ready') startPlugin(); });

})();
