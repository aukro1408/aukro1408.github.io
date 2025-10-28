// snowflakes_for_lampa.js
// Простая реализация "идёт снег" для LAMPA UI.
// Установка: разместить .js на публичном URL и добавить в LAMPA: Настройки -> Расширения -> Добавить плагин -> URL

(function(){
  if (window.__lampa_snow_inited) return;
  window.__lampa_snow_inited = true;

  // --- Настройки (можно менять через localStorage) ---
  // localStorage.setItem('lampa_snow_enabled','1'); // '1' или '0'
  // localStorage.setItem('lampa_snow_density','60'); // количество снежинок (примерно)
  // localStorage.setItem('lampa_snow_speed','1.0'); // множитель скорости (0.5 - 2.0)
  var cfg = {
    enabled: (localStorage.getItem('lampa_snow_enabled') || '1') === '1',
    density: parseInt(localStorage.getItem('lampa_snow_density') || '60', 10),
    speed: parseFloat(localStorage.getItem('lampa_snow_speed') || '1.0')
  };

  // Небольшая защита: не создавать если выключено
  if (!cfg.enabled) {
    console.info('Lampa Snow: disabled by config');
    return;
  }

  // --- Создаём контейнер поверх интерфейса ---
  var overlay = document.createElement('div');
  overlay.id = 'lampa-snow-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 999999, // поверх интерфейса
    overflow: 'hidden',
    background: 'transparent'
  });
  document.documentElement.appendChild(overlay);

  // Canvas — для производительности
  var canvas = document.createElement('canvas');
  canvas.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  canvas.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  overlay.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  // Обновление размера при ресайзе
  function resizeCanvas(){
    canvas.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    canvas.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  }
  window.addEventListener('resize', resizeCanvas, {passive:true});

  // --- Создаём снежинки ---
  function rand(min, max){ return Math.random() * (max - min) + min; }
  var flakes = [];
  function makeFlakes(count){
    flakes = [];
    for (var i=0;i<count;i++){
      flakes.push({
        x: rand(0, canvas.width),
        y: rand(-canvas.height, canvas.height),
        radius: rand(1.5, 5.0),
        speedY: rand(0.3, 1.2) * cfg.speed,
        swing: rand(0.3, 1.2),
        swingPhase: rand(0, Math.PI*2),
        opacity: rand(0.4, 0.95)
      });
    }
  }
  makeFlakes(cfg.density);

  // --- Анимация ---
  var last = performance.now();
  function step(now){
    var dt = Math.min(50, now - last) / 16.6667; // относительный шаг (около 60fps)
    last = now;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    for (var i=0;i<flakes.length;i++){
      var f = flakes[i];
      f.y += f.speedY * dt;
      f.x += Math.sin((now/1000) * f.swing + f.swingPhase) * 0.6 * f.swing * dt;

      // если вышла вниз — переместить наверх
      if (f.y - f.radius > canvas.height){
        f.y = -10 - rand(0, canvas.height*0.2);
        f.x = rand(0, canvas.width);
      }

      // рисуем
      ctx.beginPath();
      // градиент для слегка "мягких" снежинок
      var g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius*1.6);
      g.addColorStop(0, 'rgba(255,255,255,'+f.opacity+')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI*2);
      ctx.fill();
    }

    raf = requestAnimationFrame(step);
  }
  var raf = requestAnimationFrame(step);

  // --- Простая панель управления, доступная по двойному клику в углу ---
  var ctl = document.createElement('div');
  ctl.id = 'lampa-snow-ctl';
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
    '<div style="margin-bottom:6px;font-weight:600">Snow — LAMPA</div>',
    '<label style="display:flex;align-items:center;gap:8px"><input id="lampa-snow-enabled" type="checkbox"> Включено</label>',
    '<label style="display:flex;align-items:center;gap:8px;margin-top:6px">Плотность <input id="lampa-snow-density" type="range" min="10" max="200" style="width:120px"></label>',
    '<label style="display:flex;align-items:center;gap:8px;margin-top:6px">Скорость <input id="lampa-snow-speed" type="range" min="0.3" max="2.5" step="0.1" style="width:120px"></label>',
    '<div style="margin-top:8px;text-align:right"><button id="lampa-snow-close" style="padding:4px 6px;border-radius:4px;border:0;cursor:pointer">Закрыть</button></div>'
  ].join('');
  document.documentElement.appendChild(ctl);

  // Показываем контрол по двойному клику в левом верхнем углу
  var dblArea = document.createElement('div');
  Object.assign(dblArea.style, {
    position:'fixed', left:'0', top:'0', width:'120px', height:'80px', zIndex:1000000, pointerEvents:'auto', background:'transparent'
  });
  document.documentElement.appendChild(dblArea);
  dblArea.addEventListener('dblclick', function(e){
    ctl.style.display = (ctl.style.display === 'none') ? 'block' : 'none';
  }, {passive:true});

  // Подключаем элементы управления
  function bindCtl(){
    var en = ctl.querySelector('#lampa-snow-enabled');
    var den = ctl.querySelector('#lampa-snow-density');
    var sp = ctl.querySelector('#lampa-snow-speed');
    var closeBtn = ctl.querySelector('#lampa-snow-close');

    en.checked = cfg.enabled;
    den.value = cfg.density;
    sp.value = cfg.speed;

    en.addEventListener('change', function(){
      cfg.enabled = en.checked;
      localStorage.setItem('lampa_snow_enabled', cfg.enabled ? '1' : '0');
      if (!cfg.enabled){
        // отключаем: убираем canvas и контролы
        if (raf) cancelAnimationFrame(raf);
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (ctl && ctl.parentNode) ctl.parentNode.removeChild(ctl);
        if (dblArea && dblArea.parentNode) dblArea.parentNode.removeChild(dblArea);
        window.__lampa_snow_inited = false;
      } else {
        // повторно создать
        localStorage.setItem('lampa_snow_enabled','1');
        location.reload();
      }
    }, {passive:true});

    den.addEventListener('input', function(){
      cfg.density = Math.max(10, parseInt(den.value,10) || 60);
      localStorage.setItem('lampa_snow_density', String(cfg.density));
      makeFlakes(cfg.density);
    }, {passive:true});

    sp.addEventListener('input', function(){
      cfg.speed = parseFloat(sp.value) || 1.0;
      localStorage.setItem('lampa_snow_speed', String(cfg.speed));
      // подправим скорость снежинок
      for (var i=0;i<flakes.length;i++) flakes[i].speedY = Math.max(0.1, flakes[i].speedY) * cfg.speed;
    }, {passive:true});

    closeBtn.addEventListener('click', function(){
      ctl.style.display = 'none';
    }, {passive:true});
  }

  // Ждём, пока DOM подгрузится (LAMPA загружает интерфейс динамически)
  function tryBind(){
    if (ctl.parentNode) bindCtl();
    else setTimeout(tryBind, 300);
  }
  tryBind();

  // Маленькая оптимизация: отключаем рендер когда приложение свернуто / неактивно
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

  console.info('Lampa Snow plugin initialized. Double-click top-left corner to open the panel.');
})();
