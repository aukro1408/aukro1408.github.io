(function () {
    'use strict';

    function startMe() {

        var styles = `
            /* =========================================
               LAMPA — ARCTIC LIVE
               Graphite + Ice Blue + Floating Particles
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
               CARDS
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
               PLAYER
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

            /* =========================================
               ARCTIC LIVE — PARTICLES
               ========================================= */

            #arctic-live-particles {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;

                pointer-events: none;

                overflow: hidden;

                z-index: 999999;

                opacity: 0.75;
            }

            .arctic-particle {
                position: absolute;

                width: 3px;
                height: 3px;

                border-radius: 50%;

                background: rgba(190, 240, 255, 0.8);

                box-shadow:
                    0 0 4px rgba(130, 220, 255, 0.65),
                    0 0 10px rgba(80, 190, 230, 0.35);

                animation-name: arctic-float;

                animation-timing-function: linear;

                animation-iteration-count: infinite;
            }

            .arctic-particle.small {
                width: 2px;
                height: 2px;

                opacity: 0.55;

                box-shadow:
                    0 0 3px rgba(150, 230, 255, 0.5);
            }

            .arctic-particle.large {
                width: 4px;
                height: 4px;

                opacity: 0.35;

                box-shadow:
                    0 0 6px rgba(140, 230, 255, 0.75),
                    0 0 14px rgba(80, 190, 230, 0.4);
            }

            @keyframes arctic-float {

                0% {
                    transform:
                        translate3d(0, 110vh, 0)
                        scale(0.7);

                    opacity: 0;
                }

                10% {
                    opacity: 0.45;
                }

                25% {
                    transform:
                        translate3d(25px, 80vh, 0)
                        scale(1);
                }

                50% {
                    transform:
                        translate3d(-35px, 50vh, 0)
                        scale(0.85);
                }

                75% {
                    transform:
                        translate3d(30px, 20vh, 0)
                        scale(1.05);
                }

                90% {
                    opacity: 0.35;
                }

                100% {
                    transform:
                        translate3d(-20px, -15vh, 0)
                        scale(0.7);

                    opacity: 0;
                }
            }

            /* =========================================
               VERY SUBTLE ATMOSPHERIC GLOW
               ========================================= */

            #arctic-live-glow {
                position: fixed;

                top: -25vh;
                left: -20vw;

                width: 70vw;
                height: 70vw;

                pointer-events: none;

                border-radius: 50%;

                background:
                    radial-gradient(
                        circle,
                        rgba(70, 190, 220, 0.08) 0%,
                        rgba(70, 190, 220, 0.03) 35%,
                        transparent 70%
                    );

                animation: arctic-glow-move 18s ease-in-out infinite alternate;

                z-index: 999998;
            }

            @keyframes arctic-glow-move {

                0% {
                    transform: translate3d(0, 0, 0);
                }

                100% {
                    transform: translate3d(25vw, 18vh, 0);
                }
            }
        `;

        var styleSheet = document.createElement('style');

        styleSheet.type = 'text/css';

        styleSheet.innerText = styles;

        document.head.appendChild(styleSheet);


        /* =========================================
           PARTICLE CONTAINER
           ========================================= */

        var particles = document.createElement('div');

        particles.id = 'arctic-live-particles';

        document.body.appendChild(particles);


        /* =========================================
           ATMOSPHERIC GLOW
           ========================================= */

        var glow = document.createElement('div');

        glow.id = 'arctic-live-glow';

        document.body.appendChild(glow);


        /* =========================================
           CREATE PARTICLES
           ========================================= */

        var particleCount = 32;

        for (var i = 0; i < particleCount; i++) {

            var particle = document.createElement('div');

            particle.className = 'arctic-particle';


            /* Разный размер */

            var randomSize = Math.random();

            if (randomSize < 0.25) {
                particle.classList.add('small');
            }

            if (randomSize > 0.85) {
                particle.classList.add('large');
            }


            /* Случайная позиция */

            particle.style.left =
                Math.random() * 100 + '%';


            /* Случайная задержка */

            particle.style.animationDelay =
                (-Math.random() * 25) + 's';


            /* Разная скорость */

            particle.style.animationDuration =
                (18 + Math.random() * 25) + 's';


            /* Немного разная траектория */

            particle.style.marginLeft =
                (Math.random() * 40 - 20) + 'px';


            particles.appendChild(particle);
        }
    }


    /* =========================================
       LAMPA READY
       ========================================= */

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
