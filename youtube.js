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
            // Иконка в формате base64 или используем SVG (в данном случае используем текстовую)
            // В реальных условиях лучше использовать SVG или PNG
            this.icon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
            this.iconColor = '#FF0000'; // Красный цвет для иконки
        }

        // --- Инициализация ---
        init() {
            console.log(`[${PLUGIN_NAME}] Initializing plugin...`);
            // Добавляем элемент в меню
            this.addToMenu();
        }

        // --- Добавление в меню ---
        addToMenu() {
            // Проверяем наличие Lampa.Menu
            if (typeof Lampa !== 'undefined' && Lampa.Menu && typeof Lampa.Menu.add === 'function') {
                console.log(`[${PLUGIN_NAME}] Adding menu item via Lampa.Menu.add`);
                // Используем правильную структуру для добавления пункта меню
                // Проверяем, есть ли уже меню, если нет, ждем его
                const menuItems = [
                    {
                        name: this.name,
                        icon: this.icon,
                        color: this.iconColor,
                        handler: () => {
                            this.openSearch();
                        }
                    }
                ];

                // Добавляем в существующее меню
                try {
                    Lampa.Menu.add(menuItems[0]);
                    console.log(`[${PLUGIN_NAME}] Menu item added successfully`);
                } catch (e) {
                    console.error(`[${PLUGIN_NAME}] Failed to add menu item:`, e);
                }
            } else {
                console.warn(`[${PLUGIN_NAME}] Lampa.Menu not available. Trying alternative method.`);
                // Альтернативный способ: добавление через Lampa.Listener
                // Но это может быть неэффективно, так как Lampa может не поддерживать динамическое изменение меню таким образом
                // Мы можем попробовать вызвать метод добавления после готовности Lampa
                this.scheduleMenuAdd();
            }
        }

        // --- Планировщик добавления меню ---
        scheduleMenuAdd() {
            const checkInterval = setInterval(() => {
                if (typeof Lampa !== 'undefined' && Lampa.Menu && typeof Lampa.Menu.add === 'function') {
                    clearInterval(checkInterval);
                    console.log(`[${PLUGIN_NAME}] Lampa.Menu now available, adding menu item`);
                    try {
                        Lampa.Menu.add({
                            name: this.name,
                            icon: this.icon,
                            color: this.iconColor,
                            handler: () => {
                                this.openSearch();
                            }
                        });
                        console.log(`[${PLUGIN_NAME}] Menu item added via scheduled method`);
                    } catch (e) {
                        console.error(`[${PLUGIN_NAME}] Failed to add menu item after delay:`, e);
                    }
                }
            }, 500); // Проверяем каждые 500 мс

            // Ограничиваем время ожидания
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn(`[${PLUGIN_NAME}] Timeout waiting for Lampa.Menu`);
            }, 10000); // Через 10 секунд прекращаем ожидание
        }

        // --- Открытие экрана поиска ---
        openSearch() {
            console.log(`[${PLUGIN_NAME}] Opening search screen...`);
            // Проверяем, есть ли Lampa.Search
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

        // --- Другие методы ---
        // Например, получение плейлистов, каналов и т.д.
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
            }, 10000);
        }
    }
})();
