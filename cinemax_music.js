// CinemaX Soundtrack Test
// Separate test plugin. Architecture based on the supplied working
// RezkaComment V2 button/modal logic.
//
// Flow:
// Lampa full -> e.data.movie -> TMDB external_ids -> IMDb ID -> MusicBrainz
// -> official soundtrack release -> tracks -> Spotify/YouTube Music/Apple Music.

(function () {
  "use strict";

  if (window.cinemax_soundtrack_test_plugin) return;
  window.cinemax_soundtrack_test_plugin = true;

  const LOG = "[CinemaX Soundtrack Test]";

  function log() {
    try {
      console.log.apply(console, [LOG].concat([].slice.call(arguments)));
    } catch (e) {}
  }

  function getMovieTitle(movie) {
    return movie?.title || movie?.name || movie?.original_title ||
      movie?.original_name || "";
  }

  function getOriginalTitle(movie) {
    return movie?.original_title || movie?.original_name ||
      movie?.title || movie?.name || "";
  }

  function getYear(movie) {
    const date = movie?.release_date || movie?.first_air_date || "";
    return date ? date.slice(0, 4) : "";
  }

  function tmdbGet(path) {
    return new Promise(function (resolve, reject) {
      if (!Lampa.Api?.sources?.tmdb?.get) {
        reject(new Error("TMDB API Lampa недоступен"));
        return;
      }

      Lampa.Api.sources.tmdb.get(path, {}, resolve, reject);
    });
  }

  function mbGet(path) {
    return new Promise(function (resolve, reject) {
      const request = new Lampa.Reguest();

      request.silent(
        "https://musicbrainz.org/ws/2/" +
          path +
          (path.indexOf("?") >= 0 ? "&" : "?") +
          "fmt=json",
        resolve,
        reject
      );
    });
  }

  function externalUrl(url) {
    if (!url) return;

    try {
      if (Lampa.Platform && typeof Lampa.Platform.openUrl === "function") {
        Lampa.Platform.openUrl(url);
        return;
      }
    } catch (e) {
      log("Platform.openUrl error", e);
    }

    try {
      window.open(url, "_blank");
    } catch (e) {
      log("window.open error", e);
    }
  }

  function searchLinks(title, artist) {
    const query = encodeURIComponent(
      ((artist || "") + " " + (title || "")).trim()
    );

    return {
      spotify: "https://open.spotify.com/search/" + query,
      youtube: "https://music.youtube.com/search?q=" + query,
      apple: "https://music.apple.com/us/search?term=" + query
    };
  }

  function artistCredit(credits) {
    if (!Array.isArray(credits)) return "";

    return credits
      .map(function (credit) {
        return credit?.name ||
          credit?.artist?.name ||
          "";
      })
      .filter(Boolean)
      .join("");
  }

  function scoreRelease(release, movieTitle) {
    const title = String(release?.title || "").toLowerCase();
    const film = String(movieTitle || "").toLowerCase();

    let score = 0;

    if (release?.status === "Official") score += 5;
    if (title.indexOf("soundtrack") >= 0) score += 8;
    if (title.indexOf("original motion picture") >= 0) score += 7;
    if (title.indexOf("motion picture") >= 0) score += 4;
    if (title.indexOf("score") >= 0) score += 3;
    if (film && title.indexOf(film) >= 0) score += 3;

    return score;
  }

  function pickRelease(releases, movieTitle) {
    if (!Array.isArray(releases) || !releases.length) return null;

    return releases
      .slice()
      .sort(function (a, b) {
        return scoreRelease(b, movieTitle) - scoreRelease(a, movieTitle);
      })[0] || null;
  }

  async function findSoundtrack(movie) {
    const displayTitle = getMovieTitle(movie);
    const originalTitle = getOriginalTitle(movie);

    if (!movie?.id || !displayTitle) {
      throw new Error("Не удалось определить фильм");
    }

    const type = movie.first_air_date || movie.number_of_seasons
      ? "tv"
      : "movie";

    log(
      "Movie:",
      displayTitle,
      "| original:",
      originalTitle,
      "| TMDB ID:",
      movie.id
    );

    let imdbId = "";

    try {
      const external = await tmdbGet(
        type + "/" + movie.id + "/external_ids"
      );
      imdbId = external?.imdb_id || "";
    } catch (e) {
      log("TMDB external_ids failed:", e);
    }

    /*
     * New strategy:
     *
     * We do NOT select the first MusicBrainz release anymore.
     *
     * A movie can have:
     *   1) songs from the movie / inspired-by soundtrack;
     *   2) original motion picture score;
     *   3) expanded / deluxe / complete score;
     *   4) regional or reissued soundtrack releases.
     *
     * MusicBrainz models these as release-groups -> releases -> recordings.
     * Its API supports release-group searches and browsing releases by
     * release-group, and release groups can have soundtrack as a secondary
     * type. We collect several relevant groups and deduplicate recordings.
     */

    const titles = [];
    [originalTitle, displayTitle].forEach(function (title) {
      if (title && titles.indexOf(title) < 0) titles.push(title);
    });

    const candidates = [];
    const seenGroups = {};

    function addGroup(group, sourceTitle) {
      if (!group?.id || seenGroups[group.id]) return;

      const groupTitle = String(group.title || "").trim();
      if (!groupTitle) return;

      const lower = groupTitle.toLowerCase();
      const wanted = String(sourceTitle || "").toLowerCase();

      let score = 0;

      // Exact / close movie-title match.
      if (lower === wanted) score += 30;
      if (wanted && lower.indexOf(wanted) >= 0) score += 18;

      // Strong soundtrack signals.
      const secondary = (group["secondary-types"] || [])
        .map(function (v) { return String(v).toLowerCase(); });

      const primary = String(group["primary-type"] || "").toLowerCase();

      if (secondary.indexOf("soundtrack") >= 0) score += 35;
      if (lower.indexOf("soundtrack") >= 0) score += 20;
      if (lower.indexOf("original motion picture") >= 0) score += 18;
      if (lower.indexOf("motion picture score") >= 0) score += 25;
      if (lower.indexOf("original score") >= 0) score += 20;
      if (lower.indexOf("score") >= 0) score += 12;
      if (primary === "album") score += 2;

      // Avoid obvious unrelated releases.
      if (
        lower.indexOf("tribute") >= 0 ||
        lower.indexOf("karaoke") >= 0 ||
        lower.indexOf("remix") >= 0
      ) {
        score -= 30;
      }

      candidates.push({
        group: group,
        score: score,
        sourceTitle: sourceTitle
      });

      seenGroups[group.id] = true;
    }

    async function searchGroups(query) {
      try {
        log("MusicBrainz release-group search:", query);

        const result = await mbGet(
          "release-group/?query=" +
            encodeURIComponent(query) +
            "&limit=50"
        );

        return result?.["release-groups"] || [];
      } catch (e) {
        log("release-group search failed:", e);
        return [];
      }
    }

    // Search several ways because soundtrack album titles often contain
    // extra words such as "Music From and Inspired By..." or "Original Score".
    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];

      const queries = [
        title,
        '"' + title + '"',
        title + " soundtrack",
        title + " score"
      ];

      for (let q = 0; q < queries.length; q++) {
        const groups = await searchGroups(queries[q]);

        groups.forEach(function (group) {
          addGroup(group, title);
        });
      }
    }

    /*
     * Prefer groups which explicitly point to the movie's IMDb page.
     * MusicBrainz has a release-group -> IMDb relationship type, so this
     * is much safer than relying only on text similarity.
     */
    const imdbMatches = [];

    if (imdbId && candidates.length) {
      for (let i = 0; i < candidates.length; i++) {
        const item = candidates[i];

        try {
          const details = await mbGet(
            "release-group/" +
              encodeURIComponent(item.group.id) +
              "?inc=url-rels"
          );

          const relations = details?.relations || [];

          const matched = relations.some(function (relation) {
            const resource = relation?.url?.resource || "";
            return resource.indexOf(imdbId) >= 0;
          });

          if (matched) {
            item.score += 100;
            imdbMatches.push(item.group.id);
          }
        } catch (e) {
          // One bad candidate must not stop the whole soundtrack search.
          log("IMDb relation lookup failed:", item.group.id);
        }
      }
    }

    candidates.sort(function (a, b) {
      return b.score - a.score;
    });

    /*
     * Collect the best relevant groups.
     *
     * We intentionally allow several groups:
     * - one main soundtrack;
     * - one original score;
     * - one expanded/complete score if present.
     *
     * Do not pull dozens of random editions. The first few highly ranked
     * unique groups are enough and keeps the number of API requests sane.
     */
    const selected = [];
    const selectedIds = {};

    candidates.forEach(function (item) {
      if (selected.length >= 8) return;

      const title = String(item.group.title || "").toLowerCase();

      const relevant =
        item.score >= 20 ||
        title.indexOf("soundtrack") >= 0 ||
        title.indexOf("score") >= 0 ||
        title.indexOf("motion picture") >= 0;

      if (!relevant) return;

      if (!selectedIds[item.group.id]) {
        selected.push(item);
        selectedIds[item.group.id] = true;
      }
    });

    if (!selected.length) {
      throw new Error(
        "MusicBrainz: подходящие саундтреки не найдены. " +
        "Искали: " + titles.join(" / ")
      );
    }

    log(
      "Selected release groups:",
      selected.map(function (item) {
        return item.group.title + " [" + item.score + "]";
      })
    );

    /*
     * For every selected release-group, browse its releases.
     * We prefer official releases and avoid promotional/bootleg editions.
     */
    const allGroups = [];

    for (let i = 0; i < selected.length; i++) {
      const item = selected[i];

      try {
        const releases = await mbGet(
          "release/?release-group=" +
            encodeURIComponent(item.group.id) +
            "&limit=50&inc=artist-credits"
        );

        const list = releases?.releases || [];

        list.sort(function (a, b) {
          const aScore =
            (a.status === "Official" ? 20 : 0) +
            (a.date ? 3 : 0);

          const bScore =
            (b.status === "Official" ? 20 : 0) +
            (b.date ? 3 : 0);

          return bScore - aScore;
        });

        const official = list.filter(function (release) {
          return !release.status || release.status === "Official";
        });

        allGroups.push({
          group: item.group,
          score: item.score,
          releases: (official.length ? official : list).slice(0, 2)
        });
      } catch (e) {
        log("Release browse failed:", item.group.id);
      }
    }

    const tracks = [];
    const seenTracks = {};

    function normalize(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[’‘`]/g, "'")
        .replace(/\s+/g, " ")
        .trim();
    }

    /*
     * Load each selected release. Recordings are deduplicated by
     * title + artist, so multiple CD/reissue editions won't create
     * 5 copies of the same song.
     */
    for (let g = 0; g < allGroups.length; g++) {
      const groupItem = allGroups[g];

      for (let r = 0; r < groupItem.releases.length; r++) {
        const release = groupItem.releases[r];

        try {
          const details = await mbGet(
            "release/" +
              encodeURIComponent(release.id) +
              "?inc=recordings+artist-credits+url-rels"
          );

          (details?.media || []).forEach(function (media) {
            (media.tracks || []).forEach(function (track) {
              const recording = track.recording || {};

              const title =
                track.title ||
                recording.title ||
                "";

              if (!title) return;

              const artist =
                artistCredit(recording["artist-credit"]) ||
                artistCredit(track["artist-credit"]) ||
                artistCredit(details["artist-credit"]) ||
                "";

              const key =
                normalize(title) +
                "|" +
                normalize(artist);

              if (seenTracks[key]) return;
              seenTracks[key] = true;

              const groupTitle =
                groupItem.group.title || details.title || "";

              const lowerGroup = groupTitle.toLowerCase();

              let category = "soundtrack";

              if (
                lowerGroup.indexOf("score") >= 0 ||
                lowerGroup.indexOf("original music") >= 0 ||
                lowerGroup.indexOf("original motion picture") >= 0 &&
                lowerGroup.indexOf("score") >= 0
              ) {
                category = "score";
              }

              tracks.push({
                position: tracks.length + 1,
                title: title,
                artist: artist,
                length: track.length || recording.length || 0,
                category: category,
                album: groupTitle,
                links: searchLinks(title, artist)
              });
            });
          });
        } catch (e) {
          log("Release lookup failed:", release.id);
        }
      }
    }

    if (!tracks.length) {
      throw new Error(
        "MusicBrainz: релизы найдены, но треки получить не удалось"
      );
    }

    // Put songs first, score second. Within each group keep original order.
    tracks.sort(function (a, b) {
      if (a.category === b.category) return a.position - b.position;
      return a.category === "soundtrack" ? -1 : 1;
    });

    return {
      movieTitle: displayTitle,
      originalTitle: originalTitle,
      imdbId: imdbId,
      groups: allGroups.map(function (item) {
        return {
          title: item.group.title,
          score: item.score
        };
      }),
      album: allGroups[0]?.group?.title || "",
      artist: "",
      date: "",
      tracks: tracks,
      albumLinks: {
        spotify: "",
        apple: "",
        youtube: ""
      }
    };
  }

  async function loadRelease(releaseId, movieTitle, imdbId) {
    const release = await mbGet(
      "release/" +
        encodeURIComponent(releaseId) +
        "?inc=recordings+artist-credits+url-rels"
    );

    if (!release) {
      throw new Error("MusicBrainz: пустой ответ release");
    }

    const albumArtist = artistCredit(release["artist-credit"]);

    const tracks = [];

    (release.media || []).forEach(function (media) {
      (media.tracks || []).forEach(function (track) {
        const recording = track.recording || {};

        const title =
          track.title ||
          recording.title ||
          "";

        if (!title) return;

        const artist =
          artistCredit(recording["artist-credit"]) ||
          artistCredit(track["artist-credit"]) ||
          albumArtist;

        tracks.push({
          position: track.position || tracks.length + 1,
          title: title,
          artist: artist,
          length: track.length || recording.length || 0,
          links: searchLinks(title, artist)
        });
      });
    });

    const albumLinks = {
      spotify: "",
      apple: "",
      youtube: ""
    };

    (release.relations || []).forEach(function (relation) {
      const resource = relation?.url?.resource || "";
      const type = String(relation?.type || "").toLowerCase();

      if (/spotify\.com/i.test(resource)) {
        albumLinks.spotify = resource;
      }

      if (
        /music\.apple\.com|itunes\.apple\.com/i.test(resource)
      ) {
        albumLinks.apple = resource;
      }

      if (
        /music\.youtube\.com|youtube\.com/i.test(resource)
      ) {
        albumLinks.youtube = resource;
      }

      // Keep this intentionally broad for MusicBrainz URL relationships.
      if (type === "streaming page") {
        if (/spotify\.com/i.test(resource)) {
          albumLinks.spotify = resource;
        } else if (/apple/i.test(resource)) {
          albumLinks.apple = resource;
        }
      }
    });

    return {
      movieTitle: movieTitle,
      imdbId: imdbId,
      mbid: release.id,
      album: release.title || "",
      artist: albumArtist,
      date: release.date || "",
      tracks: tracks,
      albumLinks: albumLinks
    };
  }

  function formatTime(milliseconds) {
    const value = Number(milliseconds || 0);

    if (!value || value < 1000) return "";

    const seconds = Math.floor(value / 1000);
    const minutes = Math.floor(seconds / 60);
    const rest = String(seconds % 60).padStart(2, "0");

    return minutes + ":" + rest;
  }

  function openMusic(url) {
    externalUrl(url);
  }

  function musicButton(title, url) {
    const button = $(
      '<div class="selector cinemax-music-btn">' +
        title +
      "</div>"
    );

    button.on("hover:enter", function (event) {
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }

      openMusic(url);
    });

    return button;
  }

  function renderSoundtrack(movie) {
    Lampa.Loading.start();

    findSoundtrack(movie)
      .then(function (data) {
        Lampa.Loading.stop();
        openSoundtrackModal(data);
      })
      .catch(function (error) {
        Lampa.Loading.stop();

        console.error(LOG, error);

        Lampa.Noty.show(
          "Не удалось загрузить саундтрек: " +
          (error?.message || "неизвестная ошибка")
        );
      });
  }

  function openSoundtrackModal(data) {
    const poster =
      data.movieTitle
        ? ""
        : "";

    const modal = $(
      '<div class="cinemax-soundtrack-modal">' +
        '<div class="cinemax-soundtrack-hero">' +
          '<div class="cinemax-soundtrack-hero-overlay"></div>' +
          '<div class="cinemax-soundtrack-info">' +
            '<div class="cinemax-soundtrack-heading">🎵 Саундтрек</div>' +
            '<div class="cinemax-soundtrack-film"></div>' +
            '<div class="cinemax-soundtrack-album"></div>' +
          '</div>' +
        '</div>' +

        '<div class="cinemax-soundtrack-body">' +
          '<div class="cinemax-album-links"></div>' +
          '<div class="cinemax-track-list"></div>' +
        '</div>' +
      "</div>"
    );

    modal.find(".cinemax-soundtrack-film").text(data.movieTitle);

    modal.find(".cinemax-soundtrack-album").text(
      data.album +
      (data.artist ? " • " + data.artist : "")
    );

    const albumLinks = modal.find(".cinemax-album-links");

    if (data.albumLinks.spotify) {
      albumLinks.append(
        musicButton("Spotify", data.albumLinks.spotify)
      );
    }

    if (data.albumLinks.youtube) {
      albumLinks.append(
        musicButton("YouTube Music", data.albumLinks.youtube)
      );
    }

    if (data.albumLinks.apple) {
      albumLinks.append(
        musicButton("Apple Music", data.albumLinks.apple)
      );
    }

    // If MusicBrainz only has album-level links, track-level search
    // still provides a direct service search for every song.
    const list = modal.find(".cinemax-track-list");

    // Tabs: All / Soundtrack / Score.
    const tabs = $(
      '<div class="cinemax-track-tabs">' +
        '<div class="selector cinemax-track-tab focus" data-filter="all">Все</div>' +
        '<div class="selector cinemax-track-tab" data-filter="soundtrack">Саундтрек</div>' +
        '<div class="selector cinemax-track-tab" data-filter="score">Оригинальная музыка</div>' +
      "</div>"
    );

    modal.find(".cinemax-soundtrack-body").prepend(tabs);

    function renderTracks(filter) {
      list.empty();

      const filtered = data.tracks.filter(function (track) {
        return filter === "all" || track.category === filter;
      });

      filtered.forEach(function (track) {
        const row = $(
          '<div class="cinemax-track selector">' +
            '<div class="cinemax-track-number"></div>' +
            '<div class="cinemax-track-main">' +
              '<div class="cinemax-track-title"></div>' +
              '<div class="cinemax-track-artist"></div>' +
            '</div>' +
            '<div class="cinemax-track-time"></div>' +
            '<div class="cinemax-track-services"></div>' +
          "</div>"
        );

        row.find(".cinemax-track-number").text(
          String(track.position).padStart(2, "0")
        );

        row.find(".cinemax-track-title").text(track.title);
        row.find(".cinemax-track-artist").text(
          track.artist || "Исполнитель не указан"
        );
        row.find(".cinemax-track-time").text(
          formatTime(track.length)
        );

        const services = row.find(".cinemax-track-services");

        services.append(
          musicButton("Spotify", track.links.spotify)
        );

        services.append(
          musicButton("YT Music", track.links.youtube)
        );

        services.append(
          musicButton("Apple", track.links.apple)
        );

        row.on("hover:enter", function (event) {
          if (event && event.stopPropagation) {
            event.stopPropagation();
          }

          openMusic(track.links.spotify);
        });

        list.append(row);
      });

      if (!filtered.length) {
        list.append(
          '<div class="cinemax-track-empty">' +
            "В этом разделе треков не найдено." +
          "</div>"
        );
      }
    }

    tabs.find(".cinemax-track-tab").on("hover:enter", function (event) {
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }

      tabs.find(".cinemax-track-tab").removeClass("focus");
      $(this).addClass("focus");

      renderTracks($(this).attr("data-filter"));
    });

    renderTracks("all");


    if (!document.getElementById("cinemax-soundtrack-test-style")) {
      const style = document.createElement("style");

      style.id = "cinemax-soundtrack-test-style";

      style.textContent = `
        .cinemax-soundtrack-modal{
          position:relative;
          margin:-10px -10px 0;
          background:#151718;
          color:#fff;
          min-height:100%;
          overflow:hidden;
        }

        .cinemax-soundtrack-modal::before{
          content:"";
          position:absolute;
          inset:0;
          pointer-events:none;
          background:
            radial-gradient(
              ellipse at 50% 0%,
              rgba(255,255,255,.07),
              transparent 55%
            ),
            linear-gradient(
              to bottom,
              rgba(21,23,24,0),
              #151718 55%
            );
        }

        .cinemax-soundtrack-modal > *{
          position:relative;
          z-index:1;
        }

        .cinemax-soundtrack-hero{
          position:relative;
          height:190px;
          display:flex;
          align-items:flex-end;
          background:
            linear-gradient(
              to bottom,
              rgba(0,0,0,.08),
              #151718 100%
            );
        }

        .cinemax-soundtrack-info{
          width:100%;
          padding:24px 20px 18px;
          box-sizing:border-box;
        }

        .cinemax-soundtrack-heading{
          font-size:28px;
          line-height:1.1;
          font-weight:800;
          margin-bottom:8px;
        }

        .cinemax-soundtrack-film{
          font-size:19px;
          font-weight:700;
          color:rgba(255,255,255,.92);
        }

        .cinemax-soundtrack-album{
          margin-top:6px;
          font-size:14px;
          color:rgba(255,255,255,.55);
        }

        .cinemax-soundtrack-body{
          padding:8px 12px 24px;
        }

        .cinemax-album-links{
          display:flex;
          flex-wrap:wrap;
          gap:7px;
          margin:4px 0 14px;
        }

        .cinemax-music-btn{
          display:flex;
          align-items:center;
          justify-content:center;
          min-height:34px;
          padding:0 11px;
          box-sizing:border-box;
          border-radius:10px;
          background:rgba(255,255,255,.075);
          border:1px solid rgba(255,255,255,.09);
          color:rgba(255,255,255,.88);
          font-size:12px;
          white-space:nowrap;
        }

        .cinemax-music-btn.focus{
          background:rgba(255,255,255,.17);
          border-color:rgba(255,255,255,.24);
        }

        .cinemax-track{
          display:flex;
          align-items:center;
          gap:10px;
          width:100%;
          min-height:70px;
          padding:9px 8px;
          margin-bottom:5px;
          box-sizing:border-box;
          border-radius:13px;
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,255,255,.045);
        }

        .cinemax-track.focus{
          background:rgba(255,255,255,.095);
          border-color:rgba(255,255,255,.13);
        }

        .cinemax-track-number{
          width:30px;
          flex:0 0 30px;
          text-align:center;
          font-size:12px;
          color:rgba(255,255,255,.35);
          font-weight:700;
        }

        .cinemax-track-main{
          min-width:0;
          flex:1 1 auto;
        }

        .cinemax-track-title{
          font-size:15px;
          line-height:1.25;
          font-weight:700;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .cinemax-track-artist{
          margin-top:4px;
          font-size:12px;
          color:rgba(255,255,255,.52);
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .cinemax-track-time{
          flex:0 0 auto;
          min-width:38px;
          text-align:right;
          font-size:11px;
          color:rgba(255,255,255,.38);
        }

        .cinemax-track-services{
          display:flex;
          flex:0 0 auto;
          gap:4px;
        }

        .cinemax-track-services .cinemax-music-btn{
          min-height:30px;
          padding:0 7px;
          border-radius:8px;
          font-size:10px;
        }

        .cinemax-track-empty{
          padding:25px 10px;
          text-align:center;
          color:rgba(255,255,255,.55);
        }

        .cinemax-track-tabs{
          display:flex;
          gap:7px;
          margin:6px 0 12px;
          padding:0 1px;
          overflow-x:auto;
          scrollbar-width:none;
        }

        .cinemax-track-tabs::-webkit-scrollbar{
          display:none;
        }

        .cinemax-track-tab{
          flex:0 0 auto;
          min-height:34px;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:0 13px;
          border-radius:10px;
          background:rgba(255,255,255,.055);
          border:1px solid rgba(255,255,255,.07);
          color:rgba(255,255,255,.58);
          font-size:12px;
          white-space:nowrap;
        }

        .cinemax-track-tab.focus{
          background:rgba(255,255,255,.14);
          border-color:rgba(255,255,255,.18);
          color:#fff;
        }

        @media (max-width:600px){
          .cinemax-soundtrack-hero{
            height:180px;
          }

          .cinemax-soundtrack-heading{
            font-size:25px;
          }

          .cinemax-soundtrack-film{
            font-size:18px;
          }

          .cinemax-track{
            display:grid;
            grid-template-columns:30px minmax(0,1fr);
            grid-template-rows:auto auto;
            column-gap:10px;
            row-gap:7px;
            min-height:0;
            padding:12px 10px;
          }

          .cinemax-track-number{
            grid-column:1;
            grid-row:1;
            align-self:start;
            padding-top:2px;
          }

          .cinemax-track-main{
            grid-column:2;
            grid-row:1;
            min-width:0;
          }

          .cinemax-track-time{
            display:none;
          }

          .cinemax-track-services{
            grid-column:2;
            grid-row:2;
            display:flex;
            width:100%;
            gap:6px;
          }

          .cinemax-track-services .cinemax-music-btn{
            flex:1 1 0;
            min-height:32px;
            padding:0 5px;
            border-radius:8px;
            font-size:10px;
          }

          .cinemax-track{
            padding-right:10px;
          }
        }
      `;

      document.head.appendChild(style);
    }

    Lampa.Modal.open({
      title: "",
      html: modal,
      size: "large",
      style: "margin-top:10px;",
      mask: true,
      onBack: function () {
        Lampa.Modal.close();
        $(".modal--large").remove();
        Lampa.Controller.toggle("content");
      }
    });

    const modalHead = document.querySelector(".modal__head");

    if (modalHead) {
      modalHead.style.position = "relative";

      modalHead.innerHTML =
        '<div style="' +
          "position:absolute;" +
          "top:50%;" +
          "left:18px;" +
          "right:58px;" +
          "transform:translateY(-50%);" +
          "font-size:15px;" +
          "font-weight:700;" +
          "white-space:nowrap;" +
          "overflow:hidden;" +
          "text-overflow:ellipsis;" +
          "pointer-events:none;" +
        '">' +
        "Саундтрек" +
        "</div>" +
        '<button type="button" class="cinemax-soundtrack-close selector" ' +
          'aria-label="Закрыть" ' +
          'style="' +
            "position:absolute;" +
            "top:7px;" +
            "right:7px;" +
            "z-index:9999;" +
            "width:36px;" +
            "height:36px;" +
            "border:1px solid rgba(255,255,255,.22);" +
            "border-radius:50%;" +
            "background:rgba(18,20,21,.72);" +
            "color:#fff;" +
            "font-size:25px;" +
            "line-height:30px;" +
            "padding:0;" +
          '">' +
          "×" +
        "</button>";

      $(".cinemax-soundtrack-close").on(
        "hover:enter",
        function () {
          Lampa.Modal.close();
          $(".modal--large").remove();
          Lampa.Controller.toggle("content");
        }
      );
    }
  }

  function addButton(e) {
    if (!e?.data?.movie) return;

    $(".button--cinemax-soundtrack-test").remove();

    const button = $(
      '<div class="full-start__button selector button--cinemax-soundtrack-test">' +
        '<span style="' +
          "display:inline-flex;" +
          "align-items:center;" +
          "justify-content:center;" +
          "font-size:1.15em;" +
          "margin-right:.35em;" +
        '">♫</span>' +
        "<span>Саундтрек</span>" +
      "</div>"
    );

    $(".full-start-new__buttons").append(button);

    button.on("hover:enter", function () {
      const movie = e.data.movie || {};

      log(
        "OPEN SOUNDTRACK:",
        getMovieTitle(movie),
        getYear(movie),
        "TMDB:",
        movie.id
      );

      renderSoundtrack(movie);
    });
  }

  function startPlugin() {
    Lampa.Listener.follow("full", function (e) {
      if (e.type === "complite") {
        addButton(e);
      }
    });

    log("Plugin loaded");
  }

  startPlugin();
})();
