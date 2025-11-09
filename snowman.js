// ==UserScript==
// @name         Lampa Falling Grinch
// @namespace    lampa.grinchfall
// @version      1.0
// @description  Падающие Гринчи поверх каталога Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function() {
    'use strict';

    const grinchUrl = 'https://aukro1408.github.io/ebd8d475d8b9f7af6c42722ff10bf8.webp';
    const numberOfGrinches = 15; // сколько одновременно падает

    function createGrinch() {
        const grinch = document.createElement('img');
        grinch.src = grinchUrl;
        grinch.style.position = 'fixed';
        grinch.style.width = `${Math.random() * 50 + 30}px`; // случайный размер
        grinch.style.height = 'auto';
        grinch.style.left = `${Math.random() * window.innerWidth}px`;
        grinch.style.top = `-${Math.random() * 100}px`;
        grinch.style.zIndex = '9999';
        grinch.style.pointerEvents = 'none';
        document.body.appendChild(grinch);
        return grinch;
    }

    const grinches = [];
    for (let i = 0; i < numberOfGrinches; i++) {
        grinches.push(createGrinch());
    }

    function animateGrinches() {
        grinches.forEach(grinch => {
            let top = parseFloat(grinch.style.top);
            let speed = Math.random() * 2 + 1; // скорость падения
            top += speed;
            if (top > window.innerHeight) {
                top = -50; // вернуть наверх
                grinch.style.left = `${Math.random() * window.innerWidth}px`; // случайная позиция по горизонтали
            }
            grinch.style.top = `${top}px`;
        });
        requestAnimationFrame(animateGrinches);
    }

    window.addEventListener('load', () => {
        animateGrinches();
    });

})();
