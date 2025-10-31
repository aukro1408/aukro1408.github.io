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
                console.log('[4Kino] Searching for:', searchQuery);
                
                const searchUrl = `${API_URL}/index.php?do=search`;
                
                this.network.silent(searchUrl, (data) => {
                    try {
                        console.log('[4Kino] Search response received');
                        const results = this.parseSearchResults(data, card);
                        console.log('[4Kino] Parse results:', results);
                        resolve(results);
                    } catch (e) {
                        console.error('[4Kino] Parse error:', e);
                        reject(e);
                    }
                }, (error) => {
                    console.error('[4Kino] Network error:', error);
                    reject(error);
                }, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: `do=search&subaction=search&story=${encodeURIComponent(searchQuery)}`
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
            
            // Различные селекторы для поиска элементов фильмов
            const selectors = [
                '.short-item a',
                '.movie-item a',
                'article a',
                '.eBlock a',
                '.short a',
                '.story a',
                '.film-item a',
                '.item a'
            ];
            
            let results = [];
            
            for (let selector of selectors) {
                const items = doc.querySelectorAll(selector);
                items.forEach(link => {
                    if (link.href && link.href.includes(API_URL)) {
                        const titleEl = link.querySelector('.title, h2, h3, .eTitle, .name') || link;
                        results.push({
                            url: link.href,
                            title: titleEl.textContent.trim()
                        });
                    }
                });
                
                if (results.length > 0) break;
            }
            
            console.log('[4Kino] Found results:', results.length);
            return results.length > 0 ? results[0] : null;
        }

        // Получение ссылок на плеер
        getPlayerLinks(movieUrl) {
            return new Promise((resolve, reject) => {
                console.log('[4Kino] Getting player from:', movieUrl);
                
                this.network.silent(movieUrl, (data) => {
                    try {
                        const links = this.parsePlayerLinks(data);
                        console.log('[4Kino] Found links:', links.length);
                        resolve(links);
                    } catch (e) {
                        console.error('[4Kino] Parse player error:', e);
                        reject(e);
                    }
                }, (error) => {
                    console.error('[4Kino] Network error:', error);
                    reject(error);
                });
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
                const src = iframe.src || iframe.getAttribute('data-src');
                if (src && (src.includes('http') || src.startsWith('//'))) {
                    const fullUrl = src.startsWith('//') ? 'https:' + src : src;
                    links.push({
                        url: fullUrl,
                        quality: '1080p',
                        source: '4Kino'
                    });
                    console.log('[4Kino] Found iframe:', fullUrl);
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
                    /pl:\s*["']([^"']+)["']/g,
                    /player_iframe\s*=\s*["']([^"']+)["']/g,
                    /video_url\s*=\s*["']([^"']+)["']/g
                ];
                
                urlPatterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(content)) !== null) {
                        if (match[1] && (match[1].includes('http') || match[1].startsWith('//'))) {
                            const fullUrl = match[1].startsWith('//') ? 'https:' + match[1] : match[1];
                            links.push({
                                url: fullUrl,
                                quality: '1080p',
                                source: '4Kino'
                            });
                            console.log('[4Kino] Found script url:', fullUrl);
                        }
                    }
                });
            });
            
            return links;
        }

        // Воспроизведение фильма
        async playMovie(card) {
            console.log('[4Kino] playMovie called for:', card.title || card.name);
            
            try {
                Lampa.Noty.show('Поиск на 4Kino...');
                
                Lampa.Loading.start(() => {
                    console.log('[4Kino] Loading cancelled');
                    Lampa.Loading.stop();
                    Lampa.Controller.toggle('content');
                });
                
                const searchResult = await this.searchMovie(card);
                
                if (!searchResult) {
                    Lampa.Noty.show('Фильм не найден на 4Kino');
                    Lampa.Loading.stop();
                    return;
                }
                
                console.log('[4Kino] Movie found:', searchResult.url);
                Lampa.Noty.show('Загрузка плеера...');
                
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
                console.error('[4Kino] Error:', error);
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
            console.log('[4Kino] Opening player:', link.url);
            Lampa.Loading.stop();
            
            try {
                Lampa.Player.play({
                    title: card.title || card.name,
                    url: link.url,
                    quality: link.quality
                });
                
                Lampa.Player.playlist([{
                    title: card.title || card.name,
                    url: link.url
                }]);
            } catch (e) {
                console.error('[4Kino] Player error:', e);
                Lampa.Noty.show('Ошибка запуска плеера');
            }
        }
    }

    // Инициализация плагина
    function startPlugin() {
        console.log('[4Kino] Starting plugin...');
        
        const plugin = new Plugin4kino();
        
        // Перехватываем создание карточки
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                console.log('[4Kino] Full card loaded');
                console.log('[4Kino] Movie data:', e.data.movie);
                
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
                        button.on('click', function(event) {
                            console.log('[4Kino] Button clicked');
                            event.preventDefault();
                            event.stopPropagation();
                            
                            try {
                                plugin.playMovie(e.data.movie);
                            } catch (err) {
                                console.error('[4Kino] Click handler error:', err);
                                Lampa.Noty.show('Ошибка: ' + err.message);
                            }
                        });
                        
                        // Находим контейнер с кнопками и добавляем нашу кнопку
                        const buttonsContainer = $('.full-start__buttons');
                        if (buttonsContainer.length) {
                            buttonsContainer.append(button);
                            console.log('[4Kino] Button added to container');
                        } else {
                            // Альтернативный метод
                            const lastButton = $('.full-start__button').last();
                            if (lastButton.length) {
                                lastButton.after(button);
                                console.log('[4Kino] Button added after last button');
                            } else {
                                console.error('[4Kino] No suitable place for button found');
                            }
                        }
                        
                    } catch (err) {
                        console.error('[4Kino] Error adding button:', err);
                    }
                }, 500);
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
