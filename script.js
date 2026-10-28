(function () {
  var root = document.documentElement;
  var THEME_KEY = "pattaya-demo-theme";
  var LANG_KEY = "pattaya-demo-lang";

  function theme() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function lang() { return root.lang === "th" ? "th" : "en"; }

  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    root.style.colorScheme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    var btn = document.querySelector("[data-theme-toggle]");
    var live = document.getElementById("theme-live");
    var light = t === "light";
    if (btn) {
      btn.setAttribute("aria-pressed", light ? "true" : "false");
      btn.setAttribute("aria-label", light
        ? (lang() === "th" ? "ใช้โหมดมืด" : "Use dark theme")
        : (lang() === "th" ? "ใช้โหมดสว่าง" : "Use light theme"));
    }
    if (live) {
      live.textContent = light
        ? (lang() === "th" ? "โหมดสว่าง" : "Light theme")
        : (lang() === "th" ? "โหมดมืด" : "Dark theme");
    }
  }

  function applyLang(l) {
    root.lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === l ? "true" : "false");
    });
    applyTheme(theme());
  }

  var themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(theme() === "light" ? "dark" : "light");
    });
  }
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });
  applyLang(lang());

  var menuBtn = document.querySelector(".menu-btn");
  var sheet = document.getElementById("sheet");
  var scrim = document.getElementById("scrim");
  if (sheet && "inert" in sheet) sheet.inert = true;
  function setMenu(open) {
    if (!menuBtn || !sheet || !scrim) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open
      ? (lang() === "th" ? "ปิดเมนู" : "Close menu")
      : (lang() === "th" ? "เปิดเมนู" : "Open menu"));
    sheet.classList.toggle("open", open);
    scrim.classList.toggle("open", open);
    sheet.setAttribute("aria-hidden", open ? "false" : "true");
    if ("inert" in sheet) sheet.inert = !open;
    root.classList.toggle("nav-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      var first = sheet.querySelector("a, button");
      if (first) first.focus();
    }
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
  }
  if (scrim) scrim.addEventListener("click", function () { setMenu(false); menuBtn.focus(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (sheet && sheet.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
      closeLb();
    }
    if (e.key === "Tab" && sheet && sheet.classList.contains("open")) {
      var nodes = sheet.querySelectorAll("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])");
      if (!nodes.length) return;
      var first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  if (sheet) {
    sheet.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  var planImg = document.getElementById("plan-img");
  var planFrame = document.getElementById("plan-frame");
  var planCap = document.getElementById("plan-cap");
  var plans = {
    plate: { src: "images/plans/floorplan.png", paper: false },
    a: { src: "images/gallery/suite_deluxe-6.jpg", paper: true },
    b: { src: "images/gallery/suite-6.jpg", paper: true },
    c: { src: "images/gallery/studio-6.jpg", paper: true },
    d: { src: "images/gallery/studio_deluxe-6.jpg", paper: true },
    vip: { src: "images/gallery/vip-6.jpg", paper: true }
  };
  function showPlan(id) {
    var p = plans[id];
    if (!p || !planImg) return;
    planImg.src = p.src;
    planFrame.classList.toggle("paper", p.paper);
    document.querySelectorAll("[data-plan]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-plan") === id ? "true" : "false");
    });
    document.querySelectorAll("[data-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-panel") !== id;
    });
    if (planCap) planCap.hidden = id !== "plate";
  }
  document.querySelectorAll("[data-plan]").forEach(function (b) {
    b.addEventListener("click", function () { showPlan(b.getAttribute("data-plan")); });
  });
  document.querySelectorAll("[data-open-plan]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("data-open-plan");
      if (plans[id]) {
        showPlan(id);
      }
    });
  });

  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbCap = document.getElementById("lb-cap");
  var shots = Array.prototype.slice.call(document.querySelectorAll("[data-shot]"));
  var lbIndex = 0;
  function openLb(i) {
    if (!lb || !shots.length) return;
    lbIndex = i;
    var btn = shots[i];
    var img = btn.querySelector("img");
    lbImg.src = img.getAttribute("data-full") || img.src;
    lbImg.alt = img.alt;
    var cap = (lang() === "th" ? btn.getAttribute("data-caption-th") : btn.getAttribute("data-caption")) || img.alt;
    lbCap.textContent = cap;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    if (!lb || !lb.classList.contains("open")) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    if (!(sheet && sheet.classList.contains("open"))) document.body.style.overflow = "";
  }
  shots.forEach(function (btn, i) {
    btn.addEventListener("click", function () { openLb(i); });
  });
  var lbX = document.getElementById("lb-x");
  if (lbX) lbX.addEventListener("click", closeLb);
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  var prev = document.getElementById("lb-prev");
  var next = document.getElementById("lb-next");
  if (prev) prev.addEventListener("click", function () { openLb((lbIndex - 1 + shots.length) % shots.length); });
  if (next) next.addEventListener("click", function () { openLb((lbIndex + 1) % shots.length); });
  document.addEventListener("keydown", function (e) {
    if (!lb || !lb.classList.contains("open")) return;
    if (e.key === "ArrowRight") openLb((lbIndex + 1) % shots.length);
    if (e.key === "ArrowLeft") openLb((lbIndex - 1 + shots.length) % shots.length);
  });

  var form = document.getElementById("inquiry");
  var status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (status) {
        status.textContent = lang() === "th"
          ? "บันทึกไว้ในหน้านี้เท่านั้น ไม่ได้ส่งถึงแมกซ์เซ็นทรัล"
          : "Kept on this page only. Nothing was sent to MAXXCENTRAL.";
      }
      form.reset();
    });
  }
})();
