import { getFavorites, toggleFavorite, getProgress } from "../storage.js";

export function bookCard(book) {
  const fav = getFavorites().includes(book.id);
  const progress = getProgress()[book.id] || 0;

  return `
    <div class="book-card">
      <img src="${book.cover}" loading="lazy">
      <div class="book-info">
        <h3>${book.title}</h3>
        <p>${book.author}</p>
        <div class="progress-bar">
          <div style="width:${progress}%"></div>
        </div>
        <button class="fav-btn" data-id="${book.id}">
          ${fav ? "⭐" : "☆"}
        </button>
      </div>
    </div>
  `;
}
