/*
 * Movie Info Ultra v2 — Lampa
 * Standalone movie/series information card.
 * Uses Lampa/TMDB data + optional Fanart.tv Personal API Key.
 *
 * No dependency on the Rezka comments plugin.
 */
(function () {
    "use strict";

    if (window.__movie_info_ultra_loaded) return;
    window.__movie_info_ultra_loaded = true;

    var COMPONENT = "movie_info_ultra";
    var KEY = "movie_info_ultra_fanart_key";
    var CACHE_PREFIX = "movie_info_ultra_cache_";
    var CACHE_TTL = 24 * 60 * 60 * 1000;

    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function imageUrl(path, size) {
        if (!path) return "";
        if (/^https?:\/\//i.test(path)) return path;
        return "https://image.tmdb.org/t/p/" + (size || "w780") + path;
    }

    function yearOf(movie) {
        return String(movie.release_date || movie.first_air_date || "").slice(0, 4);
    }

    function isTV(movie) {
        return !!(movie.first_air_date || movie.number_of_seasons || movie.name);
    }

    function runtimeText(minutes) {
        minutes = Number(minutes || 0);
        if (!minutes) return "";
        var h = Math.floor(minutes / 60);
        var m = minutes % 60;
        if (h && m) return h + " ч " + m + " мин";
        if (h) return h + " ч";
        return m + " мин";
    }

    function money(value) {
        value = Number(value || 0);
        if (!value) return "";
        if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace(".0", "") + " млрд $";
        if (value >= 1000000) return Math.round(value / 1000000) + " млн $";
        if (value >= 1000) return Math.round(value / 1000) + " тыс. $";
        return value.toLocaleString("ru-RU") + " $";
    }

    function cacheGet(key) {
        try {
            var raw = Lampa.Storage.get(CACHE_PREFIX + key, "");
            if (!raw) return null;
            var data = JSON.parse(raw);
            if (!data || Date.now() - data.time > CACHE_TTL) return null;
            return data.value;
        } catch (e) {
            return null;
        }
    }

    function cacheSet(key, value) {
        try {
            Lampa.Storage.set(CACHE_PREFIX + key, JSON.stringify({
                time: Date.now(),
                value: value
            }));
        } catch (e) {}
    }

    function tmdbGet(path) {
        return new Promise(function (resolve, reject) {
            try {
                if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb &&
                    typeof Lampa.Api.sources.tmdb.get === "function") {
                    Lampa.Api.sources.tmdb.get(path, {}, resolve, reject);
                    return;
                }

                // Fallback для сборок Lampa, где источник TMDB недоступен напрямую.
                var req = new Lampa.Reguest();
                req.silent(
                    "https://api.themoviedb.org/3/" + path,
                    resolve,
                    reject
                );
            } catch (e) {
                reject(e);
            }
        });
    }

    function getFanartKey() {
        return String(Lampa.Storage.get(KEY, "") || "").trim();
    }

    function fanartGet(type, id) {
        var key = getFanartKey();
        if (!key || !id) return Promise.resolve(null);

        var cacheKey = "fanart_" + type + "_" + id;
        var cached = cacheGet(cacheKey);
        if (cached) return Promise.resolve(cached);

        var url = "https://webservice.fanart.tv/v3.2/" +
            type + "/" + encodeURIComponent(String(id)) +
            "?client_key=" + encodeURIComponent(key);

        return new Promise(function (resolve) {
            try {
                var req = new Lampa.Reguest();
                req.silent(
                    url,
                    function (data) {
                        cacheSet(cacheKey, data);
                        resolve(data);
                    },
                    function (err) {
                        console.warn("[Movie Info Ultra] Fanart:", err);
                        resolve(null);
                    }
                );
            } catch (e) {
                console.warn("[Movie Info Ultra] Fanart request:", e);
                resolve(null);
            }
        });
    }

    function fanartImages(data) {
        if (!data) return [];
        var groups = [
            "moviebackground",
            "movieart",
            "movieposter",
            "moviethumb",
            "hdmovieclearart",
            "hdmovielogo"
        ];
        var result = [];
        groups.forEach(function (group) {
            (Array.isArray(data[group]) ? data[group] : []).forEach(function (item) {
                if (item && item.url) result.push({
                    url: String(item.url).replace(/^http:/, "https:"),
                    type: group,
                    lang: item.lang || "",
                    likes: Number(item.likes || 0)
                });
            });
        });
        result.sort(function (a, b) {
            return b.likes - a.likes;
        });
        return result;
    }

    function tmdbGallery(data) {
        var list = data && data.images && Array.isArray(data.images.backdrops)
            ? data.images.backdrops : [];
        return list.map(function (x) {
            return {
                url: imageUrl(x.file_path, "w1280"),
                type: "TMDB",
                lang: x.iso_639_1 || ""
            };
        }).filter(function (x) { return x.url; });
    }

    function uniqueImages(list) {
        var seen = {};
        return list.filter(function (x) {
            if (!x || !x.url || seen[x.url]) return false;
            seen[x.url] = true;
            return true;
        });
    }

    function makeChip(label, value) {
        if (!value) return "";
        return '<span class="miu-chip"><b>' + esc(value) + '</b><small>' + esc(label) + '</small></span>';
    }

    function closeModal() {
        try { Lampa.Modal.close(); } catch (e) {}
        $(".miu-page").remove();
        $(".miu-gallery").remove();
        try { Lampa.Controller.toggle("content"); } catch (e) {}
    }

    function openGallery(images, start) {
        if (!images || !images.length) return;

        var index = Math.max(0, Math.min(Number(start || 0), images.length - 1));

        $(".miu-gallery").remove();

        var gallery = $(
            '<div class="miu-gallery">' +
                '<div class="miu-gallery-bg"></div>' +
                '<button class="miu-g-close selector" type="button">×</button>' +
                '<button class="miu-g-prev selector" type="button">‹</button>' +
                '<img class="miu-g-image" src="" alt="">' +
                '<button class="miu-g-next selector" type="button">›</button>' +
                '<div class="miu-g-count"></div>' +
            '</div>'
        );

        $("body").append(gallery);

        function render() {
            var item = images[index];
            gallery.find(".miu-g-image").attr("src", item.url);
            gallery.find(".miu-g-count").text((index + 1) + " / " + images.length);
        }

        gallery.on("click", ".miu-g-close", function (e) {
            e.preventDefault();
            e.stopPropagation();
            gallery.remove();
        });

        gallery.on("click", ".miu-g-prev", function (e) {
            e.preventDefault();
            e.stopPropagation();
            index = (index - 1 + images.length) % images.length;
            render();
        });

        gallery.on("click", ".miu-g-next", function (e) {
            e.preventDefault();
            e.stopPropagation();
            index = (index + 1) % images.length;
            render();
        });

        var touchX = 0;
        gallery.on("touchstart", function (e) {
            var t = e.originalEvent.touches && e.originalEvent.touches[0];
            if (t) touchX = t.clientX;
        });
        gallery.on("touchend", function (e) {
            var t = e.originalEvent.changedTouches && e.originalEvent.changedTouches[0];
            if (!t) return;
            var dx = t.clientX - touchX;
            if (Math.abs(dx) > 45) {
                index = dx < 0
                    ? (index + 1) % images.length
                    : (index - 1 + images.length) % images.length;
                render();
            }
        });

        $(document).off("keydown.miuGallery").on("keydown.miuGallery", function (e) {
            if (!$(".miu-gallery").length) return;
            if (e.key === "ArrowRight") {
                index = (index + 1) % images.length;
                render();
            } else if (e.key === "ArrowLeft") {
                index = (index - 1 + images.length) % images.length;
                render();
            } else if (e.key === "Escape") {
                gallery.remove();
            }
        });

        render();
    }

    function openPerson(name) {
        // Intentionally conservative: use Lampa's search screen rather than
        // depending on private/unstable category internals.
        if (!name) return;
        try {
            Lampa.Activity.push({
                component: "search",
                search: name,
                page: 1,
                title: name
            });
        } catch (e) {
            try { Lampa.Noty.show("Поиск: " + name); } catch (ignore) {}
        }
    }

    function renderPeople(movie) {
        var credits = movie.credits || {};
        var cast = Array.isArray(credits.cast) ? credits.cast.slice(0, 18) : [];
        var crew = Array.isArray(credits.crew) ? credits.crew : [];

        var directors = crew.filter(function (x) { return x.job === "Director"; }).slice(0, 6);
        var writers = crew.filter(function (x) {
            return /Writer|Screenplay|Story/i.test(String(x.job || ""));
        }).slice(0, 8);

        var html = "";

        if (directors.length) {
            html += '<div class="miu-section"><h3>РЕЖИССЁР</h3><div class="miu-people">';
            directors.forEach(function (p) {
                html += '<div class="miu-person selector" data-person="' + esc(p.name) + '">' +
                    (p.profile_path ? '<img src="' + esc(imageUrl(p.profile_path, "w185")) + '">' : '<div class="miu-person-empty">●</div>') +
                    '<b>' + esc(p.name) + '</b><small>Режиссёр</small></div>';
            });
            html += "</div></div>";
        }

        if (cast.length) {
            html += '<div class="miu-section"><h3>АКТЁРЫ</h3><div class="miu-people">';
            cast.forEach(function (p) {
                html += '<div class="miu-person selector" data-person="' + esc(p.name) + '">' +
                    (p.profile_path ? '<img src="' + esc(imageUrl(p.profile_path, "w185")) + '">' : '<div class="miu-person-empty">●</div>') +
                    '<b>' + esc(p.name) + '</b><small>' + esc(p.character || "Актёр") + '</small></div>';
            });
            html += "</div></div>";
        }

        if (writers.length) {
            html += '<div class="miu-section"><h3>СЦЕНАРИЙ</h3><div class="miu-credit-list">';
            writers.forEach(function (p) {
                html += '<span class="miu-credit selector" data-person="' + esc(p.name) + '">' +
                    esc(p.name) + '<small>' + esc(p.job) + '</small></span>';
            });
            html += "</div></div>";
        }

        return html;
    }

    function openInfo(movie) {
        Lampa.Loading.start();

        var type = isTV(movie) ? "tv" : "movie";
        var id = movie.id;
        var cacheKey = type + "_" + id;
        var cached = cacheGet("details_" + cacheKey);

        var detailsPromise = cached
            ? Promise.resolve(cached)
            : tmdbGet(type + "/" + id + "?append_to_response=credits,images,external_ids,recommendations,videos,translations");

        detailsPromise.then(function (details) {
            details = details || movie;
            if (!cached) cacheSet("details_" + cacheKey, details);

            var fanartIdPromise;
            if (type === "movie") {
                fanartIdPromise = Promise.resolve(String(details.id || id));
            } else {
                var tvdb = details.external_ids && details.external_ids.tvdb_id;
                fanartIdPromise = Promise.resolve(tvdb ? String(tvdb) : "");
            }

            return fanartIdPromise.then(function (fanartId) {
                return fanartGet(type === "movie" ? "movies" : "tv", fanartId).then(function (fanart) {
                    return { details: details, fanart: fanart };
                });
            });
        }).then(function (payload) {
            Lampa.Loading.stop();
            renderModal(payload.details, payload.fanart);
        }).catch(function (e) {
            Lampa.Loading.stop();
            console.error("[Movie Info Ultra]", e);
            renderModal(movie, null);
        });
    }

    function renderModal(movie, fanart) {
        var type = isTV(movie) ? "tv" : "movie";
        var title = movie.title || movie.name || "Подробнее";
        var original = movie.original_title || movie.original_name || "";
        var backdrop = imageUrl(movie.backdrop_path, "w1280") ||
            imageUrl(movie.poster_path, "w780");

        var fan = fanartImages(fanart);
        var galleryImages = uniqueImages(
            fan.filter(function (x) {
                return /moviebackground|movieart|moviethumb/i.test(x.type);
            }).concat(tmdbGallery(movie))
        );

        var genres = Array.isArray(movie.genres)
            ? movie.genres.map(function (g) { return g.name; }).filter(Boolean)
            : [];

        var runtime = movie.runtime ||
            (Array.isArray(movie.episode_run_time) ? movie.episode_run_time[0] : 0);

        var chips = "";
        if (movie.vote_average) chips += makeChip("TMDB", Number(movie.vote_average).toFixed(1));
        if (movie.vote_count) chips += makeChip("оценок", Number(movie.vote_count).toLocaleString("ru-RU"));
        if (yearOf(movie)) chips += makeChip("год", yearOf(movie));
        if (runtime) chips += makeChip("время", runtimeText(runtime));
        if (type === "tv" && movie.number_of_seasons) chips += makeChip("сезонов", movie.number_of_seasons);
        if (type === "tv" && movie.number_of_episodes) chips += makeChip("серий", movie.number_of_episodes);

        var info = "";
        if (genres.length) info += '<div class="miu-info-row"><b>ЖАНРЫ</b><span>' + esc(genres.join(" • ")) + '</span></div>';
        if (movie.origin_country && movie.origin_country.length) info += '<div class="miu-info-row"><b>СТРАНЫ</b><span>' + esc(movie.origin_country.join(" • ")) + '</span></div>';
        if (movie.release_date || movie.first_air_date) info += '<div class="miu-info-row"><b>ДАТА ВЫХОДА</b><span>' + esc(movie.release_date || movie.first_air_date) + '</span></div>';
        if (movie.status) info += '<div class="miu-info-row"><b>СТАТУС</b><span>' + esc(movie.status) + '</span></div>';
        if (movie.budget) info += '<div class="miu-info-row"><b>БЮДЖЕТ</b><span>' + esc(money(movie.budget)) + '</span></div>';
        if (movie.revenue) info += '<div class="miu-info-row"><b>СБОРЫ</b><span>' + esc(money(movie.revenue)) + '</span></div>';
        if (movie.imdb_id || (movie.external_ids && movie.external_ids.imdb_id)) {
            info += '<div class="miu-info-row"><b>IMDb ID</b><span>' +
                esc(movie.imdb_id || movie.external_ids.imdb_id) + '</span></div>';
        }
        info += '<div class="miu-info-row"><b>TMDB ID</b><span>' + esc(movie.id) + '</span></div>';

        var modal = $(
            '<div class="miu-page" style="--miu-backdrop:url(\'' + esc(backdrop) + '\')">' +
                '<div class="miu-head">' +
                    '<div class="miu-head-title">Подробнее</div>' +
                    '<button class="miu-close selector" type="button">×</button>' +
                '</div>' +

                '<div class="miu-hero">' +
                    (backdrop ? '<img src="' + esc(backdrop) + '" alt="">' : '') +
                    '<div class="miu-hero-gradient"></div>' +
                    '<div class="miu-hero-info">' +
                        '<h1>' + esc(title) + '</h1>' +
                        (original && original !== title ? '<div class="miu-original">' + esc(original) + '</div>' : '') +
                        '<div class="miu-chips">' + chips + '</div>' +
                    '</div>' +
                '</div>' +

                (movie.tagline ? '<div class="miu-tagline">«' + esc(movie.tagline) + '»</div>' : '') +

                '<div class="miu-body">' +
                    (movie.overview ? '<div class="miu-section"><h3>ОПИСАНИЕ</h3><div class="miu-description">' + esc(movie.overview) + '</div></div>' : '') +
                    (info ? '<div class="miu-section"><h3>ИНФОРМАЦИЯ</h3><div class="miu-info">' + info + '</div></div>' : '') +

                    (galleryImages.length ? '<div class="miu-section"><h3>КАДРЫ ИЗ ФИЛЬМА <small>' + galleryImages.length + '</small></h3><div class="miu-gallery-grid">' +
                        galleryImages.map(function (x, i) {
                            return '<div class="miu-gallery-card selector" data-gallery-index="' + i + '">' +
                                '<img loading="lazy" src="' + esc(x.url) + '" alt="">' +
                                '<span>⌕</span>' +
                            '</div>';
                        }).join("") +
                    '</div></div>' : '') +

                    renderPeople(movie) +

                    (movie.recommendations && Array.isArray(movie.recommendations.results) && movie.recommendations.results.length
                        ? '<div class="miu-section"><h3>ПОХОЖИЕ ФИЛЬМЫ И СЕРИАЛЫ</h3><div class="miu-similar">' +
                            movie.recommendations.results.slice(0, 12).map(function (x) {
                                var img = imageUrl(x.poster_path, "w342");
                                if (!img) return "";
                                return '<div class="miu-similar-card selector" data-similar-id="' + esc(x.id) + '">' +
                                    '<img src="' + esc(img) + '" alt=""><b>' + esc(x.title || x.name || "") + '</b>' +
                                '</div>';
                            }).join("") +
                        '</div></div>' : '') +

                    '<div class="miu-footer">Movie Info Ultra • TMDB' + (getFanartKey() ? ' • Fanart.tv' : '') + '</div>' +
                '</div>' +
            '</div>'
        );

        $(".miu-page").remove();
        modal.on("click", ".miu-close", function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });

        modal.on("click", ".miu-gallery-card", function (e) {
            e.preventDefault();
            e.stopPropagation();
            openGallery(galleryImages, Number($(this).attr("data-gallery-index") || 0));
        });

        modal.on("click", ".miu-person, .miu-credit", function (e) {
            e.preventDefault();
            e.stopPropagation();
            openPerson($(this).attr("data-person") || "");
        });

        modal.on("click", ".miu-similar-card", function (e) {
            e.preventDefault();
            e.stopPropagation();
            var sid = $(this).attr("data-similar-id");
            if (!sid) return;
            var base = movie;
            var next = Object.assign({}, base, { id: Number(sid) });
            try { closeModal(); } catch (ignore) {}
            setTimeout(function () { openInfo(next); }, 120);
        });

        Lampa.Modal.open({
            title: "",
            html: modal,
            size: "large",
            style: "margin-top:
