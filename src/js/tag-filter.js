/* Client-side tag filter for the homepage post list.
   Readers pick one or more tags; "Any" shows posts matching at least one
   selected tag (OR), "All" shows only posts matching every selected tag (AND).
   With JavaScript off, the <section> stays hidden and every post shows. */
(function () {
  const root = document.querySelector("[data-tag-filter]");
  const list = document.querySelector("[data-post-list]");
  if (!root || !list) return;

  const items = [...list.querySelectorAll(".post-list-item")].map((el) => ({
    el,
    tags: (el.dataset.tags || "").split(" ").filter(Boolean),
  }));
  const chips = [...root.querySelectorAll(".tag-chip")];
  const modeButtons = [...root.querySelectorAll("[data-mode]")];
  const clearButton = root.querySelector("[data-clear]");
  const emptyNote = document.querySelector("[data-filter-empty]");

  const selected = new Set();
  let mode = "any";

  function apply() {
    let visible = 0;
    for (const { el, tags } of items) {
      const hit =
        selected.size === 0 ||
        (mode === "any"
          ? [...selected].some((t) => tags.includes(t))
          : [...selected].every((t) => tags.includes(t)));
      el.hidden = !hit;
      if (hit) visible++;
    }
    if (clearButton) clearButton.hidden = selected.size === 0;
    if (emptyNote) emptyNote.hidden = visible !== 0;
  }

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      const tag = chip.dataset.tag;
      if (selected.has(tag)) selected.delete(tag);
      else selected.add(tag);
      chip.setAttribute("aria-pressed", selected.has(tag) ? "true" : "false");
      apply();
    });
  }

  for (const button of modeButtons) {
    button.addEventListener("click", () => {
      mode = button.dataset.mode;
      for (const b of modeButtons)
        b.setAttribute("aria-pressed", b === button ? "true" : "false");
      apply();
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      selected.clear();
      for (const chip of chips) chip.setAttribute("aria-pressed", "false");
      apply();
    });
  }

  // Reveal the controls now that they can work.
  root.hidden = false;
  apply();
})();
