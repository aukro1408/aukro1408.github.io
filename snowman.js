// ==UserScript==
// @name         Lampa Falling Grinch Fixed
// @namespace    lampa.grinchfall
// @version      1.1
// @description  Падающие Гринчи поверх каталога Lampa (исправлено)
// @match        *://*/lampa/*
// ==/UserScript==

(function() {
    'use strict';

    const grinchUrl = 'https://aukro1408.github.io/ebd8d475d8b9f7af6c42722ff10bf8.webp';
    const numberOfGrinches = 15; // сколько одновременно падает
    const grinches = [];

    function createGrinch() {
        const grinch = document.createElement('img');
        grinch.src = grinchUrl;
        grinch.style.position = 'fixed';
        grinch.style.width = `${Math.random() * 50 + 30}px`;
        grinch.style.height = 'auto';
        grinch.style.left = `${Math.random() * window.innerWidth}px`;
        grinch.style.top = `-${Math.random() * 100}px`;
        grinch.dataset.speed = (Math.random() * 2 + 1).toString(); // скорость
        grinch.style.zIndex = '9999';
        grinch.style.pointerEvents = 'none';
        document.body.appendChild(grinch);
        return grinch;
    }

    for (let i = 0; i < numberOfGrinches; i++) {
        grinches.push(createGrinch());
    }

    function animateGrinches() {
        grinches.forEach(grinch => {
            let top = parseFloat(grinch.style.top) || 0; // на случай NaN
            top += parseFloat(grinch.dataset.speed);
            if (top > window.innerHeight) {
                top = -50; 
                grinch.style.left = `${Math.random() * window.innerWidth}px`;
            }
            grinch.style.top = `${top}px`;
        });
        requestAnimationFrame(animateGrinches);
    }

    // Подождать пока весь контент загрузится
    window.addEventListener('load', () => {
        requestAnimationFrame(animateGrinches);
    });

})();
