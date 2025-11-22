(function () {
    'use strict';

    function startPlugin() {
        Lampa.Noty.show('Horror 5.0: Ищу кнопку Лента...');

        var attempts = 0;
        
        var search_timer = setInterval(function(){
            // Ищем кнопку "Лента" по её стандартному селектору 'feed'
            var feed_btn = $('.menu__item[data-action="feed"]');

            // Если нашли кнопку Лента
            if(feed_btn.length > 0){
                clearInterval(search_timer);
                
                // Проверяем, нет ли уже нашей кнопки
                if($('.menu__item[data-action="horror"]').length == 0){
                    addHorrorButton(feed_btn);
                    Lampa.Noty.show('Horror 5.0: Кнопка внедрена!');
                }
            } else {
                attempts++;
                // Если прошло 10 секунд (20 попыток по 500мс), сдаемся и выводим ошибку
                if(attempts > 20) {
                    clearInterval(search_timer);
                    Lampa.Noty.show('Horror 5.0: Ошибка! Якорный элемент не найден.');
                }
            }
        }, 500);
    }

    // Изменения: удален фильтр голосования и изменено позиционирование
    function addHorrorButton(target_element) {
        var genreId = '27';
        var genreTitle = 'Ужасы';
        var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="M8 20v2h8v-2"></path><path d="M12.5 17l-.5-4"></path><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"></path></svg>';

        var button_html = `
            <div class="menu__item selector" data-action="horror">
                <div class="menu__ico">${iconSvg}</div>
                <div class="menu__text">${genreTitle}</div>
            </div>
        `;

        var button = $(button_html);

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                // ИЗМЕНЕНИЕ 1: Удален фильтр "&vote_count.gte=100" для максимальной выдачи фильмов
                url: 'discover/movie?with_genres=' + genreId + '&sort_by=popularity.desc', 
                title: genreTitle,
                component: 'category_full',
                page: 1,
                source: 'tmdb'
            });
        });

        // ИЗМЕНЕНИЕ 2: Вставляем ПЕРЕД элементом "Лента"
        target_element.before(button);
    }

    if (window.Lampa) startPlugin();
    else window.LampaLoad = startPlugin;
})();
