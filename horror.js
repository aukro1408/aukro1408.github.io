(function () {
    'use strict';
    
    // Новые данные для кнопки
    var HORROR_GENRE_ID = '27';
    var HORROR_TITLE = 'Ужасы';
    var HORROR_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="M8 20v2h8v-2"></path><path d="M12.5 17l-.5-4"></path><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"></path></svg>';

    function modifyFeedButton() {
        var attempts = 0;
        var maxAttempts = 20; // 10 секунд ожидания

        Lampa.Noty.show('Horror 10.0: Ищу кнопку "Лента" для замены...');

        var mod_timer = setInterval(function() {
            // Ищем кнопку "Лента" по её стандартному селектору
            var feed_btn = $('.menu__item[data-action="feed"]');

            if (feed_btn.length > 0) {
                clearInterval(mod_timer);
                replaceButtonContent(feed_btn);
                Lampa.Noty.show('Horror 10.0: Кнопка Лента успешно заменена на Ужасы!');
            } else {
                attempts++;
                if (attempts > maxAttempts) {
                    clearInterval(mod_timer);
                    Lampa.Noty.show('Horror 10.0: Ошибка! Кнопка "Лента" не найдена для замены.');
                }
            }
        }, 500);
    }

    function replaceButtonContent(target_element) {
        // 1. МЕНЯЕМ АТРИБУТЫ И КОНТЕНТ В DOM
        target_element.attr('data-action', 'horror'); // Меняем action, чтобы он не конфликтовал с "Лента"
        target_element.find('.menu__text').text(HORROR_TITLE); // Меняем текст
        target_element.find('.menu__ico').html(HORROR_ICON_SVG); // Меняем иконку

        // 2. МЕНЯЕМ ФУНКЦИОНАЛ
        
        // Удаляем старый обработчик события hover:enter (который открывал Ленту)
        target_element.off('hover:enter'); 
        
        // Добавляем новый обработчик (который открывает Ужасы)
        target_element.on('hover:enter', function () {
            Lampa.Activity.push({
                url: 'discover/movie?with_genres=' + HORROR_GENRE_ID + '&sort_by=popularity.desc', 
                title: HORROR_TITLE,
                component: 'category_full',
                page: 1,
                source: 'tmdb'
            });
        });
    }

    // Запускаем модификацию после полной загрузки приложения
    function startPlugin() {
        if (Lampa.Storage.get('my_horror_plugin_active', false)) {
            modifyFeedButton();
        }
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }

    // Добавляем простую настройку, чтобы можно было отключить плагин
    Lampa.SettingsApi.addComponent({
        component: 'my_horror_plugin',
        name: 'Плагин Ужасы',
        icon: HORROR_ICON_SVG,
    });
    Lampa.SettingsApi.addParam({
        component: 'my_horror_plugin',
        param: {
            name: 'my_horror_plugin_active',
            type: 'trigger',
            default: Lampa.Storage.get('my_horror_plugin_active', true),
        },
        field: {
            name: 'Активировать замену Ленты',
            description: 'Заменить кнопку "Лента" на "Ужасы" (для корректного позиционирования).',
        },
        onChange: function (value) {
            Lampa.Storage.set('my_horror_plugin_active', value);
            location.reload(); // Перезагружаем для применения изменений
        }
    });

})();
