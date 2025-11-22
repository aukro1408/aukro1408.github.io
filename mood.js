(function () {
    'use strict';
    
    // --- 1. ФОРМУЛЫ (Имитируем стандартный URL для жанра: genre/ID) ---
    // Формат: [Имя, ID жанра, Иконка]
    var MOOD_BUTTONS = [
        ['☕ Расслабиться', 10749, '☕'], // Мелодрама
        ['💥 Взбодриться', 28, '💥'],  // Боевик
        ['🤔 Подумать', 18, '🤔'],     // Драма
        ['😂 Посмеяться', 35, '😂'],    // Комедия
        
        ['😱 Испугаться', 27, '😱'],    // Ужасы
        ['👽 Фантастика', 878, '👽'],   // Фантастика
        ['🤠 Вестерн', 37, '🤠'],       // Вестерн 
        ['👶 Для детей', 10751, '👶'] // Семейный
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
            // В data-mood-id теперь ID жанра
            html += `<div data-mood-id="${mood[1]}" data-mood-title="${mood[0]}" class="mood-button selector">
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
            var id = btn.data('mood-id');
            var title = btn.data('mood-title');
            
            Lampa.Modal.close(); 
            
            // --- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: ИМИТАЦИЯ СТАНДАРТНОГО URL ---
            // Формат: genre/ID_Жанра
            var url_category = 'genre/' + id;

            Lampa.Activity.push({
                url: url_category, // Используем стандартный формат
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
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            padding: 20px;
        }
        .mood-button {
            height: 80px;
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
            background-color: #007bff; 
        }
        .mood-icon {
            font-size: 32px;
            margin-bottom: 5px;
        }
        .mood-text {
            font-size: 14px;
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
