(function () {
    'use strict';

    const API_URL = 'https://4kino.cc';

    class Plugin4Kino {
        constructor() {
            this.network = new Lampa.Request();
        }

        // Поиск фильма
        async searchMovie(card) {
            return new Promise((resolve, reject) => {
                const query = this.buildSearchQuery(card);
                const url = Lampa.Utils.protocol() + 'proxy/' + encodeURIComponent(`${API_URL}/index.php?do=search`);

                this.network.silent(url, (html) => {
                    try {
                        const results = this.parseSearchResults(html);
                        resolve(results);
                    } catch (e) {
                        reject(e);
                    }
                }, reject, {
                    method: 'POST',
                    data: {
                        do: 'search',
                        subaction: 'search',
                        story: query
                    }
                });
            });
        }

        // Формирование поискового запроса
        buildSearchQuery(card) {
            let query = card.title || card.name || card.original_title || '';
            if (card.release_date) {
                query += ' ' + card.release_date.split('-')[0];
            } else if (card.first_air_date) {
                query += ' ' + card.first_air_date.split('-')[0];
            }
            return query.trim();
        }

        // Парсинг результатов поиска
        parseSearchResults(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const items = doc.querySelectorAll('article a[href*="/"]');
            const results = [];

            items.forEach(a => {
                const title = a.textContent.trim();
                const url = a.href;
                if (url && title) results.push({ title, url });
            });

            return results.length ? results[0] : null;
        }

        // Получаем плееры
        async getPlayerLinks(movieUrl) {
            return new Promise((resolve, reject) => {
                const proxiedUrl = Lampa.Utils.protocol() + 'proxy/' + encodeURIComponent(movieUrl);

                this.network.silent(proxiedUrl, (html) => {
                    try {
                        const links = this.parsePlayerLinks(html);
                        resolve(links);
                    } catch (e) {
                        reject(e);
                    }
                }, reject);
            });
        }

        // Парсим ссылки на плеер
        parsePlayerLinks(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = [];

            // iframe
            doc.querySelectorAll('iframe').forEach(frame => {
                if (frame.src && frame.src.startsWith('http')) {
                    links.push({
                        url: frame.src,
                        quality: 'HD',
                        source: '4Kino'
                    });
                }
            });

            // Скрипты
            doc.querySelectorAll('script').forEach(script => {
                const text = script.textContent;
                const regex = /['"](https?:\/\/[^'"]+)['"]/g;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    if (match[1].includes('player') || match[1].includes('video')) {
                        links.push({
                            url: match[1],
                            quality: 'HD',
                            source: '4Kino'
                        });
                    }
                }
            });

            return links;
        }

        // Воспроизведение
        async playMovie(card) {
            try {
                Lampa.Noty.show('Поиск источников на 4Kino...');
                Lampa.Loading.start();

                const search = await this.searchMovie(card);
                if (!search) {
                    Lampa.Noty.show('Фильм не найден на 4Kino');
                    Lampa.Loading.stop();
                    return;
                }

                const links = await this.getPlayerLinks(search.url);
                if (!links.length) {
                    Lampa.Noty.show('Плееры не найдены');
                    Lampa.Loading.stop();
                    return;
                }

                if (links.length === 1) {
                    this.openPlayer(links[0], card);
                } else {
                    this.showQualitySelector(links, card);
                }
            } catch (e) {
                console.error('[4Kino] Ошибка:', e);
                Lampa.Noty.show('Ошибка: ' + e.message);
                Lampa.Loading.stop();
            }
        }

        // Меню выбора качества
        showQualitySelector(links, card) {
            const items = links.map(link => ({
                title: `${link.quality} - ${link.source}`,
                url: link.url
            }));

            Lampa.Select.show({
                title: 'Выберите качество',
                items,
                onSelect: (item) => {
                    this.openPlayer({ url: item.url, quality: item.title }, card);
                },
                onBack: () => {
                    Lampa.Controller.toggle('content');
                }
            });

            Lampa.Loading.stop();
        }

        // Открытие плеера
        openPlayer(link, card) {
            Lampa.Loading.stop();

            Lampa.Player.play({
                title: card.title || card.name,
                url: link.url,
                quality: link.quality
            });

            Lampa.Player.playlist([{
                title: card.title || card.name,
                url: link.url
            }]);
        }
    }

    // Запуск плагина
    function startPlugin() {
        console.log('[4Kino] Plugin started');
        const plugin = new Plugin4Kino();

        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                const interval = setInterval(() => {
                    const buttonsContainer = $('.full-start__buttons');
                    if (buttonsContainer.length) {
                        clearInterval(interval);

                        if ($('.view--4kino').length) return; // уже есть

                        const button = $(`
                            <div class="full-start__button selector view--4kino" data-name="4kino">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                                    <rect width="48" height="48" rx="8" fill="currentColor" fill-opacity="0.3"/>
                                    <text x="50%" y="55%" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">4K</text>
                                </svg>
                                <span>4Kino</span>
                            </div>
                        `);

                        button.on('hover:enter', () => {
                            const movie = e.data.movie || e.data.card || e.data.data;
                            plugin.playMovie(movie);
                        });

                        buttonsContainer.append(button);
                        console.log('[4Kino] Button added');
                    }
                }, 200);
            }
        });
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') startPlugin();
        });
    }

})();
