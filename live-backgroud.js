// === Плагин "Живой фон (Северное сияние + звёзды)" для Lampa ===
// Работает автономно, не требует Lampa API, pointer-events: none
(function(){
  const ID = 'lampa-live-bg';
  if(window[ID]) return;
  window[ID] = true;

  // контейнер и canvas
  const container = document.createElement('div');
  container.id = 'lampa-live-bg-container';
  Object.assign(container.style, {
    position: 'fixed',
    left: '0', top: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none',
    zIndex: '0', /* можно поднять, но лучше держать позади UI — если нужно ставь >9999 */
    overflow: 'hidden'
  });
  document.documentElement.appendChild(container);

  const canvas = document.createElement('canvas');
  canvas.id = 'lampa-live-bg-canvas';
  Object.assign(canvas.style, {
    width: '100%',
    height: '100%',
    display: 'block'
  });
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });

  // DPI
  const dpr = window.devicePixelRatio || 1;
  function resize(){
    canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize);
  resize();

  // параметры
  const config = {
    layers: 3,            // число слоёв "авроры"
    amplitude: 0.16,      // разброс высоты волны (в долях высоты)
    speed: 0.0009,        // базовая скорость анимации (уменьшай для слабых устройств)
    colors: [
      ['#0ff', '#6ff', '#2ff'],    // слой 1 градиент
      ['#8ff', '#3fc', '#06f'],    // слой 2
      ['#6f8', '#3f9', '#0cf']     // слой 3
    ],
    stars: 120,            // количество звёзд
    starTwinkleSpeed: 0.002,
    bgFade: 0.06           // затемнение фона (0..1)
  };

  // генерация случайных чисел
  function rand(min, max){ return Math.random()*(max-min)+min; }

  // звёзды
  const stars = [];
  function initStars(){
    stars.length = 0;
    for(let i=0;i<config.stars;i++){
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.6, // звёзды в верхней части
        r: Math.random() * 1.3 + 0.3,
        phase: Math.random()*Math.PI*2,
        speed: 0.002 + Math.random()*0.004
      });
    }
  }
  initStars();

  // слои авроры: параметры для каждой волны
  const layers = [];
  function initLayers(){
    layers.length = 0;
    for(let i=0;i<config.layers;i++){
      layers.push({
        offsetY: 0.12 + i*0.06 + Math.random()*0.05, // базовая высота (доля от высоты)
        amplitude: config.amplitude * (0.6 + i*0.5),
        wavelength: (0.9 + i*0.6) * window.innerWidth,
        phase: Math.random()*Math.PI*2,
        speed: config.speed * (0.6 + i*0.6),
        colorStops: config.colors[i % config.colors.length]
      });
    }
  }
  initLayers();

  // вспомогательные: плавное ослабление нагрузки если маленький экран
  const small = Math.min(window.innerWidth, window.innerHeight) < 800;
  if(small){
    config.stars = Math.round(config.stars * 0.5);
  }

  // функция отрисовки волны (контур с мягким градиентом)
  function drawAuroraLayer(layer, t){
    const w = window.innerWidth;
    const h = window.innerHeight;

    const baseY = h * layer.offsetY;
    const amp = h * layer.amplitude;
    const points = 8; // количество контрольных точек

    // создаём путь
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, baseY);

    for(let i=0;i<=points;i++){
      const x = (i/points)*w;
      const phaseShift = layer.phase + t * layer.speed * 1000 + i * 0.7;
      const y = baseY + Math.sin(phaseShift + i*0.5) * amp * Math.sin(i/points*Math.PI);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();

    // градиент
    const grad = ctx.createLinearGradient(0, baseY-amp, 0, baseY+amp*2);
    const stops = layer.colorStops;
    for(let i=0;i<stops.length;i++){
      grad.addColorStop(i/(stops.length-1), stops[i]);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.15 + 0.1*(Math.sin(t*0.0006 + layer.phase)+1)/2; // лёгкое пульсирование
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // рисуем провод/гладкую линию под огнём (необязательно)
  function drawWire(t){
    const w = window.innerWidth, h = window.innerHeight;
    ctx.beginPath();
    const y = h * 0.12;
    ctx.moveTo(0, y);
    const steps = 12;
    for(let i=1;i<=steps;i++){
      const x = (i/steps)*w;
      const yy = y + Math.sin(t*0.001 + i*0.5) * 6;
      ctx.lineTo(x, yy);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // рисуем звезды
  function drawStars(t){
    for(let s of stars){
      s.phase += s.speed + config.starTwinkleSpeed * Math.sin(t*0.0008 + s.x*0.01);
      const alpha = 0.5 + 0.5 * Math.sin(s.phase);
      ctx.beginPath();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'white';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // анимация — основной цикл
  let last = performance.now();
  let raf = null;
  function animate(now){
    const dt = now - last;
    last = now;

    // лёгкое затемнение, чтобы фон не белел
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    // фон — мягкий тёмный градиент
    const bgGrad = ctx.createLinearGradient(0,0,0,window.innerHeight);
    bgGrad.addColorStop(0, '#030215');
    bgGrad.addColorStop(1, '#06102a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0,0,window.innerWidth, window.innerHeight);

    // звёзды (потом)
    drawStars(now);

    // слои авроры (от дальних к ближним)
    for(let i=layers.length-1;i>=0;i--){
      drawAuroraLayer(layers[i], now);
    }

    // тонкая проволока (добавляет глубину)
    drawWire(now);

    raf = requestAnimationFrame(animate);
  }

  // стартуем плавно (немного запаздывает, чтобы UI загрузился)
  setTimeout(()=>{ raf = requestAnimationFrame(animate); }, 120);

  // реагируем на ресайз: пересоздаём элементы
  window.addEventListener('resize', ()=>{
    resize();
    initStars();
    initLayers();
  });

  // функция удаления/очистки (если нужно)
  window[ID + '_destroy'] = function(){
    if(raf) cancelAnimationFrame(raf);
    try{ window.removeEventListener('resize', resize); }catch(e){}
    try{ container.remove(); }catch(e){}
    delete window[ID];
    delete window[ID + '_destroy'];
  };

  // для сторонних сборок: если нужно разместить фон позади UI, можно попробовать moveToBack
  try {
    // ставим низкий z-index, но если Lampa поверх и фон нужно поднимать — пользователь может изменить zIndex вручную
    container.style.zIndex = '0';
  } catch(e){}

})();
