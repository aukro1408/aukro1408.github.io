(function() {
    "use strict";

    // =============================================
    // НАСТРОЙКИ ПЛАГИНА
    // =============================================
    const PLUGIN = {
        component: 'simple_iptv',
        name: 'IPTV',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <polyline points="16 21 12 17 8 21"/>
            <line x1="12" y1="15" x2="12" y2="21"/>
        </svg>`
    };

    // =============================================
    // ХРАНИЛИЩЕ
    // =============================================
    const URL_STORAGE_KEY = PLUGIN.component + '_url';

    function getPlaylistUrl() {
        try {
            let url = Lampa.Storage.get(URL_STORAGE_KEY, "");
            if (url) return url.trim();
            url = localStorage.getItem(URL_STORAGE_KEY) || "";
            if (url) {
                Lampa.Storage.set(URL_STORAGE_KEY, url);
                return url.trim();
            }
            return "";
        } catch (e) {
            return "";
        }
    }

    function setPlaylistUrl(value) {
        try {
            const url = String(value || "").trim();
            Lampa.Storage.set(URL_STORAGE_KEY, url);
            localStorage.setItem(URL_STORAGE_KEY, url);
            return true;
        } catch (e) {
            return false;
        }
    }

    // =============================================
    // ПАРСИНГ M3U (БЕЗ EPG)
    // =============================================
    function parseM3U(data) {
        const channels = [];
        const lines = data.split(/\r?\n/);
        
        let currentChannel = null;
        let currentGroup = 'Без группы';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            if (line.match(/^#EXTGRP:\s*(.+?)\s*$/i)) {
                const match = line.match(/^#EXTGRP:\s*(.+?)\s*$/i);
                if (match && match[1].trim() !== '') {
                    currentGroup = match[1].trim();
                }
                continue;
            }

            if (line.match(/^#EXTINF:\s*-?\d+(\s+\S.*?\s*)?,(.+)$/i)) {
                const match = line.match(/^#EXTINF:\s*-?\d+(\s+\S.*?\s*)?,(.+)$/i);
                const title = match[2].trim();

                const params = {};
                if (match[1]) {
                    const attrRegex = /([^\s=]+)=((["'])(.*?)\3|\S+)/g;
                    let m;
                    while ((m = attrRegex.exec(match[1])) !== null) {
                        params[m[1].toLowerCase()] = m[4] || m[2];
                    }
                }

                const group = params['group-title'] || currentGroup;

                currentChannel = {
                    title: title,
                    group: group,
                    logo: params['tvg-logo'] || '',
                    url: ''
                };
                continue;
            }

            if (currentChannel && line.match(/^(https?):\/\/(.+)$/i)) {
                currentChannel.url = line;
                channels.push(currentChannel);
                currentChannel = null;
            }
        }

        return channels;
    }

    // =============================================
    // ЗАГРУЗКА ПЛЕЙЛИСТА
    // =============================================
    function loadPlaylist(url) {
        return new Promise((resolve, reject) => {
            if (!url || url.trim() === '') {
                reject(new Error('URL не указан'));
                return;
            }

            const network = new Lampa.Reguest();
            
            network.silent(
                url,
                function(data) {
                    try {
                        const channels = parseM3U(data);
                        if (channels.length === 0) {
                            reject(new Error('Плейлист пуст'));
                            return;
                        }
                        resolve(channels);
                    } catch (e) {
                        reject(new Error('Ошибка парсинга'));
                    }
                },
                function(error) {
                    reject(new Error('Не удалось загрузить плейлист'));
                },
                {
                    dataType: 'text',
                    timeout: 30000
                }
            );
        });
    }

    // =============================================
    // ГРУППИРОВКА
    // =============================================
    function groupChannels(channels) {
        const groups = {};
        channels.forEach(channel => {
            const groupName = channel.group || 'Без группы';
            if (!groups[groupName]) {
                groups[groupName] = { title: groupName, channels: [] };
            }
            groups[groupName].channels.push(channel);
        });
        return groups;
    }

    // =============================================
    // СТРАНИЦА IPTV
    // =============================================
    function IPTVPage(object) {
        let channels = [];
        let catalog = {};
        let isDestroyed = false;

        this.create = function() {
            const html = $(`
                <div class="${PLUGIN.component}-container">
                    <div class="${PLUGIN.component}-header">
                        <h1>📺 IPTV</h1>
                        <div class="${PLUGIN.component}-subheader" id="${PLUGIN.component}-status">
                            Загрузка...
                        </div>
                    </div>
                    <div class="${PLUGIN.component}-scroll-wrap" id="${PLUGIN.component}-scroll-wrap">
                        <div class="${PLUGIN.component}-content">
                            <div class="${PLUGIN.component}-loading" id="${PLUGIN.component}-loading">
                                <div class="${PLUGIN.component}-spinner"></div>
                                <p>Загрузка каналов...</p>
                            </div>
                            <div class="${PLUGIN.component}-groups" id="${PLUGIN.component}-groups" style="display:none;"></div>
                            <div class="${PLUGIN.component}-channels" id="${PLUGIN.component}-channels" style="display:none;"></div>
                        </div>
                    </div>
                </div>
            `);

            loadPlaylistData();
            return html;
        };

        // =============================================
        // ЗАГРУЗКА ДАННЫХ
        // =============================================
        async function loadPlaylistData() {
            let playlistUrl = getPlaylistUrl();
            
            if (!playlistUrl) {
                playlistUrl = 'https://iptv-org.github.io/iptv/index.m3u';
                setPlaylistUrl(playlistUrl);
            }

            try {
                channels = await loadPlaylist(playlistUrl);
                if (channels.length === 0) {
                    showError('Плейлист пуст');
                    return;
                }

                catalog = groupChannels(channels);
                showGroups();

            } catch (error) {
                console.error('[IPTV] Ошибка:', error);
                showError('❌ Ошибка загрузки\n\n' + error.message);
            }
        }

        // =============================================
        // ПОКАЗ ГРУПП
        // =============================================
        function showGroups() {
            if (isDestroyed) return;

            const groupsEl = document.getElementById(`${PLUGIN.component}-groups`);
            const loadingEl = document.getElementById(`${PLUGIN.component}-loading`);
            const statusEl = document.getElementById(`${PLUGIN.component}-status`);

            if (!groupsEl) return;

            if (loadingEl) loadingEl.style.display = 'none';
            if (statusEl) statusEl.textContent = `📺 ${channels.length} каналов, ${Object.keys(catalog).length} групп`;

            const groupNames = Object.keys(catalog);
            
            let html = `<div class="${PLUGIN.component}-groups-grid">`;
            groupNames.forEach(name => {
                const count = catalog[name].channels.length;
                html += `
                    <div class="${PLUGIN.component}-group-card selector" data-group="${name.replace(/"/g, '&quot;')}">
                        <div class="${PLUGIN.component}-group-icon">📂</div>
                        <div class="${PLUGIN.component}-group-name">${name}</div>
                        <div class="${PLUGIN.component}-group-count">${count} каналов</div>
                    </div>
                `;
            });
            html += `</div>`;
            groupsEl.innerHTML = html;
            groupsEl.style.display = 'block';

            groupsEl.querySelectorAll(`.${PLUGIN.component}-group-card`).forEach(card => {
                const groupName = card.dataset.group;
                $(card).on('hover:enter', function(e) {
                    e.stopPropagation();
                    if (!isDestroyed) showChannels(groupName);
                });
                card.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (!isDestroyed) showChannels(groupName);
                });
            });
        }

        // =============================================
        // ПОКАЗ КАНАЛОВ
        // =============================================
        function showChannels(groupName) {
            if (isDestroyed) return;

            const channelsEl = document.getElementById(`${PLUGIN.component}-channels`);
            const groupsEl = document.getElementById(`${PLUGIN.component}-groups`);
            const statusEl = document.getElementById(`${PLUGIN.component}-status`);

            if (!channelsEl) return;

            const groupData = catalog[groupName];
            if (!groupData) return;

            const groupChannels = groupData.channels || [];
            
            if (statusEl) {
                statusEl.textContent = `📺 ${groupName} — ${groupChannels.length} каналов`;
            }

            if (groupsEl) groupsEl.style.display = 'none';

            let html = `
                <div class="${PLUGIN.component}-channels-header">
                    <button class="${PLUGIN.component}-back-btn selector" id="${PLUGIN.component}-back-groups">
                        ← Все группы
                    </button>
                    <h2>${groupName}</h2>
                </div>
                <div class="${PLUGIN.component}-channels-grid">
            `;

            groupChannels.forEach((channel, index) => {
                const logo = channel.logo || '';
                const title = channel.title || 'Канал';
                const url = channel.url || '';
                
                html += `
                    <div class="${PLUGIN.component}-channel-card selector" 
                         data-channel-url="${url.replace(/"/g, '&quot;')}"
                         data-channel-title="${title.replace(/"/g, '&quot;')}">
                        <div class="${PLUGIN.component}-channel-logo">
                            ${logo ? `<img src="${logo}" onerror="this.style.display='none'">` : '📺'}
                        </div>
                        <div class="${PLUGIN.component}-channel-info">
                            <div class="${PLUGIN.component}-channel-name">${title}</div>
                            <div class="${PLUGIN.component}-channel-number">#${index + 1}</div>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            channelsEl.innerHTML = html;
            channelsEl.style.display = 'block';

            channelsEl.querySelectorAll(`.${PLUGIN.component}-channel-card`).forEach(card => {
                const url = card.dataset.channelUrl;
                const name = card.dataset.channelTitle || 'Канал';

                $(card).on('hover:enter', function(e) {
                    e.stopPropagation();
                    if (!isDestroyed) playChannelUrl(url, name);
                });
                card.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (!isDestroyed) playChannelUrl(url, name);
                });
            });

            const backBtn = document.getElementById(`${PLUGIN.component}-back-groups`);
            if (backBtn) {
                $(backBtn).on('hover:enter', function(e) {
                    e.stopPropagation();
                    if (!isDestroyed) {
                        channelsEl.style.display = 'none';
                        if (groupsEl) groupsEl.style.display = 'block';
                        if (statusEl) statusEl.textContent = `📺 ${channels.length} каналов, ${Object.keys(catalog).length} групп`;
                    }
                });
                backBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (!isDestroyed) {
                        channelsEl.style.display = 'none';
                        if (groupsEl) groupsEl.style.display = 'block';
                        if (statusEl) statusEl.textContent = `📺 ${channels.length} каналов, ${Object.keys(catalog).length} групп`;
                    }
                });
            }
        }

        // =============================================
        // ВОСПРОИЗВЕДЕНИЕ
        // =============================================
        function playChannelUrl(url, title) {
            if (isDestroyed) return;

            if (!url) {
                Lampa.Noty.show('URL канала не найден');
                return;
            }

            const playlist = channels.map(ch => ({
                title: ch.title,
                url: ch.url,
                tv: true,
                plugin: PLUGIN.component
            }));

            const video = {
                title: title,
                url: url,
                tv: true,
                plugin: PLUGIN.component,
                playlist: playlist
            };

            Lampa.Player.runas(Lampa.Storage.field('player_iptv') || '');
            Lampa.Player.play(video);
            Lampa.Player.playlist(playlist);
        }

        // =============================================
        // ОШИБКА
        // =============================================
        function showError(message) {
            if (isDestroyed) return;

            const loadingEl = document.getElementById(`${PLUGIN.component}-loading`);
            const statusEl = document.getElementById(`${PLUGIN.component}-status`);

            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div style="font-size:40px;margin-bottom:12px;">😕</div>
                    <p style="color:rgba(255,255,255,0.6);white-space:pre-line;text-align:center;font-size:14px;">${message}</p>
                    <button class="${PLUGIN.component}-retry-btn selector" id="${PLUGIN.component}-retry">
                        🔄 Повторить
                    </button>
                `;
                loadingEl.style.display = 'flex';
            }

            if (statusEl) {
                statusEl.textContent = '❌ Ошибка';
            }

            setTimeout(() => {
                const retryBtn = document.getElementById(`${PLUGIN.component}-retry`);
                if (retryBtn) {
                    $(retryBtn).on('hover:enter', function() {
                        if (!isDestroyed) {
                            const el = document.getElementById(`${PLUGIN.component}-loading`);
                            if (el) {
                                el.innerHTML = `<div class="${PLUGIN.component}-spinner"></div><p>Загрузка...</p>`;
                            }
                            loadPlaylistData();
                        }
                    });
                    retryBtn.addEventListener('click', function() {
                        if (!isDestroyed) {
                            const el = document.getElementById(`${PLUGIN.component}-loading`);
                            if (el) {
                                el.innerHTML = `<div class="${PLUGIN.component}-spinner"></div><p>Загрузка...</p>`;
                            }
                            loadPlaylistData();
                        }
                    });
                }
            }, 100);
        }

        // =============================================
        // УПРАВЛЕНИЕ
        // =============================================
        this.start = function() {
            isDestroyed = false;
            
            Lampa.Controller.add('content', {
                back: function() {
                    if (isDestroyed) return;
                    const channelsEl = document.getElementById(`${PLUGIN.component}-channels`);
                    const groupsEl = document.getElementById(`${PLUGIN.component}-groups`);
                    
                    if (channelsEl && channelsEl.style.display !== 'none') {
                        channelsEl.style.display = 'none';
                        if (groupsEl) groupsEl.style.display = 'block';
                        const statusEl = document.getElementById(`${PLUGIN.component}-status`);
                        if (statusEl) statusEl.textContent = `📺 ${channels.length} каналов, ${Object.keys(catalog).length} групп`;
                    } else {
                        Lampa.Activity.backward();
                    }
                }
            });
            
            Lampa.Controller.toggle('content');
        };

        this.pause = function() {};
        this.stop = function() {
            isDestroyed = true;
        };
        this.render = function() {
            return $('<div></div>').append(this.create());
        };
    }

    // =============================================
    // ПУНКТ В МЕНЮ
    // =============================================
    function addMenuItem() {
        function tryAddMenu() {
            const menu = $('.menu .menu__list').eq(0);
            if (!menu.length) {
                setTimeout(tryAddMenu, 500);
                return;
            }

            if ($(`.${PLUGIN.component}-menu`).length) return;

            const menuItem = $(`
                <li class="menu__item selector ${PLUGIN.component}-menu">
                    <div class="menu__ico">${PLUGIN.icon}</div>
                    <div class="menu__text">${PLUGIN.name}</div>
                </li>
            `);

            menuItem.on('hover:enter', function(e) {
                e.stopPropagation();
                openIPTV();
            });
            menuItem.on('click', function(e) {
                e.stopPropagation();
                openIPTV();
            });

            menu.append(menuItem);
        }

        function openIPTV() {
            try {
                const activity = {
                    id: PLUGIN.component,
                    component: PLUGIN.component,
                    title: PLUGIN.name
                };
                if (Lampa.Activity.active().component === PLUGIN.component) {
                    Lampa.Activity.replace(activity);
                } else {
                    Lampa.Activity.push(activity);
                }
            } catch(error) {
                console.error('[IPTV] Ошибка открытия:', error);
            }
        }

        if (document.querySelector('.menu .menu__list')) {
            tryAddMenu();
        } else {
            const observer = new MutationObserver(function() {
                if (document.querySelector('.menu .menu__list')) {
                    observer.disconnect();
                    tryAddMenu();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(tryAddMenu, 3000);
        }
    }

    // =============================================
    // НАСТРОЙКИ
    // =============================================
    function setupSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        Lampa.SettingsApi.addComponent({
            component: PLUGIN.component,
            name: PLUGIN.name,
            icon: PLUGIN.icon
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN.component,
            param: {
                type: 'title'
            },
            field: {
                name: '📺 Настройки IPTV'
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN.component,
            param: {
                name: URL_STORAGE_KEY,
                type: 'input',
                placeholder: 'https://ваш-плейлист.m3u',
                default: 'https://iptv-org.github.io/iptv/index.m3u'
            },
            field: {
                name: 'URL плейлиста M3U',
                description: 'Ссылка на ваш M3U плейлист с каналами'
            },
            onChange: function(value) {
                setPlaylistUrl(value);
                if (Lampa.Noty && Lampa.Noty.show) {
                    Lampa.Noty.show('URL сохранён');
                }
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN.component,
            param: {
                name: PLUGIN.component + '_reset',
                type: 'button'
            },
            field: {
                name: '🔄 Сбросить настройки',
                description: 'Восстановить настройки по умолчанию'
            },
            onChange: function() {
                if (confirm('Сбросить настройки?')) {
                    setPlaylistUrl('https://iptv-org.github.io/iptv/index.m3u');
                    if (Lampa.Noty && Lampa.Noty.show) {
                        Lampa.Noty.show('Настройки сброшены');
                    }
                }
            }
        });
    }

    // =============================================
    // СТИЛИ
    // =============================================
    function addStyles() {
        const styleId = PLUGIN.component + '-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .${PLUGIN.component}-container {
                height: 100%;
                display: flex;
                flex-direction: column;
                padding: 16px 20px;
                color: #fff;
                box-sizing: border-box;
            }
            .${PLUGIN.component}-header {
                flex-shrink: 0;
                margin-bottom: 16px;
                text-align: center;
            }
            .${PLUGIN.component}-header h1 {
                font-size: 26px;
                margin: 0 0 4px 0;
                font-weight: 700;
                background: linear-gradient(135deg, #ff9800, #ff5722);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .${PLUGIN.component}-subheader {
                color: rgba(255,255,255,0.5);
                font-size: 13px;
                min-height: 20px;
            }
            .${PLUGIN.component}-scroll-wrap {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                min-height: 0;
            }
            .${PLUGIN.component}-scroll-wrap::-webkit-scrollbar {
                width: 3px;
            }
            .${PLUGIN.component}-scroll-wrap::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.15);
                border-radius: 2px;
            }
            .${PLUGIN.component}-content {
                padding-bottom: 20px;
            }
            .${PLUGIN.component}-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                color: rgba(255,255,255,0.6);
            }
            .${PLUGIN.component}-spinner {
                width: 36px;
                height: 36px;
                border: 3px solid rgba(255,255,255,0.05);
                border-top: 3px solid #ff9800;
                border-radius: 50%;
                animation: ${PLUGIN.component}-spin 1s linear infinite;
                margin-bottom: 12px;
            }
            @keyframes ${PLUGIN.component}-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .${PLUGIN.component}-retry-btn {
                margin-top: 12px;
                padding: 8px 24px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                background: rgba(255,255,255,0.05);
                color: #fff;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
            }
            .${PLUGIN.component}-retry-btn:hover {
                background: rgba(255,255,255,0.1);
            }
            .${PLUGIN.component}-groups-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
            }
            .${PLUGIN.component}-group-card {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                padding: 16px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .${PLUGIN.component}-group-card:hover {
                transform: translateY(-3px);
                background: rgba(255,255,255,0.1);
                border-color: rgba(255,152,0,0.3);
                box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            }
            .${PLUGIN.component}-group-icon {
                font-size: 28px;
                margin-bottom: 6px;
            }
            .${PLUGIN.component}-group-name {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .${PLUGIN.component}-group-count {
                font-size: 11px;
                color: rgba(255,255,255,0.4);
            }
            .${PLUGIN.component}-channels-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 14px;
                flex-wrap: wrap;
            }
            .${PLUGIN.component}-channels-header h2 {
                font-size: 18px;
                margin: 0;
            }
            .${PLUGIN.component}-back-btn {
                padding: 6px 16px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                background: rgba(255,255,255,0.05);
                color: #fff;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 12px;
            }
            .${PLUGIN.component}-back-btn:hover {
                background: rgba(255,255,255,0.1);
            }
            .${PLUGIN.component}-channels-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }
            .${PLUGIN.component}-channel-card {
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 10px;
                padding: 12px 14px;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .${PLUGIN.component}-channel-card:hover {
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,152,0,0.2);
                transform: translateX(4px);
            }
            .${PLUGIN.component}-channel-logo {
                width: 40px;
                height: 40px;
                flex-shrink: 0;
                border-radius: 8px;
                background: rgba(255,255,255,0.03);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                overflow: hidden;
            }
            .${PLUGIN.component}-channel-logo img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .${PLUGIN.component}-channel-info {
                flex: 1;
                min-width: 0;
            }
            .${PLUGIN.component}-channel-name {
                font-size: 13px;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .${PLUGIN.component}-channel-number {
                font-size: 10px;
                color: rgba(255,255,255,0.3);
            }
            @media (max-width: 1024px) {
                .${PLUGIN.component}-groups-grid { grid-template-columns: repeat(3, 1fr); }
                .${PLUGIN.component}-channels-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 768px) {
                .${PLUGIN.component}-groups-grid { grid-template-columns: repeat(2, 1fr); }
                .${PLUGIN.component}-channels-grid { grid-template-columns: 1fr; }
                .${PLUGIN.component}-header h1 { font-size: 20px; }
                .${PLUGIN.component}-channels-header { flex-direction: column; text-align: center; }
            }
            @media (max-width: 480px) {
                .${PLUGIN.component}-groups-grid { grid-template-columns: 1fr; }
                .${PLUGIN.component}-channel-card { padding: 10px 12px; }
            }
        `;
        document.head.appendChild(style);
    }

    // =============================================
    // РЕГИСТРАЦИЯ КОМПОНЕНТА
    // =============================================
    function registerComponent() {
        try {
            Lampa.Component.add(PLUGIN.component, IPTVPage);
        } catch(e) {
            console.error('[IPTV] Ошибка регистрации:', e);
        }
    }

    // =============================================
    // ЗАПУСК ПЛАГИНА
    // =============================================
    function startPlugin() {
        if (window[PLUGIN.component + '_plugin']) return;
        window[PLUGIN.component + '_plugin'] = true;

        registerComponent();
        addStyles();
        addMenuItem();

        if (window.appready) {
            setupSettings();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    setupSettings();
                }
            });
        }
    }

    startPlugin();

})();
