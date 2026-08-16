(function () {
    "use strict";

    // =========================================================
    // IPTV FOR LAMPA — VERSION 2.0
    // =========================================================

    const PLUGIN = {
        component: "simple_iptv",
        name: "IPTV",

        icon: `<svg xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round"
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
            let value = Lampa.Storage.get(key, null);

            if (value !== null && value !== undefined && value !== "") {
                return value;
            }

            const local = localStorage.getItem(key);

            if (local !== null && local !== undefined) {
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
        const value = storageGet(STORAGE.playlist, "");

        return String(value || "").trim();
    }

    function setPlaylistUrl(value) {
        storageSet(
            STORAGE.playlist,
            String(value || "").trim()
        );
    }

    function getEpgUrl() {
        const value = storageGet(STORAGE.epg, "");

        return String(value || "").trim();
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
        const value = storageGet(STORAGE.favorites, []);

        return Array.isArray(value) ? value : [];
    }

    function saveFavorites(value) {
        storageSet(STORAGE.favorites, value);
    }

    function isFavorite(id) {
        return getFavorites().indexOf(id) !== -1;
    }

    function toggleFavorite(id) {
        let favorites = getFavorites();

        if (favorites.indexOf(id) !== -1) {
            favorites = favorites.filter(function (item) {
                return item !== id;
            });
        } else {
            favorites.push(id);
        }

        saveFavorites(favorites);

        return favorites.indexOf(id) !== -1;
    }

    // =========================================================
    // HISTORY
    // =========================================================

    function getHistory() {
        const value = storageGet(STORAGE.history, []);

        return Array.isArray(value) ? value : [];
    }

    function saveHistory(value) {
        storageSet(STORAGE.history, value);
    }

    function addHistory(channel) {
        if (!channel || !channel.id) return;

        let history = getHistory();

        history = history.filter(function (item) {
            return item.id !== channel.id;
        });

        history.unshift({
            id: channel.id,
            title: channel.title,
            url: channel.url,
            logo: channel.logo || "",
            group: channel.group || ""
        });

        history = history.slice(0, 30);

        saveHistory(history);
    }

    // =========================================================
    // CACHE
    // =========================================================

    function getCache() {
        return storageGet(STORAGE.cache, null);
    }

    function setCache(data) {
        try {
            storageSet(STORAGE.cache, {
                timestamp: Date.now(),
                data: data
            });
        } catch (e) {}
    }

    function getEpgCache() {
        return storageGet(STORAGE.epgCache, null);
    }

    function setEpgCache(data) {
        try {
            storageSet(STORAGE.epgCache, {
                timestamp: Date.now(),
                data: data
            });
        } catch (e) {}
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
        const textarea = document.createElement("textarea");
        textarea.innerHTML = value || "";
        return textarea.value;
    }

    function normalizeId(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    function formatTime(date) {
        if (!date || isNaN(date.getTime())) {
            return "--:--";
        }

        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function formatDate(date) {
        if (!date || isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleDateString([], {
            day: "2-digit",
            month: "2-digit"
        });
    }

    function getChannelId(channel) {
        return (
            channel.id ||
            channel.tvgId ||
            channel.title
        );
    }

    function parseDate(value) {
        if (!value) return null;

        let string = String(value).trim();

        /*
         * XMLTV:
         * 20260816120000 +0300
         * 20260816120000
         */

        const match = string.match(
            /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/
        );

        if (match) {
            const year = Number(match[1]);
            const month = Number(match[2]) - 1;
            const day = Number(match[3]);
            const hour = Number(match[4]);
            const minute = Number(match[5]);
            const second = Number(match[6]);

            const tz = string.substring(14).trim();

            if (/^[+-]\d{4}$/.test(tz)) {
                const sign = tz.charAt(0) === "-" ? -1 : 1;
                const tzHour = Number(tz.substring(1, 3));
                const tzMinute = Number(tz.substring(3, 5));

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
                        ((tzHour * 60 + tzMinute) *
                            60000);

                return new Date(utc);
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

        const parsed = new Date(string);

        return isNaN(parsed.getTime())
            ? null
            : parsed;
    }

    // =========================================================
    // M3U PARSER
    // =========================================================

    function parseM3U(data) {
        const channels = [];
        const lines = String(data || "").split(/\r?\n/);

        let currentChannel = null;
        let currentGroup = "Без группы";

        let playlistEpg = "";

        for (let i = 0; i < lines.length; i++) {
            const original = lines[i];
            const line = original.trim();

            if (!line) continue;

            // -------------------------------------------------
            // M3U HEADER / EPG
            // -------------------------------------------------

            if (line.indexOf("#EXTM3U") === 0) {
                const epgMatch =
                    line.match(
                        /(?:url-tvg|x-tvg-url)\s*=\s*["']([^"']+)["']/i
                    );

                if (epgMatch) {
                    playlistEpg = epgMatch[1];
                }

                continue;
            }

            // -------------------------------------------------
            // EXTGRP
            // -------------------------------------------------

            const extgrp = line.match(
                /^#EXTGRP:\s*(.+?)\s*$/i
            );

            if (extgrp) {
                currentGroup =
                    extgrp[1].trim() || "Без группы";

                continue;
            }

            // -------------------------------------------------
            // EXTINF
            // -------------------------------------------------

            if (line.indexOf("#EXTINF:") === 0) {
                const comma = line.indexOf(",");

                if (comma === -1) continue;

                const info = line.substring(8, comma);
                const title =
                    line.substring(comma + 1).trim();

                const params = {};

                const attrRegex =
                    /([^\s=]+)=((["'])(.*?)\3|\S+)/g;

                let match;

                while (
                    (match = attrRegex.exec(info)) !== null
                ) {
                    params[
                        String(match[1]).toLowerCase()
                    ] =
                        match[4] !== undefined
                            ? match[4]
                            : match[2];
                }

                const tvgId =
                    params["tvg-id"] ||
                    params["tvgid"] ||
                    "";

                const tvgName =
                    params["tvg-name"] ||
                    "";

                const group =
                    params["group-title"] ||
                    currentGroup ||
                    "Без группы";

                currentChannel = {
                    id:
                        tvgId ||
                        tvgName ||
                        title,

                    tvgId: tvgId,

                    tvgName: tvgName,

                    title: title,

                    group: group,

                    logo:
                        params["tvg-logo"] ||
                        params["logo"] ||
                        "",

                    language:
                        params["tvg-language"] ||
                        "",

                    country:
                        params["tvg-country"] ||
                        "",

                    url: ""
                };

                continue;
            }

            // -------------------------------------------------
            // URL
            // -------------------------------------------------

            if (
                currentChannel &&
                /^(https?|rtmp|rtsp):\/\//i.test(line)
            ) {
                currentChannel.url = line;

                channels.push(currentChannel);

                currentChannel = null;
            }
        }

        return {
            channels: channels,
            epgUrl: playlistEpg
        };
    }

    // =========================================================
    // NETWORK
    // =========================================================

    function request(url, callback, errorCallback, options) {
        try {
            const network = new Lampa.Reguest();

            network.silent(
                url,
                callback,
                errorCallback,
                options || {
                    dataType: "text",
                    timeout: 30000
                }
            );
        } catch (e) {
            if (errorCallback) {
                errorCallback(e);
            }
        }
    }

    function loadPlaylist(url) {
        return new Promise(function (resolve, reject) {
            request(
                url,
                function (data) {
                    try {
                        const parsed = parseM3U(data);

                        if (!parsed.channels.length) {
                            reject(
                                new Error(
                                    "Плейлист не содержит каналов"
                                )
                            );

                            return;
                        }

                        resolve(parsed);
                    } catch (e) {
                        reject(
                            new Error(
                                "Ошибка обработки M3U"
                            )
                        );
                    }
                },
                function () {
                    reject(
                        new Error(
                            "Не удалось загрузить M3U"
                        )
                    );
                },
                {
                    dataType: "text",
                    timeout: 30000
                }
            );
        });
    }

    // =========================================================
    // XMLTV PARSER
    // =========================================================

    function parseXMLTV(xml) {
        const result = {};

        try {
            const parser = new DOMParser();

            const doc =
                parser.parseFromString(
                    String(xml || ""),
                    "text/xml"
                );

            const parserError =
                doc.querySelector("parsererror");

            if (parserError) {
                return result;
            }

            const programmes =
                doc.querySelectorAll(
                    "programme"
                );

            programmes.forEach(function (node) {
                const channelId =
                    node.getAttribute("channel");

                if (!channelId) return;

                const id = normalizeId(channelId);

                if (!result[id]) {
                    result[id] = [];
                }

                const titleNode =
                    node.querySelector("title");

                const descNode =
                    node.querySelector("desc");

                const categoryNodes =
                    node.querySelectorAll(
                        "category"
                    );

                const categories = [];

                categoryNodes.forEach(
                    function (category) {
                        categories.push(
                            decodeHtml(
                                category.textContent
                            )
                        );
                    }
                );

                const programme = {
                    channel: channelId,

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

                    categories: categories,

                    start: parseDate(
                        node.getAttribute(
                            "start"
                        )
                    ),

                    stop: parseDate(
                        node.getAttribute(
                            "stop"
                        )
                    )
                };

                if (
                    programme.start &&
                    programme.stop
                ) {
                    result[id].push(
                        programme
                    );
                }
            });

            Object.keys(result).forEach(
                function (id) {
                    result[id].sort(
                        function (a, b) {
                            return (
                                a.start - b.start
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

    function loadEPG(url) {
        return new Promise(function (resolve) {
            if (!url) {
                resolve({});
                return;
            }

            request(
                url,
                function (data) {
                    try {
                        resolve(
                            parseXMLTV(data)
                        );
                    } catch (e) {
                        resolve({});
                    }
                },
                function () {
                    resolve({});
                },
                {
                    dataType: "text",
                    timeout: 45000
                }
            );
        });
    }

    // =========================================================
    // EPG HELPERS
    // =========================================================

    function getChannelEPG(
        channel,
        epg
    ) {
        if (!epg) return [];

        const ids = [
            channel.tvgId,
            channel.tvgName,
            channel.title,
            channel.id
        ];

        for (let i = 0; i < ids.length; i++) {
            const id = normalizeId(ids[i]);

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

        const now = Date.now();

        for (
            let i = 0;
            i < list.length;
            i++
        ) {
            const item = list[i];

            if (
                item.start.getTime() <= now &&
                item.stop.getTime() > now
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

        const now = Date.now();

        for (
            let i = 0;
            i < list.length;
            i++
        ) {
            if (
                list[i].start.getTime() >
                now
            ) {
                return list[i];
            }
        }

        return null;
    }

    function getProgrammeProgress(programme) {
        if (!programme) return 0;

        const start =
            programme.start.getTime();

        const stop =
            programme.stop.getTime();

        const now = Date.now();

        if (now <= start) return 0;
        if (now >= stop) return 100;

        return Math.round(
            ((now - start) /
                (stop - start)) *
                100
        );
    }

    // =========================================================
    // GROUPS
    // =========================================================

    function groupChannels(channels) {
        const groups = {};

        channels.forEach(function (channel) {
            const name =
                channel.group ||
                "Без группы";

            if (!groups[name]) {
                groups[name] = [];
            }

            groups[name].push(channel);
        });

        return groups;
    }

    // =========================================================
    // IPTV PAGE
    // =========================================================

    function IPTVPage(object) {
        let channels = [];
        let catalog = {};
        let epg = {};

        let playlistEpgUrl = "";

        let currentGroup = null;
        let currentView = "groups";

        let destroyed = false;

        let searchQuery = "";

        let refreshTimer = null;

        // -----------------------------------------------------
        // CREATE
        // -----------------------------------------------------

        this.create = function () {
            const html = $(`
                <div class="${PLUGIN.component}-container">

                    <div class="${PLUGIN.component}-top">

                        <div class="${PLUGIN.component}-title">
                            <div class="${PLUGIN.component}-title-main">
                                <span class="${PLUGIN.component}-title-icon">📺</span>
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
                                id="${PLUGIN.component}-favorites-btn">
                                ⭐ Избранное
                            </button>

                            <button
                                class="${PLUGIN.component}-tool selector"
                                id="${PLUGIN.component}-history-btn">
                                🕘 Недавние
                            </button>

                            <button
                                class="${PLUGIN.component}-tool selector"
                                id="${PLUGIN.component}-search-btn">
                                🔎 Поиск
                            </button>

                        </div>

                    </div>

                    <div
                        class="${PLUGIN.component}-search"
                        id="${PLUGIN.component}-search"
                        style="display:none;">

                        <input
                            id="${PLUGIN.component}-search-input"
                            class="${PLUGIN.component}-search-input"
                            type="text"
                            placeholder="Название канала..."
                            autocomplete="off"
                        />

                        <button
                            id="${PLUGIN.component}-search-clear"
                            class="${PLUGIN.component}-search-clear selector">
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

            bindToolbar(html);

            loadData();

            return html;
        };

        // -----------------------------------------------------
        // TOOLBAR
        // -----------------------------------------------------

        function bindToolbar(html) {
            const root = html[0];

            const searchButton =
                root.querySelector(
                    "#" +
                        PLUGIN.component +
                        "-search-btn"
                );

            const favoritesButton =
                root.querySelector(
                    "#" +
                        PLUGIN.component +
                        "-favorites-btn"
                );

            const historyButton =
                root.querySelector(
                    "#" +
                        PLUGIN.component +
                        "-history-btn"
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

            function openSearch() {
                if (destroyed) return;

                if (
                    searchBox.style.display ===
                    "none"
                ) {
                    searchBox.style.display =
                        "flex";

                    setTimeout(function () {
                        searchInput.focus();
                    }, 100);
                } else {
                    searchBox.style.display =
                        "none";

                    searchQuery = "";

                    searchInput.value = "";

                    renderCurrent();
                }
            }

            $(searchButton).on(
                "hover:enter",
                function (e) {
                    e.stopPropagation();
                    openSearch();
                }
            );

            searchButton.addEventListener(
                "click",
                function (e) {
                    e.stopPropagation();
                    openSearch();
                }
            );

            $(favoritesButton).on(
                "hover:enter",
                function (e) {
                    e.stopPropagation();
                    showFavorites();
                }
            );

            favoritesButton.addEventListener(
                "click",
                function (e) {
                    e.stopPropagation();
                    showFavorites();
                }
            );

            $(historyButton).on(
                "hover:enter",
                function (e) {
                    e.stopPropagation();
                    showHistory();
                }
            );

            historyButton.addEventListener(
                "click",
                function (e) {
                    e.stopPropagation();
                    showHistory();
                }
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

            $(clearButton).on(
                "hover:enter",
                function (e) {
                    e.stopPropagation();

                    searchInput.value = "";

                    searchQuery = "";

                    renderCurrent();
                }
            );
        }

        // -----------------------------------------------------
        // LOAD DATA
        // -----------------------------------------------------

        async function loadData() {
            let url = getPlaylistUrl();

            if (!url) {
                url = DEFAULT_PLAYLIST;
                setPlaylistUrl(url);
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
                    parsed.epgUrl || "";

                catalog =
                    groupChannels(
                        channels
                    );

                setCache(channels);

                let epgUrl =
                    getEpgUrl();

                /*
                 * Если пользователь не указал EPG,
                 * пробуем взять url-tvg из M3U.
                 */

                if (!epgUrl) {
                    epgUrl =
                        playlistEpgUrl;
                }

                if (epgUrl) {
                    showLoading(
                        "Загрузка программы передач..."
                    );

                    epg =
                        await loadEPG(
                            epgUrl
                        );

                    if (
                        Object.keys(epg)
                            .length
                    ) {
                        setEpgCache(epg);
                    }
                } else {
                    const cached =
                        getEpgCache();

                    if (
                        cached &&
                        cached.data
                    ) {
                        epg =
                            cached.data;
                    }
                }

                showGroups();

                startEPGRefresh();

            } catch (error) {
                console.error(
                    "[IPTV] load:",
                    error
                );

                /*
                 * Пробуем кэш.
                 */

                const cache =
                    getCache();

                if (
                    cache &&
                    cache.data &&
                    Array.isArray(
                        cache.data
                    )
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
                        cachedEpg &&
                        cachedEpg.data
                    ) {
                        epg =
                            cachedEpg.data;
                    }

                    showGroups();

                    notify(
                        "Используется сохранённый плейлист"
                    );
                } else {
                    showError(
                        error.message ||
                            "Ошибка загрузки"
                    );
                }
            }
        }

        // -----------------------------------------------------
        // LOADING
        // -----------------------------------------------------

        function showLoading(text) {
            if (destroyed) return;

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
                    <div>${escapeHtml(
                        text
                    )}</div>
                `;
            }

            if (content) {
                content.style.display =
                    "none";
            }
        }

        // -----------------------------------------------------
        // GROUPS
        // -----------------------------------------------------

        function showGroups() {
            if (destroyed) return;

            currentView = "groups";
            currentGroup = null;

            const content =
                getContent();

            if (!content) return;

            const groupNames =
                Object.keys(catalog);

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
                                <small>${channels.length}</small>
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
                                <small>${getFavorites().length}</small>
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
                                <small>${getHistory().length}</small>
                            </div>
                        </div>

                    </div>

                    <div class="${PLUGIN.component}-section-title">
                        Группы
                    </div>

                    <div class="${PLUGIN.component}-groups">
            `;

            groupNames.forEach(
                function (name) {
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

            content.innerHTML = html;

            showContent();

            bindGroups(content);
        }

        function bindGroups(content) {
            content
                .querySelectorAll(
                    "." +
                        PLUGIN.component +
                        "-group"
                )
                .forEach(function (element) {
                    const name =
                        element.dataset
                            .group;

                    const enter =
                        function (e) {
                            e.stopPropagation();

                            showChannels(
                                name
                            );
                        };

                    $(element).on(
                        "hover:enter",
                        enter
                    );

                    element.addEventListener(
                        "click",
                        enter
                    );
                });

            content
                .querySelectorAll(
                    "." +
                        PLUGIN.component +
                        "-quick"
                )
                .forEach(function (element) {
                    const action =
                        element.dataset
                            .action;

                    const enter =
                        function (e) {
                            e.stopPropagation();

                            if (
                                action ===
                                "all"
                            ) {
                                showChannels(
                                    null
                                );
                            }

                            if (
                                action ===
                                "favorites"
                            ) {
                                showFavorites();
                            }

                            if (
                                action ===
                                "history"
                            ) {
                                showHistory();
                            }
                        };

                    $(element).on(
                        "hover:enter",
                        enter
                    );

                    element.addEventListener(
                        "click",
                        enter
                    );
                });
        }

        // -----------------------------------------------------
        // CHANNELS
        // -----------------------------------------------------

        function showChannels(
            groupName
        ) {
            if (destroyed) return;

            currentView = "channels";
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

            if (!content) return;

            let list = [];

            if (groupName) {
                list =
                    catalog[
                        groupName
                    ] || [];
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
                            return (
                                channel.title
                                    .toLowerCase()
                                    .indexOf(
                                        searchQuery
                                    ) !==
                                    -1 ||
                                String(
                                    channel.group ||
                                        ""
                                )
                                    .toLowerCase()
                                    .indexOf(
                                        searchQuery
                                    ) !== -1
                            );
                        }
                    );
            }

            updateStatus(
                (groupName ||
                    "Все каналы") +
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
                html += `
                    <div class="${PLUGIN.component}-channel-list">
                `;

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

                html += `
                    </div>
                `;
            }

            html += `
                </div>
            `;

            content.innerHTML = html;

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

                                    <span class="${PLUGIN.component}-live-dot">
                                    </span>

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
                const backAction =
                    function (e) {
                        e.stopPropagation();

                        showGroups();
                    };

                $(back).on(
                    "hover:enter",
                    backAction
                );

                back.addEventListener(
                    "click",
                    backAction
                );
            }

            content
                .querySelectorAll(
                    "." +
                        PLUGIN.component +
                        "-channel"
                )
                .forEach(function (element) {
                    const id =
                        element.dataset
                            .id;

                    const channel =
                        findChannel(
                            id
                        );

                    const enter =
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
                        enter
                    );

                    element.addEventListener(
                        "click",
                        enter
                    );
                });

            content
                .querySelectorAll(
                    "." +
                        PLUGIN.component +
                        "-star"
                )
                .forEach(function (star) {
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
                });
        }

        // -----------------------------------------------------
        // FAVORITES
        // -----------------------------------------------------

        function showFavorites() {
            if (destroyed) return;

            currentView =
                "favorites";

            const favoriteIds =
                getFavorites();

            const list =
                channels.filter(
                    function (channel) {
                        return (
                            favoriteIds.indexOf(
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

        // -----------------------------------------------------
        // HISTORY
        // -----------------------------------------------------

        function showHistory() {
            if (destroyed) return;

            currentView =
                "history";

            const history =
                getHistory();

            const list =
                history
                    .map(function (item) {
                        return (
                            findChannel(
                                item.id
                            ) || item
                        );
                    })
                    .filter(Boolean);

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

            if (!content) return;

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
                            ${title}
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

            content.innerHTML = html;

            showContent();

            bindChannelPage(
                content
            );
        }

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        // Search uses the same channel rendering,
        // therefore no second data model is needed.

        // -----------------------------------------------------
        // PROGRAMME
        // -----------------------------------------------------

        function showProgramme(
            channel
        ) {
            if (destroyed) return;

            const content =
                getContent();

            if (!content) return;

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
                                <img src="${escapeHtml(
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
                            Для этого канала программа передач недоступна
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
                                                ? `<span class="${PLUGIN.component}-live-label">СЕЙЧАС</span>`
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

            content.innerHTML = html;

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

        // -----------------------------------------------------
        // PLAY CHANNEL
        // -----------------------------------------------------

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
                channels.map(
                    function (item) {
                        return {
                            title:
                                item.title,

                            url:
                                item.url,

                            tv: true,

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

                tv: true,

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

        // -----------------------------------------------------
        // FIND CHANNEL
        // -----------------------------------------------------

        function findChannel(id) {
            const normalized =
                normalizeId(id);

            for (
                let i = 0;
                i < channels.length;
                i++
            ) {
                if (
                    normalizeId(
                        getChannelId(
                            channels[i]
                        )
                    ) === normalized
                ) {
                    return channels[i];
                }

                if (
                    normalizeId(
                        channels[i]
                            .tvgId
                    ) === normalized
                ) {
                    return channels[i];
                }
            }

            return null;
        }

        // -----------------------------------------------------
        // CONTENT
        // -----------------------------------------------------

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
            const element =
                document.getElementById(
                    PLUGIN.component +
                        "-status"
                );

            if (element) {
                element.textContent =
                    text;
            }
        }

        function notify(
            message
        ) {
            try {
                if (
                    Lampa.Noty &&
                    Lampa.Noty.show
                ) {
                    Lampa.Noty.show(
                        message
                    );
                }
            } catch (e) {}
        }

        // -----------------------------------------------------
        // ERROR
        // -----------------------------------------------------

        function showError(
            message
        ) {
            if (destroyed) return;

            const loading =
                document.getElementById(
                    PLUGIN.component +
                        "-loading"
                );

            if (!loading) return;

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
                    id="${PLUGIN.component}-retry"
                    class="${PLUGIN.component}-retry selector">
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

        // -----------------------------------------------------
        // EPG REFRESH
        // -----------------------------------------------------

        function startEPGRefresh() {
            if (refreshTimer) {
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

        // -----------------------------------------------------
        // CONTROLLER
        // -----------------------------------------------------

        this.start = function () {
            destroyed = false;

            Lampa.Controller.add(
                "content",
                {
                    back: function () {
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

        this.pause = function () {};

        this.stop = function () {
            destroyed = true;

            if (refreshTimer) {
                clearInterval(
                    refreshTimer
                );

                refreshTimer = null;
            }
        };

        this.render = function () {
            return $("<div></div>")
                .append(
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

            const menuItem = $(`
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

            function openIPTV(e) {
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
                        "[IPTV] Activity:",
                        error
                    );
                }
            }

            menuItem.on(
                "hover:enter",
                openIPTV
            );

            menuItem.on(
                "click",
                openIPTV
            );

            menu.append(
                menuItem
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
        if (
            !Lampa.SettingsApi ||
            !Lampa.SettingsApi.addComponent
        ) {
            return;
        }

        try {
            Lampa.SettingsApi.addComponent(
                {
                    component:
                        PLUGIN.component,

                    name:
                        PLUGIN.name,

                    icon:
                        PLUGIN.icon
                }
            );

            // -------------------------------------------------
            // TITLE
            // -------------------------------------------------

            Lampa.SettingsApi.addParam(
                {
                    component:
                        PLUGIN.component,

                    param: {
                        type: "title"
                    },

                    field: {
                        name:
                            "📺 IPTV"
                    }
                }
            );

            // -------------------------------------------------
            // PLAYLIST
            // -------------------------------------------------

            Lampa.SettingsApi.addParam(
                {
                    component:
                        PLUGIN.component,

                    param: {
                        name:
                            STORAGE.playlist,

                        type: "input",

                        placeholder:
                            DEFAULT_PLAYLIST,

                        default:
                            DEFAULT_PLAYLIST
                    },

                    field: {
                        name:
                            "URL плейлиста M3U",

                        description:
                            "Ссылка на M3U/M3U8 плейлист"
                    },

                    onChange:
                        function (
                            value
                        ) {
                            setPlaylistUrl(
                                value
                            );

                            notify(
                                "URL M3U сохранён"
                            );
                        }
                }
            );

            // -------------------------------------------------
            // EPG
            // -------------------------------------------------

            Lampa.SettingsApi.addParam(
                {
                    component:
                        PLUGIN.component,

                    param: {
                        name:
                            STORAGE.epg,

                        type: "input",

                        placeholder:
                            "https://.../guide.xml"
                    },

                    field: {
                        name:
                            "URL EPG / XMLTV",

                        description:
                            "Можно оставить пустым — плагин попробует взять url-tvg из M3U"
                    },

                    onChange:
                        function (
                            value
                        ) {
                            setEpgUrl(
                                value
                            );

                            notify(
                                "URL EPG сохранён"
                            );
                        }
                }
            );

            // -------------------------------------------------
            // INFO
            // -------------------------------------------------

            Lampa.SettingsApi.addParam(
                {
                    component:
                        PLUGIN.component,

                    param: {
                        type:
                            "title"
                    },

                    field: {
                        name:
                            "ℹ️ Информация",

                        description:
                            "Поддерживаются M3U/M3U8, tvg-id, tvg-logo, group-title и XMLTV EPG."
                    }
                }
            );

            // -------------------------------------------------
            // RESET
            // -------------------------------------------------

            Lampa.SettingsApi.addParam(
                {
                    component:
                        PLUGIN.component,

                    param: {
                        name:
                            PLUGIN.component +
                            "_reset",

                        type:
                            "button"
                    },

                    field: {
                        name:
                            "🔄 Сбросить настройки",

                        description:
                            "Восстановить M3U по умолчанию и очистить EPG"
                    },

                    onChange:
                        function () {
                            if (
                                confirm(
                                    "Сбросить настройки IPTV?"
                                )
                            ) {
                                setPlaylistUrl(
                                    DEFAULT_PLAYLIST
                                );

                                setEpgUrl(
                                    ""
                                );

                                notify(
                                    "Настройки сброшены"
                                );
                            }
                        }
                }
            );

            // -------------------------------------------------
            // CLEAR FAVORITES
            // -------------------------------------------------

            Lampa.SettingsApi.addParam(
                {
                    component:
                        PLUGIN.component,

                    param: {
                        name:
                            PLUGIN.component +
                            "_clear_favorites",

                        type:
                            "button"
                    },

                    field: {
                        name:
                            "⭐ Очистить избранное",

                        description:
                            "Удалить все сохранённые избранные каналы"
                    },

                    onChange:
                        function () {
                            saveFavorites(
                                []
                            );

                            notify(
                                "Избранное очищено"
                            );
                        }
                }
            );

            // -------------------------------------------------
            // CLEAR HISTORY
            // -------------------------------------------------

            Lampa.SettingsApi.addParam(
                {
                    component:
                        PLUGIN.component,

                    param: {
                        name:
                            PLUGIN.component +
                            "_clear_history",

                        type:
                            "button"
                    },

                    field: {
                        name:
                            "🕘 Очистить историю",

                        description:
                            "Удалить недавно просмотренные каналы"
                    },

                    onChange:
                        function () {
                            saveHistory(
                                []
                            );

                            notify(
                                "История очищена"
                            );
                        }
                }
            );
        } catch (e) {
            console.error(
                "[IPTV] Settings:",
                e
            );
        }
    }

    // =========================================================
    // STYLES
    // =========================================================

    function addStyles() {
        const styleId =
            PLUGIN.component +
            "-styles";

        if (
            document.getElementById(
                styleId
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id = styleId;

        style.textContent = `

        /* =====================================================
           CONTAINER
        ===================================================== */

        .${PLUGIN.component}-container {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            color: #fff;
            padding: 18px 24px 24px;
        }

        .${PLUGIN.component}-top {
            flex-shrink: 0;
            margin-bottom: 14px;
        }

        .${PLUGIN.component}-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 14px;
        }

        .${PLUGIN.component}-title-main {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 27px;
            font-weight: 800;
            letter-spacing: -.4px;
        }

        .${PLUGIN.component}-title-icon {
            font-size: 26px;
        }

        .${PLUGIN.component}-status {
            color: rgba(255,255,255,.45);
            font-size: 13px;
            white-space: nowrap;
        }

        /* =====================================================
           TOOLBAR
        ===================================================== */

        .${PLUGIN.component}-toolbar {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .${PLUGIN.component}-tool {
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(255,255,255,.045);
            color: rgba(255,255,255,.8);
            border-radius: 10px;
            padding: 9px 14px;
            font-size: 12px;
            cursor: pointer;
        }

        .${PLUGIN.component}-tool:hover,
        .${PLUGIN.component}-tool.focus {
            background: rgba(255,152,0,.14);
            border-color: rgba(255,152,0,.35);
            color: #fff;
        }

        /* =====================================================
           SEARCH
        ===================================================== */

        .${PLUGIN.component}-search {
            display: flex;
            position: relative;
            margin-bottom: 14px;
        }

        .${PLUGIN.component}-search-input {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid rgba(255,255,255,.1);
            background: rgba(255,255,255,.06);
            color: #fff;
            border-radius: 12px;
            padding: 12px 44px 12px 15px;
            outline: none;
            font-size: 14px;
        }

        .${PLUGIN.component}-search-input:focus {
            border-color: rgba(255,152,0,.5);
            background: rgba(255,255,255,.08);
        }

        .${PLUGIN.component}-search-clear {
            position: absolute;
            right: 7px;
            top: 5px;
            width: 32px;
            height: 32px;
            border: 0;
            background: transparent;
            color: rgba(255,255,255,.5);
            font-size: 24px;
            cursor: pointer;
        }

        /* =====================================================
           SCROLL
        ===================================================== */

        .${PLUGIN.component}-scroll {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .${PLUGIN.component}-scroll::-webkit-scrollbar {
            width: 4px;
        }

        .${PLUGIN.component}-scroll::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,.14);
            border-radius: 5px;
        }

        .${PLUGIN.component}-content {
            padding-bottom: 35px;
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .${PLUGIN.component}-loading {
            min-height: 240px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: rgba(255,255,255,.55);
            font-size: 14px;
        }

        .${PLUGIN.component}-spinner {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 3px solid rgba(255,255,255,.07);
            border-top-color: #ff9800;
            animation: ${PLUGIN.component}-spin .8s linear infinite;
        }

        @keyframes ${PLUGIN.component}-spin {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        /* =====================================================
           SECTIONS
        ===================================================== */

        .${PLUGIN.component}-section-title {
            font-size: 18px;
            font-weight: 700;
            margin: 8px 0 12px;
        }

        /* =====================================================
           QUICK
        ===================================================== */

        .${PLUGIN.component}-quick-grid {
            display: grid;
            grid-template-columns:
                repeat(3, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 24px;
        }

        .${PLUGIN.component}-quick {
            display: flex;
            align-items: center;
            gap: 13px;
            min-height: 64px;
            padding: 12px 15px;
            box-sizing: border-box;
            border-radius: 13px;
            background: rgba(255,255,255,.045);
            border: 1px solid rgba(255,255,255,.07);
            cursor: pointer;
            transition: .2s;
        }

        .${PLUGIN.component}-quick:hover {
            transform: translateY(-2px);
            background: rgba(255,152,0,.1);
            border-color: rgba(255,152,0,.3);
        }

        .${PLUGIN.component}-quick-icon {
            font-size: 27px;
        }

        .${PLUGIN.component}-quick b {
            display: block;
            font-size: 14px;
            margin-bottom: 4px;
        }

        .${PLUGIN.component}-quick small {
            color: rgba(255,255,255,.4);
            font-size: 11px;
        }

        /* =====================================================
           GROUPS
        ===================================================== */

        .${PLUGIN.component}-groups {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .${PLUGIN.component}-group {
            width: 100%;
            min-height: 66px;
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 10px 15px;
            box-sizing: border-box;
            border-radius: 12px;
            background: rgba(255,255,255,.035);
            border: 1px solid rgba(255,255,255,.055);
            cursor: pointer;
            transition: .2s;
        }

        .${PLUGIN.component}-group:hover {
            background: rgba(255,255,255,.075);
            border-color: rgba(255,152,0,.25);
            transform: translateX(3px);
        }

        .${PLUGIN.component}-group-icon {
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9px;
            background: rgba(255,152,0,.1);
            font-size: 20px;
            flex-shrink: 0;
        }

        .${PLUGIN.component}-group-main {
            min-width: 0;
            flex: 1;
        }

        .${PLUGIN.component}-group-name {
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .${PLUGIN.component}-group-count {
            margin-top: 4px;
            font-size: 11px;
            color: rgba(255,255,255,.35);
        }

        .${PLUGIN.component}-group-arrow {
            font-size: 27px;
            color: rgba(255,255,255,.25);
        }

        /* =====================================================
           CHANNEL PAGE
        ===================================================== */

        .${PLUGIN.component}-channel-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }

        .${PLUGIN.component}-back {
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(255,255,255,.045);
            color: rgba(255,255,255,.8);
            border-radius: 9px;
            padding: 8px 13px;
            font-size: 12px;
            cursor: pointer;
        }

        .${PLUGIN.component}-back:hover {
            background: rgba(255,152,0,.12);
            border-color: rgba(255,152,0,.3);
        }

        .${PLUGIN.component}-channel-header-title {
            font-size: 19px;
            font-weight: 700;
            flex: 1;
        }

        .${PLUGIN.component}-channel-header-count {
            color: rgba(255,255,255,.35);
            font-size: 12px;
        }

        /* =====================================================
           CHANNEL LIST
        ===================================================== */

        .${PLUGIN.component}-channel-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .${PLUGIN.component}-channel {
            width: 100%;
            min-height: 76px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 9px 13px;
            box-sizing: border-box;
            background: rgba(255,255,255,.035);
            border: 1px solid rgba(255,255,255,.055);
            border-radius: 11px;
            cursor: pointer;
            transition: .18s;
        }

        .${PLUGIN.component}-channel:hover {
            background: rgba(255,255,255,.075);
            border-color: rgba(255,152,0,.3);
            transform: translateX(3px);
        }

        .${PLUGIN.component}-channel-number {
            width: 34px;
            text-align: center;
            color: rgba(255,255,255,.25);
            font-size: 11px;
            font-variant-numeric: tabular-nums;
            flex-shrink: 0;
        }

        .${PLUGIN.component}-logo {
            width: 55px;
            height: 55px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9px;
            background: rgba(255,255,255,.045);
            overflow: hidden;
        }

        .${PLUGIN.component}-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .${PLUGIN.component}-default-logo {
            font-size: 25px;
        }

        .${PLUGIN.component}-channel-body {
            min-width: 0;
            flex: 1;
        }

        .${PLUGIN.component}-channel-name-row {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .${PLUGIN.component}-channel-name {
            min-width: 0;
            flex: 1;
            font-size: 14px;
            font-weight: 650;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .${PLUGIN.component}-star {
            border: 0;
            background: transparent;
            color: #ffb300;
            font-size: 21px;
            line-height: 1;
            padding: 3px;
            cursor: pointer;
            flex-shrink: 0;
        }

        /* =====================================================
           EPG
        ===================================================== */

        .${PLUGIN.component}-programme {
            margin-top: 6px;
            min-width: 0;
        }

        .${PLUGIN.component}-programme-current {
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 0;
        }

        .${PLUGIN.component}-live-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #ff4d4d;
            box-shadow:
                0 0 7px rgba(255,77,77,.7);
            flex-shrink: 0;
        }

        .${PLUGIN.component}-programme-time {
            color: rgba(255,255,255,.42);
            font-size: 11px;
            font-variant-numeric: tabular-nums;
            flex-shrink: 0;
        }

        .${PLUGIN.component}-programme-title {
            color: rgba(255,255,255,.72);
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .${PLUGIN.component}-progress {
            height: 3px;
            width: 100%;
            margin-top: 5px;
            background: rgba(255,255,255,.07);
            border-radius: 3px;
            overflow: hidden;
        }

        .${PLUGIN.component}-progress-value {
            height: 100%;
            background: #ff9800;
            border-radius: 3px;
        }

        .${PLUGIN.component}-next {
            margin-top: 4px;
            color: rgba(255,255,255,.3);
            font-size: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .${PLUGIN.component}-next b {
            color: rgba(255,255,255,.45);
            margin-left: 3px;
        }

        .${PLUGIN.component}-no-epg {
            margin-top: 6px;
            color: rgba(255,255,255,.25);
            font-size: 10px;
        }

        .${PLUGIN.component}-channel-arrow {
            color: rgba(255,255,255,.2);
            font-size: 27px;
            flex-shrink: 0;
        }

        /* =====================================================
           PROGRAMME PAGE
        ===================================================== */

        .${PLUGIN.component}-programme-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }

        .${PLUGIN.component}-programme-channel {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: 700;
        }

        .${PLUGIN.component}-programme-channel img {
            width: 38px;
            height: 38px;
            object-fit: contain;
            border-radius: 7px;
        }

        .${PLUGIN.component}-programme-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .${PLUGIN.component}-programme-row {
            display: flex;
            gap: 13px;
            padding: 12px;
            border-radius: 9px;
            background: rgba(255,255,255,.03);
            border: 1px solid rgba(255,255,255,.045);
        }

        .${PLUGIN.component}-programme-row.active {
            background: rgba(255,152,0,.09);
            border-color: rgba(255,152,0,.25);
        }

        .${PLUGIN.component}-programme-date {
            width: 42px;
            color: rgba(255,255,255,.28);
            font-size: 10px;
            padding-top: 2px;
            flex-shrink: 0;
        }

        .${PLUGIN.component}-programme-hours {
            width: 86px;
            color: rgba(255,255,255,.5);
            font-size: 11px;
            white-space: nowrap;
            padding-top: 2px;
            flex-shrink: 0;
        }

        .${PLUGIN.component}-programme-hours span {
            margin: 0 3px;
            color: rgba(255,255,255,.2);
        }

        .${PLUGIN.component}-programme-data {
            flex: 1;
            min-width: 0;
        }

        .${PLUGIN.component}-programme-row-title {
            font-size: 13px;
            font-weight: 600;
        }

        .${PLUGIN.component}-live-label {
            display: inline-block;
            margin-right: 7px;
            padding: 2px 5px;
            border-radius: 4px;
            background: #ff9800;
            color: #111;
            font-size: 8px;
            font-weight: 800;
            vertical-align: 2px;
        }

        .${PLUGIN.component}-programme-desc {
            margin-top: 5px;
            color: rgba(255,255,255,.38);
            font-size: 11px;
            line-height: 1.4;
        }

        /* =====================================================
           EMPTY / ERROR
        ===================================================== */

        .${PLUGIN.component}-empty {
            min-height: 220px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: rgba(255,255,255,.35);
        }

        .${PLUGIN.component}-empty div {
            font-size: 42px;
        }

        .${PLUGIN.component}-empty span {
            font-size: 13px;
        }

        .${PLUGIN.component}-error-icon {
            font-size: 42px;
        }

        .${PLUGIN.component}-error-title {
            color: #fff;
            font-size: 17px;
            font-weight: 700;
        }

        .${PLUGIN.component}-error-text {
            max-width: 500px;
            color: rgba(255,255,255,.4);
            text-align: center;
            font-size: 12px;
        }

        .${PLUGIN.component}-retry {
            margin-top: 8px;
            padding: 9px 18px;
            border-radius: 9px;
            border: 1px solid rgba(255,255,255,.1);
            background: rgba(255,255,255,.06);
            color: #fff;
            cursor: pointer;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 900px) {

            .${PLUGIN.component}-container {
                padding-left: 16px;
                padding-right: 16px;
            }

            .${PLUGIN.component}-quick-grid {
                grid-template-columns:
                    repeat(3, minmax(0, 1fr));
            }

        }

        @media (max-width: 650px) {

            .${PLUGIN.component}-title {
                display: block;
            }

            .${PLUGIN.component}-status {
                margin-top: 4px;
            }

            .${PLUGIN.component}-quick-grid {
                grid-template-columns:
                    1fr;
            }

            .${PLUGIN.component}-channel-number {
                display: none;
            }

            .${PLUGIN.component}-logo {
                width: 48px;
                height: 48px;
            }

            .${PLUGIN.component}-channel {
                min-height: 68px;
                padding: 8px 10px;
            }

            .${PLUGIN.component}-programme-row {
                flex-wrap: wrap;
            }

            .${PLUGIN.component}-programme-date {
                display: none;
            }

            .${PLUGIN.component}-programme-hours {
                width: auto;
            }

        }

        @media (max-width: 420px) {

            .${PLUGIN.component}-container {
                padding:
                    12px 10px 20px;
            }

            .${PLUGIN.component}-title-main {
                font-size: 21px;
            }

            .${PLUGIN.component}-tool {
                padding:
                    8px 10px;
                font-size: 11px;
            }

            .${PLUGIN.component}-channel-name {
                font-size: 13px;
            }

            .${PLUGIN.component}-programme-title {
                font-size: 11px;
            }

        }

        `;

        document.head.appendChild(
            style
        );
    }

    // =========================================================
    // REGISTER COMPONENT
    // =========================================================

    function registerComponent() {
        try {
            Lampa.Component.add(
                PLUGIN.component,
                IPTVPage
            );
        } catch (e) {
            console.error(
                "[IPTV] Component:",
                e
            );
        }
    }

    // =========================================================
    // START
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

        if (window.appready) {
            setupSettings();
        } else {
            Lampa.Listener.follow(
                "app",
                function (event) {
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
