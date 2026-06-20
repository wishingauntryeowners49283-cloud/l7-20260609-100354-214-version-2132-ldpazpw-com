(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        play();
      });
    }

    play();
  }

  var globalSearch = document.querySelector('[data-global-search]');
  var globalInput = document.querySelector('[data-global-search-input]');
  var searchPanel = document.querySelector('[data-search-panel]');
  var searchIndex = window.SEARCH_INDEX || [];

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSearchResults(query, container, limit) {
    if (!container) {
      return [];
    }
    var q = normalize(query);
    var results = [];

    if (q.length > 0) {
      results = searchIndex.filter(function (item) {
        return normalize(item.keywords).indexOf(q) !== -1 || normalize(item.oneLine).indexOf(q) !== -1;
      }).slice(0, limit || 12);
    }

    container.innerHTML = results.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span></span>' +
        '</a>';
    }).join('');

    return results;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (globalSearch && globalInput && searchPanel) {
    globalInput.addEventListener('input', function () {
      var results = renderSearchResults(globalInput.value, searchPanel, 10);
      searchPanel.classList.toggle('is-open', results.length > 0);
    });

    globalInput.addEventListener('focus', function () {
      var results = renderSearchResults(globalInput.value, searchPanel, 10);
      searchPanel.classList.toggle('is-open', results.length > 0);
    });

    document.addEventListener('click', function (event) {
      if (!globalSearch.contains(event.target)) {
        searchPanel.classList.remove('is-open');
      }
    });
  }

  var filterGrid = document.querySelector('[data-filter-grid]');

  if (filterGrid) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
    var textInput = document.querySelector('[data-filter-text]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var emptyState = document.querySelector('[data-empty-state]');

    function runFilter() {
      var text = normalize(textInput && textInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var content = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardText = normalize(card.textContent);
        var matchText = !text || content.indexOf(text) !== -1;
        var matchType = !type || cardType.indexOf(type) !== -1;
        var matchYear = !year || (year === '2020' ? Number(cardYear.replace(/\D/g, '') || '0') <= 2020 : cardYear.indexOf(year) !== -1);
        var matchCategory = !category || cardText.indexOf(category) !== -1;
        var isVisible = matchText && matchType && matchYear && matchCategory;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [textInput, typeSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchEmpty = document.querySelector('[data-search-empty]');
  var pageSearchInput = document.querySelector('[data-search-page-input]');

  if (searchResults) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (pageSearchInput) {
      pageSearchInput.value = query;
    }

    var matches = [];

    if (query.trim()) {
      var q = normalize(query);
      matches = searchIndex.filter(function (item) {
        return normalize(item.keywords).indexOf(q) !== -1 || normalize(item.oneLine).indexOf(q) !== -1;
      }).slice(0, 120);
    }

    searchResults.innerHTML = matches.map(function (item) {
      return '<article class="movie-card">' +
        '<a href="' + item.url + '" class="movie-card-link">' +
        '<div class="poster-frame"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="poster-badge">' + escapeHtml(item.year) + '</span></div>' +
        '<div class="movie-card-body"><div class="movie-card-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
        '<h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="movie-card-foot"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div></div>' +
        '</a></article>';
    }).join('');

    if (searchEmpty) {
      if (!query.trim()) {
        searchEmpty.textContent = '输入关键词后显示匹配影片';
      } else {
        searchEmpty.textContent = '没有匹配的影片';
      }
      searchEmpty.classList.toggle('is-visible', matches.length === 0);
    }
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play]');
    var stream = player.getAttribute('data-stream');
    var hls = null;
    var ready = false;

    function attachStream() {
      if (!video || !stream || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function startPlayback() {
      attachStream();
      player.classList.add('is-playing');
      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          startPlayback();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }
})();
