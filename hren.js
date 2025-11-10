// ==UserScript==
// @name         Lampa Add "Хрень" Menu Item — Random Movie (Beta Fixed)
// @namespace    lampa.hren
// @version      1.4
// @description  Добавляет пункт меню "Хрень" с анимированным сердечком, открывает случайный фильм
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
  'use strict';

  // Добавляем анимацию сердца
  const style = document.createElement('style');
  style.textContent = `
    @keyframes heartPulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.2); opacity: 1; }
    }
    .hren-item svg {
      animation: heartPulse 2s infinite ease-in-out;
      transition: transform 0.2s;
    }
    .hren-item:hover svg {
      transform: scale(1.3);
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  // Функция добавления пункта меню
  function addHrenItem() {
    const menuList = document.querySelector('.menu__list') || document.querySelector('.menu__scroll');
    if (!menuList) return setTimeout(addHrenItem, 1000);
    if (menuList.querySelector('.menu__item.hren-item')) return;

    const item = document.createElement('div');
    item.classList.add('menu__item', 'hren-item');
    item.style.cursor = 'pointer';
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

    // --- Логика случайного фильма ---
    item.addEventListener('click', async () => {
      if (!window.Lampa || !Lampa.Noty) return;

      Lampa.Noty.show('Выбираю хрень дня... 🍿');

      try {
        const randomPage = Math.floor(Math.random() * 50) + 1;
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=4ef0d7355a9a96886e6c4b21c9b6e0b8&page=${randomPage}&language=ru-RU`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.results?.length) {
          Lampa.Noty.show('Не удалось найти хрень 😅');
          return;
        }

        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];

        // Открываем карточку фильма в интерфейсе Lampa
        Lampa.Activity.push({
          component: 'full',
          source: 'tmdb',
          id: randomMovie.id,
          title: randomMovie.title,
          url: '',
          method: 'movie'
        });

        Lampa.Noty.show(`Хрень выбрала: ${randomMovie.title} 🎬`);
      } catch (err) {
        console.error(err);
        Lampa.Noty.show('Ошибка при получении хрени 💩');
      }
    });

    // Вставляем после "Избранное"
    const favorite = [...menuList.querySelectorAll('.menu__item')].find(el =>
      el.textContent.trim().includes('Избранное')
    );
    if (favorite && favorite.nextSibling) {
      menuList.insertBefore(item, favorite.nextSibling);
    } else {
      menuList.appendChild(item);
    }
  }

  // Ждём появления меню
  const observer = new MutationObserver(() => {
    if (document.querySelector('.menu__list, .menu__scroll')) {
      observer.disconnect();
      addHrenItem();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
