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
    const STORAGE_KEY = PLUGIN.component + '_data';

    function getSettings() {
        try {
            return JSON.parse(Lampa.Storage.get(STORAGE_KEY, '{}'));
        } catch {
            return {};
        }
    }

    function saveSettings(data) {
        Lampa.Storage.set(STORAGE_KEY, JSON.stringify(data));
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

            // Пропускаем пустые строки
            if (!line) continue;

            // Группа
            if (line.startsWith('#EXTGRP:')) {
                currentGroup = line.replace('#EXTGRP:', '').trim();
                continue;
            }

            // Информация о канале
            if (line.startsWith('#EXTINF:')) {
                // Извлекаем название
                const titleMatch = line.match(/,([^,]+)$/);
                const title = titleMatch ? titleMatch[1].trim() : 'Канал';

                // Извлекаем параметры
                const params = {};
                const attrRegex = /([a-zA-Z-]+)="([^"]*)"/g;
                let match;
                while ((match = attrRegex.exec(line)) !== null) {
                    params[match[1]] = match[2];
                }

                currentChannel = {
                    title: title,
                    group: currentGroup,
                    logo: params['tvg-logo'] || '',
                    id: params['tvg-id'] || '',
                    url: ''
                };
                continue;
            }

            // URL канала
            if (currentChannel && line.startsWith('http')) {
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
            console.log('[IPTV] 📥 Загрузка плейлиста:', url);

            // Используем Lampa.Reguest для загрузки
            const request = new Lampa.Reguest();
            
            request.silent(
                url,
                function(data) {
                    console.log('[IPTV] ✅ Плейлист загружен');
                    try {
                        const channels = parseM3U(data);
                        console.log('[IPTV] 📺 Найдено каналов:', channels.length);
                        resolve(channels);
                    } catch (e) {
                        reject(new Error('Ошибка парсинга плейлиста'));
                    }
                },
                function(error) {
                    console.error('[IPTV] ❌ Ошибка загрузки:', error);
                    reject(new Error('Не удалось загрузить плейлист'));
                },
                {
                    dataType: 'text'
                }
            );
        });
    }

    // =============================================
    // ГРУППИРОВКА КАНАЛОВ
    // =============================================
    function groupChannels(channels) {
        const groups = {};
        
        channels.forEach(channel => {
            const groupName = channel.group || 'Без группы';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(channel);
        });

        return groups;
    }

    // =============================================
    // СТРАНИЦА IPTV
    // =============================================
    function IPTVPage(object) {
        let channels = [];
        let groups = {};
        let currentGroup = null;
        let scrollInstance = null;

        this.create = function() {
            console.log('[IPTV] 📄 Создание страницы');

            const html = $(`
                <div class="${PLUGIN.component}-container">
                    <div class="${PLUGIN.component}-header">
                        <h1>📺 IPTV</h1>
                        <div class="${PLUGIN.component}-subheader" id="${PLUGIN.component}-status">
                            Загрузка плейлиста...
                        </div>
                    </div>

                    <div class="${PLUGIN.component}-scroll-wrap" id="${PLUGIN.component}-scroll-wrap">
                        <div class="${PLUGIN.component}-content">
                            <div class="${PLUGIN.component}-loading" id="${PLUGIN.component}-loading">
                                <div class="${PLUGIN.component}-spinner"></div>
                                <p>Загрузка каналов...</p>
                            </div>

                            <div class="${PLUGIN.component}-groups" id="${PLUGIN.component}-groups" style="display:none;">
                                <!-- Группы будут здесь -->
                            </div>

                            <div class="${PLUGIN.component}-channels" id="${PLUGIN.component}-channels" style="display:none;">
                                <!-- Каналы будут здесь -->
                            </div>
                        </div>
                    </div>
                </div>
            `);

            // Создаём скролл
            const wrap = document.getElementById(`${PLUGIN.component}-scroll-wrap`);
            if (wrap) {
                scrollInstance = new Lampa.Scroll({
                    element: wrap,
                    step: 200
                });
                scrollInstance.render();
            }

            // Загружаем плейлист
            loadPlaylistData();

            return html;
        };

        // =============================================
        // ЗАГРУЗКА ДАННЫХ
        // =============================================
        async function loadPlaylistData() {
            const settings = getSettings();
            const playlistUrl = settings.url || getDefaultPlaylist();

            if (!playlistUrl) {
                showError('Не указан URL плейлиста.\nНастройте его в меню настроек.');
                return;
            }

            try {
                channels = await loadPlaylist(playlistUrl);
                
                if (channels.length === 0) {
                    showError('Плейлист пуст или не содержит каналов.');
                    return;
                }

                groups = groupChannels(channels);
                showGroups();

            } catch (error) {
                showError(error.message || 'Ошибка загрузки плейлиста');
            }
        }

        // =============================================
        // ОТОБРАЖЕНИЕ ГРУПП
        // =============================================
        function showGroups() {
            const groupsEl = document.getElementById(`${PLUGIN.component}-groups`);
            const loadingEl = document.getElementById(`${PLUGIN.component}-loading`);
            const statusEl = document.getElementById(`${PLUGIN.component}-status`);

            if (!groupsEl) return;

            // Скрываем загрузку
            if (loadingEl) loadingEl.style.display = 'none';
            if (statusEl) statusEl.textContent = `📺 ${channels.length} каналов`;

            // Строим группы
            const groupNames = Object.keys(groups).sort();
            
            let html = `<div class="${PLUGIN.component}-groups-grid">`;
            
            groupNames.forEach(name => {
                const count = groups[name].length;
                html += `
                    <div class="${PLUGIN.component}-group-card selector" data-group="${name}">
                        <div class="${PLUGIN.component}-group-icon">📂</div>
                        <div class="${PLUGIN.component}-group-name">${name}</div>
                        <div class="${PLUGIN.component}-group-count">${count} каналов</div>
                    </div>
                `;
            });

            html += `</div>`;
            groupsEl.innerHTML = html;
            groupsEl.style.display = 'block';

            // Обработчики для групп
            groupsEl.querySelectorAll(`.${PLUGIN.component}-group-card`).forEach(card => {
                const groupName = card.dataset.group;
                
                const selectGroup = function() {
                    currentGroup = groupName;
                    showChannels(groupName);
                };

                card.addEventListener('click', selectGroup);
                $(card).on('hover:enter', selectGroup);
            });

            // Обновляем скролл
            if (scrollInstance) {
                setTimeout(() => {
                    try { scrollInstance.update(); } catch(e) {}
                }, 200);
            }
        }

        // =============================================
        // ОТОБРАЖЕНИЕ КАНАЛОВ
        // =============================================
        function showChannels(groupName) {
            const channelsEl = document.getElementById(`${PLUGIN.component}-channels`);
            const groupsEl = document.getElementById(`${PLUGIN.component}-groups`);
            const statusEl = document.getElementById(`${PLUGIN.component}-status`);

            if (!channelsEl) return;

            const groupChannels = groups[groupName] || [];
            
            if (statusEl) {
                statusEl.textContent = `📺 ${groupName} — ${groupChannels.length} каналов`;
            }

            // Скрываем группы
            if (groupsEl) groupsEl.style.display = 'none';

            // Строим каналы
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
                html += `
                    <div class="${PLUGIN.component}-channel-card selector" 
                         data-channel-index="${index}"
                         data-channel-url="${channel.url}">
                        <div class="${PLUGIN.component}-channel-logo">
                            ${logo ? `<img src="${logo}" onerror="this.style.display='none'">` : '📺'}
                        </div>
                        <div class="${PLUGIN.component}-channel-info">
                            <div class="${PLUGIN.component}-channel-name">${channel.title}</div>
                            <div class="${PLUGIN.component}-channel-number">#${index + 1}</div>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            channelsEl.innerHTML = html;
            channelsEl.style.display = 'block';

            // Обработчики для каналов
            channelsEl.querySelectorAll(`.${PLUGIN.component}-channel-card`).forEach(card => {
                const url = card.dataset.channelUrl;
                const name = card.querySelector(`.${PLUGIN.component}-channel-name`)?.textContent || 'Канал';

                const playChannel = function() {
                    playChannelUrl(url, name);
                };

                card.addEventListener('click', playChannel);
                $(card).on('hover:enter', playChannel);
            });

            // Кнопка "Назад"
            const backBtn = document.getElementById(`${PLUGIN.component}-back-groups`);
            if (backBtn) {
                const goBack = function() {
                    channelsEl.style.display = 'none';
                    if (groupsEl) groupsEl.style.display = 'block';
                    if (statusEl) statusEl.textContent = `📺 ${channels.length} каналов`;
                    
                    if (scrollInstance) {
                        setTimeout(() => {
                            try { scrollInstance.update(); } catch(e) {}
                        }, 200);
                    }
                };
                backBtn.addEventListener('click', goBack);
                $(backBtn).on('hover:enter', goBack);
            }

            // Обновляем скролл
            if (scrollInstance) {
                setTimeout(() => {
                    try { scrollInstance.update(); } catch(e) {}
                }, 200);
            }
        }

        // =============================================
        // ВОСПРОИЗВЕДЕНИЕ КАНАЛА
        // =============================================
        function playChannelUrl(url, title) {
            console.log('[IPTV] ▶️ Воспроизведение:', title);

            if (!url) {
                Lampa.Noty.show('URL канала не найден');
                return;
            }

            // Создаём видео для плеера
            const video = {
                title: title,
                url: url,
                tv: true,
                plugin: PLUGIN.component
            };

            // Создаём плейлист (для переключения каналов)
            const playlist = channels.map(ch => ({
                title: ch.title,
                url: ch.url,
                tv: true,
                plugin: PLUGIN.component
            }));

            // Находим текущий канал в плейлисте
            const currentIndex = playlist.findIndex(item => item.url === url);

            // Запускаем плеер
            Lampa.Player.runas(Lampa.Storage.field('player_iptv') || '');
            Lampa.Player.play(video);
            Lampa.Player.playlist(playlist);

            // Если нужно, переключаем на нужный канал
            if (currentIndex !== -1) {
                Lampa.PlayerPlaylist.position(currentIndex);
            }

            // Добавляем управление с пульта
            setupRemoteControl(playlist);
        }

        // =============================================
        // УПРАВЛЕНИЕ С ПУЛЬТА
        // =============================================
        let remoteControlActive = false;

        function setupRemoteControl(playlist) {
            if (remoteControlActive) return;
            remoteControlActive = true;

            Lampa.Keypad.listener.follow('keydown', function(e) {
                const code = e.code;

                // Проверяем, что плеер открыт и это наш плейлист
                if (!Lampa.Player.opened()) return;
                if (!playlist || playlist.length === 0) return;

                const currentPos = Lampa.PlayerPlaylist.position() || 0;
                let newPos = currentPos;

                // Влево/Вправо - переключение каналов
                if (code === 37 || code === 4) { // Left
                    newPos = currentPos === 0 ? playlist.length - 1 : currentPos - 1;
                    e.event.preventDefault();
                } else if (code === 39 || code === 5) { // Right
                    newPos = currentPos === playlist.length - 1 ? 0 : currentPos + 1;
                    e.event.preventDefault();
                }

                if (newPos !== currentPos) {
                    const item = playlist[newPos];
                    Lampa.PlayerPlaylist.listener.send('select', {
                        playlist: playlist,
                        position: newPos,
                        item: item
                    });
                    Lampa.Player.runas(Lampa.Storage.field('player_iptv') || '');

                    // Показываем название канала
                    Lampa.Noty.show(item.title);
                }
            });
        }

        // =============================================
        // ПОЛУЧЕНИЕ ПЛЕЙЛИСТА ПО УМОЛЧАНИЮ
        // =============================================
        function getDefaultPlaylist() {
            // Публичный тестовый плейлист (можно заменить на свой)
            return 'https://iptv-org.github.io/iptv/index.m3u';
        }

        // =============================================
        // ОТОБРАЖЕНИЕ ОШИБКИ
        // =============================================
        function showError(message) {
            const loadingEl = document.getElementById(`${PLUGIN.component}-loading`);
            const statusEl = document.getElementById(`${PLUGIN.component}-status`);

            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div style="font-size:40px;margin-bottom:12px;">😕</div>
                    <p style="color:rgba(255,255,255,0.6);">${message}</p>
                    <button class="${PLUGIN.component}-retry-btn selector" id="${PLUGIN.component}-retry">
                        🔄 Повторить
                    </button>
                `;
                loadingEl.style.display = 'flex';
            }

            if (statusEl) {
                statusEl.textContent = '❌ Ошибка загрузки';
            }

            // Кнопка повторной загрузки
            setTimeout(() => {
                const retryBtn = document.getElementById(`${PLUGIN.component}-retry`);
                if (retryBtn) {
                    retryBtn.addEventListener('click', function() {
                        location.reload();
                    });
                    $(retryBtn).on('hover:enter', function() {
                        location.reload();
                    });
                }
            }, 100);
        }

        // =============================================
        // УПРАВЛЕНИЕ
        // =============================================
        this.start = function() {
            console.log('[IPTV] 🚀 Запуск страницы');
            
            Lampa.Controller.add('content', {
                back: function() {
                    const channelsEl = document.getElementById(`${PLUGIN.component}-channels`);
                    const groupsEl = document.getElementById(`${PLUGIN.component}-groups`);
                    
                    if (channelsEl && channelsEl.style.display !== 'none') {
                        // Возврат к группам
                        channelsEl.style.display = 'none';
                        if (groupsEl) groupsEl.style.display = 'block';
                        
                        const statusEl = document.getElementById(`${PLUGIN.component}-status`);
                        if (statusEl) statusEl.textContent = `📺 ${channels.length} каналов`;
                        
                        if (scrollInstance) {
                            setTimeout(() => {
                                try { scrollInstance.update(); } catch(e) {}
                            }, 200);
                        }
                    } else {
                        Lampa.Activity.backward();
                    }
                }
            });
            
            Lampa.Controller.toggle('content');
            
            if (scrollInstance) {
                setTimeout(() => {
                    try { scrollInstance.update(); } catch(e) {}
                }, 300);
            }
        };

        this.pause = function() {};
        this.stop = function() {
            if (scrollInstance) {
                try { scrollInstance.destroy(); } catch(e) {}
                scrollInstance = null;
            }
            remoteControlActive = false;
        };
        
        this.render = function() {
            return $('<div></div>').append(this.create());
        };
    }

    // =============================================
    // ДОБАВЛЯЕМ ПУНКТ В МЕНЮ
    // =============================================
    function addMenuItem() {
        console.log('[IPTV] 📌 Добавление пункта меню');
        
        const menuItem = $(`
            <li class="menu__item selector ${PLUGIN.component}-menu">
                <div class="menu__ico">${PLUGIN.icon}</div>
                <div class="menu__text">${PLUGIN.name}</div>
            </li>
        `);

        menuItem.on('hover:enter', function() {
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
        });

        const menu = $('.menu .menu__list').eq(0);
        menu.append(menuItem);
        console.log('[IPTV] ✅ Пункт меню добавлен');
    }

    // =============================================
    // НАСТРОЙКИ ПЛАГИНА
    // =============================================
    function addSettings() {
        Lampa.SettingsApi.addComponent(PLUGIN);

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
                name: PLUGIN.component + '_url',
                type: 'input',
                placeholder: 'https://example.com/playlist.m3u',
                default: getDefaultPlaylist()
            },
            field: {
                name: 'URL плейлиста M3U',
                description: 'Ссылка на плейлист в формате M3U'
            },
            onChange: function(value) {
                const settings = getSettings();
                settings.url = value;
                saveSettings(settings);
                console.log('[IPTV] ✅ URL сохранён:', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN.component,
            param: {
                name: PLUGIN.component + '_reset',
                type: 'button'
            },
            field: {
                name: '🔄 Сбросить настройки'
            },
            onChange: function() {
                if (confirm('Сбросить настройки плейлиста?')) {
                    saveSettings({});
                    Lampa.Noty.show('Настройки сброшены');
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

            /* Загрузка */
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

            /* Группы */
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

            /* Каналы */
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
                .${PLUGIN.component}-groups-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
                .${PLUGIN.component}-channels-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            @media (max-width: 768px) {
                .${PLUGIN.component}-groups-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                .${PLUGIN.component}-channels-grid {
                    grid-template-columns: 1fr;
                }
                .${PLUGIN.component}-header h1 {
                    font-size: 20px;
                }
                .${PLUGIN.component}-channels-header {
                    flex-direction: column;
                    text-align: center;
                }
            }

            @media (max-width: 480px) {
                .${PLUGIN.component}-groups-grid {
                    grid-template-columns: 1fr;
                }
                .${PLUGIN.component}-channel-card {
                    padding: 10px 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // =============================================
    // РЕГИСТРАЦИЯ
    // =============================================
    function registerComponent() {
        Lampa.Component.add(PLUGIN.component, IPTVPage);
    }

    // =============================================
    // ЗАПУСК
    // =============================================
    function init() {
        console.log('[IPTV] 🚀 Инициализация...');
        addStyles();
        registerComponent();
        addMenuItem();
        addSettings();
        console.log('[IPTV] ✅ Плагин загружен!');
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }

})();
