(function () {
  "use strict";

  let year = "";
  let namemovie = "";

  // Если прокси находится на другом сервере —
  // укажи здесь его адрес, например:
  // const SERVER_HOST = "http://192.168.1.100:3000";
  const SERVER_HOST = "";

  // =========================================================
  // ПОИСК ФИЛЬМА / СЕРИАЛА НА HDREZKA
  // =========================================================

  async function searchRezka(name, ye) {
    try {
      const query = name + (ye ? " " + ye : "");

      const response = await fetch(
        SERVER_HOST +
          "/rezka-comments/search?q=" +
          encodeURIComponent(query),
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const fc = await response.text();

      const dom = new DOMParser().parseFromString(fc, "text/html");

      const item = dom.querySelector(".b-content__inline_item");

      if (!item) {
        Lampa.Loading.stop();
        Lampa.Noty.show("Комментарии не найдены");
        return;
      }

      const linkEl = item.querySelector(
        ".b-content__inline_item-link a"
      );

      namemovie =
        linkEl?.innerText ||
        linkEl?.textContent ||
        name ||
        "";

      const id = item.dataset.id || "";
      const pageUrl = item.dataset.url || "";

      if (!id) {
        Lampa.Loading.stop();
        Lampa.Noty.show("Не удалось получить страницу фильма");
        return;
      }

      comment_rezka(id, pageUrl);
    } catch (e) {
      console.error("Rezka search error:", e);

      Lampa.Loading.stop();
      Lampa.Noty.show("Ошибка поиска фильма на HDRezka");
    }
  }

  // =========================================================
  // ПОЛУЧЕНИЕ АНГЛИЙСКОГО НАЗВАНИЯ ИЗ TMDB
  // =========================================================

  async function getEnTitle(id, type, originalData) {
    try {
      const mediaType = type === "tv" ? "tv" : "movie";

      console.log(
        "[Rezka Comments] TMDB:",
        mediaType,
        id
      );

      // -----------------------------------------------------
      // Сначала пытаемся получить данные сразу на английском
      // -----------------------------------------------------

      const data = await new Promise((resolve, reject) => {
        Lampa.Api.sources.tmdb.get(
          `${mediaType}/${id}`,
          {
            language: "en-US",
          },
          resolve,
          reject
        );
      });

      console.log(
        "[Rezka Comments] TMDB EN response:",
        data
      );

      let enTitle = "";

      if (mediaType === "movie") {
        enTitle =
          data?.title ||
          data?.original_title ||
          "";
      } else {
        enTitle =
          data?.name ||
          data?.original_name ||
          "";
      }

      // -----------------------------------------------------
      // Если прямой английский запрос ничего не дал,
      // пробуем translations
      // -----------------------------------------------------

      if (!enTitle) {
        console.log(
          "[Rezka Comments] English title not found, trying translations..."
        );

        const translationsData = await new Promise(
          (resolve, reject) => {
            Lampa.Api.sources.tmdb.get(
              `${mediaType}/${id}?append_to_response=translations`,
              {},
              resolve,
              reject
            );
          }
        );

        const translations =
          translationsData?.translations?.translations || [];

        // Сначала ищем en-US
        let translation = translations.find(
          (item) =>
            item.iso_3166_1 === "US" &&
            item.iso_639_1 === "en"
        );

        // Потом любой английский
        if (!translation) {
          translation = translations.find(
            (item) => item.iso_639_1 === "en"
          );
        }

        if (translation?.data) {
          enTitle =
            translation.data.title ||
            translation.data.name ||
            "";
        }

        // Последний fallback — оригинальное название
        if (!enTitle) {
          enTitle =
            translationsData?.title ||
            translationsData?.name ||
            translationsData?.original_title ||
            translationsData?.original_name ||
            "";
        }
      }

      // -----------------------------------------------------
      // Если TMDB всё равно ничего не вернул
      // -----------------------------------------------------

      if (!enTitle) {
        // Попробуем использовать данные, которые уже есть
        // на странице Lampa
        if (originalData) {
          enTitle =
            originalData.title ||
            originalData.name ||
            originalData.original_title ||
            originalData.original_name ||
            "";
        }
      }

      if (!enTitle) {
        Lampa.Loading.stop();

        Lampa.Noty.show(
          "Не удалось получить название фильма"
        );

        console.error(
          "[Rezka Comments] English title not found",
          {
            id,
            type,
            data,
          }
        );

        return;
      }

      console.log(
        "[Rezka Comments] English title:",
        enTitle
      );

      // -----------------------------------------------------
      // Нормализуем название и ищем его на Rezka
      // -----------------------------------------------------

      const normalized = normalizeTitle(enTitle);

      if (!normalized) {
        Lampa.Loading.stop();
        Lampa.Noty.show(
          "Название фильма оказалось пустым"
        );
        return;
      }

      searchRezka(normalized, year);
    } catch (e) {
      console.error(
        "[Rezka Comments] TMDB error:",
        e
      );

      Lampa.Loading.stop();

      Lampa.Noty.show(
        "Ошибка получения названия из TMDB"
      );
    }
  }

  // =========================================================
  // ОЧИСТКА НАЗВАНИЯ
  // =========================================================

  function cleanTitle(str) {
    if (!str) return "";

    return String(str)
      .replace(/[\s.,:;’'`!?]+/g, " ")
      .trim();
  }

  // =========================================================
  // НОРМАЛИЗАЦИЯ НАЗВАНИЯ
  // =========================================================

  function normalizeTitle(str) {
    if (!str) return "";

    return cleanTitle(
      String(str)
        .toLowerCase()
        .replace(
          /[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g,
          "-"
        )
        .replace(/ё/g, "е")
    );
  }

  // =========================================================
  // СОЗДАНИЕ ОДНОГО КОММЕНТАРИЯ
  // =========================================================

  function buildCommentNode(item) {
    const q = (selector) =>
      item.querySelector(selector);

    const avatar =
      q(".ava img")?.dataset.src ||
      q(".ava img")?.src ||
      "";

    const user =
      q(".name, .b-comment__user")?.innerText ||
      "Без имени";

    const date =
      q(".date, .b-comment__time")?.innerText ||
      "";

    const text =
      q(".message .text, .text")?.innerHTML ||
      "";

    const wrapper =
      document.createElement("div");

    wrapper.className = "message";

    wrapper.innerHTML = `
      <div class="comment-wrap">

        <div class="avatar-column">
          ${
            avatar
              ? `<img
                  class="avatar-img"
                  src="${avatar}"
                  alt="${escapeHtml(user)}"
                >`
              : ""
          }
        </div>

        <div class="comment-card">

          <div class="comment-header">

            <span class="name">
              ${escapeHtml(user)}
            </span>

            <span class="date">
              ${escapeHtml(date)}
            </span>

          </div>

          <div class="comment-text">
            <div class="text">
              ${text}
            </div>
          </div>

        </div>

      </div>
    `;

    return wrapper;
  }

  // =========================================================
  // ПРОСТОЙ HTML ESCAPE
  // =========================================================

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================================================
  // ПОСТРОЕНИЕ ДЕРЕВА КОММЕНТАРИЕВ
  // =========================================================

  function buildTree(root) {
    const fragment =
      document.createDocumentFragment();

    for (const li of root.children) {
      const indent = parseInt(
        li.dataset.indent || 0,
        10
      );

      const wrapper =
        document.createElement("li");

      wrapper.className =
        "comments-tree-item";

      wrapper.style.marginLeft =
        indent > 0 ? "20px" : "0";

      wrapper.appendChild(
        buildCommentNode(li)
      );

      const childrenList =
        li.querySelector(
          "ol.comments-tree-list"
        );

      if (childrenList) {
        wrapper.appendChild(
          buildTree(childrenList)
        );
      }

      fragment.appendChild(wrapper);
    }

    return fragment;
  }

  // =========================================================
  // ЗАГРУЗКА КОММЕНТАРИЕВ
  // =========================================================

  async function comment_rezka(
    id,
    pageUrl
  ) {
    try {
      let url =
        SERVER_HOST +
        "/rezka-comments/comments?id=" +
        encodeURIComponent(id);

      if (pageUrl) {
        url +=
          "&page_url=" +
          encodeURIComponent(pageUrl);
      }

      console.log(
        "[Rezka Comments] Loading:",
        url
      );

      const resp = await fetch(url, {
        method: "GET",
      });

      const fc =
        await resp.json().catch(() => null);

      if (
        !resp.ok ||
        !fc ||
        fc.error
      ) {
        Lampa.Loading.stop();

        Lampa.Noty.show(
          "Сайт временно заблокировал запрос. Попробуйте ещё раз через минуту."
        );

        console.error(
          "[Rezka Comments] Server error:",
          fc
        );

        return;
      }

      const dom =
        new DOMParser().parseFromString(
          fc.comments,
          "text/html"
        );

      // Удаляем ненужные элементы
      dom
        .querySelectorAll(
          ".actions, i, .share-link"
        )
        .forEach((elem) =>
          elem.remove()
        );

      const rootList =
        dom.querySelector(
          ".comments-tree-list"
        );

      if (!rootList) {
        Lampa.Loading.stop();

        Lampa.Noty.show(
          "Комментариев пока нет"
        );

        return;
      }

      const newTree =
        buildTree(rootList);

      openModal(newTree);
    } catch (e) {
      console.error(
        "[Rezka Comments] Comments error:",
        e
      );

      Lampa.Loading.stop();

      Lampa.Noty.show(
        "Ошибка загрузки комментариев"
      );
    }

    // =======================================================
    // МОДАЛЬНОЕ ОКНО
    // =======================================================

    function openModal(treeContent) {
      Lampa.Loading.stop();

      const modal = $(
        `<div class="comment">
          <ol class="comments-tree-list"></ol>
        </div>`
      );

      modal
        .find(".comments-tree-list")
        .append(treeContent);

      // -----------------------------------------------------
      // CSS
      // -----------------------------------------------------

      if (
        !document.getElementById(
          "rezka-comment-style"
        )
      ) {
        const styleEl =
          document.createElement("style");

        styleEl.id =
          "rezka-comment-style";

        styleEl.textContent = `
          .comments-tree-list {
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .comments-tree-item {
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .comment-wrap {
            display: flex;
            margin-bottom: 5px;
          }

          .avatar-column {
            margin-right: 10px;
            flex-shrink: 0;
          }

          .avatar-img {
            width: 48px;
            height: 48px;
            border-radius: 4px;
            object-fit: cover;
          }

          .comment-card {
            background: #1b1b1b;
            padding: 5px 12px;
            border-radius: 6px;
            border: 1px solid #2a2a2a;
            width: 100%;
          }

          .comment-header {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 6px;
          }

          .comment-header .name {
            font-weight: 600;
            color: #fff;
          }

          .comment-header .date {
            opacity: .7;
            font-size: 11px;
            white-space: nowrap;
          }

          .comment-text .text {
            color: #ddd;
            line-height: 1.45;
          }

          .rc-children {
            margin-left: 30px;
            border-left: 1px solid #333;
            padding-left: 14px;
          }

          .title_spoiler {
            display: inline-flex;
            align-items: center;
            background: #2a2a2a;
            border-radius: 6px;
            padding: 1px 4px;
            margin: 0 2px;
            font-size: 13px;
            color: #e0e0e0;
            cursor: pointer;
            box-shadow: 0 0 2px rgba(0,0,0,.4);
          }

          .title_spoiler a {
            color: #e0e0e0 !important;
            text-decoration: none !important;
          }

          .title_spoiler img {
            height: 14px;
            width: auto;
            vertical-align: middle;
            margin: 0 2px;
          }

          .title_spoiler .attention {
            height: 14px;
            width: 14px;
            margin-left: 4px;
            vertical-align: middle;
          }

          .modal-close-btn {
            background: #2a2a2a;
            border: 1px solid #444;
            color: #ddd;
            border-radius: 6px;
            font-size: 18px;
            line-height: 18px;
            cursor: pointer;
            transition: .15s;
          }

          .modal-close-btn:hover {
            background: #3a3a3a;
            color: #fff;
          }
        `;

        document.head.appendChild(
          styleEl
        );
      }

      // -----------------------------------------------------
      // Rezka spoiler support
      // -----------------------------------------------------

      if (!window.rezkaSpoilerInit) {
        window.rezkaSpoilerInit = true;

        const Script =
          document.createElement(
            "script"
          );

        Script.textContent = `
          function ShowOrHide(id) {
            var t = $('#' + id);
            t.prev('.title_spoiler').remove();
            t.css('display', 'inline');
          }
        `;

        document.head.appendChild(
          Script
        );
      }

      // -----------------------------------------------------
      // Открываем модалку
      // -----------------------------------------------------

      Lampa.Modal.open({
        title: "",
        html: modal,
        size: "large",
        style: "margin-top:10px;",
        mask: true,

        onBack: function () {
          Lampa.Modal.close();

          $(".modal--large").remove();

          Lampa.Controller.toggle(
            "content"
          );
        },
      });

      // -----------------------------------------------------
      // Заголовок + кнопка закрытия
      // -----------------------------------------------------

      const modalHead =
        document.querySelector(
          ".modal__head"
        );

      if (modalHead) {
        modalHead.insertAdjacentHTML(
          "afterend",
          `
            <div
              class="modal-close-btn"
              onclick="
                Lampa.Modal.close();
                $('.modal--large').remove();
                Lampa.Controller.toggle('content');
              "
            >
              ×
            </div>

            <span>
              ${escapeHtml(namemovie)}
            </span>
          `
        );
      }
    }
  }

  // =========================================================
  // ЗАПУСК ПЛАГИНА
  // =========================================================

  function startPlugin() {
    window.comment_plugin = true;

    Lampa.Listener.follow(
      "full",
      function (e) {
        if (e.type !== "complite") {
          return;
        }

        // Удаляем старую кнопку, если она уже есть
        $(".button--comment").remove();

        // ---------------------------------------------------
        // Добавляем кнопку комментариев
        // ---------------------------------------------------

        $(".full-start-new__buttons").append(`
          <div class="full-start__button selector button--comment">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="512"
              height="512"
              viewBox="0 0 356.484 356.484"
            >
              <g>
                <path
                  d="M293.984 7.23H62.5C28.037 7.23 0 35.268 0 69.731v142.78c0 34.463 28.037 62.5 62.5 62.5l147.443.001 70.581 70.58a12.492 12.492 0 0 0 13.622 2.709 12.496 12.496 0 0 0 7.717-11.547v-62.237c30.759-3.885 54.621-30.211 54.621-62.006V69.731c0-34.463-28.037-62.501-62.5-62.501zm37.5 205.282c0 20.678-16.822 37.5-37.5 37.5h-4.621c-6.903 0-12.5 5.598-12.5 12.5v44.064l-52.903-52.903a12.493 12.493 0 0 0-8.839-3.661H62.5c-20.678 0-37.5-16.822-37.5-37.5V69.732c0-20.678 16.822-37.5 37.5-37.5h231.484c20.678 0 37.5 16.822 37.5 37.5v142.78z"
                  fill="currentcolor"
                />
              </g>
            </svg>

            <span>
              ${Lampa.Lang.translate(
                "title_comments"
              )}
            </span>

          </div>
        `);

        // ---------------------------------------------------
        // Нажатие кнопки
        // ---------------------------------------------------

        $(".button--comment").on(
          "hover:enter",
          function () {
            // Получаем год
            year = "";

            if (
              e.data.movie.release_date
            ) {
              year =
                e.data.movie.release_date.slice(
                  0,
                  4
                );
            } else if (
              e.data.movie.first_air_date
            ) {
              year =
                e.data.movie.first_air_date.slice(
                  0,
                  4
                );
            }

            // -----------------------------------------------
            // Определяем тип контента
            // -----------------------------------------------

            let type = "movie";

            if (
              e.data.movie.first_air_date ||
              e.data.movie.name ||
              e.data.movie.original_name
            ) {
              type = "tv";
            }

            console.log(
              "[Rezka Comments] Open:",
              {
                id: e.data.movie.id,
                type: type,
                year: year,
              }
            );

            Lampa.Loading.start();

            // -----------------------------------------------
            // Получаем английское название
            // -----------------------------------------------

            getEnTitle(
              e.data.movie.id,
              type,
              e.data.movie
            );
          }
        );
      }
    );
  }

  // =========================================================
  // START
  // =========================================================

  if (!window.comment_plugin) {
    startPlugin();
  }
})();
