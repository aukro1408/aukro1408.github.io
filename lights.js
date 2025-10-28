// === Плагин "Гирлянда" для Lampa ===
(function(){
    const PLUGIN_ID = 'lampa-garland';
    const STORAGE_KEY = 'lampa_garland_enabled';
    if(window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;

    // контейнер overlay
    const container = document.createElement('div');
    container.id = 'lampa-garland-container';
    Object.assign(container.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '99999',
    });
    document.body.appendChild(container);

    // кнопка вкл/выкл
    const btn = document.createElement('button');
    btn.style.cssText = `
        position: fixed; right: 14px; top: 14px; z-index: 100000;
        pointer-events: auto;
        background: rgba(0,0,0,0.4); color:white;
        border:none; padding:6px 10px; border-radius:6px;
        font-size:14px; cursor:pointer; backdrop-filter:blur(3px);
    `;
    document.body.appendChild(btn);

    // настройки огоньков
    const NUM = 30;
    const colors = ['#FF4D4D','#FFD700','#4DFF4D','#4D4DFF','#FF4DFF','#FFB84D'];
    const lights = [];

    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize(){
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth+'px';
        canvas.style.height = window.innerHeight+'px';
        ctx.scale(dpr,dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    function initLights(){
        lights.length = 0;
        for(let i=0;i<NUM;i++){
            lights.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() < 0.5 ? 10 : window.innerHeight-10, // верх/низ
                color: colors[Math.floor(Math.random()*colors.length)],
                phase: Math.random()*Math.PI*2,
                speed: 0.02 + Math.random()*0.03,
                radius: 4 + Math.random()*4
            });
        }
    }
    initLights();

    let running = localStorage.getItem(STORAGE_KEY) === '1';
    function updateBtn(){ btn.textContent = running ? 'Гирлянда: вкл (выкл)' : 'Гирлянда: выкл (вкл)'; }
    updateBtn();

    btn.addEventListener('click', ()=>{
        running = !running;
        localStorage.setItem(STORAGE_KEY,running?'1':'0');
        updateBtn();
        if(running) start(); else stop();
    });

    let rafId=null;

    function step(now){
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
        for(let l of lights){
            l.phase += l.speed;
            const alpha = 0.5 + 0.5*Math.sin(l.phase);
            ctx.beginPath();
            ctx.fillStyle = l.color;
            ctx.globalAlpha = alpha;
            ctx.arc(l.x, l.y, l.radius,0,Math.PI*2);
            ctx.fill();
        }
        rafId = requestAnimationFrame(step);
    }

    function start(){
        if(rafId) return;
        rafId = requestAnimationFrame(step);
        container.style.display='block';
    }

    function stop(){
        if(rafId){
            cancelAnimationFrame(rafId);
            rafId=null;
        }
        container.style.display='none';
    }

    if(running) start(); else stop();

    window[PLUGIN_ID+'_destroy'] = function(){
        stop();
        container.remove();
        btn.remove();
        window.removeEventListener('resize',resize);
        delete window[PLUGIN_ID];
    };
})();
