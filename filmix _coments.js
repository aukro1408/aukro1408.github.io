(function () {
    "use strict";

    /*
     * ============================================================
     * LAMPA — COMMENTS UI V6
     * ------------------------------------------------------------
     * Только UI-прототип.
     * Никаких API, fetch, прокси, ключей и внешних запросов.
     * ============================================================
     */

    const PLUGIN_FLAG = "filmix_comments_ui_v6";
    const BUTTON_CLASS = "button--filmix-comments-v6";
    const STYLE_ID = "filmix-comments-ui-v6-style";

    // ------------------------------------------------------------
    // Тестовые комментарии.
    // В дальнейшем этот массив можно будет заменить реальными
    // данными Filmix, не меняя сам интерфейс.
    // ------------------------------------------------------------

    const COMMENTS = [
        "Сериал отличный, могу рекомендовать. Но есть одно огромное но. Его надо смотреть на перемотке. Половина каждой серии — пустая бессмысленная болтовня, чтобы растянуть время. Если тупые диалоги скипать, то вполне сериал зайдет.",
        "Я убью тебя лодочник. Это к продюсерам...)",
        "Интересный сериал жду 5 сезон.",
        "Суть современных сериалов, они делаются не для зрителей. А для стриминговых площадок. Цель тянуть как можно дальше для рекламных пауз. Что там в сериале, последовательность событий, логика никого уже не волнует. Цель удержать зрителя тайной, и пофиг на качество. Ушло то хорошее кино.",
        "Теперь целый год будем ждать как камни из сумки упадут на дно, дно, оставленное нам создателями сего творения...",
        "Закончил смотреть на 2 сезоне, потому что слишком затянуто. Что там, стало что-то понятно?",
        "Начитавшись много говоря плохих отзывов чуть было не сделал ошибку и не забросил его. Но к моему большому удивлению при просмотре даже и близко не хотелось. Более того, сезон вышел достаточно комплексным и последовательным продолжением предыдущих. Ничего не понравилось смотреть трейлеры сезона, хотя ожидалось назад, понимал, что отталкивает. Прозрачность сюжета мне нравится и не обидели. Единственная вещь, которую для себя тогда предположил, что атмосфернее сериалы нужно смотреть с хорошим погружением. Иначе теряется настроение и весь интерес. Таким образом четвертый сезон начался на самом моем такого рода, как он полностью. И заломило первый в целом. В общем очень понравилось. Естественно не было таких же эмоций, как от первого сезона. Но снова же, на тот момент сериал был совсем не знакомым и ожидает от него такой же загадочности как сейчас, так и в будущем, наверное все-таки не стоит. Это как знакомый с одной и той же девушкой несколько раз — но всё будет полностью и новым.",
        "Я первый на постере такое же лицо как у меня после просмотра 4 сезона. О чем он был когда он был и зачем. Я все еще в полном ахуи, что это смотрю. Кажется примитивная тема где-то работает, но мы все помним чем такие длинные сериалы заканчиваются. Писанина сценария видимо происходит не сразу — а месте съемок. Последняя серия вообще высер. Разочарование ведь была атмосфера, загадка. А теперь что?",
        "Так и есть. Сейчас все сериалы и сезоны пишутся быстро на коленке. Даже концовка может быть не придумана. Типо серии вариант сценаристы на ходу.",
        "4 сезон самый интересный! И закончился интригующе! Так что жду финальный сезон и надеюсь что не споганят конец.",
        "Сезон ни о чем. Что он был, что его не было...",
        "Ну так же закрутили, шо не знают как выкрутитись! Якщо далі так піде, то треба ще 4 сезони знімати.",
        "Четвертым сезоном можно было и закончить. Тем более, что закончился он так, будто пол серии до финала не хватает.",
        "Согласен! Эта интрига уже надоела! Думаю что сценаристы тоже не знают, что происходит! Показали что купол разбился и все попали домой и это был страшный сон Бойда, который был под кислотой.",
        "Всё, хватит. Объявляйте о закрытии. Имейте сострадание, заберите кактус.",
        "Поддерживаю!",
        "В прошлых сезонах они хоть в последние 10 секунд последней серии сезона делали интригу, а в 4 сезоне даже на это забили.)",
        "Что-то попна, затянули дали никуда, типа 3-4 сезон одне бла бла бла."
    ];

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getMovieTitle(movie) {
        if (!movie) return "Комментарии";

        return (
            movie.title ||
            movie.name ||
            movie.original_title ||
            movie.original_name ||
            "Комментарии"
        ).trim();
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            .fcv6-container {
                --fcv6-accent: #4f8cff;
                --fcv6-accent-soft: rgba(79, 140, 255, .14);
                --fcv6-bg: #131316;
                --fcv6-card: linear-gradient(165deg, #252529, #1a1a1d);
                --fcv6-card-hover: linear-gradient(165deg, #2b2b30, #1e1e22);
                --fcv6-border: rgba(255,255,255,.075);
                --fcv6-text: #f2f2f4;
                --fcv6-muted: rgba(255,255,255,.48);

                box-sizing: border-box;
                width: 100%;
                padding: 4px 12px 34px;
                background: var(--fcv6-bg);
                border-radius: 20px;
            }

            .fcv6-container *,
            .fcv6-container *::before,
            .fcv6-container *::after {
                box-sizing: border-box;
            }

            .fcv6-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 8px 4px 18px;
            }

            .fcv6-header-title {
                color: #fff;
                font-size: 20px;
                line-height: 1.2;
                font-weight: 800;
                letter-spacing: -.02em;
            }

            .fcv6-header-count {
                flex: 0 0 auto;
                padding: 7px 12px;
                border-radius: 999px;
                background: var(--fcv6-accent);
                color: #19120a;
                font-size: 12px;
                font-weight: 800;
                box-shadow: 0 7px 18px rgba(255,152,0,.25);
            }

            .fcv6-subtitle {
                padding: 0 4px 16px;
                color: var(--fcv6-muted);
                font-size: 12px;
            }

            .fcv6-comment {
                position: relative;
                margin: 0 0 13px;
                padding: 17px 18px 18px 21px;
                background: var(--fcv6-card);
                border: 1px solid var(--fcv6-border);
                border-radius: 18px;
                overflow: hidden;
                box-shadow:
                    0 12px 28px rgba(0,0,0,.34),
                    inset 0 1px 0 rgba(255,255,255,.035);
                transition:
                    transform .16s ease,
                    background .16s ease,
                    border-color .16s ease,
                    box-shadow .16s ease;
            }

            .fcv6-comment::before {
                content: "";
                position: absolute;
                left: 0;
                top: 12px;
                bottom: 12px;
                width: 4px;
                border-radius: 0 4px 4px 0;
                background: linear-gradient(180deg, #ffb74d, #e65100);
                box-shadow: 0 0 12px rgba(255,152,0,.35);
            }

            .fcv6-comment.focus,
            .fcv6-comment:hover {
                transform: translateY(-2px) scale(1.003);
                background: var(--fcv6-card-hover);
                border-color: rgba(255,152,0,.3);
                box-shadow:
                    0 18px 34px rgba(0,0,0,.44),
                    0 0 0 1px rgba(255,152,0,.05);
            }

            .fcv6-number {
                display: inline-flex;
                align-items: center;
                min-height: 27px;
                padding: 5px 10px;
                margin-bottom: 10px;
                border-radius: 9px;
                background: var(--fcv6-accent-soft);
                border: 1px solid rgba(255,152,0,.18);
                color: #ffb74d;
                font-size: 12px;
                line-height: 1;
                font-weight: 800;
                letter-spacing: .02em;
            }

            .fcv6-text {
                color: #dedee2;
                font-size: 15px;
                line-height: 1.58;
                word-break: break-word;
                white-space: pre-wrap;
            }

            .fcv6-comment:nth-child(3n) .fcv6-number {
                background: rgba(255,255,255,.055);
                border-color: rgba(255,255,255,.09);
                color: #fff;
            }

            .fcv6-footer {
                padding: 10px 4px 0;
                color: rgba(255,255,255,.26);
                text-align: center;
                font-size: 10px;
            }

            .fcv6-empty {
                padding: 45px 20px;
                color: #aaa;
                text-align: center;
            }

            .button--filmix-comments-v6 svg {
                width: 22px;
                height: 22px;
                margin-right: 7px;
                fill: currentColor;
            }
        `;

        document.head.appendChild(style);
    }

    function renderComments(movie) {
        const title = getMovieTitle(movie);

        let html = `
            <div class="fcv6-container">
                <div class="fcv6-header">
                    <div class="fcv6-header-title">Комментарии</div>
                    <div class="fcv6-header-count">${COMMENTS.length}</div>
                </div>

                <div class="fcv6-subtitle">
                    ${escapeHtml(title)}
                </div>
        `;

        if (!COMMENTS.length) {
            html += `
                <div class="fcv6-empty">
                    Комментариев пока нет
                </div>
            `;
        } else {
            COMMENTS.forEach(function (comment, index) {
                html += `
                    <div class="fcv6-comment selector" tabindex="0">
                        <div class="fcv6-number">
                            Комментарий ${index + 1}
                        </div>
                        <div class="fcv6-text">
                            ${escapeHtml(comment)}
                        </div>
                    </div>
                `;
            });
        }

        html += `
                <div class="fcv6-footer">
                    UI-прототип • данные пока тестовые
                </div>
            </div>
        `;

        return html;
    }

    function openComments(movie) {
        addStyles();

        const modalHtml = $(renderComments(movie));

        Lampa.Modal.open({
            title: "Комментарии",
            html: modalHtml,
            size: "large",
            style: "margin-top:10px;",
            mask: true,

            onBack: function () {
                Lampa.Modal.close();
                $(".modal--large").remove();
                Lampa.Controller.toggle("content");
            }
        });

        // Даём Lampa возможность управлять карточками стрелками/пультом.
        modalHtml.find(".selector").on("hover:enter", function () {
            $(this).addClass("focus");
        });

        modalHtml.find(".selector").on("hover:leave", function () {
            $(this).removeClass("focus");
        });
    }

    function addButton(movie) {
        $(".button--filmix-comments-v6").remove();

        const button = $(`
            <div class="
                full-start__button
                selector
                ${BUTTON_CLASS}
            ">
                <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="
                        M20 4.5A2.5 2.5 0 0 0 17.5 2h-11
                        A2.5 2.5 0 0 0 4 4.5v8A2.5 2.5 0 0 0 6.5 15H9l-3.5 4
                        5.5-4h6.5a2.5 2.5 0 0 0 2.5-2.5v-8z
                    "/>
                    <circle cx="9" cy="8.5" r="1"/>
                    <circle cx="12" cy="8.5" r="1"/>
                    <circle cx="15" cy="8.5" r="1"/>
                </svg>
                <span>Комментарии</span>
            </div>
        `);

        $(".full-start-new__buttons").append(button);

        button.on("hover:enter", function () {
            openComments(movie);
        });

        // Для некоторых версий Lampa обычный click тоже полезен.
        button.on("click", function () {
            openComments(movie);
        });
    }

    function startPlugin() {
        if (window[PLUGIN_FLAG]) return;
        window[PLUGIN_FLAG] = true;

        addStyles();

        Lampa.Listener.follow("full", function (event) {
            if (event.type !== "complite") return;

            const movie = event.data && event.data.movie;
            if (!movie) return;

            addButton(movie);
        });
    }

    startPlugin();

})();
