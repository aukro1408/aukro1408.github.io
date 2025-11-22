(function () { 'use strict'; 
    
function startMe() { 
    var styles = ` 
        /* 1. ОСНОВНЫЕ ЦВЕТА (СВЕТЛЫЙ ФОН) */
        body{ 
            background-color: #F5F5F5; /* Очень светло-серый фон */
        } 
        body, .card__vote{ 
            color: #1A1A1A; /* Темно-серый/чёрный текст */
        } 
        body.black--style { 
            /* Стандартный темный фон для режима Black */
            background: #333333; 
        } 

        /* 2. ФОКУС И НАВЕДЕНИЕ (ЯРКИЙ ЭЛЕКТРИЧЕСКИЙ СИНИЙ) */
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .selectbox-item.hover, .full-person.focus, .full-start__button.focus, .full-descr__tag.focus, .simple-button.focus, .iptv-list__item.focus, .iptv-menu__list-item.focus, .head__action.focus, .head__action.hover, .player-panel .button.focus, .search-source.active{ 
            /* Яркий, чистый синий градиент */
            background: -webkit-gradient(linear, left top, right top, color-stop(1%, #00C6FF), to(#0072FF)); 
            background: linear-gradient(to right, #00C6FF 1%, #0072FF 100%); 
            color: #FFFFFF; /* Белый текст на ярком фоне */
        } 
        
        /* Инвертируем иконки, чтобы они были видны на светлом фоне фокуса */
        .settings-folder.focus .settings-folder__icon{ 
            -webkit-filter: invert(0); 
            filter: invert(0); 
        } 
        
        /* 3. КОНТЕЙНЕРЫ (Модальные окна, Настройки) */
        .settings__content, .settings-input__content, .selectbox__content, .modal__content{ 
            /* Чистый белый фон */
            background: #FFFFFF;
            /* Обводка для отличия от основного фона */
            border: 1px solid #E0E0E0;
        } 
        .settings-param-title > span{ 
            color: #1A1A1A; /* Тёмный заголовок */
        } 
        .settings-input__links{ 
            background-color: rgba(0,0,0,0.1); /* Тёмная прозрачность */
        } 

        /* 4. АКЦЕНТЫ И ПРОГРЕСС */
        .card.focus .card__view::after, .card.hover .card__view::after, .extensions__item.focus:after, .torrent-item.focus:after, .extensions__block-add.focus:after{ 
            border-color: #0096FF; /* Акцентный синий */
        } 
        .online-prestige.focus::after, .iptv-channel.focus::before, .iptv-channel.last--focus::before{ 
            border-color: #0096FF !important; 
        } 
        .time-line > div, .player-panel__position, .player-panel__position > div:after{ 
            background-color: #0096FF; /* Акцентный синий */
        } 
        
        /* 5. ЭЛЕМЕНТЫ ТОРРЕНТОВ И IPTV */
        .extensions{ 
            background: #F5F5F5; 
        } 
        .extensions__item, .extensions__block-add{ 
            background-color: #EAEAEA; /* Светло-серый блок */
        } 
        .torrent-item__size, .torrent-item__exe, .torrent-item__viewed, .torrent-serial__size{ 
            background-color: #0096FF; /* Акцентный синий */
            color: #FFFFFF; /* Белый текст */
        } 
        .torrent-serial{ 
            background-color: rgba(0,0,0,0.05); 
        } 
        .torrent-file.focus, .torrent-serial.focus{ 
            background-color: rgba(0,0,0,0.1); 
        } 
        .iptv-channel{ 
            background-color: #EAEAEA !important; /* Светлый фон канала */
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
