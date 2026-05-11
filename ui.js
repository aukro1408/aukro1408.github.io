// ==UserScript==
// @name         Lampa Neon Poster Ring
// @namespace    lampa.poster.ring
// @version      3.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.poster_neon_ring) return;
    window.poster_neon_ring = true;

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
       ROTATING NEON
    ========================= */

    .card__img::before {

        content: '';

        position: absolute;

        width: 240%;
        height: 240%;

        top: -70%;
        left: -70%;

        background: conic-gradient(
            from 0deg,
            transparent,
            #00bfff,
            #7b2fff,
            #ff4fd8,
            transparent
        );

        animation: neonRotate 4s linear infinite;

        filter: blur(10px);

        opacity: .9;

        z-index: 0;
    }

    /* =========================
       INNER MASK
    ========================= */

    .card__img::after {

        content: '';

        position: absolute;

        inset: 3px;

        border-radius: 1.2em;

        background: transparent;

        box-shadow:
            inset 0 0 0 3px #111;

        z-index: 1;
    }

    /* =========================
       KEEP IMAGE ABOVE
    ========================= */

    .card__img img,
    .card__img picture {

        position: relative;

        z-index: 5;

        border-radius: 1.2em;
    }

    `;

    document.head.appendChild(style);

})();
