(function () {
  var html = document.documentElement;
  html.classList.add("anim");
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    html.classList.add("anim-reduce");
    return;
  }
  // Rideau : à la première visite de la session, ou après un clic interne
  try {
    var fromNav = sessionStorage.getItem("qf-nav") === "1";
    var seen = sessionStorage.getItem("qf-seen") === "1";
    sessionStorage.removeItem("qf-nav");
    sessionStorage.setItem("qf-seen", "1");
    if (fromNav || !seen) html.classList.add("curtain");
  } catch (e) {}
})();
