// ==Denis Morera-Gushkan Script==
// @aukro1408        Lampa Christmas Magic Deluxe
// @namespace    lampa.christmas.deluxe
// @version      1.1
// @description  Падающий снег + Санта, снеговик, олень и Гринч для Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function initChristmasMagic() {
    if (!window.Lampa || !document.body) {
      return setTimeout(initChristmasMagic, 1000);
    }

    if (document.getElementById('christmas-magic')) return;

    const container = document.createElement('div');
    container.id = 'christmas-magic';
    Object.assign(container.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 9999,
    });
    document.body.appendChild(container);

    const images = [
      // персонажи
      'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags/png100px/santa.png', // Санта
      'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags/png100px/snowman.png', // Снеговик
      'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags/png100px/reindeer.png', // Олень
      'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags/png100px/grinch.png', // Гринч (условная иконка)
      // снежинки
      'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/2744.png',
      'https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/72x72/1f9ca.png',
    ];

    function createFloatingItem() {
      const item = document.createElement('img');
      const img = images[Math.floor(Math.random() * images.length)];
      item.src = img;

      const size = Math.random() * 70 + 30;
      const left = Math.random() * 100;
      Object.assign(item.style, {
        position: 'absolute',
        top: '-100px',
        left: left + '%',
        width: size + 'px',
        height: 'auto',
        opacity: Math.random() * 0.9 + 0.1,
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `floatDown ${15 + Math.random() * 20}s linear forwards`,
        filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))',
      });

      if (Math.random() < 0.3) {
        item.style.animation += `, sparkle ${1 + Math.random() * 2}s ease-in-out infinite alternate`;
      }

      container.appendChild(item);

      item.addEventListener('animationend', () => item.remove());
    }

    setInterval(createFloatingItem, 700);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatDown {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(110vh) rotate(360deg); }
      }
      @keyframes sparkle {
        0% { opacity: 0.4; filter: drop-shadow(0 0 2px rgba(255,255,255,0.3)); }
        100% { opacity: 1; filter: drop-shadow(0 0 15px rgba(255,255,255,1)); }
      }
    `;
    document.head.appendChild(style);
  }

  initChristmasMagic();
})();
