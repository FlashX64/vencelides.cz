import { requiredElement, elements } from "./dom";

document.addEventListener("DOMContentLoaded", function () {
  const index = document.querySelector<HTMLElement>(".project-index");

  if (!index) {
    return;
  }

  const rows = elements("[data-project]", index);
  const previews = elements("[data-preview]", index);
  const filters = elements("[data-category]", index);
  const count = requiredElement(".project-index-count", index);

  let selected: string | undefined;

  function preview(row: HTMLElement) {
    if (selected === row.dataset.project) {
      return;
    }

    selected = row.dataset.project;

    rows.forEach(function (item) {
      item.classList.toggle("is-previewed", item === row);
    });

    previews.forEach(function (item) {
      item.hidden = item.dataset.preview !== selected;
    });
  }

  rows.forEach(function (row) {
    row.addEventListener("pointerenter", function (event) {
      if (event.pointerType !== "touch") {
        preview(row);
      }
    });

    row.addEventListener("focusin", function () {
      preview(row);
    });
  });

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      const category = button.dataset.category;

      filters.forEach(function (filter) {
        filter.setAttribute("aria-pressed", String(filter === button));
      });

      rows.forEach(function (row) {
        row.hidden =
          category !== "all" &&
          !(row.dataset.categories || "").split(" ").includes(category || "");
      });

      const visible = rows.filter(function (row) {
        return !row.hidden;
      });

      count.textContent = `${visible.length} projects`;

      if (visible.length) {
        preview(visible[0]);
      }

      requiredElement(".project-index-preview", index).hidden =
        visible.length === 0;
    });
  });

  requiredElement(".project-index-filters", index).hidden = false;
});
