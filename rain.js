// ==UserScript==
// @name         Lampa Rain Effect
// @namespace    lampa.rain
// @version      1.0
// @description  Дождь в интерфейсе Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function initRain() {
    if (!window.Lampa) {
      setTimeout(initRain, 1000);
      return;
    }

    // Создаем canvas поверх всего интерфейса
    const canvas = document.createElement('canvas');
    canvas.id = 'rainEffect';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; // чтобы не мешал кликам
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
    const dropCount = 150;

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    // Создаем капли
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: random(0, W),
        y: random(0, H),
        length: random(10, 20),
        speed: random(4, 10),
        opacity: random(0.1, 0.5)
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(173,216,230,0.6)'; // голубой цвет дождя
      ctx.lineWidth = 2;

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.length);
        ctx.stroke();

        d.y += d.speed;
        if (d.y > H) {
          d.y = -20;
          d.x = random(0, W);
        }
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  initRain();
})();
