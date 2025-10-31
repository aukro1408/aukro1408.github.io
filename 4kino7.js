(function() {
    'use strict';

    const API_URL = 'https://4kino.cc';

    class Plugin4kino {
        constructor() {
            this.network = new Lampa.Reguest();
        }

        // Поиск фильма на 4kino.cc
        searchMovie(card) {
            return new Promise((resolve, reject) => {
                const searchQuery = this.buildSearchQuery(card);
                const searchUrl = `${API_URL}/index.php?do=search`;
                
                this.network.silent(searchUrl, (data) => {
                    try {
                        const results = this.parseSearchResults(data, card);
                        resolve(results);
                    } catch (e) {
                        reject(e);
                    }
                }, (error) => {
                    reject(error);
                }, {
                    method: 'POST',
                    data: {
                        do: 'search',
                        subaction: 'search',
                        story: searchQuery
                    }
                });
            });
        }

        // Формирование поискового запроса
        buildSearchQuery(card) {
            let query = '';
            
            if (card.title) {
                query = card.title;
            } else if (card.name) {
                query = card.name;
            } else if (card.original_title) {
                query = card.original_title;
            }
            
            // Добавляем год для более точного поиска
            if (card.release_date) {
                const year = card.release_date.split('-')[0];
                query += ' ' + year;
            } else if (card.first_air_date) {
                const year = card.first_air_date.split('-')[0];
                query += ' ' + year;
            }
            
            return query;
        }

        // Парсинг результатов поиска
        parseSearchResults(html, card) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Ищем ссылки на фильмы (структура может отличаться)
            const items = doc.querySelectorAll('.short-item, .movie-item, article, .eBlock');
            const results = [];
            
            items.forEach(item => {
                const link = item.querySelector('a');
                const title = item.querySelector('.title, h2, h3, .eTitle');
                
                if (link && link.href) {
                    results.push({
                        url: link.href,
                        title: title ? title.textContent.trim() : ''
                    });
                }
            });
            
            return results.length > 0 ? results[0] : null;
        }

        // Получение ссылок на плеер
        getPlayerLinks(movieUrl) {
            return new Promise((resolve, reject) => {
                this.network.silent(movieUrl, (data) => {
                    try {
                        const links = this.parsePlayerLinks(data);
                        resolve(links);
                    } catch (e) {
                        reject(e);
                    }
                }, reject);
            });
        }

        // Парсинг ссылок на плеер
        parsePlayerLinks(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = [];
            
            // Ищем iframe с плеером
            const iframes = doc.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                if (iframe.src && iframe.src.includes('http')) {
                    links.push({
                        url: iframe.src,
                        quality: '4K',
                        source: '4Kino'
                    });
                }
            });
            
            // Ищем data-атрибуты или скрипты с плеером
            const scripts = doc.querySelectorAll('script');
            scripts.forEach(script => {
                const content = script.textContent;
                
                // Ищем различные форматы ссылок
                const urlPatterns = [
                    /file["']?\s*:\s*["']([^"']+)["']/g,
                    /src["']?\s*:\s*["']([^"']+)["']/g,
                    /iframe\.src\s*=\s*["']([^"']+)["']/g,
                    /pl:\s*["']([^"']+)["']/g
                ];
                
                urlPatterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(content)) !== null) {
                        if (match[1] && match[1].includes('http')) {
                            links.push({
                                url: match[1],
                                quality: '4K',
                                source: '4Kino'
                            });
                        }
                    }
                });
            });
            
            return links;
        }

        // Воспроизведение фильма
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
                    Lampa.Noty.show('Не удалось найти плеер');
                    Lampa.Loading.stop();
                    return;
                }
                
                // Показываем список качеств или открываем первую ссылку
                if (playerLinks.length === 1) {
                    this.openPlayer(playerLinks[0], card);
                } else {
                    this.showQualitySelector(playerLinks, card);
                }
                
            } catch (error) {
                console.error('4Kino error:', error);
                Lampa.Noty.show('Ошибка при загрузке: ' + error.message);
                Lampa.Loading.stop();
            }
        }

        // Показ селектора качества
        showQualitySelector(links, card) {
            const items = links.map((link, index) => ({
                title: `${link.quality} - ${link.source}`,
                url: link.url
            }));
            
            Lampa.Select.show({
                title: 'Выберите качество',
                items: items,
                onSelect: (item) => {
                    this.openPlayer({url: item.url, quality: item.title}, card);
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

    // Инициализация плагина
    function startPlugin() {
        console.log('[4Kino] Starting plugin...');
        
        const plugin = new Plugin4kino();
        
        // Метод 1: Используем API Lampa для добавления источника онлайн
        Lampa.Component.add('online_4kino', {
            name: '4Kino',
            component: plugin
        });
        
        // Метод 2: Добавляем кнопку через API источников
        if (Lampa.Manifest && Lampa.Manifest.plugins) {
            Lampa.Manifest.plugins.push({
                author: '@custom',
                name: '4Kino',
                descr: 'Источник 4kino.cc',
                version: '1.0.0'
            });
        }
        
        // Метод 3: Перехватываем создание карточки
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                console.log('[4Kino] Full card loaded, adding button');
                
                setTimeout(() => {
                    try {
                        // Создаем кнопку
                        const button = $('<div class="full-start__button selector view--online_4kino">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 48 48" width="48" height="48">' +
                            '<rect width="48" height="48" rx="8" fill="currentColor" fill-opacity="0.3"/>' +
                            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">4K</text>' +
                            '</svg>' +
                            '<span>4Kino</span>' +
                            '</div>');
                        
                        // Добавляем обработчик клика
                        button.on('click', () => {
                            plugin.playMovie(e.data.movie);
                        });
                        
                        // Находим контейнер с кнопками и добавляем нашу кнопку
                        const buttonsContainer = $('.full-start__buttons');
                        if (buttonsContainer.length) {
                            buttonsContainer.append(button);
                            console.log('[4Kino] Button added successfully');
                        } else {
                            console.log('[4Kino] Buttons container not found');
                        }
                        
                        // Альтернативный метод - добавляем после других кнопок
                        const lastButton = $('.full-start__button').last();
                        if (lastButton.length && !buttonsContainer.length) {
                            lastButton.after(button);
                            console.log('[4Kino] Button added after last button');
                        }
                        
                    } catch (err) {
                        console.error('[4Kino] Error adding button:', err);
                    }
                }, 300);
            }
        });
        
        console.log('[4Kino] Plugin loaded successfully');
    }

    // Проверяем готовность Lampa
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

})();
