// ultra_realistic_snow_for_lampa.js
(function(){
  if(window.__lampa_ultra_snow_inited) return;
  window.__lampa_ultra_snow_inited = true;

  // --- Настройки ---
  var cfg = {
    density: 150,        // количество снежинок
    minSize: 1.2,        // минимальный радиус
    maxSize: 5.0,        // максимальный радиус
    speedFactor: 1.0,    // множитель скорости падения
    windStrength: 0.5,   // сила ветра
    accumulation: true   // накапливать снег
  };

  // --- Canvas overlay ---
  var overlay = document.createElement('div');
  Object.assign(overlay.style,{
    position:'fixed', left:0, top:0, width:'100%', height:'100%',
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

  // --- Слой снега ---
  var ground = new Array(canvas.width).fill(0);

  // --- Генерация снежинок ---
  function rand(min,max){ return Math.random()*(max-min)+min; }
  var flakes = [];
  for(var i=0;i<cfg.density;i++){
    flakes.push({
      x: rand(0,canvas.width),
      y: rand(-canvas.height,canvas.height),
      r: rand(cfg.minSize,cfg.maxSize),
      speedY: rand(0.5,1.5)*cfg.speedFactor,
      speedX: rand(-cfg.windStrength,cfg.windStrength),
      swingPhase: rand(0,Math.PI*2),
      rotation: rand(0,Math.PI*2),
      rotationSpeed: rand(-0.02,0.02)
    });
  }

  // --- Рисуем снежинку ---
  function drawFlake(f, dt){
    f.y += f.speedY*dt;
    f.x += Math.sin(performance.now()/1000 + f.swingPhase)*0.5 + f.speedX*dt;
    f.rotation += f.rotationSpeed*dt;

    if(f.x < 0) f.x = canvas.width;
    if(f.x > canvas.width) f.x = 0;

    var groundHeight = ground[Math.floor(f.x)] || 0;
    if(cfg.accumulation && f.y + f.r >= canvas.height - groundHeight){
      ground[Math.floor(f.x)] = groundHeight + 0.3; // накапливаем снег
      f.y = rand(-50,0);
      f.x = rand(0,canvas.width);
    }

    // рисуем снежинку
    ctx.save();
    ctx.translate(f.x,f.y);
    ctx.rotate(f.rotation);
    ctx.beginPath();
    ctx.arc(0,0,f.r,0,Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5*Math.sin(performance.now()/500 + f.swingPhase)})`; // мягкое мерцание
    ctx.fill();
    ctx.restore();
  }

  // --- Анимация ---
  var last = performance.now();
  function step(now){
    var dt = (now-last)/16.6667;
    last = now;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(var i=0;i<flakes.length;i++){
      drawFlake(flakes[i], dt);
    }

    // рисуем слой снега
    if(cfg.accumulation){
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
    }

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  console.info('Lampa Ultra Realistic Snow plugin initialized. ❄️');
})();
