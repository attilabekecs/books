import { API_URL, CACHE_KEY } from "./config.js";

export async function fetchBooks() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}
