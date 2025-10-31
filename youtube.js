(function () {
    'use strict';

    // --- Настройки ---
    const YOUTUBE_API_KEY = 'AIzaSyBbZ_BNLNdgC9dylYEQdIAPkXc6g3VlLMw'; // Ваш API ключ
    const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';
    const PLUGIN_NAME = 'YouTube';
    const PLUGIN_ID = 'youtube';

    // --- Переменные ---
    let youtubePluginInstance = null;
    let menuAdded = false;

    // --- Класс плагина ---
    class YouTubePlugin {
        constructor() {
            this.name = PLUGIN_NAME;
            this.id = PLUGIN_ID;
            this.icon = 'YT'; // Иконка
            this.iconColor = '#FF0000'; // Красный цвет
        }

        // --- Инициализация ---
        init() {
            console.log(`[${PLUGIN_NAME}] Initializing plugin...`);
            this.addMenuItem();
        }

        // --- Добавление кнопки в меню ---
        addMenuItem() {
            if (menuAdded) return;

            try {
                // Ищем контейнер меню (обычно .menu)
                let menuContainer = document.querySelector('.menu');
                
                if (!menuContainer) {
                    console.warn(`[${PLUGIN_NAME}] Menu container not found yet.`);
                    return;
                }

                // Проверяем, есть ли уже наш элемент
                if (document.getElementById(`menu-item-${this.id}`)) {
                    console.log(`[${PLUGIN_NAME}] Menu item already exists.`);
                    menuAdded = true;
                    return;
                }

                // Создаем новый элемент
                const menuItem = document.createElement('div');
                menuItem.id = `menu-item-${this.id}`;
                menuItem.className = 'menu__item';
                menuItem.style.padding = '12px 20px';
                menuItem.style.cursor = 'pointer';
                menuItem.style.display = 'flex';
                menuItem.style.alignItems = 'center';
                menuItem.style.gap = '10px';
                menuItem.innerHTML = `
                    <div class="menu__item-icon" style="color: ${this.iconColor}; font-weight: bold; font-size: 18px;">${this.icon}</div>
                    <div class="menu__item-title" style="font-size: 16px; color: white;">${this.name}</div>
                `;

                // Добавляем обработчик клика
                menuItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`[${PLUGIN_NAME}] Button clicked!`);
                    this.openSearchModal(); // Открываем модальное окно поиска
                });

                // Вставляем в конец меню
                menuContainer.appendChild(menuItem);
                console.log(`[${PLUGIN_NAME}] Menu item added successfully.`);
                menuAdded = true;

            } catch (e) {
                console.error(`[${PLUGIN_NAME}] Error adding menu item:`, e);
            }
        }

        // --- Открытие модального окна поиска ---
        openSearchModal() {
            console.log(`[${PLUGIN_NAME}] Opening search modal...`);

            // Создаем модальное окно
            const modal = new Lampa.Modal({
                title: 'Поиск на YouTube',
                html: `
                    <div style="padding: 20px;">
                        <input type="text" id="youtube-search-input" placeholder="Введите запрос..." style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 5px; border: 1px solid #444; background: #222; color: white;">
                        <button id="youtube-search-button" style="width: 100%; padding: 10px; background: #FF0000; color: white; border: none; border-radius: 5px; cursor: pointer;">Найти</button>
                        <div id="youtube-results" style="margin-top: 20px;"></div>
                    </div>
                `,
                onOpen: () => {
                    const input = document.getElementById('youtube-search-input');
                    const button = document.getElementById('youtube-search-button');
                    const resultsDiv = document.getElementById('youtube-results');

                    // Фокус на поле ввода
                    setTimeout(() => input.focus(), 100);

                    // Обработчик кнопки поиска
                    button.addEventListener('click', async () => {
                        const query = input.value.trim();
                        if (!query) {
                            Lampa.Noty.show('Введите запрос');
                            return;
                        }

                        resultsDiv.innerHTML = '<p>Ищем...</p>';
                        const results = await this.search(query);

                        if (results.length === 0) {
                            resultsDiv.innerHTML = '<p>Ничего не найдено.</p>';
                            return;
                        }

                        // Отображаем результаты
                        resultsDiv.innerHTML = '';
                        results.forEach(item => {
                            const resultItem = document.createElement('div');
                            resultItem.style.margin = '10px 0';
                            resultItem.style.padding = '10px';
                            resultItem.style.border = '1px solid #444';
                            resultItem.style.borderRadius = '5px';
                            resultItem.style.cursor = 'pointer';
                            resultItem.style.backgroundColor = '#333';
                            resultItem.innerHTML = `
                                <img src="${item.image}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; float: left; margin-right: 10px;">
                                <div>
                                    <strong>${item.title}</strong><br>
                                    <small>${item.channel} • ${new Date(item.publishedAt).toLocaleDateString()}</small>
                                </div>
                            `;
                            resultItem.addEventListener('click', () => {
                                this.playVideo(item.id);
                                modal.close();
                            });
                            resultsDiv.appendChild(resultItem);
                        });
                    });

                    // По нажатию Enter
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            button.click();
                        }
                    });
                },
                onClose: () => {
                    console.log(`[${PLUGIN_NAME}] Modal closed.`);
                }
            });

            modal.open();
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
                return [];
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

                // Воспроизведение через iframe YouTube
                const playerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                Lampa.Player.play({
                    title: videoInfo.title,
                    url: playerUrl,
                    poster: videoInfo.image,
                    type: 'iframe'
                });

                Lampa.Noty.show(`Воспроизведение: ${videoInfo.title}`);

            } catch (error) {
                console.error(`[${PLUGIN_NAME}] Play video error:`, error);
                Lampa.Noty.show(`Ошибка воспроизведения: ${error.message}`);
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
