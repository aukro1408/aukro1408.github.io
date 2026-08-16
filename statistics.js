(function() {
    "use strict";

    const PLUGIN = {
        component: 'lampa_stats',
        name: 'Моя статистика',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2"/>
            <circle cx="12" cy="16" r="5"/>
            <path d="M12 11v5"/>
            <path d="M8 16h8"/>
            <path d="M3 12h2"/>
            <path d="M19 12h2"/>
            <path d="M5 20l14-4"/>
            <path d="M5 4l14 4"/>
        </svg>`
    };

    // =============================================
    // ХРАНИЛИЩЕ
    // =============================================
    const STORAGE_KEY = PLUGIN.component + '_data';

    function getStats() {
        try {
            const data = Lampa.Storage.get(STORAGE_KEY, '{}');
            return JSON.parse(data);
        } catch {
            return {};
        }
    }

    function saveStats(data) {
        Lampa.Storage.set(STORAGE_KEY, JSON.stringify(data));
    }

    // =============================================
    // ТРЕКИНГ ПРОСМОТРОВ (С ОТЛАДКОЙ)
    // =============================================
    let watchSessions = {};
    let currentMovieId = null;

    function setupTracking() {
        console.log('[Lampa Stats] 🟢 Настройка трекинга...');

        // Подписываемся на все события плеера
        Lampa.Listener.follow('player', function(event) {
            console.log('[Lampa Stats] 📡 Событие:', event.type, event.data);

            const movie = event.data?.movie;
            const progress = event.data?.progress || 0;
            const movieId = movie?.id ? String(movie.id) : null;

            if (!movieId) {
                console.log('[Lampa Stats] ⚠️ Нет ID фильма');
                return;
            }

            switch(event.type) {
                case 'play':
                    console.log('[Lampa Stats] ▶️ Начал смотреть:', movie.title || movie.name);
                    currentMovieId = movieId;
                    
                    if (!watchSessions[movieId]) {
                        watchSessions[movieId] = {
                            id: movieId,
                            title: movie.title || movie.name || 'Без названия',
                            genre_ids: movie.genre_ids || [],
                            first_watch: Date.now(),
                            last_update: Date.now(),
                            total_seconds: 0,
                            last_progress: 0,
                            status: 'watching'
                        };
                        console.log('[Lampa Stats] 📝 Новая сессия:', watchSessions[movieId].title);
                    }
                    break;

                case 'timeupdate':
                    if (currentMovieId === movieId && watchSessions[movieId]) {
                        const session = watchSessions[movieId];
                        if (progress > session.last_progress) {
                            const delta = (progress - session.last_progress) * 0.5;
                            session.total_seconds += delta;
                            session.last_progress = progress;
                            session.last_update = Date.now();

                            // Сохраняем каждые 10 секунд
                            if (Math.floor(session.total_seconds) % 10 === 0) {
                                saveWatchSession(movieId);
                                console.log('[Lampa Stats] 💾 Сохранено:', session.title, Math.round(session.total_seconds) + 'с');
                            }
                        }
                    }
                    break;

                case 'end':
                    console.log('[Lampa Stats] ✅ Досмотрел до конца');
                    if (watchSessions[movieId]) {
                        const session = watchSessions[movieId];
                        session.status = 'completed';
                        session.progress = 100;
                        session.completed_at = Date.now();
                        saveWatchSession(movieId);
                        delete watchSessions[movieId];
                        currentMovieId = null;
                    }
                    break;

                case 'stop':
                    console.log('[Lampa Stats] ⏹ Остановил воспроизведение');
                    if (watchSessions[movieId]) {
                        const session = watchSessions[movieId];
                        if (progress > 30 && session.total_seconds > 60) {
                            session.status = 'watching';
                            session.progress = progress;
                            session.last_stop = Date.now();
                            saveWatchSession(movieId);
                            console.log('[Lampa Stats] ⏸ В процессе:', session.title, Math.round(progress) + '%');
                        } else if (session.total_seconds > 60) {
                            session.status = 'dropped';
                            session.progress = progress;
                            saveWatchSession(movieId);
                            console.log('[Lampa Stats] ❌ Бросил:', session.title);
                        } else {
                            console.log('[Lampa Stats] ⏹ Просмотр прерван (слишком короткий)');
                        }
                        delete watchSessions[movieId];
                        currentMovieId = null;
                    }
                    break;
            }
        });

        // Также подписываемся на событие завершения плеера
        Lampa.Listener.follow('player_video', function(event) {
            console.log('[Lampa Stats] 🎬 Событие player_video:', event.type);
        });

        console.log('[Lampa Stats] ✅ Трекинг настроен');
    }

    function saveWatchSession(movieId) {
        const session = watchSessions[movieId];
        if (!session) return;

        const MIN_WATCH_TIME = 60; // 60 секунд
        if (session.total_seconds < MIN_WATCH_TIME && session.status !== 'completed') {
            return;
        }

        const stats = getStats();
        const history = stats.history || {};

        history[movieId] = {
            title: session.title,
            genre_ids: session.genre_ids || [],
            first_watch: session.first_watch,
            last_watch: session.last_update || Date.now(),
            total_seconds: Math.round(session.total_seconds),
            progress: session.progress || 0,
            status: session.status,
            completed_at: session.completed_at || null
        };

        // Обновляем счётчики жанров
        const genres = stats.genres || {};
        (session.genre_ids || []).forEach(g => {
            genres[g] = (genres[g] || 0) + 1;
        });

        stats.history = history;
        stats.genres = genres;
        stats.last_update = Date.now();

        saveStats(stats);
    }

    // =============================================
    // АНАЛИТИКА
    // =============================================
    function getTopGenres(limit = 5) {
        const stats = getStats();
        const genres = stats.genres || {};
        
        return Object.entries(genres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id, count]) => ({
                id: Number(id),
                count: count
            }));
    }

    function getWatchStats() {
        const stats = getStats();
        const history = stats.history || {};
        const entries = Object.values(history);

        let totalMinutes = 0;
        entries.forEach(e => {
            totalMinutes += e.total_seconds / 60;
        });

        return {
            total: entries.length,
            completed: entries.filter(e => e.status === 'completed').length,
            watching: entries.filter(e => e.status === 'watching').length,
            dropped: entries.filter(e => e.status === 'dropped').length,
            total_minutes: Math.round(totalMinutes),
            total_hours: Math.round(totalMinutes / 60 * 10) / 10,
            recent: entries
                .sort((a, b) => b.last_watch - a.last_watch)
                .slice(0, 10)
        };
    }

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
            10759: 'Боевик и приключения',
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
    // СТРАНИЦА СТАТИСТИКИ (С ПРИНУДИТЕЛЬНЫМ ОБНОВЛЕНИЕМ)
    // =============================================
    function StatsPage(object) {
        this.create = function() {
            console.log('[Lampa Stats] 📄 Создание страницы статистики');
            
            const stats = getWatchStats();
            const topGenres = getTopGenres();
            
            console.log('[Lampa Stats] 📊 Данные:', stats);

            const html = $('<div></div>');
            
            let content = `
                <div class="${PLUGIN.component}-container">
                    <div class="${PLUGIN.component}-header">
                        <h1>📊 Моя статистика</h1>
                        <div class="${PLUGIN.component}-subheader">
                            ${stats.total ? `Посмотрено ${stats.total} фильмов` : 'Пока ничего не посмотрено'}
                            <button class="${PLUGIN.component}-refresh-btn selector" id="${PLUGIN.component}-refresh">
                                🔄 Обновить
                            </button>
                        </div>
                    </div>

                    <div class="${PLUGIN.component}-grid">
                        <div class="${PLUGIN.component}-stat-card">
                            <div class="${PLUGIN.component}-stat-number">${stats.total}</div>
                            <div class="${PLUGIN.component}-stat-label">Всего</div>
                        </div>
                        <div class="${PLUGIN.component}-stat-card">
                            <div class="${PLUGIN.component}-stat-number">${stats.completed}</div>
                            <div class="${PLUGIN.component}-stat-label">Завершено</div>
                        </div>
                        <div class="${PLUGIN.component}-stat-card">
                            <div class="${PLUGIN.component}-stat-number">${stats.watching}</div>
                            <div class="${PLUGIN.component}-stat-label">В процессе</div>
                        </div>
                        <div class="${PLUGIN.component}-stat-card">
                            <div class="${PLUGIN.component}-stat-number">${stats.total_hours}</div>
                            <div class="${PLUGIN.component}-stat-label">Часов</div>
                        </div>
                    </div>
            `;

            if (topGenres.length) {
                content += `
                    <div class="${PLUGIN.component}-section">
                        <h3>🎭 Любимые жанры</h3>
                        <div class="${PLUGIN.component}-genre-bars">
                            ${topGenres.map((g, i) => `
                                <div class="${PLUGIN.component}-genre-bar">
                                    <span class="${PLUGIN.component}-genre-name">${getGenreName(g.id)}</span>
                                    <div class="${PLUGIN.component}-bar-track">
                                        <div class="${PLUGIN.component}-bar-fill" 
                                             style="width: ${(g.count / topGenres[0].count) * 100}%; 
                                                    animation-delay: ${i * 0.1}s">
                                        </div>
                                    </div>
                                    <span class="${PLUGIN.component}-genre-count">${g.count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            if (stats.recent.length) {
                content += `
                    <div class="${PLUGIN.component}-section">
                        <h3>🕐 Недавние просмотры</h3>
                        <div class="${PLUGIN.component}-recent-list">
                            ${stats.recent.map(item => `
                                <div class="${PLUGIN.component}-recent-item">
                                    <div class="${PLUGIN.component}-recent-title">${item.title}</div>
                                    <div class="${PLUGIN.component}-recent-info">
                                        <span class="${PLUGIN.component}-recent-status status-${item.status}">
                                            ${item.status === 'completed' ? '✅' : 
                                              item.status === 'watching' ? '⏳' : '❌'}
                                        </span>
                                        <span>${Math.round(item.total_seconds / 60)} мин</span>
                                        <span>${new Date(item.last_watch).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            content += `
                    <div class="${PLUGIN.component}-actions">
                        <button class="${PLUGIN.component}-btn selector" id="${PLUGIN.component}-clear">
                            🗑 Очистить статистику
                        </button>
                        <button class="${PLUGIN.component}-btn selector" id="${PLUGIN.component}-export">
                            📤 Экспорт
                        </button>
                        <button class="${PLUGIN.component}-btn selector" id="${PLUGIN.component}-test">
                            🧪 Тестовый просмотр
                        </button>
                    </div>
                </div>
            `;

            html.append(content);

            // Обработчики
            setTimeout(() => {
                $('#' + PLUGIN.component + '-refresh').on('hover:enter click', function() {
                    console.log('[Lampa Stats] 🔄 Обновление страницы');
                    Lampa.Activity.replace(Lampa.Activity.active());
                });

                $('#' + PLUGIN.component + '-clear').on('hover:enter click', function() {
                    if (confirm('Точно очистить всю статистику?')) {
                        saveStats({});
                        Lampa.Activity.replace(Lampa.Activity.active());
                    }
                });

                $('#' + PLUGIN.component + '-export').on('hover:enter click', function() {
                    const data = getStats();
                    const json = JSON.stringify(data, null, 2);
                    const blob = new Blob([json], {type: 'application/json'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `lampa_stats_${new Date().toISOString().slice(0,10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                });

                $('#' + PLUGIN.component + '-test').on('hover:enter click', function() {
                    // Добавляем тестовые данные
                    const stats = getStats();
                    const history = stats.history || {};
                    
                    const testId = 'test_' + Date.now();
                    history[testId] = {
                        title: 'Тестовый фильм 🎬',
                        genre_ids: [28, 12, 878],
                        first_watch: Date.now() - 3600000,
                        last_watch: Date.now(),
                        total_seconds: 3600,
                        progress: 100,
                        status: 'completed',
                        completed_at: Date.now()
                    };
                    
                    const genres = stats.genres || {};
                    [28, 12, 878].forEach(g => {
                        genres[g] = (genres[g] || 0) + 1;
                    });
                    
                    stats.history = history;
                    stats.genres = genres;
                    saveStats(stats);
                    
                    console.log('[Lampa Stats] 🧪 Добавлен тестовый просмотр');
                    Lampa.Activity.replace(Lampa.Activity.active());
                });
            }, 100);

            return html;
        };

        this.start = function() {
            console.log('[Lampa Stats] 🚀 Запуск страницы');
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
    // ДОБАВЛЯЕМ ПУНКТ В МЕНЮ
    // =============================================
    function addMenuItem() {
        console.log('[Lampa Stats] 📌 Добавление пункта меню');
        
        const menuItem = $(`
            <li class="menu__item selector ${PLUGIN.component}-menu">
                <div class="menu__ico">${PLUGIN.icon}</div>
                <div class="menu__text">${PLUGIN.name}</div>
            </li>
        `);

        menuItem.on('hover:enter', function() {
            console.log('[Lampa Stats] 👆 Клик по пункту меню');
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
        console.log('[Lampa Stats] ✅ Пункт меню добавлен');
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
            }

            .${PLUGIN.component}-header {
                margin-bottom: 30px;
            }

            .${PLUGIN.component}-header h1 {
                font-size: 28px;
                margin: 0 0 8px 0;
                font-weight: 700;
            }

            .${PLUGIN.component}-subheader {
                color: rgba(255,255,255,0.5);
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
            }

            .${PLUGIN.component}-refresh-btn {
                padding: 6px 16px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                background: rgba(255,255,255,0.05);
                color: #fff;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.3s ease;
            }

            .${PLUGIN.component}-refresh-btn:hover {
                background: rgba(255,255,255,0.1);
            }

            .${PLUGIN.component}-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin-bottom: 30px;
            }

            .${PLUGIN.component}-stat-card {
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 16px;
                padding: 20px;
                text-align: center;
                transition: all 0.3s ease;
            }

            .${PLUGIN.component}-stat-card:hover {
                background: rgba(255,255,255,0.1);
                transform: translateY(-2px);
            }

            .${PLUGIN.component}-stat-number {
                font-size: 32px;
                font-weight: 700;
                color: #ff9800;
                margin-bottom: 8px;
            }

            .${PLUGIN.component}-stat-label {
                font-size: 14px;
                color: rgba(255,255,255,0.6);
            }

            .${PLUGIN.component}-section {
                margin-bottom: 30px;
            }

            .${PLUGIN.component}-section h3 {
                font-size: 18px;
                margin-bottom: 15px;
                font-weight: 600;
            }

            .${PLUGIN.component}-genre-bars {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .${PLUGIN.component}-genre-bar {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .${PLUGIN.component}-genre-name {
                min-width: 120px;
                font-size: 14px;
            }

            .${PLUGIN.component}-bar-track {
                flex: 1;
                height: 8px;
                background: rgba(255,255,255,0.08);
                border-radius: 4px;
                overflow: hidden;
            }

            .${PLUGIN.component}-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff9800, #ff5722);
                border-radius: 4px;
                width: 0%;
                animation: ${PLUGIN.component}-bar-grow 0.8s ease forwards;
            }

            @keyframes ${PLUGIN.component}-bar-grow {
                from { width: 0%; }
                to { width: var(--target-width); }
            }

            .${PLUGIN.component}-genre-count {
                min-width: 30px;
                text-align: right;
                font-size: 14px;
                color: rgba(255,255,255,0.6);
            }

            .${PLUGIN.component}-recent-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .${PLUGIN.component}-recent-item {
                background: rgba(255,255,255,0.04);
                border-radius: 12px;
                padding: 14px 18px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border: 1px solid rgba(255,255,255,0.06);
            }

            .${PLUGIN.component}-recent-title {
                font-weight: 500;
                font-size: 15px;
            }

            .${PLUGIN.component}-recent-info {
                display: flex;
                gap: 15px;
                font-size: 13px;
                color: rgba(255,255,255,0.5);
                align-items: center;
            }

            .${PLUGIN.component}-recent-status {
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
            }

            .status-completed {
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
            }

            .status-watching {
                background: rgba(255, 152, 0, 0.2);
                color: #ff9800;
            }

            .status-dropped {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
            }

            .${PLUGIN.component}-actions {
                display: flex;
                gap: 12px;
                margin-top: 20px;
                flex-wrap: wrap;
            }

            .${PLUGIN.component}-btn {
                padding: 10px 24px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                background: rgba(255,255,255,0.05);
                color: #fff;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
            }

            .${PLUGIN.component}-btn:hover {
                background: rgba(255,255,255,0.1);
                transform: translateY(-2px);
            }

            @media (max-width: 768px) {
                .${PLUGIN.component}-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                .${PLUGIN.component}-genre-name {
                    min-width: 80px;
                    font-size: 12px;
                }
                .${PLUGIN.component}-recent-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
                .${PLUGIN.component}-recent-info {
                    flex-wrap: wrap;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('[Lampa Stats] 🎨 Стили добавлены');
    }

    // =============================================
    // РЕГИСТРАЦИЯ КОМПОНЕНТА
    // =============================================
    function registerComponent() {
        console.log('[Lampa Stats] 📦 Регистрация компонента');
        Lampa.Component.add(PLUGIN.component, StatsPage);
    }

    // =============================================
    // ЗАПУСК
    // =============================================
    function init() {
        console.log('[Lampa Stats] 🚀 Инициализация...');
        addStyles();
        registerComponent();
        setupTracking();
        addMenuItem();
        console.log('[Lampa Stats] ✅ Плагин загружен!');
        
        // Выводим текущие данные для проверки
        const stats = getStats();
        console.log('[Lampa Stats] 📊 Текущие данные:', stats);
    }

    // Ждём готовность Lampa
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }

})();
