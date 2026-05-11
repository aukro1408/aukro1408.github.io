// ==UserScript==
// @name         Lampa Soft Neon Glow
// @namespace    lampa.poster.glow
// @version      2.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.poster_rgb_border) return;
    window.poster_rgb_border = true;

    const style = document.createElement('style');

    style.innerHTML = `

    @keyframes posterGlow {

        0% {
            background-position: 0% 50%;
        }

        100% {
            background-position: 300% 50%;
        }
    }

    /* =========================
       CARD
    ========================= */

    .card__view {

        position: relative !important;

        overflow: visible !important;

        border-radius: 1.4em !important;
    }

    .card__img {

        position: relative !important;

        overflow: hidden !important;

        border-radius: 1.4em !important;

        z-index: 2;
    }

    /* =========================
       SOFT GLOW BEHIND POSTER
    ========================= */

    .card__img::before {

        content: '';

        position: absolute;

        inset: -10px;

        border-radius: 1.8em;

        background: linear-gradient(
            135deg,
            #00bfff,
            #6a5cff,
            #b14cff,
            #00bfff
        );

        background-size: 300% 300%;

        animation: posterGlow 6s linear infinite;

        filter: blur(18px);

        opacity: .75;

        z-index: -1;

        transform: scale(0.96);
    }

    /* =========================
       THIN BORDER
    ========================= */

    .card__img::after {

        content: '';

        position: absolute;

        inset: 0;

        border-radius: 1.4em;

        border: 2px solid rgba(120,140,255,.9);

        box-shadow:
            0 0 8px rgba(0,191,255,.35),
            0 0 14px rgba(138,92,255,.25);

        z-index: 3;

        pointer-events: none;
    }

    /* =========================
       IMAGE
    ========================= */

    .card__img img,
    .card__img picture {

        position: relative;

        z-index: 2;

        border-radius: 1.4em;
    }

    `;

    document.head.appendChild(style);

})();
