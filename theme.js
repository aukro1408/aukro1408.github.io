(function () { 'use strict'; 

function startMe() { 
    var styles = ` 
        /* 1. ОСНОВНЫЕ ЦВЕТА И ФОН (ГЛУБОКИЙ СИНЕ-ЧЕРНЫЙ) */
        body{ 
            /* Глубокий, живой градиент от очень темного синего к почти черному */
            background: -webkit-linear-gradient(top, #0E1724 1%, #04090f 100%); 
            background: linear-gradient(to bottom, #0E1724 1%, #04090f 100%); 
        } 
        body, .card__vote{ 
            color: #F8F8FF; /* Чистый белый текст для высокой контрастности */
        } 
        body.black--style { 
            background: #000B18; 
        } 

        /* 2. ФОКУС И НАВЕДЕНИЕ (ЯРКИЙ ЛЕДЯНОЙ АКЦЕНТ) */
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .selectbox-item.hover, .full-person.focus, .full-start__button.focus, .full-descr__tag.focus, .simple-button.focus, .iptv-list__item.focus, .iptv-menu__list-item.focus, .head__action.focus, .head__action.hover, .player-panel .button.focus, .search-source.active{ 
            /* Более яркий, насыщенный голубой градиент */
            background: -webkit-gradient(linear, left top, right top, color-stop(1%, #45A2F2), to(#87E0FF)); 
            background: linear-gradient(to right, #45A2F2 1%, #87E0FF 100%); 
            color: #000; /* Чёрный текст на светлом фоне */
        } 
        
        /* 3. КОНТЕЙНЕРЫ (Ледяное стекло - Слегка прозрачные, темные) */
        .settings__content, .settings-input__content, .selectbox__content, .modal__content{ 
            /* Тёмно-синий/серый градиент, слегка прозрачный */
            background: rgba(30, 50, 70, 0.95);
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(70, 150, 255, 0.2); /* Лёгкое голубое свечение */
        } 

        /* 4. АКЦЕНТЫ И ПРОГРЕСС */
        .settings-param-title > span{ 
            color: #45A2F2; /* Голубые заголовки */
        } 
        .card.focus .card__view::after, .card.hover .card__view::after, .extensions__item.focus:after, .torrent-item.focus::after, .extensions__block-add.focus:after{ 
            border-color: #45A2F2; /* Голубая обводка карточек */
        } 
        .online-prestige.focus::after, .iptv-channel.focus::before, .iptv-channel.last--focus::before{ 
            border-color: #45A2F2 !important; 
        } 
        .time-line > div, .player-panel__position, .player-panel__position > div:after{ 
            background-color: #45A2F2; /* Голубая линия прогресса */
        } 
        
        /* 5. ЭЛЕМЕНТЫ ТОРРЕНТОВ И IPTV */
        .extensions{ 
            background: #0E1724; 
        } 
        .extensions__item, .extensions__block-add{ 
            background-color: #2D3E50; 
        } 
        .torrent-item__size, .torrent-item__exe, .torrent-item__viewed, .torrent-serial__size{ 
            background-color: #45A2F2; /* Голубой фон для счетчиков */
            color: #000; 
        } 
        .torrent-serial{ 
            background-color: rgba(69, 162, 242, 0.1); 
        } 
        .torrent-file.focus, .torrent-serial.focus{ 
            background-color: rgba(69, 162, 242, 0.36); 
        } 
        .iptv-channel{ 
            background-color: #1A314A !important; 
        } 
        
        /* Стандартные адаптации */
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
