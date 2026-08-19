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

            /* The trailer is playback-only. The iframe never receives
               user taps, so YouTube's own controls/overlays cannot appear.
               The only visible control is our custom sound button. */
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

    function bridgeHtml(videoId, bridgeId, mute, start) {
        function esc(v) {
            return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        return '<!doctype html><html><head><meta charset="utf-8">' +
            '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
            '<style>' +
            'html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000;pointer-events:none}' +
            '#player{position:absolute;inset:0;width:100%;height:100%;overflow:hidden;pointer-events:none}' +
            '#player iframe{border:0;pointer-events:none!important}' +
            '</style></head><body>' +
            '<div id="player"></div>' +
            '<script src="https://www.youtube.com/iframe_api"></script>' +
            '<script>' +
            'var bridgeId="' + esc(bridgeId) + '",videoId="' + esc(videoId) + '",' +
            'autoplay=1,controls=0,mute=' + (mute ? 1 : 0) + ',start=' + Math.max(0, Math.floor(start || 0)) + ';' +
            'var player=null,ready=false,timer=null;' +
            'function send(t,d){try{parent.postMessage({bridgeId:bridgeId,type:t,data:d||{}},"*")}catch(e){}}' +
            'function tick(){if(!player||!ready)return;try{send("time",{currentTime:player.getCurrentTime(),duration:player.getDuration(),playerState:player.getPlayerState()})}catch(e){}}' +
            'function resize(){var el=document.getElementById("player");if(!el||!player)return;try{player.setSize(el.clientWidth*2,el.clientHeight*2)}catch(e){}}' +
            'window.onYouTubeIframeAPIReady=function(){' +
                'player=new YT.Player("player",{' +
                    'videoId:videoId,width:"100%",height:"100%",' +
                    'playerVars:{autoplay:autoplay,controls:0,disablekb:1,fs:0,iv_load_policy:3,cc_load_policy:0,rel:0,modestbranding:1,playsinline:1,enablejsapi:1,origin:location.origin,start:start,mute:mute},' +
                    'events:{onReady:function(){ready=true;try{player.mute()}catch(e){};send("ready");tick();timer=setInterval(tick,250);resize()},onStateChange:function(e){send("stateChange",{state:e.data})},onError:function(e){send("error",{error:e.data})}}' +
                '});' +
            '};' +
            'window.addEventListener("resize",resize);' +
            'window.addEventListener("message",function(e){if(!e.data||e.data.bridgeId!==bridgeId)return;var t=e.data.type,d=e.data.data||{};if(!player||!ready)return;try{' +
                'if(t==="play")player.playVideo();' +
                'else if(t==="setVolume") {player.setVolume(Number(d.volume)||0);if(Number(d.volume)>0)player.unMute();else player.mute();}' +
                'else if(t==="destroy"){if(timer)clearInterval(timer);player.destroy();player=null;ready=false;}' +
            '}catch(x){}});' +
            'send("bridgeReady");' +
            '<\/script></body></html>';
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

    function setSound(wantSound) {
        if (!current || !current.frameWindow) return;

        current.soundOn = !!wantSound;
        current.sound.innerHTML = wantSound ? soundIcon() : mutedIcon();
        current.sound.setAttribute(
            'aria-label',
            wantSound ? 'Выключить звук' : 'Включить звук'
        );

        /* Never reload or recreate the iframe. Only change its volume. */
        send('setVolume', { volume: wantSound ? 100 : 0 });
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
        frame.srcdoc = bridgeHtml(trailer.key, bridgeId, true, 0);

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
            timer: null,
            readyTimer: null,
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
            setSound(wantSound);
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

                /* Start once. No Play/Pause UI and no player reloads. */
                current.timer = setTimeout(function() {
                    if (!current || current.frame !== frame) return;

                    reveal();
                    send('play');
                }, DELAY);

                return;
            }

            if (type === 'time') {
                positionSound();
                return;
            }

            if (type === 'stateChange') {
                /* The trailer is intentionally playback-only. We do not
                   expose or control Play/Pause. */
                if (d.state === 1) reveal();
                if (d.state === 0) cleanup();
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
