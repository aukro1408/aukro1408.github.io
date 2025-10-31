(function () {
    'use strict';

    // --- Настройки ---
    const YOUTUBE_API_KEY = 'AIzaSyBbZ_BNLNdgC9dylYEQdIAPkXc6g3VlLMw'; // Ваш API ключ
    const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';
    const PLUGIN_NAME = 'YouTube';
    const PLUGIN_ID = 'youtube';

    // --- Переменные ---
    let youtubePluginInstance = null;

    // --- Класс плагина ---
    class YouTubePlugin {
        constructor() {
            this.name = PLUGIN_NAME;
            this.id = PLUGIN_ID;
            // Используем простой текстовый символ для иконки
            this.icon = 'YT';
            this.iconColor = '#FF0000'; // Красный цвет для иконки
        }

        // --- Инициализация ---
        init() {
            console.log(`[${PLUGIN_NAME}] Initializing plugin...`);
            
            // Попробуем добавить элемент в меню после задержки
            setTimeout(() => {
                this.attemptToAddToMenu();
            }, 2000); // Задержка для уверенности, что Lampa полностью загружена
            
            // Также добавим слушатель готовности Lampa
            if (typeof Lampa !== 'undefined' && Lampa.Listener) {
                Lampa.Listener.follow('app', (e) => {
                    if (e.type === 'ready') {
                        setTimeout(() => {
                            this.attemptToAddToMenu();
                        }, 1000);
                    }
                });
            }
        }

        // --- Попытка добавления в меню ---
        attemptToAddToMenu() {
            console.log(`[${PLUGIN_NAME}] Attempting to add menu item...`);
            
            // Проверим, есть ли объекты, которые могут быть использованы для меню
            if (typeof Lampa !== 'undefined') {
                console.log(`[${PLUGIN_NAME}] Lampa object found`);
                
                // Проверим, есть ли методы, которые могут быть использованы для меню
                if (Lampa.Menu && typeof Lampa.Menu.add === 'function') {
                    console.log(`[${PLUGIN_NAME}] Lampa.Menu.add is available`);
                    
                    try {
                        // Попробуем добавить элемент
                        const menuItem = {
                            name: this.name,
                            icon: this.icon,
                            color: this.iconColor,
                            handler: () => {
                                this.openSearch();
                            }
                        };
                        
                        Lampa.Menu.add(menuItem);
                        console.log(`[${PLUGIN_NAME}] Menu item added via Lampa.Menu.add`);
                        return true;
                    } catch (e) {
                        console.error(`[${PLUGIN_NAME}] Error adding menu item via Lampa.Menu.add:`, e);
                    }
                } else {
                    console.warn(`[${PLUGIN_NAME}] Lampa.Menu.add not available`);
                }
                
                // Попробуем другие способы добавления, если Lampa.Menu не работает
                // Например, если есть какой-то объект меню, который можно модифицировать
                if (typeof Lampa.Menu !== 'undefined') {
                    console.log(`[${PLUGIN_NAME}] Lampa.Menu exists but add method might be different`);
                }
                
            } else {
                console.warn(`[${PLUGIN_NAME}] Lampa object not found`);
            }
            
            // Если ничего не помогло, попробуем создать кнопку вручную
            // (Это более сложный путь и зависит от структуры DOM Lampa)
            this.createManualButton();
            return false;
        }

        // --- Создание кнопки вручную (альтернативный способ) ---
        createManualButton() {
            console.log(`[${PLUGIN_NAME}] Trying manual button creation...`);
            
            // Попробуем создать кнопку и добавить ее в DOM
            // Сначала дождемся готовности DOM
            const checkDOM = setInterval(() => {
                const menuContainer = document.querySelector('.menu'); // Попробуем найти контейнер меню
                if (menuContainer) {
                    clearInterval(checkDOM);
                    console.log(`[${PLUGIN_NAME}] Found menu container`);
                    
                    // Проверим, есть ли уже наша кнопка
                    if (!document.getElementById(`menu-item-${this.id}`)) {
                        // Создаем элемент
                        const button = document.createElement('div');
                        button.id = `menu-item-${this.id}`;
                        button.className = 'menu__item';
                        button.innerHTML = `
                            <div class="menu__item-icon" style="color: ${this.iconColor};">${this.icon}</div>
                            <div class="menu__item-title">${this.name}</div>
                        `;
                        
                        // Добавляем обработчик клика
                        button.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.openSearch();
                        });
                        
                        // Добавляем кнопку в конец меню
                        menuContainer.appendChild(button);
                        console.log(`[${PLUGIN_NAME}] Manual button created and added`);
                    }
                }
            }, 500);
            
            // Таймаут
            setTimeout(() => {
                clearInterval(checkDOM);
                console.warn(`[${PLUGIN_NAME}] Timeout waiting for menu container`);
            }, 10000);
        }

        // --- Открытие экрана поиска ---
        openSearch() {
            console.log(`[${PLUGIN_NAME}] Opening search screen...`);
            
            // Проверим, есть ли Lampa.Search
            if (typeof Lampa !== 'undefined' && Lampa.Search && typeof Lampa.Search.start === 'function') {
                Lampa.Search.start({
                    title: this.name,
                    handler: (query) => {
                        return this.search(query);
                    },
                    onSelect: (item) => {
                        this.playVideo(item.id); // Воспроизведение выбранного видео
                    }
                });
            } else {
                console.warn(`[${PLUGIN_NAME}] Lampa.Search not available. Falling back to simple alert.`);
                // Альтернатива: простое сообщение
                alert("Поиск в YouTube (демонстрационный режим)");
            }
        }

        // --- Поиск ---
        async search(query, maxResults = 20) {
            try {
                console.log(`[${PLUGIN_NAME}] Searching for: ${query}`);
                const response = await fetch(
                    `${YOUTUBE_BASE_URL}/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(query)}&part=snippet&type=video&maxResults=${maxResults}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Преобразование данных YouTube в формат, понятный Lampa
                const results = data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    image: item.snippet.thumbnails.medium.url,
                    channel: item.snippet.channelTitle,
                    publishedAt: item.snippet.publishedAt,
                    url: `https://www.youtube.com/watch?v=${item.id.videoId}` // Ссылка на YouTube
                }));

                console.log(`[${PLUGIN_NAME}] Search results count: ${results.length}`);
                return results;
            } catch (error) {
                console.error(`[${PLUGIN_NAME}] Search error:`, error);
                Lampa.Noty.show(`Ошибка поиска: ${error.message}`);
                return []; // Возвращаем пустой массив в случае ошибки
            }
        }

        // --- Получение информации о видео ---
        async getVideoInfo(videoId) {
            try {
                console.log(`[${PLUGIN_NAME}] Getting info for video: ${videoId}`);
                const response = await fetch(
                    `${YOUTUBE_BASE_URL}/videos?key=${YOUTUBE_API_KEY}&id=${videoId}&part=snippet,contentDetails,statistics`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    const item = data.items[0];
                    const videoInfo = {
                        id: item.id,
                        title: item.snippet.title,
                        description: item.snippet.description,
                        image: item.snippet.thumbnails.medium.url,
                        channel: item.snippet.channelTitle,
                        duration: item.contentDetails.duration, // ISO 8601 формат
                        viewCount: item.statistics.viewCount,
                        likeCount: item.statistics.likeCount,
                        url: `https://www.youtube.com/watch?v=${item.id}`
                    };
                    console.log(`[${PLUGIN_NAME}] Video info retrieved:`, videoInfo);
                    return videoInfo;
                }
                return null;
            } catch (error) {
                console.error(`[${PLUGIN_NAME}] Get video info error:`, error);
                return null;
            }
        }

        // --- Воспроизведение ---
        async playVideo(videoId) {
            try {
                console.log(`[${PLUGIN_NAME}] Playing video: ${videoId}`);
                const videoInfo = await this.getVideoInfo(videoId);
                if (!videoInfo) {
                    Lampa.Noty.show('Не удалось получить информацию о видео');
                    return;
                }

                // Воспроизведение через встроенный плеер Lampa
                // Попробуем использовать URL YouTube
                const playerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                Lampa.Player.play({
                    title: videoInfo.title,
                    url: playerUrl,
                    // Можно добавить дополнительные параметры
                    // Например, описание, изображение
                });

                // Добавляем видео в плейлист
                Lampa.Player.playlist([{
                    title: videoInfo.title,
                    url: playerUrl
                }]);

                Lampa.Noty.show(`Воспроизведение: ${videoInfo.title}`);
            } catch (error) {
                console.error(`[${PLUGIN_NAME}] Play video error:`, error);
                Lampa.Noty.show(`Ошибка воспроизведения: ${error.message}`);
            }
        }

        // --- Открытие страницы видео (альтернатива) ---
        openVideoPage(videoId) {
            try {
                console.log(`[${PLUGIN_NAME}] Opening video page: ${videoId}`);
                // Открываем страницу YouTube в новой вкладке или встроенной
                window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
            } catch (error) {
                console.error(`[${PLUGIN_NAME}] Open video page error:`, error);
                Lampa.Noty.show(`Ошибка открытия страницы: ${error.message}`);
            }
        }
    }

    // --- Запуск ---
    function startPlugin() {
        console.log(`[${PLUGIN_NAME}] Starting plugin...`);

        // Инициализация плагина
        youtubePluginInstance = new YouTubePlugin();
        youtubePluginInstance.init(); // Инициализируем

        // Добавление плагина в Lampa
        Lampa.Component.add(youtubePluginInstance.id, {
            name: youtubePluginInstance.name,
            component: youtubePluginInstance
        });

        // Добавление в Manifest (если нужно)
        if (Lampa.Manifest && Lampa.Manifest.plugins) {
            Lampa.Manifest.plugins.push({
                author: '@your_name',
                name: PLUGIN_NAME,
                descr: 'Источник видео из YouTube',
                version: '1.0.0'
            });
        }

        console.log(`[${PLUGIN_NAME}] Plugin loaded successfully`);
    }

    // Проверка готовности Lampa
    if (window.appready) {
        startPlugin();
    } else {
        // Проверяем, есть ли Lampa и Listener
        if (typeof Lampa !== 'undefined' && Lampa.Listener) {
            Lampa.Listener.follow('app', (e) => {
                if (e.type === 'ready') {
                    startPlugin();
                }
            });
        } else {
            // Если Lampa не загружена, ждем
            const interval = setInterval(() => {
                if (typeof Lampa !== 'undefined' && Lampa.Listener) {
                    clearInterval(interval);
                    Lampa.Listener.follow('app', (e) => {
                        if (e.type === 'ready') {
                            startPlugin();
                        }
                    });
                }
            }, 500);

            // Таймаут
            setTimeout(() => {
                clearInterval(interval);
                console.warn(`[${PLUGIN_NAME}] Lampa not loaded after timeout`);
                // Попробуем запустить сразу
                startPlugin();
            }, 10000);
        }
    }
})();
