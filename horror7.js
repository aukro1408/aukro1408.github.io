// ==UserScript==
// @name         Lampa Add "Хрень" Menu Item — Stable
// @namespace    lampa.hren.stable
// @version      3.0
// @description  Ужасы с нормальной стабильностью
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  // 🌈 стиль оставляем
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rainbowFill {
      0%{fill:red;}
      16%{fill:orange;}
      32%{fill:yellow;}
      48%{fill:green;}
      64%{fill:blue;}
      80%{fill:indigo;}
      100%{fill:violet;}
    }
    .hren-item svg{
      animation: rainbowFill 4s infinite linear;
      transition: transform .2s;
    }
    .hren-item:hover svg{
      transform: scale(1.3);
    }
  `;
  document.head.appendChild(style);

  function addHrenItem() {
    if (!window.Lampa) return;

    const menuList = document.querySelector('.menu__list,.menu__scroll');
    if (!menuList) return;

    // 🔥 защита от дублей
    if (document.querySelector('.hren-item')) return;

    const item = document.createElement('div');
    item.classList.add('menu__item', 'hren-item');

    item.innerHTML = `
      <div class="menu__ico">
        <svg width="24" height="24" viewBox="0 0 24 24">
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

    item.onclick = () => {
      Lampa.Activity.push({
        component: 'category_full',
        source: 'tmdb',
        title: 'Ужасы 😱',
        url: 'discover/movie?with_genres=27&sort_by=popularity.desc&language=ru-RU'
      });
    };

    menuList.insertBefore(item, menuList.firstChild);
  }

  // 🚀 правильный хук
  if (window.Lampa) {
    addHrenItem();
  }

  document.addEventListener('DOMContentLoaded', addHrenItem);

})();
