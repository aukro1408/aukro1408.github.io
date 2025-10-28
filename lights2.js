// === Плагин "Гирлянда праздничная" для Lampa ===
(function(){
    const PLUGIN_ID = 'lampa-garland-festive';
    if(window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;

    const container = document.createElement('div');
    Object.assign(container.style,{
        position:'fixed',
        left:'0',
        top:'0',
        width:'100%',
        height:'100%',
        pointerEvents:'none',
        zIndex:'99999',
    });
    document.body.appendChild(container);

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize(){
        canvas.width = window.innerWidth*dpr;
        canvas.height = window.innerHeight*dpr;
        canvas.style.width = window.innerWidth+'px';
        canvas.style.height = window.innerHeight+'px';
        ctx.setTransform(1,0,0,1,0,0);
        ctx.scale(dpr,dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    // настройки огоньков
    const NUM = 60;
    const colors = ['#FF4D4D','#FFD700','#4DFF4D','#4D4DFF','#FF4DFF','#FFB84D','#00FFFF','#FFA500'];
    const lights = [];

    function initLights(){
        lights.length = 0;
        for(let i=0;i<NUM;i++){
            const edge = Math.random() < 0.5 ? 'top' : 'side';
            lights.push({
                x: edge==='top' ? Math.random()*window.innerWidth : (Math.random()<0.5?5:window.innerWidth-5),
                y: edge==='top' ? 5 : Math.random()*window.innerHeight,
                color: colors[Math.floor(Math.random()*colors.length)],
                phase: Math.random()*Math.PI*2,
                speed: 0.02 + Math.random()*0.03,
                radius: 3 + Math.random()*5,
                edge
            });
        }
    }
    initLights();

    function draw(){
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
        for(let l of lights){
            l.phase += l.speed;
            const alpha = 0.5 + 0.5*Math.sin(l.phase);
            ctx.beginPath();
            ctx.fillStyle = l.color;
            ctx.globalAlpha = alpha;
            ctx.arc(l.x,l.y,l.radius,0,Math.PI*2);
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    draw();

    window[PLUGIN_ID+'_destroy'] = function(){
        container.remove();
        delete window[PLUGIN_ID];
    };
})();
