(function () {
  "use strict";

  var root = document.documentElement;

  function save(theme) {
    try {
      if (theme) localStorage.setItem("theme", theme);
      else localStorage.removeItem("theme");
    } catch (e) {}
  }

  function isDark() {
    var t = root.dataset.theme;
    if (t) return t !== "light";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function setTheme(theme) {
    if (theme) root.dataset.theme = theme;
    else delete root.dataset.theme;
    save(theme);
  }

  // Light/dark toggle. Leaving phosphor mode goes back to dark.
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      if (root.dataset.theme === "phosphor") return setTheme("dark");
      setTheme(isDark() ? "light" : "dark");
    });
  }

  // Easter egg: type "green" anywhere (outside a text field) for a green screen.
  var typed = "";
  document.addEventListener("keydown", function (e) {
    var el = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
    if (!e.key || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-5);
    if (typed === "green") {
      typed = "";
      setTheme(root.dataset.theme === "phosphor" ? null : "phosphor");
    }
  });
  if (/[?&]phosphor\b/.test(location.search)) setTheme("phosphor");

  // Copy buttons: explicit ones, plus one on every code block in posts.
  function copy(btn, text) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function () {
      var label = btn.textContent;
      btn.textContent = "copied";
      setTimeout(function () { btn.textContent = label; }, 1500);
    }, function () {});
  }

  document.querySelectorAll(".copy-btn[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () { copy(btn, btn.dataset.copy); });
  });

  document.querySelectorAll(".prose pre").forEach(function (pre) {
    var code = pre.querySelector("code");
    if (!code) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "copy";
    btn.addEventListener("click", function () { copy(btn, code.innerText); });
    pre.appendChild(btn);
  });
})();
