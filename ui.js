// ==UserScript==
// @name         Lampa Neon Poster Clean
// @namespace    lampa.poster.clean
// @version      6.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.lampa_neon_clean) return;
    window.lampa_neon_clean = true;

    const style = document.createElement('style');

    style.innerHTML = `

    .card__img {

        position: relative !important;

        border-radius: 1.4em !important;

        overflow: visible !important;
    }

    .card__img::before {

        content: '';

        position: absolute;

        inset: -2px;

        border-radius: 1.5em;

        border: 2px solid #6ea8ff;

        pointer-events: none;

        z-index: 2;

        box-sizing: border-box;

        animation: neonPulse 4s ease-in-out infinite;

        filter:
            drop-shadow(0 0 4px rgba(90,140,255,.9))
            drop-shadow(0 0 10px rgba(120,90,255,.55))
            drop-shadow(0 0 18px rgba(120,90,255,.25));
    }

    @keyframes neonPulse {

        0% {

            border-color: #5ea2ff;

            filter:
                drop-shadow(0 0 4px rgba(94,162,255,.9))
                drop-shadow(0 0 12px rgba(94,162,255,.5));
        }

        50% {

            border-color: #b06cff;

            filter:
                drop-shadow(0 0 4px rgba(176,108,255,.9))
                drop-shadow(0 0 12px rgba(176,108,255,.55));
        }

        100% {

            border-color: #5ea2ff;

            filter:
                drop-shadow(0 0 4px rgba(94,162,255,.9))
                drop-shadow(0 0 12px rgba(94,162,255,.5));
        }
    }

    `;

    document.head.appendChild(style);

})();
