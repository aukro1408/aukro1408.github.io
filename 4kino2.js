(function () {
    'use strict';

    const API_URL = 'https://4kino.cc'; // ← УБРАН ПРОБЕЛ!

    class Plugin4kino {
        constructor() {
            this.network = new Lampa.Reguest();
        }

        // Поиск фильма на 4kino.cc
        searchMovie(card) {
            return new Promise((resolve, reject) => {
                const searchQuery = this.buildSearchQuery(card);
                const searchUrl = `${API_URL}/index.php?do=search`;

                Lampa.Noty.show(`Поиск: ${searchQuery}`);

                this.network.silent(
                    searchUrl,
                    (data) => {
                        try {
                            const results = this.parseSearchResults(data, card);
                            if (results && results.length > 0) {
                                resolve(results[0]);
                            } else {
                                // Fallback: парсим главную, если поиск не дал результатов
                                this.parseMainPage(card).then(resolve).catch(reject);
                            }
                        } catch (e) {
                            reject(e);
                        }
                    },
                    (error) => {
                        console.error('[4Kino] Search error:', error);
                        // При ошибке тоже пробуем главную
                        this.parseMainPage(card).then(resolve).catch(reject);
                    },
                    {
                        method: 'POST',
                        data: {
                            do: 'search',
                            subaction: 'search',
                            story: searchQuery,
                        },
                    }
                );
            });
        }

        buildSearchQuery(card) {
            let query = card.title || card.name || card.original_title || '';
            const year =
                (card.release_date && card.release_date.split('-')[0]) ||
                (card.first_air_date && card.first_air_date.split('-')[0]) ||
                '';
            if (year) query += ' ' + year;
            return query.trim();
        }

        parseSearchResults(html, card) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const results = [];

            // На основе структуры из Knowledge Base: картинки с alt/title
            const images = doc.querySelectorAll('img[src*="/uploads/"]');
            images.forEach((img) => {
                const alt = img.alt || img.title || '';
                const parentLink = img.closest('a[href]');
                if (parentLink && alt && this.isMatch(alt, card)) {
                    results.push({
                        url: new URL(parentLink.href, API_URL).href,
                        title: alt,
                    });
                }
            });

            return results;
        }

        // Парсим главную страницу как fallback
        parseMainPage(card) {
            return new Promise((resolve, reject) => {
                this.network.silent(
                    API_URL,
                    (data) => {
                        try {
                            const results = this.parseSearchResults(data, card);
                            resolve(results.length > 0 ? results[0] : null);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    reject
                );
            });
        }

        // Простая проверка соответствия названия
        isMatch(title, card) {
            const query = (card.title || card.name || card.original_title || '')
                .toLowerCase()
                .replace(/[^a-z0-9а-яё]/g, '');
            const candidate = title.toLowerCase().replace(/[^a-z0-9а-яё]/g, '');
            return candidate.includes(query) || query.includes(candidate);
        }

        getPlayerLinks(movieUrl) {
            return new Promise((resolve, reject) => {
                this.network.silent(
                    movieUrl,
                    (data) => {
                        try {
                            const links = this.parsePlayerLinks(data);
                            resolve(links);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    reject
                );
            });
        }

        parsePlayerLinks(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = [];

            // Ищем iframe
            doc.querySelectorAll('iframe[src*="http"]').forEach((iframe) => {
                links.push({
                    url: iframe.src,
                    quality: '4K',
                    source: '4Kino (iframe)',
                });
            });

            // Ищем в скриптах
            const urlRegexes = [
                /file\s*:\s*["']([^"']+)["']/g,
                /src\s*:\s*["']([^"']+)["']/g,
                /pl\s*:\s*["']([^"']+)["']/g,
            ];

            doc.querySelectorAll('script').forEach((script) => {
                const text = script.textContent || '';
                urlRegexes.forEach((regex) => {
                    let match;
                    while ((match = regex.exec(text)) !== null) {
                        const url = match[1];
                        if (url && url.startsWith('http')) {
                            links.push({
                                url,
                                quality: '4K',
                                source: '4Kino (script)',
                            });
                        }
                    }
                });
            });

            return links;
        }

        async playMovie(card) {
            try {
                Lampa.Loading.start(() => {
                    Lampa.Loading.stop();
                    Lampa.Controller.toggle('content');
                });

                const searchResult = await this.searchMovie(card);
                if (!searchResult) {
                    Lampa.Noty.show('Фильм не найден на 4Kino');
                    Lampa.Loading.stop();
                    return;
                }

                const playerLinks = await this.getPlayerLinks(searchResult.url);
                if (playerLinks.length === 0) {
                    Lampa.Noty.show('Плеер не найден');
                    Lampa.Loading.stop();
                    return;
                }

                if (playerLinks.length === 1) {
                    this.openPlayer(playerLinks[0], card);
                } else {
                    this.showQualitySelector(playerLinks, card);
                }
            } catch (error) {
                console.error('[4Kino] Play error:', error);
                Lampa.Noty.show('Ошибка: ' + (error.message || 'неизвестно'));
                Lampa.Loading.stop();
            }
        }

        showQualitySelector(links, card) {
            const items = links.map((link) => ({
                title: `${link.quality} — ${link.source}`,
                url: link.url,
            }));

            Lampa.Select.show({
                title: '4Kino — качество',
                items,
                onSelect: (item) => {
                    this.openPlayer({ url: item.url, quality: item.title }, card);
                },
                onBack: () => Lampa.Controller.toggle('content'),
            });
            Lampa.Loading.stop();
        }

        openPlayer(link, card) {
            Lampa.Loading.stop();
            const title = card.title || card.name || '4Kino';
            Lampa.Player.play({
                title,
                url: link.url,
                quality: link.quality,
            });
            Lampa.Player.playlist([{ title, url: link.url }]);
        }
    }

    function startPlugin() {
        console.log('[4Kino] Plugin starting...');
        const plugin = new Plugin4kino();

        // Регистрация как источник (опционально)
        Lampa.Component.add('online_4kino', {
            name: '4Kino',
            component: plugin,
        });

        // Добавление в манифест
        if (Lampa.Manifest?.plugins) {
            Lampa.Manifest.plugins.push({
                author: '@custom',
                name: '4Kino',
                descr: 'Источник 4kino.cc',
                version: '1.1.0',
            });
        }

        // Добавление кнопки
        Lampa.Listener.follow('full', (e) => {
            if (e.type !== 'complite') return;

            setTimeout(() => {
                try {
                    const movie = e.data.movie || e.data.card || e.data.item;
                    if (!movie) return;

                    const button = $(`
                        <div class="full-start__button selector view--online_4kino">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 48 48" width="48" height="48">
                                <rect width="48" height="48" rx="8" fill="currentColor" fill-opacity="0.3"/>
                                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">4K</text>
                            </svg>
                            <span>4Kino</span>
                        </div>
                    `);

                    button.on('click', () => {
                        console.log('[4Kino] Play requested for:', movie);
                        plugin.playMovie(movie);
                    });

                    // Надёжная вставка
                    const container = $('.full-start__buttons, .full-start').first();
                    if (container.length) {
                        container.append(button);
                        console.log('[4Kino] Button added');
                    }
                } catch (err) {
                    console.error('[4Kino] Button error:', err);
                }
            }, 500);
        });

        console.log('[4Kino] Plugin ready');
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
