import { PROGRESS_KEY, THEME_KEY } from "./config.js";

export function getTheme(){
  return localStorage.getItem(THEME_KEY) || "dark";
}

export function setTheme(theme){
  localStorage.setItem(THEME_KEY, theme);
}

export function getProgressMap(){
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); }
  catch { return {}; }
}

export function getBookProgress(bookId){
  const map = getProgressMap();
  return map[String(bookId)] || null;
}

/**
 * progress objektum példák:
 * PDF:  { type:"pdf", page: 12, pages: 350, percent: 3.4 }
 * EPUB: { type:"epub", cfi: "epubcfi(...)", percent: 18.2 }
 */
export function setBookProgress(bookId, progress){
  const map = getProgressMap();
  map[String(bookId)] = progress;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
}
