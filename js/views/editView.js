import { safeText } from "../utils.js";

export function renderEdit(state){

  const book = state.books.find(b => b.id === String(state.selectedId));

  if (!book){
    return `<div class="loading">Nem találom a könyvet.</div>`;
  }

  return `
    <section class="book-detail edit-mode">
      <h2>Könyv szerkesztése</h2>

      <div class="edit-form">

        <label>Borító URL</label>
        <input type="text" id="editCover" value="${safeText(book.cover)}">

        <label>Cím</label>
        <input type="text" id="editTitle" value="${safeText(book.title)}">

        <label>Szerző</label>
        <input type="text" id="editAuthor" value="${safeText(book.author)}">

        <label>Kiadási év</label>
        <input type="text" id="editYear" value="${safeText(book.year)}">

        <label>Műfaj</label>
        <input type="text" id="editGenre" value="${safeText(book.genre)}">

        <label>Leírás</label>
        <textarea id="editDescription" rows="6">${safeText(book.description)}</textarea>

        <div class="edit-buttons">
          <button 
            type="button" 
            class="primary" 
            data-action="saveEdit" 
            data-id="${safeText(book.id)}">
            💾 Mentés
          </button>

          <button 
            type="button" 
            class="secondary" 
            data-action="cancelEdit" 
            data-id="${safeText(book.id)}">
            ❌ Mégse
          </button>
        </div>

      </div>
    </section>
  `;
}
