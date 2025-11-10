// ==UserScript==
// @name         Lampa Add "Хрень" Menu Item
// @namespace    lampa.hren
// @version      1.0
// @description  Добавляет пункт меню "Хрень" с иконкой сердечка
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  function addMenuItem() {
    if (!window.Lampa || !Lampa.Listener) {
      setTimeout(addMenuItem, 500);
      return;
    }

    // Проверяем, нет ли уже нашего пункта
    if (document.querySelector('.menu__item.hren-item')) return;

    // Создаём пункт меню
    const item = document.createElement('div');
    item.classList.add('menu__item', 'hren-item');
    item.innerHTML = `
      <div class="menu__ico">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
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

    // Добавляем обработчик клика (ничего не делает)
    item.addEventListener('click', (e) => {
      e.preventDefault();
      Lampa.Noty.show('Просто хрень 😎');
    });

    // Добавляем в боковое меню
    const menu = document.querySelector('.menu__list') || document.querySelector('.menu__scroll');
    if (menu) menu.appendChild(item);
  }

  addMenuItem();
})();
