(function () { 'use strict'; 

function startMe() { 
    var styles = ` 
        /* 1. ОСНОВНЫЕ ЦВЕТА */
        body{ 
            background-color: #0E1724; /* Очень темный синий */
        } 
        body, .card__vote{ 
            color: #E4F2FF; /* Светлый ледяной текст */
        } 
        body.black--style { 
            background: #000B18; /* Ещё темнее для режима Black */
        } 

        /* 2. ФОКУС И НАВЕДЕНИЕ (ЛЕДЯНОЙ АКЦЕНТ) */
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .selectbox-item.hover, .full-person.focus, .full-start__button.focus, .full-descr__tag.focus, .simple-button.focus, .iptv-list__item.focus, .iptv-menu__list-item.focus, .head__action.focus, .head__action.hover, .player-panel .button.focus, .search-source.active{ 
            /* Градиент от светло-голубого к бело-голубому */
            background: -webkit-gradient(linear, left top, right top, color-stop(1%, #79C2F5), to(#B3E2F7)); 
            background: -webkit-linear-gradient(left, #79C2F5 1%, #B3E2F7 100%); 
            background: linear-gradient(to right, #79C2F5 1%, #B3E2F7 100%); 
            color: #000; /* Чёрный текст на светлом фоне */
        } 
        
        /* 3. КОНТЕЙНЕРЫ (Модальные окна, Настройки) */
        .settings__content, .settings-input__content, .selectbox__content, .modal__content{ 
            /* Тёмно-синий/серый градиент */
            background: -webkit-linear-gradient(315deg, #2D3E50 1%, #071320 100%); 
            background: linear-gradient(135deg, #2D3E50 1%, #071320 100%); 
        } 
        
        /* 4. АКЦЕНТЫ И ПРОГРЕСС */
        .settings-param-title > span{ 
            color: #79C2F5; /* Голубые заголовки */
        } 
        .card.focus .card__view::after, .card.hover .card__view::after, .extensions__item.focus:after, .torrent-item.focus::after, .extensions__block-add.focus:after{ 
            border-color: #79C2F5; /* Голубая обводка карточек */
        } 
        .online-prestige.focus::after, .iptv-channel.focus::before, .iptv-channel.last--focus::before{ 
            border-color: #79C2F5 !important; 
        } 
        .time-line > div, .player-panel__position, .player-panel__position > div:after{ 
            background-color: #79C2F5; /* Голубая линия прогресса */
        } 
        
        /* 5. ЭЛЕМЕНТЫ ТОРРЕНТОВ И IPTV */
        .extensions{ 
            background: #0E1724; 
        } 
        .extensions__item, .extensions__block-add{ 
            background-color: #2D3E50; /* Немного светлее, чем фон */
        } 
        .torrent-item__size, .torrent-item__exe, .torrent-item__viewed, .torrent-serial__size{ 
            background-color: #79C2F5; /* Голубой фон для счетчиков */
            color: #000; 
        } 
        .torrent-serial{ 
            background-color: rgba(121, 194, 245, 0.1); /* Прозрачный голубой */
        } 
        .torrent-file.focus, .torrent-serial.focus{ 
            background-color: rgba(121, 194, 245, 0.36); /* Прозрачный голубой при фокусе */
        } 
        .iptv-channel{ 
            background-color: #1A314A !important; 
        } 
        
        /* Дополнительные стили, которые нужно оставить/адаптировать */
        .settings-folder.focus .settings-folder__icon{ 
            -webkit-filter: invert(1); 
            filter: invert(1); 
        } 
        .settings-input__links{ 
            background-color: rgba(255,255,255,0.2); 
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
