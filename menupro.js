(function(){
  if(window.__lampa_snow_sidebar_inited) return;
  window.__lampa_snow_sidebar_inited = true;

  function initSnow(){
    var cfg = {
      enabled: localStorage.getItem('lampa_snow_enabled')==='1'||true,
      density: parseInt(localStorage.getItem('lampa_snow_density')||'120',10),
      minSize: parseFloat(localStorage.getItem('lampa_snow_minSize')||'1.5'),
      maxSize: parseFloat(localStorage.getItem('lampa_snow_maxSize')||'4'),
      speedFactor: parseFloat(localStorage.getItem('lampa_snow_speedFactor')||'1.0')
    };

    // --- Canvas overlay ---
    var overlay = document.createElement('div');
    Object.assign(overlay.style,{
      position:'fixed', left:0, top:0, width:'100%', height:'100%',
      pointerEvents:'none', zIndex:999999, overflow:'hidden', background:'transparent'
    });
    document.body.appendChild(overlay);

    var canvas = document.createElement('canvas');
    overlay.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function resizeCanvas(){canvas.width=window.innerWidth; canvas.height=window.innerHeight;}
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    var ground = new Array(canvas.width).fill(0);

    function rand(min,max){return Math.random()*(max-min)+min;}
    var flakes = [];
    function makeFlakes(){
      flakes = [];
      for(var i=0;i<cfg.density;i++){
        flakes.push({
          x: rand(0,canvas.width),
          y: rand(-canvas.height,canvas.height),
          r: rand(cfg.minSize,cfg.maxSize),
          speedY: rand(0.5,1.5)*cfg.speedFactor,
          speedX: rand(-0.3,0.3),
          swingPhase: rand(0,Math.PI*2),
          rotation: rand(0,Math.PI*2),
          rotationSpeed: rand(-0.02,0.02)
        });
      }
    }
    makeFlakes();

    function drawFlake(f, dt){
      f.y += f.speedY*dt;
      f.x += Math.sin(performance.now()/1000 + f.swingPhase)*0.5 + f.speedX*dt;
      f.rotation += f.rotationSpeed*dt;

      if(f.x<0) f.x=canvas.width;
      if(f.x>canvas.width) f.x=0;

      var groundHeight = ground[Math.floor(f.x)]||0;
      if(cfg.enabled && f.y+f.r>=canvas.height-groundHeight){
        ground[Math.floor(f.x)] = groundHeight+0.3;
        f.y=rand(-50,0);
        f.x=rand(0,canvas.width);
      }

      ctx.save();
      ctx.translate(f.x,f.y);
      ctx.rotate(f.rotation);
      ctx.beginPath();
      ctx.arc(0,0,f.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${0.5+0.5*Math.sin(performance.now()/500+f.swingPhase)})`;
      ctx.fill();
      ctx.restore();
    }

    var last = performance.now();
    function step(now){
      var dt = (now-last)/16.6667;
      last=now;
      ctx.clearRect(0,0,canvas.width,canvas.height);

      if(cfg.enabled){
        for(var i=0;i<flakes.length;i++){
          drawFlake(flakes[i],dt);
        }
        ctx.fillStyle='white';
        ctx.beginPath();
        for(var x=0;x<canvas.width;x++){
          var y=canvas.height-ground[x];
          ctx.lineTo(x,y);
        }
        ctx.lineTo(canvas.width,canvas.height);
        ctx.lineTo(0,canvas.height);
        ctx.closePath();
        ctx.fill();
      }

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    // --- Вставляем панель в боковое меню ---
    function insertSidebarControls(){
      var sidebar = document.querySelector('.sidebar'); // Замените на точный селектор бокового меню
      if(!sidebar){
        setTimeout(insertSidebarControls, 300);
        return;
      }

      var ctl = document.createElement('div');
      ctl.style.cssText = `
        margin: 8px 0;
        padding: 6px;
        background: rgba(30,30,30,0.8);
        border-radius: 6px;
        cursor: pointer;
        color: #fff;
        font-size: 12px;
      `;
      ctl.innerHTML = `❄️ Snow`;

      var controls = document.createElement('div');
      controls.style.display='none';
      controls.style.marginTop='6px';
      controls.innerHTML = `
        <label><input type="checkbox" id="snow_enabled"> Enabled</label><br>
        <label>Density <input type="range" min="20" max="300" id="snow_density"></label><br>
        <label>Speed <input type="range" min="0.2" max="3" step="0.1" id="snow_speed"></label><br>
        <label>Min size <input type="range" min="0.5" max="3" step="0.1" id="snow_minSize"></label><br>
        <label>Max size <input type="range" min="1" max="6" step="0.1" id="snow_maxSize"></label>
      `;
      ctl.appendChild(controls);
      sidebar.appendChild(ctl);

      ctl.addEventListener('click', ()=>{
        controls.style.display = (controls.style.display==='none')?'block':'none';
      });

      // Подключаем элементы к настройкам
      var enEl=document.getElementById('snow_enabled'),
          dEl=document.getElementById('snow_density'),
          spEl=document.getElementById('snow_speed'),
          minEl=document.getElementById('snow_minSize'),
          maxEl=document.getElementById('snow_maxSize');

      enEl.checked=cfg.enabled;
      dEl.value=cfg.density;
      spEl.value=cfg.speedFactor;
      minEl.value=cfg.minSize;
      maxEl.value=cfg.maxSize;

      enEl.addEventListener('change',()=>{cfg.enabled=enEl.checked; localStorage.setItem('lampa_snow_enabled',cfg.enabled?'1':'0');});
      dEl.addEventListener('input',()=>{cfg.density=parseInt(dEl.value,10); localStorage.setItem('lampa_snow_density',cfg.density); makeFlakes();});
      spEl.addEventListener('input',()=>{cfg.speedFactor=parseFloat(spEl.value); localStorage.setItem('lampa_snow_speedFactor',cfg.speedFactor); makeFlakes();});
      minEl.addEventListener('input',()=>{cfg.minSize=parseFloat(minEl.value); localStorage.setItem('lampa_snow_minSize',cfg.minSize); makeFlakes();});
      maxEl.addEventListener('input',()=>{cfg.maxSize=parseFloat(maxEl.value); localStorage.setItem('lampa_snow_maxSize',cfg.maxSize); makeFlakes();});
    }

    insertSidebarControls();
  }

  function tryInit(){
    if(document.body){
      initSnow();
    } else {
      setTimeout(tryInit,300);
    }
  }
  tryInit();
})();
