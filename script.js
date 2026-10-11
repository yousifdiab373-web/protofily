/* =========================================================
   Youssef Diab — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  // ✏️ EDIT: the address that receives messages from the contact form
  var CONTACT_EMAIL = "your.email@example.com";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }

  /* ---------- Theme toggle (light / dark) ---------- */
  var themeBtn = $("#themeToggle");
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#0b1426" : "#1f3157");
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $("#menuToggle");
  var navLinks = $("#navLinks");
  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuBtn.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  }
  menuBtn.addEventListener("click", function () { setMenu(!navLinks.classList.contains("open")); });
  $$(".nav-link").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) {
    if (navLinks.classList.contains("open") && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });

  /* ---------- Scroll: navbar state, progress bar, back-to-top ---------- */
  var navbar = $("#navbar");
  var progress = $("#scrollProgress");
  var toTop = $("#backToTop");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    navbar.classList.toggle("scrolled", y > 20);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    toTop.classList.toggle("show", y > 600);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Active nav link while scrolling ---------- */
  var sections = $$("main section[id]");
  var links = $$(".nav-link");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Typing effect ---------- */
  var typedEl = $("#typed");
  var roles = [
    ".NET Backend Developer",
    "ASP.NET Core API Developer",
    "C# Enthusiast",
    "Clean Code Advocate"
  ];
  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = roles[0];
    } else {
      var r = 0, c = 0, deleting = false;
      (function tick() {
        var word = roles[r];
        typedEl.textContent = word.substring(0, c);
        var delay = deleting ? 45 : 90;
        if (!deleting && c === word.length) { deleting = true; delay = 1600; }
        else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
        else { c += deleting ? -1 : 1; }
        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- Reveal on scroll + stat counters ---------- */
  var revealEls = $$(".reveal");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var duration = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        $$("[data-count]", entry.target).forEach(animateCount);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
    $$("[data-count]").forEach(animateCount);
  }

  /* ---------- Project filters ---------- */
  var filterBtns = $$(".filter-btn");
  var cards = $$(".project-card");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", String(on));
      });
      cards.forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-category") === f;
        card.classList.remove("pop");
        card.classList.toggle("hide", !show);
        if (show) {
          card.classList.add("visible"); // make sure revealed cards stay visible
          void card.offsetWidth;          // restart the animation
          card.classList.add("pop");
        }
      });
    });
  });

  /* ---------- Contact form ---------- */
  var form = $("#contactForm");
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, msg) {
    var field = input.closest(".field");
    var out = $('.error[data-for="' + input.id + '"]', field);
    field.classList.toggle("invalid", !!msg);
    if (out) out.textContent = msg || "";
    return !msg;
  }
  function validate(input) {
    var v = input.value.trim();
    if (!v) return setError(input, "This field is required.");
    if (input.type === "email" && !emailRe.test(v)) return setError(input, "Please enter a valid email address.");
    if (input.id === "message" && v.length < 10) return setError(input, "Please write at least 10 characters.");
    return setError(input, "");
  }

  if (form) {
    var inputs = $$("input, textarea", form);
    inputs.forEach(function (inp) {
      inp.addEventListener("blur", function () { validate(inp); });
      inp.addEventListener("input", function () {
        if (inp.closest(".field").classList.contains("invalid")) validate(inp);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      inputs.forEach(function (inp) { if (!validate(inp)) ok = false; });
      if (!ok) { showToast("Please fix the highlighted fields."); return; }

      var name = $("#name").value.trim();
      var email = $("#email").value.trim();
      var subject = $("#subject").value.trim();
      var message = $("#message").value.trim();

      var body = message + "\n\n— " + name + " (" + email + ")";
      var href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      showToast("Opening your email app…");
      window.location.href = href;
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
