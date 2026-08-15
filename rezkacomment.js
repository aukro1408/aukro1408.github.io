(function () {
  "use strict";

  let year = "";
  let namemovie = "";

  // =========================================================
  // НАСТРОЙКИ
  // =========================================================

  // Если прокси работает на том же адресе, оставляем пустым:
  const SERVER_HOST = "";

  // Если прокси на другом сервере, например:
  // const SERVER_HOST = "http://192.168.1.100:3000";


  // =========================================================
  // ПОИСК ФИЛЬМА НА HDREZKA
  // =========================================================

  async function searchRezka(name, ye) {
    try {
      if (!name) {
        Lampa.Loading.stop();
        Lampa.Noty.show("Название фильма не получено");
        return;
      }

      // ВАЖНО:
      // Оставляем именно такой формат, как был
      // в твоём оригинальном коде.
      const query = name + (ye ? "+" + ye : "");

      const url =
        SERVER_HOST +
        "/rezka-comments/search?q=" +
        encodeURIComponent(query);

      console.log(
        "[Rezka Comments] Search:",
        name,
        ye
      );

      console.log(
        "[Rezka Comments] Search URL:",
        url
      );

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/html,application/xhtml+xml",
        },
      });

      console.log(
        "[Rezka Comments] Search status:",
        response.status
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "[Rezka Comments] Search HTTP error:",
          errorText
        );

        Lampa.Loading.stop();

        Lampa.Noty.show(
          "Ошибка HDRezka: HTTP " +
            response.status
        );

        return;
      }

      const fc = await response.text();

      console.log(
        "[Rezka Comments] Response length:",
        fc.length
      );

      console.log(
        "[Rezka Comments] Response preview:",
        fc.substring(0, 500)
      );


      // =====================================================
      // Иногда прокси может вернуть JSON с ошибкой
      // =====================================================

      const trimmed = fc.trim();

      if (
        trimmed.startsWith("{") ||
        trimmed.startsWith("[")
      ) {
        try {
          const json = JSON.parse(trimmed);

          console.error(
            "[Rezka Comments] JSON response:",
            json
          );

          if (json.error) {
            Lampa.Loading.stop();

            Lampa.Noty.show(
              "HDRezka: " + json.error
            );

            return;
          }
        } catch (e) {
          // Не JSON — продолжаем как HTML
        }
      }


      // =====================================================
      // Разбираем HTML
      // =====================================================

      const dom =
        new DOMParser().parseFromString(
          fc,
          "text/html"
        );

      const item =
        dom.querySelector(
          ".b-content__inline_item"
        );


      // =====================================================
      // Фильм не найден
      // =====================================================

      if (!item) {
        console.error(
          "[Rezka Comments] .b-content__inline_item not found"
        );

        console.error(
          "[Rezka Comments] Full response:",
          fc
        );

        Lampa.Loading.stop();

        Lampa.Noty.show(
          "Фильм не найден на HDRezka"
        );

        return;
      }


      // =====================================================
      // Получаем название
      // =====================================================

      const linkEl =
        item.querySelector(
          ".b-content__inline_item-link a"
        );

      namemovie =
        linkEl?.innerText ||
        linkEl?.textContent ||
        name ||
        "";


      // =====================================================
      // Получаем ID
      // =====================================================

      const id =
        item.dataset.id ||
        item.getAttribute("data-id") ||
        "";


      // =====================================================
      // Получаем URL
      // =====================================================

      const pageUrl =
        item.dataset.url ||
        item.getAttribute("data-url") ||
        "";


      console.log(
        "[Rezka Comments] Found:",
        {
          name: namemovie,
          id: id,
          pageUrl: pageUrl,
        }
      );


      if (!id) {
        Lampa.Loading.stop();

        Lampa.Noty.show(
          "HDRezka: не удалось получить ID фильма"
        );

        return;
      }


      // =====================================================
      // Загружаем комментарии
      // =====================================================

      await comment_rezka(
        id,
        pageUrl
      );

    } catch (e) {
      console.error(
        "[Rezka Comments] Search exception:",
        e
      );

      Lampa.Loading.stop();

      Lampa.Noty.show(
        "Ошибка поиска фильма на HDRezka"
      );
    }
  }


  // =========================================================
  // ПОЛУЧЕНИЕ НАЗВАНИЯ ИЗ TMDB
  // =========================================================

  async function getEnTitle(
    id,
    type,
    originalData
  ) {
    try {
      const mediaType =
        type === "tv"
          ? "tv"
          : "movie";


      console.log(
        "[Rezka Comments] TMDB request:",
        mediaType,
        id
      );


      // =====================================================
      // Первый запрос:
      // сразу просим английскую локализацию
      // =====================================================

      const data =
        await new Promise(
          (resolve, reject) => {
            Lampa.Api.sources.tmdb.get(
              `${mediaType}/${id}`,
              {
                language: "en-US",
              },
              resolve,
              reject
            );
          }
        );


      console.log(
        "[Rezka Comments] TMDB response:",
        data
      );


      let enTitle = "";


      // =====================================================
      // ФИЛЬМ
      // =====================================================

      if (mediaType === "movie") {
        enTitle =
          data?.title ||
          data?.original_title ||
          "";
      }


      // =====================================================
      // СЕРИАЛ
      // =====================================================

      else {
        enTitle =
          data?.name ||
          data?.original_name ||
          "";
      }


      // =====================================================
      // Если английское название не получили,
      // пробуем translations
      // =====================================================

      if (!enTitle) {
        console.log(
          "[Rezka Comments] Trying translations..."
        );


        try {
          const translationsData =
            await new Promise(
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
            translationsData
              ?.translations
              ?.translations ||
            [];


          // Сначала en-US
          let translation =
            translations.find(
              (item) =>
                item.iso_3166_1 === "US" &&
                item.iso_639_1 === "en"
            );


          // Потом любой английский
          if (!translation) {
            translation =
              translations.find(
                (item) =>
                  item.iso_639_1 === "en"
              );
          }


          if (translation?.data) {
            enTitle =
              translation.data.title ||
              translation.data.name ||
              "";
          }


          // Дополнительный fallback
          if (!enTitle) {
            enTitle =
              translationsData?.title ||
              translationsData?.name ||
              translationsData?.original_title ||
              translationsData?.original_name ||
              "";
          }

        } catch (translationError) {
          console.error(
            "[Rezka Comments] Translation error:",
            translationError
          );
        }
      }


      // =====================================================
      // Последний fallback:
      // данные из самой Lampa
      // =====================================================

      if (!enTitle && originalData) {
        enTitle =
          originalData.title ||
          originalData.name ||
          originalData.original_title ||
          originalData.original_name ||
          "";
      }


      // =====================================================
      // Название так и не найдено
      // =====================================================

      if (!enTitle) {
        Lampa.Loading.stop();

        Lampa.Noty.show(
          "Не удалось получить название фильма"
        );

        console.error(
          "[Rezka Comments] Title not found:",
          {
            id: id,
            type: mediaType,
            data: data,
            originalData: originalData,
          }
        );

        return;
      }


      console.log(
        "[Rezka Comments] English title:",
        enTitle
      );


      // =====================================================
      // Нормализуем
      // =====================================================

      const normalizedTitle =
        normalizeTitle(enTitle);


      if (!normalizedTitle) {
        Lampa.Loading.stop();

        Lampa.Noty.show(
          "Не удалось обработать название фильма"
        );

        return;
      }


      console.log(
        "[Rezka Comments] Normalized title:",
        normalizedTitle
      );


      // =====================================================
      // Ищем на HDRezka
      // =====================================================

      await searchRezka(
        normalizedTitle,
        year
      );

    } catch (e) {
      console.error(
        "[Rezka Comments] TMDB exception:",
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
    if (!str) {
      return "";
    }

    return String(str)
      .replace(
        /[\s.,:;’'`!?]+/g,
        " "
      )
      .trim();
  }


  // =========================================================
  // НОРМАЛИЗАЦИЯ НАЗВАНИЯ
  // =========================================================

  function normalizeTitle(str) {
    if (!str) {
      return "";
    }

    return cleanTitle(
      String(str)
        .toLowerCase()
        .replace(
          /[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g,
          "-"
        )
        .replace(
          /ё/g,
          "е"
        )
    );
  }


  // =========================================================
  // ESCAPE HTML
  // =========================================================

  function escapeHtml(value) {
    return String(value || "")
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }


  // =========================================================
  // СОЗДАНИЕ КОММЕНТАРИЯ
  // =========================================================

  function buildCommentNode(item) {
    const q = (selector) =>
      item.querySelector(selector);


    const avatar =
      q(".ava img")?.dataset.src ||
      q(".ava img")?.src ||
      "";


    const user =
      q(".name, .b-comment__user")
        ?.innerText ||
      "Без имени";


    const date =
      q(".date, .b-comment__time")
        ?.innerText ||
      "";


    const text =
      q(".message .text, .text")
        ?.innerHTML ||
      "";


    const wrapper =
      document.createElement(
        "div"
      );


    wrapper.className =
      "message";


    wrapper.innerHTML = `
      <div class="comment-wrap">

        <div class="avatar-column">
          ${
            avatar
              ? `
                <img
                  class="avatar-img"
                  src="${avatar}"
                  alt="${escapeHtml(user)}"
                >
              `
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
  // ПОСТРОЕНИЕ ДЕРЕВА КОММЕНТАРИЕВ
  // =========================================================

  function buildTree(root) {
    const fragment =
      document.createDocumentFragment();


    for (
      const li of root.children
    ) {
      const indent =
        parseInt(
          li.dataset.indent || 0,
          10
        );


      const wrapper =
        document.createElement(
          "li"
        );


      wrapper.className =
        "comments-tree-item";


      wrapper.style.marginLeft =
        indent > 0
          ? "20px"
          : "0";


      wrapper.appendChild(
        buildCommentNode(li)
      );


      const childrenList =
        li.querySelector(
          "ol.comments-tree-list"
        );


      if (childrenList) {
        wrapper.appendChild(
          buildTree(
            childrenList
          )
        );
      }


      fragment.appendChild(
        wrapper
      );
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
        "[Rezka Comments] Comments URL:",
        url
      );


      const resp =
        await fetch(
          url,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
          }
        );


      console.log(
        "[Rezka Comments] Comments HTTP:",
        resp.status
      );


      const fc =
        await resp
          .json()
          .catch(() => null);


      if (
        !resp.ok ||
        !fc ||
        fc.error
      ) {
        console.error(
          "[Rezka Comments] Comments server error:",
          fc
        );

        Lampa.Loading.stop();

        Lampa.Noty.show(
          "Сайт временно заблокировал запрос. Попробуйте ещё раз через минуту."
        );

        return;
      }


      if (!fc.comments) {
        console.error(
          "[Rezka Comments] No comments HTML"
        );

        Lampa.Loading.stop();

        Lampa.Noty.show(
          "Сервер не вернул комментарии"
        );

        return;
      }


      const dom =
        new DOMParser()
          .parseFromString(
            fc.comments,
            "text/html"
          );


      // Удаляем ненужные элементы
      dom
        .querySelectorAll(
          ".actions, i, .share-link"
        )
        .forEach(
          (elem) =>
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
        buildTree(
          rootList
        );


      openModal(
        newTree
      );


    } catch (e) {
      console.error(
        "[Rezka Comments] Comments exception:",
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

    function openModal(
      treeContent
    ) {
      Lampa.Loading.stop();


      const modal = $(
        `
        <div class="comment">

          <ol class="comments-tree-list"></ol>

        </div>
        `
      );


      modal
        .find(
          ".comments-tree-list"
        )
        .append(
          treeContent
        );


      // =====================================================
      // CSS
      // =====================================================

      if (
        !document.getElementById(
          "rezka-comment-style"
        )
      ) {
        const styleEl =
          document.createElement(
            "style"
          );


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
            padding: 2px 8px;
            z-index: 10;
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


      // =====================================================
      // SPOILERS
      // =====================================================

      if (
        !window.rezkaSpoilerInit
      ) {
        window.rezkaSpoilerInit =
          true;


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


      // =====================================================
      // ОТКРЫВАЕМ MODAL
      // =====================================================

      Lampa.Modal.open({
        title: "",
        html: modal,
        size: "large",
        style: "margin-top:10px;",
        mask: true,

        onBack: function () {
          Lampa.Modal.close();

          $(".modal--large")
            .remove();

          Lampa.Controller.toggle(
            "content"
          );
        },
      });


      // =====================================================
      // ЗАГОЛОВОК
      // =====================================================

      setTimeout(
        function () {
          const modalHead =
            document.querySelector(
              ".modal__head"
            );


          if (!modalHead) {
            return;
          }


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
        },
        50
      );
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

        if (
          e.type !== "complite"
        ) {
          return;
        }


        // ===================================================
        // Удаляем старую кнопку
        // ===================================================

        $(".button--comment")
          .remove();


        // ===================================================
        // Добавляем кнопку
        // ===================================================

        $(".full-start-new__buttons")
          .append(
            `
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
            `
          );


        // ===================================================
        // КНОПКА КОММЕНТАРИЕВ
        // ===================================================

        $(".button--comment").on(
          "hover:enter",
          function () {

            // ===============================================
            // Получаем год
            // ===============================================

            year = "";


            if (
              e.data.movie.release_date
            ) {
              year =
                e.data.movie.release_date
                  .slice(0, 4);

            } else if (
              e.data.movie.first_air_date
            ) {
              year =
                e.data.movie.first_air_date
                  .slice(0, 4);
            }


            // ===============================================
            // Определяем тип
            // ===============================================

            let type = "movie";


            if (
              e.data.movie.first_air_date ||
              e.data.movie.name ||
              e.data.movie.original_name
            ) {
              type = "tv";
            }


            console.log(
              "[Rezka Comments] Opening:",
              {
                id:
                  e.data.movie.id,

                type:
                  type,

                year:
                  year,

                title:
                  e.data.movie.title ||
                  e.data.movie.name,

                original_title:
                  e.data.movie.original_title ||
                  e.data.movie.original_name,
              }
            );


            // ===============================================
            // Запускаем загрузку
            // ===============================================

            Lampa.Loading.start();


            // ===============================================
            // Получаем английское название
            // ===============================================

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

  if (
    !window.comment_plugin
  ) {
    startPlugin();
  }

})();
