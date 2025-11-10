// ==UserScript==
// @name         Lampa Add "Хрень" Menu Item — Cracked Heart
// @namespace    lampa.hren.cracked
// @version      2.1
// @description  Добавляет пункт меню "Хрень" (ужасы) с треснутым пульсирующим сердцем
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  // 🔥 Анимация пульсации
  const style = document.createElement('style');
  style.textContent = `
    @keyframes heartPulse {
      0%,100%{transform:scale(1);opacity:0.9;}
      50%{transform:scale(1.2);opacity:1;}
    }
    .hren-item svg{animation:heartPulse 2s infinite ease-in-out;transition:transform .2s;}
    .hren-item:hover svg{transform:scale(1.3);opacity:1;}
    /* Линия трещины */
    .hren-item svg line{
      stroke:red;
      stroke-width:2;
      stroke-dasharray:4 2;
    }
  `;
  document.head.appendChild(style);

  function addHrenItem() {
    const menuList = document.querySelector('.menu__list,.menu__scroll');
    if (!menuList || document.querySelector('.hren-item')) return;

    const item = document.createElement('div');
    item.classList.add('menu__item', 'hren-item');
    item.style.cursor = 'pointer';
    item.innerHTML = `
      <div class="menu__ico">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12.1 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                   2 5.42 4.42 3 7.5 3
                   c1.74 0 3.41 0.81 4.5 2.09
                   C13.09 3.81 14.76 3 16.5 3
                   19.58 3 22 5.42 22 8.5
                   c0 3.78-3.4 6.86-8.55 11.54L12.1 21.35z"/>
          <line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
      </div>
      <div class="menu__text">Хрень</div>
    `;

    item.addEventListener('click', () => {
      if (!window.Lampa) return;
      try {
        Lampa.Noty.show('Хрень вызывает ужасы... 👻');
        Lampa.Activity.push({
          component: 'category_full',
          source: 'tmdb',
          title: 'Хрень: Ужасы 😱',
          url: 'discover/movie?with_genres=27&sort_by=popularity.desc',
          page: Math.floor(Math.random() * 10) + 1
        });
      } catch (e) {
        console.error(e);
        Lampa.Noty.show('Ошибка при вызове хрени 💩');
      }
    });

    const mainItem = [...menuList.querySelectorAll('.menu__item')]
      .find(el => el.textContent.trim().includes('Главная'));
    if (mainItem && mainItem.nextSibling)
      menuList.insertBefore(item, mainItem.nextSibling);
    else
      menuList.insertBefore(item, menuList.firstChild);
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector('.menu__list,.menu__scroll') && window.Lampa) {
      observer.disconnect();
      addHrenItem();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
