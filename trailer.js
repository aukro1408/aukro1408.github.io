(function () {
    'use strict';

    var STYLE_ID = 'lampa_trailer_autoplay_v5_style';
    var current = null;
    var DELAY = 2000;

    function style() {
        if (document.getElementById(STYLE_ID)) return;

        var s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
            .lta3-host {
                position: relative !important;
                overflow: hidden !important;
            }
            .full-start-new__left {
                position: relative !important;
                z-index: 1 !important;
            }
            .full-start-new__right {
                position: relative !important;
                z-index: 20 !important;
            }
            .lta3-host {
                z-index: 1 !important;
            }
            .lta3-video {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: 0 !important;
                opacity: 0;
                background: #000;
                z-index: 1 !important;
                transition: opacity .5s ease;
            }
            .lta3-video.visible { opacity: 1; }
            .lta3-sound {
                position: absolute !important;
                right: 12px !important;
                bottom: 12px !important;
                width: 44px !important;
                height: 44px !important;
                min-width: 44px !important;
                padding: 0 !important;
                border: 0 !important;
                border-radius: 50% !important;
                background: rgba(20,20,20,.82) !important;
                color: #fff !important;
                z-index: 5 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                opacity: 0;
                pointer-events: none;
                transition: opacity .3s ease;
            }
            .lta3-sound.visible {
                opacity: 1;
                pointer-events: auto;
            }
            .lta3-sound svg { width: 23px; height: 23px; fill: currentColor; }        `;
        document.head.appendChild(s);
    }

    function mutedIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm11 1.1v3.8c.6-.5 1-1.1 1-1.9s-.4-1.4-1-1.9zM17 7.2v2.1c1.8.9 3 2.7 3 4.9s-1.2 4-3 4.9V21c3-1.1 5-3.9 5-6.8s-2-5.9-5-7z"/></svg>';
    }

    function soundIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm12 3c0-1.3-.7-2.5-1.8-3.1v2.3c.5.3.8.7.8 1.2s-.3.9-.8 1.2v2.3c1.1-.6 1.8-1.8 1.8-3.1zm0-6v2.1c1.8.9 3 2.7 3 4.9s-1.2 4-3 4.9V20c3-1.1 5-3.9 5-7s-2-5.9-5-7z"/></svg>';
    }

    function videos(data) {
        if (!data || !data.videos) return [];
        var list = data.videos.results || data.videos;
        return Array.isArray(list) ? list.filter(function(v){ return v && v.key; }) : [];
    }

    function choose(data) {
        var list = videos(data);
        if (!list.length) return null;

        var lang = 'ru';
        try {
            lang = String(Lampa.Storage.field('language') || 'ru').toLowerCase().split('-')[0];
        } catch(e) {}

        function trailers(a) {
            return a.filter(function(v){ return String(v.type || '').toLowerCase() === 'trailer'; });
        }

        var local = trailers(list.filter(function(v){
            return String(v.iso_639_1 || '').toLowerCase() === lang;
        }));
        if (local.length) return local[0];

        var en = trailers(list.filter(function(v){
            return String(v.iso_639_1 || '').toLowerCase() === 'en';
        }));
        if (en.length) return en[0];

        return trailers(list)[0] || list[0];
    }

    function bridgeUrl(videoId, bridgeId) {
        var base = '';
        try { base = Lampa.Manifest.github_lampa; } catch(e) {}
        if (!base) base = 'https://yumata.github.io/lampa/';
        if (base.charAt(base.length - 1) !== '/') base += '/';

        return base + 'youtube.html' +
            '?bridgeId=' + encodeURIComponent(bridgeId) +
            '&videoId=' + encodeURIComponent(videoId) +
            '&autoplay=0' +
            '&controls=0' +
            '&mute=1' +
            '&start=0';
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

        if (current.messageHandler) {
            window.removeEventListener('message', current.messageHandler);
        }

        if (current.frame) {
            try { current.frame.remove(); } catch(e) {}
        }

        if (current.host) {
            current.host.classList.remove('lta3-host');
        }

        current = null;
    }

    function reveal() {
        if (!current || current.revealed) return;

        current.revealed = true;
        current.frame.classList.add('visible');
        current.sound.classList.add('visible');
    }

    function create(body, data) {
        cleanup();

        var trailer = choose(data);
        if (!trailer) return;

        var poster = body.find('.full-start-new__poster').first();
        if (!poster.length) return;

        var host = poster[0];
        var bridgeId = 'lta3_' + Math.random().toString(36).slice(2);

        var frame = document.createElement('iframe');
        frame.className = 'lta3-video';
        frame.setAttribute('frameborder', '0');
        frame.setAttribute('allowfullscreen', 'true');
        frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
        frame.src = bridgeUrl(trailer.key, bridgeId);

        var sound = document.createElement('button');
        sound.type = 'button';
        sound.className = 'lta3-sound';
        sound.innerHTML = mutedIcon();
        sound.setAttribute('aria-label', 'Включить звук');
        host.classList.add('lta3-host');
        host.appendChild(frame);
        host.appendChild(sound);
        current = {
            host: host,
            frame: frame,
            frameWindow: null,
            bridgeId: bridgeId,
            sound: sound,            timer: null,
            readyTimer: null,
            revealed: false,
            soundOn: false,
            currentTime: 0,
            videoId: trailer.key
        };

        current.messageHandler = function(event) {
            if (!current || event.source !== frame.contentWindow) return;
            if (!event.data || event.data.bridgeId !== current.bridgeId) return;

            var type = event.data.type;
            var d = event.data.data || {};

            if (type === 'bridgeReady') {
                current.frameWindow = frame.contentWindow;
                send('init', { volume: 0 });

                // Ждём именно готовность YT, а не только bridgeReady.
                current.readyTimer = setTimeout(function(){
                    if (!current || current.frame !== frame) return;
                    // Если ready не пришёл, не убираем постер.
                }, 12000);
            }

            if (type === 'ready') {
                if (!current || current.frame !== frame) return;

                if (current.readyTimer) clearTimeout(current.readyTimer);

                // Первичная загрузка ждёт 2 секунды. Переключение звука
                // произошло по жесту пользователя — запускаем сразу.
                var wait = current.soundOn || current.soundToggleReload ? 0 : DELAY;

                current.timer = setTimeout(function(){
                    if (!current || current.frame !== frame) return;

                    reveal();
                    if (current.soundOn) send('init', { volume: 100 });
                    else send('init', { volume: 0 });
                    send('play');
                    current.soundToggleReload = false;
                }, wait);
            }

            if (type === 'time') {
                if (current && current.frame === frame && typeof d.currentTime === 'number') {
                    current.currentTime = d.currentTime;
                }
            }

            if (type === 'stateChange') {
                // 1 = playing. Только после реального PLAY показываем видео.
                if (d.state === 1) {
                    if (current && current.frame === frame) {
                        reveal();                    }
                }

                // 0 = ended — возвращаем постер.
                if (d.state === 0) {
                    cleanup();
                }
            }

            if (type === 'error') {
                // Не оставляем чёрный iframe при ошибке.
                cleanup();
            }
        };

        window.addEventListener('message', current.messageHandler);

        function toggleSound(e) {
            if (e) {
                try { e.preventDefault(); } catch(err) {}
                try { e.stopPropagation(); } catch(err) {}
                try { e.stopImmediatePropagation(); } catch(err) {}
            }

            if (!current || current.frame !== frame || current.soundBusy) return;

            current.soundBusy = true;
            current.soundOn = !current.soundOn;

            var pos = Math.max(0, Math.floor(current.currentTime || 0));
            var bridgeId2 = 'lta3_' + Math.random().toString(36).slice(2);
            var wantedMute = current.soundOn ? 0 : 1;

            current.bridgeId = bridgeId2;
            current.soundToggleReload = true;
            current.revealed = false;

            // The Lampa bridge exposes setVolume(), but its current youtube.html
            // does not expose unMute(). Therefore a reload with mute=0 is needed
            // when the user explicitly enables audio. The reload itself is initiated
            // by this user gesture, so Android/WebView may allow audible autoplay.
            var base = '';
            try { base = Lampa.Manifest.github_lampa; } catch(err) {}
            if (!base) base = 'https://yumata.github.io/lampa/';
            if (base.charAt(base.length - 1) !== '/') base += '/';

            frame.classList.remove('visible');
            frame.src = base + 'youtube.html' +
                '?bridgeId=' + encodeURIComponent(bridgeId2) +
                '&videoId=' + encodeURIComponent(current.videoId) +
                '&autoplay=1' +
                '&controls=0' +
                '&mute=' + wantedMute +
                '&start=' + pos;

            sound.innerHTML = current.soundOn ? soundIcon() : mutedIcon();
            sound.setAttribute('aria-label', current.soundOn ? 'Выключить звук' : 'Включить звук');

            // Safety unlock in case the iframe takes longer to load.
            setTimeout(function(){
                if (current && current.frame === frame) current.soundBusy = false;
            }, 1200);
        }

        // Use pointerup first: on Android/WebView this is more reliable than
        // waiting for a synthetic click that Lampa may consume.
        if (window.PointerEvent) {
            sound.addEventListener('pointerup', toggleSound, true);
        } else {
            sound.addEventListener('touchend', toggleSound, true);
            sound.addEventListener('click', toggleSound, true);
        }


        frame.onload = function(){
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
        if (e && e.type === 'destroy' && e.component === 'full') cleanup();
    }

    function start() {
        if (!window.Lampa || !Lampa.Listener) return;
        style();
        Lampa.Listener.follow('full', onFull);
        Lampa.Listener.follow('activity', onActivity);
        console.log('[Trailer Autoplay] v5 started');
    }

    if (window.Lampa && Lampa.Listener) start();
    else setTimeout(start, 1500);
})();
