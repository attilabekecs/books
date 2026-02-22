import { bookCard } from "../components/bookCard.js";

export function renderHome(state) {
  const hero = state.books[0];

  return `
    <section class="hero">
      <img src="${hero?.cover}">
      <div>
        <h1>${hero?.title}</h1>
        <p>${hero?.description || ""}</p>
      </div>
    </section>

    <section class="book-grid">
      ${state.books.slice(0,6).map(bookCard).join("")}
    </section>
  `;
}
