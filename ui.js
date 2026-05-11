// ==UserScript==
// @name         Lampa RGB Glow ALL Cards
// @namespace    lampa.rgb.allcards
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    if (window.rgb_all_cards_loaded) return;
    window.rgb_all_cards_loaded = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* =========================
       RGB FLOW
    ========================= */

    @keyframes rgbFlow {

        0% {
            filter: hue-rotate(0deg);
        }

        100% {
            filter: hue-rotate(360deg);
        }
    }

    /* =========================
       ALL CARDS
    ========================= */

    .card {

        position: relative !important;

        overflow: visible !important;

        border-radius: 1.4em !important;

        z-index: 1;
    }

    .card .card__view,
    .card .card__img {

        border-radius: 1.4em !important;

        overflow: hidden !important;
    }

    /* =========================
       RGB BORDER
    ========================= */

    .card::before {

        content: '';

        position: absolute;

        top: -3px;
        left: -3px;
        right: -3px;
        bottom: -3px;

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

        opacity: .9;

        filter: blur(10px);

        animation:
            rgbFlow 6s linear infinite;

        pointer-events: none;
    }

    /* =========================
       SOFT GLOW
    ========================= */

    .card::after {

        content: '';

        position: absolute;

        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;

        border-radius: 2em;

        background: rgba(255,255,255,0.05);

        filter: blur(20px);

        z-index: -2;

        pointer-events: none;
    }

    /* =========================
       SMALL HOVER BOOST
    ========================= */

    .card:hover {

        transform: scale(1.03);

        transition: .15s ease;

        z-index: 5;
    }

    `;

    document.head.appendChild(style);

    console.log('✔ RGB Glow All Cards loaded');

})();
