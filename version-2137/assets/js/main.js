(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var searchParams = new URLSearchParams(window.location.search);
    var query = (searchParams.get('q') || '').trim();
    var globalSearchInput = document.querySelector('[data-global-search-input]');
    var localSearchInput = document.querySelector('[data-local-search]');

    if (globalSearchInput && query) {
        globalSearchInput.value = query;
    }

    if (localSearchInput && query) {
        localSearchInput.value = query;
    }

    var list = document.querySelector('[data-card-list]');

    if (list) {
        var cards = Array.prototype.slice.call(list.children);
        var searchInput = localSearchInput;
        var sortSelect = document.querySelector('[data-sort-select]');
        var typeFilter = document.querySelector('[data-type-filter]');

        function normalize(value) {
            return String(value || '').toLowerCase();
        }

        function applyFilters() {
            var term = normalize(searchInput ? searchInput.value : '');
            var type = normalize(typeFilter ? typeFilter.value : '');

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags'));
                var cardType = normalize(card.getAttribute('data-type') || card.getAttribute('data-tags'));
                var matchesTerm = !term || text.indexOf(term) !== -1;
                var matchesType = !type || cardType.indexOf(type) !== -1;
                card.classList.toggle('is-hidden', !(matchesTerm && matchesType));
            });
        }

        function applySort() {
            var value = sortSelect ? sortSelect.value : 'year';
            var sorted = cards.slice().sort(function (a, b) {
                return Number(b.getAttribute('data-' + value) || 0) - Number(a.getAttribute('data-' + value) || 0);
            });

            sorted.forEach(function (card) {
                list.appendChild(card);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilters);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                applySort();
                applyFilters();
            });
        }

        applySort();
        applyFilters();
    }
})();
