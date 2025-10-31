// ==UserScript==
// @name         Lampa Rainstorm Glass
// @namespace    lampa.rainstorm.glass
// @version      4.0
// @description  Дождь с молниями, звуком и стекущими каплями для Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function initRainstorm() {
    if (!window.Lampa) {
      setTimeout(initRainstorm, 1000);
      return;
    }

    // --- Canvas для дождя ---
    const canvas = document.createElement('canvas');
    canvas.id = 'rainstormGlassEffect';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    // --- Настройки капель ---
    const drops = [];
    const splashes = [];
    const glassDrops = [];
    const dropCount = 250;
    const glassCount = 20;

    function random(min, max) { return Math.random() * (max - min) + min; }

    // обычный дождь
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: random(0, W),
        y: random(0, H),
        length: random(15, 25),
        speed: random(4, 10),
        opacity: random(0.2, 0.5),
        blur: random(0, 2)
      });
    }

    // стекущие капли (стекло)
    for (let i = 0; i < glassCount; i++) {
      glassDrops.push({
        x: random(0, W),
        y: random(0, H/2),
        radius: random(3,6),
        speed: random(0.5,1.5),
        opacity: random(0.3,0.6),
        path: []
      });
    }

    // --- Молнии ---
    let lightningTime = 0;
    let lightningOpacity = 0;

    function lightning() {
      if (Math.random() < 0.002 && lightningTime <= 0) {
        lightningTime = random(30, 60);
      }
      if (lightningTime > 0) {
        lightningOpacity = Math.sin((60 - lightningTime)/60 * Math.PI) * 0.6 + 0.2;
        lightningTime--;
      } else {
        lightningOpacity = 0;
      }
    }

    // --- Звуки ---
    const rainAudio = new Audio('https://www.soundjay.com/nature/rain-01.mp3');
    rainAudio.loop = true;
    rainAudio.volume = 0.3;
    rainAudio.play().catch(()=>{});

    const thunderAudio = new Audio('https://www.soundjay.com/nature/thunder-1.mp3');
    thunderAudio.volume = 0.5;

    // --- Основная анимация ---
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // фон ночь
      ctx.fillStyle = 'rgba(10,10,20,0.2)';
      ctx.fillRect(0, 0, W, H);

      // обычный дождь с размытой перспективой
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(173,216,230,${d.opacity})`;
        ctx.shadowBlur = d.blur;
        ctx.shadowColor = 'rgba(173,216,230,0.5)';
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.length);
        ctx.stroke();

        d.y += d.speed;

        if (d.y > H) {
          d.y = -20;
          d.x = random(0, W);
          splashes.push({ x: d.x, y: H-2, radius: random(1,3), opacity:1 });
        }
      }

      // брызги
      for (let i = splashes.length-1; i>=0; i--) {
        const s = splashes[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
        ctx.fillStyle = `rgba(173,216,230,${s.opacity})`;
        ctx.fill();
        s.opacity -= 0.05;
        if (s.opacity <= 0) splashes.splice(i,1);
      }

      // стекущие капли по экрану
      for (let i = 0; i < glassDrops.length; i++) {
        const g = glassDrops[i];
        g.y += g.speed;
        // случайное дрожание, как стекло
        g.x += Math.sin(Date.now()*0.002 + i)*0.2;
        g.path.push({x: g.x, y: g.y});
        if (g.path.length > 10) g.path.shift();

        ctx.beginPath();
        for (let j = 0; j < g.path.length; j++) {
          const p = g.path[j];
          if (j===0) ctx.moveTo(p.x,p.y);
          else ctx.lineTo(p.x,p.y);
        }
        ctx.strokeStyle = `rgba(173,216,230,${g.opacity})`;
        ctx.lineWidth = g.radius/2;
        ctx.shadowBlur = g.radius/2;
        ctx.shadowColor = 'rgba(173,216,230,0.5)';
        ctx.stroke();

        if (g.y > H) {
          g.y = -10;
          g.x = random(0, W);
          g.path = [];
        }
      }

      // молнии
      lightning();
      if (lightningOpacity > 0) {
        ctx.fillStyle = `rgba(255,255,255,${lightningOpacity})`;
        ctx.fillRect(0, 0, W, H);
        if (lightningTime === 1) thunderAudio.play().catch(()=>{});
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  initRainstorm();
})();
