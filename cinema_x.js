/**
 * CinemaX v2 — Новинки проката + Стриминги
 * Based on the supplied CinemaX.js source. Cleaned and hardened for Lampa compatibility.
 * This plugin intentionally does NOT replace Lampa's main TMDB API loader,
 * so it can coexist with other home-page plugins.
 */
(function(){
    'use strict';
    if (typeof Lampa === 'undefined') return;
    if (window.CINEMAX_EXTRACT_LOADED) return;
    window.CINEMAX_EXTRACT_LOADED = true;
    window.CINEMAX_VERSION = '2.0.0';

    var CINEMAX_LANG = (Lampa.Storage.get('language', 'uk') || 'uk').toLowerCase();
    if (CINEMAX_LANG === 'ua') CINEMAX_LANG = 'uk';
    if (['uk','ru','en','pl'].indexOf(CINEMAX_LANG) === -1) CINEMAX_LANG = 'en';

    var CINEMAX_I18N = {
        hero_row_title: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        hero_row_title_full: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        streamings_row_title: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        streamings_row_title_full: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        ru_new_movies: { uk: '🔥 Нові фільми', ru: '🔥 Новые фильмы', en: '🔥 New movies', pl: '🔥 Nowe filmy' },
        ru_new_tv: { uk: '🔥 Нові серіали', ru: '🔥 Новые сериалы', en: '🔥 New series', pl: '🔥 Nowe seriale' },
        ru_shows: { uk: '🎤 Шоу та Реаліті', ru: '🎤 Шоу и реалити', en: '🎤 Shows & Reality', pl: '🎤 Show i Reality' },
        ru_trending_movies: { uk: '📈 Популярні фільми', ru: '📈 Популярные фильмы', en: '📈 Trending movies', pl: '📈 Popularne filmy' },
        ru_trending_series: { uk: '📈 Популярні серіали', ru: '📈 Популярные сериалы', en: '📈 Trending series', pl: '📈 Popularne seriale' },
        ru_best_movies: { uk: '⭐ Найкращі фільми', ru: '⭐ Лучшие фильмы', en: '⭐ Best movies', pl: '⭐ Najlepsze filmy' },
        ru_all_movies: { uk: '🎬 Всі фільми (Ru)', ru: '🎬 Все фильмы (Ru)', en: '🎬 All movies (Ru)', pl: '🎬 Wszystkie filmy (Ru)' },
        ru_all_series: { uk: '📺 Всі серіали (Ru)', ru: '📺 Все сериалы (Ru)', en: '📺 All series (Ru)', pl: '📺 Wszystkie seriale (Ru)' },
        ru_all_shows: { uk: '🎤 Всі шоу (Ru)', ru: '🎤 Все шоу (Ru)', en: '🎤 All shows (Ru)', pl: '🎤 Wszystkie show (Ru)' },
        english_row_title: { uk: 'Новинки англомовної стрічки', ru: 'Новинки Английской ленты', en: 'New in English feed', pl: 'Nowości w anglojęzycznej sekcji' },
        english_row_title_full: { uk: 'En Новинки англомовної стрічки', ru: 'En Новинки Английской ленты', en: 'En New in English feed', pl: 'En Nowości w anglojęzycznej sekcji' },
        mood_row_title: { uk: 'Кіно під настрій', ru: 'Кино по настроению', en: 'Mood movies', pl: 'Kino na nastrój' },
        mood_row_title_full: { uk: '🎭 Кіно під настрій', ru: '🎭 Кино по настроению', en: '🎭 Mood movies', pl: '🎭 Kino na nastrój' },
        mood_cry: { uk: 'До сліз / Катарсис', ru: 'До слёз / Катaрсис', en: 'To tears / Catharsis', pl: 'Do łez / Katarzis' },
        mood_positive: { uk: 'Чистий позитив', ru: 'Чистый позитив', en: 'Pure positivity', pl: 'Czysty pozytyw' },
        mood_tasty: { uk: 'Смачний перегляд', ru: 'Вкусный просмотр', en: 'Tasty watch', pl: 'Smaczne oglądanie' },
        mood_adrenaline: { uk: 'Адреналін', ru: 'Адреналин', en: 'Adrenaline', pl: 'Adrenalina' },
        mood_butterflies: { uk: 'Метелики в животі', ru: 'Бабочки в животе', en: 'Butterflies in the stomach', pl: 'Motyle w brzuchu' },
        mood_tension: { uk: 'На межі / Напруга', ru: 'На грани / Напряжение', en: 'On the edge / Tension', pl: 'Na krawędzi / Napięcie' },
        mood_adventure: { uk: 'Пошук пригод', ru: 'В поисках приключений', en: 'Looking for adventure', pl: 'W poszukiwaniu przygód' },
        mood_together: { uk: 'Разом веселіше', ru: 'Вместе веселее', en: 'More fun together', pl: 'Razem weselej' },
        mood_family: { uk: 'Малим і дорослим', ru: 'Малым и взрослым', en: 'For kids and adults', pl: 'Dla małych i dużych' },
        mood_your_choice: { uk: 'На твій смак', ru: 'На твой вкус', en: 'To your taste', pl: 'Według twojego gustu' },
        today_on_prefix: { uk: 'Сьогодні на ', ru: 'Сегодня на ', en: 'Today on ', pl: 'Dziś na ' },
        go_to_page: { uk: 'На сторінку', ru: 'На страницу', en: 'Open page', pl: 'Na stronę' },
        cat_new_movies: { uk: '🔥 Нові фільми', ru: '🔥 Новые фильмы', en: '🔥 New movies', pl: '🔥 Nowe filmy' },
        cat_new_tv: { uk: '🔥 Нові серіали', ru: '🔥 Новые сериалы', en: '🔥 New series', pl: '🔥 Nowe seriale' },
        cat_top_tv: { uk: '🏆 Топ Серіали', ru: '🏆 Топ сериалы', en: '🏆 Top series', pl: '🏆 Top seriale' },
        cat_top_movies: { uk: '🏆 Топ Фільми', ru: '🏆 Топ фильмы', en: '🏆 Top movies', pl: '🏆 Top filmy' },
        cat_top_movies_wb: { uk: '🏆 Топ Фільми (WB)', ru: '🏆 Топ фильмы (WB)', en: '🏆 Top movies (WB)', pl: '🏆 Top filmy (WB)' },
        cat_only_netflix: { uk: '🅰️ Тільки на Netflix (Originals)', ru: '🅰️ Только на Netflix (Originals)', en: '🅰️ Only on Netflix (Originals)', pl: '🅰️ Tylko na Netflix (Originals)' },
        cat_twisted_thrillers: { uk: '🤯 Заплутані трилери', ru: '🤯 Запутанные триллеры', en: '🤯 Twisted thrillers', pl: '🤯 Pokręcone thrillery' },
        cat_fantasy_sci: { uk: '🐉 Фантастика та Фентезі', ru: '🐉 Фантастика и фэнтези', en: '🐉 Sci‑Fi & Fantasy', pl: '🐉 Sci‑Fi i fantasy' },
        cat_kdrama: { uk: '🇰🇷 K-Dramas (Корея)', ru: '🇰🇷 K‑Дорамы (Корея)', en: '🇰🇷 K‑Dramas (Korea)', pl: '🇰🇷 K‑dramy (Korea)' },
        cat_truecrime_doc: { uk: '🔪 Документальний True Crime', ru: '🔪 Документальный True Crime', en: '🔪 True Crime documentaries', pl: '🔪 True crime – dokumenty' },
        cat_anime: { uk: '🍿 Аніме', ru: '🍿 Аниме', en: '🍿 Anime', pl: '🍿 Anime' },
        cat_apple_epic_sci: { uk: '🛸 Епічний Sci-Fi (Фішка Apple)', ru: '🛸 Эпический Sci‑Fi (фирменный Apple)', en: '🛸 Epic Sci‑Fi (Apple\'s specialty)', pl: '🛸 Epickie Sci‑Fi (Apple)' },
        cat_comedy_feelgood: { uk: '😂 Комедії та Feel-Good', ru: '😂 Комедии и feel‑good', en: '😂 Comedies & feel‑good', pl: '😂 Komedie i feel‑good' },
        cat_quality_detectives: { uk: '🕵️ Якісні детективи', ru: '🕵️ Качественные детективы', en: '🕵️ Quality detective shows', pl: '🕵️ Dobre kryminały' },
        cat_apple_original: { uk: '🎬 Apple Original Films', ru: '🎬 Apple Original Films', en: '🎬 Apple Original Films', pl: '🎬 Apple Original Films' },
        cat_epic_sagas: { uk: '🐉 Епічні саги (Фентезі)', ru: '🐉 Эпические саги (фэнтези)', en: '🐉 Epic fantasy sagas', pl: '🐉 Epickie sagi fantasy' },
        cat_premium_dramas: { uk: '🎭 Преміальні драми', ru: '🎭 Премиальные драмы', en: '🎭 Premium dramas', pl: '🎭 Premiowe dramaty' },
        cat_dc_blockbusters: { uk: '🦇 Блокбастери DC', ru: '🦇 Блокбастеры DC', en: '🦇 DC blockbusters', pl: '🦇 Blockbustery DC' },
        cat_dark_detectives: { uk: '🧠 Похмурі детективи', ru: '🧠 Мрачные детективы', en: '🧠 Dark detective stories', pl: '🧠 Mroczne kryminały' },
        cat_hbo_classics: { uk: '👑 Золота класика HBO', ru: '👑 Золотая классика HBO', en: '👑 HBO golden classics', pl: '👑 Złota klasyka HBO' },
        cat_hard_action: { uk: '🩸 Жорсткий екшн та Антигерої', ru: '🩸 Жёсткий экшн и антигерои', en: '🩸 Hard action & antiheroes', pl: '🩸 Ostry akcyjniak i antybohaterowie' },
        cat_amazon_mgm: { uk: '🎬 Фільми від Amazon MGM', ru: '🎬 Фильмы от Amazon MGM', en: '🎬 Amazon MGM movies', pl: '🎬 Filmy Amazon MGM' },
        cat_comedies: { uk: '😂 Комедії', ru: '😂 Комедии', en: '😂 Comedies', pl: '😂 Komedie' },
        cat_thrillers: { uk: '🕵️ Трилери', ru: '🕵️ Триллеры', en: '🕵️ Thrillers', pl: '🕵️ Thrillery' },
        cat_adult_animation: { uk: '🤬 Анімація для дорослих', ru: '🤬 Анимация для взрослых', en: '🤬 Adult animation', pl: '🤬 Animacje dla dorosłych' },
        cat_marvel_universe: { uk: '🦸\u200d♂️ Кіновсесвіт Marvel', ru: '🦸\u200d♂️ Киновселенная Marvel', en: '🦸‍♂️ Marvel Cinematic Universe', pl: '🦸‍♂️ Uniwersum Marvela' },
        cat_starwars: { uk: '⚔️ Далека галактика (Star Wars)', ru: '⚔️ Далёкая галактика (Star Wars)', en: '⚔️ A galaxy far away (Star Wars)', pl: '⚔️ Odległa galaktyka (Star Wars)' },
        cat_pixar: { uk: '🧸 Шедеври Pixar', ru: '🧸 Шедевры Pixar', en: '🧸 Pixar masterpieces', pl: '🧸 Arcydzieła Pixara' },
        cat_fx_star: { uk: '🍷 Дорослий контент (FX / Star)', ru: '🍷 Взрослый контент (FX / Star)', en: '🍷 Adult content (FX / Star)', pl: '🍷 Treści dla dorosłych (FX / Star)' },
        cat_sheridan_universe: { uk: '🤠 Всесвіт Шеридана (Yellowstone)', ru: '🤠 Вселенная Шеридана (Yellowstone)', en: '🤠 Sheridan universe (Yellowstone)', pl: '🤠 Uniwersum Sheridana (Yellowstone)' },
        cat_startrek_collection: { uk: '🖖 Колекція Star Trek', ru: '🖖 Коллекция Star Trek', en: '🖖 Star Trek collection', pl: '🖖 Kolekcja Star Trek' },
        cat_crime_investigation: { uk: '🚓 Кримінал та Розслідування', ru: '🚓 Криминал и расследования', en: '🚓 Crime & investigation', pl: '🚓 Kryminał i śledztwa' },
        cat_kids_world: { uk: '🧽 Дитячий світ (Nickelodeon)', ru: '🧽 Детский мир (Nickelodeon)', en: '🧽 Kids world (Nickelodeon)', pl: '🧽 Świat dzieci (Nickelodeon)' },
        cat_paramount_blockbusters: { uk: '🎬 Блокбастери (Paramount)', ru: '🎬 Блокбастеры (Paramount)', en: '🎬 Blockbusters (Paramount)', pl: '🎬 Blockbustery (Paramount)' },
        cat_universal_world: { uk: '🌍 Світ Universal', ru: '🌍 Мир Universal', en: '🌍 Universal world', pl: '🌍 Świat Universal' },
        cat_showtime_adult: { uk: '🕵️ Дорослий розбір (Showtime)', ru: '🕵️ Взрослый разбор (Showtime)', en: '🕵️ Adult breakdown (Showtime)', pl: '🕵️ Analizy dla dorosłych (Showtime)' },
        cat_dreamworks_worlds: { uk: '🦄 Казкові світи (DreamWorks)', ru: '🦄 Сказочные миры (DreamWorks)', en: '🦄 Fairy-tale worlds (DreamWorks)', pl: '🦄 Bajkowe światy (DreamWorks)' },
        cat_new_releases_syfy: { uk: '🔥 Новинки', ru: '🔥 Новинки', en: '🔥 New releases', pl: '🔥 Nowości' },
        cat_top_syfy: { uk: '🏆 Топ на Syfy', ru: '🏆 Топ на Syfy', en: '🏆 Top on Syfy', pl: '🏆 Top na Syfy' },
        cat_space_travel: { uk: '🚀 Космічні подорожі', ru: '🚀 Космические путешествия', en: '🚀 Space journeys', pl: '🚀 Podróże kosmiczne' },
        cat_monsters_paranormal: { uk: '🧟 Монстри та паранормальне', ru: '🧟 Монстры и паранормальное', en: '🧟 Monsters and paranormal', pl: '🧟 Potwory i zjawiska paranormalne' },
        educational_title: { uk: 'Пізнавальне', ru: 'Познавательное', en: 'Educational', pl: 'Edukacyjne' },
        cat_new_episodes: { uk: '🔥 Нові випуски', ru: '🔥 Новые выпуски', en: '🔥 New episodes', pl: '🔥 Nowe odcinki' },
        cat_cooking_battles: { uk: '🔪 Кулінарні битви', ru: '🔪 Кулинарные битвы', en: '🔪 Cooking battles', pl: '🔪 Kuchenne pojedynki' },
        cat_survival: { uk: '🪓 Виживання', ru: '🪓 Выживание', en: '🪓 Survival', pl: '🪓 Przetrwanie' },
        ua_new_movies: { uk: 'Нові українські фільми', ru: 'Новые украинские фильмы', en: 'New Ukrainian movies', pl: 'Nowe ukraińskie filmy' },
        ua_new_tv: { uk: 'Нові українські серіали', ru: 'Новые украинские serialы', en: 'New Ukrainian series', pl: 'Nowe ukraińskie seriale' },
        ua_shows: { uk: 'Шоу та програми', ru: 'Шоу и программы', en: 'Shows and programs', pl: 'Show i programy' },
        ua_trending_movies: { uk: 'В тренді в Україні', ru: 'В тренде в Украине', en: 'Trending in Ukraine', pl: 'Na topie na Ukrainie' },
        ua_trending_series: { uk: 'Українські серіали в тренді', ru: 'Украинские сериалы в тренде', en: 'Trending Ukrainian series', pl: 'Ukraińskie seriale na topie' },
        ua_best_movies: { uk: 'Найкращі українські фільми', ru: 'Лучшие украинские фильмы', en: 'Best Ukrainian movies', pl: 'Najlepsze ukraińskie filmy' },
        ua_all_movies: { uk: 'Українські фільми (повна підбірка)', ru: 'Украинские фильмы (полная подборка)', en: 'Ukrainian movies (full collection)', pl: 'Ukraińskie filmy (pełna kolekcja)' },
        ua_all_series: { uk: 'Українські серіали (повна підбірка)', ru: 'Украинские сериалы (полная подборка)', en: 'Ukrainian series (full collection)', pl: 'Ukraińskie seriale (pełna kolekcja)' },
        pl_new_movies: { uk: 'Нові польські фільми', ru: 'Новые польские фильмы', en: 'New Polish movies', pl: 'Nowe polskie filmy' },
        pl_new_tv: { uk: 'Нові польські серіали', ru: 'Новые польские сериалы', en: 'New Polish series', pl: 'Nowe polskie seriale' },
        pl_shows: { uk: 'Польські шоу та програми', ru: 'Польские шоу и программы', en: 'Polish shows and programs', pl: 'Polskie show i programy' },
        pl_trending_movies: { uk: 'В тренді в Польщі', ru: 'В тренде в Польше', en: 'Trending in Poland', pl: 'Na topie w Polsce' },
        pl_trending_series: { uk: 'Польські серіали в тренді', ru: 'Польские сериалы в тренде', en: 'Trending Polish series', pl: 'Polskie seriale na topie' },
        pl_best_movies: { uk: 'Найкращі польські фільми', ru: 'Лучшие польские фильмы', en: 'Best Polish movies', pl: 'Najlepsze polskie filmy' },
        pl_all_movies: { uk: 'Польські фільми (повна підбірка)', ru: 'Польские фильмы (полная подборка)', en: 'Polish movies (full collection)', pl: 'Polskie filmy (pełna kolekcja)' },
        pl_all_series: { uk: 'Польські серіали (повна підбірка)', ru: 'Польские сериалы (полная подборка)', en: 'Polish series (full collection)', pl: 'Polskie seriale (pełna kolekcja)' },
        pl_all_shows: { uk: 'Польські шоу та програми (повна підбірка)', ru: 'Польские шоу и программы (полная подборка)', en: 'Polish shows and programs (full collection)', pl: 'Polskie show i programy (pełna kolekcja)' },
        settings_tab_title: { uk: 'CinemaX', ru: 'CinemaX', en: 'CinemaX', pl: 'CinemaX' },
        settings_header_info: { uk: 'CinemaX — кастомна головна сторінка з стрімінгами, мітками якості та українською озвучкою. Автор: aukro1408', ru: 'CinemaX — кастомная главная страница со стримингами, метками качества и украинской озвучкой. Автор: aukro1408', en: 'CinemaX — custom home screen with streamings, quality badges and Ukrainian audio. Author: aukro1408', pl: 'CinemaX — niestandardowa strona główna ze streamingami, oznaczeniami jakości i ukraińskim dubbingiem. Autor: aukro1408' },
        settings_sections_title: { uk: 'Секції головної сторінки', ru: 'Секции главной страницы', en: 'Main screen sections', pl: 'Sekcje ekranu głównego' },
        settings_streamings_name: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        settings_streamings_desc: { uk: 'Секція з логотипами стрімінгових сервісів', ru: 'Секция с логотипами стриминговых сервисов', en: 'Row with streaming services logos', pl: 'Sekcja z logo serwisów streamingowych' },
        settings_hero_name: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        settings_hero_desc: { uk: 'Ряд з новинками прокату на початку головної', ru: 'Ряд с новинками проката в начале главной', en: 'Row with theatrical new releases at the top', pl: 'Rząd z nowościami kinowymi na początku ekranu' },
        settings_row_ru_name: { uk: 'Новинки російської ленти', ru: 'Новинки Русской ленты', en: 'New in Russian feed', pl: 'Nowości rosyjskiej sekcji' },
        settings_row_ru_desc: { uk: 'Показувати ряд «Новинки Русской ленты»', ru: 'Показывать ряд «Новинки Русской ленты»', en: 'Show the "New in Russian feed" row', pl: 'Pokazuj rząd „Nowości rosyjskiej sekcji”' },
        settings_row_ua_name: { uk: 'Новинки української ленти', ru: 'Новинки Украинской ленты', en: 'New in Ukrainian feed', pl: 'Nowości ukraińskiej sekcji' },
        settings_row_ua_desc: { uk: 'Показувати ряд «Новинки української стрічки»', ru: 'Показывать ряд «Новинки Украинской ленты»', en: 'Show the "New in Ukrainian feed" row', pl: 'Pokazuj rząd „Nowości ukraińskiej sekcji”' },
        settings_row_en_name: { uk: 'Новинки англійської ленти', ru: 'Новинки Английской ленты', en: 'New in English feed', pl: 'Nowości angielskiej sekcji' },
        settings_row_en_desc: { uk: 'Показувати ряд «Новинки Английской ленты»', ru: 'Показывать ряд «Новинки Английской ленты»', en: 'Show the "New in English feed" row', pl: 'Pokazuj rząd „Nowości angielskiej sekcji”' },
        settings_row_pl_name: { uk: 'Новинки польської ленти', ru: 'Новинки Польской ленты', en: 'New in Polish feed', pl: 'Nowości polskiej sekcji' },
        settings_row_pl_desc: { uk: 'Показувати ряд «Новинки польської стрічки»', ru: 'Показывать ряд «Новинки Польской ленты»', en: 'Show the "New in Polish feed" row', pl: 'Pokazuj rząd „Nowości polskiej sekcji”' },
        settings_today_netflix_name: { uk: 'Сьогодні на Netflix', ru: 'Сегодня на Netflix', en: 'Today on Netflix', pl: 'Dziś na Netflix' },
        settings_today_netflix_desc: { uk: 'Ряд новинок Netflix за сьогодні', ru: 'Ряд новинок Netflix за сегодня', en: 'Row with today\'s Netflix releases', pl: 'Rząd dzisiejszych nowości Netflix' },
        settings_today_apple_name: { uk: 'Сьогодні на Apple TV+', ru: 'Сегодня на Apple TV+', en: 'Today on Apple TV+', pl: 'Dziś na Apple TV+' },
        settings_today_apple_desc: { uk: 'Ряд новинок Apple TV+ за сьогодні', ru: 'Ряд новинок Apple TV+ за сегодня', en: 'Row with today\'s Apple TV+ releases', pl: 'Rząd dzisiejszych nowości Apple TV+' },
        settings_today_hbo_name: { uk: 'Сьогодні на HBO / Max', ru: 'Сегодня на HBO / Max', en: 'Today on HBO / Max', pl: 'Dziś na HBO / Max' },
        settings_today_hbo_desc: { uk: 'Ряд новинок HBO / Max за сьогодні', ru: 'Ряд новинок HBO / Max за сегодня', en: 'Row with today\'s HBO / Max releases', pl: 'Rząd dzisiejszych nowości HBO / Max' },
        settings_today_prime_name: { uk: 'Сьогодні на Prime Video', ru: 'Сегодня на Prime Video', en: 'Today on Prime Video', pl: 'Dziś na Prime Video' },
        settings_today_prime_desc: { uk: 'Ряд новинок Prime Video за сьогодні', ru: 'Ряд новинок Prime Video за сегодня', en: 'Row with today\'s Prime Video releases', pl: 'Rząd dzisiejszych nowości Prime Video' },
        settings_today_disney_name: { uk: 'Сьогодні на Disney+', ru: 'Сегодня на Disney+', en: 'Today on Disney+', pl: 'Dziś na Disney+' },
        settings_today_disney_desc: { uk: 'Ряд новинок Disney+ за сьогодні', ru: 'Ряд новинок Disney+ за сегодня', en: 'Row with today\'s Disney+ releases', pl: 'Rząd dzisiejszych nowości Disney+' },
        settings_today_paramount_name: { uk: 'Сьогодні на Paramount+', ru: 'Сегодня на Paramount+', en: 'Today on Paramount+', pl: 'Dziś na Paramount+' },
        settings_today_paramount_desc: { uk: 'Ряд новинок Paramount+ за сьогодні', ru: 'Ряд новинок Paramount+ за сегодня', en: 'Row with today\'s Paramount+ releases', pl: 'Rząd dzisiejszych nowości Paramount+' },
        settings_today_sky_name: { uk: 'Сьогодні на Sky Showtime', ru: 'Сегодня на Sky Showtime', en: 'Today on Sky Showtime', pl: 'Dziś na Sky Showtime' },
        settings_today_sky_desc: { uk: 'Ряд новинок Sky Showtime за сьогодні', ru: 'Ряд новинок Sky Showtime за сегодня', en: 'Row with today\'s Sky Showtime releases', pl: 'Rząd dzisiejszych nowości Sky Showtime' },
        settings_today_hulu_name: { uk: 'Сьогодні на Hulu', ru: 'Сегодня на Hulu', en: 'Today on Hulu', pl: 'Dziś na Hulu' },
        settings_today_hulu_desc: { uk: 'Ряд новинок Hulu за сьогодні', ru: 'Ряд новинок Hulu за сегодня', en: 'Row with today\'s Hulu releases', pl: 'Rząd dzisiejszych nowości Hulu' },
        settings_mood_name: { uk: 'Кіно під настрій', ru: 'Кино по настроению', en: 'Mood movies', pl: 'Kino na nastrój' },
        settings_mood_desc: { uk: 'Підбірки фільмів за жанрами та настроєм', ru: 'Подборки фильмов по жанрам и настроению', en: 'Movie picks by genre and mood', pl: 'Zestawy filmów wg gatunku i nastroju' },
        settings_kinooglad_name: { uk: 'Кіноогляд', ru: 'Кинообзор', en: 'Movie review', pl: 'Przegląd filmowy' },
        settings_kinooglad_desc: { uk: 'Увімкнути розділ Кіноогляд у меню. Налаштування каналів нижче.', ru: 'Включить раздел Кинообзор в меню. Настройки каналов ниже.', en: 'Enable the Movie review section in the menu. Channel settings below.', pl: 'Włącz sekcję Przegląd filmowy w menu. Ustawienia kanałów poniżej.' },
        settings_badges_title: { uk: 'Мітки на картках', ru: 'Метки на карточках', en: 'Badges on cards', pl: 'Etykiety na kartach' },
        settings_badge_ru_name: { uk: 'Російська озвучка (RU)', ru: 'Русская озвучка (RU)', en: 'Russian audio (RU)', pl: 'Rosyjski dubbing (RU)' },
        settings_badge_ru_desc: { uk: 'Показувати мітку наявності російського дубляжу', ru: 'Показывать метку наличия русского дубляжа', en: 'Show badge when Russian dub is available', pl: 'Pokazuj etykietę, gdy jest rosyjski dubbing' },
        settings_badge_ua_name: { uk: 'Українська озвучка (UA)', ru: 'Украинская озвучка (UA)', en: 'Ukrainian audio (UA)', pl: 'Ukraiński dubbing (UA)' },
        settings_badge_ua_desc: { uk: 'Показувати мітку наявності українського дубляжу', ru: 'Показывать метку наличия украинского дубляжа', en: 'Show badge when Ukrainian dub is available', pl: 'Pokazuj etykietę, gdy jest ukraiński dubbing' },
        settings_badge_en_name: { uk: 'Англійська озвучка (EN)', ru: 'Английская озвучка (EN)', en: 'English audio (EN)', pl: 'Angielski dubbing (EN)' },
        settings_badge_en_desc: { uk: 'Показувати мітку наявності англійської доріжки', ru: 'Показывать метку наличия английской дорожки', en: 'Show badge when English track is available', pl: 'Pokazuj etykietę, gdy jest angielska ścieżka' },
        settings_badge_4k_name: { uk: 'Якість 4K', ru: 'Качество 4K', en: '4K quality', pl: 'Jakość 4K' },
        settings_badge_4k_desc: { uk: 'Показувати мітку наявності 4K роздільної здатності', ru: 'Показывать метку наличия 4K разрешения', en: 'Show badge when 4K resolution is available', pl: 'Pokazuj etykietę, gdy dostępne jest 4K' },
        settings_badge_fhd_name: { uk: 'Якість FHD', ru: 'Качество FHD', en: 'FHD quality', pl: 'Jakość FHD' },
        settings_badge_fhd_desc: { uk: 'Показувати мітку наявності Full HD роздільної здатності', ru: 'Показывать метку наличия Full HD разрешения', en: 'Show badge when Full HD is available', pl: 'Pokazuj etykietę, gdy dostępne jest Full HD' },
        settings_badge_hdr_name: { uk: 'HDR / Dolby Vision', ru: 'HDR / Dolby Vision', en: 'HDR / Dolby Vision', pl: 'HDR / Dolby Vision' },
        settings_badge_hdr_desc: { uk: 'Показувати мітку наявності HDR або Dolby Vision', ru: 'Показывать метку наличия HDR или Dolby Vision', en: 'Show badge when HDR or Dolby Vision is available', pl: 'Pokazuj etykietę, gdy dostępne jest HDR lub Dolby Vision' },
        settings_tmdb_input_name: { uk: 'Свій ключ TMDB', ru: 'Свой ключ TMDB', en: 'Custom TMDB key', pl: 'Własny klucz TMDB' },
        settings_tmdb_input_placeholder: { uk: 'Ключ TMDB (опційно)', ru: 'Ключ TMDB (опционально)', en: 'TMDB key (optional)', pl: 'Klucz TMDB (opcjonalnie)' },
        settings_tmdb_input_desc: { uk: 'Якщо вказати — плагін використовуватиме його замість ключа Лампи.', ru: 'Если указать — плагин будет использовать его вместо ключа Лампы.', en: 'If set, the plugin will use it instead of Lampa\'s key.', pl: 'Jeśli ustawisz, plugin użyje go zamiast klucza Lampy.' },
        menu_title: { uk: 'Меню', ru: 'Меню', en: 'Menu', pl: 'Menu' },
        menu_details: { uk: 'Детальніше', ru: 'Подробнее', en: 'Details', pl: 'Szczegóły' },
        menu_trailer: { uk: 'Трейлер', ru: 'Трейлер', en: 'Trailer', pl: 'Zwiastun' },
        loading_trailer: { uk: 'Завантаження трейлера...', ru: 'Загрузка трейлера...', en: 'Loading trailer...', pl: 'Ładowanie zwiastuna...' },
        kino_settings_title: { uk: 'Кіноогляд: Налаштування каналів YouTube', ru: 'Кинообзор: Настройки каналов YouTube', en: 'Movie review: YouTube channels settings', pl: 'Przegląd filmowy: ustawienia kanałów YouTube' },
        kino_add_channel_name: { uk: 'Додати канал', ru: 'Добавить канал', en: 'Add channel', pl: 'Dodaj kanał' },
        kino_add_channel_desc: { uk: 'Посилання YouTube або @нік', ru: 'Ссылка YouTube или @ник', en: 'YouTube link or @handle', pl: 'Link YouTube lub @nazwa' },
        kino_add_channel_input: { uk: 'Посилання на канал або @нік', ru: 'Ссылка на канал или @ник', en: 'Channel link or @handle', pl: 'Link do kanału lub @nazwa' },
        kino_channel_generic: { uk: 'Канал', ru: 'Канал', en: 'Channel', pl: 'Kanał' },
        kino_reset_name: { uk: 'Скинути налаштування каналів', ru: 'Сбросить настройки каналов', en: 'Reset channel settings', pl: 'Zresetuj ustawienia kanałów' },
        kino_reset_desc: { uk: 'Очистити список каналів', ru: 'Очистить список каналов', en: 'Clear channel list', pl: 'Wyczyść listę kanałów' },
        kino_channel_enabled: { uk: 'Увімкнено', ru: 'Включено', en: 'Enabled', pl: 'Włączony' },
        kino_channel_disabled: { uk: 'Вимкнено', ru: 'Выключено', en: 'Disabled', pl: 'Wyłączony' },
        kino_channel_delete_btn: { uk: 'Видалити канал', ru: 'Удалить канал', en: 'Delete channel', pl: 'Usuń kanał' },
        kino_menu_title: { uk: 'Кіноогляд', ru: 'Кинообзор', en: 'Movie review', pl: 'Przegląd filmowy' },
        kino_ch_navkolo_kino: {
            uk: 'Навколо Кіно',
            ru: 'Вокруг кино',
            en: 'Around Cinema',
            pl: 'Wokół kina'
        },
        kino_ch_serialy_kino: {
            uk: 'СЕРІАЛИ та КІНО',
            ru: 'СЕРИАЛЫ и КИНО',
            en: 'Series and Movies',
            pl: 'Seriale i kino'
        },
        kino_ch_ekino_ua: {
            uk: 'eKinoUA',
            ru: 'eKinoUA',
            en: 'eKinoUA',
            pl: 'eKinoUA'
        },
        kino_ch_zagin_kinomaniv: {
            uk: 'Загін Кіноманів',
            ru: 'Отряд киноманов',
            en: 'Cinephiles Squad',
            pl: 'Oddział kinomanów'
        },
        kino_ch_moi_dumky: {
            uk: 'Мої думки про кіно',
            ru: 'Мои мысли о кино',
            en: 'My Thoughts About Cinema',
            pl: 'Moje myśli o kinie'
        },
        kino_ch_kino_navuvorit: {
            uk: 'КІНО НАВИВОРІТ',
            ru: 'КИНО НАИЗНАНКУ',
            en: 'Cinema Inside Out',
            pl: 'Kino na lewą stronę'
        }
    };

    function tr(key) {
        var pack = CINEMAX_I18N[key];
        if (!pack) return key;
        return pack[CINEMAX_LANG] || pack.uk || pack.en || key;
    }
    var SERVICE_CONFIGS = {
        'netflix': {
            title: 'Netflix',
            logo: 'logos/netflix.svg',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 2L16.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L7.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L16.5 22" stroke="#E50914" stroke-width="4"/></svg>',
            categories: [
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { "title": tr('cat_only_netflix'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "vote_average.desc", "vote_count.gte": "500", "vote_average.gte": "7.5" } },
                { "title": tr('cat_twisted_thrillers'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "with_genres": "53,9648", "sort_by": "popularity.desc" } },
                { "title": tr('cat_fantasy_sci'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_kdrama'), "url": "discover/tv", "params": { "with_networks": "213", "with_original_language": "ko", "sort_by": "popularity.desc" } },
                { "title": tr('cat_truecrime_doc'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "99", "with_keywords": "9840|10714", "sort_by": "popularity.desc" } },
                { "title": tr('cat_anime'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "16", "with_keywords": "210024", "sort_by": "popularity.desc" } }
            ]
        },
        'apple': {
            title: 'Apple TV+',
            logo: 'logos/apple.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { "title": tr('cat_apple_epic_sci'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedy_feelgood'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_quality_detectives'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "9648,80", "sort_by": "popularity.desc" } },
                { "title": tr('cat_apple_original'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "vote_average.desc", "vote_count.gte": "100" } }
            ]
        },
        'hbo': {
            title: 'HBO / Max',
            logo: 'logos/hbo.svg',
            icon: '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2.795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0 2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76zm-7.665-3.936c.387 0 .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634zm.005-3.633c.387 0 .692.382.692.817 0 .436-.305.818-.692.818h-1.33V9.373zm1.77 2.607c.305-.039.813-.387.992-.61-.063.276-.068 1.074.006 1.35-.204-.314-.688-.701-.998-.74zm3.43 0a2.462 2.462 0 1 1 4.924 0 2.462 2.462 0 0 1-4.925 0zm2.462 1.936a1.936 1.936 0 1 0 0-3.872 1.936 1.936 0 0 0 0 3.872z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "49|3186", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "174|49", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "49|3186", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies_wb'), "url": "discover/movie", "params": { "with_companies": "174", "sort_by": "popularity.desc", "vote_count.gte": "50" } },
                { "title": tr('cat_epic_sagas'), "url": "discover/tv", "params": { "with_networks": "49|3186", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_premium_dramas'), "url": "discover/tv", "params": { "with_networks": "49", "with_genres": "18", "without_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_dc_blockbusters'), "url": "discover/movie", "params": { "with_companies": "174", "with_keywords": "9715", "sort_by": "revenue.desc" } },
                { "title": tr('cat_dark_detectives'), "url": "discover/tv", "params": { "with_networks": "49", "with_genres": "80,9648", "sort_by": "vote_average.desc", "vote_count.gte": "300" } },
                { "title": tr('cat_hbo_classics'), "url": "discover/tv", "params": { "with_networks": "49", "sort_by": "vote_average.desc", "vote_count.gte": "1000" } }
            ]
        },
        'amazon': {
            title: 'Prime Video',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 15c2.4 1.7 5.1 2.6 8 2.6 2.9 0 5.6-.9 8-2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M15.5 14.4L18 16.8 15.5 19.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "1024", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "119", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "1024", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "119", "watch_region": "US", "sort_by": "popularity.desc" } },
                { "title": tr('cat_hard_action'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "10759,10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_amazon_mgm'), "url": "discover/movie", "params": { "with_companies": "1024|21", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedies'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_thrillers'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "9648,18", "sort_by": "vote_average.desc", "vote_count.gte": "300" } }
            ]
        },
        'disney': {
            title: 'Disney+',
            logo: 'logos/disney.svg',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10c2.2-2.5 5-3.7 8-3.7 2.2 0 4.1.7 5.8 1.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M12 13v4M10 15h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "2739", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "337", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "2739", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "2", "sort_by": "popularity.desc" } },
                { "title": tr('cat_marvel_universe'), "url": "discover/movie", "params": { "with_companies": "420", "sort_by": "release_date.desc", "vote_count.gte": "100" } },
                { "title": tr('cat_starwars'), "url": "discover/tv", "params": { "with_companies": "1", "with_keywords": "1930", "sort_by": "popularity.desc" } },
                { "title": tr('cat_pixar'), "url": "discover/movie", "params": { "with_companies": "3", "sort_by": "popularity.desc" } },
                { "title": tr('cat_fx_star'), "url": "discover/tv", "params": { "with_networks": "88|453", "sort_by": "popularity.desc" } }
            ]
        },
        'paramount': {
            title: 'Paramount+',
            logo: 'logos/paramount.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22H22L12 2ZM12 6.5L18.5 19.5H5.5L12 6.5Z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "4330", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "4330", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "popularity.desc" } },
                { "title": tr('cat_sheridan_universe'), "url": "discover/tv", "params": { "with_networks": "318|4330", "with_keywords": "256112", "sort_by": "popularity.desc" } },
                { "title": tr('cat_startrek_collection'), "url": "discover/tv", "params": { "with_networks": "4330", "with_keywords": "159223", "sort_by": "first_air_date.desc" } },
                { "title": tr('cat_crime_investigation'), "url": "discover/tv", "params": { "with_networks": "16", "with_genres": "80,18", "sort_by": "popularity.desc" } },
                { "title": tr('cat_kids_world'), "url": "discover/tv", "params": { "with_networks": "13", "sort_by": "popularity.desc" } }
            ]
        },
        'sky_showtime': {
            title: 'Sky Showtime',
            logo: 'logos/SkyShowtime.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 9.5c1-.8 2.2-1.2 3.5-1.2 2 0 3.7 1 4.7 2.6" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_companies": "67|115331", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "4|33|521", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_companies": "67|115331", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "4|33", "sort_by": "popularity.desc" } },
                { "title": tr('cat_paramount_blockbusters'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "revenue.desc" } },
                { "title": tr('cat_universal_world'), "url": "discover/movie", "params": { "with_companies": "33", "sort_by": "popularity.desc" } },
                { "title": tr('cat_showtime_adult'), "url": "discover/tv", "params": { "with_companies": "67", "sort_by": "popularity.desc" } },
                { "title": tr('cat_dreamworks_worlds'), "url": "discover/movie", "params": { "with_companies": "521", "sort_by": "popularity.desc" } }
            ]
        },
        'hulu': {
            title: 'Hulu',
            logo: 'logos/Hulu.svg',
            icon: '<svg viewBox="0 0 24 24" fill="#3DBB3D"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "453", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "15", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "453", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "15", "watch_region": "US", "sort_by": "popularity.desc" } },
                { "title": tr('cat_truecrime_doc'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "18,9648", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedy_feelgood'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_adult_animation'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "16", "sort_by": "popularity.desc" } }
            ]
        },
        'syfy': {
            title: 'Syfy',
            logo: 'logos/Syfy.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>',
            categories: [
                { "title": tr('cat_new_releases_syfy'), "url": "discover/tv", "params": { "with_networks": "77", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "1" } },
                { "title": tr('cat_top_syfy'), "url": "discover/tv", "params": { "with_networks": "77", "sort_by": "popularity.desc" } },
                { "title": tr('cat_space_travel'), "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "10765", "with_keywords": "3801", "sort_by": "vote_average.desc", "vote_count.gte": "50" } },
                { "title": tr('cat_monsters_paranormal'), "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "9648,10765", "without_keywords": "3801", "sort_by": "popularity.desc" } }
            ]
        },
        'educational_and_reality': {
            title: tr('educational_title'),
            logo: 'logos/Discovery.svg',
            icon: '<svg viewBox="0 0 24 24" fill="#FF9800"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
            categories: [
                { "title": tr('cat_new_episodes'), "url": "discover/tv", "params": { "with_networks": "64|91|43|2696|4|65", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": "🌍 Discovery Channel", "url": "discover/tv", "params": { "with_networks": "64", "sort_by": "popularity.desc" } },
                { "title": "🦁 National Geographic", "url": "discover/tv", "params": { "with_networks": "43", "sort_by": "popularity.desc" } },
                { "title": "🐾 Animal Planet", "url": "discover/tv", "params": { "with_networks": "91", "sort_by": "popularity.desc" } },
                { "title": "🌿 BBC Earth", "url": "discover/tv", "params": { "with_networks": "4", "with_genres": "99", "sort_by": "vote_average.desc", "vote_count.gte": "20" } },
                { "title": tr('cat_cooking_battles'), "url": "discover/tv", "params": { "with_genres": "10764", "with_keywords": "222083", "sort_by": "popularity.desc" } },
                { "title": tr('cat_survival'), "url": "discover/tv", "params": { "with_genres": "10764", "with_keywords": "5481|10348", "sort_by": "popularity.desc" } }
            ]
        }
    };


    function getTmdbKey() {
        var custom = (Lampa.Storage.get('cinemax_tmdb_apikey') || '').trim();
        return custom || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '');
    }

    /** Для рядка на головній: HBO/Prime/Paramount через watch_providers (TMDB), щоб отримувати і фільми, і серіали з актуальним контентом. */
    var SERVICE_WATCH_PROVIDERS_FOR_ROW = { hbo: '384', amazon: '119', paramount: '531' };

    // =================================================================
    // GLOBAL PLAYER HELPER
    // =================================================================
    function playYouTubeCustom(key) {
        var overlay = $('<div class="youtube-pro-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; background: #000;"></div>');
        var playerContainer = $('<div id="yt-player-custom"></div>');
        var loader = $('<div class="yt-loader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #fff; font-size: 1.5em; font-weight: bold; text-align: center;"><div class="broadcast__scan"></div><div>' + tr('loading_trailer') + '</div></div>');
        
        overlay.append(loader);
        overlay.append(playerContainer);
        $('body').append(overlay);
        
        var closePlayer = function() {
            overlay.remove();
            Lampa.Controller.toggle('content'); 
        };
        
        Lampa.Controller.add('youtube_custom_controller', {
            toggle: function() {}, up: function() {}, down: function() {}, left: function() {}, right: function() {},
            enter: function() {}, back: closePlayer
        });
        Lampa.Controller.toggle('youtube_custom_controller');
        
        var initPlayer = function() {
            new YT.Player('yt-player-custom', {
                height: '100%',
                width: '100%',
                videoId: key,
                playerVars: { 'autoplay': 1, 'controls': 1, 'showinfo': 0, 'rel': 0, 'modestbranding': 1, 'iv_load_policy': 3, 'playsinline': 1, 'disablekb': 1, 'fs': 0 },
                events: {
                    'onReady': function(event) { 
                        loader.remove(); // Hide loader
                        event.target.playVideo(); 
                    },
                    'onStateChange': function(event) {
                        if (event.data === 0) { // 0 = ended
                            closePlayer();
                        }
                    },
                    'onError': function(e) { 
                        if (e.data == 150 || e.data == 153) Lampa.Noty.show('Відео обмежено власником (Error ' + e.data + ')');
                        else Lampa.Noty.show('Помилка YouTube: ' + e.data);
                        closePlayer();
                    }
                }
            });
        };
        
        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            var oldReady = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function() { if(oldReady) oldReady(); initPlayer(); };
        } else {
            initPlayer();
        }
    }

    // =================================================================
    // UTILS & COMPONENTS
    // =================================================================

    // Один елемент геро-рядка (backdrop + overlay). heightEm — висота банеру (напр. 28).
    function StudiosView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();

        function buildUrl(page) {
            var params = [];
            params.push('api_key=' + getTmdbKey());
            params.push('language=' + Lampa.Storage.get('language', 'uk'));
            params.push('page=' + page);

            if (object.params) {
                for (var key in object.params) {
                    var val = object.params[key];
                    if (val === '{current_date}') {
                        var d = new Date();
                        val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    }
                    params.push(key + '=' + val);
                }
            }
            return Lampa.TMDB.api(object.url + '?' + params.join('&'));
        }

        comp.create = function () {
            var _this = this;
            network.silent(buildUrl(1), function (json) {
                // FIX: Ensure all items have poster_path for display
                // If backdrop_path exists but poster_path doesn't, use backdrop_path
                if (json && json.results && Array.isArray(json.results)) {
                    json.results.forEach(function (item) {
                        if (!item.poster_path && item.backdrop_path) {
                            item.poster_path = item.backdrop_path;
                        }
                    });
                }
                _this.build(json);
            }, this.empty.bind(this));
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            network.silent(buildUrl(object.page), resolve, reject);
        };

        return comp;
    }

    // =================================================================
    // ПІДПИСКИ НА СТУДІЇ (CinemaX — інтегровано з studio_subscription)
    // =================================================================
    var CinemaXStudioSubscription = (function () {
        var storageKey = 'cinemax_subscription_studios';

        function getParams() {
            var raw = Lampa.Storage.get(storageKey, '[]');
            return typeof raw === 'string' ? (function () { try { return JSON.parse(raw); } catch (e) { return []; } })() : (Array.isArray(raw) ? raw : []);
        }

        function setParams(params) {
            Lampa.Storage.set(storageKey, params);
        }

        function add(company) {
            var c = { id: company.id, name: company.name || '', logo_path: company.logo_path || '' };
            var studios = getParams();
            if (!studios.find(function (s) { return String(s.id) === String(c.id); })) {
                studios.push(c);
                setParams(studios);
                Lampa.Noty.show(Lampa.Lang.translate('title_bookmarked') || 'Додано в підписки');
            }
        }

        function remove(company) {
            var studios = getParams();
            var idx = studios.findIndex(function (c) { return c.id === company.id; });
            if (idx !== -1) {
                studios.splice(idx, 1);
                setParams(studios);
                Lampa.Noty.show(Lampa.Lang.translate('title_unbookmarked'));
            }
        }

        function isSubscribed(company) {
            return !!getParams().find(function (c) { return c.id === company.id; });
        }

        function injectButton(object) {
            var attempts = 0;
            var interval = setInterval(function () {
                var nameEl = $('.company-start__name');
                var company = object.company;
                if (!nameEl.length || !company || !company.id) {
                    attempts++;
                    if (attempts > 25) clearInterval(interval);
                    return;
                }
                clearInterval(interval);
                if (nameEl.find('.studio-subscription-btn').length) return;

                var btn = $('<div class="studio-subscription-btn selector"></div>');

                function updateState() {
                    var sub = isSubscribed(company);
                    btn.text(sub ? 'Відписатися' : 'Підписатися');
                    btn.removeClass('studio-subscription-btn--sub studio-subscription-btn--unsub').addClass(sub ? 'studio-subscription-btn--unsub' : 'studio-subscription-btn--sub');
                }

                function doToggle() {
                    if (isSubscribed(company)) remove(company);
                    else add({ id: company.id, name: company.name || '', logo_path: company.logo_path || '' });
                    updateState();
                }

                btn.on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    doToggle();
                });
                btn.on('hover:enter', doToggle);

                updateState();
                nameEl.append(btn);

                // Auto-focus the subscription button so it's visible immediately
                setTimeout(function () {
                    try {
                        if (Lampa.Controller && Lampa.Controller.collectionFocus) {
                            Lampa.Controller.collectionFocus(btn[0]);
                        }
                    } catch (e) { }
                }, 300);
            }, 200);
        }

        function registerComponent() {
            // Удален компонент "Мои подписки"
        }

        return {
            init: function () {
                var existing = Lampa.Storage.get(storageKey, '[]');
                var fromOld = Lampa.Storage.get('subscription_studios', '[]');
                if ((!existing || existing === '[]' || (Array.isArray(existing) && !existing.length)) && fromOld && fromOld !== '[]') {
                    try {
                        var arr = typeof fromOld === 'string' ? JSON.parse(fromOld) : fromOld;
                        if (Array.isArray(arr) && arr.length) setParams(arr);
                    } catch (e) { }
                }
                registerComponent();
            }
        };
    })();

    // =================================================================
    // MAIN PAGE ROWS
    // =================================================================

    // ========== Прибираємо секцію Shots ==========
    function removeShotsSection() {
        function doRemove() {
            $('.items-line').each(function () {
                var title = $(this).find('.items-line__title').text().trim();
                if (title === 'Shots' || title === 'shots') {
                    $(this).remove();
                }
            });
        }
        // Виконуємо із затримкою, бо Shots може підвантажитись пізніше
        setTimeout(doRemove, 1000);
        setTimeout(doRemove, 3000);
        setTimeout(doRemove, 6000);
    }

    // ========== ROW 1: HERO SLIDER (New Releases) ==========
    function StudiosMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var config = SERVICE_CONFIGS[object.service_id];
        if (!config) { comp.empty && comp.empty(); return comp; }

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var categories = config.categories;
            var network = new Lampa.Reguest();
            var total = categories.length; // No hero section
            var status = new Lampa.Status(total);

            status.onComplite = function () {
                var fulldata = [];
                // Hero section removed - only show categories
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var num = parseInt(key, 10);
                        var data = status.data[key];
                        var cat = categories[num];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params,
                                service_id: object.service_id
                            });
                        }
                    });
                }

                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            var refCat = categories.find(function (c) { return c.params && (c.params.with_watch_providers || c.params.with_networks || c.params.with_companies); });
            var filterSuffix = '';
            if (refCat && refCat.params) {
                if (refCat.params.with_watch_providers) {
                    filterSuffix = '&with_watch_providers=' + refCat.params.with_watch_providers + '&watch_region=' + (refCat.params.watch_region || 'UA');
                } else if (refCat.params.with_networks) {
                    filterSuffix = '&with_networks=' + refCat.params.with_networks;
                } else if (refCat.params.with_companies) {
                    filterSuffix = '&with_companies=' + refCat.params.with_companies;
                }
            }

            // Hero section removed - just load categories
            categories.forEach(function (cat, index) {
                var params = [];
                params.push('api_key=' + getTmdbKey());
                params.push('language=' + Lampa.Storage.get('language', 'uk'));
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));

                console.log('[StudiosMain] Category', index + 1, ':', cat.title, 'URL:', url);

                network.silent(url, function (json) {
                    console.log('[StudiosMain] Category', index + 1, 'data received:', json);
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(index.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'cinemax_extract_studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Українська стрічка» — фільми/серіали/шоу українського виробництва (TMDB)
    // Жанри TV: Reality 10764, Talk 10767
    var UKRAINIAN_FEED_CATEGORIES = [
        { title: tr('ua_new_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ua_new_tv'), url: 'discover/tv', params: { with_origin_country: 'UA', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ua_shows'), url: 'discover/tv', params: { with_origin_country: 'UA', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('ua_trending_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'popularity.desc' } },
        { title: tr('ua_trending_series'), url: 'discover/tv', params: { with_origin_country: 'UA', sort_by: 'popularity.desc' } },
        { title: tr('ua_best_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'CINEMAX_UA_MOVIES', title: tr('ua_all_movies') },
        { type: 'from_global', globalKey: 'CINEMAX_UA_SERIES', title: tr('ua_all_series') }
    ];

    function UkrainianFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = UKRAINIAN_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_origin_country: 'UA' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths for all items
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'cinemax_extract_studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Польська стрічка» — фільми/серіали/шоу польського виробництва (TMDB)
    var POLISH_FEED_CATEGORIES = [
        { title: tr('pl_new_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('pl_new_tv'), url: 'discover/tv', params: { with_origin_country: 'PL', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('pl_shows'), url: 'discover/tv', params: { with_origin_country: 'PL', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('pl_trending_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'popularity.desc' } },
        { title: tr('pl_trending_series'), url: 'discover/tv', params: { with_origin_country: 'PL', sort_by: 'popularity.desc' } },
        { title: tr('pl_best_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'CINEMAX_PL_MOVIES', title: tr('pl_all_movies') },
        { type: 'from_global', globalKey: 'CINEMAX_PL_SERIES', title: tr('pl_all_series') },
        { type: 'from_global', globalKey: 'CINEMAX_PL_SHOWS', title: tr('pl_all_shows') }
    ];

    function PolishFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = POLISH_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_origin_country: 'PL' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'cinemax_extract_studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Російська стрічка» — фільми/серіали/шоу російською мовою (TMDB)
    var RUSSIAN_FEED_CATEGORIES = [
        { title: tr('ru_new_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ru_new_tv'), url: 'discover/tv', params: { with_original_language: 'ru', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ru_shows'), url: 'discover/tv', params: { with_original_language: 'ru', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('ru_trending_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'popularity.desc' } },
        { title: tr('ru_trending_series'), url: 'discover/tv', params: { with_original_language: 'ru', sort_by: 'popularity.desc' } },
        { title: tr('ru_best_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'CINEMAX_RU_MOVIES', title: tr('ru_all_movies') },
        { type: 'from_global', globalKey: 'CINEMAX_RU_SERIES', title: tr('ru_all_series') },
        { type: 'from_global', globalKey: 'CINEMAX_RU_SHOWS', title: tr('ru_all_shows') }
    ];

    function RussianFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = RUSSIAN_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_original_language: 'ru' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'cinemax_extract_studios_view',
                page: 1
            });
        };

        return comp;
    }

    function makeHeroResultItem(movie, heightEm) {
        if (!$('#cinemax-extract-hero-css').length) {
            $('body').append('<style id="cinemax-extract-hero-css">.hero-banner .card-marks, .hero-banner .card__icons, .hero-banner .card__quality { display: none !important; }</style>');
        }
        if (!$('#cinemax-extract-show-more-css').length) {
            $('body').append('<style id="cinemax-extract-show-more-css">' +
                '.show-more-button.focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.card.show-more-button:focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.kino-card.show-more-button:hover { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.kino-card.show-more-button.focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
            '</style>');
        }
        heightEm = heightEm || 22.5;
        var pad = (heightEm / 35 * 2).toFixed(1);
        var titleEm = (heightEm / 35 * 2.5).toFixed(2);
        var descEm = (heightEm / 35 * 1.1).toFixed(2);

        var renderHeroContent = function(item, movie) {
            item.empty(); // Clear existing content
            item.append('<div class="hero-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: ' + pad + 'em; border-radius: 0 0 1em 1em;">' +
                '<div class="hero-header" style="margin-bottom: 0.3em; min-height: 3em; display: flex; align-items: flex-end;">' +
                    '<div class="hero-title" style="font-size: ' + titleEm + 'em; font-weight: bold; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">' + (movie.title || movie.name) + '</div>' +
                '</div>' +
                '<div class="hero-meta" style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5em; font-size: 0.9em; color: #ccc; margin-bottom: 0.5em;"></div>' +
                '<div class="hero-desc" style="font-size: ' + descEm + 'em; color: #ddd; max-width: 60%; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.6em;">' + (movie.overview || '') + '</div>' +
                '<div class="hero-trailer-btn selector" style="display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.2); padding: 0.4em 0.8em; border-radius: 0.3em; cursor: pointer; transition: background 0.2s;">' +
                '<svg style="width: 1.2em; height: 1.2em; margin-right: 0.4em;" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
                '<span style="font-size: 0.9em; font-weight: 600;">Трейлер</span>' +
                '</div>' +
                '</div>');
            
            // Trailer Click
            item.find('.hero-trailer-btn').on('hover:enter click', function (e) {
                e.stopPropagation();
                var network = new Lampa.Reguest();
                var type = movie.name ? 'tv' : 'movie';
                var lang = Lampa.Storage.get('language', 'uk');
                function search(searchLang) {
                    var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                    network.silent(url, function (json) {
                        var videos = json.results || [];
                        var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                        if (trailer && trailer.key) {
                            playYouTubeCustom(trailer.key);
                        } else if (searchLang !== 'en-US') {
                            search('en-US');
                        } else {
                            Lampa.Noty.show('Трейлер не знайдено');
                        }
                    }, function() {
                            if (searchLang !== 'en-US') search('en-US');
                            else Lampa.Noty.show('Помилка пошуку трейлера');
                    });
                }
                search(lang);
            });

            // Fetch Details
            var type = movie.name ? 'tv' : 'movie';
            var lang = Lampa.Storage.get('language', 'uk');
            var url = Lampa.TMDB.api(type + '/' + movie.id + '?api_key=' + getTmdbKey() + '&language=' + lang + '&append_to_response=images,release_dates,content_ratings');
            
            var network = new Lampa.Reguest();
            network.silent(url, function(details) {
                // Logo
                var logo = null;
                if (details.images && details.images.logos && details.images.logos.length) {
                    logo = details.images.logos.find(function(l) { return l.iso_639_1 === lang; }) || 
                           details.images.logos.find(function(l) { return l.iso_639_1 === 'en'; }) || 
                           details.images.logos[0];
                }
                if (logo) {
                    var logoUrl = Lampa.TMDB.image('t/p/w500' + logo.file_path);
                    item.find('.hero-title').html('<img src="' + logoUrl + '" style="height: 4em; width: auto; max-width: 80%; object-fit: contain; display: block;" />');
                    item.find('.hero-header').css('min-height', 'auto');
                }

                // Metadata
                var metaParts = [];
                
                // Rating & Year
                var headMeta = '';
                var rating = details.vote_average || movie.vote_average;
                if (rating) headMeta += '<span class="card__mark card__mark--rating" style="position: static; margin: 0 0.5em 0 0; padding: 0.2em 0.5em; font-size: 0.9em; background: rgba(255,255,255,0.2); border-radius: 0.3em;">★ ' + parseFloat(rating).toFixed(1) + '</span>';
                
                var date = details.release_date || details.first_air_date || movie.release_date || movie.first_air_date;
                if (date) headMeta += parseInt(date);
                
                if (headMeta) metaParts.push(headMeta);
                
                // Type
                var typeStr = type === 'movie' ? Lampa.Lang.translate('movie') : Lampa.Lang.translate('tv');
                if (!typeStr || typeStr === 'movie' || typeStr === 'tv') {
                    typeStr = type === 'movie' ? (lang === 'ru' ? 'Фильм' : 'Фільм') : (lang === 'ru' ? 'Сериал' : 'Серіал');
                }
                metaParts.push(typeStr);
                
                // Age Rating
                var age = '';
                if (type === 'movie' && details.release_dates && details.release_dates.results) {
                    var rel = details.release_dates.results.find(function(r) { return r.iso_3166_1 === 'US' || r.iso_3166_1 === 'RU'; });
                    if (rel && rel.release_dates && rel.release_dates.length) age = rel.release_dates[0].certification;
                } else if (type === 'tv' && details.content_ratings && details.content_ratings.results) {
                    var rat = details.content_ratings.results.find(function(r) { return r.iso_3166_1 === 'US' || r.iso_3166_1 === 'RU'; });
                    if (rat) age = rat.rating;
                }
                if (age) {
                    var ageColor = '#fff';
                    var ageVal = parseInt(age);
                    var displayAge = age;

                    if (!isNaN(ageVal)) {
                        displayAge = ageVal + '+';
                        if (ageVal >= 18) ageColor = '#d32f2f'; // Red
                        else if (ageVal >= 16) ageColor = '#f57c00'; // Orange
                        else if (ageVal >= 12) ageColor = '#fbc02d'; // Yellow
                        else ageColor = '#388e3c'; // Green
                    } else {
                        // US Ratings Mapping
                        if (['R', 'NC-17', 'TV-MA'].indexOf(age) !== -1) {
                            ageColor = '#d32f2f';
                            displayAge = '18+';
                        } else if (['PG-13', 'TV-14'].indexOf(age) !== -1) {
                            ageColor = '#f57c00';
                            displayAge = '16+';
                        } else if (['PG', 'TV-PG', 'TV-Y7'].indexOf(age) !== -1) {
                            ageColor = '#fbc02d';
                            displayAge = '12+';
                        } else {
                            ageColor = '#388e3c';
                            displayAge = '0+';
                        }
                    }
                    metaParts.push('<span style="border: 1px solid ' + ageColor + '; color: ' + ageColor + '; padding: 0 0.3em; border-radius: 0.2em; font-size: 0.9em; font-weight: bold;">' + displayAge + '</span>');
                }

                // Country
                if (details.production_countries && details.production_countries.length) {
                    metaParts.push(details.production_countries[0].iso_3166_1);
                }
                
                // Duration
                var runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : 0);
                if (runtime) {
                    var h = Math.floor(runtime / 60);
                    var m = runtime % 60;
                    var hStr = h > 0 ? h + (lang === 'ru' ? 'ч.' : 'год.') : '';
                    var mStr = m > 0 ? m + (lang === 'ru' ? 'м.' : 'хв.') : '';
                    if (hStr || mStr) metaParts.push((hStr + ' ' + mStr).trim());
                }

                if (metaParts.length) {
                    item.find('.hero-meta').html('<span>' + metaParts.join('</span><span>') + '</span>');
                }
            });
        };

        return {
            title: 'Hero',
            params: {
                createInstance: function (element) {
                    var card = Lampa.Maker.make('Card', element, function (module) { return module.only('Card', 'Callback'); });
                    return card;
                },
                emit: {
                    onCreate: function () {
                        var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original' + movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original' + movie.poster_path) : '');
                        try {
                            var item = $(this.html);
                            item.addClass('hero-banner');
                            item.css({
                                'background-image': 'url(' + img + ')',
                                'width': '100%',
                                'height': heightEm + 'em',
                                'background-size': 'cover',
                                'background-position': 'center',
                                'border-radius': '1em',
                                'position': 'relative',
                                'box-shadow': '0 0 20px rgba(0,0,0,0.5)',
                                'margin-bottom': '10px'
                            });
                            
                            renderHeroContent(item, movie);

                            item.find('.card__view').remove();
                            item.find('.card__title').remove();
                            item.find('.card__age').remove();
                            item.find('.card-marks').remove();
                            item.find('.card__icons').remove();
                            item[0].heroMovieData = movie;
                        } catch (e) { console.log('Hero onCreate error:', e); }
                    },
                    onVisible: function () {
                        try {
                            var item = $(this.html);
                            if (!item.hasClass('hero-banner')) {
                                var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original' + movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original' + movie.poster_path) : '');
                                item.addClass('hero-banner');
                                item.css({
                                    'background-image': 'url(' + img + ')',
                                    'width': '100%',
                                    'height': heightEm + 'em',
                                    'background-size': 'cover',
                                    'background-position': 'center',
                                    'border-radius': '1em',
                                    'position': 'relative',
                                    'box-shadow': '0 0 20px rgba(0,0,0,0.5)',
                                    'margin-bottom': '10px'
                                });
                                
                                renderHeroContent(item, movie);

                                item.find('.card__view').remove();
                                item.find('.card__title').remove();
                                item.find('.card__age').remove();
                                item.find('.card-marks').remove();
                                item.find('.card__icons').remove();
                                item[0].heroMovieData = movie;
                            }
                            // Stop default image loading
                            if (this.img) this.img.onerror = function () { };
                            if (this.img) this.img.onload = function () { };
                        } catch (e) { console.log('Hero onVisible error:', e); }
                    },
                    onlyEnter: function () {
                        // Функция запуска трейлера (копируем логику из кнопки)
                        var playHeroTrailer = function() {
                             var network = new Lampa.Reguest();
                             var type = movie.name ? 'tv' : 'movie';
                             var lang = Lampa.Storage.get('language', 'uk');
                            
                            function search(searchLang) {
                                var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                                network.silent(url, function (json) {
                                    var videos = json.results || [];
                                    var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                                    if (trailer && trailer.key) {
                                        playYouTubeCustom(trailer.key);
                                    } else if (searchLang !== 'en-US') {
                                        search('en-US');
                                    } else {
                                        Lampa.Noty.show('Трейлер не знайдено');
                                    }
                                }, function() {
                                     if (searchLang !== 'en-US') search('en-US');
                                     else Lampa.Noty.show('Помилка пошуку трейлера');
                                });
                            }
                            search(lang);
                        };

                        // Меню выбора действия
                        Lampa.Select.show({
                            title: tr('menu_title'),
                            items: [
                                { title: tr('menu_details'), action: 'open' },
                                { title: tr('menu_trailer'), action: 'trailer' }
                            ],
                            onSelect: function(a) {
                                if(a.action === 'trailer') {
                                    playHeroTrailer();
                                } else {
                                    Lampa.Activity.push({
                                        url: '',
                                        component: 'full',
                                        id: movie.id,
                                        method: movie.name ? 'tv' : 'movie',
                                        card: movie,
                                        source: 'tmdb'
                                    });
                                }
                            }
                        });
                    },
                    onKey: function(key) {
                        if (key === 'play') {
                           // Копия логики запуска трейлера (можно вынести в отдельную функцию выше, но здесь дублируем для надежности области видимости)
                           var playHeroTrailerKey = function() {
                                  var network = new Lampa.Reguest();
                                  var type = movie.name ? 'tv' : 'movie';
                                  var lang = Lampa.Storage.get('language', 'uk');
                                  
                                function search(searchLang) {
                                    var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                                    network.silent(url, function (json) {
                                        var videos = json.results || [];
                                        var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                                        if (trailer && trailer.key) { playYouTubeCustom(trailer.key); } 
                                        else if (searchLang !== 'en-US') { search('en-US'); } 
                                        else { Lampa.Noty.show('Трейлер не знайдено'); }
                                    });
                                }
                                search(lang);
                           };
                           playHeroTrailerKey();
                        }
                    }
                }
            }
        };
    }

    function addHeroRow() {
        Lampa.ContentRows.add({
            index: 0,
            name: 'cinemax_extract_hero_row',
            title: tr('hero_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    // Fetch Now Playing movies (Fresh releases)
                    var url = Lampa.TMDB.api('movie/now_playing?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk') + '&region=UA');

                    network.silent(url, function (json) {
                        var items = json.results || [];
                        if (!items.length) {
                            // Fallback if no fresh movies
                            url = Lampa.TMDB.api('trending/all/week?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk'));
                            network.silent(url, function (retryJson) {
                                items = retryJson.results || [];
                                build(items);
                            });
                            return;
                        }
                        build(items);

                        function build(movies) {
                            var moviesWithBackdrop = movies.filter(function (m) { return m.backdrop_path; });
                            var results = moviesWithBackdrop.slice(0, 15).map(function (movie) { return makeHeroResultItem(movie, 22.5); });

                            callback({
                                results: results,
                                title: tr('hero_row_title_full'),
                                params: {
                                    items: {
                                        mapping: 'line',
                                        view: 15
                                    }
                                }
                            });
                        }

                    }, function () {
                        callback({ results: [] });
                    });
                };
            }
        });
    }

    // White Lampa-style icons for the two CinemaX section headers.
    // v2: vanilla DOM only. No $.trim and no jQuery dependency here.
    function installCinemaXHeaderIcons() {
        if (document.getElementById('cinemax-header-icons-css')) return;

        var style = document.createElement('style');
        style.id = 'cinemax-header-icons-css';
        style.textContent =
            '.cinemax-section-icon{' +
            'display:inline-flex;align-items:center;justify-content:center;' +
            'width:1.02em;height:1.02em;margin-right:.36em;' +
            'vertical-align:-.12em;color:#fff;opacity:.96;' +
            '}' +
            '.cinemax-section-icon svg{width:100%;height:100%;display:block;}' +
            '.cinemax-section-icon path,.cinemax-section-icon rect{' +
            'vector-effect:non-scaling-stroke;' +
            '}';
        document.head.appendChild(style);

        function addIcon(titleText, type) {
            var selectors = '.row__title, .row__title-text, .category__title, .category__title-text';
            var nodes = document.querySelectorAll(selectors);

            for (var i = 0; i < nodes.length; i++) {
                var el = nodes[i];
                if (!el || el.getAttribute('data-cinemax-icon')) continue;

                var text = (el.textContent || '').replace(/\\s+/g, ' ').trim();
                if (text !== titleText) continue;

                var span = document.createElement('span');
                span.className = 'cinemax-section-icon';
                span.setAttribute('aria-hidden', 'true');

                if (type === 'fire') {
                    span.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13.2 2.2c.5 3.1-.6 4.8-2.1 6.1-1.3-1.2-1.6-2.9-1.3-4.3-3.1 2.1-5.1 5.1-5.1 8.6 0 4.4 3.3 7.5 8 7.5s8-3.2 8-7.7c0-3.4-2.1-6.6-5.2-9.2-.1 2.1-.8 3.4-1.7 4.4.2-2-.1-3.6-.6-5.4z"/></svg>';
                } else {
                    span.innerHTML = '<svg viewBox="0 0 24 24"><r
