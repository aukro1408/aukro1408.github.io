(function () {
    'use strict';

    var STYLE_ID = 'lampa_trailer_autoplay_v26_style';
    var current = null;
    var DELAY = 2000;
    var activityGuard = null;

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
            /* Trailer is only a media/background layer. It must never sit
               above Lampa's title, ratings or metadata. */
            .lta7-host {
                position: relative !important;
                overflow: hidden !important;
                z-index: 0 !important;
                isolation: isolate !important;
            }

            .lta7-video {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: 0 !important;
                background: #000 !important;
                opacity: 0 !important;
                z-index: 0 !important;
                pointer-events: none !important;
                transition: opacity .25s ease !important;
            }

            .lta7-video.visible {
                opacity: 1 !important;
            }

            /* Playback-only video layer. No taps are sent to the iframe, so
               YouTube's native Play/Pause overlay can never appear.
               The only interactive control is our separate sound button. */
            .lta7-host > .lta7-video {
                z-index: 0 !important;
                pointer-events: none !important;
                user-select: none !important;
                -webkit-user-select: none !important;
            }

            /* Known Lampa foreground blocks. */
            /* Lampa information always renders above the trailer. */
            .full-start-new__title,
            .full-start-new__name,
            .full-start-new__descr,
            .full-start-new__subtitle,
            .full-start-new__tagline,
            .full-start-new__details,
            .full-start-new__head,
            .full-start-new__buttons,
            .full-start-new__rating,
            .full-start-new__ratings,
            .full-start-new__meta,
            .full-start-new__info,
            .full-start-new__content,
            .full-start__title,
            .full-start__name,
            .full-start__descr,
            .full-start__subtitle,
            .full-start__tagline,
            .full-start__details,
            .full-start__head,
            .full-start__buttons,
            .full-start__rating,
            .full-start__ratings,
            .full-start__meta,
            .full-start__info,
            .full-start__content {
                position: relative !important;
                z-index: 5 !important;
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
        if (!current || !current.sound) return;

        var target = current.frame || current.pendingFrame || current.host;
        var rect = target.getBoundingClientRect();
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

        if (current.timer) clearTimeout(current.timer);
        if (current.readyTimer) clearTimeout(current.readyTimer);
        if (current.unlockTimer) clearTimeout(current.unlockTimer);
        if (current.messageHandler) {
            window.removeEventListener('message', current.messageHandler, true);
        }

        if (current.positionHandler) {
            window.removeEventListener('resize', current.positionHandler);
            window.removeEventListener('scroll', current.positionHandler, true);
        }

        if (current.frameWindow) {
            try {
                current.frameWindow.postMessage({
                    bridgeId: current.bridgeId,
                    type: 'pause',
                    data: {}
                }, '*');
            } catch(e) {}
        }

        if (current.frame) {
            try { current.frame.remove(); } catch(e) {}
        }

        if (current.sound) {
            try { current.sound.remove(); } catch(e) {}
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

    function getPlaybackPosition() {
        if (!current) return 0;

        var position = Number(current.currentTime) || 0;

        // The bridge sends time updates periodically. Between updates, keep
        // the missing fraction from the local clock so mute/unmute never
        // jumps back to the last reported second (or to 0).
        if (current.playing && current.startedAt) {
            position += Math.max(0, (Date.now() - current.startedAt) / 1000);
        }

        return Math.max(0, position);
    }

    function reloadForSound(wantSound) {
        if (!current || !current.frameWindow) return;

        /*
         * IMPORTANT: never create/reload another iframe when sound changes.
         * The previous versions did exactly that and caused the trailer to
         * restart, overlap itself and briefly disappear.
         *
         * We keep ONE YouTube bridge for the entire lifetime of the card and
         * only change its volume. This also preserves the exact playback
         * position and the native Play/Pause state.
         */
        current.soundOn = !!wantSound;
        current.sound.innerHTML = wantSound ? soundIcon() : mutedIcon();
        current.sound.setAttribute(
            'aria-label',
            wantSound ? 'Выключить звук' : 'Включить звук'
        );

        /*
         * ВАЖНО: одного 'setVolume' часто недостаточно.
         * У YouTube IFrame Player API громкость (volume) и флаг
         * muted — это два разных состояния. setVolume(100) НЕ снимает
         * mute, если плеер был замьючен через mute()/параметр mute=1.
         * Поэтому дублируем команду в нескольких вариантах, которые
         * мог реализовать бридж (youtube.html):
         */
        send('setVolume', { volume: wantSound ? 100 : 0 });
        send(wantSound ? 'unMute' : 'mute', {});
        send('setMuted', { muted: !wantSound });
        send('volume', { value: wantSound ? 100 : 0 });
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

        host.classList.add('lta7-host');
        host.appendChild(frame);
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
            startedAt: 0,
            timer: null,
            readyTimer: null,
            unlockTimer: null,
            playing: false,
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

            if (!current || current.sound !== sound) return;

            var wantSound = !current.soundOn;
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
                var wait = DELAY;

                current.timer = setTimeout(function() {
                    if (!current || current.frame !== frame) return;

                    reveal();
                    send('play');
                    if (current.soundOn) reloadForSound(true);

                    current.playing = true;
                    current.startedAt = Date.now();

                }, wait);

                return;
            }

            if (type === 'time') {
                if (typeof d.currentTime === 'number') {
                    current.currentTime = d.currentTime;
                    if (current.playing) current.startedAt = Date.now();
                }
                positionSound();
                return;
            }

            if (type === 'stateChange') {
                // 1 = playing.
                if (d.state === 1) {
                    reveal();
                    current.playing = true;
                    current.startedAt = Date.now();
                }

                if (d.state === 2) {
                    current.currentTime = getPlaybackPosition();
                    current.playing = false;
                    current.startedAt = 0;
                }

                // 0 = ended.
                if (d.state === 0) {
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

    function startActivityGuard() {
        if (activityGuard) return;

        activityGuard = setInterval(function() {
            if (!current) return;

            try {
                if (!Lampa || !Lampa.Activity || !Lampa.Activity.active) return;

                var active = Lampa.Activity.active();
                var component = active && active.component;

                // The trailer belongs only to the full/card activity.
                // If the user leaves the card, destroy the iframe immediately.
                if (component && component !== 'full') {
                    cleanup();
                }
            } catch(e) {}
        }, 250);
    }

    function onFull(e) {
        if (!e || e.type !== 'complite' || !e.body || !e.data) return;
        create(e.body, e.data);
    }

    function onActivity(e) {
        if (!e || e.type !== 'destroy') return;

        if (e.component === 'full' || (current && e.object && e.object.component === 'full')) {
            cleanup();
            return;
        }

        // Some Lampa builds omit component on destroy.
        try {
            var active = Lampa.Activity.active();
            if (!active || active.component !== 'full') cleanup();
        } catch(err) {}
    }

    function start() {
        if (!window.Lampa || !Lampa.Listener) return;
        addStyle();
        Lampa.Listener.follow('full', onFull);
        Lampa.Listener.follow('activity', onActivity);
        startActivityGuard();
        console.log('[Trailer Autoplay] v26 started');
    }

    if (window.Lampa && Lampa.Listener) {
        start();
    } else {
        setTimeout(start, 1500);
    }
})();
