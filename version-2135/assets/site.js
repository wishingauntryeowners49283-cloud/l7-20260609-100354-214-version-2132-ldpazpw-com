
(function () {
    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupFilters() {
        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var search = panel.querySelector('[data-filter-search]');
            var year = panel.querySelector('[data-filter-year]');
            var region = panel.querySelector('[data-filter-region]');
            var type = panel.querySelector('[data-filter-type]');
            var cards = Array.prototype.slice.call(panel.querySelectorAll('[data-card]'));
            var count = panel.querySelector('[data-result-count]');

            function apply() {
                var query = search ? search.value.trim().toLowerCase() : '';
                var yearValue = year ? year.value : '';
                var regionValue = region ? region.value : '';
                var typeValue = type ? type.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = true;
                    if (query && (card.getAttribute('data-search') || '').indexOf(query) === -1) {
                        ok = false;
                    }
                    if (yearValue && card.getAttribute('data-year') !== yearValue) {
                        ok = false;
                    }
                    if (regionValue && card.getAttribute('data-region') !== regionValue) {
                        ok = false;
                    }
                    if (typeValue && card.getAttribute('data-type') !== typeValue) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = String(visible);
                }
            }

            [search, year, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function setupPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.player-overlay');
            var stream = player.getAttribute('data-stream');
            var attached = false;
            var hls = null;
            if (!video || !overlay || !stream) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                attached = true;
            }

            function start() {
                attach();
                overlay.classList.add('is-hidden');
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            }

            overlay.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (!attached || video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    overlay.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function createSearchCard(movie) {
        var link = document.createElement('a');
        link.className = 'movie-card movie-card-compact';
        link.href = movie.url;

        var cover = document.createElement('div');
        cover.className = 'movie-cover';
        var img = document.createElement('img');
        img.src = movie.image;
        img.alt = movie.title;
        img.loading = 'lazy';
        var badge = document.createElement('span');
        badge.className = 'movie-badge';
        badge.textContent = movie.type;
        var play = document.createElement('span');
        play.className = 'movie-play';
        play.textContent = '▶';
        cover.appendChild(img);
        cover.appendChild(badge);
        cover.appendChild(play);

        var info = document.createElement('div');
        info.className = 'movie-info';
        var title = document.createElement('h3');
        title.textContent = movie.title;
        var desc = document.createElement('p');
        desc.textContent = movie.oneLine;
        var meta = document.createElement('div');
        meta.className = 'movie-meta';
        [movie.region, movie.year, movie.genre].forEach(function (item) {
            var span = document.createElement('span');
            span.textContent = item;
            meta.appendChild(span);
        });
        var tags = document.createElement('div');
        tags.className = 'movie-tags';
        tags.textContent = movie.tags;
        info.appendChild(title);
        info.appendChild(desc);
        info.appendChild(meta);
        info.appendChild(tags);

        link.appendChild(cover);
        link.appendChild(info);
        return link;
    }

    function setupSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = document.querySelector('[data-search-input]');
        var results = document.querySelector('[data-search-results]');
        var status = document.querySelector('[data-search-status]');
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }

        function render(value) {
            var term = (value || '').trim().toLowerCase();
            results.innerHTML = '';
            if (!term) {
                status.textContent = '输入关键词后显示匹配影片。';
                return;
            }
            var matched = window.SITE_MOVIES.filter(function (movie) {
                return movie.search.indexOf(term) !== -1;
            }).slice(0, 240);
            status.textContent = '找到 ' + matched.length + ' 个匹配结果。';
            matched.forEach(function (movie) {
                results.appendChild(createSearchCard(movie));
            });
        }

        if (input) {
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
        render(query);
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupFilters();
        setupPlayers();
        setupSearchPage();
    });
}());
