// ==UserScript==
// @name         Lampa RGB Glow Focus
// @namespace    lampa.rgb.glow.focus
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    if (window.rgb_glow_focus_plugin) return;
    window.rgb_glow_focus_plugin = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* ===== RGB GLOW ANIMATION ===== */

    @keyframes rgbBorderFlow {
        0% {
            filter: hue-rotate(0deg);
        }

        100% {
            filter: hue-rotate(360deg);
        }
    }

    /* ===== FOCUSED CARD ===== */

    .card.focus,
    .card--focus,
    .selector.focus {
        position: relative;
        z-index: 2;
        overflow: visible;

        border-radius: 1.4em;

        transform: scale(1.03);

        transition:
            transform .18s ease,
            box-shadow .18s ease;

        box-shadow:
            0 0 20px rgba(255,255,255,0.08),
            0 0 40px rgba(255,255,255,0.06);
    }

    /* ===== RGB OUTLINE ===== */

    .card.focus::before,
    .card--focus::before,
    .selector.focus::before {
        content: '';

        position: absolute;

        inset: -3px;

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

        opacity: 0.95;

        filter: blur(10px);

        animation: rgbBorderFlow 5s linear infinite;

        pointer-events: none;
    }

    /* ===== EXTRA SOFT GLOW ===== */

    .card.focus::after,
    .card--focus::after,
    .selector.focus::after {
        content: '';

        position: absolute;

        inset: -10px;

        border-radius: 2em;

        background: rgba(255,255,255,0.08);

        filter: blur(25px);

        z-index: -2;

        opacity: 0.7;

        pointer-events: none;
    }

    `;

    document.head.appendChild(style);

    console.log('✔ RGB Glow Focus loaded');

})();
