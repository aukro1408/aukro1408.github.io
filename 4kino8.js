(function() {
    'use strict';

    const manifest = {
        id: '4kino',
        name: '4Kino',
        description: 'Плагин для просмотра фильмов с 4kino.cc',
        version: '1.0.0',
        author: 'Custom'
    };

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
            const items = doc.querySelectorAll('.short-item, .movie-item, article');
            const results = [];
            
            items.forEach(item => {
                const link = item.querySelector('a');
                const title = item.querySelector('.title, h2, h3');
                
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
                if (iframe.src) {
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
                    /iframe\.src\s*=\s*["']([^"']+)["']/g
                ];
                
                urlPatterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(content)) !== null) {
                        if (match[1].includes('http')) {
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

        // Создание кнопки источника
        createSourceButton(card) {
            const button = Lampa.Template.get('button_player', {
                text: '4Kino'
            });
            
            button.on('hover:enter', () => {
                Lampa.Loading.start(() => {
                    Lampa.Loading.stop();
                    Lampa.Controller.toggle('content');
                });
                
                this.playMovie(card);
            });
            
            return button;
        }

        // Воспроизведение фильма
        async playMovie(card) {
            try {
                Lampa.Noty.show('Поиск на 4Kino...');
                
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
        window.plugin_4kino_ready = true;
        
        const plugin = new Plugin4kino();
        
        // Добавляем кнопку в карточку фильма
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                const button = plugin.createSourceButton(e.data.movie);
                e.object.player.append(button);
            }
        });
        
        console.log('4Kino plugin loaded successfully');
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
