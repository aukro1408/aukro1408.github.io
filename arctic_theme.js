(function () {
    'use strict';

    function startMe() {
        var styles = `
            /* =========================================
               LAMPA — ARCTIC THEME
               Graphite + Ice Blue
               ========================================= */

            body {
                background-color: #0A1014;
            }

            body,
            .card__vote {
                color: #E7F1F4;
            }

            body.black--style {
                background: #060A0D;
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
                    color-stop(1%, #E6F9FF),
                    to(#8DD8EA)
                );

                background: -webkit-linear-gradient(
                    left,
                    #E6F9FF 1%,
                    #8DD8EA 100%
                );

                background: -moz-linear-gradient(
                    left,
                    #E6F9FF 1%,
                    #8DD8EA 100%
                );

                background: -o-linear-gradient(
                    left,
                    #E6F9FF 1%,
                    #8DD8EA 100%
                );

                background: linear-gradient(
                    to right,
                    #E6F9FF 1%,
                    #8DD8EA 100%
                );

                color: #071014;
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
                    rgb(27, 40, 48) 1%,
                    rgb(7, 11, 14) 100%
                );

                background: -moz-linear-gradient(
                    315deg,
                    rgb(27, 40, 48) 1%,
                    rgb(7, 11, 14) 100%
                );

                background: -o-linear-gradient(
                    315deg,
                    rgb(27, 40, 48) 1%,
                    rgb(7, 11, 14) 100%
                );

                background: linear-gradient(
                    135deg,
                    rgb(27, 40, 48) 1%,
                    rgb(7, 11, 14) 100%
                );
            }

            .settings-input__links {
                background-color: rgba(255, 255, 255, 0.12);
            }

            /* =========================================
               CARDS / FOCUS BORDER
               ========================================= */

            .card.focus .card__view::after,
            .card.hover .card__view::after,
            .extensions__item.focus:after,
            .torrent-item.focus::after,
            .extensions__block-add.focus:after {
                border-color: #8DD8EA;
            }

            .online-prestige.focus::after,
            .iptv-channel.focus::before,
            .iptv-channel.last--focus::before {
                border-color: #8DD8EA !important;
            }

            /* =========================================
               PLAYER / PROGRESS
               ========================================= */

            .time-line > div,
            .player-panel__position,
            .player-panel__position > div:after {
                background-color: #63C7DC;
            }

            /* =========================================
               EXTENSIONS
               ========================================= */

            .extensions {
                background: #080D11;
            }

            .extensions__item,
            .extensions__block-add {
                background-color: #17242B;
            }

            /* =========================================
               TORRENTS
               ========================================= */

            .torrent-item__size,
            .torrent-item__exe,
            .torrent-item__viewed,
            .torrent-serial__size {
                background-color: #D8E8ED;
                color: #071014;
            }

            .torrent-serial {
                background-color: rgba(216, 232, 237, 0.08);
            }

            .torrent-file.focus,
            .torrent-serial.focus {
                background-color: rgba(141, 216, 234, 0.24);
            }

            /* =========================================
               IPTV
               ========================================= */

            .iptv-channel {
                background-color: #172A32 !important;
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
