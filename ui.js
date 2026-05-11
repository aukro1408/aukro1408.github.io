// ==UserScript==
// @name         Lampa Blue Purple Neon Border
// @namespace    lampa.bluepurple.neon
// @version      2.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {

    'use strict';

    if (window.blue_purple_neon_loaded) return;
    window.blue_purple_neon_loaded = true;

    const style = document.createElement('style');

    style.innerHTML = `

    /* ===================================
       SMOOTH NEON FLOW
    =================================== */

    @keyframes neonFlow {

        0% {
            background-position: 0% 50%;
            filter: brightness(1);
        }

        50% {
            background-position: 100% 50%;
            filter: brightness(1.25);
        }

        100% {
            background-position: 0% 50%;
            filter: brightness(1);
        }
    }

    /* ===================================
       POSTER ONLY
    =================================== */

    .card__view {

        position: relative !important;

        overflow: visible !important;

        border-radius: 1.4em !important;
    }

    .card__img {

        border-radius: 1.4em !important;

        overflow: hidden !important;
    }

    /* ===================================
       BLUE / PURPLE BORDER
    =================================== */

    .card__view::before {

        content: '';

        position: absolute;

        inset: -2px;

        border-radius: 1.5em;

        background: linear-gradient(
            135deg,
            #00c3ff,
            #3b82ff,
            #7a5cff,
            #b026ff,
            #7a5cff,
            #3b82ff,
            #00c3ff
        );

        background-size: 300% 300%;

        animation: neonFlow 6s ease infinite;

        z-index: -1;

        opacity: .95;

        box-shadow:
            0 0 8px rgba(0,195,255,0.45),
            0 0 18px rgba(122,92,255,0.35),
            0 0 28px rgba(176,38,255,0.25);
    }

    /* ===================================
       INNER DARK MASK
    =================================== */

    .card__view::after {

        content: '';

        position: absolute;

        inset: 2px;

        border-radius: 1.3em;

        background: #101014;

        z-index: -1;
    }

    /* ===================================
       HOVER BOOST
    =================================== */

    .card:hover .card__view {

        transform: scale(1.02);

        transition:
            transform .18s ease,
            filter .18s ease;

        filter: brightness(1.08);
    }

    `;

    document.head.appendChild(style);

    console.log('✔ Blue Purple Neon Border Loaded');

})();
