(function () {
    'use strict';

    /*
     * ================================================
     * LAMPA — ARCTIC FOREST
     * Arctic Live + Dark Forest
     * ================================================
     */

    if (window.arctic_forest_themes) return;
    window.arctic_forest_themes = true;

    var NAME = 'Arctic Forest';
    var SETTINGS = 'arctic_forest_theme_settings_v1';

    var cfg = Object.assign({
        theme: 'arctic'
    }, Lampa.Storage.get(SETTINGS, {}) || {});


    /* ================================================
       SAVE SETTINGS
       ================================================ */

    function saveCfg() {
        Lampa.Storage.set(SETTINGS, cfg);
    }


    /* ================================================
       REMOVE PREVIOUS THEME
       ================================================ */

    function removeTheme() {

        var oldStyle = document.getElementById(
            'arctic-forest-theme-style'
        );

        if (oldStyle) {
            oldStyle.remove();
        }


        var oldLayer = document.getElementById(
            'arctic-forest-live-layer'
        );

        if (oldLayer) {
            oldLayer.remove();
        }
    }


    /* ================================================
       COMMON HELPERS
       ================================================ */

    function addStyle(css) {

        var style = document.createElement('style');

        style.id = 'arctic-forest-theme-style';

        style.type = 'text/css';

        style.textContent = css;

        document.head.appendChild(style);
    }


    function createLayer() {

        var layer = document.createElement('div');

        layer.id = 'arctic-forest-live-layer';

        document.body.appendChild(layer);

        return layer;
    }


    /* ================================================
       ARCTIC
       ================================================ */

    function applyArctic() {

        removeTheme();


        var css = `

            /* =========================================
               ARCTIC
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
                background-color: rgba(255,255,255,.12);
            }


            /* =========================================
               CARDS
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
                background-color: rgba(216,232,237,.08);
            }

            .torrent-file.focus,
            .torrent-serial.focus {

                background-color: rgba(141,216,234,.24);
            }


            /* =========================================
               IPTV
               ========================================= */

            .iptv-channel {
                background-color: #172A32 !important;
            }


            /* =========================================
               LIVE LAYER
               ========================================= */

            #arctic-forest-live-layer {

                position: fixed;

                inset: 0;

                width: 100vw;
                height: 100vh;

                overflow: hidden;

                pointer-events: none;

                z-index: 999999;
            }


            /* =========================================
               MIST
               ========================================= */

            .arctic-mist {

                position: absolute;

                width: 70vw;
                height: 45vh;

                border-radius: 50%;

                filter: blur(80px);

                opacity: .10;

                background:
                    radial-gradient(
                        ellipse,
                        rgba(90,205,235,.45),
                        rgba(90,205,235,.12) 40%,
                        transparent 72%
                    );

                animation:
                    arctic-mist-move
                    32s ease-in-out infinite alternate;
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

                opacity: .07;

                animation-duration: 42s;
                animation-delay: -12s;
            }

            .arctic-mist.three {

                bottom: -25vh;
                left: 15vw;

                width: 80vw;
                height: 35vh;

                opacity: .055;

                animation-duration: 50s;
                animation-delay: -22s;
            }

            @keyframes arctic-mist-move {

                0% {
                    transform:
                        translate3d(-4vw,-2vh,0);
                }

                50% {
                    transform:
                        translate3d(5vw,3vh,0);
                }

                100% {
                    transform:
                        translate3d(10vw,-3vh,0);
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

                opacity: .08;

                filter: blur(35px);

                background:
                    conic-gradient(
                        from 180deg at 50% 100%,
                        transparent 0deg,
                        rgba(65,205,220,.30) 35deg,
                        rgba(105,190,255,.20) 70deg,
                        rgba(110,150,255,.14) 105deg,
                        transparent 150deg,
                        transparent 360deg
                    );

                animation:
                    arctic-aurora-move
                    40s ease-in-out infinite alternate;
            }

            @keyframes arctic-aurora-move {

                0% {
                    transform:
                        translateX(-8vw)
                        rotate(-2deg);
                }

                50% {
                    transform:
                        translateX(3vw)
                        rotate(1deg);
                }

                100% {
                    transform:
                        translateX(9vw)
                        rotate(3deg);
                }
            }


            /* =========================================
               ICE PARTICLES
               ========================================= */

            .arctic-particle {

                position: absolute;

                width: 3px;
                height: 3px;

                border-radius: 50%;

                background:
                    rgba(190,240,255,.78);

                box-shadow:
                    0 0 4px rgba(130,220,255,.65),
                    0 0 11px rgba(80,190,230,.32);

                animation:
                    arctic-particle-float
                    linear infinite;
            }

            .arctic-particle.small {

                width: 2px;
                height: 2px;

                opacity: .48;
            }

            .arctic-particle.large {

                width: 4px;
                height: 4px;

                opacity: .38;

                box-shadow:
                    0 0 7px rgba(140,230,255,.75),
                    0 0 15px rgba(80,190,230,.38);
            }

            @keyframes arctic-particle-float {

                0% {

                    transform:
                        translate3d(0,110vh,0)
                        scale(.65);

                    opacity: 0;
                }

                12% {
                    opacity: .45;
                }

                30% {

                    transform:
                        translate3d(35px,75vh,0)
                        scale(1);
                }

                50% {

                    transform:
                        translate3d(-30px,50vh,0)
                        scale(.85);
                }

                70% {

                    transform:
                        translate3d(40px,25vh,0)
                        scale(1.05);
                }

                88% {
                    opacity: .30;
                }

                100% {

                    transform:
                        translate3d(-25px,-15vh,0)
                        scale(.7);

                    opacity: 0;
                }
            }


            /* =========================================
               RARE SPARKS
               ========================================= */

            .arctic-spark {

                position: absolute;

                width: 3px;
                height: 3px;

                border-radius: 50%;

                background: #DDF8FF;

                box-shadow:
                    0 0 5px #B9EEFF,
                    0 0 14px rgba(100,210,240,.75);

                opacity: 0;

                animation:
                    arctic-spark
                    ease-in-out infinite;
            }

            @keyframes arctic-spark {

                0%,
                72% {
                    opacity: 0;
                    transform: scale(.5);
                }

                80% {
                    opacity: .9;
                    transform: scale(1.3);
                }

                86% {
                    opacity: .35;
                    transform: scale(.8);
                }

                92%,
                100% {
                    opacity: 0;
                    transform: scale(.5);
                }
            }


            /* =========================================
               ICE LIGHT
               ========================================= */

            .arctic-light {

                position: absolute;

                top: 0;
                left: -35vw;

                width: 18vw;
                height: 100vh;

                opacity: .025;

                transform: skewX(-18deg);

                background:
                    linear-gradient(
                        90deg,
                        transparent,
                        rgba(220,250,255,.9),
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
                    opacity: .025;
                }

                82% {
                    left: 115vw;
                    opacity: .025;
                }

                83%,
                100% {
                    left: 115vw;
                    opacity: 0;
                }
            }


            @media (prefers-reduced-motion: reduce) {

                #arctic-forest-live-layer * {
                    animation: none !important;
                }
            }
        `;

        addStyle(css);


        var layer = createLayer();


        /* Mist */

        var mist1 = document.createElement('div');
        mist1.className = 'arctic-mist one';

        var mist2 = document.createElement('div');
        mist2.className = 'arctic-mist two';

        var mist3 = document.createElement('div');
        mist3.className = 'arctic-mist three';

        layer.appendChild(mist1);
        layer.appendChild(mist2);
        layer.appendChild(mist3);


        /* Aurora */

        var aurora = document.createElement('div');

        aurora.className = 'arctic-aurora';

        layer.appendChild(aurora);


        /* Particles */

        for (var i = 0; i < 32; i++) {

            var particle = document.createElement('div');

            particle.className = 'arctic-particle';

            var size = Math.random();

            if (size < .25) {
                particle.classList.add('small');
            }

            if (size > .85) {
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

            layer.appendChild(particle);
        }


        /* Sparks */

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

            layer.appendChild(spark);
        }


        /* Light */

        var light = document.createElement('div');

        light.className = 'arctic-light';

        layer.appendChild(light);
    }


    /* ================================================
       DARK FOREST
       ================================================ */

    function applyForest() {

        removeTheme();


        var css = `

            /* =========================================
               DARK FOREST
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

                background: linear-gradient(
                    135deg,
                    rgb(24,43,32) 1%,
                    rgb(5,11,8) 100%
                );
            }

            .settings-input__links {
                background-color: rgba(255,255,255,.10);
            }


            /* =========================================
               CARDS
               ========================================= */

            .card.focus .card__view::after,
            .card.hover .card__view::after,
            .extensions__item.focus:after,
            .torrent-item.focus:after,
            .extensions__block-add.focus:after {

                border-color: #65B985;
            }

            .online-prestige.focus::after,
            .iptv-channel.focus::before,
            .iptv-channel.last--focus::before {

                border-color: #65B985 !important;
            }


            /* =========================================
               PLAYER
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
                background-color: rgba(217,233,223,.08);
            }

            .torrent-file.focus,
            .torrent-serial.focus {

                background-color: rgba(101,185,133,.24);
            }


            /* =========================================
               IPTV
               ========================================= */

            .iptv-channel {
                background-color: #14291F !important;
            }


            /* =========================================
               FOREST LIVE LAYER
               ========================================= */

            #arctic-forest-live-layer {

                position: fixed;

                inset: 0;

                width: 100vw;
                height: 100vh;

                overflow: hidden;

                pointer-events: none;

                z-index: 999999;
            }


            /* =========================================
               FOREST ATMOSPHERE
               ========================================= */

            .forest-mist {

                position: absolute;

                width: 75vw;
                height: 45vh;

                border-radius: 50%;

                filter: blur(90px);

                opacity: .08;

                background:
                    radial-gradient(
                        ellipse,
                        rgba(55,150,100,.40),
                        rgba(35,100,70,.10) 42%,
                        transparent 72%
                    );

                animation:
                    forest-mist-move
                    38s ease-in-out infinite alternate;
            }

            .forest-mist.one {

                top: -15vh;
                left: -25vw;
            }

            .forest-mist.two {

                top: 40vh;
                left: 55vw;

                width: 60vw;
                height: 40vh;

                opacity: .055;

                animation-duration: 48s;

                animation-delay: -15s;
            }

            .forest-mist.three {

                bottom: -25vh;
                left: 10vw;

                width: 80vw;
                height: 35vh;

                opacity: .045;

                animation-duration: 55s;

                animation-delay: -28s;
            }

            @keyframes forest-mist-move {

                0% {
                    transform:
                        translate3d(-5vw,-2vh,0);
                }

                50% {
                    transform:
                        translate3d(4vw,3vh,0);
                }

                100% {
                    transform:
                        translate3d(11vw,-3vh,0);
                }
            }


            /* =========================================
               FOREST PARTICLES
               ========================================= */

            .forest-particle {

                position: absolute;

                width: 3px;
                height: 3px;

                border-radius: 50%;

                background:
                    rgba(160,235,190,.60);

                box-shadow:
                    0 0 4px rgba(100,210,145,.55),
                    0 0 10px rgba(60,160,105,.25);

                animation:
                    forest-particle-float
                    linear infinite;
            }

            .forest-particle.small {

                width: 2px;
                height: 2px;

                opacity: .38;
            }

            .forest-particle.large {

                width: 4px;
                height: 4px;

                opacity: .30;

                box-shadow:
                    0 0 6px rgba(120,220,155,.60),
                    0 0 14px rgba(60,160,105,.30);
            }

            @keyframes forest-particle-float {

                0% {

                    transform:
                        translate3d(0,110vh,0)
                        scale(.65);

                    opacity: 0;
                }

                12% {
                    opacity: .38;
                }

                30% {

                    transform:
                        translate3d(-30px,75vh,0)
                        scale(1);
                }

                50% {

                    transform:
                        translate3d(35px,50vh,0)
                        scale(.85);
                }

                70% {

                    transform:
                        translate3d(-25px,25vh,0)
                        scale(1.05);
                }

                88% {
                    opacity: .22;
                }

                100% {

                    transform:
                        translate3d(25px,-15vh,0)
                        scale(.7);

                    opacity: 0;
                }
            }


            /* =========================================
               FOREST SPARKS
               ========================================= */

            .forest-spark {

                position: absolute;

                width: 3px;
                height: 3px;

                border-radius: 50%;

                background: #D9FFE7;

                box-shadow:
                    0 0 5px #A7F5C0,
                    0 0 13px rgba(70,190,115,.65);

                opacity: 0;

                animation:
                    forest-spark
                    ease-in-out infinite;
            }

            @keyframes forest-spark {

                0%,
                72% {

                    opacity: 0;

                    transform: scale(.5);
                }

                80% {

                    opacity: .65;

                    transform: scale(1.25);
                }

                86% {

                    opacity: .25;

                    transform: scale(.8);
                }

                92%,
                100% {

                    opacity: 0;

                    transform: scale(.5);
                }
            }


            /* =========================================
               REDUCE MOTION
               ========================================= */

            @media (prefers-reduced-motion: reduce) {

                #arctic-forest-live-layer * {
                    animation: none !important;
                }
            }
        `;

        addStyle(css);


        var layer = createLayer();


        /* Forest mist */

        var mist1 = document.createElement('div');
        mist1.className = 'forest-mist one';

        var mist2 = document.createElement('div');
        mist2.className = 'forest-mist two';

        var mist3 = document.createElement('div');
        mist3.className = 'forest-mist three';

        layer.appendChild(mist1);
        layer.appendChild(mist2);
        layer.appendChild(mist3);


        /* Forest particles */

        for (var i = 0; i < 28; i++) {

            var particle = document.createElement('div');

            particle.className = 'forest-particle';

            var size = Math.random();

            if (size < .25) {
                particle.classList.add('small');
            }

            if (size > .85) {
                particle.classList.add('large');
            }

            particle.style.left =
                Math.random() * 100 + '%';

            particle.style.animationDelay =
                (-Math.random() * 40) + 's';

            particle.style.animationDuration =
                (22 + Math.random() * 30) + 's';

            particle.style.marginLeft =
                (Math.random() * 50 - 25) + 'px';

            layer.appendChild(particle);
        }


        /* Forest sparks */

        var sparkPositions = [
            [12, 35],
            [28, 70],
            [46, 25],
            [63, 55],
            [79, 32],
            [92, 68]
        ];

        for (var s = 0; s < sparkPositions.length; s++) {

            var spark = document.createElement('div');

            spark.className = 'forest-spark';

            spark.style.left =
                sparkPositions[s][0] + '%';

            spark.style.top =
                sparkPositions[s][1] + '%';

            spark.style.animationDuration =
                (9 + Math.random() * 9) + 's';

            spark.style.animationDelay =
                (-Math.random() * 12) + 's';

            layer.appendChild(spark);
        }
    }


    /* ================================================
       DEFAULT / ORIGINAL LAMPA
       ================================================ */

    function applyDefault() {
        removeTheme();
    }


    /* ================================================
       APPLY SELECTED THEME
       ================================================ */

    function applyTheme() {

        if (cfg.theme === 'forest') {
            applyForest();
            return;
        }

        if (cfg.theme === 'default') {
            applyDefault();
            return;
        }

        applyArctic();
    }


    /* ================================================
       SETTINGS
       ================================================ */

    function settings() {

        if (!Lampa.SettingsApi) return;


        var icon =
            '<svg xmlns="http://www.w3.org/2000/svg" ' +
            'width="24" height="24" viewBox="0 0 24 24" ' +
            'fill="none">' +

            '<path d="M12 3v18M3 12h18" ' +
            'stroke="currentColor" ' +
            'stroke-width="1.6" ' +
            'stroke-linecap="round"/>' +

            '<path d="M5.5 7.5h13M5.5 16.5h13" ' +
            'stroke="currentColor" ' +
            'stroke-width="1.3" ' +
            'stroke-linecap="round" ' +
            'opacity=".65"/>' +

            '</svg>';


        Lampa.SettingsApi.addComponent({

            component: 'arctic_forest',

            name: NAME,

            icon: icon
        });


        Lampa.SettingsApi.addParam({

            component: 'arctic_forest',

            param: {

                name: 'arctic_forest_theme',

                type: 'select',

                values: {

                    arctic: '🧊 Arctic Live',

                    forest: '🌲 Dark Forest',

                    default: '⚪ Стандартная'
                },

                default:
                    cfg.theme
            },

            field: {

                name: 'Тема',

                description:
                    'Выберите оформление Lampa'
            },

            onChange: function (value) {

                cfg.theme = String(value);

                saveCfg();

                applyTheme();
            }
        });
    }


    /* ================================================
       START
       ================================================ */

    function start() {

        settings();

        applyTheme();

        console.log(
            '[Arctic Forest] Theme system started:',
            cfg.theme
        );
    }


    /* ================================================
       BOOT
       ================================================ */

    function boot() {

        if (typeof Lampa === 'undefined') {

            setTimeout(boot, 200);

            return;
        }


        if (window.appready) {

            start();

        } else {

            Lampa.Listener.follow(
                'app',
                function (e) {

                    if (e.type === 'ready') {
                        start();
                    }

                }
            );
        }
    }


    boot();

})();
