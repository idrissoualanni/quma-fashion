(function () {
  function visibleItems() {
    var grid = document.querySelector("[data-gallery]");
    if (!grid) return [];
    var items = Array.prototype.slice.call(grid.querySelectorAll("[data-lightbox]"));
    return items.filter(function (el) {
      return !el.classList.contains("is-hidden");
    });
  }

  function setFilter(filter) {
    var grid = document.querySelector("[data-gallery]");
    if (!grid) return;
    var items = Array.prototype.slice.call(grid.querySelectorAll("[data-lightbox]"));
    items.forEach(function (el) {
      var family = el.getAttribute("data-family") || "tous";
      el.classList.toggle("is-hidden", filter !== "tout" && family !== filter);
    });
    var btns = Array.prototype.slice.call(document.querySelectorAll(".gallery__filter"));
    btns.forEach(function (b) {
      var active = b.getAttribute("data-filter") === filter;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function init() {
    var grid = document.querySelector("[data-gallery]");
    if (!grid) return;
    var dialog = document.getElementById("lightbox");
    if (!dialog) return;

    var image = document.getElementById("lightbox-image");
    var caption = document.getElementById("lightbox-caption");
    var panel = dialog.querySelector(".lightbox__figure");
    var items = Array.prototype.slice.call(grid.querySelectorAll("[data-lightbox]"));
    var current = 0;

    function list() {
      return visibleItems();
    }

    function goTo(index) {
      var lst = list();
      if (!lst.length) return;
      current = ((index % lst.length) + lst.length) % lst.length;
      var el = lst[current];
      if (!el) return;
      image.src = el.getAttribute("href") || "";
      image.alt =
        (el.querySelector("img") && el.querySelector("img").getAttribute("alt")) ||
        el.getAttribute("data-caption") ||
        "";
      caption.textContent = el.getAttribute("data-caption") || "";
      if (window.gsap) {
        window.gsap.fromTo(panel, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" });
      }
    }

    function close() {
      if (window.gsap) {
        var done = false;
        window.gsap.to(panel, {
          opacity: 0,
          scale: 0.97,
          duration: 0.25,
          ease: "power2.in",
          onComplete: function () {
            if (!done) {
              done = true;
              dialog.close();
            }
          },
        });
      } else {
        dialog.close();
      }
    }

    var backdropClose = function (e) {
      if (e.target === dialog) close();
    };

    dialog.addEventListener("click", backdropClose);
    dialog.addEventListener("cancel", function (e) {
      e.preventDefault();
      close();
    });
    document.addEventListener("keydown", function (e) {
      if (!dialog.open) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "ArrowLeft") goTo(current - 1);
    });

    document.querySelectorAll("[data-lightbox]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        dialog.showModal();
        var lst = list();
        goTo(lst.indexOf(el));
      });
    });
    document.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        close();
      });
    });
    document.querySelectorAll("[data-lightbox-prev]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        goTo(current - 1);
      });
    });
    document.querySelectorAll("[data-lightbox-next]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        goTo(current + 1);
      });
    });

    var btns = Array.prototype.slice.call(document.querySelectorAll(".gallery__filter"));
    var initial = new URLSearchParams(window.location.search).get("filter");
    function clickHandler(b) {
      return function () {
        setFilter(b.getAttribute("data-filter"));
        if (dialog.open) goTo(0);
      };
    }
    btns.forEach(function (b) {
      b.addEventListener("click", clickHandler(b));
    });
    var filters = btns.map(function (b) {
      return b.getAttribute("data-filter");
    });
    setFilter(initial && filters.indexOf(initial) !== -1 ? initial : "tout");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
