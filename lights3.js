// === Плагин "Гирлянда 2.0" для Lampa ===
(function(){
    const PLUGIN_ID = 'lampa-garland-fancy';
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

    // Настройки гирлянды
    const NUM = 40; // количество лампочек
    const colors = ['#FF4D4D','#FFD700','#4DFF4D','#4D4DFF','#FF4DFF','#FFA500','#00FFFF','#FFB84D'];
    const shapes = ['circle','star','triangle']; // разные формы
    const lights = [];

    // Инициализация огоньков
    function initLights(){
        lights.length = 0;
        for(let i=0;i<NUM;i++){
            lights.push({
                x: i*(window.innerWidth/NUM)+10,
                y: 20 + Math.sin(i/2)*5, // провода волной
                baseY: 20,
                color: colors[Math.floor(Math.random()*colors.length)],
                shape: shapes[Math.floor(Math.random()*shapes.length)],
                phase: Math.random()*Math.PI*2,
                speed: 0.02 + Math.random()*0.03,
                radius: 4 + Math.random()*4,
                blinkSpeed: 0.02 + Math.random()*0.03,
                blinkPhase: Math.random()*Math.PI*2
            });
        }
    }
    initLights();

    // Функции рисования форм
    function drawStar(ctx,x,y,radius,color,alpha){
        ctx.save();
        ctx.beginPath();
        ctx.translate(x,y);
        ctx.moveTo(0,-radius);
        for(let i=0;i<5;i++){
            ctx.rotate(Math.PI/5);
            ctx.lineTo(0,-radius*0.5);
            ctx.rotate(Math.PI/5);
            ctx.lineTo(0,-radius);
        }
        ctx.closePath();
        ctx.fillStyle=color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.restore();
    }

    function drawTriangle(ctx,x,y,radius,color,alpha){
        ctx.save();
        ctx.beginPath();
        ctx.translate(x,y);
        ctx.moveTo(0,-radius);
        ctx.lineTo(radius, radius);
        ctx.lineTo(-radius, radius);
        ctx.closePath();
        ctx.fillStyle=color;
        ctx.globalAlpha=alpha;
        ctx.fill();
        ctx.restore();
    }

    function drawLight(l){
        let alpha = 0.5 + 0.5*Math.sin(l.blinkPhase);
        l.blinkPhase += l.blinkSpeed;
        switch(l.shape){
            case 'circle':
                ctx.beginPath();
                ctx.arc(l.x,l.y,l.radius,0,Math.PI*2);
                ctx.fillStyle = l.color;
                ctx.globalAlpha = alpha;
                ctx.fill();
                break;
            case 'star':
                drawStar(ctx,l.x,l.y,l.radius,l.color,alpha);
                break;
            case 'triangle':
                drawTriangle(ctx,l.x,l.y,l.radius,l.color,alpha);
                break;
        }
    }

    function drawWire(){
        ctx.beginPath();
        ctx.strokeStyle = '#444';
        ctx.lineWidth=2;
        for(let i=0;i<lights.length;i++){
            const l = lights[i];
            if(i===0) ctx.moveTo(l.x,l.baseY);
            else ctx.lineTo(l.x,l.baseY);
        }
        ctx.stroke();
    }

    function animate(){
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
        drawWire();
        for(let l of lights){
            l.phase += l.speed;
            l.y = l.baseY + Math.sin(l.phase)*5;
            drawLight(l);
        }
        requestAnimationFrame(animate);
    }

    animate();

    window[PLUGIN_ID+'_destroy'] = function(){
        container.remove();
        delete window[PLUGIN_ID];
    };
})();
