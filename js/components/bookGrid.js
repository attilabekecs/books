import { safeText } from "../utils.js";
import { getBookProgress } from "../storage.js";

export function renderBookGrid(books){
  return books.map(book => {
    const progress = getBookProgress(book.id);
    const percent = progress?.percent != null ? Number(progress.percent) : null;

    return `
      <div class="book-card" data-action="openDetail" data-id="${safeText(book.id)}">
        ${book.favorite ? `<div class="fav-badge">⭐</div>` : ``}
        <img src="${safeText(book.cover)}" alt="${safeText(book.title)}">
        <p>${safeText(book.title)}</p>
        ${percent != null ? `
          <div class="card-progress" title="Haladás: ${percent.toFixed(1)}%">
            <div style="width:${percent}%"></div>
          </div>
        ` : ``}
      </div>
    `;
  }).join("");
}
