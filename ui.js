// ==UserScript==
// @name         Lampa Neon Poster Flow
// @namespace    lampa.neon.poster
// @version      3.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.poster_flow_loaded) return;
    window.poster_flow_loaded = true;

    const style = document.createElement('style');

    style.innerHTML = `

    @keyframes neonRotate {

        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    /* =========================
       POSTER ONLY
    ========================= */

    .card__img {

        position: relative !important;

        overflow: hidden !important;

        border-radius: 1.4em !important;

        isolation: isolate;
    }

    /* =========================
       ROTATING BORDER
    ========================= */

    .card__img::before {

        content: '';

        position: absolute;

        width: 220%;
        height: 220%;

        top: -60%;
        left: -60%;

        background: conic-gradient(
            from 0deg,
            #2563eb,
            #4f46e5,
            #7c3aed,
            #9333ea,
            #4f46e5,
            #2563eb
        );

        animation: neonRotate 4s linear infinite;

        z-index: 0;
    }

    /* =========================
       MASK
    ========================= */

    .card__img::after {

        content: '';

        position: absolute;

        inset: 2px;

        border-radius: 1.2em;

        background-size: cover;

        background: transparent;

        box-shadow:
            inset 0 0 0 3px #111;

        z-index: 1;
    }

    /* =========================
       KEEP IMAGE ABOVE
    ========================= */

    .card__img img {

        position: relative;

        z-index: 2;

        border-radius: 1.2em;
    }

    `;

    document.head.appendChild(style);

})();
