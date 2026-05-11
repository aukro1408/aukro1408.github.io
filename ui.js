// ==UserScript==
// @name         Lampa Neon Ring Border
// @namespace    lampa.neon.ring
// @version      2.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.poster_rgb_border) return;
    window.poster_rgb_border = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* =========================
       NEON ROTATION
    ========================= */

    @keyframes neonRotate {

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

        border-radius: 1.5em !important;

        isolation: isolate;
    }

    .card__img {

        border-radius: 1.5em !important;

        overflow: hidden !important;

        position: relative;

        z-index: 5;
    }

    /* =========================
       OUTER NEON RING
    ========================= */

    .card__view::before {

        content: '';

        position: absolute;

        width: 250%;
        height: 250%;

        top: -75%;
        left: -75%;

        background: conic-gradient(
            from 0deg,
            transparent 0deg,
            #00aeff 40deg,
            #7b2fff 90deg,
            #ff4fd8 140deg,
            transparent 190deg,
            transparent 360deg
        );

        animation: neonRotate 4s linear infinite;

        filter: blur(8px);

        opacity: .95;

        z-index: 0;
    }

    /* =========================
       INNER DARK MASK
    ========================= */

    .card__view::after {

        content: '';

        position: absolute;

        inset: 3px;

        border-radius: 1.3em;

        background: #111;

        z-index: 1;
    }

    /* =========================
       KEEP IMAGE ABOVE
    ========================= */

    .card__img img,
    .card__img picture,
    .card__img div {

        position: relative;

        z-index: 5;

        border-radius: 1.3em;
    }

    /* =========================
       EXTRA CYBER GLOW
    ========================= */

    .card__view {

        box-shadow:
            0 0 10px rgba(0,174,255,.25),
            0 0 20px rgba(123,47,255,.18),
            0 0 30px rgba(255,79,216,.12);
    }

    `;

    document.head.appendChild(style);

})();
