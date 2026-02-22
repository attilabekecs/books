import { safeText } from "../utils.js";

export function renderStats(state){

  const total = state.books.length;

  const byGenre = {};
  const byAuthor = {};

  for (const b of state.books){

    const genre = b.genre || "—";
    byGenre[genre] = (byGenre[genre] || 0) + 1;

    const author = b.author || "—";
    byAuthor[author] = (byAuthor[author] || 0) + 1;
  }

  const sortedGenres = Object.entries(byGenre)
    .sort((a,b) => b[1] - a[1]);

  const topAuthors = Object.entries(byAuthor)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 10);

  return `
    <h2>Statisztika</h2>

    <p>Összes könyv: <b>${total}</b></p>

    <h3>Műfajok</h3>
    <ul>
      ${sortedGenres.map(([g,c]) => `
        <li>${safeText(g)}: ${c}</li>
      `).join("")}
    </ul>

    <h3>Top szerzők</h3>
    <ol>
      ${topAuthors.map(([a,c]) => `
        <li>${safeText(a)} (${c})</li>
      `).join("")}
    </ol>
  `;
}
