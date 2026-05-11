// ==UserScript==
// @name         Lampa Neon Poster Border
// @namespace    lampa.poster.neon
// @version      2.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.poster_rgb_border) return;
    window.poster_rgb_border = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* =========================
       ANIMATION
    ========================= */

    @keyframes posterRGB {

        0% {
            background-position: 0% 50%;
        }

        100% {
            background-position: 300% 50%;
        }
    }

    /* =========================
       ONLY POSTER
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
       NEON BORDER
    ========================= */

    .card__view::before {

        content: '';

        position: absolute;

        inset: -2px;

        border-radius: 1.5em;

        background: linear-gradient(
            45deg,
            #5ea2ff,
            #7b68ff,
            #b06cff,
            #7b68ff,
            #5ea2ff
        );

        background-size: 300% 300%;

        animation: posterRGB 6s linear infinite;

        z-index: -1;

        opacity: .95;

        /* МЯГКОЕ СВЕЧЕНИЕ */

        box-shadow:
            0 0 6px rgba(94,162,255,.55),
            0 0 12px rgba(123,104,255,.35),
            0 0 22px rgba(176,108,255,.18);
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
