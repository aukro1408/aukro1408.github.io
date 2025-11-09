// ==UserScript==
// @name         Lampa Falling Grinch Behind Cards
// @namespace    lampa.grinchbehind
// @version      1.2
// @description  Гринчи с мерцающими глазами падают за карточками фильмов для LAMPA UI
// @match        *://*/lampa/*
// ==/UserScript==

(function(){
    if (window.__lampa_grinch_inited) return;
    window.__lampa_grinch_inited = true;

    var cfg = {
        enabled: (localStorage.getItem('lampa_grinch_enabled') || '1') === '1',
        density: parseInt(localStorage.getItem('lampa_grinch_density') || '60', 10),
        speed: parseFloat(localStorage.getItem('lampa_grinch_speed') || '1.0')
    };

    if (!cfg.enabled) return;

    const grinchUrl = 'https://aukro1408.github.io/Lovepik_com-380569615-grinchmas-clipart-the-grinch-vector-face-sticker-cartoon-cartoon.png';

    // --- Контейнер ---
    var overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'absolute', // внутри контейнера
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0, // за карточками
        overflow: 'hidden',
        background: 'transparent'
    });

    // Находим контейнер с карточками
    function attachOverlay() {
        var container = document.querySelector('.catalog'); // <- нужно проверить селектор Lampa
        if(container){
            container.style.position = 'relative';
            container.insertBefore(overlay, container.firstChild);
        } else {
            // fallback
            document.documentElement.appendChild(overlay);
        }
    }
    attachOverlay();

    // Canvas
    var canvas = document.createElement('canvas');
    overlay.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function resizeCanvas(){
        canvas.width = overlay.clientWidth;
        canvas.height = overlay.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas, {passive:true});
    resizeCanvas();

    // --- Гринчи ---
    function rand(min, max){ return Math.random() * (max - min) + min; }
    var flakes = [];
    function makeFlakes(count){
        flakes = [];
        for (var i=0;i<count;i++){
            flakes.push({
                x: rand(0, canvas.width),
                y: rand(-canvas.height, canvas.height),
                size: rand(30, 60),
                speedY: rand(0.5, 1.5) * cfg.speed,
                swing: rand(0.2, 0.7),
                swingPhase: rand(0, Math.PI*2),
                opacity: rand(0.6, 1.0),
                eyePhase: rand(0, Math.PI*2)
            });
        }
    }
    makeFlakes(cfg.density);

    var grinchImg = new Image();
    grinchImg.src = grinchUrl;

    // --- Анимация ---
    var last = performance.now();
    function step(now){
        var dt = Math.min(50, now - last) / 16.6667;
        last = now;

        ctx.clearRect(0,0,canvas.width,canvas.height);

        for (var i=0;i<flakes.length;i++){
            var f = flakes[i];
            f.y += f.speedY * dt;
            f.x += Math.sin((now/1000) * f.swing + f.swingPhase) * 1.5;

            if (f.y - f.size > canvas.height){
                f.y = -50 - rand(0, canvas.height*0.2);
                f.x = rand(0, canvas.width);
            }

            ctx.save();
            ctx.globalAlpha = f.opacity;
            ctx.drawImage(grinchImg, f.x, f.y, f.size, f.size);

            // Мерцающие глаза
            var eyeAlpha = 0.5 + 0.5 * Math.sin(now/150 + f.eyePhase);
            ctx.fillStyle = `rgba(255,255,255,${eyeAlpha})`;
            ctx.beginPath();
            ctx.arc(f.x + f.size*0.6, f.y + f.size*0.35, f.size*0.05, 0, Math.PI*2);
            ctx.arc(f.x + f.size*0.75, f.y + f.size*0.35, f.size*0.05, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }

        raf = requestAnimationFrame(step);
    }
    var raf = requestAnimationFrame(step);

    // --- Панель управления ---
    var ctl = document.createElement('div');
    Object.assign(ctl.style, {
        position: 'fixed',
        right: '10px',
        bottom: '10px',
        zIndex: 1000000,
        pointerEvents: 'auto',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#fff',
        background: 'rgba(0,0,0,0.4)',
        padding: '6px 8px',
        borderRadius: '6px',
        display: 'none',
        backdropFilter: 'blur(4px)'
    });
    ctl.innerHTML = [
        '<div style="margin-bottom:6px;font-weight:600">Grinch — LAMPA</div>',
        '<label style="display:flex;align-items:center;gap:8px"><input id="lampa-grinch-enabled" type="checkbox"> Включено</label>',
        '<label style="display:flex;align-items:center;gap:8px;margin-top:6px">Плотность <input id="lampa-grinch-density" type="range" min="10" max="200" style="width:120px"></label>',
        '<label style="display:flex;align-items:center;gap:8px;margin-top:6px">Скорость <input id="lampa-grinch-speed" type="range" min="0.3" max="2.5" step="0.1" style="width:120px"></label>',
        '<div style="margin-top:8px;text-align:right"><button id="lampa-grinch-close" style="padding:4px 6px;border-radius:4px;border:0;cursor:pointer">Закрыть</button></div>'
    ].join('');
    document.documentElement.appendChild(ctl);

    var dblArea = document.createElement('div');
    Object.assign(dblArea.style, {
        position:'fixed', left:'0', top:'0', width:'120px', height:'80px', zIndex:1000000, pointerEvents:'auto', background:'transparent'
    });
    document.documentElement.appendChild(dblArea);
    dblArea.addEventListener('dblclick', function(e){
        ctl.style.display = (ctl.style.display === 'none') ? 'block' : 'none';
    }, {passive:true});

    function bindCtl(){
        var en = ctl.querySelector('#lampa-grinch-enabled');
        var den = ctl.querySelector('#lampa-grinch-density');
        var sp = ctl.querySelector('#lampa-grinch-speed');
        var closeBtn = ctl.querySelector('#lampa-grinch-close');

        en.checked = cfg.enabled;
        den.value = cfg.density;
        sp.value = cfg.speed;

        en.addEventListener('change', function(){
            cfg.enabled = en.checked;
            localStorage.setItem('lampa_grinch_enabled', cfg.enabled ? '1' : '0');
            if (!cfg.enabled){
                if (raf) cancelAnimationFrame(raf);
                if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (ctl && ctl.parentNode) ctl.parentNode.removeChild(ctl);
                if (dblArea && dblArea.parentNode) dblArea.parentNode.removeChild(dblArea);
                window.__lampa_grinch_inited = false;
            } else {
                localStorage.setItem('lampa_grinch_enabled','1');
                location.reload();
            }
        }, {passive:true});

        den.addEventListener('input', function(){
            cfg.density = Math.max(10, parseInt(den.value,10) || 60);
            localStorage.setItem('lampa_grinch_density', String(cfg.density));
            makeFlakes(cfg.density);
        }, {passive:true});

        sp.addEventListener('input', function(){
            cfg.speed = parseFloat(sp.value) || 1.0;
            localStorage.setItem('lampa_grinch_speed', String(cfg.speed));
            for (var i=0;i<flakes.length;i++) flakes[i].speedY = Math.max(0.1, flakes[i].speedY) * cfg.speed;
        }, {passive:true});

        closeBtn.addEventListener('click', function(){
            ctl.style.display = 'none';
        }, {passive:true});
    }

    function tryBind(){
        if (ctl.parentNode) bindCtl();
        else setTimeout(tryBind, 300);
    }
    tryBind();

    document.addEventListener('visibilitychange', function(){
        if (document.hidden){
            if (raf) cancelAnimationFrame(raf);
            raf = null;
        } else {
            if (!raf) {
                last = performance.now();
                raf = requestAnimationFrame(step);
            }
        }
    });

    console.info('Lampa Grinch plugin behind cards initialized!');
})();
