/* Veterans of Color — site behaviour (no framework) */
(function () {
  "use strict";

  /* Mobile navigation toggle */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      // swap icon: hamburger <-> close
      var iconOpen = toggle.querySelector(".icon-open");
      var iconClose = toggle.querySelector(".icon-close");
      if (iconOpen && iconClose) {
        iconOpen.hidden = open;
        iconClose.hidden = !open;
      }
    });

    /* Close the menu when a link is chosen */
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        var iconOpen = toggle.querySelector(".icon-open");
        var iconClose = toggle.querySelector(".icon-close");
        if (iconOpen && iconClose) {
          iconOpen.hidden = false;
          iconClose.hidden = true;
        }
      }
    });

    /* Close on Escape */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* Footer year */
  var yearEls = document.querySelectorAll("[data-year]");
  var thisYear = new Date().getFullYear();
  yearEls.forEach(function (el) { el.textContent = thisYear; });
})();
