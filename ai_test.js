// ==UserScript==
// @name         Lampa AI Recommendations
// @namespace    lampa.ai.recommendations
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    // защита от повторного запуска
    if (window.lampa_ai_recommendations) return;
    window.lampa_ai_recommendations = true;

    // -----------------------------
    // жанры TMDB
    // -----------------------------
    const GENRES = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        14: 'Fantasy',
        36: 'History',
        27: 'Horror',
        10402: 'Music',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Sci-Fi',
        10770: 'TV Movie',
        53: 'Thriller',
        10752: 'War',
        37: 'Western'
    };

    // -----------------------------
    // создаём кнопку
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

        item.on('hover:enter', function () {

            try {

                // -----------------------------
                // activity / favorite
                // -----------------------------
                const activity = Lampa.Storage.get('activity') || [];
                const favorite = Lampa.Storage.get('favorite') || [];

                // -----------------------------
                // исключённые id
                // -----------------------------
                const excludedIds = [];

                activity.forEach(item => {
                    if (item && item.id) {
                        excludedIds.push(item.id);
                    }
                });

                favorite.forEach(item => {
                    if (item && item.id) {
                        excludedIds.push(item.id);
                    }
                });

                // -----------------------------
                // считаем жанры
                // -----------------------------
                const genreStats = {};

                activity.forEach(item => {

                    if (!item || !item.genres) return;

                    item.genres.forEach(genre => {

                        const id = genre.id;

                        if (!genreStats[id]) {
                            genreStats[id] = 0;
                        }

                        genreStats[id]++;

                    });

                });

                // -----------------------------
                // сортировка жанров
                // -----------------------------
                const sortedGenres = Object.entries(genreStats)
                    .sort((a, b) => b[1] - a[1]);

                // -----------------------------
                // если жанров нет
                // -----------------------------
                if (!sortedGenres.length) {

                    Lampa.Noty.show(
                        'Недостаточно данных для рекомендаций'
                    );

                    return;
                }

                // -----------------------------
                // берём топ 2 жанра
                // -----------------------------
                const topGenres = sortedGenres
                    .slice(0, 2)
                    .map(g => g[0]);

                // -----------------------------
                // TMDB discover url
                // -----------------------------
                const url =
                    'discover/movie?' +
                    'with_genres=' + topGenres.join('|') +
                    '&sort_by=vote_average.desc' +
                    '&vote_count.gte=500' +
                    '&vote_average.gte=7' +
                    '&include_adult=false';

                // -----------------------------
                // открываем подборку
                // -----------------------------
                Lampa.Activity.push({
                    component: 'category_full',
                    source: 'tmdb',
                    title: '🧠 Для вас',
                    url: url,
                    page: 1,

                    // фильтрация результатов
                    onRender: function (items) {

                        return items.filter(movie => {

                            return !excludedIds.includes(movie.id);

                        });

                    }

                });

                // -----------------------------
                // уведомление
                // -----------------------------
                const names = topGenres.map(id => {
                    return GENRES[id] || id;
                });

                Lampa.Noty.show(
                    'Жанры: ' + names.join(', ')
                );

            } catch (e) {

                console.log(e);

                Lampa.Noty.show(
                    'Ошибка AI Recommendations'
                );

            }

        });

        menu.prepend(item);

        console.log('✔ AI Recommendations loaded');
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
    // если меню обновилось
    // -----------------------------
    Lampa.Listener.follow('activity', function () {
        setTimeout(createButton, 500);
    });

})();
