import { bookCard } from "../components/bookCard.js";
import { getFavorites } from "../storage.js";

export function renderFavorites(state) {
  const favIds = getFavorites();
  const favBooks = state.books.filter(b => favIds.includes(b.id));

  return `
    <h2>Kedvencek</h2>
    <section class="book-grid">
      ${favBooks.map(bookCard).join("")}
    </section>
  `;
}
