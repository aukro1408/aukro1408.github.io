(function () {
    'use strict';

    function startPlugin() {
        Lampa.Noty.show('Horror 3.0: Ищу кнопку настроек...');

        var attempts = 0;
        
        var search_timer = setInterval(function(){
            // Ищем кнопку "Настройки" по её стандартному селектору
            var settings_btn = $('.menu__item[data-action="settings"]');

            // Если нашли кнопку настроек
            if(settings_btn.length > 0){
                clearInterval(search_timer);
                
                // Проверяем, нет ли уже нашей кнопки
                if($('.menu__item[data-action="horror"]').length == 0){
                    addHorrorButton(settings_btn);
                    Lampa.Noty.show('Horror 3.0: Кнопка внедрена!');
                }
            } else {
                attempts++;
                // Если прошло 10 секунд (20 попыток по 500мс), сдаемся
                if(attempts > 20) {
                    clearInterval(search_timer);
                    Lampa.Noty.show('Horror 3.0: Ошибка! Меню не найдено.');
                    console.log('Lampa Horror Plugin: Не удалось найти селектор .menu__item[data-action="settings"]');
                }
            }
        }, 500);
    }

    function addHorrorButton(target_element) {
        var genreId = '27';
        var genreTitle = 'Ужасы';
        // Простая иконка (череп)
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
                url: 'discover/movie?with_genres=' + genreId + '&sort_by=popularity.desc&vote_count.gte=100',
                title: genreTitle,
                component: 'category_full',
                page: 1,
                source: 'tmdb'
            });
        });

        // Вставляем ПЕРЕД кнопкой настроек
        target_element.before(button);
    }

    if (window.Lampa) startPlugin();
    else window.LampaLoad = startPlugin;
})();
