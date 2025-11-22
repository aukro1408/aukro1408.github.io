(function () {
    'use strict';

    function startPlugin() {
        // 1. Сразу показываем уведомление, чтобы ты понял, что файл подцепился
        Lampa.Noty.show('Плагин Horror: Запуск...');

        // 2. Запускаем таймер, который ищет меню
        var search_menu = setInterval(function(){
            // Ищем контейнер меню
            var menu = $('.menu .scroll');

            // Если меню найдено (length > 0)
            if(menu.length > 0){
                
                // Проверяем, не добавили ли мы кнопку уже (чтобы не дублировать)
                if($('.menu__item[data-action="horror"]').length == 0){
                    addHorrorButton(menu);
                    Lampa.Noty.show('Плагин Horror: Кнопка добавлена!');
                }

                // Останавливаем таймер, работа сделана
                clearInterval(search_menu);
            }
        }, 500); // Проверяем каждые 500 мс
    }

    function addHorrorButton(menu_container) {
        var genreId = '27';
        var genreTitle = 'Ужасы';
        var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="100%" height="100%"><path d="M256 32c-88.4 0-160 71.6-160 160 0 34.4 10.6 66.6 28.8 93.4l-25.1 50.3c-6.4 12.8 2.9 27.9 17.2 27.9h12.4l12.5 49.8c3.3 13.3 15.3 22.6 29 22.6h22.4c13.7 0 25.7-9.3 29-22.6L234.7 364h42.6l12.5 49.8c3.3 13.3 15.3 22.6 29 22.6h22.4c13.7 0 25.7-9.3 29-22.6l12.5-49.8h12.4c14.3 0 23.6-15.1 17.2-27.9l-25.1-50.3c18.2-26.8 28.8-59 28.8-93.4 0-88.4-71.6-160-160-160zm0 224c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/></svg>';

        var button_html = `
            <div class="menu__item selector" data-action="horror">
                <div class="menu__ico">${iconSvg}</div>
                <div class="menu__text">${genreTitle}</div>
            </div>
        `;

        var button = $(button_html);

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: 'discover/movie?with_genres=' + genreId + '&sort_by=popularity.desc&vote_count.gte=100',
                title: genreTitle,
                component: 'category_full',
                page: 1,
                source: 'tmdb'
            });
        });

        // Добавляем кнопку
        menu_container.append(button);
    }

    if (window.Lampa) startPlugin();
    else window.LampaLoad = startPlugin;
})();
