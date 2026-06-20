(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function updateTotalCount() {
    var total = document.body.getAttribute('data-total') || '';
    selectAll('[data-total-count]').forEach(function (node) {
      node.textContent = total;
    });
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    showSlide(0);
    start();
  }

  function setupImageFallbacks() {
    selectAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.removeAttribute('src');
      }, { once: true });
    });
  }

  function setupLocalFilters() {
    selectAll('[data-local-filter]').forEach(function (input) {
      var container = document.querySelector('[data-card-container]');
      if (!container) {
        return;
      }

      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        selectAll('.movie-card', container).forEach(function (card) {
          var text = card.textContent.toLowerCase();
          card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card movie-card-grid">' +
      '  <a href="' + escapeHtml(movie.href) + '" class="movie-cover-link" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
      '    <figure class="poster poster-card">' +
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">' +
      '      <figcaption>' + escapeHtml(movie.title) + '</figcaption>' +
      '    </figure>' +
      '  </a>' +
      '  <div class="movie-card-body">' +
      '    <h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '    <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>' +
      '    <div class="movie-meta">' +
      '      <span>' + escapeHtml(movie.region) + '</span>' +
      '      <span>' + escapeHtml(movie.type) + '</span>' +
      '      <span>' + escapeHtml(movie.year) + '</span>' +
      '    </div>' +
      '    <div class="tag-row">' + tags + '</div>' +
      '  </div>' +
      '</article>';
  }

  function setupSearchPage() {
    var panel = document.querySelector('[data-search-page]');
    if (!panel) {
      return;
    }

    var dataNode = document.getElementById('movie-search-data');
    var results = panel.querySelector('[data-search-results]');
    var summary = panel.querySelector('[data-search-summary]');
    var queryInput = panel.querySelector('[data-search-query]');
    var regionInput = panel.querySelector('[data-search-region]');
    var typeInput = panel.querySelector('[data-search-type]');
    var yearInput = panel.querySelector('[data-search-year]');
    var categoryInput = panel.querySelector('[data-search-category]');
    var movies = [];

    try {
      movies = JSON.parse(dataNode.textContent || '[]');
    } catch (error) {
      movies = [];
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      queryInput.value = params.get('q');
    }

    function matches(movie, query, region, type, year, category) {
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.category,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();

      return (!query || text.indexOf(query) !== -1) &&
        (!region || movie.region === region) &&
        (!type || movie.type === type) &&
        (!year || movie.year === year) &&
        (!category || movie.categorySlug === category);
    }

    function render() {
      var query = queryInput.value.trim().toLowerCase();
      var region = regionInput.value;
      var type = typeInput.value;
      var year = yearInput.value;
      var category = categoryInput.value;
      var filtered = movies.filter(function (movie) {
        return matches(movie, query, region, type, year, category);
      }).slice(0, 240);

      summary.textContent = '找到 ' + filtered.length + ' 条结果，最多显示前 240 条。';
      results.innerHTML = filtered.map(movieCard).join('');
      setupImageFallbacks();
    }

    [queryInput, regionInput, typeInput, yearInput, categoryInput].forEach(function (node) {
      node.addEventListener('input', render);
      node.addEventListener('change', render);
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateTotalCount();
    setupMobileMenu();
    setupHeroCarousel();
    setupImageFallbacks();
    setupLocalFilters();
    setupSearchPage();
  });
})();
