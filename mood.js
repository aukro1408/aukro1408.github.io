(function () {
    'use strict';
    
    // --- 1. ФОРМУЛЫ (Обновлено: добавлены сезонные и специфичные) ---
    // Формат: [Имя, URL-параметры TMDB, Иконка]
    var MOOD_BUTTONS = [
        ['☕ Расслабиться', 'discover/movie?with_genres=35,10749&sort_by=popularity.desc', '☕'],  // Комедия, Мелодрама
        ['💥 Взбодриться', 'discover/movie?with_genres=28,53&sort_by=popularity.desc', '💥'],   // Боевик, Триллер
        ['🤔 Подумать', 'discover/movie?with_genres=9648,18&sort_by=popularity.desc', '🤔'],      // Детектив, Драма
        ['😂 Посмеяться', 'discover/movie?with_genres=35&sort_by=popularity.desc', '😂'],         // Только Комедия
        
        ['👻 Хэллоуин', 'discover/movie?with_genres=27&with_keywords=10040,10334&sort_by=popularity.desc', '👻'], // Ужасы + Монстры, Призраки
        ['🎄 Рождество', 'discover/movie?with_genres=35&with_keywords=1409,1592&sort_by=popularity.desc', '🎄'], // Комедия + Рождество, Зима
        ['😱 Испугаться', 'discover/movie?with_genres=27,53&sort_by=vote_average.desc&vote_count.gte=1000', '😱'], // Чистый Ужас/Триллер с хорошим рейтингом
        ['😴 Скучно', 'discover/movie?sort_by=vote_average.desc&vote_count.lte=500&vote_average.gte=7.5', '😴'] // Скрытые жемчужины (высокий рейтинг, мало голосов)
    ];

    var PLUGIN_TITLE = 'Подборка по Настроению';
    var PLUGIN_ACTION = 'mood_selector';
    var PLUGIN_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.5C17.246 21.5 21.5 17.246 21.5 12C21.5 6.754 17.246 2.5 12 2.5C6.754 2.5 2.5 6.754 2.5 12C2.5 17.246 6.754 21.5 12 21.5Z"/><path d="M12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>';

    function addMoodButton() {
        if ($('.menu__item[data-action="' + PLUGIN_ACTION + '"]').length > 0) return;

        var button_html = `
            <li data-action="${PLUGIN_ACTION}" class="menu__item selector">
                <div class="menu__ico">${PLUGIN_ICON_SVG}</div>
                <div class="menu__text">${PLUGIN_TITLE}</div>
            </li>
        `;
        var button = $(button_html);

        button.on('hover:enter', function () {
            Lampa.Modal.open({
                title: PLUGIN_TITLE,
                size: 'medium',
                html: createMoodSelectorHTML()
            });
            setupMoodHandlers();
        });

        var list_container = $('.menu .menu__list').eq(0);
        if (list_container.length) {
            list_container.append(button);
        }
    }

    function createMoodSelectorHTML() {
        var html = '<div class="mood-selector-container">';
        MOOD_BUTTONS.forEach(function(mood) {
            html += `<div data-mood-url="${mood[1]}" data-mood-title="${mood[0]}" class="mood-button selector">
                        <div class="mood-icon">${mood[2]}</div>
                        <div class="mood-text">${mood[0]}</div>
                    </div>`;
        });
        html += '</div>';
        return html;
    }
    
    function setupMoodHandlers() {
        $('.mood-button').on('hover:enter', function() {
            var btn = $(this);
            var url = btn.data('mood-url');
            var title = btn.data('mood-title');
            
            Lampa.Modal.close(); 
            
            Lampa.Activity.push({
                url: url, 
                title: title,
                component: 'category_full',
                page: 1,
                source: 'tmdb'
            });
        });
    }

    // --- СТИЛИ ДЛЯ МОДАЛЬНОГО ОКНА ---
    var styles = `
        .mood-selector-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr); /* Увеличили сетку до 3х */
            gap: 20px;
            padding: 20px;
        }
        .mood-button {
            height: 80px; /* Уменьшили высоту, так как кнопок стало больше */
            border-radius: 8px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            background-color: rgba(255, 255, 255, 0.1);
            transition: all 0.2s;
            color: #fff;
        }
        .mood-button.focus {
            transform: scale(1.05);
            background-color: #007bff; /* Цвет фокуса (замените, если используете тему) */
        }
        .mood-icon {
            font-size: 32px;
            margin-bottom: 5px;
        }
        .mood-text {
            font-size: 14px; /* Уменьшили шрифт */
        }
    `;
    
    var styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);


    // --- ЗАПУСК ПЛАГИНА ---
    function startPlugin() {
        addMoodButton();
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
})();
