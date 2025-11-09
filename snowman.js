// ==UserScript==
// @name         Lampa Grinch Fly
// @namespace    lampa.grinch
// @version      1.0
// @description  Гринч летает по экрану Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function() {
    'use strict';

    function initGrinch() {
        if (!window.Lampa || !document.body) {
            return setTimeout(initGrinch, 1000);
        }

        if (document.getElementById('grinch-container')) return;

        const container = document.createElement('div');
        container.id = 'grinch-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 9999,
        });
        document.body.appendChild(container);

        const grinchURL = 'YOUR_UPLOADED_IMAGE_URL_HERE'; // сюда вставь ссылку на твой PNG

        function createGrinch() {
            const item = document.createElement('img');
            item.src = grinchURL;

            const size = Math.random() * 150 + 100; // случайный размер
            const left = Math.random() * 80 + 10;

            Object.assign(item.style, {
                position: 'absolute',
                top: '-200px',
                left: left + '%',
                width: size + 'px',
                height: 'auto',
                transform: `rotate(${Math.random() * 30 - 15}deg)`,
                opacity: Math.random() * 0.9 + 0.1,
                animation: `grinchFloat ${20 + Math.random() * 15}s linear forwards`,
            });

            container.appendChild(item);
            item.addEventListener('animationend', () => item.remove());
        }

        setInterval(createGrinch, 1500);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes grinchFloat {
                0% { transform: translateY(0) rotate(0deg); }
                100% { transform: translateY(110vh) rotate(20deg); }
            }
        `;
        document.head.appendChild(style);
    }

    initGrinch();
})();
