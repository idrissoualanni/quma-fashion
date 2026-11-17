(function () {
  var header = document.querySelector("[data-header]");
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle("is-scrolled", window.scrollY > 12);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var nav = document.getElementById("mobile-nav");
  if (nav) {
    var navToggle = nav.querySelector(".mobile-nav__toggle");
    nav.addEventListener("toggle", function () {
      document.body.classList.toggle("nav-open", nav.open);
      if (navToggle) {
        navToggle.setAttribute(
          "aria-label",
          nav.open ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"
        );
      }
    });
    nav.addEventListener("cancel", function (e) {
      if (e.defaultPrevented) return;
      e.preventDefault();
      nav.open = false;
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.open) {
        nav.open = false;
        if (navToggle) navToggle.focus();
      }
    });
    nav.addEventListener("click", function (e) {
      var target = e.target;
      while (target && target !== nav) {
        if (target.tagName === "A") {
          nav.open = false;
          break;
        }
        target = target.parentElement;
      }
    });
  }

  window.setTimeout(function () {
    if (!window.gsap) {
      var html = document.documentElement;
      html.classList.remove("anim");
      html.classList.add("anim-fallback");
      html.classList.remove("curtain");
      document.querySelectorAll("[data-reveal],[data-hero],[data-rule],[data-reveal-img]").forEach(function (el) {
        el.style.opacity = "";
        el.style.transform = "";
        if (el.style.clipPath) el.style.clipPath = "";
      });
    }
  }, 4000);
})();

/* Formulaire : compose la demande et l'ouvre dans WhatsApp */
(function () {
  var form = document.querySelector("[data-wa-form]");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var lines = [
      "Bonjour Quma Fashion,",
      "Je m'appelle " + (d.get("nom") || "").trim() + ".",
      "Je suis intéressé(e) par : " + d.get("univers") + ".",
    ];
    var msg = (d.get("message") || "").trim();
    if (msg) lines.push(msg);
    var url = "https://wa.me/" + form.getAttribute("data-wa") + "?text=" + encodeURIComponent(lines.join("\n"));
    window.open(url, "_blank", "noopener");
  });
})();
