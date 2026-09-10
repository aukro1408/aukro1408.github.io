(function () {
    "use strict";

    // =========================================================
    // Arctic Forest
    // Единый плагин тем для Lampa
    //
    // По умолчанию:
    //     default = стандартная тема Lampa
    //
    // Пользователь может выбрать:
    //     Arctic Live
    //     Dark Forest
    //     Стандартная
    // =========================================================


    var COMPONENT = "arctic_forest";
    var STORAGE_KEY = "arctic_forest_theme";

    var DEFAULT_THEME = "default";

    var currentTheme = DEFAULT_THEME;


    // =========================================================
    // STORAGE
    // =========================================================

    function loadTheme() {

        try {

            currentTheme = Lampa.Storage.get(
                STORAGE_KEY,
                DEFAULT_THEME
            );

        } catch (e) {

            currentTheme = DEFAULT_THEME;

        }


        if (
            currentTheme !== "arctic" &&
            currentTheme !== "forest" &&
            currentTheme !== "default"
        ) {
            currentTheme = DEFAULT_THEME;
        }
    }


    function saveTheme(value) {

        try {

            Lampa.Storage.set(
                STORAGE_KEY,
                value
            );

        } catch (e) {

            console.error(
                "[Arctic Forest] Storage error:",
                e
            );
        }
    }


    // =========================================================
    // REMOVE OUR STYLES
    // =========================================================

    function removeOurTheme() {

        var style = document.getElementById(
            "arctic-forest-style"
        );

        if (style) {
            style.remove();
        }


        var layer = document.getElementById(
            "arctic-forest-live-layer"
        );

        if (layer) {
            layer.remove();
        }


        document.documentElement.classList.remove(
            "arctic-forest-active"
        );

        document.body.classList.remove(
            "arctic-forest-active"
        );

        document.body.classList.remove(
            "arctic-theme"
        );

        document.body.classList.remove(
            "forest-theme"
        );
    }


    // =========================================================
    // ADD STYLE
    // =========================================================

    function addStyle(css) {

        var old = document.getElementById(
            "arctic-forest-style"
        );

        if (old) {
            old.remove();
        }


        var style = document.createElement("style");

        style.id = "arctic-forest-style";

        style.textContent = css;

        document.head.appendChild(style);
    }


    // =========================================================
    // LIVE LAYER
    // =========================================================

    function createLiveLayer(theme) {

        var old = document.getElementById(
            "arctic-forest-live-layer"
        );

        if (old) {
            old.remove();
        }


        var layer = document.createElement("div");

        layer.id = "arctic-forest-live-layer";


        // -----------------------------------------------------
        // ARCTIC
        // -----------------------------------------------------

        if (theme === "arctic") {

            layer.innerHTML = `

                <div class="af-mist af-mist-1"></div>
                <div class="af-mist af-mist-2"></div>
                <div class="af-mist af-mist-3"></div>

                <div class="af-aurora"></div>

                <div class="af-particles">

                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>

                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>

                </div>

                <div class="af-sparks">

                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>

                </div>
            `;

        }


        // -----------------------------------------------------
        // DARK FOREST
        // -----------------------------------------------------

        if (theme === "forest") {

            layer.innerHTML = `

                <div class="df-mist df-mist-1"></div>
                <div class="df-mist df-mist-2"></div>
                <div class="df-mist df-mist-3"></div>

                <div class="df-particles">

                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i>

                </div>
            `;
        }


        document.body.appendChild(layer);
    }


    // =========================================================
    // ARCTIC LIVE
    // =========================================================

    function applyArctic() {

        addStyle(`

            /* =================================================
               ARCTIC LIVE
            ================================================= */


            /* -------------------------------------------------
               BASE
            ------------------------------------------------- */

            html.arctic-forest-active body,
            body.arctic-theme,
            body.arctic-theme .main,
            body.arctic-theme .wrap,
            body.arctic-theme .content,
            body.arctic-theme .activity {

                background:#0A1014 !important;
            }


            body.arctic-theme {

                color:#ffffff !important;
            }


            /* -------------------------------------------------
               DARK AREAS
            ------------------------------------------------- */

            body.arctic-theme .background,
            body.arctic-theme .modal,
            body.arctic-theme .modal__content,
            body.arctic-theme .settings,
            body.arctic-theme .menu {

                background:#060A0D !important;
            }


            /* -------------------------------------------------
               FOCUS
               
               ВАЖНО:
               никакой анимации focus.
               Никаких стеклянных панелей.
            ------------------------------------------------- */

            body.arctic-theme .selector.focus {

                outline:none !important;

                background:
                    linear-gradient(
                        135deg,
                        #E6F9FF 0%,
                        #8DD8EA 100%
                    ) !important;

                color:#071015 !important;
            }


            /* -------------------------------------------------
               CARDS
            ------------------------------------------------- */

            body.arctic-theme .card.focus {

                box-shadow:
                    0 0 0 2px #8DD8EA !important;
            }


            /* -------------------------------------------------
               SETTINGS
            ------------------------------------------------- */

            body.arctic-theme .settings__content,
            body.arctic-theme .settings__body {

                background:
                    linear-gradient(
                        135deg,
                        rgb(27,40,48),
                        rgb(7,11,14)
                    ) !important;
            }


            /* -------------------------------------------------
               PLAYER
            ------------------------------------------------- */

            body.arctic-theme
            .player-panel__progress,

            body.arctic-theme
            .player-panel__progress-line {

                background:#63C7DC !important;
            }


            /* -------------------------------------------------
               EXTENSIONS
            ------------------------------------------------- */

            body.arctic-theme .extensions,
            body.arctic-theme .extensions__item {

                background:#080D11 !important;
            }


            body.arctic-theme .extensions__item.focus {

                background:#17242B !important;
            }


            /* -------------------------------------------------
               TORRENTS
            ------------------------------------------------- */

            body.arctic-theme .torrent-item__badge,
            body.arctic-theme .torrent-item__quality {

                color:#D8E8ED !important;
            }


            body.arctic-theme .torrent-item.focus {

                background:
                    rgba(141,216,234,.24) !important;
            }


            /* -------------------------------------------------
               IPTV
            ------------------------------------------------- */

            body.arctic-theme .iptv__item.focus {

                background:#172A32 !important;
            }


            /* =================================================
               LIVE ATMOSPHERE
            ================================================= */

            #arctic-forest-live-layer {

                position:fixed;

                inset:0;

                pointer-events:none;

                z-index:999999;

                overflow:hidden;
            }


            /* -------------------------------------------------
               MIST
            ------------------------------------------------- */

            .af-mist {

                position:absolute;

                width:55vw;
                height:55vw;

                border-radius:50%;

                filter:blur(90px);

                opacity:.10;
            }


            .af-mist-1 {

                left:-15vw;
                top:15vh;

                background:
                    radial-gradient(
                        circle,
                        rgba(90,190,220,.45),
                        transparent 70%
                    );

                animation:
                    afMist1 28s ease-in-out infinite alternate;
            }


            .af-mist-2 {

                right:-15vw;
                top:45vh;

                background:
                    radial-gradient(
                        circle,
                        rgba(65,150,180,.35),
                        transparent 70%
                    );

                animation:
                    afMist2 35s ease-in-out infinite alternate;
            }


            .af-mist-3 {

                left:25vw;
                bottom:-30vw;

                background:
                    radial-gradient(
                        circle,
                        rgba(130,220,240,.22),
                        transparent 70%
                    );

                animation:
                    afMist3 42s ease-in-out infinite alternate;
            }


            @keyframes afMist1 {

                from {
                    transform:
                        translate3d(-5vw,0,0)
                        scale(1);
                }

                to {
                    transform:
                        translate3d(15vw,8vh,0)
                        scale(1.15);
                }
            }


            @keyframes afMist2 {

                from {
                    transform:
                        translate3d(5vw,-5vh,0)
                        scale(1);
                }

                to {
                    transform:
                        translate3d(-15vw,10vh,0)
                        scale(1.20);
                }
            }


            @keyframes afMist3 {

                from {
                    transform:
                        translate3d(0,0,0)
                        scale(1);
                }

                to {
                    transform:
                        translate3d(8vw,-12vh,0)
                        scale(1.18);
                }
            }


            /* -------------------------------------------------
               AURORA
            ------------------------------------------------- */

            .af-aurora {

                position:absolute;

                left:-20%;
                top:-20%;

                width:140%;
                height:70%;

                background:
                    radial-gradient(
                        ellipse at center,
                        rgba(100,210,235,.08),
                        transparent 65%
                    );

                filter:blur(45px);

                animation:
                    afAurora 38s ease-in-out infinite alternate;
            }


            @keyframes afAurora {

                from {

                    transform:
                        translateX(-5%)
                        rotate(-2deg);
                }

                to {

                    transform:
                        translateX(8%)
                        rotate(3deg);
                }
            }


            /* -------------------------------------------------
               ICE PARTICLES
            ------------------------------------------------- */

            .af-particles i {

                position:absolute;

                width:3px;
                height:3px;

                border-radius:50%;

                background:
                    rgba(180,235,245,.65);

                box-shadow:
                    0 0 8px
                    rgba(120,220,240,.45);

                animation:
                    afParticle linear infinite;
            }


            .af-particles i:nth-child(1)
            {left:8%;top:90%;animation-duration:24s;animation-delay:-5s;}

            .af-particles i:nth-child(2)
            {left:15%;top:75%;animation-duration:31s;animation-delay:-12s;}

            .af-particles i:nth-child(3)
            {left:22%;top:95%;animation-duration:27s;animation-delay:-8s;}

            .af-particles i:nth-child(4)
            {left:29%;top:82%;animation-duration:35s;animation-delay:-17s;}

            .af-particles i:nth-child(5)
            {left:35%;top:68%;animation-duration:29s;animation-delay:-3s;}

            .af-particles i:nth-child(6)
            {left:42%;top:88%;animation-duration:38s;animation-delay:-20s;}

            .af-particles i:nth-child(7)
            {left:49%;top:73%;animation-duration:26s;animation-delay:-10s;}

            .af-particles i:nth-child(8)
            {left:56%;top:92%;animation-duration:33s;animation-delay:-14s;}

            .af-particles i:nth-child(9)
            {left:63%;top:80%;animation-duration:30s;animation-delay:-6s;}

            .af-particles i:nth-child(10)
            {left:70%;top:95%;animation-duration:37s;animation-delay:-21s;}

            .af-particles i:nth-child(11)
            {left:77%;top:70%;animation-duration:28s;animation-delay:-9s;}

            .af-particles i:nth-child(12)
            {left:84%;top:86%;animation-duration:34s;animation-delay:-16s;}

            .af-particles i:nth-child(13)
            {left:91%;top:76%;animation-duration:25s;animation-delay:-4s;}

            .af-particles i:nth-child(14)
            {left:12%;top:55%;animation-duration:32s;animation-delay:-11s;}

            .af-particles i:nth-child(15)
            {left:26%;top:48%;animation-duration:36s;animation-delay:-19s;}

            .af-particles i:nth-child(16)
            {left:39%;top:60%;animation-duration:29s;animation-delay:-7s;}

            .af-particles i:nth-child(17)
            {left:53%;top:52%;animation-duration:39s;animation-delay:-23s;}

            .af-particles i:nth-child(18)
            {left:67%;top:45%;animation-duration:27s;animation-delay:-13s;}

            .af-particles i:nth-child(19)
            {left:80%;top:58%;animation-duration:33s;animation-delay:-18s;}

            .af-particles i:nth-child(20)
            {left:94%;top:50%;animation-duration:30s;animation-delay:-2s;}

            .af-particles i:nth-child(21)
            {left:5%;top:35%;animation-duration:41s;animation-delay:-26s;}

            .af-particles i:nth-child(22)
            {left:19%;top:28%;animation-duration:34s;animation-delay:-15s;}

            .af-particles i:nth-child(23)
            {left:33%;top:38%;animation-duration:28s;animation-delay:-5s;}

            .af-particles i:nth-child(24)
            {left:47%;top:25%;animation-duration:36s;animation-delay:-22s;}

            .af-particles i:nth-child(25)
            {left:61%;top:33%;animation-duration:31s;animation-delay:-8s;}

            .af-particles i:nth-child(26)
            {left:75%;top:24%;animation-duration:39s;animation-delay:-17s;}

            .af-particles i:nth-child(27)
            {left:88%;top:31%;animation-duration:27s;animation-delay:-12s;}

            .af-particles i:nth-child(28)
            {left:96%;top:18%;animation-duration:35s;animation-delay:-25s;}

            .af-particles i:nth-child(29)
            {left:17%;top:15%;animation-duration:40s;animation-delay:-30s;}

            .af-particles i:nth-child(30)
            {left:44%;top:12%;animation-duration:32s;animation-delay:-18s;}

            .af-particles i:nth-child(31)
            {left:69%;top:10%;animation-duration:37s;animation-delay:-27s;}

            .af-particles i:nth-child(32)
            {left:82%;top:16%;animation-duration:29s;animation-delay:-9s;}


            @keyframes afParticle {

                from {

                    transform:
                        translate3d(0,20vh,0);

                    opacity:0;
                }

                15% {
                    opacity:.55;
                }

                75% {
                    opacity:.35;
                }

                to {

                    transform:
                        translate3d(8vw,-120vh,0);

                    opacity:0;
                }
            }


            /* -------------------------------------------------
               RARE SPARKS
            ------------------------------------------------- */

            .af-sparks i {

                position:absolute;

                width:2px;
                height:2px;

                border-radius:50%;

                background:#DDF9FF;

                box-shadow:
                    0 0 12px
                    rgba(150,235,255,.9);

                animation:
                    afSpark 8s ease-in-out infinite;

                opacity:0;
            }


            .af-sparks i:nth-child(1)
            {left:17%;top:28%;animation-delay:1s;}

            .af-sparks i:nth-child(2)
            {left:37%;top:63%;animation-delay:4s;}

            .af-sparks i:nth-child(3)
            {left:58%;top:20%;animation-delay:7s;}

            .af-sparks i:nth-child(4)
            {left:72%;top:48%;animation-delay:2s;}

            .af-sparks i:nth-child(5)
            {left:83%;top:70%;animation-delay:5s;}

            .af-sparks i:nth-child(6)
            {left:46%;top:37%;animation-delay:9s;}


            @keyframes afSpark {

                0%,65%,100% {

                    opacity:0;

                    transform:
                        scale(.5);
                }

                72% {

                    opacity:.8;

                    transform:
                        scale(1.5);
                }

                78% {

                    opacity:.15;

                    transform:
                        scale(.8);
                }
            }

        `);


        document.documentElement.classList.add(
            "arctic-forest-active"
        );

        document.body.classList.add(
            "arctic-theme"
        );


        createLiveLayer("arctic");
    }


    // =========================================================
    // DARK FOREST
    // =========================================================

    function applyForest() {

        addStyle(`

            /* =================================================
               DARK FOREST
            ================================================= */


            /* -------------------------------------------------
               BASE
            ------------------------------------------------- */

            body.forest-theme,
            body.forest-theme .main,
            body.forest-theme .wrap,
            body.forest-theme .content,
            body.forest-theme .activity {

                background:#070D0A !important;
            }


            body.forest-theme {

                color:#ffffff !important;
            }


            /* -------------------------------------------------
               DARK AREAS
            ------------------------------------------------- */

            body.forest-theme .background,
            body.forest-theme .modal,
            body.forest-theme .modal__content,
            body.forest-theme .settings,
            body.forest-theme .menu {

                background:#040806 !important;
            }


            /* -------------------------------------------------
               FOCUS
            ------------------------------------------------- */

            body.forest-theme .selector.focus {

                outline:none !important;

                background:
                    linear-gradient(
                        135deg,
                        #E2F8EA 0%,
                        #65B985 100%
                    ) !important;

                color:#07100B !important;
            }


            /* -------------------------------------------------
               CARDS
            ------------------------------------------------- */

            body.forest-theme .card.focus {

                box-shadow:
                    0 0 0 2px #65B985 !important;
            }


            /* -------------------------------------------------
               SETTINGS
            ------------------------------------------------- */

            body.forest-theme .settings__content,
            body.forest-theme .settings__body {

                background:
                    linear-gradient(
                        135deg,
                        rgb(24,43,32),
                        rgb(5,11,8)
                    ) !important;
            }


            /* -------------------------------------------------
               PLAYER
            ------------------------------------------------- */

            body.forest-theme
            .player-panel__progress,

            body.forest-theme
            .player-panel__progress-line {

                background:#45A86B !important;
            }


            /* -------------------------------------------------
               EXTENSIONS
            ------------------------------------------------- */

            body.forest-theme .extensions,
            body.forest-theme .extensions__item {

                background:#050A07 !important;
            }


            body.forest-theme .extensions__item.focus {

                background:#12221A !important;
            }


            /* -------------------------------------------------
               TORRENTS
            ------------------------------------------------- */

            body.forest-theme .torrent-item__badge,
            body.forest-theme .torrent-item__quality {

                color:#D9E9DF !important;
            }


            body.forest-theme .torrent-item.focus {

                background:
                    rgba(101,185,133,.24) !important;
            }


            /* -------------------------------------------------
               IPTV
            ------------------------------------------------- */

            body.forest-theme .iptv__item.focus {

                background:#14291F !important;
            }


            /* =================================================
               LIVE LAYER
            ================================================= */

            #arctic-forest-live-layer {

                position:fixed;

                inset:0;

                pointer-events:none;

                z-index:999999;

                overflow:hidden;
            }


            /* -------------------------------------------------
               MIST
            ------------------------------------------------- */

            .df-mist {

                position:absolute;

                width:60vw;
                height:60vw;

                border-radius:50%;

                filter:blur(100px);

                opacity:.075;
            }


            .df-mist-1 {

                left:-20vw;
                top:10vh;

                background:
                    radial-gradient(
                        circle,
                        rgba(65,150,95,.42),
                        transparent 70%
                    );

                animation:
                    dfMist1 35s ease-in-out infinite alternate;
            }


            .df-mist-2 {

                right:-20vw;
                top:45vh;

                background:
                    radial-gradient(
                        circle,
                        rgba(45,125,75,.35),
                        transparent 70%
                    );

                animation:
                    dfMist2 42s ease-in-out infinite alternate;
            }


            .df-mist-3 {

                left:20vw;
                bottom:-35vw;

                background:
                    radial-gradient(
                        circle,
                        rgba(90,170,110,.20),
                        transparent 70%
                    );

                animation:
                    dfMist3 48s ease-in-out infinite alternate;
            }


            @keyframes dfMist1 {

                from {

                    transform:
                        translate3d(0,0,0)
                        scale(1);
                }

                to {

                    transform:
                        translate3d(16vw,8vh,0)
                        scale(1.18);
                }
            }


            @keyframes dfMist2 {

                from {

                    transform:
                        translate3d(0,0,0)
                        scale(1);
                }

                to {

                    transform:
                        translate3d(-14vw,-5vh,0)
                        scale(1.20);
                }
            }


            @keyframes dfMist3 {

                from {

                    transform:
                        translate3d(0,0,0)
                        scale(1);
                }

                to {

                    transform:
                        translate3d(8vw,-15vh,0)
                        scale(1.15);
                }
            }


            /* -------------------------------------------------
               FOREST PARTICLES
            ------------------------------------------------- */

            .df-particles i {

                position:absolute;

                width:2px;
                height:2px;

                border-radius:50%;

                background:
                    rgba(130,205,155,.38);

                box-shadow:
                    0 0 7px
                    rgba(90,180,120,.25);

                animation:
                    dfParticle linear infinite;
            }


            .df-particles i:nth-child(1)
            {left:7%;top:90%;animation-duration:30s;animation-delay:-8s;}

            .df-particles i:nth-child(2)
            {left:16%;top:70%;animation-duration:38s;animation-delay:-17s;}

            .df-particles i:nth-child(3)
            {left:25%;top:82%;animation-duration:34s;animation-delay:-11s;}

            .df-particles i:nth-child(4)
            {left:34%;top:60%;animation-duration:42s;animation-delay:-24s;}

            .df-particles i:nth-child(5)
            {left:43%;top:75%;animation-duration:36s;animation-delay:-14s;}

            .df-particles i:nth-child(6)
            {left:52%;top:88%;animation-duration:45s;animation-delay:-31s;}

            .df-particles i:nth-child(7)
            {left:61%;top:67%;animation-duration:33s;animation-delay:-19s;}

            .df-particles i:nth-child(8)
            {left:70%;top:80%;animation-duration:40s;animation-delay:-7s;}

            .df-particles i:nth-child(9)
            {left:79%;top:58%;animation-duration:37s;animation-delay:-22s;}

            .df-particles i:nth-child(10)
            {left:88%;top:72%;animation-duration:44s;animation-delay:-16s;}

            .df-particles i:nth-child(11)
            {left:12%;top:45%;animation-duration:39s;animation-delay:-28s;}

            .df-particles i:nth-child(12)
            {left:29%;top:40%;animation-duration:35s;animation-delay:-13s;}

            .df-particles i:nth-child(13)
            {left:48%;top:50%;animation-duration:43s;animation-delay:-26s;}

            .df-particles i:nth-child(14)
            {left:68%;top:35%;animation-duration:41s;animation-delay:-21s;}

            .df-particles i:nth-child(15)
            {left:91%;top:42%;animation-duration:36s;animation-delay:-9s;}


            @keyframes dfParticle {

                from {

                    transform:
                        translate3d(0,15vh,0);

                    opacity:0;
                }

                18% {

                    opacity:.35;
                }

                75% {

                    opacity:.20;
                }

                to {

                    transform:
                        translate3d(-5vw,-110vh,0);

                    opacity:0;
                }
            }

        `);


        document.documentElement.classList.add(
            "arctic-forest-active"
        );

        document.body.classList.add(
            "forest-theme"
        );


        createLiveLayer("forest");
    }


    // =========================================================
    // STANDARD LAMPA
    // =========================================================

    function applyDefault() {

        // Удаляем ТОЛЬКО то, что добавил наш плагин.
        // Никакие стандартные стили Lampa здесь не задаются.

        removeOurTheme();

        console.log(
            "[Arctic Forest] Standard Lampa theme"
        );
    }


    // =========================================================
    // APPLY
    // =========================================================

    function applyTheme() {

        removeOurTheme();


        if (currentTheme === "arctic") {

            applyArctic();

        } else if (currentTheme === "forest") {

            applyForest();

        } else {

            applyDefault();
        }


        console.log(
            "[Arctic Forest] Current theme:",
            currentTheme
        );
    }


    // =========================================================
    // SETTINGS
    // Логика регистрации аналогична рабочему RezkaComment V2
    // =========================================================

    function settings() {

        try {

            if (!Lampa.SettingsApi) {

                console.error(
                    "[Arctic Forest] SettingsApi unavailable"
                );

                return;
            }


            // -------------------------------------------------
            // COMPONENT
            // -------------------------------------------------

            Lampa.SettingsApi.addComponent({

                component: COMPONENT,

                name: "Arctic Forest",

                icon:
                    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +

                    '<path d="M12 2v20" ' +
                    'stroke="currentColor" ' +
                    'stroke-width="1.8" ' +
                    'stroke-linecap="round"/>' +

                    '<path d="M2 12h20" ' +
                    'stroke="currentColor" ' +
                    'stroke-width="1.8" ' +
                    'stroke-linecap="round"/>' +

                    '<path d="M4.93 4.93l14.14 14.14" ' +
                    'stroke="currentColor" ' +
                    'stroke-width="1.8" ' +
                    'stroke-linecap="round"/>' +

                    '<path d="M19.07 4.93L4.93 19.07" ' +
                    'stroke="currentColor" ' +
                    'stroke-width="1.8" ' +
                    'stroke-linecap="round"/>' +

                    '</svg>'
            });


            // -------------------------------------------------
            // THEME SELECT
            // -------------------------------------------------

            Lampa.SettingsApi.addParam({

                component: COMPONENT,

                param: {

                    name: STORAGE_KEY,

                    type: "select",

                    values: {

                        arctic:
                            "Arctic Live",

                        forest:
                            "Dark Forest",

                        default:
                            "Стандартная"
                    },

                    default:
                        Lampa.Storage.get(
                            STORAGE_KEY,
                            DEFAULT_THEME
                        )
                },

                field: {

                    name:
                        "Тема",

                    description:
                        "Выберите оформление Lampa"
                },

                onChange:
                    function (value) {

                        currentTheme =
                            String(value);


                        if (
                            currentTheme !== "arctic" &&
                            currentTheme !== "forest" &&
                            currentTheme !== "default"
                        ) {

                            currentTheme =
                                DEFAULT_THEME;
                        }


                        saveTheme(
                            currentTheme
                        );


                        applyTheme();


                        if (
                            Lampa.Noty
                        ) {

                            var title =
                                currentTheme === "arctic"
                                    ? "Arctic Live"
                                    : currentTheme === "forest"
                                        ? "Dark Forest"
                                        : "Стандартная";


                            Lampa.Noty.show(
                                "Тема изменена: " +
                                title
                            );
                        }
                    }
            });


            console.log(
                "[Arctic Forest] Settings registered"
            );

        } catch (e) {

            console.error(
                "[Arctic Forest] Settings init error:",
                e
            );
        }
    }


    // =========================================================
    // START
    // =========================================================

    function startPlugin() {

        console.log(
            "[Arctic Forest] Starting..."
        );


        // -----------------------------------------------------
        // Загружаем настройку
        // -----------------------------------------------------

        loadTheme();


        // -----------------------------------------------------
        // Регистрируем меню
        // -----------------------------------------------------

        settings();


        // -----------------------------------------------------
        // ВАЖНО
        //
        // Если тема = default,
        // вообще ничего визуального не применяем.
        //
        // Lampa остаётся полностью стандартной.
        // -----------------------------------------------------

        if (currentTheme !== "default") {

            applyTheme();

        } else {

            console.log(
                "[Arctic Forest] Default mode — no theme applied"
            );
        }
    }


    // =========================================================
    // BOOT
    // =========================================================

    if (typeof Lampa === "undefined") {

        setTimeout(
            function waitLampa() {

                if (
                    typeof Lampa !== "undefined"
                ) {

                    startPlugin();

                } else {

                    setTimeout(
                        waitLampa,
                        500
                    );
                }

            },
            500
        );

    } else if (window.appready) {

        startPlugin();

    } else if (
        Lampa.Listener &&
        Lampa.Listener.follow
    ) {

        Lampa.Listener.follow(
            "app",
            function (e) {

                if (
                    e.type === "ready"
                ) {

                    startPlugin();
                }
            }
        );

    } else {

        startPlugin();
    }

})();
