// ==UserScript==
// @name         Lampa Rain Sound
// @namespace    lampa.rain
// @version      1.1
// @description  Кнопка для включения/выключения звука дождя в Lampa
// @match        *://*/lampa/*
// ==/UserScript==

(function() {
    'use strict';

    // Прямая ссылка на дождь (Pixabay, CC0, бесплатно)
    const rainSoundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_3a8b9f7b45.mp3?filename=rain-ambient-10294.mp3';

    const audio = new Audio(rainSoundUrl);
    audio.loop = true;
    audio.volume = 0.5;

    const btn = document.createElement('button');
    btn.innerText = '🌧️ Дождь';
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.zIndex = 9999;
    btn.style.padding = '10px 15px';
    btn.style.fontSize = '16px';
    btn.style.borderRadius = '8px';
    btn.style.border = 'none';
    btn.style.background = '#3498db';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

    let isPlaying = false;

    btn.onclick = () => {
        if (!isPlaying) {
            audio.play();
            btn.style.background = '#2ecc71';
            btn.innerText = '🌧️ Дождь ВКЛ';
        } else {
            audio.pause();
            btn.style.background = '#3498db';
            btn.innerText = '🌧️ Дождь';
        }
        isPlaying = !isPlaying;
    };

    document.body.appendChild(btn);
})();
