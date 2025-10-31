(function () {
    'use strict';

    // --- Настройки ---
    const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Замените на ваш API ключ от Google Cloud Console
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
            this.icon = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'; // SVG иконка для кнопки
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
            // Создаем пункт меню
            const menuItem = {
                name: this.name,
                icon: this.icon,
                color: this.iconColor,
                handler: () => {
                    this.openSearch();
                }
            };

            // Добавляем его в меню Lampa
            if (Lampa.Menu && typeof Lampa.Menu.add === 'function') {
                Lampa.Menu.add(menuItem);
                console.log(`[${PLUGIN_NAME}] Menu item added.`);
            } else {
                console.warn(`[${PLUGIN_NAME}] Could not add menu item. Lampa.Menu not available.`);
            }
        }

        // --- Открытие экрана поиска ---
        openSearch() {
            console.log(`[${PLUGIN_NAME}] Opening search screen...`);
            // Используем Lampa.Search для открытия экрана поиска
            // Это предполагает, что вы используете стандартные компоненты Lampa
            // Если нет, можно создать свой экран через Lampa.Component
            Lampa.Controller.toggle('search'); // Переключаемся на экран поиска
            Lampa.Search.start({
                title: this.name,
                handler: (query) => {
                    return this.search(query);
                },
                onSelect: (item) => {
                    this.playVideo(item.id); // Воспроизведение выбранного видео
                }
            });
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
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }
})();
