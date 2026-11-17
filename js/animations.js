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
    var hero = document.querySelector(".rh[data-hero]");
    var pageHero = document.querySelector(".page-hero[data-hero]");
    if (!hero && !pageHero) return;

    var tl = gsap.timeline({ delay: delay, defaults: { ease: "power3.out" } });

    if (!hero) {
      tl.fromTo(pageHero, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0)
        .fromTo(pageHero.querySelectorAll("[data-hero]"), { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.05);
      return;
    }

    var arches = gsap.utils.toArray(hero.querySelectorAll(".arch"));
    var order = [arches[1], arches[0], arches[2]].filter(Boolean); // l'arche centrale d'abord
    tl.set(hero, { opacity: 1 })
      .fromTo(".rh__eyebrow", { opacity: 0, y: 14, letterSpacing: "0.6em" }, { opacity: 1, y: 0, letterSpacing: "0.3em", duration: 1.1 }, 0)
      .fromTo(".rh__title .line > span", { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 1.3, ease: "power4.out", stagger: 0.12 }, 0.1)
      .fromTo(order, { yPercent: 105 }, { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.14 }, 0.2)
      .fromTo(hero.querySelectorAll(".arch__img"), { scale: 1.35 }, { scale: finePointer ? 1.08 : 1, duration: 2.2, ease: "power2.out", stagger: 0.14 }, 0.2)
      .fromTo(".rh__lead", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9 }, 0.7)
      .fromTo(".rh__actions", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.85)
      .fromTo(".rh__foot", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.1);

    // Halo doré qui respire
    gsap.to(".rh__glow", { scale: 1.15, opacity: 0.7, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 });

    // Au défilement, les arches remontent à des vitesses différentes
    arches.forEach(function (a) {
      var depth = parseFloat(a.getAttribute("data-depth")) || 1;
      gsap.to(a, {
        y: -90 * depth, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    });

    // À la souris, les photos bougent légèrement dans leurs arches
    if (finePointer) {
      var movers = arches.map(function (a) {
        var img = a.querySelector(".arch__img");
        var d = parseFloat(a.getAttribute("data-depth")) || 1;
        return { x: gsap.quickTo(img, "x", { duration: 1, ease: "power3.out" }), y: gsap.quickTo(img, "y", { duration: 1, ease: "power3.out" }), d: d };
      });
      hero.addEventListener("mousemove", function (e) {
        var nx = e.clientX / window.innerWidth - 0.5;
        var ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach(function (m) { m.x(-nx * 26 * m.d); m.y(-ny * 18 * m.d); });
      });
    }
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
    var loops = [];
    gsap.utils.toArray(".marquee__track, .bigmarquee__track").forEach(function (track) {
      track.style.animation = "none";
      var big = track.classList.contains("bigmarquee__track");
      var loop = gsap.to(track, { xPercent: -50, duration: big ? 50 : 40, ease: "none", repeat: -1 });
      loops.push(loop);
      var box = track.parentElement;
      box.addEventListener("mouseenter", function () { gsap.to(loop, { timeScale: 0.2, duration: 0.6, overwrite: true }); });
      box.addEventListener("mouseleave", function () { gsap.to(loop, { timeScale: 1, duration: 0.6, overwrite: true }); });
    });
    if (!loops.length) return;
    // Le défilement accélère le bandeau et inverse son sens quand on remonte
    var speed = { v: 1 };
    var settle;
    function apply() { loops.forEach(function (l) { l.timeScale(speed.v); }); }
    ScrollTrigger.create({
      onUpdate: function (self) {
        var dir = self.direction < 0 ? -1 : 1;
        var v = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 300);
        gsap.to(speed, { v: dir * v, duration: 0.4, ease: "power2.out", overwrite: true, onUpdate: apply });
        clearTimeout(settle);
        settle = setTimeout(function () {
          gsap.to(speed, { v: dir, duration: 0.8, ease: "power2.out", overwrite: true, onUpdate: apply });
        }, 160);
      },
    });
  }

  /* ---------- Manifeste : les mots se colorent au défilement ---------- */
  function initScrubText() {
    gsap.utils.toArray("[data-scrub-text]").forEach(function (el) {
      var text = el.textContent.trim();
      el.setAttribute("aria-label", text);
      el.innerHTML = text.split(/\s+/).map(function (w) {
        return '<span class="w" aria-hidden="true">' + w + "</span>";
      }).join(" ");
      gsap.fromTo(el.querySelectorAll(".w"), { opacity: 0.14 }, {
        opacity: 1,
        stagger: 0.08,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
      });
    });
  }

  /* ---------- Index des univers : lignes + aperçu qui suit la souris ---------- */
  function initIndex() {
    var list = document.querySelector("[data-index]");
    if (!list) return;
    var rows = gsap.utils.toArray(list.querySelectorAll(".index__row"));
    gsap.from(rows, {
      y: 50, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.06,
      scrollTrigger: { trigger: list, start: "top 85%", once: true },
    });
    var preview = document.querySelector(".index__preview");
    var img = preview && preview.querySelector("img");
    if (!finePointer || !preview || !img) return;
    var xTo = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3.out" });
    var yTo = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3.out" });
    var rTo = gsap.quickTo(preview, "rotation", { duration: 0.8, ease: "power3.out" });
    var lastX = 0;
    gsap.set(preview, { xPercent: -50, yPercent: -55, scale: 0.6 });
    list.addEventListener("mousemove", function (e) {
      xTo(e.clientX); yTo(e.clientY);
      rTo(gsap.utils.clamp(-10, 10, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    });
    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        var src = row.querySelector("img");
        if (src) img.src = src.currentSrc || src.src;
        gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out", overwrite: "auto" });
        gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 0.7, ease: "power3.out" });
      });
    });
    list.addEventListener("mouseleave", function () {
      gsap.to(preview, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: "power2.in", overwrite: "auto" });
    });
  }

  /* ---------- Lookbook : défilement horizontal épinglé (ordinateur) ---------- */
  function initLookbook(mm) {
    var section = document.querySelector("[data-look]");
    var track = document.querySelector("[data-look-track]");
    if (!section || !track) return;
    mm.add("(min-width: 981px)", function () {
      document.documentElement.classList.add("has-hscroll");
      var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -distance(); },
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: function () { return "+=" + distance(); },
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      // Chaque photo se décale légèrement dans son cadre pendant le défilement
      gsap.utils.toArray(track.querySelectorAll(".look__card img")).forEach(function (im) {
        gsap.fromTo(im, { xPercent: -6, scale: 1.14 }, {
          xPercent: 6, scale: 1.14, ease: "none",
          scrollTrigger: { trigger: im.closest(".look__card"), containerAnimation: tween, start: "left right", end: "right left", scrub: true },
        });
      });
      return function () { document.documentElement.classList.remove("has-hscroll"); };
    });
    gsap.from(track.querySelectorAll(".look__card, .look__end"), {
      y: 80, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
    });
  }

  /* ---------- Arche finale ---------- */
  function initFinale() {
    var arch = document.querySelector("[data-finale]");
    if (!arch) return;
    gsap.fromTo(arch, { clipPath: "inset(100% 0 0 0 round 999px 999px 0 0)" }, {
      clipPath: "inset(0% 0 0 0 round 999px 999px 0 0)",
      ease: "none",
      scrollTrigger: { trigger: arch, start: "top 95%", end: "top 35%", scrub: 0.6 },
    });
    gsap.from(arch.querySelectorAll(".finale__phone, .finale__actions, .finale__note"), {
      y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: arch, start: "top 45%", once: true },
    });
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
    initScrubText();
    initIndex();
    initLookbook(mm);
    initFinale();
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
