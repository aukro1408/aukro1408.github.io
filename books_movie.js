(function () {
    "use strict";

    function getMovieTitle(movie) {
        if (!movie) return "";
        return (
            movie.title ||
            movie.name ||
            movie.original_title ||
            movie.original_name ||
            ""
        ).trim();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async function searchBook(title) {
        if (!title) return null;
        let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=3`;
        try {
            let response = await fetch(url);
            if (!response.ok) return null;
            let data = await response.json();
            if (data && data.items && data.items.length > 0) {
                let found = data.items.find(item => item.volumeInfo && item.volumeInfo.authors) || data.items[0];
                return found.volumeInfo;
            }
        } catch (e) {
            console.error("[Book Bridge] Fetch error:", e);
        }
        return null;
    }

    function openBookModal(movie) {
        let title = getMovieTitle(movie);
        if (!title) {
            Lampa.Noty.show("Не удалось получить название фильма");
            return;
        }

        Lampa.Loading.start();

        searchBook(title).then(book => {
            Lampa.Loading.stop();

            if (!book) {
                Lampa.Noty.show("Книга-первоисточник не найдена");
                return;
            }

            let html = $(`
                <div style="padding: 10px; color: #fff; display: flex; gap: 20px; align-items: flex-start;">
                    ${book.imageLinks && book.imageLinks.thumbnail ? `<img src="${book.imageLinks.thumbnail}" style="width: 130px; border-radius: 8px; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">` : ''}
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                        <div style="font-size: 1.3em; font-weight: bold; color: #ff9800;">${escapeHtml(book.title)} ${book.publishedDate ? '(' + book.publishedDate.substring(0, 4) + ')' : ''}</div>
                        <div style="font-size: 1.05em; opacity: 0.9;"><b>Автор:</b> ${escapeHtml(book.authors ? book.authors.join(', ') : 'Не указан')}</div>
                        <div style="font-size: 0.95em; opacity: 0.7; max-height: 250px; overflow-y: auto; line-height: 1.4;">
                            ${escapeHtml(book.description || 'Описание отсутствует.')}
                        </div>
                        <div style="margin-top: 10px;">
                            <div class="button selector book-bridge-read-btn" style="display: inline-block; padding: 10px 20px; background: #27ae60; color: #fff; border-radius: 8px; cursor: pointer; text-align: center; font-weight: bold;">
                                Найти и читать в сети
                            </div>
                        </div>
                    </div>
                </div>
            `);

            html.find('.book-bridge-read-btn').on('hover:enter click', () => {
                let searchQuery = encodeURIComponent(book.title + ' ' + (book.authors ? book.authors[0] : '') + ' читать онлайн');
                let searchUrl = `https://www.google.com/search?q=${searchQuery}`;
                if (window.shell && window.shell.openExternal) {
                    window.shell.openExternal(searchUrl);
                } else {
                    window.open(searchUrl, '_blank');
                }
            });

            Lampa.Modal.open({
                title: '📖 Литературный первоисточник',
                html: html,
                size: 'large',
                onBack: () => {
                    Lampa.Modal.close();
                    $(".modal--large").remove();
                    Lampa.Controller.toggle('content');
                }
            });
        }).catch(e => {
            Lampa.Loading.stop();
            console.error("[Book Bridge] Error:", e);
            Lampa.Noty.show("Ошибка при поиске книги");
        });
    }

    function startPlugin() {
        if (window.book_bridge_plugin_loaded) return;
        window.book_bridge_plugin_loaded = true;

        Lampa.Listener.follow("full", function (e) {
            if (e.type !== "complite") return;

            const movie = e.data && e.data.movie;
            if (!movie) return;

            // Удаляем старую кнопку, если уже создана
            $(".button--book-bridge").remove();

            // Добавляем кнопку в панель действий карточки (аналогично комментариям)
            $(".full-start-new__buttons").append(`
                <div class="full-start__button selector button--book-bridge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        <path d="M12 6v12"></path>
                    </svg>
                    <span>Книга</span>
                </div>
            `);

            // Обработка нажатия на пульте / клика
            $(".button--book-bridge").on("hover:enter", function () {
                openBookModal(movie);
            });
        });
    }

    startPlugin();
})();
