// halloween_scary_for_lampa.js
// Страшные падающие тыквы для LAMPA UI с мерцающими глазами и покачиванием
(function(){
  if (window.__lampa_halloween_scary_inited) return;
  window.__lampa_halloween_scary_inited = true;

  var cfg = {
    enabled: (localStorage.getItem('lampa_halloween_scary_enabled') || '1') === '1',
    density: parseInt(localStorage.getItem('lampa_halloween_scary_density') || '40', 10),
    speed: parseFloat(localStorage.getItem('lampa_halloween_scary_speed') || '1.0')
  };

  if (!cfg.enabled) return;

  var overlay = document.createElement('div');
  overlay.id = 'lampa-halloween-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', left:0, top:0, width:'100%', height:'100%',
    pointerEvents:'none', zIndex:999999, overflow:'hidden', background:'transparent'
  });
  document.documentElement.appendChild(overlay);

  var canvas = document.createElement('canvas');
  canvas.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  canvas.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  overlay.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  window.addEventListener('resize', function(){
    canvas.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    canvas.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  }, {passive:true});

  function rand(min,max){return Math.random()*(max-min)+min;}
  var pumpkins = [];
  function makePumpkins(count){
    pumpkins = [];
    for(var i=0;i<count;i++){
      pumpkins.push({
        x: rand(0, canvas.width),
        y: rand(-canvas.height, canvas.height),
        radius: rand(10,16),
        speedY: rand(0.4,1.2)*cfg.speed,
        swing: rand(0.3,1.2),
        swingPhase: rand(0, Math.PI*2),
        opacity: rand(0.7,1.0),
        eyeGlowPhase: rand(0,Math.PI*2)
      });
    }
  }
  makePumpkins(cfg.density);

  function drawPumpkin(f, now){
    ctx.save();
    ctx.translate(f.x,f.y);
    ctx.rotate(Math.sin(now/500 + f.swingPhase)*0.2); // покачивание

    // тело тыквы
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,140,0,${f.opacity})`;
    ctx.ellipse(0,0,f.radius,f.radius*0.8,0,0,2*Math.PI);
    ctx.fill();

    // глаза (мерцают)
    var eyeGlow = 0.6 + 0.4*Math.sin(now/200 + f.eyeGlowPhase);
    ctx.fillStyle = `rgba(255,255,100,${eyeGlow})`;
    // злые глаза треугольники
    ctx.beginPath();
    ctx.moveTo(-f.radius/2, -f.radius/4);
    ctx.lineTo(-f.radius/4, -f.radius/2);
    ctx.lineTo(0, -f.radius/4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(f.radius/2, -f.radius/4);
    ctx.lineTo(f.radius/4, -f.radius/2);
    ctx.lineTo(0, -f.radius/4);
    ctx.closePath();
    ctx.fill();

    // рот с острыми зубами
    ctx.beginPath();
    ctx.moveTo(-f.radius/2, f.radius/4);
    ctx.lineTo(-f.radius/4, f.radius/2);
    ctx.lineTo(-f.radius/8, f.radius/4);
    ctx.lineTo(0, f.radius/2);
    ctx.lineTo(f.radius/8, f.radius/4);
    ctx.lineTo(f.radius/4, f.radius/2);
    ctx.lineTo(f.radius/2, f.radius/4);
    ctx.strokeStyle = `rgba(0,0,0,${f.opacity})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  var last = performance.now();
  function step(now){
    var dt = Math.min(50, now-last)/16.6667;
    last = now;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(var i=0;i<pumpkins.length;i++){
      var f = pumpkins[i];
      f.y += f.speedY*dt;
      f.x += Math.sin((now/1000)*f.swing+f.swingPhase)*0.5*f.swing*dt;
      if(f.y-f.radius>canvas.height){
        f.y=-10-rand(0,canvas.height*0.2);
        f.x=rand(0,canvas.width);
      }
      drawPumpkin(f, now);
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  console.info('Lampa Halloween Scary plugin initialized. 🎃');
})();
