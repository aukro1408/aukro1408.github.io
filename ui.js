// ==UserScript==
// @name         Lampa Mobile RGB Card Glow
// @namespace    lampa.mobile.rgb.glow
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    if (window.lampa_mobile_rgb_glow) return;
    window.lampa_mobile_rgb_glow = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* =========================
       RGB ANIMATION
    ========================= */

    @keyframes lampaRgbFlow {

        0% {
            filter: hue-rotate(0deg);
        }

        100% {
            filter: hue-rotate(360deg);
        }
    }

    /* =========================
       CARD BASE
    ========================= */

    .card {

        position: relative !important;

        overflow: visible !important;

        border-radius: 1.4em !important;

        transition:
            transform .18s ease,
            box-shadow .18s ease;
    }

    .card .card__view,
    .card .card__img {

        border-radius: 1.4em !important;

        overflow: hidden !important;
    }

    /* =========================
       MOBILE RGB GLOW
    ========================= */

    .card:hover,
    .card:active {

        transform: scale(1.04);

        z-index: 99;
    }

    .card:hover::before,
    .card:active::before {

        content: '';

        position: absolute;

        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;

        border-radius: 1.6em;

        background: linear-gradient(
            45deg,
            #ff0000,
            #ff8800,
            #ffee00,
            #00ff66,
            #00ffff,
            #0066ff,
            #aa00ff,
            #ff00aa,
            #ff0000
        );

        background-size: 400%;

        z-index: -1;

        opacity: 1;

        filter: blur(12px);

        animation:
            lampaRgbFlow 5s linear infinite;

        pointer-events: none;
    }

    /* =========================
       OUTER CINEMATIC GLOW
    ========================= */

    .card:hover::after,
    .card:active::after {

        content: '';

        position: absolute;

        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;

        border-radius: 2em;

        background: rgba(255,255,255,0.08);

        filter: blur(28px);

        z-index: -2;

        pointer-events: none;
    }

    `;

    document.head.appendChild(style);

    console.log('✔ Lampa Mobile RGB Glow loaded');

})();
