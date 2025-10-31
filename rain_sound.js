// ==UserScript==
// @name         Lampa Rain Effect with Sound
// @namespace    lampa.rain
// @version      1.1
// @description  Дождь в интерфейсе Lampa с кнопкой звука
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
    const dropCount = 150;

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

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
      ctx.strokeStyle = 'rgba(173,216,230,0.6)';
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

    // === Добавляем звук дождя ===
    const rainSoundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_3a8b9f7b45.mp3?filename=rain-ambient-10294.mp3';
    const audio = new Audio(rainSoundUrl);
    audio.loop = true;
    audio.volume = 0.5;

    // Создаем кнопку
    const btn = document.createElement('button');
    btn.innerText = '🌧️ Дождь';
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.zIndex = 10000;
    btn.style.padding = '10px 15px';
    btn.style.fontSize = '16px';
    btn.style.borderRadius = '8px';
    btn.style.border = 'none';
    btn.style.background = '#3498db';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

    let isPlaying = false;

    btn.onclick = () => {
      if (!isPlaying) {
        audio.play();
        btn.style.background = '#2ecc71';
        btn.innerText = '🌧️ Дождь ВКЛ';
      } else {
        audio.pause();
        btn.style.background = '#3498db';
        btn.innerText = '🌧️ Дождь';
      }
      isPlaying = !isPlaying;
    };

    document.body.appendChild(btn);
  }

  initRain();
})();
