// ==UserScript==
// @name         Lampa Cinematic Dynamic Backdrop
// @namespace    lampa.cinematic.backdrop
// @version      1.0
// @match        *://*/lampa/*
// ==/UserScript==

(function () {
    'use strict';

    if (window.cinematic_backdrop_plugin) return;
    window.cinematic_backdrop_plugin = true;

    const style = document.createElement('style');
    style.innerHTML = `

    /* ===== BACKDROP LAYER ===== */

    .cinematic-bg {
        position: fixed;
        inset: 0;
        z-index: -3;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        transform: scale(1.08);
        opacity: 0;
        transition:
            opacity 0.8s ease,
            background-image 0.5s ease,
            transform 12s ease;
        filter: blur(16px);
        will-change: transform, opacity;
        pointer-events: none;
    }

    .cinematic-bg.visible {
        opacity: 1;
        transform: scale(1.14);
    }

    /* ===== DARK OVERLAY ===== */

    .cinematic-overlay {
        position: fixed;
        inset: 0;
        z-index: -2;
        background:
            radial-gradient(circle at center,
                rgba(0,0,0,0.15) 0%,
                rgba(0,0,0,0.55) 55%,
                rgba(0,0,0,0.88) 100%);
        pointer-events: none;
    }

    /* ===== CINEMATIC VIGNETTE ===== */

    .cinematic-vignette {
        position: fixed;
        inset: 0;
        z-index: -1;
        box-shadow: inset 0 0 220px rgba(0,0,0,0.8);
        pointer-events: none;
    }

    /* ===== CARD GLOW ===== */

    .card.focus,
    .card--focus,
    .selector.focus {
        transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;

        box-shadow:
            0 0 20px rgba(255,255,255,0.10),
            0 0 40px rgba(255,255,255,0.08),
            0 0 80px rgba(255,255,255,0.06);

        transform: scale(1.03);

        border-radius: 1.2em;
    }

    /* ===== PARALLAX FEEL ===== */

    .activity,
    .layer,
    .full-start,
    .category-full {
        transform: translateZ(0);
        backface-visibility: hidden;
    }

    /* ===== SMOOTHER UI ===== */

    .card,
    .selector,
    .menu__item {
        transition:
            transform .18s ease,
            opacity .18s ease,
            box-shadow .18s ease;
    }

    `;

    document.head.appendChild(style);

    const bg = document.createElement('div');
    bg.className = 'cinematic-bg';

    const overlay = document.createElement('div');
    overlay.className = 'cinematic-overlay';

    const vignette = document.createElement('div');
    vignette.className = 'cinematic-vignette';

    document.body.appendChild(bg);
    document.body.appendChild(overlay);
    document.body.appendChild(vignette);

    let lastImage = '';

    function getImage(card) {
        if (!card) return null;

        return (
            card.background_image ||
            card.backdrop_path ||
            card.poster_path ||
            null
        );
    }

    function normalizeImage(img) {
        if (!img) return null;

        if (img.startsWith('http')) return img;

        return 'https://image.tmdb.org/t/p/original' + img;
    }

    function setBackground(image) {
        if (!image || image === lastImage) return;

        lastImage = image;

        bg.style.opacity = '0';

        setTimeout(() => {
            bg.style.backgroundImage = `url(${image})`;
            bg.classList.add('visible');
        }, 180);
    }

    function handleCard(cardData) {
        const img = normalizeImage(getImage(cardData));

        if (img) setBackground(img);
    }

    /* ===== CATEGORY / LISTENERS ===== */

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const card = e.object.card;
            if (card) handleCard(card);
        }
    });

    Lampa.Listener.follow('card', function (e) {
        if (e.type === 'hover') {
            if (e.data) handleCard(e.data);
        }
    });

    /* ===== FALLBACK DOM WATCHER ===== */

    let observer;

    function observeFocus() {

        if (observer) observer.disconnect();

        observer = new MutationObserver(function () {

            const focused = document.querySelector('.card.focus, .card--focus');

            if (!focused) return;

            const img = focused.querySelector('img');

            if (!img) return;

            const src = img.getAttribute('src');

            if (src && src !== lastImage) {
                setBackground(src);
            }
        });

        observer.observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }

    observeFocus();

    console.log('✔ Cinematic Dynamic Backdrop loaded');

})();
