// ==UserScript==
// @name         Lampa Soft Ambient Glow
// @namespace    lampa.poster.glow
// @version      3.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.lampa_soft_glow) return;
    window.lampa_soft_glow = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* =========================
       ANIMATION
    ========================= */

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
       CARD
    ========================= */

    .card__view {

        position: relative !important;

        overflow: visible !important;

        border-radius: 1.4em !important;
    }

    .card__img {

        border-radius: 1.4em !important;

        overflow: hidden !important;

        position: relative;

        z-index: 2;
    }

    /* =========================
       SOFT AMBIENT GLOW
    ========================= */

    .card__view::before {

        content: '';

        position: absolute;

        inset: -3px;

        border-radius: 1.6em;

        z-index: -1;

        pointer-events: none;

        background:
            linear-gradient(
                135deg,
                rgba(94,162,255,.85),
                rgba(123,104,255,.75),
                rgba(176,108,255,.7),
                rgba(123,104,255,.75),
                rgba(94,162,255,.85)
            );

        background-size: 250% 250%;

        animation: posterRGB 8s ease infinite;

        filter: blur(8px);

        opacity: .55;
    }

    `;

    document.head.appendChild(style);

})();
