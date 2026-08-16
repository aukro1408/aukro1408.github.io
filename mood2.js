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
            genres: [35, 10751, 16], // Комедия, Семейный, Анимация
            keywords: ['смешной', 'весёлый', 'комедия', 'лёгкий', 'позитивный']
        },
        sad: {
            id: 'sad',
            name: '😔 Грустное',
            description: 'Хочется поплакать и посочувствовать',
            genres: [18, 10749], // Драма, Мелодрама
            keywords: ['драма', 'грустный', 'душевный', 'мелодрама', 'трогательный']
        },
        scared: {
            id: 'scared',
            name: '😱 Страшное',
            description: 'Хочется испугаться и вздрогнуть',
            genres: [27, 53], // Ужасы, Триллер
            keywords: ['страшный', 'ужасы', 'мистика', 'напряжённый', 'хоррор']
        },
        thoughtful: {
            id: 'thoughtful',
            name: '🤔 Задумчивое',
            description: 'Хочется поразмышлять о жизни',
            genres: [18, 9648, 99], // Драма, Детектив, Документальный
            keywords: ['философский', 'глубокий', 'смысл', 'загадка', 'документальный']
        },
        excited: {
            id: 'excited',
            name: '🔥 Боевое',
            description: 'Хочется экшена и адреналина',
            genres: [28, 12, 10759], // Боевик, Приключения, Боевик-приключения
            keywords: ['боевик', 'экшен', 'напряжённый', 'адреналин', 'приключения']
        },
        romantic: {
            id: 'romantic',
            name: '💕 Романтичное',
            description: 'Хочется любви и нежности',
            genres: [10749, 10751], // Мелодрама, Семейный
            keywords: ['романтика', 'любовь', 'нежный', 'красивый', 'чувства']
        },
        fantasy: {
            id: 'fantasy',
            name: '✨ Фантастическое',
            description: 'Хочется улететь в другой мир',
            genres: [14, 878, 16], // Фэнтези, Фантастика, Анимация
            keywords: ['фэнтези', 'фантастика', 'магия', 'космос', 'невероятный']
        },
        relaxing: {
            id: 'relaxing',
            name: '🌊 Расслабляющее',
            description: 'Хочется отдохнуть и успокоиться',
            genres: [10402, 10770, 99], // Музыкальный, Телефильм, Документальный
            keywords: ['спокойный', 'красивый', 'музыка', 'природа', 'уютный']
        }
    };

    // =============================================
    // ХРАНИЛИЩЕ
    // =============================================
    const STORAGE_KEY = PLUGIN.component + '_data';

    function getSettings() {
        try {
            return JSON.parse(Lampa.Storage.get(STORAGE_KEY, '{}'));
        } catch {
            return {};
        }
    }

    function saveSettings(data) {
        Lampa.Storage.set(STORAGE_KEY, JSON.stringify(data));
    }

    // =============================================
    // ПОИСК ФИЛЬМОВ ПО ЖАНРАМ
    // =============================================
    async function searchMoviesByGenres(genreIds, limit = 20) {
        return new Promise((resolve) => {
            // Используем поиск Lampa по жанрам
            const params = {
                with_genres: genreIds.join(','),
                sort_by: 'popularity.desc',
                page: 1
            };

            // Пробуем получить из кэша TMDB
            const cacheKey = 'mood_search_' + genreIds.join('_');
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    if (data && data.length) {
                        resolve(data);
                        return;
                    }
                } catch {}
            }

            // Используем Lampa API для поиска
            Lampa.Storage.set('tmdb_session', JSON.stringify({
                session_id: Lampa.Utils.uid()
            }));

            const request = new Lampa.Reguest();
            request.silent(
                Lampa.Utils.protocol() + 'tmdb.rootu.top/3/discover/movie',
                function(data) {
                    const movies = data.results || [];
                    // Сохраняем в кэш
                    sessionStorage.setItem(cacheKey, JSON.stringify(movies));
                    resolve(movies);
                },
                function(error) {
                    console.error('[Mood Movies] Ошибка поиска:', error);
                    // Если ошибка - пробуем через другой источник
                    resolve([]);
                },
                {
                    dataType: 'json',
                    params: params
                }
            );
        });
    }

    // =============================================
    // ПОЛУЧЕНИЕ ПОЛНОЙ ИНФОРМАЦИИ О ФИЛЬМЕ
    // =============================================
    async function getMovieDetails(movieId) {
        return new Promise((resolve) => {
            const request = new Lampa.Reguest();
            request.silent(
                Lampa.Utils.protocol() + 'tmdb.rootu.top/3/movie/' + movieId,
                function(data) {
                    resolve(data);
                },
                function() {
                    resolve(null);
                },
                {
                    dataType: 'json'
                }
            );
        });
    }

    // =============================================
    // ПОЛУЧЕНИЕ ПОСТЕРА
    // =============================================
    function getPosterUrl(path, size = 'w500') {
        if (!path) return '';
        return 'https://image.tmdb.org/t/p/' + size + path;
    }

    // =============================================
    // ГЛАВНАЯ СТРАНИЦА
    // =============================================
    function MoodPage(object) {
        this.create = function() {
            console.log('[Mood Movies] 📄 Создание страницы');

            const html = $('<div></div>');
            
            let content = `
                <div class="${PLUGIN.component}-container">
                    <div class="${PLUGIN.component}-header">
                        <h1>🎭 Фильмы по настроению</h1>
                        <div class="${PLUGIN.component}-subheader">
                            Выбери своё настроение и получи подборку фильмов
                        </div>
                    </div>

                    <div class="${PLUGIN.component}-moods-grid">
            `;

            // Сетка настроений
            Object.values(MOODS).forEach(mood => {
                content += `
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
                `;
            });

            content += `
                    </div>

                    <div class="${PLUGIN.component}-results" id="${PLUGIN.component}-results" style="display:none;">
                        <div class="${PLUGIN.component}-results-header">
                            <h2 id="${PLUGIN.component}-results-title"></h2>
                            <button class="${PLUGIN.component}-back-btn selector" id="${PLUGIN.component}-back">
                                ← Назад
                            </button>
                        </div>
                        <div class="${PLUGIN.component}-movies-grid" id="${PLUGIN.component}-movies-grid">
                            <!-- Здесь будут фильмы -->
                        </div>
                    </div>

                    <div class="${PLUGIN.component}-loading" id="${PLUGIN.component}-loading" style="display:none;">
                        <div class="${PLUGIN.component}-spinner"></div>
                        <p>Ищем фильмы для вас...</p>
                    </div>
                </div>
            `;

            html.append(content);

            // =============================================
            // ОБРАБОТЧИКИ
            // =============================================
            setTimeout(() => {
                // Клик по настроению
                Object.values(MOODS).forEach(mood => {
                    const el = document.getElementById(`${PLUGIN.component}-mood-${mood.id}`);
                    if (el) {
                        el.addEventListener('click', function() {
                            loadMoviesByMood(mood.id);
                        });
                        // Для пульта
                        $(el).on('hover:enter', function() {
                            loadMoviesByMood(mood.id);
                        });
                    }
                });

                // Кнопка "Назад"
                const backBtn = document.getElementById(`${PLUGIN.component}-back`);
                if (backBtn) {
                    backBtn.addEventListener('click', function() {
                        showMoods();
                    });
                    $(backBtn).on('hover:enter', function() {
                        showMoods();
                    });
                }

            }, 100);

            return html;
        };

        // =============================================
        // ЗАГРУЗКА ФИЛЬМОВ ПО НАСТРОЕНИЮ
        // =============================================
        async function loadMoviesByMood(moodId) {
            const mood = MOODS[moodId];
            if (!mood) return;

            console.log('[Mood Movies] 🎯 Выбрано настроение:', mood.name);

            // Показываем загрузку
            showLoading(true);
            hideResults();
            hideMoods();

            try {
                // Ищем фильмы по жанрам
                const movies = await searchMoviesByGenres(mood.genres, 30);
                
                console.log('[Mood Movies] 📽 Найдено фильмов:', movies.length);

                // Показываем результаты
                showResults(mood, movies);
            } catch (error) {
                console.error('[Mood Movies] Ошибка:', error);
                // Показываем заглушку
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

            // Заголовок
            if (titleEl) {
                titleEl.textContent = `${mood.name} — ${movies.length} фильмов`;
            }

            // Строим сетку
            let gridHtml = '';
            
            if (movies.length === 0) {
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
                    const poster = getPosterUrl(movie.poster_path, 'w342');
                    const year = movie.release_date ? movie.release_date.slice(0, 4) : '—';
                    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—';
                    const genres = movie.genre_ids ? movie.genre_ids.slice(0, 3).map(g => getGenreName(g)).join(', ') : '';

                    gridHtml += `
                        <div class="${PLUGIN.component}-movie-card selector" 
                             data-movie-id="${movie.id}"
                             id="${PLUGIN.component}-movie-${movie.id}">
                            <div class="${PLUGIN.component}-movie-poster">
                                ${poster ? `<img src="${poster}" alt="${movie.title}" loading="lazy">` : 
                                            `<div class="${PLUGIN.component}-movie-no-poster">🎬</div>`}
                                <div class="${PLUGIN.component}-movie-rating">⭐ ${rating}</div>
                            </div>
                            <div class="${PLUGIN.component}-movie-info">
                                <div class="${PLUGIN.component}-movie-title">${movie.title}</div>
                                <div class="${PLUGIN.component}-movie-meta">
                                    <span>${year}</span>
                                    <span>${genres}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            gridEl.innerHTML = gridHtml;

            // Показываем результаты
            resultsEl.style.display = 'block';

            // Обработчики для карточек фильмов
            setTimeout(() => {
                gridEl.querySelectorAll(`.${PLUGIN.component}-movie-card`).forEach(card => {
                    const movieId = card.dataset.movieId;
                    if (!movieId) return;

                    const openMovie = async function() {
                        console.log('[Mood Movies] 📺 Открытие фильма:', movieId);
                        try {
                            const details = await getMovieDetails(movieId);
                            if (details) {
                                // Открываем карточку фильма в Lampa
                                Lampa.Activity.push({
                                    id: movieId,
                                    component: 'full',
                                    movie: {
                                        id: movieId,
                                        title: details.title,
                                        original_title: details.original_title,
                                        overview: details.overview,
                                        release_date: details.release_date,
                                        poster_path: details.poster_path,
                                        backdrop_path: details.backdrop_path,
                                        vote_average: details.vote_average,
                                        genre_ids: details.genres ? details.genres.map(g => g.id) : []
                                    }
                                });
                            }
                        } catch (error) {
                            console.error('[Mood Movies] Ошибка открытия:', error);
                        }
                    };

                    card.addEventListener('click', openMovie);
                    $(card).on('hover:enter', openMovie);
                });
            }, 100);
        }

        // =============================================
        function showMoods() {
            document.querySelector(`.${PLUGIN.component}-moods-grid`).style.display = 'grid';
            document.getElementById(`${PLUGIN.component}-results`).style.display = 'none';
            document.getElementById(`${PLUGIN.component}-loading`).style.display = 'none';
        }

        function hideMoods() {
            document.querySelector(`.${PLUGIN.component}-moods-grid`).style.display = 'none';
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
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function() {};
        this.stop = function() {};
        this.render = function() {
            return $('<div></div>').append(this.create());
        };
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
        return genres[id] || `Жанр ${id}`;
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
            console.log('[Mood Movies] 👆 Клик по пункту меню');
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
                padding: 20px;
                color: #fff;
                max-width: 1200px;
                margin: 0 auto;
            }

            .${PLUGIN.component}-header {
                margin-bottom: 30px;
                text-align: center;
            }

            .${PLUGIN.component}-header h1 {
                font-size: 32px;
                margin: 0 0 10px 0;
                font-weight: 700;
                background: linear-gradient(135deg, #ff9800, #ff5722);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .${PLUGIN.component}-subheader {
                color: rgba(255,255,255,0.6);
                font-size: 16px;
            }

            .${PLUGIN.component}-moods-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin-bottom: 30px;
            }

            .${PLUGIN.component}-mood-card {
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 20px;
                padding: 24px 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .${PLUGIN.component}-mood-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, transparent 0%, rgba(255,152,0,0.05) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .${PLUGIN.component}-mood-card:hover {
                transform: translateY(-4px);
                background: rgba(255,255,255,0.1);
                border-color: rgba(255,152,0,0.3);
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }

            .${PLUGIN.component}-mood-card:hover::before {
                opacity: 1;
            }

            .${PLUGIN.component}-mood-icon {
                font-size: 40px;
                margin-bottom: 12px;
            }

            .${PLUGIN.component}-mood-name {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .${PLUGIN.component}-mood-desc {
                font-size: 13px;
                color: rgba(255,255,255,0.5);
                margin-bottom: 12px;
                line-height: 1.4;
            }

            .${PLUGIN.component}-mood-genres {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                justify-content: center;
            }

            .mood-genre-tag {
                font-size: 11px;
                padding: 3px 10px;
                background: rgba(255,152,0,0.15);
                border-radius: 20px;
                color: #ff9800;
                border: 1px solid rgba(255,152,0,0.1);
            }

            .${PLUGIN.component}-results {
                animation: ${PLUGIN.component}-fadeIn 0.3s ease;
            }

            .${PLUGIN.component}-results-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            }

            .${PLUGIN.component}-results-header h2 {
                font-size: 24px;
                margin: 0;
            }

            .${PLUGIN.component}-back-btn {
                padding: 10px 24px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                background: rgba(255,255,255,0.05);
                color: #fff;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
            }

            .${PLUGIN.component}-back-btn:hover {
                background: rgba(255,255,255,0.1);
                transform: translateY(-2px);
            }

            .${PLUGIN.component}-movies-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 20px;
            }

            .${PLUGIN.component}-movie-card {
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 16px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .${PLUGIN.component}-movie-card:hover {
                transform: translateY(-4px);
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,152,0,0.2);
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
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
                font-size: 48px;
                background: rgba(255,255,255,0.03);
            }

            .${PLUGIN.component}-movie-rating {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                color: #ff9800;
            }

            .${PLUGIN.component}-movie-info {
                padding: 12px 14px;
            }

            .${PLUGIN.component}-movie-title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .${PLUGIN.component}-movie-meta {
                font-size: 12px;
                color: rgba(255,255,255,0.4);
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .${PLUGIN.component}-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                color: rgba(255,255,255,0.6);
            }

            .${PLUGIN.component}-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255,255,255,0.05);
                border-top: 3px solid #ff9800;
                border-radius: 50%;
                animation: ${PLUGIN.component}-spin 1s linear infinite;
                margin-bottom: 20px;
            }

            @keyframes ${PLUGIN.component}-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes ${PLUGIN.component}-fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .${PLUGIN.component}-empty {
                text-align: center;
                padding: 60px 20px;
                grid-column: 1 / -1;
            }

            .${PLUGIN.component}-empty-icon {
                font-size: 64px;
                margin-bottom: 20px;
            }

            .${PLUGIN.component}-empty p {
                font-size: 18px;
                color: rgba(255,255,255,0.6);
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
                    font-size: 24px;
                }
                .${PLUGIN.component}-results-header {
                    flex-direction: column;
                    gap: 12px;
                    text-align: center;
                }
            }

            @media (max-width: 480px) {
                .${PLUGIN.component}-moods-grid {
                    grid-template-columns: 1fr;
                }
                .${PLUGIN.component}-movies-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
        console.log('[Mood Movies] 🎨 Стили добавлены');
    }

    // =============================================
    // РЕГИСТРАЦИЯ КОМПОНЕНТА
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
