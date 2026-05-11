// ==UserScript==
// @name         Lampa Soft Neon Border FIXED
// @namespace    lampa.poster.fixed
// @version      4.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.soft_neon_fixed) return;
    window.soft_neon_fixed = true;

    const style = document.createElement('style');

    style.innerHTML = `

    .card__img {

        position: relative !important;

        border-radius: 1.3em !important;

        overflow: hidden !important;
    }

    .card__img img,
    .card__img picture {

        border-radius: 1.3em !important;

        position: relative;

        z-index: 2;
    }

    .card__img::before {

        content: '';

        position: absolute;

        inset: 0;

        border-radius: 1.3em;

        z-index: 3;

        pointer-events: none;

        border: 1.5px solid rgba(120,140,255,0.9);

        animation: neonMove 6s linear infinite;

        box-sizing: border-box;

        filter:

            drop-shadow(0 0 3px rgba(80,120,255,0.8))
            drop-shadow(0 0 8px rgba(120,80,255,0.45))
            drop-shadow(0 0 14px rgba(120,80,255,0.25));
    }

    @keyframes neonMove {

        0% {

            border-color: #6ea8ff;
        }

        50% {

            border-color: #b06cff;
        }

        100% {

            border-color: #6ea8ff;
        }
    }

    `;

    document.head.appendChild(style);

})();
