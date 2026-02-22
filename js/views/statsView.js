export function renderStats(state) {

  const total = state.books.length;

  const byGenre = {};
  state.books.forEach(b => {
    byGenre[b.genre] = (byGenre[b.genre] || 0) + 1;
  });

  return `
    <h2>Statisztika</h2>
    <p>Összes könyv: ${total}</p>
    <ul>
      ${Object.entries(byGenre)
        .map(([g, c]) => `<li>${g}: ${c}</li>`)
        .join("")}
    </ul>
  `;
}
