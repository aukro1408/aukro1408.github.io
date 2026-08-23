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
      "| TMDB:",
      movie.id
    );

    let imdbId = "";

    // IMDb is useful for diagnostics, but MUST NOT be used to make
    // dozens of extra MusicBrainz requests.
    try {
      const external = await tmdbGet(
        type + "/" + movie.id + "/external_ids"
      );
      imdbId = external?.imdb_id || "";
    } catch (e) {
      log("TMDB external_ids failed:", e);
    }

    const titles = [];
    [originalTitle, displayTitle].forEach(function (title) {
      if (title && titles.indexOf(title) < 0) titles.push(title);
    });

    /*
     * V5 performance fix.
     *
     * The previous version could make:
     *   many release-group searches
     *   + an IMDb relation request for every candidate
     *   + several release requests
     *   + several release-detail requests
     *
     * MusicBrainz is rate-limited, so that can look like an endless
     * loading spinner on a TV/mobile client.
     *
     * We now deliberately keep discovery small:
     *   2 title searches
     *   1 soundtrack search
     *   1 score search
     *   max 4 release groups
     *   max 1 official release per group
     *
     * This gives us enough data to prove the multi-album logic without
     * hammering MusicBrainz.
     */

    const candidates = [];
    const seenGroups = {};

    function scoreGroup(group, wanted) {
      const title = String(group?.title || "").toLowerCase();
      const queryTitle = String(wanted || "").toLowerCase();

      let score = 0;

      if (title === queryTitle) score += 40;
      if (queryTitle && title.indexOf(queryTitle) >= 0) score += 25;

      const secondary = (group["secondary-types"] || [])
        .map(function (v) {
          return String(v).toLowerCase();
        });

      const primary = String(group["primary-type"] || "").toLowerCase();

      if (secondary.indexOf("soundtrack") >= 0) score += 35;
      if (title.indexOf("soundtrack") >= 0) score += 25;
      if (title.indexOf("motion picture") >= 0) score += 20;
      if (title.indexOf("score") >= 0) score += 18;
      if (title.indexOf("original score") >= 0) score += 12;
      if (primary === "album") score += 2;

      if (
        title.indexOf("tribute") >= 0 ||
        title.indexOf("karaoke") >= 0 ||
        title.indexOf("remix") >= 0
      ) {
        score -= 35;
      }

      return score;
    }

    function addGroups(groups, wanted) {
      (groups || []).forEach(function (group) {
        if (!group?.id || seenGroups[group.id]) return;

        const score = scoreGroup(group, wanted);

        if (score < 15) return;

        seenGroups[group.id] = true;

        candidates.push({
          group: group,
          score: score
        });
      });
    }

    async function searchGroups(query) {
      try {
        log("MB release-group:", query);

        const result = await mbGet(
          "release-group/?query=" +
            encodeURIComponent(query) +
            "&limit=20"
        );

        return result?.["release-groups"] || [];
      } catch (e) {
        log("MB group search failed:", e);
        return [];
      }
    }

    // Only four discovery calls maximum.
    const queries = [];

    if (originalTitle) queries.push(originalTitle);
    if (displayTitle && displayTitle !== originalTitle) {
      queries.push(displayTitle);
    }

    if (originalTitle) {
      queries.push(originalTitle + " soundtrack");
      queries.push(originalTitle + " score");
    }

    const uniqueQueries = [];
    queries.forEach(function (q) {
      if (uniqueQueries.indexOf(q) < 0) uniqueQueries.push(q);
    });

    for (let i = 0; i < Math.min(uniqueQueries.length, 4); i++) {
      const groups = await searchGroups(uniqueQueries[i]);
      addGroups(groups, originalTitle || displayTitle);
    }

    candidates.sort(function (a, b) {
      return b.score - a.score;
    });

    // At most four relevant release groups.
    const selected = candidates.slice(0, 4);

    if (!selected.length) {
      throw new Error(
        "MusicBrainz: саундтрек не найден. " +
        "Искали: " + titles.join(" / ")
      );
    }

    log(
      "Selected groups:",
      selected.map(function (item) {
        return item.group.title + " [" + item.score + "]";
      })
    );

    const tracks = [];
    const seenTracks = {};

    function normalize(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[’‘`]/g, "'")
        .replace(/\s+/g, " ")
        .trim();
    }

    function addTracks(details, groupTitle) {
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

          const lowerGroup =
            String(groupTitle || "").toLowerCase();

          const category =
            lowerGroup.indexOf("score") >= 0 ||
            lowerGroup.indexOf("original music") >= 0
              ? "score"
              : "soundtrack";

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
    }

    /*
     * For every group request releases, then only the best release.
     * This is intentionally conservative to keep the plugin responsive.
     */
    for (let i = 0; i < selected.length; i++) {
      const item = selected[i];

      try {
        const result = await mbGet(
          "release/?release-group=" +
            encodeURIComponent(item.group.id) +
            "&limit=10&inc=artist-credits"
        );

        const releases = result?.releases || [];

        releases.sort(function (a, b) {
          const aScore =
            (a.status === "Official" ? 20 : 0) +
            (a.date ? 3 : 0);

          const bScore =
            (b.status === "Official" ? 20 : 0) +
            (b.date ? 3 : 0);

          return bScore - aScore;
        });

        const release = releases[0];

        if (!release?.id) continue;

        log(
          "Loading release:",
          release.title,
          release.id
        );

        const details = await mbGet(
          "release/" +
            encodeURIComponent(release.id) +
            "?inc=recordings+artist-credits"
        );

        addTracks(
          details,
          item.group.title || release.title
        );
      } catch (e) {
        log("Group processing failed:", item.group.id, e);
      }
    }

    if (!tracks.length) {
      throw new Error(
        "MusicBrainz: релизы найдены, но треки получить не удалось"
      );
    }

    tracks.sort(function (a, b) {
      if (a.category === b.category) {
        return a.position - b.position;
      }

      return a.category === "soundtrack" ? -1 : 1;
    });

    return {
      movieTitle: displayTitle,
      originalTitle: originalTitle,
      imdbId: imdbId,
      groups: selected.map(function (item) {
        return {
          title: item.group.title,
          score: item.score
        };
      }),
      album: selected[0]?.group?.title || "",
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
    const service = String(title || "").toLowerCase();
    const isSpotify = service === "spotify";

    const button = $(
      '<div class="selector cinemax-music-btn">' +
        (isSpotify
          ? '<img class="cinemax-spotify-icon" alt="" />'
          : "") +
        '<span class="cinemax-music-label"></span>' +
      "</div>"
    );

    button.find(".cinemax-music-label").text(title);

    if (isSpotify) {
      button.find(".cinemax-spotify-icon").attr(
        "src",
        "data:image/png;base64,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"
      );
    }

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

    const timeout = new Promise(function (_, reject) {
      setTimeout(function () {
        reject(
          new Error(
            "MusicBrainz отвечает слишком долго. Попробуйте ещё раз."
          )
        );
      }, 30000);
    });

    Promise.race([
      findSoundtrack(movie),
      timeout
    ])
      .then(function (data) {
        Lampa.Loading.stop();

        data.movieImage = getMovieArtwork(movie);
        data.moviePoster = movie?.poster_path || movie?.poster || "";

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
    const modal = $(
      '<div class="cinemax-soundtrack-modal">' +
        '<div class="cinemax-soundtrack-hero">' +
          '<img class="cinemax-soundtrack-artwork" alt="" />' +
          '<div class="cinemax-soundtrack-hero-overlay"></div>' +
          '<div class="cinemax-soundtrack-info">' +
            '<div class="cinemax-soundtrack-heading">' +
              '<span class="cinemax-soundtrack-note">♫</span>' +
              '<span>Саундтрек</span>' +
            '</div>' +
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

    if (data.movieImage) {
      modal.find(".cinemax-soundtrack-artwork").attr(
        "src",
        data.movieImage
      );
    } else {
      modal.find(".cinemax-soundtrack-artwork").remove();
    }

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
          height:250px;
          display:flex;
          align-items:flex-end;
          overflow:hidden;
          background:#111415;
        }

        .cinemax-soundtrack-artwork{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          object-fit:cover;
          object-position:center 25%;
          opacity:.92;
          transform:scale(1.015);
        }

        .cinemax-soundtrack-hero-overlay{
          position:absolute;
          inset:0;
          background:
            linear-gradient(
              to bottom,
              rgba(0,0,0,.04) 0%,
              rgba(10,12,13,.18) 28%,
              rgba(15,17,18,.70) 68%,
              #151718 100%
            );
        }

        .cinemax-soundtrack-heading{
          display:flex;
          align-items:center;
          gap:9px;
        }

        .cinemax-soundtrack-note{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:31px;
          height:31px;
          border-radius:10px;
          background:rgba(255,255,255,.13);
          border:1px solid rgba(255,255,255,.16);
          color:#fff;
          font-size:20px;
          line-height:1;
          flex:0 0 auto;
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
          gap:6px;
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

        .cinemax-spotify-icon{
          width:18px;
          height:18px;
          object-fit:contain;
          border-radius:50%;
          flex:0 0 18px;
        }

        .cinemax-music-label{
          display:inline-block;
          line-height:1;
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
            height:230px;
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
