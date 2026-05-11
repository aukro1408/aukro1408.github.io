// ==UserScript==
// @name         Lampa Soft Neon Poster
// @namespace    lampa.poster.softglow
// @version      3.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.soft_neon_poster) return;
    window.soft_neon_poster = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* =========================
       POSTER
    ========================= */

    .card__view {

        position: relative !important;

        overflow: visible !important;
    }

    .card__img {

        position: relative !important;

        overflow: visible !important;

        border-radius: 1.3em !important;
    }

    .card__img img,
    .card__img picture {

        border-radius: 1.3em !important;

        position: relative;

        z-index: 2;
    }

    /* =========================
       SOFT GLOW
    ========================= */

    .card__img::before {

        content: '';

        position: absolute;

        inset: -2px;

        border-radius: 1.4em;

        z-index: 1;

        pointer-events: none;

        border: 1.5px solid rgba(120,140,255,0.9);

        box-shadow:

            0 0 6px rgba(80,120,255,0.55),

            0 0 12px rgba(120,80,255,0.35),

            0 0 22px rgba(120,80,255,0.18);

        animation: softPulse 4s ease-in-out infinite;
    }

    /* =========================
       ANIMATION
    ========================= */

    @keyframes softPulse {

        0% {

            box-shadow:

                0 0 4px rgba(80,120,255,0.45),

                0 0 10px rgba(120,80,255,0.25),

                0 0 18px rgba(120,80,255,0.12);
        }

        50% {

            box-shadow:

                0 0 8px rgba(80,120,255,0.75),

                0 0 16px rgba(120,80,255,0.45),

                0 0 28px rgba(120,80,255,0.25);
        }

        100% {

            box-shadow:

                0 0 4px rgba(80,120,255,0.45),

                0 0 10px rgba(120,80,255,0.25),

                0 0 18px rgba(120,80,255,0.12);
        }
    }

    `;

    document.head.appendChild(style);

})();
