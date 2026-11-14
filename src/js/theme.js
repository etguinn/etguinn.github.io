/* Runs before first paint (no `defer`) so the stored theme never flashes.
   No dependencies, no network, nothing tracked. */
(function () {
  var KEY = "theme";
  var root = document.documentElement;

  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) {
    /* Private mode or storage disabled — fall back to the OS preference. */
  }

  function current() {
    return (
      root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", function () {
        var next = current() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try {
          localStorage.setItem(KEY, next);
        } catch (e) {}
      });
    });
  });
})();
