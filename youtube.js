// ==UserScript==
// @name         Lampa YouTube Plugin (фолбэк-оверлей)
// @namespace    lampa.youtube
// @version      1.3
// @description  YouTube в Lampa — открывает оверлей с популярными видео (фолбэк, если компоненты не работают)
// @author       You
// @match        *://*/lampa/*
// @grant        GM_xmlhttpRequest
// @connect      www.googleapis.com
// ==/UserScript==

(function () {
  'use strict';

  const API_KEY = 'AIzaSyBbZ_BNLNdgC9dylYEQdIAPkXc6g3VlLMw'; // твой ключ
  const pluginName = 'youtube';
  const pluginTitle = 'YouTube';

  const icon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>';

  /* ---------- YouTube fetch ---------- */
  function fetchPopularVideos() {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=US&maxResults=20&key=${API_KEY}`;
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: (res) => {
          try {
            const data = JSON.parse(res.responseText);
            resolve(data.items || []);
          } catch (e) {
            reject(e);
          }
        },
        onerror: (e) => reject(e)
      });
    });
  }

  /* ---------- Оверлей UI (фолбэк) ---------- */
  function createOverlay() {
    // если уже создан — вернуть ссылку
    let existing = document.getElementById('lampa-youtube-overlay');
    if (existing) return existing;

    const overlay = document.createElement('div');
    overlay.id = 'lampa-youtube-overlay';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'background:rgba(0,0,0,0.85)',
      'color:#fff',
      'z-index:99999',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'justify-content:flex-start',
      'padding:20px',
      'overflow:auto'
    ].join(';');

    // header
    const header = document.createElement('div');
    header.style.cssText = 'width:100%;max-width:1100px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px';
    const title = document.createElement('div');
    title.innerHTML = `${icon} <strong style="margin-left:8px">${pluginTitle}</strong>`;
    title.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:18px';
    header.appendChild(title);

    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:8px;align-items:center';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Закрыть';
    closeBtn.style.cssText = 'padding:6px 10px;border-radius:6px;background:#222;border:1px solid #444;color:#fff;cursor:pointer';
    closeBtn.addEventListener('click', () => overlay.remove());
    controls.appendChild(closeBtn);

    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = 'Обновить';
    refreshBtn.style.cssText = 'padding:6px 10px;border-radius:6px;background:#222;border:1px solid #444;color:#fff;cursor:pointer';
    refreshBtn.addEventListener('click', () => loadList(container));
    controls.appendChild(refreshBtn);

    header.appendChild(controls);
    overlay.appendChild(header);

    // container
    const container = document.createElement('div');
    container.style.cssText = 'width:100%;max-width:1100px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px';
    overlay.appendChild(container);

    // loader text
    const loader = document.createElement('div');
    loader.id = 'lampa-youtube-loader';
    loader.textContent = 'Загрузка...';
    loader.style.cssText = 'color:#ddd;font-size:16px;width:100%;text-align:center;margin-top:40px';
    overlay.appendChild(loader);

    document.body.appendChild(overlay);
    return overlay;
  }

  function renderVideos(container, videos) {
    container.innerHTML = ''; // очистим
    videos.forEach(v => {
      const card = document.createElement('div');
      card.style.cssText = 'background:#0f0f0f;border-radius:8px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column';
      // thumb
      const thumb = document.createElement('img');
      thumb.src = v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default.url;
      thumb.alt = v.snippet.title;
      thumb.style.cssText = 'width:100%;height:130px;object-fit:cover;display:block';
      card.appendChild(thumb);
      // body
      const body = document.createElement('div');
      body.style.cssText = 'padding:8px;font-size:13px';
      const t = document.createElement('div');
      t.textContent = v.snippet.title;
      t.style.cssText = 'font-weight:600;margin-bottom:6px;line-height:1.1;height:38px;overflow:hidden';
      body.appendChild(t);
      const ch = document.createElement('div');
      ch.textContent = v.snippet.channelTitle;
      ch.style.cssText = 'opacity:0.8;font-size:12px';
      body.appendChild(ch);
      card.appendChild(body);

      // click: попробуем Lampa.Player, иначе window.open
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const videoUrl = `https://www.youtube.com/watch?v=${v.id}`;
        try {
          if (window.Lampa && Lampa.Player && typeof Lampa.Player.play === 'function') {
            // попытка воспроизвести встроенным плеером Lampa
            Lampa.Player.play({
              url: videoUrl,
              title: v.snippet.title,
              image: v.snippet.thumbnails.high?.url
            });
            // закроем оверлей если удалось
            const ov = document.getElementById('lampa-youtube-overlay');
            if (ov) ov.remove();
            return;
          }
        } catch (err) {
          console.warn('Не удалось запустить Lampa.Player:', err);
        }
        // fallback: открыть в новой вкладке
        window.open(videoUrl, '_blank');
      });

      container.appendChild(card);
    });
  }

  async function loadList(container) {
    const loader = document.getElementById('lampa-youtube-loader');
    if (loader) loader.textContent = 'Загрузка...';
    try {
      const videos = await fetchPopularVideos();
      if (loader) loader.textContent = '';
      if (!container) {
        // если контейнер не передали — найдём
        const ov = document.getElementById('lampa-youtube-overlay');
        container = ov && ov.querySelector('div:nth-child(2)');
      }
      renderVideos(container, videos);
    } catch (err) {
      console.error('Ошибка загрузки YouTube:', err);
      if (loader) loader.textContent = 'Ошибка загрузки. Нажмите "Обновить".';
      try { Lampa.Noty && Lampa.Noty.show && Lampa.Noty.show('Ошибка загрузки YouTube'); } catch(e){}
    }
  }

  /* ---------- Добавляем пункт меню (и двойной обработчик: onSelect/onAction) ---------- */
  function addYouTubeMenuButton() {
    // если API меню не доступен — добавляем через Lampa.Listener (фолбэк) или прямо в DOM
    try {
      if (window.Lampa && Lampa.Menu && typeof Lampa.Menu.add === 'function') {
        Lampa.Menu.add({
          name: pluginName,
          title: pluginTitle,
          icon,
          // Используем оба обработчика — на всякий случай
          onSelect: onMenuClick,
          onAction: onMenuClick
        });
        console.log('[YouTube Plugin] добавлен через Lampa.Menu.add');
        return;
      }
    } catch (e) {
      console.warn('Lampa.Menu.add недоступен:', e);
    }

    // пробуем через Listener (старые сборки)
    try {
      if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.send === 'function') {
        Lampa.Listener.send('menu', {
          type: 'add',
          object: {
            name: pluginName,
            title: pluginTitle,
            icon,
            onAction: onMenuClick
          }
        });
        console.log('[YouTube Plugin] добавлен через Lampa.Listener.send(menu:add)');
        return;
      }
    } catch (e) {
      console.warn('Lampa.Listener.send(menu:add) не сработал:', e);
    }

    // Если оба не сработали — пробуем добавить кнопку в DOM (не всегда применимо)
    try {
      const attemptAddDom = () => {
        // ищем корневое меню Lampa (тут может потребоваться адаптация под конкретный DOM)
        const menuRoot = document.querySelector('.lampa__menu, .menu, #menu');
        if (menuRoot) {
          const btn = document.createElement('button');
          btn.innerHTML = icon + ' <span style="margin-left:8px">' + pluginTitle + '</span>';
          btn.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;background:#111;border:1px solid #333;color:#fff;margin:6px;border-radius:6px;cursor:pointer';
          btn.addEventListener('click', onMenuClick);
          menuRoot.appendChild(btn);
          console.log('[YouTube Plugin] добавлен в DOM (фолбэк)');
        } else {
          console.warn('[YouTube Plugin] не нашёл контейнер меню для DOM-вставки. Попробую позже.');
          // попробуем снова через 1 сек
          setTimeout(attemptAddDom, 1000);
        }
      };
      attemptAddDom();
    } catch (e) {
      console.error('Не удалось добавить кнопку в DOM:', e);
    }
  }

  /* ---------- Обработчик клика по меню ---------- */
  function onMenuClick() {
    try {
      // Если есть стандартный способ открыть Activity — попробуем сначала
      if (window.Lampa && Lampa.Activity && typeof Lampa.Activity.push === 'function') {
        // Попытка открыть компонент (если он зарегистрирован)
        try {
          Lampa.Activity.push({
            url: '',
            title: pluginTitle,
            component: 'youtube_list',
            page: 1
          });
          console.log('[YouTube Plugin] попытка открыть Lampa.Activity.push(component: youtube_list)');
          // всё — возвращаемся, если компонент есть он обработает отображение
          // но на случай, если компонент не зарегистрирован или ничего не покажет — продолжим и откроем оверлей
        } catch (e) {
          console.warn('Lampa.Activity.push вызвал ошибку:', e);
        }
      }
    } catch (e) {
      console.warn('Ошибка при попытке открыть Activity:', e);
    }

    // Всегда открываем фолбэк-оверлей (надёжнее)
    const ov = createOverlay();
    const container = ov.querySelector('div:nth-child(2)'); // наш грид-контейнер
    loadList(container);
  }

  /* ---------- Инициализация: ждём Lampa или просто ставим кнопку через таймауты ---------- */
  function init() {
    if (window.Lampa) {
      console.log('[YouTube Plugin] Lampa найден, устанавливаем кнопку');
      addYouTubeMenuButton();
    } else {
      console.log('[YouTube Plugin] Lampa не найден, ожидаю...');
      // на случай если Lampa загружается позже
      let tries = 0;
      const tid = setInterval(() => {
        tries++;
        if (window.Lampa) {
          console.log('[YouTube Plugin] Lampa обнаружен (retry), ставлю кнопку');
          addYouTubeMenuButton();
          clearInterval(tid);
        } else if (tries > 20) {
          console.warn('[YouTube Plugin] Lampa не появился, всё равно пытаюсь вставить кнопку в DOM');
          addYouTubeMenuButton();
          clearInterval(tid);
        }
      }, 500);
    }
  }

  // запуск
  init();

})();
