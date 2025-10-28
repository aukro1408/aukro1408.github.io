// realistic_snow_for_lampa.js
(function(){
  if(window.__lampa_realistic_snow_inited) return;
  window.__lampa_realistic_snow_inited = true;

  var cfg = {
    enabled: true,
    density: 120, // количество снежинок
    maxSize: 4, // макс радиус снежинки
    minSize: 1.5, // мин радиус
    speedFactor: 1.0, // скорость падения
  };

  var overlay = document.createElement('div');
  Object.assign(overlay.style,{
    position:'fixed', top:0, left:0, width:'100%', height:'100%',
    pointerEvents:'none', zIndex:999999, overflow:'hidden', background:'transparent'
  });
  document.documentElement.appendChild(overlay);

  var canvas = document.createElement('canvas');
  overlay.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // --- Генерация снежинок ---
  function rand(min,max){return Math.random()*(max-min)+min;}
  var flakes = [];
  for(var i=0;i<cfg.density;i++){
    flakes.push({
      x: rand(0,canvas.width),
      y: rand(0,canvas.height),
      r: rand(cfg.minSize,cfg.maxSize),
      speedY: rand(0.5,1.5)*cfg.speedFactor,
      speedX: rand(-0.3,0.3),
      swingPhase: rand(0, Math.PI*2)
    });
  }

  // --- Накопление снега ---
  var ground = new Array(canvas.width).fill(0); // высота снега по каждому x

  function drawFlake(f, dt){
    f.y += f.speedY*dt;
    f.x += Math.sin(performance.now()/1000 + f.swingPhase)*0.5;

    if(f.x < 0) f.x = canvas.width;
    if(f.x > canvas.width) f.x = 0;

    var groundHeight = ground[Math.floor(f.x)] || 0;
    if(f.y + f.r >= canvas.height - groundHeight){
      ground[Math.floor(f.x)] = groundHeight + 0.5; // увеличиваем слой снега
      f.y = rand(-50,0);
      f.x = rand(0,canvas.width);
    }

    // рисуем снежинку
    ctx.beginPath();
    ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
    ctx.fillStyle='white';
    ctx.fill();
  }

  var last = performance.now();
  function step(now){
    var dt = (now-last)/16.6667;
    last=now;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // рисуем снежинки
    for(var i=0;i<flakes.length;i++){
      drawFlake(flakes[i], dt);
    }

    // рисуем слой снега
    ctx.fillStyle='white';
    ctx.beginPath();
    for(var x=0;x<canvas.width;x++){
      var y = canvas.height - ground[x];
      ctx.lineTo(x,y);
    }
    ctx.lineTo(canvas.width,canvas.height);
    ctx.lineTo(0,canvas.height);
    ctx.closePath();
    ctx.fill();

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  console.info('Lampa realistic snow plugin initialized. ❄️');
})();
