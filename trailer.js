(function () {
    'use strict';

    var STYLE_ID = 'lampa_trailer_autoplay_v12_style';
    var current = null;
    var DELAY = 2000;

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
            .lta12-host {
                position: relative !important;
                overflow: hidden !important;
            }

            .lta12-video {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: 0 !important;
                background: #000 !important;
                opacity: 0 !important;
                z-index: 2 !important;
                pointer-events: none !important;
                transition: opacity .5s ease !important;
            }

            .lta12-video.visible {
                opacity: 1 !important;
            }

            .lta12-sound {
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
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                opacity: 0 !important;
                pointer-events: none !important;
                touch-action: manipulation !important;
                user-select: none !important;
                -webkit-user-select: none !important;
                -webkit-tap-highlight-color: transparent !important;
                box-shadow: 0 2px 10px rgba(0,0,0,.35) !important;
                transition: opacity .25s ease, transform .15s ease !important;
            }

            .lta12-sound.visible {
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            .lta12-sound:active {
                transform: scale(.92) !important;
            }

            .lta12-sound svg {
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

    /*
     * Собственный маленький YouTube bridge.
     *
     * Главное отличие от штатного youtube.html:
     * здесь есть настоящий player.unMute()/mute().
     * Поэтому при нажатии на кнопку нам НЕ нужно пересоздавать iframe.
     */
    function makeBridge(videoId) {
        var safeId = String(videoId).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        return '<!doctype html>' +
            '<html><head><meta name="viewport" content="width=device-width,initial-scale=1">' +
            '<style>html,body,#p{margin:0;width:100%;height:100%;overflow:hidden;background:#000}iframe{border:0}</style>' +
            '</head><body><div id="p"></div>' +
            '<script src="https://www.youtube.com/iframe_api"><\/script>' +
            '<script>' +
            'var player=null,ready=false;' +
            'function send(t,d){try{parent.postMessage({lta12:1,type:t,data:d||{}}, "*")}catch(e){}}' +
            'window.onYouTubeIframeAPIReady=function(){' +
                'player=new YT.Player("p",{' +
                    'videoId:\'' + safeId + '\',' +
                    'width:"100%",height:"100%",' +
                    'playerVars:{autoplay:1,controls:0,mute:1,cc_load_policy:0,rel:0,modestbranding:1,playsinline:1,enablejsapi:1},' +
                    'events:{' +
                        'onReady:function(){ready=true;try{player.mute()}catch(e){}send("ready");},' +
                        'onStateChange:function(e){send("state",{state:e.data});},' +
                        'onError:function(e){send("error",{error:e.data});}' +
                    '}' +
                '})' +
            '};' +
            'window.addEventListener("message",function(e){' +
                'if(!e.data||e.data.lta12cmd!==1||!player||!ready)return;' +
                'try{' +
                    'if(e.data.type==="play")player.playVideo();' +
                    'else if(e.data.type==="sound"){' +
                        'if(e.data.on){player.unMute();player.setVolume(100);player.playVideo()}' +
                        'else{player.mute();player.setVolume(0)}' +
                    '}' +
                    'else if(e.data.type==="destroy")player.destroy();' +
                '}catch(x){}' +
            '});' +
            '<\/script></body></html>';
    }

    function send(type, data) {
        if (!current || !current.frameWindow) return;
        try {
            current.frameWindow.postMessage({
                lta12cmd: 1,
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

    function cleanup() {
        if (!current) return;

        if (current.timer) clearTimeout(current.timer);

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
                    lta12cmd: 1,
                    type: 'destroy'
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
            current.host.classList.remove('lta12-host');
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
        frame.className = 'lta12-video';
        frame.setAttribute('frameborder', '0');
        frame.setAttribute('allowfullscreen', 'true');
        frame.setAttribute(
            'allow',
            'autoplay; encrypted-media; picture-in-picture'
        );

        var sound = document.createElement('button');
        sound.type = 'button';
        sound.className = 'lta12-sound';
        sound.innerHTML = mutedIcon();
        sound.setAttribute('aria-label', 'Включить звук');

        host.classList.add('lta12-host');
        host.appendChild(frame);
        document.body.appendChild(sound);

        current = {
            host: host,
            frame: frame,
            frameWindow: null,
            sound: sound,
            soundOn: false,
            ready: false,
            started: false,
            timer: null
        };

        /*
         * srcdoc: плеер создаётся один раз.
         * Переключение звука больше НЕ пересоздаёт iframe.
         */
        frame.srcdoc = makeBridge(trailer.key);

        current.positionHandler = positionSound;
        window.addEventListener('resize', current.positionHandler);
        window.addEventListener('scroll', current.positionHandler, true);

        /*
         * Кнопка находится вне Lampa selector system.
         */
        current.toggleSound = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();

            if (!current || current.sound !== sound) return;

            current.soundOn = !current.soundOn;

            if (current.soundOn) {
                sound.innerHTML = soundIcon();
                sound.setAttribute('aria-label', 'Выключить звук');
                send('sound', { on: true });
            } else {
                sound.innerHTML = mutedIcon();
                sound.setAttribute('aria-label', 'Включить звук');
                send('sound', { on: false });
            }
        };

        sound.addEventListener('pointerdown', current.toggleSound, {
            capture: true,
            passive: false
        });

        current.messageHandler = function(event) {
            if (!current || event.source !== frame.contentWindow) return;

            var msg = event.data || {};
            if (!msg.lta12) return;

            if (msg.type === 'ready') {
                current.ready = true;
                current.frameWindow = frame.contentWindow;

                current.timer = setTimeout(function() {
                    if (!current || !current.ready) return;

                    current.started = true;
                    frame.classList.add('visible');
                    showSound();
                    send('play');
                }, DELAY);

                return;
            }

            if (msg.type === 'state') {
                if (msg.data && msg.data.state === 1) {
                    current.started = true;
                    frame.classList.add('visible');
                    showSound();
                }

                /*
                 * Не удаляем видео при state=0:
                 * YouTube может прислать промежуточные состояния.
                 */
                return;
            }

            if (msg.type === 'error') {
                cleanup();
            }
        };

        window.addEventListener('message', current.messageHandler, true);

        frame.onload = function() {
            if (current && current.frame === frame) {
                try {
                    current.frameWindow = frame.contentWindow;
                } catch(e) {}
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
        console.log('[Trailer Autoplay] v12 started');
    }

    if (window.Lampa && Lampa.Listener) {
        start();
    } else {
        setTimeout(start, 1500);
    }
})();
