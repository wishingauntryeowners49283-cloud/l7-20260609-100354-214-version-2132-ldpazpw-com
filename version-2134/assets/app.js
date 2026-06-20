(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            }

            function next() {
                show(current + 1);
            }

            function restart() {
                window.clearInterval(timer);
                timer = window.setInterval(next, 5000);
            }

            var prevBtn = carousel.querySelector("[data-hero-prev]");
            var nextBtn = carousel.querySelector("[data-hero-next]");
            if (prevBtn) {
                prevBtn.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener("click", function () {
                    next();
                    restart();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    restart();
                });
            });
            restart();
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var searchInput = document.querySelector("#searchInput");
        if (searchInput && query) {
            searchInput.value = query;
        }

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-local-search]");
            var typeSelect = scope.querySelector("[data-type-select]");
            var yearSelect = scope.querySelector("[data-year-select]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-category-filter]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            var activeType = "all";

            function applyFilter() {
                var text = normalize(input ? input.value : "");
                var selectedType = typeSelect ? typeSelect.value : activeType;
                var selectedYear = yearSelect ? yearSelect.value : "all";
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var cardType = card.getAttribute("data-type") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var passText = !text || haystack.indexOf(text) !== -1;
                    var passType = selectedType === "all" || cardType === selectedType;
                    var passYear = selectedYear === "all" || cardYear === selectedYear;
                    var visible = passText && passType && passYear;
                    card.classList.toggle("hidden", !visible);
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("visible", shown === 0);
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (typeSelect) {
                typeSelect.addEventListener("change", applyFilter);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", applyFilter);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    button.classList.add("active");
                    activeType = button.getAttribute("data-category-filter") || "all";
                    applyFilter();
                });
            });
            applyFilter();
        });
    });
})();
