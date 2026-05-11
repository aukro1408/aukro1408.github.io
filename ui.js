// ==UserScript==
// @name         Lampa Neon Flow Border
// @namespace    lampa.neon.flow
// @version      2.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.neon_flow_loaded) return;
    window.neon_flow_loaded = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* =========================
       ROTATING BORDER
    ========================= */

    @keyframes borderRotate {

        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    /* =========================
       POSTER CONTAINER
    ========================= */

    .card__view {

        position: relative !important;

        overflow: hidden !important;

        border-radius: 1.4em !important;

        isolation: isolate;
    }

    .card__img {

        border-radius: 1.4em !important;

        overflow: hidden !important;

        position: relative;

        z-index: 2;
    }

    /* =========================
       ROTATING NEON
    ========================= */

    .card__view::before {

        content: '';

        position: absolute;

        width: 220%;
        height: 220%;

        top: -60%;
        left: -60%;

        background: conic-gradient(
            from 0deg,
            #3b82f6,
            #6366f1,
            #8b5cf6,
            #a855f7,
            #6366f1,
            #3b82f6
        );

        animation: borderRotate 4s linear infinite;

        z-index: 0;
    }

    /* =========================
       INNER MASK
    ========================= */

    .card__view::after {

        content: '';

        position: absolute;

        inset: 3px;

        border-radius: 1.2em;

        background: #111;

        z-index: 1;
    }

    /* =========================
       EXTRA GLOW
    ========================= */

    .card__view {

        box-shadow:
            0 0 8px rgba(99,102,241,.35),
            0 0 18px rgba(168,85,247,.25);
    }

    `;

    document.head.appendChild(style);

})();
