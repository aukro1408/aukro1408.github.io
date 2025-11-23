(function () {
    'use strict';

    // 1. Создание объекта плагина и его метаданных
    let component = {
        id: 'mood_movies',
        name: 'Фильмы по Настроению',
        description: 'Подборка фильмов на основе вашего настроения.',
        
        // Переменная для хранения активного экрана (Activity)
        mood_activity: null
    };

    // --- НАСТРОЙКИ ---
    // Список настроений и соответствующих им жанров (ID жанров TMDB)
    const MOODS = [
        { name: 'Весело (Комедия)', query: '35' },      // Comedy
        { name: 'Грустно (Драма)', query: '18' },        // Drama
        { name: 'Страшно (Ужасы)', query: '27' },      // Horror
        { name: 'Задумчиво (Детектив)', query: '9648' } // Mystery
    ];

    // 2. Инициализация плагина (вызывается Lampa.Plugins.add)
    component.init = function() {
        // Проверка на существование Lampa (дополнительная мера безопасности)
        if (!window.Lampa) return;
        
        // Регистрируем плагин в главном меню (Component System)
        Lampa.Component.add({
            name: component.id,
            component: component,
            // ИСПРАВЛЕНИЕ: Проверена иконка, чтобы гарантировать, что это корректная строка.
            icon: `<svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12Z"/></svg>`
        });
        
        console.log(`[${component.name}] Плагин зарегистрирован.`);
    };

    // 3. Запуск плагина (вызывается при клике в меню)
    component.start = function() {
        if (!Lampa.Activity || !Lampa.Activity.push) return;

        // Создаем новый экран (Activity)
        component.mood_activity = new Lampa.Activity({
            title: component.name,
            component: component.id,
            id: component.id,
            onBack: () => {
                Lampa.Activity.destroy(component.mood_activity);
            }
        });

        component.render_mood_selection(component.mood_activity);
        
        Lampa.Activity.push(component.mood_activity);
    };

    // 4. Рендеринг UI выбора настроения
    component.render_mood_selection = function(activity) {
        if (!Lampa.Template || !Lampa.Controller) return;

        let content = $('<div></div>').addClass('mood-selection-view');
        content.append('<h2 class="mood-title">Выберите ваше настроение:</h2>');
        
        const mood_buttons_container = $('<div></div>').addClass('mood-buttons-container');

        MOODS.forEach(mood => {
            const button = Lampa.Template.get('button_circle', {
                name: mood.name
            }).addClass('mood-button');

            button.on('hover:enter', () => {
                component.get_movies(mood.query, mood.name);
            });
            
            mood_buttons_container.append(button);
        });

        content.append(mood_buttons_container);
        activity.content(content);
        
        // Управление фокусом
        Lampa.Controller.add('mood_selection', {
            toggle: () => {
                return $('.mood-button', mood_buttons_container);
            },
            update: () => {},
            left: () => Lampa.Controller.prev(), 
            down: () => Lampa.Controller.down() 
        });
        
        Lampa.Controller.toggle('mood_selection');
        Lampa.Controller.focus($('.mood-button', mood_buttons_container).eq(0));
    };

    // 5. Получение контента (Lampa.Api)
    component.get_movies = function(genre_id, mood_name) {
        if (!Lampa.Loading || !Lampa.Api || !Lampa.Noty) return;

        Lampa.Loading.start(true); 

        Lampa.Api.popular({
            limit: 50, 
            genres: genre_id,
            sort: 'vote_average.desc'
        }).then(data => {
            Lampa.Loading.stop();
            
            if (data.results && data.results.length) {
                component.render_results(data.results, mood_name);
            } else {
                Lampa.Noty.show(`Не найдено фильмов по настроению "${mood_name}".`);
            }
        }).catch(error => {
            Lampa.Loading.stop();
            console.error('Mood Movies API Error:', error);
            Lampa.Noty.show('Ошибка при загрузке данных о фильмах.');
        });
    };

    // 6. Рендеринг результатов (Lampa.Scroll, Lampa.Template)
    component.render_results = function(items, mood_name) {
        if (!Lampa.Template || !Lampa.Scroll || !Lampa.Controller || !Lampa.Detail) return;

        let results_content = $('<div></div>').addClass('mood-results-view');
        results_content.append(`<h2>Результаты для настроения: ${mood_name}</h2>`);

        let scroll = new Lampa.Scroll({
            scroll_by_wheel: true,
            direction: 'horizontal',
            mask: true
        });
        
        results_content.append(scroll.render());
        
        items.forEach(movie => {
            const card = Lampa.Template.get('card', {
                title: movie.title || movie.name,
                poster: Lampa.Api.img(movie.poster_path),
                vote: movie.vote_average,
                data: movie 
            });
            
            card.data('id', movie.id);
            
            card.on('hover:enter', () => {
                Lampa.Detail.open({ 
                    id: movie.id,
                    title: movie.title || movie.name,
                    tmdb_id: movie.id,
                    source: movie.media_type
                });
            });
            
            scroll.append(card);
        });
        
        component.mood_activity.content(results_content);
        
        Lampa.Controller.toggle('scroll');
        Lampa.Controller.focus(scroll.render().find('.card').eq(0));
    };

    // 7. Регистрация плагина в Lampa
    Lampa.Plugins.add(component);

})();
