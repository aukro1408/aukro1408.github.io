(function () {
    'use strict';

    function startMe() {

        var styles = `
            /* =========================================
               LAMPA — ARCTIC LIVE 2.0
               Polar Night / Ice Atmosphere
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
               FOCUS — STATIC
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
               CARDS / BORDERS
               ========================================= */

            .card.focus .card__view::after,
            .card.hover .card__view::after,
            .extensions__item.focus:after,
            .torrent-item.focus:after,
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
               ARCTIC LIVE LAYER
               ========================================= */

            #arctic-live {
                position: fixed;

                inset: 0;

                width: 100vw;
                height: 100vh;

                overflow: hidden;

                pointer-events: none;

                z-index: 999999;
            }

            /* =========================================
               MOVING ARCTIC MIST
               ========================================= */

            .arctic-mist {
                position: absolute;

                width: 70vw;
                height: 45vh;

                border-radius: 50%;

                filter: blur(80px);

                opacity: 0.10;

                background:
                    radial-gradient(
                        ellipse,
                        rgba(90, 205, 235, 0.45),
                        rgba(90, 205, 235, 0.12) 40%,
                        transparent 72%
                    );

                animation: arctic-mist-move 32s ease-in-out infinite alternate;
            }

            .arctic-mist.one {
                top: -15vh;
                left: -20vw;
            }

            .arctic-mist.two {
                top: 35vh;
                left: 55vw;

                width: 55vw;
                height: 40vh;

                opacity: 0.07;

                animation-duration: 42s;

                animation-delay: -12s;
            }

            .arctic-mist.three {
                bottom: -25vh;
                left: 15vw;

                width: 80vw;
                height: 35vh;

                opacity: 0.055;

                animation-duration: 50s;

                animation-delay: -22s;
            }

            @keyframes arctic-mist-move {

                0% {
                    transform: translate3d(-4vw, -2vh, 0);
                }

                50% {
                    transform: translate3d(5vw, 3vh, 0);
                }

                100% {
                    transform: translate3d(10vw, -3vh, 0);
                }
            }

            /* =========================================
               AURORA
               ========================================= */

            .arctic-aurora {
                position: absolute;

                top: -18vh;
                left: 5vw;

                width: 90vw;
                height: 42vh;

                opacity: 0.08;

                filter: blur(35px);

                background:
                    conic-gradient(
                        from 180deg at 50% 100%,
                        transparent 0deg,
                        rgba(65, 205, 220, 0.30) 35deg,
                        rgba(105, 190, 255, 0.20) 70deg,
                        rgba(110, 150, 255, 0.14) 105deg,
                        transparent 150deg,
                        transparent 360deg
                    );

                animation:
                    arctic-aurora-move 40s ease-in-out infinite alternate;
            }

            @keyframes arctic-aurora-move {

                0% {
                    transform: translateX(-8vw) rotate(-2deg);
                }

                50% {
                    transform: translateX(3vw) rotate(1deg);
                }

                100% {
                    transform: translateX(9vw) rotate(3deg);
                }
            }

            /* =========================================
               FLOATING ICE PARTICLES
               ========================================= */

            .arctic-particle {
                position: absolute;

                width: 3px;
                height: 3px;

                border-radius: 50%;

                background: rgba(190, 240, 255, 0.78);

                box-shadow:
                    0 0 4px rgba(130, 220, 255, 0.65),
                    0 0 11px rgba(80, 190, 230, 0.32);

                animation:
                    arctic-particle-float
                    linear
                    infinite;
            }

            .arctic-particle.small {
                width: 2px;
                height: 2px;

                opacity: 0.48;

                box-shadow:
                    0 0 4px rgba(150, 230, 255, 0.45);
            }

            .arctic-particle.large {
                width: 4px;
                height: 4px;

                opacity: 0.38;

                box-shadow:
                    0 0 7px rgba(140, 230, 255, 0.75),
                    0 0 15px rgba(80, 190, 230, 0.38);
            }

            @keyframes arctic-particle-float {

                0% {
                    transform:
                        translate3d(0, 110vh, 0)
                        scale(0.65);

                    opacity: 0;
                }

                12% {
                    opacity: 0.45;
                }

                30% {
                    transform:
                        translate3d(35px, 75vh, 0)
                        scale(1);
                }

                50% {
                    transform:
                        translate3d(-30px, 50vh, 0)
                        scale(0.85);
                }

                70% {
                    transform:
                        translate3d(40px, 25vh, 0)
                        scale(1.05);
                }

                88% {
                    opacity: 0.30;
                }

                100% {
                    transform:
                        translate3d(-25px, -15vh, 0)
                        scale(0.7);

                    opacity: 0;
                }
            }

            /* =========================================
               RARE ICE SPARKS
               ========================================= */

            .arctic-spark {
                position: absolute;

                width: 3px;
                height: 3px;

                border-radius: 50%;

                background: #DDF8FF;

                box-shadow:
                    0 0 5px #B9EEFF,
                    0 0 14px rgba(100, 210, 240, 0.75);

                opacity: 0;

                animation:
                    arctic-spark
                    ease-in-out
                    infinite;
            }

            @keyframes arctic-spark {

                0%,
                72% {
                    opacity: 0;
                    transform: scale(0.5);
                }

                80% {
                    opacity: 0.9;
                    transform: scale(1.3);
                }

                86% {
                    opacity: 0.35;
                    transform: scale(0.8);
                }

                92%,
                100% {
                    opacity: 0;
                    transform: scale(0.5);
                }
            }

            /* =========================================
               ICE LIGHT REFLECTION
               ========================================= */

            .arctic-light {
                position: absolute;

                top: 0;

                left: -35vw;

                width: 18vw;
                height: 100vh;

                opacity: 0.025;

                transform: skewX(-18deg);

                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(220, 250, 255, 0.9),
                    transparent
                );

                animation:
                    arctic-light-pass
                    22s ease-in-out infinite;
            }

            @keyframes arctic-light-pass {

                0%,
                65% {
                    left: -35vw;
                    opacity: 0;
                }

                72% {
                    opacity: 0.025;
                }

                82% {
                    left: 115vw;
                    opacity: 0.025;
                }

                83%,
                100% {
                    left: 115vw;
                    opacity: 0;
                }
            }

            /* =========================================
               REDUCE MOTION
               ========================================= */

            @media (prefers-reduced-motion: reduce) {

                #arctic-live *,
                #arctic-live {
                    animation: none !important;
                }
            }
        `;

        var styleSheet = document.createElement('style');

        styleSheet.type = 'text/css';

        styleSheet.innerText = styles;

        document.head.appendChild(styleSheet);


        /* =========================================
           CREATE LIVE LAYER
           ========================================= */

        var live = document.createElement('div');

        live.id = 'arctic-live';

        document.body.appendChild(live);


        /* =========================================
           MIST
           ========================================= */

        var mist1 = document.createElement('div');
        mist1.className = 'arctic-mist one';

        var mist2 = document.createElement('div');
        mist2.className = 'arctic-mist two';

        var mist3 = document.createElement('div');
        mist3.className = 'arctic-mist three';

        live.appendChild(mist1);
        live.appendChild(mist2);
        live.appendChild(mist3);


        /* =========================================
           AURORA
           ========================================= */

        var aurora = document.createElement('div');

        aurora.className = 'arctic-aurora';

        live.appendChild(aurora);


        /* =========================================
           PARTICLES
           ========================================= */

        var particleCount = 32;

        for (var i = 0; i < particleCount; i++) {

            var particle = document.createElement('div');

            particle.className = 'arctic-particle';

            var size = Math.random();

            if (size < 0.25) {
                particle.classList.add('small');
            }

            if (size > 0.85) {
                particle.classList.add('large');
            }

            particle.style.left =
                Math.random() * 100 + '%';

            particle.style.animationDelay =
                (-Math.random() * 40) + 's';

            particle.style.animationDuration =
                (20 + Math.random() * 30) + 's';

            particle.style.marginLeft =
                (Math.random() * 50 - 25) + 'px';

            live.appendChild(particle);
        }


        /* =========================================
           RARE SPARKS
           ========================================= */

        var sparkPositions = [
            [14, 28],
            [31, 64],
            [48, 22],
            [67, 48],
            [82, 30],
            [91, 72]
        ];

        for (var s = 0; s < sparkPositions.length; s++) {

            var spark = document.createElement('div');

            spark.className = 'arctic-spark';

            spark.style.left =
                sparkPositions[s][0] + '%';

            spark.style.top =
                sparkPositions[s][1] + '%';

            spark.style.animationDuration =
                (8 + Math.random() * 8) + 's';

            spark.style.animationDelay =
                (-Math.random() * 10) + 's';

            live.appendChild(spark);
        }


        /* =========================================
           LIGHT PASS
           ========================================= */

        var light = document.createElement('div');

        light.className = 'arctic-light';

        live.appendChild(light);
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
