import { FAVORITES_KEY, PROGRESS_KEY, THEME_KEY } from "./config.js";

export function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

export function toggleFavorite(id) {
  let fav = getFavorites();
  if (fav.includes(id)) {
    fav = fav.filter(f => f !== id);
  } else {
    fav.push(id);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(fav));
}

export function getProgress() {
  return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
}

export function setProgress(id, value) {
  const data = getProgress();
  data[id] = value;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
