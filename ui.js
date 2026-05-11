// ==UserScript==
// @name         Lampa Soft Poster Glow
// @namespace    lampa.poster.softglow
// @version      4.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.lampa_soft_poster_glow) return;
    window.lampa_soft_poster_glow = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* =========================
       ANIMATION
    ========================= */

    @keyframes posterGlow {

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
       IMAGE ONLY
    ========================= */

    .card__img {

        position: relative !important;

        border-radius: 1.4em !important;

        overflow: visible !important;

        z-index: 2;
    }

    .card__img::before {

        content: '';

        position: absolute;

        inset: -2px;

        border-radius: 1.5em;

        pointer-events: none;

        z-index: -1;

        background: linear-gradient(
            135deg,
            rgba(94,162,255,.9),
            rgba(123,104,255,.8),
            rgba(176,108,255,.75),
            rgba(123,104,255,.8),
            rgba(94,162,255,.9)
        );

        background-size: 250% 250%;

        animation: posterGlow 8s ease infinite;

        filter: blur(10px);

        opacity: .45;
    }

    `;

    document.head.appendChild(style);

})();
