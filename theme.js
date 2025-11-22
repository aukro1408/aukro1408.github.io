(function () { 'use strict'; 
    
function startMe() { 
    var styles = ` 
        /* === ПРИНУДИТЕЛЬНЫЙ СВЕТЛЫЙ РЕЖИМ (ПЕРЕКРЫВАЕТ ТЁМНЫЙ СТИЛЬ LAMPА) === */

        /* Принудительно делаем фон всего приложения светлым */
        body, body.black--style { 
            background-color: #F5F5F5 !important; /* Очень светло-серый */
        } 
        /* Принудительно делаем боковое меню светлым */
        .menu, .menu__list {
            background: #FFFFFF !important;
        }
        /* Принудительно делаем текст в меню темным */
        .menu__item .menu__text, .menu__item .menu__ico, .menu__item {
            color: #1A1A1A !important; 
        }
        /* Принудительно делаем фон настроек/модальных окон белым */
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
            background: #FFFFFF !important; 
        }

        /* === ОСНОВНЫЕ СТИЛИ ТЕМЫ (ОТ V5.0) === */

        body, .card__vote{ 
            color: #1A1A1A; /* Темно-серый/чёрный текст */
        } 
        body.black--style { 
            /* Если режим black--style все же применится к некоторым элементам */
            background: #F5F5F5; 
        } 

        /* ФОКУС И НАВЕДЕНИЕ */
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .selectbox-item.hover, .full-person.focus, .full-start__button.focus, .full-descr__tag.focus, .simple-button.focus, .iptv-list__item.focus, .iptv-menu__list-item.focus, .head__action.focus, .head__action.hover, .player-panel .button.focus, .search-source.active{ 
            background: -webkit-gradient(linear, left top, right top, color-stop(1%, #00C6FF), to(#0072FF)); 
            background: linear-gradient(to right, #00C6FF 1%, #0072FF 100%); 
            color: #FFFFFF !important; /* Принудительно белый текст на фокусе */
        } 
        
        .settings-folder.focus .settings-folder__icon{ 
            -webkit-filter: invert(0); 
            filter: invert(0); 
        } 
        
        /* КОНТЕЙНЕРЫ */
        .settings-param-title > span{ 
            color: #1A1A1A; 
        } 
        .settings-input__links{ 
            background-color: rgba(0,0,0,0.1); 
        } 

        /* АКЦЕНТЫ И ПРОГРЕСС */
        .card.focus .card__view::after, .card.hover .card__view::after, .extensions__item.focus:after, .torrent-item.focus:after, .extensions__block-add.focus:after{ 
            border-color: #0096FF; 
        } 
        .online-prestige.focus::after, .iptv-channel.focus::before, .iptv-channel.last--focus::before{ 
            border-color: #0096FF !important; 
        } 
        .time-line > div, .player-panel__position, .player-panel__position > div:after{ 
            background-color: #0096FF; 
        } 
        
        /* ЭЛЕМЕНТЫ ТОРРЕНТОВ И IPTV */
        .extensions{ 
            background: #F5F5F5; 
        } 
        .extensions__item, .extensions__block-add{ 
            background-color: #EAEAEA; 
        } 
        .torrent-item__size, .torrent-item__exe, .torrent-item__viewed, .torrent-serial__size{ 
            background-color: #0096FF; 
            color: #FFFFFF; 
        } 
        .torrent-serial{ 
            background-color: rgba(0,0,0,0.05); 
        } 
        .torrent-file.focus, .torrent-serial.focus{ 
            background-color: rgba(0,0,0,0.1); 
        } 
        .iptv-channel{ 
            background-color: #EAEAEA !important; 
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
