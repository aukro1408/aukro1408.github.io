// ==UserScript==
// @name         Lampa Rainstorm Effect
// @namespace    lampa.rainstorm
// @version      1.0
// @description  Дождь с ветром и молниями для Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function initRainstorm() {
    if (!window.Lampa) {
      setTimeout(initRainstorm, 1000);
      return;
    }

    // Canvas поверх интерфейса
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

    // Настройки дождя
    const drops = [];
    const dropCount = 200; // больше капель
    const wind = -1; // отрицательное = влево, положительное = вправо

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    // создаём капли
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: random(0, W),
        y: random(0, H),
        length: random(15, 25),
        speed: random(5, 12),
        opacity: random(0.1, 0.5),
        angle: random(-0.3, 0.3) // угол падения для ветра
      });
    }

    // Молнии
    let lightningTime = 0;
    function lightning() {
      if (Math.random() < 0.002 && lightningTime <= 0) {
        lightningTime = random(5, 20); // кадры молнии
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // фон затемнённый (ночь)
      ctx.fillStyle = 'rgba(10,10,20,0.2)';
      ctx.fillRect(0, 0, W, H);

      // рисуем дождь
      ctx.strokeStyle = 'rgba(173,216,230,0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + wind * d.angle * 10, d.y + d.length);
        ctx.stroke();

        d.y += d.speed;
        d.x += wind + d.angle; // добавляем ветер

        if (d.y > H) {
          d.y = -20;
          d.x = random(0, W);
        }
        if (d.x > W) d.x = 0;
        if (d.x < 0) d.x = W;
      }

      // молния
      lightning();
      if (lightningTime > 0) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random()*0.3})`;
        ctx.fillRect(0, 0, W, H);
        lightningTime--;
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  initRainstorm();
})();
