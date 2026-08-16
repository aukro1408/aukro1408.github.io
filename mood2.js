(function() {
    "use strict";

    const PLUGIN = {
        component: 'lampa_mood',
        name: 'По настроению',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>`
    };

    // =============================================
    // НАСТРОЙКИ НАСТРОЕНИЙ
    // =============================================
    const MOODS = {
        happy: {
            id: 'happy',
            name: '😊 Весёлое',
            description: 'Хочется смеяться и радоваться',
            genres: [35, 10751, 16],
            searchQuery: 'комедия семейный'
        },
        sad: {
            id: 'sad',
            name: '😔 Грустное',
            description: 'Хочется поплакать и посочувствовать',
            genres: [18, 10749],
            searchQuery: 'драма мелодрама'
        },
        scared: {
            id: 'scared',
            name: '😱 Страшное',
            description: 'Хочется испугаться и вздрогнуть',
            genres: [27, 53],
            searchQuery: 'ужасы триллер'
        },
        thoughtful: {
            id: 'thoughtful',
            name: '🤔 Задумчивое',
            description: 'Хочется поразмышлять о жизни',
            genres: [18, 9648, 99],
            searchQuery: 'драма детектив документальный'
        },
        excited: {
            id: 'excited',
            name: '🔥 Боевое',
            description: 'Хочется экшена и адреналина',
            genres: [28, 12, 10759],
            searchQuery: 'боевик приключения'
        },
        romantic: {
            id: 'romantic',
            name: '💕 Романтичное',
            description: 'Хочется любви и нежности',
            genres: [10749, 10751],
            searchQuery: 'мелодрама семейный'
        },
        fantasy: {
            id: 'fantasy',
            name: '✨ Фантастическое',
            description: 'Хочется улететь в другой мир',
            genres: [14, 878, 16],
            searchQuery: 'фэнтези фантастика'
        },
        relaxing: {
            id: 'relaxing',
            name: '🌊 Расслабляющее',
            description: 'Хочется отдохнуть и успокоиться',
            genres: [10402, 10770, 99],
            searchQuery: 'музыкальный документальный'
        }
    };

    // =============================================
    // ПОИСК ФИЛЬМОВ ЧЕРЕЗ LAMPA
    // =============================================
    function searchMovies(query, limit = 20) {
        return new Promise((resolve) => {
            console.log('[Mood Movies] 🔍 Поиск:', query);

            if (!query || query.trim() === '') {
                resolve([]);
                return;
            }

            // Используем встроенный поиск Lampa
            const search = new Lampa.Search();
            
            search.search(query, function(results) {
                console.log('[Mood Movies] 📽 Найдено:', results ? results.length : 0);
                
                if (results && results.length > 0) {
                    // Фильтруем только фильмы (не сериалы)
                    const movies = results.filter(item => {
                        return item.media_type === 'movie' || !item.media_type;
                    });
                    resolve(movies.slice(0, limit));
                } else {
                    resolve([]);
                }
            }, function(error) {
                console.error('[Mood Movies] Ошибка поиска:', error);
                resolve([]);
            });
        });
    }

    // =============================================
    // ПОЛУЧЕНИЕ ПОСТЕРА
    // =============================================
    function getPosterUrl(path) {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return 'https://image.tmdb.org/t/p/w342' + path;
    }

    // =============================================
    // ГЛАВНАЯ СТРАНИЦА
    // =============================================
    function MoodPage(object) {
        let scrollInstance = null;

        this.create = function() {
            console.log('[Mood Movies] 📄 Создание страницы');

            const html = $(`
                <div class="${PLUGIN.component}-container">
                    <div class="${PLUGIN.component}-header">
                        <h1>🎭 Фильмы по настроению</h1>
                        <div class="${PLUGIN.component}-subheader">
                            Выбери своё настроение и получи подборку фильмов
                        </div>
                    </div>

                    <div class="${PLUGIN.component}-scroll-wrap" id="${PLUGIN.component}-scroll-wrap">
                        <div class="${PLUGIN.component}-content">
                            <!-- Сетка настроений -->
                            <div class="${PLUGIN.component}-moods-grid" id="${PLUGIN.component}-moods-grid">
                                ${Object.values(MOODS).map(mood => `
                                    <div class="${PLUGIN.component}-mood-card selector" 
                                         data-mood="${mood.id}"
                                         id="${PLUGIN.component}-mood-${mood.id}">
                                        <div class="${PLUGIN.component}-mood-icon">${mood.name.split(' ')[0]}</div>
                                        <div class="${PLUGIN.component}-mood-name">${mood.name}</div>
                                        <div class="${PLUGIN.component}-mood-desc">${mood.description}</div>
                                        <div class="${PLUGIN.component}-mood-genres">
                                            ${mood.genres.map(g => `<span class="mood-genre-tag">${getGenreName(g)}</span>`).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Результаты -->
                            <div class="${PLUGIN.component}-results" id="${PLUGIN.component}-results" style="display:none;">
                                <div class="${PLUGIN.component}-results-header">
                                    <h2 id="${PLUGIN.component}-results-title"></h2>
                                    <button class="${PLUGIN.component}-back-btn selector" id="${PLUGIN.component}-back">
                                        ← Назад
                                    </button>
                                </div>
                                <div class="${PLUGIN.component}-movies-grid" id="${PLUGIN.component}-movies-grid">
                                </div>
                            </div>

                            <!-- Загрузка -->
                            <div class="${PLUGIN.component}-loading" id="${PLUGIN.component}-loading" style="display:none;">
                                <div class="${PLUGIN.component}-spinner"></div>
                                <p>Ищем фильмы для вас...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            // =============================================
            // ОБРАБОТЧИКИ
            // =============================================
            setTimeout(() => {
                // Клик по настроению
                Object.values(MOODS).forEach(mood => {
                    const selector = `#${PLUGIN.component}-mood-${mood.id}`;
                    $(selector).on('hover:enter click', function() {
                        loadMoviesByMood(mood);
                    });
                });

                // Кнопка "Назад"
                $('#${PLUGIN.component}-back').on('hover:enter click', function() {
                    showMoods();
                });

                // Создаём скролл
                const wrap = document.getElementById(`${PLUGIN.component}-scroll-wrap`);
                if (wrap) {
                    scrollInstance = new Lampa.Scroll({
                        element: wrap,
                        step: 250
                    });
                    scrollInstance.render();
                }

            }, 200);

            return html;
        };

        // =============================================
        // ЗАГРУЗКА ФИЛЬМОВ
        // =============================================
        async function loadMoviesByMood(mood) {
            console.log('[Mood Movies] 🎯 Выбрано настроение:', mood.name);

            showLoading(true);
            hideResults();
            hideMoods();

            try {
                // Ищем фильмы по ключевым словам
                const movies = await searchMovies(mood.searchQuery, 20);
                
                console.log('[Mood Movies] 📽 Итоговый результат:', movies ? movies.length : 0);
                showResults(mood, movies || []);
            } catch (error) {
                console.error('[Mood Movies] Ошибка:', error);
                showResults(mood, []);
            } finally {
                showLoading(false);
            }
        }

        // =============================================
        // ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ
        // =============================================
        function showResults(mood, movies) {
            const resultsEl = document.getElementById(`${PLUGIN.component}-results`);
            const titleEl = document.getElementById(`${PLUGIN.component}-results-title`);
            const gridEl = document.getElementById(`${PLUGIN.component}-movies-grid`);

            if (!resultsEl || !gridEl) return;

            if (titleEl) {
                titleEl.textContent = `${mood.name} — ${movies.length} фильмов`;
            }

            let gridHtml = '';
            
            if (!movies || movies.length === 0) {
                gridHtml = `
                    <div class="${PLUGIN.component}-empty">
                        <div class="${PLUGIN.component}-empty-icon">😕</div>
                        <p>Не удалось найти фильмы для этого настроения</p>
                        <p style="font-size:14px;color:rgba(255,255,255,0.4);">
                            Попробуйте другое настроение
                        </p>
                    </div>
                `;
            } else {
                movies.forEach(movie => {
                    const poster = getPosterUrl(movie.poster_path || movie.poster);
                    const title = movie.title || movie.name || 'Без названия';
                    const year = movie.release_date ? movie.release_date.slice(0, 4) : 
                                (movie.year || '—');
                    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 
                                  (movie.rating || '—');
                    const genres = movie.genre_ids ? 
                        movie.genre_ids.slice(0, 3).map(g => getGenreName(g)).filter(Boolean).join(', ') : 
                        (movie.genres || '');

                    gridHtml += `
                        <div class="${PLUGIN.component}-movie-card selector" 
                             data-movie-id="${movie.id || movie.kinopoisk_id}">
                            <div class="${PLUGIN.component}-movie-poster">
                                ${poster ? `<img src="${poster}" alt="${title}" loading="lazy">` : 
                                            `<div class="${PLUGIN.component}-movie-no-poster">🎬</div>`}
                                ${rating !== '—' ? `<div class="${PLUGIN.component}-movie-rating">⭐ ${rating}</div>` : ''}
                            </div>
                            <div class="${PLUGIN.component}-movie-info">
                                <div class="${PLUGIN.component}-movie-title">${title}</div>
                                <div class="${PLUGIN.component}-movie-meta">
                                    ${year !== '—' ? `<span>${year}</span>` : ''}
                                    ${genres ? `<span>${genres}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            gridEl.innerHTML = gridHtml;

            // Показываем результаты
            resultsEl.style.display = 'block';

            // Обновляем скролл
            if (scrollInstance) {
                setTimeout(() => {
                    try {
                        scrollInstance.update();
                    } catch(e) {
                        console.log('[Mood Movies] Обновление скролла:', e);
                    }
                }, 300);
            }

            // Обработчики для карточек
            setTimeout(() => {
                gridEl.querySelectorAll(`.${PLUGIN.component}-movie-card`).forEach(card => {
                    const movieId = card.dataset.movieId;
                    if (!movieId) return;

                    const openMovie = function() {
                        console.log('[Mood Movies] 📺 Открытие фильма:', movieId);
                        // Пытаемся открыть через Lampa
                        try {
                            Lampa.Activity.push({
                                id: movieId,
                                component: 'full',
                                movie: {
                                    id: movieId,
                                    title: card.querySelector(`.${PLUGIN.component}-movie-title`)?.textContent || ''
                                }
                            });
                        } catch(e) {
                            console.error('[Mood Movies] Ошибка открытия:', e);
                        }
                    };

                    card.addEventListener('click', openMovie);
                    $(card).on('hover:enter', openMovie);
                });
            }, 100);
        }

        function showMoods() {
            const moodsGrid = document.getElementById(`${PLUGIN.component}-moods-grid`);
            const results = document.getElementById(`${PLUGIN.component}-results`);
            const loading = document.getElementById(`${PLUGIN.component}-loading`);
            
            if (moodsGrid) moodsGrid.style.display = 'grid';
            if (results) results.style.display = 'none';
            if (loading) loading.style.display = 'none';
            
            if (scrollInstance) {
                setTimeout(() => {
                    try {
                        scrollInstance.update();
                    } catch(e) {}
                }, 200);
            }
        }

        function hideMoods() {
            const moodsGrid = document.getElementById(`${PLUGIN.component}-moods-grid`);
            if (moodsGrid) moodsGrid.style.display = 'none';
        }

        function hideResults() {
            const results = document.getElementById(`${PLUGIN.component}-results`);
            if (results) results.style.display = 'none';
        }

        function showLoading(show) {
            const loading = document.getElementById(`${PLUGIN.component}-loading`);
            if (loading) loading.style.display = show ? 'flex' : 'none';
        }

        // =============================================
        // УПРАВЛЕНИЕ
        // =============================================
        this.start = function() {
            console.log('[Mood Movies] 🚀 Запуск страницы');
            
            Lampa.Controller.add('content', {
                back: function() {
                    const results = document.getElementById(`${PLUGIN.component}-results`);
                    if (results && results.style.display !== 'none') {
                        showMoods();
                    } else {
                        Lampa.Activity.backward();
                    }
                }
            });
            
            Lampa.Controller.toggle('content');
            
            if (scrollInstance) {
                setTimeout(() => {
                    try {
                        scrollInstance.update();
                    } catch(e) {}
                }, 300);
            }
        };

        this.pause = function() {};
        this.stop = function() {
            if (scrollInstance) {
                try {
                    scrollInstance.destroy();
                } catch(e) {}
                scrollInstance = null;
            }
        };
        
        this.render = function() {
            return $('<div></div>').append(this.create());
        };
    }

    // =============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // =============================================
    function getGenreName(id) {
        const genres = {
            12: 'Приключения', 14: 'Фэнтези', 16: 'Анимация',
            18: 'Драма', 27: 'Ужасы', 28: 'Боевик',
            35: 'Комедия', 36: 'История', 37: 'Вестерн',
            53: 'Триллер', 80: 'Криминал', 99: 'Документальный',
            10749: 'Мелодрама', 10751: 'Семейный', 10752: 'Военный',
            10759: 'Боевик-приключения', 10762: 'Детский',
            10763: 'Новости', 10764: 'Реалити-шоу',
            10765: 'Научная фантастика', 10766: 'Мыло',
            10767: 'Ток-шоу', 10768: 'Политика',
            10770: 'Телефильм', 878: 'Фантастика',
            9648: 'Детектив', 10402: 'Музыкальный'
        };
        return genres[id] || '';
    }

    // =============================================
    // ДОБАВЛЯЕМ ПУНКТ В МЕНЮ
    // =============================================
    function addMenuItem() {
        console.log('[Mood Movies] 📌 Добавление пункта меню');
        
        const menuItem = $(`
            <li class="menu__item selector ${PLUGIN.component}-menu">
                <div class="menu__ico">${PLUGIN.icon}</div>
                <div class="menu__text">${PLUGIN.name}</div>
            </li>
        `);

        menuItem.on('hover:enter', function() {
            const activity = {
                id: PLUGIN.component,
                component: PLUGIN.component,
                title: PLUGIN.name
            };
            
            if (Lampa.Activity.active().component === PLUGIN.component) {
                Lampa.Activity.replace(activity);
            } else {
                Lampa.Activity.push(activity);
            }
        });

        const menu = $('.menu .menu__list').eq(0);
        menu.append(menuItem);
        console.log('[Mood Movies] ✅ Пункт меню добавлен');
    }

    // =============================================
    // СТИЛИ
    // =============================================
    function addStyles() {
        const styleId = PLUGIN.component + '-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .${PLUGIN.component}-container {
                height: 100%;
                display: flex;
                flex-direction: column;
                padding: 16px 20px;
                color: #fff;
                box-sizing: border-box;
            }

            .${PLUGIN.component}-header {
                flex-shrink: 0;
                margin-bottom: 16px;
                text-align: center;
            }

            .${PLUGIN.component}-header h1 {
                font-size: 26px;
                margin: 0 0 6px 0;
                font-weight: 700;
                background: linear-gradient(135deg, #ff9800, #ff5722);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .${PLUGIN.component}-subheader {
                color: rgba(255,255,255,0.5);
                font-size: 13px;
            }

            .${PLUGIN.component}-scroll-wrap {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                min-height: 0;
            }

            .${PLUGIN.component}-scroll-wrap::-webkit-scrollbar {
                width: 3px;
            }

            .${PLUGIN.component}-scroll-wrap::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.15);
                border-radius: 2px;
            }

            .${PLUGIN.component}-content {
                padding-bottom: 20px;
            }

            .${PLUGIN.component}-moods-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 14px;
                margin-bottom: 16px;
            }

            .${PLUGIN.component}-mood-card {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 14px;
                padding: 18px 14px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .${PLUGIN.component}-mood-card:hover {
                transform: translateY(-3px);
                background: rgba(255,255,255,0.1);
                border-color: rgba(255,152,0,0.3);
                box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            }

            .${PLUGIN.component}-mood-icon {
                font-size: 28px;
                margin-bottom: 6px;
            }

            .${PLUGIN.component}-mood-name {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 4px;
            }

            .${PLUGIN.component}-mood-desc {
                font-size: 11px;
                color: rgba(255,255,255,0.5);
                margin-bottom: 8px;
            }

            .${PLUGIN.component}-mood-genres {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                justify-content: center;
            }

            .mood-genre-tag {
                font-size: 9px;
                padding: 2px 8px;
                background: rgba(255,152,0,0.12);
                border-radius: 10px;
                color: #ff9800;
                border: 1px solid rgba(255,152,0,0.08);
            }

            .${PLUGIN.component}-results {
                animation: ${PLUGIN.component}-fadeIn 0.3s ease;
            }

            .${PLUGIN.component}-results-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 14px;
                flex-wrap: wrap;
                gap: 8px;
            }

            .${PLUGIN.component}-results-header h2 {
                font-size: 18px;
                margin: 0;
            }

            .${PLUGIN.component}-back-btn {
                padding: 6px 18px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                background: rgba(255,255,255,0.05);
                color: #fff;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 12px;
            }

            .${PLUGIN.component}-back-btn:hover {
                background: rgba(255,255,255,0.1);
            }

            .${PLUGIN.component}-movies-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 14px;
            }

            .${PLUGIN.component}-movie-card {
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 10px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .${PLUGIN.component}-movie-card:hover {
                transform: translateY(-3px);
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,152,0,0.2);
                box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            }

            .${PLUGIN.component}-movie-poster {
                position: relative;
                padding-bottom: 150%;
                background: rgba(255,255,255,0.02);
                overflow: hidden;
            }

            .${PLUGIN.component}-movie-poster img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .${PLUGIN.component}-movie-no-poster {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
                background: rgba(255,255,255,0.03);
            }

            .${PLUGIN.component}-movie-rating {
                position: absolute;
                top: 6px;
                right: 6px;
                background: rgba(0,0,0,0.75);
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
                color: #ff9800;
            }

            .${PLUGIN.component}-movie-info {
                padding: 8px 10px;
            }

            .${PLUGIN.component}-movie-title {
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .${PLUGIN.component}-movie-meta {
                font-size: 10px;
                color: rgba(255,255,255,0.4);
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
            }

            .${PLUGIN.component}-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 30px 20px;
                color: rgba(255,255,255,0.6);
            }

            .${PLUGIN.component}-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid rgba(255,255,255,0.05);
                border-top: 3px solid #ff9800;
                border-radius: 50%;
                animation: ${PLUGIN.component}-spin 1s linear infinite;
                margin-bottom: 12px;
            }

            @keyframes ${PLUGIN.component}-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes ${PLUGIN.component}-fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .${PLUGIN.component}-empty {
                text-align: center;
                padding: 30px 20px;
                grid-column: 1 / -1;
            }

            .${PLUGIN.component}-empty-icon {
                font-size: 40px;
                margin-bottom: 12px;
            }

            .${PLUGIN.component}-empty p {
                font-size: 14px;
                color: rgba(255,255,255,0.6);
                margin: 4px 0;
            }

            @media (max-width: 1024px) {
                .${PLUGIN.component}-moods-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
                .${PLUGIN.component}-movies-grid {
                    grid-template-columns: repeat(4, 1fr);
                }
            }

            @media (max-width: 768px) {
                .${PLUGIN.component}-moods-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                .${PLUGIN.component}-movies-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
                .${PLUGIN.component}-header h1 {
                    font-size: 20px;
                }
            }

            @media (max-width: 480px) {
                .${PLUGIN.component}-moods-grid {
                    grid-template-columns: 1fr;
                }
                .${PLUGIN.component}-movies-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                .${PLUGIN.component}-results-header {
                    flex-direction: column;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // =============================================
    // РЕГИСТРАЦИЯ
    // =============================================
    function registerComponent() {
        Lampa.Component.add(PLUGIN.component, MoodPage);
    }

    // =============================================
    // ЗАПУСК
    // =============================================
    function init() {
        console.log('[Mood Movies] 🚀 Инициализация...');
        addStyles();
        registerComponent();
        addMenuItem();
        console.log('[Mood Movies] ✅ Плагин загружен!');
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }

})();
