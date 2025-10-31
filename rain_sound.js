// ==UserScript==
// @name         Lampa Rainstorm Effect with Sound Button
// @namespace    lampa.rainstorm
// @version      1.3
// @description  Дождь с ветром, молниями и кнопкой включения/выключения звука для Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function initRainstorm() {
    if (!window.Lampa) {
      setTimeout(initRainstorm, 1000);
      return;
    }

    // --- Создаём звук дождя ---
    const audio = document.createElement('audio');
    audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // заменить на реальный дождь
    audio.loop = true;
    audio.volume = 0.3;
    audio.style.display = 'none';
    document.body.appendChild(audio);

    let soundOn = false; // звук изначально выключен

    // --- Создаём кнопку включения звука ---
    const btn = document.createElement('div');
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.width = '50px';
    btn.style.height = '50px';
    btn.style.borderRadius = '25px';
    btn.style.backgroundColor = 'rgba(0,0,0,0.5)';
    btn.style.color = 'white';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.fontSize = '12px';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = '99999';
    btn.innerText = 'Звук';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      if (!soundOn) {
        audio.play().catch(() => console.log('Нажмите ещё раз, чтобы разрешить звук'));
        btn.style.backgroundColor = 'rgba(0,100,0,0.7)';
      } else {
        audio.pause();
        btn.style.backgroundColor = 'rgba(0,0,0,0.5)';
      }
      soundOn = !soundOn;
    });

    // --- Canvas дождя ---
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

    const drops = [];
    const dropCount = 200;
    const wind = -1;

    function random(min, max) { return Math.random() * (max - min) + min; }

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: random(0, W),
        y: random(0, H),
        length: random(15, 25),
        speed: random(5, 12),
        opacity: random(0.1, 0.5),
        angle: random(-0.3, 0.3)
      });
    }

    let lightningTime = 0;
    function lightning() {
      if (Math.random() < 0.002 && lightningTime <= 0) {
        lightningTime = random(5, 20);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(10,10,20,0.2)';
      ctx.fillRect(0, 0, W, H);

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

        if (d.y > H) {
          d.y = -20;
          d.x = random(0, W);
        }
        if (d.x > W) d.x = 0;
        if (d.x < 0) d.x = W;
      }

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
