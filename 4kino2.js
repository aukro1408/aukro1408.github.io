(function () {
    'use strict';

    const API_URL = 'https://4kino.cc'; // ← без пробела!

    class Plugin4kino {
        constructor() {
            this.network = new Lampa.Reguest();
        }

        // Просто открываем главную — на сайте нет поиска и страниц фильмов
        async playMovie(card) {
            try {
                Lampa.Noty.show('Открываем 4Kino…');
                Lampa.Loading.start();

                // Так как на сайте нет плееров — просто открываем главную
                // Но если вы хотите "имитировать" воспроизведение — можно открыть в браузере
                Lampa.Utils.open(API_URL);
                Lampa.Loading.stop();
            } catch (err) {
                console.error('[4Kino] Error:', err);
                Lampa.Noty.show('Ошибка');
                Lampa.Loading.stop();
            }
        }
    }

    // === ДОБАВЛЕНИЕ КНОПКИ ТОЧНО КАК РАНЬШЕ ===
    function add4kinoButton(e, plugin) {
        const container = document.querySelector('.full-start__buttons');
        if (!container) return;

        // Защита от дублирования
        if (container.querySelector('.view--4kino')) return;

        const button = document.createElement('div');
        button.className = 'full-start__button selector view--4kino';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                <rect width="48" height="48" rx="8" fill="currentColor" fill-opacity="0.3"/>
                <text x="50%" y="55%" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">4K</text>
            </svg>
            <span>4Kino</span>
        `;

        button.addEventListener('click', () => {
            const movie = e.data?.movie || e.data?.card || e.data?.data;
            if (!movie) {
                Lampa.Noty.show('Нет данных фильма');
                return;
            }
            plugin.playMovie(movie);
        });

        // ← КЛЮЧЕВОЙ МОМЕНТ: вставляем ПОСЛЕ uTorrent, как раньше
        const uTorrentButton = container.querySelector('.view--torrent');
        if (uTorrentButton) {
            uTorrentButton.after(button);
        } else {
            // Если uTorrent нет — в конец
            container.appendChild(button);
        }

        console.log('[4Kino] Кнопка добавлена');
    }

    function startPlugin() {
        const plugin = new Plugin4kino();

        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                add4kinoButton(e, plugin);
            }
        });
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
