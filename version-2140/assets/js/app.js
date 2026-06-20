(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function setupMobileNav() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilters() {
    var filterBox = document.querySelector('[data-local-filter]');
    if (!filterBox) {
      return;
    }
    var input = filterBox.querySelector('[data-card-search]');
    var buttons = Array.prototype.slice.call(filterBox.querySelectorAll('[data-card-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var activeTag = 'all';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var tags = (card.getAttribute('data-tags') || '').toLowerCase();
        var year = (card.getAttribute('data-year') || '').toLowerCase();
        var region = (card.getAttribute('data-region') || '').toLowerCase();
        var textMatch = !query || title.indexOf(query) >= 0 || tags.indexOf(query) >= 0 || year.indexOf(query) >= 0 || region.indexOf(query) >= 0;
        var tagMatch = activeTag === 'all' || tags.indexOf(activeTag.toLowerCase()) >= 0 || region.indexOf(activeTag.toLowerCase()) >= 0 || year.indexOf(activeTag.toLowerCase()) >= 0;
        card.classList.toggle('hidden-by-filter', !(textMatch && tagMatch));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeTag = button.getAttribute('data-card-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });
    applyFilter();
  }

  function setupSearchPage() {
    var container = document.querySelector('[data-search-results]');
    if (!container || !Array.isArray(window.siteMovies)) {
      return;
    }
    var input = document.querySelector('[data-global-search-input]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    function movieCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHTML(tag) + '</span>';
      }).join('');
      return '' +
        '<article class="movie-card" data-movie-card>' +
        '<a class="poster-wrap" href="./' + escapeHTML(movie.file) + '">' +
        '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '<span class="category-badge">' + escapeHTML(movie.region) + '</span>' +
        '<span class="rating-badge">★ ' + escapeHTML(movie.rating) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<h3><a href="./' + escapeHTML(movie.file) + '">' + escapeHTML(movie.title) + '</a></h3>' +
        '<p>' + escapeHTML(movie.oneLine) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.type) + '</span><span>' + escapeHTML(movie.categoryName) + '</span></div>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function render(query) {
      var value = String(query || '').trim().toLowerCase();
      if (!value) {
        container.innerHTML = '<div class="search-empty"><h2>开始搜索</h2><p>输入剧名、地区、年份、类型或标签，快速找到想看的内容。</p></div>';
        return;
      }
      var results = window.siteMovies.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return haystack.indexOf(value) >= 0;
      }).slice(0, 96);
      if (!results.length) {
        container.innerHTML = '<div class="search-empty"><h2>未找到相关内容</h2><p>可尝试更换关键词或浏览分类片库。</p></div>';
        return;
      }
      container.innerHTML = '<div class="movie-grid">' + results.map(movieCard).join('') + '</div>';
    }

    render(initialQuery);
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
  });
}());
