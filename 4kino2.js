(function() {
    'use strict';

    // НАСТРОЙКИ - ВСТАВЬТЕ ВАШ ТОКЕН СЮДА
    const VOKINO_CONFIG = {
        baseUrl: 'http://web.vokino.tv',
        token: 'ВАШ_ТОКЕН_ЗДЕСЬ', // <-- Замените на ваш токен
        apiUrl: 'http://web.vokino.tv/api' // Возможный API endpoint
    };

    class PluginVokino {
        constructor() {
            this.network = new Lampa.Reguest();
            this.token = VOKINO_CONFIG.token;
        }

        // Поиск фильма на vokino.tv
        searchMovie(card) {
            return new Promise((resolve, reject) => {
                const searchQuery = this.buildSearchQuery(card);
                
                // Вариант 1: Если есть API поиска
                const searchUrl = `${VOKINO_CONFIG.apiUrl}/search?query=${encodeURIComponent(searchQuery)}&token=${this.token}`;
                
                this.network.silent(searchUrl, (data) => {
                    try {
                        // Если API возвращает JSON
                        if (typeof data === 'string') {
                            data = JSON.parse(data);
                        }
                        resolve(data);
                    } catch (e) {
                        // Если API возвращает HTML, парсим его
                        const results = this.parseSearchResults(data, card);
                        resolve(results);
                    }
                }, (error) => {
                    reject(error);
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
            });
        }

        buildSearchQuery(card) {
            let query = '';
            
            if (card.title) query = card.title;
            else if (card.name) query = card.name;
            else if (card.original_title) query = card.original_title;
            
            // Добавляем год
            if (card.release_date) {
                const year = card.release_date.split('-')[0];
                query += ' ' + year;
            } else if (card.first_air_date) {
                const year = card.first_air_date.split('-')[0];
                query += ' ' + year;
            }
            
            return query;
        }

        // Парсинг HTML результатов (если нет API)
        parseSearchResults(html, card) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const selectors = [
                '.movie-item a',
                '.film-item a',
                '.video-item a',
                'article a',
                '.item a',
                '.card a'
            ];
            
            let results = [];
            
            for (let selector of selectors) {
                const items = doc.querySelectorAll(selector);
                items.forEach(link => {
                    if (link.href) {
                        const titleEl = link.querySelector('.title, h2, h3, .name') || link;
                        results.push({
                            url: link.href,
                            title: titleEl.textContent.trim()
                        });
                    }
                });
                if (results.length > 0) break;
            }
            
            return results.length > 0 ? results[0] : null;
        }

        // Получение ссылок на плеер
        getPlayerLinks(movieUrl) {
            return new Promise((resolve, reject) => {
                // Добавляем токен в URL
                const urlWithToken = movieUrl.includes('?') 
                    ? `${movieUrl}&token=${this.token}`
                    : `${movieUrl}?token=${this.token}`;
                
                this.network.silent(urlWithToken, (data) => {
                    try {
                        const links = this.parsePlayerLinks(data);
                        resolve(links);
                    } catch (e) {
                        reject(e);
                    }
                }, reject, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            });
        }

        // Парсинг ссылок на плеер
        parsePlayerLinks(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = [];
            
            // Ищем iframe
            const iframes = doc.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                let src = iframe.src || iframe.getAttribute('data-src');
                if (src) {
                    // Добавляем токен если его нет
                    if (!src.includes('token=')) {
                        src += (src.includes('?') ? '&' : '?') + `token=${this.token}`;
                    }
                    if (src.includes('http') || src.startsWith('//')) {
                        const fullUrl = src.startsWith('//') ? 'https:' + src : src;
                        links.push({
                            url: fullUrl,
                            quality: '1080p',
                            source: 'Vokino'
                        });
                    }
                }
            });
            
            // Ищем video элементы
            const videos = doc.querySelectorAll('video source, video');
            videos.forEach(video => {
                let src = video.src || video.getAttribute('data-src');
                if (src) {
                    if (!src.includes('token=')) {
                        src += (src.includes('?') ? '&' : '?') + `token=${this.token}`;
                    }
                    const quality = video.getAttribute('data-quality') || 
                                  video.getAttribute('label') || '1080p';
                    links.push({
                        url: src,
                        quality: quality,
                        source: 'Vokino'
                    });
                }
            });
            
            // Ищем в скриптах
            const scripts = doc.querySelectorAll('script');
            scripts.forEach(script => {
                const content = script.textContent;
                
                // Различные паттерны для поиска ссылок
                const patterns = [
                    /file["']?\s*:\s*["']([^"']+)["']/g,
                    /src["']?\s*:\s*["']([^"']+)["']/g,
                    /url["']?\s*:\s*["']([^"']+)["']/g,
                    /"(https?:\/\/[^"]+\.m3u8[^"]*)"/g,
                    /"(https?:\/\/[^"]+\.mp4[^"]*)"/g
                ];
                
                patterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(content)) !== null) {
                        if (match[1]) {
                            let url = match[1];
                            if (!url.includes('token=')) {
                                url += (url.includes('?') ? '&' : '?') + `token=${this.token}`;
                            }
                            links.push({
                                url: url,
                                quality: '1080p',
                                source: 'Vokino'
                            });
                        }
                    }
                });
            });
            
            return links;
        }

        // Воспроизведение
        async playMovie(card) {
            try {
                Lampa.Noty.show('🔍 Ищу на Vokino...');
                
                const searchResult = await this.searchMovie(card);
                
                if (!searchResult) {
                    Lampa.Noty.show('❌ Фильм не найден');
                    return;
                }
                
                Lampa.Noty.show('⏳ Загружаю плеер...');
                
                const playerLinks = await this.getPlayerLinks(searchResult.url || searchResult);
                
                if (playerLinks.length === 0) {
                    Lampa.Noty.show('❌ Плеер не найден');
                    return;
                }
                
                Lampa.Noty.show('✅ Запускаю...');
                
                if (playerLinks.length === 1) {
                    this.openPlayer(playerLinks[0], card);
                } else {
                    this.showQualitySelector(playerLinks, card);
                }
                
            } catch (error) {
                Lampa.Noty.show('❌ Ошибка: ' + error.message);
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
                    this.openPlayer({url: item.url, quality: item.title}, card);
                },
                onBack: () => {
                    Lampa.Controller.toggle('content');
                }
            });
        }

        openPlayer(link, card) {
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
                Lampa.Noty.show('❌ Ошибка плеера');
            }
        }
    }

    window.PluginVokino_instance = null;

    function startPlugin() {
        try {
            // Проверяем что токен установлен
            if (VOKINO_CONFIG.token === 'ВАШ_ТОКЕН_ЗДЕСЬ') {
                Lampa.Noty.show('⚠️ Установите токен Vokino в коде!');
                return;
            }
            
            Lampa.Noty.show('Vokino плагин загружен ✓');
            
            const plugin = new PluginVokino();
            window.PluginVokino_instance = plugin;
            
            Lampa.Listener.follow('full', (e) => {
                if (e.type === 'complite' && e.data && e.data.movie) {
                    setTimeout(() => {
                        addButton(e.data.movie, plugin);
                    }, 1000);
                }
            });
            
        } catch (error) {
            Lampa.Noty.show('❌ Ошибка загрузки Vokino');
        }
    }

    function addButton(movie, plugin) {
        try {
            // Проверяем не добавлена ли уже кнопка
            if ($('.view--online_vokino').length > 0) {
                return;
            }
            
            const buttonHtml = `
                <div class="full-start__button selector view--online_vokino">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 48 48" width="48" height="48">
                        <rect width="48" height="48" rx="8" fill="#00A8E8" fill-opacity="0.8"/>
                        <text x="24" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="white">VOK</text>
                    </svg>
                    <span>Vokino</span>
                </div>
            `;
            
            const button = $(buttonHtml);
            
            button.on('click tap touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                plugin.playMovie(movie);
                return false;
            });
            
            const buttonsContainer = $('.full-start__buttons');
            if (buttonsContainer.length > 0) {
                buttonsContainer.append(button);
            } else {
                const lastButton = $('.full-start__button').last();
                if (lastButton.length > 0) {
                    lastButton.after(button);
                } else {
                    $('.full-start, .full').first().append(button);
                }
            }
            
        } catch (err) {
            Lampa.Noty.show('❌ Ошибка добавления кнопки');
        }
    }

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
