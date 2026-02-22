import { renderBookGrid } from "../components/bookGrid.js";
import { safeText, byLocale } from "../utils.js";

export function renderLibrary(state){

  const titleSearch = (state.searchTitle || "").toLowerCase();
  const authorSearch = (state.searchAuthor || "").toLowerCase();
  const sortBy = state.sortBy || "title";

  let filtered = state.books.filter(book =>
    book.title.toLowerCase().includes(titleSearch) &&
    book.author.toLowerCase().includes(authorSearch)
  );

  filtered.sort((a, b) => byLocale(a[sortBy], b[sortBy]));

  return `
    <section class="filters">
      <input 
        type="text" 
        id="searchTitle" 
        placeholder="Keresés cím szerint..." 
        value="${safeText(state.searchTitle)}"
      >

      <input 
        type="text" 
        id="searchAuthor" 
        placeholder="Keresés író szerint..." 
        value="${safeText(state.searchAuthor)}"
      >

      <select id="sortSelect">
        <option value="title" ${sortBy === "title" ? "selected" : ""}>
          Cím (A-Z)
        </option>
        <option value="author" ${sortBy === "author" ? "selected" : ""}>
          Író
        </option>
      </select>
    </section>

    <section class="grid" id="bookGrid">
      ${renderBookGrid(filtered)}
    </section>
  `;
}
