(function () {
    'use strict';

    const API_URL = 'https://4kino.cc '; // Этот URL не используется для YouTube, но оставлен для совместимости
    const YOUTUBE_API_KEY = 'AIzaSyBbZ_BNLNdgC9dylYEQdIAPkXc6g3VlLMw'; // Ваш API ключ YouTube
    const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

    class PluginYoutube {
        constructor() {
            this.network = new Lampa.Reguest();
        }

        // --- Поиск видео на YouTube ---
        searchVideo(query) {
            return new Promise((resolve, reject) => {
                const searchUrl = `${YOUTUBE_BASE_URL}/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(query)}&part=snippet&type=video&maxResults=20`;

                this.network.silent(searchUrl, (data) => {
                    try {
                        const results = this.parseSearchResults(data);
                        resolve(results);
                    } catch (e) {
                        reject(e);
                    }
                }, (error) => {
                    reject(error);
                });
            });
        }

        // --- Парсинг результатов поиска YouTube ---
        parseSearchResults(html) {
            // В данном случае, мы уже получаем JSON, поэтому парсим его
            const data = JSON.parse(html);
            const results = [];

            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    if (item.id && item.id.videoId) {
                        results.push({
                            id: item.id.videoId,
                            title: item.snippet.title,
                            description: item.snippet.description,
                            image: item.snippet.thumbnails.medium.url,
                            channel: item.snippet.channelTitle,
                            publishedAt: item.snippet.publishedAt,
                            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
                        });
                    }
                });
            }

            return results;
        }

        // --- Получение информации о видео ---
        getVideoInfo(videoId) {
            return new Promise((resolve, reject) => {
                const videoUrl = `${YOUTUBE_BASE_URL}/videos?key=${YOUTUBE_API_KEY}&id=${videoId}&part=snippet,contentDetails,statistics`;

                this.network.silent(videoUrl, (data) => {
                    try {
                        const videoInfo = this.parseVideoInfo(data);
                        resolve(videoInfo);
                    } catch (e) {
                        reject(e);
                    }
                }, reject);
            });
        }

        // --- Парсинг информации о видео ---
        parseVideoInfo(html) {
            const data = JSON.parse(html);
            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                return {
                    id: item.id,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    image: item.snippet.thumbnails.medium.url,
                    channel: item.snippet.channelTitle,
                    duration: item.contentDetails.duration,
                    viewCount: item.statistics.viewCount,
                    likeCount: item.statistics.likeCount,
                    url: `https://www.youtube.com/watch?v=${item.id}`
                };
            }
            return null;
        }

        // --- Воспроизведение видео ---
        async playVideo(videoId) {
            try {
                Lampa.Noty.show('Получаем информацию о видео...');
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

                Lampa.Player.playlist([{
                    title: videoInfo.title,
                    url: playerUrl
                }]);

                Lampa.Noty.show(`Воспроизведение: ${videoInfo.title}`);

            } catch (error) {
                console.error('YouTube error:', error);
                Lampa.Noty.show('Ошибка при воспроизведении: ' + error.message);
            }
        }

        // --- Открытие экрана поиска ---
        openSearchScreen() {
            // Создаем простое модальное окно для поиска
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
                        const results = await this.searchVideo(query);

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
                    console.log('[YouTube] Modal closed.');
                }
            });

            modal.open();
        }
    }

    // --- Инициализация плагина ---
    function startPlugin() {
        console.log('[YouTube] Starting plugin...');

        const plugin = new PluginYoutube();

        // Метод 1: Используем API Lampa для добавления источника онлайн
        Lampa.Component.add('online_youtube', {
            name: 'YouTube',
            component: plugin
        });

        // Метод 2: Добавляем кнопку через API источников (если нужно)
        if (Lampa.Manifest && Lampa.Manifest.plugins) {
            Lampa.Manifest.plugins.push({
                author: '@custom',
                name: 'YouTube',
                descr: 'Источник видео из YouTube',
                version: '1.0.0'
            });
        }

        // Метод 3: Перехватываем создание карточки и добавляем кнопку
        // Вместо добавления кнопки на карточку, мы добавим её в меню
        // Но если вы хотите именно кнопку на карточке, можно сделать так:
        /*
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                console.log('[YouTube] Full card loaded, adding button');

                setTimeout(() => {
                    try {
                        // Создаем кнопку
                        const button = $('<div class="full-start__button selector view--online_youtube">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 48 48" width="48" height="48">' +
                            '<rect width="48" height="48" rx="8" fill="currentColor" fill-opacity="0.3"/>' +
                            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">YT</text>' +
                            '</svg>' +
                            '<span>YouTube</span>' +
                            '</div>');

                        // Добавляем обработчик клика
                        button.on('click', () => {
                            plugin.openSearchScreen(); // Открываем поиск
                        });

                        // Находим контейнер с кнопками и добавляем нашу кнопку
                        const buttonsContainer = $('.full-start__buttons');
                        if (buttonsContainer.length) {
                            buttonsContainer.append(button);
                            console.log('[YouTube] Button added successfully');
                        } else {
                            console.log('[YouTube] Buttons container not found');
                        }

                    } catch (err) {
                        console.error('[YouTube] Error adding button:', err);
                    }
                }, 300);
            }
        });
        */

        // --- Добавляем кнопку в меню (как в вашем оригинальном коде) ---
        // Попробуем добавить кнопку в меню через DOM
        const addButtonToMenu = () => {
            // Проверяем, есть ли уже кнопка
            if (document.getElementById('youtube-menu-button')) {
                return;
            }

            // Ищем контейнер меню
            const menuContainer = document.querySelector('.menu');
            if (menuContainer) {
                // Создаем кнопку
                const button = document.createElement('div');
                button.id = 'youtube-menu-button';
                button.className = 'menu__item';
                button.style.padding = '12px 20px';
                button.style.cursor = 'pointer';
                button.style.display = 'flex';
                button.style.alignItems = 'center';
                button.style.gap = '10px';
                button.innerHTML = `
                    <div class="menu__item-icon" style="color: #FF0000; font-weight: bold; font-size: 18px;">YT</div>
                    <div class="menu__item-title" style="font-size: 16px; color: white;">YouTube</div>
                `;

                // Добавляем обработчик клика
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[YouTube] Button clicked!');
                    plugin.openSearchScreen();
                });

                // Добавляем в конец меню
                menuContainer.appendChild(button);
                console.log('[YouTube] Menu button added successfully');
            } else {
                // Если меню еще не загружено, повторяем через 500мс
                setTimeout(addButtonToMenu, 500);
            }
        };

        // Запускаем добавление кнопки
        setTimeout(addButtonToMenu, 500);

        console.log('[YouTube] Plugin loaded successfully');
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
