<!-- ==UserScript== -->
<!-- @name         FanFilm4K Online -->
<!-- @description  Онлайн-перегляд з v12.fanfilm4k.media для Lampa -->
<!-- @version      1.1.0 -->
<!-- @author       Grok Dev -->
<!-- @require      https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js -->
<!-- ==/UserScript== -->

(function() {
    'use strict';

    const BASE_URL = 'https://v12.fanfilm4k.media';
    const PLUGIN_NAME = 'FanFilm4K';

    function normalizeTitle(title) {
        return title
            .toLowerCase()
            .replace(/[:.,!?]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Основна функція пошуку фільму
    async function searchMovie(title, year = '') {
        try {
            const searchQuery = encodeURIComponent(title);
            const response = await fetch(`${BASE_URL}/?s=${searchQuery}`, {
                method: 'GET',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            if (!response.ok) throw new Error('Network error');

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const items = doc.querySelectorAll('.shortstory, .movie-item, article');

            for (let item of items) {
                const linkEl = item.querySelector('a');
                const titleEl = item.querySelector('h2, .title, a');
                const yearEl = item.querySelector('.year, .date');

                if (!linkEl || !titleEl) continue;

                const foundTitle = normalizeTitle(titleEl.textContent);
                const foundYear = yearEl ? yearEl.textContent.trim() : '';

                if (foundTitle.includes(normalizeTitle(title))) {
                    if (!year || !foundYear || foundYear.includes(year)) {
                        return linkEl.href;
                    }
                }
            }
            return null;
        } catch (e) {
            console.error('FanFilm4K search error:', e);
            return null;
        }
    }

    // Парсинг сторінки фільму — витягуємо посилання на відео
    async function getVideoLinks(movieUrl) {
        try {
            const response = await fetch(movieUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            const sources = [];

            // Варіант 1: iframe плеєр
            doc.querySelectorAll('iframe').forEach(iframe => {
                const src = iframe.src;
                if (src && (src.includes('player') || src.includes('video') || src.includes('embed'))) {
                    sources.push({
                        url: src,
                        quality: '1080p',
                        type: 'iframe'
                    });
                }
            });

            // Варіант 2: video tag або data-src з m3u8
            doc.querySelectorAll('video source, video').forEach(video => {
                let src = video.src || video.getAttribute('data-src') || video.getAttribute('src');
                if (src && (src.includes('.m3u8') || src.includes('.mp4'))) {
                    sources.push({
                        url: src,
                        quality: src.includes('4K') || src.includes('2160') ? '4K' : '1080p',
                        type: 'hls'
                    });
                }
            });

            // Якщо знайшли — повертаємо
            if (sources.length > 0) {
                return sources;
            }

            // Резерв: повертаємо саму сторінку (Lampa може відкрити в браузері)
            return [{ url: movieUrl, quality: 'Auto', type: 'page' }];

        } catch (e) {
            console.error('FanFilm4K parse error:', e);
            return [];
        }
    }

    // Головний компонент Lampa
    Lampa.Component.add(PLUGIN_NAME.toLowerCase(), {
        create: async function() {
            this.activity.loader(true);

            const movie = this.activity.movie || this.activity.card;
            const title = movie.title || movie.name || '';
            const year = movie.release_date ? movie.release_date.slice(0,4) : '';

            const movieUrl = await searchMovie(title, year);

            if (!movieUrl) {
                this.buildError('Нічого не знайдено на FanFilm4K');
                return;
            }

            const sources = await getVideoLinks(movieUrl);

            this.buildList(sources, movieUrl);
        },

        buildList: function(sources, originalUrl) {
            let html = `
                <div class="fanfilm4k-list">
                    <div class="fanfilm4k-header">
                        <h2>FanFilm4K — Онлайн</h2>
                    </div>
            `;

            if (sources.length === 0) {
                html += `<div class="empty">Посилання не знайдено, але можна відкрити сторінку:</div>`;
                html += `<div class="button" data-url="${originalUrl}">Відкрити на сайті</div>`;
            } else {
                sources.forEach((source, i) => {
                    html += `
                        <div class="button fanfilm-button" data-url="${source.url}" data-type="${source.type}">
                            ▶ ${source.quality} ${source.type === 'iframe' ? '(Плеєр)' : ''}
                        </div>
                    `;
                });
            }

            html += `</div>`;

            this.activity.render().html(html);

            // Обробка кліків
            $('.fanfilm-button').on('hover:enter', function() {
                const url = $(this).data('url');
                const type = $(this).data('type');

                if (type === 'iframe' || type === 'hls') {
                    Lampa.Player.play({
                        playlist: [{ file: url, title: 'FanFilm4K' }]
                    });
                } else {
                    window.open(url, '_blank');
                }
            });
        },

        buildError: function(text) {
            this.activity.render().html(`
                <div style="padding: 2em; text-align: center; color: #ff4444;">
                    <h3>${text}</h3>
                </div>
            `);
        }
    });

    // Додаємо кнопку "Онлайн FanFilm4K"
    function addButton(data) {
        const container = data.render || $('.view--torrent, .view--online');
        if (container.find('.ff4k-btn').length) return;

        const btn = $(`
            <div class="button ff4k-btn">
                <span>▶ FanFilm4K (Онлайн)</span>
            </div>
        `);

        btn.on('hover:enter', () => {
            Lampa.Activity.push({
                component: PLUGIN_NAME.toLowerCase(),
                title: 'FanFilm4K — ' + (data.movie.title || data.movie.name),
                movie: data.movie
            });
        });

        container.append(btn);
    }

    // Підписка на події
    Lampa.Listener.follow('full', (e) => {
        if (e.type === 'complite') {
            addButton({ render: e.object.activity.render(), movie: e.data.movie });
        }
    });

    console.log(`✅ ${PLUGIN_NAME} плагін v1.1.0 успішно завантажено`);
})();
