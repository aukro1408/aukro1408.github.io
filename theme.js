(function () { 'use strict'; 

function startMe() { 
    // --- 1. Новогодние Элементы ---
    // Встраиваем Data URI для Новогоднего фона (Снеговик, Санта и т.п.)
    // (Я использую заглушку, которую вы можете заменить на свое изображение в формате Data URI)
    var BACKGROUND_IMAGE_URI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHRleHQgeD0iMTAiIHk9IjYwIiBmb250LXNpemU9IjUwIiBmaWxsPSJ3aGl0ZSI+4p+377u/PC90ZXh0Pjwvc3ZnPg=='; 
    // ^^^ В этом месте нужно вставить реальный Data URI изображения с Сантой/Снеговиком.
    // Если вы замените его на реальное изображение, оно появится!
    
    var styles = ` 
        /* === НОВОГОДНИЕ ДОБАВЛЕНИЯ === */

        body::after {
            content: "";
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 100px; /* Высота снежного слоя */
            z-index: -1; 
            pointer-events: none;
            /* Градиент "Снежный сугроб" */
            background: linear-gradient(to top, rgba(255, 255, 255, 0.4) 10%, rgba(255, 255, 255, 0) 100%);
        }
        
        body::before {
            content: "";
            position: fixed;
            bottom: 5px; /* Немного над сугробом */
            right: 5px;
            width: 150px; /* Размер контейнера для изображения */
            height: 150px;
            z-index: -1;
            pointer-events: none;
            background-image: url("${BACKGROUND_IMAGE_URI}");
            background-size: contain;
            background-repeat: no-repeat;
            opacity: 0.7; /* Небольшая прозрачность, чтобы не отвлекало */
        }
        
        /* === 2. ОСНОВНАЯ ХОЛОДНАЯ ТЕМА (из V3.0) === */

        body{ 
            background-color: #131B2A; 
        } 
        body, .card__vote{ 
            color: #FFFFFF; 
        } 
        body.black--style { 
            background: #000B18; 
        } 

        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .selectbox-item.hover, .full-person.focus, .full-start__button.focus, .full-descr__tag.focus, .simple-button.focus, .iptv-list__item.focus, .iptv-menu__list-item.focus, .head__action.focus, .head__action.hover, .player-panel .button.focus, .search-source.active{ 
            background: -webkit-gradient(linear, left top, right top, color-stop(1%, #5AE0FF), to(#B3FFFF)); 
            background: linear-gradient(to right, #5AE0FF 1%, #B3FFFF 100%); 
            color: #000; 
        } 
        
        .settings__content, .settings-input__content, .selectbox__content, .modal__content{ 
            background: #243245;
        } 

        .settings-folder.focus .settings-folder__icon{ 
            -webkit-filter: invert(1); 
            filter: invert(1); 
        } 
        .settings-param-title > span{ 
            color: #5AE0FF; 
        } 
        .card.focus .card__view::after, .card.hover .card__view::after, .extensions__item.focus:after, .torrent-item.focus::after, .extensions__block-add.focus:after{ 
            border-color: #5AE0FF; 
        } 
        .online-prestige.focus::after, .iptv-channel.focus::before, .iptv-channel.last--focus::before{ 
            border-color: #5AE0FF !important; 
        } 
        .time-line > div, .player-panel__position, .player-panel__position > div:after{ 
            background-color: #5AE0FF; 
        } 
        .settings-input__links{ 
            background-color: rgba(255,255,255,0.2); 
        } 
        
        .extensions{ 
            background: #131B2A; 
        } 
        .extensions__item, .extensions__block-add{ 
            background-color: #243245; 
        } 
        .torrent-item__size, .torrent-item__exe, .torrent-item__viewed, .torrent-serial__size{ 
            background-color: #5AE0FF; 
            color: #000; 
        } 
        .torrent-serial{ 
            background-color: rgba(90, 224, 255, 0.1); 
        } 
        .torrent-file.focus, .torrent-serial.focus{ 
            background-color: rgba(90, 224, 255, 0.36); 
        } 
        .iptv-channel{ 
            background-color: #1A314A !important; 
        } 
    `; 

    var styleSheet = document.createElement("style"); 
    styleSheet.type = "text/css"; 
    styleSheet.innerText = styles; 
    document.head.appendChild(styleSheet); 
}; 

if (window.appready) startMe(); 
else { 
    Lampa.Listener.follow('app', function (e) { 
        if (e.type == 'ready') { 
            startMe(); 
        } 
    }); 
} 
})();
