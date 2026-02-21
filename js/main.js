// A JSON index URL (a NAS-on vagy tesztként a GitHub-on is lehet)
const jsonUrl = 'books/index.json';

// DOM referencia
const container = document.getElementById('books');

// JSON betöltése és kártyák létrehozása
fetch(jsonUrl)
  .then(res => res.json())
  .then(data => {
    data.forEach(book => {
      const card = document.createElement('div');
      card.className = 'book-card';

      card.innerHTML = `
        <h3>${book.title}</h3>
        <p><strong>Szerző:</strong> ${book.author}</p>
        <p><strong>Műfaj:</strong> ${book.genre}</p>
        <p><strong>Év:</strong> ${book.year}</p>
        <a href="${book.file}" target="_blank">Megnyitás / Letöltés</a>
      `;
      container.appendChild(card);
    });
  })
  .catch(err => console.error('Hiba a könyv betöltésénél:', err));
