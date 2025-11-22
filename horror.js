(function () {
    'use strict';

    function startPlugin() {
        Lampa.Noty.show('Horror 7.0: Финальная попытка позиционирования...');

        var attempts = 0;
        
        var search_timer = setInterval(function(){
            // Якорь: ищем единственный известный элемент, который работает — Настройки
            var settings_btn = $('.menu__item[data-action="settings"]');

            if(settings_btn.length > 0){
                clearInterval(search_timer);
                
                if($('.menu__item[data-action="horror"]').length == 0){
                    addHorrorButton(); // Вызываем без аргументов, чтобы найти элементы внутри
                    Lampa.Noty.show('Horror 7.0: Кнопка внедрена!');
                }
            } else {
                attempts++;
                if(attempts > 20) {
                    clearInterval(search_timer);
                    Lampa.Noty.show('Horror 7.0: Кнопка "Настройки" не найдена, вставка невозможна.');
                }
            }
        }, 500);
    }

    function addHorrorButton() {
        // --- 1. Поиск элементов через родителя Настроек ---
        // Ищем родителя кнопки Настройки (это и есть контейнер всего меню)
        var menu_parent = $('.menu__item[data-action="settings"]').parent();
        
        // Находим первый элемент в этом контейнере (это должна быть "Главная")
        var main_btn = menu_parent.find('.menu__item').eq(0); 
        
        // --- 2. Параметры кнопки (без изменений) ---
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
                url: 'discover/movie?with_genres=' + genreId + '&sort_by=popularity.desc', 
                title: genreTitle,
                component: 'category_full',
                page: 1,
                source: 'tmdb'
            });
        });

        // --- 3. Вставка после "Главная" ---
        // Вставляем нашу кнопку ПОСЛЕ первого элемента в списке (main_btn).
        if(main_btn.length){
             main_btn.after(button);
        } else {
             // Если не удалось найти первый элемент, вставляем перед Настройками (как в V3)
             $('.menu__item[data-action="settings"]').before(button);
             Lampa.Noty.show('Horror 7.0: Не удалось найти "Главная", вставлено в конец.');
        }
    }

    if (window.Lampa) startPlugin();
    else window.LampaLoad = startPlugin;
})();
