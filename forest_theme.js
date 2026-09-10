(function () {
    "use strict";

    // =========================================================
    // ARCTIC FOREST
    // Unified Lampa theme plugin
    //
    // Themes:
    //   default = Standard Lampa
    //   arctic  = Arctic Live
    //   forest  = Dark Forest
    //   storm   = Буря
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
            currentTheme !== "storm" &&
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
    // REMOVE OUR THEME
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


        if (document.body) {

            document.body.classList.remove(
                "arctic-theme"
            );

            document.body.classList.remove(
                "forest-theme"
            );

            document.body.classList.remove(
                "storm-theme"
            );
        }
    }


    // =========================================================
    // ADD CSS
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


        // =====================================================
        // ARCTIC
        // =====================================================

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


        // =====================================================
        // FOREST
        // =====================================================

        if (theme === "forest") {

            layer.innerHTML = `

                <div class="df-mist df-mist-1"></div>
                <div class="df-mist df-mist-2"></div>
                <div class="df-mist df-mist-3"></div>

                <div class="df-particles">
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                </div>
            `;
        }


        // =====================================================
        // STORM
        // =====================================================

        if (theme === "storm") {

            layer.innerHTML = `

                <div class="storm-sky"></div>

                <div class="storm-cloud storm-cloud-1"></div>
                <div class="storm-cloud storm-cloud-2"></div>
                <div class="storm-cloud storm-cloud-3"></div>

                <div class="storm-mist storm-mist-1"></div>
                <div class="storm-mist storm-mist-2"></div>
                <div class="storm-mist storm-mist-3"></div>

                <div class="storm-rain">
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i>
                </div>

                <div class="storm-flash storm-flash-1"></div>
                <div class="storm-flash storm-flash-2"></div>

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
               ARCTIC
            ================================================= */

            body,
            body .main,
            body .wrap,
            body .content,
            body .activity {

                background:#0A1014 !important;
            }


            body {
                color:#ffffff !important;
            }


            body .background,
            body .modal,
            body .modal__content,
            body .settings,
            body .menu {

                background:#060A0D !important;
            }


            body .selector.focus {

                outline:none !important;

                background:
                    linear-gradient(
                        135deg,
                        #E6F9FF 0%,
                        #8DD8EA 100%
                    ) !important;

                color:#071015 !important;
            }


            body .card.focus {

                box-shadow:
                    0 0 0 2px #8DD8EA !important;
            }


            body .settings__content,
            body .settings__body {

                background:
                    linear-gradient(
                        135deg,
                        rgb(27,40,48),
                        rgb(7,11,14)
                    ) !important;
            }


            body .player-panel__progress,
            body .player-panel__progress-line {

                background:#63C7DC !important;
            }


            body .extensions,
            body .extensions__item {

                background:#080D11 !important;
            }


            body .extensions__item.focus {

                background:#17242B !important;
            }


            body .torrent-item__badge,
            body .torrent-item__quality {

                color:#D8E8ED !important;
            }


            body .torrent-item.focus {

                background:
                    rgba(141,216,234,.24) !important;
            }


            body .iptv__item.focus {

                background:#172A32 !important;
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


            /* =================================================
               MIST
            ================================================= */

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


            /* =================================================
               AURORA
            ================================================= */

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


            /* =================================================
               PARTICLES
            ================================================= */

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


            /* =================================================
               RARE SPARKS
            ================================================= */

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

                    transform:scale(.5);
                }

                72% {

                    opacity:.8;

                    transform:scale(1.5);
                }

                78% {

                    opacity:.15;

                    transform:scale(.8);
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

            body,
            body .main,
            body .wrap,
            body .content,
            body .activity {

                background:#070D0A !important;
            }


            body {
                color:#ffffff !important;
            }


            body .background,
            body .modal,
            body .modal__content,
            body .settings,
            body .menu {

                background:#040806 !important;
            }


            body .selector.focus {

                outline:none !important;

                background:
                    linear-gradient(
                        135deg,
                        #E2F8EA 0%,
                        #65B985 100%
                    ) !important;

                color:#07100B !important;
            }


            body .card.focus {

                box-shadow:
                    0 0 0 2px #65B985 !important;
            }


            body .settings__content,
            body .settings__body {

                background:
                    linear-gradient(
                        135deg,
                        rgb(24,43,32),
                        rgb(5,11,8)
                    ) !important;
            }


            body .player-panel__progress,
            body .player-panel__progress-line {

                background:#45A86B !important;
            }


            body .extensions,
            body .extensions__item {

                background:#050A07 !important;
            }


            body .extensions__item.focus {

                background:#12221A !important;
            }


            body .torrent-item__badge,
            body .torrent-item__quality {

                color:#D9E9DF !important;
            }


            body .torrent-item.focus {

                background:
                    rgba(101,185,133,.24) !important;
            }


            body .iptv__item.focus {

                background:#14291F !important;
            }


            /* =================================================
               LIVE
            ================================================= */

            #arctic-forest-live-layer {

                position:fixed;
                inset:0;

                pointer-events:none;

                z-index:999999;

                overflow:hidden;
            }


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
    // STORM
    // =========================================================

    function applyStorm() {

        addStyle(`

            /* =================================================
               STORM
            ================================================= */


            body,
            body .main,
            body .wrap,
            body .content,
            body .activity {

                background:#080B10 !important;
            }


            body {

                color:#ffffff !important;
            }


            /* -------------------------------------------------
               DARK AREAS
            ------------------------------------------------- */

            body .background,
            body .modal,
            body .modal__content,
            body .settings,
            body .menu {

                background:#05070A !important;
            }


            /* -------------------------------------------------
               FOCUS
            ------------------------------------------------- */

            body .selector.focus {

                outline:none !important;

                background:
                    linear-gradient(
                        135deg,
                        #DDF5FF 0%,
                        #5B9FC7 100%
                    ) !important;

                color:#071016 !important;
            }


            body .card.focus {

                box-shadow:
                    0 0 0 2px #6EA7C7 !important;
            }


            /* -------------------------------------------------
               SETTINGS
            ------------------------------------------------- */

            body .settings__content,
            body .settings__body {

                background:
                    linear-gradient(
                        135deg,
                        rgb(25,32,41),
                        rgb(5,8,11)
                    ) !important;
            }


            /* -------------------------------------------------
               PLAYER
            ------------------------------------------------- */

            body .player-panel__progress,
            body .player-panel__progress-line {

                background:#63A9D0 !important;
            }


            /* -------------------------------------------------
               EXTENSIONS
            ------------------------------------------------- */

            body .extensions,
            body .extensions__item {

                background:#070B10 !important;
            }


            body .extensions__item.focus {

                background:#17212A !important;
            }


            /* -------------------------------------------------
               TORRENTS
            ------------------------------------------------- */

            body .torrent-item__badge,
            body .torrent-item__quality {

                color:#D9E8F0 !important;
            }


            body .torrent-item.focus {

                background:
                    rgba(91,159,199,.23) !important;
            }


            /* -------------------------------------------------
               IPTV
            ------------------------------------------------- */

            body .iptv__item.focus {

                background:#14232E !important;
            }


            /* =================================================
               LIVE STORM
            ================================================= */

            #arctic-forest-live-layer {

                position:fixed;

                inset:0;

                pointer-events:none;

                z-index:999999;

                overflow:hidden;
            }


            /* =================================================
               STORM SKY
            ================================================= */

            .storm-sky {

                position:absolute;

                inset:0;

                background:
                    radial-gradient(
                        ellipse at 50% -15%,
                        rgba(85,110,135,.16),
                        transparent 55%
                    ),

                    linear-gradient(
                        to bottom,
                        rgba(20,28,38,.30),
                        rgba(3,6,9,.08) 45%,
                        rgba(2,4,6,.38)
                    );

                opacity:.85;
            }


            /* =================================================
               CLOUDS
            ================================================= */

            .storm-cloud {

                position:absolute;

                border-radius:50%;

                filter:blur(55px);

                opacity:.20;

                background:
                    radial-gradient(
                        ellipse,
                        rgba(70,82,96,.85) 0%,
                        rgba(35,44,54,.55) 38%,
                        transparent 72%
                    );
            }


            .storm-cloud-1 {

                width:75vw;
                height:35vw;

                left:-20vw;
                top:-8vw;

                animation:
                    stormCloud1 48s ease-in-out infinite alternate;
            }


            .storm-cloud-2 {

                width:85vw;
                height:40vw;

                right:-35vw;
                top:15vh;

                opacity:.15;

                animation:
                    stormCloud2 62s ease-in-out infinite alternate;
            }


            .storm-cloud-3 {

                width:90vw;
                height:42vw;

                left:10vw;
                bottom:-30vw;

                opacity:.13;

                animation:
                    stormCloud3 55s ease-in-out infinite alternate;
            }


            @keyframes stormCloud1 {

                from {

                    transform:
                        translate3d(-5vw,0,0)
                        scale(1);
                }

                to {

                    transform:
                        translate3d(15vw,8vh,0)
                        scale(1.18);
                }
            }


            @keyframes stormCloud2 {

                from {

                    transform:
                        translate3d(8vw,-4vh,0)
                        scale(1);
                }

                to {

                    transform:
                        translate3d(-18vw,10vh,0)
                        scale(1.20);
                }
            }


            @keyframes stormCloud3 {

                from {

                    transform:
                        translate3d(0,5vh,0)
                        scale(1);
                }

                to {

                    transform:
                        translate3d(12vw,-8vh,0)
                        scale(1.16);
                }
            }


            /* =================================================
               FOG
            ================================================= */

            .storm-mist {

                position:absolute;

                border-radius:50%;

                filter:blur(80px);

                opacity:.14;

                background:
                    radial-gradient(
                        ellipse,
                        rgba(105,125,142,.40),
                        transparent 70%
                    );
            }


            .storm-mist-1 {

                width:70vw;
                height:28vw;

                left:-25vw;
                top:30vh;

                animation:
                    stormMist1 32s ease-in-out infinite alternate;
            }


            .storm-mist-2 {

                width:80vw;
                height:30vw;

                right:-30vw;
                top:50vh;

                opacity:.10;

                animation:
                    stormMist2 40s ease-in-out infinite alternate;
            }


            .storm-mist-3 {

                width:100vw;
                height:35vw;

                left:0;
                bottom:-15vw;

                opacity:.11;

                animation:
                    stormMist3 46s ease-in-out infinite alternate;
            }


            @keyframes stormMist1 {

                from {

                    transform:
                        translate3d(-8vw,0,0)
                        scale(1);
                }

                to {

                    transform:
                        translate3d(20vw,3vh,0)
                        scale(1.15);
                }
            }


            @keyframes stormMist2 {

                from {

                    transform:
                        translate3d(8vw,0,0)
                        scale(1);
                }

                to {

                    transform:
                        translate3d(-18vw,-5vh,0)
                        scale(1.20);
                }
            }


            @keyframes stormMist3 {

                from {

                    transform:
                        translate3d(0,3vh,0)
                        scale(1);
                }

                to {

                    transform:
                        translate3d(10vw,-8vh,0)
                        scale(1.12);
                }
            }


            /* =================================================
               RAIN / MOISTURE PARTICLES
            ================================================= */

            .storm-rain i {

                position:absolute;

                width:1px;
                height:7px;

                border-radius:50%;

                background:
                    rgba(180,205,220,.20);

                opacity:0;

                transform:rotate(18deg);

                animation:
                    stormRain linear infinite;
            }


            .storm-rain i:nth-child(1)
            {left:3%;top:-10%;animation-duration:4.8s;animation-delay:-1s;}

            .storm-rain i:nth-child(2)
            {left:7%;top:-20%;animation-duration:5.7s;animation-delay:-3s;}

            .storm-rain i:nth-child(3)
            {left:11%;top:-5%;animation-duration:4.3s;animation-delay:-2s;}

            .storm-rain i:nth-child(4)
            {left:15%;top:-15%;animation-duration:6.2s;animation-delay:-5s;}

            .storm-rain i:nth-child(5)
            {left:19%;top:-25%;animation-duration:5.1s;animation-delay:-1s;}

            .storm-rain i:nth-child(6)
            {left:23%;top:-8%;animation-duration:4.9s;animation-delay:-4s;}

            .storm-rain i:nth-child(7)
            {left:27%;top:-18%;animation-duration:6.4s;animation-delay:-2s;}

            .storm-rain i:nth-child(8)
            {left:31%;top:-30%;animation-duration:5.5s;animation-delay:-6s;}

            .storm-rain i:nth-child(9)
            {left:35%;top:-12%;animation-duration:4.7s;animation-delay:-3s;}

            .storm-rain i:nth-child(10)
            {left:39%;top:-22%;animation-duration:5.9s;animation-delay:-1s;}

            .storm-rain i:nth-child(11)
            {left:43%;top:-5%;animation-duration:4.6s;animation-delay:-4s;}

            .storm-rain i:nth-child(12)
            {left:47%;top:-17%;animation-duration:6.1s;animation-delay:-5s;}

            .storm-rain i:nth-child(13)
            {left:51%;top:-28%;animation-duration:5.2s;animation-delay:-2s;}

            .storm-rain i:nth-child(14)
            {left:55%;top:-9%;animation-duration:4.8s;animation-delay:-6s;}

            .storm-rain i:nth-child(15)
            {left:59%;top:-20%;animation-duration:5.8s;animation-delay:-3s;}

            .storm-rain i:nth-child(16)
            {left:63%;top:-7%;animation-duration:4.5s;animation-delay:-1s;}

            .storm-rain i:nth-child(17)
            {left:67%;top:-25%;animation-duration:6.3s;animation-delay:-4s;}

            .storm-rain i:nth-child(18)
            {left:71%;top:-14%;animation-duration:5.0s;animation-delay:-2s;}

            .storm-rain i:nth-child(19)
            {left:75%;top:-30%;animation-duration:5.6s;animation-delay:-5s;}

            .storm-rain i:nth-child(20)
            {left:79%;top:-10%;animation-duration:4.9s;animation-delay:-3s;}

            .storm-rain i:nth-child(21)
            {left:83%;top:-21%;animation-duration:6.0s;animation-delay:-1s;}

            .storm-rain i:nth-child(22)
            {left:87%;top:-4%;animation-duration:4.4s;animation-delay:-4s;}

            .storm-rain i:nth-child(23)
            {left:91%;top:-16%;animation-duration:5.4s;animation-delay:-2s;}

            .storm-rain i:nth-child(24)
            {left:95%;top:-26%;animation-duration:6.2s;animation-delay:-6s;}

            .storm-rain i:nth-child(25)
            {left:5%;top:15%;animation-duration:5.3s;animation-delay:-2s;}

            .storm-rain i:nth-child(26)
            {left:18%;top:25%;animation-duration:6.0s;animation-delay:-5s;}

            .storm-rain i:nth-child(27)
            {left:32%;top:10%;animation-duration:4.8s;animation-delay:-3s;}

            .storm-rain i:nth-child(28)
            {left:46%;top:20%;animation-duration:5.7s;animation-delay:-1s;}

            .storm-rain i:nth-child(29)
            {left:60%;top:12%;animation-duration:6.1s;animation-delay:-4s;}

            .storm-rain i:nth-child(30)
            {left:74%;top:28%;animation-duration:5.1s;animation-delay:-2s;}

            .storm-rain i:nth-child(31)
            {left:88%;top:18%;animation-duration:5.9s;animation-delay:-5s;}

            .storm-rain i:nth-child(32)
            {left:97%;top:35%;animation-duration:4.7s;animation-delay:-3s;}


            @keyframes stormRain {

                0% {

                    transform:
                        translate3d(0,-10vh,0)
                        rotate(18deg);

                    opacity:0;
                }

                10% {

                    opacity:.22;
                }

                85% {

                    opacity:.12;
                }

                100% {

                    transform:
                        translate3d(-12vw,120vh,0)
                        rotate(18deg);

                    opacity:0;
                }
            }


            /* =================================================
               LIGHTNING
            ================================================= */

            .storm-flash {

                position:absolute;

                inset:0;

                opacity:0;

                background:
                    radial-gradient(
                        ellipse at 50% 15%,
                        rgba(220,240,255,.22),
                        transparent 60%
                    );
            }


            .storm-flash-1 {

                animation:
                    stormLightning1 31s linear infinite;
            }


            .storm-flash-2 {

                animation:
                    stormLightning2 47s linear infinite;
            }


            @keyframes stormLightning1 {

                0%,89%,91%,93%,100% {

                    opacity:0;
                }

                90% {

                    opacity:.20;
                }

                90.4% {

                    opacity:0;
                }

                90.9% {

                    opacity:.32;
                }

                91.3% {

                    opacity:0;
                }
            }


            @keyframes stormLightning2 {

                0%,94%,96%,100% {

                    opacity:0;
                }

                95% {

                    opacity:.14;
                }

                95.3% {

                    opacity:0;
                }

                95.8% {

                    opacity:.25;
                }

                96.1% {

                    opacity:0;
                }
            }

        `);


        document.documentElement.classList.add(
            "arctic-forest-active"
        );

        document.body.classList.add(
            "storm-theme"
        );


        createLiveLayer("storm");
    }


    // =========================================================
    // STANDARD LAMPA
    // =========================================================

    function applyDefault() {

        removeOurTheme();

        console.log(
            "[Arctic Forest] Standard Lampa"
        );
    }


    // =========================================================
    // APPLY THEME
    // =========================================================

    function applyTheme() {

        removeOurTheme();


        if (currentTheme === "arctic") {

            applyArctic();

        } else if (currentTheme === "forest") {

            applyForest();

        } else if (currentTheme === "storm") {

            applyStorm();

        } else {

            applyDefault();
        }


        console.log(
            "[Arctic Forest] Theme:",
            currentTheme
        );
    }


    // =========================================================
    // SETTINGS
    // Логика регистрации аналогична RezkaComment V2
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

                        default:
                            "Стандартная",

                        arctic:
                            "Arctic Live",

                        forest:
                            "Dark Forest",

                        storm:
                            "🌩️ Буря"
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
                            currentTheme !== "storm" &&
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

                                        : currentTheme === "storm"
                                            ? "Буря"

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
        // Загружаем сохранённую настройку
        // -----------------------------------------------------

        loadTheme();


        // -----------------------------------------------------
        // Регистрируем настройки
        // -----------------------------------------------------

        settings();


        // -----------------------------------------------------
        // ВАЖНО:
        //
        // При default вообще ничего не применяем.
        // -----------------------------------------------------

        if (
            currentTheme !== "default"
        ) {

            applyTheme();

        } else {

            console.log(
                "[Arctic Forest] Standard mode — no changes"
            );
        }
    }


    // =========================================================
    // BOOT
    // =========================================================

    if (
        typeof Lampa === "undefined"
    ) {

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

    } else if (
        window.appready
    ) {

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
