import { renderBookGrid } from "../components/bookGrid.js";

export function renderFavorites(state){

  const favorites = state.books.filter(b => b.favorite);

  return `
    <h2>Kedvencek</h2>

    <section class="grid">
      ${
        favorites.length
          ? renderBookGrid(favorites)
          : `<div class="loading">Még nincs kedvenc könyved.</div>`
      }
    </section>
  `;
}
