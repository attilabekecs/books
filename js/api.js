import { API_URL, CACHE_KEY } from "./config.js";
import { normalizeBook } from "./utils.js";

export function loadBooksFromCache(){
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const arr = JSON.parse(cached);
    if (!Array.isArray(arr)) return null;
    return arr.map(normalizeBook);
  } catch {
    return null;
  }
}

export function saveBooksToCache(books){
  localStorage.setItem(CACHE_KEY, JSON.stringify(books));
}

export async function fetchBooks(){
  const res = await fetch(API_URL + "?t=" + Date.now());
  if (!res.ok) throw new Error("API GET hiba: " + res.status);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map(normalizeBook);
}
