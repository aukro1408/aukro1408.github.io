// ==UserScript==
// @name         Lampa Christmas Magic
// @namespace    lampa.christmas
// @version      1.0
// @description  Падающий снег, Санта, снеговик, олень и Гринч для Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function initChristmasMagic() {
    if (!window.Lampa || !document.body) {
      return setTimeout(initChristmasMagic, 1000);
    }

    // Создаём контейнер
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
      'https://i.imgur.com/NZ0ErzA.png', // Санта
      'https://i.imgur.com/5zFv7Ro.png', // Олень
      'https://i.imgur.com/gH1FZmb.png', // Снеговик
      'https://i.imgur.com/yQ53Uec.png', // Гринч
      'https://i.imgur.com/4M7D1ay.png', // Снежинка 1
      'https://i.imgur.com/6v2AI6O.png', // Снежинка 2
    ];

    // Функция создания элемента
    function createFloatingItem() {
      const item = document.createElement('img');
      item.src = images[Math.floor(Math.random() * images.length)];
      const size = Math.random() * 60 + 30;
      Object.assign(item.style, {
        position: 'absolute',
        top: '-80px',
        left: Math.random() * 100 + '%',
        width: size + 'px',
        height: 'auto',
        opacity: Math.random() * 0.8 + 0.2,
        filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.7))',
        transition: 'transform 1s linear',
        animation: `floatDown ${10 + Math.random() * 20}s linear infinite`,
      });

      if (Math.random() < 0.3) {
        // добавляем эффект мерцания
        item.style.animation += `, sparkle ${1 + Math.random() * 2}s ease-in-out infinite alternate`;
      }

      container.appendChild(item);

      // удаляем, когда выходит за пределы
      setTimeout(() => item.remove(), 30000);
    }

    // Периодическое создание элементов
    setInterval(createFloatingItem, 700);

    // Добавляем анимации
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatDown {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(110vh) rotate(360deg); }
      }

      @keyframes sparkle {
        0% { opacity: 0.3; filter: drop-shadow(0 0 3px rgba(255,255,255,0.3)); }
        100% { opacity: 1; filter: drop-shadow(0 0 10px rgba(255,255,255,1)); }
      }
    `;
    document.head.appendChild(style);
  }

  initChristmasMagic();
})();
