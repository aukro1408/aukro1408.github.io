// RezkaComment FIXED v1
// English TMDB translation is optional.
(function () {
  //BDVBuriлk.github.io
  //2025
  ("use strict");

  let year;
  let namemovie;
  let savedHTML = null;

  function getSettings() {
    let host = (Lampa.Storage.get('rezka_comment_fixed_host', 'https://hdrezka.ag') || 'https://hdrezka.ag').trim().replace(/\/+$/, '');
    let cookie = (Lampa.Storage.get('rezka_comment_fixed_cookie', '') || '').trim();
    let proxy = (Lampa.Storage.get('rezka_comment_fixed_proxy', 'https://worker-patient-dream-26d8.bdvburik.workers.dev:8443/') || 'https://worker-patient-dream-26d8.bdvburik.workers.dev:8443/').trim();
    if (proxy && !proxy.endsWith('/')) {
      proxy += '/';
    }
    return { host, cookie, proxy };
  }

  // Поиск на HDRezka.
  // FIX: не берём первый результат вслепую; проверяем название и год.
  async function searchRezka(names, ye) {
    try {
      let { host, cookie, proxy } = getSettings();

      if (!Array.isArray(names)) names = [names];
      names = names.map((x) => normalizeTitle(String(x || ""))).filter(Boolean);
      names = [...new Set(names)];

      if (!names.length) {
        Lampa.Noty.show("Название фильма не найдено");
        Lampa.Loading.stop();
        return;
      }

      const queries = [];
      names.forEach((name) => {
        if (ye) queries.push(name + " " + ye);
        queries.push(name);
      });

      const uniqueQueries = [...new Set(queries)].slice(0, 8);
      let best = null;

      for (const query of uniqueQueries) {
        const path = host + "/search/?do=search&subaction=search&q=" + encodeURIComponent(query);

        let searchUrl = proxy;
        if (cookie) searchUrl += "param/Cookie=" + encodeURIComponent(cookie) + "/";
        searchUrl += path;

        console.log("[RezkaComment Fixed] search:", query);

        const fc = await fetch(searchUrl, {
          method: "GET",
          headers: { "Content-Type": "text/html" }
        }).then((response) => {
          if (!response.ok) throw new Error("HTTP status " + response.status);
          return response.text();
        });

        if (fc.indexOf("Проверяем, что вы не бот") !== -1 || fc.indexOf("Anubis") !== -1) {
          Lampa.Noty.show("Защита от ботов на Rezka. Проверьте Cookie в настройках плагина.");
          Lampa.Loading.stop();
          return;
        }

        const dom = new DOMParser().parseFromString(fc, "text/html");
        const items = Array.from(dom.querySelectorAll(".b-content__inline_item"));
        console.log("[RezkaComment Fixed] cards:", items.length, "query:", query);

        for (const item of items) {
          const link = item.querySelector(".b-content__inline_item-link");
          const titleText = (link?.innerText || "").trim();
          const href = link?.getAttribute("href") || "";
          const id = item.dataset.id || "";
          if (!id || !href) continue;

          const cardTitle = normalizeTitle(titleText);
          const queryTitle = normalizeTitle(query);
          const text = item.innerText || "";
          const yearMatch = text.match(/\b(19|20)\d{2}\b/);
          const cardYear = yearMatch ? Number(yearMatch[0]) : 0;

          let score = 0;
          if (names.some((n) => cardTitle === n)) score += 100;
          if (cardTitle === queryTitle) score += 80;

          const tokens = queryTitle.split(/\s+/).filter((x) => x.length > 1);
          if (tokens.length) {
            const hits = tokens.filter((token) => cardTitle.includes(token)).length;
            score += Math.round((hits / tokens.length) * 40);
          }

          if (ye && cardYear === Number(ye)) score += 50;
          if (ye && cardYear && cardYear !== Number(ye)) score -= 60;

          if (!best || score > best.score) {
            best = { score, id, href, title: titleText, year: cardYear, query };
          }
        }

        if (best && best.score >= 140 && (!ye || best.year === Number(ye))) break;
      }

      if (!best || best.score < 60) {
        console.warn("[RezkaComment Fixed] no confident match:", names, ye, best);
        Lampa.Noty.show("Фильм/сериал не найден на Rezka");
        Lampa.Loading.stop();
        return;
      }

      namemovie = best.title || names[0];
      console.log("[RezkaComment Fixed] MATCH:", best.title, "id:", best.id, "year:", best.year, "score:", best.score);
      await comment_rezka(best.id, best.href);
    } catch (e) {
      console.error("[RezkaComment Fixed] search error:", e);
      Lampa.Noty.show("Ошибка поиска на Rezka: " + (e.message || e));
      Lampa.Loading.stop();
    }
  }

  // Собираем варианты названия.
  // FIX: английский перевод TMDB НЕ является обязательным.
  async function getSearchNames(movie, type) {
    const result = [];

    function add(value) {
      if (typeof value !== "string") return;
      value = value.trim();
      if (!value) return;
      const n = normalizeTitle(value);
      if (!n) return;
      if (!result.some((x) => normalizeTitle(x) === n)) result.push(value);
    }

    add(movie?.original_title);
    add(movie?.original_name);
    add(movie?.title);

    const alternatives = movie?.alternative_titles?.results;
    if (Array.isArray(alternatives)) {
      alternatives.forEach((item) => {
        add(item?.title);
        add(item?.name);
      });
    }

    if (movie?.id && Lampa.Api?.sources?.tmdb?.get) {
      try {
        const tmdbType = type === "movie" ? "movie" : "tv";
        const cacheKey = tmdbType + "_" + movie.id;
        window.__tmdbTranslationsCache = window.__tmdbTranslationsCache || {};
        let translations = window.__tmdbTranslationsCache[cacheKey];

        if (!translations) {
          const data = await new Promise((resolve, reject) =>
            Lampa.Api.sources.tmdb.get(
              `${tmdbType}/${movie.id}?append_to_response=translations`,
              {},
              resolve,
              reject
            )
          );
          translations = data?.translations?.translations || [];
          window.__tmdbTranslationsCache[cacheKey] = translations;
        }

        translations
          .filter((t) => t.iso_3166_1 === "US" || t.iso_639_1 === "en")
          .forEach((t) => {
            add(t?.data?.title);
            add(t?.data?.name);
          });
      } catch (e) {
        console.warn("[RezkaComment Fixed] TMDB fallback failed:", e);
      }
    }

    return result;
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

      console.log('[RezkaComment Fixed] fetching comments from:', commentsUrl);

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
        console.warn('[RezkaComment Fixed] comments-tree-list not found in parsed HTML for', id);
        Lampa.Noty.show('Комментарии к фильму/сериалу отсутствуют');
        Lampa.Loading.stop();
        return;
      }

      let newTree = buildTree(rootList);
      openModal(newTree);
    } catch (e) {
      console.error('[RezkaComment Fixed] comment_rezka error:', e);
      Lampa.Noty.show('Ошибка получения комментариев: ' + e.message);
      Lampa.Loading.stop();
    }

    function openModal(treeContent) {
      Lampa.Loading.stop();
      let modal = $(
        `<div><div class="broadcast__text" style="text-align:left;"><div class="comment"></div></div></div>`,
      );
      modal.find(".comment").append(treeContent);

      // Стили модалки (если ещё не добавлены)
      if (!document.getElementById("rezka-comment-style-fixed-v1")) {
        const styleEl = document.createElement("style");
        styleEl.id = "rezka-comment-style-fixed-v1";
        styleEl.textContent = `
    .comments-tree-list{list-style:none;margin:0;padding:0;}
.comments-tree-item{list-style:none;margin:0;padding:0;}
.comment-wrap{display:flex;margin-bottom:5px;}
.avatar-column{margin-right:10px;}
.avatar-img{width:48px;height:48px;border-radius:4px;}
.comment-card{background:#1b1b1b;padding:5px 12px;border-radius:6px;border:1px solid #2a2a2a;width:100%;}
.comment-header{display:flex;justify-content:space-between;margin-bottom:6px;}
.comment-header .name{font-weight:600;color:#fff;}
.comment-header .date{opacity:.7;font-size:11px;}
.comment-text .text{color:#ddd;line-height:1.45;}
.rc-children{margin-left:30px;border-left:1px solid #333;padding-left:14px;}
.title_spoiler{display:inline-flex;align-items:center;background:#2a2a2a;border-radius:6px;padding:1px 4px;margin:0 2px;font-size:13px;color:#e0e0e0;cursor:pointer;box-shadow:0 0 2px rgba(0,0,0,.4);}
.title_spoiler a{color:#e0e0e0!important;text-decoration:none!important;}
.title_spoiler img{height:14px;width:auto;vertical-align:middle;margin:0 2px;}
.title_spoiler .attention{height:14px;width:14px;margin-left:4px;vertical-align:middle;}
.modal-close-btn{background:#2a2a2a;border:1px solid #444;color:#ddd;border-radius:6px;font-size:18px;line-height:18px;cursor:pointer;transition:.15s;}
.modal-close-btn:hover{background:#3a3a3a;color:#fff;}
                `;
        document.head.appendChild(styleEl);
      }
      if (!window.rezkaSpoilerInit) {
        window.rezkaSpoilerInit = true;
        const Script = document.createElement("script");
        Script.textContent =
          "function ShowOrHide(id){var t=$('#'+id);t.prev('.title_spoiler').remove();t.css('display','inline');}";
        document.head.appendChild(Script);
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
    window.comment_plugin_fixed_v1 = true;

    try {
      // Регистрация настроек
      Lampa.SettingsApi.addComponent({
        component: 'rezka_comment_fixed_v1',
        name: 'Rezka Comments FIXED',
        icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
      });

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment_fixed_v1',
        param: {
          name: 'rezka_comment_fixed_host',
          type: 'input',
          placeholder: 'https://hdrezka.ag',
          values: Lampa.Storage.get('rezka_comment_fixed_host', 'https://hdrezka.ag'),
          default: 'https://hdrezka.ag'
        },
        field: {
          name: 'Зеркало hdrezka',
          description: 'Адрес зеркала hdrezka (например, https://hdrezka.me)'
        },
        onChange: function(value) {
          Lampa.Storage.set('rezka_comment_fixed_host', value);
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment_fixed_v1',
        param: {
          name: 'rezka_comment_fixed_cookie',
          type: 'input',
          placeholder: 'вставьте cookie',
          values: Lampa.Storage.get('rezka_comment_fixed_cookie', ''),
          default: ''
        },
        field: {
          name: 'Cookie авторизации',
          description: 'Cookie из вашего браузера для обхода защиты (Anubis / PHPSESSID)'
        },
        onChange: function(value) {
          Lampa.Storage.set('rezka_comment_fixed_cookie', value);
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment_fixed_v1',
        param: {
          name: 'rezka_comment_fixed_proxy',
          type: 'input',
          placeholder: 'https://worker-patient-dream-26d8.bdvburik.workers.dev:8443/',
          values: Lampa.Storage.get('rezka_comment_fixed_proxy', 'https://worker-patient-dream-26d8.bdvburik.workers.dev:8443/'),
          default: 'https://worker-patient-dream-26d8.bdvburik.workers.dev:8443/'
        },
        field: {
          name: 'CORS Прокси',
          description: 'Ваш Cloudflare Worker прокси (обязательно с / на конце)'
        },
        onChange: function(value) {
          Lampa.Storage.set('rezka_comment_fixed_proxy', value);
        }
      });
    } catch (e) {
      console.error('[RezkaComment Fixed] Settings init error:', e);
    }

    Lampa.Listener.follow("full", function (e) {
      if (e.type == "complite") {
        $(".button--comment-fixed-v1").remove();
        $(".full-start-new__buttons").append(
          `<div class="full-start__button selector button--comment-fixed-v1"><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 356.484 356.484"><g><path d="M293.984 7.23H62.5C28.037 7.23 0 35.268 0 69.731v142.78c0 34.463 28.037 62.5 62.5 62.5l147.443.001 70.581 70.58a12.492 12.492 0 0 0 13.622 2.709 12.496 12.496 0 0 0 7.717-11.547v-62.237c30.759-3.885 54.621-30.211 54.621-62.006V69.731c0-34.463-28.037-62.501-62.5-62.501zm37.5 205.282c0 20.678-16.822 37.5-37.5 37.5h-4.621c-6.903 0-12.5 5.598-12.5 12.5v44.064l-52.903-52.903a12.493 12.493 0 0 0-8.839-3.661H62.5c-20.678 0-37.5-16.822-37.5-37.5V69.732c0-20.678 16.822-37.5 37.5-37.5h231.484c20.678 0 37.5 16.822 37.5 37.5v142.78z" fill="currentcolor"/></g></svg><span>${Lampa.Lang.translate(
            "title_comments",
          )}</span></div>`,
        );

        $(".button--comment-fixed-v1").on("hover:enter", function (card) {
          year = 0;
          if (e.data.movie.release_date) {
            year = e.data.movie.release_date.slice(0, 4);
          } else if (e.data.movie.first_air_date) {
            year = e.data.movie.first_air_date.slice(0, 4);
          }
          Lampa.Loading.start();

          getSearchNames(e.data.movie, e.object.method)
            .then(function (names) {
              const movie = e.data.movie || {};
              let movieYear = 0;

              if (movie.release_date) movieYear = movie.release_date.slice(0, 4);
              else if (movie.first_air_date) movieYear = movie.first_air_date.slice(0, 4);

              if (!names.length) {
                Lampa.Noty.show("Название фильма не найдено");
                Lampa.Loading.stop();
                return;
              }

              console.log("[RezkaComment Fixed] names:", names, "year:", movieYear);
              return searchRezka(names, movieYear);
            })
            .catch(function (err) {
              console.error("[RezkaComment Fixed] resolver error:", err);
              Lampa.Noty.show("Ошибка подготовки поиска Rezka");
              Lampa.Loading.stop();
            });
        });
      }
    });
  }

  if (!window.comment_plugin_fixed_v1) startPlugin();
})();
                  
