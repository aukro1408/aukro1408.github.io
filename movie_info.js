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

            // Keep TMDB details available for the visual movie card.
            if (data && movie && typeof movie === 'object') {
              Object.assign(movie, data);
              window.__rezkaCommentCurrentMovie = movie;
            }
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
      const voteCount = movie.vote_count ? Number(movie.vote_count).toLocaleString("ru-RU") : "";

      const nativeRatings = window.__rezkaCommentRatings || {};
      const kpRating = nativeRatings.kp || "";
      const imdbRating = nativeRatings.imdb || "";

      // TMDB uses runtime for movies and episode_run_time for TV.
      const runtime = movie.runtime
        ? Math.round(Number(movie.runtime))
        : (Array.isArray(movie.episode_run_time) && movie.episode_run_time[0]
          ? Math.round(Number(movie.episode_run_time[0]))
          : 0);

      const budget = movie.budget ? Number(movie.budget) : 0;
      const revenue = movie.revenue ? Number(movie.revenue) : 0;
      const seasons = movie.number_of_seasons ? Number(movie.number_of_seasons) : 0;
      const episodes = movie.number_of_episodes ? Number(movie.number_of_episodes) : 0;
      const status = typeof movie.status === "string" ? movie.status : "";
      const mediaType = (movie.first_air_date || movie.number_of_seasons) ? "Сериал" : "Фильм";

      const genres = Array.isArray(movie.genres)
        ? movie.genres.map(g => g && g.name).filter(Boolean).slice(0, 3)
        : [];

      const meta = [
        yearMovie,
        genres.length ? genres.join(" • ") : ""
      ].filter(Boolean).join("  •  ");

      const formatMoney = value => {
        if (!value) return "";
        if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace(".0", "") + " млрд $";
        if (value >= 1000000) return Math.round(value / 1000000) + " млн $";
        if (value >= 1000) return Math.round(value / 1000) + " тыс. $";
        return value.toLocaleString("ru-RU") + " $";
      };

      const ratingInfo = [
        rating ? "★ " + rating : "",
        voteCount ? voteCount + " оценок" : ""
      ].filter(Boolean).join("  ");

      const detailChips = [
        rating ? `<span class="rezka-info-chip rezka-rating-chip"><b>★</b><strong>${rating}</strong><small>TMDB${voteCount ? " • " + voteCount : ""}</small></span>` : "",
        kpRating ? `<span class="rezka-info-chip rezka-rating-chip rezka-rating-kp"><b>★</b><strong>${kpRating}</strong><small>КиноПоиск</small></span>` : "",
        imdbRating ? `<span class="rezka-info-chip rezka-rating-chip rezka-rating-imdb"><b>★</b><strong>${imdbRating}</strong><small>IMDb</small></span>` : ""
      ].filter(Boolean).join("");

      const financeInfo = [
        budget ? "Бюджет " + formatMoney(budget) : "",
        revenue ? "Сборы " + formatMoney(revenue) : ""
      ].filter(Boolean).join("  •  ");

      const statusInfo = "";
      let modal = $(
        `<div class="rezka-comments-page" style="--rezka-backdrop:${poster ? `url("${poster.replace(/"/g, "%22")}")` : "none"};">
          <div class="rezka-film-header">
            ${poster ? `<img class="rezka-film-backdrop" src="${poster}" alt="">` : ""}
            <div class="rezka-film-overlay"></div>
            <div class="rezka-film-info">
              <div class="rezka-film-title">${title}</div>
              ${meta ? `<div class="rezka-film-meta">${meta}</div>` : ""}
              <div class="rezka-film-stats">${detailChips}</div>
              ${financeInfo || statusInfo ? `<div class="rezka-film-finance">${[financeInfo, statusInfo].filter(Boolean).join("  •  ")}</div>` : ""}
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
            position:relative;
            margin:-10px -10px 0;
            background:#151718;
            color:#fff;
            overflow:hidden;
            box-sizing:border-box;
          }

          .rezka-comments-page::before{
            content:"";
            position:absolute;
            inset:0;
            z-index:0;
            pointer-events:none;
            background-image:
              linear-gradient(
                to bottom,
                rgba(21,23,24,0) 0%,
                rgba(21,23,24,.28) 28%,
                rgba(21,23,24,.82) 58%,
                #151718 82%
              ),
              var(--rezka-backdrop);
            background-size:cover;
            background-position:center top;
            filter:blur(22px) saturate(1.25);
            transform:scale(1.08);
            opacity:.55;
          }

          .rezka-comments-page::after{
            content:"";
            position:absolute;
            inset:0;
            z-index:0;
            pointer-events:none;
            background:
              radial-gradient(ellipse at 50% 8%, rgba(255,255,255,.06), transparent 52%),
              linear-gradient(to bottom, rgba(0,0,0,.08), rgba(0,0,0,.24));
          }

          .rezka-comments-page > *{
            position:relative;
            z-index:1;
          }


          .rezka-film-header{
            position:relative;
            height:250px;
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
            font-size:29px;
            line-height:1.12;
            font-weight:800;
            letter-spacing:-.2px;
            text-shadow:0 2px 10px rgba(0,0,0,.75);
          }

          .rezka-film-meta{
            margin-top:8px;
            font-size:16px;
            line-height:1.3;
            font-weight:500;
            color:rgba(255,255,255,.86);
            text-shadow:0 1px 6px rgba(0,0,0,.75);
          }
          .rezka-film-stats{
            display:flex;
            flex-wrap:wrap;
            gap:8px;
            margin-top:12px;
            align-items:center;
          }
          .rezka-info-chip{
