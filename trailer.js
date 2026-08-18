(function () {
    'use strict';

    var PLUGIN_ID = 'lampa_trailer_autoplay';
    var STYLE_ID = PLUGIN_ID + '_style';
    var current = null;
    var fullHandler = null;

    var CONFIG = {
        delay: 2000,
        enabled: true,
        startMuted: true
    };

    function log() {
        try {
            console.log.apply(console, ['[Trailer Autoplay]'].concat([].slice.call(arguments)));
        } catch (e) {}
    }

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.lta-poster-wrap{position:relative;overflow:hidden;}',
            '.lta-video{position:absolute;inset:0;width:100%;height:100%;border:0;opacity:0;pointer-events:none;transition:opacity .55s ease;background:#000;z-index:3;}',
            '.lta-video.lta-visible{opacity:1;}',
            '.lta-sound{position:absolute;right:12px;bottom:12px;width:42px;height:42px;border:0;border-radius:50%;background:rgba(25,25,25,.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;display:flex;align-items:center;justify-content:center;z-index:5;opacity:0;transform:scale(.9);transition:opacity .3s ease,transform .3s ease;cursor:pointer;padding:0;}',
            '.lta-sound.lta-visible{opacity:1;transform:scale(1);pointer-events:auto;}',
            '.lta-sound svg{width:22px;height:22px;fill:currentColor;}',
            '.lta-fallback{position:absolute;inset:0;z-index:4;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;opacity:0;pointer-events:none;}',
            '.lta-video.lta-error + .lta-sound{display:none;}'
        ].join('');

        document.head.appendChild(style);
    }

    function getPosterContainer(body) {
        if (!body || !body.find) return null;

        var poster = body.find('.full-start-new__poster').first();
        if (!poster.length) return null;

        return poster;
    }

    function getVideos(data) {
        if (!data || !data.videos) return [];

        var videos = data.videos.results || data.videos;
        if (!Array.isArray(videos)) return [];

        return videos.filter(function (v) {
            return v && (v.key || v.url);
        });
    }

    function getVideoId(video) {
        if (!video) return '';

        if (video.key) return String(video.key);

        var url = String(video.url || '');
        var m = url.match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
        return m ? m[1] : '';
    }

    function getLang() {
        try {
            var lang = Lampa.Storage.field('tmdb_lang');
            if (lang) return String(lang).toLowerCase();
        } catch (e) {}

        try {
            if (Lampa.Lang && Lampa.Lang.selected) {
                var selected = Lampa.Lang.selected();
                if (Array.isArray(selected) && selected.length) return String(selected[0]).toLowerCase();
            }
        } catch (e) {}

        return 'ru';
    }

    function chooseTrailer(data) {
        var videos = getVideos(data);
        if (!videos.length) return null;

        videos.sort(function (a, b) {
            var ta = new Date(a.published_at || 0).getTime();
            var tb = new Date(b.published_at || 0).getTime();
            return tb - ta;
        });

        var lang = getLang();
        var shortLang = lang.split('-')[0];

        function byLang(code) {
            return videos.filter(function (v) {
                return String(v.iso_639_1 || '').toLowerCase() === code;
            });
        }

        var local = byLang(shortLang);
        var english = byLang('en');

        if (local.length) {
            return local.find(function (v) {
                return String(v.type || '').toLowerCase() === 'trailer';
            }) || local[0];
        }

        if (english.length) {
            return english.find(function (v) {
                return String(v.type || '').toLowerCase() === 'trailer';
            }) || english[0];
        }

        return videos.find(function (v) {
            return String(v.type || '').toLowerCase() === 'trailer';
        }) || videos[0];
    }

    function iconMuted() {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm11.5 3c0-1.1-.5-2.1-1.3-2.7v5.4c.8-.6 1.3-1.6 1.3-2.7zm0-7.1v2.1c2.1 1 3.5 2.9 3.5 5s-1.4 4-3.5 5v2.1c3.3-1.1 5.5-3.8 5.5-7.1s-2.2-6-5.5-7.1z"/></svg>';
    }

    function iconSound() {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v2.2c.9.5 1.5 1.5 1.5 2.8s-.6 2.3-1.5 2.8V18a4.5 4.5 0 0 0 2.5-4zm0-7.1v2.1c2.1 1 3.5 2.9 3.5 5s-1.4 4-3.5 5v2.1c3.3-1.1 5.5-3.8 5.5-7.1s-2.2-6-5.5-7.1z"/></svg>';
    }

    function sendYouTubeCommand(iframe, func, args) {
        try {
            iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: func,
                args: args || []
            }), '*');
        } catch (e) {}
    }

    function cleanup() {
        if (!current) return;

        if (current.timer) clearTimeout(current.timer);
        if (current.resizeHandler) window.removeEventListener('resize', current.resizeHandler);

        if (current.sound && current.sound.off) {
            current.sound.off('click');
        }

        if (current.iframe) {
            try {
                sendYouTubeCommand(current.iframe, 'pauseVideo');
                sendYouTubeCommand(current.iframe, 'stopVideo');
            } catch (e) {}

            try {
                current.iframe.src = 'about:blank';
            } catch (e) {}
        }

        if (current.host && current.host.classList) {
            current.host.classList.remove('lta-poster-wrap');
        }

        current = null;
    }

    function createTrailer(body, data) {
        cleanup();

        if (!CONFIG.enabled) return;

        var poster = getPosterContainer(body);
        if (!poster) return;

        var trailer = chooseTrailer(data);
        if (!trailer) return;

        var videoId = getVideoId(trailer);
        if (!videoId) return;

        var host = poster[0];
        if (!host) return;

        addStyle();

        host.classList.add('lta-poster-wrap');

        var iframe = document.createElement('iframe');
        iframe.className = 'lta-video';
        iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('title', 'Трейлер');

        var params = [
            'autoplay=1',
            'mute=1',
            'controls=0',
            'playsinline=1',
            'rel=0',
            'modestbranding=1',
            'enablejsapi=1'
        ].join('&');

        iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?' + params;

        var sound = document.createElement('button');
        sound.type = 'button';
        sound.className = 'lta-sound';
        sound.setAttribute('aria-label', 'Включить звук');
        sound.innerHTML = iconMuted();

        var soundOn = false;

        function toggleSound(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            soundOn = !soundOn;

            if (soundOn) {
                sendYouTubeCommand(iframe, 'unMute');
                sendYouTubeCommand(iframe, 'setVolume', [100]);
                sound.innerHTML = iconSound();
                sound.setAttribute('aria-label', 'Выключить звук');
            } else {
                sendYouTubeCommand(iframe, 'mute');
                sound.innerHTML = iconMuted();
                sound.setAttribute('aria-label', 'Включить звук');
            }
        }

        sound.addEventListener('click', toggleSound);

        host.appendChild(iframe);
        host.appendChild(sound);

        var state = {
            host: host,
            iframe: iframe,
            sound: $(sound),
            timer: null,
            resizeHandler: null
        };

        current = state;

        state.resizeHandler = function () {
            if (!current || !current.iframe) return;

            current.iframe.style.width = host.clientWidth + 'px';
            current.iframe.style.height = host.clientHeight + 'px';
        };

        state.resizeHandler();
        window.addEventListener('resize', state.resizeHandler);

        state.timer = setTimeout(function () {
            if (!current || current.iframe !== iframe) return;

            iframe.classList.add('lta-visible');
            sound.classList.add('lta-visible');

            // Автовоспроизведение уже задано в URL. Повторно посылаем playVideo
            // после загрузки iframe — это помогает на некоторых WebView.
            try {
                sendYouTubeCommand(iframe, 'playVideo');
            } catch (e) {}
        }, CONFIG.delay);

        iframe.addEventListener('error', function () {
            iframe.classList.add('lta-error');
            iframe.classList.remove('lta-visible');
            sound.classList.remove('lta-visible');
        });

        log('Trailer prepared:', videoId, trailer.name || '');
    }

    function onFull(e) {
        if (!e || e.type !== 'complite') return;
        if (!e.body || !e.data) return;

        var movie = e.data.movie || {};
        if (!movie.id) return;
        if (movie.adult) return;

        createTrailer(e.body, e.data);
    }

    function onActivity(e) {
        if (!e) return;

        if (e.type === 'destroy' && e.component === 'full') {
            cleanup();
        }
    }

    function start() {
        if (!window.Lampa || !Lampa.Listener) {
            log('Lampa.Listener not available');
            return;
        }

        addStyle();

        fullHandler = onFull;
        Lampa.Listener.follow('full', fullHandler);
        Lampa.Listener.follow('activity', onActivity);

        Lampa.Lang.add({
            lta_trailer_autoplay: {
                ru: 'Автотрейлер',
                en: 'Trailer Autoplay',
                uk: 'Автотрейлер'
            }
        });

        log('Plugin started');
    }

    if (window.Lampa && Lampa.Listener) {
        start();
    } else {
        var boot = function (e) {
            if (e && e.type === 'ready') {
                Lampa.Listener.remove('app', boot);
                start();
            }
        };

        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', boot);
        } else {
            setTimeout(start, 1500);
        }
    }
})();
