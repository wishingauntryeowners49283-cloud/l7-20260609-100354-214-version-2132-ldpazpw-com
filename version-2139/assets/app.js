document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var target = "./search.html";

      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }

      window.location.href = target;
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === active);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5600);
  }

  var searchInput = document.querySelector("[data-search-input]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
  var emptyState = document.querySelector("[data-empty-state]");

  function applySearch(value) {
    var terms = value.toLowerCase().split(/\s+/).filter(Boolean);
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-text") || "").toLowerCase();
      var matched = terms.every(function (term) {
        return text.indexOf(term) !== -1;
      });

      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? "none" : "block";
    }
  }

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    searchInput.value = initial;
    applySearch(initial);

    searchInput.addEventListener("input", function () {
      applySearch(searchInput.value.trim());
    });
  }
});
