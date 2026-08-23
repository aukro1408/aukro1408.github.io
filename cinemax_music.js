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
    const movieYear = parseInt(getYear(movie), 10) || 0;

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
      "| year:",
      movieYear,
      "| TMDB:",
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

    const candidates = [];
    const seenGroups = {};

    function normalize(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[’‘`]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/\s+/g, " ")
        .trim();
    }

    function yearScore(group) {
      if (!movieYear) return 0;

      const date = String(
        group?.["first-release-date"] ||
        group?.["first-release-date"] ||
        ""
      );

      const year = parseInt(date.slice(0, 4), 10) || 0;

      if (!year) return 0;
      if (year === movieYear) return 22;
      if (Math.abs(year - movieYear) <= 1) return 10;

      return 0;
    }

    function scoreGroup(group, wanted) {
      const title = normalize(group?.title);
      const queryTitle = normalize(wanted);

      let score = 0;

      if (title === queryTitle) score += 42;
      if (queryTitle && title.indexOf(queryTitle) >= 0) score += 24;

      const secondary = (group?.["secondary-types"] || [])
        .map(function (v) {
          return normalize(v);
        });

      const primary = normalize(group?.["primary-type"]);

      if (secondary.indexOf("soundtrack") >= 0) score += 45;
      if (title.indexOf("soundtrack") >= 0) score += 30;
      if (title.indexOf("music from the motion picture") >= 0) score += 35;
      if (title.indexOf("original motion picture score") >= 0) score += 35;
      if (title.indexOf("original score") >= 0) score += 22;
      if (title.indexOf("score") >= 0) score += 16;
      if (primary === "album") score += 2;

      score += yearScore(group);

      if (
        title.indexOf("tribute") >= 0 ||
        title.indexOf("karaoke") >= 0 ||
        title.indexOf("remix") >= 0
      ) {
        score -= 45;
      }

      return score;
    }

    function addGroup(group, wanted) {
      if (!group?.id || seenGroups[group.id]) return;

      const score = scoreGroup(group, wanted);

      // We intentionally allow lower-scoring candidates here because
      // exact title + soundtrack wording is more important than the
      // raw MusicBrainz search score.
      if (score < 18) return;

      seenGroups[group.id] = true;

      candidates.push({
        group: group,
        score: score
      });
    }

    function addGroups(groups, wanted) {
      (groups || []).forEach(function (group) {
        addGroup(group, wanted);
      });
    }

    async function searchGroups(query, wanted) {
      try {
        log("MB release-group:", query);

        const result = await mbGet(
          "release-group/?query=" +
            encodeURIComponent(query) +
            "&limit=30"
        );

        addGroups(result?.["release-groups"] || [], wanted);
      } catch (e) {
        log("MB release-group search failed:", query, e);
      }
    }

    async function searchReleases(query, wanted) {
      try {
        log("MB release:", query);

        const result = await mbGet(
          "release/?query=" +
            encodeURIComponent(query) +
            "&limit=20"
        );

        (result?.releases || []).forEach(function (release) {
          if (!release?.["release-group"]?.id) return;

          const group = release["release-group"];

          if (!group.title) {
            group.title = release.title || "";
          }

          if (!group["first-release-date"] && release.date) {
            group["first-release-date"] = release.date;
          }

          addGroup(group, wanted);
        });
      } catch (e) {
        log("MB release search failed:", query, e);
      }
    }

    /*
     * Important fix:
     *
     * Plain "The Matrix" is ambiguous in MusicBrainz. It can return
     * unrelated releases before the actual film soundtrack.
     *
     * We therefore use fielded Lucene queries and explicit soundtrack
     * phrases. MusicBrainz documents `releasegroup` and `release` as
     * searchable fields for these indexes.
     */
    const title = originalTitle || displayTitle;

    const queries = [
      'releasegroup:"' + title + '"',
      'releasegroup:"' + title + ': Music From the Motion Picture"',
      'releasegroup:"' + title + ': Original Motion Picture Score"',
      'release:"' + title + ': Music From the Motion Picture"',
      'release:"' + title + ': Original Motion Picture Score"',
      'releasegroup:' + title + ' soundtrack'
    ];

    const uniqueQueries = [];
    queries.forEach(function (q) {
      if (uniqueQueries.indexOf(q) < 0) {
        uniqueQueries.push(q);
      }
    });

    // Keep requests bounded: 4 group searches + 2 release fallbacks.
    for (let i = 0; i < Math.min(4, uniqueQueries.length); i++) {
      await searchGroups(uniqueQueries[i], title);
    }

    if (candidates.length < 2) {
      await searchReleases(
        'release:"' + title + ': Music From the Motion Picture"',
        title
      );

      await searchReleases(
        'release:"' + title + ': Original Motion Picture Score"',
        title
      );
    }

    candidates.sort(function (a, b) {
      return b.score - a.score;
    });

    const selected = candidates.slice(0, 4);

    if (!selected.length) {
      throw new Error(
        "MusicBrainz: саундтрек не найден. " +
        "Искали: " + title
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

    function addTracks(details, groupTitle) {
      (details?.media || []).forEach(function (media) {
        (media.tracks || []).forEach(function (track) {
          const recording = track.recording || {};

          const trackTitle =
            track.title ||
            recording.title ||
            "";

          if (!trackTitle) return;

          const artist =
            artistCredit(recording["artist-credit"]) ||
            artistCredit(track["artist-credit"]) ||
            artistCredit(details["artist-credit"]) ||
            "";

          const key =
            normalize(trackTitle) +
            "|" +
            normalize(artist);

          if (seenTracks[key]) return;
          seenTracks[key] = true;

          const lowerGroup = normalize(groupTitle);

          const category =
            lowerGroup.indexOf("score") >= 0 ||
            lowerGroup.indexOf("original music") >= 0
              ? "score"
              : "soundtrack";

          tracks.push({
            position: tracks.length + 1,
            title: trackTitle,
            artist: artist,
            length: track.length || recording.length || 0,
            category: category,
            album: groupTitle,
            links: searchLinks(trackTitle, artist)
          });
        });
      });
    }

    /*
     * One best official release per selected group.
     * We also prefer a release whose date is close to the film year.
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
          function releaseScore(release) {
            let score = 0;

            if (normalize(release.status) === "official") {
              score += 30;
            }

            const year = parseInt(
              String(release.date || "").slice(0, 4),
              10
            ) || 0;

            if (movieYear && year === movieYear) {
              score += 12;
            }

            if (release.date) score += 2;

            return score;
          }

          return releaseScore(b) - releaseScore(a);
        });

        const release = releases[0];

        if (!release?.id) continue;

        log("Loading release:", release.title, release.id);

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
        "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQiPjxwYXRoIGQ9Ik0xMjggMEM1Ny4zMDggMCAwIDU3LjMwOSAwIDEyOGMwIDcwLjY5NiA1Ny4zMDkgMTI4IDEyOCAxMjggNzAuNjk3IDAgMTI4LTU3LjMwNCAxMjgtMTI4QzI1NiA1Ny4zMTQgMTk4LjY5Ny4wMDcgMTI3Ljk5OC4wMDdsLjAwMS0uMDA2Wm01OC42OTkgMTg0LjYxNGMtMi4yOTMgMy43Ni03LjIxNSA0Ljk1Mi0xMC45NzUgMi42NDQtMzAuMDUzLTE4LjM1Ny02Ny44ODUtMjIuNTE1LTExMi40NC0xMi4zMzVhNy45ODEgNy45ODEgMCAwIDEtOS41NTItNi4wMDcgNy45NjggNy45NjggMCAwIDEgNi05LjU1M2M0OC43Ni0xMS4xNCA5MC41ODMtNi4zNDQgMTI0LjMyMyAxNC4yNzYgMy43NiAyLjMwOCA0Ljk1MiA3LjIxNSAyLjY0NCAxMC45NzVabTE1LjY2Ny0zNC44NTNjLTIuODkgNC42OTUtOS4wMzQgNi4xNzgtMTMuNzI2IDMuMjg5LTM0LjQwNi0yMS4xNDgtODYuODUzLTI3LjI3My0xMjcuNTQ4LTE0LjkyLTUuMjc4IDEuNTk0LTEwLjg1Mi0xLjM4LTEyLjQ1NC02LjY0OS0xLjU5LTUuMjc4IDEuMzg2LTEwLjg0MiA2LjY1NS0xMi40NDYgNDYuNDg1LTE0LjEwNiAxMDQuMjc1LTcuMjczIDE0My43ODcgMTcuMDA3IDQuNjkyIDIuODkgNi4xNzUgOS4wMzQgMy4yODYgMTMuNzJ2LS4wMDFabTEuMzQ1LTM2LjI5M0MxNjIuNDU3IDg4Ljk2NCA5NC4zOTQgODYuNzEgNTUuMDA3IDk4LjY2NmMtNi4zMjUgMS45MTgtMTMuMDE0LTEuNjUzLTE0LjkzLTcuOTc4LTEuOTE3LTYuMzI4IDEuNjUtMTMuMDEyIDcuOTgtMTQuOTM1QzkzLjI3IDYyLjAyNyAxNjguNDM0IDY0LjY4IDIxNS45MjkgOTIuODc2YzUuNzAyIDMuMzc2IDcuNTY2IDEwLjcyNCA0LjE4OCAxNi40MDUtMy4zNjIgNS42OS0xMC43MyA3LjU2NS0xNi40IDQuMTg3aC0uMDA2WiIgZmlsbD0iIzFFRDc2MCIvPjwvc3ZnPg=="
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
        .cinemax-main-music-icon{
          width:1.2em;
          height:1.2em;
          object-fit:contain;
          border-radius:50%;
          margin-right:.38em;
          flex:0 0 1.2em;
          vertical-align:middle;
        }

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
        "<span>Саундтрек</span>" +
      "</div>"
    );

    const musicIcon = $('<img class="cinemax-main-music-icon" alt="" />');
    musicIcon.attr("src", "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQiPjxwYXRoIGQ9Ik0xMjggMEM1Ny4zMDggMCAwIDU3LjMwOSAwIDEyOGMwIDcwLjY5NiA1Ny4zMDkgMTI4IDEyOCAxMjggNzAuNjk3IDAgMTI4LTU3LjMwNCAxMjgtMTI4QzI1NiA1Ny4zMTQgMTk4LjY5Ny4wMDcgMTI3Ljk5OC4wMDdsLjAwMS0uMDA2Wm01OC42OTkgMTg0LjYxNGMtMi4yOTMgMy43Ni03LjIxNSA0Ljk1Mi0xMC45NzUgMi42NDQtMzAuMDUzLTE4LjM1Ny02Ny44ODUtMjIuNTE1LTExMi40NC0xMi4zMzVhNy45ODEgNy45ODEgMCAwIDEtOS41NTItNi4wMDcgNy45NjggNy45NjggMCAwIDEgNi05LjU1M2M0OC43Ni0xMS4xNCA5MC41ODMtNi4zNDQgMTI0LjMyMyAxNC4yNzYgMy43NiAyLjMwOCA0Ljk1MiA3LjIxNSAyLjY0NCAxMC45NzVabTE1LjY2Ny0zNC44NTNjLTIuODkgNC42OTUtOS4wMzQgNi4xNzgtMTMuNzI2IDMuMjg5LTM0LjQwNi0yMS4xNDgtODYuODUzLTI3LjI3My0xMjcuNTQ4LTE0LjkyLTUuMjc4IDEuNTk0LTEwLjg1Mi0xLjM4LTEyLjQ1NC02LjY0OS0xLjU5LTUuMjc4IDEuMzg2LTEwLjg0MiA2LjY1NS0xMi40NDYgNDYuNDg1LTE0LjEwNiAxMDQuMjc1LTcuMjczIDE0My43ODcgMTcuMDA3IDQuNjkyIDIuODkgNi4xNzUgOS4wMzQgMy4yODYgMTMuNzJ2LS4wMDFabTEuMzQ1LTM2LjI5M0MxNjIuNDU3IDg4Ljk2NCA5NC4zOTQgODYuNzEgNTUuMDA3IDk4LjY2NmMtNi4zMjUgMS45MTgtMTMuMDE0LTEuNjUzLTE0LjkzLTcuOTc4LTEuOTE3LTYuMzI4IDEuNjUtMTMuMDEyIDcuOTgtMTQuOTM1QzkzLjI3IDYyLjAyNyAxNjguNDM0IDY0LjY4IDIxNS45MjkgOTIuODc2YzUuNzAyIDMuMzc2IDcuNTY2IDEwLjcyNCA0LjE4OCAxNi40MDUtMy4zNjIgNS42OS0xMC43MyA3LjU2NS0xNi40IDQuMTg3aC0uMDA2WiIgZmlsbD0iIzFFRDc2MCIvPjwvc3ZnPg==");
    button.prepend(musicIcon);

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
