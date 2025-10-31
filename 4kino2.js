(function () {
    'use strict';

    const API_URL = 'https://4kino.cc'; // ← УБРАН ПРОБЕЛ!

    class Plugin4kino {
        constructor() {
            this.network = new Lampa.Reguest();
        }

        // Вместо поиска — парсим главную и ищем совпадение по названию
        searchMovie(card) {
            return new Promise((resolve, reject) => {
                const query = (card.title || card.name || card.original_title || '').toLowerCase().trim();

                this.network.silent(
                    API_URL,
                    (html) => {
                        try {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const images = doc.querySelectorAll('img[src*="/uploads/"]');

                            for (const img of images) {
                                const alt = (img.alt || img.title || '').toLowerCase();
                                const link = img.closest('a[href]');
                                if (link && alt.includes(query)) {
                                    resolve({
                                        url: new URL(link.href, API_URL).href,
                                        title: alt,
                                    });
                                    return;
                                }
                            }
                            resolve(null); // не найдено
                        } catch (e) {
                            reject(e);
                        }
                    },
                    reject
                );
            });
        }

        // getPlayerLinks оставим, но на практике он вернёт пусто
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

            doc.querySelectorAll('iframe[src*="http"]').forEach((iframe) => {
                links.push({
                    url: iframe.src,
                    quality: '4K',
                    source: '4Kino'
                });
            });

            const scripts = doc.querySelectorAll('script');
            const patterns = [
                /file["']?\s*:\s*["']([^"']+)["']/g,
                /src["']?\s*:\s*["']([^"']+)["']/g,
                /pl:\s*["']([^"']+)["']/g
            ];

            scripts.forEach(script => {
                const content = script.textContent || '';
                patterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(content)) !== null) {
                        if (match[1] && match[1].startsWith('http')) {
                            links.push({ url: match[1], quality: '4K', source: '4Kino' });
                        }
                    }
                });
            });

            return links;
        }

        async playMovie(card) {
            try {
                Lampa.Noty.show('Поиск на 4Kino...');
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
                    // Так как плееров нет — просто открываем сайт
                    Lampa.Noty.show('Плеер не найден. Открываем сайт…');
                    setTimeout(() => {
                        Lampa.Utils.open(searchResult.url);
                        Lampa.Loading.stop();
                    }, 1500);
                    return;
                }

                if (playerLinks.length === 1) {
                    this.openPlayer(playerLinks[0], card);
                } else {
                    this.showQualitySelector(playerLinks, card);
                }
            } catch (error) {
                console.error('4Kino error:', error);
                Lampa.Noty.show('Ошибка: ' + (error.message || 'неизвестно'));
                Lampa.Loading.stop();
            }
        }

        showQualitySelector(links, card) {
            const items = links.map((link) => ({
                title: `${link.quality} - ${link.source}`,
                url: link.url
            }));

            Lampa.Select.show({
                title: 'Выберите качество',
                items: items,
                onSelect: (item) => {
                    this.openPlayer({ url: item.url, quality: item.title }, card);
                },
                onBack: () => Lampa.Controller.toggle('content')
            });
            Lampa.Loading.stop();
        }

        openPlayer(link, card) {
            Lampa.Loading.stop();
            const title = card.title || card.name || '4Kino';
            Lampa.Player.play({ title, url: link.url, quality: link.quality });
            Lampa.Player.playlist([{ title, url: link.url }]);
        }
    }

    function startPlugin() {
        console.log('[4Kino] Starting plugin...');
        const plugin = new Plugin4kino();

        Lampa.Component.add('online_4kino', { name: '4Kino', component: plugin });

        if (Lampa.Manifest && Lampa.Manifest.plugins) {
            Lampa.Manifest.plugins.push({
                author: '@custom',
                name: '4Kino',
                descr: 'Источник 4kino.cc',
                version: '1.0.1'
            });
        }

        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                console.log('[4Kino] Full card loaded, adding button');

                setTimeout(() => {
                    try {
                        const button = $('<div class="full-start__button selector view--online_4kino">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 48 48" width="48" height="48">' +
                            '<rect width="48" height="48" rx="8" fill="currentColor" fill-opacity="0.3"/>' +
                            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">4K</text>' +
                            '</svg>' +
                            '<span>4Kino</span>' +
                            '</div>');

                        button.on('click', () => {
                            plugin.playMovie(e.data.movie);
                        });

                        const buttonsContainer = $('.full-start__buttons');
                        if (buttonsContainer.length) {
                            buttonsContainer.append(button);
                            console.log('[4Kino] Button added to container');
                        } else {
                            const lastButton = $('.full-start__button').last();
                            if (lastButton.length) {
                                lastButton.after(button);
                                console.log('[4Kino] Button added after last button');
                            } else {
                                console.log('[4Kino] No place to insert button');
                            }
                        }
                    } catch (err) {
                        console.error('[4Kino] Error adding button:', err);
                    }
                }, 300);
            }
        });

        console.log('[4Kino] Plugin loaded successfully');
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
