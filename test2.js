export default {
  id: 'kinopoisk',
  name: 'Кинопоиск',
  version: '1.0',
  description: 'Плагин для просмотра фильмов с Кинопоиска',
  baseUrl: 'https://kinopoisk.ru',
};

// Функция для получения списка фильмов
export async function getMovies() {
  // Тут должен быть AJAX запрос к API Кинопоиска (фейковый пример)
  return [
    {
      id: '1234',
      title: 'Пример фильма 1',
      url: 'https://example.com/video1.mp4',
      posters: { poster: 'https://example.com/poster1.jpg' }
    },
    {
      id: '5678',
      title: 'Пример фильма 2',
      url: 'https://example.com/video2.mp4',
      posters: { poster: 'https://example.com/poster2.jpg' }
    }
  ];
}

// Поиск видео по ID
export async function getVideoUrl(id) {
  const movies = await getMovies();
  const movie = movies.find(m => m.id === id);
  return movie ? movie.url : null;
}
