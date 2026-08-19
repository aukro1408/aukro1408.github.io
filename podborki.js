(function () {
    'use strict';

    /* Lampa Collections v1.5 AI settings fix — author: aukro1408 */
    var COMPONENT = 'lampa_collections_standard';
    var MENU_ID = 'lampa_collections_standard_menu';
    var started = false;
    var countCache = {};
    var AI_PROVIDER_PARAM = 'lcs_ai_provider';
    var AI_OPENROUTER_KEY_PARAM = 'lcs_ai_openrouter_key';
    var AI_MODEL_PARAM = 'lcs_ai_model';

    /*
     * Минимальный тест.
     *
     * Здесь намеренно НЕ используется собственный размер карточки.
     * Карточка строится с классами штатной Lampa .card/.card__view/.card__img,
     * поэтому её размеры берёт стандартный CSS Lampa.
     *
     * После проверки картинки можно заменить на TMDB-источники.
     */
    var COLLECTIONS = [
        {
            title: 'Реальность сломалась',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M8 8l3 3-2 4M16 8l-3 3 2 4M9 16h6"/></svg>',
            description: 'Когда мир выглядит нормальным, но что-то явно не так',
            image: 'https://image.tmdb.org/t/p/w500/7p5MzMb4h0Y2WUn73r4MHKNeh3X.jpg',
            url: 'discover/movie?with_genres=878|53&with_keywords=2340&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Другая версия тебя',
            icon: '<svg viewBox="0 0 24 24"><circle cx="9" cy="9" r="4"/><circle cx="15" cy="15" r="4"/><path d="M12 5v14M5 12h14"/></svg>',
            description: 'Двойники, подмена и чужая жизнь',
            image: 'https://image.tmdb.org/t/p/w500/rQifCStdJ7uJt1JMY3TDx1J5yWI.jpg',
            url: 'discover/movie?with_keywords=161891&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Время пошло не так',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2M5 5l2 2M19 5l-2 2"/></svg>',
            description: 'Петли, повторения и сломанная хронология',
            image: 'https://image.tmdb.org/t/p/w500/26OxTMSHoUW50XK3zkjOqodcvTc.jpg',
            url: 'discover/movie?with_keywords=563&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Ничего не сходится',
            icon: '<svg viewBox="0 0 24 24"><path d="M5 6h6v5H5zM13 13h6v5h-6zM13 5h6v5h-6zM5 14h6v5H5z"/><path d="m11 8 2 3M11 16l2-3"/></svg>',
            description: 'Чем дальше, тем меньше понятно, что происходит',
            image: 'https://image.tmdb.org/t/p/w500/rQifCStdJ7uJt1JMY3TDx1J5yWI.jpg',
            url: 'discover/movie?with_genres=53,9648&with_keywords=2340&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Что-то не так',
            icon: '<svg viewBox="0 0 24 24"><path d="M12 3 21 20H3z"/><path d="M12 8v6M12 17h.01"/></svg>',
            description: 'Тревожное чувство, что реальность скрывает что-то ужасное',
            image: 'https://image.tmdb.org/t/p/w500/ooTB3486ybRLrIr46vdjEhoYcsy.jpg',
            url: 'discover/movie?with_genres=27,53&with_keywords=256183&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'За тобой наблюдают',
            icon: '<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/><path d="M18 5l2-2M6 5 4 3"/></svg>',
            description: 'Камеры, слежка и ощущение чужого взгляда',
            image: 'https://image.tmdb.org/t/p/w500/gAw5nJGNDI2hyw2ghBLoD6rSk3Y.jpg',
            url: 'discover/movie?with_keywords=18420&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'За дверью что-то есть',
            icon: '<svg viewBox="0 0 24 24"><path d="M6 21V4h11v17M6 21h13M14 13h.01"/><path d="M17 8c2 0 3 1 3 3s-1 3-3 3"/></svg>',
            description: 'Порталы, тайные пространства и места, куда не стоило входить',
            image: 'https://image.tmdb.org/t/p/w500/ebzumprgCpfFUZOTJNZ407FA9IH.jpg',
            url: 'discover/movie?with_genres=27&with_keywords=7939&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Неизвестный сигнал',
            icon: '<svg viewBox="0 0 24 24"><path d="M4 12h3M17 12h3M7 9a4 4 0 0 1 0 6M17 9a4 4 0 0 0 0 6M9.5 6.5a8 8 0 0 1 0 11M14.5 6.5a8 8 0 0 0 0 11"/><circle cx="12" cy="12" r="1.5"/></svg>',
            description: 'Странные контакты, неизвестные сущности и внеземной след',
            image: 'https://image.tmdb.org/t/p/w500/gAw5nJGNDI2hyw2ghBLoD6rSk3Y.jpg',
            url: 'discover/movie?with_genres=878,53&with_keywords=12553&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Найденная запись',
            icon: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M8 5l1-2h6l1 2M8 17h.01M16 17h.01"/></svg>',
            description: 'Камеры, кассеты и последние записи исчезнувших людей',
            image: 'https://image.tmdb.org/t/p/w500/uSx9GZIdrYv8MQtDq6eaT0kYfTY.jpg',
            url: 'discover/movie?with_genres=27&with_keywords=163053&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'За пределами мира',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2 2.2 3 4.9 3 8s-1 5.8-3 8M12 4c-2 2.2-3 4.9-3 8s1 5.8 3 8"/></svg>',
            description: 'Другие измерения, порталы и невозможные пространства',
            image: 'https://image.tmdb.org/t/p/w500/26OxTMSHoUW50XK3zkjOqodcvTc.jpg',
            url: 'discover/movie?with_genres=878,27&with_keywords=7939&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        }
    ,
        {
            title: 'Боевики',
            icon: '<svg viewBox="0 0 24 24"><path d="M5 4h9l5 5-6 6-5-5z"/><path d="m13 11 6 6M4 20l6-6"/></svg>',
            description: 'Адреналин, перестрелки и герои на пределе',
            image: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
            url: 'discover/movie?with_genres=28&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Приключения',
            icon: '<svg viewBox="0 0 24 24"><path d="m12 3 4 8-4 10-4-10z"/><path d="m8 11 4 2 4-2"/></svg>',
            description: 'Путешествия, открытия и опасные экспедиции',
            image: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
            url: 'discover/movie?with_genres=12&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Комедии',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M8 10h.01M16 10h.01M8 14c1 2 3 3 4 3s3-1 4-3"/></svg>',
            description: 'Смешные истории, абсурд и хорошее настроение',
            image: 'https://image.tmdb.org/t/p/w500/uluhlXubGu1Vx9fN7R6wz2Qh3xT.jpg',
            url: 'discover/movie?with_genres=35&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Драмы',
            icon: '<svg viewBox="0 0 24 24"><path d="M4 18c4-6 7-9 16-12"/><path d="M5 7h.01M19 17h.01"/></svg>',
            description: 'Сильные истории, отношения и человеческие судьбы',
            image: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
            url: 'discover/movie?with_genres=18&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Ужасы',
            icon: '<svg viewBox="0 0 24 24"><path d="M12 3 4 8v6c0 4 3 6 8 7 5-1 8-3 8-7V8z"/><path d="M8 11h.01M16 11h.01M9 16c2-2 4-2 6 0"/></svg>',
            description: 'Монстры, проклятия и то, что лучше не встречать ночью',
            image: 'https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrY7M2m9kQ.jpg',
            url: 'discover/movie?with_genres=27&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Фантастика',
            icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M3 12c2-5 5-7 9-7s7 2 9 7c-2 5-5 7-9 7s-7-2-9-7zM12 2v3M12 19v3"/></svg>',
            description: 'Будущее, технологии и невозможные миры',
            image: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
            url: 'discover/movie?with_genres=878&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Фэнтези',
            icon: '<svg viewBox="0 0 24 24"><path d="m12 3 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/></svg>',
            description: 'Магия, легенды, сказочные миры и чудеса',
            image: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
            url: 'discover/movie?with_genres=14&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Детективы',
            icon: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5M8 10h5M10.5 7.5v6"/></svg>',
            description: 'Загадки, расследования и поиск правды',
            image: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
            url: 'discover/movie?with_genres=9648&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Криминал',
            icon: '<svg viewBox="0 0 24 24"><path d="M7 4h10v16H7z"/><path d="M10 4V2h4v2M10 9h4M10 13h4M10 17h2"/></svg>',
            description: 'Преступления, банды, аферы и опасные игры',
            image: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
            url: 'discover/movie?with_genres=80&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        },
        {
            title: 'Триллеры',
            icon: '<svg viewBox="0 0 24 24"><path d="M12 3 4 7v5c0 5 3 7 8 9 5-2 8-4 8-9V7z"/><path d="M12 8v4l3 2"/></svg>',
            description: 'Напряжение, опасность и неожиданные повороты',
            image: 'https://image.tmdb.org/t/p/w500/191nKfPz1gjGbiL7Oq5v6p7h8kL.jpg',
            url: 'discover/movie?with_genres=53&sort_by=popularity.desc&vote_average.gte=6&vote_count.gte=100&include_adult=false'
        }
    ];

    function esc(text) {
        return String(text || '').replace(/[&<>"']/g, function (c) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[c];
        });
    }

    function addStyle() {
        if (document.getElementById('lampa-collections-standard-style')) return;

        var style = document.createElement('style');
        style.id = 'lampa-collections-standard-style';
        style.textContent = `
            /*
             * НЕ задаём width/height/aspect-ratio для карточки.
             * Lampa сама задаёт стандартные размеры .card.
             */
            .lcs-page {
                padding: 1.2em 1.4em 5em;
            }

            .lcs-title {
                font-size: 2em;
                font-weight: 700;
                margin: 0 0 .2em;
            }

            .lcs-subtitle {
                opacity: .65;
                margin-bottom: 1.4em;
            }

            .lcs-section-title {
                font-size: 1.65em;
                font-weight: 700;
                margin: 2.2em 0 .15em;
            }

            .lcs-section-subtitle {
                opacity: .6;
                margin-bottom: 1.1em;
            }

            .lcs-studio-card .lcs-icon {
                color: #fff;
            }

            .lcs-row {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 1.15em .8em;
                align-items: start;
                width: 100%;
                box-sizing: border-box;
            }

            .lcs-card {
                width: 100% !important;
                min-width: 0 !important;
                margin: 0 !important;
                box-sizing: border-box !important;
            }

            .lcs-card .card__view {
                width: 100% !important;
                border-radius: .8em !important;
                overflow: hidden !important;
            }

            .lcs-card .card__img {
                border-radius: .8em !important;
                overflow: hidden !important;
            }

            /*
             * Только небольшая подпись категории.
             * Размер самой карточки НЕ трогаем.
             */
            .lcs-card .card__title {
                display: block !important;
                white-space: normal !important;
                text-align: center !important;
                line-height: 1.2;
                margin-top: .4em;
            }

            /*
             * Aurora Glass — крупная живая пилюля количества.
             * Не меняем размеры самой карточки Lampa.
             */
            .lcs-ai-card {position:relative;width:100%!important;min-width:0!important;box-sizing:border-box;min-height:100%;padding:1em .65em;border-radius:1em;overflow:hidden;background:linear-gradient(135deg,rgba(68,93,255,.92),rgba(128,61,255,.88) 45%,rgba(231,66,178,.86));border:1px solid rgba(255,255,255,.3);box-shadow:0 .5em 1.4em rgba(93,66,255,.28),inset 0 1px 0 rgba(255,255,255,.24);color:#fff;text-align:center}.lcs-ai-card-glow{position:absolute;width:140%;height:80%;left:-20%;top:-35%;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.34),rgba(255,255,255,0) 68%);filter:blur(12px)}.lcs-ai-card-icon{position:relative;width:3em;height:3em;margin:.15em auto .6em;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3)}.lcs-ai-card-icon svg{width:1.7em;height:1.7em;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.lcs-ai-card-title,.lcs-ai-card-desc{position:relative}.lcs-ai-card-title{font-size:.9em;font-weight:700}.lcs-ai-card-desc{margin-top:.4em;font-size:.62em;line-height:1.25;opacity:.9}.lcs-ai-page{padding:1.5em 4vw 3em;box-sizing:border-box}.lcs-ai-content{max-width:900px;margin:0 auto}.lcs-ai-hero-title{font-size:2em;font-weight:700;margin-bottom:.3em}.lcs-ai-hero-desc{font-size:1em;opacity:.75;margin-bottom:1em}.lcs-ai-input{padding:1em 1.1em;border-radius:.85em;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);margin-bottom:.8em}.lcs-ai-suggestions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65em}.lcs-ai-suggestion{padding:.9em 1em;border-radius:.8em;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)}.lcs-ai-result{margin-top:1em;display:flex;flex-direction:column;gap:.55em}.lcs-ai-result-item{padding:.8em 1em;border-radius:.75em;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)}@media(max-width:700px){.lcs-ai-suggestions{grid-template-columns:1fr}}
            .lcs-count {
                position: absolute;
                top: .7em;
                right: .7em;
                z-index: 8;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 5.6em;
                height: 2.35em;
                padding: 0 .95em;
                box-sizing: border-box;
                border-radius: 999px;

                color: #fff;
                font-size: .82em;
                font-weight: 700;
                letter-spacing: .01em;
                line-height: 1;
                white-space: nowrap;

                background:
                    linear-gradient(
                        115deg,
                        rgba(63, 111, 255, .78) 0%,
                        rgba(116, 62, 255, .76) 36%,
                        rgba(218, 63, 174, .78) 72%,
                        rgba(255, 116, 192, .72) 100%
                    );

                border: 1px solid rgba(255,255,255,.42);

                box-shadow:
                    0 0 0 1px rgba(255,255,255,.08) inset,
                    0 .35em 1.1em rgba(117, 64, 255, .28),
                    0 .2em .8em rgba(0,0,0,.30);

                backdrop-filter: blur(14px) saturate(150%);
                -webkit-backdrop-filter: blur(14px) saturate(150%);

                overflow: hidden;
                pointer-events: none;

                animation: lcsAuroraPulse 5s ease-in-out infinite;
            }

            .lcs-count::before {
                content: '';
                position: absolute;
                inset: -45% -20%;
                background:
                    radial-gradient(
                        circle at 18% 50%,
                        rgba(120, 205, 255, .58) 0%,
                        rgba(120, 205, 255, 0) 42%
                    ),
                    radial-gradient(
                        circle at 82% 50%,
                        rgba(255, 150, 225, .55) 0%,
                        rgba(255, 150, 225, 0) 44%
                    );
                filter: blur(7px);
                opacity: .85;
                transform: translateX(-8%);
                animation: lcsAuroraFlow 6s ease-in-out infinite alternate;
            }

            .lcs-count::after {
                content: '';
                position: absolute;
                left: 12%;
                right: 12%;
                top: 8%;
                height: 32%;
                border-radius: 999px;
                background: linear-gradient(
                    180deg,
                    rgba(255,255,255,.42),
                    rgba(255,255,255,0)
                );
                opacity: .72;
            }

            .lcs-count {
                text-shadow:
                    0 1px 2px rgba(0,0,0,.35),
                    0 0 10px rgba(255,255,255,.18);
            }

            @keyframes lcsAuroraPulse {
                0%, 100% {
                    filter: saturate(100%) brightness(100%);
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,.08) inset,
                        0 .35em 1.1em rgba(117, 64, 255, .28),
                        0 .2em .8em rgba(0,0,0,.30);
                }
                50% {
                    filter: saturate(125%) brightness(108%);
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,.12) inset,
                        0 .35em 1.35em rgba(213, 66, 188, .34),
                        0 .2em .8em rgba(0,0,0,.30);
                }
            }

            @keyframes lcsAuroraFlow {
                0% {
                    transform: translateX(-8%) scale(1);
                }
                100% {
                    transform: translateX(8%) scale(1.08);
                }
            }

            .lcs-category {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: .38em;
            }

            .lcs-icon {
                width: 1.15em;
                height: 1.15em;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                flex: 0 0 auto;
            }

            .lcs-icon svg {
                width: 100%;
                height: 100%;
                fill: none;
                stroke: currentColor;
                stroke-width: 1.7;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .lcs-name {
                display: inline-block;
            }

            .lcs-card .lcs-category {
                font-size: 1em;
                font-weight: 600;
            }

            .lcs-card .lcs-desc {
                font-size: .78em;
                opacity: .6;
                margin-top: .18em;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            @media (max-width: 700px) {
                .lcs-row {
                    gap: 1em .65em;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function setCardImage(card, data, fallback) {
        var results = data && Array.isArray(data.results) ? data.results : [];
        var first = null;

        // Не берём results[0] вслепую: первый объект TMDB иногда не имеет poster_path.
        for (var i = 0; i < results.length; i++) {
            if (results[i] && results[i].poster_path) {
                first = results[i];
                break;
            }
        }

        if (first && first.poster_path) {
            card.find('.card__img').attr(
                'src',
                'https://image.tmdb.org/t/p/w500' + first.poster_path
            );
            return true;
        }

        // Если постеров в выдаче нет, пробуем backdrop.
        for (var j = 0; j < results.length; j++) {
            if (results[j] && results[j].backdrop_path) {
                card.find('.card__img').attr(
                    'src',
                    'https://image.tmdb.org/t/p/w780' + results[j].backdrop_path
                );
                return true;
            }
        }

        // Последний fallback — старый постер, если он задан и не пустой.
        if (fallback) {
            card.find('.card__img').attr('src', fallback);
            return true;
        }

        return false;
    }

    function loadCollectionData(item, card, pill) {
        if (countCache[item.url] !== undefined) {
            pill.text(countCache[item.url] + ' фильмов');
        }

        function applyData(data) {
            var total = data && Number(data.total_results);
            if (!isFinite(total)) total = 0;
            countCache[item.url] = total;

            // Если подборка пустая — полностью убираем её из DOM.
            // Поэтому не остаётся пустого места в сетке 3×N.
            if (total <= 0) {
                card.remove();
                return;
            }

            pill.text(total + ' фильмов');
            setCardImage(card, data, item.image);
        }

        try {
            if (Lampa.Api && typeof Lampa.Api.list === 'function') {
                Lampa.Api.list({
                    url: item.url,
                    source: 'tmdb',
                    page: 1
                }, applyData, function () {
                    // Не показываем битую картинку. Если старого fallback нет,
                    // оставляем штатный loader Lampa вместо broken-image icon.
                    if (!item.image) {
                        card.find('.card__img').attr('src', './img/img_load.svg');
                    }
                });
                return;
            }
        } catch (e) {
            console.log('[Подборки] data error', e);
        }

        if (item.image) {
            card.find('.card__img').attr('src', item.image);
        }
    }

    
    /*
     * СТРИМИНГИ / СТУДИИ
     * Основа взята из studios.js, переданного пользователем:
     * Netflix, Apple TV+, HBO/Max, Prime Video, Disney+, Hulu,
     * Paramount+, Syfy и познавательные студии.
     *
     * Картинки НЕ храним вручную: для карточки сервиса и каждой
     * категории берём poster_path первого результата TMDB.
     */
    var STUDIO_SERVICES = [
        {
            id: 'netflix',
            title: 'Netflix',
            icon: '<svg viewBox="0 0 24 24"><path d="M7 2v20M17 2v20M7 2l10 20"/></svg>',
            categories: [
                { title:'Новые фильмы', url:'discover/movie', params:{with_watch_providers:'8',watch_region:'UA',sort_by:'primary_release_date.desc',vote_count_gte:'5'} },
                { title:'Новые сериалы', url:'discover/tv', params:{with_networks:'213',sort_by:'first_air_date.desc',vote_count_gte:'5'} },
                { title:'В тренде на Netflix', url:'discover/tv', params:{with_networks:'213',sort_by:'popularity.desc'} },
                { title:'Экшн и блокбастеры', url:'discover/movie', params:{with_companies:'213',with_genres:'28,12',sort_by:'popularity.desc'} },
                { title:'Фантастические миры', url:'discover/tv', params:{with_networks:'213',with_genres:'10765',sort_by:'vote_average.desc',vote_count_gte:'200'} },
                { title:'Реалити-шоу: хиты', url:'discover/tv', params:{with_networks:'213',with_genres:'10764',sort_by:'popularity.desc'} },
                { title:'Криминальные драмы', url:'discover/tv', params:{with_networks:'213',with_genres:'80',sort_by:'popularity.desc'} },
                { title:'K-Dramas', url:'discover/tv', params:{with_networks:'213',with_original_language:'ko',sort_by:'popularity.desc'} },
                { title:'Аниме коллекция', url:'discover/tv', params:{with_networks:'213',with_genres:'16',with_keywords:'210024',sort_by:'popularity.desc'} },
                { title:'Документальное кино', url:'discover/movie', params:{with_companies:'213',with_genres:'99',sort_by:'release_date.desc'} },
                { title:'Выбор критиков', url:'discover/movie', params:{with_companies:'213',vote_average_gte:'7.5',vote_count_gte:'300',sort_by:'vote_average.desc'} }
            ]
        },
        {
            id:'apple', title:'Apple TV+',
            icon:'<svg viewBox="0 0 24 24"><path d="M16 12.5c0 3 2.5 4 2.5 4s-1.5 4-4 4c-1.2 0-1.7-.8-2.8-.8-1.1 0-1.9.8-3 .8-2.3 0-5.2-3.6-5.2-8 0-3.9 2.5-6.1 5-6.1 1.3 0 2.6.9 3.4.9.8 0 2.3-1 3.9-.9.7 0 2.8.3 4.1 2.2-3.4 1.9-2.8 6.1.1 7.9M14.2 4.5c.7-.8 1.2-2 1.1-3.2-1.1.1-2.4.7-3.1 1.5-.7.8-1.2 2-1.1 3.1 1.2.1 2.4-.6 3.1-1.4z"/></svg>',
            categories:[
                {title:'Новые фильмы',url:'discover/movie',params:{with_watch_providers:'350',watch_region:'UA',sort_by:'primary_release_date.desc',vote_count_gte:'5'}},
                {title:'Новые сериалы',url:'discover/tv',params:{with_watch_providers:'350',watch_region:'UA',sort_by:'first_air_date.desc',vote_count_gte:'5'}},
                {title:'Хиты Apple TV+',url:'discover/tv',params:{with_watch_providers:'350',watch_region:'UA',sort_by:'popularity.desc'}},
                {title:'Apple Original Films',url:'discover/movie',params:{with_watch_providers:'350',watch_region:'UA',sort_by:'release_date.desc',vote_count_gte:'10'}},
                {title:'Фантастика Apple',url:'discover/tv',params:{with_watch_providers:'350',watch_region:'UA',with_genres:'10765',sort_by:'vote_average.desc',vote_count_gte:'200'}},
                {title:'Комедии и Feel-good',url:'discover/tv',params:{with_watch_providers:'350',watch_region:'UA',with_genres:'35',sort_by:'popularity.desc'}},
                {title:'Триллеры и детективы',url:'discover/tv',params:{with_watch_providers:'350',watch_region:'UA',with_genres:'9648,80',sort_by:'popularity.desc'}}
            ]
        },
        {
            id:'hbo', title:'HBO / Max',
            icon:'<svg viewBox="0 0 24 24"><path d="M2 7v10M2 12h5M7 7v10M10 7v10M10 7c5-2 5 8 0 6M17 7h5M19.5 7v10"/></svg>',
            categories:[
                {title:'Новые фильмы WB/HBO',url:'discover/movie',params:{with_companies:'174|49',sort_by:'primary_release_date.desc',vote_count_gte:'10'}},
                {title:'Новые сериалы HBO/Max',url:'discover/tv',params:{with_networks:'49|3186',sort_by:'first_air_date.desc',vote_count_gte:'5'}},
                {title:'HBO: главные хиты',url:'discover/tv',params:{with_networks:'49',sort_by:'popularity.desc'}},
                {title:'Max Originals',url:'discover/tv',params:{with_networks:'3186',sort_by:'popularity.desc'}},
                {title:'Блокбастеры Warner Bros.',url:'discover/movie',params:{with_companies:'174',sort_by:'revenue.desc',vote_count_gte:'1000'}},
                {title:'Золотая коллекция HBO',url:'discover/tv',params:{with_networks:'49',sort_by:'vote_average.desc',vote_count_gte:'500',vote_average_gte:'8.0'}},
                {title:'Эпические миры',url:'discover/tv',params:{with_networks:'49|3186',with_genres:'10765',sort_by:'popularity.desc'}},
                {title:'Премиальные драмы',url:'discover/tv',params:{with_networks:'49',with_genres:'18',without_genres:'10765',sort_by:'popularity.desc'}},
                {title:'Взрослая анимация',url:'discover/tv',params:{with_networks:'3186|80',with_genres:'16',sort_by:'popularity.desc'}},
                {title:'Вселенная DC',url:'discover/movie',params:{with_companies:'174',with_keywords:'9715',sort_by:'release_date.desc'}}
            ]
        },
        {
            id:'amazon', title:'Prime Video',
            icon:'<svg viewBox="0 0 24 24"><circle cx="12" cy="11" r="8"/><path d="M5 18c4 3 10 3 14 0M15 8l-3 3 3 3"/></svg>',
            categories:[
                {title:'В тренде на Prime Video',url:'discover/tv',params:{with_networks:'1024',sort_by:'popularity.desc'}},
                {title:'Новые фильмы',url:'discover/movie',params:{with_watch_providers:'119',watch_region:'UA',sort_by:'primary_release_date.desc',vote_count_gte:'5'}},
                {title:'Новые сериалы',url:'discover/tv',params:{with_networks:'1024',sort_by:'first_air_date.desc',vote_count_gte:'5'}},
                {title:'Жёсткий экшен и антигерои',url:'discover/tv',params:{with_networks:'1024',with_genres:'10765,10759',sort_by:'popularity.desc'}},
                {title:'Блокбастеры MGM и Amazon',url:'discover/movie',params:{with_companies:'1024|21',sort_by:'revenue.desc'}},
                {title:'Комедии',url:'discover/tv',params:{with_networks:'1024',with_genres:'35',sort_by:'vote_average.desc'}},
                {title:'Высокий рейтинг',url:'discover/tv',params:{with_networks:'1024',vote_average_gte:'8.0',vote_count_gte:'500',sort_by:'vote_average.desc'}}
            ]
        },
        {
            id:'disney', title:'Disney+',
            icon:'<svg viewBox="0 0 24 24"><path d="M3 8c4-2 10-2 18 1M4 13c5-3 13-1 16 5M12 4v16"/></svg>',
            categories:[
                {title:'Новые фильмы',url:'discover/movie',params:{with_watch_providers:'337',watch_region:'UA',sort_by:'primary_release_date.desc',vote_count_gte:'5'}},
                {title:'Новые сериалы',url:'discover/tv',params:{with_watch_providers:'337',watch_region:'UA',sort_by:'first_air_date.desc',vote_count_gte:'5'}},
                {title:'Marvel: киновселенная',url:'discover/movie',params:{with_companies:'420',sort_by:'release_date.desc',vote_count_gte:'200'}},
                {title:'Marvel: сериалы',url:'discover/tv',params:{with_companies:'420',with_networks:'2739',sort_by:'first_air_date.desc'}},
                {title:'Звёздные войны',url:'discover/movie',params:{with_companies:'1',sort_by:'release_date.asc'}},
                {title:'Мандалорец и другие',url:'discover/tv',params:{with_companies:'1',with_keywords:'1930',sort_by:'popularity.desc'}},
                {title:'Классика Disney',url:'discover/movie',params:{with_companies:'6125',sort_by:'popularity.desc'}},
                {title:'Pixar',url:'discover/movie',params:{with_companies:'3',sort_by:'popularity.desc'}},
                {title:'FX: взрослые хиты',url:'discover/tv',params:{with_networks:'88',sort_by:'popularity.desc'}},
                {title:'Симпсоны и FOX',url:'discover/tv',params:{with_networks:'19',with_genres:'16',sort_by:'popularity.desc'}}
            ]
        },
        {
            id:'hulu', title:'Hulu',
            icon:'<svg viewBox="0 0 24 24"><path d="M4 5v14M8 5v14M8 12h8M16 5v14M20 5v14"/></svg>',
            categories:[
                {title:'Hulu Originals: в тренде',url:'discover/tv',params:{with_networks:'453',sort_by:'popularity.desc'}},
                {title:'Драмы и триллеры Hulu',url:'discover/tv',params:{with_networks:'453',with_genres:'18,9648',sort_by:'vote_average.desc'}},
                {title:'Комедии и взрослая анимация',url:'discover/tv',params:{with_networks:'453',with_genres:'35,16',sort_by:'popularity.desc'}},
                {title:'Мини-сериалы',url:'discover/tv',params:{with_networks:'453',with_keywords:'158718',sort_by:'first_air_date.desc'}}
            ]
        },
        {
            id:'paramount', title:'Paramount+',
            icon:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M7 17 12 7l5 10M9 14h6"/></svg>',
            categories:[
                {title:'Блокбастеры Paramount Pictures',url:'discover/movie',params:{with_companies:'4',sort_by:'revenue.desc'}},
                {title:'Paramount+ Originals',url:'discover/tv',params:{with_networks:'4330',sort_by:'popularity.desc'}},
                {title:'Вселенная Йеллоустоун',url:'discover/tv',params:{with_networks:'318|4330',with_genres:'37,18',sort_by:'popularity.desc'}},
                {title:'Star Trek',url:'discover/tv',params:{with_networks:'4330',with_keywords:'159223',sort_by:'first_air_date.desc'}},
                {title:'Nickelodeon',url:'discover/tv',params:{with_networks:'13',sort_by:'popularity.desc'}}
            ]
        },
        {
            id:'syfy', title:'Syfy',
            icon:'<svg viewBox="0 0 24 24"><path d="M12 2 4.5 20.3 5.2 21 12 18l6.8 3 .7-.7z"/></svg>',
            categories:[
                {title:'Хиты Syfy',url:'discover/tv',params:{with_networks:'77',sort_by:'popularity.desc'}},
                {title:'Космос и научная фантастика',url:'discover/tv',params:{with_networks:'77',with_genres:'10765',with_keywords:'3801',sort_by:'vote_average.desc'}},
                {title:'Мистика, ужасы и фэнтези',url:'discover/tv',params:{with_networks:'77',with_genres:'9648,10765',without_keywords:'3801',sort_by:'popularity.desc'}}
            ]
        },
        {
            id:'educational', title:'Discovery / BBC / NatGeo',
            icon:'<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 12h8M8 15h5"/></svg>',
            categories:[
                {title:'Новые выпуски',url:'discover/tv',params:{with_networks:'64|91|43|2696|4|65',sort_by:'first_air_date.desc',vote_count_gte:'0'}},
                {title:'Discovery Channel',url:'discover/tv',params:{with_networks:'64',sort_by:'popularity.desc'}},
                {title:'National Geographic',url:'discover/tv',params:{with_networks:'43',sort_by:'popularity.desc'}},
                {title:'Animal Planet',url:'discover/tv',params:{with_networks:'91',sort_by:'popularity.desc'}},
                {title:'BBC Earth',url:'discover/tv',params:{with_networks:'4',with_genres:'99',sort_by:'vote_average.desc',vote_count_gte:'50'}},
                {title:'Кулинарные шоу',url:'discover/tv',params:{with_genres:'10764',with_keywords:'222083',without_keywords:'10636,5481',sort_by:'popularity.desc'}},
                {title:'Голос, танцы и таланты',url:'discover/tv',params:{with_genres:'10764',with_keywords:'4542|4568|2643',without_keywords:'5481,9714',sort_by:'popularity.desc'}},
                {title:'Шоу про выживание',url:'discover/tv',params:{with_genres:'10764',with_keywords:'5481|10348',sort_by:'popularity.desc'}},
                {title:'Наука, техника и эксперименты',url:'discover/tv',params:{with_genres:'99',with_keywords:'12554|4924',sort_by:'popularity.desc'}},
                {title:'Путешествия и туризм',url:'discover/tv',params:{with_genres:'99,10764',with_keywords:'9714',sort_by:'vote_average.desc',vote_count_gte:'20'}},
                {title:'True Crime',url:'discover/tv',params:{with_genres:'99',with_keywords:'10714|9840',sort_by:'popularity.desc'}}
            ]
        }
    ];

    function studioUrl(category) {
        var parts = [];
        var params = category.params || {};
        for (var key in params) {
            var val = params[key];
            if (val === '{current_date}') {
                var d = new Date();
                val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
            }
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
        }
        return category.url + '?' + parts.join('&');
    }

    function tmdbUrl(category, page) {
        var params = [];
        params.push('api_key=' + encodeURIComponent(Lampa.TMDB.key()));
        params.push('language=' + encodeURIComponent(Lampa.Storage.get('language', 'ru')));
        params.push('page=' + (page || 1));
        var cp = category.params || {};
        for (var key in cp) {
            var val = cp[key];
            if (val === '{current_date}') {
                var d = new Date();
                val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
            }
            params.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
        }
        return Lampa.TMDB.api(category.url + '?' + params.join('&'));
    }

    function loadStudioPreview(service, card, pill) {
        var cat = service.categories[0];
        if (!cat) return;

        var url = tmdbUrl(cat, 1);
        var req = new Lampa.Reguest();

        req.silent(url, function (data) {
            if (!data) return;
            setCardImage(card, data, null);
        }, function () {});

        pill.text(service.categories.length + ' подборок');
    }

    function createStudioCard(service) {
        var card;
        try {
            if (Lampa.Template && typeof Lampa.Template.js === 'function') card = Lampa.Template.js('card');
        } catch (e) {}

        if (!card || !card.length) {
            card = $('<div class="card selector layer--visible layer--render lcs-card"><div class="card__view"><img class="card__img"></div><div class="card__title"></div></div>');
        }

        card.addClass('lcs-card card--loaded selector lcs-studio-card');

        var pill = $('<span class="lcs-count">...</span>');
        card.find('.card__view').append(pill);

        var img = card.find('.card__img');
        img.attr('src', './img/img_load.svg');

        card.find('.card__title').html(
            '<div class="lcs-category"><span class="lcs-icon">' +
            service.icon + '</span><span class="lcs-name">' +
            esc(service.title) + '</span></div>' +
            '<div class="lcs-desc">Подборки и хиты сервиса</div>'
        );

        loadStudioPreview(service, card, pill);

        card.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: service.title,
                component: 'lampa_studio_view',
                service_id: service.id,
                page: 1
            });
        });

        return card;
    }

    function createStudioCategoryCard(service, category) {
        var card;
        try {
            if (Lampa.Template && typeof Lampa.Template.js === 'function') card = Lampa.Template.js('card');
        } catch (e) {}

        if (!card || !card.length) {
            card = $('<div class="card selector layer--visible layer--render lcs-card"><div class="card__view"><img class="card__img"></div><div class="card__title"></div></div>');
        }

        card.addClass('lcs-card card--loaded selector lcs-studio-category');

        var pill = $('<span class="lcs-count">...</span>');
        card.find('.card__view').append(pill);

        card.find('.card__img').attr('src', './img/img_load.svg');
        card.find('.card__title').html(
            '<div class="lcs-category"><span class="lcs-icon">' +
            service.icon + '</span><span class="lcs-name">' +
            esc(category.title) + '</span></div>' +
            '<div class="lcs-desc">' + esc(service.title) + '</div>'
        );

        var req = new Lampa.Reguest();
        req.silent(tmdbUrl(category, 1), function (data) {
            var total = data && Number(data.total_results);
            if (!isFinite(total)) total = 0;

            // Пустые категории не показываем вообще.
            if (total <= 0) {
                card.remove();
                return;
            }

            pill.text(total + ' фильмов');

            if (!setCardImage(card, data, null)) {
                // Нет изображения — не показываем broken-image.
                card.find('.card__img').attr('src', './img/img_load.svg');
            }
        }, function () {
            card.remove();
        });

        card.on('hover:enter', function () {
            Lampa.Activity.push({
                component: 'category_full',
                source: 'tmdb',
                title: category.title,
                url: studioUrl(category),
                page: 1
            });
        });

        return card;
    }

    function StudioComponent(object) {
        var service = STUDIO_SERVICES.find(function (s) {
            return s.id === object.service_id;
        });
        var scroll = new Lampa.Scroll({mask:true, over:true});
        var html = $('<div class="lcs-page"></div>');
        var content = $('<div class="lcs-content"></div>');
        var last = false;

        if (!service) {
            content.append('<div class="lcs-title">Сервис не найден</div>');
        } else {
            content.append('<div class="lcs-title">' + esc(service.title) + '</div>');
            content.append('<div class="lcs-subtitle">Подборки и тематические коллекции</div>');
            var row = $('<div class="lcs-row"></div>');

            service.categories.forEach(function (cat) {
                var card = createStudioCategoryCard(service, cat);
                card.on('hover:focus', function () { last = card; });
                row.append(card);
            });

            content.append(row);
        }

        scroll.render().addClass('layer--wheight').data('mheight', html);
        scroll.append(content);
        html.append(scroll.render());

        this.create = function(){ return html; };
        this.render = function(){ return html; };
        this.start = function(){
            Lampa.Controller.add('content',{
                toggle:function(){
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                left:function(){ if(Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                right:function(){ if(Navigator.canmove('right')) Navigator.move('right'); },
                up:function(){ if(Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                down:function(){ if(Navigator.canmove('down')) Navigator.move('down'); },
                back:function(){ Lampa.Activity.backward(); }
            });
            if(!this.inActivity || this.inActivity()) Lampa.Controller.toggle('content');
        };
        this.pause=function(){};
        this.stop=function(){};
        this.destroy=function(){
            try{Lampa.Controller.clear();}catch(e){}
            try{scroll.destroy();}catch(e){}
            try{html.remove();}catch(e){}
        };
    }


    function aiSettings() {
        var key = '';
        var model = 'openrouter/free';
        try { key = Lampa.Storage.field(AI_OPENROUTER_KEY_PARAM) || ''; } catch(e) {}
        try { model = Lampa.Storage.field(AI_MODEL_PARAM) || model; } catch(e) {}
        return { key:key, model:model };
    }

    function addAISettings() {
        try {
            if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

            /*
             * Используем тот же формат SettingsApi, который применяется
             * в рабочем плагине трейлеров: без onChange внутри addParam.
             * Lampa сама сохраняет значение параметра по data-name.
             */
            Lampa.SettingsApi.addComponent({
                component: 'lcs_ai',
                name: 'Киноассистент',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M9 10h.01M15 10h.01M9 14c1.7 1.5 4.3 1.5 6 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 4V2.5M8.5 5.5 7.5 4M15.5 5.5 16.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
            });

            Lampa.SettingsApi.addParam({
                component: 'lcs_ai',
                param: {
                    name: 'lcs_ai_openrouter_key_edit',
                    type: 'button'
                },
                field: {
                    name: 'OpenRouter API-ключ',
                    description: 'Нажмите, чтобы ввести или изменить ключ'
                },
                onChange: function() {
                    var current = '';
                    try { current = Lampa.Storage.get(AI_OPENROUTER_KEY_PARAM, '') || ''; } catch(e) {}
                    if (!Lampa.Input || !Lampa.Input.edit) {
                        try { Lampa.Noty.show('Ввод ключа недоступен в этой версии Lampa'); } catch(e) {}
                        return;
                    }
                    Lampa.Input.edit({
                        title: 'OpenRouter API-ключ',
                        value: current,
                        free: true,
                        nosave: true
                    }, function(value) {
                        value = (value || '').trim();
                        try { Lampa.Storage.set(AI_OPENROUTER_KEY_PARAM, value); } catch(e) {}
                        try { Lampa.Noty.show(value ? 'OpenRouter API-ключ сохранён' : 'OpenRouter API-ключ очищен'); } catch(e) {}
                    });
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'lcs_ai',
                param: {
                    name: AI_MODEL_PARAM,
                    type: 'select',
                    values: {
                        'openrouter/free': 'Автоматически — бесплатная модель'
                    },
                    'default': 'openrouter/free'
                },
                field: {
                    name: 'Модель',
                    description: 'Оставьте автоматический выбор для бесплатного режима.'
                }
            });
        } catch(e) {
            console.log('[Подборки] AI settings error', e);
        }
    }

    function AssistantComponent(object) {
        var html=$('<div class="lcs-ai-page"></div>');
        var scroll=new Lampa.Scroll({mask:true,over:true});
        var content=$('<div class="lcs-ai-content"></div>');
        var result=$('<div class="lcs-ai-result"></div>');
        var input=$('<div class="lcs-ai-input selector">Например: хочу очень странный и страшный фильм</div>');
        var suggestions=$('<div class="lcs-ai-suggestions"></div>');
        var busy=false;

        content.append('<div class="lcs-ai-hero-title">Киноассистент</div>');
        content.append('<div class="lcs-ai-hero-desc">Расскажи своими словами, что хочется посмотреть — попробуем подобрать.</div>');
        content.append(input);
        ['Что-нибудь очень страшное','Странное кино, где ничего не понятно','Психологический триллер','Необычная фантастика','Удиви меня'].forEach(function(text){
            var b=$('<div class="lcs-ai-suggestion selector"></div>').text(text);
            b.on('hover:enter',function(){ input.text(text); ask(text); });
            suggestions.append(b);
        });
        content.append(suggestions).append(result);
        scroll.render().addClass('layer--wheight').data('mheight',html);
        scroll.append(content); html.append(scroll.render());

        function ask(prompt){
            if(busy) return;
            var st=aiSettings();
            if(!st.key){ try{Lampa.Noty.show('Добавьте OpenRouter API-ключ в настройках плагина');}catch(e){} return; }
            busy=true; result.text('Ищу подходящие фильмы…');
            fetch('https://openrouter.ai/api/v1/chat/completions',{
                method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+st.key},
                body:JSON.stringify({model:st.model,messages:[
                    {role:'system',content:'Ты киноассистент. Ответь по-русски. Подбери 5 фильмов под запрос пользователя. Верни только JSON-массив объектов вида {"title":"...","year":2020,"reason":"короткая причина"}. Не выдумывай фильмы.'},
                    {role:'user',content:prompt}
                ],temperature:.7})
            }).then(function(r){return r.json();}).then(function(data){
                if(data.error) throw new Error(data.error.message||'OpenRouter error');
                var text=data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content||'';
                text=text.replace(/^```json\s*/,'').replace(/\s*```$/,'').trim();
                var arr=JSON.parse(text);
                result.empty();
                arr.forEach(function(x){
                    result.append($('<div class="lcs-ai-result-item"></div>').append($('<b></b>').text((x.title||'')+(x.year?' ('+x.year+')':''))).append($('<div></div>').text(x.reason||'')));
                });
            }).catch(function(err){
                result.text('Не удалось получить ответ: '+err.message);
            }).finally(function(){busy=false;});
        }
        input.on('hover:enter',function(){
            var current=input.text();
            if(current && current.indexOf('Например:')!==0) ask(current);
            else { try{Lampa.Noty.show('Выбери пример запроса или введи текст через клавиатуру Lampa');}catch(e){} }
        });
        this.create=function(){return html;}; this.render=function(){return html;};
        this.start=function(){
            Lampa.Controller.add('content',{toggle:function(){Lampa.Controller.collectionSet(scroll.render());Lampa.Controller.collectionFocus(false,scroll.render());},left:function(){if(Navigator.canmove('left'))Navigator.move('left');else Lampa.Controller.toggle('menu');},right:function(){if(Navigator.canmove('right'))Navigator.move('right');},up:function(){if(Navigator.canmove('up'))Navigator.move('up');else Lampa.Controller.toggle('head');},down:function(){if(Navigator.canmove('down'))Navigator.move('down');},back:function(){Lampa.Activity.backward();}}); Lampa.Controller.toggle('content');
        };
        this.pause=function(){}; this.stop=function(){}; this.destroy=function(){try{Lampa.Controller.clear();}catch(e){} try{scroll.destroy();}catch(e){} try{html.remove();}catch(e){}};
    }

    function addAssistantActivity(){
        try{Lampa.Component.add('lcs_ai',AssistantComponent);}catch(e){console.log('[Подборки] AI component error',e);}
    }
    function openAssistant(){Lampa.Activity.push({title:'Киноассистент',component:'lcs_ai'});}
    function createAssistantCard(){
        var card=$('<div class="lcs-ai-card selector"></div>');
        card.html('<div class="lcs-ai-card-glow"></div><div class="lcs-ai-card-icon"><svg viewBox="0 0 24 24"><path d="M12 3a7 7 0 0 0-7 7v3a3 3 0 0 0 3 3h2v-6H7a5 5 0 0 1 10 0h-3v6h2a3 3 0 0 0 3-3v-3a7 7 0 0 0-7-7z"/><path d="M9 20h6M10 17h4"/></svg></div><div class="lcs-ai-card-title">Киноассистент</div><div class="lcs-ai-card-desc">Подберу фильм под твоё настроение</div>');
        card.on('hover:enter',openAssistant); return card;
    }

function createCard(item) {
        /*
         * Берём именно штатный шаблон карточки Lampa, если он доступен.
         * Это тот же .card, который используется обычными фильмами.
         */
        var card;

        try {
            if (Lampa.Template && typeof Lampa.Template.js === 'function') {
                card = Lampa.Template.js('card');
            }
        } catch (e) {}

        if (!card || !card.length) {
            card = $(
                '<div class="card selector layer--visible layer--render lcs-card">' +
                    '<div class="card__view">' +
                        '<img class="card__img" src="./img/img_load.svg">' +
                    '</div>' +
                    '<div class="card__title"></div>' +
                '</div>'
            );
        }

        card.addClass('lcs-card card--loaded selector');

        var countPill = $('<span class="lcs-count">...</span>');
        card.find('.card__view').append(countPill);

        var img = card.find('.card__img');
        var title = card.find('.card__title');

        // Сначала показываем нейтральный loader, затем заменяем его
        // реальным poster_path из TMDB. Это устраняет битые статические URL.
        img.attr('src', './img/img_load.svg');
        /*
         * Название подборки показываем под постером.
         * Это именно штатный .card__title, поэтому визуально
         * подпись остаётся частью стандартной карточки Lampa.
         */
        title.html(
            '<div class="lcs-category">' +
                '<span class="lcs-icon">' + item.icon + '</span>' +
                '<span class="lcs-name">' + esc(item.title) + '</span>' +
            '</div>' +
            '<div class="lcs-desc">' +
                esc(item.description) +
            '</div>'
        );
        title.css({
            'display': 'block',
            'white-space': 'normal',
            'text-align': 'center',
            'line-height': '1.2'
        });

        card.card_data = {
            title: item.title,
            original_title: item.title,
            poster: item.image,
            source: 'tmdb',
            category: true
        };

        loadCollectionData(item, card, countPill);

        card.on('hover:enter', function () {
            Lampa.Activity.push({
                component: 'category_full',
                source: 'tmdb',
                title: item.title,
                url: item.url,
                page: 1
            });
        });

        return card;
    }

    function CollectionsComponent(object) {
        var self = this;

        /*
         * СКРОЛЛИНГ:
         * Используем ту же схему, что и в штатных Lampa-компонентах:
         * scroll.render() -> layer--wheight -> append в activity HTML.
         * Это важно для корректного вертикального скролла и Navigator.
         */
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });

        var html = $('<div class="lcs-page"></div>');
        var last = false;

        var content = $('<div class="lcs-content"></div>');

        content.append(
            '<div class="lcs-title">Подборки</div>' +
            '<div class="lcs-subtitle">Тематические фильмы</div>'
        );

        var row = $('<div class="lcs-row"></div>');

        row.append(createAssistantCard());

        COLLECTIONS.forEach(function (item) {
            var card = createCard(item);

            card.on('hover:focus', function () {
                last = card;
            });

            row.append(card);
        });

        content.append(row);

        var studioTitle = $('<div class="lcs-section-title">Стриминги и студии</div>');
        var studioSubtitle = $('<div class="lcs-section-subtitle">Netflix, Apple TV+, HBO, Disney+ и другие</div>');
        content.append(studioTitle);
        content.append(studioSubtitle);

        var studioRow = $('<div class="lcs-row"></div>');
        STUDIO_SERVICES.forEach(function (service) {
            var studioCard = createStudioCard(service);
            studioCard.on('hover:focus', function () { last = studioCard; });
            studioRow.append(studioCard);
        });
        content.append(studioRow);

        /*
         * Именно эта часть отвечает за нормальную высоту области
         * прокрутки в Lampa.
         */
        scroll.render()
            .addClass('layer--wheight')
            .data('mheight', html);

        scroll.append(content);
        html.append(scroll.render());

        this.create = function () {
            return html;
        };

        this.render = function () {
            return html;
        };

        this.start = function () {
            /*
             * Защита от старого бага Lampa:
             * компонент должен запускаться только для своей Activity.
             */
            try {
                if (
                    Lampa.Activity.active() &&
                    Lampa.Activity.active().activity &&
                    this.activity &&
                    Lampa.Activity.active().activity !== this.activity
                ) {
                    return;
                }
            } catch (e) {}

            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(
                        last || false,
                        scroll.render()
                    );
                },

                left: function () {
                    if (Navigator.canmove('left')) {
                        Navigator.move('left');
                    } else {
                        Lampa.Controller.toggle('menu');
                    }
                },

                right: function () {
                    if (Navigator.canmove('right')) {
                        Navigator.move('right');
                    }
                },

                up: function () {
                    if (Navigator.canmove('up')) {
                        Navigator.move('up');
                    } else {
                        Lampa.Controller.toggle('head');
                    }
                },

                down: function () {
                    if (Navigator.canmove('down')) {
                        Navigator.move('down');
                    }
                },

                back: function () {
                    Lampa.Activity.backward();
                }
            });

            if (!this.inActivity || this.inActivity()) {
                Lampa.Controller.toggle('content');
            }
        };

        this.pause = function () {};

        this.stop = function () {};

        this.destroy = function () {
            try {
                Lampa.Controller.clear();
            } catch (e) {}

            try {
                scroll.destroy();
            } catch (e) {}

            try {
                html.remove();
            } catch (e) {}
        };
    }

    function addMenu() {
        if ($('#' + MENU_ID).length) return;

        var button = $(
            '<li id="' + MENU_ID + '" class="menu__item selector">' +
                '<div class="menu__ico">' +
                    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8">' +
                        '<rect x="3" y="3" width="7" height="7" rx="1"></rect>' +
                        '<rect x="14" y="3" width="7" height="7" rx="1"></rect>' +
                        '<rect x="3" y="14" width="7" height="7" rx="1"></rect>' +
                        '<rect x="14" y="14" width="7" height="7" rx="1"></rect>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">Подборки</div>' +
            '</li>'
        );

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'Подборки',
                component: COMPONENT,
                page: 1
            });
        });

        $('.menu .menu__list').eq(0).append(button);
    }

    function start() {
        if (started || !window.Lampa) return;
        if (!Lampa.Component || !Lampa.Activity) return;

        started = true;

        addStyle();
        addAISettings();
        addAssistantActivity();

        try {
            Lampa.Component.add(COMPONENT, CollectionsComponent);
            Lampa.Component.add('lampa_studio_view', StudioComponent);
        } catch (e) {
            console.log('[Подборки] Component add error', e);
        }

        if (window.appready) {
            addMenu();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') addMenu();
            });
        }

        console.log('[Lampa Подборки] TMDB image fallback started');
    }

    if (window.Lampa) start();
    else setTimeout(start, 1500);
})();
