(function () {
    'use strict';

    var COMPONENT = 'arctic_forest';
    var STORAGE_KEY = 'arctic_forest_theme';
    var STYLE_ID = 'arctic_forest_style';
    var LIVE_ID = 'arctic_forest_live';

    var DEFAULT_THEME = 'default';
    var currentTheme = DEFAULT_THEME;

    var playerCheckTimer = null;
    var mutationObserver = null;

    /* =========================================================
       THEME
    ========================================================= */

    function loadTheme() {
        var saved = '';

        try {
            saved = Lampa.Storage.get(STORAGE_KEY, '');
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

        currentTheme = allowed.indexOf(saved) !== -1
            ? saved
            : DEFAULT_THEME;
    }

    function saveTheme(theme) {
        currentTheme = theme;

        try {
            Lampa.Storage.set(STORAGE_KEY, theme);
        } catch (e) {}

        applyTheme(theme);
    }


    /* =========================================================
       REMOVE OUR STYLES ONLY
       ========================================================= */

    function removeOurTheme() {
        var oldStyle = document.getElementById(STYLE_ID);

        if (oldStyle) {
            oldStyle.remove();
        }

        var oldLive = document.getElementById(LIVE_ID);

        if (oldLive) {
            oldLive.remove();
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
       STYLE
       ========================================================= */

    function addStyle(css) {
        var style = document.createElement('style');

        style.id = STYLE_ID;
        style.type = 'text/css';
        style.textContent = css;

        document.head.appendChild(style);
    }


    /* =========================================================
       COMMON CSS
       ========================================================= */

    var commonCSS = `

        /* -----------------------------------------------------
           GENERAL
        ----------------------------------------------------- */

        body.arctic-theme,
        body.forest-theme,
        body.storm-theme,
        body.autumn-theme,
        body.winter-theme {
            background: var(--af-bg) !important;
        }

        body.arctic-theme .app,
        body.forest-theme .app,
        body.storm-theme .app,
        body.autumn-theme .app,
        body.winter-theme .app {
            background: var(--af-bg) !important;
        }


        /* -----------------------------------------------------
           BODY / MAIN BACKGROUND
        ----------------------------------------------------- */

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

        body.autumn-theme {
            --af-bg: #110D08;
            --af-black: #080604;
            --af-focus1: #FFF1D6;
            --af-focus2: #C8783E;
            --af-border: #C8783E;
            --af-progress: #C98243;
            --af-ext: #0C0805;
            --af-ext-focus: #26180F;
            --af-torrent: #E7D7C5;
            --af-torrent-focus: rgba(200,120,62,.24);
            --af-iptv-focus: #2A1B10;
            --af-settings1: rgb(49,31,20);
            --af-settings2: rgb(9,6,4);
        }

        body.winter-theme {
            --af-bg: #081018;
            --af-black: #04070A;
            --af-focus1: #F5FCFF;
            --af-focus2: #A8D4E8;
            --af-border: #A8D4E8;
            --af-progress: #7CC4DF;
            --af-ext: #050A0E;
            --af-ext-focus: #14222A;
            --af-torrent: #DCECF3;
            --af-torrent-focus: rgba(168,212,232,.24);
            --af-iptv-focus: #10242D;
            --af-settings1: rgb(25,38,47);
            --af-settings2: rgb(5,9,12);
        }


        /* -----------------------------------------------------
           FOCUS
           ----------------------------------------------------- */

        body.arctic-theme .selector,
        body.forest-theme .selector,
        body.storm-theme .selector,
        body.autumn-theme .selector,
        body.winter-theme .selector {
            border-color: var(--af-border) !important;
        }

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
            border-color: transparent !important;
        }


        /* -----------------------------------------------------
           CARDS
           ----------------------------------------------------- */

        body.arctic-theme .card.focus .card__view,
        body.forest-theme .card.focus .card__view,
        body.storm-theme .card.focus .card__view,
        body.autumn-theme .card.focus .card__view,
        body.winter-theme .card.focus .card__view {
            box-shadow:
                0 0 0 2px var(--af-border),
                0 8px 30px rgba(0,0,0,.35) !important;
        }


        /* -----------------------------------------------------
           SETTINGS
           ----------------------------------------------------- */

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


        /* -----------------------------------------------------
           PLAYER PROGRESS
           ----------------------------------------------------- */

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
            background: var(--af-progress) !important;
        }


        /* -----------------------------------------------------
           EXTENSIONS
           ----------------------------------------------------- */

        body.arctic-theme .extensions__item,
        body.forest-theme .extensions__item,
        body.storm-theme .extensions__item,
        body.autumn-theme .extensions__item,
        body.winter-theme .extensions__item {
            background: var(--af-ext) !important;
        }

        body.arctic-theme .extensions__item.focus,
        body.forest-theme .extensions__item.focus,
        body.storm-theme .extensions__item.focus,
        body.autumn-theme .extensions__item.focus,
        body.winter-theme .extensions__item.focus {
            background: var(--af-ext-focus) !important;
        }


        /* -----------------------------------------------------
           TORRENTS
           ----------------------------------------------------- */

        body.arctic-theme .torrent-item__badge,
        body.forest-theme .torrent-item__badge,
        body.storm-theme .torrent-item__badge,
        body.autumn-theme .torrent-item__badge,
        body.winter-theme .torrent-item__badge {
            color: var(--af-torrent) !important;
        }

        body.arctic-theme .torrent-item.focus,
        body.forest-theme .torrent-item.focus,
        body.storm-theme .torrent-item.focus,
        body.autumn-theme .torrent-item.focus,
        body.winter-theme .torrent-item.focus {
            background: var(--af-torrent-focus) !important;
        }


        /* -----------------------------------------------------
           IPTV
           ----------------------------------------------------- */

        body.arctic-theme .iptv-item.focus,
        body.forest-theme .iptv-item.focus,
        body.storm-theme .iptv-item.focus,
        body.autumn-theme .iptv-item.focus,
        body.winter-theme .iptv-item.focus {
            background: var(--af-iptv-focus) !important;
        }


        /* -----------------------------------------------------
           NO GLASS / NO MOVING FOCUS
           ----------------------------------------------------- */

        body.arctic-theme .selector.focus,
        body.forest-theme .selector.focus,
        body.storm-theme .selector.focus,
        body.autumn-theme .selector.focus,
        body.winter-theme .selector.focus {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            transform: none !important;
            transition: none !important;
        }


        /* -----------------------------------------------------
           LIVE LAYER
           ----------------------------------------------------- */

        #${LIVE_ID} {
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;

            pointer-events: none;

            z-index: 999999;

            overflow: hidden;

            transition: opacity .35s ease;
        }

        #${LIVE_ID}.af-hidden {
            display: none !important;
        }


        /* -----------------------------------------------------
           COMMON MIST
           ----------------------------------------------------- */

        .af-mist {
            position: absolute;
            left: -15%;
            width: 130%;
            height: 30%;

            border-radius: 50%;

            filter: blur(35px);

            opacity: .12;

            animation:
                af-mist-move 28s ease-in-out infinite alternate;
        }

        .af-mist.m1 {
            top: 18%;
        }

        .af-mist.m2 {
            top: 50%;
            animation-duration: 38s;
            animation-direction: alternate-reverse;
        }

        .af-mist.m3 {
            top: 76%;
            animation-duration: 46s;
        }

        @keyframes af-mist-move {
            from {
                transform: translateX(-7%);
            }

            to {
                transform: translateX(7%);
            }
        }


        /* =====================================================
           ARCTIC LIVE
           ===================================================== */

        body.arctic-theme #${LIVE_ID} {
            background:
                radial-gradient(
                    ellipse at 50% 100%,
                    rgba(40,130,155,.08),
                    transparent 65%
                );
        }

        body.arctic-theme #${LIVE_ID} .af-mist {
            background:
                radial-gradient(
                    ellipse,
                    rgba(140,220,235,.45),
                    rgba(100,180,200,.08) 45%,
                    transparent 72%
                );
        }

        .af-arctic-particle {
            position: absolute;

            width: 2px;
            height: 2px;

            border-radius: 50%;

            background: rgba(220,250,255,.55);

            box-shadow:
                0 0 5px rgba(150,230,245,.5);

            animation:
                af-arctic-float linear infinite;
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
           DARK FOREST
           ===================================================== */

        body.forest-theme #${LIVE_ID} {
            background:
                radial-gradient(
                    ellipse at 50% 100%,
                    rgba(28,100,58,.08),
                    transparent 65%
                );
        }

        body.forest-theme #${LIVE_ID} .af-mist {
            background:
                radial-gradient(
                    ellipse,
                    rgba(75,150,100,.32),
                    rgba(35,100,60,.05) 48%,
                    transparent 72%
                );
        }

        .af-forest-particle {
            position: absolute;

            width: 2px;
            height: 2px;

            border-radius: 50%;

            background: rgba(100,190,125,.25);

            box-shadow:
                0 0 5px rgba(70,180,110,.25);

            animation:
                af-forest-float linear infinite;
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
                    rgba(70,95,120,.14),
                    transparent 55%
                );
        }

        .af-storm-sky {
            position: absolute;
            inset: 0;

            background:
                radial-gradient(
                    ellipse at 20% 20%,
                    rgba(110,125,145,.13),
                    transparent 30%
                ),
                radial-gradient(
                    ellipse at 75% 25%,
                    rgba(85,105,130,.14),
                    transparent 34%
                ),
                radial-gradient(
                    ellipse at 50% 60%,
                    rgba(40,60,80,.10),
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
                    rgba(100,115,130,.22),
                    rgba(40,50,65,.11) 45%,
                    transparent 72%
                );

            animation:
                af-cloud-drift 45s ease-in-out infinite alternate;
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
            animation-direction: alternate-reverse;
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
                transform: translateX(-4%);
            }

            to {
                transform: translateX(4%);
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
                    rgba(120,145,165,.12),
                    transparent 70%
                );

            animation:
                af-fog-drift 34s ease-in-out infinite alternate;
        }

        .af-storm-fog.f1 {
            top: 40%;
        }

        .af-storm-fog.f2 {
            top: 67%;
            animation-duration: 48s;
            animation-direction: alternate-reverse;
        }

        .af-storm-fog.f3 {
            top: 82%;
            animation-duration: 55s;
        }

        @keyframes af-fog-drift {
            from {
                transform: translateX(-6%);
            }

            to {
                transform: translateX(6%);
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
                    rgba(185,220,235,.28)
                );

            animation:
                af-rain-fall linear infinite;
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
                opacity: .3;
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
                rgba(215,240,255,.10);

            opacity: 0;

            animation:
                af-lightning 23s infinite;
        }

        @keyframes af-lightning {
            0%, 91%, 100% {
                opacity: 0;
            }

            92% {
                opacity: .16;
            }

            92.5% {
                opacity: 0;
            }

            93% {
                opacity: .08;
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
                    ellipse at 50% 85%,
                    rgba(170,90,35,.08),
                    transparent 68%
                );
        }

        body.autumn-theme #${LIVE_ID} .af-mist {
            background:
                radial-gradient(
                    ellipse,
                    rgba(190,120,70,.28),
                    rgba(110,65,35,.07) 45%,
                    transparent 72%
                );
        }

        .af-autumn-glow {
            position: absolute;
            width: 70vw;
            height: 45vh;

            left: 15vw;
            top: 5vh;

            border-radius: 50%;

            background:
                radial-gradient(
                    ellipse,
                    rgba(205,130,55,.07),
                    transparent 70%
                );

            filter: blur(25px);

            animation:
                af-autumn-glow 18s ease-in-out infinite alternate;
        }

        @keyframes af-autumn-glow {
            from {
                transform: translate(-3%,0) scale(.95);
                opacity: .55;
            }

            to {
                transform: translate(3%,2%) scale(1.05);
                opacity: .85;
            }
        }

        .af-leaf {
            position: absolute;

            width: 7px;
            height: 12px;

            border-radius:
                75% 20% 75% 20%;

            background:
                rgba(190,105,45,.52);

            box-shadow:
                0 0 5px rgba(185,105,45,.14);

            animation:
                af-leaf-fall linear infinite;
        }

        .af-leaf:nth-child(3n) {
            width: 6px;
            height: 10px;
            background: rgba(215,140,60,.46);
        }

        .af-leaf:nth-child(4n) {
            width: 8px;
            height: 13px;
            background: rgba(145,75,35,.42);
        }

        @keyframes af-leaf-fall {
            0% {
                transform:
                    translate3d(0,-15vh,0)
                    rotate(0deg);
                opacity: 0;
            }

            10% {
                opacity: .65;
            }

            45% {
                transform:
                    translate3d(65px,45vh,0)
                    rotate(150deg);
            }

            75% {
                transform:
                    translate3d(-60px,80vh,0)
                    rotate(280deg);
            }

            100% {
                transform:
                    translate3d(80px,115vh,0)
                    rotate(430deg);
                opacity: 0;
            }
        }


        /* =====================================================
           WINTER
           ===================================================== */

        body.winter-theme #${LIVE_ID} {
            background:
                radial-gradient(
                    ellipse at 50% 15%,
                    rgba(160,210,235,.08),
                    transparent 60%
                );
        }

        body.winter-theme #${LIVE_ID} .af-mist {
            background:
                radial-gradient(
                    ellipse,
                    rgba(175,220,235,.30),
                    rgba(120,175,195,.06) 46%,
                    transparent 72%
                );
        }

        .af-winter-glow {
            position: absolute;

            width: 65vw;
            height: 55vh;

            left: 18vw;
            top: -10vh;

            border-radius: 50%;

            background:
                radial-gradient(
                    ellipse,
                    rgba(180,225,245,.08),
                    transparent 68%
                );

            filter: blur(25px);
        }

        .af-snow {
            position: absolute;

            width: 4px;
            height: 4px;

            border-radius: 50%;

            background:
                rgba(235,250,255,.62);

            box-shadow:
                0 0 5px rgba(210,240,250,.38);

            animation:
                af-snow-fall linear infinite;
        }

        .af-snow.small {
            width: 2px;
            height: 2px;
            opacity: .45;
        }

        .af-snow.big {
            width: 6px;
            height: 6px;
            opacity: .55;
        }

        @keyframes af-snow-fall {
            0% {
                transform:
                    translate3d(0,-10vh,0)
                    rotate(0deg);
                opacity: 0;
            }

            10% {
                opacity: .7;
            }

            50% {
                transform:
                    translate3d(45px,50vh,0)
                    rotate(180deg);
            }

            100% {
                transform:
                    translate3d(-55px,112vh,0)
                    rotate(360deg);
                opacity: 0;
            }
        }


        /* -----------------------------------------------------
           MOBILE PERFORMANCE
           ----------------------------------------------------- */

        @media (max-width: 700px) {

            #${LIVE_ID} .af-storm-cloud {
                filter: blur(28px);
            }

            #${LIVE_ID} .af-mist {
                filter: blur(26px);
            }

            #${LIVE_ID} .af-storm-fog {
                filter: blur(25px);
            }
        }

    `;


    /* =========================================================
       CREATE PARTICLES
       ========================================================= */

    function createParticles(className, count, type) {
        var html = '';

        for (var i = 0; i < count; i++) {
            var left = Math.random() * 100;
            var delay = Math.random() * 20;
            var duration;

            if (type === 'storm') {
                duration = 1.8 + Math.random() * 2.5;
            } else if (type === 'snow') {
                duration = 8 + Math.random() * 12;
            } else if (type === 'leaf') {
                duration = 8 + Math.random() * 14;
            } else if (type === 'forest') {
                duration = 12 + Math.random() * 16;
            } else {
                duration = 10 + Math.random() * 18;
            }

            var top = Math.random() * 100;

            html +=
                '<i class="' + className + '"' +
                ' style="' +
                'left:' + left + '%;' +
                'top:' + top + '%;' +
                'animation-delay:-' + delay + 's;' +
                'animation-duration:' + duration + 's;' +
                '"></i>';
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

        var layer = document.createElement('div');

        layer.id = LIVE_ID;

        var html = '';

        if (theme === 'arctic') {

            html += '<div class="af-mist m1"></div>';
            html += '<div class="af-mist m2"></div>';
            html += '<div class="af-mist m3"></div>';

            html += createParticles(
                'af-arctic-particle',
                32,
                'arctic'
            );

        } else if (theme === 'forest') {

            html += '<div class="af-mist m1"></div>';
            html += '<div class="af-mist m2"></div>';
            html += '<div class="af-mist m3"></div>';

            html += createParticles(
                'af-forest-particle',
                15,
                'forest'
            );

        } else if (theme === 'storm') {

            html += '<div class="af-storm-sky"></div>';

            html +=
                '<div class="af-storm-cloud c1"></div>' +
                '<div class="af-storm-cloud c2"></div>' +
                '<div class="af-storm-cloud c3"></div>';

            html +=
                '<div class="af-storm-fog f1"></div>' +
                '<div class="af-storm-fog f2"></div>' +
                '<div class="af-storm-fog f3"></div>';

            html += createParticles(
                'af-rain',
                32,
                'storm'
            );

            html += '<div class="af-lightning"></div>';

        } else if (theme === 'autumn') {

            html += '<div class="af-mist m1"></div>';
            html += '<div class="af-mist m2"></div>';
            html += '<div class="af-mist m3"></div>';

            html += '<div class="af-autumn-glow"></div>';

            html += createParticles(
                'af-leaf',
                28,
                'leaf'
            );

        } else if (theme === 'winter') {

            html += '<div class="af-mist m1"></div>';
            html += '<div class="af-mist m2"></div>';
            html += '<div class="af-mist m3"></div>';

            html += '<div class="af-winter-glow"></div>';

            html += createParticles(
                'af-snow',
                36,
                'snow'
            );

        }

        layer.innerHTML = html;

        document.body.appendChild(layer);

        return layer;
    }


    /* =========================================================
       PLAYER DETECTION
       ========================================================= */

    function isVisibleElement(el) {

        if (!el) {
            return false;
        }

        if (el === document.body ||
            el === document.documentElement) {
            return false;
        }

        var style;

        try {
            style = window.getComputedStyle(el);
        } catch (e) {
            return false;
        }

        if (!style) {
            return false;
        }

        if (style.display === 'none') {
            return false;
        }

        if (style.visibility === 'hidden') {
            return false;
        }

        if (parseFloat(style.opacity || '1') <= 0.01) {
            return false;
        }

        if (
            el.classList &&
            (
                el.classList.contains('hide') ||
                el.classList.contains('hidden') ||
                el.classList.contains('player--hidden')
            )
        ) {
            return false;
        }

        var rect = el.getBoundingClientRect();

        if (!rect) {
            return false;
        }

        return (
            rect.width > 100 &&
            rect.height > 100
        );
    }


    function isPlayerOpen() {

        var selectors = [
            '.player',
            '.player-screen',
            '.player__screen',
            '.player__body',
            '.player-video',
            '.player__video',
            '.video-container',
            '.player-panel'
        ];

        for (var i = 0; i < selectors.length; i++) {

            var elements;

            try {
                elements = document.querySelectorAll(
                    selectors[i]
                );
            } catch (e) {
                continue;
            }

            for (var j = 0; j < elements.length; j++) {

                var el = elements[j];

                if (!isVisibleElement(el)) {
                    continue;
                }

                /*
                 * Don't let our own live layer count as a player.
                 */
                if (
                    el.id === LIVE_ID ||
                    el.closest('#' + LIVE_ID)
                ) {
                    continue;
                }

                /*
                 * player-panel alone may remain in DOM.
                 * It is only considered a player if a video
                 * element is actually present/visible.
                 */
                if (
                    selectors[i] === '.player-panel'
                ) {
                    var panelVideo =
                        el.querySelector('video');

                    if (
                        panelVideo &&
                        isVisibleElement(panelVideo)
                    ) {
                        return true;
                    }

                    continue;
                }

                return true;
            }
        }


        /*
         * Additional fallback:
         * visible video element.
         */

        var videos = document.querySelectorAll('video');

        for (var v = 0; v < videos.length; v++) {

            var video = videos[v];

            if (!isVisibleElement(video)) {
                continue;
            }

            var rect = video.getBoundingClientRect();

            if (
                rect.width > 150 &&
                rect.height > 100
            ) {
                return true;
            }
        }

        return false;
    }


    /* =========================================================
       SHOW / HIDE LIVE LAYER
       ========================================================= */

    function updateLiveVisibility() {

        var layer =
            document.getElementById(LIVE_ID);

        if (!layer) {
            return;
        }

        /*
         * Main protection against effects over video.
         */

        if (isPlayerOpen()) {

            if (!layer.classList.contains('af-hidden')) {
                layer.classList.add('af-hidden');
            }

        } else {

            if (layer.classList.contains('af-hidden')) {
                layer.classList.remove('af-hidden');
            }
        }
    }


    /* =========================================================
       PLAYER MONITOR
       ========================================================= */

    function startPlayerMonitor() {

        stopPlayerMonitor();

        /*
         * Fast initial check.
         */

        updateLiveVisibility();

        /*
         * MutationObserver reacts quickly when Lampa opens
         * or closes the player.
         */

        if (window.MutationObserver) {

            mutationObserver =
                new MutationObserver(function () {

                    clearTimeout(playerCheckTimer);

                    playerCheckTimer =
                        setTimeout(
                            updateLiveVisibility,
                            80
                        );
                });

            try {

                mutationObserver.observe(
                    document.body,
                    {
                        subtree: true,
                        childList: true,
                        attributes: true,
                        attributeFilter: [
                            'class',
                            'style'
                        ]
                    }
                );

            } catch (e) {}
        }


        /*
         * Fallback check.
         * It also catches player implementations which do not
         * change the DOM in a way MutationObserver can detect.
         */

        playerCheckTimer =
            setInterval(
                updateLiveVisibility,
                700
            );
    }


    function stopPlayerMonitor() {

        if (mutationObserver) {

            try {
                mutationObserver.disconnect();
            } catch (e) {}

            mutationObserver = null;
        }

        if (playerCheckTimer) {

            clearInterval(playerCheckTimer);
            clearTimeout(playerCheckTimer);

            playerCheckTimer = null;
        }
    }


    /* =========================================================
       LAMPA PLAYER EVENTS
       ========================================================= */

    function setupPlayerEvents() {

        if (
            typeof Lampa === 'undefined' ||
            !Lampa.Listener ||
            !Lampa.Listener.follow
        ) {
            return;
        }

        try {

            Lampa.Listener.follow(
                'player',
                function (event) {

                    var type =
                        String(
                            event &&
                            event.type
                                ? event.type
                                : ''
                        ).toLowerCase();


                    /*
                     * Immediately hide when player starts.
                     */

                    if (
                        type.indexOf('start') !== -1 ||
                        type.indexOf('open') !== -1 ||
                        type.indexOf('ready') !== -1 ||
                        type.indexOf('play') !== -1
                    ) {

                        var layer =
                            document.getElementById(LIVE_ID);

                        if (layer) {
                            layer.classList.add(
                                'af-hidden'
                            );
                        }

                        return;
                    }


                    /*
                     * After player closes, wait a little for
                     * Lampa to remove its player DOM.
                     */

                    if (
                        type.indexOf('close') !== -1 ||
                        type.indexOf('destroy') !== -1 ||
                        type.indexOf('stop') !== -1 ||
                        type.indexOf('end') !== -1 ||
                        type.indexOf('exit') !== -1 ||
                        type.indexOf('back') !== -1 ||
                        type.indexOf('complite') !== -1
                    ) {

                        setTimeout(
                            updateLiveVisibility,
                            150
                        );

                        setTimeout(
                            updateLiveVisibility,
                            500
                        );
                    }
                }
            );

        } catch (e) {}
    }


    /* =========================================================
       APPLY THEMES
       ========================================================= */

    function applyArctic() {

        document.body.classList.add(
            'arctic-theme'
        );

        addStyle(commonCSS);

        createLiveLayer('arctic');

        startPlayerMonitor();
    }


    function applyForest() {

        document.body.classList.add(
            'forest-theme'
        );

        addStyle(commonCSS);

        createLiveLayer('forest');

        startPlayerMonitor();
    }


    function applyStorm() {

        document.body.classList.add(
            'storm-theme'
        );

        addStyle(commonCSS);

        createLiveLayer('storm');

        startPlayerMonitor();
    }


    function applyAutumn() {

        document.body.classList.add(
            'autumn-theme'
        );

        addStyle(commonCSS);

        createLiveLayer('autumn');

        startPlayerMonitor();
    }


    function applyWinter() {

        document.body.classList.add(
            'winter-theme'
        );

        addStyle(commonCSS);

        createLiveLayer('winter');

        startPlayerMonitor();
    }


    function applyDefault() {

        stopPlayerMonitor();

        removeOurTheme();

        /*
         * IMPORTANT:
         *
         * We don't set any Lampa styles here.
         * Standard mode simply removes everything added
         * by this plugin.
         *
         * Native Lampa appearance remains untouched.
         */
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

                        default: 'Стандартная',

                        arctic: 'Arctic Live',

                        forest: 'Dark Forest',

                        storm: '🌩️ Буря',

                        autumn: '🍂 Осень',

                        winter: '❄️ Зима'
                    },

                    default: DEFAULT_THEME
                },

                field: {

                    name: 'Тема',

                    description:
                        'Выберите оформление Arctic Forest'
                },

                onChange: function (value) {

                    saveTheme(value);

                    try {

                        if (typeof Lampa !== 'undefined' &&
                            Lampa.Noty) {

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

        /*
         * First load saved value.
         */

        loadTheme();


        /*
         * Settings are always available.
         */

        settings();


        /*
         * IMPORTANT:
         *
         * If there is no saved custom theme,
         * plugin does absolutely nothing.
         *
         * Standard Lampa remains exactly as it was.
         */

        if (currentTheme === DEFAULT_THEME) {

            console.log(
                '[Arctic Forest] Standard Lampa mode'
            );

            return;
        }


        /*
         * If user previously selected a theme,
         * restore it.
         */

        applyTheme(currentTheme);


        /*
         * Player events are installed only when
         * custom live effects are active.
         */

        setupPlayerEvents();


        console.log(
            '[Arctic Forest] Theme:',
            currentTheme
        );
    }


    /* =========================================================
       BOOT
       ========================================================= */

    if (typeof Lampa === 'undefined') {

        console.log(
            '[Arctic Forest] Lampa not found'
        );

    } else if (window.appready) {

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
                    event.type === 'ready'
                ) {
                    startPlugin();
                }
            }
        );

    } else {

        startPlugin();
    }

})();
