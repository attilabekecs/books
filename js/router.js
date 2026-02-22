import state from "./state.js";
import { renderHome } from "./views/homeView.js";
import { renderLibrary } from "./views/libraryView.js";
import { renderFavorites } from "./views/favoritesView.js";
import { renderStats } from "./views/statsView.js";

export function render(root) {

  switch (state.view) {
    case "library":
      root.innerHTML = renderLibrary(state);
      break;
    case "favorites":
      root.innerHTML = renderFavorites(state);
      break;
    case "stats":
      root.innerHTML = renderStats(state);
      break;
    default:
      root.innerHTML = renderHome(state);
  }
}
