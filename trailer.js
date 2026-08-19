(function () {
    'use strict';

    var STYLE_ID = 'lampa_trailer_autoplay_v27_no_sound_button_style';
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
        `;
        document.head.appendChild(s);
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
    function cleanup() {
        if (!current) return;

        if (current.timer) clearTimeout(current.timer);
        if (current.readyTimer) clearTimeout(current.readyTimer);
        if (current.unlockTimer) clearTimeout(current.unlockTimer);
        if (current.messageHandler) {
            window.removeEventListener('message', current.messageHandler, true);
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


        if (current.host) {
            current.host.classList.remove('lta7-host');
        }

        current = null;
    }

    function reveal() {
        if (!current) return;
        current.frame.classList.add('visible');
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
        host.classList.add('lta7-host');
        host.appendChild(frame);

        current = {
            host: host,
            frame: frame,
            frameWindow: null,
            bridgeId: bridgeId,
            videoId: trailer.key,
            currentTime: 0,
            startedAt: 0,
            timer: null,
            readyTimer: null,
            unlockTimer: null,
            playing: false,
        };

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
        console.log('[Trailer Autoplay] v27 started — sound button removed');
    }

    if (window.Lampa && Lampa.Listener) {
        start();
    } else {
        setTimeout(start, 1500);
    }
})();
