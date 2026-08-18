(function () {
    'use strict';

    var STYLE_ID = 'lampa_trailer_autoplay_v16_style';
    var current = null;
    var DELAY = 2000;

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
            .lta7-host {
                position: relative !important;
                overflow: hidden !important;
                /* Собственный stacking context, чтобы z-index детей
                   считался только внутри постера и не зависел от
                   произвольных слоёв Lampa снаружи. */
                z-index: 0 !important;
            }

            .lta7-video {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: 0 !important;
                background: #000 !important;
                opacity: 0 !important;
                /*
                 * ВАЖНО: z-index сюда намеренно НЕ добавляется.
                 * Раньше здесь стояло "z-index: 2 !important;", и это
                 * полностью убивало попытку JS выставить z-index новому
                 * iframe при переключении звука (inline-стиль не может
                 * перебить !important в стилях, независимо от значения).
                 * Из-за этого новый (озвученный) плеер мог визуально
                 * оказаться под другими слоями постера Lampa, а звук
                 * при этом уже шёл из него — трейлер как будто "пропадал".
                 * z-index теперь полностью управляется через JS (см. ниже).
                 */
                transition: opacity .5s ease !important;
            }

            .lta7-video.visible {
                opacity: 1 !important;
            }

            /* Кнопка специально вынесена из карточки Lampa.
               Поэтому её не перехватывает selector/event system Lampa. */
            .lta7-sound {
                position: fixed !important;
                width: 46px !important;
                height: 46px !important;
                min-width: 46px !important;
                padding: 0 !important;
                margin: 0 !important;
                border: 0 !important;
                border-radius: 50% !important;
                background: rgba(20,20,20,.86) !important;
                color: #fff !important;
                z-index: 2147483647 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                opacity: 0 !important;
                pointer-events: none !important;
                touch-action: manipulation !important;
                -webkit-tap-highlight-color: transparent !important;
                box-shadow: 0 2px 10px rgba(0,0,0,.35) !important;
                transition: opacity .25s ease, transform .15s ease !important;
            }

            .lta7-sound.visible {
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            .lta7-sound:active {
                transform: scale(.92) !important;
            }

            .lta7-sound svg {
                width: 24px !important;
                height: 24px !important;
                fill: currentColor !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(s);
    }

    function mutedIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm11 1.1v3.8c.6-.5 1-1.1 1-1.9s-.4-1.4-1-1.9zM17 7.2v2.1c1.8.9 3 2.7 3 4.9s-1.2 4-3 4.9V21c3-1.1 5-3.9 5-6.8s-2-5.9-5-7z"/></svg>';
    }

    function soundIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm12 3c0-1.3-.7-2.5-1.8-3.1v2.3c.5.3.8.7.8 1.2s-.3.9-.8 1.2v2.3c1.1-.6 1.8-1.8 1.8-3.1zm0-6v2.1c1.8.9 3 2.7 3 4.9s-1.2 4-3 4.9V20c3-1.1 5-3.9 5-7s-2-5.9-5-7z"/></svg>';
    }

    function getVideos(data) {
        if (!data || !data.videos) return [];
        var list = data.videos.results || data.videos;
        return Array.isArray(list) ? list.filter(function(v) {
            return v && v.key;
        }) : [];
    }

    function chooseTrailer(data) {
        var list = getVideos(data);
        if (!list.length) return null;

        var lang = 'ru';
        try {
            lang = String(Lampa.Storage.field('language') || 'ru')
                .toLowerCase().split('-')[0];
        } catch(e) {}

        function trailers(a) {
            return a.filter(function(v) {
                return String(v.type || '').toLowerCase() === 'trailer';
            });
        }

        var local = trailers(list.filter(function(v) {
            return String(v.iso_639_1 || '').toLowerCase() === lang;
        }));
        if (local.length) return local[0];

        var en = trailers(list.filter(function(v) {
            return String(v.iso_639_1 || '').toLowerCase() === 'en';
        }));
        if (en.length) return en[0];

        return trailers(list)[0] || list[0];
    }

    function bridgeBase() {
        var base = '';
        try { base = Lampa.Manifest.github_lampa; } catch(e) {}
        if (!base) base = 'https://yumata.github.io/lampa/';
        if (base.charAt(base.length - 1) !== '/') base += '/';
        return base;
    }

    function bridgeUrl(videoId, bridgeId, mute, start) {
        return bridgeBase() + 'youtube.html' +
            '?bridgeId=' + encodeURIComponent(bridgeId) +
            '&videoId=' + encodeURIComponent(videoId) +
            '&autoplay=1' +
            '&controls=0' +
            '&mute=' + (mute ? '1' : '0') +
            '&cc_load_policy=0' +
            '&start=' + Math.max(0, Math.floor(start || 0));
    }

    function send(type, data) {
        if (!current || !current.frameWindow) return;
        try {
            current.frameWindow.postMessage({
                bridgeId: current.bridgeId,
                type: type,
                data: data || {}
            }, '*');
        } catch(e) {}
    }

    function positionSound() {
        if (!current || !current.host || !current.sound) return;

        var rect = current.host.getBoundingClientRect();
        var size = 46;
        var margin = 12;

        current.sound.style.left = Math.round(rect.right - size - margin) + 'px';
        current.sound.style.top = Math.round(rect.bottom - size - margin) + 'px';
    }

    function showSound() {
        if (!current) return;
        positionSound();
        current.sound.classList.add('visible');
    }

    function hideSound() {
        if (!current || !current.sound) return;
        current.sound.classList.remove('visible');
    }

    function cleanup() {
        if (!current) return;

        if (current.revealTimer) clearTimeout(current.revealTimer);
        if (current.unlockTimer) clearTimeout(current.unlockTimer);

        if (current.messageHandler) {
            window.removeEventListener('message', current.messageHandler, true);
        }

        if (current.positionHandler) {
            window.removeEventListener('resize', current.positionHandler);
            window.removeEventListener('scroll', current.positionHandler, true);
        }

        if (current.frame) {
            try { current.frame.remove(); } catch(e) {}
        }

        if (current.pendingFrame) {
            try { current.pendingFrame.remove(); } catch(e) {}
        }

        if (current.sound) {
            try { current.sound.remove(); } catch(e) {}
        }

        if (current.host) {
            current.host.classList.remove('lta7-host');
        }

        current = null;
    }

    /*
     * Единая точка "повышения" ожидающего (pending) iframe до статуса
     * активного плеера. Вызывается и по кастомному сообщению 'ready',
     * и по 'stateChange' (state === 1), какое бы из них ни пришло первым.
     * Как только повышение произошло — pending-таймаут (unlockTimer)
     * гарантированно отменяется, поэтому он больше не может снести уже
     * показанный и играющий плеер.
     */
    function promotePending() {
        if (!current || !current.pendingFrame) return;

        var newFrame = current.pendingFrame;
        var oldFrame = current.frame;
        var wantSound = current.pendingWantSound;
        var position = current.pendingPosition;

        if (current.unlockTimer) {
            clearTimeout(current.unlockTimer);
            current.unlockTimer = null;
        }

        function finish() {
            newFrame.classList.add('visible');
            // z-index управляется только через JS (см. комментарий в стилях).
            newFrame.style.zIndex = '2';

            current.frame = newFrame;
            current.frameWindow = current.pendingFrameWindow || newFrame.contentWindow;
            current.bridgeId = current.pendingBridgeId;
            current.soundOn = wantSound;
            current.currentTime = position;

            current.pendingFrame = null;
            current.pendingBridgeId = null;
            current.pendingFrameWindow = null;
            current.reloading = false;

            send('play');

            current.sound.innerHTML = wantSound ? soundIcon() : mutedIcon();
            current.sound.setAttribute(
                'aria-label',
                wantSound ? 'Выключить звук' : 'Включить звук'
            );
            showSound();

            if (oldFrame) {
                try { oldFrame.remove(); } catch(e) {}
            }
        }

        if (current.isFirstLoad) {
            // Первичная загрузка: даём небольшую паузу перед тем как
            // показать трейлер поверх постера.
            current.isFirstLoad = false;
            current.revealTimer = setTimeout(function() {
                if (!current || current.pendingFrame !== newFrame) return;
                finish();
            }, DELAY);
        } else {
            // Переключение звука: показываем немедленно, без задержки.
            finish();
        }
    }

    /*
     * Запускает новый iframe-мост (для первичной загрузки трейлера или
     * для смены звука) и держит его в состоянии "pending", пока он не
     * подтвердит готовность/воспроизведение. Текущий активный плеер
     * (если есть) остаётся видимым и звучащим ровно до момента
     * успешного promotePending().
     */
    function loadFrame(wantSound, position) {
        if (!current || current.reloading) return;

        current.reloading = true;
        current.pendingWantSound = !!wantSound;
        current.pendingPosition = position || 0;

        var bridgeId = 'lta7_' + Math.random().toString(36).slice(2);

        var frame = document.createElement('iframe');
        frame.className = 'lta7-video';
        frame.setAttribute('frameborder', '0');
        frame.setAttribute('allowfullscreen', 'true');
        frame.setAttribute(
            'allow',
            'autoplay; encrypted-media; picture-in-picture'
        );
        // Пока плеер не готов, держим его визуально ниже активного и
        // не даём ему перехватывать указатель.
        frame.style.zIndex = '1';
        frame.style.pointerEvents = 'none';
        frame.src = bridgeUrl(current.videoId, bridgeId, !wantSound, current.pendingPosition);

        current.host.appendChild(frame);

        current.pendingFrame = frame;
        current.pendingBridgeId = bridgeId;
        current.pendingFrameWindow = null;

        /*
         * Страховочный таймаут: если новый плеер за 8 секунд так и не
         * подтвердил готовность/воспроизведение — не трогаем его молча
         * навсегда, но и не ломаем работающий текущий плеер.
         */
        current.unlockTimer = setTimeout(function() {
            if (!current || current.pendingFrame !== frame) return;

            try { frame.remove(); } catch(e) {}

            current.pendingFrame = null;
            current.pendingBridgeId = null;
            current.pendingFrameWindow = null;
            current.reloading = false;
        }, 8000);
    }

    function create(body, data) {
        cleanup();

        var trailer = chooseTrailer(data);
        if (!trailer) return;

        var poster = body.find('.full-start-new__poster').first();
        if (!poster.length) return;

        var host = poster[0];

        // Кнопка НЕ внутри poster/iframe.
        // Она добавляется прямо в body и позиционируется поверх видео.
        var sound = document.createElement('button');
        sound.type = 'button';
        sound.className = 'lta7-sound';
        sound.innerHTML = mutedIcon();
        sound.setAttribute('aria-label', 'Включить звук');

        host.classList.add('lta7-host');
        document.body.appendChild(sound);

        current = {
            host: host,
            sound: sound,

            frame: null,
            frameWindow: null,
            bridgeId: null,

            pendingFrame: null,
            pendingBridgeId: null,
            pendingFrameWindow: null,
            pendingWantSound: false,
            pendingPosition: 0,

            videoId: trailer.key,
            soundOn: false,
            currentTime: 0,

            reloading: false,
            isFirstLoad: true,

            revealTimer: null,
            unlockTimer: null
        };

        current.positionHandler = positionSound;
        window.addEventListener('resize', current.positionHandler);
        window.addEventListener('scroll', current.positionHandler, true);

        /*
         * ВАЖНО:
         * listener стоит на CAPTURE-фазе и на самой кнопке.
         * Это не даёт Lampa selector/event system перехватить касание.
         */
        current.toggleSound = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();

            if (!current || current.sound !== sound || current.reloading) return;

            loadFrame(!current.soundOn, current.currentTime || 0);
        };

        sound.addEventListener('pointerdown', current.toggleSound, {
            capture: true,
            passive: false
        });
        sound.addEventListener('pointerup', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        }, true);

        /*
         * Единый обработчик сообщений на всё время жизни трейлера.
         * Раньше он был привязан к конкретной переменной iframe и после
         * первого переключения звука переставал видеть сообщения от
         * нового (актуального) плеера — из-за этого пропадали события
         * time/stateChange/error, а страховочный таймер мог снести уже
         * показанный плеер. Теперь сверка идёт по current.frame /
         * current.pendingFrame, которые всегда актуальны.
         */
        current.messageHandler = function(event) {
            if (!current) return;

            var data = event.data;
            if (!data || !data.bridgeId) return;

            var type = data.type;
            var d = data.data || {};

            // Сообщения от ожидающего (pending) плеера.
            if (current.pendingFrame &&
                data.bridgeId === current.pendingBridgeId &&
                event.source === current.pendingFrame.contentWindow) {

                if (type === 'bridgeReady') {
                    current.pendingFrameWindow = event.source;
                    return;
                }

                if (type === 'ready' || (type === 'stateChange' && d.state === 1)) {
                    promotePending();
                    return;
                }

                if (type === 'error') {
                    if (current.unlockTimer) {
                        clearTimeout(current.unlockTimer);
                        current.unlockTimer = null;
                    }
                    try { current.pendingFrame.remove(); } catch(e) {}
                    current.pendingFrame = null;
                    current.pendingBridgeId = null;
                    current.pendingFrameWindow = null;
                    current.reloading = false;
                    return;
                }

                return;
            }

            // Сообщения от текущего активного плеера.
            if (current.frame &&
                data.bridgeId === current.bridgeId &&
                event.source === current.frame.contentWindow) {

                if (type === 'bridgeReady') {
                    current.frameWindow = event.source;
                    return;
                }

                if (type === 'time') {
                    if (typeof d.currentTime === 'number') {
                        current.currentTime = d.currentTime;
                    }
                    positionSound();
                    return;
                }

                if (type === 'stateChange' && d.state === 0 && !current.reloading) {
                    // Трейлер закончился.
                    cleanup();
                    return;
                }

                if (type === 'error' && !current.reloading) {
                    // При ошибке возвращаем обычный постер.
                    cleanup();
                    return;
                }

                return;
            }
        };

        window.addEventListener('message', current.messageHandler, true);

        loadFrame(false, 0);
    }

    function onFull(e) {
        if (!e || e.type !== 'complite' || !e.body || !e.data) return;
        create(e.body, e.data);
    }

    function onActivity(e) {
        if (e && e.type === 'destroy' && e.component === 'full') {
            cleanup();
        }
    }

    function start() {
        if (!window.Lampa || !Lampa.Listener) return;
        addStyle();
        Lampa.Listener.follow('full', onFull);
        Lampa.Listener.follow('activity', onActivity);
        console.log('[Trailer Autoplay] v16 started');
    }

    if (window.Lampa && Lampa.Listener) {
        start();
    } else {
        setTimeout(start, 1500);
    }
})();
