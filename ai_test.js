// ==UserScript==
// @name         Lampa AI Recommendations
// @namespace    lampa.ai.recommendations
// @version      2.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    // защита от повторного запуска
    if (window.lampa_ai_recommendations_v2) return;
    window.lampa_ai_recommendations_v2 = true;

    // -----------------------------
    // жанры
    // -----------------------------
    const GENRES = {
        28: 'Боевик',
        12: 'Приключения',
        16: 'Анимация',
        35: 'Комедия',
        80: 'Криминал',
        18: 'Драма',
        14: 'Фэнтези',
        27: 'Ужасы',
        9648: 'Мистика',
        10749: 'Романтика',
        878: 'Sci-Fi',
        53: 'Триллер',
        10752: 'Военный'
    };

    // -----------------------------
    // создание кнопки
    // -----------------------------
    function createButton() {

        const menu = $('.menu .menu__list').eq(0);

        if (!menu.length) return;
        if ($('.ai-recommendations-btn').length) return;

        const item = $(`
            <li class="menu__item selector ai-recommendations-btn">
                <div class="menu__ico">🧠</div>
                <div class="menu__text">Для вас</div>
            </li>
        `);

        // -----------------------------
        // нажатие
        // -----------------------------
        item.on('hover:enter', function () {

            try {

                // -----------------------------
                // favorite storage
                // -----------------------------
                const favorite =
                    Lampa.Storage.get('favorite') || {};

                // -----------------------------
                // собираем все фильмы
                // -----------------------------
                let allItems = [];

                Object.keys(favorite).forEach(key => {

                    const section = favorite[key];

                    if (!Array.isArray(section)) return;

                    section.forEach(item => {

                        if (item && item.id) {
                            allItems.push(item);
                        }

                    });

                });

                // -----------------------------
                // если пусто
                // -----------------------------
                if (!allItems.length) {

                    Lampa.Noty.show(
                        'Нет данных в избранном'
                    );

                    return;
                }

                // -----------------------------
                // исключённые id
                // -----------------------------
                const excludedIds = [];

                allItems.forEach(item => {
                    excludedIds.push(item.id);
                });

                // -----------------------------
                // считаем жанры
                // -----------------------------
                const genreStats = {};

                allItems.forEach(item => {

                    // genre_ids
                    if (item.genre_ids &&
                        Array.isArray(item.genre_ids)) {

                        item.genre_ids.forEach(id => {

                            if (!genreStats[id]) {
                                genreStats[id] = 0;
                            }

                            genreStats[id]++;

                        });

                    }

                });

                // -----------------------------
                // сортировка жанров
                // -----------------------------
                const sortedGenres =
                    Object.entries(genreStats)
                    .sort((a, b) => b[1] - a[1]);

                // -----------------------------
                // fallback
                // -----------------------------
                if (!sortedGenres.length) {

                    Lampa.Noty.show(
                        'Жанры не найдены'
                    );

                    return;
                }

                // -----------------------------
                // топ жанры
                // -----------------------------
                const topGenres =
                    sortedGenres
                    .slice(0, 3)
                    .map(g => g[0]);

                // -----------------------------
                // discover query
                // -----------------------------
                const url =
                    'discover/movie?' +
                    'with_genres=' +
                    topGenres.join('|') +

                    '&sort_by=vote_average.desc' +
                    '&vote_average.gte=7' +
                    '&vote_count.gte=500' +
                    '&include_adult=false';

                // -----------------------------
                // открываем подборку
                // -----------------------------
                Lampa.Activity.push({
                    component: 'category_full',
                    source: 'tmdb',
                    title: '🧠 Для вас',
                    url: url,
                    page: 1
                });

                // -----------------------------
                // уведомление
                // -----------------------------
                const names = topGenres.map(id => {
                    return GENRES[id] || id;
                });

                Lampa.Noty.show(
                    'AI жанры: ' +
                    names.join(', ')
                );

                console.log('AI GENRES:', names);
                console.log('EXCLUDED IDS:', excludedIds);

            } catch (e) {

                console.log(e);

                Lampa.Noty.show(
                    'Ошибка AI Recommendations'
                );

            }

        });

        // -----------------------------
        // вставка кнопки
        // -----------------------------
        menu.prepend(item);

        console.log(
            '✔ AI Recommendations v2 loaded'
        );
    }

    // -----------------------------
    // init
    // -----------------------------
    function init() {
        createButton();
    }

    // -----------------------------
    // app ready
    // -----------------------------
    if (window.appready) {

        init();

    } else {

        Lampa.Listener.follow('app', function (e) {

            if (e.type === 'ready') {
                init();
            }

        });

    }

    // -----------------------------
    // redraw menu
    // -----------------------------
    Lampa.Listener.follow('activity', function () {
        setTimeout(createButton, 500);
    });

})();
