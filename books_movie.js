(function () {
    'use strict';

    function BookBridge() {
        let network = new Lampa.Reguest();

        this.init = function () {
            Lampa.Listener.follow('full', (e) => {
                if (e.type === 'complite') {
                    let card = e.data.movie;
                    let title = card.original_title || card.title;

                    if (!title) return;

                    this.searchBook(title, (book) => {
                        if (book) {
                            this.render(e.object.activity.render(), book);
                        }
                    });
                }
            });
        };

        this.searchBook = function (title, callback) {
            let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1&langRestrict=ru`;
            
            network.silent(url, (data) => {
                if (data && data.items && data.items.length > 0) {
                    callback(data.items[0].volumeInfo);
                } else {
                    // Если на русском не нашлось, ищем по общему каталогу
                    let url_en = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1`;
                    network.silent(url_en, (data_en) => {
                        if (data_en && data_en.items && data_en.items.length > 0) {
                            callback(data_en.items[0].volumeInfo);
                        } else {
                            callback(null);
                        }
                    });
                }
            }, () => {
                callback(null);
            });
        };

        this.render = function ($render, book) {
            let html = $(`
                <div class="full-start__tag book-bridge-plugin" style="margin-top: 15px; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 15px; display: flex; gap: 15px; align-items: flex-start; border: 1px solid rgba(255,255,255,0.1);">
                    ${book.imageLinks && book.imageLinks.thumbnail ? `<img src="${book.imageLinks.thumbnail}" style="width: 80px; border-radius: 4px; object-fit: cover;">` : ''}
                    <div style="flex: 1;">
                        <div style="font-size: 1.1em; font-weight: bold; color: #fff; margin-bottom: 5px;">📖 Литературный первоисточник</div>
                        <div style="font-size: 1em; color: #f39c12; margin-bottom: 3px;">${book.title} ${book.publishedDate ? '(' + book.publishedDate.substring(0, 4) + ')' : ''}</div>
                        <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 8px;">Автор: ${book.authors ? book.authors.join(', ') : 'Не указан'}</div>
                        <div style="font-size: 0.85em; opacity: 0.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px;">
                            ${book.description || 'Описание отсутствует.'}
                        </div>
                        <div>
                            <div class="button selector book-bridge-read" style="display: inline-block; padding: 6px 15px; background: #27ae60; color: #fff; border-radius: 4px; cursor: pointer; font-size: 0.85em;">
                                Найти книгу в сети
                            </div>
                        </div>
                    </div>
                </div>
            `);

            // Обработка нажатия на кнопку с пульта или мыши
            html.find('.book-bridge-read').on('hover:enter', () => {
                let searchQuery = encodeURIComponent(book.title + ' ' + (book.authors ? book.authors[0] : '') + ' читать онлайн');
                let searchUrl = `https://www.google.com/search?q=${searchQuery}`;
                
                if (window.shell && window.shell.openExternal) {
                    window.shell.openExternal(searchUrl);
                } else {
                    window.open(searchUrl, '_blank');
                }
            });

            $render.find('.full-start__actions').after(html);
        };
    }

    if (!window.plugin_book_bridge_ready) {
        window.plugin_book_bridge_ready = true;
        let plugin = new BookBridge();
        plugin.init();
    }
})();
