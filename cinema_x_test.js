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

    // ========== CINEMAX: HORROR ==========
    // Four TMDB sections:
    // 1) New horror movies
    // 2) New horror series
    // 3) Highest-rated horror movies
    // 4) Highest-rated horror series
    function CinemaXHorror(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();

        var HORROR_CATEGORIES = [
            {
                title: '🔥 Новые фильмы',
                url: 'discover/movie',
                params: {
                    with_genres: '27',
                    sort_by: 'primary_release_date.desc',
                    'vote_count.gte': '5',
                    'primary_release_date.lte': '{current_date}'
                }
            },
            {
                title: '🔥 Новые сериалы',
                url: 'discover/tv',
                params: {
                    with_genres: '27',
                    sort_by: 'first_air_date.desc',
                    'vote_count.gte': '5',
                    'first_air_date.lte': '{current_date}'
                }
            },
            {
                title: '⭐ Лучшие фильмы',
                url: 'discover/movie',
                params: {
                    with_genres: '27',
                    sort_by: 'vote_average.desc',
                    'vote_count.gte': '100'
                }
            },
            {
                title: '⭐ Лучшие сериалы',
                url: 'discover/tv',
                params: {
                    with_genres: '27',
                    sort_by: 'vote_average.desc',
                    'vote_count.gte': '100'
                }
            }
        ];

        function buildParams(cat) {
            var params = [
                'api_key=' + getTmdbKey(),
                'language=' + encodeURIComponent(Lampa.Storage.get('language', 'uk')),
                'page=1'
            ];

            for (var key in cat.params) {
                var val = cat.params[key];

                if (val === '{current_date}') {
                    var d = new Date();
                    val = [
                        d.getFullYear(),
                        ('0' + (d.getMonth() + 1)).slice(-2),
                        ('0' + d.getDate()).slice(-2)
                    ].join('-');
                }

                params.push(key + '=' + encodeURIComponent(val));
            }

            return params.join('&');
        }

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);

            var status = new Lampa.Status(HORROR_CATEGORIES.length);

            status.onComplite = function () {
                var rows = [];

                if (status.data) {
                    Object.keys(status.data)
                        .sort(function (a, b) {
                            return parseInt(a, 10) - parseInt(b, 10);
                        })
                        .forEach(function (key) {
                            var index = parseInt(key, 10);
                            var cat = HORROR_CATEGORIES[index];
                            var data = status.data[key];

                            if (!cat || !data || !data.results || !data.results.length) return;

                            data.results.forEach(function (item) {
                                if (!item.poster_path && item.backdrop_path) {
                                    item.poster_path = item.backdrop_path;
                                }

                                if (!item.media_type) {
                                    item.media_type = cat.url.indexOf('/tv') !== -1 ? 'tv' : 'movie';
                                }
                            });

                            Lampa.Utils.extendItemsParams(data.results, {
                                style: { name: 'wide' }
                            });

                            rows.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        });
                }

                if (rows.length) {
                    _this.build(rows);
                    _this.activity.loader(false);
                } else {
                    console.warn('[CinemaX] TMDB не вернул контент для раздела Ужасы');
                    _this.empty();
                    _this.activity.loader(false);
                }
            };

            HORROR_CATEGORIES.forEach(function (cat, index) {
                var url = Lampa.TMDB.api(
                    cat.url + '?' + buildParams(cat)
                );

                network.silent(
                    url,
                    function (json) {
                        if (json && json.results && Array.isArray(json.results)) {
                            json.results.forEach(function (item) {
                                if (!item.poster_path && item.backdrop_path) {
                                    item.poster_path = item.backdrop_path;
                                }
                            });
                        }

                        status.append(String(index), json || { results: [] });
                    },
                    function () {
                        status.append(String(index), { results: [] });
                    }
                );
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
            id: 'horror',
            name: 'Ужасы',
            svg: '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="1000px" height="349.262px" viewBox="0 0 1000 349.262" enable-background="new 0 0 1000 349.262" xml:space="preserve"> <g> <path d="M695.602,127.423c-0.225-0.221-0.715-0.479-1.469-0.777c-0.101,0.509-0.125,0.934-0.111,1.322 c0.589,0.003,1.112-0.005,1.51-0.025c0.168,0.101,0.357,0.211,0.541,0.319c-0.009-0.024-0.018-0.046-0.026-0.067 C695.974,127.902,695.826,127.645,695.602,127.423"/> <path d="M592.576,336.17c0.005,0,0.01,0.005,0.016,0.005c-0.003,0.022,0,0.043-0.006,0.065c0.151,0.006,0.322-0.016,0.41,0.061 c0.707,0.583,1.479,0.634,2.294,0.561l-0.881-2.242c-0.249,0.238-0.53,0.435-0.915,0.529 C592.996,335.274,592.913,335.849,592.576,336.17"/> <path d="M677.577,123.646c0.006,0.018,0.011,0.034,0.015,0.049c0-0.015-0.004-0.024-0.004-0.039 C677.583,123.651,677.583,123.649,677.577,123.646"/> <path d="M685.173,125.8c-0.535,0.213-0.99,0.469-1.37,0.755c-0.005,0.005-0.013,0.008-0.018,0.013 c-0.38,0.283-0.787,0.533-1.24,0.745c-0.452,0.216-1.134,0.172-2.039-0.13c0.156-1.017-0.289-1.607-1.346-1.761 c-0.404-0.06-0.706-0.202-0.955-0.389c0.478,0.796,1.089,1.506,1.655,2.266c1.696,0.297,3.339,0.228,4.943-0.398 c0.468-0.184,0.928-0.397,1.41-0.516c0.204-0.052,0.523,0.032,0.683,0.176c0.022,0.018,0.042,0.043,0.064,0.066 c0.166-0.18,0.289-0.412,0.367-0.7C686.426,125.63,685.705,125.587,685.173,125.8"/> <path d="M676.591,120.689c-0.227-0.222-0.642-0.258-1.245-0.121c-0.144,0.386-0.153,0.772-0.053,1.158 c0.193,0.111,0.41,0.196,0.669,0.246c0.501,0.093,0.89,0.368,1.172,0.742c0-0.415-0.028-0.796-0.096-1.145 C676.966,121.207,676.817,120.908,676.591,120.689"/> <path d="M47.666,335.423c-0.138-0.012-0.358,0.073-0.418,0.184c-0.801,1.479-0.474,3.198-1.753,4.536 c-1.182,1.238-2.359,1.807-3.783,0.433c-0.445-0.43-0.289-0.81-0.999-1.116c-2.315-1.001-4.929,0.086-7.209,0.549 c0.779-0.159,2.657,0.985,3.577,1.104c0.765,0.093,2.353-0.344,2.897,0.38c0.745,0.996,1.452,1.835,2.131,2.854h6.759v-8.617 c0-0.035-0.291-0.073-0.391-0.11C48.243,335.533,47.907,335.443,47.666,335.423"/> <path d="M143.55,132.583H95.699v57.012H48.866v-57.012H0v172.34c1.017-0.071,1.364,0.072,1.944,0.452 c0.216,0.137,0.358,0.347,0.334,0.624c-0.015,0.201-0.239,0.485-0.448,0.511c-0.245,0.032-0.486,0.058-0.68,0.08 c-0.307-0.022-0.612-0.013-0.857-0.058C0.204,306.517,0,306.487,0,306.452v1.623c1.017-0.146,1.156-0.077,1.684,0.106 c0.286,0.105,0.582,0.383,0.765,0.644c0.584,0.846,0.857,1.811,1.071,2.804c0.09,0.42,0.387,0.737,0.845,0.838 c0.816,0.181,1.638,0.359,2.455,0.543c0.165,0.035,0.361,0.046,0.479,0.141c0.182,0.146,0.374,0.338,0.45,0.551 c0.088,0.239-0.249,0.666-0.545,0.745c-0.401,0.108-0.818,0.163-1.216,0.289c-0.73,0.233-0.976,0.875-0.63,1.599 c0.108,0.222,0.229,0.445,0.364,0.654c0.317,0.487,0.65,0.96,0.946,1.4c0.149,0.03,0.229,0.063,0.309,0.063 c0.665,0,1.28-0.553,1.954-0.264c0.686,0.299,1.334,0.691,1.983,1.071c0.309,0.178,0.457,0.511,0.43,0.855 c-0.054,0.749-0.165,1.496-0.231,2.245c-0.059,0.664-0.103,1.328-0.129,1.996c-0.013,0.317,0.299,0.669,0.592,0.717 c0.907,0.153,1.813,0.303,2.72,0.45c0.354,0.056,0.659-0.075,0.938-0.281c0.474-0.343,0.929-0.709,1.416-1.038 c0.369-0.25,0.793-0.259,1.202-0.096c1.422,0.57,2.668,1.365,3.528,2.698c0.332,0.51,1.046,0.588,1.584,0.291 c0.147-0.08,0.314-0.141,0.433-0.251c1.187-1.111,2.755-1.582,4.084-2.455c0.366-0.236,0.801-0.271,1.216-0.16 c0.89,0.227,1.76,0.553,2.662,0.729c1.177,0.231,1.996,0.93,2.493,1.926c0.627,1.268,1.499,2.429,1.755,3.872 c0.058,0.317,0.271,0.609,0.417,0.911c0.167,0.347,0.525,0.513,0.811,0.327c0.714-0.453,1.435-0.795,2.318-0.851 c0.809-0.045,1.279-0.722,1.758-1.307c0.095-0.116,0.152-0.308,0.149-0.466c-0.01-0.918-0.037-1.841-0.08-2.759 c-0.009-0.153-0.108-0.316-0.204-0.448c-0.334-0.449-0.358-0.925-0.152-1.423c0.103-0.256,0.085-0.519-0.106-0.693 c-0.813-0.766-0.934-1.922-1.653-2.772c-0.639-0.748-0.974-1.749-1.489-2.609c-0.435-0.734-0.391-1.426-0.012-2.143 c0.427-0.817,0.906-1.615,1.262-2.459c0.389-0.923,0.661-1.894,0.991-2.843c0.361-1.025,0.693-2.062,1.11-3.067 c0.152-0.366,0.474-0.691,0.791-0.95c0.138-0.111,0.497-0.081,0.679,0.022c0.196,0.111,0.351,0.362,0.444,0.586 c0.197,0.457,0.251,1.006,0.524,1.408c0.948,1.394,0.75,2.864,0.402,4.358c-0.457,1.954-0.945,3.899-1.373,5.861 c-0.183,0.846-0.58,1.557-1.094,2.103c0.118,0.492,0.342,0.731,0.678,0.837c0.136,0.043,0.364,0.028,0.458-0.063 c0.683-0.649,1.025-1.523,1.391-2.354c0.152-0.348,0.046-0.828-0.015-1.238c-0.245-1.629,0.61-2.346,2.216-2.283 c0.983,0.043,2.022,0.144,3.039,0.081v-14.243c0,0.244-0.678,0.332-1.033,0.211c-0.473-0.165-0.986-0.353-1.459-0.508 c-1.234-0.401-2.465-0.508-3.642,0.229c-0.345,0.219-0.914-0.185-0.877-0.596c0.147-1.578,0.198-3.17,0.609-4.713 c0.236-0.891,0.482-1.773,0.729-2.656c0.079-0.289,0.553-0.482,0.829-0.352c0.149,0.075,0.33,0.105,0.449,0.211 c0.939,0.845,1.797,1.748,2.143,3.013c0.018,0.07,0.195,0.121,0.28,0.216c0.607,0.101,0.956,0.192,1.973,0.313v-62.243h45.25h0.278 h1.304v0.173v0.511v82.899c0,0.301,0.563,0.684,0.846,1.148c0.299,0.49,0.717,0.873,1.101,1.315 c0.506,0.588,0.272,1.509,0.875,2.037c0.503,0.432,1.133,0.719,1.582,1.197c0.447,0.479,0.744,1.102,1.076,1.68 c0.622,1.091,1.233,2.183,1.828,3.292c0.361,0.671,0.911,0.923,1.642,0.917c0.67,0,1.339,0.043,2.012,0.058 c0.25,0.008,0.501-0.015,0.752-0.007c1.432,0.04,3.88-0.42,5.062-1.012c0.695-0.347,1.44-0.427,2.187-0.532 c0.495-0.075,0.992-0.164,1.489-0.231c0.227-0.033,0.716,0.326,0.754,0.567c0.162,0.994,0.314,1.984,0.467,2.979 c0.047,0.331,0.059,0.668,0.148,0.99c0.093,0.327,0.314,0.619,0.678,0.659c0.495,0.055,1.012,0.136,1.489,0.04 c0.673-0.136,1.322-0.061,1.99-0.045c1.57,0.04,1.494,0.375,1.722,1.594c0.032,0.161,0.049,0.332,0.028,0.498 c-0.178,1.423-0.108,2.842,0.085,4.26c0.034,0.241-0.01,0.503-0.059,0.747c-0.069,0.344-0.265,0.626-0.603,0.744 c-1.076,0.37-2.13,0.342-3.167-0.178c-1.496-0.75-3.026-1.439-4.501-2.229c-0.82-0.441-1.695-0.695-2.545-1.035 c-0.852-0.343-1.668-0.77-2.504-1.154c-1.056-0.49-2.162-0.855-3.149-1.526c-0.742-0.506-1.681-0.72-2.539-1.044 c-0.435-0.168-0.847,0.088-0.901,0.556c-0.056,0.499-0.054,1.001-0.132,1.497c-0.064,0.404-0.205,0.797-0.28,1.075 c0.589,1.245,1.135,2.372,1.656,3.506c0.201,0.44-0.126,1.084-0.612,1.192c-0.569,0.121-1.154,0.231-1.731,0.236 c-1.089,0.007-2.178-0.068-3.268-0.098c-0.46-0.013-0.804,0.203-0.998,0.618c-0.16,0.342-0.292,0.698-0.443,1.041h12.991 c-0.307-0.111-0.614-0.211-0.917-0.362c-0.641-0.322-0.793-0.814-0.41-1.378c0.683-0.996,1.517-1.635,2.696-1.927 c0.516-0.131,0.914,0.284,0.914,0.818v0.575c0,0.418-0.118,0.94-0.3,1.662c-0.101,0.405-0.15,0.611-0.33,0.611h31.173 C143.55,344.343,143.539,132.583,143.55,132.583 M38.785,327.057c0.383-0.136,0.85,0.259,0.784,0.664 c-0.066,0.412-0.413,0.734-0.836,0.744c-0.296,0.008-0.437-0.206-0.503-0.447C38.118,327.605,38.357,327.213,38.785,327.057 M38.962,281.884c0.199,0.095,0.639,0.291,1.054,0.527c0.303,0.169,0.463,0.553,0.381,0.815c-0.105,0.334-0.348,0.553-0.683,0.629 c-0.723,0.165-1.648-0.625-1.653-1.396C38.058,282.155,38.417,281.811,38.962,281.884 M23.906,277.467 c0.042-0.706,0.417-1.262,0.835-1.78c0.128-0.16,0.471-0.299,0.644-0.24c0.461,0.16,0.922,0.384,1.315,0.673 c0.425,0.313,0.611,0.815,0.508,1.338c-0.128,0.654-0.342,1.288-0.521,1.932c-0.101,0.356-0.371,0.538-0.706,0.634 c-0.239,0.07-0.489,0.098-0.734,0.155c-0.795,0.177-1.475-0.269-1.485-0.995C23.824,278.464,23.878,277.965,23.906,277.467 M10.396,275.969c0.188-0.286,0.404-0.508,0.762-0.581c0.401-0.083,0.883-0.088,1.18-0.319c1.305-1.011,2.912-1.194,4.398-1.71 c0.265-0.091,0.676,0.231,0.744,0.493c0.146,0.588,0.045,1.166-0.063,1.737c-0.268,1.4-0.787,2.719-1.398,4.036 c-0.448,0.201-0.89,0.428-1.352,0.609c-1.032,0.398-2.083,0.572-3.172,0.186c-0.309-0.114-0.656-0.11-0.981-0.186 c-0.355-0.081-0.577-0.333-0.675-0.67c-0.09-0.316-0.224-0.656-0.192-0.971C9.738,277.684,9.878,276.771,10.396,275.969 M14.258,291.351c-0.397,1.007-1.562,1.255-2.191,0.466c-0.378-0.479-0.073-1.277,0.528-1.373c0.165-0.025,0.332-0.035,0.635-0.065 c0.188,0.075,0.5,0.181,0.793,0.317C14.217,290.785,14.333,291.163,14.258,291.351 M9.022,282.29 c0.147-0.07,0.312-0.085,0.456-0.12c0.361-0.027,0.717,0.04,0.886,0.342c0.356,0.634-0.243,1.624-0.958,1.652 c-0.438,0.018-0.888-0.284-0.941-0.631C8.376,282.964,8.583,282.486,9.022,282.29 M3.726,276.069 c0.873-0.196,1.703,0.297,1.931,1.154c0.01,0.037,0.013,0.083,0.01,0.123s-0.005,0.086-0.005,0.126 c-0.038,0.179-0.278,0.442-0.502,0.576c-0.074,0.042-0.147,0.072-0.209,0.072c-0.718,0.054-1.31-0.163-1.697-0.814 C3.01,276.896,3.281,276.17,3.726,276.069 M1.848,301.369c-1.153-0.008-1.182-0.01-1.127-1.284c0.01-0.229-0.067-0.479-0.157-0.689 c-0.098-0.227-0.271-0.41-0.389-0.626c-0.128-0.234,0.172-0.747,0.433-0.793c0.84-0.147,1.666-0.1,2.467,0.187 c0.631,0.227,1.241,0.5,1.877,0.705c0.283,0.089,0.598,0.085,0.902,0.115c-0.002-0.03-0.015-0.056-0.015-0.093 c0.023,0.002,0.038,0.009,0.062,0.012c-0.026-0.091-0.052-0.182-0.078-0.271c-0.032-0.115-0.076-0.227-0.152-0.304 c-0.394-0.423-0.846-0.788-1.271-1.185c-0.155-0.146-0.196-0.559-0.057-0.689c0.357-0.34,0.71-0.697,1.114-0.971 c0.179-0.123,0.533-0.171,0.709-0.075c1.182,0.653,2.246,1.456,2.655,2.834c0.154,0.511,0.002,0.993-0.42,1.345 c-0.26,0.217-0.556,0.375-0.911,0.25c-0.357-0.124-0.71-0.265-1.066-0.4c0.002,0.021,0.011,0.035,0.011,0.056 c-0.037-0.005-0.068-0.021-0.101-0.026c-0.01,0.062-0.021,0.121-0.032,0.188c-0.02,0.166-0.039,0.337-0.086,0.487 c-0.024,0.075-0.054,0.144-0.098,0.206c-0.17,0.247-0.505,0.479-0.801,0.528C4.163,301.065,3.035,301.377,1.848,301.369 M3.244,304.379c-0.352-0.276-0.541-0.623-0.484-1.078c0.064-0.525,0.271-1.019,0.771-1.209c0.617-0.242,1.279-0.368,1.931-0.514 c0.239-0.056,0.501-0.045,0.75-0.016c2.072,0.258,4.146,0.521,6.217,0.79c0.668,0.086,0.968,0.568,1.226,1.124 c0.157,0.332,0.191,0.651,0.01,0.948c-0.298,0.508-0.625,0.993-0.968,1.469c-0.416,0.583-1.013,0.865-1.717,0.89 c-0.332,0.011-0.667-0.045-0.955-0.064c-1.262,0.241-2.38-0.102-3.441-0.629C5.467,305.531,4.246,305.169,3.244,304.379 M15.79,311.782c-0.275,0.779-0.646,1.534-1.037,2.269c-0.147,0.274-0.444,0.498-0.722,0.659c-0.192,0.116-0.512,0.174-0.706,0.09 c-0.69-0.291-1.344-0.669-1.851-1.241c-0.219-0.252-0.422-0.519-0.629-0.78c-0.906-1.157-1.951-2.063-3.545-2.032 c-0.155,0.005-0.322-0.09-0.464-0.173c-0.136-0.078-0.286-0.179-0.366-0.313c-0.285-0.475-0.138-1.431,0.285-1.848 c0.108-0.108,0.295-0.231,0.427-0.211c0.565,0.09,1.123,0.266,1.688,0.337c0.494,0.06,1,0.013,1.499,0.03 c0.417,0.01,0.835,0.082,1.246,0.06c0.666-0.035,1.324-0.13,2.059-0.211c0.671-0.563,1.364-1.162,2.077-1.729 c0.322-0.257,0.68-0.479,1.046-0.675c0.121-0.067,0.319-0.025,0.472,0.011c0.208,0.05,0.398,0.384,0.362,0.593 c-0.043,0.247-0.04,0.513-0.148,0.727C16.763,308.766,16.318,310.289,15.79,311.782 M19.395,312.416 c-0.04,0.065-0.074,0.141-0.11,0.214c-0.038,0.07-0.08,0.139-0.136,0.181c-0.489,0.391-1.105,0.305-1.491-0.175 c-0.183-0.229-0.118-0.685,0.121-0.863c0.464-0.342,1.125-0.271,1.509,0.193C19.375,312.071,19.362,312.261,19.395,312.416 M19.696,292.711c-0.255,0.504-0.651,0.73-1.411,0.699c-0.505-0.021-1.034-0.352-1.342-1.011c-0.297-0.634,0.108-1.413,0.78-1.523 c0.86-0.144,1.87,0.513,2.068,1.365C19.825,292.385,19.766,292.57,19.696,292.711 M20.945,268.476 c0.459-0.287,1.02-0.041,1.103,0.49c0.023,0.157,0.033,0.321,0.057,0.555c-0.024,0.169-0.049,0.408-0.096,0.649 c-0.059,0.317-0.452,0.442-0.771,0.265c-0.371-0.21-0.639-0.486-0.734-0.914C20.417,269.129,20.593,268.696,20.945,268.476 M20.966,297.203c-0.297-0.127-0.493-0.514-0.464-0.808c0.034-0.37,0.27-0.596,0.541-0.792c0.128-0.096,0.302-0.139,0.461-0.177 c0.561-0.135,1.125-0.261,1.679-0.39c0.118,0.129,0.275,0.224,0.327,0.36c0.221,0.581,0.096,1.144-0.155,1.689 c-0.208,0.463-0.771,0.727-1.229,0.568C21.736,297.52,21.347,297.369,20.966,297.203 M27.252,320.348 c-0.364,0.314-0.786,0.307-1.162,0.083c-0.273-0.164-0.512-0.423-0.706-0.687c-0.224-0.308,0.124-0.955,0.78-0.985 c0.042,0.005,0.371,0.035,0.695,0.098c0.621,0.123,0.938,0.375,0.912,0.672C27.738,319.896,27.503,320.127,27.252,320.348 M29.66,311.144c-0.207,0.106-0.469,0.187-0.69,0.156c-0.41-0.055-0.813-0.184-1.213-0.307c-0.327-0.104-0.595-0.305-0.742-0.629 c-0.538-1.205-1.541-1.697-2.786-1.821c-0.165-0.014-0.334-0.021-0.499-0.049c-0.968-0.149-1.339-0.587-1.297-1.494 c0.044-0.945,0.3-1.76,0.976-2.5c1.164-1.277,1.627-2.881,1.801-4.571c0.032-0.327,0.022-0.674-0.049-0.996 c-0.228-1.036,0.33-1.769,0.917-2.489c0.082-0.101,0.295-0.111,0.453-0.131c0.199-0.021,0.56,0.262,0.562,0.425 c0.008,0.495,0.002,0.993,0.002,1.566c-0.257,0.845,0.369,1.748,0.087,2.655c-0.247,0.795-0.625,1.544-0.883,2.336 c-0.125,0.386-0.154,0.817-0.142,1.23c0.024,0.58,0.122,1.161,0.194,1.743c0.074,0.596,0.304,1.124,0.644,1.616 c0.199,0.292,0.46,0.574,0.789,0.548c1.037-0.075,1.506,0.546,1.866,1.358c0.068,0.153,0.152,0.297,0.219,0.452 C29.992,310.535,29.906,311.018,29.66,311.144 M34.479,323.833c-0.146,0.284-0.386,0.528-0.62,0.754 c-0.106,0.102-0.304,0.102-0.51,0.159c-1.018-0.938-1.908-2.015-2.639-3.219c-0.204-0.338-0.296-0.765-0.352-1.164 c-0.088-0.604,0.371-1.147,0.952-1.238c0.906-0.146,1.818-0.179,2.717,0.006c0.391,0.08,0.778,0.281,1.11,0.508 c0.172,0.115,0.357,0.453,0.308,0.628C35.11,321.449,35.053,322.717,34.479,323.833 M32.574,313.666 c0.047-0.103,0.103-0.195,0.167-0.274c0.196-0.236,0.472-0.354,0.772-0.327c0.135,0.081,0.297,0.132,0.392,0.242 c0.222,0.27,0.231,0.599,0.139,0.913c-0.133,0.465-0.71,0.797-1.136,0.69C32.512,314.805,32.345,314.187,32.574,313.666 M40.243,302.191c-1.988,0.704-3.935,0.589-5.841-0.307c-0.257-0.118-0.442-0.546-0.358-0.857c0.134-0.49,0.378-0.907,0.803-1.205 c-0.236-0.049-0.477-0.103-0.735-0.16c-0.531,0.558-1.046,1.102-1.572,1.64c-0.2,0.206-0.754,0.126-0.885-0.106 c-0.039-0.072-0.108-0.135-0.134-0.211c-0.79-2.218-0.907-4.405,0.324-6.522c0.178-0.305,0.457-0.538,0.809-0.508 c1.967,0.176,3.798-0.383,5.629-0.979c0.82-0.265,1.564,0.078,2.071,0.948c0.072,0.12,0.072,0.352,0.002,0.467 c-0.169,0.277-0.376,0.554-0.615,0.775c-0.677,0.618-1.391,1.201-2.068,1.825c-0.175,0.155-0.275,0.397-0.41,0.602 c1.022,0.897,2.022,1.762,3,2.643c0.322,0.292,0.427,0.706,0.449,1.137C40.727,301.694,40.492,302.104,40.243,302.191 M47.352,281.185c-0.01,0.334-0.689,0.699-0.981,0.492c-0.334-0.236-0.671-0.495-0.939-0.802c-0.439-0.506-0.341-1.25,0.177-1.809 c0.125-0.141,0.592-0.186,0.688-0.055c0.448,0.594,0.891,1.196,1.084,1.937C47.398,281.019,47.363,281.104,47.352,281.185 M100.402,321.896c-0.074,0.091-0.3,0.111-0.43,0.07c-0.126-0.038-0.271-0.176-0.314-0.301c-0.116-0.333,0.036-0.629,0.225-0.894 c0.084-0.118,0.239-0.264,0.352-0.254c0.124,0.011,0.271,0.158,0.346,0.286c0.076,0.131,0.076,0.303,0.123,0.517 C100.621,321.489,100.549,321.726,100.402,321.896 M100.773,309.382c-0.43-0.014-0.774-0.21-1.059-0.531 c-0.18-0.204-0.2-0.436-0.139-0.679c0.069-0.274,0.477-0.548,0.897-0.508c0.167,0.07,0.484,0.161,0.764,0.318 c0.211,0.119,0.363,0.315,0.332,0.602C101.522,308.977,101.131,309.387,100.773,309.382 M103.237,312.462 c-0.079,0.105-0.314,0.206-0.425,0.166c-0.646-0.231-1-0.921-0.845-1.564c0.081-0.326,0.459-0.528,0.76-0.397 c0.533,0.227,0.765,0.573,0.76,1.253C103.438,312.039,103.377,312.278,103.237,312.462 M107.156,324.92 c-0.291,0.371-0.676,0.465-1.106,0.374c-0.145-0.03-0.346-0.138-0.387-0.259c-0.13-0.388-0.2-0.795-0.285-1.159 c0.034-0.284,0.029-0.543,0.101-0.777c0.042-0.131,0.185-0.282,0.317-0.327c0.13-0.05,0.381-0.04,0.453,0.045 c0.314,0.378,0.587,0.785,0.862,1.198C107.36,324.381,107.363,324.662,107.156,324.92 M117.692,321.856 c-0.379,0.744-0.791,1.454-0.931,2.293c-0.038,0.236-0.141,0.488-0.288,0.679c-0.306,0.403-0.685,0.755-1.238,0.73 c-0.58-0.025-1.159-0.089-1.739-0.156c-0.824-0.091-1.645-0.206-2.47-0.308c-0.589-0.07-0.968-0.401-0.99-0.93 c-0.042-0.907-0.067-1.821-0.086-2.733c-0.005-0.27,0.317-0.692,0.565-0.757c0.401-0.106,0.806-0.201,1.209-0.287 c0.499-0.105,0.936-0.316,1.337-0.639c0.909-0.714,1.842-1.408,2.643-2.017c0.986,0,1.814-0.015,2.642,0.005 c0.392,0.01,0.788,0.558,0.657,0.9C118.584,319.719,118.216,320.831,117.692,321.856 M119.262,329.584 c-0.098-0.131-0.304-0.294-0.351-0.49c-0.076-0.337,0.201-0.707,0.472-0.74c0.273-0.029,0.597,0.313,0.595,0.625 C119.975,329.3,119.68,329.587,119.262,329.584 M119.852,323.964c-0.204,0.382-0.767,0.339-0.99-0.056 c-0.247-0.442,0.016-1.078,0.493-1.182c0.291-0.061,0.654,0.231,0.689,0.644C119.999,323.512,119.96,323.757,119.852,323.964 M126.653,333.427c-0.204,0.093-0.516,0.168-0.683,0.077c-0.491-0.278-0.95-0.623-1.396-0.98c-0.366-0.289-0.213-1.038,0.244-1.223 c0.223-0.09,0.469-0.115,0.634-0.155c0.505,0.03,0.884,0.166,1.108,0.548c0.165,0.277,0.292,0.579,0.412,0.881 C127.069,332.826,126.912,333.311,126.653,333.427"/> <path d="M95.646,342.829c-0.258-0.056-0.469,0.09-0.474,0.623c-0.01,0.702,1.416,1.117,1.423,0.86 c0.004-0.188-0.008-0.402-0.069-0.589C96.4,343.337,95.982,342.904,95.646,342.829"/> <path d="M323.139,319.057c0.157-0.273,0.471-0.479,0.754-0.646c0.43-0.256,0.889-0.473,1.349-0.671 c1.004-0.44,1.983-0.894,2.702-1.778c0.199-0.249,0.536-0.392,0.823-0.558c0.227-0.134,0.462-0.214,0.695-0.267 c2.174-2.173,4.275-4.437,6.319-6.77c-0.943-0.766-1.864-1.56-3.074-1.937c-0.626-0.196-1.203-0.568-1.783-0.896 c-0.111-0.06-0.198-0.296-0.177-0.433c0.022-0.141,0.172-0.281,0.302-0.377c0.128-0.101,0.295-0.196,0.447-0.196 c1.857-0.01,3.629-0.563,5.47-0.784c0.193-1.132,0.507-2.168,1.244-3.019c1-2.217,2.621-4.078,3.616-6.306 c0.219-0.494,0.635-0.519,1.208-0.097c0.02,0.016,0.041,0.033,0.061,0.048v-1.013c-0.179,0.015-0.359,0.01-0.545-0.016 c-0.912-0.126-1.843-0.236-2.704-0.532c-1.203-0.413-2.385-0.775-3.675-0.649c-0.157,0.016-0.325-0.063-0.487-0.095 c-0.412-0.081-0.708-0.604-0.538-0.956c0.037-0.073,0.098-0.136,0.149-0.207c0.456-0.625,0.711-1.343,0.731-2.104 c0.034-1.285,0.505-2.451,0.85-3.658c0.248-0.86,0.737-1.17,1.617-1.243c1.25-0.105,2.48-0.387,3.717-0.598 c0.268-0.046,0.42-0.338,0.273-0.523c-0.261-0.327-0.551-0.631-0.792-0.971c-0.233-0.334-0.061-0.81,0.299-1.083 c0.34-0.26,0.708-0.415,1.104-0.48v-52.205c-0.571,0.724-1.133,1.454-1.72,2.16c-0.281,0.339-0.752,0.396-1.167,0.304 c-0.487-0.104-0.946-0.321-1.426-0.467c-0.719-0.227-0.936-0.101-1.23,0.722c-0.116,0.321-0.214,0.656-0.573,0.762 c-0.787,0.226-1.28,0.744-1.606,1.471c-0.104,0.224-0.271,0.423-0.42,0.621c-0.205,0.277-0.831,0.466-1.143,0.342 c-0.703-0.276-1.386-0.594-1.941-1.126c-0.383-0.373-0.641-1.177-0.317-1.619c0.546-0.745,0.612-1.522,0.5-2.379 c-0.162-1.248-0.293-2.495-0.438-3.742c-0.056-0.498-0.128-0.998-0.177-1.499c-0.083-0.85-0.007-1.67,0.464-2.416 c0.174-0.284,0.303-0.596,0.435-0.903c0.28-0.653,0.329-1.293-0.163-1.883c-0.481-0.576-0.742-1.32-1.398-1.758 c-0.354-0.237-0.719-0.543-0.688-0.991c0.046-0.664,0.227-1.328,0.775-1.78c0.178-0.146,0.451-0.222,0.688-0.236 c0.243-0.016,0.507,0.043,0.732,0.141c0.973,0.422,1.585-0.02,2.067-0.819c0.17-0.287,0.438-0.552,0.505-0.858 c0.19-0.837,0.695-1.511,1.035-2.263c0.828-1.831,1.936-3.503,2.821-5.304c0.319-0.653,0.348-1.276,0.031-1.921 c-0.113-0.221-0.263-0.428-0.386-0.644c-0.172-0.302-0.275-0.634-0.162-0.966c0.241-0.697,0.054-1.313-0.305-1.906 c-0.174-0.281-0.383-0.548-0.563-0.829c-0.199-0.313-0.199-0.66,0.01-0.94c0.589-0.808,1.187-1.615,1.835-2.375 c0.319-0.377,0.737-0.681,1.154-0.955c0.435-0.286,0.941-0.367,1.436-0.136c0.452,0.209,0.884,0.463,1.334,0.674v-13.413 c-22.397-30.012-54.299-49.927-92.646-49.927c-38.345,0-73.303,19.915-92.646,49.927v108.88c0.137-0.045,0.286-0.065,0.451-0.038 c0.324,0.048,0.651,0.104,0.971,0.185c0.227,0.058,0.525,0.605,0.472,0.812c-0.223,0.822-0.637,1.521-1.329,2.03 c-0.172,0.128-0.361,0.216-0.564,0.236v4.334c0.095,0.137,0.216,0.257,0.381,0.345c0.466,0.239,0.66,0.582,0.672,1.002 c0.005,0.143-0.007,0.291-0.039,0.449c-0.018,0.161-0.049,0.322-0.054,0.485c-0.01,0.359,0.103,0.458,0.641,0.551 c0.16,0.025,0.33,0.013,0.489,0.051c0.322,0.07,0.523,0.482,0.383,0.765c-0.141,0.296-0.553,0.548-0.79,0.449 c-0.07-0.027-0.14-0.065-0.208-0.098c2.462,3.611,5.155,7.066,8.054,10.351c0.739,0.067,1.478,0.141,2.219,0.206 c0.178,0.016,0.402,0.362,0.378,0.711c-0.025,0.106-0.028,0.386-0.157,0.581c-0.148,0.227-0.319,0.443-0.497,0.645 c2.563,2.751,5.266,5.376,8.111,7.855c-0.136-0.506-0.33-0.996-0.533-1.479c-0.295-0.711-0.396-1.442-0.445-2.204 c-0.06-0.948,0.375-1.593,1.154-2.067c0.242-0.148,0.767-0.169,0.944,0.01c0.472,0.476,0.945,0.948,1.378,1.456 c0.469,0.549,1.045,0.82,1.754,0.82c0.501,0,1.003-0.016,1.501-0.051c0.334-0.025,0.661-0.11,0.996-0.136 c1.435-0.105,2.212,0.367,2.732,1.686c0.121,0.309,0.18,0.643,0.26,0.965c0.126,0.523,0.435,0.886,0.899,1.149 c0.288,0.163,0.578,0.344,0.809,0.58c0.481,0.485,0.888,1.082,0.811,1.776c-0.12,1.076,0.185,1.972,0.845,2.791 c0.563,0.699,0.337,1.448,0.005,2.135c-0.213,0.442-0.562,0.833-0.894,1.202c-0.115,0.128-0.206,0.259-0.295,0.39 c1.251,0.824,2.521,1.619,3.804,2.394c0.58-0.105,1.16-0.218,1.742-0.316c0.683-0.118,1.148,0.262,1.169,0.915 c0.008,0.227,0.002,0.479,0.002,1.092c5.467,3.063,11.217,5.688,17.193,7.816c-0.11-0.232-0.218-0.459-0.324-0.674 c0.199-1.489,0.673-2.808,1.592-3.943c0.482-0.596,0.75-1.298,0.968-2.022c0.096-0.317,0.165-0.648,0.295-0.955 c0.176-0.408,0.508-0.645,0.963-0.669c0.408-0.021,0.835,0.296,0.931,0.691c0.278,1.134,0.536,2.273,0.833,3.402 c0.172,0.644-0.064,1.142-0.458,1.604c-0.052,0.064-0.127,0.115-0.172,0.181c-0.436,0.611-1.407,0.623-1.636,1.461 c0.356,0.559,0.71,1.114,1.061,1.677c0.044,0.068,0.057,0.156,0.093,0.231c0.059,0.119,0.048,0.257,0.015,0.397 c10.506,3.279,21.635,5.065,33.068,5.065c19.372,0,37.096-5.09,52.783-13.987c-1.024-0.035-2.052-0.024-3.074-0.075 c-0.917-0.048-1.823-0.116-2.745,0.01c-0.96,0.134-1.774-0.875-1.486-1.777c0.149-0.471,0.368-0.928,0.609-1.36 c0.165-0.298,0.477-0.458,0.83-0.488c0.754-0.07,1.499-0.002,2.222,0.234c0.557,0.179,1.118,0.336,1.666,0.535 c0.577,0.206,1.144,0.156,1.723,0.018c0.5-0.123,0.958-0.299,1.242-0.762c0.674-1.092,1.647-1.303,3.074-0.896 c0.209,0.604,0.413,1.185,0.613,1.758c4.975-3.144,9.734-6.676,14.255-10.564c-0.042-0.058-0.088-0.115-0.128-0.178 C322.073,320.755,322.645,319.915,323.139,319.057 M332.884,198.809c0.695,0.078,1.356,0.749,1.413,1.434 c0.026,0.281-0.425,0.628-0.674,0.492c-0.422-0.233-0.853-0.468-1.226-0.77c-0.152-0.12-0.219-0.412-0.222-0.628 C332.17,199.055,332.598,198.773,332.884,198.809 M164.258,295.95c-0.486,0.035-1.366,0.018-1.366,0.018v-0.091 c-1.017,0-0.756,0.018-1.083-0.002c-0.791-0.051-1.081-0.478-0.843-1.378c0.086-0.317,0.447-0.581,0.717-0.478 c0.846,0.316,1.676,0.644,2.516,0.978c0.069,0.025,0.141,0.094,0.165,0.164c0.051,0.146,0.165,0.316,0.13,0.452 C164.463,295.746,164.366,295.94,164.258,295.95 M172.019,306.189c-0.2,0.132-0.46,0.194-0.703,0.231 c-1.246,0.192-2.49,0.206-3.726-0.125c-0.611-0.563-0.798-1.232-0.505-2.027c0.191-0.519,0.639-0.878,1.11-0.835 c1.337,0.106,2.634,0.397,3.865,0.931c0.312,0.136,0.526,0.415,0.53,0.785C172.601,305.602,172.382,305.956,172.019,306.189 M174.169,315.957c-0.116,0.099-0.298,0.156-0.45,0.156c-0.185,0.005-0.408-0.357-0.348-0.569c0.039-0.15,0.119-0.321,0.235-0.412 c0.113-0.096,0.352-0.19,0.438-0.136c0.175,0.116,0.283,0.332,0.401,0.485C174.331,315.69,174.286,315.866,174.169,315.957 M176.33,310.404c-0.528,0.438-1.145,0.634-1.828,0.654c-0.405,0.01-0.734-0.442-0.594-0.86c0.143-0.417,0.339-0.719,0.606-0.913 c0.268-0.188,0.607-0.273,1.037-0.259c0.165,0.005,0.332,0.005,0.494,0.022c0.457,0.043,0.731,0.252,0.727,0.521 C176.765,309.927,176.584,310.193,176.33,310.404 M194.004,324.794c-0.288,0.11-1.594-0.201-1.802-0.433 c-0.127-0.137-0.142-0.448-0.098-0.659c0.08-0.372,0.463-0.608,0.713-0.485c0.501,0.249,0.99,0.516,1.48,0.792 c0.054,0.03,0.062,0.146,0.113,0.274C194.29,324.446,194.187,324.724,194.004,324.794 M322.385,315.185 c-0.077,0.239-0.263,0.396-0.536,0.426c-0.222,0.022-0.44-0.171-0.482-0.431c-0.113-0.733-0.165-1.466,0.224-2.137 c0.068-0.119,0.263-0.212,0.402-0.219c0.118-0.008,0.278,0.105,0.356,0.211c0.087,0.126,0.128,0.297,0.153,0.457 c0.039,0.241,0.046,0.488,0.078,0.846C322.534,314.552,322.485,314.875,322.385,315.185 M320.677,308.357 c0.108-0.075,0.349-0.075,0.459-0.005c0.116,0.073,0.208,0.27,0.216,0.418c0.041,0.845-0.423,1.393-1.113,1.793 c-0.03,0.018-0.069,0.022-0.11,0.024c-0.042,0.003-0.084,0-0.124,0.008c-0.142-0.075-0.325-0.118-0.413-0.231 c-0.088-0.112-0.145-0.324-0.101-0.452C319.719,309.273,320.124,308.748,320.677,308.357 M319.478,306.572 c0.191-0.348,0.466-0.533,0.742-0.414c0.187,0.082,0.327,0.283,0.442,0.389c0.02,0.554-0.528,0.985-0.958,0.83 c-0.064-0.022-0.128-0.086-0.169-0.146C319.392,307.024,319.352,306.809,319.478,306.572 M329.963,311.111 c-0.003,0.067-0.355,0.417-0.635,0.435c-0.842,0.051-1.653-0.045-2.405-0.468c-0.248-0.141-0.451-0.568-0.376-0.842 c0.263-0.963,0.801-1.622,1.863-1.737c0.361-0.036,0.648,0.09,0.889,0.336C329.857,309.408,330.048,310.108,329.963,311.111 M330.193,294.411c-0.438,0.986-0.693,2.053-1.051,3.078c-0.337,0.971-0.695,1.187-2.209,0.995 c-0.207-0.047-0.929-0.245-1.669-0.369c-1.321-0.216-2.65-0.38-3.97-0.591c-0.348-0.053-0.644-0.312-0.668-0.659 c-0.086-1.272-0.666-2.412-0.937-3.636c-0.137-0.618-0.085-1.215,0.445-1.585c0.518-0.361,0.683-0.932,1.051-1.373 c0.455-0.548,1.027-0.834,1.771-0.669c1.066,0.242,2.083,0.562,3.03,1.152c0.773,0.48,1.646,0.806,2.472,1.197 c0.302,0.146,0.614,0.273,0.904,0.437C330.115,292.802,330.667,293.345,330.193,294.411 M323.772,252.818 c0.204-0.04,0.528,0.241,0.543,0.418c0.073,0.77-0.064,1.488-0.528,2.112c-0.079,0.105-0.28,0.115-0.422,0.173 c-0.077-0.022-0.169-0.027-0.224-0.078c-0.627-0.532-0.828-1.214-0.612-2.006c0.037-0.136,0.175-0.302,0.309-0.357 C323.134,252.96,323.456,252.885,323.772,252.818 M322.954,242.594c0.054-0.231,0.147-0.401,0.288-0.513 c0.142-0.116,0.332-0.169,0.584-0.174c0.069,0.038,0.155,0.068,0.229,0.104c0.078,0.034,0.142,0.075,0.176,0.136 c0.069,0.115,0.057,0.331-0.009,0.463c-0.214,0.427-0.522,0.528-1.042,0.377C322.984,242.932,322.908,242.795,322.954,242.594 M323.593,249.253c-0.289-0.161-0.4-0.559-0.237-0.845c0.154-0.267,0.608-0.397,0.85-0.206c0.108,0.09,0.128,0.281,0.191,0.427 c-0.014,0.081-0.014,0.167-0.039,0.239C324.225,249.242,323.878,249.414,323.593,249.253 M324.8,260.474 c0.327-0.166,0.667-0.134,0.924,0.093c0.166,0.144,0.23,0.405,0.322,0.58c-0.119,0.194-0.172,0.391-0.291,0.454 c-0.213,0.104-0.469,0.155-0.708,0.181c-0.425,0.04-0.688-0.171-0.703-0.503C324.326,260.908,324.47,260.639,324.8,260.474 M333.36,288.152c-0.191,0.086-0.299,0.048-0.405-0.136c-0.18-0.319-0.126-0.602,0.069-0.888c0.134-0.201,0.379-0.236,0.628-0.111 c0.172,0.092,0.253,0.207,0.209,0.413C333.851,287.768,333.689,288.009,333.36,288.152 M338.989,281.065 c-0.049,0.448-0.309,0.788-0.729,0.94c-0.873,0.322-1.782,0.44-3.241,0.279c-0.346-0.05-1.1,0.146-1.769,0.78 c-0.333,0.312-0.919,0.15-1.374-0.231c-0.169-0.142-0.255-0.504-0.154-0.677c0.129-0.214,0.224-0.468,0.402-0.626 c1.111-1.014,2.207-2.052,3.386-2.982c0.641-0.504,1.434-0.824,2.172-1.197c0.103-0.055,0.397,0.035,0.441,0.126 C338.618,278.624,339.132,279.771,338.989,281.065 M338.054,271.96c0.116-0.018,0.324,0.089,0.376,0.194 c0.27,0.553-0.003,1.166-0.566,1.325c-0.071,0.02-0.155-0.016-0.31-0.033c-0.098-0.144-0.316-0.319-0.332-0.511 C337.181,272.448,337.549,272.035,338.054,271.96 M329.903,219.042c0.196-0.035,0.322,0.04,0.395,0.227 c0.254,0.636-0.062,1.171-0.825,1.222c-0.105-0.105-0.364-0.249-0.391-0.422C329.014,219.572,329.399,219.142,329.903,219.042 M329.935,260.272c1.047-0.262,2.065-0.646,3.155-0.725c1.2-0.583,2.448-0.282,3.679-0.174c0.459,0.038,0.896,0.554,0.948,1.034 c0.007,0.08,0,0.163,0,0.327c-0.072,0.157-0.121,0.433-0.286,0.59c-0.356,0.345-0.737,0.687-1.162,0.929 c-1.388,0.792-2.604,1.79-3.703,2.937c-0.115,0.121-0.245,0.224-0.371,0.33c-0.355,0.297-1.073,0.269-1.375-0.073 c-0.272-0.312-0.536-0.634-0.762-0.98c-0.322-0.483-0.568-1.019-0.912-1.488c-0.458-0.629-0.354-1.24-0.082-1.881 C329.24,260.691,329.505,260.383,329.935,260.272 M328.719,224.815c-0.374,0.452-0.401,0.872-0.121,1.363 c0.177,0.312,0.123,0.648,0.018,0.97c-0.209,0.654-0.207,1.308-0.018,1.975c0.162,0.576,0.128,1.154-0.072,1.722 c-0.132,0.378-0.67,0.646-1.005,0.488c-0.226-0.11-0.448-0.226-0.664-0.352c-0.698-0.413-0.86-0.694-0.817-1.72 c0.211-1.67,0.451-3.661,1.476-5.442c0.16-0.276,0.425-0.497,0.661-0.724c0.202-0.192,0.737,0.021,0.807,0.296 C329.119,223.91,329.049,224.413,328.719,224.815 M314.583,217.361c0.031-0.141,0.146-0.312,0.273-0.375 c0.214-0.105,0.472-0.2,0.706-0.19c0.747,0.033,1.494,0.091,2.235,0.194c0.491,0.064,0.97,0.243,1.459,0.339 c1.664,0.326,1.833,0.254,2.987-1.314c1.723,0.031,3.244-0.263,4.591-1.245c0.257-0.189,0.602-0.27,0.917-0.37 c0.683-0.211,1.123,0.161,1.133,0.855c0.007,0.945-0.254,1.815-0.61,2.665c-0.265,0.639-0.651,1.149-1.452,1.182 c-0.346,0.016-0.592,0.274-0.742,0.594c-0.355,0.752-0.685,1.519-1.073,2.254c-0.358,0.678-0.902,1.188-1.6,1.533 c-0.3,0.146-0.703,0.146-0.934-0.058c-0.25-0.224-0.611-0.409-0.708-0.687c-0.314-0.903-1.29-1.244-1.643-2.133 c-0.246-0.613-0.857-0.975-1.526-1.197c-1.108-0.366-2.194-0.794-3.284-1.212c-0.229-0.091-0.46-0.216-0.639-0.382 C314.581,217.724,314.551,217.503,314.583,217.361 M321.994,244.374c-0.4,0.3-0.821,0.569-1.213,0.876 c-1.006,0.789-2,0.497-2.639-0.73c-0.072-0.143-0.105-0.312-0.145-0.473c-0.069-0.286,0.127-0.751,0.354-0.877 c0.747-0.41,1.558-0.571,2.481-0.646c0.152,0.061,0.397,0.126,0.595,0.254c0.206,0.133,0.378,0.324,0.554,0.503 C322.305,243.61,322.313,244.133,321.994,244.374 M314.467,251.813c0.298-0.668,1.146-0.905,1.655-0.427 c0.608,0.572,1.203,1.156,1.767,1.771c0.355,0.392,0.747,0.618,1.282,0.665c0.319,0.028,0.634,0.174,0.936,0.295 c0.229,0.091,0.342,0.681,0.2,0.9c-0.517,0.784-1.214,1.353-2.091,1.694c-0.151,0.061-0.327,0.061-0.478,0.088 c-1.007,0.022-1.815-0.298-2.253-1.26c-0.38-0.835-0.766-1.665-1.108-2.514C314.217,252.631,314.286,252.21,314.467,251.813 M309.283,248.287c0.049-0.115,0.123-0.201,0.211-0.274c0.123-0.104,0.278-0.179,0.479-0.216c0.133,0.072,0.319,0.111,0.393,0.227 c0.227,0.344,0.189,0.618-0.071,0.888c-0.245,0.256-0.536,0.304-0.881,0.093c-0.113-0.068-0.222-0.27-0.205-0.4 C309.222,248.488,309.247,248.383,309.283,248.287 M307.576,250.832c0.299-0.07,0.607,0.209,0.616,0.548 c0.013,0.386-0.196,0.67-0.503,0.694c-0.332,0.022-0.654-0.246-0.649-0.548C307.045,251.222,307.298,250.896,307.576,250.832 M195.042,316.558c0.021-0.123,0.055-0.369,0.104-0.618c0.083-0.415,0.569-0.687,0.963-0.528c0.312,0.124,0.636,0.229,0.917,0.402 c1.633,1.028,3.211,2.13,4.606,3.466c0.176,0.168,0.346,0.397,0.393,0.623c0.042,0.222,0.01,0.586-0.135,0.691 c-1.164,0.865-2.457,1.424-3.941,1.335c-0.211-0.018-0.506-0.205-0.599-0.397c-0.334-0.668-0.576-1.385-0.9-2.062 c-0.25-0.525-0.5-1.056-1.002-1.42C194.975,317.712,194.985,317.193,195.042,316.558 M196.059,328.797 c-0.19,0.086-0.34,0.051-0.389-0.15c-0.057-0.222-0.108-0.458-0.088-0.68c0.027-0.251,0.307-0.452,0.516-0.354 c0.187,0.083,0.33,0.26,0.435,0.348C196.538,328.501,196.449,328.631,196.059,328.797 M196.456,325.669 c-0.127,0.221-0.459,0.312-0.628,0.165c-0.111-0.1-0.214-0.275-0.219-0.417c-0.018-0.407,0.206-0.653,0.556-0.679 c0.248-0.018,0.477,0.213,0.441,0.473C196.582,325.369,196.533,325.533,196.456,325.669 M199.118,333.313 c-0.266,0.604-0.818,1.056-1.431,1.227c-0.191,0.059-0.508-0.259-0.464-0.467c0.121-0.624,0.847-1.238,1.592-1.333 c0.057-0.005,0.157,0.07,0.185,0.128C199.059,333.012,199.167,333.202,199.118,333.313 M202.862,330.436 c-0.044,0.062-0.11,0.109-0.182,0.152c-0.073,0.04-0.15,0.08-0.219,0.12c-0.081-0.005-0.167-0.005-0.25-0.01 c-0.085,0-0.165-0.011-0.229-0.048c-0.366-0.199-0.708-0.438-1.056-0.664c-0.17-0.113-0.167-0.531,0-0.656 c0.351-0.267,0.739-0.442,1.154-0.201c0.28,0.166,0.519,0.407,0.756,0.636C203.048,329.969,203.012,330.23,202.862,330.436 M205.105,329.391c-0.108,0.061-0.322-0.016-0.464-0.086c-0.141-0.072-0.275-0.193-0.376-0.322 c-0.731-0.925-1.607-1.687-2.562-2.373c-0.328-0.236-0.604-0.543-0.84-0.765c0.003-0.759,0.456-1.177,0.745-1.68 c0.664-1.144,1.501-2.205,1.802-3.541c0.019-0.073,0.088-0.146,0.152-0.193c0.129-0.096,0.309-0.27,0.404-0.234 c0.211,0.076,0.467,0.222,0.556,0.408c0.229,0.49,0.005,0.976-0.145,1.45c-0.144,0.455-0.03,0.803,0.415,1.033 c0.137,0.071,0.294,0.212,0.321,0.348c0.384,1.801,0.467,3.631,0.489,5.465C205.607,329.063,205.309,329.274,205.105,329.391 M207.536,327.55c-0.089-0.139-0.216-0.276-0.236-0.428c-0.17-1.32-0.334-2.646-0.452-3.968c-0.015-0.182,0.25-0.387,0.369-0.563 c0.219,0.029,0.444-0.006,0.52,0.083c0.383,0.44,0.789,0.812,1.368,1.001c0.332,0.11,0.44,0.5,0.404,0.848 c-0.118,1.096-0.495,2.102-1.076,3.032C208.29,327.786,207.686,327.786,207.536,327.55 M210.742,339.408 c-0.054,0.156-0.142,0.293-0.244,0.413c-0.016,0.018-0.026,0.037-0.042,0.05c-0.186,0.196-0.43,0.325-0.7,0.33 c-0.526,0.022-0.956-0.179-1.27-0.597c-0.088-0.115-0.157-0.286-0.16-0.433c-0.01-0.859,0.619-1.383,1.427-1.187 c0.234,0.054,0.474,0.131,0.684,0.244c0.127,0.067,0.248,0.214,0.302,0.353C210.845,338.851,210.835,339.147,210.742,339.408 M285.889,274.982c-9.595,9.341-22,14.48-34.94,14.48c-12.938,0-25.347-5.14-34.851-14.392 c-9.278-9.277-14.387-21.654-14.387-34.851c0-13.197,5.109-25.574,14.387-34.854c9.277-9.277,21.653-14.389,34.851-14.389 c13.197,0,25.574,5.111,34.852,14.389c9.278,9.279,14.386,21.656,14.386,34.854C300.188,253.417,295.079,265.794,285.889,274.982 M299.153,268.706c-0.342-0.096-0.554-0.357-0.645-0.688c-0.241-0.896-0.248-1.796-0.062-2.701c0.096-0.475,0.819-0.714,1.2-0.366 c0.853,0.781,1.698,1.578,2.526,2.386c0.336,0.327,0.104,1.134-0.342,1.239c-0.561,0.134-1.128,0.239-1.617,0.338 C299.799,268.838,299.47,268.797,299.153,268.706 M301.259,305.841c-0.057-0.011-0.219-0.043-0.381-0.073 c-0.249-0.042-0.58-0.503-0.53-0.757c0.206-1.06,0.493-2.09,1.033-3.033c0.241-0.422,0.87-0.681,1.295-0.46 c0.979,0.503,1.821,1.137,1.986,2.344c0.11,0.825-0.29,1.484-1.096,1.68c-0.481,0.121-0.971,0.216-1.459,0.295 C301.865,305.873,301.612,305.841,301.259,305.841 M305.822,327.168c-0.141,0.291-0.362,0.556-0.581,0.81 c-0.896,1.025-2.37,0.812-3.108-0.448c-0.263-0.447-0.029-1.161,0.45-1.247c0.656-0.116,1.319-0.265,1.784-0.265h0.948 c0.281,0,0.511,0.17,0.57,0.413C305.939,326.651,305.917,326.964,305.822,327.168 M307.651,281.22 c-0.575,1.134-0.904,2.328-0.992,3.599c-0.015,0.233-0.177,0.459-0.283,0.681c-0.085,0.179-0.489,0.348-0.646,0.292 c-1.661-0.578-2.427-2.047-2.294-3.236c0.137-1.234,0.759-2.366,1.592-3.332c0.097-0.113,0.295-0.204,0.445-0.198 c0.675,0.022,1.31,0.224,1.872,0.601c0.283,0.19,0.443,0.49,0.417,1.023C307.745,280.731,307.759,281.003,307.651,281.22 M307.861,273.026c-0.275-0.024-0.615-0.362-0.654-0.651c-0.064-0.5,0.358-1.068,0.798-1.068c0.356,0,0.747,0.417,0.773,0.819 C308.814,272.649,308.384,273.072,307.861,273.026 M309.812,311.099c-0.196-0.383-0.278-0.805-0.029-1.182 c0.118-0.182,0.355-0.287,0.505-0.4c0.227,0.073,0.396,0.093,0.531,0.174c0.421,0.254,0.804,0.608,1.256,0.784 c0.997,0.388,1.617,1.122,2.091,2.024c0.19,0.37,0.407,0.722,0.567,1.104c0.167,0.399,0.1,0.814-0.042,1.212 c-0.127,0.367-0.686,0.565-1.03,0.412c-0.704-0.317-1.248-0.816-1.658-1.456c-0.498-0.771-1.054-1.483-1.739-2.1 C310.084,311.511,309.919,311.313,309.812,311.099 M315.687,325.024c-0.906,1.344-2.143,2.291-3.604,2.963 c-0.15,0.067-0.545-0.136-0.62-0.307c-0.384-0.845-0.542-1.74-0.611-2.761c0.088-0.223,0.155-0.564,0.332-0.828 c0.371-0.551,0.796-1.063,1.204-1.587c0.391-0.508,1.003-0.603,1.55-0.271c0.893,0.546,1.46,1.343,1.794,2.313 C315.78,324.688,315.767,324.909,315.687,325.024 M315.932,309.686c-0.083,0.008-0.165,0.043-0.248,0.043h-0.7 c-0.283,0-0.767-0.164-1.251-0.247c-0.275-0.047-0.422-0.608-0.201-0.827c0.165-0.166,0.361-0.377,0.575-0.423 c0.726-0.156,1.465-0.191,2.202-0.007c0.255,0.063,0.551,0.46,0.514,0.747c-0.035,0.313-0.325,0.613-0.649,0.646 C316.092,309.63,316.014,309.676,315.932,309.686 M315.208,298.663c0.024-0.219,0.176-0.485,0.354-0.616 c0.26-0.19,0.592-0.286,0.938-0.439c0.187,0.148,0.403,0.27,0.528,0.45c0.073,0.105,0.063,0.364-0.02,0.458 c-0.263,0.312-0.546,0.623-0.883,0.839c-0.166,0.102-0.525,0.074-0.685-0.045C315.281,299.191,315.185,298.877,315.208,298.663 M316.826,318.029c-0.252-0.086-0.419-0.337-0.368-0.554c0.101-0.428,0.59-0.772,0.893-0.588c0.184,0.11,0.297,0.337,0.407,0.467 C317.662,317.851,317.188,318.155,316.826,318.029 M317.104,265.463c-0.575,0.643-1.277,1.046-2.174,1.086 c-0.919,0.048-1.811,0.254-2.691,0.528c-0.87,0.276-1.838,0.085-2.681,0.561c-0.201,0.11-0.484,0.093-0.732,0.11 c-0.337,0.018-0.669-0.032-0.914-0.289c-0.197-0.211-0.077-0.921,0.199-1.157c0.378-0.326,0.781-0.623,1.159-0.95 c0.376-0.326,0.747-0.664,1.102-1.013c0.487-0.485,0.461-1.004-0.103-1.497c-0.371-0.326-0.798-0.588-1.187-0.895 c-0.303-0.242-0.19-0.929,0.165-1.069c0.233-0.096,0.464-0.206,0.706-0.249c0.56-0.105,1.125-0.174,1.688-0.256 c0.11-0.257,0.19-0.498,0.314-0.71c0.194-0.336,0.592-0.475,0.823-0.294c0.211,0.163,0.299,0.396,0.216,0.659 c-0.072,0.236-0.209,0.46-0.25,0.701c-0.069,0.393,0.235,0.611,0.508,0.779c0.193,0.119,0.521,0.234,0.683,0.149 c1.249-0.662,2.484-1.346,3.695-2.072c0.86-0.516,1.711-1.044,2.672-1.341c0.302-0.095,0.653-0.048,0.979-0.027 c0.275,0.018,0.553,0.525,0.435,0.771c-0.543,1.127-1.152,2.229-2.037,3.119c-0.66,0.658-1.18,1.388-1.661,2.173 C317.76,264.703,317.436,265.09,317.104,265.463 M318.829,264.981c0.005-0.352,0.25-0.605,0.545-0.773 c0.288-0.164,0.59-0.354,0.904-0.405c1.477-0.222,2.958-0.397,4.439-0.588c0.082-0.011,0.167-0.006,0.08-0.006 c0.538,0.016,1.014,0.49,0.955,0.83c-0.172,0.986-0.317,1.967-0.273,2.976c0.023,0.527-0.545,0.923-1.037,0.753 c-1.105-0.369-2.205-0.749-3.294-1.159c-0.62-0.236-1.215-0.537-1.813-0.824C319.014,265.626,318.824,265.332,318.829,264.981 M320.948,320.734c-0.118,0.075-0.319,0.086-0.458,0.046c-0.229-0.07-0.456-0.181-0.659-0.312c-0.734-0.471-0.7-1.368,0.086-1.743 c0.433-0.206,0.914-0.314,1.378-0.444c0.237-0.071,0.631,0.331,0.642,0.794C321.944,319.688,321.623,320.317,320.948,320.734"/> <path d="M842.039,266.796c-0.578,0.478-1.225,0.879-1.817,1.338c-0.79,0.623-1.632,1.113-2.561,1.533 c-1.283,0.584-2.495,1.353-3.584,2.275c-0.259,0.222-0.731,0.091-0.844-0.203c-0.121-0.307-0.277-0.614-0.348-0.936 c-0.276-1.308-0.533-2.618-0.774-3.931c-0.045-0.238,0-0.498,0.018-0.746c0.035-0.479,0.669-0.806,1.146-0.604 c0.385,0.169,0.747,0.362,1.003,0.717c0.187,0.254,0.295,0.592,0.777,0.661c1.068-1.194,2.312-2.313,3.062-3.852 c0.404-0.83,0.972-1.555,1.626-2.214c1.062-1.075,2.233-2.036,3.236-3.168v-38.842c-0.213,0.025-0.409,0.046-0.425,0.051 c-1.303,0.058-2.165-0.357-2.764-1.245c-0.1-0.153-0.063-0.596,0.051-0.662c0.799-0.473,1.32-1.212,1.932-1.87 c0.15-0.158,0.435-0.206,0.665-0.276c0.174-0.056,0.415,0.032,0.541,0.155v-4.113c-0.091-0.03-0.176-0.068-0.254-0.108 c-0.063-0.033-0.11-0.128-0.131-0.201c-0.629-2.401-2.524-3.382-4.632-4.122c-1.003-0.042-1.689-0.644-2.32-1.335 c-0.782-0.859-1.422-1.855-2.39-2.548c-0.126-0.09-0.184-0.271-0.279-0.411c-0.271-0.403-0.362-1.021-0.115-1.152 c0.278-0.15,0.608-0.247,0.928-0.294c0.241-0.038,0.505,0.005,0.741,0.073c2.767,0.789,5.605,1.146,8.452,1.367v-21.027 c-1.199-1.683-2.438-3.324-3.703-4.943c-0.231,0.066-0.547-0.023-0.638-0.242c-0.125-0.297-0.17-0.646-0.352-0.901 c-0.198-0.28-0.616-0.453-0.594-0.826c-21.294-26.113-51.727-43.014-87.042-43.014c-37.775,0-70.858,19.332-91.24,48.596 c0.448,0.099,0.862,0.346,1.247,0.737c1.054,1.071,2.103,2.147,3.146,3.231c0.227,0.234,0.201,0.687-0.084,0.888 c-0.481,0.342-0.861,0.765-1.209,1.247c-0.682,0.948-1.393,1.882-2.162,2.761c-1.21,1.384-2.462,2.731-3.723,4.074 c-0.854,0.91-1.744,1.785-2.296,2.938c-0.085,0.176-0.389,0.291-0.612,0.347c-0.26,0.061-0.592-0.297-0.642-0.639 c-0.075-0.498-0.156-0.993-0.191-1.494c-0.056-0.865-0.105-1.735-0.158-2.603c-2.799,5.572-5.173,11.42-7.041,17.485 c0.538-0.04,1.078,0.241,1.31,0.744c0.49,1.062,0.963,2.13,1.418,3.203c0.212,0.498-0.075,1.28-0.548,1.545 c-0.364,0.197-0.741,0.427-1.142,0.492c-1.021,0.171-1.967,0.553-2.909,0.931c-1.604,6.755-2.58,13.75-2.831,20.917 c0.06,0.148,0.098,0.297,0.098,0.442c-0.038,0.056-0.07,0.121-0.108,0.182c-0.027,1.005-0.058,2.009-0.058,3.018 c0,0.11,0.007,0.216,0.007,0.326c0.114-0.141,0.317-0.262,0.49-0.307c0.317-0.077,0.436-0.061,0.771-0.063 c0.83-0.007,2.268-0.002,2.268-0.002v-0.029c2.037,0.04,2.548,0.05,3.707,0.138c0.397,0.027,0.913,0.214,1.27,0.41 c0.191,0.1,0.412,0.352,0.476,0.567c0.089,0.312,0.209,0.685,0.115,0.977c-0.372,1.181-0.618,2.408-1.292,3.48 c-0.107,0.171-0.455,0.253-0.661,0.136c-0.49-0.287-0.954-0.594-1.515-0.795c-0.767-0.276-1.46-0.765-2.145-1.232 c-1.097-0.746-2.154-1.549-3.231-2.329c-0.064-0.047-0.158-0.095-0.179-0.165c-0.02-0.056-0.04-0.116-0.063-0.174 c0.088,10.068,1.592,19.813,4.268,29.058c0.273,0.075,0.553,0.15,0.819,0.251c0.503,0.186,1.296,0.141,1.338,0.905 c0.035,0.639-0.548,0.993-0.988,1.363c-0.105,0.09-0.217,0.17-0.324,0.259c2.984,9.387,6.918,18.233,12.067,26.341 c1.247,1.846,2.629,3.651,3.645,5.417v-0.041c1.021-0.163,0.249-0.332,0.236-0.497c-0.124-1.683,0.578-1.935,1.964-1.343 c1.6,0.679,3.35,1.133,5.092,1.307c0.428,0.041,0.846,0.161,1.152,0.458c0.108,0.101,0.246,0.327,0.203,0.423 c-0.095,0.201-0.254,0.433-0.45,0.518c-0.208,0.086-0.479,0.033-0.724,0.021c-0.166-0.01-0.325-0.056-0.811-0.151 c-0.671,0.061-1.656,0.137-2.643,0.241c-0.742,0.076-1.474,0.227-2.215,0.272c-0.126,0.01-0.242,0.015-0.353,0.01 c3.817,4.873,8.002,9.432,12.522,13.617c0.682-0.803,1.336-1.625,1.854-2.558c0.256-0.463,0.81-0.669,1.297-0.523 c0.559,0.174,1.151,0.302,1.64,0.604c1.147,0.709,2.399,1.177,3.608,1.744c0.526,0.252,1.014,0.589,1.529,0.87 c0.367,0.196,0.744,0.377,1.127,0.549c0.407,0.179,0.824,0.155,1.206-0.061c0.287-0.166,0.563-0.362,0.813-0.584 c0.417-0.359,0.853-0.47,1.386-0.28c0.312,0.106,0.649,0.17,0.979,0.195c0.241,0.021,0.545,0.021,0.733-0.103 c0.896-0.587,1.93-1.014,2.465-2.056c0.423-0.814,0.853-1.634,1.56-2.263c0.316-0.282,0.648-0.548,1.096-0.554 c1.117-0.005,2.101-0.462,3.141-0.835c0.36-1.177,0.629-2.278,0.367-3.481c-0.175-0.813-0.251-1.663-0.243-2.493 c0.005-0.805-0.27-1.463-0.697-2.102c-0.327-0.485-0.636-0.983-0.93-1.489c-0.124-0.211-0.244-0.458-0.263-0.696 c-0.017-0.227,0.057-0.495,0.179-0.687c0.142-0.217,0.413-0.287,0.665-0.168c0.377,0.179,0.759,0.354,1.104,0.585 c0.48,0.333,0.974,0.674,1.384,1.087c1.07,1.076,2.274,1.969,3.55,2.786c0.262,0.171,0.535,0.463,0.621,0.75 c0.35,1.182,1.084,2.056,2.005,2.821c0.186,0.15,0.304,0.382,0.452,0.583c-0.156,0.399-0.305,0.774-0.466,1.175 c0.402,0.634,0.83,1.252,1.197,1.905c0.297,0.525,0.357,1.087,0.121,1.688c-0.337,0.855-0.576,1.75-0.921,2.603 c-0.479,1.188-0.666,2.412-0.674,3.725c0.224,0.101,0.433,0.267,0.656,0.282c0.498,0.035,1.004,0.02,1.504-0.018 c0.576-0.038,0.971,0.152,1.114,0.744c0.021,0.08,0.075,0.147,0.115,0.221c0.166,0.274,0.606,0.364,0.883,0.234 c0.735-0.34,1.154-0.972,1.451-1.663c0.206-0.485,0.511-0.845,0.865-1.204c0.367-0.37,0.759-0.633,1.298-0.684 c0.495-0.043,0.982-0.139,1.528-0.222c0.426-1.56,0.843-3.078,1.25-4.566c-0.471-0.592-0.885-1.106-1.29-1.635 c-0.177-0.227,0.03-0.768,0.317-0.825c2.135-0.447,4.272-0.834,6.444-0.226c1.29,0.362,2.59,0.689,3.88,1.051 c0.466,0.131,0.851,0.679,0.836,1.149c-0.013,0.417-0.006,0.85-0.111,1.244c-0.356,1.318-0.415,2.646-0.254,3.991 c0.081,0.677,0.104,1.376-0.224,1.97c-0.784,1.438-0.536,2.921-0.332,4.415c0.021,0.164,0.085,0.321,0.133,0.482 c0.476,1.521,0.8,3.078,1.031,4.658c0.051,0.326,0.168,0.643,0.259,0.965c0.053,0.182,0.443,0.387,0.619,0.317 c0.39-0.151,0.787-0.292,1.151-0.483c0.471-0.246,0.762-0.644,0.823-1.187c0.009-0.083,0.018-0.166,0.018-0.252 c-0.004-0.744,0.401-1.228,0.982-1.642c1.585-1.124,1.649-1.446,0.739-3.03c-0.834-1.448-1.742-2.87-2.145-4.526 c-0.078-0.317-0.104-0.653-0.104-0.986c-0.003-0.634,0.677-1.091,1.23-0.802c1.644,0.85,3.43,1.335,5.114,2.079 c0.188,0.084,0.445,0.442,0.397,0.569c-0.482,1.268,0.613,1.322,1.255,1.734c2.248-0.663,4.466-0.563,6.669,0.149 c0.396,0.128,0.792,0.268,1.189,0.406c1.277,0.443,2.574,0.691,3.94,0.637c0.746-0.03,1.499,0.128,2.248,0.191 c0.669,0.058,1.335,0.141,1.999,0.135c0.314-0.002,0.659-0.13,0.936-0.294c0.714-0.43,1.421-0.885,2.092-1.38 c0.327-0.244,0.554-0.613,0.851-0.905c0.236-0.231,0.485-0.473,0.772-0.629c0.718-0.393,0.794-1.006,0.695-1.718 c-0.08-0.576-0.173-1.164-0.163-1.742c0.007-0.31,0.194-0.629,0.345-0.921c0.141-0.271,0.651-0.382,0.89-0.219 c0.207,0.138,0.426,0.274,0.591,0.45c0.72,0.76,1.1,0.88,2.176,0.126c0.342-0.241,0.682-0.49,1.031-0.717 c0.701-0.455,0.963-0.369,1.305,0.42c0.099,0.224,0.123,0.549,0.291,0.666c0.818,0.576,1.062,1.477,1.401,2.326 c0.651,1.633,1.303,3.265,1.967,4.894c0.19,0.463,0.399,0.923,0.644,1.36c0.209,0.375,0.527,0.712,0.958,0.755 c1.076,0.104,1.83,0.767,2.638,1.366c0.576,0.427,0.787,1.065,1.033,1.689c0.056,0.147,0.108,0.364,0.043,0.482 c-0.471,0.835-0.199,1.831-0.605,2.679c-0.471,0.978-0.91,1.974-1.373,2.959c-0.033,0.068-0.129,0.105-0.177,0.169 c-0.135,0.168-0.545,0.243-0.665,0.058c-0.531-0.813-1.286-0.923-2.181-0.86c-0.84,0.063-1.66,0.163-2.462,0.433 c-0.222,0.07-0.744-0.236-0.813-0.483c-0.137-0.478-0.3-0.963-0.34-1.453c-0.161-1.855-0.669-3.621-1.265-5.371 c-0.12-0.354-0.378-0.407-0.771-0.146c-0.212,0.136-0.393,0.319-0.611,0.433c-0.136,0.072-0.335,0.103-0.479,0.06 c-0.241-0.064-0.473-0.179-0.684-0.312c-1.491-0.96-3.163-1.011-4.851-0.98c-0.316,0.005-0.646,0.144-0.943,0.287 c-0.39,0.183-0.789,0.294-1.212,0.264c-0.851-0.058-1.429,0.299-1.844,1.033c-0.168,0.295-0.508,0.465-0.856,0.428 c-1.537-0.168-2.988,0.297-4.467,0.563c-0.236,0.043-0.455,0.195-0.681,0.302c-0.161,0.073-0.317,0.478-0.249,0.653 c0.123,0.312,0.233,0.624,0.375,0.923c0.184,0.391,0.264,0.777,0.186,1.21c-0.088,0.457,0.096,0.784,0.541,1 c0.669,0.327,0.893,0.956,0.976,1.647c0.05,0.44-0.033,0.825-0.423,1.104c-0.199,0.143-0.493,0.276-0.551,0.476 c-0.417,1.375-1.529,2.164-2.52,3.056c-0.246,0.221-0.503,0.438-0.631,0.548c-0.365,1.086-0.189,1.993-0.073,2.906 c0.056,0.442-0.198,0.855-0.554,1.036c-1.056,0.548-2.221,0.749-3.354,1.034c-0.466,0.115-0.999,0.009-1.494-0.063 c-1.243-0.187-2.479-0.407-3.747-0.332c-0.519,0.03-1.001-0.141-1.38-0.497c-0.984-0.923-2.302-0.936-3.481-1.318 c-0.214-0.065-0.487,0.056-0.737,0.073c-2.257,0.158-4.495,0.234-6.759-0.134c-1.227-0.201-2.459-0.299-3.691-0.327 c9.521,2.724,19.547,4.195,29.923,4.195c24.135,0,45.979-7.896,64.193-21.225c-0.157-0.088-0.324-0.16-0.47-0.267 c-0.352-0.243-0.249-0.854,0.161-1.013c0.075-0.033,0.156-0.043,0.236-0.054c0.083-0.009,0.165-0.02,0.249-0.032 c0.296,0.032,0.55,0.211,0.704,0.456c0.04,0.058,0.053,0.124,0.077,0.195c10.328-7.726,19.469-17.2,27.156-27.988v-33.314 C842.665,266.277,842.351,266.538,842.039,266.796 M837.404,255.403c-0.179,0-0.409-0.294-0.409-0.522 c0-0.335,0.264-0.609,0.57-0.599c0.241,0.011,0.448,0.259,0.408,0.488C837.917,255.112,837.656,255.403,837.404,255.403 M838.419,259.091c-0.289-0.035-0.379-0.258-0.427-0.493c-0.061-0.3,0.229-0.549,0.616-0.474c0.181,0.035,0.324,0.242,0.438,0.333 C839.031,258.904,838.764,259.131,838.419,259.091 M836.869,231.484c-0.027-0.353,0.063-0.666,0.374-0.865 c0.313-0.193,0.934-0.141,1.19,0.08c0.06,0.056,0.139,0.097,0.193,0.156c0.88,1.011,1.755,2.027,2.392,3.217 c0.065,0.133,0.022,0.321,0.035,0.55c-0.144,0.137-0.3,0.373-0.506,0.438c-0.211,0.063-0.516,0.025-0.709-0.091 c-0.442-0.261-0.779-0.15-1.114,0.167c-0.06,0.056-0.123,0.113-0.181,0.171c-0.31,0.296-0.642,0.563-1.102,0.438 c-0.378-0.101-0.698-0.727-0.556-1.266C837.155,233.466,836.954,232.48,836.869,231.484 M833.833,244.329 c0.287-0.025,0.676,0.312,0.648,0.563c-0.03,0.256-0.392,0.573-0.664,0.578c-0.211,0.005-0.455-0.221-0.492-0.452 C833.278,244.716,833.54,244.359,833.833,244.329 M648.789,218.956c-0.536,0.87-1.289,1.242-2.301,1.031 c-0.49-0.101-0.945-0.276-1.295-0.669c-0.187-0.206-0.105-0.74,0.148-0.851c0.853-0.356,1.758-0.412,2.666-0.513 c0.228,0.115,0.45,0.217,0.658,0.34C648.839,218.397,648.892,218.79,648.789,218.956 M657.163,287.265 c-0.236-0.003-0.501-0.262-0.428-0.488c0.068-0.196,0.265-0.349,0.433-0.561c0.236,0.179,0.473,0.279,0.587,0.455 C657.897,286.902,657.514,287.27,657.163,287.265 M661.708,208.666c-0.192,0.136-0.452,0.191-0.688,0.262 c-0.267,0.08-0.525-0.046-0.658-0.236c-0.154-0.227-0.289-0.448-0.397-0.664c-0.333-0.658-0.468-1.31-0.485-2.128 c0.015-0.077,0.027-0.16,0.042-0.241c0.016-0.086,0.038-0.163,0.073-0.236c0.108-0.219,0.262-0.412,0.543-0.442 c0.083-0.008,0.169-0.05,0.242-0.035c1.562,0.287,3.12,0.433,4.7,0.151c0.55,0.16,1.108,0.304,1.646,0.492 c0.123,0.043,0.209,0.239,0.276,0.382c0.091,0.191-0.083,0.529-0.284,0.614c-0.15,0.065-0.292,0.166-0.447,0.196 C664.617,207.092,663.083,207.683,661.708,208.666 M668.426,291.788c-0.511,0.687-1.112,1.234-1.932,1.457 c-0.933-0.443-1.834-0.865-2.729-1.303c-0.221-0.106-0.439-0.236-0.623-0.397c-0.116-0.102-0.257-0.327-0.214-0.418 c0.098-0.204,0.291-0.367,0.462-0.528c0.053-0.05,0.161-0.056,0.244-0.056c1.491,0.073,2.987,0.144,4.484,0.232 C668.489,290.795,668.667,291.459,668.426,291.788 M671.765,282.935c-0.148,0.382-0.211,0.802-0.278,1.212 c-0.093,0.559,0.168,1.277-0.353,1.643c-0.731,0.515-1.595,0.844-2.5,0.998c-0.163,0.024-0.334,0.015-0.497,0.015 c-0.501,0.005-1.002,0.005-1.683,0.005c-0.637-0.101-1.486,0.086-2.278-0.264c-0.176-0.078-0.353-0.485-0.244-0.626 c0.203-0.262,0.382-0.551,0.621-0.77c0.43-0.393,0.896-0.739,1.353-1.104c0.587-0.47,1.119-0.945,1.363-1.728 c0.267-0.853,1.066-1.232,1.803-1.624c0.144-0.075,0.322-0.116,0.483-0.105c0.243,0.02,0.483,0.115,0.731,0.144 C672.188,280.928,672.573,280.888,671.765,282.935 M675.859,315.323c-0.224,0.262-0.616,0.297-0.899,0.101 c-0.298-0.211-0.44-0.508-0.471-0.845c-0.013-0.115,0.136-0.252,0.257-0.453c0.289,0.131,0.596,0.247,0.883,0.393 C675.977,314.694,676.079,315.071,675.859,315.323 M680.325,294.713c-0.251,0.453-0.241,0.943-0.259,1.446 c-0.015,0.485-0.312,0.706-0.821,0.736c-0.169,0.013-0.333,0.025-0.803,0.061c-0.36-0.075-1.011-0.186-1.649-0.347 c-0.627-0.156-0.833-0.538-0.621-1.092c0.088-0.23,0.203-0.453,0.289-0.689c0.667-1.782,1.464-3.525,1.934-5.381 c0.101-0.393,0.313-0.765,0.518-1.119c0.066-0.112,0.263-0.163,0.413-0.211c0.179-0.058,0.319,0.037,0.342,0.246 c0.131,1.152,0.276,2.301,0.367,3.458c0.05,0.583,0.072,1.159,0.322,1.697C680.542,293.924,680.542,294.32,680.325,294.713 M698.567,308.473c0.128,0.27,0.021,0.496-0.123,0.692c-0.511,0.691-1.221,1.14-2.007,1.405c-0.613,0.207-1.293,0.225-1.871,0.314 c-0.206-0.174-0.339-0.259-0.445-0.379c-0.133-0.148-0.032-0.544,0.136-0.665c0.132-0.09,0.247-0.236,0.393-0.281 c0.631-0.201,1.223-0.442,1.753-0.891c0.357-0.301,0.885-0.412,1.345-0.583C698.043,307.978,698.433,308.194,698.567,308.473 M753.487,343.152c-0.257,0.189-0.583,0.3-0.893,0.41c-0.15,0.056-0.354,0.106-0.479,0.046c-0.662-0.319-1.318-0.679-1.688-1.348 c-0.053-0.102,0.207-0.388,0.348-0.574c0.032-0.045,0.155-0.04,0.236-0.037c0.329,0.013,0.659,0.032,0.736,0.037 c0.664,0.076,1.074,0.114,1.483,0.167c0.268,0.035,0.637,0.422,0.589,0.691C753.784,342.764,753.661,343.024,753.487,343.152 M752.25,336.135c-0.205-0.354-0.384-0.734-0.515-1.127c-0.079-0.231-0.051-0.518,0.181-0.679c0.343-0.231,0.684-0.482,1.061-0.634 c1.102-0.428,2.264-0.543,3.928-0.513c-0.072-0.008,0.345,0.008,0.753,0.075c0.13,0.023,0.256,0.166,0.349,0.281 c0.126,0.166,0.018,0.554-0.15,0.664c-0.07,0.045-0.121,0.131-0.193,0.156c-1.351,0.463-2.604,1.069-3.644,2.092 C753.56,336.899,752.57,336.678,752.25,336.135 M759.203,337.644c-0.248,0.342-0.623,0.493-1.025,0.586 c-0.533,0.121-0.969-0.032-0.991-0.35c-0.022-0.387,0.222-0.605,0.519-0.729c0.367-0.155,0.756-0.246,1.144-0.348 c0.048-0.014,0.106-0.009,0.159,0.011c0.166,0.061,0.324,0.239,0.342,0.402C759.301,337.361,759.286,337.527,759.203,337.644 M837.744,183.66c-0.126,0.121-0.289,0.207-0.445,0.227c-0.153-0.056-0.377-0.061-0.45-0.169c-0.178-0.269-0.316-0.57-0.409-0.882 c-0.035-0.121,0.06-0.333,0.161-0.438c0.183-0.19,0.438-0.201,0.674-0.067c0.143,0.078,0.281,0.184,0.404,0.289 c0.188,0.166,0.348,0.356,0.309,0.639C837.967,183.398,837.872,183.545,837.744,183.66 M841.574,195.99 c0.063-0.035,0.161-0.014,0.316-0.022c0.154,0.095,0.408,0.186,0.548,0.361c0.313,0.385,0.355,1.087,0.114,1.403 c-0.606,0.79-1.212,1.574-1.841,2.349c-0.393,0.479-1.106,0.516-1.552,0.121c-0.442-0.393-0.77-0.86-0.994-1.408 c-0.105-0.26-0.015-0.797,0.191-0.921C839.426,197.239,840.498,196.613,841.574,195.99 M831.606,174.646 c0.429-0.531,1.338-0.606,1.77-0.115c0.164,0.187,0.302,0.397,0.445,0.604c0.387,0.563,0.89,0.973,1.536,1.228 c1.097,0.432,2.08,1.058,2.975,1.817c0.26,0.225,0.393,0.531,0.342,0.897c-0.064,0.142-0.095,0.354-0.21,0.423 c-0.755,0.442-1.557,0.639-2.347,0.11c-0.76-0.508-1.506-1.046-2.221-1.619c-0.661-0.533-1.33-0.966-2.22-1.016 c-0.428-0.025-0.629-0.453-0.589-0.951C831.135,175.518,831.273,175.052,831.606,174.646 M828.839,246.109 c0.141-0.367,0.413-0.503,0.687-0.302c0.098,0.07,0.176,0.262,0.161,0.388c-0.043,0.367-0.289,0.452-0.682,0.289 C828.816,246.406,828.753,246.296,828.839,246.109 M823.885,251.011c0.375-0.979,0.933-1.747,1.979-2.104 c0.38-0.137,0.695-0.455,1.049-0.669c0.448-0.267,1.02,0.093,1.054,0.653c0.008,0.083,0.021,0.166,0.056,0.418 c-0.158,0.9-0.337,1.967-0.533,3.032c-0.065,0.348-0.608,0.765-0.938,0.691c-0.727-0.169-1.453-0.344-2.157-0.58 C823.794,252.245,823.638,251.654,823.885,251.011 M821.331,255.273c0.067-0.313,0.404-0.597,0.709-0.611 c0.417-0.022,0.84-0.073,1.25-0.033c1.742,0.177,3.482,0.373,5.223,0.576c0.249,0.028,0.493,0.101,0.727,0.186 c0.546,0.199,1.155,0.36,1.348,1.002c0.172,0.58-0.46,1.813-1.068,2.124c-1.202,0.609-2.462,1.036-3.815,1.137 c-0.499,0.038-1,0.051-1.752,0.086c-0.083-0.006-0.418-0.011-0.749-0.041c-0.438-0.04-0.815-0.246-1.034-0.62 c-0.503-0.875-0.812-1.831-0.973-2.822C821.15,255.944,821.262,255.6,821.331,255.273 M829.168,269.728 c0.022,0.644-0.468,1.187-1.089,1.009c-0.855-0.244-1.637,0.163-2.457,0.077c-0.304-0.03-0.545-0.457-0.396-0.749 c0.372-0.745,0.781-1.477,1.455-1.979c0.559-0.415,1.006-1.298,1.856-0.902c0.704,0.331,0.475,1.166,0.573,1.801 c0.012,0.08,0.018,0.166,0.027,0.248C829.149,269.396,829.164,269.562,829.168,269.728 M733.398,316.385 c-0.089,0.206-0.232,0.473-0.418,0.538c-0.375,0.131-0.792,0.146-1.223,0.211c-0.296-0.065-0.613-0.128-0.923-0.211 c-0.055-0.018-0.115-0.116-0.117-0.181c-0.011-0.156-0.035-0.338,0.035-0.458c0.07-0.131,0.231-0.222,0.369-0.297 c0.704-0.38,1.426-0.212,2.133-0.011C733.339,316.003,733.44,316.279,733.398,316.385 M748.984,322.174 c-0.212,0.08-0.529,0.085-0.72-0.018c-0.674-0.375-1.384-0.526-2.146-0.592c-1.241-0.11-2.479-0.307-3.719-0.447 c-0.694-0.076-1.284-0.378-1.78-0.835c-0.427-0.392-0.787-0.859-1.172-1.297c-0.188-0.217-0.131-0.735,0.088-0.911 c0.128-0.104,0.242-0.236,0.39-0.307c0.599-0.287,1.222-0.528,1.818-0.83c0.843-0.422,1.606-0.322,2.315,0.282 c0.252,0.216,0.523,0.42,0.755,0.653c0.885,0.9,1.901,1.63,2.96,2.299c0.49,0.316,0.955,0.677,1.408,1.041 c0.115,0.091,0.151,0.281,0.254,0.484C749.3,321.852,749.177,322.098,748.984,322.174 M741.711,311.727 c-0.101-0.751,0.056-1.48,0.452-2.149c0.166-0.279,0.634-0.359,0.807-0.067c0.215,0.362,0.413,0.716,0.806,0.91 c0.553,0.267,0.605,0.734,0.51,1.263c-0.042,0.241-0.095,0.485-0.13,0.669c-0.041,0.555-0.044,1.056-0.129,1.543 c-0.04,0.214-0.206,0.473-0.393,0.579c-0.43,0.241-0.902,0.407-1.365,0.589c-0.402,0.155-0.923-0.252-0.789-0.645 C741.781,313.533,741.833,312.647,741.711,311.727 M749.954,316.553c-0.176,0.008-0.43-0.158-0.522-0.319 c-0.129-0.222,0.236-0.583,0.543-0.588c0.222,0,0.428,0.236,0.412,0.578C750.279,316.314,750.125,316.543,749.954,316.553 M755.701,321.715c-0.916,0.421-1.844,0.806-2.882,0.745c-0.544-0.03-0.946-0.271-1.221-0.745c-0.478-0.814-0.613-1.725-0.69-2.64 c-0.019-0.217,0.117-0.513,0.28-0.664c0.303-0.276,0.655-0.589,1.031-0.669c1.072-0.236,2.007-0.799,3.028-1.137 c0.078-0.027,0.166-0.024,0.249-0.04c0.259-0.061,0.734,0.246,0.754,0.503c0.033,0.498,0.053,0.996,0.065,1.293 c-0.105,0.787-0.037,1.348,0.121,1.927C756.61,320.916,756.284,321.444,755.701,321.715 M754.083,314.559 c0.36-0.07,0.619,0.111,0.687,0.478c0.051,0.276-0.251,0.645-0.588,0.609c-0.198-0.022-0.457-0.187-0.559-0.36 C753.493,315.052,753.811,314.609,754.083,314.559 M763.954,312.844c-0.314,0.583-0.602,1.182-0.951,1.74 c-0.171,0.269-0.458,0.465-0.707,0.682c-0.15,0.131-0.583,0.018-0.63-0.163c-0.187-0.715-0.468-1.427-0.517-2.153 c-0.065-1.084-0.219-2.132-0.497-3.179c-0.063-0.231-0.033-0.492-0.048-0.769c0.082-0.212,0.166-0.438,0.267-0.664 c0.058-0.136,0.575-0.244,0.676-0.139c0.282,0.295,0.605,0.566,0.82,0.902c0.53,0.841,1.006,1.711,1.506,2.57 C764.091,312.047,764.171,312.437,763.954,312.844 M774.922,325.428c-0.568,0.115-1.142,0.186-1.606,0.256 c-0.614-0.065-1.114-0.101-1.6-0.191c-0.131-0.022-0.33-0.206-0.334-0.329c-0.071-1.234-0.247-2.477-0.059-3.714 c0.013-0.086,0.271-0.181,0.412-0.176c0.151,0.004,0.329,0.09,0.443,0.196c1.028,0.97,2.047,1.948,3.063,2.934 C775.52,324.678,775.317,325.347,774.922,325.428 M778.651,339.454c-0.06,0.289-0.404,0.397-0.585,0.241 c-0.33-0.279-0.385-0.553-0.204-1.086c0.068-0.201,0.206-0.249,0.396-0.142C778.671,338.71,778.709,339.097,778.651,339.454 M786.15,340.988c-0.626,0.287-1.282,0.352-1.905,0.322c-1.189-0.016-1.821-0.295-1.203-1.693c0.453-1.008,1.047-1.903,1.989-2.521 c0.204-0.132,0.445-0.212,0.674-0.307c0.179-0.081,0.574,0.131,0.584,0.316c0.05,0.918,0.244,1.801,0.506,2.681 C786.95,340.304,786.643,340.762,786.15,340.988 M784.008,333.791c0.157-0.075,0.49,0.08,0.585,0.27 c0.142,0.283-0.013,0.585-0.379,0.733c-0.171,0.068-0.308,0.016-0.383-0.168C783.688,334.274,783.774,333.896,784.008,333.791 M790.448,339.902c-0.198,0.11-0.463,0.11-0.584,0.138c-0.848,0.038-1.279-0.556-1.043-1.295c0.043-0.126,0.229-0.317,0.316-0.302 c0.476,0.09,0.954,0.191,1.394,0.377c0.181,0.075,0.37,0.385,0.357,0.578C790.875,339.58,790.639,339.791,790.448,339.902 M794.846,336.482c-0.156,0.155-0.393,0.231-0.561,0.32c-0.715-0.077-1.366-0.146-2.02-0.221c-0.271-0.035-0.616-0.438-0.576-0.709 c0.07-0.483,0.166-0.963,0.287-1.434c0.072-0.286,0.601-0.51,0.802-0.356c0.651,0.492,1.298,0.99,1.934,1.503 C794.952,335.782,795.037,336.291,794.846,336.482 M785.094,274.982c-9.594,9.335-21.998,14.48-34.939,14.48 c-12.938,0-25.345-5.146-34.851-14.39c-9.279-9.276-14.386-21.656-14.386-34.853c0-13.197,5.106-25.574,14.386-34.854 c9.279-9.277,21.654-14.389,34.851-14.389c13.197,0,25.574,5.111,34.854,14.389c9.277,9.279,14.387,21.656,14.387,34.854 C799.395,253.417,794.286,265.794,785.094,274.982 M815.708,280.676c-0.251-0.085-0.399-0.291-0.399-0.553 c0-0.45,0.377-0.824,0.749-0.775c0.307,0.041,0.648,0.348,0.674,0.611C816.779,280.404,816.18,280.829,815.708,280.676 M816.942,269.275c0.159-0.579-0.214-1.138-0.556-1.618c-0.243-0.334-0.572-0.605-0.84-0.928c-0.369-0.452-0.774-0.893-1.059-1.397 c-0.54-0.945-1.106-1.856-1.871-2.641c-0.13-0.136-0.115-0.468-0.085-0.694c0.04-0.271,0.538-0.543,0.797-0.463 c0.556,0.171,1.127,0.325,1.652,0.568c1.215,0.559,2.437,1.112,3.602,1.766c1.163,0.653,2.25,1.443,3.389,2.143 c0.642,0.393,1.001,0.87,0.777,1.649c-0.024,0.081-0.03,0.166-0.07,0.4c-0.194,1.335-0.407,2.821-0.626,4.308 c-0.065,0.457-0.47,0.679-0.938,0.473c-1.14-0.501-2.352-0.851-3.348-1.667C817.143,270.66,816.696,270.192,816.942,269.275 M826.124,278.793c-0.626,0.224-1.225,0.521-1.854,0.739c-0.387,0.133-0.802,0.184-1.124,0.252 c-0.963-0.194-1.627-0.642-2.014-1.446c-0.062-0.126-0.033-0.337,0.029-0.474c0.104-0.224,0.234-0.457,0.415-0.612 c0.571-0.481,1.132-0.996,1.768-1.379c1.497-0.896,3.033-1.729,4.558-2.585c0.347-0.191,0.998-0.073,1.105,0.262 c0.322,1.006,1.069,1.669,1.793,2.355c1.89,1.799,1.771,1.816,0.611,4.021c-0.153,0.292-0.337,0.573-0.519,0.855 c-0.331,0.513-0.856,0.567-1.227,0.135c-0.485-0.567-0.948-1.159-1.469-1.691C827.622,278.63,826.893,278.519,826.124,278.793 M833.735,286.174c-0.482,0.342-0.845,0.749-1.129,1.292c-0.457,0.88-1.028,1.705-1.566,2.545 c-0.085,0.136-0.211,0.259-0.345,0.347c-0.208,0.142-0.453,0.241-0.693,0.091c-0.134-0.08-0.335-0.222-0.332-0.332 c0.012-1.445-0.599-2.743-0.951-4.099c-0.101-0.388-0.05-0.82-0.013-1.228c0.006-0.061,0.061-0.11,0.128-0.166 c0.073-0.051,0.156-0.1,0.214-0.153c0.084-0.005,0.169-0.022,0.252-0.032c0.083-0.011,0.163-0.016,0.238,0.005 c0.642,0.176,1.293,0.331,1.904,0.586c0.648,0.269,1.277,0.294,1.948,0.158c0.258-0.053,0.49,0.081,0.579,0.337 C834.054,285.783,833.949,286.022,833.735,286.174 M839.909,290.242c-0.435,1.172-0.883,2.334-1.315,3.505 c-0.143,0.39-0.264,0.785-0.393,1.183c-0.249,0.739-0.512,0.942-1.34,0.955c-0.153-0.015-0.404-0.03-0.651-0.065 c-0.402-0.065-0.755-0.513-0.722-0.885c0.051-0.592,0.199-1.146,0.528-1.645c0.375-0.559,0.669-1.146,0.78-1.823 c0.146-0.878,0.66-1.504,1.402-1.975c0.276-0.173,0.498-0.462,0.795-0.578c0.181-0.07,0.53,0.025,0.661,0.172 C839.939,289.397,840.07,289.81,839.909,290.242 M839.883,285.197c-0.251,0.124-0.671-0.231-0.644-0.548 c-0.022-0.423,0.176-0.792,0.48-1.062c0.151-0.13,0.498-0.201,0.666-0.116c0.164,0.086,0.294,0.397,0.303,0.614 C840.711,284.64,840.351,284.977,839.883,285.197"/> <path d="M498.381,340.591c-0.272-0.971-0.468-1.946-0.394-2.972c0.024-0.317-0.077-0.67-0.214-0.967 c-0.466-1.011-0.334-2.14-0.648-3.179c-0.072-0.236,0.29-0.709,0.535-0.756l-36.284-93.428c4.771-2.39,8.929-5.382,12.517-8.781 c-0.427,0-0.855,0.015-1.288,0.055c-0.16,0.014-0.327-0.04-0.492-0.065c-0.334-0.05-0.67-0.679-0.508-0.998 c0.152-0.289,0.299-0.611,0.528-0.832c0.951-0.931,2.104-1.544,3.255-2.157c0.384-0.207,0.767-0.418,1.143-0.634 c0.363-0.041,0.729-0.081,1.103-0.116c0.241-0.03,0.502-0.056,0.754-0.085c8.834-10.761,12.964-24.29,12.964-36.315 c0-13.777-5.202-27.645-14.273-37.91c-7.575-8.572-21.462-18.868-44.596-18.868h-76.153V265.65c0,0.803,0.453,1.563,0.816,2.332 c0.211,0.454,0.389,0.875,0.556,1.342c0.105,0.295,0.061,0.669-0.016,0.977c-0.118,0.485-0.314,0.98-0.575,1.398 c-0.447,0.727-0.698,1.513-0.929,2.323c-0.194,0.679-0.292,1.3,0.13,1.921c0.199,0.292,0.199,0.631,0.127,0.966 c-0.145,0.654-0.272,1.313-0.461,1.954c-0.224,0.767,0.088,1.471,0.883,1.838c0.382,0.176,0.789,0.295,1.152,0.498 c0.729,0.407,1.403,0.842,1.843,1.64c0.312,0.563,0.928,0.95,1.353,1.461c0.203,0.242,0.306,0.581,0.412,0.888 c0.095,0.277-0.239,0.688-0.502,0.757c-0.516,0.133-1.012,0.038-1.486-0.108c-0.887-0.271-1.787-0.447-2.711-0.508 c-0.248-0.015-0.274-0.005-0.515,0.046c-0.108,0.022-0.077,0.091-0.077,0.166v1.75c0,0-0.228,0.01-0.225,0.012 c0.589,0.621,1.154,1.146,2.007,1.275c1.735,0.272,3.374,0.767,5.14,0.851c0.167,0.01,0.306-0.011,0.473-0.006 c0.547,0.011,0.961-0.188,1.213-0.696c0.037-0.073,0.079-0.144,0.106-0.225c0.407-1.274,1.275-2.129,2.457-2.702 c0.14-0.071,0.263-0.174,0.391-0.259c-1.538-0.071-2.804-0.923-4.169-1.484c-0.288-0.116-0.597-0.388-0.723-0.669 c-0.366-0.814-1.038-1.272-1.72-1.768c-0.469-0.345-0.857-0.792-1.29-1.187c-0.616-0.561-1.243-1.109-1.852-1.68 c-0.247-0.229-0.111-0.976,0.196-1.114c0.993-0.448,2.016-0.805,3.108-0.931c0.433-0.05,0.833,0.078,1.169,0.356 c0.779,0.649,1.691,1.066,2.583,1.534c0.662,0.353,1.118,0.111,1.578-0.289c0.186-0.158,0.353-0.359,0.469-0.57 c0.069-0.126,0.08-0.342,0.015-0.463c-0.113-0.216-0.295-0.393-0.465-0.573c-0.812-0.843-1.636-1.675-2.437-2.53 c-0.272-0.292-0.131-0.925,0.224-1.086c0.685-0.307,1.375-0.604,2.073-0.888c0.525-0.213,1.037-0.067,1.383,0.319 c1.728,1.944,3.669,3.663,5.6,5.396c0.435,0.388,0.789,0.87,1.195,1.287c0.78,0.803,1.78,1.25,2.794,1.645 c0.299,0.121,0.662,0.129,0.989,0.105c0.75-0.058,1.499-0.15,2.248-0.256c0.33-0.042,0.656-0.126,0.98-0.216 c1.2-0.33,2.308-0.022,3.394,0.468c0.403,0.181,0.653,0.513,0.417,1.011c-0.332,0.704,0.255,1.297,0.072,1.956 c-0.177,0.639-0.514,1.245-0.418,1.946c0.025,0.188,0.352,0.438,0.558,0.372c0.319-0.1,0.631-0.221,0.951-0.313 c0.319-0.096,0.641-0.21,0.97-0.245c0.236-0.02,0.495,0.049,0.734,0.111c0.435,0.118,0.632,0.694,0.34,0.999 c-0.288,0.294-0.605,0.565-0.914,0.85c-0.039,0.248-0.083,0.495-0.118,0.746c-0.068,0.448,0.03,0.825,0.473,1.047 c0.301,0.148,0.598,0.307,0.904,0.442c0.317,0.141,0.742,0.08,0.933-0.136c0.221-0.249,0.442-0.501,0.641-0.77 c0.465-0.639,1.133-0.966,1.941-1.228c-0.224-0.378-0.474-0.698-0.613-1.068c-0.077-0.201-0.052-0.53,0.073-0.691 c0.121-0.153,0.487-0.285,0.638-0.212c0.515,0.249,0.968,0.501,1.599,0.503c0.549,0.005,1.085,0.404,1.643,0.559 c0.564,0.15,1.152,0.231,1.73,0.317c0.58,0.087,1.165,0.146,1.744,0.221c0.334,0.045,0.654,0.392,0.605,0.674 c-0.091,0.493-0.147,1.003-0.314,1.474c-0.106,0.291-0.35,0.584-0.607,0.765c-0.474,0.337-1.012,0.586-1.511,0.893 c-0.268,0.163-0.42,0.455-0.626,0.691c0.145-0.061,0.297-0.08,0.457-0.038c0.718,0.206,1.418,0.476,2.119,0.737 c0.258,0.096,0.389,0.583,0.25,0.881c-0.106,0.226-0.25,0.42-0.533,0.473c-0.732,0.125-1.28-0.308-1.872-0.602 c-0.4-0.196-0.597-0.566-0.693-0.993c-0.015-0.068-0.052-0.131-0.085-0.193c-0.028,0.013-0.045,0.035-0.077,0.048l0.057-0.07 c-0.231-0.049-0.502-0.196-0.69-0.121c-0.523,0.206-0.951,0.174-1.391-0.196c-0.448-0.378-0.924-0.725-1.414-1.044 c-0.186-0.118-0.45-0.118-0.67-0.168c-0.494,0.77-0.595,1.609-0.816,2.413c-0.136,0.503-0.603,0.865-1.109,0.851 c-1.09-0.03-2.179-0.067-3.263-0.136c-0.666-0.042-1.034-0.594-0.85-1.217c0.069-0.242,0.239-0.466,0.25-0.704 c0.01-0.227-0.068-0.514-0.213-0.68c-0.575-0.648-1.304-1.04-2.185-1.091c-0.149-0.011-0.35,0.051-0.448,0.155 c-0.17,0.174-0.301,0.397-0.404,0.624c-0.428,0.908-0.826,1.831-1.254,2.741c-0.178,0.377-0.378,0.747-0.603,1.096 c-0.291,0.458-1.04,0.685-1.556,0.534c-0.993-0.292-1.849-0.755-2.408-1.69c-0.339-0.57-0.794-1.076-1.168-1.635 c-0.199-0.291-0.222-0.648,0.007-0.936c0.664-0.819,0.809-1.83,1.035-2.801c0.072-0.297,0.004-0.674-0.111-0.966 c-0.556-1.393-1.486-2.406-2.992-2.809c-0.482-0.129-0.945-0.335-1.499-0.533c-0.322,0.203-0.7,0.39-1.001,0.656 c-0.567,0.498-1.095,1.039-1.625,1.571c-0.311,0.314-0.687,0.48-1.114,0.511c-0.331,0.021-0.422,0.264-0.438,0.498 c-0.097,1.357,0.225,2.665,0.525,3.974c0.118,0.508,0.456,0.899,0.904,1.159c1.018,0.581,2.029,1.182,3.085,1.691 c1.011,0.494,1.784,1.223,2.461,2.088c0.181,0.23,0.103,0.473,0.024,0.712c-0.093,0.273-0.33,0.404-0.572,0.428 c-0.327,0.031-0.674,0.021-0.988-0.059c-1.133-0.297-2.261-0.619-3.381-0.95c-0.681-0.206-1.28-0.191-1.898,0.254 c-0.669,0.485-1.424,0.862-2.253,1.351c-0.342,0.508-0.743,1.144-1.195,1.745c-0.192,0.259-0.459,0.498-0.747,0.646 c-0.182,0.088-0.543,0.082-0.685-0.038c-0.504-0.433-0.947-0.94-1.421-1.413c-0.211-0.212-0.693-0.144-0.883,0.125 c-0.338,0.48-0.672,0.961-0.992,1.451c-0.376,0.581-0.124,1.034,0.592,1.315c0.664,0.262,1.308,0.156,1.976,0.115 c0.155-0.013,0.403,0.284,0.474,0.486c0.071,0.216,0.018,0.495-0.042,0.736c-0.209,0.81-0.425,1.614-0.667,2.414 c-0.278,0.915-0.301,1.821,0.06,2.711c0.123,0.301,0.327,0.57,0.509,0.845c0.458,0.691,0.469,0.77,0.057,1.302 c-0.104,0.137-0.224,0.252-0.345,0.368c-0.334,0.319-0.417,0.714-0.334,1.146c0.074,0.412,0.183,0.819,0.283,1.223 c0.054,0.224,0.422,0.342,0.612,0.208c0.066-0.047,0.17-0.063,0.213-0.121c0.917-1.281,1.929-2.502,2.472-4.025 c0.351-0.976,0.268-1.786-0.507-2.502c-0.118-0.11-0.204-0.26-0.287-0.4c-0.19-0.316,0.132-0.955,0.505-0.973 c0.415-0.02,0.833-0.02,1.244,0.022c0.575,0.063,0.948-0.128,1.187-0.671c0.132-0.3,0.727-0.375,0.83-0.142 c0.661,1.517,1.946,2.221,3.419,2.716c0.633,0.214,1.233,0.528,1.859,0.762c0.892,0.333,1.79,0.433,2.668-0.064 c0.143-0.084,0.3-0.146,0.455-0.212c0.57-0.251,1.147-0.241,1.71-0.01c2.081,0.87,4.203,1.654,6.162,2.786 c0.502,0.292,0.775,0.797,0.502,1.258c-0.738,1.239-0.556,2.313,0.245,3.485c1.082,1.594,2.106,3.219,3.345,4.692 c0.338,0.407,0.786,0.664,1.319,0.61c1.035-0.107,1.985,0.264,2.966,0.46c0.533,0.106,0.873,0.471,1.151,0.9 c0.092,0.142,0.208,0.287,0.231,0.442c0.209,1.373,1.339,1.861,2.371,2.382c0.683,0.345,1.474,0.279,2.223,0.154 c0.229-0.036,0.456-0.207,0.644-0.357c0.779-0.651,1.361-1.479,1.959-2.286c0.247-0.332,0.504-0.656,0.767-0.981 c0.132-0.163,0.449-0.1,0.533,0.094c0.073,0.166,0.062,0.339,0.062,0.508v-42.291c0-0.046-0.19-0.091-0.352-0.135 c-0.189-0.052-0.386-0.449-0.271-0.646c0.226-0.393,0.623-0.79,0.623-1.18v-31.75h5.498l6.979,17.862 c0.255-0.156,0.57-0.172,0.747-0.016c1,0.875,1.978,1.793,2.952,2.7c0.248,0.232,0.196,0.876-0.075,1.168 c-0.282,0.301-0.574,0.605-0.886,0.874c-0.265,0.228-0.472,0.483-0.612,0.765l1.539,3.934c0.757-0.081,1.501-0.234,2.253-0.359 c0.737-0.124,1.474-0.26,2.213-0.375c0.411-0.063,0.806,0.286,0.831,0.714c0.054,0.99,0.105,1.981,0.159,3 c0,0.139,0.005,0.304,0,0.471c-0.022,0.553-0.506,1.106-1.081,1.215c-0.324,0.063-0.654,0.11-0.987,0.133 c-0.487,0.035-0.971-0.137-1.455-0.091l26.286,66.76h5.397c-0.252-0.362-0.492-0.749-0.612-1.162 c-0.454-1.529-0.956-3.027-1.958-4.31c-0.047-0.059-0.039-0.159-0.067-0.231c-0.098-0.239,0.147-0.768,0.396-0.84 c0.157-0.051,0.321-0.116,0.484-0.116c0.714,0.005,1.28-0.327,1.828-0.725c0.541-0.39,1.076-0.789,1.653-1.116 c0.152-0.085,0.471,0.051,0.675,0.161c0.118,0.065,0.19,0.267,0.224,0.423c0.034,0.153,0.022,0.334-0.011,0.493 c-0.272,1.221-0.546,2.446-0.839,3.666c-0.275,1.136-0.543,2.272-0.433,3.46c0.01,0.105-0.02,0.206-0.066,0.297h40.911 c0.054,0,0.122-0.005,0.214-0.106c0.693-0.744,1.226-1.378,1.774-2.217C498.404,341.571,498.527,341.104,498.381,340.591 M366.204,269.319c-0.66,0.091-1.312,0.126-1.914-0.24c-0.334-0.584-0.511-1.218-0.516-1.882c-0.003-0.147,0.101-0.302,0.178-0.438 c0.118-0.211,0.465-0.326,0.628-0.227c0.783,0.468,1.444,1.066,2.014,1.778C366.814,268.591,366.546,269.27,366.204,269.319 M386.314,278.011c-0.618,0.553-1.246,1.096-1.871,1.64c-0.06,0.05-0.157,0.053-0.232,0.09c-0.352,0.172-0.932-0.176-0.912-0.567 c0.014-0.247,0.044-0.503,0.125-0.737c0.121-0.35,0.025-0.648-0.129-0.953c-0.17-0.337-0.523-0.556-0.809-0.356 c-0.68,0.468-1.205,0.352-1.754-0.214c-0.133-0.134-0.481-0.144-0.702-0.091c-0.487,0.108-0.945,0.327-1.429,0.439 c-0.786,0.177-1.483,0.086-1.936-0.719c-0.263-0.463-0.686-0.717-1.252-0.644c-0.082,0.01-0.167,0.005-0.249,0 c-0.975-0.011-0.984-0.337-1.059-1.112c0.022-0.175,0.046-0.422,0.098-0.666c0.086-0.404,0.681-0.591,1-0.306 c0.184,0.163,0.354,0.354,0.498,0.555c0.229,0.322,0.548,0.393,0.877,0.292c0.718-0.216,1.421-0.541,2.166-0.085 c0.046,0.024,0.149-0.016,0.213-0.051c0.155-0.08,0.179-0.227,0.057-0.405c-0.138-0.208-0.291-0.404-0.435-0.61 c-0.211-0.298-0.26-0.629-0.049-0.926c0.271-0.367,1.02-0.447,1.37-0.174c0.196,0.154,0.389,0.317,0.563,0.49 c0.413,0.418,0.815,0.84,1.216,1.263c0.366,0.385,0.789,0.578,1.337,0.548c0.224-0.015,0.582,0.086,0.669,0.247 c0.552,1.031,1.507,1.517,2.498,1.981C386.554,277.115,386.616,277.739,386.314,278.011 M389.701,274.278 c-0.258,0.121-0.439-0.08-0.582-0.271c-0.292-0.387-0.23-0.85,0.133-1c0.255-0.106,0.489-0.016,0.649,0.163 c0.145,0.163,0.214,0.395,0.341,0.639C390.038,273.992,389.894,274.188,389.701,274.278 M392.613,278.765 c-0.227,0.005-0.595-0.397-0.616-0.679c-0.02-0.276,0.356-0.674,0.614-0.646c0.263,0.027,0.641,0.42,0.638,0.659 C393.245,278.338,392.842,278.758,392.613,278.765 M395.441,284.423c-0.103,0.191-0.364,0.292-0.491,0.387 c-0.174,0-0.27,0.026-0.339-0.005c-0.613-0.254-1.202-0.548-1.632-1.081c-0.214-0.261-0.186-0.85,0.092-1.144 c0.178-0.188,0.428-0.313,0.665-0.177c0.639,0.37,1.288,0.75,1.74,1.346C395.584,283.891,395.541,284.242,395.441,284.423 M395.93,277.231c0.054-0.348,0.347-0.626,0.668-0.538c0.191,0.05,0.332,0.276,0.449,0.382c-0.037,0.468-0.248,0.717-0.582,0.779 C396.146,277.915,395.876,277.599,395.93,277.231 M397.019,281.209c-0.074-0.027-0.16-0.091-0.188-0.155 c-0.157-0.364,0.169-0.865,0.571-0.896c0.234-0.018,0.445,0.216,0.433,0.473C397.81,281.129,397.464,281.376,397.019,281.209 M374.944,287.523c-0.714,1.768-1.543,1.975-3.214,0.611c-0.222-0.177-0.289-0.734-0.095-0.913 c0.474-0.457,0.937-0.933,1.454-1.335c0.587-0.457,1.481-0.221,1.934,0.455c0.044,0.068,0.062,0.148,0.093,0.225 c0.012,0.08,0.054,0.17,0.035,0.245C375.095,287.053,375.036,287.295,374.944,287.523 M382.009,305.913 c-0.836-0.035-1.671-0.081-2.506-0.118c-1.253-0.052-2.504-0.078-3.75,0.174c-0.611,0.121-0.872-0.065-1.115-0.725 c-0.402-1.088-0.773-2.188-1.18-3.349c-0.355-0.111-0.747-0.252-1.147-0.357c-0.565-0.151-1.143-0.257-1.706-0.413 c-0.951-0.269-1.857-0.759-2.906-0.538c-0.089,0.021-0.277-0.181-0.329-0.316c-0.054-0.136-0.064-0.385,0.021-0.468 c0.42-0.397,0.888-0.744,1.315-1.142c0.42-0.393,0.811-0.819,1.185-1.202c2.375,0.316,2.375,0.316,4.11,1.116 c1.291,0.594,2.58,1.189,3.865,1.796c1,0.468,1.872,1.076,2.426,2.085c0.491,0.897,1.26,1.546,2.106,2.109 c0.208,0.139,0.294,0.388,0.24,0.661C382.573,305.541,382.241,305.924,382.009,305.913 M389.906,310.018 c-0.144,0.307-0.482,0.485-0.8,0.438c-0.675-0.11-1.252-0.413-1.633-0.976c-0.116-0.166-0.077-0.478-0.022-0.702 c0.027-0.117,0.241-0.188,0.391-0.299c0.637-0.006,1.27,0.083,1.849,0.425C389.994,309.084,390.097,309.609,389.906,310.018 M392.299,306.505c-0.057,0.098-0.095,0.241-0.157,0.324c-0.021,0.024-0.044,0.045-0.072,0.056 c-0.214,0.077-0.486,0.135-0.695,0.072c-0.806-0.238-1.437-0.75-1.946-1.408c-0.042-0.058-0.058-0.186-0.021-0.238 c0.083-0.116,0.196-0.282,0.314-0.295c0.236-0.027,0.518-0.032,0.721,0.072c0.582,0.293,1.142,0.634,1.69,0.986 c0.051,0.035,0.079,0.105,0.103,0.187C392.255,306.341,392.273,306.429,392.299,306.505 M392.518,304.388 c-0.263,0.254-0.644,0.299-0.907,0.115c-0.411-0.284-0.806-0.521-1.32-0.601c-0.415-0.062-0.587-0.569-0.419-0.961 c0.17-0.393,0.435-0.715,0.806-0.9c0.195-0.096,0.541-0.141,0.7-0.033c0.698,0.471,1.115,1.159,1.37,1.909 C392.655,304.112,392.621,304.286,392.518,304.388 M394.828,296.357c-0.147,0.061-0.317,0.065-0.46,0.091 c-0.485-0.015-0.773-0.297-0.948-0.694c-0.191-0.432,0.25-1.081,0.715-1.056c0.243,0.013,0.489,0.085,0.72,0.165 c0.354,0.131,0.535,0.413,0.519,0.755C395.358,295.985,395.152,296.225,394.828,296.357 M398.402,313.915 c-0.088,0.271-0.324,0.447-0.695,0.543c-0.073-0.029-0.17-0.06-0.253-0.091c-0.082-0.027-0.147-0.06-0.157-0.107 c-0.044-0.219-0.042-0.49,0.057-0.687c0.152-0.297,0.618-0.488,0.847-0.362c0.121,0.063,0.231,0.256,0.236,0.4 C398.443,313.725,398.43,313.824,398.402,313.915 M400.783,304.613c-0.062,0.163-0.172,0.561-0.358,0.918 c-0.182,0.35-0.846,0.428-1.094,0.148c-0.216-0.247-0.44-0.501-0.6-0.782c-0.29-0.525-0.685-0.905-1.21-1.207 c-0.403-0.231-0.386-1.021-0.02-1.317c0.651-0.528,1.38-0.936,2.209-1.081c0.17-0.03,0.502,0.211,0.575,0.399 C400.604,302.549,400.866,303.432,400.783,304.613 M454.094,253.636c0.882,0.063,1.391,0.835,1.022,1.541 c-0.204,0.393-0.734,0.459-1.043,0.156c-0.311-0.304-0.463-0.674-0.568-1.079C453.427,253.96,453.76,253.613,454.094,253.636 M434.81,295.854c-0.406,0.402-0.721,0.928-1.32,1.117c-0.175,0.055-0.582-0.03-0.675-0.177c-0.811-1.282-0.752-2.686-0.556-4.104 c0.01-0.07,0.084-0.146,0.149-0.196c0.128-0.101,0.271-0.182,0.438-0.292c0.216,0.046,0.5,0.035,0.69,0.164 c0.479,0.326,0.983,0.659,1.354,1.094C435.681,294.378,435.69,294.975,434.81,295.854 M432.094,276.517 c0.082-0.527,0.432-0.88,0.909-1.081c0.531-0.224,1.177-0.056,1.575,0.372c0.297,0.316,0.42,0.691,0.297,1.448 c0,0-0.059,0.322-0.139,0.639c-0.191,0.727-0.675,0.891-1.157,0.305c-0.34-0.417-0.824-0.506-1.205-0.802 C432.072,277.166,432.044,276.839,432.094,276.517 M432.258,200.795H404.18v-23.416h28.305c7.091,0,9.53,2.109,10.75,3.57 l0.27,0.388c2.121,2.253,2.878,5.623,2.878,7.981c0,2.285-0.853,5.804-2.637,7.974c-0.629,0.731-1.828,1.481-3.066,2.181 C438.737,200.305,435.688,200.795,432.258,200.795 M445.507,294.633c-1.3,0.267-2.565,0.615-3.77,1.18 c-0.061,0.027-0.157-0.023-0.24-0.035c-0.268-0.044-0.582-0.531-0.484-0.772c0.093-0.222,0.18-0.463,0.327-0.649 c1.027-1.307,2.058-2.614,3.116-3.893c0.663-0.802,1.213-0.89,2.191-0.457c0.268,0.115,0.484,0.548,0.408,0.824 c-0.294,1.036-0.585,2.075-0.887,3.108C446.07,294.28,445.831,294.567,445.507,294.633 M450.623,343.895 c-0.116,0.094-0.27,0.3-0.469,0.357c-0.433,0.128-0.785-0.064-1.027-0.438c-0.18-0.271-0.133-0.639,0.098-0.89 c0.221-0.241,0.595-0.298,0.875-0.131C450.489,343.022,450.693,343.402,450.623,343.895 M452.83,297.424 c-0.79,0.774-1.344,1.694-1.758,2.711c-0.577,0.359-0.879,0.966-1.309,1.453c-0.074,0.089-0.329,0.098-0.453,0.04 c-0.216-0.105-0.451-0.251-0.577-0.447c-0.507-0.789-1.174-1.403-1.929-1.948c-0.497-0.359-0.523-0.637-0.268-1.326 c0.06-0.155,0.093-0.336,0.194-0.462c0.148-0.187,0.332-0.453,0.527-0.48c1.407-0.196,2.82-0.339,4.27-0.503 c0.297,0.043,0.624,0.088,0.948,0.143C452.745,296.652,453.018,297.243,452.83,297.424 M461.331,295.897 c-0.049,0.656-0.467,0.838-1.049,0.762c-0.922-0.115-5.188-1.729-6.059-2.25c-0.45-0.27-0.536-0.646-0.283-1.296 c0.062-0.155,0.147-0.296,0.221-0.449c-0.352-0.75-0.7-1.499-0.739-2.352c-0.028-0.584,0.268-1.165,0.795-1.443 c0.076-0.038,0.142-0.091,0.222-0.116c1.675-0.502,3.363-0.917,5.13-0.835c0.116,0.005,0.275,0.182,0.322,0.313 c0.046,0.136,0.039,0.364-0.049,0.458c-0.72,0.804-1.48,1.574-2.201,2.378c-0.216,0.242-0.378,0.547-0.507,0.848 c-0.042,0.093,0.072,0.319,0.18,0.395c0.121,0.091,0.312,0.106,0.474,0.106c0.667,0.005,1.334-0.026,1.998-0.016 c1.169,0.021,1.673,0.709,1.614,1.751C461.366,294.733,461.372,295.316,461.331,295.897 M465.306,263.265 c-0.417-0.433-0.719-0.928-0.823-1.514c-0.103-0.568-0.147-1.152-0.201-1.615c0.018-0.283-0.002-0.462,0.052-0.61 c0.051-0.144,0.162-0.345,0.28-0.37c0.224-0.05,0.484-0.035,0.708,0.025c0.137,0.038,0.292,0.187,0.351,0.322 c0.472,1.065,0.988,2.107,1.71,3.03c0.144,0.183,0.097,0.548-0.054,0.687C466.727,263.763,465.798,263.772,465.306,263.265 M467.011,268.118c-0.005-0.282,0.36-0.68,0.767-0.653c0.16,0.098,0.455,0.245,0.7,0.45c0.093,0.077,0.113,0.316,0.072,0.455 c-0.121,0.396-0.563,0.596-0.993,0.485C467.229,268.767,467.016,268.48,467.011,268.118 M470.621,273.892 c-0.271,1.313-0.371,2.612-0.018,3.928c0.038,0.142-0.059,0.317-0.093,0.48c-0.044,0.193-0.394,0.485-0.536,0.436 c-0.469-0.166-0.98-0.267-1.39-0.531c-0.899-0.575-1.381-1.413-1.256-2.432c-0.081-0.819,0.144-1.464,0.806-1.766 c0.651-0.296,1.067-0.744,1.413-1.327c0.067-0.115,0.273-0.201,0.417-0.212c0.283-0.009,0.414,0.231,0.482,0.461 C470.538,273.243,470.683,273.592,470.621,273.892"/> <path d="M387.461,332.252c-0.069-0.04-0.149-0.093-0.223-0.093c-1.393,0.033-2.387-0.608-3.08-1.786 c-0.169-0.289-0.374-0.561-0.59-0.812c-0.422-0.485-0.484-1.025-0.399-1.64c0.078-0.578,0.075-1.167,0.07-1.753 c0-0.113-0.155-0.284-0.271-0.319c-0.139-0.046-0.332-0.002-0.468,0.065c-0.562,0.281-0.914,0.76-1.01,1.363 c-0.128,0.825-0.172,1.662-0.258,2.494c-0.027,0.267-0.44,0.614-0.713,0.588c-0.334-0.024-0.667-0.08-1.002-0.115 c-0.507-0.055-1.007-0.015-1.473,0.209c-0.842,0.405-1.722,0.628-2.66,0.659c-0.448,0.018-0.698,0.45-0.558,0.902 c0.069,0.231,0.192,0.448,0.308,0.663c0.078,0.147,0.188,0.272,0.281,0.413c0.162,0.254,0.072,0.488-0.103,0.675 c-0.103,0.11-0.287,0.219-0.422,0.206c-0.292-0.021-0.58-0.059-0.868-0.096c-0.292-0.041-0.58-0.084-0.868-0.121 c-0.27,0.148-0.535,0.234-0.801,0.271c-0.263,0.035-0.528,0.03-0.791-0.005c-0.525-0.065-1.048-0.233-1.575-0.345 c-0.428-0.09-0.833,0.068-1.134,0.405c-0.674,0.744-1.401,1.453-1.995,2.258c-0.708,0.956-1.497,1.806-2.452,2.502 c-0.203,0.148-0.401,0.302-0.375,0.279c-0.361,0.704-0.081,1.071,0.033,1.464c0.118,0.4,0.292,0.784,0.383,1.191 c0.093,0.403,0.135,0.82,0.16,1.232c0.019,0.276-0.342,0.642-0.612,0.719c-0.595,0.166-1.177,0.106-1.712-0.161 c-0.667-0.326-1.3-0.729-1.952-1.098c-0.466,0.072-0.692,0.226-0.886,0.596c-0.271,0.518-0.572,1.277-0.904,1.277h15.095 c-0.154-0.091-0.276-0.303-0.198-0.448c0.152-0.286,0.329-0.508,0.506-0.779c0.361-0.553,0.332-1.111-0.038-1.604 c-0.392-0.528-0.866-0.989-1.35-1.439c-0.605-0.563-0.893-1.182-0.62-2.002c0.052-0.155,0.054-0.323,0.084-0.486 c0.083-0.428,0.289-0.772,0.688-0.981c0.654-0.343,1.309-0.682,2.032-1.062c1.208,0.458,2.447,0.918,3.68,1.398 c0.308,0.121,0.6,0.289,0.89,0.453c0.781,0.432,0.94,0.85,0.585,1.624c-0.414,0.905-0.86,1.8-1.295,2.696 c-0.145,0.296-0.31,0.588-0.458,0.885c-0.159,0.321-0.088,0.631,0.03,0.956c0.129,0.341,0.121,0.603,0.031,0.789h8.293 c-0.406,0-0.813-0.071-1.197-0.264c-1.167-0.582-2.354-0.649-3.644-0.249c-0.136,0.045-0.34-0.011-0.472-0.089 c-0.125-0.075-0.278-0.244-0.275-0.369c0.007-0.237,0.056-0.522,0.199-0.699c1.194-1.501,1.478-3.345,1.921-5.122 c0.076-0.312,0.007-0.664-0.008-0.996c-0.012-0.238-0.266-0.514-0.477-0.5c-0.248,0.015-0.496,0.07-0.742,0.085 c-0.162,0.01-0.358,0.035-0.492-0.035c-0.876-0.468-1.744-0.956-2.596-1.464c-0.106-0.06-0.16-0.302-0.136-0.445 c0.02-0.143,0.157-0.273,0.26-0.395c0.048-0.061,0.141-0.113,0.216-0.113c1.003-0.007,2.008-0.01,3.013-0.005 c0.715,0.005,1.231,0.49,1.818,0.788c0.482,0.005,0.674-0.438,1.02-0.64c0.425-0.251,0.897-0.422,1.362-0.608 c0.383-0.146,0.791-0.236,1.164-0.407c0.113-0.051,0.157-0.271,0.206-0.422C387.648,332.367,387.53,332.29,387.461,332.252 M366.975,341.028c-0.43-0.024-0.764-0.413-0.723-0.814c0.028-0.276,0.42-0.594,0.7-0.579c0.391,0.021,0.767,0.448,0.723,0.83 C367.642,340.754,367.277,341.048,366.975,341.028 M371.222,343.518c-0.186,0.091-0.317,0.036-0.41-0.15 c-0.238-0.476-0.143-0.787,0.307-0.966c0.202-0.08,0.462,0.105,0.524,0.372C371.727,343.128,371.608,343.337,371.222,343.518"/> <path d="M632.513,295.488c-0.122,0.069-0.321,0.012-0.484,0c-0.189-0.011-0.519-0.322-0.503-0.479 c0.07-0.76,0.226-1.499,0.485-2.213l-1.017-2.615c-0.085,0.433-0.133,0.875-0.16,1.322c-0.025,0.443-0.604,0.876-1.062,0.876 c-0.078-0.025-0.166-0.035-0.249-0.051c-0.083-0.021-0.155-0.042-0.208-0.091c-0.471-0.473-0.843-1.018-1.026-1.662 c-0.065-0.226-0.093-0.506-0.025-0.724c0.276-0.86,0.548-1.735,1.129-2.447c0.106-0.13,0.244-0.236,0.396-0.331l-18.557-47.782 c16.791-8.416,26.098-24.209,28.986-39.538c-0.029-0.279-0.07-0.558-0.1-0.834c-0.04-0.338,0.131-0.64,0.392-0.836 c0.468-2.952,0.697-5.879,0.697-8.721c0-13.78-5.2-27.646-14.273-37.913c-7.577-8.572-21.463-18.87-44.598-18.87h-76.346v184.397 c0-0.035,0-0.062,0.058-0.056c0.188,0,0.445,0.236,0.473,0.407c0.171,1.081,0.589,2.062,0.943,3.082 c0.466,1.334,0.827,2.717,1.056,4.11c0.194,1.156,0.397,2.293,0.798,3.396c0.103,0.284-0.021,0.697-0.34,0.768 c-1.036,0.231-1.971,0.478-2.987,0.644v4.149c0,0,0.126,0,0.257,0.007c0.327,0.018,0.605,0.121,0.797,0.436 c0.397,0.656,0.948,1.132,1.506,1.645c1.667,1.529,3.199,3.176,4.65,4.916c0.319,0.385,0.629,0.793,0.85,1.234 c0.322,0.649,0.196,1.334-0.203,1.901c-0.234,0.337-0.688,0.578-1.106,0.48c-0.811-0.196-1.622-0.329-2.439-0.475 c-0.468-0.086-0.905-0.423-1.32-0.697c-0.841-0.561-1.705-1.051-2.704-1.277c-0.163-0.038-0.537,0.274-0.522,0.445 c0.013,0.166,0.003,0.126,0.038,0.286c0.161,0.725,0.327,1.964,0.49,1.964h28.001c0.063,0,0.122-0.058,0.184-0.073 c0.093-0.02,0.171,0.073,0.238,0.073h19.137v-12.684c0,0.028-1.139-0.35-1.667-0.729c-0.156-0.112-0.125-0.51-0.027-0.687 c0.115-0.216,0.273-0.447,0.422-0.638c0.514-0.649,0.911-1.228,1.298-1.978c0.04-0.075-0.025-0.126-0.025-0.171v-6.257 c0-0.085,0-0.186-0.093-0.307c-0.193-0.264-0.284-0.559-0.362-0.865c-0.264-1.051-0.396-2.102-0.07-3.198 c0.332-1.111,0.345-2.264,0.669-3.383c0.015-0.063-0.144-0.122-0.144-0.184v-16.621c0,0.091-0.048,0.164-0.209,0.173 c-0.331,0.023-0.558-0.259-0.567-0.567c-0.018-0.428,0.168-0.813,0.576-0.797c0.128,0.004,0.2,0.055,0.2,0.125v-6.961 c0,0.091-0.452,0.182-0.794,0.27c-0.426,0.113-0.645,0.345-0.863,0.729c-0.123,0.218-0.201,0.433-0.313,0.655 c-0.385,0.771-0.999,1.057-1.828,1.021c-0.167-0.01-0.32,0.016-0.486,0.022c-0.168-0.013-0.329-0.018-0.495-0.037 c-0.463-0.048-0.747-0.338-0.94-0.729c-0.176-0.357-0.056-0.875,0.304-1.121c1.102-0.76,2.105-1.671,3.362-2.188 c0.383-0.16,0.548-0.332,0.905-0.54c0.581-0.34,1.149-0.768,1.149-1.411v-39.702h1.946c0,0,0.093-0.508,0.271-0.764 c0.105-0.148,0.225-0.231,0.351-0.338c0.379-0.321,0.85-0.432,1.385-0.422c0.131-0.01,0.251,0.011,0.37,0.025 c0.318,0.037,0.601,0.158,0.835,0.372c0.107,0.096,0.206,0.214,0.296,0.347c0.046,0.07,0.093,0.142,0.131,0.217 c0.818,1.72,1.165,1.433,2.556,1.277c0.497-0.061,1.011-0.07,1.488-0.201c1.116-0.313,1.954,0.105,2.703,0.886 c0.399,0.417,0.936,0.718,1.145,1.297c0.053,0.139,0.027,0.354-0.056,0.468c-0.083,0.112-0.292,0.211-0.423,0.188 c-0.236-0.037-0.462-0.158-0.681-0.264c-0.388-0.196-0.787-0.332-1.197-0.121c-1.303,0.669-2.641,0.891-4.001,0.855l4.021,10.239 c0.14-0.216,0.299-0.423,0.495-0.611c0.236-0.229,0.525-0.407,0.808-0.58c0.334-0.212,0.968,0.024,1.036,0.376 c0.064,0.328,0.093,0.664,0.141,0.991c0.035,0.247,0.029,0.516,0.133,0.734c0.098,0.209,0.279,0.453,0.479,0.523 c0.627,0.229,1.291,0.352,1.917,0.578c0.543,0.201,1.062,0.471,1.574,0.739c0.063,0.036,0.105,0.101,0.143,0.174 c0.041,0.072,0.073,0.158,0.116,0.227c-0.027,0.067-0.045,0.157-0.07,0.238c-0.025,0.075-0.055,0.142-0.104,0.174 c-0.281,0.169-0.593,0.369-0.9,0.38c-0.947,0.043-1.77,0.342-2.572,0.859c-0.345,0.222-0.709,0.413-1.091,0.563l3.38,8.605 c0.266,0.075,0.537,0.138,0.802,0.214c0.148,0.043,0.297,0.163,0.385,0.289c0.081,0.12,0.11,0.302,0.108,0.453 c-0.005,0.21-0.325,0.502-0.495,0.467c-0.089-0.017-0.174-0.032-0.263-0.05l6.071,15.468c0.402-0.184,0.89-0.148,1.34,0.158 c0.137,0.096,0.249,0.222,0.375,0.332c0.208,0.176,0.276,0.407,0.214,0.664c-0.061,0.257-0.222,0.453-0.501,0.465 c-0.284,0.016-0.558,0.011-0.789,0.006l0.741,1.893c0.8,0.68,1.649,1.305,2.433,2.012c0.636,0.568,1.33,0.986,2.232,0.991 c0.214,0.005,0.448,0.206,0.621,0.372c0.096,0.091,0.141,0.305,0.111,0.442c-0.03,0.141-0.156,0.332-0.282,0.372 c-0.918,0.313-1.828,0.252-2.59-0.357c-0.506-0.406-1.014-0.81-1.499-1.225l2.814,7.173c0.103-0.44,0.211-0.883,0.314-1.32 c0.174-0.744,0.457-1.424,1.016-1.979c0.535-0.53,1.287-0.654,1.79-0.148c1.009,1.019,2.19,1.811,3.302,2.698 c0.39,0.31,0.851,0.538,1.237,0.853c0.422,0.342,0.568,0.835,0.433,1.358c-0.166,0.644-0.399,1.272-0.586,1.915 c-0.123,0.433,0.196,0.823,0.661,0.848c0.083,0.008,0.168,0.023,0.249,0.023c1.868-0.07,1.738-0.181,2.371,1.777 c0.31,0.954,0.705,1.879,1.087,2.805c0.224,0.545,0.462,1.091,0.45,1.685c-0.016,0.77,0.186,1.468,0.46,2.183 c0.227,0.583,0.055,1.136-0.485,1.555c-0.325,0.248-0.593,0.578-0.873,0.884c-0.04,0.046-0.005,0.156-0.018,0.234 c-0.027,0.209,0.066,0.319,0.285,0.324c0.837,0.021,1.631,0.081,2.384,0.573c0.593,0.393,1.008,0.828,1.236,1.499 c0.217,0.629,0.513,1.232,0.82,1.826c0.428,0.816,0.789,1.659,1.019,2.555c0.148,0.583-0.046,1.035-0.566,1.201 c-0.711,0.231-1.431,0.438-2.129,0.649c-0.016,0.196-0.086,0.383-0.028,0.503c0.216,0.452,0.485,0.88,0.717,1.322 c0.224,0.428,0.694,0.779,0.538,1.341c-0.123,0.442-0.596,0.549-0.924,0.797c-0.874,0.664-1.535,1.534-2.199,2.395 c-0.141,0.186-0.289,0.352-0.448,0.508l0.881,2.243c0.184-0.021,0.367-0.043,0.555-0.065c1.286-0.182,2.586-0.31,3.876,0 c0.005-0.021,0.008-0.04,0.012-0.061c0.018-0.002,0.031-0.002,0.046-0.005c-0.236-0.503-0.492-0.999-0.696-1.517 c-0.206-0.527,0.115-1.27,0.624-1.494c0.918-0.404,1.86-0.759,2.753-1.209c0.646-0.325,1.095-0.204,1.526,0.334 c0.158,0.193,0.295,0.41,0.407,0.634c0.073,0.142,0.088,0.314,0.146,0.544c-0.846,1.144-2.045,1.898-3.322,2.517 c-0.415,0.201-0.955,0.146-1.438,0.196c0.013,0.025,0.025,0.051,0.035,0.075c-0.027-0.007-0.055-0.007-0.085-0.015 c-0.144,0.545-0.255,1.102-0.448,1.629c-0.516,1.413-1.068,2.813-1.606,4.221c-0.018,0.045-0.046-0.139-0.065-0.097l0.784,1.793 h53.802l-19.237-49.325C632.808,295.105,632.663,295.407,632.513,295.488 M551.245,324.537c-0.342,0-0.698-0.297-0.709-0.581 c-0.015-0.396,0.359-0.739,0.808-0.736c0.273,0.005,0.596,0.392,0.575,0.693C551.898,324.21,551.544,324.537,551.245,324.537 M551.015,302.579c0.393-0.105,0.795-0.188,1.195-0.251c0.31-0.044,0.691,0.205,0.762,0.49c0.118,0.475,0.211,0.949,0.297,1.35 c-0.061,0.327-0.101,0.568-0.15,0.808c-0.059,0.259-0.445,0.636-0.694,0.596c-0.312-0.051-0.707-0.075-0.905-0.271 c-0.525-0.523-0.827-1.204-0.983-1.938C550.49,303.149,550.767,302.645,551.015,302.579 M550.654,312.454 c0.176-0.144,0.39-0.233,0.651-0.385c0.166,0.171,0.37,0.304,0.442,0.487c0.096,0.231-0.022,0.455-0.249,0.599 c-0.327,0.217-0.616,0.191-0.85-0.075C550.49,312.899,550.47,312.603,550.654,312.454 M549.699,299.262 c0.195,0.073,0.342,0.284,0.479,0.405c-0.04,0.312-0.417,0.608-0.722,0.604c-0.271-0.005-0.452-0.166-0.525-0.413 C548.821,299.483,549.276,299.113,549.699,299.262 M549.326,306.703c0.115,0.063,0.164,0.257,0.276,0.438 c-0.155,0.141-0.304,0.327-0.492,0.433c-0.212,0.115-0.479,0.146-0.661-0.065c-0.083-0.101-0.141-0.299-0.101-0.42 C548.478,306.678,548.924,306.502,549.326,306.703 M540.638,191.4c0.299-0.043,0.636,0.322,0.583,0.634 c-0.048,0.312-0.402,0.563-0.83,0.519c-0.1-0.129-0.318-0.293-0.364-0.499C539.961,191.78,540.329,191.442,540.638,191.4 M524.612,337.8c-0.271,0.181-0.591,0.294-0.9,0.402c-0.359,0.126-0.87-0.242-0.918-0.632c-0.017-0.163-0.034-0.329-0.064-0.621 c0.055-0.286,0.1-0.703,0.231-1.096c0.135-0.406,0.42-0.74,0.859-0.83c0.225-0.045,0.525-0.056,0.701,0.06 C525.525,335.723,525.568,337.171,524.612,337.8 M528.721,298.229c-0.008-0.249,0.372-0.618,0.648-0.634 c0.267-0.01,0.656,0.367,0.646,0.626c-0.013,0.26-0.405,0.656-0.642,0.652C529.121,298.862,528.729,298.476,528.721,298.229 M530.586,315.464c-1.137-0.291-1.715-1.534-1.222-2.545c0.164-0.334,0.709-0.583,1.049-0.497c0.671,0.163,1.212,0.532,1.652,1.045 c0.095,0.111,0.088,0.305,0.13,0.468c-0.12,0.587-0.404,1.097-0.897,1.437C531.121,315.491,530.805,315.52,530.586,315.464 M532.213,326.453c-0.138,0.136-0.515,0.121-0.661-0.065c-0.096-0.116-0.211-0.307-0.176-0.423 c0.243-0.784,0.586-1.519,1.308-1.998c0.214-0.142,0.772,0.013,0.837,0.249c0.021,0.077,0.076,0.17,0.053,0.236 C533.285,325.229,532.805,325.875,532.213,326.453 M534.859,319.656c-0.234,0.118-0.46,0.126-0.669-0.068 c-0.312-0.286-0.565-0.596-0.548-1.061c0.011-0.232,0.252-0.465,0.492-0.434c0.488,0.071,0.932,0.459,1.017,0.937 C535.194,319.281,535.116,319.522,534.859,319.656 M536.383,336.615c-0.219,0.099-0.456-0.101-0.483-0.348 c-0.032-0.296,0.177-0.396,0.4-0.485c0.227-0.09,0.433,0.08,0.473,0.468C536.677,336.346,536.556,336.537,536.383,336.615 M537.98,307.978c-0.053,0.054-0.099,0.119-0.146,0.174c-0.051,0.061-0.102,0.111-0.164,0.131c-0.112,0.04-0.312,0.007-0.397-0.07 c-0.098-0.096-0.165-0.287-0.138-0.413c0.022-0.11,0.181-0.231,0.304-0.281c0.201-0.078,0.559,0.08,0.581,0.234 C538.033,307.825,537.996,307.905,537.98,307.978 M539.966,307.382c-0.08,0.086-0.302,0.07-0.45,0.04 c-0.176-0.04-0.316-0.513-0.176-0.631c0.179-0.148,0.404-0.269,0.629-0.321c0.082-0.021,0.224,0.183,0.367,0.313 C540.22,306.984,540.13,307.219,539.966,307.382 M543.009,298.661c-0.068-0.033-0.126-0.121-0.15-0.196 c-0.123-0.453,0.15-0.912,0.561-0.926c0.271-0.009,0.462,0.156,0.568,0.397c0.027,0.071,0.02,0.156,0.03,0.236 C543.897,298.535,543.324,298.824,543.009,298.661 M542.446,211.211c-0.905-0.985-1.813-1.967-2.678-2.987 c-0.372-0.438-0.685-0.951-0.94-1.469c-0.337-0.675-0.104-1.549,0.482-2.042c0.319-0.269,0.656-0.521,0.993-0.77 c1.179-0.875,1.363-1.212,2.736,0.096c0.663,0.634,1.403,1.187,2.072,1.811c0.161,0.146,0.176,0.447,0.254,0.664 c-0.348,0.717-0.396,1.456-0.493,2.195s-0.353,1.46-0.581,2.18C544.053,211.644,543.007,211.824,542.446,211.211 M544.639,220.047 c0.161-0.316,0.387-0.558,0.749-0.563c0.326-0.009,0.661,0.036,0.988,0.097c0.3,0.051,0.506,0.452,0.45,0.774 c-0.048,0.281-0.254,0.412-0.473,0.528c-0.07,0.04-0.159,0.06-0.239,0.063c-0.166,0.01-0.33,0.006-0.696,0.006 c-0.048-0.011-0.297-0.044-0.541-0.089C544.582,220.802,544.47,220.375,544.639,220.047 M544.958,320.654 c-0.059-0.121-0.043-0.354,0.037-0.452c0.229-0.263,0.535-0.34,0.883-0.187c0.244,0.105,0.316,0.442,0.099,0.594 c-0.192,0.133-0.41,0.229-0.597,0.329C545.202,320.828,545.013,320.774,544.958,320.654 M546.03,324.537 c-0.164-0.141-0.131-0.487,0.022-0.654c0.231-0.246,0.545-0.287,0.893-0.11c0.209,0.101,0.297,0.463,0.12,0.626 c-0.168,0.153-0.387,0.26-0.558,0.37C546.314,324.68,546.142,324.643,546.03,324.537 M547.333,342.582 c-0.192,0.08-0.315,0.018-0.405-0.168c-0.187-0.39-0.094-0.664,0.297-0.717c0.133-0.016,0.334,0.058,0.417,0.161 C547.86,342.141,547.716,342.446,547.333,342.582 M551.856,257.552c-0.307,0.07-0.604-0.271-0.559-0.629 c0.046-0.357,0.353-0.624,0.702-0.523c0.196,0.061,0.35,0.282,0.482,0.396C552.457,257.189,552.188,257.477,551.856,257.552 M553.199,245.376c-0.297,0.195-0.694,0.031-0.782-0.418c0.07-0.126,0.148-0.353,0.297-0.516c0.174-0.19,0.423-0.214,0.648-0.063 C553.705,244.601,553.621,245.094,553.199,245.376 M601.48,340.646c-0.058,0.042-0.16,0.047-0.231,0.027 c-0.147-0.043-0.312-0.08-0.427-0.169c-0.144-0.115,0.144-0.439,0.412-0.468c0.078,0.006,0.176-0.015,0.229,0.023 c0.115,0.085,0.259,0.19,0.285,0.31C601.762,340.44,601.588,340.57,601.48,340.646 M624.973,305.863 c0.502-0.115,1.07-0.212,1.618-0.378c0.476-0.146,0.924-0.382,1.396-0.54c0.551-0.187,1.109-0.354,1.672-0.47 c0.568-0.121,0.994,0.05,1.197,0.59c0.186,0.496,0.559,0.813,0.837,1.215c0.257,0.362,0.276,0.779,0.102,1.188 c-0.059,0.141-0.188,0.259-0.305,0.366c-0.053,0.051-0.15,0.081-0.227,0.076c-0.864-0.065-1.64,0.211-2.381,0.608 c-0.753,0.404-1.563,0.559-2.399,0.627c-0.357,0.026-0.79-0.073-0.881-0.351c-0.264-0.773-1.166-0.568-1.553-1.121 C624.175,307.013,624.497,306.443,624.973,305.863 M614.458,288.228c0.757-0.359,1.461-0.792,2.172-1.229 c0.863-0.533,1.864-0.727,2.854-0.923c0.76-0.148,1.228,0.101,1.603,0.865c0.073,0.147,0.11,0.314,0.153,0.475 c0.078,0.267,0.008,0.554-0.209,0.664c-1.79,0.908-3.581,1.826-5.769,1.769c-0.07-0.003-0.241-0.009-0.407-0.018 c-0.425-0.026-0.838-0.402-0.857-0.765C613.978,288.688,614.169,288.366,614.458,288.228 M612.965,303.917 c0.112-0.207,0.245-0.468,0.439-0.549c1.403-0.588,2.869-0.92,4.394-0.897c0.578,0.008,1.159,0.108,1.735,0.178 c0.05,0.006,0.117,0.117,0.12,0.185c0.01,0.153,0.03,0.334-0.032,0.46c-0.068,0.137-0.209,0.287-0.347,0.327 c-1.208,0.342-2.415,0.675-3.629,0.976c-0.32,0.081-0.665,0.053-0.913,0.07c-0.501-0.091-0.913-0.161-1.325-0.238 C613.153,304.379,612.876,304.08,612.965,303.917 M612.919,300.396c-0.364-0.154-0.674-0.483-0.945-0.79 c-0.156-0.176-0.146-0.447,0.024-0.679c0.519-0.709,1.59-1.132,2.42-0.881c0.554,0.169,1.106,0.389,1.604,0.68 c0.261,0.15,0.452,0.478,0.591,0.765c0.249,0.516-0.003,1.03-0.528,1.182c-0.239,0.065-0.48,0.126-0.689,0.181 C614.517,300.854,613.692,300.714,612.919,300.396 M614.232,292.117c0.875-0.24,1.753-0.473,2.631-0.688 c0.267-0.065,0.704,0.176,0.829,0.428c0.182,0.372,0.383,0.739,0.509,1.131c0.065,0.217,0.065,0.523-0.043,0.71 c-0.492,0.857-1.019,1.697-1.579,2.515c-0.118,0.171-0.421,0.217-0.71,0.352c-0.266-0.15-0.643-0.241-0.812-0.473 c-0.674-0.95-1.151-2.002-1.306-3.173C613.716,292.661,613.988,292.181,614.232,292.117 M611.795,296.429 c0.156,0.055,0.314,0.115,0.457,0.2c0.45,0.272,0.604,0.654,0.426,1.031c-0.128,0.271-0.452,0.423-0.835,0.367 c-0.329-0.046-0.659-0.105-0.986-0.168c-0.998-0.196-1.985-0.159-2.989,0.022c-1.232,0.224-2.478,0.382-3.72,0.548 c-0.238,0.035-0.5-0.005-0.729-0.075c-0.134-0.04-0.287-0.196-0.327-0.327c-0.201-0.664-0.061-1.331,0.06-1.984 c0.044-0.219,0.217-0.471,0.406-0.596c0.479-0.321,0.998-0.578,1.631-0.94c1.422,1.368,1.484,1.408,2.882,1.753 c0.732,0.178,1.278-0.299,1.253-1.119c-0.013-0.412-0.083-0.83-0.083-1.242c-0.003-0.151,0.086-0.329,0.191-0.438 c0.104-0.105,0.329-0.236,0.422-0.189c0.606,0.3,1.14,0.697,1.274,1.422c0.062,0.326,0.031,0.669,0.076,0.996 C611.257,296.036,611.449,296.297,611.795,296.429 M611.345,306.55c-0.027,0.099-0.078,0.184-0.144,0.254 c-0.128,0.146-0.316,0.236-0.505,0.251c-0.096,0.005-0.191-0.01-0.281-0.048c-0.169-0.067-0.285-0.433-0.199-0.621 c0.171-0.387,0.623-0.513,0.971-0.241C611.285,306.221,611.295,306.411,611.345,306.55 M602.921,292.902 c-0.11-0.256,0.005-0.75,0.213-0.915c0.066-0.051,0.129-0.106,0.196-0.156c0.846-0.596,1.884-0.558,2.623-0.985 c0.324,0.221,0.521,0.278,0.576,0.402c0.131,0.297,0.236,0.618,0.276,0.94c0.046,0.337-0.087,0.656-0.356,0.885 c-0.511,0.448-1.095,0.739-1.769,0.854C603.852,294.069,603.284,293.747,602.921,292.902 M610.707,288.296 c0.179,0.125,0.284,0.349,0.431,0.533c-0.097,0.264-0.156,0.497-0.263,0.704c-0.11,0.217-0.417,0.276-0.633,0.15 c-0.136-0.081-0.272-0.174-0.385-0.286c-0.212-0.212-0.217-0.68-0.03-0.886C610.01,288.306,610.498,288.149,610.707,288.296 M602.874,284.519c0.105-0.332,0.448-0.513,0.784-0.543c0.412-0.038,0.838-0.025,1.25,0.02c0.745,0.091,1.479,0.265,2.226,0.317 c0.888,0.064,1.577,0.508,2.248,1.011c0.418,0.312,0.453,1.252,0.058,1.592c-0.249,0.217-0.518,0.425-0.812,0.576 c-1.296,0.679-2.676,0.93-3.878,0.77c-0.752-0.036-1.253-0.051-1.75-0.081c-0.224-0.015-0.624-0.485-0.629-0.719 C602.355,286.45,602.572,285.469,602.874,284.519 M601.05,305.969c0.948,0.519,1.937,0.393,2.938,0.278 c0.324-0.037,0.681-0.062,0.98,0.039c0.171,0.058,0.264,0.376,0.367,0.593c0.028,0.055-0.005,0.181-0.056,0.236 c-0.519,0.589-0.578,1.357-0.865,2.152c-0.674,0.337-1.187,0.622-1.72,0.853c-1.528,0.666-2.935,0.397-4.215-0.621 c-0.11-0.091-0.214-0.296-0.19-0.417c0.101-0.508,0.038-0.966-0.149-1.44c-0.135-0.346,0.079-0.682,0.38-0.846 c0.584-0.314,1.188-0.591,1.804-0.832C600.538,305.878,600.86,305.868,601.05,305.969 M597.711,304.273 c-0.185-0.176-0.386-0.312-0.496-0.495c-0.047-0.086,0.048-0.312,0.144-0.412c0.344-0.357,0.744-0.327,1.039,0.053 c0.12,0.158,0.12,0.331-0.033,0.45C598.178,304.013,597.965,304.118,597.711,304.273 M558.598,202.15 c-0.616,0.279-1.291,0.048-1.638-0.613c-0.055-0.103,0.051-0.299,0.108-0.442c0.028-0.068,0.115-0.11,0.176-0.169 c0.614-0.05,1.102,0.222,1.539,0.608C558.917,201.653,558.793,202.063,558.598,202.15 M567.758,255.592 c-0.146,0.34-0.545,0.541-0.79,0.348c-0.163-0.134-0.261-0.35-0.359-0.485c0.132-0.382,0.536-0.559,0.843-0.428 C567.713,255.137,567.849,255.381,567.758,255.592 M569.262,251.189c-0.133,0.17-0.329,0.357-0.525,0.397 c-0.221,0.04-0.649-0.488-0.556-0.674c0.088-0.172,0.342-0.252,0.49-0.353c0.204,0.09,0.383,0.123,0.478,0.229 C569.238,250.885,569.318,251.123,569.262,251.189 M573.779,274.704c-0.169-0.033-0.372-0.391-0.289-0.566 c0.103-0.217,0.252-0.372,0.533-0.352c0.286,0.024,0.455,0.179,0.419,0.417C574.411,274.521,574.071,274.762,573.779,274.704 M578.695,277.261c-0.166,0.559-0.402,1.095-0.619,1.638c-0.135,0.334-0.553,0.681-0.727,0.586c-0.205-0.11-0.41-0.265-0.556-0.448 c-0.155-0.186-0.195-0.473-0.362-0.643c-0.53-0.554-0.588-1.138-0.294-1.832c0.189-0.455,0.27-0.955,0.408-1.431 c0.195-0.656,0.545-1.201,1.116-1.611c0.329-0.234,0.922-0.083,1.028,0.321c0.148,0.559,0.254,1.127,0.388,1.733 C578.955,276.135,578.864,276.708,578.695,277.261 M582.804,285.253c-0.44,0.433-0.619,0.976-0.814,1.528 c-0.164,0.468-0.659,0.523-0.953,0.139c-0.051-0.063-0.113-0.128-0.151-0.198c-0.566-1.054-0.749-2.197-0.757-3.37 c-0.002-0.342,0.299-0.586,0.623-0.717c0.604-0.249,1.711,0.148,1.947,0.712c0.152,0.383,0.241,0.795,0.352,1.172 C582.965,284.796,582.958,285.1,582.804,285.253 M583.986,292.998c-0.08,0.247-0.227,0.412-0.516,0.391 c-0.279-0.023-0.485-0.265-0.352-0.477c0.11-0.175,0.289-0.312,0.393-0.417C583.885,292.536,584.061,292.767,583.986,292.998 M582.112,200.793h-28.27v-23.414h28.494c7.091,0,9.533,2.106,10.752,3.57l0.268,0.388c2.124,2.255,2.879,5.623,2.879,7.986 c0,2.283-0.853,5.799-2.638,7.967c-0.629,0.733-1.828,1.483-3.065,2.183C588.593,200.307,585.542,200.793,582.112,200.793 M587.626,296.581c-0.205-0.083-0.344-0.433-0.201-0.591c0.151-0.166,0.35-0.292,0.592-0.48c0.173,0.199,0.409,0.345,0.438,0.526 C588.514,296.418,587.997,296.729,587.626,296.581 M589.563,286.709c-0.324,0.254-0.681,0.561-1.063,0.636 c-0.873,0.167-1.504,0.689-2.162,1.205c-0.292,0.229-0.667,0.128-0.853-0.169c-0.436-0.693-0.443-1.418-0.189-2.162 c0.116-0.35,0.728-0.639,1.034-0.388c0.739,0.599,1.431,0.347,2.069-0.065c0.556-0.356,1.016-0.859,1.528-1.29 c0.579-0.48,1.188-0.893,1.909-1.182c1.019-0.405,1.947-0.433,2.821,0.289c0.857,0.705,1.844,1.132,2.922,1.368 c0.105,0.025,0.227,0.249,0.231,0.382c0.003,0.141-0.095,0.382-0.196,0.413c-1.021,0.276-1.775,0.89-2.371,1.745 c-0.135,0.196-0.371,0.327-0.57,0.478c-0.332,0.252-0.938,0.042-1.006-0.347c-0.027-0.166-0.045-0.332-0.056-0.499 c-0.024-0.331-0.042-0.663-0.077-1.231c-0.994-0.136-1.804-0.252-2.629-0.367C590.439,285.941,590.021,286.35,589.563,286.709 M590.929,295.404c0.181-0.144,0.402-0.249,0.618-0.329c0.204-0.075,0.466,0.161,0.506,0.523c-0.066,0.117-0.131,0.377-0.3,0.487 c-0.173,0.115-0.455,0.146-0.663,0.101C590.786,296.111,590.69,295.599,590.929,295.404 M593.921,302.766 c-0.488-0.523-0.931-1.021-1.398-1.494c-0.551-0.553-0.822-1.24-1.044-1.972c-0.133-0.438-0.075-0.824,0.159-1.191 c0.596-0.921,1.303-1.743,2.11-2.48c0.716-0.658,1.208-0.608,1.872,0.146c0.552,0.629,1.039,1.303,1.444,2.037 c0.278,0.511,0.57,1.019,0.813,1.449c0.49,0.161,0.89,0.267,1.267,0.43c0.111,0.048,0.206,0.27,0.201,0.41 c-0.007,0.143-0.118,0.312-0.231,0.412c-0.115,0.105-0.296,0.222-0.435,0.207c-0.888-0.097-1.637,0.245-2.35,0.698 c-0.494,0.313-0.967,0.661-1.471,0.958C594.578,302.538,594.25,302.629,593.921,302.766 M594.827,307.334 c-0.36,0.073-0.734-0.259-0.588-0.543c0.095-0.184,0.324-0.294,0.437-0.385c0.35-0.005,0.614,0.207,0.589,0.412 C595.232,307.075,595.106,307.281,594.827,307.334 M603.042,330.379c-0.438,0.485-0.947,0.902-1.448,1.325 c-0.241,0.204-0.719,0.19-0.93,0.01c-0.378-0.316-0.75-0.644-1.117-0.976c-0.475-0.427-0.503-1.089-0.033-1.523 c0.546-0.504,1.117-0.983,1.695-1.449c0.343-0.269,1.014-0.15,1.376,0.177c0.455,0.407,0.687,0.915,0.762,1.683 C603.289,329.788,603.246,330.157,603.042,330.379 M601.85,324.934c0.065-0.401,0.566-0.678,0.943-0.487 c0.122,0.065,0.173,0.262,0.256,0.397c-0.04,0.161-0.138,0.302-0.264,0.405c-0.126,0.105-0.287,0.173-0.445,0.181 C602.122,325.439,601.82,325.136,601.85,324.934 M604.601,318.031c-0.136,0.476-0.345,0.928-0.556,1.376 c-0.065,0.136-0.219,0.281-0.364,0.322c-1.437,0.392-2.859,0.85-4.472,1.04c-0.211-0.1-0.57-0.181-0.779-0.401 c-0.337-0.353-0.672-0.765-0.835-1.213c-0.345-0.936-0.583-1.905-0.848-2.866c-0.043-0.153-0.018-0.332,0.006-0.493 c0.049-0.409,0.256-0.854,0.152-1.212c-0.349-1.207-0.186-2.495-0.656-3.677c-0.088-0.221-0.105-0.485-0.09-0.729 c0.007-0.146,0.105-0.338,0.224-0.413c0.116-0.075,0.361-0.095,0.458-0.02c0.256,0.19,0.567,0.417,0.661,0.691 c0.231,0.706,0.329,1.456,0.527,2.181c0.194,0.719,0.397,1.44,0.682,2.132c0.308,0.749,0.974,1.298,1.733,1.217 c1.231-0.13,2.24,0.528,3.382,0.67C604.333,316.701,604.752,317.496,604.601,318.031 M609.166,335.898 c-0.265-0.191-0.565-0.402-0.707-0.682c-0.514-0.978-0.674-2.047-0.522-3.136c0.093-0.669,0.874-1.087,1.554-0.88 c0.31,0.1,0.644,0.231,0.88,0.442c0.795,0.714,0.969,1.705,1.097,2.703c-0.088,0.138-0.146,0.35-0.27,0.405 c-0.626,0.262-1.031,0.805-1.571,1.167C609.519,335.994,609.271,335.977,609.166,335.898 M611.532,340.998 c-0.121,0.07-0.239,0.201-0.362,0.204c-0.107,0.002-0.219-0.139-0.33-0.212c0.116-0.075,0.231-0.205,0.348-0.205 c0.058,0.002,0.115,0.037,0.174,0.077C611.416,340.905,611.473,340.958,611.532,340.998 M615.281,339.746 c-0.179-0.035-0.259-0.056-0.342-0.065c-0.606-0.121-0.878-0.833-0.511-1.358c0.214-0.307,0.767-0.508,1.099-0.404 c0.403,0.128,0.75,0.334,0.999,0.691c0.171,0.241,0.08,0.691-0.167,0.88C616,339.766,615.597,339.766,615.281,339.746 M617.182,343.658c-0.093,0.217-0.196,0.428-0.49,0.37c-0.262-0.053-0.453-0.289-0.345-0.49c0.093-0.163,0.294-0.271,0.392-0.357 C617.109,343.221,617.277,343.438,617.182,343.658 M619.979,324.97c-0.074,0.045-0.132,0.105-0.204,0.148 c-1.207,0.701-2.005,1.763-2.583,2.999c-0.49,1.052-1.111,2.065-1.099,3.295c0.005,0.264-0.629,0.463-0.843,0.272 c-0.307-0.277-0.641-0.549-0.87-0.883c-0.853-1.253-1.523-2.608-2.062-4.017c-0.485-1.263-1.003-2.465-1.912-3.506 c-0.669-0.759-0.504-1.75,0.225-2.483c0.817-0.818,1.745-0.94,2.756-0.443c0.196,0.096,0.377,0.342,0.443,0.554 c0.064,0.226-0.018,0.497-0.049,0.883c0.025,0.113,0.043,0.369,0.146,0.586c0.05,0.11,0.267,0.21,0.395,0.195 c0.133-0.013,0.35-0.176,0.35-0.271c0-0.321-0.056-0.653-0.138-0.971c-0.062-0.236-0.24-0.438-0.3-0.674 c-0.065-0.249,0.024-0.493,0.241-0.661c0.204-0.159,0.428-0.305,0.682-0.173c1.255,0.643,2.633,1.086,3.511,2.338 c0.269,0.385,0.767,0.629,1.187,0.895C620.898,323.72,621.319,324.181,619.979,324.97 M625.204,316.973 c-0.626,0.704-1.234,0.75-1.931,0.256c-0.797-0.557-1.233-1.292-1.351-2.237c-0.046-0.37,0.42-0.829,0.767-0.765 c1.328,0.252,2.208,1.011,2.623,2.299c0.022,0.075,0.015,0.166,0.02,0.246C625.29,316.837,625.254,316.912,625.204,316.973 M624.13,310.993c-0.511-0.136-0.948-0.075-1.441,0.15c-1.207,0.559-2.451,1.019-3.674,1.542c-0.07,0.032-0.124,0.35-0.058,0.425 c0.375,0.44,0.79,0.846,1.185,1.27c0.11,0.121,0.208,0.265,0.281,0.41c0.118,0.227,0.158,0.465,0.005,0.696 c-0.131,0.199-0.462,0.3-0.672,0.199c-0.223-0.108-0.452-0.211-0.666-0.34c-0.286-0.173-0.556-0.374-0.84-0.551 c-0.42-0.261-0.671-0.146-1.194,0.639c0.556,0.359,1.117,0.715,1.667,1.082c0.28,0.181,0.561,0.369,0.802,0.594 c0.108,0.098,0.207,0.307,0.182,0.441c-0.188,0.972-0.402,1.942-0.641,2.902c-0.025,0.096-0.327,0.227-0.418,0.182 c-1.921-0.993-3.863-1.962-5.518-3.391c-0.118-0.1-0.158-0.283-0.284-0.523c0.282-0.441,0.579-0.94,0.911-1.413 c0.433-0.607,0.893-1.196,1.338-1.8c0.04-0.061,0.058-0.211,0.024-0.236c-0.12-0.096-0.267-0.196-0.412-0.216 c-0.155-0.028-0.35-0.016-0.485,0.058c-0.591,0.313-1.162,0.653-1.632,0.923c-0.413,0.553-0.241,1.081-0.32,1.566 c-0.138,0.897-0.663,1.507-1.442,1.926c-0.249,0.134-0.76-0.009-0.881-0.264c-0.072-0.146-0.165-0.299-0.178-0.458 c-0.054-0.561-0.383-0.905-0.84-1.166c-0.436-0.247-0.87-0.498-1.313-0.734c-0.535-0.29-1.099-0.4-1.694-0.222 c-1.139,0.345-2.293,0.423-3.468,0.236c-0.186-0.03-0.399-0.342-0.388-0.573c0.023-0.342,0.116-0.658,0.433-0.851 c0.284-0.173,0.584-0.326,0.878-0.475c0.45-0.224,0.928-0.399,1.35-0.667c0.348-0.216,0.68-0.497,0.94-0.81 c0.876-1.061,1.446-2.237,1.376-3.669c-0.058-1.099,0.108-2.17,0.626-3.166c0.134-0.256,0.559-0.416,0.86-0.316 c0.348,0.123,0.606,0.455,0.503,0.762c-0.38,1.145-0.321,2.307-0.168,3.471c0.08,0.621,0.354,0.837,1.023,0.872 c0.762,0.04,1.478-0.07,2.192-0.402c1.358-0.634,2.733-1.237,4.047-1.967c0.651-0.364,1.334-0.663,2.102-0.794 c0.646-0.111,1.245-0.473,1.879-0.679c0.31-0.105,0.646-0.137,0.973-0.172c0.307-0.035,0.651,0.345,0.606,0.645 c-0.028,0.161-0.053,0.327-0.083,0.492c-0.078,0.476-0.723,0.86-0.397,1.349c0.254,0.382,0.774,0.588,1.164,0.885 c0.945,0.714,1.972,1.262,3.151,1.453c0.671,0.111,1.294,0.325,1.894,0.634c0.296,0.151,0.599,0.308,0.915,0.402 c0.457,0.142,1.073-0.091,1.348,0.458c0.264,0.538,0.169,1.142,0.054,1.717c-0.019,0.079-0.081,0.149-0.112,0.225 c-0.064,0.161-0.515,0.297-0.658,0.19c-0.269-0.19-0.576-0.352-0.774-0.603C627.132,312.019,625.691,311.408,624.13,310.993 M629.172,319.814c-0.079-0.085-0.212-0.171-0.27-0.254c-0.02-0.025-0.03-0.053-0.028-0.078c0.056-0.604-0.112-1.121-0.406-1.64 c-0.207-0.367-0.189-0.789-0.088-1.202c0.075-0.299,0.55-0.53,0.792-0.372c0.133,0.086,0.329,0.146,0.397,0.271 c0.336,0.653,0.907,0.9,1.583,1.051c0.479,0.111,0.619,0.614,0.303,0.909c-0.543,0.505-1.062,1.051-1.801,1.27 C629.501,319.814,629.333,319.799,629.172,319.814 M632.76,337.061c-0.016,0.08-0.267,0.171-0.393,0.15 c-0.148-0.02-0.307-0.136-0.404-0.252c-0.48-0.578-1.011-1.075-1.711-1.388c-0.21-0.096-0.361-0.321-0.532-0.498 c-0.201-0.211-0.144-0.744,0.093-0.87c0.287-0.153,0.571-0.347,0.881-0.417c0.481-0.101,0.98-0.116,1.501-0.167 c0.216,0.009,0.462,0.021,0.709,0.031c0.176,0.01,0.435,0.347,0.402,0.527C633.13,335.139,632.963,336.104,632.76,337.061 M644.466,335.153c0.09-0.269,0.661-0.349,0.854-0.14c0.581,0.618,1.06,1.268,0.75,2.414c0.027,0.181,0.1,0.573,0.112,0.971 c0,0.09-0.208,0.238-0.342,0.271c-0.141,0.035-0.415,0.015-0.447-0.061c-0.271-0.597-0.687-1.082-1.083-1.584 c-0.134-0.172-0.189-0.468-0.159-0.689C644.209,335.934,644.34,335.541,644.466,335.153 M638.345,321.899 c0.27,0.038,0.539,0.304,0.436,0.476c-0.116,0.188-0.338,0.316-0.578,0.532c-0.161-0.243-0.34-0.412-0.389-0.608 C637.77,322.093,638.114,321.866,638.345,321.899 M635.599,333.107c0.204-0.045,0.436,0.03,0.793,0.065 c-0.199,0.307-0.282,0.53-0.445,0.661c-0.219,0.178-0.511,0.067-0.621-0.174C635.217,333.419,635.31,333.17,635.599,333.107 M633.326,311.815c0.043,0,0.084,0.005,0.116,0.022c0.211,0.125,0.488,0.224,0.599,0.418c0.47,0.8,0.746,1.67,0.769,2.605 c0.009,0.291-0.342,0.674-0.636,0.668c-0.518,0-1-0.12-1.303-0.586c-0.596-0.928-0.603-1.888-0.06-2.839 c0.035-0.063,0.1-0.11,0.168-0.159c0.073-0.042,0.151-0.082,0.214-0.13C633.236,311.82,633.281,311.815,633.326,311.815"/> <path d="M996.517,328.956l-2.529-6.521c-0.118,0.065-0.264,0.116-0.342,0.163c-0.415,0-0.772-0.369-0.709-0.628 c0.103-0.405,0.251-0.776,0.427-1.134l-6.767-17.43c-0.065,0.018-0.123,0.048-0.188,0.059c-0.07,0.01-0.166-0.021-0.236-0.062 c-1.678-0.968-3.043-2.245-3.953-3.978c-0.038-0.076-0.045-0.161-0.073-0.236c-0.061-0.169,0.156-0.488,0.37-0.624 c0.075-0.046,0.146-0.072,0.206-0.065c0.077,0.025,0.158,0.04,0.236,0.061c0.08,0.018,0.153,0.045,0.209,0.091 c0.19,0.153,0.364,0.341,0.497,0.548c0.566,0.868,1.228,1.617,2.131,2.138l-24.099-62.047 c20.646-10.346,29.978-31.841,29.978-49.93c0-13.777-5.2-27.645-14.273-37.91c-7.576-8.571-21.463-18.868-44.598-18.868h-76.589 v26.264c0,0.073,0.347,0.173,0.428,0.312c0.273,0.487,0.465,1.022,0.691,1.533c-0.169,0.257-0.277,0.484-0.448,0.639 c-0.091,0.079-0.327,0.099-0.435,0.032c-0.091-0.059-0.236-0.13-0.236-0.197v159.354c1.016,0.043,2.466,0.091,3.704,0.121 c0.669,0.01,1.338,0.027,1.999-0.051c0.852-0.096,1.642-0.113,2.381,0.452c0.239,0.184,0.632,0.192,0.959,0.241 c0.545,0.092,0.895,0.393,1.133,0.881c0.144,0.297,0.298,0.608,0.517,0.85c0.48,0.544,1.119,0.775,1.814,0.599 c0.645-0.166,1.268-0.427,1.879-0.693c0.48-0.209,0.963-0.252,1.471-0.222c1.245,0.071,2.495,0.123,3.86,0.187 c0.768,0.764,1.539,1.619,1.716,2.863c0.058,0.418,0.283,0.793,0.648,1.039c0.115,0.08,0.31,0.108,0.449,0.075 c0.154-0.03,0.313-0.136,0.429-0.246c0.588-0.594,1.154-1.215,1.752-1.801c0.48-0.458,0.98-0.902,1.507-1.313 c0.267-0.201,0.661-0.307,0.931-0.053c0.661,0.616,1.45,0.779,2.306,0.803c0.669,0.015,1.335,0.045,1.938,0.069 c0.571,0.6,1.234,0.991,1.389,1.821c0.055,0.297,0.316,0.583,0.548,0.81c0.832,0.825,1.635,1.675,2.304,2.646 c0.387,0.563,0.91,0.978,1.496,1.313c0.12,0.07,0.377,0.085,0.46,0.01c0.725-0.696,1.453-1.393,2.112-2.147 c0.259-0.297,0.438-0.729,0.508-1.124c0.286-1.652,0.509-3.292,0.073-4.977c-0.313-1.207-0.498-2.454-0.445-3.725 c0.024-0.575-0.128-1.159-0.229-1.731c-0.115-0.659-0.261-1.309-0.394-1.962c-0.207-1.003-0.134-1.984,0.138-2.978 c0.216-0.803,0.342-1.635,0.443-2.465c0.125-1.065,0.61-1.886,1.433-2.552c0.493-0.4,1.089-0.46,1.515,0.144 c0.236,0.342,0.401,0.734,0.58,1.116c0.187,0.402,0.176,0.825-0.048,1.202c-0.428,0.719-0.9,1.41-1.322,2.132 c-0.257,0.44-0.408,0.926-0.32,1.446c0.188,1.095,0.038,2.155-0.157,3.241c-0.225,1.235-0.297,2.499,0.241,3.697 c0.047,0.113,0.264,0.166,0.415,0.219c0.024,0.007,0.12-0.101,0.143-0.168c0.081-0.234,0.188-0.472,0.199-0.71 c0.02-0.415-0.065-0.84-0.03-1.252c0.037-0.407,0.121-0.83,0.273-1.208c0.124-0.294,0.348-0.593,0.611-0.769 c0.557-0.362,1.152-0.68,1.763-0.949c0.375-0.168,0.969-0.312,1.366-0.291c0.764,0.037,1.393-0.01,2.411-0.131v-69.39h4.916 l12.229,31.239c0.666-0.618,1.3-1.229,1.936-1.886c0.108-0.11,0.289-0.17,0.442-0.186c0.149-0.016,0.314,0.061,0.458,0.128 c0.179,0.083,0.231,0.254,0.151,0.44c-0.196,0.452-0.365,0.931-0.614,1.36c-0.331,0.575-0.751,1.097-1.081,1.672 c-0.15,0.264-0.276,0.544-0.404,0.822l3.641,9.277c0.26-0.126,0.554-0.169,0.843-0.084c1.611,0.466,3.163,1.087,4.616,1.932 c0.521,0.305,0.574,0.581,0.285,1.256c-0.097,0.23-0.227,0.446-0.277,0.688c-0.025,0.14,0.033,0.362,0.136,0.45 c0.312,0.269,0.691,0.465,0.996,0.744c0.307,0.279,0.648,0.586,0.797,0.953c0.382,0.92,1.117,1.418,1.906,1.911 c0.423,0.261,0.82,0.599,1.151,0.965c0.271,0.298,0.436,0.699,0.621,1.011c0.393,0.274,0.675-0.018,0.981-0.085 c0.719-0.171,1.303,0.161,1.855,0.538c0.116,0.075,0.191,0.295,0.189,0.443c-0.011,0.331-0.056,0.663-0.129,0.985 c-0.216,0.905,0.01,1.652,0.76,2.223c0.532,0.408,1.076,0.802,1.604,1.215c0.528,0.415,0.991,0.888,1.323,1.491 c0.473,0.855,0.843,1.348-0.193,2.454c-0.169,0.181-0.327,0.385-0.433,0.608c-0.063,0.136-0.063,0.343-0.003,0.478 c0.39,0.921,1.18,1.373,2.064,1.685c0.118,0.044,0.36-0.04,0.442-0.143c1.012-1.229,2.01-2.472,2.99-3.724 c0.314-0.403,0.452-0.878,0.482-1.404c0.033-0.578,0.096-1.172,0.25-1.727c0.419-1.512,1.277-2.696,2.675-3.488 c0.948-0.533,1.846-1.144,2.77-1.725c0.561-0.353,0.603-0.659,0.165-1.213c-0.515-0.663-1.056-1.305-1.563-1.971 c-0.362-0.474-0.337-1.122,0.025-1.64c0.482-0.689,0.958-1.378,1.466-2.042c0.201-0.262,0.478-0.464,0.736-0.68 c0.219-0.181,0.719-0.195,0.943-0.015c0.905,0.742,1.803,1.493,2.703,2.243c0.38,0.316,0.699,0.734,1.29,0.754 c0.465-0.447,0.923-0.935,1.434-1.367c0.402-0.338,0.902-0.438,1.418-0.277c0.48,0.146,0.948,0.33,1.415,0.503 c0.357,0.132,0.485,0.508,0.275,0.792c-0.199,0.27-0.405,0.53-0.611,0.79c-0.259,0.329-0.534,0.651-0.782,0.983 c-0.571,0.764-0.563,1.111,0.01,1.766c0.058,0.06,0.116,0.12,0.168,0.186c1.012,1.313,2.369,2.058,3.929,2.544 c1.358,0.429,2.658,1.021,3.995,1.497c0.832,0.297,1.183,2.155,0.37,2.819c-0.519,0.417-1.026,0.845-1.539,1.271 c-0.018,0.938,0.644,1.563,0.903,2.332c0.077,0.233,0.138,0.47,0.188,0.712c0.01,0.064-0.033,0.171-0.083,0.216 c-0.44,0.423-0.991,0.623-1.582,0.666c-0.224,0.018-0.497-0.105-0.687-0.248c-0.933-0.715-1.817-1.479-2.585-2.38 c-0.868-1.021-1.775-2.007-2.676-3.022c-1.68-0.362-3.16-1.113-4.516-2.128c-0.317-0.238-0.662-0.479-1.089-0.484 c0.005,0.016,0.015,0.027,0,0.058c0.216,0.327,0.425,0.654,0.414,1.066c-0.022,1.061-0.573,1.683-1.849,1.989 c-0.175,0.042-0.45-0.154-0.623-0.307c-0.086-0.079-0.113-0.322-0.06-0.453c0.341-0.878,0.942-1.542,1.749-2.02 c0.131-0.08,0.247-0.181,0.362-0.282c-0.012-0.019-0.024-0.04-0.035-0.058c0.011,0,0.021,0.006,0.03,0.006 c-0.168-0.38-0.399-0.702-0.68-0.979c-0.128-0.131-0.268-0.246-0.417-0.361c-0.015-0.011-0.027-0.026-0.04-0.039 c-0.163-0.122-0.334-0.238-0.51-0.347c-0.102-0.063-0.378-0.022-0.448,0.068c-1.151,1.469-2.085,3.037-2.178,4.974 c-0.035,0.694,0.051,1.333,0.516,1.881c0.161,0.191,0.282,0.418,0.405,0.634c0.144,0.252,0.063,0.694-0.161,0.926 c-0.058,0.055-0.131,0.105-0.203,0.146c-0.584,0.317-0.768,0.795-0.742,1.459c0.021,0.482-0.377,0.681-0.886,0.527 c-0.319-0.095-0.623-0.231-0.922-0.342c-1.764,1.066-1.963,1.192-2.475,2.651c-0.408,1.148-1.024,2.096-2.005,2.811 c-0.47,0.347-0.548,0.811-0.407,1.336c0.153,0.563,0.314,1.124,0.473,1.677c0.476,0.513,1.001,0.896,1.723,0.95 c0.832,0.061,1.656,0.182,2.484,0.528c0,0.342-0.043,0.675,0.01,0.986c0.096,0.572,0.199,1.113,0.855,1.413 c0.521,0.233,0.963,0.653,1.41,1.026c0.089,0.075,0.102,0.321,0.059,0.457c-0.045,0.142-0.182,0.332-0.308,0.357 c-0.316,0.064-0.651,0.056-0.978,0.064c-0.397,0.021-0.694,0.228-0.755,0.523c-0.155,0.734-0.297,1.474-0.46,2.21 c-0.121,0.529-0.457,0.87-0.956,1.082c-0.46,0.196-0.928,0.385-1.345,0.648c-0.37,0.234-0.536,0.637-0.468,1.089 c0.035,0.247,0.073,0.506,0.171,0.732c0.776,1.758,1.416,3.588,2.724,5.059c0.11,0.129,0.203,0.265,0.312,0.397 c0.461,0.559,0.556,1.212,0.417,1.895c-0.226,1.156-0.522,2.287-1.36,3.259c0.166,0.291,0.3,0.388,0.501,0.636 c0.963,1.174,1.938,2.275,2.91,3.292c0.389,0.412,3.438,0,3.973,0h10.094h12.725c2.424,0,7.667,1.092,7.144-2.565 c-0.035-0.246-0.098-0.511-0.188-0.802c-1.255-0.068-2.364,0.269-3.513-0.35c-0.126-0.07-0.271-0.256-0.267-0.377 c0.013-0.227,0.103-0.468,0.219-0.669c0.077-0.131,0.238-0.249,0.39-0.297c1.791-0.608,2.115-2.213,2.53-3.742 c0.047-0.176-0.137-0.458-0.282-0.629c-0.056-0.067-0.327,0-0.468,0.071c-0.299,0.141-0.576,0.331-0.868,0.495 c-0.361,0.203-0.729,0.405-1.099,0.596c-0.599,0.302-1.166-0.096-1.159-0.81c0.002-0.246-0.02-0.523,0.076-0.739 c0.407-0.915,0.859-1.811,1.281-2.716c0.496-1.065,1.17-1.841,2.503-1.609c0.051,0.013,0.153-0.085,0.182-0.156 c0.026-0.065,0.018-0.187-0.031-0.236c-0.45-0.493-0.945-0.94-1.347-1.468c-0.185-0.242-0.3-0.649-0.242-0.94 c0.267-1.394,0.634-2.767,1.215-4.069c0.269-0.606,1.048-0.9,1.699-0.664c0.079,0.03,0.182,0.03,0.234,0.081 c0.674,0.729,1.549,0.899,2.489,0.975c0.495,0.041,0.968,0.263,1.208,0.771c-0.242,1.102-1.711,3.439-1.303,4.495 c0.286,0.739,1.41,0.38,1.677,1.342c0.147,0.532-1.151,2.157-0.993,2.994c0.174,0.916,1.255,1.406,2.041,2.031 c1.213,0.969,2.546,1.454,2.908,2.978c0.281,1.197,0.364,3.516,0.339,4.809c1.994-1.479,1.461-2.605,0.8-4.481 c-0.455-1.292-0.573-2.51-0.988-3.822L996.517,328.956z M862.664,303.871c-0.15,0.046-0.318,0.051-0.548,0.086 c-0.166-0.07-0.448-0.104-0.594-0.267c-0.478-0.533-0.923-1.106-1.177-1.798c-0.067-0.189,0.028-0.313,0.209-0.395 c0.594-0.268,1.152-0.091,1.6,0.261c0.375,0.298,0.639,0.734,0.931,1.127C863.3,303.18,863.051,303.748,862.664,303.871 M865.38,299.227c-0.038,0.307-0.48,0.592-0.739,0.511c-0.156-0.05-0.338-0.07-0.468-0.161c-1.228-0.845-2.546-1.536-3.881-2.195 c-0.407-0.201-0.551-0.53-0.449-1.305c0.077-0.196,0.224-0.669,0.452-1.096c0.239-0.448,0.931-0.59,1.3-0.293 c0.969,0.777,1.959,1.527,2.864,2.369c0.402,0.377,0.654,0.94,0.908,1.454C865.465,298.704,865.413,298.99,865.38,299.227 M900.298,262.043c-0.143,0.05-0.352,0.135-0.44,0.072c-0.42-0.289-0.688-0.711-0.835-1.205c-0.035-0.125,0.038-0.285,0.159-0.422 c0.121-0.136,0.289-0.233,0.438-0.233c0.075,0.025,0.174,0.048,0.26,0.067c0.085,0.025,0.155,0.056,0.173,0.101 c0.168,0.468,0.282,0.951,0.397,1.434C900.462,261.906,900.367,262.017,900.298,262.043 M901.435,279.798 c-0.259,0-0.468-0.203-0.438-0.435c0.051-0.407,0.498-0.854,0.763-0.704c0.168,0.096,0.294,0.377,0.313,0.586 C902.107,279.555,901.772,279.802,901.435,279.798 M944.064,197.313c-0.627,0.731-1.826,1.474-3.068,2.17 c-1.938,0.833-4.986,1.313-8.416,1.313h-27.498v-23.416h27.722c7.094,0,9.533,2.109,10.75,3.57l0.27,0.388 c2.122,2.253,2.879,5.623,2.879,7.981C946.702,191.604,945.847,195.143,944.064,197.313 M968.708,294.069 c-0.278,0.201-0.805,0-0.987-0.378c-0.121-0.248-0.051-0.49,0.135-0.643c0.174-0.144,0.413-0.201,0.592-0.282 c0.188,0.096,0.366,0.131,0.45,0.238C969.123,293.305,969.007,293.858,968.708,294.069 M964.992,316.81 c-0.094,0.139-0.187,0.39-0.368,0.511c-0.221,0.148-0.733-0.216-0.698-0.519c0.024-0.214,0.173-0.473,0.349-0.599 C964.499,316.048,964.951,316.404,964.992,316.81 M964.42,312.486c-0.106,0.231-0.224,0.448-0.539,0.397 c-0.273-0.04-0.49-0.307-0.366-0.513c0.107-0.176,0.319-0.292,0.425-0.385C964.347,312.019,964.528,312.25,964.42,312.486 M957.964,307.674c0.039-0.161,0.079-0.322,0.144-0.473c0.177-0.407,0.471-0.672,0.931-0.702c0.166-0.012,0.332-0.018,0.498,0.008 c1.229,0.166,2.465,0.319,3.689,0.525c0.304,0.054,0.586,0.27,0.864,0.431c0.169,0.096,0.196,0.572,0.043,0.651 c-0.802,0.399-1.595,0.821-2.419,1.171c-0.289,0.126-0.651,0.073-1.164,0.119c-0.559-0.146-1.283-0.314-1.994-0.521 C958.076,308.74,957.844,308.229,957.964,307.674 M962.746,325.749c0.005,0.181-0.209,0.407-0.385,0.538 c-0.231,0.179-0.48,0.046-0.634-0.153c-0.075-0.099-0.108-0.339-0.04-0.417c0.143-0.179,0.361-0.3,0.611-0.485 C962.472,325.42,962.74,325.583,962.746,325.749 M958.712,330.155c0.15-0.408,0.313-0.528,0.729-0.528 c0.279,0,0.453,0.221,0.387,0.49c-0.117,0.466-0.473,0.634-0.942,0.433C958.697,330.472,958.651,330.323,958.712,330.155 M958.511,321.475c-0.051-0.005-0.099-0.043-0.144-0.086c-0.048-0.045-0.091-0.096-0.139-0.136c0.058-0.048,0.108-0.11,0.171-0.139 c0.174-0.077,0.292-0.027,0.354,0.134C958.671,321.328,958.583,321.479,958.511,321.475 M958.943,316.412 c0.123-0.229,0.337-0.327,0.571-0.222c0.101,0.049,0.221,0.287,0.181,0.355c-0.098,0.175-0.278,0.307-0.385,0.412 C958.989,316.908,958.833,316.618,958.943,316.412 M956.763,311.691c0.135-0.543,0.485-0.819,1.009-0.935 c0.313-0.068,0.687,0.179,0.706,0.479c0.012,0.245,0.027,0.486,0.038,0.672c-0.044,0.468-0.035,0.885-0.142,1.272 c-0.055,0.193-0.289,0.415-0.482,0.468c-0.199,0.056-0.528-0.01-0.666-0.153C956.75,312.994,956.595,312.381,956.763,311.691 M958.227,322.771c0.015,0.25-0.236,0.407-0.504,0.37c-0.241-0.038-0.389-0.312-0.28-0.53c0.117-0.236,0.387-0.367,0.574-0.229 C958.128,322.46,958.218,322.636,958.227,322.771 M964.826,344.049c-0.48,0.098-0.981,0.158-1.475,0.141 c-0.196-0.008-0.475-0.219-0.567-0.41c-0.466-0.976-1.119-1.051-2.053-0.645c-0.601,0.258-1.295,0.3-1.948,0.428 c-0.163,0.036-0.335,0.021-0.501,0.031c-0.802,0.05-1.536-0.785-1.629-1.318c-0.028-0.166-0.016-0.34,0.013-0.498 c0.029-0.161,0.064-0.352,0.17-0.462c1.115-1.21,1.567-2.738,2.088-4.24c0.163-0.473,0.332-0.945,0.516-1.413 c0.146-0.375,0.55-0.613,0.998-0.602c0.166,0.008,0.332,0.038,0.495,0.068c0.487,0.096,0.805,0.367,0.848,0.787 c0.093,0.913,0.156,1.828,0.231,2.743c-0.018,0-0.035,0-0.056,0.005c0,0.418,0.061,0.846-0.013,1.247 c-0.179,1.017,0.345,1.539,1.172,1.952c0.662,0.331,1.406,0.533,1.912,1.149C965.286,343.326,965.214,343.971,964.826,344.049 M965.923,338.202c-0.19,0.005-0.427-0.139-0.575-0.282c-0.07-0.064-0.027-0.332,0.048-0.442c0.13-0.179,0.309-0.348,0.505-0.447 c0.272-0.134,0.667,0.115,0.727,0.412C966.703,337.81,966.391,338.191,965.923,338.202 M967.75,335.146 c-0.312-0.118-0.604-0.273-0.908-0.405c-0.389-0.171-0.856-0.407-0.804-0.84c0.075-0.588,0.492-1.041,1.096-1.242 c0.146-0.048,0.335-0.056,0.483-0.015c0.729,0.206,1.277,0.908,1.305,1.63C968.946,334.908,968.343,335.367,967.75,335.146 M971.059,319.794c-0.068,0.102-0.187,0.182-0.316,0.201c-0.066-0.042-0.146-0.075-0.223-0.115 c-0.069-0.038-0.133-0.081-0.163-0.141c-0.093-0.191,0.161-0.556,0.375-0.546c0.131,0.008,0.319,0.133,0.372,0.254 C971.154,319.568,971.131,319.694,971.059,319.794 M973.775,334.605c-0.348,0.463-0.835,0.488-1.335,0.397 c-0.247-0.046-0.426-0.231-0.476-0.503c-0.063-0.322,0.165-0.693,0.47-0.749c0.521-0.096,0.984-0.011,1.333,0.422 c0.053,0.061,0.084,0.142,0.124,0.212C973.851,334.46,973.823,334.54,973.775,334.605 M973.949,314.26 c-0.104,0.198-0.3,0.35-0.49,0.561c-0.236-0.146-0.433-0.257-0.616-0.392c-0.048-0.035-0.075-0.146-0.062-0.217 c0.089-0.367,0.702-0.604,0.994-0.362C973.882,313.938,973.994,314.172,973.949,314.26 M974.394,298.032 c-0.848-1.534-1.446-3.169-1.879-4.863c-0.041-0.151-0.013-0.342,0.053-0.485c0.061-0.128,0.201-0.264,0.332-0.299 c0.141-0.043,0.349-0.021,0.455,0.067c0.184,0.153,0.359,0.35,0.457,0.563c0.315,0.682,0.578,1.381,0.886,2.06 c0.43,0.945,0.674,1.403,1.886,0.966c0.234-0.086,0.491-0.111,0.719-0.201c1.633-0.659,3.27-0.375,4.899-0.033 c0.161,0.033,0.256,0.345,0.361,0.498c-0.13,0.217-0.196,0.458-0.296,0.473c-1.172,0.182-2.08,1.023-3.224,1.263 c-1.06,0.217-2.112,0.453-3.174,0.653C975.206,298.822,974.698,298.581,974.394,298.032 M975.935,332.91 c-0.375-0.135-0.546-0.704-0.297-1.016c0.304-0.382,0.626-0.744,0.955-1.102c0.166-0.186,0.697-0.125,0.903,0.066 c0.578,0.532,0.77,1.231,0.867,1.876c0.053,0.442-0.482,0.859-0.827,0.738C977.001,333.288,976.465,333.107,975.935,332.91 M982.4,336.703c-0.971,0.193-1.943,0.372-2.826,0.538c-1.396-0.9-1.398-0.9-1.83-1.852c0.399-0.478,0.816-0.985,1.249-1.478 c0.845-0.966,2.294-0.876,2.938,0.196c0.339,0.567,0.615,1.176,0.913,1.77C982.943,336.079,982.641,336.65,982.4,336.703 M983.112,326.766c-1.323,0.738-2.311,1.91-3.556,2.745c-0.523,0.353-1.119,0.302-1.617-0.11c-0.063-0.056-0.12-0.115-0.181-0.171 c-0.31-0.282-0.622-0.559-0.964-0.87c0.079-0.221,0.093-0.528,0.252-0.659c1.217-1.011,2.464-1.994,3.707-2.982 c0.233-0.184,0.734-0.19,0.953-0.035c0.615,0.442,1.172,0.948,1.503,1.64C983.265,326.433,983.202,326.715,983.112,326.766"/> <path d="M939.643,318.924c0.44,0.996,0.853,2.002,1.323,2.982c0.226,0.478,0.656,0.782,1.204,0.78 c0.75-0.005,1.503-0.051,2.251-0.118c0.352-0.033,0.623-0.289,0.727-0.616c0.196-0.639,0.352-1.293,0.503-1.944 c0.085-0.369-0.068-0.676-0.375-0.853c-1.019-0.575-2.037-1.156-3.056-1.734c-0.655-0.373-1.31-0.749-1.971-1.106 c-0.383-0.209-0.807-0.247-1.222-0.177c-0.433,0.075-0.86,0.199-1.291,0.289l0.483,1.235c0.299,0.035,0.588,0.063,0.893,0.096 C939.301,318.173,939.48,318.547,939.643,318.924"/> <path d="M903.854,328.853c-0.221,0.055-0.292,0.53-0.173,0.915c0.219,0.719,0.442,1.434,0.656,2.152 c0.045,0.158,0.083,0.327,0.077,0.493c-0.014,0.347-0.173,0.649-0.457,0.848c-0.203,0.143-0.431,0.27-0.664,0.339 c-0.882,0.257-1.787,0.453-2.66,0.744c-0.908,0.297-1.622,0.194-2.176-0.661c-0.271-0.419-0.62-0.787-0.96-1.159 c-0.483-0.522-1.066-0.781-1.801-0.656c-1.813,0.31-3.631,0.597-5.444,0.913c-0.239,0.043-0.468,0.181-0.679,0.307 c-0.126,0.081-0.287,0.227-0.287,0.347c0,0.132,0.128,0.322,0.252,0.393c1.182,0.664,2.459,1.049,3.789,1.26 c0.576,0.094,1.162,0.148,1.683,0.211c0.377,0.217,0.447,0.536,0.521,0.865c0.26,1.225,0.399,2.478,0.966,3.629 c0.138,0.281,0.08,0.649-0.214,0.905c-0.291,0.257-0.591,0.241-0.925,0.11c-0.313-0.12-0.64-0.206-0.951-0.326 c-1.604-0.613-8.796-2.34-8.646,1.292c1.977,0.395,3.98,0.024,5.97,0.191c0.911,0.073,1.841,0.179,2.66,0.614 c0.772,0.406,1.253,1.375,1.995,1.696c0.492,0.214,8.697-0.003,8.697,0.068v-15.408c0-0.032-0.296-0.069-0.364-0.098 C904.523,328.749,904.079,328.792,903.854,328.853 M903.53,341.456c-0.025,0.281-0.345,0.658-0.614,0.706 c-0.727,0.129-1.453,0.297-2.187,0.354c-0.397,0.03-0.813-0.105-1.207-0.206c-0.137-0.035-0.322-0.174-0.347-0.297 c-0.229-1.03-0.426-2.071-0.627-3.113c-0.016-0.072,0.028-0.155,0.033-0.241c0.01-0.166,0.344-0.47,0.515-0.457 c0.242,0.02,0.488,0.024,0.728,0.06c0.729,0.124,1.458,0.271,2.19,0.378c1.013,0.146,1.458,0.583,1.539,1.584 c0.012,0.16,0,0.329,0,0.885C903.562,340.966,903.553,341.214,903.53,341.456"/> <path d="M390.213,333.403c-0.047-0.052-0.093-0.104-0.136-0.16c-0.056,0.045-0.11,0.085-0.168,0.131 c0.058-0.046,0.112-0.086,0.168-0.131C390.12,333.299,390.166,333.352,390.213,333.403"/> <path d="M377.328,315.424c0.157,0.294,0.289,0.604,0.461,0.891c0.198,0.331,0.681,0.438,1.118,0.221 c0.213-0.105,0.388-0.294,0.575-0.452c0.158-0.126,0.214-0.327,0.062-0.442c-1.067-0.814-1.869-1.892-2.816-2.819 c-0.656-0.642-1.375-1.22-2.068-1.821c-0.151-0.13-0.484-0.058-0.674,0.139c-0.41,0.418-0.459,0.845-0.005,1.293 c0.615,0.602,0.793,1.202,0.43,2.017c-0.66,1.479-0.498,1.287-1.844,1.841c-0.543,0.227-1.082,0.407-1.47,0.891 c-0.224,0.281-0.58,0.316-0.912,0.152c-0.45-0.221-0.875-0.5-1.341-0.671c-0.196-0.073-0.525-0.007-0.695,0.123 c-0.469,0.364-0.791,0.865-0.904,1.462c-0.027,0.135,0.042,0.382,0.145,0.441c0.575,0.34,1.172,0.629,1.759,0.945 c0.576,0.313,0.674,1.02,0.227,1.479c-0.592,0.606-1.312,1.026-2.052,1.419c-0.206,0.104-0.371,0.296-0.557,0.446 c0.199,0.508,0.459,0.956,0.533,1.437c0.093,0.601-0.3,1.104-0.543,1.637c-0.131,0.287-0.157,0.624-0.214,0.945 c0.14,0.025,0.294,0.078,0.389,0.025c0.867-0.5,1.712-1.041,2.58-1.539c0.23-0.13,0.488-0.02,0.657,0.184 c0.106,0.126,0.144,0.31,0.257,0.425c0.103,0.105,0.274,0.219,0.397,0.202c0.121-0.016,0.283-0.177,0.314-0.303 c0.155-0.673,0.162-1.328-0.392-1.865c-0.113-0.105-0.236-0.274-0.236-0.412c-0.002-0.534-0.199-0.934-0.585-1.303 c-0.185-0.179-0.037-0.514,0.16-0.664c0.464-0.35,0.951-0.674,1.452-0.966c0.605-0.357,1.084-0.782,1.157-1.531 c0.072-0.729,0.463-1.23,1.091-1.582c0.291-0.161,0.575-0.342,0.843-0.538c0.525-0.387,0.676-0.865,0.525-1.531 c-0.164-0.712,0.332-1.157,0.981-0.999C376.63,314.723,377.073,314.941,377.328,315.424"/> <path d="M388.052,338.237c0.044-0.021,0.077-0.038,0.105-0.048c0.391-0.153,0.809-0.124,1.199,0.018 c0.147,0.055,0.333,0.045,0.493,0.02c0.334-0.045,0.723-0.133,0.821-0.473c0.211-0.754,0.674-1.073,1.433-1.164 c0.488-0.058,0.965-0.269,1.425-0.465c0.4-0.171,0.666-0.513,0.75-0.943c0.078-0.41,0.124-0.827,0.137-1.245 c0.042-1.426-0.052-1.926-0.909-5.155c-0.228-0.064-0.466-0.143-0.705-0.2c-0.663-0.164-1.312-0.236-1.948,0.141 c-0.283,0.166-0.638,0.219-0.924,0.387c-0.873,0.511-1.243,1.283-1.115,2.384c0.608,0.043,1.185,0.065,1.759,0.129 c0.605,0.068,1.213,0.269,1.408,0.877c0.187,0.578-0.1,1.152-0.465,1.63c-0.202,0.262-0.457,0.495-0.732,0.674 c-0.629,0.413-1.282,0.784-1.976,1.202c-0.069,0.043-0.796-0.257-0.98-0.262c-0.388-0.004-0.823,0.096-1.203-0.027 c-0.216-0.068-0.489-0.374-0.703-0.374c-0.249,0-0.533,0.312-0.751,0.441c-0.291,0.182-0.849,0.322-0.904,0.645 c-0.054,0.321,0.277,0.714,0.317,1.061c0.032,0.252,0.029,0.453,0.181,0.669c0.092,0.131,0.143,0.065,0.201,0.222 c0.038,0.11,0.013,0.345,0.002,0.455c-0.034,0.339-0.142,0.5,0.249,0.581c0.422,0.086,0.744-0.016,1.076-0.227 c0.271-0.164,0.634-0.281,0.958-0.257c-0.044-0.226,0.539-0.648,0.732-0.664c0.533-0.035,0.125,0.45,0.113,0.699 c-0.015,0.362,0.718,0.413,1.007,0.574c0.319,0.181,0.654,0.487,0.754-0.011c0.092-0.447,0.104-0.928,0.104-1.389 c0-0.406-0.43-0.481-0.786-0.513c-0.131-0.009-0.569-0.05-0.681,0.066C388.294,337.904,388.533,338.295,388.052,338.237"/> <path d="M364.403,325.751c0.209-1.164-0.245-1.725-1.363-1.878c-0.148-0.025-0.281-0.169-0.419-0.256 c-0.237-0.161-0.412-0.645-0.301-0.888c0.275-0.606,0.58-1.195,0.837-1.809c0.092-0.224,0.095-0.493-0.101-0.699 c-0.056-0.061-0.103-0.136-0.169-0.179c-1.039-0.687-2.081-1.37-3.127-2.047c-0.057-0.037-0.162-0.004-0.334-0.004 c-0.664,0.879-1.249,1.859-1.718,2.994c0.428,0.98,0.919,1.64,1.576,2.178c0.528,0.432,0.936,0.936,1.002,1.659 c0.052,0.534,0.374,0.928,0.778,1.232c0.862,0.648,1.745,1.268,2.626,1.892c0.229,0.161,0.625-0.142,0.723-0.468 C364.588,326.891,364.305,326.303,364.403,325.751"/> <path d="M379.231,326.675c-0.653-0.03-1.307-0.171-1.958,0.04c-0.344,0.115-0.796,0.573-0.777,0.87 c0.038,0.604,0.329,1.091,0.759,1.488c0.104,0.093,0.31,0.126,0.46,0.105c0.569-0.065,1.139-0.143,1.705-0.244 c0.454-0.077,0.778-0.55,0.793-1.108C380.234,327.13,379.89,326.704,379.231,326.675"/> <path d="M366.311,330.577c0.575,0.594,1.182,1.154,2.022,1.343c0.509-0.422,0.486-1.021,0.604-1.614 c-0.42-0.467-0.896-0.931-1.285-1.456c-0.417-0.565-0.762-1.182-1.133-1.783c-0.427,0.905-0.344,1.903-0.494,2.859 C365.994,330.127,366.151,330.416,366.311,330.577"/> <path d="M395.737,325.286c-0.358,0.091-0.657-0.035-0.871-0.309c-0.404-0.517-0.779-1.064-1.174-1.587 c-0.242-0.322-0.841-0.217-1.024,0.179c-0.244,0.521-0.121,1.063,0.289,1.31c0.11,0.063,0.219,0.126,0.329,0.184 c0.667,0.344,1.354,0.528,2.096,0.35c0.116-0.027,0.236-0.065,0.355-0.116V325.286"/> <path d="M356.692,292.392c0.337,0.134,0.644,0.068,0.942-0.096c0.279-0.152,0.405-0.631,0.237-0.856 c-0.353-0.479-0.786-0.841-1.455-0.974c-0.149,0.11-0.405,0.212-0.51,0.395c-0.018,0.035-0.023,0.086-0.036,0.124v0.62 C356.031,291.96,356.306,292.238,356.692,292.392"/> <path d="M402.479,330.879c-0.164,0.035-0.329,0.056-0.482,0.101c-0.375,0.116-0.502,0.533-0.206,0.759 c0.324,0.245,0.685,0.448,1.044,0.64c0.196,0.105,0.469-0.101,0.539-0.362c0.09-0.344,0.046-0.624-0.111-0.825 C403.107,330.994,402.839,330.879,402.479,330.879"/> <path d="M382.006,312.743c-0.049-0.035-0.165-0.015-0.23,0.018c-0.067,0.038-0.156,0.118-0.159,0.184 c-0.021,0.518,0.128,0.983,0.52,1.343c0.054,0.051,0.191,0.096,0.226,0.066c0.105-0.089,0.184-0.215,0.271-0.328 C382.552,313.535,382.439,313.056,382.006,312.743"/> <path d="M390.315,344.051c0.022-0.091,0.046-0.166,0.072-0.211c0.108-0.18,0.286-0.348,0.399-0.544 c0.192-0.326,0.425-0.674,0.674-0.985c-0.277-0.503-0.625-0.166-0.963,0.021c-0.391,0.206-0.818,0.307-1.271,0.331 c-0.083,0.322-0.208,0.619-0.275,0.951c-0.042,0.212-0.042,0.468-0.101,0.664c-0.029,0.091,0.627,0.056,0.671,0.063 c0.188,0.018,0.381,0.27,0.491,0.254C390.178,344.579,390.25,344.277,390.315,344.051"/> <path d="M395.364,326.142c0.01,0.321,0.193,0.638,0.309,0.48c0.082-0.114,0.182-0.254,0.177-0.38 c-0.01-0.313-0.069-0.624-0.11-0.931C395.521,325.545,395.354,325.792,395.364,326.142"/> <path d="M390.213,333.403c-0.047-0.052-0.093-0.104-0.136-0.16c-0.056,0.045-0.11,0.085-0.168,0.131 c0.046,0.055,0.088,0.146,0.139,0.15C390.097,333.53,390.156,333.449,390.213,333.403"/> <path d="M390.542,322.498c0.055-0.053,0.111-0.105,0.166-0.159c-0.049-0.055-0.101-0.116-0.152-0.17 c-0.054,0.054-0.149,0.103-0.155,0.16C390.401,322.382,390.492,322.439,390.542,322.498"/> <path d="M705.168,323.111c-1.323,0.259-2.104,1.199-2.822,2.2c0.141,0.171,0.239,0.382,0.335,0.382 c0.822-0.005,1.646-0.037,2.47-0.09c0.147-0.006,0.336-0.101,0.427-0.217c0.395-0.523,0.781-1.066,0.774-1.768 c-0.002-0.134-0.118-0.304-0.236-0.39C705.833,323.023,705.495,323.048,705.168,323.111"/> <path d="M592.868,325.905c-0.292,0-0.709,0.349-0.674,0.575c0.063,0.434,0.334,0.732,0.674,0.961 c0.236,0.159,0.925-0.284,0.936-0.581C593.815,326.433,593.305,325.91,592.868,325.905"/> <path d="M611.917,321.223c-0.131-0.008-0.305,0.093-0.396,0.198c-0.09,0.108-0.125,0.28-0.141,0.428 c-0.022,0.234,0.257,0.513,0.445,0.44c0.118-0.045,0.239-0.166,0.287-0.287c0.027-0.067,0.04-0.146,0.045-0.226 c0.005-0.081,0.005-0.161,0.01-0.239c-0.02-0.027-0.043-0.063-0.063-0.093C612.044,321.339,611.985,321.229,611.917,321.223"/> <path d="M374.706,338.815c0.032-0.151-0.018-0.286-0.126-0.383c-0.113-0.101-0.284-0.16-0.5-0.16c-0.138,0-0.334,0.091-0.394,0.201 c-0.051,0.1,0.011,0.302,0.086,0.417c0.138,0.227,0.389,0.292,0.627,0.222C374.521,339.077,374.605,338.918,374.706,338.815"/> <path d="M393.61,337.553c-0.088-0.241,0.01-0.608-0.088-0.814c-0.108-0.231-0.573-0.184-0.826-0.188 c-0.345-0.008-1.241-0.216-1.465,0.096c-0.214,0.299-0.817,0.666-0.698,1.019c0.148,0.447,0.524,0.744,0.285,1.225 c-0.149,0.304-0.219,0.438-0.224,0.822c-0.002,0.332-0.088,0.644,0.236,0.754c0.484,0.166,0.813-0.452,1.226-0.543 c0.135-0.03,0.258,0.025,0.374-0.04c0.169-0.099,0.309-0.388,0.435-0.543c0.245-0.315,0.624-0.609,0.809-0.951 C393.873,338.025,393.736,337.896,393.61,337.553"/> <path d="M685.06,322.642c0,0,3.287,1.413,3.76,1.413c0.468,0,0.468-0.825,0.468-1.177c0-0.353-1.057-0.468-1.057-0.468 L685.06,322.642z"/> <path d="M699.391,315.007c0,0-2.114,0.94-2.7,1.292c-0.589,0.352-1.411,1.76-1.411,1.76l-0.236,1.062l0.94,0.231l1.999,0.121 l0.353-2.118l0.702-0.819L699.391,315.007z"/> <path d="M701.27,325.578c0,0-5.168-0.704-5.402-0.234c-0.238,0.471-0.117,0.941,0.234,1.293c0.353,0.354,2.468,2.23,2.468,2.23 s1.76,1.411,2.232,1.411c0.468,0,1.29-0.587,1.761-1.293c0.467-0.707,0.706-1.994,0.706-1.994L701.27,325.578z"/> <path d="M697.395,320.645c0,0-1.647,0.825-1.881,1.881c-0.234,1.057-0.119,1.881-0.353,2.23c-0.233,0.354-1.644,0.47-1.644,0.47 s-0.704-0.47-0.704-0.94c0-0.467-0.471-1.407-0.825-1.523c-0.35-0.12-1.054-0.471-1.054-0.824c0-0.353,5.4-1.645,5.4-1.645 L697.395,320.645z"/> <path d="M710.549,325.578c0,0,3.407,6.933,3.76,7.52c0.352,0.588,1.408,1.528,1.528,1.881c0.118,0.35,0.938,0.703,0.938,0.35 c0-0.35-2.114-6.694-2.229-7.396c-0.119-0.709-0.589-2.588-0.355-2.939c0.236-0.354-0.585-0.822-1.056-0.822 S710.549,325.578,710.549,325.578"/> <path d="M707.615,328.278c0,0-2.115,3.996-1.881,5.053c0.233,1.059,0,1.763,0,1.763s-0.94,0.588-1.408,0.822 c-0.471,0.236,0.468,3.055,0.468,3.055l2.703,1.408l1.878-0.352l-2.349-2.112c0,0,0.116-1.763,0.589-1.999 c0.468-0.234,1.76-0.354,2.349-0.586c0.586-0.236,1.76-1.763,1.878-2.349c0.118-0.591-0.586-3.763-0.703-4.23 C711.022,328.278,708.553,328.399,707.615,328.278"/> <path d="M728.816,335.215c0,0,0.792,3.173,0.907,3.998c0.118,0.819-1.788,1.059-1.788,1.059h-3.058c0,0-0.349-4.122,0.003-4.826 c0.354-0.704,1.059-2.114,1.059-2.114l2.582,1.647L728.816,335.215z"/> <path d="M733.705,331.872c-0.511,0-1.698,0.934-1.698,1.612v1.697c0,0,0.511,0.848,1.017,0.511c0.51-0.343,1.021-1.192,1.021-1.192 v-1.355L733.705,331.872z"/> <path d="M704.219,321.732l0.172-0.042c-0.712-0.188-0.252,0.79-0.249,1.004C705.16,322.822,704.969,321.585,704.219,321.732"/> <path d="M704.391,326.528l0.085-0.045c-0.392-0.051-0.747-0.177-0.891,0.212c-0.08,0.208-0.048,0.693,0.134,0.809 C704.265,327.863,705.042,326.894,704.391,326.528"/> <path d="M726.281,319.402h0.126c-0.277,0.12-0.46,0.792-0.139,1.031c0.212,0.155,0.963,0.04,1.114-0.196 C727.968,319.312,726.389,318.849,726.281,319.402"/> <path d="M746.302,333.695h0.126c-0.042,0.005-0.078-0.005-0.12,0.005c-0.016,0.308-0.081,0.614,0.195,0.795 c0.262,0.168,0.659,0.025,0.737-0.269C747.375,333.716,746.675,333.565,746.302,333.695"/> <path d="M31.305,341.544l0.126,0.128c-0.991-1.127-2.292,1.609-1.532,2.168c0.185,0.138,2.143-0.141,2.305-0.353 C32.68,342.874,31.799,341.898,31.305,341.544"/> <path d="M751.88,28.917c-0.006,0.126,0,0.317-0.072,0.358c-0.097,0.057-0.313,0.054-0.389-0.019 c-0.535-0.514-0.771-1.194-0.965-1.887c-0.03-0.113,0.045-0.295,0.131-0.394c0.241-0.268,0.492-0.53,0.776-0.747 c0.34-0.265,0.723-0.475,1.079-0.721c0.308-0.216,0.488-0.523,0.556-0.894c0.061-0.355,0.128-0.71,0.188-1.066 c0.111-0.675,0.03-0.816-0.642-1.179c-0.261-0.14-0.515-0.288-0.769-0.433c0.176,0.394,0.354,0.789,0.521,1.187 c0.098,0.231-0.032,0.595-0.254,0.718c-0.171,0.093-0.345,0.199-0.531,0.23c-0.505,0.084-0.974,0.283-1.44,0.468 c-0.549,0.217-1.086,0.436-1.426,0.348c-0.616-0.034-0.971-0.031-1.317-0.08c-0.184-0.025-0.357-0.131-0.534-0.212 c-0.08-0.033-0.115-0.236-0.058-0.308c0.093-0.125,0.174-0.265,0.292-0.359c0.433-0.329,0.848-0.705,1.33-0.95 c0.672-0.34,1.243-0.79,1.769-1.313c0.138-0.14,0.301-0.219,0.473-0.281c-0.624-0.183-1.243-0.127-1.844,0.252 c-0.121,0.078-0.254,0.147-0.353,0.247c-0.731,0.75-1.682,0.757-2.619,0.796c-0.144,0.007-0.287-0.034-0.431-0.049 c-2.107-0.206-2.107-0.206-3.578,1.285c-0.903,0.293-1.835,0.278-2.773,0.131c-0.453-0.069-0.806-0.286-0.998-0.726 c-0.142-0.327-0.413-0.608-0.353-0.997c0.02-0.133,0.08-0.298,0.181-0.369c0.091-0.064,0.31-0.076,0.387-0.012 c0.214,0.182,0.38,0.422,0.569,0.636c0.307,0.339,0.508,0.339,0.938,0.087c0.535-0.313,0.883-0.713,0.862-1.377 c-0.015-0.504,0.028-1.012,0.041-1.517c0.01-0.486,0.278-0.811,0.674-1.033c0.313-0.175,0.641-0.329,0.978-0.445 c0.089-0.031,0.327,0.101,0.34,0.18c0.053,0.351,0.061,0.711,0.061,1.066c0,0.58-0.027,1.16,0.407,1.705 c0.314,0,0.674,0.02,1.028-0.005c0.39-0.029,0.666-0.25,0.836-0.6c0.122-0.26,0.285-0.516,0.344-0.791 c0.038-0.18-0.013-0.453-0.134-0.585c-0.289-0.317-0.648-0.563-0.963-0.86c-0.098-0.093-0.135-0.25-0.198-0.378 c-0.105-0.224,0.168-0.664,0.404-0.636c0.426,0.046,0.85,0.11,1.268,0.167c0.563-0.291,0.687-0.926,1.081-1.336 c0.393-0.409,0.851-0.76,1.266-1.125c0.188-1.222,0.473-2.474,0.54-3.708c0.375-0.051,0.838-0.064,1.192,0.049 c0.27,0.492,0.287,1.128,0.452,1.653c0.164,0.516,0.549,1.108,0.855,1.548c0.344,0.494,0.915,0.821,1.081,1.447 c0.397,0.298,0.802,0.582,1.18,0.904c0.075,0.062,0.083,0.275,0.035,0.386c-0.043,0.113-0.19,0.26-0.297,0.263 c-0.669,0.02-1.26-0.227-1.788-0.624c-0.107-0.08-0.166-0.231-0.244-0.352c-0.433-0.665-0.958-1.241-1.632-1.668 c-0.056-0.037-0.231,0.089-0.334,0.165c-0.046,0.033-0.068,0.128-0.07,0.195c-0.011,0.875,0.221,1.713,0.427,2.553 c0.065,0.27,0.222,0.54,0.397,0.762c0.675,0.842,1.338,1.681,2.384,2.13c0.725,0.309,1.389,0.747,2.085,1.13 c0.38-0.137,0.425-0.533,0.626-0.811c0.124-0.174,0.259-0.341,0.41-0.493c0.246-0.252,0.824-0.254,0.966,0.029 c0.457,0.934,1.204,1.653,1.905,2.39c1.462-0.319,3.217-0.417,5.322-0.417h5.686c-0.287,0-0.639-0.636-0.984-0.921 c-0.17-0.145-0.417-0.238-0.641-0.284c-0.608-0.126-1.228-0.224-1.76-0.317c-0.423,0.23-0.753,0.434-1.104,0.584 c-0.101,0.042-0.329-0.035-0.402-0.133c-0.339-0.448-0.49-0.971-0.414-1.532c0.02-0.131,0.147-0.273,0.266-0.355 c0.121-0.088,0.287-0.152,0.433-0.152c1.795-0.002,3.568-0.432,5.374-0.221c0.37,0.04,0.759-0.134,1.144-0.193 c0.846-0.136,1.688-0.286,2.54-0.369c0.161-0.015,0.383,0.224,0.506,0.397c0.07,0.092,0.061,0.352-0.021,0.433 c-0.792,0.785-1.297,1.752-1.682,2.786c-0.033,0.092-0.099,0.278-0.169,0.278h5.537V0.229H763.28c-20.733,0-33.31,11.47-33.31,32.9 V86.34c0,0.392-0.081,0.811-0.078,1.213c0.008,0.572,0.375,0.83,0.834,1.035c0.265-0.342,0.396-0.682,0.758-0.947 c0.251-0.183,0.781-0.572,1.102-0.554c0.171,0.009,0.43,0.184,0.594,0.245c0.139,0.054,0.465,0.126,0.548,0.26 c0.088,0.141,0.035,0.528,0.043,0.698c0.027,0.533,0.045,1.069,0.118,1.597c0.053,0.406,0.254,0.802,0.404,1.2 c0.136,0.361,0.536,0.35,0.827,0.255c0.687-0.228,1.223-0.083,1.884,0.108c0.531,0.155,1.068,0.278,1.609,0.398 c0.209,0.046,0.423,0.081,0.629,0.131c0.048,0.011,0.646,0.203,0.651,0.176c0.015-0.059,0.024-0.126,0.065-0.176 c0.063-0.069,0.144-0.048,0.224-0.043c0.206,0.01,0.412,0.025,0.616,0.022c0.045,0.026,0.146,0.029,0.196,0.047 c0.15,0.051,0.286,0.121,0.412,0.219c0.058,0.049,0.131,0.076,0.19,0.127c0.066,0.052,0.132,0.116,0.191,0.18 c0.121,0.123,0.227,0.257,0.322,0.398c0.15,0.216,0.227,0.39,0.367,0.608c0.158,0.247,0.319,0.354,0.49,0.354h0.372 c0.161,0,0.335-0.052,0.546-0.206c0.453-0.334,0.905-0.63,1.327-0.988c0.539-0.455,1.182-0.582,1.93-0.521 c0.19,0.019,0.392-0.035,0.676-0.077c0.181-0.238,0.364-0.53,0.618-0.781c0.185-0.18,0.443-0.376,0.7-0.415 c0.329-0.047,0.661-0.082,0.993-0.092c0.433-0.016,0.865,0.013,1.287,0.111c0.148,0.034,0.292,0.074,0.433,0.125 c0.056,0.021,0.148,0.039,0.191,0.078c0.043,0.035,0.056,0.115,0.093,0.162c0.058,0.067,0.144,0.105,0.222,0.146 c0.007,0.005,0.013,0.005,0.013,0.009V56.223h17.903c-0.024,0-0.05,0.031-0.075-0.057c0.729-0.43,1.029-0.546,1.318-0.134 c0.063,0.093,0.121,0.191,0.176,0.191h1.038V34.846h-20.36v-2.182c0-1.63,0.131-3,0.374-4.159 c-0.319,0.029-0.639,0.054-0.926,0.219C751.839,28.789,751.885,28.856,751.88,28.917 M774.613,18.03 c0.198,0.116,0.37,0.162,0.443,0.273c0.135,0.196-0.036,0.461-0.322,0.476c-0.126,0.005-0.378-0.149-0.37-0.174 C774.417,18.406,774.522,18.224,774.613,18.03 M761.582,19.603c0.156,0.135,0.244,0.349,0.32,0.459 c-0.049,0.374-0.32,0.587-0.517,0.481c-0.219-0.121-0.361-0.291-0.326-0.553C761.089,19.765,761.452,19.493,761.582,19.603 M757.542,18.641c0.178-0.161,0.455-0.036,0.537,0.208c0.059,0.188-0.005,0.319-0.184,0.402c-0.259,0.118-0.543,0.028-0.543-0.193 C757.36,18.917,757.435,18.735,757.542,18.641 M743.557,13.969c0.467-0.597,1.025-1.165,1.438-1.802 c0.313-0.484,0.443-0.896,1.066-1.118c0.061,0.237,0.106,0.453,0.139,0.672c0.027,0.029,0.063,0.052,0.083,0.083 c0.335,0.513,0.442,1.077,0.458,1.661c-0.051,0.167-0.07,0.342-0.154,0.482c-0.479,0.812-1.739,1.313-2.615,1.054 C743.604,14.892,743.333,14.258,743.557,13.969 M743.65,25.552c0.138-0.072,0.297-0.113,0.447-0.167 c0.141,0.054,0.313,0.072,0.42,0.165c0.148,0.132,0.059,0.554-0.15,0.608c-0.206,0.054-0.46,0.045-0.667-0.019 C743.458,26.062,743.439,25.662,743.65,25.552 M736.531,88.625c-0.252,0.02-0.453-0.147-0.476-0.405 c-0.035-0.375,0.182-0.576,0.473-0.741c0.236-0.132,0.468-0.127,0.662,0.033c0.101,0.085,0.126,0.263,0.186,0.4 C737.219,88.295,736.992,88.586,736.531,88.625 M736.954,81.953c-0.043,0.035-0.159,0.03-0.212-0.002 c-0.312-0.208-0.513-0.869-0.342-1.25c0.048-0.098,0.302-0.2,0.397-0.16c0.39,0.167,0.604,0.481,0.586,1.022 C737.275,81.664,737.125,81.818,736.954,81.953 M738.244,37.181c-0.081,0.059-0.325,0.007-0.413-0.079 c-0.088-0.086-0.156-0.346-0.098-0.41c0.15-0.167,0.364-0.294,0.573-0.378c0.05-0.019,0.196,0.201,0.344,0.369 C738.525,36.847,738.414,37.055,738.244,37.181 M740.843,90.566c-0.08,0.111-0.264,0.204-0.396,0.201 c-0.142-0.003-0.34-0.09-0.408-0.206c-0.173-0.293-0.153-0.624-0.03-0.943c0.081-0.2,0.47-0.311,0.616-0.143 c0.151,0.177,0.249,0.398,0.342,0.553C740.919,90.259,740.926,90.448,740.843,90.566 M743.079,29.566 c-1-0.347-2.019-0.646-3.04-0.944c-0.848-0.25-1.821-0.194-2.618-0.601c0.151-0.33,0.461-0.634,0.694-0.939l0.083,0.113 c0.008-0.01,0.008-0.021,0.013-0.029c0.231-0.239,0.457-0.492,0.727-0.687c0.428-0.314,0.674-0.704,0.782-1.228 c0.043-0.209,0.277-0.403,0.463-0.55c0.115-0.087,0.34-0.139,0.457-0.084c0.114,0.051,0.222,0.263,0.214,0.398 c-0.015,0.24-0.135,0.474-0.179,0.717c-0.05,0.278,0.119,0.555,0.348,0.571c1.504,0.1,2.957,0.51,4.431,0.786 c0.359,0.066,0.648-0.083,0.888-0.342c0.222-0.245,0.428-0.513,0.682-0.722c0.101-0.082,0.312-0.061,0.47-0.041 c0.204,0.029,0.453,0.371,0.415,0.557c-0.135,0.733-0.278,1.465-0.417,2.178C746.037,30.1,744.623,30.102,743.079,29.566 M745.071,34.482c-0.29-0.019-0.554-0.525-0.385-0.766c0.286-0.398,0.608-0.774,0.88-1.187c0.321-0.492,0.056-1.161,0.465-1.645 c0.128-0.152,0.247-0.246,0.431-0.157c0.136,0.069,0.291,0.157,0.372,0.278c0.085,0.131,0.105,0.314,0.128,0.477 c0.033,0.248,0.04,0.494,0.054,0.674c-0.014,0.235-0.021,0.403-0.031,0.567c-0.063,0.975-0.226,1.496-1.664,1.776 C745.242,34.515,745.156,34.487,745.071,34.482 M747.701,85.893c-0.065,0.031-0.163-0.005-0.246-0.011 c-0.058-0.051-0.144-0.095-0.177-0.162c-0.238-0.477,0.159-1.246,0.689-1.292c0.113-0.01,0.327,0.146,0.354,0.26 C748.437,85.148,748.159,85.659,747.701,85.893 M747.774,80.278c-0.533-0.202-0.958,0.129-1.431,0.142 c-0.086,0-0.229-0.208-0.242-0.332c-0.02-0.15,0.04-0.329,0.119-0.466c0.216-0.376,0.304-0.739,0.128-1.167 c-0.083-0.211-0.144-0.509-0.063-0.696c0.375-0.82,0.793-1.618,1.223-2.406c0.053-0.098,0.289-0.167,0.412-0.134 c0.116,0.029,0.244,0.196,0.274,0.324c0.035,0.15-0.028,0.322-0.091,0.828c0.016,0.151,0.075,0.632,0.115,1.119 c0.066,0.736,0.132,1.474,0.172,2.21C748.408,80.008,748.053,80.387,747.774,80.278"/> <path d="M703.5,68.571c0,5.444-4.428,7.993-8.598,7.993c-6.138,0-8.71-3.36-8.71-8.456V34.845h-21.381v33.844 c0,8.708,3.893,17.687,11.334,23.122c-0.211-0.468-0.57-0.924-0.88-1.347c-0.094-0.13-0.234-0.298-0.247-0.455 c-0.015-0.149,0.008-0.327,0.089-0.459c0.146-0.231,0.417-0.332,0.636-0.239c0.996,0.422,1.964,0.89,2.949,1.334 c0.161,0.072,0.298,0.138,0.42,0.202c-0.077-0.113-0.166-0.223-0.241-0.347c-0.035-0.062-0.053-0.162-0.032-0.229 c0.048-0.149,0.09-0.332,0.201-0.417c0.103-0.083,0.334-0.126,0.433-0.064c0.827,0.543,1.433,1.308,1.981,2.119 c0.038,0.057,0.016,0.157,0.021,0.238c-0.031,0.069-0.04,0.175-0.094,0.2c-0.134,0.073-0.332,0.194-0.42,0.145 c-0.409-0.224-0.784-0.489-1.118-0.796c0.012,0.26-0.089,0.585-0.272,1.041c-0.153,0.365-0.353,0.698-0.565,1.02 c3.752,2.008,8.097,3.192,13.091,3.192c4.054,0,7.333-0.812,11.404-2.779v6.719c0,4.632-2.947,7.874-8.278,7.874 c-4.167,0-7.846-1.851-8.539-6.37l-19.178-0.101c0.471,0.777,0.785,1.978,1.006,2.425c0.068,0.132-3.453,1.159-2.08,2.13 c0.191,0.136,0.405,0.244,0.609,0.361c0.229,0.125,0.307,0.337,0.34,0.573c0.01,0.078,0.027,0.169,0,0.235 c-0.622,1.356,0.107,2.052,1.244,2.551c0.065,0.029,0.118,0.098,0.098,0.083c0.619,1.079,1.414,2.207,1.879,3.345 c-0.538,0.356-1.094,0.695-1.604,1.089c0.533,0.889,1.117,1.746,1.742,2.578c0.534,0.327,1.049,0.683,1.502,1.11 c0.797,0.756,1.076,1.771,1.772,2.56c0.421,0.479,0.953,0.754,1.309,1.207c1.404,1.201,2.927,2.28,4.548,3.214 c0.189-0.157,0.438-0.18,0.674-0.19c0.979-0.049,1.907,0.101,2.769,0.482c-0.02-0.644-0.095-1.286-0.147-1.929 c-0.021,0.002-0.038,0.002-0.056,0.004l0.051-0.064c0,0.02,0.002,0.038,0.005,0.06c0.554-0.034,1.104-0.111,1.509,0.447 c0.339,0.469,0.729,0.899,1.104,1.339c0.439,0.516,0.722,1.084,0.829,1.767c0.056,0.342,0.267,0.661,0.423,0.989 c1.732,0.277,3.91,0.557,5.024,0.611c0.161,0.118,0.336,0.246,0.51,0.376c0.707,0.051,1.421,0.084,2.143,0.084 c13.477,0,22.711-6.811,27.244-15.468c-0.133,0.013-0.264,0.026-0.392,0.046c-0.245-0.064-0.481-0.12-0.713-0.186 c-0.228-0.064-0.457-0.362-0.387-0.531c0.061-0.144,0.128-0.313,0.244-0.398c0.262-0.188,0.548-0.347,0.84-0.487 c0.397-0.196,0.782-0.149,1.151,0.027c0.086-0.192,0.166-0.388,0.249-0.581c-0.511-0.438-1.014-0.886-1.488-1.355 c-0.021,0.054-0.048,0.106-0.081,0.137c-0.115,0.103-0.261,0.174-0.404,0.245c-0.068,0.033-0.159,0.03-0.239,0.033 c-0.161,0.002-0.324,0-0.294,0c-0.354-0.018-0.543,0.024-0.675-0.046c-0.2-0.106-0.457-0.258-0.508-0.44 c-0.047-0.172,0.086-0.502,0.242-0.6c0.289-0.184,0.631-0.297,0.963-0.413c-0.375-0.477-0.516-1.012-0.332-1.581 c0.436-1.352,0.82-2.707,0.754-4.151c-0.002-0.054,0.086-0.152,0.148-0.163c0.149-0.025,0.365-0.079,0.45-0.005 c0.247,0.216,0.45,0.481,0.654,0.742c0.514,0.659,0.96,1.378,1.539,1.975c0.369,0.381,0.442,0.801,0.573,1.256 c0.519-2.128,0.634-4.295,0.634-6.435V34.845H703.5V68.571z M678.125,86.738c-0.204,0.152-0.463,0.152-0.642-0.046 c-0.094-0.105-0.166-0.332-0.115-0.435c0.12-0.237,0.387-0.288,0.629-0.208c0.13,0.041,0.23,0.182,0.344,0.28 C678.271,86.468,678.236,86.653,678.125,86.738 M680.526,85.395c-0.213-0.077-0.374-0.418-0.23-0.61 c0.128-0.173,0.356-0.272,0.626-0.466c0.075,0.314,0.187,0.536,0.166,0.744C681.06,85.318,680.738,85.471,680.526,85.395 M698.132,82.343c-0.134-0.088-0.33-0.152-0.38-0.273c-0.242-0.569-0.239-1.115,0.264-1.568c0.161-0.142,0.337-0.162,0.415,0.008 c0.174,0.366,0.324,0.744,0.439,1.13C698.994,82.046,698.599,82.404,698.132,82.343 M700.162,80.96 c-0.232-0.072-0.455-0.204-0.657-0.345c-0.347-0.245-0.438-0.786-0.206-1.105c0.49-0.667,0.983-1.329,1.475-1.993 c0.12-0.162,0.532-0.098,0.646,0.072c0.44,0.653,0.458,1.407,0.563,1.875C702.004,80.476,700.943,81.202,700.162,80.96 M678.731,104.892c0.503-0.118,1.068,0.484,1.046,1.062c-0.09,0.118-0.184,0.332-0.276,0.332c-0.309,0.002-0.629-0.04-0.931-0.126 c-0.377-0.105-0.594-0.42-0.533-0.666C678.127,105.127,678.424,104.965,678.731,104.892 M679.229,110.4 c-0.153,0.145-0.46,0.204-0.682,0.177c-0.521-0.057-0.928-0.355-1.192-0.811c-0.176-0.298-0.223-0.654,0-0.937 c0.357-0.454,0.772-0.862,1.159-1.292c0.247-0.277,0.569-0.346,0.903-0.282c0.345,0.066,0.715,0.563,0.739,0.926 C680.182,109.059,679.87,109.811,679.229,110.4 M681.442,108.698c-0.314-0.033-0.671-0.332-0.714-0.592 c-0.053-0.327,0.233-0.659,0.563-0.651c0.54,0.015,0.835,0.258,0.842,0.688C682.135,108.428,681.759,108.734,681.442,108.698 M686.955,119.676c-0.086,0.231-0.166,0.472-0.287,0.685c-0.327,0.583-0.677,1.153-1.016,1.725c0-0.002,0.053-0.066,0.053-0.066 c-0.146,0.205-0.282,0.416-0.436,0.615c-0.633,0.806-1.4,0.824-2.072,0.044c-0.161-0.191-0.296-0.405-0.433-0.616 c-0.146-0.229-0.093-0.76,0.081-0.94c0.058-0.061,0.096-0.149,0.166-0.188c1.028-0.556,1.959-1.244,2.784-2.084 c0.11-0.113,0.481-0.062,0.683,0.024C686.826,119.027,687.042,119.454,686.955,119.676 M690.369,124.668 c-0.096,0.167-0.493,0.366-0.568,0.31c-0.902-0.706-1.858-1.352-2.582-2.255c-0.091-0.117-0.083-0.31-0.113-0.467 c-0.04-0.207,0.227-0.489,0.445-0.482c0.082-0.005,0.179-0.043,0.236-0.01c0.943,0.512,1.735,1.228,2.486,1.978 C690.504,123.973,690.54,124.378,690.369,124.668 M695.917,127.311c-0.576,0.067-1.157,0.118-1.773,0.181 c-0.208-0.039-0.473-0.039-0.688-0.14c-0.204-0.095-0.455-0.268-0.516-0.461c-0.143-0.47-0.257-0.973-0.254-1.462 c0.003-0.628-0.251-1.079-0.626-1.553c-0.4-0.499-0.327-1.351,0.139-1.838c0.601-0.629,1.224-1.238,1.857-1.831 c0.541-0.505,1.161-0.724,1.732-1.174c0.396,1.038-0.269,2.587-0.445,3.629c-0.085,0.504,0.009,0.985,0.393,1.377 c0.367,0.368,0.597,0.788,0.461,1.336c-0.086,0.36,0.168,0.619,0.304,0.911C696.756,126.845,696.53,127.239,695.917,127.311 M697.735,118.529c-0.659,0.405-1.869-0.404-1.978-0.981c-0.014-0.074-0.032-0.157-0.022-0.231 c0.096-0.729,0.747-1.363,1.483-1.398c0.131-0.007,0.348,0.116,0.393,0.229c0.227,0.6,0.415,1.213,0.626,1.847 C698.056,118.192,697.925,118.411,697.735,118.529 M722.594,103.174c0.038,0.24-0.428,0.636-0.671,0.565 c-0.503-0.155-0.841-0.492-0.986-0.99c-0.037-0.133,0.021-0.311,0.073-0.453c0.063-0.194,0.423-0.283,0.639-0.145 c0.267,0.172,0.528,0.366,0.757,0.587C722.511,102.84,722.534,103.026,722.594,103.174 M720.975,99.388 c0.134-0.191,0.521-0.25,0.646-0.108c0.387,0.438,0.611,0.942,0.666,1.524c-0.086,0.132-0.146,0.301-0.265,0.381 c-0.115,0.078-0.324,0.127-0.435,0.073C720.945,100.94,720.619,99.904,720.975,99.388 M704.363,114.821 c0.188,0.046,0.35,0.237,0.468,0.326c0.005,0.535-0.198,0.787-0.533,0.745c-0.261-0.035-0.427-0.185-0.449-0.468 C703.807,115.002,704.005,114.737,704.363,114.821"/> <path d="M640.616,40.655l-16.333-7.295c-3.01-1.391-4.169-3.361-4.169-5.908c0-3.919,3.234-5.927,6.611-6.456 c0.166-0.175,0.321-0.358,0.447-0.572c0.081-0.133,0.466-0.18,0.677-0.126c0.359,0.096,0.621,0.039,0.798,0.314 c5.74,0.039,8.728,4.05,9.304,9.141h2.055h0.857h0.402c0.332,0,0.816-0.115,1.298-0.015c0.349,0.072,0.704,0.054,0.641,0.268 c-0.01,0.036-0.03-0.253-0.043-0.253h16.562v-0.565c0-10.423-8.63-29.188-31.099-29.188c-18.067,0-31.303,12.161-31.303,26.873 c0,1.231,0.106,2.391,0.201,3.517c0.289,0.103,0.601,0.206,0.916,0.27c0.521,0.108,0.865,0.492,1.031,1.01 c0.307,0.956,0.684,1.895,0.927,2.867c0.182,0.713,0.35,1.372,0.963,1.861c0.156-0.605,0.317-1.207,0.496-1.808 c0.098-0.337,0.701-0.588,1.049-0.433c0.979,0.449,1.956,0.909,2.924,1.383c0.355,0.176,0.32,0.816-0.05,1.043 c-0.995,0.615-1.986,1.246-3.251,1.063c-0.242-0.046-0.488-0.088-0.729-0.14c-0.01,0-0.021-0.012-0.03-0.015 c-0.008,0.035-0.008,0.074-0.022,0.11c-0.163,0.487-0.225,0.976-0.187,1.482c0.025,0.351-0.075,0.67-0.297,0.931 c-0.46,0.541-0.246,1.114-0.07,1.661c0.038,0.113,0.102,0.219,0.166,0.324c2.666,3.935,6.775,7.084,12.613,10.006l19.464,9.73 c3.011,1.505,5.326,3.243,5.326,7.064c0,4.288-4.031,7.066-8.663,7.066c-6.95,0-11.1-5.096-11.1-11.002v-1.514h-21.38v3.135 c0,1.177-0.022,2.367,0.118,3.559c0.075-0.072,0.086-0.152,0.121-0.239c0.108-0.265,0.385-0.729,0.765-1.189 c-0.106,0.007-0.222-0.002-0.287-0.042c-0.146-0.083-0.27-0.433-0.208-0.598c0.064-0.174,0.347-0.27,0.558-0.415 c0.219,0.118,0.538,0.196,0.581,0.345c0.414-0.387,0.84-0.662,1.197-0.687c0.01-0.003,0.02,0,0.029-0.003 c0.051,0,0.105-0.021,0.154-0.011c0.223,0.049,0.643,0.496,0.955,0.864c0.056,0.038,0.108,0.076,0.168,0.108 c0.611,0.305,1.104,0.715,1.574,1.209c0.332,0.353,0.798,0.6,1.24,0.826c0.188,0.095,0.468,0.016,0.712,0.016 c0-0.4-0.058-0.747,0.02-1.059c0.051-0.214,0.267-0.415,0.458-0.551c0.105-0.074,0.382-0.074,0.463,0.007 c0.412,0.42,0.691,0.935,0.774,1.524c0.048,0.34-0.023,0.683-0.277,0.93c-0.107,0.104-0.219,0.209-0.331,0.314 c0.05,0.047,0.101,0.092,0.139,0.136c0.196,0.224,0.1,0.713-0.094,0.899c-0.379,0.366-0.853,0.443-1.531,0.466 c-0.176-0.063-0.463-0.147-0.757-0.263c-0.133,0.057-0.267,0.113-0.4,0.172c-1.31-0.507-2.183-1.297-2.351-2.725 c-0.025-0.224-0.209-0.445-0.362-0.634c-0.399-0.484-1.212-0.504-1.534-0.038c-0.287,0.411-0.541,0.843-0.81,1.266 c-0.227,0.355-0.523,0.618-0.857,0.827c2.188,12.826,12.752,25.34,32.112,25.443c0.986,0,1.956-0.054,2.914-0.147 c-0.294-0.45-0.57-0.914-0.848-1.372c-0.12-0.199-0.055-0.557,0.021-0.815c0.032-0.121,0.295-0.177,0.45-0.263 c0.181,0.061,0.393,0.075,0.531,0.183c0.462,0.353,0.885,0.755,1.348,1.11c0.314,0.242,0.551,0.524,0.749,0.847 c5.778-1.011,11.029-3.674,15.254-7.421c0.008-0.791,0.022-1.578,0.071-2.364c0.012-0.175,0.334-0.33,0.473-0.456 c0.628-0.049,1.241,0.283,1.581,0.75c5.117-5.473,8.271-12.681,8.271-20.287C660.771,53.397,650.692,45.173,640.616,40.655 M645.519,26.761c0.062,0.22-0.125,0.444-0.376,0.458c-0.249,0.013-0.448-0.185-0.388-0.43c0.03-0.121,0.141-0.26,0.251-0.317 C645.199,26.375,645.457,26.54,645.519,26.761 M644.013,20.996c0.187-0.167,0.397-0.234,0.651-0.128 c0.298,0.128,0.571,0.275,0.639,0.635c-0.027,0.061-0.045,0.168-0.087,0.181c-0.215,0.059-0.446,0.157-0.651,0.121 c-0.325-0.057-0.557-0.293-0.634-0.629C643.918,21.122,643.965,21.038,644.013,20.996 M642.295,27.475 c0.214-0.061,0.521,0.147,0.471,0.347c-0.053,0.204-0.206,0.381-0.362,0.648c-0.208-0.194-0.447-0.313-0.479-0.473 C641.876,27.769,642.037,27.55,642.295,27.475 M612.689,34.469c-0.234,0.41-0.405,0.788-0.649,1.113 c-0.146,0.192-0.395,0.291-0.671,0.162c-0.315-0.144-0.547-0.355-0.685-0.68c-0.118-0.28,0.01-0.767,0.294-0.848 c0.387-0.115,0.797-0.22,1.197-0.22C612.333,33.992,612.498,34.281,612.689,34.469 M607.253,29.726 c0.317-0.09,0.637-0.172,0.853-0.229c1.017,0.138,1.942,0.17,2.767,0.62c0.113,0.061,0.176,0.255,0.225,0.402 c0.049,0.165-0.057,0.29-0.263,0.329c-0.158,0.028-0.329,0.057-0.487,0.039c-0.329-0.039-0.667-0.081-0.98-0.171 c-0.727-0.214-1.459-0.327-2.216-0.312c-0.136,0.002-0.292-0.121-0.412-0.219C606.635,30.104,606.952,29.811,607.253,29.726 M605.792,30.117c-0.307,0.123-0.691-0.047-0.777-0.356c-0.075-0.275,0.079-0.476,0.285-0.615c0.347-0.234,0.739-0.336,1.151-0.211 c0.191,0.057,0.249,0.208,0.194,0.391C606.535,29.777,606.178,29.96,605.792,30.117 M606.369,37.105 c0.212,0.019,0.463,0.122,0.604,0.276c0.165,0.184-0.154,0.634-0.557,0.704c-0.121-0.073-0.364-0.147-0.475-0.314 C605.768,37.507,606.044,37.08,606.369,37.105 M615.776,39.348c-0.264-0.188-0.538-0.391-0.736-0.646 c-0.33-0.419-0.772-0.625-1.247-0.783c-0.252-0.084-0.528-0.048-0.666,0.173c-0.357,0.568-0.713,1.125-1.261,1.534 c-0.415,0.309-0.621,0.759-0.814,1.233c-0.118,0.294-0.359,0.564-0.605,0.771c-0.249,0.208-0.584,0.404-0.918,0.221 c-0.881-0.481-1.861-0.659-2.786-0.995c-0.514-0.185-0.959-0.202-1.446-0.067c-0.559,0.152-1.066,0.519-1.68,0.408 c-0.144-0.027-0.332-0.123-0.396-0.241c-0.063-0.123-0.063-0.386,0.018-0.46c0.996-0.881,1.956-1.798,3.471-1.651 c0.646,0.062,1.313-0.088,1.964-0.186c0.229-0.033,0.505-0.141,0.642-0.312c0.438-0.538,0.993-0.875,1.616-1.135 c0.149-0.062,0.351-0.155,0.397-0.28c0.375-1.061,1.526-1.215,2.216-1.905c0.264-0.263,0.674-0.124,0.807,0.222 c0.153,0.383,0.282,0.774,0.45,1.253c0.689,0.339,1.424,0.703,2.141,1.056c0.221,0.528,0.128,1.01-0.086,1.472 C616.692,39.393,616.093,39.575,615.776,39.348 M617.398,41.267c-0.055,0.039-0.146,0.029-0.307,0.054 c-0.115-0.137-0.347-0.288-0.382-0.479c-0.113-0.597,0.108-1.113,0.538-1.54c0.164-0.162,0.54-0.154,0.637,0.029 C618.236,39.997,618.035,40.819,617.398,41.267 M602.457,76.125c-0.094,0.105-0.29,0.211-0.41,0.185 c-0.423-0.093-0.727-0.347-0.827-0.798c-0.07-0.306,0.078-0.664,0.358-0.854c0.236-0.158,0.643-0.013,0.82,0.328 c0.111,0.213,0.169,0.455,0.244,0.654C602.572,75.832,602.554,76.015,602.457,76.125 M604.116,82.565 c-0.326-0.069-0.757-0.554-0.768-0.874c-0.012-0.656,0.051-1.305,0.388-1.887c0.073-0.124,0.246-0.188,0.378-0.281 c0.721-0.056,1.535,0.675,1.702,1.471C606.022,81.986,604.852,82.728,604.116,82.565 M605.285,84.471 c-0.063,0.031-0.157-0.005-0.305-0.013c-0.066-0.188-0.261-0.445-0.201-0.604c0.139-0.369,0.396-0.696,0.622-1.027 c0.024-0.039,0.158-0.049,0.217-0.019c0.133,0.073,0.331,0.157,0.356,0.271C606.105,83.618,605.786,84.234,605.285,84.471 M617.091,81.01c0.194-0.196,0.436-0.167,0.667-0.085c0.415,0.152,0.607,0.386,0.59,0.675c-0.022,0.361-0.362,0.662-0.839,0.693 c-0.134,0.01-0.325-0.083-0.405-0.191C616.8,81.703,616.804,81.296,617.091,81.01 M607.687,74.889 c-0.418-0.145-0.67-0.477-0.691-0.909c-0.021-0.472,0.17-0.86,0.538-0.992c0.126-0.042,0.345-0.005,0.427,0.083 c0.368,0.368,0.468,0.84,0.438,1.391C608.391,74.704,607.96,74.985,607.687,74.889 M618.744,89.569 c-0.063,0.098-0.276,0.083-0.488-0.002c0.108,0.417-0.226,0.93-0.653,0.979c-0.963,0.108-1.884-0.044-2.754-0.459 c-0.508-0.243-0.485-1.208-0.46-1.659c0.553,0.167,1.127,0.16,1.703,0.158c0.475,0,0.947,0.002,1.413,0.11 c0.075,0.015,0.138,0.049,0.196,0.083c0-0.135,0.02-0.271,0.052-0.392c0.033-0.126,0.295-0.19,0.453-0.283 c0.46-0.002,0.765,0.229,0.759,0.667C618.964,89.042,618.884,89.342,618.744,89.569 M636.153,90.038 c-0.566,0.334-1.143,0.654-1.737,0.933c-0.129,0.177-0.242,0.372-0.456,0.501c-0.067-0.83-0.313-1.771-0.5-2.599 c-0.198,0.108-0.397,0.219-0.594,0.324c-0.727,0.38-1.477,0.457-2.226,0.075c-0.963-0.489-2.024-0.631-3.053-0.886 c-0.393-0.101-0.802,0.299-0.701,0.667c0.176,0.649,0.309,1.318,0.558,1.939c0.142,0.349,0.345,0.676,0.559,1.009 c1.232,0.005,1.737,1.091,2.321,2.104c0.222,0.383,0.455,0.757,0.747,1.051c-1.225-0.058-2.517-1.208-3.48-1.938 c-0.239,0.132-0.5,0.228-0.77,0.312c0.11,0.199,0.093,0.603-0.065,0.693c-0.574,0.322-1.142,0.667-1.751,0.904 c-0.168,0.066-0.583-0.15-0.688-0.342c-0.274-0.496-0.453-1.043-0.634-1.584c-0.181-0.541,0.305-1.042,1.132-1.045 c-0.02-0.107-0.035-0.218-0.037-0.327c-0.018-0.755-0.295-1.326-0.744-1.756c-0.059,0.504-0.111,0.998-0.182,1.48 c-0.072,0.476-0.732,0.793-1.109,0.533c-0.689-0.477-1.461-0.924-2.092-1.475c-0.407-0.356-0.694-1.098-1.245-1.236 c0.893-0.265,1.721-0.604,2.565-0.958c-0.013-0.062-0.041-0.113-0.048-0.184c-0.046-0.428-0.3-0.679-0.664-0.875 c-0.516-0.281-0.931-0.674-1.232-1.189c-0.181-0.31-0.136-0.727,0.128-1.066c0.201-0.255,0.49-0.396,0.755-0.322 c0.923,0.263,1.833,0.567,2.735,0.896c1.098,0.404,2.201,0.646,3.388,0.656c1.349,0.013,2.693,0.175,4.011,0.541 c0.788,0.219,0.958,0.042,0.958-0.798c-0.005-0.695,0.329-1.111,0.966-1.148c0.383-0.021,0.774,0.005,1.152,0.056 c0.618,0.086,1.083,0.654,0.985,1.229c-0.094,0.559-0.231,1.113-0.361,1.677c0.06,0.002,0.115,0,0.173,0.002 c0.191,0,0.385-0.015,0.578,0.002c0.393,0.034,0.77,0.132,0.936,0.541C636.656,89.005,636.52,89.821,636.153,90.038"/> <path d="M833.829,37.69c-0.533,0.184-0.78-0.144-0.715-0.853c0.008-0.079,0.025-0.163,0.025-0.244c0-0.083-0.018-0.165-0.032-0.319 c-2.141-0.683-4.416-0.85-6.632-1.184c-0.161-0.024-0.324-0.245-0.485-0.245h-9.48V68.57c0,5.445-4.428,7.993-8.597,7.993 c-6.139,0-8.714-3.358-8.714-8.454V44.663c0-0.201-0.453-0.401-0.672-0.61c-0.214-0.204-0.462-0.405-0.648-0.636 c-0.01-0.013-0.018-0.029-0.027-0.042l-0.035-0.018c-0.022-0.026-0.038-0.066-0.048-0.111c-0.045-0.07-0.091-0.134-0.133-0.203 c-0.31,0.513-0.729,0.953-1.298,1.287c-0.126,0.072-0.31,0.034-0.466,0.046c-0.108-0.127-0.307-0.258-0.299-0.378 c0.021-0.445-0.03-0.752-0.576-0.85c-0.04-0.007-0.065-0.043-0.095-0.066l0.002,0.128c-0.093-0.278-0.265-0.425-0.45-0.636 c0.219-0.319,0.854-0.479,1.177-0.726c0.413-0.314,0.777-0.683,1.164-1.025c0.116-0.103,0.311-0.178,0.458-0.165 c0.231,0.022,0.506,0.074,0.667,0.219c0.16,0.146,0.318,0.442,0.283,0.636c-0.07,0.37-0.186,0.716-0.326,1.042 c0.147-0.101,0.319-0.191,0.46-0.268c0.281-0.149,0.862-0.02,0.862,0.139v-7.583h-21.377v33.844 c0,12.295,8.062,25.138,22.252,27.764c-0.015-0.173-0.08-0.335-0.018-0.43c0.201-0.307,0.792-0.459,1.232-0.457 c0.667,0.005,1.225,0.386,1.595,0.948c0.058,0.095,0.08,0.209,0.105,0.334c0.744,0.057,1.493,0.096,2.271,0.098 c0.083-0.183,0.377-0.265,0.538-0.142c0.051,0.037-0.056,0.083-0.016,0.128c3.79-0.079,6.654-0.895,10.728-2.765v6.718 c0,4.636-2.871,7.877-8.199,7.877c-4.17,0-7.807-1.854-8.503-6.371l-3.385-0.018c0.061,0.13,0.104,0.272,0.073,0.415 c-0.04,0.2-0.267,0.359-0.438,0.566c-0.26-0.123-0.519-0.177-0.666-0.337c-0.159-0.165-0.225-0.423-0.305-0.651l-16.984-0.09 c0.158,2.501,0.674,4.946,1.483,7.292c0.096-0.074,0.161-0.211,0.209-0.353c0.099-0.289,0.241-0.566,0.38-0.84 c0.08-0.157,0.513-0.142,0.637-0.012c0.631,0.649,0.918,1.46,1.03,2.33c0.027,0.203-0.075,0.548-0.229,0.628 c-0.57,0.303-0.707,0.791-0.767,1.327c0.224,0.462,0.46,0.921,0.706,1.372c0.201-0.018,0.402-0.039,0.601-0.047 c0.879-0.032,1.489-0.341,1.686-1.31c0.088-0.445,0.39-0.855,0.639-1.252c0.118-0.185,0.324-0.362,0.53-0.438 c0.516-0.185,1.052-0.327,1.587-0.458c0.463-0.11,1.019,0.659,0.848,1.158c-0.053,0.147-0.085,0.312-0.179,0.433 c-0.518,0.69-1.062,1.365-1.574,2.061c-0.134,0.177-0.198,0.409-0.316,0.669c0.51,0.268,1.043,0.44,1.44,0.778 c0.654,0.553,1.234,1.194,1.809,1.836c0.131,0.147,0.126,0.435,0.138,0.659c0.011,0.206-0.297,0.484-0.458,0.459 c-0.152-0.024-0.316-0.018-0.454-0.078c-1.186-0.517-2.433-0.484-3.674-0.478c0.347,0.447,0.708,0.89,1.081,1.32 c0.497-0.013,0.98,0.08,1.474,0.296c0.344,0.154,0.759,0.154,1.142,0.229c0.307,0.057,0.615,0.103,0.915,0.19 c0.46,0.132,0.782,0.616,0.709,1.092c-0.099,0.62-0.229,1.236-0.359,1.851c-0.005,0.029-0.003,0.052-0.008,0.078 c5.09,4.109,11.358,6.659,18.522,6.659c19.809,0,30.239-14.711,30.239-28.38V37.316c0-0.02-0.312-0.039-0.58-0.062 C836.043,37.136,835.036,37.275,833.829,37.69 M779.348,42.861c-0.053-0.034-0.121-0.149-0.105-0.174 c0.141-0.187,0.276-0.388,0.46-0.524c0.05-0.039,0.316,0.092,0.367,0.2c0.051,0.113,0,0.327-0.086,0.432 C779.816,43.004,779.572,43.002,779.348,42.861 M779.949,47.764c-0.075-0.155-0.243-0.35-0.256-0.551 c-0.016-0.343,0.342-0.651,0.58-0.582c0.375,0.108,0.521,0.319,0.471,0.69C780.71,47.575,780.291,47.844,779.949,47.764 M793.705,41.818c-0.021-0.293,0.184-0.409,0.415-0.489c0.229-0.083,0.407,0.062,0.473,0.371c0.06,0.245-0.104,0.43-0.388,0.469 C793.941,42.204,793.719,42.055,793.705,41.818 M794.297,91.209c-0.221,0.047-0.387-0.238-0.352-0.505 c0.035-0.259,0.267-0.455,0.506-0.43c0.231,0.024,0.384,0.248,0.344,0.634C794.669,90.988,794.496,91.166,794.297,91.209 M797.551,93.553c-0.236-0.063-0.382-0.328-0.269-0.575c0.063-0.134,0.206-0.265,0.348-0.317c0.198-0.074,0.444,0.236,0.406,0.487 C797.997,93.429,797.776,93.615,797.551,93.553 M797.907,76.05c-0.134-0.067-0.35-0.108-0.383-0.209 c-0.081-0.233,0.045-0.45,0.264-0.582c0.194-0.113,0.426,0.044,0.514,0.331C798.376,75.826,798.201,76.03,797.907,76.05 M804.419,83.886c0.108,0.017,0.292,0.248,0.271,0.278c-0.113,0.186-0.276,0.338-0.533,0.624c-0.073-0.354-0.155-0.558-0.138-0.749 C804.027,83.969,804.289,83.868,804.419,83.886 M801.812,92.679c-0.108,0.106-0.254,0.294-0.443,0.42 c-0.256,0.175-0.475-0.012-0.631-0.187c-0.348-0.385-0.4-0.862-0.354-1.361c0.03-0.309,0.453-0.541,0.714-0.388 C801.64,91.485,801.9,91.946,801.812,92.679 M802.437,85.858c0.126-0.172,0.335-0.28,0.461-0.381 c0.34,0.115,0.538,0.231,0.541,0.53c0.005,0.275-0.386,0.517-0.717,0.435C802.531,86.396,802.32,86.025,802.437,85.858 M803.388,95.328c-0.075-0.127-0.259-0.299-0.282-0.489c-0.029-0.258,0.21-0.397,0.448-0.413s0.45,0.106,0.513,0.352 C804.137,95.069,803.806,95.376,803.388,95.328 M805.192,92.03c0.06-0.486,0.243-0.916,0.558-1.295 c-0.003-0.005-0.008-0.01-0.01-0.015c-0.408,0.251-0.808,0.509-1.221,0.751c-0.668,0.389-1.234,0.177-1.596-0.584 c-0.227-0.477,0.027-1.056,0.533-1.197c0.605-0.173,1.164-0.137,1.557,0.432c0.188,0.271,0.329,0.579,0.722,0.592l0.045-0.019 c-0.003,0.002-0.005,0.002-0.01,0.005v-0.002c-0.008,0.014-0.011,0.026-0.021,0.036c0.304,0.445,0.794,0.791,0.699,1.447 c-0.058,0.381-0.267,0.695-0.551,0.671C805.483,92.822,805.146,92.421,805.192,92.03 M807.03,95.768 c-0.153,0.219-0.396,0.305-0.649,0.185c-0.221-0.105-0.438-0.239-0.616-0.406c-0.181-0.169-0.286-0.407-0.196-0.672 c0.091-0.283,0.479-0.465,0.811-0.404c0.48,0.084,0.677,0.43,0.808,0.849C807.137,95.466,807.12,95.64,807.03,95.768 M807.855,81.959c-0.592,0.436-1.142,0.943-1.852,1.174c-0.217,0.073-0.522,0.042-0.722-0.067c-0.191-0.101-0.407-0.36-0.407-0.553 c0-0.186,0.221-0.44,0.412-0.54c0.209-0.111,0.493-0.068,0.74-0.106c0.324-0.049,0.668-0.059,0.965-0.184 c0.234-0.098,0.438-0.216,0.689-0.113c0.07,0.026,0.12,0.096,0.178,0.145C807.859,81.797,807.895,81.929,807.855,81.959 M784.486,106.603c-0.121,0.195-0.33,0.337-0.486,0.489c-0.19-0.078-0.414-0.096-0.473-0.204c-0.223-0.43-0.445-0.875-0.565-1.344 c-0.045-0.172,0.148-0.461,0.314-0.615c0.198-0.189,0.461-0.076,0.671,0.062c0.139,0.087,0.271,0.19,0.396,0.301 C784.782,105.699,784.833,106.049,784.486,106.603 M789.327,111.933c-0.073,0.314-0.229,0.445-0.453,0.386 c-0.286-0.074-0.428-0.254-0.361-0.481c0.064-0.242,0.224-0.386,0.484-0.376C789.23,111.468,789.4,111.694,789.327,111.933 M790.622,106.618c-0.385,0.58-0.999,0.855-1.592,1.154c-0.068,0.035-0.171,0.033-0.25,0.013c-0.387-0.106-0.62-0.557-1.105-0.481 c-0.316,0.049-0.646,0.046-0.966,0.005c-0.075-0.01-0.201-0.285-0.168-0.397c0.131-0.426,0.52-0.617,0.877-0.831 c0.835-0.504,1.732-0.553,2.663-0.388c0.305,0.051,0.661,0.447,0.608,0.684C790.669,106.458,790.667,106.552,790.622,106.618 M800.297,111.802c-0.115,0.177-0.465,0.324-0.648,0.239c-0.553-0.263-1.108-0.521-1.647-0.809 c-0.646-0.344-0.963-0.904-1.04-1.638c-0.079-0.754,0.125-1.455,0.321-2.158c0.027-0.089,0.388-0.204,0.473-0.141 c0.95,0.677,1.891,1.364,2.791,2.106c0.199,0.163,0.215,0.541,0.257,0.662C800.792,110.813,800.612,111.331,800.297,111.802"/> </g> </svg>',
            providerId: ''
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
                                            'horror': 'linear-gradient(135deg, #120005, #5b0b12)',
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
                                            'horror': 'linear-gradient(135deg, #120005, #5b0b12)',
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
                                        if (s.id === 'horror') {
                                            Lampa.Activity.push({
                                                url: '',
                                                title: 'Ужасы',
                                                component: 'cinemax_horror',
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
            Lampa.Component.add('cinemax_horror', CinemaXHorror);
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
