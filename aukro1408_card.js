// RezkaComment V2 — based directly on the supplied rezkacomment.js
(function () {
  //BDVBuriлk.github.io
  //2025
  ("use strict");

  let year;
  let namemovie;
  let savedHTML = null;

  function getSettings() {
    let host = (Lampa.Storage.get('rezka_comment_v2_host', 'https://hdrezka.ag') || 'https://hdrezka.ag').trim().replace(/\/+$/, '');
    let cookie = (Lampa.Storage.get('rezka_comment_v2_cookie', '') || '').trim();
    let proxy = (Lampa.Storage.get('rezka_comment_v2_proxy', 'https://worker-patient-dream-26d8.bdvburik.workers.dev:8443/') || 'https://worker-patient-dream-26d8.bdvburik.workers.dev:8443/').trim();
    if (proxy && !proxy.endsWith('/')) {
      proxy += '/';
    }
    return { host, cookie, proxy };
  }

  // Функция для поиска на сайте hdrezka
  async function searchRezka(name, ye, silent) {
    try {
      let { host, cookie, proxy } = getSettings();
      let path = host + "/search/?do=search&subaction=search&q=" + encodeURIComponent(name) + (ye ? "+" + ye : "");
      let searchUrl = proxy;
      if (cookie) {
        searchUrl += "param/Cookie=" + encodeURIComponent(cookie) + "/";
      }
      searchUrl += path;

      console.log('[RezkaComment V2] SEARCH:', name + (ye ? ' ' + ye : ''));

      let fc = await fetch(searchUrl, {
        method: "GET",
        headers: { "Content-Type": "text/html" }
      }).then((response) => {
        if (!response.ok) {
          throw new Error('HTTP status ' + response.status);
        }
        return response.text();
      });

      let dom = new DOMParser().parseFromString(fc, "text/html");

      const item = dom.querySelector(".b-content__inline_item");
      if (!item) {
        console.warn('[RezkaComment V2] NO CARD:', name, ye);
        if (fc.indexOf("Проверяем, что вы не бот") !== -1 || fc.indexOf("Anubis") !== -1) {
          Lampa.Noty.show('Защита от ботов на Rezka. Настройте Cookie в настройках плагина.');
          Lampa.Loading.stop();
          return false;
        }
        if (!silent) Lampa.Loading.stop();
        return false;
      }

      namemovie =
        item.querySelector(".b-content__inline_item-link")?.innerText || "";
      
      let itemUrl = item.querySelector(".b-content__inline_item-link")?.getAttribute("href") || "";
      console.log('[RezkaComment V2] FOUND ID:', item.dataset.id, 'title:', namemovie);
      await comment_rezka(item.dataset.id, itemUrl);
      return true;
    } catch (e) {
      console.error('[RezkaComment V2] searchRezka error:', e);
      console.error('[RezkaComment V2] search error:', e);
      if (!silent) {
        Lampa.Noty.show('Ошибка поиска на Rezka: ' + e.message);
        Lampa.Loading.stop();
      }
      return false;
    }
  }

  // Резолвер названия V2.
  // Английское название TMDB больше НЕ является обязательным.
  async function resolveTitle(movie, type) {
    try {
      const names = [];

      function addName(value) {
        if (typeof value !== 'string') return;
        value = value.trim();
        if (!value) return;
        const normalized = normalizeTitle(value);
        if (!normalized) return;
        if (!names.some((x) => normalizeTitle(x) === normalized)) {
          names.push(value);
        }
      }

      // Сначала самые надёжные поля самого Lampa.
      addName(movie?.original_title);
      addName(movie?.original_name);
      addName(movie?.title);

      // Затем альтернативные названия, если они уже есть в объекте.
      const alternatives = movie?.alternative_titles?.results;
      if (Array.isArray(alternatives)) {
        alternatives.forEach(function (item) {
          addName(item?.title);
          addName(item?.name);
        });
      }

      // TMDB English translation — только дополнительная попытка.
      if (movie?.id && Lampa.Api?.sources?.tmdb?.get) {
        try {
          const tmdbType = type === 'movie' ? 'movie' : 'tv';
          const cacheKey = tmdbType + '_' + movie.id;
          window.__rezkaV2TranslationsCache = window.__rezkaV2TranslationsCache || {};

          let translations = window.__rezkaV2TranslationsCache[cacheKey];

          if (!translations) {
            const data = await new Promise(function (resolve, reject) {
              Lampa.Api.sources.tmdb.get(
                tmdbType + '/' + movie.id + '?append_to_response=translations',
                {},
                resolve,
                reject
              );
            });

            translations = data?.translations?.translations || [];
            window.__rezkaV2TranslationsCache[cacheKey] = translations;
          }

          const en = translations.find(function (item) {
            return item.iso_3166_1 === 'US' || item.iso_639_1 === 'en';
          });

          addName(en?.data?.title);
          addName(en?.data?.name);
        } catch (tmdbError) {
          console.warn('[RezkaComment V2] TMDB translation unavailable:', tmdbError);
        }
      }

      console.log('[RezkaComment V2] title candidates:', names);

      if (!names.length) {
        Lampa.Noty.show('Название фильма не найдено');
        Lampa.Loading.stop();
        return;
      }

      // Пробуем варианты по очереди. Внутри searchRezka используется
      // оригинальная логика rezkacomment.js: первая карточка страницы.
      for (let i = 0; i < names.length; i++) {
        const found = await searchRezka(names[i], year, true);
        if (found) return;
      }

      Lampa.Noty.show('Фильм/сериал не найден на Rezka');
      Lampa.Loading.stop();
    } catch (e) {
      console.error('[RezkaComment V2] resolve title error:', e);
      Lampa.Noty.show('Ошибка подготовки поиска Rezka');
      Lampa.Loading.stop();
    }
  }

  // Функция для очистки заголовка от лишних символов
  function cleanTitle(str) {
    return str.replace(/[\s.,:;’'`!?]+/g, " ").trim();
  }

  // Функция для нормализации заголовка
  function normalizeTitle(str) {
    return cleanTitle(
      str
        .toLowerCase()
        .replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, "-")
        .replace(/ё/g, "е"),
    );
  }

  // Создаёт один комментарий
  function buildCommentNode(item) {
    const q = (s) => item.querySelector(s);

    const avatar = q(".ava img")?.dataset.src || q(".ava img")?.src || "";
    const user = q(".name, .b-comment__user")?.innerText || "Без имени";
    const date = q(".date, .b-comment__time")?.innerText || "";
    const text = q(".message .text, .text")?.innerHTML || "";

    const wrapper = document.createElement("div");
    wrapper.className = "message";

    wrapper.innerHTML = `
            <div class="comment-wrap">
                <div class="avatar-column">
                    <img src="${avatar}" class="avatar-img" alt="${user}">
                </div>

                <div class="comment-card">
                    <div class="comment-header">
                        <span class="name">${user}</span>
                        <span class="date">${date}</span>
                    </div>

                    <div class="comment-text">
                        <div class="text">${text}</div>
                    </div>
                </div>
            </div>
        `;

    return wrapper;
  }

  // Рекурсивно строит дерево
  function buildTree(root) {
    const fragment = document.createDocumentFragment();

    for (let li of root.children) {
      const indent = parseInt(li.dataset.indent || 0, 10);

      const wrapper = document.createElement("li");
      wrapper.className = "comments-tree-item";
      wrapper.style.marginLeft = indent > 0 ? "20px" : "0";
      wrapper.appendChild(buildCommentNode(li));

      const childrenList = li.querySelector("ol.comments-tree-list");
      if (childrenList) wrapper.appendChild(buildTree(childrenList));

      fragment.appendChild(wrapper);
    }

    return fragment;
  }

  // === Основная обработка комментариев Rezka с storage на сутки ===
  async function comment_rezka(id, pageUrl) {
    try {
      let { host, cookie, proxy } = getSettings();
      let t = Date.now();
      let path = host + "/ajax/get_comments/?t=" + t + "&news_id=" + (id ? id : "1") + "&cstart=1&type=0&comment_id=0&skin=hdrezka";

      let commentsUrl = proxy;
      if (cookie) {
        commentsUrl += "param/Cookie=" + encodeURIComponent(cookie) + "/";
      }
      if (pageUrl) {
        commentsUrl += "param/Referer=" + encodeURIComponent(pageUrl) + "/";
      }
      commentsUrl += path;

      console.log('[RezkaComment V2] COMMENTS:', id);

      let fc = await fetch(commentsUrl, {
        method: "GET",
        headers: { "Content-Type": "text/plain" },
      }).then((r) => {
        if (!r.ok) {
          throw new Error('HTTP status ' + r.status);
        }
        return r.text();
      });

      // Check if the response is actually HTML challenge instead of JSON
      if (fc.indexOf("Проверяем, что вы не бот") !== -1 || fc.indexOf("Anubis") !== -1) {
        Lampa.Noty.show('Защита от ботов на Rezka. Настройте Cookie в настройках плагина.');
        Lampa.Loading.stop();
        return;
      }

      let json = JSON.parse(fc);
      if (!json || !json.comments) {
        throw new Error('Пустой ответ от сервера комментариев');
      }

      let dom = new DOMParser().parseFromString(json.comments, "text/html");
      dom
        .querySelectorAll(".actions, i, .share-link")
        .forEach((elem) => elem.remove());

      let rootList = dom.querySelector(".comments-tree-list");
      if (!rootList) {
        console.warn('[RezkaComment V2] comments-tree-list not found in parsed HTML for', id);
        Lampa.Noty.show('Комментарии к фильму/сериалу отсутствуют');
        Lampa.Loading.stop();
        return;
      }

      let newTree = buildTree(rootList);
      openModal(newTree, window.__rezkaCommentCurrentMovie || {});
    } catch (e) {
      console.error('[RezkaComment V2] comment_rezka error:', e);
      Lampa.Noty.show('Ошибка получения комментариев: ' + e.message);
      Lampa.Loading.stop();
    }

    // Rezka inserts inline onclick="ShowOrHide('...')" into spoiler links.
    // A local function inside the plugin IIFE is not visible to inline handlers,
    // so explicitly expose the handler on window.
    if (typeof window.ShowOrHide !== "function") {
      window.ShowOrHide = function (id) {
        if (!id) return;

        let target = document.getElementById(id);

        if (!target) {
          const modalTarget = document.querySelector(".rezka-comments-page #" + id);
          target = modalTarget || null;
        }

        if (!target) return;

        target.style.display = "inline";

        const previous = target.previousElementSibling;
        if (previous && previous.classList.contains("title_spoiler")) {
          previous.remove();
        }
      };
    }

    function openModal(treeContent, movie) {
      Lampa.Loading.stop();

      movie = movie || {};

      const title = movie.title || movie.name || namemovie || "Комментарии";
      const originalTitle = movie.original_title || movie.original_name || "";
      const yearMovie = (movie.release_date || movie.first_air_date || "").slice(0, 4);

      let poster = movie.backdrop_path || movie.poster_path || movie.cover || movie.image || "";

      if (poster && poster.indexOf("http") !== 0) {
        poster = "https://image.tmdb.org/t/p/w780" + poster;
      }

      const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : "";

      const meta = [
        yearMovie,
        originalTitle && originalTitle !== title ? originalTitle : "",
        rating ? "★ " + rating : ""
      ].filter(Boolean).join("  •  ");

      let modal = $(
        `<div class="rezka-comments-page">
          <div class="rezka-film-header">
            ${poster ? `<img class="rezka-film-backdrop" src="${poster}" alt="">` : ""}
            <div class="rezka-film-overlay"></div>
            <div class="rezka-film-info">
              <div class="rezka-film-title">${title}</div>
              ${meta ? `<div class="rezka-film-meta">${meta}</div>` : ""}
            </div>
          </div>

          <div class="broadcast__text rezka-comments-content" style="text-align:left;">
            <div class="comment"></div>
          </div>
        </div>`
      );

      modal.find(".comment").append(treeContent);

      // Remove inline ShowOrHide() calls from Rezka HTML and handle spoilers locally.
      // This avoids "ShowOrHide is not defined" inside Lampa.
      modal.find('[onclick*="ShowOrHide"]').each(function () {
        const onclick = this.getAttribute("onclick") || "";
        const match = onclick.match(/ShowOrHide\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
        if (match) {
          this.setAttribute("data-rezka-spoiler-target", match[1]);
        }
        this.removeAttribute("onclick");
      });

      modal.off("click.rezkaSpoiler").on("click.rezkaSpoiler", '[data-rezka-spoiler-target]', function (event) {
        event.preventDefault();
        event.stopPropagation();

        const id = this.getAttribute("data-rezka-spoiler-target");
        if (!id) return;

        const target = document.getElementById(id);
        if (!target) {
          const localTarget = modal.find("#" + id)[0];
          if (localTarget) {
            localTarget.style.display = "inline";
            const previous = localTarget.previousElementSibling;
            if (previous && previous.classList.contains("title_spoiler")) {
              previous.remove();
            }
          }
          return;
        }

        target.style.display = "inline";

        const previous = target.previousElementSibling;
        if (previous && previous.classList.contains("title_spoiler")) {
          previous.remove();
        }
      });

      if (!document.getElementById("rezka-comment-style-v4")) {
        const styleEl = document.createElement("style");
        styleEl.id = "rezka-comment-style-v4";
        styleEl.textContent = `
          .rezka-comments-page{
            margin:-10px -10px 0;
            background:#151718;
            color:#fff;
            overflow:hidden;
          }

          .rezka-film-header{
            position:relative;
            height:210px;
            overflow:hidden;
            background:#202223;
          }

          .rezka-film-backdrop{
            position:absolute!important;
            inset:0!important;
            width:100%!important;
            max-width:none!important;
            height:100%!important;
            max-height:none!important;
            object-fit:cover!important;
            object-position:center!important;
            margin:0!important;
            border:0!important;
          }

          .rezka-film-overlay{
            position:absolute;
            inset:0;
            background:
              linear-gradient(to bottom, rgba(10,12,13,.05) 0%, rgba(10,12,13,.25) 38%, #151718 100%),
              linear-gradient(to right, rgba(0,0,0,.30), transparent 70%);
            pointer-events:none;
          }

          .rezka-film-info{
            position:absolute;
            left:20px;
            right:20px;
            bottom:18px;
            z-index:2;
          }

          .rezka-film-title{
            font-size:25px;
            line-height:1.15;
            font-weight:700;
            text-shadow:0 2px 8px rgba(0,0,0,.65);
          }

          .rezka-film-meta{
            margin-top:7px;
            font-size:14px;
            line-height:1.3;
            color:rgba(255,255,255,.76);
            text-shadow:0 1px 5px rgba(0,0,0,.7);
          }

          .rezka-comments-content{
            margin:0;
            padding:4px 12px 18px;
          }

          .rezka-comments-page .comments-tree-list{
            list-style:none!important;
            margin:0!important;
            padding:0!important;
          }

          /* Жёстко ограничиваем аватары, чтобы стили Lampa/Rezka
             не растягивали img на весь комментарий. */
          .rezka-comments-page .avatar-column{
            flex:0 0 48px!important;
            width:48px!important;
            min-width:48px!important;
            max-width:48px!important;
            margin-right:10px!important;
          }

          .rezka-comments-page .avatar-img{
            display:block!important;
            width:48px!important;
            height:48px!important;
            min-width:48px!important;
            max-width:48px!important;
            min-height:48px!important;
            max-height:48px!important;
            object-fit:cover!important;
            object-position:center!important;
            border-radius:6px!important;
            margin:0!important;
          }

          .rezka-comments-page .comment-wrap{
            display:flex!important;
            align-items:flex-start!important;
            width:100%!important;
            margin-bottom:5px!important;
          }

          .rezka-comments-page .comment-card{
            min-width:0!important;
            flex:1 1 auto!important;
            box-sizing:border-box!important;
          }

          .rezka-comments-page .comment-text img.avatar-img{
            width:48px!important;
            height:48px!important;
          }

          /* Нативный spoiler Rezka теперь раскрывается нашим обработчиком. */
          .rezka-comments-page .title_spoiler{
            display:inline-flex!important;
            cursor:pointer!important;
          }

          @media (max-width:600px){
            .rezka-film-header{
              height:190px;
            }

            .rezka-film-info{
              left:16px;
              right:16px;
              bottom:16px;
            }

            .rezka-film-title{
              font-size:23px;
            }

            .rezka-comments-content{
              padding-left:8px;
              padding-right:8px;
            }
          }
        `;
        document.head.appendChild(styleEl);
      }

      Lampa.Modal.open({
        title: ``,
        html: modal,
        size: "large",
        style: "margin-top:10px;",
        mask: true,
        onBack: function () {
          Lampa.Modal.close();
          $(".modal--large").remove();
          Lampa.Controller.toggle("content");
        },
      });

      document
        .querySelector(".modal__head")
        ?.insertAdjacentHTML(
          "afterend",
          `<button class="modal-close-btn selector" onclick="$('.modal--large').remove()">&times;</button>  ${namemovie}`,
        );
    }
  }

  // Функция для начала работы плагина
  function startPlugin() {
    window.rezka_comment_v2_plugin = true;

    try {
      // Регистрация настроек
      Lampa.SettingsApi.addComponent({
        component: 'rezka_comment_v2',
        name: 'Rezka Comments V2',
        icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
      });

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment_v2',
        param: {
          name: 'rezka_comment_v2_host',
          type: 'input',
          placeholder: 'https://hdrezka.ag',
          values: Lampa.Storage.get('rezka_comment_v2_host', 'https://hdrezka.ag'),
          default: 'https://hdrezka.ag'
        },
        field: {
          name: 'Зеркало hdrezka',
          description: 'Адрес зеркала hdrezka (например, https://hdrezka.me)'
        },
        onChange: function(value) {
          Lampa.Storage.set('rezka_comment_v2_host', value);
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment_v2',
        param: {
          name: 'rezka_comment_v2_cookie',
          type: 'input',
          placeholder: 'вставьте cookie',
          values: Lampa.Storage.get('rezka_comment_v2_cookie', ''),
          default: ''
        },
        field: {
          name: 'Cookie авторизации',
          description: 'Cookie из вашего браузера для обхода защиты (Anubis / PHPSESSID)'
        },
        onChange: function(value) {
          Lampa.Storage.set('rezka_comment_v2_cookie', value);
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment_v2',
        param: {
          name: 'rezka_comment_v2_proxy',
          type: 'input',
          placeholder: 'https://worker-patient-dream-26d8.bdvburik.workers.dev:8443/',
          values: Lampa.Storage.get('rezka_comment_v2_proxy', 'https://worker-patient-dream-26d8.bdvburik.workers.dev:8443/'),
          default: 'https://worker-patient-dream-26d8.bdvburik.workers.dev:8443/'
        },
        field: {
          name: 'CORS Прокси',
          description: 'Ваш Cloudflare Worker прокси (обязательно с / на конце)'
        },
        onChange: function(value) {
          Lampa.Storage.set('rezka_comment_v2_proxy', value);
        }
      });
    } catch (e) {
      console.error('[RezkaComment V2] Settings init error:', e);
    }

    Lampa.Listener.follow("full", function (e) {
      if (e.type == "complite") {
        $(".button--rezka-comment-v2").remove();
        $(".full-start-new__buttons").append(
          `<div class="full-start__button selector button--rezka-comment-v2"><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 356.484 356.484"><g><path d="M293.984 7.23H62.5C28.037 7.23 0 35.268 0 69.731v142.78c0 34.463 28.037 62.5 62.5 62.5l147.443.001 70.581 70.58a12.492 12.492 0 0 0 13.622 2.709 12.496 12.496 0 0 0 7.717-11.547v-62.237c30.759-3.885 54.621-30.211 54.621-62.006V69.731c0-34.463-28.037-62.501-62.5-62.501zm37.5 205.282c0 20.678-16.822 37.5-37.5 37.5h-4.621c-6.903 0-12.5 5.598-12.5 12.5v44.064l-52.903-52.903a12.493 12.493 0 0 0-8.839-3.661H62.5c-20.678 0-37.5-16.822-37.5-37.5V69.732c0-20.678 16.822-37.5 37.5-37.5h231.484c20.678 0 37.5 16.822 37.5 37.5v142.78z" fill="currentcolor"/></g></svg><span>${Lampa.Lang.translate(
            "title_comments",
          )}</span></div>`,
        );

        $(".button--rezka-comment-v2").on("hover:enter", function (card) {
          year = 0;
          if (e.data.movie.release_date) {
            year = e.data.movie.release_date.slice(0, 4);
          } else if (e.data.movie.first_air_date) {
            year = e.data.movie.first_air_date.slice(0, 4);
          }
          Lampa.Loading.start();

          const movie = e.data.movie || {};
          window.__rezkaCommentCurrentMovie = movie;
          year = 0;

          if (movie.release_date) {
            year = movie.release_date.slice(0, 4);
          } else if (movie.first_air_date) {
            year = movie.first_air_date.slice(0, 4);
          }

          console.log('[RezkaComment V2] RESOLVE:', movie.title || movie.name || '', year);
          resolveTitle(movie, e.object.method);
        });
      }
    });
  }

  if (!window.rezka_comment_v2_plugin) startPlugin();
})();
