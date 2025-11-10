// ==UserScript==
// @name         Lampa Add "Хрень" Menu Item — Glowing Rainbow Heart
// @namespace    lampa.hren.glowing
// @version      2.4
// @description  Добавляет пункт меню "Хрень" (ужасы) с пульсирующим радужным сияющим сердцем вверху
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  // 🔥 Анимация пульсации, переливания и свечения
  const style = document.createElement('style');
  style.textContent = `
    @keyframes heartPulse {
      0%,100%{transform:scale(1);opacity:0.9;}
      50%{transform:scale(1.2);opacity:1;}
    }
    @keyframes rainbowFill {
      0%{fill:red;}
      16%{fill:orange;}
      32%{fill:yellow;}
      48%{fill:green;}
      64%{fill:blue;}
      80%{fill:indigo;}
      100%{fill:violet;}
    }
    @keyframes heartGlow {
      0%,100%{filter: drop-shadow(0 0 2px #fff);}
      50%{filter: drop-shadow(0 0 10px #fff);}
    }
    .hren-item svg{
      animation: heartPulse 2s infinite ease-in-out,
                 rainbowFill 4s infinite linear,
                 heartGlow 2s infinite ease-in-out;
      transition: transform .2s;
    }
    .hren-item:hover svg{
      transform: scale(1.3);
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

    // Вставляем **в самый верх**
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
