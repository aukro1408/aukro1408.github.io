(function () {
    "use strict";

    // =========================================================
    // IPTV FOR LAMPA — 2.1
    // =========================================================

    const PLUGIN = {
        component: "simple_iptv",
        name: "IPTV",

        icon: `<svg xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <polyline points="16 21 12 17 8 21"/>
            <line x1="12" y1="15" x2="12" y2="21"/>
        </svg>`
    };

    // =========================================================
    // STORAGE
    // =========================================================

    const STORAGE = {
        playlist: PLUGIN.component + "_url",
        epg: PLUGIN.component + "_epg",
        favorites: PLUGIN.component + "_favorites",
        history: PLUGIN.component + "_history",
        cache: PLUGIN.component + "_cache",
        epgCache: PLUGIN.component + "_epg_cache"
    };

    const DEFAULT_PLAYLIST =
        "https://iptv-org.github.io/iptv/index.m3u";

    function storageGet(key, fallback) {
        try {
            const value = Lampa.Storage.get(key, null);

            if (
                value !== null &&
                value !== undefined &&
                value !== ""
            ) {
                return value;
            }
        } catch (e) {}

        try {
            const local = localStorage.getItem(key);

            if (
                local !== null &&
                local !== undefined
            ) {
                try {
                    return JSON.parse(local);
                } catch (e) {
                    return local;
                }
            }
        } catch (e) {}

        return fallback;
    }

    function storageSet(key, value) {
        try {
            Lampa.Storage.set(key, value);
        } catch (e) {}

        try {
            localStorage.setItem(
                key,
                typeof value === "string"
                    ? value
                    : JSON.stringify(value)
            );
        } catch (e) {}
    }

    function getPlaylistUrl() {
        return String(
            storageGet(STORAGE.playlist, "") || ""
        ).trim();
    }

    function setPlaylistUrl(value) {
        storageSet(
            STORAGE.playlist,
            String(value || "").trim()
        );
    }

    function getEpgUrl() {
        return String(
            storageGet(STORAGE.epg, "") || ""
        ).trim();
    }

    function setEpgUrl(value) {
        storageSet(
            STORAGE.epg,
            String(value || "").trim()
        );
    }

    // =========================================================
    // FAVORITES
    // =========================================================

    function getFavorites() {
        const value = storageGet(
            STORAGE.favorites,
            []
        );

        return Array.isArray(value)
            ? value
            : [];
    }

    function saveFavorites(value) {
        storageSet(
            STORAGE.favorites,
            value
        );
    }

    function isFavorite(id) {
        return (
            getFavorites().indexOf(id) !== -1
        );
    }

    function toggleFavorite(id) {
        let favorites =
            getFavorites();

        const index =
            favorites.indexOf(id);

        if (index !== -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(id);
        }

        saveFavorites(favorites);

        return (
            favorites.indexOf(id) !== -1
        );
    }

    // =========================================================
    // HISTORY
    // =========================================================

    function getHistory() {
        const value = storageGet(
            STORAGE.history,
            []
        );

        return Array.isArray(value)
            ? value
            : [];
    }

    function saveHistory(value) {
        storageSet(
            STORAGE.history,
            value
        );
    }

    function addHistory(channel) {
        if (!channel) return;

        const id =
            channel.id ||
            channel.tvgId ||
            channel.title;

        if (!id) return;

        let history =
            getHistory();

        history = history.filter(
            function (item) {
                return item.id !== id;
            }
        );

        history.unshift({
            id: id,
            title: channel.title,
            url: channel.url,
            logo: channel.logo || "",
            group: channel.group || "",
            tvgId: channel.tvgId || ""
        });

        history =
            history.slice(0, 30);

        saveHistory(history);
    }

    // =========================================================
    // CACHE
    // =========================================================

    function savePlaylistCache(
        channels
    ) {
        try {
            storageSet(
                STORAGE.cache,
                {
                    timestamp: Date.now(),
                    data: channels
                }
            );
        } catch (e) {}
    }

    function getPlaylistCache() {
        try {
            const cache =
                storageGet(
                    STORAGE.cache,
                    null
                );

            if (
                cache &&
                Array.isArray(cache.data)
            ) {
                return cache;
            }
        } catch (e) {}

        return null;
    }

    function saveEpgCache(epg) {
        try {
            /*
             * Date превращаем в timestamp,
             * чтобы JSON-хранилище не ломало EPG.
             */

            const prepared = {};

            Object.keys(epg || {})
                .forEach(function (id) {
                    prepared[id] =
                        (epg[id] || [])
                            .map(function (item) {
                                return {
                                    channel:
                                        item.channel,

                                    title:
                                        item.title,

                                    description:
                                        item.description,

                                    categories:
                                        item.categories,

                                    start:
                                        item.start
                                            ? item.start.getTime()
                                            : 0,

                                    stop:
                                        item.stop
                                            ? item.stop.getTime()
                                            : 0
                                };
                            });
                });

            storageSet(
                STORAGE.epgCache,
                {
                    timestamp: Date.now(),
                    data: prepared
                }
            );
        } catch (e) {}
    }

    function getEpgCache() {
        try {
            const cache =
                storageGet(
                    STORAGE.epgCache,
                    null
                );

            if (
                !cache ||
                !cache.data
            ) {
                return null;
            }

            const result = {};

            Object.keys(cache.data)
                .forEach(function (id) {
                    result[id] =
                        (cache.data[id] || [])
                            .map(function (item) {
                                return {
                                    channel:
                                        item.channel,

                                    title:
                                        item.title,

                                    description:
                                        item.description,

                                    categories:
                                        item.categories,

                                    start:
                                        new Date(
                                            item.start
                                        ),

                                    stop:
                                        new Date(
                                            item.stop
                                        )
                                };
                            })
                            .filter(function (item) {
                                return (
                                    !isNaN(
                                        item.start.getTime()
                                    ) &&
                                    !isNaN(
                                        item.stop.getTime()
                                    )
                                );
                            });
                });

            return result;
        } catch (e) {
            return null;
        }
    }

    // =========================================================
    // HELPERS
    // =========================================================

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function decodeHtml(value) {
        try {
            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.innerHTML =
                value || "";

            return textarea.value;
        } catch (e) {
            return String(
                value || ""
            );
        }
    }

    function normalizeId(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    function getChannelId(channel) {
        return (
            channel.id ||
            channel.tvgId ||
            channel.tvgName ||
            channel.title
        );
    }

    function formatTime(date) {
        if (
            !date ||
            isNaN(date.getTime())
        ) {
            return "--:--";
        }

        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }

    function formatDate(date) {
        if (
            !date ||
            isNaN(date.getTime())
        ) {
            return "";
        }

        return date.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "2-digit"
            }
        );
    }

    function parseXmltvDate(value) {
        if (!value) return null;

        const string =
            String(value).trim();

        const match =
            string.match(
                /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/
            );

        if (match) {
            const year =
                Number(match[1]);

            const month =
                Number(match[2]) - 1;

            const day =
                Number(match[3]);

            const hour =
                Number(match[4]);

            const minute =
                Number(match[5]);

            const second =
                Number(match[6]);

            const timezone =
                string
                    .substring(14)
                    .trim();

            if (
                /^[+-]\d{4}$/.test(
                    timezone
                )
            ) {
                const sign =
                    timezone.charAt(0) === "-"
                        ? -1
                        : 1;

                const tzHour =
                    Number(
                        timezone.substring(
                            1,
                            3
                        )
                    );

                const tzMinute =
                    Number(
                        timezone.substring(
                            3,
                            5
                        )
                    );

                const utc =
                    Date.UTC(
                        year,
                        month,
                        day,
                        hour,
                        minute,
                        second
                    ) -
                    sign *
                        (
                            (
                                tzHour *
                                    60 +
                                tzMinute
                            ) *
                            60000
                        );

                return new Date(
                    utc
                );
            }

            return new Date(
                year,
                month,
                day,
                hour,
                minute,
                second
            );
        }

        const parsed =
            new Date(string);

        return isNaN(
            parsed.getTime()
        )
            ? null
            : parsed;
    }

    // =========================================================
    // NETWORK
    // =========================================================

    /*
     * ВАЖНО:
     *
     * Lampa.Reguest.silent имеет сигнатуру:
     *
     * silent(url, success, error, post_data, params)
     *
     * dataType и timeout должны находиться
     * именно в ПЯТОМ аргументе.
     */

    function request(
        url,
        success,
        error,
        options
    ) {
        try {
            const network =
                new Lampa.Reguest();

            options =
                options || {};

            if (
                options.timeout
            ) {
                network.timeout(
                    options.timeout
                );
            }

            network.silent(
                url,

                success,

                error,

                false,

                {
                    dataType:
                        options.dataType ||
                        "text",

                    timeout:
                        options.timeout ||
                        30000,

                    headers:
                        options.headers ||
                        undefined
                }
            );

            return network;
        } catch (e) {
            console.error(
                "[IPTV] Request error:",
                e
            );

            if (error) {
                error(e);
            }

            return null;
        }
    }

    // =========================================================
    // M3U PARSER
    // =========================================================

    function parseM3U(data) {
        const channels = [];

        const lines =
            String(data || "")
                .split(/\r?\n/);

        let current =
            null;

        let currentGroup =
            "Без группы";

        let epgUrl =
            "";

        for (
            let i = 0;
            i < lines.length;
            i++
        ) {
            const line =
                lines[i].trim();

            if (!line) continue;

            // -------------------------------------------------
            // EXTM3U
            // -------------------------------------------------

            if (
                line
                    .toUpperCase()
                    .indexOf("#EXTM3U") === 0
            ) {
                const epgMatch =
                    line.match(
                        /(?:url-tvg|x-tvg-url)\s*=\s*["']([^"']+)["']/i
                    );

                if (epgMatch) {
                    epgUrl =
                        epgMatch[1];
                }

                continue;
            }

            // -------------------------------------------------
            // EXTGRP
            // -------------------------------------------------

            const groupMatch =
                line.match(
                    /^#EXTGRP:\s*(.+?)\s*$/i
                );

            if (groupMatch) {
                currentGroup =
                    groupMatch[1].trim() ||
                    "Без группы";

                continue;
            }

            // -------------------------------------------------
            // EXTINF
            // -------------------------------------------------

            if (
                line
                    .toUpperCase()
                    .indexOf("#EXTINF:") === 0
            ) {
                const comma =
                    line.indexOf(",");

                if (
                    comma === -1
                ) {
                    continue;
                }

                const info =
                    line.substring(
                        8,
                        comma
                    );

                const title =
                    line
                        .substring(
                            comma + 1
                        )
                        .trim();

                const params =
                    {};

                const regex =
                    /([^\s=]+)=((["'])(.*?)\3|\S+)/g;

                let match;

                while (
                    (match =
                        regex.exec(
                            info
                        )) !== null
                ) {
                    params[
                        String(
                            match[1]
                        ).toLowerCase()
                    ] =
                        match[4] !==
                        undefined
                            ? match[4]
                            : match[2];
                }

                const tvgId =
                    params[
                        "tvg-id"
                    ] ||
                    params[
                        "tvgid"
                    ] ||
                    "";

                const tvgName =
                    params[
                        "tvg-name"
                    ] ||
                    "";

                const group =
                    params[
                        "group-title"
                    ] ||
                    currentGroup ||
                    "Без группы";

                current = {
                    id:
                        tvgId ||
                        tvgName ||
                        title,

                    tvgId:
                        tvgId,

                    tvgName:
                        tvgName,

                    title:
                        title,

                    group:
                        group,

                    logo:
                        params[
                            "tvg-logo"
                        ] ||
                        params[
                            "logo"
                        ] ||
                        "",

                    language:
                        params[
                            "tvg-language"
                        ] ||
                        "",

                    country:
                        params[
                            "tvg-country"
                        ] ||
                        "",

                    url:
                        ""
                };

                continue;
            }

            // -------------------------------------------------
            // CHANNEL URL
            // -------------------------------------------------

            if (
                current &&
                /^(https?|rtmp|rtsp):\/\//i.test(
                    line
                )
            ) {
                current.url =
                    line;

                channels.push(
                    current
                );

                current = null;
            }
        }

        return {
            channels:
                channels,

            epgUrl:
                epgUrl
        };
    }

    // =========================================================
    // LOAD M3U
    // =========================================================

    function loadPlaylist(
        url
    ) {
        return new Promise(
            function (
                resolve,
                reject
            ) {
                if (!url) {
                    reject(
                        new Error(
                            "URL плейлиста не указан"
                        )
                    );

                    return;
                }

                request(
                    url,

                    function (data) {
                        try {
                            const parsed =
                                parseM3U(
                                    data
                                );

                            if (
                                !parsed
                                    .channels
                                    .length
                            ) {
                                reject(
                                    new Error(
                                        "В M3U не найдено ни одного канала"
                                    )
                                );

                                return;
                            }

                            resolve(
                                parsed
                            );
                        } catch (e) {
                            reject(
                                new Error(
                                    "Ошибка разбора M3U: " +
                                        e.message
                                )
                            );
                        }
                    },

                    function (
                        error
                    ) {
                        console.error(
                            "[IPTV] M3U error:",
                            error
                        );

                        reject(
                            new Error(
                                "Не удалось загрузить M3U"
                            )
                        );
                    },

                    {
                        dataType:
                            "text",

                        timeout:
                            45000
                    }
                );
            }
        );
    }

    // =========================================================
    // XMLTV
    // =========================================================

    function parseXMLTV(
        xml
    ) {
        const result =
            {};

        try {
            const parser =
                new DOMParser();

            const doc =
                parser.parseFromString(
                    String(
                        xml || ""
                    ),
                    "text/xml"
                );

            const error =
                doc.querySelector(
                    "parsererror"
                );

            if (error) {
                console.error(
                    "[IPTV] XMLTV parser error"
                );

                return result;
            }

            const programmes =
                doc.querySelectorAll(
                    "programme"
                );

            programmes.forEach(
                function (
                    node
                ) {
                    const channelId =
                        node.getAttribute(
                            "channel"
                        );

                    if (!channelId) {
                        return;
                    }

                    const id =
                        normalizeId(
                            channelId
                        );

                    if (
                        !result[id]
                    ) {
                        result[id] =
                            [];
                    }

                    const titleNode =
                        node.querySelector(
                            "title"
                        );

                    const descNode =
                        node.querySelector(
                            "desc"
                        );

                    const categories =
                        [];

                    node.querySelectorAll(
                        "category"
                    ).forEach(
                        function (
                            category
                        ) {
                            categories.push(
                                decodeHtml(
                                    category.textContent
                                ).trim()
                            );
                        }
                    );

                    const start =
                        parseXmltvDate(
                            node.getAttribute(
                                "start"
                            )
                        );

                    const stop =
                        parseXmltvDate(
                            node.getAttribute(
                                "stop"
                            )
                        );

                    if (
                        !start ||
                        !stop
                    ) {
                        return;
                    }

                    result[id].push(
                        {
                            channel:
                                channelId,

                            title:
                                titleNode
                                    ? decodeHtml(
                                          titleNode.textContent
                                      ).trim()
                                    : "Без названия",

                            description:
                                descNode
                                    ? decodeHtml(
                                          descNode.textContent
                                      ).trim()
                                    : "",

                            categories:
                                categories,

                            start:
                                start,

                            stop:
                                stop
                        }
                    );
                }
            );

            Object.keys(
                result
            ).forEach(
                function (
                    id
                ) {
                    result[id].sort(
                        function (
                            a,
                            b
                        ) {
                            return (
                                a.start -
                                b.start
                            );
                        }
                    );
                }
            );
        } catch (e) {
            console.error(
                "[IPTV] XMLTV:",
                e
            );
        }

        return result;
    }

    function loadEPG(
        url
    ) {
        return new Promise(
            function (
                resolve
            ) {
                if (!url) {
                    resolve(
                        {}
                    );

                    return;
                }

                request(
                    url,

                    function (
                        data
                    ) {
                        try {
                            resolve(
                                parseXMLTV(
                                    data
                                )
                            );
                        } catch (e) {
                            console.error(
                                "[IPTV] EPG parse:",
                                e
                            );

                            resolve(
                                {}
                            );
                        }
                    },

                    function (
                        error
                    ) {
                        console.warn(
                            "[IPTV] EPG unavailable:",
                            error
                        );

                        resolve(
                            {}
                        );
                    },

                    {
                        dataType:
                            "text",

                        timeout:
                            60000
                    }
                );
            }
        );
    }

    // =========================================================
    // EPG HELPERS
    // =========================================================

    function getChannelEPG(
        channel,
        epg
    ) {
        if (!epg) {
            return [];
        }

        const ids = [
            channel.tvgId,
            channel.tvgName,
            channel.id,
            channel.title
        ];

        for (
            let i = 0;
            i < ids.length;
            i++
        ) {
            const id =
                normalizeId(
                    ids[i]
                );

            if (
                id &&
                epg[id] &&
                epg[id].length
            ) {
                return epg[id];
            }
        }

        return [];
    }

    function getCurrentProgramme(
        channel,
        epg
    ) {
        const list =
            getChannelEPG(
                channel,
                epg
            );

        const now =
            Date.now();

        for (
            let i = 0;
            i < list.length;
            i++
        ) {
            const item =
                list[i];

            if (
                item.start.getTime() <=
                    now &&
                item.stop.getTime() >
                    now
            ) {
                return item;
            }
        }

        return null;
    }

    function getNextProgramme(
        channel,
        epg
    ) {
        const list =
            getChannelEPG(
                channel,
                epg
            );

        const now =
            Date.now();

        for (
            let i = 0;
            i < list.length;
            i++
        ) {
            if (
                list[i]
                    .start
                    .getTime() >
                now
            ) {
                return list[i];
            }
        }

        return null;
    }

    function getProgrammeProgress(
        programme
    ) {
        if (!programme) {
            return 0;
        }

        const start =
            programme.start.getTime();

        const stop =
            programme.stop.getTime();

        const now =
            Date.now();

        if (now <= start) {
            return 0;
        }

        if (now >= stop) {
            return 100;
        }

        return Math.round(
            (
                (now - start) /
                (stop - start)
            ) *
                100
        );
    }

    // =========================================================
    // GROUPS
    // =========================================================

    function groupChannels(
        channels
    ) {
        const groups =
            {};

        channels.forEach(
            function (
                channel
            ) {
                const name =
                    channel.group ||
                    "Без группы";

                if (
                    !groups[name]
                ) {
                    groups[name] =
                        [];
                }

                groups[name].push(
                    channel
                );
            }
        );

        return groups;
    }

    // =========================================================
    // IPTV PAGE
    // =========================================================

    function IPTVPage(
        object
    ) {
        let channels =
            [];

        let catalog =
            {};

        let epg =
            {};

        let playlistEpgUrl =
            "";

        let currentGroup =
            null;

        let currentView =
            "groups";

        let searchQuery =
            "";

        let destroyed =
            false;

        let refreshTimer =
            null;

        // =====================================================
        // CREATE
        // =====================================================

        this.create =
            function () {
                const html =
                    $(`
                    <div class="${PLUGIN.component}-container">

                        <div class="${PLUGIN.component}-top">

                            <div class="${PLUGIN.component}-title">

                                <div class="${PLUGIN.component}-title-main">
                                    <span class="${PLUGIN.component}-title-icon">
                                        📺
                                    </span>
                                    IPTV
                                </div>

                                <div
                                    class="${PLUGIN.component}-status"
                                    id="${PLUGIN.component}-status">
                                    Загрузка...
                                </div>

                            </div>

                            <div class="${PLUGIN.component}-toolbar">

                                <button
                                    class="${PLUGIN.component}-tool selector"
                                    id="${PLUGIN.component}-favorites">
                                    ⭐ Избранное
                                </button>

                                <button
                                    class="${PLUGIN.component}-tool selector"
                                    id="${PLUGIN.component}-history">
                                    🕘 Недавние
                                </button>

                                <button
                                    class="${PLUGIN.component}-tool selector"
                                    id="${PLUGIN.component}-search-button">
                                    🔎 Поиск
                                </button>

                            </div>

                        </div>

                        <div
                            class="${PLUGIN.component}-search"
                            id="${PLUGIN.component}-search"
                            style="display:none;">

                            <input
                                class="${PLUGIN.component}-search-input"
                                id="${PLUGIN.component}-search-input"
                                type="text"
                                placeholder="Название канала..."
                                autocomplete="off"
                            />

                            <button
                                class="${PLUGIN.component}-search-clear selector"
                                id="${PLUGIN.component}-search-clear">
                                ×
                            </button>

                        </div>

                        <div
                            class="${PLUGIN.component}-scroll"
                            id="${PLUGIN.component}-scroll">

                            <div
                                class="${PLUGIN.component}-loading"
                                id="${PLUGIN.component}-loading">

                                <div class="${PLUGIN.component}-spinner"></div>

                                <div>
                                    Загрузка каналов...
                                </div>

                            </div>

                            <div
                                class="${PLUGIN.component}-content"
                                id="${PLUGIN.component}-content"
                                style="display:none;">
                            </div>

                        </div>

                    </div>
                `);

                bindToolbar(
                    html
                );

                loadData();

                return html;
            };

        // =====================================================
        // TOOLBAR
        // =====================================================

        function bindToolbar(
            html
        ) {
            const root =
                html[0];

            const searchButton =
                root.querySelector(
                    "#" +
                        PLUGIN.component +
                        "-search-button"
                );

            const favoritesButton =
                root.querySelector(
                    "#" +
                        PLUGIN.component +
                        "-favorites"
                );

            const historyButton =
                root.querySelector(
                    "#" +
                        PLUGIN.component +
                        "-history"
                );

            const searchBox =
                root.querySelector(
                    "#" +
                        PLUGIN.component +
                        "-search"
                );

            const searchInput =
                root.querySelector(
                    "#" +
                        PLUGIN.component +
                        "-search-input"
                );

            const clearButton =
                root.querySelector(
                    "#" +
                        PLUGIN.component +
                        "-search-clear"
                );

            function toggleSearch() {
                if (
                    searchBox.style
                        .display ===
                    "none"
                ) {
                    searchBox.style.display =
                        "flex";

                    setTimeout(
                        function () {
                            try {
                                searchInput.focus();
                            } catch (e) {}
                        },
                        100
                    );
                } else {
                    searchBox.style.display =
                        "none";

                    searchQuery =
                        "";

                    searchInput.value =
                        "";

                    renderCurrent();
                }
            }

            const searchAction =
                function (e) {
                    e.stopPropagation();

                    toggleSearch();
                };

            $(searchButton).on(
                "hover:enter",
                searchAction
            );

            searchButton.addEventListener(
                "click",
                searchAction
            );

            const favoritesAction =
                function (e) {
                    e.stopPropagation();

                    showFavorites();
                };

            $(favoritesButton).on(
                "hover:enter",
                favoritesAction
            );

            favoritesButton.addEventListener(
                "click",
                favoritesAction
            );

            const historyAction =
                function (e) {
                    e.stopPropagation();

                    showHistory();
                };

            $(historyButton).on(
                "hover:enter",
                historyAction
            );

            historyButton.addEventListener(
                "click",
                historyAction
            );

            searchInput.addEventListener(
                "input",
                function () {
                    searchQuery =
                        this.value
                            .trim()
                            .toLowerCase();

                    if (
                        currentView ===
                        "channels"
                    ) {
                        renderChannels(
                            currentGroup
                        );
                    }
                }
            );

            const clearAction =
                function (e) {
                    e.stopPropagation();

                    searchInput.value =
                        "";

                    searchQuery =
                        "";

                    renderCurrent();
                };

            $(clearButton).on(
                "hover:enter",
                clearAction
            );

            clearButton.addEventListener(
                "click",
                clearAction
            );
        }

        // =====================================================
        // LOAD DATA
        // =====================================================

        async function loadData() {
            let url =
                getPlaylistUrl();

            if (!url) {
                url =
                    DEFAULT_PLAYLIST;

                setPlaylistUrl(
                    url
                );
            }

            showLoading(
                "Загрузка M3U..."
            );

            try {
                const parsed =
                    await loadPlaylist(
                        url
                    );

                channels =
                    parsed.channels;

                playlistEpgUrl =
                    parsed.epgUrl ||
                    "";

                catalog =
                    groupChannels(
                        channels
                    );

                savePlaylistCache(
                    channels
                );

                /*
                 * Если EPG URL задан в настройках —
                 * используем его.
                 *
                 * Если нет —
                 * используем url-tvg из M3U.
                 */

                let epgUrl =
                    getEpgUrl();

                if (!epgUrl) {
                    epgUrl =
                        playlistEpgUrl;
                }

                if (epgUrl) {
                    showLoading(
                        "Загрузка программы передач..."
                    );

                    const loaded =
                        await loadEPG(
                            epgUrl
                        );

                    if (
                        loaded &&
                        Object.keys(
                            loaded
                        ).length
                    ) {
                        epg =
                            loaded;

                        saveEpgCache(
                            epg
                        );
                    } else {
                        const cached =
                            getEpgCache();

                        if (
                            cached
                        ) {
                            epg =
                                cached;
                        }
                    }
                } else {
                    const cached =
                        getEpgCache();

                    if (
                        cached
                    ) {
                        epg =
                            cached;
                    }
                }

                showGroups();

                startEPGRefresh();

            } catch (error) {
                console.error(
                    "[IPTV] Load:",
                    error
                );

                /*
                 * При ошибке сети используем M3U из кэша.
                 */

                const cache =
                    getPlaylistCache();

                if (
                    cache &&
                    Array.isArray(
                        cache.data
                    ) &&
                    cache.data.length
                ) {
                    channels =
                        cache.data;

                    catalog =
                        groupChannels(
                            channels
                        );

                    const cachedEpg =
                        getEpgCache();

                    if (
                        cachedEpg
                    ) {
                        epg =
                            cachedEpg;
                    }

                    showGroups();

                    notify(
                        "Используется сохранённый плейлист"
                    );

                    startEPGRefresh();

                    return;
                }

                showError(
                    error &&
                    error.message
                        ? error.message
                        : "Не удалось загрузить плейлист"
                );
            }
        }

        // =====================================================
        // LOADING
        // =====================================================

        function showLoading(
            text
        ) {
            if (
                destroyed
            ) {
                return;
            }

            const loading =
                document.getElementById(
                    PLUGIN.component +
                        "-loading"
                );

            const content =
                document.getElementById(
                    PLUGIN.component +
                        "-content"
                );

            if (loading) {
                loading.style.display =
                    "flex";

                loading.innerHTML = `
                    <div class="${PLUGIN.component}-spinner"></div>
                    <div>
                        ${escapeHtml(
                            text
                        )}
                    </div>
                `;
            }

            if (content) {
                content.style.display =
                    "none";
            }
        }

        // =====================================================
        // GROUPS
        // =====================================================

        function showGroups() {
            if (
                destroyed
            ) {
                return;
            }

            currentView =
                "groups";

            currentGroup =
                null;

            const content =
                getContent();

            if (!content) {
                return;
            }

            const groupNames =
                Object.keys(
                    catalog
                );

            updateStatus(
                channels.length +
                    " каналов • " +
                    groupNames.length +
                    " групп"
            );

            let html = `
                <div class="${PLUGIN.component}-section">

                    <div class="${PLUGIN.component}-section-title">
                        Все каналы
                    </div>

                    <div class="${PLUGIN.component}-quick-grid">

                        <div
                            class="${PLUGIN.component}-quick selector"
                            data-action="all">

                            <div class="${PLUGIN.component}-quick-icon">
                                📺
                            </div>

                            <div>
                                <b>Все каналы</b>
                                <small>
                                    ${channels.length}
                                </small>
                            </div>

                        </div>

                        <div
                            class="${PLUGIN.component}-quick selector"
                            data-action="favorites">

                            <div class="${PLUGIN.component}-quick-icon">
                                ⭐
                            </div>

                            <div>
                                <b>Избранное</b>
                                <small>
                                    ${getFavorites().length}
                                </small>
                            </div>

                        </div>

                        <div
                            class="${PLUGIN.component}-quick selector"
                            data-action="history">

                            <div class="${PLUGIN.component}-quick-icon">
                                🕘
                            </div>

                            <div>
                                <b>Недавние</b>
                                <small>
                                    ${getHistory().length}
                                </small>
                            </div>

                        </div>

                    </div>

                    <div class="${PLUGIN.component}-section-title">
                        Группы
                    </div>

                    <div class="${PLUGIN.component}-groups">
            `;

            groupNames.forEach(
                function (
                    name
                ) {
                    html += `
                        <div
                            class="${PLUGIN.component}-group selector"
                            data-group="${escapeHtml(
                                name
                            )}">

                            <div class="${PLUGIN.component}-group-icon">
                                📁
                            </div>

                            <div class="${PLUGIN.component}-group-main">

                                <div class="${PLUGIN.component}-group-name">
                                    ${escapeHtml(
                                        name
                                    )}
                                </div>

                                <div class="${PLUGIN.component}-group-count">
                                    ${
                                        catalog[
                                            name
                                        ].length
                                    } каналов
                                </div>

                            </div>

                            <div class="${PLUGIN.component}-group-arrow">
                                ›
                            </div>

                        </div>
                    `;
                }
            );

            html += `
                    </div>
                </div>
            `;

            content.innerHTML =
                html;

            showContent();

            bindGroups(
                content
            );
        }

        function bindGroups(
            content
        ) {
            content
                .querySelectorAll(
                    "." +
                        PLUGIN.component +
                        "-group"
                )
                .forEach(
                    function (
                        element
                    ) {
                        const name =
                            element.dataset
                                .group;

                        const action =
                            function (e) {
                                e.stopPropagation();

                                showChannels(
                                    name
                                );
                            };

                        $(element).on(
                            "hover:enter",
                            action
                        );

                        element.addEventListener(
                            "click",
                            action
                        );
                    }
                );

            content
                .querySelectorAll(
                    "." +
                        PLUGIN.component +
                        "-quick"
                )
                .forEach(
                    function (
                        element
                    ) {
                        const actionName =
                            element.dataset
                                .action;

                        const action =
                            function (e) {
                                e.stopPropagation();

                                if (
                                    actionName ===
                                    "all"
                                ) {
                                    showChannels(
                                        null
                                    );
                                }

                                if (
                                    actionName ===
                                    "favorites"
                                ) {
                                    showFavorites();
                                }

                                if (
                                    actionName ===
                                    "history"
                                ) {
                                    showHistory();
                                }
                            };

                        $(element).on(
                            "hover:enter",
                            action
                        );

                        element.addEventListener(
                            "click",
                            action
                        );
                    }
                );
        }

        // =====================================================
        // CHANNELS
        // =====================================================

        function showChannels(
            groupName
        ) {
            currentView =
                "channels";

            currentGroup =
                groupName;

            renderChannels(
                groupName
            );
        }

        function renderChannels(
            groupName
        ) {
            const content =
                getContent();

            if (!content) {
                return;
            }

            let list;

            if (groupName) {
                list =
                    (
                        catalog[
                            groupName
                        ] || []
                    ).slice();
            } else {
                list =
                    channels.slice();
            }

            if (searchQuery) {
                list =
                    list.filter(
                        function (
                            channel
                        ) {
                            const title =
                                String(
                                    channel.title ||
                                        ""
                                ).toLowerCase();

                            const group =
                                String(
                                    channel.group ||
                                        ""
                                ).toLowerCase();

                            const tvg =
                                String(
                                    channel.tvgId ||
                                        ""
                                ).toLowerCase();

                            return (
                                title.indexOf(
                                    searchQuery
                                ) !== -1 ||
                                group.indexOf(
                                    searchQuery
                                ) !== -1 ||
                                tvg.indexOf(
                                    searchQuery
                                ) !== -1
                            );
                        }
                    );
            }

            updateStatus(
                (
                    groupName ||
                    "Все каналы"
                ) +
                    " • " +
                    list.length
            );

            let html = `
                <div class="${PLUGIN.component}-channel-page">

                    <div class="${PLUGIN.component}-channel-header">

                        <button
                            class="${PLUGIN.component}-back selector">
                            ← Назад
                        </button>

                        <div class="${PLUGIN.component}-channel-header-title">
                            ${
                                groupName
                                    ? escapeHtml(
                                          groupName
                                      )
                                    : "Все каналы"
                            }
                        </div>

                        <div class="${PLUGIN.component}-channel-header-count">
                            ${list.length}
                        </div>

                    </div>

                    <div class="${PLUGIN.component}-channel-list">
            `;

            if (!list.length) {
                html += `
                    <div class="${PLUGIN.component}-empty">
                        <div>🔎</div>
                        <span>
                            Каналы не найдены
                        </span>
                    </div>
                `;
            } else {
                list.forEach(
                    function (
                        channel,
                        index
                    ) {
                        html +=
                            renderChannel(
                                channel,
                                index
                            );
                    }
                );
            }

            html += `
                    </div>
                </div>
            `;

            content.innerHTML =
                html;

            showContent();

            bindChannelPage(
                content
            );
        }

        function renderChannel(
            channel,
            index
        ) {
            const id =
                getChannelId(
                    channel
                );

            const favorite =
                isFavorite(id);

            const current =
                getCurrentProgramme(
                    channel,
                    epg
                );

            const next =
                getNextProgramme(
                    channel,
                    epg
                );

            const progress =
                getProgrammeProgress(
                    current
                );

            const logo =
                channel.logo
                    ? `
                        <img
                            src="${escapeHtml(
                                channel.logo
                            )}"
                            loading="lazy"
                            onerror="this.style.display='none'"
                        />
                    `
                    : `
                        <span class="${PLUGIN.component}-default-logo">
                            📺
                        </span>
                    `;

            return `
                <div
                    class="${PLUGIN.component}-channel selector"
                    data-id="${escapeHtml(
                        id
                    )}">

                    <div class="${PLUGIN.component}-channel-number">
                        ${String(
                            index + 1
                        ).padStart(
                            3,
                            "0"
                        )}
                    </div>

                    <div class="${PLUGIN.component}-logo">
                        ${logo}
                    </div>

                    <div class="${PLUGIN.component}-channel-body">

                        <div class="${PLUGIN.component}-channel-name-row">

                            <div class="${PLUGIN.component}-channel-name">
                                ${escapeHtml(
                                    channel.title
                                )}
                            </div>

                            <button
                                class="${PLUGIN.component}-star selector"
                                data-favorite="${escapeHtml(
                                    id
                                )}">
                                ${
                                    favorite
                                        ? "★"
                                        : "☆"
                                }
                            </button>

                        </div>

                        ${
                            current
                                ? `
                            <div class="${PLUGIN.component}-programme">

                                <div class="${PLUGIN.component}-programme-current">

                                    <span class="${PLUGIN.component}-live-dot"></span>

                                    <span class="${PLUGIN.component}-programme-time">
                                        ${formatTime(
                                            current.start
                                        )}
                                    </span>

                                    <span class="${PLUGIN.component}-programme-title">
                                        ${escapeHtml(
                                            current.title
                                        )}
                                    </span>

                                </div>

                                <div class="${PLUGIN.component}-progress">
                                    <div
                                        class="${PLUGIN.component}-progress-value"
                                        style="width:${progress}%">
                                    </div>
                                </div>

                                ${
                                    next
                                        ? `
                                    <div class="${PLUGIN.component}-next">
                                        Далее:
                                        <b>
                                            ${formatTime(
                                                next.start
                                            )}
                                        </b>
                                        ${escapeHtml(
                                            next.title
                                        )}
                                    </div>
                                `
                                        : ""
                                }

                            </div>
                        `
                                : `
                            <div class="${PLUGIN.component}-no-epg">
                                Программа передач недоступна
                            </div>
                        `}

                    </div>

                    <button
                        class="${PLUGIN.component}-epg-button selector"
                        data-epg="${escapeHtml(
                            id
                        )}">
                        📅
                    </button>

                    <div class="${PLUGIN.component}-channel-arrow">
                        ›
                    </div>

                </div>
            `;
        }

        function bindChannelPage(
            content
        ) {
            const back =
                content.querySelector(
                    "." +
                        PLUGIN.component +
                        "-back"
                );

            if (back) {
                const action =
                    function (e) {
                        e.stopPropagation();

                        showGroups();
                    };

                $(back).on(
                    "hover:enter",
                    action
                );

                back.addEventListener(
                    "click",
                    action
                );
            }

            content
                .querySelectorAll(
                    "." +
                        PLUGIN.component +
                        "-channel"
                )
                .forEach(
                    function (
                        element
                    ) {
                        const id =
                            element.dataset
                                .id;

                        const channel =
                            findChannel(
                                id
                            );

                        const action =
                            function (e) {
                                e.stopPropagation();

                                if (
                                    channel
                                ) {
                                    playChannel(
                                        channel
                                    );
                                }
                            };

                        $(element).on(
                            "hover:enter",
                            action
                        );

                        element.addEventListener(
                            "click",
                            action
                        );
                    }
                );

            content
                .querySelectorAll(
                    "." +
                        PLUGIN.component +
                        "-star"
                )
                .forEach(
                    function (
                        star
                    ) {
                        const id =
                            star.dataset
                                .favorite;

                        const action =
                            function (e) {
                                e.stopPropagation();

                                const state =
                                    toggleFavorite(
                                        id
                                    );

                                star.textContent =
                                    state
                                        ? "★"
                                        : "☆";

                                notify(
                                    state
                                        ? "Добавлено в избранное"
                                        : "Удалено из избранного"
                                );
                            };

                        $(star).on(
                            "hover:enter",
                            action
                        );

                        star.addEventListener(
                            "click",
                            action
                        );
                    }
                );

            content
                .querySelectorAll(
                    "." +
                        PLUGIN.component +
                        "-epg-button"
                )
                .forEach(
                    function (
                        button
                    ) {
                        const id =
                            button.dataset
                                .epg;

                        const action =
                            function (e) {
                                e.stopPropagation();

                                const channel =
                                    findChannel(
                                        id
                                    );

                                if (
                                    channel
                                ) {
                                    showProgramme(
                                        channel
                                    );
                                }
                            };

                        $(button).on(
                            "hover:enter",
                            action
                        );

                        button.addEventListener(
                            "click",
                            action
                        );
                    }
                );
        }

        // =====================================================
        // FAVORITES
        // =====================================================

        function showFavorites() {
            currentView =
                "favorites";

            const ids =
                getFavorites();

            const list =
                channels.filter(
                    function (
                        channel
                    ) {
                        return (
                            ids.indexOf(
                                getChannelId(
                                    channel
                                )
                            ) !== -1
                        );
                    }
                );

            renderSpecialList(
                "⭐ Избранное",
                list
            );
        }

        // =====================================================
        // HISTORY
        // =====================================================

        function showHistory() {
            currentView =
                "history";

            const history =
                getHistory();

            const list =
                history
                    .map(
                        function (
                            item
                        ) {
                            return (
                                findChannel(
                                    item.id
                                ) ||
                                item
                            );
                        }
                    )
                    .filter(
                        Boolean
                    );

            renderSpecialList(
                "🕘 Недавние",
                list
            );
        }

        function renderSpecialList(
            title,
            list
        ) {
            const content =
                getContent();

            if (!content) {
                return;
            }

            updateStatus(
                title +
                    " • " +
                    list.length
            );

            let html = `
                <div class="${PLUGIN.component}-channel-page">

                    <div class="${PLUGIN.component}-channel-header">

                        <button
                            class="${PLUGIN.component}-back selector">
                            ← Назад
                        </button>

                        <div class="${PLUGIN.component}-channel-header-title">
                            ${escapeHtml(
                                title
                            )}
                        </div>

                        <div class="${PLUGIN.component}-channel-header-count">
                            ${list.length}
                        </div>

                    </div>

                    <div class="${PLUGIN.component}-channel-list">
            `;

            if (!list.length) {
                html += `
                    <div class="${PLUGIN.component}-empty">
                        <div>⭐</div>
                        <span>
                            Здесь пока пусто
                        </span>
                    </div>
                `;
            } else {
                list.forEach(
                    function (
                        channel,
                        index
                    ) {
                        html +=
                            renderChannel(
                                channel,
                                index
                            );
                    }
                );
            }

            html += `
                    </div>
                </div>
            `;

            content.innerHTML =
                html;

            showContent();

            bindChannelPage(
                content
            );
        }

        // =====================================================
        // PROGRAMME
        // =====================================================

        function showProgramme(
            channel
        ) {
            const content =
                getContent();

            if (!content) {
                return;
            }

            currentView =
                "programme";

            const list =
                getChannelEPG(
                    channel,
                    epg
                );

            updateStatus(
                channel.title +
                    " • программа"
            );

            let html = `
                <div class="${PLUGIN.component}-programme-page">

                    <div class="${PLUGIN.component}-programme-header">

                        <button
                            class="${PLUGIN.component}-back selector">
                            ← Каналы
                        </button>

                        <div class="${PLUGIN.component}-programme-channel">

                            ${
                                channel.logo
                                    ? `
                                <img
                                    src="${escapeHtml(
                                        channel.logo
                                    )}">
                            `
                                    : "📺"
                            }

                            <span>
                                ${escapeHtml(
                                    channel.title
                                )}
                            </span>

                        </div>

                    </div>

                    <div class="${PLUGIN.component}-programme-list">
            `;

            if (!list.length) {
                html += `
                    <div class="${PLUGIN.component}-empty">
                        <div>📅</div>
                        <span>
                            Программа передач недоступна
                        </span>
                    </div>
                `;
            } else {
                const now =
                    Date.now();

                list.forEach(
                    function (
                        programme
                    ) {
                        const active =
                            programme.start.getTime() <=
                                now &&
                            programme.stop.getTime() >
                                now;

                        const progress =
                            getProgrammeProgress(
                                programme
                            );

                        html += `
                            <div
                                class="${PLUGIN.component}-programme-row ${
                                    active
                                        ? "active"
                                        : ""
                                }">

                                <div class="${PLUGIN.component}-programme-date">
                                    ${formatDate(
                                        programme.start
                                    )}
                                </div>

                                <div class="${PLUGIN.component}-programme-hours">
                                    ${formatTime(
                                        programme.start
                                    )}
                                    <span>—</span>
                                    ${formatTime(
                                        programme.stop
                                    )}
                                </div>

                                <div class="${PLUGIN.component}-programme-data">

                                    <div class="${PLUGIN.component}-programme-row-title">

                                        ${
                                            active
                                                ? `
                                            <span class="${PLUGIN.component}-live-label">
                                                СЕЙЧАС
                                            </span>
                                        `
                                                : ""
                                        }

                                        ${escapeHtml(
                                            programme.title
                                        )}

                                    </div>

                                    ${
                                        programme.description
                                            ? `
                                        <div class="${PLUGIN.component}-programme-desc">
                                            ${escapeHtml(
                                                programme.description
                                            )}
                                        </div>
                                    `
                                            : ""
                                    }

                                    ${
                                        active
                                            ? `
                                        <div class="${PLUGIN.component}-progress">
                                            <div
                                                class="${PLUGIN.component}-progress-value"
                                                style="width:${progress}%">
                                            </div>
                                        </div>
                                    `
                                            : ""
                                    }

                                </div>

                            </div>
                        `;
                    }
                );
            }

            html += `
                    </div>
                </div>
            `;

            content.innerHTML =
                html;

            showContent();

            const back =
                content.querySelector(
                    "." +
                        PLUGIN.component +
                        "-back"
                );

            if (back) {
                const action =
                    function (e) {
                        e.stopPropagation();

                        renderChannels(
                            currentGroup
                        );
                    };

                $(back).on(
                    "hover:enter",
                    action
                );

                back.addEventListener(
                    "click",
                    action
                );
            }
        }

        // =====================================================
        // PLAY
        // =====================================================

        function playChannel(
            channel
        ) {
            if (
                !channel ||
                !channel.url
            ) {
                notify(
                    "URL канала не найден"
                );

                return;
            }

            addHistory(
                channel
            );

            const playlist =
                channels
                    .filter(
                        function (
                            item
                        ) {
                            return (
                                item.url
                            );
                        }
                    )
                    .map(
                        function (
                            item
                        ) {
                            return {
                                title:
                                    item.title,

                                url:
                                    item.url,

                                tv:
                                    true,

                                plugin:
                                    PLUGIN.component,

                                logo:
                                    item.logo,

                                tvg_id:
                                    item.tvgId
                            };
                        }
                    );

            const video = {
                title:
                    channel.title,

                url:
                    channel.url,

                tv:
                    true,

                plugin:
                    PLUGIN.component,

                logo:
                    channel.logo,

                tvg_id:
                    channel.tvgId,

                playlist:
                    playlist
            };

            try {
                Lampa.Player.runas(
                    Lampa.Storage.field(
                        "player_iptv"
                    ) || ""
                );
            } catch (e) {}

            try {
                Lampa.Player.play(
                    video
                );
            } catch (e) {
                console.error(
                    "[IPTV] Player:",
                    e
                );
            }

            try {
                Lampa.Player.playlist(
                    playlist
                );
            } catch (e) {}
        }

        // =====================================================
        // FIND
        // =====================================================

        function findChannel(
            id
        ) {
            const normalized =
                normalizeId(id);

            for (
                let i = 0;
                i < channels.length;
                i++
            ) {
                const channel =
                    channels[i];

                if (
                    normalizeId(
                        getChannelId(
                            channel
                        )
                    ) ===
                    normalized
                ) {
                    return channel;
                }

                if (
                    normalizeId(
                        channel.tvgId
                    ) ===
                    normalized
                ) {
                    return channel;
                }
            }

            return null;
        }

        // =====================================================
        // RENDER HELPERS
        // =====================================================

        function getContent() {
            return document.getElementById(
                PLUGIN.component +
                    "-content"
            );
        }

        function showContent() {
            const loading =
                document.getElementById(
                    PLUGIN.component +
                        "-loading"
                );

            const content =
                getContent();

            if (loading) {
                loading.style.display =
                    "none";
            }

            if (content) {
                content.style.display =
                    "block";
            }
        }

        function updateStatus(
            text
        ) {
            const status =
                document.getElementById(
                    PLUGIN.component +
                        "-status"
                );

            if (status) {
                status.textContent =
                    text;
            }
        }

        function notify(
            text
        ) {
            try {
                if (
                    Lampa.Noty &&
                    Lampa.Noty.show
                ) {
                    Lampa.Noty.show(
                        text
                    );
                }
            } catch (e) {}
        }

        function renderCurrent() {
            if (
                currentView ===
                "groups"
            ) {
                showGroups();

                return;
            }

            if (
                currentView ===
                "channels"
            ) {
                renderChannels(
                    currentGroup
                );

                return;
            }

            if (
                currentView ===
                "favorites"
            ) {
                showFavorites();

                return;
            }

            if (
                currentView ===
                "history"
            ) {
                showHistory();

                return;
            }
        }

        // =====================================================
        // ERROR
        // =====================================================

        function showError(
            message
        ) {
            const loading =
                document.getElementById(
                    PLUGIN.component +
                        "-loading"
                );

            if (!loading) {
                return;
            }

            loading.style.display =
                "flex";

            loading.innerHTML = `
                <div class="${PLUGIN.component}-error-icon">
                    ⚠️
                </div>

                <div class="${PLUGIN.component}-error-title">
                    Не удалось загрузить IPTV
                </div>

                <div class="${PLUGIN.component}-error-text">
                    ${escapeHtml(
                        message
                    )}
                </div>

                <button
                    class="${PLUGIN.component}-retry selector"
                    id="${PLUGIN.component}-retry">
                    🔄 Повторить
                </button>
            `;

            updateStatus(
                "Ошибка"
            );

            const retry =
                document.getElementById(
                    PLUGIN.component +
                        "-retry"
                );

            if (retry) {
                const action =
                    function (e) {
                        e.stopPropagation();

                        loadData();
                    };

                $(retry).on(
                    "hover:enter",
                    action
                );

                retry.addEventListener(
                    "click",
                    action
                );
            }
        }

        // =====================================================
        // EPG REFRESH
        // =====================================================

        function startEPGRefresh() {
            if (
                refreshTimer
            ) {
                clearInterval(
                    refreshTimer
                );
            }

            refreshTimer =
                setInterval(
                    function () {
                        if (
                            destroyed
                        ) {
                            return;
                        }

                        if (
                            currentView ===
                            "channels"
                        ) {
                            renderChannels(
                                currentGroup
                            );
                        }
                    },
                    60000
                );
        }

        // =====================================================
        // START
        // =====================================================

        this.start =
            function () {
                destroyed =
                    false;

                Lampa.Controller.add(
                    "content",
                    {
                        back:
                            function () {
                                if (
                                    destroyed
                                ) {
                                    return;
                                }

                                if (
                                    currentView ===
                                    "programme"
                                ) {
                                    renderChannels(
                                        currentGroup
                                    );

                                    return;
                                }

                                if (
                                    currentView ===
                                        "channels" ||
                                    currentView ===
                                        "favorites" ||
                                    currentView ===
                                        "history"
                                ) {
                                    showGroups();

                                    return;
                                }

                                Lampa.Activity.backward();
                            }
                    }
                );

                Lampa.Controller.toggle(
                    "content"
                );
            };

        this.pause =
            function () {};

        this.stop =
            function () {
                destroyed =
                    true;

                if (
                    refreshTimer
                ) {
                    clearInterval(
                        refreshTimer
                    );

                    refreshTimer =
                        null;
                }
            };

        this.render =
            function () {
                return $(
                    "<div></div>"
                ).append(
                    this.create()
                );
            };
    }

    // =========================================================
    // MENU
    // =========================================================

    function addMenuItem() {
        function tryAddMenu() {
            const menu =
                $(".menu .menu__list")
                    .eq(0);

            if (!menu.length) {
                setTimeout(
                    tryAddMenu,
                    500
                );

                return;
            }

            if (
                $(
                    "." +
                        PLUGIN.component +
                        "-menu"
                ).length
            ) {
                return;
            }

            const item =
                $(`
                <li
                    class="menu__item selector ${PLUGIN.component}-menu">

                    <div class="menu__ico">
                        ${PLUGIN.icon}
                    </div>

                    <div class="menu__text">
                        ${PLUGIN.name}
                    </div>

                </li>
            `);

            function open(e) {
                if (e) {
                    e.stopPropagation();
                }

                try {
                    const activity = {
                        id:
                            PLUGIN.component,

                        component:
                            PLUGIN.component,

                        title:
                            PLUGIN.name
                    };

                    if (
                        Lampa.Activity.active()
                            .component ===
                        PLUGIN.component
                    ) {
                        Lampa.Activity.replace(
                            activity
                        );
                    } else {
                        Lampa.Activity.push(
                            activity
                        );
                    }
                } catch (error) {
                    console.error(
                        "[IPTV] Open:",
                        error
                    );
                }
            }

            item.on(
                "hover:enter",
                open
            );

            item.on(
                "click",
                open
            );

            menu.append(
                item
            );
        }

        if (
            document.querySelector(
                ".menu .menu__list"
            )
        ) {
            tryAddMenu();
        } else {
            const observer =
                new MutationObserver(
                    function () {
                        if (
                            document.querySelector(
                                ".menu .menu__list"
                            )
                        ) {
                            observer.disconnect();

                            tryAddMenu();
                        }
                    }
                );

            observer.observe(
                document.body,
                {
                    childList: true,
                    subtree: true
                }
            );

            setTimeout(
                tryAddMenu,
                3000
            );
        }
    }

    // =========================================================
    // SETTINGS
    // =========================================================

    function setupSettings() {
        // В некоторых сборках Lampa SettingsApi вызывается повторно.
        // Не регистрируем один и тот же раздел несколько раз.
        if (window.__simple_iptv_settings_ready) return;

        if (!Lampa.SettingsApi ||
            typeof Lampa.SettingsApi.addComponent !== 'function' ||
            typeof Lampa.SettingsApi.addParam !== 'function') {
            return;
        }

        try {
            // ВАЖНО:
            // Используем ту же схему, что и рабочие плагины Lampa:
            // addComponent(plugin) + addParam с values: '' и default.
            // В старом варианте values отсутствовал у input, из-за чего
            // некоторые сборки Lampa падали внутри SettingsApi.
            Lampa.SettingsApi.addComponent(PLUGIN);

            function addSetting(type, name, title, options) {
                options = options || {};

                const data = {
                    component: PLUGIN.component,
                    param: {
                        name: name,
                        type: type,
                        values: typeof options.values === 'undefined' ? '' : options.values,
                        placeholder: typeof options.placeholder === 'undefined' ? '' : options.placeholder,
                        default: typeof options.default === 'undefined' ? '' : options.default
                    },
                    field: {
                        name: title || name
                    }
                };

                if (options.description) {
                    data.field.description = options.description;
                }

                if (typeof options.onChange === 'function') {
                    data.onChange = options.onChange;
                }

                if (typeof options.onRender === 'function') {
                    data.onRender = options.onRender;
                }

                Lampa.SettingsApi.addParam(data);
            }

            // -------------------------------------------------
            // ЗАГОЛОВОК
            // -------------------------------------------------
            addSetting(
                'title',
                PLUGIN.component + '_title',
                '📺 Настройки IPTV'
            );

            // -------------------------------------------------
            // M3U
            // -------------------------------------------------
            addSetting(
                'input',
                STORAGE.playlist,
                'URL плейлиста M3U',
                {
                    placeholder: DEFAULT_PLAYLIST,
                    default: DEFAULT_PLAYLIST,
                    description: 'Ссылка на ваш M3U/M3U8 плейлист с каналами',
                    onChange: function (value) {
                        setPlaylistUrl(value);
                        notify('URL M3U сохранён');
                    }
                }
            );

            // -------------------------------------------------
            // EPG
            // -------------------------------------------------
            addSetting(
                'input',
                STORAGE.epg,
                'URL программы EPG',
                {
                    placeholder: 'https://example.com/epg.xml',
                    default: getEpgUrl(),
                    description: 'XMLTV. Если пусто — используется url-tvg из M3U',
                    onChange: function (value) {
                        setEpgUrl(value);
                        notify('URL EPG сохранён');
                    }
                }
            );

            // -------------------------------------------------
            // СБРОС
            // -------------------------------------------------
            addSetting(
                'button',
                PLUGIN.component + '_reset',
                '🔄 Сбросить настройки',
                {
                    description: 'Вернуть M3U по умолчанию и очистить URL EPG',
                    onChange: function () {
                        try {
                            if (typeof confirm === 'function' &&
                                !confirm('Сбросить настройки IPTV?')) {
                                return;
                            }
                        } catch (e) {}

                        setPlaylistUrl(DEFAULT_PLAYLIST);
                        setEpgUrl('');
                        notify('Настройки сброшены');
                    }
                }
            );

            // -------------------------------------------------
            // ИЗБРАННОЕ
            // -------------------------------------------------
            addSetting(
                'button',
                PLUGIN.component + '_clear_favorites',
                '⭐ Очистить избранное',
                {
                    description: 'Удалить все избранные каналы',
                    onChange: function () {
                        saveFavorites([]);
                        notify('Избранное очищено');
                    }
                }
            );

            // -------------------------------------------------
            // ИСТОРИЯ
            // -------------------------------------------------
            addSetting(
                'button',
                PLUGIN.component + '_clear_history',
                '🕘 Очистить историю',
                {
                    description: 'Удалить недавно просмотренные каналы',
                    onChange: function () {
                        saveHistory([]);
                        notify('История очищена');
                    }
                }
            );

            window.__simple_iptv_settings_ready = true;

            console.log('[IPTV] Настройки зарегистрированы');
        } catch (e) {
            // Не позволяем ошибке SettingsApi ломать весь IPTV-плагин.
            console.error('[IPTV] Settings:', e);
        }
    }

    // =========================================================
    // REGISTER
    // =========================================================

    function registerComponent() {
        try {
            Lampa.Component.add(
                PLUGIN.component,
                IPTVPage
            );
        } catch (e) {
            console.error(
                "[IPTV] Register:",
                e
            );
        }
    }

    // =========================================================
    // START PLUGIN
    // =========================================================

    function startPlugin() {
        if (
            window[
                PLUGIN.component +
                    "_plugin"
            ]
        ) {
            return;
        }

        window[
            PLUGIN.component +
                "_plugin"
        ] = true;

        registerComponent();

        addStyles();

        addMenuItem();

        if (
            window.appready
        ) {
            setupSettings();
        } else {
            Lampa.Listener.follow(
                "app",
                function (
                    event
                ) {
                    if (
                        event.type ===
                        "ready"
                    ) {
                        setupSettings();
                    }
                }
            );
        }
    }

    startPlugin();

})();
