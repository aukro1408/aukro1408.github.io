// ==UserScript==
// @name         Lampa Christmas Magic Cartoon
// @namespace    lampa.christmas.cartoon
// @version      1.0
// @description  Мультяшный Санта, снеговик, олень, Гринч + снежинки, прозрачный фон, плавный полёт, для Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function() {
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

    // Ссылки на мультяшные PNG с прозрачным фоном (личное/коммерческое использование свободно)
    const images = [
      'https://pikwizard.com/png/505b4da7f7fdfd845ba1dd3a5c68ce56', // Санта
      'https://www.citypng.com/public/uploads/preview/mr-grinch-christmas-santa-hat-cartoon-character-png-7017516948727832mrlflmu6n.png', // Гринч
      'https://www.freepng.com/vector-cartoon-cute-little-brown-reindeer-png-3866', // Олень
      'https://pikwizard.com/png/b07fc630e07cb071cac2b94cfa9d2aa4', // Снеговик
      'https://png.pngtree.com/png-vector/20241217/ourmid/pngtree-christmas-snowman-cartoon-png-image_2548239.png', // Снежинка 1
      'https://png.pngtree.com/png-vector/20201211/ourmid/pngtree-christmas-snowflake-cartoon-png-image_13613664.png', // Снежинка 2
    ];

    function createFloatingItem() {
      const item = document.createElement('img');
      const src = images[Math.floor(Math.random() * images.length)];
      item.src = src;

      const size = Math.random() * 70 + 30;
      const left = Math.random() * 100;

      Object.assign(item.style, {
        position: 'absolute',
        top: '-120px',
        left: left + '%',
        width: size + 'px',
        height: 'auto',
        opacity: Math.random() * 0.8 + 0.3,
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `floatDown ${15 + Math.random() * 15}s linear forwards`,
      });

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
    `;
    document.head.appendChild(style);
  }

  initChristmasMagic();
})();
