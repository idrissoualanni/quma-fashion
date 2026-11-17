/* Quma Fashion — animations GSAP + ScrollTrigger
   Sobres et fluides : transform / opacity uniquement, tout est coupé
   si l'utilisateur demande moins d'animations. */
(function () {
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var gsap, ScrollTrigger;

  /* ---------- Rideau : entrée de page et transitions ---------- */
  function curtainIn() {
    var curtain = document.querySelector(".page-curtain");
    var html = document.documentElement;
    if (!curtain || !html.classList.contains("curtain")) return 0;
    var mark = curtain.querySelector(".page-curtain__mark");
    gsap.set(curtain, { yPercent: 0 });
    html.classList.remove("curtain");
    var tl = gsap.timeline();
    tl.fromTo(mark, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "power2.out" })
      .to(mark, { opacity: 0, y: -20, duration: 0.3, ease: "power2.in" }, "+=0.1")
      .to(curtain, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "-=0.15");
    return 0.95;
  }

  function initPageTransitions() {
    var curtain = document.querySelector(".page-curtain");
    if (!curtain) return;
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // ancre sur la même page
      e.preventDefault();
      try { sessionStorage.setItem("qf-nav", "1"); } catch (err) {}
      var mark = curtain.querySelector(".page-curtain__mark");
      gsap.set(mark, { opacity: 0, y: 0 });
      gsap.timeline({ onComplete: function () { location.href = url.href; } })
        .fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "expo.inOut" })
        .to(mark, { opacity: 1, duration: 0.2 }, "-=0.15");
    });
    // Retour arrière (cache du navigateur) : on range le rideau
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) gsap.set(curtain, { yPercent: -100 });
    });
  }

  /* ---------- Hero ---------- */
  function initHero(delay) {
    var hero = document.querySelector(".hero[data-hero]");
    var pageHero = document.querySelector(".page-hero[data-hero]");
    var root = hero || pageHero;
    if (!root) return;

    var tl = gsap.timeline({ delay: delay, defaults: { ease: "power3.out" } });
    tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0);

    if (pageHero && !hero) {
      tl.fromTo(
        pageHero.querySelectorAll("[data-hero]"),
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 },
        0.05
      );
      return;
    }

    tl.fromTo(".hero__title .line > span", { yPercent: 115 }, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.12 }, 0.1)
      .fromTo(".hero__eyebrow", { opacity: 0, y: 14, letterSpacing: "0.5em" }, { opacity: 1, y: 0, letterSpacing: "0.24em", duration: 1 }, 0)
      .fromTo(".hero__lead", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.55)
      .fromTo(".hero__actions", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 0.7)
      .fromTo(".hero__phone", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.85)
      .fromTo(".hero__media", { opacity: 0, clipPath: "inset(100% 0 0 0)" }, { opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "expo.inOut" }, 0.15)
      .fromTo(".hero__media img", { scale: 1.25 }, { scale: 1, duration: 2.2, ease: "power2.out" }, 0.15);

    var path = document.querySelector(".hero__swash path");
    if (path && path.getTotalLength) {
      var len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(path, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0.9);
    }

    var badge = document.querySelector(".hero__badge");
    if (badge) {
      tl.fromTo(badge, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.6)" }, 1.1);
      tl.add(function () {
        gsap.to(badge, { y: -10, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
    }
    gsap.utils.toArray(".hero__orb").forEach(function (orb, i) {
      gsap.to(orb, { x: i ? 30 : -40, y: i ? -30 : 40, duration: 7 + i * 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });

    // La photo du hero glisse doucement au défilement
    gsap.to(".hero__media img", {
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* ---------- Titres découpés mot par mot ---------- */
  function initSplitTitles() {
    gsap.utils.toArray("[data-split]").forEach(function (el) {
      if (el.children.length) return; // ne découpe que du texte simple
      var words = el.textContent.trim().split(/\s+/);
      el.setAttribute("aria-label", el.textContent.trim());
      el.innerHTML = words
        .map(function (w) { return '<span class="split-word" aria-hidden="true"><span>' + w + "</span></span>"; })
        .join(" ");
      gsap.fromTo(
        el.querySelectorAll(".split-word > span"),
        { yPercent: 110, rotate: 4 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });
  }

  /* ---------- Apparitions au défilement ---------- */
  function initReveals() {
    var reveals = gsap.utils.toArray("[data-reveal]");
    if (reveals.length) {
      gsap.set(reveals, { y: 40, opacity: 0 });
      ScrollTrigger.batch(reveals, {
        start: "top 88%",
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, overwrite: "auto" });
        },
      });
    }
    var imgs = gsap.utils.toArray("[data-reveal-img]");
    if (imgs.length) {
      gsap.set(imgs, { opacity: 0 });
      ScrollTrigger.batch(imgs, {
        start: "top 90%",
        once: true,
        onEnter: function (batch) {
          gsap.fromTo(batch, { opacity: 0, clipPath: "inset(0 0 100% 0)" }, { opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "power2.out", stagger: 0.1 });
        },
      });
    }
    var rules = gsap.utils.toArray("[data-rule]");
    if (rules.length) {
      gsap.set(rules, { scaleX: 0 });
      ScrollTrigger.batch(rules, {
        start: "top 92%",
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { scaleX: 1, duration: 1.4, ease: "power2.out", transformOrigin: "left center" });
        },
      });
    }
    // Images des cartes d'univers : léger zoom arrière à l'apparition
    gsap.utils.toArray(".family-card__media img, .universe__media img, .editorial__media img").forEach(function (img) {
      gsap.fromTo(img, { scale: 1.18 }, {
        scale: 1,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: img, start: "top 92%", once: true },
        clearProps: "transform",
      });
    });
  }

  /* ---------- Compteurs ---------- */
  function initCounters() {
    gsap.utils.toArray("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var obj = { v: 0 };
      el.textContent = "0";
      gsap.to(obj, {
        v: target,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: function () { el.textContent = Math.round(obj.v); },
      });
    });
  }

  /* ---------- Bandeau défilant réactif au défilement ---------- */
  function initMarquee() {
    var track = document.querySelector(".marquee__track");
    if (!track) return;
    track.style.animation = "none";
    var loop = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    var boost = gsap.quickTo(loop, "timeScale", { duration: 0.6, ease: "power2.out" });
    var settle;
    ScrollTrigger.create({
      onUpdate: function (self) {
        var v = self.getVelocity() / 250;
        boost(gsap.utils.clamp(-6, 6, (self.direction || 1) * (1 + Math.abs(v))));
        clearTimeout(settle);
        settle = setTimeout(function () { boost(self.direction < 0 ? -1 : 1); }, 180);
      },
    });
    var m = document.querySelector(".marquee");
    m.addEventListener("mouseenter", function () { gsap.to(loop, { timeScale: 0.15, duration: 0.6 }); });
    m.addEventListener("mouseleave", function () { gsap.to(loop, { timeScale: 1, duration: 0.6 }); });
  }

  /* ---------- Section affiche ---------- */
  function initPoster() {
    var poster = document.querySelector("[data-poster]");
    if (!poster) return;
    var frame = poster.querySelector(".poster__frame");
    var img = poster.querySelector(".poster__img");
    var shine = poster.querySelector(".poster__shine");
    gsap.fromTo(frame, { scale: 0.86, rotate: -2.5, y: 60 }, {
      scale: 1, rotate: 0, y: 0, ease: "none",
      scrollTrigger: { trigger: poster, start: "top 85%", end: "center 55%", scrub: 0.8 },
    });
    gsap.fromTo(img, { scale: 1.1 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: poster, start: "top bottom", end: "bottom top", scrub: true },
    });
    if (shine) {
      gsap.to(shine, {
        xPercent: 240, duration: 1.6, ease: "power2.inOut", repeat: -1, repeatDelay: 3.5,
        scrollTrigger: { trigger: poster, start: "top 60%", toggleActions: "play pause resume pause" },
      });
    }
  }

  /* ---------- Parallaxe des grandes photos (ordinateur) ---------- */
  function initParallax(mm) {
    mm.add("(min-width: 981px)", function () {
      gsap.utils.toArray(".split__media img").forEach(function (img) {
        gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, {
          yPercent: 5, scale: 1.12, ease: "none",
          scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
      gsap.utils.toArray(".editorial__media").forEach(function (fig, i) {
        gsap.to(fig, {
          y: i % 2 ? -50 : 30, ease: "none",
          scrollTrigger: { trigger: fig.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    });
  }

  /* ---------- Survol : boutons magnétiques et cartes en 3D ---------- */
  function initPointer() {
    if (!finePointer) return;
    gsap.utils.toArray("[data-magnetic]").forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      btn.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
    gsap.utils.toArray(".family-card").forEach(function (card) {
      var rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      var ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
      });
      card.addEventListener("mouseleave", function () { rx(0); ry(0); });
    });
  }

  /* ---------- Barre de progression et bouton WhatsApp ---------- */
  function initChrome(delay) {
    var bar = document.querySelector(".scroll-progress span");
    if (bar) {
      gsap.to(bar, {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 },
      });
    }
    var wa = document.querySelector(".wa-float");
    if (wa) gsap.fromTo(wa, { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "back.out(1.7)", delay: delay + 1.4 });
  }

  function init() {
    gsap = window.gsap;
    ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    var html = document.documentElement;
    if (reduceMotion) { html.classList.remove("curtain"); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();

    var delay = curtainIn();
    initPageTransitions();
    if (document.querySelector("[data-hero]")) initHero(delay);
    initSplitTitles();
    initReveals();
    initCounters();
    initMarquee();
    initPoster();
    initParallax(mm);
    initPointer();
    initChrome(delay);

    function refresh() { ScrollTrigger.refresh(); }
    window.addEventListener("load", refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh).catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
