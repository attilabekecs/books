import { renderHome } from "./views/homeView.js";
import { renderLibrary } from "./views/libraryView.js";
import { renderFavorites } from "./views/favoritesView.js";
import { renderStats } from "./views/statsView.js";
import { renderDetail } from "./views/detailView.js";
import { renderEdit } from "./views/editView.js";

export function renderApp(state, root){

  if (state.loading){
    root.innerHTML = `<div class="loading">Betöltés...</div>`;
    return;
  }

  if (state.error){
    root.innerHTML = `<div class="loading">Hiba: ${state.error}</div>`;
    return;
  }

  switch (state.view){

    case "library":
      root.innerHTML = renderLibrary(state);
      break;

    case "favorites":
      root.innerHTML = renderFavorites(state);
      break;

    case "stats":
      root.innerHTML = renderStats(state);
      break;

    case "detail":
      root.innerHTML = renderDetail(state);
      break;

    case "edit":
      root.innerHTML = renderEdit(state);
      break;

    case "home":
    default:
      root.innerHTML = renderHome(state);
      break;
  }
}
