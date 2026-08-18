(function () {
    'use strict';

    var STYLE_ID = 'lampa_trailer_autoplay_v3_style';
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
            .lta3-video {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: 0 !important;
                opacity: 0;
                background: #000;
                z-index: 20;
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
                z-index: 30 !important;
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
            .lta3-sound svg { width: 23px; height: 23px; fill: currentColor; }
            .lta3-play {
                position: absolute !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%,-50%) !important;
                width: 68px !important;
                height: 68px !important;
                border: 0 !important;
                border-radius: 50% !important;
                background: rgba(20,20,20,.82) !important;
                color: #fff !important;
                z-index: 31 !important;
                display: none !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 0 !important;
            }
            .lta3-play.visible { display: flex !important; }
            .lta3-play svg { width: 30px; height: 30px; fill: currentColor; margin-left: 3px; }
        `;
        document.head.appendChild(s);
    }

    function mutedIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm11 1.1v3.8c.6-.5 1-1.1 1-1.9s-.4-1.4-1-1.9zM17 7.2v2.1c1.8.9 3 2.7 3 4.9s-1.2 4-3 4.9V21c3-1.1 5-3.9 5-6.8s-2-5.9-5-7z"/></svg>';
    }

    function soundIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zm12 3c0-1.3-.7-2.5-1.8-3.1v2.3c.5.3.8.7.8 1.2s-.3.9-.8 1.2v2.3c1.1-.6 1.8-1.8 1.8-3.1zm0-6v2.1c1.8.9 3 2.7 3 4.9s-1.2 4-3 4.9V20c3-1.1 5-3.9 5-7s-2-5.9-5-7z"/></svg>';
    }

    function playIcon() {
        return '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
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

    function showPlay() {
        if (!current) return;
        current.playButton.classList.add('visible');
    }

    function hidePlay() {
        if (!current) return;
        current.playButton.classList.remove('visible');
    }

    function reveal() {
        if (!current || current.revealed) return;

        current.revealed = true;
        current.frame.classList.add('visible');
        current.sound.classList.add('visible');
    }

    function startVideo() {
        if (!current) return;
        hidePlay();
        send('play');
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

        var play = document.createElement('button');
        play.type = 'button';
        play.className = 'lta3-play';
        play.innerHTML = playIcon();
        play.setAttribute('aria-label', 'Запустить трейлер');

        host.classList.add('lta3-host');
        host.appendChild(frame);
        host.appendChild(sound);
        host.appendChild(play);

        current = {
            host: host,
            frame: frame,
            frameWindow: null,
            bridgeId: bridgeId,
            sound: sound,
            playButton: play,
            timer: null,
            readyTimer: null,
            revealed: false,
            soundOn: false
        };

        current.messageHandler = function(event) {
            if (!current || event.source !== frame.contentWindow) return;
            if (!event.data || event.data.bridgeId !== bridgeId) return;

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

                // YouTube готов. Теперь после 2 секунд пытаемся запустить.
                current.timer = setTimeout(function(){
                    if (!current || current.frame !== frame) return;

                    reveal();
                    send('init', { volume: 0 });
                    send('play');

                    // Если Android заблокировал autoplay,
                    // через короткое время показываем явную кнопку Play.
                    setTimeout(function(){
                        if (!current || current.frame !== frame) return;
                        showPlay();
                    }, 1800);
                }, DELAY);
            }

            if (type === 'stateChange') {
                // 1 = playing. Только после реального PLAY показываем видео.
                if (d.state === 1) {
                    if (current && current.frame === frame) {
                        reveal();
                        hidePlay();
                    }
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

        sound.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();

            if (!current || current.frame !== frame) return;

            current.soundOn = !current.soundOn;

            if (current.soundOn) {
                send('setVolume', { volume: 100 });
                sound.innerHTML = soundIcon();
                sound.setAttribute('aria-label', 'Выключить звук');
            } else {
                send('setVolume', { volume: 0 });
                sound.innerHTML = mutedIcon();
                sound.setAttribute('aria-label', 'Включить звук');
            }
        });

        play.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();

            if (!current || current.frame !== frame) return;

            startVideo();
        });

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
        console.log('[Trailer Autoplay] v3 started');
    }

    if (window.Lampa && Lampa.Listener) start();
    else setTimeout(start, 1500);
})();
