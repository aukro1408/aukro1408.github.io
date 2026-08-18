(function () {
    'use strict';

    var STYLE_ID = 'lampa_trailer_autoplay_v10_style';
    var current = null;
    var DELAY = 2000;

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
            .lta10-host {
                position: relative !important;
                overflow: hidden !important;
                isolation: isolate !important;
            }

            .lta10-video {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: 0 !important;
                background: #000 !important;
                opacity: 0 !important;
                z-index: 5 !important;
                pointer-events: none !important;
                transition: opacity .45s ease !important;
            }

            .lta10-video.visible {
                opacity: 1 !important;
            }

            .lta10-sound {
                position: absolute !important;
                right: 12px !important;
                bottom: 12px !important;
                left: auto !important;
                top: auto !important;
                width: 46px !important;
                height: 46px !important;
                min-width: 46px !important;
                padding: 0 !important;
                margin: 0 !important;
                border: 0 !important;
                border-radius: 50% !important;
                background: rgba(20,20,20,.82) !important;
                color: #fff !important;
                z-index: 50 !important;
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

            .lta10-sound.visible {
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            .lta10-sound:active {
                transform: scale(.92) !important;
            }

            .lta10-sound svg {
                width: 24px !important;
                height: 24px !important;
                fill: currentColor !important;
                pointer-events: none !important;
            }

            /* Never allow YouTube UI to become visible over the clean player. */
            .lta10-video::-webkit-media-controls {
                display: none !important;
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
        return Array.isArray(list) ? list.filter(function (v) {
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
        } catch (e) {}

        function trailers(a) {
            return a.filter(function (v) {
                return String(v.type || '').toLowerCase() === 'trailer';
            });
        }

        var local = trailers(list.filter(function (v) {
            return String(v.iso_639_1 || '').toLowerCase() === lang;
        }));
        if (local.length) return local[0];

        var en = trailers(list.filter(function (v) {
            return String(v.iso_639_1 || '').toLowerCase() === 'en';
        }));
        if (en.length) return en[0];

        return trailers(list)[0] || list[0];
    }

    function getOrigin() {
        try {
            if (location.origin && location.origin !== 'null') {
                return location.origin;
            }
        } catch (e) {}

        return 'https://lampa.li';
    }

    function youtubeUrl(videoId) {
        var origin = getOrigin();

        return 'https://www.youtube.com/embed/' +
            encodeURIComponent(videoId) +
            '?autoplay=1' +
            '&mute=1' +
            '&controls=0' +
            '&playsinline=1' +
            '&rel=0' +
            '&modestbranding=1' +
            '&iv_load_policy=3' +
            '&disablekb=1' +
            '&enablejsapi=1' +
            '&origin=' + encodeURIComponent(origin) +
            '&widget_referrer=' + encodeURIComponent(location.href || origin);
    }

    function sendYouTube(command, args) {
        if (!current || !current.frame || !current.frame.contentWindow) return;

        try {
            current.frame.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: command,
                args: args || []
            }), 'https://www.youtube.com');
        } catch (e) {}

        // Some WebViews are less strict about targetOrigin.
        try {
            current.frame.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: command,
                args: args || []
            }), '*');
        } catch (e) {}
    }

    function cleanup() {
        if (!current) return;

        if (current.timer) clearTimeout(current.timer);

        if (current.messageHandler) {
            window.removeEventListener('message', current.messageHandler, true);
        }

        if (current.frame) {
            try {
                current.frame.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: 'stopVideo',
                    args: []
                }), '*');
            } catch (e) {}

            try { current.frame.remove(); } catch (e) {}
        }

        if (current.sound) {
            try { current.sound.remove(); } catch (e) {}
        }

        if (current.host) {
            current.host.classList.remove('lta10-host');
        }

        current = null;
    }

    function create(body, data) {
        cleanup();

        var trailer = chooseTrailer(data);
        if (!trailer) return;

        var poster = body.find('.full-start-new__poster').first();
        if (!poster.length) return;

        var host = poster[0];

        var frame = document.createElement('iframe');
        frame.className = 'lta10-video';
        frame.setAttribute('frameborder', '0');
        frame.setAttribute('allowfullscreen', 'true');
        frame.setAttribute(
            'allow',
            'autoplay; encrypted-media; picture-in-picture'
        );
        frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        frame.src = youtubeUrl(trailer.key);

        var sound = document.createElement('button');
        sound.type = 'button';
        sound.className = 'lta10-sound';
        sound.innerHTML = mutedIcon();
        sound.setAttribute('aria-label', 'Включить звук');

        host.classList.add('lta10-host');
        host.appendChild(frame);
        host.appendChild(sound);

        current = {
            host: host,
            frame: frame,
            sound: sound,
            soundOn: false,
            timer: null,
            ready: false
        };

        /*
         * We use YouTube's IFrame API postMessage directly.
         * The iframe itself cannot receive pointer input, so our button
         * is always the only touch target in the lower-right corner.
         */
        current.toggleSound = function (e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            }

            if (!current || current.sound !== sound) return;

            current.soundOn = !current.soundOn;

            if (current.soundOn) {
                sendYouTube('unMute');
                sendYouTube('setVolume', [100]);

                sound.innerHTML = soundIcon();
                sound.setAttribute('aria-label', 'Выключить звук');
            } else {
                sendYouTube('mute');
                sound.innerHTML = mutedIcon();
                sound.setAttribute('aria-label', 'Включить звук');
            }
        };

        sound.addEventListener('pointerdown', current.toggleSound, {
            capture: true,
            passive: false
        });

        sound.addEventListener('touchstart', current.toggleSound, {
            capture: true,
            passive: false
        });

        sound.addEventListener('click', current.toggleSound, true);

        current.messageHandler = function (event) {
            if (!current || event.source !== frame.contentWindow) return;

            var data = event.data;

            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch (e) {}
            }

            if (!data) return;

            /*
             * YouTube player state:
             * -1 unstarted
             *  0 ended
             *  1 playing
             *  2 paused
             *  3 buffering
             *  5 cued
             */
            if (data.event === 'onReady') {
                current.ready = true;
                return;
            }

            if (data.event === 'onStateChange' && data.info === 1) {
                if (!current) return;

                frame.classList.add('visible');
                sound.classList.add('visible');
            }

            if (data.event === 'onError') {
                /*
                 * Do not destroy the poster immediately on an API error.
                 * Error handling is intentionally conservative.
                 */
                console.log('[Trailer Autoplay] YouTube error:', data.info);
            }
        };

        window.addEventListener('message', current.messageHandler, true);

        frame.onload = function () {
            if (!current || current.frame !== frame) return;

            // Give the YouTube player a moment to initialize, then request play.
            current.timer = setTimeout(function () {
                if (!current || current.frame !== frame) return;

                frame.classList.add('visible');
                sound.classList.add('visible');

                sendYouTube('playVideo');
            }, DELAY);
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

        console.log('[Trailer Autoplay] v10 started');
    }

    if (window.Lampa && Lampa.Listener) {
        start();
    } else {
        setTimeout(start, 1500);
    }
})();
