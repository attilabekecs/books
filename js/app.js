let books = [];
let currentView = "home";

fetch("data/books.json")
  .then(res => res.json())
  .then(data => {
    books = data;
    renderView();
  });

/* SIDEBAR NAVIGATION */

document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".sidebar a").forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    currentView = link.dataset.view;
    renderView();
  });
});

function renderView() {
  if (currentView === "home") renderHome();
  if (currentView === "library") renderLibrary();
  if (currentView === "favorites") renderFavorites();
}

/* HOME */

function renderHome() {
  const main = document.getElementById("mainContent");

  const random = books[Math.floor(Math.random() * books.length)];

  main.innerHTML = `
    <section class="hero" style="background-image: url('${random.cover}')">
      <div class="hero-content">
        <h2>${random.title}</h2>
        <p>${random.author}</p>
        <p>${random.description}</p>
        <button onclick='renderBookDetail(${JSON.stringify(random)})'>
          📖 Olvasás
        </button>
      </div>
    </section>

    <section class="grid">
      ${books.map(book => `
        <div class="book-card" onclick='renderBookDetail(${JSON.stringify(book)})'>
          <img src="${book.cover}">
          <p>${book.title}</p>
        </div>
      `).join("")}
    </section>
  `;
}

/* LIBRARY */

function renderLibrary() {
  const main = document.getElementById("mainContent");

  main.innerHTML = `
    <section class="filters">
      <input type="text" id="searchTitle" placeholder="Keresés cím szerint...">
      <input type="text" id="searchAuthor" placeholder="Keresés író szerint...">

      <select id="sortSelect">
        <option value="title">Cím (A-Z)</option>
        <option value="author">Író</option>
        <option value="year">Kiadás éve</option>
        <option value="added">Hozzáadva</option>
      </select>
    </section>

    <section class="grid" id="bookGrid"></section>
  `;

  document.getElementById("searchTitle").oninput = renderFiltered;
  document.getElementById("searchAuthor").oninput = renderFiltered;
  document.getElementById("sortSelect").onchange = renderFiltered;

  renderFiltered();
}

function renderFiltered() {
  const titleSearch = document.getElementById("searchTitle").value.toLowerCase();
  const authorSearch = document.getElementById("searchAuthor").value.toLowerCase();
  const sortValue = document.getElementById("sortSelect").value;

  let filtered = books.filter(book =>
    book.title.toLowerCase().includes(titleSearch) &&
    book.author.toLowerCase().includes(authorSearch)
  );

  filtered.sort((a, b) => a[sortValue] > b[sortValue] ? 1 : -1);

  const grid = document.getElementById("bookGrid");

  grid.innerHTML = filtered.map(book => `
    <div class="book-card" onclick='renderBookDetail(${JSON.stringify(book)})'>
      <img src="${book.cover}">
      <p>${book.title}</p>
    </div>
  `).join("");
}

/* FAVORITES */

function renderFavorites() {
  const main = document.getElementById("mainContent");
  const favorites = books.filter(b => b.favorite);

  main.innerHTML = `
    <h2>Kedvencek</h2>
    <section class="grid">
      ${favorites.map(book => `
        <div class="book-card" onclick='renderBookDetail(${JSON.stringify(book)})'>
          <img src="${book.cover}">
          <p>${book.title}</p>
        </div>
      `).join("")}
    </section>
  `;
}

/* DETAIL PAGE */

function renderBookDetail(book) {
  const main = document.getElementById("mainContent");

  main.innerHTML = `
    <section class="book-detail">
      <div class="detail-left">
        <img src="${book.cover}" class="detail-poster">
      </div>

      <div class="detail-right">
        <h1>${book.title}</h1>
        <p class="author">${book.author}</p>
        <p class="meta">${book.year} • ${book.genre}</p>
        <p class="description">${book.description}</p>

        <div class="actions">
          <button onclick='openBook(${JSON.stringify(book)})'>
            📖 Olvasás
          </button>

          <a href="${book.file}" download>
            <button>⬇ Letöltés</button>
          </a>
        </div>

        <div id="reader"></div>
      </div>
    </section>
  `;
}

/* READER */

function openBook(book) {
  const reader = document.getElementById("reader");

  if (book.format === "pdf") {
    reader.innerHTML = `<canvas id="pdfCanvas"></canvas>`;
    const loadingTask = pdfjsLib.getDocument(book.file);
    loadingTask.promise.then(pdf => {
      pdf.getPage(1).then(page => {
        const canvas = document.getElementById("pdfCanvas");
        const context = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render({ canvasContext: context, viewport });
      });
    });
  }

  if (book.format === "epub") {
    reader.innerHTML = `<div id="epubReader" style="height:600px;"></div>`;
    const bookEpub = ePub(book.file);
    const rendition = bookEpub.renderTo("epubReader", {
      width: "100%",
      height: "100%"
    });
    rendition.display();
  }
}
