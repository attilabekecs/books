import { bookCard } from "../components/bookCard.js";
import { searchBar } from "../components/searchBar.js";

export function renderLibrary(state) {
  const filtered = state.books.filter(b =>
    b.title.toLowerCase().includes(state.search.toLowerCase())
  );

  return `
    ${searchBar(state.search)}
    <section class="book-grid">
      ${filtered.map(bookCard).join("")}
    </section>
  `;
}
