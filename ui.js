// ==UserScript==
// @name         Lampa Neon Poster Final
// @namespace    lampa.poster.neon
// @version      5.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.lampa_neon_final) return;
    window.lampa_neon_final = true;

    const style = document.createElement('style');

    style.innerHTML = `

    .card__view {

        position: relative !important;

        border-radius: 1.4em !important;

        overflow: visible !important;
    }

    .card__img {

        border-radius: 1.4em !important;

        overflow: hidden !important;

        position: relative;

        z-index: 2;
    }

    .card__view::before {

        content: '';

        position: absolute;

        inset: -2px;

        border-radius: 1.5em;

        z-index: 1;

        pointer-events: none;

        border: 2px solid #7a8cff;

        animation: neonBorder 5s linear infinite;

        box-sizing: border-box;

        filter:
            drop-shadow(0 0 4px rgba(90,120,255,.9))
            drop-shadow(0 0 10px rgba(140,90,255,.55))
            drop-shadow(0 0 18px rgba(140,90,255,.3));
    }

    @keyframes neonBorder {

        0% {

            border-color: #5ea2ff;

            filter:
                drop-shadow(0 0 4px rgba(94,162,255,.9))
                drop-shadow(0 0 10px rgba(94,162,255,.5));
        }

        50% {

            border-color: #b06cff;

            filter:
                drop-shadow(0 0 4px rgba(176,108,255,.9))
                drop-shadow(0 0 10px rgba(176,108,255,.5));
        }

        100% {

            border-color: #5ea2ff;

            filter:
                drop-shadow(0 0 4px rgba(94,162,255,.9))
                drop-shadow(0 0 10px rgba(94,162,255,.5));
        }
    }

    `;

    document.head.appendChild(style);

})();
