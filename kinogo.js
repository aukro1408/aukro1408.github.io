// ==addon==
// name: TestSource
// type: movie
// version: 1.0
// ==/addon==

var addon = {
    title: 'TestSource',
    type: 'movie',
    search: function(query, page, callback) {
        callback([{
            title: 'Тестовый фильм: ' + query,
            year: 2025,
            url: 'https://example.com',
            img: 'https://via.placeholder.com/300x400',
            source: 'test'
        }]);
    },
    content: function(href, callback) {
        callback({ title: 'Тест', sources: [{ url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', title: 'HD' }] });
    }
};
