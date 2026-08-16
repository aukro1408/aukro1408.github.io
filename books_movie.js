(function () {
    'use strict';

    function BookBridge() {
        let network = new Lampa.Reguest();

        this.init = function () {
            Lampa.Listener.follow('full', (e) => {
                if (e.type === 'complite' || e.type === 'render') {
                    let card = e.data.movie;
                    // Пробуем искать по русскому названию, если его нет — по оригинальному
                    let title = card.title || card.original_title;

                    if (!title) return;
                    console.log('BookBridge: Ищем книгу для:', title);

                    this.searchBook(title, (book) => {
                        if (book) {
                            console.log('BookBridge: Книга найдена:', book.title);
                            this.render(e.object.activity.render(), book);
                        } else {
                            console.log('BookBridge: Книга не найдена для:', title);
                        }
                    });
                }
            });
        };

        this.searchBook = function (title, callback) {
            // Убираем ограничение по языку, чтобы корректно находить «It» (Стивен Кинг) и другие книги
            let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=3`;
            
            network.silent(url, (data) => {
                if (data && data.items && data.items.length > 0) {
                    // Ищем наиболее подходящий результат (желательно с авторами и описанием)
                    let found = data.items.find(item => item.volumeInfo && item.volumeInfo.authors) || data.items[0];
                    callback(found.volumeInfo);
                } else {
                    callback(null);
                }
            }, () => {
                callback(null);
            });
        };

        this.render = function ($render, book) {
            // Защита от дублирования блоков
            if ($render.find('.book-bridge-plugin').length > 0) return;

            let html = $(`
                <div class="full-start__tag book-bridge-plugin" style="margin-top: 15px; background: rgba(0,0,0,0.5); border-radius: 8px; padding: 15px; display: flex; gap: 15px; align-items: flex-start; border: 1px solid rgba(255,255,255,0.1);">
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

            // Кнопка поиска книги
            html.find('.book-bridge-read').on('hover:enter', () => {
                let searchQuery = encodeURIComponent(book.title + ' ' + (book.authors ? book.authors[0] : '') + ' читать онлайн');
                let searchUrl = `https://www.google.com/search?q=${searchQuery}`;
                
                if (window.shell && window.shell.openExternal) {
                    window.shell.openExternal(searchUrl);
                } else {
                    window.open(searchUrl, '_blank');
                }
            });

            // Универсальная вставка после описания или блока действий
            let target = $render.find('.full-descr').length ? $render.find('.full-descr') : $render.find('.full-start__actions');
            target.after(html);
        };
    }

    if (!window.plugin_book_bridge_ready) {
        window.plugin_book_bridge_ready = true;
        let plugin = new BookBridge();
        plugin.init();
    }
})();
