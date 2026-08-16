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
            keywords: ['смешной', 'весёлый', 'комедия', 'лёгкий', 'позитивный']
        },
        sad: {
            id: 'sad',
            name: '😔 Грустное',
            description: 'Хочется поплакать и посочувствовать',
            genres: [18, 10749],
            keywords: ['драма', 'грустный', 'душевный', 'мелодрама', 'трогательный']
        },
        scared: {
            id: 'scared',
            name: '😱 Страшное',
            description: 'Хочется испугаться и вздрогнуть',
            genres: [27, 53],
            keywords: ['страшный', 'ужасы', 'мистика', 'напряжённый', 'хоррор']
        },
        thoughtful: {
            id: 'thoughtful',
            name: '🤔 Задумчивое',
            description: 'Хочется поразмышлять о жизни',
            genres: [18, 9648, 99],
            keywords: ['философский', 'глубокий', 'смысл', 'загадка', 'документальный']
        },
        excited: {
            id: 'excited',
            name: '🔥 Боевое',
            description: 'Хочется экшена и адреналина',
            genres: [28, 12, 10759],
            keywords: ['боевик', 'экшен', 'напряжённый', 'адреналин', 'приключения']
        },
        romantic: {
            id: 'romantic',
            name: '💕 Романтичное',
            description: 'Хочется любви и нежности',
            genres: [10749, 10751],
            keywords: ['романтика', 'любовь', 'нежный', 'красивый', 'чувства']
        },
        fantasy: {
            id: 'fantasy',
            name: '✨ Фантастическое',
            description: 'Хочется улететь в другой мир',
            genres: [14, 878, 16],
            keywords: ['фэнтези', 'фантастика', 'магия', 'космос', 'невероятный']
        },
        relaxing: {
            id: 'relaxing',
            name: '🌊 Расслабляющее',
            description: 'Хочется отдохнуть и успокоиться',
            genres: [10402, 10770, 99],
            keywords: ['спокойный', 'красивый', 'музыка', 'природа', 'уютный']
        }
    };

    // =============================================
    // ПОИСК ФИЛЬМОВ (ИСПРАВЛЕННЫЙ)
    // =============================================
    async function searchMoviesByGenres(genreIds, limit = 30) {
        return new Promise((resolve) => {
            console.log('[Mood Movies] 🔍 Поиск по жанрам:', genreIds);

            // Используем TMDB API через прокси Lampa
            const params = {
                with_genres: genreIds.join(','),
                sort_by: 'popularity.desc',
                'vote_count.gte': 100,
                page: 1
            };

            // Пробуем получить из кэша
            const cacheKey = 'mood_search_' + genreIds.join('_');
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    if (data && data.length) {
                        console.log('[Mood Movies] 📦 Из кэша:', data.length);
                        resolve(data);
                        return;
                    }
                } catch {}
            }

            // Запрос к TMDB
            const url = Lampa.Utils.protocol() + 'tmdb.rootu.top/3/discover/movie';
            
            Lampa.Reguest.get(url, function(response) {
                try {
                    let data = response;
                    if (typeof response === 'string') {
                        data = JSON.parse(response);
                    }
                    
                    const movies = data.results || [];
                    console.log('[Mood Movies] 📽 Найдено:', movies.length);
                    
                    // Сохраняем в кэш
                    sessionStorage.setItem(cacheKey, JSON.stringify(movies));
                    resolve(movies);
                } catch (e) {
                    console.error('[Mood Movies] Ошибка парсинга:', e);
                    resolve([]);
                }
            }, function(error) {
                console.error('[Mood Movies] Ошибка запроса:', error);
                // Пробуем альтернативный метод
                searchMoviesAlternative(genreIds, resolve);
            }, {
                dataType: 'json',
                params: params
            });
        });
    }

    // Альтернативный метод поиска через поиск по ключевым словам
    function searchMoviesAlternative(genreIds, resolve) {
        console.log('[Mood Movies] 🔄 Альтернативный поиск...');
        
        // Получаем названия жанров для поиска
        const genreNames = genreIds.map(id => getGenreName(id)).filter(Boolean);
        if (!genreNames.length) {
            resolve([]);
            return;
        }

        // Используем поиск Lampa
        const query = genreNames.slice(0, 3).join(' ');
        
        Lampa.Reguest.get(
            Lampa.Utils.protocol() + 'tmdb.rootu.top/3/search/movie',
            function(response) {
                try {
                    const data = typeof response === 'string' ? JSON.parse(response) : response;
                    const movies = data.results || [];
                    console.log('[Mood Movies] 🔄 Альтернативный поиск:', movies.length);
                    resolve(movies);
                } catch (e) {
                    resolve([]);
                }
            },
            function() {
                resolve([]);
            },
            {
                dataType: 'json',
                params: {
                    query: query,
                    page: 1
                }
            }
        );
    }

    // =============================================
    // ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ФИЛЬМЕ
    // =============================================
    function getMovieDetails(movieId) {
        return new Promise((resolve) => {
            Lampa.Reguest.get(
                Lampa.Utils.protocol() + 'tmdb.rootu.top/3/movie/' + movieId,
                function(response) {
                    try {
                        const data = typeof response === 'string' ? JSON.parse(response) : response;
                        resolve(data);
                    } catch {
                        resolve(null);
                    }
                },
                function() {
                    resolve(null);
                },
                { dataType: 'json' }
            );
        });
    }

    // =============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // =============================================
    function getGenreName(id) {
        const genres = {
            12: 'Приключения',
            14: 'Фэнтези',
            16: 'Анимация',
            18: 'Драма',
            27: 'Ужасы',
            28: 'Боевик',
            35: 'Комедия',
            36: 'История',
            37: 'Вестерн',
            53: 'Триллер',
            80: 'Криминал',
            99: 'Документальный',
            10749: 'Мелодрама',
            10751: 'Семейный',
            10752: 'Военный',
            10759: 'Боевик-приключения',
            10762: 'Детский',
            10763: 'Новости',
            10764: 'Реалити-шоу',
            10765: 'Научная фантастика',
            10766: 'Мыло',
            10767: 'Ток-шоу',
            10768: 'Политика',
            10770: 'Телефильм',
            878: 'Фантастика',
            9648: 'Детектив',
            10402: 'Музыкальный'
        };
        return genres[id] || '';
    }

    function getPosterUrl(path, size = 'w342') {
        if (!path) return '';
        return 'https://image.tmdb.org/t/p/' + size + path;
    }

    // =============================================
    // ГЛАВНАЯ СТРАНИЦА
    // =============================================
    function MoodPage(object) {
        let scrollInstance = null;
        let currentMood = null;

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

                    <div class="${PLUGIN.component}-scroll-wrap">
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

            // Создаём скролл
            const scrollEl = html.find(`.${PLUGIN.component}-scroll-wrap`)[0];
            if (scrollEl) {
                scrollInstance = new Lampa.Scroll({
                    element: scrollEl,
                    step: 300
                });
                scrollInstance.render();
            }

            // =============================================
            // ОБРАБОТЧИКИ
            // =============================================
            setTimeout(() => {
                // Клик по настроению
                Object.values(MOODS).forEach(mood => {
                    const selector = `#${PLUGIN.component}-mood-${mood.id}`;
                    $(selector).on('hover:enter click', function() {
                        loadMoviesByMood(mood.id);
                    });
                });

                // Кнопка "Назад"
                $('#${PLUGIN.component}-back').on('hover:enter click', function() {
                    showMoods();
                });

            }, 100);

            return html;
        };

        // =============================================
        // ЗАГРУЗКА ФИЛЬМОВ
        // =============================================
        async function loadMoviesByMood(moodId) {
            const mood = MOODS[moodId];
            if (!mood) return;

            currentMood = mood;
            console.log('[Mood Movies] 🎯 Выбрано настроение:', mood.name);

            showLoading(true);
            hideResults();
            hideMoods();

            try {
                // Сначала пробуем искать по жанрам
                let movies = await searchMoviesByGenres(mood.genres, 30);
                
                // Если ничего не нашли - пробуем по ключевым словам
                if (!movies || movies.length === 0) {
                    console.log('[Mood Movies] 🔄 Пробуем поиск по ключевым словам');
                    movies = await searchMoviesByKeywords(mood.keywords, 30);
                }

                console.log('[Mood Movies] 📽 Итоговый результат:', movies ? movies.length : 0);
                showResults(mood, movies || []);
            } catch (error) {
                console.error('[Mood Movies] Ошибка:', error);
                showResults(mood, []);
            } finally {
                showLoading(false);
            }
        }

        // Поиск по ключевым словам
        async function searchMoviesByKeywords(keywords, limit = 30) {
            return new Promise((resolve) => {
                if (!keywords || keywords.length === 0) {
                    resolve([]);
                    return;
                }

                const query = keywords.slice(0, 3).join(' ');
                console.log('[Mood Movies] 🔍 Поиск по ключевым словам:', query);

                Lampa.Reguest.get(
                    Lampa.Utils.protocol() + 'tmdb.rootu.top/3/search/movie',
                    function(response) {
                        try {
                            const data = typeof response === 'string' ? JSON.parse(response) : response;
                            const movies = data.results || [];
                            resolve(movies);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    function() {
                        resolve([]);
                    },
                    {
                        dataType: 'json',
                        params: {
                            query: query,
                            page: 1
                        }
                    }
                );
            });
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
                movies.slice(0, 20).forEach(movie => {
                    const poster = getPosterUrl(movie.poster_path);
                    const year = movie.release_date ? movie.release_date.slice(0, 4) : '—';
                    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—';
                    const genres = movie.genre_ids ? movie.genre_ids.slice(0, 3).map(g => getGenreName(g)).filter(Boolean).join(', ') : '';

                    gridHtml += `
                        <div class="${PLUGIN.component}-movie-card selector" 
                             data-movie-id="${movie.id}">
                            <div class="${PLUGIN.component}-movie-poster">
                                ${poster ? `<img src="${poster}" alt="${movie.title}" loading="lazy">` : 
                                            `<div class="${PLUGIN.component}-movie-no-poster">🎬</div>`}
                                <div class="${PLUGIN.component}-movie-rating">⭐ ${rating}</div>
                            </div>
                            <div class="${PLUGIN.component}-movie-info">
                                <div class="${PLUGIN.component}-movie-title">${movie.title}</div>
                                <div class="${PLUGIN.component}-movie-meta">
                                    <span>${year}</span>
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
                    scrollInstance.update();
                }, 200);
            }

            // Обработчики для карточек
            setTimeout(() => {
                gridEl.querySelectorAll(`.${PLUGIN.component}-movie-card`).forEach(card => {
                    const movieId = card.dataset.movieId;
                    if (!movieId) return;

                    const openMovie = function() {
                        console.log('[Mood Movies] 📺 Открытие фильма:', movieId);
                        Lampa.Activity.push({
                            id: movieId,
                            component: 'full',
                            movie: {
                                id: movieId,
                                title: card.querySelector(`.${PLUGIN.component}-movie-title`)?.textContent || ''
                            }
                        });
                    };

                    card.addEventListener('click', openMovie);
                    $(card).on('hover:enter', openMovie);
                });
            }, 100);
        }

        function showMoods() {
            document.getElementById(`${PLUGIN.component}-moods-grid`).style.display = 'grid';
            document.getElementById(`${PLUGIN.component}-results`).style.display = 'none';
            document.getElementById(`${PLUGIN.component}-loading`).style.display = 'none';
            
            if (scrollInstance) {
                setTimeout(() => {
                    scrollInstance.update();
                }, 200);
            }
        }

        function hideMoods() {
            document.getElementById(`${PLUGIN.component}-moods-grid`).style.display = 'none';
        }

        function hideResults() {
            document.getElementById(`${PLUGIN.component}-results`).style.display = 'none';
        }

        function showLoading(show) {
            document.getElementById(`${PLUGIN.component}-loading`).style.display = show ? 'flex' : 'none';
        }

        // =============================================
        // УПРАВЛЕНИЕ
        // =============================================
        this.start = function() {
            console.log('[Mood Movies] 🚀 Запуск страницы');
            
            Lampa.Controller.add('content', {
                back: function() {
                    if (document.getElementById(`${PLUGIN.component}-results`).style.display !== 'none') {
                        showMoods();
                    } else {
                        Lampa.Activity.backward();
                    }
                }
            });
            
            Lampa.Controller.toggle('content');
            
            if (scrollInstance) {
                setTimeout(() => {
                    scrollInstance.update();
                }, 300);
            }
        };

        this.pause = function() {};
        this.stop = function() {
            if (scrollInstance) {
                scrollInstance.destroy();
                scrollInstance = null;
            }
        };
        
        this.render = function() {
            return $('<div></div>').append(this.create());
        };
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
                padding: 20px;
                color: #fff;
                box-sizing: border-box;
            }

            .${PLUGIN.component}-header {
                flex-shrink: 0;
                margin-bottom: 20px;
                text-align: center;
            }

            .${PLUGIN.component}-header h1 {
                font-size: 28px;
                margin: 0 0 8px 0;
                font-weight: 700;
                background: linear-gradient(135deg, #ff9800, #ff5722);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .${PLUGIN.component}-subheader {
                color: rgba(255,255,255,0.5);
                font-size: 14px;
            }

            .${PLUGIN.component}-scroll-wrap {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding-right: 5px;
                min-height: 0;
            }

            .${PLUGIN.component}-scroll-wrap::-webkit-scrollbar {
                width: 4px;
            }

            .${PLUGIN.component}-scroll-wrap::-webkit-scrollbar-track {
                background: transparent;
            }

            .${PLUGIN.component}-scroll-wrap::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.2);
                border-radius: 2px;
            }

            .${PLUGIN.component}-content {
                padding-bottom: 30px;
            }

            .${PLUGIN.component}-moods-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 20px;
            }

            .${PLUGIN.component}-mood-card {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 16px;
                padding: 20px 16px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .${PLUGIN.component}-mood-card:hover {
                transform: translateY(-3px);
                background: rgba(255,255,255,0.1);
                border-color: rgba(255,152,0,0.3);
                box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            }

            .${PLUGIN.component}-mood-icon {
                font-size: 32px;
                margin-bottom: 8px;
            }

            .${PLUGIN.component}-mood-name {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 6px;
            }

            .${PLUGIN.component}-mood-desc {
                font-size: 12px;
                color: rgba(255,255,255,0.5);
                margin-bottom: 10px;
            }

            .${PLUGIN.component}-mood-genres {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                justify-content: center;
            }

            .mood-genre-tag {
                font-size: 10px;
                padding: 2px 8px;
                background: rgba(255,152,0,0.12);
                border-radius: 12px;
                color: #ff9800;
                border: 1px solid rgba(255,152,0,0.08);
            }

            .${PLUGIN.component}-results {
                animation: ${PLUGIN.component}-fadeIn 0.3s ease;
                padding-bottom: 20px;
            }

            .${PLUGIN.component}-results-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                flex-wrap: wrap;
                gap: 10px;
            }

            .${PLUGIN.component}-results-header h2 {
                font-size: 20px;
                margin: 0;
            }

            .${PLUGIN.component}-back-btn {
                padding: 8px 20px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                background: rgba(255,255,255,0.05);
                color: #fff;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 13px;
            }

            .${PLUGIN.component}-back-btn:hover {
                background: rgba(255,255,255,0.1);
            }

            .${PLUGIN.component}-movies-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 16px;
            }

            .${PLUGIN.component}-movie-card {
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 12px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .${PLUGIN.component}-movie-card:hover {
                transform: translateY(-3px);
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,152,0,0.2);
                box-shadow: 0 8px 25px rgba(0,0,0,0.3);
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
                font-size: 36px;
                background: rgba(255,255,255,0.03);
            }

            .${PLUGIN.component}-movie-rating {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(0,0,0,0.8);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                color: #ff9800;
            }

            .${PLUGIN.component}-movie-info {
                padding: 10px 12px;
            }

            .${PLUGIN.component}-movie-title {
                font-size: 13px;
                font-weight: 600;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .${PLUGIN.component}-movie-meta {
                font-size: 11px;
                color: rgba(255,255,255,0.4);
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .${PLUGIN.component}-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                color: rgba(255,255,255,0.6);
            }

            .${PLUGIN.component}-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255,255,255,0.05);
                border-top: 3px solid #ff9800;
                border-radius: 50%;
                animation: ${PLUGIN.component}-spin 1s linear infinite;
                margin-bottom: 16px;
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
                padding: 40px 20px;
                grid-column: 1 / -1;
            }

            .${PLUGIN.component}-empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }

            .${PLUGIN.component}-empty p {
                font-size: 16px;
                color: rgba(255,255,255,0.6);
                margin: 4px 0;
            }

            /* Адаптив */
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
                    font-size: 22px;
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
        console.log('[Mood Movies] 🎨 Стили добавлены');
    }

    // =============================================
    // РЕГИСТРАЦИЯ
    // =============================================
    function registerComponent() {
        console.log('[Mood Movies] 📦 Регистрация компонента');
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
