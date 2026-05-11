// ==UserScript==
// @name         Lampa Poster RGB Border
// @namespace    lampa.poster.rgb
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.poster_rgb_border) return;
    window.poster_rgb_border = true;

    const style = document.createElement('style');

    style.innerHTML = `

    @keyframes posterRGB {

        0% {
            filter: hue-rotate(0deg);
        }

        100% {
            filter: hue-rotate(360deg);
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
       RGB BORDER ONLY IMAGE
    ========================= */

    .card__view::before {

        content: '';

        position: absolute;

        inset: -2px;

        border-radius: 1.5em;

        background: linear-gradient(
            45deg,
            #ff0000,
            #ff9900,
            #ffee00,
            #00ff66,
            #00ffff,
            #0066ff,
            #aa00ff,
            #ff00aa,
            #ff0000
        );

        background-size: 300%;

        animation: posterRGB 5s linear infinite;

        z-index: -1;

        opacity: .95;
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
