(function () {
    'use strict';

    var COMPONENT = 'arctic_forest';
    var STORAGE_KEY = 'arctic_forest_theme';
    var STYLE_ID = 'arctic_forest_style';
    var LIVE_ID = 'arctic_forest_live';

    var DEFAULT_THEME = 'default';
    var currentTheme = DEFAULT_THEME;


    /* =========================================================
       LOAD / SAVE
    ========================================================= */

    function loadTheme() {

        var saved = '';

        try {
            saved = Lampa.Storage.get(
                STORAGE_KEY,
                ''
            );
        } catch (e) {
            saved = '';
        }

        var allowed = [
            'default',
            'arctic',
            'forest',
            'storm',
            'autumn',
            'winter'
        ];

        currentTheme =
            allowed.indexOf(saved) !== -1
                ? saved
                : DEFAULT_THEME;
    }


    function saveTheme(theme) {

        currentTheme = theme;

        try {
            Lampa.Storage.set(
                STORAGE_KEY,
                theme
            );
        } catch (e) {}

        applyTheme(theme);
    }


    /* =========================================================
       REMOVE ONLY OUR THEME
    ========================================================= */

    function removeOurTheme() {

        var style =
            document.getElementById(STYLE_ID);

        if (style) {
            style.remove();
        }

        var live =
            document.getElementById(LIVE_ID);

        if (live) {
            live.remove();
        }

        document.body.classList.remove(
            'arctic-theme',
            'forest-theme',
            'storm-theme',
            'autumn-theme',
            'winter-theme'
        );
    }


    /* =========================================================
       ADD STYLE
    ========================================================= */

    function addStyle(css) {

        var style =
            document.createElement('style');

        style.id = STYLE_ID;
        style.type = 'text/css';
        style.textContent = css;

        document.head.appendChild(style);
    }


    /* =========================================================
       MAIN CSS
    ========================================================= */

    var commonCSS = `

        /* =====================================================
           THEME VARIABLES
        ===================================================== */

        body.arctic-theme {
            --af-bg: #0A1014;
            --af-black: #060A0D;
            --af-focus1: #E6F9FF;
            --af-focus2: #8DD8EA;
            --af-border: #8DD8EA;
            --af-progress: #63C7DC;

            --af-ext: #080D11;
            --af-ext-focus: #17242B;

            --af-torrent: #D8E8ED;
            --af-torrent-focus: rgba(141,216,234,.24);

            --af-iptv-focus: #172A32;

            --af-settings1: rgb(27,40,48);
            --af-settings2: rgb(7,11,14);
        }


        body.forest-theme {
            --af-bg: #070D0A;
            --af-black: #040806;
            --af-focus1: #E2F8EA;
            --af-focus2: #65B985;
            --af-border: #65B985;
            --af-progress: #45A86B;

            --af-ext: #050A07;
            --af-ext-focus: #12221A;

            --af-torrent: #D9E9DF;
            --af-torrent-focus: rgba(101,185,133,.24);

            --af-iptv-focus: #14291F;

            --af-settings1: rgb(24,43,32);
            --af-settings2: rgb(5,11,8);
        }


        body.storm-theme {
            --af-bg: #080B10;
            --af-black: #05070A;
            --af-focus1: #DDF5FF;
            --af-focus2: #5B9FC7;
            --af-border: #6EA7C7;
            --af-progress: #63A9D0;

            --af-ext: #070B10;
            --af-ext-focus: #17212A;

            --af-torrent: #D9E8F0;
            --af-torrent-focus: rgba(91,159,199,.23);

            --af-iptv-focus: #14232E;

            --af-settings1: rgb(25,32,41);
            --af-settings2: rgb(5,8,11);
        }


        /* =====================================================
           AUTUMN
        ===================================================== */

        body.autumn-theme {
            --af-bg: #21150D;
            --af-black: #0D0805;

            --af-focus1: #FFF0D2;
            --af-focus2: #C66E32;

            --af-border: #D08343;
            --af-progress: #D08442;

            --af-ext: #100A06;
            --af-ext-focus: #2B1A0E;

            --af-torrent: #EAD9C5;
            --af-torrent-focus: rgba(208,132,66,.28);

            --af-iptv-focus: #302010;

            --af-settings1: rgb(65,40,23);
            --af-settings2: rgb(13,8,5);
        }


        /* =====================================================
           WINTER
        ===================================================== */

        body.winter-theme {
            --af-bg: #081724;
            --af-black: #04090E;

            --af-focus1: #F7FDFF;
            --af-focus2: #91C9E5;

            --af-border: #A7D9EF;
            --af-progress: #74C5E5;

            --af-ext: #050B11;
            --af-ext-focus: #142733;

            --af-torrent: #E1F1F8;
            --af-torrent-focus: rgba(145,201,229,.28);

            --af-iptv-focus: #112A36;

            --af-settings1: rgb(26,47,60);
            --af-settings2: rgb(5,10,15);
        }


        /* =====================================================
           STRONG BACKGROUND OVERRIDE
           ===================================================== */

        body.arctic-theme,
        body.arctic-theme .app,
        body.arctic-theme .wrap,
        body.arctic-theme .main,
        body.arctic-theme .content {

            background-color:
                #0A1014 !important;
        }


        body.forest-theme,
        body.forest-theme .app,
        body.forest-theme .wrap,
        body.forest-theme .main,
        body.forest-theme .content {

            background-color:
                #070D0A !important;
        }


        body.storm-theme,
        body.storm-theme .app,
        body.storm-theme .wrap,
        body.storm-theme .main,
        body.storm-theme .content {

            background-color:
                #080B10 !important;
        }


        /* =====================================================
           AUTUMN BACKGROUND
        ===================================================== */

        body.autumn-theme {

            background:
                radial-gradient(
                    ellipse at 50% 0%,
                    rgba(173,91,35,.18),
                    transparent 55%
                ),
                linear-gradient(
                    180deg,
                    #21150D 0%,
                    #160E09 48%,
                    #0D0805 100%
                ) !important;
        }


        body.autumn-theme .app,
        body.autumn-theme .wrap,
        body.autumn-theme .main,
        body.autumn-theme .content {

            background:
                linear-gradient(
                    180deg,
                    rgba(33,21,13,.96),
                    rgba(13,8,5,.98)
                ) !important;
        }


        /* =====================================================
           WINTER BACKGROUND
        ===================================================== */

        body.winter-theme {

            background:
                radial-gradient(
                    ellipse at 50% 0%,
                    rgba(130,205,235,.18),
                    transparent 52%
                ),
                radial-gradient(
                    ellipse at 15% 55%,
                    rgba(60,135,170,.08),
                    transparent 45%
                ),
                linear-gradient(
                    180deg,
                    #081724 0%,
                    #07131F 48%,
                    #040A11 100%
                ) !important;
        }


        body.winter-theme .app,
        body.winter-theme .wrap,
        body.winter-theme .main,
        body.winter-theme .content {

            background:
                linear-gradient(
                    180deg,
                    rgba(8,23,36,.96),
                    rgba(4,10,17,.98)
                ) !important;
        }


        /* =====================================================
           FOCUS
        ===================================================== */

        body.arctic-theme .selector.focus,
        body.forest-theme .selector.focus,
        body.storm-theme .selector.focus,
        body.autumn-theme .selector.focus,
        body.winter-theme .selector.focus {

            background:
                linear-gradient(
                    135deg,
                    var(--af-focus1),
                    var(--af-focus2)
                ) !important;

            color: #071015 !important;

            border-color:
                transparent !important;

            transform: none !important;

            transition: none !important;

            backdrop-filter: none !important;

            -webkit-backdrop-filter:
                none !important;
        }


        /* =====================================================
           CARD FOCUS
        ===================================================== */

        body.arctic-theme .card.focus .card__view,
        body.forest-theme .card.focus .card__view,
        body.storm-theme .card.focus .card__view,
        body.autumn-theme .card.focus .card__view,
        body.winter-theme .card.focus .card__view {

            box-shadow:
                0 0 0 2px var(--af-border),
                0 8px 30px rgba(0,0,0,.38)
                !important;
        }


        /* =====================================================
           SETTINGS
        ===================================================== */

        body.arctic-theme .settings-param__value,
        body.forest-theme .settings-param__value,
        body.storm-theme .settings-param__value,
        body.autumn-theme .settings-param__value,
        body.winter-theme .settings-param__value {

            background:
                linear-gradient(
                    135deg,
                    var(--af-settings1),
                    var(--af-settings2)
                ) !important;
        }


        /* =====================================================
           PLAYER PROGRESS
        ===================================================== */

        body.arctic-theme .player-panel__progress,
        body.arctic-theme .player-panel__progress-bar,
        body.arctic-theme .player-progress,

        body.forest-theme .player-panel__progress,
        body.forest-theme .player-panel__progress-bar,
        body.forest-theme .player-progress,

        body.storm-theme .player-panel__progress,
        body.storm-theme .player-panel__progress-bar,
        body.storm-theme .player-progress,

        body.autumn-theme .player-panel__progress,
        body.autumn-theme .player-panel__progress-bar,
        body.autumn-theme .player-progress,

        body.winter-theme .player-panel__progress,
        body.winter-theme .player-panel__progress-bar,
        body.winter-theme .player-progress {

            background:
                var(--af-progress) !important;
        }


        /* =====================================================
           EXTENSIONS
        ===================================================== */

        body.arctic-theme .extensions__item,
        body.forest-theme .extensions__item,
        body.storm-theme .extensions__item,
        body.autumn-theme .extensions__item,
        body.winter-theme .extensions__item {

            background:
                var(--af-ext) !important;
        }


        body.arctic-theme .extensions__item.focus,
        body.forest-theme .extensions__item.focus,
        body.storm-theme .extensions__item.focus,
        body.autumn-theme .extensions__item.focus,
        body.winter-theme .extensions__item.focus {

            background:
                var(--af-ext-focus) !important;
        }


        /* =====================================================
           TORRENTS
        ===================================================== */

        body.arctic-theme .torrent-item__badge,
        body.forest-theme .torrent-item__badge,
        body.storm-theme .torrent-item__badge,
        body.autumn-theme .torrent-item__badge,
        body.winter-theme .torrent-item__badge {

            color:
                var(--af-torrent) !important;
        }


        body.arctic-theme .torrent-item.focus,
        body.forest-theme .torrent-item.focus,
        body.storm-theme .torrent-item.focus,
        body.autumn-theme .torrent-item.focus,
        body.winter-theme .torrent-item.focus {

            background:
                var(--af-torrent-focus) !important;
        }


        /* =====================================================
           IPTV
        ===================================================== */

        body.arctic-theme .iptv-item.focus,
        body.forest-theme .iptv-item.focus,
        body.storm-theme .iptv-item.focus,
        body.autumn-theme .iptv-item.focus,
        body.winter-theme .iptv-item.focus {

            background:
                var(--af-iptv-focus) !important;
        }


        /* =====================================================
           LIVE LAYER
        ===================================================== */

        #${LIVE_ID} {

            position: fixed;

            left: 0;
            top: 0;
            right: 0;
            bottom: 0;

            width: 100vw;
            height: 100vh;

            pointer-events: none;

            z-index: 999999;

            overflow: hidden;
        }


        /* =====================================================
           COMMON MIST
        ===================================================== */

        .af-mist {

            position: absolute;

            left: -15%;

            width: 130%;
            height: 30%;

            border-radius: 50%;

            filter: blur(35px);

            opacity: .13;

            animation:
                af-mist-move
                28s ease-in-out infinite alternate;
        }


        .af-mist.m1 {
            top: 18%;
        }


        .af-mist.m2 {

            top: 50%;

            animation-duration: 38s;

            animation-direction:
                alternate-reverse;
        }


        .af-mist.m3 {

            top: 76%;

            animation-duration: 46s;
        }


        @keyframes af-mist-move {

            from {
                transform:
                    translateX(-7%);
            }

            to {
                transform:
                    translateX(7%);
            }
        }


        /* =====================================================
           ARCTIC
        ===================================================== */

        body.arctic-theme #${LIVE_ID} {

            background:
                radial-gradient(
                    ellipse at 50% 100%,
                    rgba(40,130,155,.10),
                    transparent 65%
                );
        }


        body.arctic-theme #${LIVE_ID}
        .af-mist {

            background:
                radial-gradient(
                    ellipse,
                    rgba(140,220,235,.48),
                    rgba(100,180,200,.08) 45%,
                    transparent 72%
                );
        }


        .af-arctic-particle {

            position: absolute;

            width: 2px;
            height: 2px;

            border-radius: 50%;

            background:
                rgba(220,250,255,.58);

            box-shadow:
                0 0 5px
                rgba(150,230,245,.5);

            animation:
                af-arctic-float
                linear infinite;
        }


        @keyframes af-arctic-float {

            0% {
                transform:
                    translate3d(0,110vh,0)
                    scale(.5);

                opacity: 0;
            }

            12% {
                opacity: .7;
            }

            85% {
                opacity: .35;
            }

            100% {
                transform:
                    translate3d(70px,-15vh,0)
                    scale(1.1);

                opacity: 0;
            }
        }


        /* =====================================================
           FOREST
        ===================================================== */

        body.forest-theme #${LIVE_ID} {

            background:
                radial-gradient(
                    ellipse at 50% 100%,
                    rgba(28,100,58,.10),
                    transparent 65%
                );
        }


        body.forest-theme #${LIVE_ID}
        .af-mist {

            background:
                radial-gradient(
                    ellipse,
                    rgba(75,150,100,.35),
                    rgba(35,100,60,.05) 48%,
                    transparent 72%
                );
        }


        .af-forest-particle {

            position: absolute;

            width: 2px;
            height: 2px;

            border-radius: 50%;

            background:
                rgba(100,190,125,.28);

            box-shadow:
                0 0 5px
                rgba(70,180,110,.25);

            animation:
                af-forest-float
                linear infinite;
        }


        @keyframes af-forest-float {

            0% {
                transform:
                    translate3d(0,105vh,0);

                opacity: 0;
            }

            15% {
                opacity: .3;
            }

            85% {
                opacity: .15;
            }

            100% {
                transform:
                    translate3d(-45px,-10vh,0);

                opacity: 0;
            }
        }


        /* =====================================================
           STORM
        ===================================================== */

        body.storm-theme #${LIVE_ID} {

            background:
                radial-gradient(
                    ellipse at 50% 15%,
                    rgba(70,95,120,.16),
                    transparent 55%
                );
        }


        .af-storm-sky {

            position: absolute;

            inset: 0;

            background:
                radial-gradient(
                    ellipse at 20% 20%,
                    rgba(110,125,145,.15),
                    transparent 30%
                ),

                radial-gradient(
                    ellipse at 75% 25%,
                    rgba(85,105,130,.16),
                    transparent 34%
                ),

                radial-gradient(
                    ellipse at 50% 60%,
                    rgba(40,60,80,.12),
                    transparent 55%
                );
        }


        .af-storm-cloud {

            position: absolute;

            border-radius: 50%;

            filter: blur(38px);

            background:
                radial-gradient(
                    ellipse,
                    rgba(100,115,130,.25),
                    rgba(40,50,65,.12) 45%,
                    transparent 72%
                );

            animation:
                af-cloud-drift
                45s ease-in-out infinite alternate;
        }


        .af-storm-cloud.c1 {

            width: 75vw;
            height: 30vh;

            left: -15vw;
            top: 3vh;
        }


        .af-storm-cloud.c2 {

            width: 80vw;
            height: 34vh;

            right: -20vw;
            top: 16vh;

            animation-duration: 58s;

            animation-direction:
                alternate-reverse;
        }


        .af-storm-cloud.c3 {

            width: 100vw;
            height: 28vh;

            left: 10vw;
            top: 46vh;

            animation-duration: 67s;
        }


        @keyframes af-cloud-drift {

            from {
                transform:
                    translateX(-4%);
            }

            to {
                transform:
                    translateX(4%);
            }
        }


        .af-storm-fog {

            position: absolute;

            left: -15%;

            width: 130%;
            height: 24%;

            border-radius: 50%;

            filter: blur(30px);

            background:
                radial-gradient(
                    ellipse,
                    rgba(120,145,165,.14),
                    transparent 70%
                );

            animation:
                af-fog-drift
                34s ease-in-out infinite alternate;
        }


        .af-storm-fog.f1 {
            top: 40%;
        }


        .af-storm-fog.f2 {

            top: 67%;

            animation-duration: 48s;

            animation-direction:
                alternate-reverse;
        }


        .af-storm-fog.f3 {

            top: 82%;

            animation-duration: 55s;
        }


        @keyframes af-fog-drift {

            from {
                transform:
                    translateX(-6%);
            }

            to {
                transform:
                    translateX(6%);
            }
        }


        .af-rain {

            position: absolute;

            width: 1px;
            height: 28px;

            border-radius: 50%;

            background:
                linear-gradient(
                    to bottom,
                    transparent,
                    rgba(185,220,235,.30)
                );

            animation:
                af-rain-fall
                linear infinite;
        }


        @keyframes af-rain-fall {

            0% {

                transform:
                    translate3d(0,-15vh,0)
                    rotate(12deg);

                opacity: 0;
            }

            8% {
                opacity: .45;
            }

            92% {
                opacity: .30;
            }

            100% {

                transform:
                    translate3d(-100px,115vh,0)
                    rotate(12deg);

                opacity: 0;
            }
        }


        .af-lightning {

            position: absolute;

            inset: 0;

            background:
                rgba(215,240,255,.11);

            opacity: 0;

            animation:
                af-lightning
                23s infinite;
        }


        @keyframes af-lightning {

            0%, 91%, 100% {
                opacity: 0;
            }

            92% {
                opacity: .18;
            }

            92.5% {
                opacity: 0;
            }

            93% {
                opacity: .09;
            }

            93.5% {
                opacity: 0;
            }
        }


        /* =====================================================
           AUTUMN
        ===================================================== */

        body.autumn-theme #${LIVE_ID} {

            background:
                radial-gradient(
                    ellipse at 50% 25%,
                    rgba(205,120,45,.09),
                    transparent 55%
                ),

                radial-gradient(
                    ellipse at 50% 100%,
                    rgba(150,70,25,.10),
                    transparent 65%
                );
        }


        body.autumn-theme #${LIVE_ID}
        .af-mist {

            background:
                radial-gradient(
                    ellipse,
                    rgba(200,125,65,.34),
                    rgba(110,60,30,.08) 46%,
                    transparent 72%
                );
        }


        .af-autumn-glow {

            position: absolute;

            width: 75vw;
            height: 50vh;

            left: 12vw;
            top: 2vh;

            border-radius: 50%;

            background:
                radial-gradient(
                    ellipse,
                    rgba(215,135,55,.10),
                    transparent 70%
                );

            filter: blur(25px);

            animation:
                af-autumn-glow
                18s ease-in-out infinite alternate;
        }


        @keyframes af-autumn-glow {

            from {

                transform:
                    translate(-3%,0)
                    scale(.95);

                opacity: .55;
            }

            to {

                transform:
                    translate(3%,2%)
                    scale(1.05);

                opacity: .90;
            }
        }


        /* =====================================================
           AUTUMN LEAVES
        ===================================================== */

        .af-leaf {

            position: absolute;

            width: 9px;
            height: 14px;

            border-radius:
                75% 20% 75% 20%;

            background:
                rgba(196,104,42,.70);

            box-shadow:
                0 0 6px
                rgba(185,95,35,.20);

            animation:
                af-leaf-fall
                linear infinite;
        }


        .af-leaf:nth-child(3n) {

            width: 7px;
            height: 11px;

            background:
                rgba(225,145,55,.62);
        }


        .af-leaf:nth-child(4n) {

            width: 10px;
            height: 15px;

            background:
                rgba(145,72,30,.60);
        }


        .af-leaf:nth-child(5n) {

            width: 6px;
            height: 9px;

            background:
                rgba(236,165,70,.58);
        }


        @keyframes af-leaf-fall {

            0% {

                transform:
                    translate3d(0,-15vh,0)
                    rotate(0deg);

                opacity: 0;
            }

            10% {
                opacity: .78;
            }

            45% {

                transform:
                    translate3d(75px,45vh,0)
                    rotate(150deg);
            }

            75% {

                transform:
                    translate3d(-65px,80vh,0)
                    rotate(290deg);
            }

            100% {

                transform:
                    translate3d(90px,115vh,0)
                    rotate(440deg);

                opacity: 0;
            }
        }


        /* =====================================================
           WINTER
        ===================================================== */

        body.winter-theme #${LIVE_ID} {

            background:
                radial-gradient(
                    ellipse at 50% 10%,
                    rgba(170,225,250,.11),
                    transparent 58%
                ),

                radial-gradient(
                    ellipse at 50% 100%,
                    rgba(90,170,205,.08),
                    transparent 65%
                );
        }


        body.winter-theme #${LIVE_ID}
        .af-mist {

            background:
                radial-gradient(
                    ellipse,
                    rgba(180,225,245,.34),
                    rgba(120,180,205,.07) 46%,
                    transparent 72%
                );
        }


        .af-winter-glow {

            position: absolute;

            width: 75vw;
            height: 55vh;

            left: 12vw;
            top: -10vh;

            border-radius: 50%;

            background:
                radial-gradient(
                    ellipse,
                    rgba(190,235,250,.12),
                    transparent 68%
                );

            filter: blur(25px);

            animation:
                af-winter-glow
                20s ease-in-out infinite alternate;
        }


        @keyframes af-winter-glow {

            from {
                transform:
                    scale(.96);
                opacity: .50;
            }

            to {
                transform:
                    scale(1.05);
                opacity: .90;
            }
        }


        /* =====================================================
           REAL SNOWFLAKES
        ===================================================== */

        .af-snow {

            position: absolute;

            width: auto;
            height: auto;

            background: none !important;

            border: none;

            color:
                rgba(240,252,255,.82);

            font-family:
                Arial,
                sans-serif;

            font-size: 13px;

            line-height: 1;

            text-shadow:
                0 0 5px
                rgba(190,235,255,.65),

                0 0 10px
                rgba(150,220,245,.30);

            animation:
                af-snow-fall
                linear infinite;
        }


        .af-snow.small {

            font-size: 8px;

            opacity: .60;
        }


        .af-snow.medium {

            font-size: 13px;

            opacity: .80;
        }


        .af-snow.big {

            font-size: 19px;

            opacity: .90;

            text-shadow:
                0 0 7px
                rgba(210,245,255,.75),

                0 0 13px
                rgba(150,220,245,.40);
        }


        @keyframes af-snow-fall {

            0% {

                transform:
                    translate3d(0,-12vh,0)
                    rotate(0deg);

                opacity: 0;
            }

            8% {
                opacity: .85;
            }

            30% {

                transform:
                    translate3d(45px,30vh,0)
                    rotate(75deg);
            }

            55% {

                transform:
                    translate3d(-35px,58vh,0)
                    rotate(170deg);
            }

            78% {

                transform:
                    translate3d(60px,82vh,0)
                    rotate(270deg);
            }

            100% {

                transform:
                    translate3d(-55px,115vh,0)
                    rotate(380deg);

                opacity: 0;
            }
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

            #${LIVE_ID} .af-mist {
                filter: blur(27px);
            }

            #${LIVE_ID} .af-storm-cloud {
                filter: blur(29px);
            }

            #${LIVE_ID} .af-storm-fog {
                filter: blur(25px);
            }

            #${LIVE_ID} .af-leaf {
                transform-origin: center;
            }
        }

    `;


    /* =========================================================
       PARTICLES
    ========================================================= */

    function createParticles(
        className,
        count,
        type
    ) {

        var html = '';

        var snowChars = [
            '❄',
            '❅',
            '❆'
        ];

        for (var i = 0; i < count; i++) {

            var left =
                Math.random() * 100;

            var top =
                Math.random() * 100;

            var delay =
                Math.random() * 20;

            var duration;

            if (type === 'storm') {

                duration =
                    1.8 +
                    Math.random() * 2.5;

            } else if (type === 'snow') {

                duration =
                    8 +
                    Math.random() * 12;

            } else if (type === 'leaf') {

                duration =
                    8 +
                    Math.random() * 14;

            } else if (type === 'forest') {

                duration =
                    12 +
                    Math.random() * 16;

            } else {

                duration =
                    10 +
                    Math.random() * 18;
            }


            /* -------------------------------------------------
               SNOWFLAKES
            ------------------------------------------------- */

            if (type === 'snow') {

                var snow =
                    snowChars[
                        Math.floor(
                            Math.random() *
                            snowChars.length
                        )
                    ];

                var sizeClass;

                var r =
                    Math.random();

                if (r < .28) {
                    sizeClass = 'small';
                } else if (r < .82) {
                    sizeClass = 'medium';
                } else {
                    sizeClass = 'big';
                }

                html +=
                    '<i class="' +
                    className +
                    ' ' +
                    sizeClass +
                    '"' +

                    ' style="' +
                    'left:' + left + '%;' +
                    'top:' + top + '%;' +
                    'animation-delay:-' +
                    delay +
                    's;' +
                    'animation-duration:' +
                    duration +
                    's;' +
                    '">' +

                    snow +

                    '</i>';

            } else {

                html +=
                    '<i class="' +
                    className +
                    '"' +

                    ' style="' +
                    'left:' + left + '%;' +
                    'top:' + top + '%;' +
                    'animation-delay:-' +
                    delay +
                    's;' +
                    'animation-duration:' +
                    duration +
                    's;' +
                    '"></i>';
            }
        }

        return html;
    }


    /* =========================================================
       LIVE LAYER
    ========================================================= */

    function createLiveLayer(theme) {

        if (theme === 'default') {
            return;
        }

        var layer =
            document.createElement('div');

        layer.id = LIVE_ID;

        var html = '';


        /* -----------------------------------------------------
           ARCTIC
        ----------------------------------------------------- */

        if (theme === 'arctic') {

            html +=
                '<div class="af-mist m1"></div>';

            html +=
                '<div class="af-mist m2"></div>';

            html +=
                '<div class="af-mist m3"></div>';

            html += createParticles(
                'af-arctic-particle',
                32,
                'arctic'
            );
        }


        /* -----------------------------------------------------
           FOREST
        ----------------------------------------------------- */

        else if (theme === 'forest') {

            html +=
                '<div class="af-mist m1"></div>';

            html +=
                '<div class="af-mist m2"></div>';

            html +=
                '<div class="af-mist m3"></div>';

            html += createParticles(
                'af-forest-particle',
                15,
                'forest'
            );
        }


        /* -----------------------------------------------------
           STORM
        ----------------------------------------------------- */

        else if (theme === 'storm') {

            html +=
                '<div class="af-storm-sky"></div>';

            html +=
                '<div class="af-storm-cloud c1"></div>';

            html +=
                '<div class="af-storm-cloud c2"></div>';

            html +=
                '<div class="af-storm-cloud c3"></div>';

            html +=
                '<div class="af-storm-fog f1"></div>';

            html +=
                '<div class="af-storm-fog f2"></div>';

            html +=
                '<div class="af-storm-fog f3"></div>';

            html += createParticles(
                'af-rain',
                32,
                'storm'
            );

            html +=
                '<div class="af-lightning"></div>';
        }


        /* -----------------------------------------------------
           AUTUMN
        ----------------------------------------------------- */

        else if (theme === 'autumn') {

            html +=
                '<div class="af-mist m1"></div>';

            html +=
                '<div class="af-mist m2"></div>';

            html +=
                '<div class="af-mist m3"></div>';

            html +=
                '<div class="af-autumn-glow"></div>';

            html += createParticles(
                'af-leaf',
                30,
                'leaf'
            );
        }


        /* -----------------------------------------------------
           WINTER
        ----------------------------------------------------- */

        else if (theme === 'winter') {

            html +=
                '<div class="af-mist m1"></div>';

            html +=
                '<div class="af-mist m2"></div>';

            html +=
                '<div class="af-mist m3"></div>';

            html +=
                '<div class="af-winter-glow"></div>';

            html += createParticles(
                'af-snow',
                42,
                'snow'
            );
        }


        layer.innerHTML = html;

        document.body.appendChild(layer);

        return layer;
    }


    /* =========================================================
       APPLY
    ========================================================= */

    function applyArctic() {

        document.body.classList.add(
            'arctic-theme'
        );

        addStyle(commonCSS);

        createLiveLayer('arctic');
    }


    function applyForest() {

        document.body.classList.add(
            'forest-theme'
        );

        addStyle(commonCSS);

        createLiveLayer('forest');
    }


    function applyStorm() {

        document.body.classList.add(
            'storm-theme'
        );

        addStyle(commonCSS);

        createLiveLayer('storm');
    }


    function applyAutumn() {

        document.body.classList.add(
            'autumn-theme'
        );

        addStyle(commonCSS);

        createLiveLayer('autumn');
    }


    function applyWinter() {

        document.body.classList.add(
            'winter-theme'
        );

        addStyle(commonCSS);

        createLiveLayer('winter');
    }


    function applyDefault() {

        /*
         * ONLY remove our own elements.
         *
         * Lampa itself is not modified here.
         */

        removeOurTheme();
    }


    function applyTheme(theme) {

        removeOurTheme();

        if (theme === 'default') {

            applyDefault();

            return;
        }


        if (theme === 'arctic') {

            applyArctic();

            return;
        }


        if (theme === 'forest') {

            applyForest();

            return;
        }


        if (theme === 'storm') {

            applyStorm();

            return;
        }


        if (theme === 'autumn') {

            applyAutumn();

            return;
        }


        if (theme === 'winter') {

            applyWinter();

            return;
        }


        applyDefault();
    }


    /* =========================================================
       SETTINGS
    ========================================================= */

    function settings() {

        if (
            typeof Lampa === 'undefined' ||
            !Lampa.SettingsApi
        ) {
            return;
        }


        try {

            Lampa.SettingsApi.addComponent({

                component: COMPONENT,

                name: 'Arctic Forest',

                icon:
                    '<svg xmlns="http://www.w3.org/2000/svg" ' +
                    'viewBox="0 0 24 24">' +

                    '<path fill="currentColor" d="' +

                    'M12 2 9.5 7H5l3.7 3.2L7 15l5-2.9L17 15l-1.7-4.8L19 7h-4.5L12 2zm0 5.8L13 10h2l-1.6 1.2.6 1.8-2-1.2-2 1.2.6-1.8L9 10h2l1-2.2z"/>' +

                    '</svg>'
            });


            Lampa.SettingsApi.addParam({

                component: COMPONENT,

                param: {

                    name: 'theme',

                    type: 'select',

                    values: {

                        default:
                            'Стандартная',

                        arctic:
                            'Arctic Live',

                        forest:
                            'Dark Forest',

                        storm:
                            '🌩️ Буря',

                        autumn:
                            '🍂 Осень',

                        winter:
                            '❄️ Зима'
                    },

                    default:
                        DEFAULT_THEME
                },

                field: {

                    name: 'Тема',

                    description:
                        'Выберите оформление Arctic Forest'
                },

                onChange:
                    function (value) {

                        saveTheme(value);

                        try {

                            if (
                                typeof Lampa !==
                                'undefined' &&

                                Lampa.Noty
                            ) {

                                var names = {

                                    default:
                                        'Стандартная тема',

                                    arctic:
                                        'Arctic Live включена',

                                    forest:
                                        'Dark Forest включена',

                                    storm:
                                        '🌩️ Буря включена',

                                    autumn:
                                        '🍂 Осень включена',

                                    winter:
                                        '❄️ Зима включена'
                                };


                                Lampa.Noty.show(
                                    names[value] ||
                                    'Тема изменена'
                                );
                            }

                        } catch (e) {}
                    }
            });

        } catch (e) {

            console.log(
                '[Arctic Forest] Settings error:',
                e
            );
        }
    }


    /* =========================================================
       START
    ========================================================= */

    function startPlugin() {

        loadTheme();

        settings();


        /*
         * No saved theme:
         * do absolutely nothing.
         */

        if (
            currentTheme ===
            DEFAULT_THEME
        ) {

            console.log(
                '[Arctic Forest] Standard Lampa mode'
            );

            return;
        }


        /*
         * Restore previously selected theme.
         */

        applyTheme(
            currentTheme
        );


        console.log(
            '[Arctic Forest] Theme:',
            currentTheme
        );
    }


    /* =========================================================
       BOOT
    ========================================================= */

    if (
        typeof Lampa ===
        'undefined'
    ) {

        console.log(
            '[Arctic Forest] Lampa not found'
        );

    } else if (
        window.appready
    ) {

        startPlugin();

    } else if (
        Lampa.Listener &&
        Lampa.Listener.follow
    ) {

        Lampa.Listener.follow(
            'app',
            function (event) {

                if (
                    event &&
                    event.type ===
                    'ready'
                ) {

                    startPlugin();
                }
            }
        );

    } else {

        startPlugin();
    }

})();
