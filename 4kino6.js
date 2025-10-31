(function() {
    'use strict';

    // Конфигурация плагина
    const manifest = {
        id: '4kino',
        name: '4Kino',
        description: 'Источник 4kino.cc для просмотра фильмов',
        version: '1.0.1',
        author: 'Custom'
    };

    const API_URL = 'https://4kino.cc';

    // Класс плагина
    class Plugin4kino {
        constructor() {
            this.network = new Lampa.Reguest();
        }

        // Поиск фильма на 4kino.cc
        searchMovie(card) {
            return new Promise((resolve, reject) => {
                const query = this.buildSearchQuery(card);
                const searchUrl = `${API_URL}/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`;
                
                this.network.silent(searchUrl, (html) => {
                    try {
                        const movieUrl = this.parseSearchResults(html);
                        resolve(movieUrl);
                    } catch (e) {
                        console.error('4Kino parse error:', e);
                        reject(e);
                    }
                }, (error) => {
                    console.error('4Kino network error:', error);
                    reject(error);
                }, false, {
                    dataType: 'text'
                });
            });
        }

        // Построение поискового запроса
        buildSearchQuery(card) {
            let query = '';
            
            // Используем русское название если есть
            if (card.title) {
                query = card.title;
            } else if (card.name) {
                query = card.name;
            } else if (card.original_title) {
                query = card.original_title;
            } else if (card.original_name) {
                query = card.original_name;
            }
            
            return query;
        }

        // Парсинг результатов поиска
        parseSearchResults(html) {
            try {
                // Ищем первую ссылку на фильм в результатах
                const urlMatch = html.match(/href="(https?:\/\/4kino\.cc\/[^"]+\.html)"/);
                if (urlMatch) {
                    return urlMatch[1];
                }
                
                // Альтернативный поиск
                const urlMatch2 = html.match(/href="(\/[0-9]+-[^"]+\.html)"/);
                if (urlMatch2) {
                    return API_URL + urlMatch2[1];
                }
                
                return null;
            } catch (e) {
                console.error('Parse error:', e);
                return null;
            }
        }

        // Получение iframe плеера
        getPlayerFrame(movieUrl) {
            return new Promise((resolve, reject) => {
                this.network.silent(movieUrl, (html) => {
                    try {
                        const iframe = this.parsePlayerFrame(html);
                        resolve(iframe);
                    } catch (e) {
                        console.error('4Kino iframe parse error:', e);
                        reject(e);
                    }
                }, reject, false, {
                    dataType: 'text'
                });
            });
        }

        // Парсинг iframe плеера
        parsePlayerFrame(html) {
            // Ищем iframe
            const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);
            if (iframeMatch) {
                return iframeMatch[1];
            }
            
            // Ищем плеер в скриптах
            const playerMatch = html.match(/file:\s*["']([^"']+)["']/);
            if (playerMatch) {
                return playerMatch[1];
            }
            
            return null;
        }

        // Открытие в плеере
        openInPlayer(url, card) {
            if (!url) {
                Lampa.Noty.show('Не удалось найти плеер');
                return;
            }

            const player_params = {
                url: url,
                title: card.title || card.name || 'Фильм',
                callback: () => {
                    Lampa.Loading.stop();
                }
            };

            Lampa.Player.play(player_params);
            Lampa.Player.playlist([player_params]);
        }
    }

    // Глобальный экземпляр плагина
    let pluginInstance = null;

    // Функция запуска воспроизведения
    function play4kino(card) {
        if (!pluginInstance) {
            pluginInstance = new Plugin4kino();
        }

        Lampa.Loading.start(() => {
            Lampa.Loading.stop();
            Lampa.Controller.toggle('content');
        });

        Lampa.Noty.show('Поиск на 4Kino...');

        pluginInstance.searchMovie(card)
            .then(movieUrl => {
                if (!movieUrl) {
                    throw new Error('Фильм не найден');
                }
                
                Lampa.Noty.show('Загрузка плеера...');
                return pluginInstance.getPlayerFrame(movieUrl);
            })
            .then(playerUrl => {
                if (!playerUrl) {
                    throw new Error('Плеер не найден');
                }
                
                Lampa.Loading.stop();
                pluginInstance.openInPlayer(playerUrl, card);
            })
            .catch(error => {
                console.error('4Kino error:', error);
                Lampa.Noty.show('Ошибка 4Kino: ' + error.message);
                Lampa.Loading.stop();
            });
    }

    // Добавление кнопки источника
    function addButton(controller, card) {
        const button = $(`
            <div class="full-start-new__button selector view--4kino">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512" width="18" height="18">
                    <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/>
                </svg>
                <span>4Kino</span>
            </div>
        `);

        button.on('hover:enter', function() {
            play4kino(card);
        });

        controller.append(button);
    }

    // Инициализация плагина
    function startPlugin() {
        console.log('4Kino: Starting plugin...');

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                console.log('4Kino: Adding button to card');
                const controller = e.object.activity;
                
                // Ищем контейнер для кнопок
                const buttonContainer = controller.render().find('.full-start__buttons');
                
                if (buttonContainer.length) {
                    addButton(buttonContainer, e.data.movie);
                } else {
                    console.warn('4Kino: Button container not found');
                }
            }
        });

        console.log('4Kino: Plugin started successfully');
    }

    // Запуск после загрузки Lampa
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

})();
