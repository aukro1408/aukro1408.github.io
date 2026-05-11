// ==UserScript==
// @name         Lampa Full Card RGB Glow
// @namespace    lampa.full.rgb.glow
// @version      2.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    if (window.full_card_rgb_glow) return;
    window.full_card_rgb_glow = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* =========================
       RGB FLOW ANIMATION
    ========================= */

    @keyframes rgbBorderFlow {

        0% {
            filter: hue-rotate(0deg) blur(12px);
        }

        100% {
            filter: hue-rotate(360deg) blur(12px);
        }
    }

    /* =========================
       FULL CARD FOCUS
    ========================= */

    .card.card--focus,
    .card.focus {

        position: relative !important;

        overflow: visible !important;

        border-radius: 1.4em;

        transform: scale(1.03);

        z-index: 10;

        transition:
            transform .18s ease,
            box-shadow .18s ease;
    }

    /* FIX INNER BLOCKS */

    .card.card--focus .card__view,
    .card.focus .card__view,

    .card.card--focus .card__img,
    .card.focus .card__img {

        overflow: visible !important;

        border-radius: 1.4em;
    }

    /* =========================
       RGB BORDER
    ========================= */

    .card.card--focus::before,
    .card.focus::before {

        content: '';

        position: absolute;

        inset: -4px;

        border-radius: 1.6em;

        background: linear-gradient(
            45deg,
            #ff0000,
            #ff7300,
            #fffb00,
            #48ff00,
            #00ffd5,
            #002bff,
            #7a00ff,
            #ff00c8,
            #ff0000
        );

        background-size: 400%;

        z-index: -1;

        opacity: .95;

        animation: rgbBorderFlow 6s linear infinite;

        pointer-events: none;
    }

    /* =========================
       OUTER SOFT GLOW
    ========================= */

    .card.card--focus::after,
    .card.focus::after {

        content: '';

        position: absolute;

        inset: -10px;

        border-radius: 2em;

        background: rgba(255,255,255,0.08);

        filter: blur(30px);

        z-index: -2;

        pointer-events: none;
    }

    /* =========================
       EXTRA CINEMATIC SHADOW
    ========================= */

    .card.card--focus,
    .card.focus {

        box-shadow:
            0 0 20px rgba(255,255,255,0.10),
            0 0 40px rgba(255,255,255,0.08),
            0 0 80px rgba(255,255,255,0.06);
    }

    `;

    document.head.appendChild(style);

    console.log('✔ Full Card RGB Glow loaded');

})();
