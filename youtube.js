// ==UserScript==
// @name         Lampa YouTube Plugin (поиск + встроенный экран)
// @namespace    lampa.youtube
// @version      3.0
// @description  YouTube прямо в Lampa: поиск, популярное и просмотр внутри плеера Lampa
// @author       You
// @match        *://*/lampa/*
// @grant        GM_xmlhttpRequest
// @connect      www.googleapis.com
// ==/UserScript==

(function () {
  'use strict';

  const API_KEY = 'ВСТАВЬ_СВОЙ_API_KEY';
  const PLUGIN_ID = 'youtube';
  const PLUGIN_NAME = 'YouTube';

  const ICON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>';

  /* ------------------ API ------------------ */

  function fetchYouTube(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload: res => {
          try {
            const data = JSON.parse(res.responseText);
            resolve(data.items || []);
          } catch (e) {
            reject(e);
          }
        },
        onerror: reject
      });
    });
  }

  function getPopular() {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=US&maxResults=25&key=${API_KEY}`;
    return fetchYouTube(url);
  }

  function searchYouTube(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=25&q=${encodeURIComponent(query)}&key=${API_KEY}`;
    return fetchYouTube(url);
  }

  /* ------------------ COMPONENT ------------------ */

  function registerYouTubeComponent() {
    Lampa.Component.add('youtube', {
      name: PLUGIN_NAME,
      onCreate() {},
      onStart() {
        const self = this;
        let currentQuery = '';
        self.activity.loader(true);

        // контейнер для UI поиска
        const searchBox = $('<div class="youtube-search" style="margin:10px 0;display:flex;gap:10px;align-items:center;"></div>');
        const input = $('<input type="text" placeholder="Поиск на YouTube..." style="flex:1;padding:8px 12px;border-radius:8px;border:none;outline:none;background:#1a1a1a;color:#fff;">');
        const button = $('<button style="padding:8px 14px;border-radius:8px;background:#d32f2f;color:#fff;cursor:pointer;border:none;">Поиск</button>');
        searchBox.append(input, button);

        $(self.render()).prepend(searchBox);

        function renderList(videos) {
          const items = videos.map(v => {
            const vid = v.id.videoId || v.id; // search vs videos
            return {
              title: v.snippet.title,
              subtitle: v.snippet.channelTitle,
              image: v.snippet.thumbnails.high.url,
              player: {
                url: `https://www.youtube.com/watch?v=${vid}`,
                title: v.snippet.title,
                poster: v.snippet.thumbnails.high.url
              }
            };
          });
          self.activity.renderItems(items);
        }

        function loadPopular() {
          self.activity.loader(true);
          getPopular()
            .then(videos => {
              self.activity.loader(false);
              renderList(videos);
            })
            .catch(() => {
              Lampa.Noty.show('Ошибка загрузки YouTube');
              self.activity.loader(false);
            });
        }

        function performSearch() {
          const q = input.val().trim();
          if (!q) {
            loadPopular();
            return;
          }
          self.activity.loader(true);
          currentQuery = q;
          searchYouTube(q)
            .then(videos => {
              self.activity.loader(false);
              renderList(videos);
            })
            .catch(() => {
              Lampa.Noty.show('Ошибка поиска YouTube');
              self.activity.loader(false);
            });
        }

        // события
        button.on('click', performSearch);
        input.on('keydown', e => {
          if (e.key === 'Enter') performSearch();
        });

        // загружаем популярные при открытии
        loadPopular();
      },
      onBack() {
        Lampa.Activity.backward();
      }
    });
  }

  /* ------------------ Плагин в меню ------------------ */

  function registerPlugin() {
    Lampa.Plugin.create(PLUGIN_ID, {
      title: PLUGIN_NAME,
      icon: ICON,
      onSelect: function () {
        Lampa.Activity.push({
          url: '',
          title: PLUGIN_NAME,
          component: 'youtube',
          page: 1
        });
      }
    });
  }

  /* ------------------ INIT ------------------ */

  function init() {
    if (!window.Lampa || !Lampa.Plugin || !Lampa.Component) {
      setTimeout(init, 500);
      return;
    }

    registerYouTubeComponent();
    registerPlugin();

    console.log('[YouTube Plugin] готов ✅');
  }

  init();
})();
