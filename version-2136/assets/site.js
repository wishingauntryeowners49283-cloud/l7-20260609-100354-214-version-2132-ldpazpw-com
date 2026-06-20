(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    setupNavigation();
    setupImages();
    setupGlobalSearch();
    setupFilters();
    setupPlayers();
  });

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupImages() {
    var images = document.querySelectorAll("img[data-cover]");

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        var holder = image.closest(".card-cover, .rank-thumb, .hero-collage a");
        if (holder) {
          holder.classList.add("image-missing");
        }
      }, { once: true });
    });
  }

  function setupGlobalSearch() {
    var forms = document.querySelectorAll("[data-global-search]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "search.html";

        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }

        window.location.href = target;
      });
    });
  }

  function setupFilters() {
    var scopes = document.querySelectorAll("[data-filter-scope]");

    scopes.forEach(function (scope) {
      var keyword = scope.querySelector("[data-filter-keyword]");
      var type = scope.querySelector("[data-filter-type]");
      var region = scope.querySelector("[data-filter-region]");
      var year = scope.querySelector("[data-filter-year]");
      var clear = scope.querySelector("[data-clear-filters]");
      var count = scope.querySelector("[data-filter-count]");
      var empty = scope.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      if (!cards.length) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q && keyword) {
        keyword.value = q;
      }

      function apply() {
        var term = normalize(keyword && keyword.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var match = true;

          if (term && haystack.indexOf(term) === -1) {
            match = false;
          }

          if (typeValue && cardType !== typeValue) {
            match = false;
          }

          if (regionValue && cardRegion.indexOf(regionValue) === -1) {
            match = false;
          }

          if (yearValue && cardYear !== yearValue) {
            match = false;
          }

          card.style.display = match ? "" : "none";

          if (match) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "当前显示 " + visible + " 部";
        }

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (clear) {
        clear.addEventListener("click", function () {
          [keyword, type, region, year].forEach(function (control) {
            if (control) {
              control.value = "";
            }
          });
          apply();
        });
      }

      apply();
    });
  }

  function setupPlayers() {
    var players = document.querySelectorAll("video[data-video-src]");

    players.forEach(function (video) {
      var shell = video.closest(".player-shell");
      var startButton = shell ? shell.querySelector(".player-start") : null;
      var status = shell ? shell.querySelector(".player-status") : null;
      var source = video.getAttribute("data-video-src");
      var initialized = false;
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function init() {
        if (initialized || !source) {
          return Promise.resolve();
        }

        initialized = true;
        setStatus("正在加载播放源");

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪");
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus("网络波动，正在重试");
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus("媒体错误，正在恢复");
              hlsInstance.recoverMediaError();
            } else {
              setStatus("播放源暂时无法加载");
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setStatus("播放源已就绪");
        } else {
          video.src = source;
          setStatus("正在尝试使用浏览器原生播放");
        }

        return Promise.resolve();
      }

      function play() {
        init().then(function () {
          var playResult = video.play();

          if (playResult && typeof playResult.then === "function") {
            playResult.then(function () {
              if (startButton) {
                startButton.classList.add("is-hidden");
              }
              setStatus("正在播放");
            }).catch(function () {
              setStatus("点击播放器继续播放");
            });
          } else {
            if (startButton) {
              startButton.classList.add("is-hidden");
            }
            setStatus("正在播放");
          }
        });
      }

      if (startButton) {
        startButton.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
          setStatus("已暂停");
        }
      });

      video.addEventListener("play", function () {
        if (startButton) {
          startButton.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (startButton && video.currentTime === 0) {
          startButton.classList.remove("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }
})();
