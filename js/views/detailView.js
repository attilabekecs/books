import { safeText } from "../utils.js";

export function renderDetail(state){

  const book = state.books.find(b => b.id === String(state.selectedId));

  if (!book){
    return `<div class="loading">Nem találom a könyvet.</div>`;
  }

  return `
    <section class="book-detail">

      <div class="detail-left">
        <img 
          src="${safeText(book.cover)}" 
          class="detail-poster" 
          alt="${safeText(book.title)}"
        >
      </div>

      <div class="detail-right">

        <h1>${safeText(book.title)}</h1>
        <p style="opacity:.85;">${safeText(book.author)}</p>
        <p style="opacity:.6;">
          ${book.year ? safeText(book.year) : ""} 
          ${book.genre ? (book.year ? " • " : "") + safeText(book.genre) : ""}
        </p>

        <p style="line-height:1.6;">
          ${safeText(book.description)}
        </p>

        <div class="actions">
          <button type="button" data-action="openReader" data-id="${safeText(book.id)}">
            📖 Olvasás
          </button>

          <button type="button" class="secondary" data-action="openEdit" data-id="${safeText(book.id)}">
            ✏️ Szerkesztés
          </button>

          <button type="button" class="secondary" data-action="toggleFavorite" data-id="${safeText(book.id)}">
            ⭐ ${book.favorite ? "Eltávolítás" : "Kedvencekhez"}
          </button>

          ${
            book.file
              ? `<a href="${safeText(book.file)}" target="_blank">
                   <button type="button" class="secondary">⬇ Letöltés</button>
                 </a>`
              : ""
          }

          <button type="button" class="secondary" data-action="goBack">
            ⬅ Vissza
          </button>
        </div>

        <div id="reader"></div>

      </div>
    </section>
  `;
}
