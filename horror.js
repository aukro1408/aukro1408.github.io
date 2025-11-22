(function () {
    'use strict';

    function startPlugin() {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                Lampa.Noty.show('Horror 9.0: Вставка в начало списка...');
                addHorrorButton();
            }
        });
    }

    function addHorrorButton() {
        var genreId = '27';
        var genreTitle = 'Ужасы';
        var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="M8 20v2h8v-2"></path><path d="M12.5 17l-.5-4"></path><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"></path></svg>';

        // 1. Создаем кнопку (обрати внимание, что это теперь <li> элемент)
        var button_html = `
            <li data-action="horror" class="menu__item selector">
                <div class="menu__ico">${iconSvg}</div>
                <div class="menu__text">${genreTitle}</div>
            </li>
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

        // 🎯 ФИНАЛЬНЫЙ МЕТОД ВСТАВКИ:
        // Используем метод prepend() для вставки в самое начало списка.
        var list_container = $('.menu .menu__list').eq(0);
        
        if (list_container.length) {
            list_container.prepend(button);
            Lampa.Noty.show('Horror 9.0: Установлено в самое начало списка.');
        } else {
            Lampa.Noty.show('Horror 9.0: Контейнер меню не найден. Вставка невозможна.');
        }
    }

    if (window.appready) {
        addHorrorButton();
    } else {
        startPlugin();
    }
})();
