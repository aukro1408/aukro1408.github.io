(function () {
    'use strict';

    var STYLE_ID = 'lampa_trailer_autoplay_v19_style';
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
            }

            .lta7-video {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: 0 !important;
                background: #000 !important;
                opacity: 0 !important;
                z-index: 2 !important;
                pointer-events: none !important;
                transition: opacity .25s ease !important;
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

            .lta7-tapzone {
                position: absolute !important;
                inset: 0 !important;
                z-index: 10 !important;
                background: transparent !important;
                border: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                pointer-events: auto !important;
                touch-action: manipulation !important;
                -webkit-tap-highlight-color: transparent !important;
            }

            /* Our single, fixed-size play/pause indicator. It sits above the
               bridge's own transient center indicator, so only one control
               is ever visible to the user. */
            .lta7-playpause {
                position: absolute !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) scale(.92) !important;
                width: 58px !important;
                height: 58px !important;
                border: 0 !important;
                border-radius: 50% !important;
                padding: 0 !important;
                margin: 0 !important;
                background: rgba(20,20,20,.72) !important;
                color: #fff !important;
                z-index: 20 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                opacity: 0 !important;
                pointer-events: none !important;
                transition: opacity .18s ease, transform .18s ease !important;
                touch-action: manipulation !important;
                -webkit-tap-highlight-color: transparent !important;
                box-shadow: 0 2px 12px rgba(0,0,0,.35) !important;
            }

            .lta7-playpause.visible {
                opacity: 1 !important;
                transform: translate(-50%, -50%) scale(1) !important;
            }

            .lta7-playpause svg {
                width: 28px !important;
                height: 28px !important;
                fill: currentColor !important;
                pointer-events: none !important;
            }

            .lta7-sound .lta7-muted-x {
                fill: #ff4b4b !important;
                stroke: #fff !important;
            }
        `;
        document.head.appendChild(s);
    }

    function mutedIcon() {
        return '<svg viewBox="0 0 24 24">' +
            '<path d="M4 9v6h4l5 4V5L8 9H4z"/>' +
            '<path class="lta7-muted-x" d="M17 8.5l4.5 7m0-7l-4.5 7" fill="none" stroke-width="2.4" stroke-linecap="round"/>' +
            '</svg>';
    }

    function soundIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm12 3c0-1.3-.7-2.5-1.8-3.1v2.3c.5.3.8.7.8 1.2s-.3.9-.8 1.2v2.3c1.1-.6 1.8-2.7 1.8-3.1zm0-6v2.1c1.8.9 3 2.7 3 4.9s-1.2 4-3 4.9V20c3-1.1 5-3.9 5-7s-2-5.9-5-7z"/></svg>';
    }

    function playIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M8 5.5v13L19 12 8 5.5z"/></svg>';
    }

    function pauseIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
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

    function showPlayPause(duration) {
        if (!current || !current.playpause) return;
        if (current.playpauseTimer) clearTimeout(current.playpauseTimer);
        current.playpause.innerHTML = current.playing ? pauseIcon() : playIcon();
        current.playpause.setAttribute('aria-label', current.playing ? 'Пауза' : 'Воспроизведение');
        current.playpause.classList.add('visible');
        if (duration !== 0) {
            current.playpauseTimer = setTimeout(function() {
                if (current && current.playpause) current.playpause.classList.remove('visible');
            }, duration || 1200);
        }
    }

    function syncPlayPause() {
        if (!current || !current.playpause) return;
        current.playpause.innerHTML = current.playing ? pauseIcon() : playIcon();
        current.playpause.setAttribute('aria-label', current.playing ? 'Пауза' : 'Воспроизведение');
    }

    function cleanup() {
        if (!current) return;

        if (current.timer) clearTimeout(current.timer);
        if (current.readyTimer) clearTimeout(current.readyTimer);
        if (current.unlockTimer) clearTimeout(current.unlockTimer);
        if (current.playpauseTimer) clearTimeout(current.playpauseTimer);
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

        if (current.tapzone) {
            try { current.tapzone.remove(); } catch(e) {}
        }
        if (current.playpause) {
            try { current.playpause.remove(); } catch(e) {}
        }

        if (current.host) {
            current.host.classList.remove('lta7-host');
        }

        current = null;
    }

    function reveal() {
        if (!current) return;
        current.frame.classList.add('visible');
        showSound();
    }

    function reloadForSound(wantSound) {
        if (!current || current.reloading || !current.frame) return;

        current.reloading = true;
        current.targetSoundOn = !!wantSound;

        var oldFrame = current.frame;
        var oldBridgeId = current.bridgeId;
        var position = current.currentTime || 0;
        var newBridgeId = 'lta7_' + Math.random().toString(36).slice(2);

        /*
         * IMPORTANT:
         * Do NOT hide/remove the current player while the new one loads.
         * This was the exact reason the trailer disappeared in v7.
         *
         * We create a second clean Lampa youtube.html bridge over the first
         * one. Only after the second bridge reports "ready" do we replace
         * the old frame.
         */
        var newFrame = document.createElement('iframe');
        newFrame.className = 'lta7-video';
        newFrame.setAttribute('frameborder', '0');
        newFrame.setAttribute('allowfullscreen', 'true');
        newFrame.setAttribute(
            'allow',
            'autoplay; encrypted-media; picture-in-picture'
        );

        newFrame.style.opacity = '0';
        newFrame.style.zIndex = '2';
        newFrame.style.position = 'absolute';
        newFrame.style.pointerEvents = 'none';
        newFrame.style.visibility = 'hidden';
        newFrame.src = bridgeUrl(
            current.videoId,
            newBridgeId,
            !wantSound,
            position
        );

        current.host.appendChild(newFrame);

        current.pendingFrame = newFrame;
        current.pendingBridgeId = newBridgeId;

        function pendingMessage(event) {
            if (!current || current.pendingFrame !== newFrame) return;
            if (event.source !== newFrame.contentWindow) return;
            if (!event.data || event.data.bridgeId !== newBridgeId) return;

            var type = event.data.type;
            var d = event.data.data || {};

            if (type === 'bridgeReady') {
                current.pendingWindow = newFrame.contentWindow;
                return;
            }

            if (type === 'ready') {
                /*
                 * Ready is not enough to swap: the new player can still be
                 * black/loading. Keep the old player visible and start the
                 * replacement. The actual swap happens on state=1.
                 */
                current.pendingWindow = current.pendingWindow || newFrame.contentWindow;

                try {
                    current.pendingWindow.postMessage({
                        bridgeId: newBridgeId,
                        type: 'play',
                        data: {}
                    }, '*');
                } catch(e) {}

                return;
            }

            if (type === 'stateChange' && d.state === 1) {
                /*
                 * The replacement is genuinely playing.
                 * Crossfade it over the old player instead of creating a
                 * visible one-second hole.
                 */
                newFrame.style.visibility = 'visible';
                newFrame.style.display = 'block';
                newFrame.style.zIndex = '2';
                newFrame.classList.add('visible');
                newFrame.style.opacity = '1';

                current.frame = newFrame;
                current.frameWindow = current.pendingWindow || newFrame.contentWindow;
                current.bridgeId = newBridgeId;
                current.soundOn = !!wantSound;
                current.currentTime = position;
                current.pendingFrame = null;
                current.pendingBridgeId = null;
                current.pendingWindow = null;

                current.sound.innerHTML = wantSound ? soundIcon() : mutedIcon();
                current.sound.setAttribute(
                    'aria-label',
                    wantSound ? 'Выключить звук' : 'Включить звук'
                );
                current.playing = true;
                if (current.tapzone) current.tapzone.setAttribute('aria-label', 'Пауза');
                syncPlayPause();
                showPlayPause(800);

                window.removeEventListener('message', pendingMessage, true);

                /*
                 * Let the two identical players overlap briefly. The new one
                 * is already playing, so the user sees a seamless transition.
                 */
                oldFrame.style.transition = 'opacity .25s ease';
                oldFrame.style.opacity = '0';

                setTimeout(function() {
                    try { oldFrame.remove(); } catch(e) {}
                    if (current) current.reloading = false;
                }, 280);

                return;
            }

            if (type === 'error') {
                /*
                 * If unmuted autoplay is rejected, keep the old muted player
                 * alive instead of returning to the poster.
                 */
                window.removeEventListener('message', pendingMessage, true);
                try { newFrame.remove(); } catch(e) {}

                current.pendingFrame = null;
                current.pendingBridgeId = null;
                current.pendingWindow = null;
                current.reloading = false;
                return;
            }
        }

        window.addEventListener('message', pendingMessage, true);

        /*
         * Safety timeout: never destroy the working old player because the
         * replacement did not load.
         */
        current.unlockTimer = setTimeout(function() {
            if (!current || current.pendingFrame !== newFrame) return;

            window.removeEventListener('message', pendingMessage, true);
            try { newFrame.remove(); } catch(e) {}

            current.pendingFrame = null;
            current.pendingBridgeId = null;
            current.pendingWindow = null;
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
        var bridgeId = 'lta7_' + Math.random().toString(36).slice(2);

        var frame = document.createElement('iframe');
        frame.className = 'lta7-video';
        frame.setAttribute('frameborder', '0');
        frame.setAttribute('allowfullscreen', 'true');
        frame.setAttribute(
            'allow',
            'autoplay; encrypted-media; picture-in-picture'
        );
        frame.src = bridgeUrl(trailer.key, bridgeId, true, 0);

        var sound = document.createElement('button');
        sound.type = 'button';
        sound.className = 'lta7-sound';
        sound.innerHTML = mutedIcon();
        sound.setAttribute('aria-label', 'Включить звук');

        var tapzone = document.createElement('button');
        tapzone.type = 'button';
        tapzone.className = 'lta7-tapzone';
        tapzone.setAttribute('aria-label', 'Пауза');

        var playpause = document.createElement('button');
        playpause.type = 'button';
        playpause.className = 'lta7-playpause';
        playpause.innerHTML = pauseIcon();
        playpause.setAttribute('aria-label', 'Пауза');

        host.classList.add('lta7-host');
        host.appendChild(frame);
        host.appendChild(tapzone);
        host.appendChild(playpause);
        document.body.appendChild(sound);

        current = {
            host: host,
            frame: frame,
            frameWindow: null,
            bridgeId: bridgeId,
            videoId: trailer.key,
            sound: sound,
            soundOn: false,
            currentTime: 0,
            timer: null,
            readyTimer: null,
            unlockTimer: null,
            reloading: false,
            pendingFrame: null,
            pendingBridgeId: null,
            pendingWindow: null,
            targetSoundOn: false,
            playing: false,
            tapzone: tapzone,
            playpause: playpause,
            playpauseTimer: null,
        };

        current.positionHandler = positionSound;
        window.addEventListener('resize', current.positionHandler);
        window.addEventListener('scroll', current.positionHandler, true);

        /*
         * ВАЖНО:
         * listener стоит на CAPTURE-фазе и на самой кнопке.
         * Это не даёт Lampa selector/event system перехватить касание.
         */
        current.togglePlayback = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();

            if (!current || current.reloading || !current.frameWindow) return;

            if (current.playing) {
                send('pause');
                // Optimistic UI: show pause tap result as a PLAY icon.
                current.playing = false;
                tapzone.setAttribute('aria-label', 'Воспроизведение');
            } else {
                send('play');
                current.playing = true;
                tapzone.setAttribute('aria-label', 'Пауза');
            }
            syncPlayPause();
            showPlayPause(1200);
        };

        tapzone.addEventListener('pointerup', current.togglePlayback, {
            capture: true,
            passive: false
        });

        tapzone.addEventListener('touchend', current.togglePlayback, {
            capture: true,
            passive: false
        });

        playpause.addEventListener('pointerup', current.togglePlayback, {
            capture: true,
            passive: false
        });

        playpause.addEventListener('touchend', current.togglePlayback, {
            capture: true,
            passive: false
        });

        current.toggleSound = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();

            if (!current || current.sound !== sound || current.reloading) return;

            var wantSound = !current.soundOn;

            // When switching sound OFF, silence the currently visible player
            // immediately. The replacement remains muted as well.
            if (!wantSound && current.frameWindow) {
                try {
                    current.frameWindow.postMessage({
                        bridgeId: current.bridgeId,
                        type: 'setVolume',
                        data: { volume: 0 }
                    }, '*');
                } catch(e) {}
            }

            reloadForSound(wantSound);
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

        current.messageHandler = function(event) {
            if (!current || event.source !== frame.contentWindow) return;
            if (!event.data || event.data.bridgeId !== current.bridgeId) return;

            var type = event.data.type;
            var d = event.data.data || {};

            if (type === 'bridgeReady') {
                current.frameWindow = frame.contentWindow;
                return;
            }

            if (type === 'ready') {
                if (current.readyTimer) clearTimeout(current.readyTimer);

                // Первичная загрузка: через 2 секунды.
                // После переключения звука — сразу.
                var wait = current.reloading ? 0 : DELAY;

                current.timer = setTimeout(function() {
                    if (!current || current.frame !== frame) return;

                    reveal();
                    send('play');

                    current.playing = true;
                    tapzone.setAttribute('aria-label', 'Пауза');
                    syncPlayPause();
                    showPlayPause(1100);

                    current.reloading = false;
                }, wait);

                return;
            }

            if (type === 'time') {
                if (typeof d.currentTime === 'number') {
                    current.currentTime = d.currentTime;
                }
                positionSound();
                return;
            }

            if (type === 'stateChange') {
                // 1 = playing.
                if (d.state === 1) {
                    reveal();
                    current.playing = true;
                    tapzone.setAttribute('aria-label', 'Пауза');
                    syncPlayPause();
                    current.reloading = false;
                }

                if (d.state === 2) {
                    current.playing = false;
                    tapzone.setAttribute('aria-label', 'Воспроизведение');
                    syncPlayPause();
                    showPlayPause(1200);
                    }

                // 0 = ended.
                if (d.state === 0 && !current.reloading) {
                    cleanup();
                }
                return;
            }

            if (type === 'error') {
                // При ошибке возвращаем обычный постер.
                cleanup();
            }
        };

        window.addEventListener('message', current.messageHandler, true);

        frame.onload = function() {
            if (current && current.frame === frame) {
                try { current.frameWindow = frame.contentWindow; } catch(e) {}
            }
        };
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
        console.log('[Trailer Autoplay] v18 started');
    }

    if (window.Lampa && Lampa.Listener) {
        start();
    } else {
        setTimeout(start, 1500);
    }
})();
