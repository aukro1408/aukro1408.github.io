(function () {
    'use strict';

    function startMe() {
        var styles = `
            /* =========================================
               LAMPA — DARK FOREST
               Deep Black + Forest Green
               ========================================= */

            body {
                background-color: #070D0A;
            }

            body,
            .card__vote {
                color: #E3EEE7;
            }

            body.black--style {
                background: #040806;
            }

            /* =========================================
               FOCUS
               ========================================= */

            .menu__item.focus,
            .menu__item.traverse,
            .menu__item.hover,
            .settings-folder.focus,
            .settings-param.focus,
            .selectbox-item.focus,
            .selectbox-item.hover,
            .full-person.focus,
            .full-start__button.focus,
            .full-descr__tag.focus,
            .simple-button.focus,
            .iptv-list__item.focus,
            .iptv-menu__list-item.focus,
            .head__action.focus,
            .head__action.hover,
            .player-panel .button.focus,
            .search-source.active {
                background: -webkit-gradient(
                    linear,
                    left top,
                    right top,
                    color-stop(1%, #E2F8EA),
                    to(#65B985)
                );

                background: -webkit-linear-gradient(
                    left,
                    #E2F8EA 1%,
                    #65B985 100%
                );

                background: -moz-linear-gradient(
                    left,
                    #E2F8EA 1%,
                    #65B985 100%
                );

                background: -o-linear-gradient(
                    left,
                    #E2F8EA 1%,
                    #65B985 100%
                );

                background: linear-gradient(
                    to right,
                    #E2F8EA 1%,
                    #65B985 100%
                );

                color: #061009;
            }

            /* =========================================
               SETTINGS
               ========================================= */

            .settings-folder.focus .settings-folder__icon {
                -webkit-filter: invert(1);
                filter: invert(1);
            }

            .settings-param-title > span {
                color: #FFFFFF;
            }

            .settings__content,
            .settings-input__content,
            .selectbox__content,
            .modal__content {
                background: -webkit-linear-gradient(
                    315deg,
                    rgb(24, 43, 32) 1%,
                    rgb(5, 11, 8) 100%
                );

                background: -moz-linear-gradient(
                    315deg,
                    rgb(24, 43, 32) 1%,
                    rgb(5, 11, 8) 100%
                );

                background: -o-linear-gradient(
                    315deg,
                    rgb(24, 43, 32) 1%,
                    rgb(5, 11, 8) 100%
                );

                background: linear-gradient(
                    135deg,
                    rgb(24, 43, 32) 1%,
                    rgb(5, 11, 8) 100%
                );
            }

            .settings-input__links {
                background-color: rgba(255, 255, 255, 0.10);
            }

            /* =========================================
               CARDS / FOCUS BORDER
               ========================================= */

            .card.focus .card__view::after,
            .card.hover .card__view::after,
            .extensions__item.focus:after,
            .torrent-item.focus::after,
            .extensions__block-add.focus:after {
                border-color: #65B985;
            }

            .online-prestige.focus::after,
            .iptv-channel.focus::before,
            .iptv-channel.last--focus::before {
                border-color: #65B985 !important;
            }

            /* =========================================
               PLAYER / PROGRESS
               ========================================= */

            .time-line > div,
            .player-panel__position,
            .player-panel__position > div:after {
                background-color: #45A86B;
            }

            /* =========================================
               EXTENSIONS
               ========================================= */

            .extensions {
                background: #050A07;
            }

            .extensions__item,
            .extensions__block-add {
                background-color: #12221A;
            }

            /* =========================================
               TORRENTS
               ========================================= */

            .torrent-item__size,
            .torrent-item__exe,
            .torrent-item__viewed,
            .torrent-serial__size {
                background-color: #D9E9DF;
                color: #061009;
            }

            .torrent-serial {
                background-color: rgba(217, 233, 223, 0.08);
            }

            .torrent-file.focus,
            .torrent-serial.focus {
                background-color: rgba(101, 185, 133, 0.24);
            }

            /* =========================================
               IPTV
               ========================================= */

            .iptv-channel {
                background-color: #14291F !important;
            }
        `;

        var styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    if (window.appready) {
        startMe();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                startMe();
            }
        });
    }
})();
