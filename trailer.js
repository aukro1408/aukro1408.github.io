(function () {
    'use strict';

    var STYLE_ID = 'lampa_trailer_autoplay_style';
    var current = null;

    var CONFIG = {
        delay: 2000,
        enabled: true
    };

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .lta-poster-wrap {
                position: relative !important;
                overflow: hidden !important;
            }

            .lta-video {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: 0 !important;
                opacity: 0;
                pointer-events: none;
                background: #000;
                z-index: 10;
                transition: opacity .55s ease;
            }

            .lta-video.lta-visible {
                opacity: 1;
            }

            .lta-sound {
                position: absolute !important;
                right: 12px !important;
                bottom: 12px !important;
                width: 44px !important;
                height: 44px !important;
                min-width: 44px !important;
                padding: 0 !important;
                border: 0 !important;
                border-radius: 50% !important;
                background: rgba(20,20,20,.78) !important;
                color: #fff !important;
                z-index: 20 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                opacity: 0;
                transform: scale(.9);
                pointer-events: none;
                transition: opacity .3s ease, transform .3s ease;
            }

            .lta-sound.lta-visible {
                opacity: 1;
                transform: scale(1);
                pointer-events: auto;
            }

            .lta-sound svg {
                width: 23px;
                height: 23px;
                fill: currentColor;
            }
        `;
        document.head.appendChild(style);
    }

    function iconMuted() {
        return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm11 1.1v3.8c.6-.5 1-1.1 1-1.9s-.4-1.4-1-1.9zM17 7.2v2.1c1.2.7 2 1.8 2 3.2s-.8 2.5-2 3.2v2.1c2.3-.9 4-2.9 4-5.3s-1.7-4.4-4-5.3z"/></svg>';
    }

    function iconSound() {
        return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm12 3c0-1.3-.7-2.5-1.8-3.1v2.3c.5.3.8.7.8 1.2s-.3.9-.8 1.2v2.3c1.1-.6 1.8-1.8 1.8-3.1zm0-6v2.1c1.8.9 3 2.7 3 4.9s-1.2 4-3 4.9V20c3-1.1 5-3.9 5-7s-2-5.9-5-7z"/></svg>';
    }

    function getVideos(data) {
        if (!data || !data.videos) return [];

        var videos = data.videos.results || data.videos;
        if (!Array.isArray(videos)) return [];

        return videos.filter(function (v) {
            return v && v.key;
        });
    }

    function getLang() {
        try {
            var lang = Lampa.Storage.field('language');
            if (lang) return String(lang).toLowerCase();
        } catch (e) {}

        return 'ru';
    }

    function chooseTrailer(data) {
        var videos = getVideos(data);
        if (!videos.length) return null;

        var lang = getLang().split('-')[0];

        function trailers(list) {
            return list.filter(function (v) {
                return String(v.type || '').toLowerCase() === 'trailer';
            });
        }

        var local = trailers(videos.filter(function (v) {
            return String(v.iso_639_1 || '').toLowerCase() === lang;
        }));

        if (local.length) return local[0];

        var english = trailers(videos.filter(function (v) {
            return String(v.iso_639_1 || '').toLowerCase() === 'en';
        }));

        if (english.length) return english[0];

        return trailers(videos)[0] || videos[0];
    }

    function send(type, data) {
        if (!current || !current.frameWindow) return;

        try {
            current.frameWindow.postMessage({
                bridgeId: current.bridgeId,
                type: type,
                data: data || {}
            }, '*');
        } catch (e) {}
    }

    function cleanup() {
        if (!current) return;

        if (current.timer) {
            clearTimeout(current.timer);
            current.timer = null;
        }

        if (current.frame) {
            try {
                current.frameWindow.postMessage({
                    bridgeId: current.bridgeId,
                    type: 'destroy',
                    data: {}
                }, '*');
            } catch (e) {}

            try {
                current.frame.remove();
            } catch (e) {}
        }

        if (current.host) {
            current.host.classList.remove('lta-poster-wrap');
        }

        current = null;
    }

    function createTrailer(body, data) {
        cleanup();

        if (!CONFIG.enabled) return;

        var poster = body.find('.full-start-new__poster').first();
        if (!poster.length) return;

        var trailer = chooseTrailer(data);
        if (!trailer || !trailer.key) return;

        var host = poster[0];

        var bridgeBase = '';

        try {
            bridgeBase = Lampa.Manifest.github_lampa;
        } catch (e) {}

        if (!bridgeBase) {
            bridgeBase = 'https://yumata.github.io/lampa/';
        }

        if (bridgeBase.slice(-1) !== '/') bridgeBase += '/';

        var bridgeId = 'lta_' + Math.random().toString(36).slice(2);

        var frame = document.createElement('iframe');
        frame.className = 'lta-video';
        frame.setAttribute('frameborder', '0');
        frame.setAttribute('allowfullscreen', 'true');
        frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');

        var url = bridgeBase + 'youtube.html' +
            '?bridgeId=' + encodeURIComponent(bridgeId) +
            '&videoId=' + encodeURIComponent(trailer.key) +
            '&autoplay=1' +
            '&controls=0' +
            '&mute=1' +
            '&start=0';

        frame.src = url;

        var sound = document.createElement('button');
        sound.type = 'button';
        sound.className = 'lta-sound';
        sound.innerHTML = iconMuted();
        sound.setAttribute('aria-label', 'Включить звук');

        host.classList.add('lta-poster-wrap');
        host.appendChild(frame);
        host.appendChild(sound);

        current = {
            host: host,
            frame: frame,
            frameWindow: null,
            bridgeId: bridgeId,
            timer: null,
            sound: sound,
            soundOn: false
        };

        frame.onload = function () {
            if (!current || current.frame !== frame) return;

            try {
                current.frameWindow = frame.contentWindow;
            } catch (e) {}

            // youtube.html отправит bridgeReady.
            // После него задаём начальную громкость.
        };

        sound.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!current || current.frame !== frame) return;

            current.soundOn = !current.soundOn;

            if (current.soundOn) {
                send('setVolume', { volume: 100 });
                sound.innerHTML = iconSound();
                sound.setAttribute('aria-label', 'Выключить звук');
            } else {
                send('setVolume', { volume: 0 });
                sound.innerHTML = iconMuted();
                sound.setAttribute('aria-label', 'Включить звук');
            }
        });

        var onMessage = function (event) {
            if (!current || event.source !== frame.contentWindow) return;
            if (!event.data || event.data.bridgeId !== bridgeId) return;

            if (event.data.type === 'bridgeReady') {
                current.frameWindow = frame.contentWindow;

                send('init', { volume: 0 });
                send('play');
            }

            if (event.data.type === 'error') {
                // Ошибка YouTube — возвращаем обычный постер.
                cleanup();
            }
        };

        current.onMessage = onMessage;
        window.addEventListener('message', onMessage);

        current.timer = setTimeout(function () {
            if (!current || current.frame !== frame) return;

            frame.classList.add('lta-visible');
            sound.classList.add('lta-visible');

            send('play');
        }, CONFIG.delay);
    }

    function onFull(e) {
        if (!e || e.type !== 'complite') return;
        if (!e.body || !e.data) return;

        createTrailer(e.body, e.data);
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

        console.log('[Trailer Autoplay] v2 started');
    }

    if (window.Lampa && Lampa.Listener) {
        start();
    } else {
        setTimeout(start, 1500);
    }
})();
