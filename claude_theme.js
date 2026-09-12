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
    //   autumn  = Осень
    //   winter  = Зима
    // =========================================================

    var COMPONENT = "arctic_forest";
    var STORAGE_KEY = "arctic_forest_theme";

    var DEFAULT_THEME = "default";

    var currentTheme = DEFAULT_THEME;

    // Seasonal icon in the Lampa header menu button.
    var seasonMenuObserver = null;
    var seasonMenuTimer = null;


    // =========================================================
    // SEASONAL MENU ICON
    // =========================================================

    function seasonMenuSvg(theme) {

        if (theme === "winter") {

            // Small Santa hat
            return `
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M6 23.5C10 18.5 13.2 12.5 16 5c4.8 4.1 8.1 9.9 9.8 18.5H6Z" fill="#D94A4A"/>
                    <path d="M5.2 23.2c4.5-1.1 13.8-1.2 21.7 0l.7 2.1c-7.6 2-16.3 1.9-22.8-.1l.4-2Z" fill="#F7F7F7"/>
                    <circle cx="16.7" cy="4.8" r="3.1" fill="#F7F7F7"/>
                    <path d="M7.5 22.1c4.7-.9 12.1-1 17.9.2" fill="none" stroke="#D9E8EF" stroke-width=".9" opacity=".7"/>
                </svg>
            `;
        }

        if (theme === "autumn") {

            // Halloween pumpkin
            return `
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M15.1 6.1c.2-2.2 1.6-3.4 3.9-3.7-.2 2.2-1.2 3.8-3.6 4.4" fill="#5D7A35"/>
                    <path d="M8.1 9.1C4.7 10.7 3.3 14.3 3.8 18.7c.5 5.7 4.1 9 8.3 9.3 1.6.1 2.8-.4 4-.9 1.2.5 2.4 1 4 .9 4.2-.3 7.8-3.6 8.3-9.3.5-4.4-.9-8-4.3-9.6-2.5-1.2-4.7-.6-6.1.5-1.4-1.1-3.6-1.7-6.1-.5Z" fill="#E57A24"/>
                    <path d="M10.2 10.1c-2 3.1-2 11.5 1.3 16.8M16 8.8c-1.3 5.5-1.3 12.2 0 18.1M21.8 10.1c2 3.1 2 11.5-1.3 16.8" fill="none" stroke="#B95718" stroke-width="1.15" opacity=".75"/>
                    <path d="m9 17 3.2-2.1v2.3l2.2 1.1-2.2 1.1v2.3L9 19.6l2.1-1.3L9 17Zm14 0-3.2-2.1v2.3l-2.2 1.1 2.2 1.1v2.3l3.2-2.1-2.1-1.3L23 17Z" fill="#1B120D"/>
                    <path d="M12.7 23.1c2.1 1.2 4.5 1.2 6.6 0-1.3 2-5.3 2-6.6 0Z" fill="#1B120D"/>
                </svg>
            `;
        }

        if (theme === "forest") {
            return `
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M25.8 5.8C15.1 6.4 8.3 11.5 8.1 20.4c6.8 1.7 13.2-1.9 16.1-8.4 1.1-2.5 1.6-4.6 1.6-6.2Z" fill="#78A65A"/>
                    <path d="M6 27c4.8-7.1 10.4-11.8 18.1-18.6" fill="none" stroke="#D4E8C0" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `;
        }

        if (theme === "storm") {
            return `
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M18.6 3.5 7.7 18.2h7.2l-2 10.3 11.4-15.8h-7.4l1.7-9.2Z" fill="#DCEFFF"/>
                </svg>
            `;
        }

        // Arctic
        return `
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g fill="none" stroke="#E8F8FF" stroke-width="1.5" stroke-linecap="round">
                    <path d="M16 4v24M4 16h24M7.5 7.5l17 17M24.5 7.5l-17 17"/>
                    <path d="m16 4-2.4 3M16 4l2.4 3M16 28l-2.4-3M16 28l2.4-3M4 16l3-2.4M4 16l3 2.4M28 16l-3-2.4M28 16l-3 2.4"/>
                </g>
            </svg>
        `;
    }


    function findSeasonMenuTargets() {

        var selectors = [
            ".head__menu-icon",
            ".head__menu",
            ".head__menu-button",
            ".head .menu__button",
            ".head .menu-button",
            ".head .head__button--menu",
            ".head .menu"
        ];

        var found = [];

        selectors.forEach(function (selector) {

            try {
                document.querySelectorAll(selector).forEach(function (element) {
                    if (found.indexOf(element) === -1) {
                        found.push(element);
                    }
                });
            } catch (e) {}
        });

        return found;
    }


    function removeSeasonMenuIcon() {

        if (seasonMenuTimer) {
            clearTimeout(seasonMenuTimer);
            seasonMenuTimer = null;
        }

        if (seasonMenuObserver) {
            seasonMenuObserver.disconnect();
            seasonMenuObserver = null;
        }

        document.querySelectorAll(".af-season-menu-icon").forEach(function (icon) {
            icon.remove();
        });

        document.querySelectorAll(".af-season-menu-target").forEach(function (target) {
            target.classList.remove("af-season-menu-target");

            target.querySelectorAll(".af-season-menu-original-icon").forEach(function (icon) {
                icon.classList.remove("af-season-menu-original-icon");
            });
        });
    }


    function updateSeasonMenuIcon() {

        if (currentTheme === "default") {
            removeSeasonMenuIcon();
            return;
        }

        var targets = findSeasonMenuTargets();

        targets.forEach(function (target) {

            target.classList.add("af-season-menu-target");

            if (!target.querySelector(".af-season-menu-icon")) {

                var icon = document.createElement("span");
                icon.className = "af-season-menu-icon";
                icon.innerHTML = seasonMenuSvg(currentTheme);
                icon.setAttribute("aria-hidden", "true");

                target.appendChild(icon);
            }

            target.querySelectorAll("svg").forEach(function (svg) {

                if (!svg.closest(".af-season-menu-icon")) {
                    svg.classList.add("af-season-menu-original-icon");
                }
            });
        });
    }


    function startSeasonMenuWatcher() {

        if (seasonMenuObserver || typeof MutationObserver === "undefined") {
            return;
        }

        if (!document.body) {
            return;
        }

        seasonMenuObserver = new MutationObserver(function () {

            if (seasonMenuTimer) {
                return;
            }

            seasonMenuTimer = setTimeout(function () {
                seasonMenuTimer = null;
                updateSeasonMenuIcon();
            }, 120);
        });

        seasonMenuObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }


    function applySeasonMenuIcon() {

        removeSeasonMenuIcon();

        if (currentTheme === "default") {
            return;
        }

        updateSeasonMenuIcon();
        startSeasonMenuWatcher();
    }


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
            currentTheme !== "autumn" &&
            currentTheme !== "winter" &&
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

        var menuStyle = document.getElementById(
            "arctic-forest-menu-style"
        );

        if (menuStyle) {
            menuStyle.remove();
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

            document.body.classList.remove(
                "autumn-theme"
            );

            document.body.classList.remove(
                "winter-theme"
            );
        }

        removeSeasonMenuIcon();
    }


    // =========================================================
    // SEASONAL MENU ICON STYLE
    // =========================================================

    function addSeasonMenuIconStyle() {

        var css = `
            .af-season-menu-target {
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
            }

            .af-season-menu-target .af-season-menu-original-icon {
                opacity: 0 !important;
            }

            .af-season-menu-icon {
                position: absolute !important;
                left: 50% !important;
                top: 50% !important;
                width: 30px !important;
                height: 30px !important;
                transform: translate(-50%, -50%) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                pointer-events: none !important;
                z-index: 20 !important;
                line-height: 0 !important;
            }

            .af-season-menu-icon svg {
                width: 30px !important;
                height: 30px !important;
                display: block !important;
                overflow: visible !important;
            }

            body.winter-theme .af-season-menu-icon svg {
                filter: drop-shadow(0 1px 5px rgba(150, 220, 255, .42)) !important;
            }

            body.autumn-theme .af-season-menu-icon svg {
                filter: drop-shadow(0 1px 5px rgba(255, 125, 40, .32)) !important;
            }

            body.forest-theme .af-season-menu-icon svg {
                filter: drop-shadow(0 1px 5px rgba(120, 180, 80, .28)) !important;
            }

            body.storm-theme .af-season-menu-icon svg {
                filter: drop-shadow(0 1px 5px rgba(150, 210, 255, .36)) !important;
            }

            body.arctic-theme .af-season-menu-icon svg {
                filter: drop-shadow(0 1px 5px rgba(170, 235, 255, .38)) !important;
            }
        `;

        var old = document.getElementById("arctic-forest-menu-style");
        if (old) old.remove();
        var style = document.createElement("style");
        style.id = "arctic-forest-menu-style";
        style.textContent = css;
        document.head.appendChild(style);
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


        // =====================================================
        // AUTUMN
        // =====================================================

        if (theme === "autumn") {

            layer.innerHTML = `

                <div class="autumn-glow"></div>

                <div class="autumn-mist autumn-mist-1"></div>
                <div class="autumn-mist autumn-mist-2"></div>
                <div class="autumn-mist autumn-mist-3"></div>

                <div class="autumn-leaves">
                    <i></i><i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i><i></i>
                    <i></i><i></i><i></i><i></i><i></i>
                </div>
            `;
        }


        // =====================================================
        // WINTER
        // =====================================================

        if (theme === "winter") {

            layer.innerHTML = `

                <div class="winter-glow"></div>

                <div class="winter-mist winter-mist-1"></div>
                <div class="winter-mist winter-mist-2"></div>
                <div class="winter-mist winter-mist-3"></div>

                <div class="winter-snow">
                    <i>❄</i><i>❅</i><i>❆</i><i>❄</i>
                    <i>❅</i><i>❆</i><i>❄</i><i>❅</i>
                    <i>❆</i><i>❄</i><i>❅</i><i>❆</i>
                    <i>❄</i><i>❅</i><i>❆</i><i>❄</i>
                    <i>❅</i><i>❆</i><i>❄</i><i>❅</i>
                    <i>❆</i><i>❄</i><i>❅</i><i>❆</i>
                    <i>❄</i><i>❅</i><i>❆</i><i>❄</i>
                    <i>❅</i><i>❆</i><i>❄</i><i>❅</i>
                    <i>❆</i><i>❄</i><i>❅</i><i>❆</i>
                    <i>❄</i><i>❅</i><i>❆</i><i>❄</i>
                    <i>❅</i><i>❆</i><i>❄</i><i>❅</i>
                    <i>❆</i><i>❄</i><i>❅</i><i>❆</i>
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


            #arctic-forest-live-layer {

                position:fixed;
                inset:0;

                pointer-events:none;

                z-index:999999;

                overflow:hidden;
            }


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

            body .background,
            body .modal,
            body .modal__content,
            body .settings,
            body .menu {

                background:#05070A !important;
            }

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

            body .settings__content,
            body .settings__body {

                background:
                    linear-gradient(
                        135deg,
                        rgb(25,32,41),
                        rgb(5,8,11)
                    ) !important;
            }

            body .player-panel__progress,
            body .player-panel__progress-line {

                background:#63A9D0 !important;
            }

            body .extensions,
            body .extensions__item {

                background:#070B10 !important;
            }

            body .extensions__item.focus {

                background:#17212A !important;
            }

            body .torrent-item__badge,
            body .torrent-item__quality {

                color:#D9E8F0 !important;
            }

            body .torrent-item.focus {

                background:
                    rgba(91,159,199,.23) !important;
            }

            body .iptv__item.focus {

                background:#14232E !important;
            }


            #arctic-forest-live-layer {

                position:fixed;
                inset:0;

                pointer-events:none;

                z-index:999999;

                overflow:hidden;
            }


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
    // AUTUMN
    // =========================================================

    function applyAutumn() {

        addStyle(`

            /* =================================================
               AUTUMN
            ================================================= */

            body,
            body .main,
            body .wrap,
            body .content,
            body .activity {

                background:
                    linear-gradient(
                        180deg,
                        #24170E 0%,
                        #1A1009 50%,
                        #0D0805 100%
                    ) !important;
            }


            body {

                color:#ffffff !important;
            }


            body .background,
            body .modal,
            body .modal__content,
            body .settings,
            body .menu {

                background:#0D0805 !important;
            }


            body .selector.focus {

                outline:none !important;

                background:
                    linear-gradient(
                        135deg,
                        #FFF0D4 0%,
                        #C87536 100%
                    ) !important;

                color:#160D07 !important;
            }


            body .card.focus {

                box-shadow:
                    0 0 0 2px #D08343 !important;
            }


            body .settings__content,
            body .settings__body {

                background:
                    linear-gradient(
                        135deg,
                        rgb(61,38,22),
                        rgb(12,7,4)
                    ) !important;
            }


            body .player-panel__progress,
            body .player-panel__progress-line {

                background:#D08442 !important;
            }


            body .extensions,
            body .extensions__item {

                background:#100A06 !important;
            }


            body .extensions__item.focus {

                background:#2B1A0E !important;
            }


            body .torrent-item__badge,
            body .torrent-item__quality {

                color:#EAD9C5 !important;
            }


            body .torrent-item.focus {

                background:
                    rgba(208,132,66,.28) !important;
            }


            body .iptv__item.focus {

                background:#302010 !important;
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


            .autumn-glow {

                position:absolute;

                width:100vw;
                height:75vh;

                left:0;
                top:-15vh;

                background:
                    radial-gradient(
                        ellipse at 50% 20%,
                        rgba(220,135,55,.13),
                        transparent 68%
                    );

                filter:blur(35px);

                animation:
                    autumnGlow 20s ease-in-out infinite alternate;
            }


            @keyframes autumnGlow {

                from {
                    transform:
                        scale(.96)
                        translateX(-2vw);

                    opacity:.55;
                }

                to {
                    transform:
                        scale(1.06)
                        translateX(2vw);

                    opacity:.90;
                }
            }


            .autumn-mist {

                position:absolute;

                width:75vw;
                height:32vw;

                border-radius:50%;

                filter:blur(75px);

                opacity:.14;

                background:
                    radial-gradient(
                        ellipse,
                        rgba(190,115,55,.38),
                        transparent 70%
                    );
            }


            .autumn-mist-1 {

                left:-25vw;
                top:25vh;

                animation:
                    autumnMist1 32s ease-in-out infinite alternate;
            }


            .autumn-mist-2 {

                right:-30vw;
                top:52vh;

                opacity:.11;

                animation:
                    autumnMist2 42s ease-in-out infinite alternate;
            }


            .autumn-mist-3 {

                left:10vw;
                bottom:-15vw;

                opacity:.10;

                animation:
                    autumnMist3 48s ease-in-out infinite alternate;
            }


            @keyframes autumnMist1 {

                from {
                    transform:
                        translateX(-7vw)
                        scale(1);
                }

                to {
                    transform:
                        translateX(18vw)
                        scale(1.16);
                }
            }


            @keyframes autumnMist2 {

                from {
                    transform:
                        translateX(8vw)
                        scale(1);
                }

                to {
                    transform:
                        translateX(-17vw)
                        scale(1.18);
                }
            }


            @keyframes autumnMist3 {

                from {
                    transform:
                        translateY(3vh)
                        scale(1);
                }

                to {
                    transform:
                        translate(10vw,-7vh)
                        scale(1.14);
                }
            }


            /* =================================================
               LEAVES
            ================================================= */

            .autumn-leaves i {

                position:absolute;

                width:11px;
                height:17px;

                border-radius:
                    80% 20% 75% 25%;

                background:
                    #B85F2B;

                box-shadow:
                    0 0 7px
                    rgba(190,100,40,.20);

                opacity:0;

                animation:
                    autumnLeaf linear infinite;
            }


            .autumn-leaves i:nth-child(1)
            {left:4%;top:-10%;animation-duration:13s;animation-delay:-2s;transform:rotate(25deg);}

            .autumn-leaves i:nth-child(2)
            {left:9%;top:-25%;animation-duration:17s;animation-delay:-9s;transform:rotate(75deg);}

            .autumn-leaves i:nth-child(3)
            {left:14%;top:-5%;animation-duration:15s;animation-delay:-6s;transform:rotate(130deg);}

            .autumn-leaves i:nth-child(4)
            {left:19%;top:-18%;animation-duration:19s;animation-delay:-13s;transform:rotate(40deg);}

            .autumn-leaves i:nth-child(5)
            {left:24%;top:-30%;animation-duration:14s;animation-delay:-5s;transform:rotate(110deg);}

            .autumn-leaves i:nth-child(6)
            {left:29%;top:-12%;animation-duration:18s;animation-delay:-11s;transform:rotate(170deg);}

            .autumn-leaves i:nth-child(7)
            {left:34%;top:-22%;animation-duration:16s;animation-delay:-4s;transform:rotate(55deg);}

            .autumn-leaves i:nth-child(8)
            {left:39%;top:-35%;animation-duration:20s;animation-delay:-16s;transform:rotate(145deg);}

            .autumn-leaves i:nth-child(9)
            {left:44%;top:-8%;animation-duration:15s;animation-delay:-8s;transform:rotate(80deg);}

            .autumn-leaves i:nth-child(10)
            {left:49%;top:-20%;animation-duration:18s;animation-delay:-3s;transform:rotate(15deg);}

            .autumn-leaves i:nth-child(11)
            {left:54%;top:-30%;animation-duration:21s;animation-delay:-14s;transform:rotate(125deg);}

            .autumn-leaves i:nth-child(12)
            {left:59%;top:-14%;animation-duration:16s;animation-delay:-7s;transform:rotate(65deg);}

            .autumn-leaves i:nth-child(13)
            {left:64%;top:-27%;animation-duration:19s;animation-delay:-12s;transform:rotate(155deg);}

            .autumn-leaves i:nth-child(14)
            {left:69%;top:-6%;animation-duration:14s;animation-delay:-1s;transform:rotate(95deg);}

            .autumn-leaves i:nth-child(15)
            {left:74%;top:-17%;animation-duration:17s;animation-delay:-10s;transform:rotate(35deg);}

            .autumn-leaves i:nth-child(16)
            {left:79%;top:-31%;animation-duration:20s;animation-delay:-15s;transform:rotate(135deg);}

            .autumn-leaves i:nth-child(17)
            {left:84%;top:-11%;animation-duration:15s;animation-delay:-5s;transform:rotate(70deg);}

            .autumn-leaves i:nth-child(18)
            {left:89%;top:-23%;animation-duration:18s;animation-delay:-9s;transform:rotate(160deg);}

            .autumn-leaves i:nth-child(19)
            {left:94%;top:-34%;animation-duration:21s;animation-delay:-17s;transform:rotate(45deg);}

            .autumn-leaves i:nth-child(20)
            {left:98%;top:-15%;animation-duration:16s;animation-delay:-6s;transform:rotate(115deg);}

            .autumn-leaves i:nth-child(21)
            {left:12%;top:-40%;animation-duration:22s;animation-delay:-18s;transform:rotate(30deg);}

            .autumn-leaves i:nth-child(22)
            {left:27%;top:-45%;animation-duration:19s;animation-delay:-11s;transform:rotate(145deg);}

            .autumn-leaves i:nth-child(23)
            {left:43%;top:-38%;animation-duration:23s;animation-delay:-20s;transform:rotate(80deg);}

            .autumn-leaves i:nth-child(24)
            {left:58%;top:-42%;animation-duration:18s;animation-delay:-14s;transform:rotate(170deg);}

            .autumn-leaves i:nth-child(25)
            {left:72%;top:-48%;animation-duration:22s;animation-delay:-7s;transform:rotate(60deg);}

            .autumn-leaves i:nth-child(26)
            {left:87%;top:-40%;animation-duration:20s;animation-delay:-16s;transform:rotate(130deg);}

            .autumn-leaves i:nth-child(27)
            {left:17%;top:-55%;animation-duration:24s;animation-delay:-21s;transform:rotate(20deg);}

            .autumn-leaves i:nth-child(28)
            {left:36%;top:-50%;animation-duration:21s;animation-delay:-12s;transform:rotate(105deg);}

            .autumn-leaves i:nth-child(29)
            {left:66%;top:-58%;animation-duration:23s;animation-delay:-19s;transform:rotate(150deg);}

            .autumn-leaves i:nth-child(30)
            {left:93%;top:-52%;animation-duration:19s;animation-delay:-8s;transform:rotate(75deg);}

            .autumn-leaves i:nth-child(31)
            {left:31%;top:-65%;animation-duration:25s;animation-delay:-23s;transform:rotate(120deg);}

            .autumn-leaves i:nth-child(32)
            {left:81%;top:-62%;animation-duration:22s;animation-delay:-18s;transform:rotate(40deg);}

            .autumn-leaves i:nth-child(33)
            {left:7%;top:-70%;animation-duration:26s;animation-delay:-24s;transform:rotate(155deg);}

            .autumn-leaves i:nth-child(34)
            {left:52%;top:-68%;animation-duration:24s;animation-delay:-20s;transform:rotate(65deg);}

            .autumn-leaves i:nth-child(35)
            {left:76%;top:-72%;animation-duration:27s;animation-delay:-25s;transform:rotate(95deg);}

            .autumn-leaves i:nth-child(36)
            {left:97%;top:-66%;animation-duration:23s;animation-delay:-15s;transform:rotate(135deg);}


            .autumn-leaves i:nth-child(3n) {

                width:8px;
                height:13px;

                background:#D58A38;
            }


            .autumn-leaves i:nth-child(4n) {

                width:13px;
                height:19px;

                background:#8E431F;
            }


            .autumn-leaves i:nth-child(5n) {

                background:#C9792E;
            }


            @keyframes autumnLeaf {

                0% {

                    transform:
                        translate3d(0,-15vh,0)
                        rotate(0deg);

                    opacity:0;
                }

                8% {

                    opacity:.75;
                }

                25% {

                    transform:
                        translate3d(45px,25vh,0)
                        rotate(95deg);
                }

                50% {

                    transform:
                        translate3d(-70px,52vh,0)
                        rotate(220deg);
                }

                75% {

                    transform:
                        translate3d(55px,80vh,0)
                        rotate(330deg);
                }

                100% {

                    transform:
                        translate3d(-35px,115vh,0)
                        rotate(470deg);

                    opacity:0;
                }
            }

        `);


        document.documentElement.classList.add(
            "arctic-forest-active"
        );

        document.body.classList.add(
            "autumn-theme"
        );

        createLiveLayer("autumn");
    }


    // =========================================================
    // WINTER
    // =========================================================

    function applyWinter() {

        addStyle(`

            /* =================================================
               WINTER
            ================================================= */

            body,
            body .main,
            body .wrap,
            body .content,
            body .activity {

                background:
                    linear-gradient(
                        180deg,
                        #091B2A 0%,
                        #071522 48%,
                        #040B12 100%
                    ) !important;
            }


            body {

                color:#ffffff !important;
            }


            body .background,
            body .modal,
            body .modal__content,
            body .settings,
            body .menu {

                background:#040B12 !important;
            }


            body .selector.focus {

                outline:none !important;

                background:
                    linear-gradient(
                        135deg,
                        #F5FCFF 0%,
                        #91C9E5 100%
                    ) !important;

                color:#07131B !important;
            }


            body .card.focus {

                box-shadow:
                    0 0 0 2px #A7D9EF !important;
            }


            body .settings__content,
            body .settings__body {

                background:
                    linear-gradient(
                        135deg,
                        rgb(26,47,60),
                        rgb(5,10,15)
                    ) !important;
            }


            body .player-panel__progress,
            body .player-panel__progress-line {

                background:#74C5E5 !important;
            }


            body .extensions,
            body .extensions__item {

                background:#050B11 !important;
            }


            body .extensions__item.focus {

                background:#142733 !important;
            }


            body .torrent-item__badge,
            body .torrent-item__quality {

                color:#E1F1F8 !important;
            }


            body .torrent-item.focus {

                background:
                    rgba(145,201,229,.28) !important;
            }


            body .iptv__item.focus {

                background:#112A36 !important;
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


            /*
             * Очень мягкое холодное свечение.
             * Без горизонтальной яркой полосы.
             */

            .winter-glow {

                position:absolute;

                width:100vw;
                height:100vh;

                left:0;
                top:0;

                background:
                    radial-gradient(
                        ellipse at 50% 18%,
                        rgba(145,215,240,.075),
                        transparent 48%
                    );

                filter:blur(38px);

                opacity:.85;

                animation:
                    winterGlow
                    22s ease-in-out infinite alternate;
            }


            @keyframes winterGlow {

                from {
                    transform:
                        scale(.97);

                    opacity:.55;
                }

                to {
                    transform:
                        scale(1.04);

                    opacity:.85;
                }
            }


            /* =================================================
               WINTER MIST
            ================================================= */

            .winter-mist {

                position:absolute;

                width:75vw;
                height:30vw;

                border-radius:50%;

                filter:blur(80px);

                background:
                    radial-gradient(
                        ellipse,
                        rgba(155,215,235,.24),
                        transparent 70%
                    );

                opacity:.12;
            }


            .winter-mist-1 {

                left:-25vw;
                top:24vh;

                animation:
                    winterMist1
                    34s ease-in-out infinite alternate;
            }


            .winter-mist-2 {

                right:-30vw;
                top:53vh;

                opacity:.09;

                animation:
                    winterMist2
                    44s ease-in-out infinite alternate;
            }


            .winter-mist-3 {

                left:8vw;
                bottom:-18vw;

                opacity:.10;

                animation:
                    winterMist3
                    52s ease-in-out infinite alternate;
            }


            @keyframes winterMist1 {

                from {
                    transform:
                        translateX(-7vw)
                        scale(1);
                }

                to {
                    transform:
                        translateX(17vw)
                        scale(1.16);
                }
            }


            @keyframes winterMist2 {

                from {
                    transform:
                        translateX(7vw)
                        scale(1);
                }

                to {
                    transform:
                        translateX(-18vw)
                        scale(1.18);
                }
            }


            @keyframes winterMist3 {

                from {
                    transform:
                        translate(0,3vh)
                        scale(1);
                }

                to {
                    transform:
                        translate(10vw,-8vh)
                        scale(1.15);
                }
            }


            /* =================================================
               REAL SNOWFLAKES
            ================================================= */

            .winter-snow i {

                position:absolute;

                display:block;

                width:auto;
                height:auto;

                background:none !important;

                border:none !important;

                border-radius:0 !important;

                color:
                    rgba(240,251,255,.88);

                font-family:
                    Arial,
                    sans-serif;

                font-style:normal;

                font-weight:normal;

                line-height:1;

                text-align:center;

                text-shadow:
                    0 0 5px
                    rgba(200,240,255,.70),

                    0 0 11px
                    rgba(140,215,245,.40);

                opacity:0;

                animation:
                    winterSnow
                    linear infinite;
            }


            /* =================================================
               DIFFERENT SNOWFLAKE SIZES
            ================================================= */

            .winter-snow i:nth-child(3n) {

                font-size:9px;

                opacity:.62;
            }


            .winter-snow i:nth-child(3n+1) {

                font-size:14px;

                opacity:.82;
            }


            .winter-snow i:nth-child(5n) {

                font-size:20px;

                opacity:.92;

                text-shadow:
                    0 0 7px
                    rgba(220,248,255,.85),

                    0 0 14px
                    rgba(150,220,245,.45);
            }


            /* =================================================
               SNOW POSITIONS
            ================================================= */

            .winter-snow i:nth-child(1)
            {left:3%;top:-10%;animation-duration:13s;animation-delay:-2s;}

            .winter-snow i:nth-child(2)
            {left:8%;top:-25%;animation-duration:18s;animation-delay:-8s;}

            .winter-snow i:nth-child(3)
            {left:13%;top:-5%;animation-duration:15s;animation-delay:-5s;}

            .winter-snow i:nth-child(4)
            {left:18%;top:-18%;animation-duration:21s;animation-delay:-13s;}

            .winter-snow i:nth-child(5)
            {left:23%;top:-30%;animation-duration:16s;animation-delay:-7s;}

            .winter-snow i:nth-child(6)
            {left:28%;top:-12%;animation-duration:19s;animation-delay:-10s;}

            .winter-snow i:nth-child(7)
            {left:33%;top:-22%;animation-duration:14s;animation-delay:-4s;}

            .winter-snow i:nth-child(8)
            {left:38%;top:-35%;animation-duration:22s;animation-delay:-17s;}

            .winter-snow i:nth-child(9)
            {left:43%;top:-8%;animation-duration:17s;animation-delay:-6s;}

            .winter-snow i:nth-child(10)
            {left:48%;top:-20%;animation-duration:20s;animation-delay:-3s;}

            .winter-snow i:nth-child(11)
            {left:53%;top:-30%;animation-duration:15s;animation-delay:-11s;}

            .winter-snow i:nth-child(12)
            {left:58%;top:-14%;animation-duration:23s;animation-delay:-15s;}

            .winter-snow i:nth-child(13)
            {left:63%;top:-27%;animation-duration:18s;animation-delay:-9s;}

            .winter-snow i:nth-child(14)
            {left:68%;top:-6%;animation-duration:14s;animation-delay:-2s;}

            .winter-snow i:nth-child(15)
            {left:73%;top:-17%;animation-duration:21s;animation-delay:-12s;}

            .winter-snow i:nth-child(16)
            {left:78%;top:-31%;animation-duration:16s;animation-delay:-5s;}

            .winter-snow i:nth-child(17)
            {left:83%;top:-11%;animation-duration:19s;animation-delay:-14s;}

            .winter-snow i:nth-child(18)
            {left:88%;top:-23%;animation-duration:22s;animation-delay:-8s;}

            .winter-snow i:nth-child(19)
            {left:93%;top:-34%;animation-duration:17s;animation-delay:-10s;}

            .winter-snow i:nth-child(20)
            {left:98%;top:-15%;animation-duration:20s;animation-delay:-6s;}

            .winter-snow i:nth-child(21)
            {left:10%;top:-42%;animation-duration:24s;animation-delay:-18s;}

            .winter-snow i:nth-child(22)
            {left:25%;top:-48%;animation-duration:19s;animation-delay:-12s;}

            .winter-snow i:nth-child(23)
            {left:41%;top:-40%;animation-duration:25s;animation-delay:-20s;}

            .winter-snow i:nth-child(24)
            {left:56%;top:-46%;animation-duration:21s;animation-delay:-15s;}

            .winter-snow i:nth-child(25)
            {left:71%;top:-52%;animation-duration:24s;animation-delay:-7s;}

            .winter-snow i:nth-child(26)
            {left:86%;top:-43%;animation-duration:22s;animation-delay:-17s;}

            .winter-snow i:nth-child(27)
            {left:16%;top:-58%;animation-duration:26s;animation-delay:-21s;}

            .winter-snow i:nth-child(28)
            {left:35%;top:-54%;animation-duration:23s;animation-delay:-13s;}

            .winter-snow i:nth-child(29)
            {left:65%;top:-62%;animation-duration:27s;animation-delay:-19s;}

            .winter-snow i:nth-child(30)
            {left:91%;top:-57%;animation-duration:22s;animation-delay:-9s;}

            .winter-snow i:nth-child(31)
            {left:30%;top:-68%;animation-duration:28s;animation-delay:-23s;}

            .winter-snow i:nth-child(32)
            {left:80%;top:-65%;animation-duration:25s;animation-delay:-18s;}

            .winter-snow i:nth-child(33)
            {left:6%;top:-75%;animation-duration:29s;animation-delay:-25s;}

            .winter-snow i:nth-child(34)
            {left:51%;top:-72%;animation-duration:27s;animation-delay:-20s;}

            .winter-snow i:nth-child(35)
            {left:75%;top:-78%;animation-duration:30s;animation-delay:-26s;}

            .winter-snow i:nth-child(36)
            {left:97%;top:-70%;animation-duration:24s;animation-delay:-16s;}

            .winter-snow i:nth-child(37)
            {left:20%;top:-82%;animation-duration:31s;animation-delay:-22s;}

            .winter-snow i:nth-child(38)
            {left:45%;top:-76%;animation-duration:26s;animation-delay:-14s;}

            .winter-snow i:nth-child(39)
            {left:69%;top:-85%;animation-duration:32s;animation-delay:-28s;}

            .winter-snow i:nth-child(40)
            {left:89%;top:-80%;animation-duration:27s;animation-delay:-19s;}

            .winter-snow i:nth-child(41)
            {left:14%;top:-92%;animation-duration:33s;animation-delay:-29s;}

            .winter-snow i:nth-child(42)
            {left:59%;top:-88%;animation-duration:29s;animation-delay:-24s;}

            .winter-snow i:nth-child(43)
            {left:77%;top:-95%;animation-duration:34s;animation-delay:-31s;}

            .winter-snow i:nth-child(44)
            {left:36%;top:-90%;animation-duration:30s;animation-delay:-26s;}

            .winter-snow i:nth-child(45)
            {left:95%;top:-87%;animation-duration:28s;animation-delay:-21s;}


            /* =================================================
               SNOW ANIMATION
            ================================================= */

            @keyframes winterSnow {

                0% {

                    transform:
                        translate3d(0,-15vh,0)
                        rotate(0deg)
                        scale(.85);

                    opacity:0;
                }


                8% {

                    opacity:.85;
                }


                25% {

                    transform:
                        translate3d(45px,25vh,0)
                        rotate(80deg)
                        scale(1);
                }


                50% {

                    transform:
                        translate3d(-55px,52vh,0)
                        rotate(175deg)
                        scale(.95);
                }


                75% {

                    transform:
                        translate3d(65px,80vh,0)
                        rotate(270deg)
                        scale(1.05);
                }


                100% {

                    transform:
                        translate3d(-45px,115vh,0)
                        rotate(380deg)
                        scale(.90);

                    opacity:0;
                }
            }

        `);


        document.documentElement.classList.add(
            "arctic-forest-active"
        );

        document.body.classList.add(
            "winter-theme"
        );

        createLiveLayer("winter");
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

        } else if (currentTheme === "autumn") {

            applyAutumn();

        } else if (currentTheme === "winter") {

            applyWinter();

        } else {

            applyDefault();
        }

        if (currentTheme !== "default") {
            addSeasonMenuIconStyle();
            applySeasonMenuIcon();
        }


        console.log(
            "[Arctic Forest] Theme:",
            currentTheme
        );
    }


    // =========================================================
    // SETTINGS
    // =========================================================

    function settings() {

        try {

            if (!Lampa.SettingsApi) {

                console.error(
                    "[Arctic Forest] SettingsApi unavailable"
                );

                return;
            }


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
                            "🌩️ Буря",

                        autumn:
                            "🍂 Осень",

                        winter:
                            "❄️ Зима"
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
                            currentTheme !== "autumn" &&
                            currentTheme !== "winter" &&
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

                                            : currentTheme === "autumn"
                                                ? "Осень"

                                                : currentTheme === "winter"
                                                    ? "Зима"

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
    // HORROR ROW — MAIN SCREEN
    // =========================================================
    //
    // Unlike ContentRows.add(), this hooks the TMDB main loader itself.
    // Lampa's native TMDB main() prepends several system rows after
    // ContentRows.call(), so a ContentRows row cannot be guaranteed to be
    // the first row. We load the horror row first and only then start the
    // native TMDB main loader. This keeps the order deterministic without
    // touching the DOM.

    var HORROR_ROW_NAME = "arctic_forest_horror_row";
    var HORROR_GENRE = "27";
    var HORROR_PATCH_FLAG = "__arctic_forest_horror_main_patched";

    function horrorToday() {
        var d = new Date();
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, "0");
        var day = String(d.getDate()).padStart(2, "0");
        return y + "-" + m + "-" + day;
    }

    function horrorMoreData(data) {
        data = data || {};

        data.title = "Ужасы";
        data.url = "movie";
        data.genres = HORROR_GENRE;
        data.sort_by = "primary_release_date.desc";
        data.filter = {
            "primary_release_date.lte": horrorToday()
        };
        data.source = "tmdb";

        if (Lampa.Maker && Lampa.Maker.module) {
            try {
                var Line = Lampa.Maker.module("Line");
                if (Line && Line.toggle) {
                    data.params = {
                        module: Line.toggle(Line.MASK.base, "More")
                    };
                }
            } catch (e) {}
        }

        return data;
    }

    function loadHorrorRow(done, fail) {
        try {
            var tmdb = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;

            if (!tmdb || typeof tmdb.get !== "function") {
                if (fail) fail();
                return;
            }

            tmdb.get(
                "discover/movie?with_genres=" + HORROR_GENRE,
                {
                    sort_by: "primary_release_date.desc",
                    filter: {
                        "primary_release_date.lte": horrorToday()
                    }
                },
                function (data) {
                    done(horrorMoreData(data));
                },
                function () {
                    if (fail) fail();
                },
                { life: 60 * 24 }
            );
        } catch (e) {
            console.error("[Arctic Forest] Horror load error:", e);
            if (fail) fail();
        }
    }

    function patchHorrorMain() {
        try {
            if (window[HORROR_PATCH_FLAG]) return true;

            var tmdb = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;

            if (!tmdb || typeof tmdb.main !== "function") {
                console.warn("[Arctic Forest] TMDB main() unavailable");
                return false;
            }

            var originalMain = tmdb.main;

            tmdb.main = function (params, oncomplite, onerror) {
                var started = false;
                var nativeLoader = null;

                function startNative() {
                    if (started) return nativeLoader;
                    started = true;

                    try {
                        nativeLoader = originalMain.call(tmdb, params, oncomplite, onerror);
                        return nativeLoader;
                    } catch (e) {
                        console.error("[Arctic Forest] Native TMDB main error:", e);
                        if (onerror) onerror();
                    }
                }

                // The first callback emitted here becomes the first visual
                // row. Only after it is emitted do we start native TMDB rows.
                loadHorrorRow(function (horror) {
                    try {
                        if (oncomplite) oncomplite(horror);
                    } finally {
                        startNative();
                    }
                }, function () {
                    // If TMDB fails for the custom row, never block Lampa's
                    // home screen: fall back to the native loader.
                    startNative();
                });

                // Native main() normally returns a loadPart function. We do
                // not have that function until the native loader starts, so
                // return a harmless loader that triggers the native fallback.
                return function () {
                    if (typeof nativeLoader === "function") {
                        return nativeLoader.apply(null, arguments);
                    }
                };
            };

            window[HORROR_PATCH_FLAG] = true;
            console.log("[Arctic Forest] Horror main hook installed");
            return true;

        } catch (e) {
            console.error("[Arctic Forest] Horror main hook error:", e);
            return false;
        }
    }

    function registerHorrorRow() {
        // Kept as a separate function so startup remains compatible with
        // previous plugin versions. The actual ordering is handled by the
        // TMDB main hook above, not by DOM manipulation or ContentRows.
        patchHorrorMain();
    }

    // =========================================================
    // START
    // =========================================================

    function startPlugin() {

        console.log(
            "[Arctic Forest] Starting..."
        );


        loadTheme();


        settings();


        registerHorrorRow();


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
