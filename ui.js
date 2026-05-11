// ==UserScript==
// @name         Lampa Thin RGB Border
// @namespace    lampa.thin.rgb
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    if (window.lampa_thin_rgb) return;
    window.lampa_thin_rgb = true;

    const style = document.createElement('style');

    style.innerHTML = `

    @keyframes rgbBorder {
        0% {
            filter: hue-rotate(0deg);
        }

        100% {
            filter: hue-rotate(360deg);
        }
    }

    .card {

        position: relative !important;

        overflow: visible !important;

        border-radius: 1.4em !important;
    }

    .card .card__view,
    .card .card__img {

        border-radius: 1.4em !important;

        overflow: hidden !important;
    }

    /* ===== THIN RGB BORDER ===== */

    .card::before {

        content: '';

        position: absolute;

        inset: -2px;

        border-radius: 1.5em;

        background: linear-gradient(
            45deg,
            #ff0000,
            #ff9900,
            #ffee00,
            #00ff66,
            #00ffff,
            #0066ff,
            #aa00ff,
            #ff00aa,
            #ff0000
        );

        background-size: 300%;

        z-index: -1;

        animation: rgbBorder 5s linear infinite;

        opacity: .9;
    }

    /* ВНУТРЕННЯЯ МАСКА */

    .card::after {

        content: '';

        position: absolute;

        inset: 2px;

        border-radius: 1.3em;

        background: #141414;

        z-index: -1;
    }

    `;

    document.head.appendChild(style);

})();
