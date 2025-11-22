(function () {
    'use strict';

    function startPlugin() {
        // Ждем, пока Lampa полностью загрузится
        if (window.Lampa.Listener) {
            // Подписываемся на событие готовности приложения
            window.Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') {
                    addHorrorButton();
                }
            });
        } else {
            // Если вдруг Listener еще не инициализирован (редко)
            setTimeout(startPlugin, 200);
        }
    }

    function addHorrorButton() {
        // ID жанра "Ужасы" в TMDB = 27
        var genreId = '27';
        var genreTitle = 'Ужасы';

        // HTML иконки (Привидение)
        var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="100%" height="100%"><path d="M256 32c-88.4 0-160 71.6-160 160 0 34.4 10.6 66.6 28.8 93.4l-25.1 50.3c-6.4 12.8 2.9 27.9 17.2 27.9h12.4l12.5 49.8c3.3 13.3 15.3 22.6 29 22.6h22.4c13.7 0 25.7-9.3 29-22.6L234.7 364h42.6l12.5 49.8c3.3 13.3 15.3 22.6 29 22.6h22.4c13.7 0 25.7-9.3 29-22.6l12.5-49.8h12.4c14.3 0 23.6-15.1 17.2-27.9l-25.1-50.3c18.2-26.8 28.8-59 28.8-93.4 0-88.4-71.6-160-160-160zm0 224c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/></svg>';

        // Создаем HTML элемент кнопки
        // Класс 'selector' обязателен, чтобы пульт мог выбрать эту кнопку
        var button_html = `
            <div class="menu__item selector" data-action="horror">
                <div class="menu__ico">${iconSvg}</div>
                <div class="menu__text">${genreTitle}</div>
            </div>
        `;

        var button = $(button_html);

        // Обработчик нажатия (hover:enter - это стандартное событие нажатия OK в Lampa)
        button.on('hover:enter', function () {
            Lampa.Activity.push({
                // Запрос к API TMDB: discovery, сортировка по популярности, фильтр по жанру
                url: 'discover/movie?with_genres=' + genreId + '&sort_by=popularity.desc&vote_count.gte=100',
                title: genreTitle,
                component: 'category_full', // Компонент, который рисует сетку постеров
                page: 1,
                source: 'tmdb' // Источник данных
            });
        });

        // Вставляем кнопку в меню
        // '.menu .scroll' - это контейнер прокрутки левого меню
        // append добавляет в конец. Если хочешь вставить после "Поиск", используй after()
        $('.menu .scroll').append(button);
    }

    if (window.Lampa) startPlugin();
    else window.LampaLoad = startPlugin;
})();
