import { truncate, safeText } from "../utils.js";
import { renderBookGrid } from "../components/bookGrid.js";

export function renderHome(state){
  if (!state.books.length){
    return `<div class="loading">Nincs könyv a könyvtárban.</div>`;
  }

  const random = state.books[Math.floor(Math.random() * state.books.length)];
  const shortDesc = truncate(random.description, 320);
  const oneRowBooks = state.books.slice(0, 5);

  return `
    <section class="home-hero">
      <div class="home-hero-poster">
        <img src="${safeText(random.cover)}" alt="${safeText(random.title)}">
      </div>

      <div class="home-hero-info">
        <h2>${safeText(random.title)}</h2>
        <div class="home-hero-meta">${safeText(random.author)}</div>
        <div class="home-hero-sub">
          ${random.year ? safeText(random.year) : ""} 
          ${random.genre ? (random.year ? " • " : "") + safeText(random.genre) : ""}
        </div>

        <p class="home-hero-desc">${safeText(shortDesc)}</p>

        <div class="home-hero-actions">
          <button type="button" data-action="openDetail" data-id="${safeText(random.id)}">
            📖 Olvasás
          </button>
        </div>
      </div>
    </section>

    <section class="grid home-row">
      ${renderBookGrid(oneRowBooks)}
    </section>
  `;
}
