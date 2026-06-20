async function loadHls() {
  try {
    const module = await import('./vendor/hls.esm.js');
    return module.H;
  } catch (error) {
    console.warn('HLS module could not be loaded, falling back to native playback.', error);
    return null;
  }
}

function setupNavigation() {
  const toggle = document.querySelector('[data-nav-toggle]');
  if (!toggle) {
    return;
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
}

function setupHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const next = hero.querySelector('[data-hero-next]');
  const prev = hero.querySelector('[data-hero-prev]');
  let index = 0;
  let timer = null;

  function render(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => render(index + 1), 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  next?.addEventListener('click', () => {
    render(index + 1);
    start();
  });

  prev?.addEventListener('click', () => {
    render(index - 1);
    start();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      render(dotIndex);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function setupLocalFilters() {
  const panel = document.querySelector('[data-filter-panel]');
  const grid = document.querySelector('[data-card-grid]');
  if (!panel || !grid) {
    return;
  }

  const search = panel.querySelector('[data-filter-search]');
  const year = panel.querySelector('[data-filter-year]');
  const sort = panel.querySelector('[data-sort-select]');
  const empty = document.querySelector('[data-empty-state]');

  function apply() {
    const query = normalize(search?.value);
    const selectedYear = String(year?.value || '');
    const cards = Array.from(grid.querySelectorAll('[data-card]'));

    cards.forEach((card) => {
      const text = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.textContent,
      ].join(' '));
      const matchesQuery = !query || text.includes(query);
      const matchesYear = !selectedYear || card.dataset.year === selectedYear;
      card.hidden = !(matchesQuery && matchesYear);
    });

    const visibleCards = cards.filter((card) => !card.hidden);
    const sortValue = sort?.value || 'year-desc';

    visibleCards.sort((a, b) => {
      if (sortValue === 'rating-desc') {
        return Number(b.dataset.rating) - Number(a.dataset.rating);
      }
      if (sortValue === 'views-desc') {
        return Number(b.dataset.views) - Number(a.dataset.views);
      }
      if (sortValue === 'title-asc') {
        return String(a.dataset.title).localeCompare(String(b.dataset.title), 'zh-Hans-CN');
      }
      return Number(b.dataset.year) - Number(a.dataset.year);
    });

    visibleCards.forEach((card) => grid.appendChild(card));
    if (empty) {
      empty.hidden = visibleCards.length > 0;
    }
  }

  search?.addEventListener('input', apply);
  year?.addEventListener('change', apply);
  sort?.addEventListener('change', apply);
  apply();
}

async function setupPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));
  if (!players.length) {
    return;
  }

  const Hls = await loadHls();

  players.forEach((shell) => {
    const video = shell.querySelector('video[data-hls-src]');
    const toggle = shell.querySelector('[data-player-toggle]');
    const status = shell.querySelector('[data-player-status]');
    const source = video?.dataset.hlsSrc;

    if (!video || !source) {
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (status) {
          status.textContent = '已就绪，点击播放';
        }
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data?.fatal && status) {
          status.textContent = '视频加载失败，请稍后重试';
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      if (status) {
        status.textContent = '已就绪，点击播放';
      }
    } else if (status) {
      status.textContent = '当前浏览器不支持 HLS 播放';
    }

    async function togglePlay() {
      if (video.paused) {
        try {
          await video.play();
        } catch (error) {
          if (status) {
            status.textContent = '播放被浏览器阻止，请使用控件播放';
          }
        }
      } else {
        video.pause();
      }
    }

    toggle?.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', () => {
      shell.classList.add('is-playing');
      if (status) {
        status.textContent = '正在播放';
      }
    });
    video.addEventListener('pause', () => {
      shell.classList.remove('is-playing');
      if (status) {
        status.textContent = '已暂停';
      }
    });
    video.addEventListener('ended', () => {
      shell.classList.remove('is-playing');
      if (status) {
        status.textContent = '播放结束';
      }
    });
  });
}

function movieCardTemplate(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `
    <article class="movie-card" data-card data-title="${escapeHtml(movie.title)}" data-year="${movie.year_num}" data-rating="${movie.rating}" data-views="${movie.views}">
      <a class="movie-cover" href="${movie.url}">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}封面" loading="lazy">
        <span class="movie-score">${movie.rating}</span>
        <span class="movie-duration">${escapeHtml(movie.duration)}</span>
      </a>
      <div class="movie-body">
        <div class="movie-meta-line">
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.year)}</span>
        </div>
        <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.one_line)}</p>
        <div class="movie-tags">${tags}</div>
        <a class="movie-action" href="${movie.url}">立即观看</a>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setupGlobalSearch() {
  const form = document.querySelector('[data-global-search-form]');
  const results = document.querySelector('[data-search-results]');
  const summary = document.querySelector('[data-search-summary]');
  const movies = window.MOVIES_INDEX || [];

  if (!form || !results) {
    return;
  }

  const input = form.querySelector('input[name="q"]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  input.value = initialQuery;

  function render(query) {
    const normalized = normalize(query);
    results.innerHTML = '';

    if (!normalized) {
      if (summary) {
        summary.textContent = `已载入 ${movies.length} 部影片，请输入关键词搜索。`;
      }
      return;
    }

    const matches = movies
      .filter((movie) => normalize(movie.search_text).includes(normalized))
      .slice(0, 120);

    results.innerHTML = matches.map(movieCardTemplate).join('');
    if (summary) {
      summary.textContent = matches.length ? `找到 ${matches.length} 条匹配结果。` : '没有找到匹配结果，请更换关键词。';
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState(null, '', url);
    render(query);
  });

  input.addEventListener('input', () => render(input.value));
  render(initialQuery);
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupHero();
  setupLocalFilters();
  setupPlayers();
  setupGlobalSearch();
});
