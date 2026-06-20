(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero-carousel]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-slide"), 10) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-card-search]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-card"));
      var empty = document.createElement("div");
      var activeValue = "";
      empty.className = "empty-state";
      empty.textContent = "没有找到相关影片，换个关键词试试。";
      scope.appendChild(empty);

      function cardText(card) {
        return normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-category"),
          card.textContent
        ].join(" "));
      }

      function update() {
        var keyword = normalize(input ? input.value : "");
        var filter = normalize(activeValue);
        var visible = 0;
        cards.forEach(function (card) {
          var text = cardText(card);
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedFilter = !filter || text.indexOf(filter) !== -1;
          var matched = matchedKeyword && matchedFilter;
          card.classList.toggle("is-filter-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        empty.style.display = visible === 0 ? "block" : "none";
      }

      if (input) {
        input.addEventListener("input", update);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeValue = button.getAttribute("data-filter-value") || "";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          update();
        });
      });
      if (scope.hasAttribute("data-query-page") && input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
          input.value = query;
        }
      }
      update();
    });
  }

  window.initializeVideoPlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }
    var hlsInstance = null;
    var prepared = false;

    function loadAndPlay() {
      button.classList.add("is-hidden");
      if (!prepared) {
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", loadAndPlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        loadAndPlay();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
