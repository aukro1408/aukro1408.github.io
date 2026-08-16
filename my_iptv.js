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
    // КЛЮЧИ ДЛЯ ХРАНИЛИЩА
    // =============================================
    const URL_STORAGE_KEY = PLUGIN.component + '_url';
    const EPG_URL_STORAGE_KEY = PLUGIN.component + '_epg_url';
    const EPG_ENABLED_KEY = PLUGIN.component + '_epg_enabled';

    // =============================================
    // ФУНКЦИИ РАБОТЫ С ХРАНИЛИЩЕМ
    // =============================================
    function getStorage(key, defaultVal) {
        try {
            return Lampa.Storage.get(key, defaultVal);
        } catch(e) {
            return defaultVal;
        }
    }

    function setStorage(key, val) {
        try {
            Lampa.Storage.set(key, val);
        } catch(e) {}
    }

    function getPlaylistUrl() {
        return getStorage(URL_STORAGE_KEY, '');
    }

    function setPlaylistUrl(url) {
        setStorage(URL_STORAGE_KEY, url);
    }

    function getEpgUrl() {
        return getStorage(EPG_URL_STORAGE_KEY, 'https://epg.it999.ru/epg.xml.gz');
    }

    function setEpgUrl(url) {
        setStorage(EPG_URL_STORAGE_KEY, url);
    }

    function getEpgEnabled() {
        return getStorage(EPG_ENABLED_KEY, 'true') === 'true';
    }

    function setEpgEnabled(val) {
        setStorage(EPG_ENABLED_KEY, val ? 'true' : 'false');
    }

    // =============================================
    // ПАРСИНГ M3U
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
                    id: params['tvg-id'] || '',
                    epgId: params['tvg-id'] || '',
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
    // EPG
    // =============================================
    let epgCache = {};
    let epgInterval = null;
    let epgData = {};

    function loadEpgData(url, callback) {
        if (!url) {
            callback(null);
            return;
        }

        const network = new Lampa.Reguest();
        network.silent(
            url,
            function(data) {
                try {
                    // Парсим XML EPG
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(data, 'text/xml');
                    const programmes = xml.getElementsByTagName('programme');
                    
                    const epg = {};
                    for (let i = 0; i < programmes.length; i++) {
                        const prog = programmes[i];
                        const channelId = prog.getAttribute('channel');
                        const start = parseInt(prog.getAttribute('start'));
                        const stop = parseInt(prog.getAttribute('stop'));
                        const title = prog.getElementsByTagName('title')[0]?.textContent || 'Без названия';
                        
                        if (!epg[channelId]) epg[channelId] = [];
                        epg[channelId].push({
                            start: start,
                            stop: stop,
                            title: title,
                            duration: (stop - start) / 1000 // в секундах
                        });
                    }
                    
                    epgData = epg;
                    callback(epg);
                } catch(e) {
                    console.error('[IPTV] Ошибка парсинга EPG:', e);
                    callback(null);
                }
            },
            function(error) {
                console.error('[IPTV] Ошибка загрузки EPG:', error);
                callback(null);
            },
            { dataType: 'text' }
        );
    }

    function getEpgForChannel(channelId, callback) {
        if (!channelId || !epgData[channelId]) {
            callback(null);
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        const programs = epgData[channelId] || [];
        
        // Ищем текущую программу
        let current = null;
        let next = null;
        
        for (let i = 0; i < programs.length; i++) {
            const prog = programs[i];
            const start = Math.floor(prog.start / 1000);
            const stop = Math.floor(prog.stop / 1000);
            
            if (now >= start && now < stop) {
                current = prog;
                break;
            }
            if (start > now && !next) {
                next = prog;
            }
        }
        
        callback({ current: current, next: next });
    }

    function formatEpgTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2);
    }

    function getEpgProgress(start, stop) {
        const now = Math.floor(Date.now() / 1000);
        if (now < start) return 0;
        if (now > stop) return 100;
        return Math.round((now - start) / (stop - start) * 100);
    }

    // =============================================
    // СТРАНИЦА IPTV
    // =============================================
    function IPTVPage(object) {
        let channels = [];
        let catalog = {};
        let isDestroyed = false;
        let epgLoaded = false;

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
                
                // Загружаем EPG если включено
                if (getEpgEnabled()) {
                    loadEpg();
                }
                
                showGroups();

            } catch (error) {
                console.error('[IPTV] Ошибка:', error);
                showError('❌ Ошибка загрузки\n\n' + error.message);
            }
        }

        // =============================================
        // ЗАГРУЗКА EPG
        // =============================================
        function loadEpg() {
            const epgUrl = getEpgUrl();
            if (!epgUrl) return;
            
            const statusEl = document.getElementById(`${PLUGIN.component}-status`);
            if (statusEl) statusEl.textContent = '📡 Загрузка EPG...';
            
            loadEpgData(epgUrl, function(data) {
                epgLoaded = true;
                if (statusEl) {
                    const count = Object.keys(epgData).length;
                    statusEl.textContent = `📺 ${channels.length} каналов, EPG: ${count} каналов`;
                }
                
                // Обновляем EPG на странице
                updateEpgOnPage();
                
                // Запускаем обновление каждые 5 минут
                if (epgInterval) clearInterval(epgInterval);
                epgInterval = setInterval(function() {
                    if (!isDestroyed) {
                        loadEpgData(epgUrl, function() {
                            updateEpgOnPage();
                        });
                    }
                }, 300000);
            });
        }

        // =============================================
        // ОБНОВЛЕНИЕ EPG НА СТРАНИЦЕ
        // =============================================
        function updateEpgOnPage() {
            if (isDestroyed || !getEpgEnabled()) return;
            
            const cards = document.querySelectorAll(`.${PLUGIN.component}-channel-card`);
            cards.forEach(card => {
                const epgId = card.dataset.epgId;
                const index = card.dataset.channelIndex;
                if (!epgId) return;
                
                getEpgForChannel(epgId, function(data) {
                    const epgEl = document.getElementById(`${PLUGIN.component}-epg-${index}`);
                    if (!epgEl) return;
                    
                    if (data && data.current) {
                        const prog = data.current;
                        const startTime = formatEpgTime(Math.floor(prog.start / 1000));
                        const stopTime = formatEpgTime(Math.floor(prog.stop / 1000));
                        const progress = getEpgProgress(Math.floor(prog.start / 1000), Math.floor(prog.stop / 1000));
                        
                        epgEl.innerHTML = `
                            <div class="${PLUGIN.component}-epg-program">
                                <span class="${PLUGIN.component}-epg-time">${startTime} - ${stopTime}</span>
                                <span class="${PLUGIN.component}-epg-title">${prog.title}</span>
                                <div class="${PLUGIN.component}-epg-progress">
                                    <div class="${PLUGIN.component}-epg-progress-bar" style="width:${progress}%;"></div>
                                </div>
                            </div>
                        `;
                    } else if (data && data.next) {
                        const prog = data.next;
                        const startTime = formatEpgTime(Math.floor(prog.start / 1000));
                        epgEl.innerHTML = `
                            <div class="${PLUGIN.component}-epg-program">
                                <span class="${PLUGIN.component}-epg-time">→ ${startTime}</span>
                                <span class="${PLUGIN.component}-epg-title" style="color:rgba(255,255,255,0.4);">${prog.title}</span>
                            </div>
                        `;
                    } else {
                        epgEl.innerHTML = `<span style="color:rgba(255,255,255,0.2);font-size:11px;">Нет данных</span>`;
                    }
                });
            });
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
            if (statusEl) {
                const epgCount = Object.keys(epgData).length;
                statusEl.textContent = `📺 ${channels.length} каналов, ${Object.keys(catalog).length} групп${epgCount > 0 ? `, EPG: ${epgCount}` : ''}`;
            }

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
                const epgId = channel.epgId || '';
                
                html += `
                    <div class="${PLUGIN.component}-channel-card selector" 
                         data-channel-url="${url.replace(/"/g, '&quot;')}"
                         data-channel-title="${title.replace(/"/g, '&quot;')}"
                         data-epg-id="${epgId}"
                         data-channel-index="${index}">
                        <div class="${PLUGIN.component}-channel-logo">
                            ${logo ? `<img src="${logo}" onerror="this.style.display='none'">` : '📺'}
                        </div>
                        <div class="${PLUGIN.component}-channel-info">
                            <div class="${PLUGIN.component}-channel-name">${title}</div>
                            <div class="${PLUGIN.component}-channel-epg" id="${PLUGIN.component}-epg-${index}">
                                ${getEpgEnabled() && epgId ? '<span style="color:rgba(255,255,255,0.3);font-size:11px;">Загрузка...</span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            channelsEl.innerHTML = html;
            channelsEl.style.display = 'block';

            // Обновляем EPG для каналов
            if (getEpgEnabled() && epgLoaded) {
                setTimeout(function() {
                    updateEpgOnPage();
                }, 500);
            }

            // Обработчики каналов
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

            // Кнопка назад
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
            if (epgInterval) {
                clearInterval(epgInterval);
                epgInterval = null;
            }
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

        // Регистрируем компонент в настройках
        Lampa.SettingsApi.addComponent({
            component: PLUGIN.component,
            name: PLUGIN.name,
            icon: PLUGIN.icon
        });

        // --- Настройки плейлиста ---
        Lampa.SettingsApi.addParam({
            component: PLUGIN.component,
            param: {
                type: 'title'
            },
            field: {
                name: '📺 Плейлист'
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
                description: 'Ссылка на ваш M3U плейлист'
            },
            onChange: function(value) {
                setPlaylistUrl(value);
                if (Lampa.Noty && Lampa.Noty.show) {
                    Lampa.Noty.show('URL сохранён');
                }
            }
        });

        // --- Настройки EPG ---
        Lampa.SettingsApi.addParam({
            component: PLUGIN.component,
            param: {
                type: 'title'
            },
            field: {
                name: '📡 Телепрограмма (EPG)'
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN.component,
            param: {
                name: EPG_ENABLED_KEY,
                type: 'trigger',
                values: 'Включена|Выключена',
                default: 'true'
            },
            field: {
                name: 'EPG',
                description: 'Включить отображение телепрограммы'
            },
            onChange: function(value) {
                const enabled = value === 'true';
                setEpgEnabled(enabled);
                if (Lampa.Noty && Lampa.Noty.show) {
                    Lampa.Noty.show(enabled ? 'EPG включена' : 'EPG выключена');
                }
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN.component,
            param: {
                name: EPG_URL_STORAGE_KEY,
                type: 'input',
                placeholder: 'https://epg.it999.ru/epg.xml.gz',
                default: 'https://epg.it999.ru/epg.xml.gz'
            },
            field: {
                name: 'URL EPG',
                description: 'Ссылка на файл EPG в формате XML'
            },
            onChange: function(value) {
                setEpgUrl(value);
                if (Lampa.Noty && Lampa.Noty.show) {
                    Lampa.Noty.show('URL EPG сохранён');
                }
            }
        });

        // --- Сброс ---
        Lampa.SettingsApi.addParam({
            component: PLUGIN.component,
            param: {
                name: PLUGIN.component + '_reset',
                type: 'button'
            },
            field: {
                name: '🔄 Сбросить все настройки',
                description: 'Восстановить настройки по умолчанию'
            },
            onChange: function() {
                if (confirm('Сбросить все настройки?')) {
                    setPlaylistUrl('https://iptv-org.github.io/iptv/index.m3u');
                    setEpgUrl('https://epg.it999.ru/epg.xml.gz');
                    setEpgEnabled(true);
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
            .${PLUGIN.component}-channel-epg {
                font-size: 11px;
                color: rgba(255,255,255,0.5);
                margin-top: 2px;
            }
            .${PLUGIN.component}-epg-program {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 4px 8px;
            }
            .${PLUGIN.component}-epg-time {
                color: rgba(255,255,255,0.3);
                font-size: 10px;
                white-space: nowrap;
            }
            .${PLUGIN.component}-epg-title {
                flex: 1;
                min-width: 50px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 11px;
            }
            .${PLUGIN.component}-epg-progress {
                width: 60px;
                height: 3px;
                background: rgba(255,255,255,0.1);
                border-radius: 2px;
                overflow: hidden;
                flex-shrink: 0;
            }
            .${PLUGIN.component}-epg-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #ff9800, #ff5722);
                border-radius: 2px;
                transition: width 1s ease;
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

        // Настройки регистрируем после готовности приложения
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

    // =============================================
    // СТАРТ
    // =============================================
    startPlugin();

})();
