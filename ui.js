// ==UserScript==
// @name         Lampa Soft Neon Border
// @namespace    lampa.poster.soft
// @version      5.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.lampa_soft_neon) return;
    window.lampa_soft_neon = true;

    const style = document.createElement('style');

    style.innerHTML = `

    @keyframes posterRGB {

        0% {
            background-position: 0% 50%;
        }

        50% {
            background-position: 100% 50%;
        }

        100% {
            background-position: 0% 50%;
        }
    }

    /* =========================
       POSTER ONLY
    ========================= */

    .card__view {

        position: relative !important;

        overflow: visible !important;

        border-radius: 1.4em !important;
    }

    .card__img {

        border-radius: 1.4em !important;

        overflow: hidden !important;
    }

    /* =========================
       BORDER + SOFT GLOW
    ========================= */

    .card__view::before {

        content: '';

        position: absolute;

        inset: -1px;

        border-radius: 1.5em;

        background: linear-gradient(
            135deg,
            #5ea2ff,
            #7b68ff,
            #b06cff,
            #7b68ff,
            #5ea2ff
        );

        background-size: 250% 250%;

        animation: posterRGB 8s ease infinite;

        z-index: -1;

        opacity: .9;

        /* ВОТ ЭТО ДАЁТ МЯГКИЙ СВЕТ */

        box-shadow:
            0 0 8px rgba(94,162,255,.25),
            0 0 16px rgba(123,104,255,.18),
            0 0 28px rgba(176,108,255,.12);
    }

    /* =========================
       INNER MASK
    ========================= */

    .card__view::after {

        content: '';

        position: absolute;

        inset: 2px;

        border-radius: 1.3em;

        background: #141414;

        z-index: -1;
    }

    `;

    document.head.appendChild(style);

})();
