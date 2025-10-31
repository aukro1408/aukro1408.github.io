// ==UserScript==
// @name         aukro1408
// @namespace    lampa.rainstorm.aukro140
// @version      7.0
// @description  Дождь с локальными молниями и стекущими каплями для Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function initRainstorm() {
    if (!window.Lampa) {
      setTimeout(initRainstorm, 1000);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'rainstormAukroEffect';
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

    // обычный дождь
    const drops = [];
    const splashes = [];
    const dropCount = 250;

    function random(min, max) { return Math.random() * (max - min) + min; }

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

    // стекущие капли
    const glassDrops = [];
    const glassCount = 20;

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

    // локальные молнии
    const localFlashes = [];

    function generateFlash() {
      if (Math.random() < 0.005) { // вероятность появления локальной молнии
        localFlashes.push({
          x: random(0, W),
          y: random(0, H/2),
          width: random(50, 150),
          height: random(30, 100),
          opacity: 0.6
        });
      }
    }

    function updateFlashes() {
      for (let i = localFlashes.length-1; i>=0; i--) {
        const f = localFlashes[i];
        f.opacity -= 0.03;
        if (f.opacity <= 0) localFlashes.splice(i,1);
      }
    }

    function drawFlashes() {
      for (let f of localFlashes) {
        const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.width);
        gradient.addColorStop(0, `rgba(255,255,255,${f.opacity})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.width, f.height, 0, 0, Math.PI*2);
        ctx.fill();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // фон ночь
      ctx.fillStyle = 'rgba(10,10,20,0.2)';
      ctx.fillRect(0, 0, W, H);

      // обычный дождь
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

      // стекущие капли
      for (let i = 0; i < glassDrops.length; i++) {
        const g = glassDrops[i];
        g.y += g.speed;
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

      // локальные молнии
      generateFlash();
      updateFlashes();
      drawFlashes();

      requestAnimationFrame(draw);
    }

    draw();
  }

  initRainstorm();
})();
