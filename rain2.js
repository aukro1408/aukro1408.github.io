// ==UserScript==
// @name         Lampa Rainstorm 2.0
// @namespace    lampa.rainstorm
// @version      2.0
// @description  Плавный дождь с ветром, каплями, молниями и ночным эффектом для Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function initRainstorm() {
    if (!window.Lampa) {
      setTimeout(initRainstorm, 1000);
      return;
    }

    // canvas поверх интерфейса
    const canvas = document.createElement('canvas');
    canvas.id = 'rainstormEffect';
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

    // настройки дождя
    const drops = [];
    const splashes = [];
    const dropCount = 250;
    let wind = 0;

    function random(min, max) { return Math.random() * (max - min) + min; }

    // создаем капли
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: random(0, W),
        y: random(0, H),
        length: random(15, 25),
        speed: random(4, 10),
        opacity: random(0.2, 0.5),
        angle: random(-0.2, 0.2)
      });
    }

    // молнии
    let lightningTime = 0;

    function lightning() {
      if (Math.random() < 0.002 && lightningTime <= 0) {
        lightningTime = random(5, 20);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // плавный ночной фон
      ctx.fillStyle = 'rgba(10,10,20,0.2)';
      ctx.fillRect(0, 0, W, H);

      // обновляем ветер
      wind = Math.sin(Date.now() * 0.001) * 1.5;

      // рисуем капли
      ctx.strokeStyle = 'rgba(173,216,230,0.6)';
      ctx.lineWidth = 2;

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + wind * d.angle * 10, d.y + d.length);
        ctx.stroke();

        d.y += d.speed;
        d.x += wind + d.angle;

        // разбрызгивание при падении
        if (d.y > H) {
          d.y = -20;
          d.x = random(0, W);
          splashes.push({ x: d.x, y: H - 2, radius: random(1, 3), opacity: 1 });
        }
        if (d.x > W) d.x = 0;
        if (d.x < 0) d.x = W;
      }

      // рисуем брызги
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(173,216,230,${s.opacity})`;
        ctx.fill();
        s.opacity -= 0.05;
        if (s.opacity <= 0) splashes.splice(i, 1);
      }

      // молнии
      lightning();
      if (lightningTime > 0) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random()*0.3})`;
        ctx.fillRect(0, 0, W, H);
        lightningTime--;
      }

      requestAnimationFrame(draw); // 60 FPS
    }

    draw();
  }

  initRainstorm();
})();
