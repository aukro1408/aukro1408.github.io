/**
 * Flixio — Новинки проката + Стриминги (standalone extraction)
 * Based on the supplied Flixio.js source.
 * This plugin intentionally does NOT replace Lampa's main TMDB API loader,
 * so it can coexist with other home-page plugins.
 */
(function(){
    'use strict';
    if (typeof Lampa === 'undefined') return;
    if (window.FLIXIO_EXTRACT_LOADED) return;
    window.FLIXIO_EXTRACT_LOADED = true;

    var FLIXIO_LANG = (Lampa.Storage.get('language', 'uk') || 'uk').toLowerCase();
    if (FLIXIO_LANG === 'ua') FLIXIO_LANG = 'uk';
    if (['uk','ru','en','pl'].indexOf(FLIXIO_LANG) === -1) FLIXIO_LANG = 'en';

    var FLIXIO_I18N = {
        hero_row_title: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        hero_row_title_full: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        streamings_row_title: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        streamings_row_title_full: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        ukrainian_feed_name: { uk: 'Українська стрічка', ru: 'Украинская лента', en: 'Ukrainian feed', pl: 'Ukraiński feed' },
        polish_feed_name: { uk: 'Польська стрічка', ru: 'Польская лента', en: 'Polish feed', pl: 'Polski feed' },
        russian_feed_name: { uk: 'Російська стрічка', ru: 'Русская лента', en: 'Russian feed', pl: 'Rosyjski feed' },
        ru_new_movies: { uk: '🔥 Нові фільми', ru: '🔥 Новые фильмы', en: '🔥 New movies', pl: '🔥 Nowe filmy' },
        ru_new_tv: { uk: '🔥 Нові серіали', ru: '🔥 Новые сериалы', en: '🔥 New series', pl: '🔥 Nowe seriale' },
        ru_shows: { uk: '🎤 Шоу та Реаліті', ru: '🎤 Шоу и реалити', en: '🎤 Shows & Reality', pl: '🎤 Show i Reality' },
        ru_trending_movies: { uk: '📈 Популярні фільми', ru: '📈 Популярные фильмы', en: '📈 Trending movies', pl: '📈 Popularne filmy' },
        ru_trending_series: { uk: '📈 Популярні серіали', ru: '📈 Популярные сериалы', en: '📈 Trending series', pl: '📈 Popularne seriale' },
        ru_best_movies: { uk: '⭐ Найкращі фільми', ru: '⭐ Лучшие фильмы', en: '⭐ Best movies', pl: '⭐ Najlepsze filmy' },
        ru_all_movies: { uk: '🎬 Всі фільми (Ru)', ru: '🎬 Все фильмы (Ru)', en: '🎬 All movies (Ru)', pl: '🎬 Wszystkie filmy (Ru)' },
        ru_all_series: { uk: '📺 Всі серіали (Ru)', ru: '📺 Все сериалы (Ru)', en: '📺 All series (Ru)', pl: '📺 Wszystkie seriale (Ru)' },
        ru_all_shows: { uk: '🎤 Всі шоу (Ru)', ru: '🎤 Все шоу (Ru)', en: '🎤 All shows (Ru)', pl: '🎤 Wszystkie show (Ru)' },
        ukrainian_row_title: { uk: 'Новинки української стрічки', ru: 'Новинки украинской ленты', en: 'New in Ukrainian feed', pl: 'Nowości w ukraińskiej sekcji' },
        ukrainian_row_title_full: { uk: '🇺🇦 Новинки української стрічки', ru: '🇺🇦 Новинки украинской ленты', en: '🇺🇦 New in Ukrainian feed', pl: '🇺🇦 Nowości w ukraińskiej sekcji' },
        polish_row_title: { uk: 'Новинки польської стрічки', ru: 'Новинки польской ленты', en: 'New in Polish feed', pl: 'Nowości w polskiej sekcji' },
        polish_row_title_full: { uk: '🇵🇱 Новинки польської стрічки', ru: '🇵🇱 Новинки польской ленты', en: '🇵🇱 New in Polish feed', pl: '🇵🇱 Nowości w polskiej секcji' },
        russian_row_title: { uk: 'Новинки російської стрічки', ru: 'Новинки Русской ленты', en: 'New in Russian feed', pl: 'Nowości w rosyjskiej sekcji' },
        russian_row_title_full: { uk: '🇷🇺 Новинки російської стрічки', ru: '🇷🇺 Новинки Русской ленты', en: '🇷🇺 New in Russian feed', pl: '🇷🇺 Nowości w rosyjskiej sekcji' },
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
        settings_tab_title: { uk: 'Ліхтар', ru: 'Flixio', en: 'Flixio', pl: 'Flixio' },
        settings_header_info: { uk: 'Ліхтар — кастомна головна сторінка з стрімінгами, мітками якості та українською озвучкою. Автор: Flixio Team', ru: 'Flixio — кастомная главная страница со стримингами, метками качества и украинской озвучкой. Автор: Flixio Team', en: 'Flixio — custom home screen with streamings, quality badges and Ukrainian audio. Author: Flixio Team', pl: 'Flixio — niestandardowa strona główna ze streamingami, oznaczeniami jakości i ukraińskim dubbingiem. Autor: Flixio Team' },
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
        var pack = FLIXIO_I18N[key];
        if (!pack) return key;
        return pack[FLIXIO_LANG] || pack.uk || pack.en || key;
    }

    // Белые минималистичные иконки в заголовках двух оставленных рядов.
    function addSectionTitleIcons() {
        var icons = {
            releases: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.2 2.8c.5 3.3-1.5 4.8-3.1 6.7-1.1 1.3-1.7 2.6-1.7 4.3a4.7 4.7 0 0 0 9.4 0c0-2.4-1.1-4.2-2.7-5.9-.5 1.6-1.2 2.5-2.3 3.4.1-3.2.5-5.4.6-8.5Z"/><path d="M12 13.2c1.1 1.1 1.6 2 1.6 3a1.6 1.6 0 1 1-3.2 0c0-.8.5-1.8 1.6-3Z"/></svg>',
            streaming: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M10 9.5l5 2.5-5 2.5z"/></svg>'
        };
        var labels = {
            releases: tr('hero_row_title_full'),
            streaming: tr('streamings_row_title_full')
        };

        function decorate() {
            $('.items-line__title, .row__title').each(function () {
                var title = $(this);
                if (title.find('.flixio-section-icon').length) return;
                var text = $.trim(title.text());
                var type = text === labels.releases ? 'releases' : (text === labels.streaming ? 'streaming' : '');
                if (type) title.prepend('<span class="flixio-section-icon flixio-section-icon--' + type + '">' + icons[type] + '</span>');
            });
        }

        $('body').append('<style id="flixio-section-icons-css">.flixio-section-icon{display:inline-flex;vertical-align:-.17em;width:1.12em;height:1.12em;margin-right:.42em;color:#fff}.flixio-section-icon svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}.flixio-section-icon--releases svg path:last-child{fill:currentColor;stroke:none}</style>');
        decorate();
        new MutationObserver(decorate).observe(document.body, { childList: true, subtree: true });
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
        var custom = (Lampa.Storage.get('flixio_tmdb_apikey') || '').trim();
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
    // ПІДПИСКИ НА СТУДІЇ (Ліхтар — інтегровано з studio_subscription)
    // =================================================================
    var FlixioStudioSubscription = (function () {
        var storageKey = 'flixio_subscription_studios';

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
                component: 'flixio_extract_studios_view',
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
        { type: 'from_global', globalKey: 'FLIXIO_UA_MOVIES', title: tr('ua_all_movies') },
        { type: 'from_global', globalKey: 'FLIXIO_UA_SERIES', title: tr('ua_all_series') }
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
                component: 'flixio_extract_studios_view',
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
        { type: 'from_global', globalKey: 'FLIXIO_PL_MOVIES', title: tr('pl_all_movies') },
        { type: 'from_global', globalKey: 'FLIXIO_PL_SERIES', title: tr('pl_all_series') },
        { type: 'from_global', globalKey: 'FLIXIO_PL_SHOWS', title: tr('pl_all_shows') }
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
                component: 'flixio_extract_studios_view',
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
        { type: 'from_global', globalKey: 'FLIXIO_RU_MOVIES', title: tr('ru_all_movies') },
        { type: 'from_global', globalKey: 'FLIXIO_RU_SERIES', title: tr('ru_all_series') },
        { type: 'from_global', globalKey: 'FLIXIO_RU_SHOWS', title: tr('ru_all_shows') }
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
                component: 'flixio_extract_studios_view',
                page: 1
            });
        };

        return comp;
    }

    function makeHeroResultItem(movie, heightEm) {
        if (!$('#flixio-extract-hero-css').length) {
            $('body').append('<style id="flixio-extract-hero-css">.hero-banner .card-marks, .hero-banner .card__icons, .hero-banner .card__quality { display: none !important; }</style>');
        }
        if (!$('#flixio-extract-show-more-css').length) {
            $('body').append('<style id="flixio-extract-show-more-css">' +
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
            name: 'flixio_extract_hero_row',
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

    // ========== ROW 2: STUDIOS (Moved Up) ==========
    function addStudioRow() {
    var studios = [
        { 
            id: 'netflix', 
            name: 'Netflix', 
            svg: '<svg viewBox="0 0 256 69" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35.2 64.726c-3.85.676-7.77.88-11.823 1.42L11.013 29.93V67.7c-3.85.405-7.364.946-11.013 1.486V0h10.27l14.053 39.255V0H35.2v64.726zm21.283-39.39l14.46-.203v10.8l-14.46.203v16.08l19.12-1.15v10.404l-29.93 2.365V0h29.93v10.8h-19.12v14.526zm59.32-14.526H104.59v49.727l-10.8.135V10.81H82.564V0h33.24v10.81zm17.567 13.783h14.797v10.8H133.37V59.93h-10.608V0h30.202v10.8H133.37v13.783zm37.16 25.877c6.15.135 12.364.608 18.377.946V62.09l-29.187-1.42V0h10.8v50.47zm27.5 12.364c3.446.203 7.094.406 10.607.81V0H198.03v62.835zM256 0l-13.716 32.904L256 69.186c-4.054-.54-8.108-1.284-12.162-1.96l-7.77-19.998-7.904 18.378c-3.92-.676-7.703-.88-11.62-1.42l13.918-31.688L217.894 0h11.62l7.094 18.175L244.176 0H256z" fill="#E50914"/></svg>', 
            providerId: '8' 
        },
        { 
            id: 'megogo', 
            name: 'MEGOGO', 
            svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="15 27 56 32.2"><path d="M23 37.7427V33.5028C23 29.5323 27.1293 26.8716 30.8059 28.4731L40.887 32.8642C42.3163 33.4868 43.9447 33.4868 45.3741 32.8642L55.4551 28.4731C59.1317 26.8716 63.2611 29.5323 63.2611 33.5028V37.7427M23 50.696V52.6991C23 55.7349 25.4904 58.1958 28.5624 58.1958H57.6987C60.7707 58.1958 63.2611 55.7349 63.2611 52.6991V50.696" stroke="#22C3B1" stroke-width="2"/><path d="M21.3881 41.175V47.4379H19.7955V44.0649L18.2746 46.579H18.1135L16.6015 44.0738V47.4379H15V41.175H16.6015L18.194 43.8502L19.7955 41.175H21.3881Z" fill="black"/><path d="M27.2948 45.9348H29.7194V47.4379H25.6933V41.175H29.6747V42.6692H27.2948V43.537H29.451V45.0133H27.2948V45.9348Z" fill="black"/><path d="M39.9661 43.8502V44.4854C39.9661 45.4039 39.6768 46.1495 39.0982 46.7221C38.5256 47.2888 37.78 47.5721 36.8615 47.5721C35.8833 47.5721 35.0781 47.2589 34.4458 46.6327C33.8195 46.0064 33.5064 45.234 33.5064 44.3154C33.5064 43.3969 33.8195 42.6215 34.4458 41.9892C35.0721 41.357 35.8475 41.0408 36.772 41.0408C37.3565 41.0408 37.8904 41.1721 38.3735 41.4345C38.8626 41.6969 39.2443 42.0459 39.5187 42.4813L38.1588 43.2597C38.0335 43.0628 37.8486 42.9048 37.6041 42.7855C37.3655 42.6662 37.0941 42.6065 36.7899 42.6065C36.2948 42.6065 35.8893 42.7676 35.5731 43.0897C35.257 43.4118 35.0989 43.8233 35.0989 44.3244C35.0989 44.8075 35.254 45.2161 35.5642 45.5501C35.8803 45.8841 36.3217 46.0511 36.8883 46.0511C37.616 46.0511 38.0962 45.7767 38.3288 45.228H36.8078V43.8502H39.9661Z" fill="black"/><path d="M49.39 46.6327C48.7578 47.2589 47.9824 47.5721 47.0638 47.5721C46.1453 47.5721 45.3669 47.2589 44.7287 46.6327C44.0964 46.0004 43.7803 45.225 43.7803 44.3065C43.7803 43.3879 44.0964 42.6155 44.7287 41.9892C45.3669 41.357 46.1453 41.0408 47.0638 41.0408C47.9824 41.0408 48.7578 41.357 49.39 41.9892C50.0282 42.6155 50.3473 43.3879 50.3473 44.3065C50.3473 45.225 50.0282 46.0004 49.39 46.6327ZM45.856 45.5322C46.1781 45.8483 46.5807 46.0064 47.0638 46.0064C47.547 46.0064 47.9496 45.8483 48.2717 45.5322C48.5937 45.2101 48.7548 44.8015 48.7548 44.3065C48.7548 43.8114 48.5937 43.4058 48.2717 43.0897C47.9496 42.7676 47.547 42.6065 47.0638 42.6065C46.5807 42.6065 46.1781 42.7676 45.856 43.0897C45.5339 43.4058 45.3729 43.8114 45.3729 44.3065C45.3729 44.8015 45.5339 45.2101 45.856 45.5322Z" fill="black"/><path d="M60.6187 43.8502V44.4854C60.6187 45.4039 60.3294 46.1495 59.7509 46.7221C59.1783 47.2888 58.4327 47.5721 57.5142 47.5721C56.536 47.5721 55.7307 47.2589 55.0985 46.6327C54.4722 46.0064 54.1591 45.234 54.1591 44.3154C54.1591 43.3969 54.4722 42.6215 55.0985 41.9892C55.7248 41.357 56.5002 41.0408 57.4247 41.0408C58.0092 41.0408 58.543 41.1721 59.0262 41.4345C59.5153 41.6969 59.897 42.0459 60.1714 42.4813L58.8115 43.2597C58.6862 43.0628 58.5013 42.9048 58.2567 42.7855C58.0182 42.6662 57.7468 42.6065 57.4426 42.6065C56.9475 42.6065 56.5419 42.7676 56.2258 43.0897C55.9097 43.4118 55.7516 43.8233 55.7516 44.3244C55.7516 44.8075 55.9067 45.2161 56.2169 45.5501C56.533 45.8841 56.9744 46.0511 57.541 46.0511C58.2687 46.0511 58.7488 45.7767 58.9814 45.228H57.4605V43.8502H60.6187Z" fill="black"/><path d="M70.0427 46.6327C69.4104 47.2589 68.635 47.5721 67.7165 47.5721C66.7979 47.5721 66.0196 47.2589 65.3813 46.6327C64.7491 46.0004 64.433 45.225 64.433 44.3065C64.433 43.3879 64.7491 42.6155 65.3813 41.9892C66.0196 41.357 66.7979 41.0408 67.7165 41.0408C68.635 41.0408 69.4104 41.357 70.0427 41.9892C70.6809 42.6155 71 43.3879 71 44.3065C71 45.225 70.6809 46.0004 70.0427 46.6327ZM66.5087 45.5322C66.8307 45.8483 67.2334 46.0064 67.7165 46.0064C68.1996 46.0064 68.6022 45.8483 68.9243 45.5322C69.2464 45.2101 69.4075 44.8015 69.4075 44.3065C69.4075 43.8114 69.2464 43.4058 68.9243 43.0897C68.6022 42.7676 68.1996 42.6065 67.7165 42.6065C67.2334 42.6065 66.8307 42.7676 66.5087 43.0897C66.1866 43.4058 66.0255 43.8114 66.0255 44.3065C66.0255 44.8015 66.1866 45.2101 66.5087 45.5322Z" fill="black"/></svg>', 
            providerId: 'megogo' 
        },
        { 
            id: 'disney', 
            name: 'Disney+', 
            svg: '<svg viewBox="0 0 1041 565" xmlns="http://www.w3.org/2000/svg"><path fill="#113CCF" fill-rule="evenodd" d="M735.8 365.7 C721.4 369 683.5 370.9 683.5 370.9 L678.7 385.9 C678.7 385.9 697.6 384.3 711.4 385.7 711.4 385.7 715.9 385.2 716.4 390.8 716.6 396 716 401.6 716 401.6 716 401.6 715.7 405 710.9 405.8 705.7 406.7 670.1 408 670.1 408 L664.3 427.5 C664.3 427.5 662.2 432 667 430.7 671.5 429.5 708.8 422.5 713.7 423.5 718.9 424.8 724.7 431.7 723 438.1 721 445.9 683.8 469.7 661.1 468 661.1 468 649.2 468.8 639.1 452.7 629.7 437.4 642.7 408.3 642.7 408.3 642.7 408.3 636.8 394.7 641.1 390.2 641.1 390.2 643.7 387.9 651.1 387.3 L660.2 368.4 C660.2 368.4 649.8 369.1 643.6 361.5 637.8 354.2 637.4 350.9 641.8 348.9 646.5 346.6 689.8 338.7 719.6 339.7 719.6 339.7 730 338.7 738.9 356.7 738.8 356.7 743.2 364 735.8 365.7 Z M623.7 438.3 C619.9 447.3 609.8 456.9 597.3 450.9 584.9 444.9 565.2 404.6 565.2 404.6 565.2 404.6 557.7 389.6 556.3 389.9 556.3 389.9 554.7 387 553.7 403.4 552.7 419.8 553.9 451.7 547.4 456.7 541.2 461.7 533.7 459.7 529.8 453.8 526.3 448 524.8 434.2 526.7 410 529 385.8 534.6 360 541.8 351.9 549 343.9 554.8 349.7 557 351.8 557 351.8 566.6 360.5 582.5 386.1 L585.3 390.8 C585.3 390.8 599.7 415 601.2 414.9 601.2 414.9 602.4 416 603.4 415.2 604.9 414.8 604.3 407 604.3 407 604.3 407 601.3 380.7 588.2 336.1 588.2 336.1 586.2 330.5 587.6 325.3 588.9 320 594.2 322.5 594.2 322.5 594.2 322.5 614.6 332.7 624.4 365.9 634.1 399.4 627.5 429.3 623.7 438.3 Z M523.5 353 C521.8 356.4 520.8 361.3 512.2 362.6 512.2 362.6 429.9 368.2 426 374 426 374 423.1 377.4 427.6 378.4 432.1 379.3 450.7 381.8 459.7 382.3 469.3 382.4 501.7 382.7 513.3 397.2 513.3 397.2 520.2 404.1 519.9 419.7 519.6 435.7 516.8 441.3 510.6 447.1 504.1 452.5 448.3 477.5 412.3 439.1 412.3 439.1 395.7 420.6 418 406.6 418 406.6 434.1 396.9 475 408.3 475 408.3 487.4 412.8 486.8 417.3 486.1 422.1 476.6 427.2 462.8 426.9 449.4 426.5 439.6 420.1 441.5 421.1 443.3 421.8 427.1 413.3 422.1 419.1 417.1 424.4 418.3 427.7 423.2 431 435.7 438.1 484 435.6 498.4 419.6 498.4 419.6 504.1 413.1 495.4 407.8 486.7 402.8 461.8 399.8 452.1 399.3 442.8 398.8 408.2 399.4 403.2 390.2 403.2 390.2 398.2 384 403.7 366.4 409.5 348 449.8 340.9 467.2 339.3 467.2 339.3 515.1 337.6 523.9 347.4 523.8 347.4 525 349.7 523.5 353 Z M387.5 460.9 C381.7 465.2 369.4 463.3 365.9 458.5 362.4 454.2 361.2 437.1 361.9 410.3 362.6 383.2 363.2 349.6 369 344.3 375.2 338.9 379 343.6 381.4 347.3 384 350.9 387.1 354.9 387.8 363.4 388.4 371.9 390.4 416.5 390.4 416.5 390.4 416.5 393 456.7 387.5 460.9 Z M400 317.1 C383.1 322.7 371.5 320.8 361.7 316.6 357.4 324.1 354.9 326.4 351.6 326.9 346.8 327.4 342.5 319.7 341.7 317.2 340.9 315.3 338.6 312.1 341.4 304.5 331.8 295.9 331.1 284.3 332.7 276.5 335.1 267.5 351.3 233.3 400.6 229.3 400.6 229.3 424.7 227.5 428.8 240.4 L429.5 240.4 C429.5 240.4 452.9 240.5 452.4 261.3 452.1 282.2 426.4 308.2 400 317.1 Z M354 270.8 C349 278.8 348.8 283.6 351.1 286.9 356.8 278.2 367.2 264.5 382.5 254.1 370.7 255.1 360.8 260.2 354 270.8 Z M422.1 257.4 C406.6 259.7 382.6 280.5 371.2 297.5 388.7 300.7 419.6 299.5 433.3 271.6 433.2 271.6 439.8 254.3 422.1 257.4 Z M842.9 418.5 C833.6 434.7 807.5 468.5 772.7 460.6 761.2 488.5 751.6 516.6 746.1 558.8 746.1 558.8 744.9 567 738.1 564.1 731.4 561.7 720.2 550.5 718 535 715.6 514.6 724.7 480.1 743.2 440.6 737.8 431.8 734.1 419.2 737.3 401.3 737.3 401.3 742 368.1 775.3 338.1 775.3 338.1 779.3 334.6 781.6 335.7 784.2 336.8 783 347.6 780.9 352.8 778.8 358 763.9 383.8 763.9 383.8 763.9 383.8 754.6 401.2 757.2 414.9 774.7 388 814.5 333.7 839.2 350.8 847.5 356.7 851.3 369.6 851.3 383.5 851.2 395.8 848.3 408.8 842.9 418.5 Z M835.7 375.9 C835.7 375.9 834.3 365.2 823.9 377 814.9 386.9 798.7 405.6 785.6 430.9 799.3 429.4 812.5 421.9 816.5 418.1 823 412.3 838.1 396.7 835.7 375.9 Z M350.2 389.5 C348.3 413.7 339 454.4 273.1 474.5 229.6 487.6 188.5 481.3 166.1 475.6 165.6 484.5 164.6 488.3 163.2 489.8 161.3 491.7 147.1 499.9 139.3 488.3 135.8 482.8 134 472.8 133 463.9 82.6 440.7 59.4 407.3 58.5 405.8 57.4 404.7 45.9 392.7 57.4 378 68.2 364.7 103.5 351.4 135.3 346 136.4 318.8 139.6 298.3 143.4 288.9 148 278 153.8 287.8 158.8 295.2 163 300.7 165.5 324.4 165.7 343.3 186.5 342.3 198.8 343.8 222 348 252.2 353.5 272.4 368.9 270.6 386.4 269.3 403.6 253.5 410.7 247.5 411.2 241.2 411.7 231.4 407.2 231.4 407.2 224.7 404 230.9 401.2 239 397.7 247.8 393.4 245.8 389 245.8 389 242.5 379.4 203.3 372.7 164.3 372.7 164.1 394.2 165.2 429.9 165.7 450.7 193 455.9 213.4 454.9 213.4 454.9 213.4 454.9 313 452.1 316 388.5 319.1 324.8 216.7 263.7 141 244.3 65.4 224.5 22.6 238.3 18.9 240.2 14.9 242.2 18.6 242.8 18.6 242.8 18.6 242.8 22.7 243.4 29.8 245.8 37.3 248.2 31.5 252.1 31.5 252.1 18.6 256.2 4.1 253.6 1.3 247.7 -1.5 241.8 3.2 236.5 8.6 228.9 14 220.9 19.9 221.2 19.9 221.2 113.4 188.8 227.3 247.4 227.3 247.4 334 301.5 352.2 364.9 350.2 389.5 Z M68 386.2 C57.4 391.4 64.7 398.9 64.7 398.9 84.6 420.3 109.1 433.7 132.4 442 135.1 405.1 134.7 392.1 135 373.5 98.6 376 77.6 381.8 68 386.2 Z" /><path fill="#113CCF" fill-rule="evenodd" d="M1040.9 378.6 L1040.9 391.8 C1040.9 394.7 1038.6 397 1035.7 397 L972.8 397 C972.8 400.3 972.9 403.2 972.9 405.9 972.9 425.4 972.1 441.3 970.2 459.2 969.9 461.9 967.7 463.9 965.1 463.9 L951.5 463.9 C950.1 463.9 948.8 463.3 947.9 462.3 947 461.3 946.5 459.9 946.7 458.5 948.6 440.7 949.5 425 949.5 405.9 949.5 403.1 949.5 400.2 949.4 397 L887.2 397 C884.3 397 882 394.7 882 391.8 L882 378.6 C882 375.7 884.3 373.4 887.2 373.4 L948.5 373.4 C947.2 351.9 944.6 331.2 940.4 310.2 940.2 308.9 940.5 307.6 941.3 306.6 942.1 305.6 943.3 305 944.6 305 L959.3 305 C961.6 305 963.5 306.6 964 308.9 968.1 330.6 970.7 351.7 972 373.4 L1035.7 373.4 C1038.5 373.4 1040.9 375.8 1040.9 378.6 Z" /><path fill="#113CCF" fill-rule="evenodd" d="M200.2 204.3 L200.1 204.3 M199.4 204.4 C199.1 204.4 198.8 204.3 198.5 204.3 198.8 204.4 199.1 204.4 199.4 204.4 L199.7 204.4 C199.6 204.4 199.5 204.4 199.4 204.4 Z M199.4 204.4 C199.1 204.4 198.8 204.3 198.5 204.3 198.8 204.4 199.1 204.4 199.4 204.4 L199.7 204.4 C199.6 204.4 199.5 204.4 199.4 204.4 Z" /><path fill="#113CCF" fill-rule="evenodd" d="M955.3 273.9 C922.8 194 867.9 125.9 796.5 76.9 723.4 26.8 637.7 0.3 548.7 0.3 401.5 0.3 264.9 73.4 183.4 195.9 182.5 197.2 182.3 198.9 182.8 200.4 183.3 202 184.5 203.1 186 203.6 L197.4 207.5 C198.1 207.7 198.8 207.8 199.4 207.8 201.5 207.8 203.5 206.7 204.7 205 242.1 150 292.7 104.3 351.1 72.7 411.4 40.1 479.7 22.8 548.6 22.8 631.9 22.8 712.2 47.4 781 93.8 848.1 139.1 900.2 202.4 931.7 276.7 932.6 278.9 934.8 280.4 937.2 280.4 L950.8 280.4 C952.4 280.4 953.9 279.6 954.7 278.3 955.7 277 955.9 275.4 955.3 273.9 Z M199.4 204.4 C199.1 204.4 198.8 204.3 198.5 204.2 198.8 204.3 199.1 204.4 199.4 204.4 L199.6 204.4 C199.6 204.4 199.5 204.4 199.4 204.4 Z M934.4 278.6 C934.7 278.8 935 279 935.3 279.1 935 278.9 934.7 278.8 934.4 278.6 Z" /></svg>', 
            providerId: '337' 
        },
        { 
            id: 'hbo', 
            name: 'HBO', 
            svg: '<svg viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg"><path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2.795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0 2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76zm-7.665-3.936c.387 0 .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634zm.005-3.633c.387 0 .692.382.692.817 0 .436-.305.818-.692.818h-1.33V9.373zm1.77 2.607c.305-.039.813-.387.992-.61-.063.276-.068 1.074.006 1.35-.204-.314-.688-.701-.998-.74zm3.43 0a2.462 2.462 0 1 1 4.924 0 2.462 2.462 0 0 1-4.925 0zm2.462 1.936a1.936 1.936 0 1 0 0-3.872 1.936 1.936 0 0 0 0 3.872Z"/></svg>', 
            providerId: '384' 
        },
        { 
            id: 'apple', 
            name: 'Apple TV+', 
            svg: '<svg viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg"><path d="M20.57 17.735h-1.815l-3.34-9.203h1.633l2.02 5.987c.075.231.273.9.586 2.012l.297-.997.33-1.006 2.094-6.004H24zm-5.344-.066a5.76 5.76 0 0 1-1.55.207c-1.23 0-1.84-.693-1.84-2.087V9.646h-1.063V8.532h1.121V7.081l1.476-.602v2.062h1.707v1.113H13.38v5.805c0 .446.074.75.214.932.14.182.396.264.75.264.207 0 .495-.041.883-.115zm-7.29-5.343c.017 1.764 1.55 2.358 1.567 2.366-.017.042-.248.842-.808 1.658-.487.71-.99 1.418-1.79 1.435-.783.016-1.03-.462-1.93-.462-.89 0-1.17.445-1.913.478-.758.025-1.344-.775-1.838-1.484-.998-1.451-1.765-4.098-.734-5.88.51-.89 1.426-1.451 2.416-1.46.75-.016 1.468.512 1.93.512.461 0 1.327-.627 2.234-.536.38.016 1.452.157 2.136 1.154-.058.033-1.278.743-1.27 2.219M6.468 7.988c.404-.495.685-1.18.61-1.864-.585.025-1.294.388-1.723.883-.38.437-.71 1.138-.619 1.806.652.05 1.328-.338 1.732-.825Z"/></svg>', 
            providerId: '350' 
        },
        { 
            id: 'amazon', 
            name: 'Prime Video', 
            svg: '<svg viewBox="0 -.1 800.3 246.4" xmlns="http://www.w3.org/2000/svg"><path d="m396.5 246.3v-.4c.4-.5 1.1-.8 1.7-.7 2.9-.1 5.7-.1 8.6 0 .6 0 1.3.2 1.7.7v.4z" fill="#00a8e1"/><path d="m408.5 245.9c-4-.1-8-.1-12 0-5.5-.3-11-.5-16.5-.9-14.6-1.1-29.1-3.3-43.3-6.6-49.1-11.4-92.2-34.3-129.8-67.6-3.5-3.1-6.8-6.3-10.2-9.5-.8-.7-1.5-1.7-1.9-2.7-.6-1.4-.3-2.9.7-4s2.6-1.5 4-.9c.9.4 1.8.8 2.6 1.3 35.9 22.2 75.1 38.4 116.2 48 13.8 3.2 27.7 5.7 41.7 7.5 20.1 2.5 40.4 3.4 60.6 2.7 10.9-.3 21.7-1.3 32.5-2.7 25.2-3.2 50.1-8.9 74.2-16.9 12.7-4.2 25.1-9 37.2-14.6 1.8-1 4-1.3 6-.8 3.3.8 5.3 4.2 4.5 7.5-.1.4-.3.9-.5 1.3-.8 1.5-1.9 2.8-3.3 3.8-11.5 9-23.9 16.9-37 23.5-24.7 12.5-51.1 21.4-78.3 26.5-15.7 2.8-31.5 4.5-47.4 5.1zm-148.1-202.7c2.5-1.5 5.1-3.1 7.8-4.5 7-3.6 14.8-5.4 22.7-5 5.7.3 10.9 1.9 14.9 6.1 3.8 3.9 5.2 8.7 5.6 13.9.1 1.1.1 2.2.1 3.4v51.8c0 4.5-.6 5.1-5.1 5.1h-12.2c-.8 0-1.6 0-2.4-.1-1.2-.1-2.2-1.1-2.4-2.3-.2-1.1-.2-2.2-.2-3.3v-46.3c.1-1.9-.1-3.7-.6-5.5-.8-3.1-3.6-5.3-6.8-5.5-5.9-.4-11.8.8-17.2 3.3-.8.2-1.3 1-1.2 1.8v52.6c0 1 0 1.9-.2 2.9 0 1.4-1.1 2.4-2.5 2.4-1.5.1-3 .1-4.6.1h-10.6c-3.7 0-4.5-.9-4.5-4.6v-47.3c0-1.7-.1-3.5-.5-5.2-.7-3.4-3.6-5.8-7-6-6-.4-12.1.8-17.5 3.4-.8.2-1.3 1.1-1.1 1.9v53.3c0 3.7-.8 4.5-4.5 4.5h-13.4c-3.5 0-4.4-1-4.4-4.4v-69.4c0-.8.1-1.6.3-2.4.4-1.2 1.6-1.9 2.8-1.9h12.5c1.8 0 2.9 1.1 3.5 2.8.5 1.4.8 2.7 1.3 4.2 1 0 1.6-.7 2.3-1.1 5.5-3.4 11.3-6.3 17.8-7.5 5-1 10-1 15 0 4.7 1 8.9 3.8 11.6 7.8.2.3.4.5.6.7-.1.1 0 .1.1.3z" fill="#00a8e1"/><path d="m467.7 93c.6-2 1.2-3.9 1.8-5.9 4.6-15.5 9.2-30.9 13.8-46.4l.6-1.8c.5-1.8 2.2-2.9 4-2.9h15.2c3.8 0 4.6 1.1 3.3 4.7l-6 15.9c-6.7 17.4-13.4 34.9-20.1 52.3-.2.6-.5 1.2-.7 1.8-.7 2.1-2.8 3.5-5 3.3-4.4-.1-8.8-.1-13.2 0-3.1.1-4.9-1.3-6-4.1-2.5-6.6-5.1-13.3-7.6-19.9-6-15.7-12.1-31.4-18.1-47.2-.6-1.2-1-2.6-1.3-3.9-.3-2 .4-3 2.4-3 5.7-.1 11.4 0 17 0 2.4 0 3.5 1.6 4.1 3.7 1.1 3.8 2.2 7.7 3.4 11.5 4.1 13.9 8.1 27.9 12.2 41.8-.1.1 0 .1.2.1z" fill="#000000"/><path d="m112.6 47c.7-.2 1.3-.6 1.7-1.2 1.8-1.8 3.7-3.5 5.7-5.1 5.2-4 11.7-6 18.2-5.5 2.6.1 3.5.9 3.7 3.4.2 3.4.1 6.9.1 10.3.1 1.4 0 2.7-.2 4.1-.4 1.8-1.1 2.5-2.9 2.7-1.4.1-2.7 0-4.1-.1-6.7-.6-13.2.7-19.5 2.8-1.4.5-1.4 1.5-1.4 2.6v48c0 .9 0 1.7-.1 2.6-.1 1.3-1.1 2.3-2.4 2.3-.7.1-1.5.1-2.2.1h-13c-.7 0-1.5 0-2.2-.1-1.3-.1-2.3-1.2-2.4-2.5-.1-.8-.1-1.6-.1-2.4v-68c0-4.6.5-5.1 5.1-5.1h9.6c2.6 0 3.8.9 4.5 3.4s1.3 5 1.9 7.7zm467.8 101.4c6.6.2 13.1.6 19.5 2.3 1.8.5 3.5 1.1 5.2 1.9 2.3.9 3.8 3.1 4.1 5.5.4 2.8.5 5.7.3 8.6-1.3 17.1-6.6 33.6-15.4 48.3-3.2 5.3-7.1 10.1-11.6 14.3-.9.9-2 1.6-3.2 2-1.9.5-3.1-.5-3.2-2.4.1-1 .3-2 .7-3 3.5-9.4 6.9-18.7 9.6-28.4 1.6-5.3 2.7-10.7 3.4-16.2.2-2 .3-4 .1-6-.1-3.4-2.3-6.3-5.6-7.3-3.1-1-6.3-1.6-9.6-1.8-9.2-.4-18.4 0-27.5 1.2l-12.1 1.5c-1.3.1-2.5 0-3.2-1.2s-.4-2.4.3-3.6c.8-1.1 1.8-2.1 3-2.8 7.4-5.3 15.7-8.5 24.5-10.6 6.8-1.4 13.7-2.1 20.7-2.3z" fill="#00a8e1"/><path d="m538.5 75v36c-.2 2-1.1 2.9-3.1 3-5.4.1-10.7.1-16.1 0-2 0-2.9-1-3.1-2.9-.1-.6-.1-1.3-.1-1.9v-69.2c.1-3.1.9-4 4-4h14.4c3.1 0 4 .9 4 4z" fill="#000000"/><path d="m151.6 74.8v-35.5c.1-2.4 1-3.3 3.4-3.4 5.2-.1 10.4-.1 15.6 0 2.3 0 3 .7 3.2 3 .1.9.1 1.7.1 2.6v66.6c0 1.1-.1 2.2-.2 3.3-.1 1.3-1.1 2.2-2.4 2.3-.6.1-1.1.1-1.7.1h-13.9c-.5 0-.9 0-1.4-.1-1.4-.1-2.6-1.2-2.7-2.6-.1-.8-.1-1.6-.1-2.4.1-11.1.1-22.5.1-33.9zm11.6-74.7c1.6-.1 3.2.2 4.7.7 5.4 1.8 8.2 6.5 7.7 12.6-.4 5.2-4.3 9.4-9.5 10.2-2.2.4-4.5.4-6.7 0-5.7-1.1-9.9-5.3-9.5-12.5.6-7.1 5.3-11 13.3-11z" fill="#00a8e1"/><path d="m527.4.1c2-.2 4 .2 5.9 1 3.9 1.5 6.6 5.1 6.8 9.3.8 9.1-5.3 13.7-13.4 13.5-1.1 0-2.2-.2-3.3-.4-6.2-1.5-9.4-6.3-8.8-13.2.5-5.5 4.8-9.6 10.7-10.1.7-.1 1.4-.2 2.1-.1z" fill="#000000"/><path d="m76.7 66.6c-.4-5.2-1.8-10.3-3.9-15-4.1-8.6-10.4-14.9-20-17.1-11-2.4-20.9 0-29.9 6.7-.6.6-1.3 1.1-2.1 1.5-.2-.1-.4-.2-.4-.3-.3-1-.5-2-.8-3-.8-2.5-1.8-3.4-4.5-3.4-3 0-6.1.1-9.1 0-2.3-.1-4.4.2-6 2 0 35 0 70.1.1 105 1.3 2.1 3.3 2.5 5.6 2.4 3.6-.1 7.2 0 10.8 0 6.3 0 6.3 0 6.3-6.2v-28.5c0-.7-.3-1.5.4-2.1 5 3.9 11.1 6.3 17.4 6.9 8.8.9 16.8-1.3 23.5-7.3 4.9-4.5 8.5-10.3 10.4-16.7 2.7-8.2 2.9-16.5 2.2-24.9zm-23.9 20.7c-.7 3.1-2.3 5.9-4.6 8-2.6 2.2-5.8 3.5-9.2 3.5-5.1.3-10.1-.8-14.6-3.2-1.1-.5-1.8-1.6-1.7-2.8v-18.1c0-6 .1-12 0-18-.1-1.4.7-2.6 2-3.1 5.5-2.6 11.2-3.8 17.2-2.6 4.2.6 7.8 3.3 9.5 7.2 1.5 3.2 2.4 6.7 2.6 10.2.6 6.4.6 12.8-1.2 18.9z" fill="#00a8e1"/><path d="m800.1 82.2c0-.1 0-.1 0 0zm.1-13.4v.4c-.4-.4-.6-1-.4-1.5v-.8s0-.1.1-.1h-.1v-1h.2c0-.1-.1-.1-.1-.2-.2-1.9-.6-3.8-1.1-5.6-3.7-13.2-12-21.9-25.5-25.3-6.3-1.5-12.7-1.7-19.1-.7-13.5 2-23.2 9.2-27.9 22-4.6 12.2-4.5 25.6.1 37.8 4 11.1 12 18.1 23.5 21 6.1 1.5 12.5 1.9 18.8 1 21-2.5 29.7-18.4 31.1-32.2h-.1v-1.4c-.1-.6-.2-1.1.4-1.5v.2c0-.1.1-.3.2-.4v-11.5c0-.1-.1-.1-.1-.2zm-24 19c-.6 2.1-1.5 4-2.8 5.8-2.2 3.1-5.7 5.1-9.5 5.4-1.9.2-3.8.2-5.7-.2-4.2-.8-7.7-3.6-9.4-7.5-1.5-3.1-2.4-6.5-2.7-9.9-.5-5.9-.6-11.8.8-17.6.5-2.3 1.5-4.6 2.7-6.6 2.2-3.6 6-5.9 10.2-6.2 1.9-.2 3.8-.2 5.7.2 4 .8 7.3 3.4 9.1 7.1 1.7 3.5 2.7 7.4 2.9 11.3.1 1.8.2 3.6.1 5.4.3 4.4-.2 8.7-1.4 12.8zm-151.3-87h-13.9c-3.8 0-4.5.7-4.5 4.5v32.4c0 .7.3 1.4-.2 2.1-.9-.1-1.4-.7-2.1-1.1-10.4-6.1-21.3-7.2-32.3-2.1-7.7 3.6-12.5 10.1-15.6 17.8-3 7.4-3.7 15.2-3.5 23.1 0 7.4 1.7 14.7 5 21.3 3.8 7.3 9.3 12.9 17.3 15.3 10.9 3.4 21.1 1.7 30.4-5.2.7-.4 1.1-1.1 2-1.3.5 1.1.9 2.3 1.1 3.5.4 1.6 1.8 2.7 3.5 2.7h2.4c3.6 0 7.1.1 10.6 0 2.8 0 3.6-.9 3.7-3.8v-105.4c-.1-3.1-.9-3.8-3.9-3.8zm-18.3 73.6v18.2c.2 1.2-.5 2.3-1.6 2.8-4.8 2.7-10.3 3.8-15.7 3-4.6-.5-8.6-3.3-10.7-7.4-1.6-3.2-2.5-6.6-2.8-10.1-.8-6.3-.3-12.7 1.2-18.8.5-1.7 1.1-3.3 2-4.9 2.1-3.9 6.1-6.4 10.5-6.7 5.3-.5 10.6.5 15.4 2.7 1.2.4 1.9 1.6 1.8 2.9-.2 6.2-.1 12.2-.1 18.3z" fill="#000000"/><path d="m348 81.3c7.5 1.4 15.2 1.5 22.7.3 4.4-.6 8.6-1.9 12.5-4 4.5-2.6 7.8-6.2 9.2-11.2 3.5-12.6-1.9-25.3-15-30-6.4-2.1-13.2-2.8-19.9-1.9-15.8 1.8-26.1 10.5-30.8 25.6-3.3 10.3-2.9 20.8-.2 31.2 3.5 13.3 12.3 21.2 25.6 24 7.6 1.7 15.3 1.4 22.9.2 4-.7 8-1.7 11.8-3.2 2.3-.9 3.5-2.3 3.4-4.9-.1-2.4 0-4.9 0-7.4 0-3-1.2-3.9-4.1-3.2s-5.7 1.3-8.6 1.9c-6.2 1.3-12.6 1.3-18.8.2-8.5-1.7-14-9-13.5-18 .9.1 1.9.2 2.8.4zm-2.5-15.3c.3-2.4 1-4.7 1.9-6.9 3-7.3 9.3-9.8 15.7-9.4 1.8.1 3.6.5 5.3 1.2 2.6 1.1 4.3 3.5 4.6 6.3.3 1.7.2 3.5-.3 5.2-1.2 3.6-4.1 5.1-7.6 5.8-2.1.5-4.3.7-6.5.5-3.9 0-7.9-.3-11.8-.9-1.5-.2-1.5-.2-1.3-1.8z" fill="#00a8e1"/><path d="m685.3 82.3c5.8-.4 11.6-1.5 16.8-4.3 5.3-2.6 9-7.5 10.1-13.3.7-3.6.7-7.4-.1-11-2.1-9-7.8-14.6-16.4-17.5-4.8-1.5-9.9-2.1-14.9-1.9-16.8.4-29.6 8.9-34.8 25.7-3.5 11.1-3 22.4.4 33.5 3.5 11.4 11.5 18.3 22.9 21.4 4.9 1.2 10 1.7 15 1.5 7.3-.1 14.6-1.5 21.5-4.1 2.9-1.1 3.6-2.1 3.6-5.2v-7.2c-.1-2.9-1.3-3.9-4.2-3.2-2.2.6-4.3 1.1-6.5 1.6-6.7 1.6-13.7 1.9-20.5.7-6.8-1.3-11.4-5.2-13.2-12-.5-2-.9-4-1.1-6.1.5 0 1 0 1.4.2 6.6 1.2 13.3 1.7 20 1.2zm-20.9-16c.7-3.9 1.6-7.7 4-10.9 3.7-4.9 8.8-6.3 14.6-5.7.5 0 .9.2 1.4.2 7 1.1 8.7 6.7 7.4 12.1-1 4-4.3 5.5-8 6.2-2 .4-4.1.6-6.2.5-4.1-.1-8.1-.4-12.1-1-.9-.1-1.3-.5-1.1-1.4z" fill="#000000"/></svg>', 
            providerId: '119' 
        },
        { 
            id: 'hulu', 
            name: 'Hulu', 
            svg: '<svg viewBox="0 0 1000 329" xmlns="http://www.w3.org/2000/svg"> <defs id="defs6"> <linearGradient id="linearGradient3067" y2="21.07" x2="0.98000002" y1="20.07" x1="-0.02" gradientUnits="userSpaceOnUse"> <stop id="stop3069" stop-opacity="1" stop-color="#2dbd9d" offset="0.44710872" /> <stop id="stop3071" stop-opacity="1" stop-color="#72de93" offset="1" /> </linearGradient> <linearGradient gradientUnits="userSpaceOnUse" x1="-0.02" y1="20.07" x2="0.98000002" y2="21.07" id="gradient1"> <stop offset="1e-07" stop-color="#2dbd9d" stop-opacity="1" id="stop9" /> <stop offset="1" stop-color="#72de93" stop-opacity="1" id="stop11" /> </linearGradient> <linearGradient xlink:href="#linearGradient3067" id="linearGradient3050" gradientUnits="userSpaceOnUse" x1="-0.02" y1="20.07" x2="8.437705" y2="-0.82375771" /> <linearGradient xlink:href="#gradient1" id="linearGradient3052" gradientUnits="userSpaceOnUse" x1="-0.02" y1="20.07" x2="0.98000002" y2="21.07" /> </defs> <g transform="matrix(16.423058,0,0,16.423058,-331,-413.40146) translate(20.15459,25.172015)" > <path fill="#1ce783" d="m 9.57,6.24 -3.1,0 C 5.9118,6.21334 5.35475,6.31245 4.84,6.53 L 4.84,0 0,0 l 0,20 4.83,0 0,-8.07 C 4.82999,11.5861 4.96727,11.2565 5.21136,11.0143 5.45545,10.7721 5.78614,10.6373 6.13,10.64 l 2.81,0 C 9.28386,10.6373 9.61455,10.7721 9.85864,11.0143 10.1027,11.2565 10.24,11.5861 10.24,11.93 l 0,8.07 4.84,0 0,-8.7 c 0,-3.66 -2.44,-5.06 -5.5,-5.06 l -0.01,0 m 46.48,0 0,8.07 c 0,0.7124 -0.5776,1.29 -1.29,1.29 l -2.82,0 C 51.5961,15.6027 51.2654,15.4679 51.0214,15.2257 50.7773,14.9835 50.64,14.6539 50.64,14.31 l 0,-8.07 -4.83,0 0,8.47 c 0,3.47 2.19,5.29 5.51,5.29 l 4.73,0 c 3,0 4.84,-2.15 4.84,-5.26 l 0,-8.5 -4.84,0 m -27.28,8.07 c 0,0.3439 -0.1373,0.6735 -0.3814,0.9157 -0.244,0.2422 -0.5747,0.377 -0.9186,0.3743 l -2.81,0 C 24.3161,15.6027 23.9854,15.4679 23.7414,15.2257 23.4973,14.9835 23.36,14.6539 23.36,14.31 l 0,-8.07 -4.83,0 0,8.47 c 0,3.47 2.22,5.29 5.47,5.29 l 4.73,0 c 3,0 4.84,-2.15 4.84,-5.26 l 0,-8.5 -4.8,0 0,8.07 m 8.52,5.69 4.84,0 0,-20 -4.84,0 0,20" /> </g></svg>', 
            providerId: '15' 
        },
        { 
            id: 'paramount', 
            name: 'Paramount+', 
            svg: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-161.599 -100.544 1000 622.214"> <path fill="#0064FF" d="M283.887,219.392c-2.459-1.02-6.49-5.543,0.216-18.138l15.578-32.558c0.473-0.984-0.664-2.216-1.374-1.38 l-13.621,13.695c-6.445,6.727-17.378,25.635-19.495,29.134L248.643,237.5c1.229-0.039,2.258,0.927,2.297,2.156 c0.012,0.405-0.085,0.805-0.283,1.159l-15.125,25.404c-3.693,6.3,2.942,10.704,3.841,9.254c23.773-38.291,37.6-35.234,37.6-35.234 l7.936-18.377c0.418-0.921,0.01-2.006-0.911-2.424C283.964,219.421,283.926,219.407,283.887,219.392z M337.935-100.544 c-135.92,0-246.104,110.13-246.104,245.983c-0.072,52.591,16.8,103.807,48.115,146.058c10.324-4.456,16.061-11.117,20.159-16.218 l45.823-58.576c0.965-1.235,2.225-2.206,3.665-2.825l6.898-2.967l75.345-95.524l10.925-8.549l22.45-31.233 c0.58-0.808,1.287-1.519,2.094-2.104l9.795-7.117c2.42-1.758,5.688-1.786,8.136-0.068l11.886,8.339 c6.306,4.423,11.417,10.338,14.88,17.217l47.61,83.586c0.777,1.595,2.098,2.86,3.724,3.568c9.337,4.646,15.041,5.467,27.261,18.735 c5.702,6.186,30.688,34.117,65.705,77.526c5.089,6.964,11.902,12.484,19.769,16.02c31.22-42.219,48.034-93.359,47.96-145.868 C584.031,9.585,473.852-100.544,337.935-100.544z M158.201,158.997l-15.957-5.18l-9.857,13.56v-16.758l-15.958-5.181l15.958-5.181 v-16.763l9.857,13.563l15.957-5.18l-9.859,13.562L158.201,158.997z M154.418,213.846l-5.183,15.943l-5.183-15.943h-16.771 l13.567-9.854l-5.182-15.942l13.568,9.854l13.569-9.854l-5.183,15.942l13.569,9.854H154.418z M157.621,86.876l5.183,15.942 l-13.569-9.854l-13.568,9.854l5.182-15.942l-13.567-9.854h16.771l5.183-15.942l5.184,15.942h16.771L157.621,86.876z M184.552,50.813 l-9.852-13.563l-15.957,5.18l9.858-13.561l-9.858-13.562l15.957,5.18l9.858-13.562v16.764l15.957,5.171l-15.957,5.182v16.763 L184.552,50.813z M226.495-7.873L221.312,8.07l-5.183-15.942h-16.772l13.569-9.854l-5.182-15.943l13.568,9.852l13.567-9.854 l-5.182,15.956l13.569,9.854h-16.772V-7.873z M279.348-34.791l-9.858,13.563v-16.759l-15.958-5.18l15.958-5.182v-16.763 l9.858,13.563l15.95-5.18l-9.858,13.562l9.859,13.561L279.348-34.791z M346.321-50.157l5.183,15.942l-13.569-9.854l-13.569,9.854 l5.177-15.935l-13.567-9.854h16.771l5.185-15.942l5.183,15.942h16.771L346.321-50.157z M406.374-37.987v16.763l-9.854-13.563 l-15.956,5.181l9.858-13.561l-9.857-13.562l15.957,5.18l9.854-13.563v16.763l15.957,5.182L406.374-37.987z M517.662,131.877 l15.956,5.18l9.855-13.563v16.763l15.958,5.181l-15.958,5.181v16.762l-9.855-13.561l-15.956,5.18l9.869-13.562L517.662,131.877z M454.556,8.074l-5.186-15.943H432.6l13.564-9.854l-5.171-15.944l13.563,9.854l13.563-9.852l-5.172,15.942l13.565,9.854h-16.771 L454.556,8.074z M491.317,50.817V34.055l-15.957-5.182l15.957-5.171V6.931l9.854,13.562l15.957-5.18l-9.854,13.562l9.854,13.561 l-15.957-5.18L491.317,50.817z M521.443,77.027l5.188-15.942l5.186,15.942h16.77l-13.563,9.854l5.186,15.942l-13.577-9.854 l-13.564,9.854l5.186-15.942l-13.578-9.854H521.443z M531.816,213.846l-5.186,15.943l-5.188-15.943h-16.77l13.578-9.854 l-5.186-15.942l13.564,9.854l13.577-9.854l-5.186,15.942l13.563,9.854H531.816z M427.075,287.598 c1.182-1.718,3.103-6.43-0.503-15.162l-10.89-29.273c-1.478-3.737,1.759-6.004,3.931-3.547c0,0,20.582,23.722,25.901,33.627 l10.15,16.843c8.732,0.564,32.83,1.221,56.027,1.221c-2.336-2.319-4.493-4.811-6.457-7.454 c-39.583-49.053-64.687-76.34-64.938-76.61c-8.022-8.717-11.73-10.392-17.849-13.178c-0.886-0.402-1.847-0.836-2.836-1.307v7.447 c0.061,0.503-0.299,0.96-0.803,1.02c-0.407,0.048-0.798-0.18-0.955-0.559L359.658,98.482l-0.162-0.323 c-2.427-4.813-6.004-8.953-10.414-12.052l-5.677-3.989l-27.763,64.021c3.317-0.001,6.008,2.687,6.01,6.004 c0.001,0.821-0.167,1.634-0.494,2.388l-25.651,59.312h23.546c9.1,0,18.114,1.771,26.536,5.22l6.206,2.543 c0,0-18.725,38.509-18.725,58.786c0.027,3.688,0.542,7.355,1.529,10.908h43.163l-1.999-12.155 c16.932,3.78,34.062,6.604,51.311,8.459V287.598z M94.026,349.996c0-39.614-42.017-58.689-91.935-58.689 c-53.398,0-102.392,23.657-120.375,60.339c-4.963,9.773-7.542,20.584-7.528,31.546c-0.227,9.479,2.396,18.807,7.528,26.778 c7.705,11.377,21.466,18.528,41.652,18.528c24.776,0,44.411-13.576,44.411-37.234c0,0,0.364-6.598-7.341-6.598 c-6.239,0-7.893,4.399-7.708,6.598c0.922,18.525-10.092,33.383-29.728,33.383c-22.014,0-31.197-18.708-31.197-38.698 c0-40.902,30.829-68.05,62.942-79.786c15.007-5.667,30.944-8.47,46.985-8.259c36.333,0,66.061,13.942,66.061,51.361 c0,31.175-26.24,57.771-57.623,60.157l1.284-4.217c6.425-22.929,14.315-48.054,27.157-66.58c0.739-1.107,2.02-2.936,3.489-4.768 l-1.833-2.203c-2.746,1.666-5.383,3.503-7.897,5.501c-60.183,46.956-62.011,179.011-142.209,179.011 c-2.762,0-5.519-0.185-8.256-0.551c-16.696-2.75-25.51-13.941-25.51-29.524c0-3.118,1.103-7.339,1.103-9.72 c0.127-4.43-3.361-8.123-7.791-8.252c-0.035-0.001-0.068-0.001-0.101-0.001h-0.915c-7.155,0-10.092,5.678-10.276,13.754 c-0.548,23.294,16.696,36.862,43.309,39.434c2.933,0.182,5.87,0.364,8.99,0.364c62.571,0,100.923-47.32,117.257-104.729 c8.273-0.97,16.441-2.687,24.403-5.131C61.374,403.73,94.026,384.298,94.026,349.996z M690.057,363.75h-22.029l-4.949,11.557 l-8.629,19.441h-10.269l-3.133,6.604h10.652l-12.853,28.43c-9.161,19.991-23.479,39.617-31.738,39.617 c-1.832,0-2.94-0.738-2.94-2.565s0.547-3.49,2.571-8.623c2.571-6.057,6.796-14.858,9.914-21.276 c4.58-9.353,11.924-23.843,11.924-30.996c0-7.154-4.581-12.841-13.579-12.841c-10.091,0-19.267,6.059-27.718,14.854l5.511-13.204 h-20.729l-16.889,38.517c-6.782,13.573-20.553,36.133-29.182,36.133c-1.832,0-2.571-1.103-2.571-2.935 c0.179-1.647,0.612-3.257,1.286-4.771c0.738-1.65,10.83-25.309,10.83-25.309l18.351-42.002h-22.384l-17.805,40.898 c-5.496,12.658-19.443,34.117-28.442,34.117c-1.567,0.153-2.964-0.992-3.117-2.563c0,0,0,0,0-0.003v-0.738 c0-2.198,1.655-6.236,2.941-9.172l9.353-20.538l19.266-42.002h-22.192l-4.418,9.537c-3.294,6.418-8.806,13.938-17.611,13.938 c-4.225,0-6.235-1.646-7.151-3.3c-1.285-14.123-10.283-21.644-23.493-21.644c-18.351,0-31.381,10.821-40.011,24.029 c-5.653,9.103-10.094,18.905-13.206,29.158c-7.893,13.026-16.146,23.116-22.754,23.116c-1.653,0-2.756-0.922-2.756-3.12 c0-2.201,2.204-7.151,2.938-8.992l14.497-30.811c4.037-9.533,6.796-15.77,6.796-22.008c0-6.604-4.58-11.376-12.116-11.376 c-10.46,0-21.84,6.057-30.83,15.957c0.305-1.571,0.427-3.173,0.366-4.771c0-7.338-3.667-11.191-11.195-11.191 c-9.539,0-19.447,5.692-28.438,15.958l5.873-14.313h-20.189l-17.062,38.528c-8.073,18.16-21.102,36.139-28.445,36.139 c-1.649,0-2.751-0.924-2.751-3.122c0-3.483,3.854-12.104,5.32-15.59l22.573-51.17c1.651-3.85-9.178-6.238-22.94-6.238 c-14.129,0-28.627,6.973-39.267,15.957c-7.523,6.233-13.029,9.354-15.787,9.354c-0.899,0.192-1.785-0.381-1.979-1.279 c-0.026-0.122-0.038-0.246-0.036-0.37c0-3.119,7.523-11.927,7.523-18.711c0-3.117-1.649-5.137-5.875-5.137 c-8.069,0-17.616,7.705-24.588,15.772l5.873-14.125h-19.815l-17.063,38.52c-8.076,18.16-21.472,37.054-28.812,37.054 c-1.653,0-2.749-0.915-2.749-3.12c0-3.484,3.67-11.917,5.687-16.324l22.572-51.353c1.651-3.85-9.177-6.238-22.942-6.238 c-20.369,0-40.189,13.756-50.647,27.88c-11.559,15.218-19.447,31.361-19.633,44.569c-0.18,10.637,5.318,17.239,16.331,17.239 c12.296,0,22.208-9.719,27.893-17.058c-0.337,1.452-0.584,2.922-0.739,4.404c0,7.332,2.937,12.653,11.927,12.653 c7.889,0,18.35-6.603,26.792-17.058l-6.798,15.592h21.467l21.105-47.872c6.989-15.587,14.88-23.654,17.074-23.654 c0.505-0.097,0.993,0.233,1.091,0.738c0.01,0.058,0.016,0.118,0.016,0.178c0,1.652-3.301,6.059-3.301,10.087 c0,4.029,2.195,7.151,8.076,7.151c4.58,0,9.721-2.202,14.31-5.14c-10.826,14.679-18.173,30.084-18.173,42.743 c-0.181,10.638,5.318,17.239,16.333,17.239c11.558,0,22.385-11.005,28.257-18.342c-0.221,1.704-0.343,3.418-0.366,5.135 c0,7.157,4.039,13.207,12.295,13.207c9.172,0,16.515-5.689,25.69-16.872l-6.796,15.406h22.016l20.183-45.672 c8.809-19.809,20.734-30.451,26.607-30.451c1.467-0.151,2.782,0.915,2.935,2.384c0,0.003,0,0.006,0.001,0.009v0.546 c-0.242,2.228-0.863,4.399-1.834,6.418l-28.967,66.948h22.571l20.554-46.59c8.803-19.989,18.533-29.715,25.872-29.715 c2.201,0,3.122,1.108,3.122,3.486c-0.196,2.554-0.882,5.047-2.019,7.345l-19.821,42.181c-1.825,4.06-2.942,8.4-3.304,12.836 c0,6.421,3.485,12.116,13.399,12.116c12.854,0,22.571-9.721,33.577-24.21v3.116c0.921,11.555,7.342,21.643,24.406,21.643 c20.184,0,36.524-13.94,46.424-36.128c3.744-7.801,6.167-16.173,7.165-24.77c2.21,1.121,4.68,1.63,7.151,1.478 c3.335,0.037,6.621-0.785,9.545-2.388l-3.486,7.517c-4.049,8.439-8.452,17.794-11.924,25.686c-2.199,4.666-3.508,9.702-3.855,14.85 c0,7.884,4.402,13.575,13.386,13.575s21.291-8.438,30.098-20.359h0.191c-0.59,2.465-0.901,4.985-0.931,7.518 c0,6.605,2.024,12.842,11.199,12.842c10.653,0,18.898-7.705,26.979-17.428l-6.796,15.409h22.206l17.806-40.351 c10.092-22.743,20.183-36.496,29.534-36.496c1.607-0.057,2.981,1.148,3.133,2.75v0.542c0,3.855-5.511,14.31-10.461,24.763 c-4.595,9.538-8.082,16.871-10.461,22.563c-2.208,4.794-3.514,9.952-3.855,15.219c0,6.966,3.855,12.287,12.485,12.287 c12.839,0,25.871-12.472,32.83-21.828c-1.57,4.485-2.433,9.186-2.557,13.936c0,12.845,7.697,19.263,18.527,19.263 c7.196-0.055,14.191-2.363,20.006-6.6c8.437-5.872,15.234-14.674,20.922-22.744l-3.855-3.672 c-5.319,7.522-11.199,14.677-17.258,19.079c-3.193,2.699-7.199,4.249-11.378,4.402c-4.579,0-7.52-2.387-7.52-8.251 c0-5.863,2.748-13.759,6.975-24.399c0.176-0.179,6.234-13.755,11.923-26.773c4.772-11.013,9.544-21.646,10.461-23.847h14.495 l2.938-6.604h-14.315L690.057,363.75z M64.122,469.581c-3.118,0-5.32-1.1-5.32-5.135c0.182-10.823,9.171-30.08,20.372-45.489 c7.888-10.638,18.163-18.521,29.174-18.521L94.4,431.61C83.94,455.091,72.563,469.581,64.122,469.581z M201.383,469.581 c-3.117,0-5.319-1.1-5.5-5.135c0.182-10.823,9.172-30.08,20.369-45.489c7.886-10.638,18.165-18.521,29.175-18.521l-13.95,31.175 c-10.64,24.034-21.466,37.971-30.097,37.971H201.383z M445.071,408.875c-0.547,11.918-11.008,40.71-23.301,57.958 c-4.949,6.968-9.176,8.983-12.839,8.983c-5.143,0-6.62-4.221-5.882-10.454c1.094-10.82,10.092-36.131,22.577-53.556 c5.688-7.887,9.545-11.189,13.947-11.189C443.977,400.618,445.262,404.288,445.071,408.875z M787.559,394.747l20.212-46.649h-23.92 l-20.213,46.649h-50.841l-8.481,19.563h50.856l-20.212,46.649h23.92l20.214-46.649h50.84l8.467-19.563H787.559z"/> </svg>', 
            providerId: '531' 
        },
        { 
            id: 'sky_showtime', 
            name: 'Sky Showtime', 
            svg: '<svg viewBox="0 0 2000 467" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,467) scale(0.1,-0.1)" fill="#000000"><path d="M9127 4635 c-475 -60 -904 -248 -1252 -547 -113 -98 -195 -180 -195 -197 0 -5 18 -12 41 -16 58 -10 187 -77 243 -126 147 -130 223 -344 242 -686 l7 -123 -247 0 -246 0 0 68 c0 77 -12 161 -35 239 -18 61 -73 129 -122 150 -42 17 -134 17 -176 -1 -95 -39 -164 -210 -139 -346 36 -192 129 -301 462 -542 276 -199 401 -331 490 -513 71 -145 91 -230 97 -410 5 -131 3 -161 -16 -235 -72 -290 -307 -533 -539 -557 -29 -3 -55 -9 -57 -14 -7 -10 161 -173 260 -252 440 -351 962 -523 1530 -504 498 17 976 193 1360 501 100 80 255 224 255 236 0 4 -26 17 -58 29 -129 46 -264 160 -360 303 -191 282 -286 643 -299 1124 -18 676 135 1220 422 1500 79 77 201 148 273 160 23 4 42 9 42 13 0 4 -35 43 -77 87 -327 339 -783 567 -1298 649 -139 23 -470 28 -608 10z m-97 -1430 l0 -615 290 0 290 0 0 615 0 615 265 0 265 0 0 -1520 0 -1520 -265 0 -265 0 0 660 0 660 -287 -2 -288 -3 -3 -657 -2 -658 -260 0 -260 0 0 1520 0 1520 260 0 260 0 0 -615z"/><path d="M2657 4400 c-142 -26 -230 -74 -289 -161 -72 -104 -68 -7 -68 -1655 l0 -1482 84 -7 c107 -9 280 8 370 35 51 16 81 33 117 67 92 86 84 -67 87 1664 2 1453 2 1527 -15 1534 -28 11 -232 15 -286 5z"/><path d="M12050 3754 c0 -22 369 -2804 386 -2906 l6 -38 239 0 c131 0 239 1 239 3 0 10 261 1829 266 1857 l7 35 8 -35 c5 -19 63 -440 129 -935 66 -495 122 -906 125 -912 3 -10 62 -13 248 -13 l244 0 5 33 c3 17 75 580 159 1249 l154 1218 228 0 227 0 0 -1250 0 -1250 270 0 270 0 0 1250 0 1250 245 0 245 0 0 -1250 0 -1250 280 0 280 0 0 1485 0 1485 -1182 -2 -1183 -3 -92 -720 c-125 -983 -126 -991 -129 -980 -2 6 -53 375 -114 820 -60 446 -112 827 -116 848 l-6 37 -244 0 c-187 0 -246 -3 -249 -12 -2 -7 -59 -389 -125 -848 -66 -459 -123 -846 -127 -860 l-6 -25 -8 30 c-5 17 -47 390 -94 830 -48 440 -89 819 -92 843 l-6 42 -243 0 -244 0 0 -26z"/><path d="M16560 2295 l0 -1485 200 0 200 0 0 1087 c0 597 3 1083 7 1079 4 -3 88 -491 188 -1084 l181 -1077 151 -3 c137 -2 151 -1 155 15 3 10 83 485 179 1056 l174 1039 3 -1056 2 -1056 248 2 247 3 0 1480 0 1480 -357 3 -356 2 -6 -27 c-3 -16 -58 -343 -121 -728 -64 -385 -119 -708 -123 -718 -4 -10 -57 303 -121 715 -63 403 -116 739 -119 746 -3 9 -86 12 -368 12 l-364 0 0 -1485z"/><path d="M18750 2295 l0 -1485 625 0 625 0 0 235 0 235 -355 0 -355 0 0 400 0 400 255 0 255 0 -2 248 -3 247 -252 3 -253 2 0 365 0 365 340 0 340 0 0 235 0 235 -610 0 -610 0 0 -1485z"/><path d="M4306 3569 c-153 -18 -278 -74 -403 -181 -95 -81 -914 -980 -910 -999 2 -8 152 -249 333 -534 367 -580 411 -637 535 -699 108 -54 197 -70 358 -63 125 5 170 13 299 52 12 4 22 12 22 17 0 5 -173 271 -386 590 -212 320 -383 586 -381 592 3 7 125 139 272 295 218 231 270 280 280 269 21 -22 895 -1399 895 -1410 0 -5 -122 -266 -270 -580 -149 -313 -272 -575 -273 -581 -3 -19 130 -58 236 -70 227 -26 386 38 490 196 19 29 335 722 702 1541 513 1145 664 1490 654 1497 -8 4 -50 18 -94 30 -96 27 -262 32 -340 10 -129 -36 -255 -141 -322 -266 -17 -33 -126 -284 -242 -559 -116 -274 -215 -505 -219 -513 -11 -18 41 -98 -431 672 -216 352 -398 646 -405 653 -30 31 -272 56 -400 41z"/><path d="M840 3559 c-456 -43 -747 -254 -824 -596 -80 -356 125 -687 499 -807 44 -14 221 -53 394 -86 172 -33 332 -65 354 -71 181 -49 226 -187 85 -264 -81 -44 -180 -50 -499 -31 -354 21 -494 21 -556 0 -106 -36 -173 -110 -210 -229 -21 -71 -26 -296 -7 -315 7 -7 47 -16 90 -21 371 -42 931 -54 1145 -25 480 65 745 303 775 697 22 293 -121 541 -390 673 -124 61 -217 86 -592 156 -177 33 -341 68 -365 79 -155 67 -113 202 76 242 78 16 270 16 570 0 219 -13 246 -12 304 3 151 39 226 135 252 324 10 73 5 196 -9 219 -7 11 -226 36 -467 53 -162 11 -502 11 -625 -1z"/><path d="M11202 3354 c-67 -33 -113 -88 -168 -199 -91 -187 -133 -404 -141 -730 -10 -394 40 -701 148 -921 84 -172 214 -250 334 -200 79 34 167 156 225 314 136 374 150 885 35 1326 -91 351 -250 501 -433 410z"/><path d="M7080 2318 c1 -317 74 -657 182 -846 42 -75 130 -166 183 -191 216 -102 414 150 340 434 -38 143 -116 231 -379 421 -98 71 -210 155 -247 187 -38 31 -71 57 -74 57 -3 0 -5 -28 -5 -62z"/></g></svg>', 
            networkId: '450'
        },
        { 
            id: 'syfy', 
            name: 'Syfy', 
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-326.5 140.209 1000 245.582"><g fill="#6a1b9a"><path d="M155.556,140.209H57.469c-2.189,2.19-3.416,3.418-5.604,5.605v116.616H27.187V145.815l-5.604-5.605h-96.964c-2.189,2.19-3.415,3.418-5.604,5.605v117.738l66.425,67.021v49.611c2.189,2.188,3.415,3.412,5.604,5.604H88.01c2.189-2.191,3.415-3.416,5.604-5.604v-50.188l67.546-67.567V145.815C158.972,143.627,157.745,142.4,155.556,140.209"/><path d="M667.896,140.212h-98.088c-2.189,2.189-3.415,3.419-5.604,5.607v116.616h-24.678V145.819c-2.189-2.188-3.414-3.417-5.604-5.607h-96.964c-2.189,2.189-3.416,3.419-5.605,5.607v117.734l66.426,67.021v49.611c2.189,2.189,3.414,3.416,5.604,5.605h96.967c2.189-2.189,3.416-3.416,5.604-5.605v-50.184l67.547-67.567V145.819C671.311,143.631,670.084,142.401,667.896,140.212"/><path d="M-111.27,140.209h-166.187l-49.044,49.058v67.573c2.19,2.19,3.417,3.416,5.604,5.59h104.813v-24.106h104.813c2.19-2.19,3.415-3.418,5.604-5.609v-86.9C-107.854,143.627-109.079,142.4-111.27,140.209"/><path d="M-320.895,286.539c-2.189,2.189-3.417,3.418-5.604,5.607v88.037c2.188,2.188,3.415,3.416,5.604,5.605h166.187l49.042-49.057v-68.693c-2.188-2.191-3.415-3.42-5.604-5.607h-104.813v24.107H-320.895z"/><path d="M401.07,140.212H234.883l-49.043,49.059v190.915c2.189,2.189,3.417,3.416,5.604,5.605h96.967c2.188-2.189,3.415-3.416,5.604-5.605v-30.553H401.07c2.189-2.193,3.414-3.42,5.604-5.609v-75.982c-2.189-2.191-3.414-3.416-5.604-5.606H294.016v-24.109H401.07c2.189-2.189,3.414-3.417,5.604-5.606v-86.9C404.484,143.631,403.26,142.401,401.07,140.212"/></g></svg>', 
            networkId: '77' 
        },
        { 
            id: 'educational_and_reality', 
            name: tr('educational_title'), 
            svg: '<svg viewBox="0 0 210 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"> <title id="title1586">Discovery Channel 2000 logo</title>  <defs id="defs1555" /> <g inkscape:label="Capa 1" inkscape:groupmode="layer" id="layer1"> <path id="rect1261-5-5" style="fill:#000000;fill-opacity:0.952941;stroke-width:0.859437" d="M 2.3479895,1.4850426 V 44.350422 H 14.833391 c 7.603529,0 10.88268,-3.395932 10.88268,-11.551708 V 13.025721 c 0,-8.0856579 -3.279151,-11.5406784 -10.88268,-11.5406784 z M 51.115115,6.445752 c -7.112857,0 -10.568379,3.1911718 -10.568379,9.65675 0,5.646314 3.70284,7.780616 9.452729,12.364095 2.351574,1.823051 3.275278,2.955821 3.275278,6.155393 0,0.291692 -0.01468,0.551569 -0.03312,0.8032 a 31.494859,31.494859 0 0 0 -4.074806,0.290401 c -0.02596,-0.449811 -0.03162,-0.955529 -0.03162,-1.540226 v -5.203321 h -8.715534 v 4.576571 c 0,1.726863 0.132921,3.212144 0.402517,4.503048 a 31.494859,31.494859 0 0 0 -3.367178,1.740566 31.494859,31.494859 0 0 1 0.128666,-0.08089 V 7.0044973 H 28.868264 V 44.352256 h 2.492302 A 31.494859,31.494859 0 0 1 32.294137,43.52884 31.494859,31.494859 0 0 0 25.42009,52.492669 H 2.5170195 V 72.94204 H 22.499535 A 31.494859,31.494859 0 0 0 53.337176,98.407247 31.494859,31.494859 0 0 0 84.248333,72.94204 H 208.21274 V 52.492669 H 81.267191 a 31.383439,31.494859 0 0 1 0.03464,0.08089 31.494859,31.494859 0 0 0 -5.541517,-7.664377 c 0.07536,0.0033 0.149673,0.0075 0.229779,0.0075 8.475835,0 10.820193,-3.827844 10.820193,-11.987301 v -3.71276 h -8.833254 v 4.960709 c 0,2.572211 -0.07141,3.896524 -1.986864,3.896524 -1.915418,0 -1.973981,-1.257885 -1.973981,-3.896524 V 17.168661 c 0,-2.564829 0.05854,-3.881814 1.973981,-3.881814 1.915434,0 1.986864,1.246867 1.986864,3.881814 v 4.95887 h 8.833328 v -3.698014 c 0,-8.163166 -2.344361,-11.9817939 -10.820192,-11.9817939 v -0.00187 c -8.468551,0 -10.809155,3.8813689 -10.809155,11.9817949 v 14.499824 c 0,1.920859 0.13582,3.592733 0.444787,5.03974 a 31.494859,31.494859 0 0 0 -3.545243,-1.301423 c 0.102688,-0.790478 0.159875,-1.634079 0.159875,-2.549276 0,-5.210843 -1.911443,-8.59582 -6.425581,-11.990984 -3.529169,-2.697681 -6.614891,-4.074423 -6.614891,-6.521154 0,-1.572115 0.486788,-2.319533 1.91517,-2.319533 1.235759,0 1.973997,0.80771 1.973997,2.003398 v 1.878416 1.564123 h 8.723065 v -2.442677 c 0,-6.9600914 -3.27888,-9.8423843 -10.697047,-9.8423843 z m 49.210095,0 c -8.461285,0 -10.814682,3.88321 -10.814682,11.983633 v 14.499826 c 0,8.15578 2.353397,11.985463 10.814682,11.985463 8.47582,0 10.8257,-3.829683 10.8257,-11.985463 V 18.429385 c 0,-8.16685 -2.34988,-11.983633 -10.8257,-11.983633 z m 48.59803,0 c -8.47582,0 -10.82385,3.88321 -10.82387,11.983633 v 14.499826 c 0,8.15578 2.34805,11.985463 10.82387,11.985463 8.46855,0 10.82019,-3.829683 10.82019,-11.985463 V 29.21649 h -8.71938 v 4.958873 c 0,2.52054 -0.0617,3.898355 -2.10081,3.898355 -2.04262,0 -2.10817,-1.25972 -2.10817,-3.898355 v -7.089089 h 12.92836 v -8.656889 c 0,-8.16685 -2.35164,-11.983633 -10.82019,-11.983633 z m 27.57889,0.1213158 c -2.59872,0 -4.39398,0.999763 -5.62973,2.4353213 V 7.0063466 h -8.22128 V 44.35227 h 8.71937 V 17.164865 c 0,-2.56114 0.0548,-3.881817 1.97399,-3.881817 1.92269,0 1.97951,1.246869 1.97951,3.881817 v 7.666217 h 8.71754 v -6.912646 c 0,-7.402942 -1.4224,-11.3513651 -7.5394,-11.3513682 z M 114.2332,7.0045108 V 22.123735 c 0,9.672532 2.10079,17.2059 5.8117,22.228535 h 9.76887 c 3.71089,-5.022643 5.80433,-12.556014 5.80433,-22.228545 V 7.0045005 h -8.7157 V 20.881249 c 0,6.838307 -0.67646,12.291409 -1.97399,16.306562 -1.24303,-4.015153 -1.98135,-9.468255 -1.98135,-16.306562 V 7.0045005 Z m 72.76196,0.00187 V 20.430997 c 0,8.539581 1.72998,15.754264 5.80434,23.031728 h -5.80434 v 5.203323 h 13.66356 C 207.0919,38.576504 208.3819,30.158885 208.3819,20.430997 V 7.0063882 h -8.71571 V 20.807784 c 0,7.163068 -0.73823,13.310623 -1.97397,18.015881 -1.24304,-4.89347 -1.98135,-10.989359 -1.98135,-18.015881 V 7.0063882 Z M 11.681254,9.6383743 h 1.542064 c 3.216599,0 3.030828,1.5059837 3.030828,5.0893657 v 16.376408 c 0,3.631355 0.185767,5.082015 -3.030828,5.082015 h -1.542064 z m 88.643956,3.6465507 c 1.92269,0 1.9795,1.246869 1.9795,3.881817 v 17.008675 c 0,2.572208 -0.0568,3.898354 -1.9795,3.898354 -1.908155,0 -1.974001,-1.259722 -1.974001,-3.898354 V 17.16669 c 0,-2.564829 0.06584,-3.881813 1.974001,-3.881813 z m 48.59803,0 c 2.03899,0 2.10081,1.247729 2.10081,4.133617 v 2.82682 h -4.20898 v -2.826815 c 0,-2.885889 0.0655,-4.133618 2.10817,-4.133622 z M 55.496864,37.617907 c 2.667509,0.0384 5.300485,0.666408 7.833479,1.477737 0.02785,0.573025 0.112706,1.147316 0.04044,1.720346 -0.292984,0.246644 -0.702638,0.2058 -1.056839,0.211372 -0.593437,-0.0094 -1.272936,-0.134502 -1.567792,-0.716812 -1.051489,-0.265202 -2.301488,-0.510138 -3.297336,0.02184 0.189124,0.233694 0.43634,0.433081 0.558743,0.716817 -0.26332,0.615687 -0.765459,1.086555 -1.082572,1.672561 1.001405,-0.619389 2.036444,-1.382839 3.2808,-1.306809 0.0983,0.272619 0.04047,0.496515 -0.174592,0.674545 -0.617541,0.574879 -1.435932,0.870362 -2.209255,1.170792 -0.762173,0.304127 -1.584655,0.104388 -2.374665,0.145194 -0.283685,0.289333 -0.442846,0.667866 -0.661675,1.005379 -1.656047,-0.676886 -2.90789,-2.042888 -4.537971,-2.769838 -0.246644,-0.09641 -0.519702,-0.07879 -0.77747,-0.112104 -0.420964,-0.454345 -0.802964,-0.944513 -1.242475,-1.382159 -0.632379,0.969874 -0.848166,2.216254 -0.338156,3.288145 0.322684,0.586004 -0.255491,1.079595 -0.667186,1.413404 -1.058902,0.802982 -2.212976,1.495392 -3.448057,1.990533 -0.960606,0.411695 -2.055734,0.361346 -2.990391,0.858334 -1.333365,0.689863 -2.57037,1.556384 -3.918568,2.22028 -1.529939,0.845637 -3.184769,1.445827 -4.683171,2.347102 -0.448786,0.231813 -0.721538,0.660059 -1.01825,1.047648 -0.521113,0.220706 -1.140996,0.208021 -1.597196,0.58448 -1.476166,1.146057 -2.655895,2.661232 -3.481138,4.333959 -0.419105,0.828954 -0.698527,1.720257 -1.100948,2.556629 0.235525,-1.153486 0.412056,-2.326119 0.786659,-3.446212 0.934647,-2.585137 2.289254,-4.999352 3.834019,-7.267375 1.253621,-1.804399 2.640742,-3.54402 4.34315,-4.946006 1.48914,-1.248053 2.950865,-2.578324 4.708897,-3.446213 3.708942,-2.173447 7.883688,-3.543312 12.158245,-3.992089 1.173878,-0.153964 2.358693,0.0019 3.536272,-0.04962 0.382261,-0.01958 0.763987,-0.02786 1.145066,-0.02184 z m -8.377516,2.466568 c -0.99584,0.202149 -2.01911,0.37279 -2.938925,0.823412 -0.344894,0.1502 -0.564601,0.458464 -0.733355,0.781145 1.340781,-0.209527 2.52066,-0.92767 3.67228,-1.604557 z m -11.546191,0.884068 a 31.494859,31.494859 0 0 0 -2.488622,1.863707 31.494859,31.494859 0 0 1 2.488622,-1.863707 z M 69.21004,43.91299 c 0.194319,0.0075 0.43584,0.208585 0.602851,0.264638 0.819681,0.576741 1.605032,1.316681 1.964805,2.273587 0.176174,0.430242 -0.0574,1.235923 -0.624912,1.145058 -0.955049,-0.420966 -1.519658,-1.390775 -1.972152,-2.282773 -0.129835,-0.387593 -0.421071,-0.869593 -0.194846,-1.257177 0.0574,-0.109507 0.135933,-0.14666 0.224209,-0.143348 z m -18.455162,0.663508 c 0.871606,0.307853 1.746139,0.633938 2.565817,1.066028 0.172485,0.07604 0.268177,0.213329 0.286736,0.406195 -0.22259,0.317113 -0.682108,0.525429 -0.657997,0.964939 0.190969,0.393151 0.610267,0.592861 1.016407,0.683729 0.8753,0.250371 1.767638,-0.04379 2.650354,-0.08089 -0.261475,0.419106 -0.532581,0.86922 -0.994338,1.093601 -0.402427,0.207683 -0.962096,-0.08432 -1.28107,0.306951 -0.886429,0.906828 -1.093061,2.209727 -1.360112,3.396583 -0.12607,0.628671 -0.526913,1.183515 -0.591821,1.819602 0.300437,1.008825 1.138971,1.809473 2.030963,2.328722 0.917963,0.298555 1.923478,0.225299 2.850708,0.520151 0,0.115002 -5.6e-5,0.34817 0.0019,0.465007 -0.877167,0.582308 -1.93953,0.430407 -2.920554,0.601018 -0.767729,0.10943 -1.099321,0.862486 -1.48876,1.429949 -0.617533,-0.673176 -1.499042,-1.01236 -2.409585,-0.847306 0.101939,0.621237 0.50559,1.240505 0.281201,1.876575 -0.278189,0.7214 -0.793191,1.312736 -1.297614,1.885774 -0.73807,0.784434 -1.5208,1.6865 -2.67242,1.77181 -0.233694,0.602712 -0.0908,1.495589 -0.832604,1.760784 -0.72139,0.407979 -1.151771,-0.45444 -1.637644,-0.816068 -0.574885,-0.265202 -1.220558,-0.01731 -1.825113,-0.102917 -0.58971,-0.369062 -0.181709,-1.408314 0.40619,-1.567794 0.673182,-0.150238 0.832692,0.800717 1.444646,0.873042 0.257786,-0.02032 0.512385,-0.0768 0.766446,-0.126823 0.259631,-0.530379 0.445072,-1.156532 0.205875,-1.727698 -0.231776,-0.506268 -0.805886,-0.733183 -1.330704,-0.751731 -0.628657,0.07415 -1.118323,0.502719 -1.644984,0.808708 -0.02221,-1.025526 0.497422,-1.997975 0.36575,-3.021643 0.01845,-0.352349 -0.524428,-0.33108 -0.663511,-0.09558 -0.654635,0.823378 -0.276157,1.945266 -0.430088,2.902172 -0.307854,0.02447 -0.64257,-0.159384 -0.931861,-0.0143 -0.127952,0.450629 -0.195485,0.934239 -0.534844,1.286585 -0.591614,-0.0501 -1.416005,-0.348284 -1.334412,-1.082646 0.06674,-1.066322 -0.108415,-2.255856 -0.939213,-3.008772 -0.439487,-0.439631 -1.110792,-0.155847 -1.656005,-0.213329 -0.422822,-0.394997 -0.956132,-0.631947 -1.532869,-0.667177 -0.437651,-0.593427 -0.39459,-1.391308 -0.04412,-2.016268 0.242902,0.0061 0.484899,0.0094 0.727841,0.0143 0.11126,-0.611984 0.01333,-1.230202 -0.261011,-1.784681 -1.116388,-0.08349 -2.079842,0.6658 -3.198084,0.613885 0.791861,-0.916119 1.879728,-1.883639 3.179708,-1.709322 1.413101,0.168759 2.237618,-1.213759 3.387386,-1.755272 0.276308,-0.224396 0.583781,-0.02862 0.869372,0.0588 -0.191006,1.368604 -1.355177,2.236658 -2.323209,3.082295 -0.276331,0.209528 -0.467745,0.498864 -0.573446,0.825257 0.426529,0.172485 0.914038,0.254474 1.264535,0.575289 0.222514,0.265203 0.34226,0.594633 0.505439,0.898768 0.838217,-0.03727 1.089243,-0.940466 1.165277,-1.626606 0.103854,-0.608272 -0.03426,-1.404216 0.527503,-1.817769 0.645355,-0.330103 1.466275,-0.390416 2.135735,-0.09558 0.812265,0.452489 1.022342,1.43505 1.595365,2.100813 0.339399,0.298554 0.778803,0.035 1.042136,-0.227936 0.999568,-0.917962 0.803991,-2.757859 -0.319825,-3.484813 -0.493295,-0.337554 -1.045004,-0.02109 -1.549424,0.101075 -0.509968,-0.322686 0.01807,-1.046446 0.450311,-1.181826 0.565613,-0.276308 1.074743,0.187016 1.542064,0.446632 0.524826,0.363492 1.249107,0.245816 1.744247,-0.113948 0.886433,-0.634224 1.36076,-1.652882 2.113679,-2.418781 0.357921,0.958762 1.486732,0.980959 2.336073,0.8326 -0.250371,-0.305971 -0.63902,-0.549498 -0.705782,-0.968608 0.649068,-0.439506 1.437945,-0.568509 2.192698,-0.711301 -0.383872,-1.335221 -1.241988,-2.460527 -1.70931,-3.760506 z m -4.503058,3.359826 c 0.41173,0.0049 0.635257,0.460056 0.764602,0.803197 -0.398712,0.680595 -1.296467,-0.272844 -0.805031,-0.80136 0.01318,-8.09e-4 0.0271,-0.0019 0.04044,-0.0019 z m 21.197431,1.312319 c 0.792575,0.01393 1.541456,0.545203 1.948264,1.214903 0.378305,0.634228 0.909091,1.318218 0.782979,2.100816 -0.157616,0.493281 -0.784895,0.436239 -1.189177,0.363906 -1.292559,-0.196579 -2.18468,-1.366448 -3.501355,-1.479572 -1.448345,-0.122419 -2.835971,0.531783 -4.286168,0.463166 0.04638,-0.597138 0.613041,-0.902842 1.121169,-1.066025 1.214674,-0.380187 2.525294,-0.550353 3.775215,-0.253647 0.278189,-0.0019 0.680089,0.189576 0.88223,-0.05699 0.01694,-0.411699 -0.228348,-0.864196 0.02409,-1.238796 0.147829,-0.035 0.296222,-0.05045 0.442951,-0.0478 z m -16.826712,1.573309 c -0.580709,0.03426 -1.112974,0.384147 -1.646824,0.591833 -0.77146,0.311579 -1.506115,0.993647 -1.415249,1.898633 0.313387,0.113121 0.629575,0.217469 0.931857,0.358372 0.0061,0.422818 -0.06588,0.841723 -0.09558,1.262689 0.988436,-0.758476 1.719425,-2.007553 3.063915,-2.159624 0.09271,-0.688014 0.09613,-1.542166 -0.586319,-1.944588 -0.08508,-0.0094 -0.168833,-0.01205 -0.251801,-0.0075 z m 21.649571,0.126822 c 0.0783,9.42e-4 0.157126,0.01205 0.237081,0.03464 0.309699,0.391317 0.311845,0.939174 0.584474,1.356433 0.485866,0.749205 1.197034,1.328641 1.966639,1.768141 0.623092,0.376463 1.430419,0.304502 1.997884,0.788492 0.890145,0.730654 1.594413,1.725158 1.907822,2.83784 0.20215,0.561909 -0.303787,1.108382 -0.860174,1.099117 -0.767752,0.142823 -1.388303,-0.58756 -1.523683,-1.273726 -0.0946,-0.623107 -0.05665,-1.272102 -0.299571,-1.867384 -0.860489,-0.191081 -1.62824,-0.636163 -2.271744,-1.231448 -0.981009,-0.888288 -2.063062,-1.795665 -2.587875,-3.040021 0.195864,-0.287789 0.509717,-0.476933 0.849143,-0.472359 z m -13.953945,0.534852 c 0.246079,-0.0075 0.495235,0.08865 0.67453,0.30695 0.487736,0.437666 -0.389986,0.823198 -0.764597,0.847309 -0.409824,0.105704 -0.4945,-0.415192 -0.691075,-0.643293 0.153324,-0.320238 0.464743,-0.50148 0.781142,-0.510955 z m 4.183243,1.332534 c -0.400571,1.164603 -1.727401,2.231414 -3.001418,1.80674 -0.189123,-0.398711 0.07612,-0.804854 0.400673,-1.03111 0.32453,0.01844 0.645916,0.07695 0.970458,0.102917 0.511835,-0.357957 0.945984,-0.887829 1.630287,-0.87856 z m -6.370437,0.249956 c 0.01731,-3.64e-4 0.03388,-9.41e-4 0.05143,0 1.010695,0.274501 1.809869,1.027993 2.490455,1.790192 -1.01254,0.11681 -2.145123,-0.02898 -2.949951,-0.700267 -0.483262,-0.346777 -0.13036,-1.078274 0.408032,-1.089925 z m -7.366628,2.494138 c -0.606409,0.637947 -0.899205,1.501438 -1.056835,2.35078 -0.16507,0.669466 0.141842,1.412008 0.727836,1.775488 0.51926,-1.303698 0.443975,-2.755801 0.328973,-4.126268 z m -2.587874,0.257334 c -0.0271,0.0019 -0.05451,0.01129 -0.08089,0.02786 -0.56933,0.248526 -1.201465,0.721954 -1.266371,1.384 0.665755,0.170641 1.313927,-0.365975 1.547583,-0.95759 0.175234,-0.146021 -0.0094,-0.465906 -0.200379,-0.453985 z m -5.212512,0.145231 c -0.17305,0.0042 -0.33842,0.04337 -0.466855,0.123134 -0.242954,0.118654 -0.342222,0.313726 -0.299571,0.584478 0.337554,0.519247 1.163165,0.556775 1.606387,0.158067 0.253119,-0.556349 -0.320879,-0.875778 -0.839947,-0.865689 z m 58.260306,1.398704 c 2.454687,0 5.122767,0.931843 5.232707,3.545466 l 0.0218,0.345535 h -2.96649 l -0.0128,-0.317942 c -0.0497,-0.948538 -1.19957,-1.374808 -2.246003,-1.374808 -0.482421,0 -2.896666,0.146096 -2.896666,3.080458 0,2.937766 2.414245,3.091482 2.896666,3.091482 1.589163,0 2.266273,-0.781138 2.369143,-1.44649 l 0.0423,-0.279395 h 2.93894 l -0.0218,0.354758 c -0.16673,2.296302 -2.11152,3.562006 -5.495567,3.562006 -3.614625,0 -5.686715,-1.924901 -5.686715,-5.282353 0,-3.306248 2.174467,-5.278679 5.824563,-5.278679 z m -55.444527,0.226053 c -0.255943,0.287488 -0.478069,0.603519 -0.661671,0.942891 0.369064,0.09457 0.744726,0.172147 1.119333,0.24258 0.179863,-0.484018 -0.122005,-0.870239 -0.457662,-1.185497 z m 65.797854,0.02184 h 2.88013 v 3.824837 h 4.64273 v -3.824712 h 2.87828 v 10.061106 h -2.87828 v -4.039882 h -4.64273 v 4.039879 h -2.88013 z m 19.95496,0 h 3.17787 l 5.35035,10.061102 h -3.36718 l -1.13035,-2.104508 h -5.20516 l -1.03111,2.104486 h -3.13009 z m 12.78314,0 h 3.60797 l 5.04341,6.581809 v -6.581812 h 2.6669 V 67.67052 h -3.46458 l -5.1923,-6.717817 v 6.717817 h -2.6614 z m 16.84878,0 h 3.60059 l 5.05078,6.581809 v -6.581812 h 2.6669 V 67.67052 h -3.47194 l -5.1831,-6.717686 v 6.717813 h -2.66323 z m 16.81199,0 h 8.42348 v 2.190873 h -5.55438 v 1.558604 h 5.35771 v 2.198232 h -5.35771 v 1.913333 h 5.80802 v 2.201901 h -8.67712 z m 13.83633,0 h 2.8746 v 7.861042 h 5.37977 v 2.201901 h -8.25437 z M 59.102984,57.774858 c 0.0739,-3.77e-4 0.153739,0.01581 0.238966,0.04962 0.493284,0.810406 0.808881,1.801974 0.582637,2.749619 -1.090442,-0.113157 -2.067867,-1.647994 -1.225934,-2.551117 0.107097,-0.16443 0.241751,-0.247361 0.404354,-0.248151 z M 40.752593,58.18289 c -0.30439,-0.0042 -0.61029,0.02333 -0.911642,0.08635 -0.467334,1.038507 -0.149825,2.702806 1.198358,2.799242 0.18728,-0.934654 0.571163,-1.827609 0.621237,-2.786375 -0.300437,-0.06019 -0.603593,-0.09531 -0.907953,-0.09927 z m -12.34388,0.235199 c -0.16691,0.704709 -0.610297,1.28692 -1.01457,1.86923 -0.799267,1.13122 -1.552855,2.299419 -2.198216,3.527087 -0.168766,0.302282 -0.339132,0.626936 -0.645134,0.812386 -0.168765,-0.567469 -0.190358,-1.174842 -0.0717,-1.753435 0.176168,-0.904984 0.985913,-1.455062 1.520005,-2.14492 0.780731,-0.79 1.423023,-1.757702 2.409594,-2.310348 z m 33.960365,1.060521 c 0.536248,-0.0042 0.865065,0.476884 1.077057,0.91164 -0.598985,0.356074 -1.31085,0.177943 -1.683602,-0.4062 0.170603,-0.183628 0.354833,-0.353402 0.553244,-0.503606 0.01769,-9.38e-4 0.03577,-0.0019 0.0533,-0.0019 z m 68.589742,0.887746 -1.48878,2.999581 h 2.97755 z m -96.626298,1.451983 c -0.146492,0.517399 -0.32712,1.064594 -0.74622,1.431786 -0.42468,0.08349 -0.241803,-0.378621 -0.126819,-0.584481 0.218836,-0.34866 0.565203,-0.587685 0.873039,-0.847305 z m 1.108309,1.051321 c 0.669458,0.550786 0.06642,1.376121 -0.376777,1.849006 -0.252193,-0.654626 -0.162875,-1.372401 0.376777,-1.849006 z m -5.657304,0.617562 c -0.956911,0.526676 -1.868101,1.137926 -2.615453,1.940908 -0.04261,-0.485861 -0.140667,-1.034719 0.176451,-1.455683 0.78259,-0.272619 1.630446,-0.312747 2.439002,-0.485225 z m 39.169197,1.876577 c 1.246197,0.517393 2.282994,1.420306 3.291822,2.297477 1.450188,1.355625 2.823387,2.828014 3.828515,4.552679 0.71953,1.262892 1.544244,2.471817 2.538244,3.534435 0.45435,0.502568 0.963965,1.180993 0.661675,1.893123 -0.420955,0.281841 -0.973996,0.188822 -1.402379,0.448462 -0.841933,0.535942 -0.925672,1.765971 -1.828796,2.216612 -0.853056,-0.03881 -1.658805,-0.455611 -2.378339,-0.893264 -0.548934,-0.320841 -0.775397,-0.932437 -1.009058,-1.486931 -1.049623,0.526675 -1.858422,1.523961 -3.073095,1.700136 -0.556351,0.179863 -1.316155,0.0571 -1.505306,-0.578964 -0.307854,-0.981023 -0.534252,-2.249642 0.224246,-3.082287 0.255905,-0.272619 0.267913,-0.656758 0.31798,-1.003543 -1.197994,0.454346 -1.876017,1.619058 -2.766161,2.468414 -0.456201,-0.934662 -1.316188,-1.7381 -1.295786,-2.843365 0.864186,0.276308 1.190078,1.176036 1.709327,1.826952 0.365335,-0.864185 0.129645,-1.811562 0.226052,-2.714701 -0.02786,-0.307854 0.199965,-0.515341 0.450299,-0.641448 0.563762,0.0061 0.831314,0.577727 1.185502,0.922664 0.689867,-0.337555 1.107422,-1.041304 1.825108,-1.341727 0.92909,0.554487 1.123537,1.742735 1.064194,2.738594 0.01317,0.643497 -0.443921,1.136728 -0.748059,1.659694 1.448357,0.01318 2.839931,-1.209448 3.017966,-2.65037 1.040351,0.170566 1.139712,1.360567 1.534712,2.135735 0.565626,-1.548475 0.599633,-3.329761 -0.07353,-4.850428 -0.563758,-1.46689 -1.593686,-2.711585 -2.815786,-3.681473 -0.912378,-0.700993 -2.014634,-1.159654 -2.817625,-1.999723 -0.04085,-0.155772 -0.122795,-0.470969 -0.161718,-0.626753 z m -39.284993,0.246306 c 0.81678,-0.0128 1.622483,0.364885 2.20925,0.928183 -0.522956,0.337518 -1.216928,0.585947 -1.402381,1.246144 -0.207709,0.688011 -0.194463,1.423897 -0.441116,2.104491 -0.901266,-0.459895 -1.022467,-1.581896 -1.167113,-2.475744 -0.01333,-0.576737 -0.208963,-1.369549 0.347383,-1.755277 0.150686,-0.03011 0.302708,-0.0454 0.453985,-0.0478 z m 9.748646,1.446487 c 0.819437,0.0019 1.635472,0.150915 2.376511,0.510962 -0.235539,0.688006 -0.929979,0.98856 -1.554939,1.225929 -0.75106,0.265203 -1.547756,0.524808 -2.354447,0.413547 -0.517395,-0.08711 -1.056793,-0.368574 -1.26821,-0.876717 -0.118669,-0.662031 0.612903,-0.974895 1.135868,-1.095439 0.541676,-0.113007 1.104546,-0.17975 1.665217,-0.178282 z m 8.081591,0.551395 c 0.432095,0 1.055704,-0.0068 1.183667,0.520149 0.0075,0.836376 -0.549325,1.574554 -1.196529,2.054862 -0.356076,-0.686154 -0.75027,-1.422891 -0.707618,-2.216605 -0.0061,-0.394999 0.457145,-0.338006 0.72048,-0.358371 z m -2.641167,0.204031 c 0.448692,-0.0042 0.87995,0.109733 1.18733,0.483391 -0.176213,0.20215 -0.254324,0.590204 -0.593666,0.566098 -0.573027,0.05006 -0.982169,-0.489627 -0.906131,-1.029267 0.103968,-0.01167 0.208924,-0.0192 0.312483,-0.02032 z m -10.845926,0.284891 c 0.410331,-0.0068 0.8035,0.160439 1.088082,0.578959 -0.726951,0.778879 -1.754978,1.295236 -2.821294,1.356434 -0.465468,0.05371 -0.216054,-0.498137 -0.09926,-0.700272 0.316034,-0.662919 1.10099,-1.223757 1.832467,-1.235121 z m 9.052056,1.194681 c 0.914331,0.02447 1.827958,0.354946 2.541919,0.924509 0.817818,0.632372 1.945248,0.710483 2.904014,0.387825 0.12607,-0.272618 0.239115,-0.552981 0.424573,-0.788493 0.728813,0.289332 0.554923,1.117792 0.36575,1.703809 0.05192,0.09641 0.153964,0.289521 0.204031,0.385988 0.639785,0.107549 1.305271,0.107587 1.891277,-0.209527 0.03727,-0.146511 0.10992,-0.439812 0.147038,-0.586314 0.515556,0.420958 0.849745,1.02224 1.402375,1.398704 0.155771,-0.261476 0.257938,-0.638938 0.602859,-0.714975 1.255469,-0.32645 2.584001,-0.200567 3.846897,0.02786 0.402422,0.05195 0.402547,0.519627 0.604688,0.784815 0.992144,0.509998 2.152178,0.307063 3.196252,0.499929 0.424675,0.665747 0.498257,1.500279 0.479706,2.271746 0.02032,0.463611 -0.371284,0.766815 -0.577121,1.137711 -0.343051,0.789999 0.35295,1.743182 -0.06437,2.48311 -0.817825,-0.06306 -1.589789,-0.43072 -2.422447,-0.360253 -0.14094,0.244799 -0.248263,0.518306 -0.444796,0.726004 -0.430248,0.05191 -0.863698,-0.0128 -1.29394,-0.02184 -0.09091,0.433946 -0.159385,0.87098 -0.216867,1.310482 1.422374,0.515543 2.948165,-0.03125 4.390936,0.327165 -0.140939,0.684302 -0.380695,1.341244 -0.562422,2.016264 -0.185435,0.780738 -0.966833,1.174255 -1.374815,1.817765 -0.08157,0.426527 0.532626,0.466807 0.782982,0.678212 0.623093,-0.23554 1.230732,-0.538157 1.724021,-0.992502 0.530375,-0.433957 0.957132,-1.036425 1.628454,-1.264533 0.719532,-0.05007 1.111009,0.92388 1.839818,0.786652 0.723257,-0.391318 1.048521,-1.407844 1.985022,-1.413404 -0.263319,1.175742 -1.413637,1.78872 -2.214768,2.575011 1.129383,0.369064 2.451068,0.862243 3.574877,0.215023 1.452039,-0.841925 2.695375,-2.215084 4.455263,-2.385695 1.316667,-0.09271 2.395023,0.922311 3.001424,1.996042 -0.382027,0.135367 -0.819334,0.297312 -0.865689,0.762767 -0.415396,1.69313 -2.040244,2.589395 -3.063911,3.865271 0.495152,-0.289333 0.987596,-0.588427 1.538383,-0.764605 -0.465481,1.13494 -1.390679,1.996322 -2.293802,2.791901 -3.506809,2.592531 -7.559965,4.506971 -11.860485,5.306246 -3.749736,0.754775 -7.656931,0.696593 -11.388128,-0.130512 -0.836369,-0.181746 -1.700713,-0.316211 -2.462893,-0.722323 -0.725074,-0.374596 -1.360352,-0.940821 -2.155927,-1.168918 -0.663898,-0.120536 -1.372877,0.07635 -2.001555,-0.235237 -1.568889,-0.721484 -3.043907,-1.638251 -4.468136,-2.611854 -1.707961,-1.016248 -3.139911,-2.420837 -4.514075,-3.843216 -1.275868,-1.444638 -2.574512,-2.880644 -3.663096,-4.475477 -0.179844,-0.242951 -0.238671,-0.541447 -0.270181,-0.834447 0.773314,0.420956 1.138995,1.259866 1.821442,1.784675 0.318972,-1.09971 -0.449154,-2.072474 -1.198363,-2.779025 -0.393155,-0.404391 -0.977441,-0.493691 -1.433641,-0.795961 -0.641652,-0.65462 -1.018485,-1.507207 -1.40421,-2.326877 -0.474746,-1.006983 -0.86289,-2.066978 -0.970452,-3.183378 1.018108,-0.34866 2.111857,-0.148732 3.142943,0.03312 1.240642,0.220707 2.463176,1.127869 2.637495,2.440836 0.124232,1.118255 -0.08441,2.336272 0.520154,3.348808 0.322656,0.61754 1.34773,0.393886 1.499793,1.157917 0.239217,0.87346 -0.145592,2.227666 0.928178,2.637509 0.179882,-0.665767 0.04022,-1.385604 0.275705,-2.032809 0.469181,-0.415402 1.171135,-0.310263 1.753434,-0.345534 1.146064,0.03351 2.525625,0.0207 3.324906,0.988831 -0.320803,0.292983 -0.65322,0.569107 -0.983325,0.850978 -0.0019,0.100169 -0.0061,0.298706 -0.0075,0.398845 0.471028,0.246643 1.012196,0.213365 1.485082,-0.0113 0.880875,-0.37646 1.902409,-0.822442 2.304829,-1.757104 -0.20215,-0.662042 -0.938183,-0.849913 -1.466706,-1.176302 -0.808546,-0.409835 -1.344629,-1.260807 -2.258876,-1.474064 -1.014399,-0.235541 -2.119432,-0.354006 -3.126409,-0.0256 -0.489578,0.09271 -0.640097,0.978345 -1.205712,0.711293 -0.08347,-0.111238 -0.251057,-0.335371 -0.334491,-0.446616 0.812264,-1.060763 2.185041,-1.424047 3.46092,-1.468557 0.795548,-0.01694 1.608752,-0.01468 2.376502,0.220556 0.441363,0.111238 0.700453,0.529457 1.093603,0.724172 0.365299,-0.01844 0.724566,-0.138079 1.091758,-0.113949 1.136792,0.292984 2.044388,1.236281 2.394881,2.345269 0.115003,0.443215 0.421392,0.780596 0.779305,1.047646 0.402423,-0.73808 0.06453,-1.557208 0.04408,-2.334236 0.326411,0.146511 0.647814,0.305446 0.966779,0.472359 -0.148317,-0.493289 -0.06407,-1.013154 0.317943,-1.378482 0.263358,-0.415406 0.820254,-0.754238 0.762764,-1.299455 -0.341244,-0.764049 -1.189832,-1.260476 -1.321505,-2.130214 -0.0705,-0.398714 0.322121,-0.68898 0.680053,-0.718651 0.606409,-0.06682 1.251881,-0.205461 1.847166,-0.03652 0.29114,0.356075 0.35122,0.87239 0.74806,1.152418 0.660191,0.534079 1.440907,0.94685 2.275421,1.121169 0.504412,0.135369 0.948628,-0.306837 1.128521,-0.733355 0.0797,-0.725097 -0.51942,-1.260728 -1.014569,-1.689103 -1.555894,-1.190574 -3.455212,-1.813731 -5.337498,-2.266224 -0.934664,-0.237384 -1.972318,-0.219014 -2.780849,-0.806876 0.44507,-0.484023 1.4285,-0.733849 1.383998,-1.505308 -0.736233,-0.634228 -1.930165,-0.523667 -2.518034,-1.36746 -0.328257,-0.391277 0.156223,-0.88039 0.571603,-0.88039 0.130023,-0.0094 0.260836,-0.01242 0.391514,-0.0094 z m -5.684876,3.947986 c 0.785606,0.0042 1.572849,0.07163 2.348935,0.17832 0.404283,0.04638 0.774367,0.231662 1.123004,0.431921 -0.224398,0.216981 -0.440016,0.479262 -0.770109,0.529337 -0.843782,0.179862 -1.597349,0.722793 -1.994208,1.496112 0.298593,0.09271 0.59472,0.192023 0.88959,0.299571 -0.495151,0.446923 -1.13486,0.06952 -1.663376,-0.102916 -1.210977,-0.509916 -2.500839,-1.000111 -3.402107,-1.997822 0.324495,-0.289295 0.679777,-0.578436 1.124854,-0.637775 0.7733,-0.141879 1.557822,-0.20083 2.343417,-0.19669 z m -10.390106,3.464586 c -0.200278,0.802983 0.153295,1.574341 0.48523,2.284618 0.65834,0.03727 1.116414,-0.575289 1.031107,-1.196533 0.09645,-0.836283 -0.950727,-0.891432 -1.516337,-1.088006 z m 8.065066,0.305105 c 0.790008,-0.0094 1.476333,0.46608 2.047505,0.966784 -0.96618,0.17433 -2.045049,0.243144 -2.94261,-0.227934 0.01841,-0.445078 0.501954,-0.696217 0.895105,-0.738868 z m 20.480608,2.894818 c -0.05572,0.0049 -0.11026,0.02032 -0.165446,0.04408 -0.237383,0.118655 -0.375349,0.365224 -0.327166,0.634108 0.04642,0.543359 0.999121,0.631646 1.08257,0.08451 0.16714,-0.399175 -0.20004,-0.797528 -0.589995,-0.762768 z m 9.702701,1.575146 c 0.144289,0.0028 0.290123,0.04694 0.424573,0.139735 -0.203994,0.361609 -0.445898,0.699435 -0.735198,0.999869 -0.170564,-0.207683 -0.542699,-0.346364 -0.487065,-0.669034 0.169587,-0.289446 0.480252,-0.477328 0.79769,-0.47052 z m -8.868259,1.769981 c -0.317114,0.280035 -0.829251,0.526769 -0.792164,1.02192 -0.0061,0.550764 0.465564,0.917658 0.816057,1.273716 0.133523,-0.294867 0.187317,-0.642936 0.409872,-0.889584 0.474749,-0.220707 1.024808,-0.178998 1.527368,-0.306949 -0.567473,-0.504424 -1.236039,-0.87843 -1.961133,-1.099114 z m -8.199225,0.619396 c -0.19289,0.712117 1.079317,0.679213 0.825252,1.393189 -0.16138,0.389432 0.0098,1.07698 0.556903,0.878561 0.120537,-0.610128 0.1336,-1.292819 -0.213215,-1.83247 -0.252178,-0.380148 -0.744281,-0.472664 -1.168955,-0.43928 z m -12.185807,0.0478 c -0.382026,0.318996 -0.778681,0.722948 -0.643302,1.271883 0.211394,1.197974 0.996271,2.311886 2.021783,2.964657 0.04262,-0.548918 0.02522,-1.105465 -0.145202,-1.632128 -0.274448,-0.921671 -0.511893,-1.914564 -1.233279,-2.604412 z m 27.764527,0.812387 c -0.100168,0.0019 -0.304203,0.0075 -0.406192,0.0094 -0.16138,0.33379 -0.74818,0.739503 -0.321631,1.082573 0.713958,0.181783 0.853938,-0.574359 0.727842,-1.091755 z m -23.241265,0.847308 c 0.376463,1.15904 0.984125,2.252097 1.720351,3.220134 0.574892,0.775167 1.644441,0.991259 2.534573,0.718649 0.433954,-0.140903 0.462534,-0.710823 0.121327,-0.970454 -0.595277,-0.489577 -1.420469,-0.522196 -2.07324,-0.911635 -0.949494,-0.469181 -1.442516,-1.472544 -2.302992,-2.056694 z m 24.404708,0.297728 c -0.157013,-0.01167 -0.318995,0.02974 -0.46685,0.139696 -0.289333,0.148319 -0.652259,0.615411 -0.262832,0.85834 0.509989,0.194733 1.065009,0.07943 1.591684,0.03162 0.04593,-0.49514 -0.39104,-0.995444 -0.862005,-1.029269 z m -31.212586,0.619408 c 0.05193,1.201686 0.250898,2.659089 1.387674,3.330418 1.609679,0.949483 3.549789,0.910405 5.337499,1.255334 -1.03851,-0.738001 -1.961882,-1.855625 -3.32307,-1.927955 -1.568881,-0.209527 -2.091004,-2.012367 -3.402103,-2.657715 z m 20.385042,0.674529 c -0.302282,0.035 -0.644775,0.0075 -0.891423,0.220557 -0.09826,0.307853 -0.03652,0.634951 -0.02936,0.952076 0.532224,-0.157617 0.920828,-0.605171 0.920828,-1.172641 z" /> </g>  </svg>' 
        }
    ];

        // Перевірка нового контенту за останні 7 днів
        function checkNewContent(studio, cardElement) {
            if (!studio.providerId && !studio.networkId) return;
            var d = new Date();
            var today = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
            var weekAgo = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000);
            var weekAgoStr = [weekAgo.getFullYear(), ('0' + (weekAgo.getMonth() + 1)).slice(-2), ('0' + weekAgo.getDate()).slice(-2)].join('-');

            var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
            var filter = studio.providerId
                ? '&with_watch_providers=' + studio.providerId + '&watch_region=UA'
                : '&with_networks=' + studio.networkId;

            var url = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=primary_release_date.desc&primary_release_date.gte=' + weekAgoStr + '&primary_release_date.lte=' + today + '&vote_count.gte=1' + filter);

            var network = new Lampa.Reguest();
            network.timeout(5000);
            network.silent(url, function (json) {
                if (json.results && json.results.length > 0) {
                    cardElement.find('.card__view').append('<div class="studio-new-badge">NEW</div>');
                } else {
                    // Спробуємо TV
                    var urlTV = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=first_air_date.desc&first_air_date.gte=' + weekAgoStr + '&first_air_date.lte=' + today + '&vote_count.gte=1' + filter);
                    network.silent(urlTV, function (json2) {
                        if (json2.results && json2.results.length > 0) {
                            cardElement.find('.card__view').append('<div class="studio-new-badge">NEW</div>');
                        }
                    });
                }
            });
        }

        Lampa.ContentRows.add({
            index: 1, // After Hero (0)
            name: 'flixio_extract_studio_row',
            title: tr('streamings_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var items = studios.map(function (s) {
                        var isUkrainianFeed = s.isUkrainianFeed === true;
                        var isPolishFeed = s.isPolishFeed === true;
                        var isRussianFeed = s.isRussianFeed === true;
                        return {
                            title: s.name,
                            params: {
                                createInstance: function () {
                                    var card = Lampa.Maker.make('Card', this, function (module) {
                                        return module.only('Card', 'Callback');
                                    });
                                    return card;
                                },
                                emit: {
                                    onFocus: function() {
                                        // Colors/Wallpapers map for services
                                        var serviceBGs = {
                                            'netflix': 'linear-gradient(135deg, #000000, #4c0000)',
                                            'disney': 'linear-gradient(135deg, #050f2c, #1a2f63)',
                                            'hbo': 'linear-gradient(135deg, #0f0c29, #302b63)',
                                            'apple': 'linear-gradient(135deg, #000000, #333333)',
                                            'amazon': 'linear-gradient(135deg, #0f1c29, #004d40)',
                                            'hulu': 'linear-gradient(135deg, #0b1a0e, #1ce783)',
                                            'paramount': 'linear-gradient(135deg, #003366, #0066cc)',
                                            'sky_showtime': 'linear-gradient(135deg, #1a1a2e, #e94560)',
                                            'syfy': 'linear-gradient(135deg, #1a0b2e, #6a1b9a)',
                                            'educational_and_reality': 'linear-gradient(135deg, #3e2723, #ff6f00)',
                                            'ukrainian_feed': 'linear-gradient(135deg, #0057b7, #ffd700)',
                                            'polish_feed': 'linear-gradient(135deg, #ffffff, #c41e3a)',
                                            'russian_feed': 'linear-gradient(135deg, #0039a6, #d52b1e)'
                                        };
                                        
                                        // Используем метод Lampa.Background.change()
                                        if (Lampa.Background && Lampa.Background.change) {
                                            if (serviceBGs[s.id]) {
                                                 $('.background').css('background', serviceBGs[s.id]);
                                                 $('.background__img').css('opacity', 0);
                                            } else {
                                                 $('.background').css('background', '');
                                                 $('.background__img').css('opacity', 1);
                                            }
                                        }
                                    },
                                    onHover: function() {
                                        // Colors/Wallpapers map for services
                                        var serviceBGs = {
                                            'netflix': 'linear-gradient(135deg, #000000, #4c0000)',
                                            'disney': 'linear-gradient(135deg, #050f2c, #1a2f63)',
                                            'hbo': 'linear-gradient(135deg, #0f0c29, #302b63)',
                                            'apple': 'linear-gradient(135deg, #000000, #333333)',
                                            'amazon': 'linear-gradient(135deg, #0f1c29, #004d40)',
                                            'hulu': 'linear-gradient(135deg, #0b1a0e, #1ce783)',
                                            'paramount': 'linear-gradient(135deg, #003366, #0066cc)',
                                            'sky_showtime': 'linear-gradient(135deg, #1a1a2e, #e94560)',
                                            'syfy': 'linear-gradient(135deg, #1a0b2e, #6a1b9a)',
                                            'educational_and_reality': 'linear-gradient(135deg, #3e2723, #ff6f00)',
                                            'ukrainian_feed': 'linear-gradient(135deg, #0057b7, #ffd700)',
                                            'polish_feed': 'linear-gradient(135deg, #ffffff, #c41e3a)'
                                        };
                                        
                                        // Используем метод Lampa.Background.change()
                                        if (Lampa.Background && Lampa.Background.change) {
                                            if (serviceBGs[s.id]) {
                                                 $('.background').css('background', serviceBGs[s.id]);
                                                 $('.background__img').css('opacity', 0);
                                            } else {
                                                 $('.background').css('background', '');
                                                 $('.background__img').css('opacity', 1);
                                            }
                                        }
                                    },
                                    onCreate: function () {
                                        var item = $(this.html);
                                        item.addClass('card--studio');
                                        if (isUkrainianFeed) {
                                            item.find('.card__view').empty().html(
                                                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:0.4em;text-align:center;font-weight:700;font-size:1.05em;line-height:1.2;">' +
                                                '<span style="color:#0057b7;">' + tr('ukrainian_feed_name') + '</span>' +
                                                '</div>'
                                            );
                                        } else if (isPolishFeed) {
                                            item.find('.card__view').empty().html(
                                                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:0.4em;text-align:center;font-weight:700;font-size:1.05em;line-height:1.2;">' +
                                                '<span style="color:#c41e3a;">' + tr('polish_feed_name') + '</span>' +
                                                '</div>'
                                            );
                                        } else if (isRussianFeed) {
                                            item.find('.card__view').empty().html(
                                                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:0.4em;text-align:center;font-weight:700;font-size:1.05em;line-height:1.2;">' +
                                                '<span style="color:#d52b1e;">' + tr('russian_feed_name') + '</span>' +
                                                '</div>'
                                            );
                                        } else {
                                            var view = item.find('.card__view');
                                            view.empty();

                                            var wrapper = $('<div class="studio-logo-wrap"></div>');
                                            
                                            // Используем SVG, если есть, иначе fallback текст
                                            if (s.svg) {
                                                var svgEl = $(s.svg);
                                                svgEl.addClass('studio-logo-img');
                                                svgEl.css({
                                                    'max-width': '70%',
                                                    'max-height': '60%',
                                                    'display': 'block'
                                                });
                                                wrapper.append(svgEl);
                                            } else {
                                                var fallback = $('<div class="studio-logo-fallback" style="display:block;"></div>').text(s.name);
                                                wrapper.append(fallback);
                                            }

                                            view.append(wrapper);

                                            // checkNewContent(s, item);
                                        }
                                        item.find('.card__age, .card__year, .card__type, .card__textbox, .card__title').remove();
                                        item.attr('data-click-processed', '1');
                                    },
                                    onlyEnter: function () {
                                        if (isUkrainianFeed) {
                                            Lampa.Activity.push({
                                                url: '',
                                                title: tr('ukrainian_feed_name'),
                                                component: 'ukrainian_feed',
                                                page: 1
                                            });
                                            return;
                                        }
                                        if (isPolishFeed) {
                                            Lampa.Activity.push({
                                                url: '',
                                                title: tr('polish_feed_name'),
                                                component: 'polish_feed',
                                                page: 1
                                            });
                                            return;
                                        }
                                        if (isRussianFeed) {
                                            Lampa.Activity.push({
                                                url: '',
                                                title: tr('russian_feed_name'),
                                                component: 'russian_feed',
                                                page: 1
                                            });
                                            return;
                                        }
                                        Lampa.Activity.push({
                                            url: '',
                                            title: s.name,
                                            component: 'flixio_extract_studios_main',
                                            service_id: s.id,
                                            page: 1
                                        });
                                    }
                                }
                            }
                        };
                    });

                    callback({
                        results: items,
                        title: tr('streamings_row_title_full'),
                        params: {
                            items: {
                                view: 15,
                                mapping: 'line'
                            }
                        }
                    });
                };
            }
        });
    }

    // ========== ROW: НОВИНКИ РОСІЙСЬКОЇ СТРІЧКИ ==========
    function addRussianContentRow() {
        Lampa.ContentRows.add({
            index: 3, // Hero(0), Studios(1), Mood(2), then Russian(3)
            name: 'russian_content_row',
            title: tr('russian_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var results = [];
                    var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
                    var d = new Date();
                    var currentDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    var urlMovie = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate + '&with_original_language=ru&vote_count.gte=5');
                    var urlTV = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate + '&with_original_language=ru&vote_count.gte=5');

                    network.silent(urlMovie, function (json1) {
                        if (json1.results) results = results.concat(json1.results);
                        network.silent(urlTV, function (json2) {
                            if (json2.results) results = results.concat(json2.results);
                            results.sort(function (a, b) {
                                var dateA = new Date(a.release_date || a.first_air_date || '2000-01-01');
                                var dateB = new Date(b.release_date || b.first_air_date || '2000-01-01');
                                return dateB - dateA;
                            });
                            var unique = [];
                            var seen = {};
                            results.forEach(function (item) {
                                if (!seen[item.id]) { seen[item.id] = true; unique.push(item); }
                            });
                            callback({
                                results: unique.slice(0, 20),
                                title: tr('russian_row_title_full'),
                                params: {
                                    items: { mapping: 'line', view: 15 }
                                }
                            });
                        });
                    });
                };
            }
        });
    }

    // ========== ROW: НОВИНКИ УКРАЇНСЬКОЇ СТРІЧКИ ==========
    function addUkrainianContentRow() {
        Lampa.ContentRows.add({
            index: 4, // после Russian(3)
            name: 'ukrainian_content_row',
            title: tr('ukrainian_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var results = [];
                    var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
                    var d = new Date();
                    var currentDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    var urlMovie = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate + '&with_origin_country=UA&vote_count.gte=1');
                    var urlTV = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate + '&with_origin_country=UA&vote_count.gte=1');

                    network.silent(urlMovie, function (json1) {
                        if (json1.results) results = results.concat(json1.results);
                        network.silent(urlTV, function (json2) {
                            if (json2.results) results = results.concat(json2.results);
                            results.sort(function (a, b) {
                                var dateA = new Date(a.release_date || a.first_air_date || '2000-01-01');
                                var dateB = new Date(b.release_date || b.first_air_date || '2000-01-01');
                                return dateB - dateA;
                            });
                            var unique = [];
                            var seen = {};
                            results.forEach(function (item) {
                                if (!seen[item.id]) { seen[item.id] = true; unique.push(item); }
                            });
                            callback({
                                results: unique.slice(0, 20),
                                title: tr('ukrainian_row_title_full'),
                                params: {
                                    items: { mapping: 'line', view: 15 }
                                }
                            });
                        });
                    });
                };
            }
        });
    }

    // ========== ROW: НОВИНКИ АНГЛОМОВНОЇ СТРІЧКИ ==========
    function addEnglishContentRow() {
        Lampa.ContentRows.add({
            index: 5, // после Ukrainian(4)
            name: 'english_content_row',
            title: tr('english_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var results = [];
                    var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
                    var d = new Date();
                    var currentDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    var urlMovie = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate + '&with_original_language=en&vote_count.gte=20');
                    var urlTV = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate + '&with_original_language=en&vote_count.gte=20');

                    network.silent(urlMovie, function (json1) {
                        if (json1.results) results = results.concat(json1.results);
                        network.silent(urlTV, function (json2) {
                            if (json2.results) results = results.concat(json2.results);
                            results.sort(function (a, b) {
                                var dateA = new Date(a.release_date || a.first_air_date || '2000-01-01');
                                var dateB = new Date(b.release_date || b.first_air_date || '2000-01-01');
                                return dateB - dateA;
                            });
                            var unique = [];
                            var seen = {};
                            results.forEach(function (item) {
                                if (!seen[item.id]) { seen[item.id] = true; unique.push(item); }
                            });
                            callback({
                                results: unique.slice(0, 20),
                                title: tr('english_row_title_full'),
                                params: {
                                    items: { mapping: 'line', view: 15 }
                                }
                            });
                        });
                    });
                };
            }
        });
    }

    // ========== ROW: НОВИНКИ ПОЛЬСЬКОЇ СТРІЧКИ ==========
    // (переиндексация для нового порядка RU-UA-EN-PL)
    // Жанри TMDB: Драма 18, Комедія 35, Мультфільм 16, Сімейний 10751, Документальний 99, Бойовик 28, Мелодрама 10749, Трилер 53, Кримінал 80, Пригоди 12, Жахи 27, Фентезі 14

    function addExtractStyles(){
        if ($('#flixio-extract-css').length) return;
        $('body').append('<style id="flixio-extract-css"> .card.hero-banner {     width: 52vw !important;     height: 25em !important;     margin: 0 1.5em 0.3em 0 !important;     display: inline-block;     scroll-snap-align: start;     scroll-margin-left: 1.5em !important; } .scroll__content:has(.hero-banner) {     scroll-snap-type: x mandatory;     padding-left: 1.5em !important; } .scroll--mask .scroll__content { padding: 1.2em 1em 1em; } .row--card { margin-bottom: -1.2em !important; } .items-line { padding-bottom: 2em !important; } .card--studio {     width: 12em !important;     height: 6.75em !important;     padding: 0 !important;     background: #f5f7fa;     border-radius: 0.8em;     display: flex;     align-items: center;     justify-content: center;     overflow: hidden;     box-shadow: 0 3px 10px rgba(0,0,0,0.35);     border: 1px solid rgba(255,255,255,0.06);     transition: transform 0.18s ease-out, box-shadow 0.18s ease-out; } .card--studio.focus {     transform: scale(1.06);     box-shadow: 0 0 18px rgba(255,255,255,0.9);     z-index: 10; } .card--studio .card__view {     width: 100%; height: 100%; padding: 0.6em !important;     box-sizing: border-box !important;     background-origin: content-box;     display: block; position: relative; } .studio-logo-wrap {     width: 100%; height: 100%; display: flex;     align-items: center; justify-content: center; } .studio-logo-img {     max-width: 70%; max-height: 60%; object-fit: contain; display: block; } .studio-logo-fallback {     display: none; font-weight: 700; font-size: 1.05em;     text-align: center; color: #000; padding: 0.4em; } .flixio-service-logo { display:inline-block; vertical-align:middle; margin-right:.4em; margin-bottom:.1em; } .flixio-service-logo img { height:1.4em; width:auto; display:block; } .flixio-extract .studios_main .card--wide, .flixio-extract .studios_view .card--wide, .studios_main .card--wide, .studios_view .card--wide { width:18.3em !important; } .studios_view .category-full { padding-top:1em; } .studio-subscription-btn {     display:inline-flex; align-items:center; justify-content:center; vertical-align:middle;     margin-left:.4em; padding:.18em .22em; font-size:.4em; font-weight:800;     line-height:1; letter-spacing:.02em; border-radius:.25em;     border:1px solid rgba(255,255,255,.2); cursor:pointer;     transition:box-shadow .15s, transform .15s; } .company-start__name { display:inline-flex; align-items:center; flex-wrap:wrap; } .studio-subscription-btn.studio-subscription-btn--sub {     background:linear-gradient(135deg,#1565c0,#42a5f5); color:#fff; border-color:rgba(66,165,245,.4); } .studio-subscription-btn.studio-subscription-btn--unsub {     background:linear-gradient(135deg,#37474f,#78909c); color:#fff; border-color:rgba(120,144,156,.4); } .studio-subscription-btn.focus { box-shadow:0 0 0 2px #fff; transform:scale(1.05); } .flixio-more-btn {     width:14em !important; height:21em !important; border-radius:.8em;     background:rgba(255,255,255,.05); display:flex; align-items:center;     justify-content:center; cursor:pointer; transition:transform .2s, background .2s;     order:9999 !important; } .flixio-more-btn:hover,.flixio-more-btn.focus {     background:rgba(255,255,255,.15); transform:scale(1.05); box-shadow:0 0 0 3px #fff; } .flixio-more-btn > div { text-align:center; } .hero-banner .card-marks,.hero-banner .card__icons,.hero-banner .card__quality { display:none !important; } .show-more-button.focus,.card.show-more-button:focus,.kino-card.show-more-button:hover,.kino-card.show-more-button.focus {     transform:scale(1.05) !important; box-shadow:0 0 0 3px #fff !important; z-index:10 !important; } </style>');
    }

    function setupExtractSettings(){
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent || !Lampa.SettingsApi.addParam) return;
        if (window.FLIXIO_EXTRACT_SETTINGS_READY) return;
        window.FLIXIO_EXTRACT_SETTINGS_READY = true;
        Lampa.SettingsApi.addComponent({
            component: 'flixio_extract_plugin',
            name: 'Flixio — Главная',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
        });
        Lampa.SettingsApi.addParam({
            component:'flixio_extract_plugin',
            param:{type:'title'},
            field:{name:'Секции главной страницы'}
        });
        Lampa.SettingsApi.addParam({
            component:'flixio_extract_plugin',
            param:{name:'flixio_extract_hero',type:'trigger',default:true},
            field:{name:'Новинки проката',description:'Показывать большие карточки новинок проката'}
        });
        Lampa.SettingsApi.addParam({
            component:'flixio_extract_plugin',
            param:{name:'flixio_extract_streamings',type:'trigger',default:true},
            field:{name:'Стриминги',description:'Показывать секцию Netflix, Disney+, HBO, Apple TV+ и других сервисов'}
        });
        Lampa.SettingsApi.addParam({
            component:'flixio_extract_plugin',
            param:{name:'flixio_tmdb_apikey',type:'input',placeholder:'Ключ TMDB (опционально)',values:'',default:''},
            field:{name:'Свой ключ TMDB',description:'Если указан — используется этим плагином вместо ключа Lampa'}
        });
    }

    function initExtract(){
        try {
            setupExtractSettings();
            addExtractStyles();
            addSectionTitleIcons();
            Lampa.Component.add('flixio_extract_studios_main', StudiosMain);
            Lampa.Component.add('flixio_extract_studios_view', StudiosView);
            if (Lampa.Storage.get('flixio_extract_hero', true)) addHeroRow();
            if (Lampa.Storage.get('flixio_extract_streamings', true)) addStudioRow();
            setTimeout(function(){
                var heroCard=document.querySelector('.hero-banner');
                if(heroCard){ heroCard.style.width='85vw'; heroCard.style.marginRight='1.5em'; }
                var studioCard=$('.card--studio');
                if(studioCard.length && Lampa.Controller && Lampa.Controller.enabled && Lampa.Controller.enabled().name==='main'){
                    var content=$('.scroll__content').eq(1)[0];
                    if(content) Lampa.Controller.collectionFocus(studioCard[0],content);
                }
            },1000);
        } catch(e) {
            console.error('[Flixio Extract] init error',e);
        }
    }

    function boot(){
        if(window.appready) initExtract();
        else if(Lampa.Listener && Lampa.Listener.follow) Lampa.Listener.follow('app',function(e){ if(e.type==='ready') initExtract(); });
    }
    boot();
})();
