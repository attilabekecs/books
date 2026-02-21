/* =========================
   APP VERSION
========================= */

const APP_VERSION = new Date().toLocaleString();

/* =========================
   GLOBALS
========================= */

let books = [];
let currentView = "home";

const API_URL = "https://script.google.com/macros/s/AKfycbwy9b7X4yY5SmgBG_uwHam9Y76UkbvuLZF502Xx23-XUidljNCVv7kC8lN_uSIyvUqWaQ/exec";
const CACHE_KEY = "bookplex_cache";

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {

  // Verzió kiírás
  const versionEl = document.getElementById("appVersion");
  if (versionEl) {
    versionEl.textContent = "Build: " + APP_VERSION;
  }

  // Sidebar navigation
  document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".sidebar a").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      currentView = link.dataset.view;
      renderView();
    });
  });

  loadBooks();
});

/* =========================
   LOAD BOOKS (CACHE FIRST)
========================= */

function loadBooks() {

  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    books = JSON.parse(cached);
    renderView();
  }

  fetch(API_URL + "?t=" + Date.now())
    .then(res => res.json())
    .then(data => {

      const newBooks = data.map(book => ({
        ...book,
        cover: book.cover || "https://via.placeholder.com/300x450?text=No+Cover",
        year: book.year || "",
        genre: book.genre || "",
        description: book.description || "",
        favorite: book.favorite || false,
        format: book.format || ""
      }));

      books = newBooks;
      localStorage.setItem(CACHE_KEY, JSON.stringify(books));
      renderView();

    })
    .catch(err => {
      console.error("Hiba betöltéskor:", err);
    });
}

/* =========================
   RENDER VIEW
========================= */

function renderView() {
  const main = document.getElementById("mainContent");

  if (!books.length) {
    main.innerHTML = "<p>Betöltés...</p>";
    return;
  }

  if (currentView === "home") renderHome();
  if (currentView === "library") renderLibrary();
  if (currentView === "favorites") renderFavorites();
}

/* =========================
   HOME
========================= */

function renderHome() {
  const main = document.getElementById("mainContent");
  const random = books[Math.floor(Math.random() * books.length)];

  main.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <h2>${random.title}</h2>
        <p>${random.author}</p>
        <p>${random.description}</p>
        <button onclick="renderBookDetailById('${random.id}')">📖 Olvasás</button>
      </div>
    </section>

    <section class="grid">
      ${books.map(book => `
        <div class="book-card" onclick="renderBookDetailById('${book.id}')">
          <img src="${book.cover}">
          <p>${book.title}</p>
        </div>
      `).join("")}
    </section>
  `;
}

/* =========================
   LIBRARY
========================= */

function renderLibrary() {
  const main = document.getElementById("mainContent");

  main.innerHTML = `
    <section class="filters">
      <input type="text" id="searchTitle" placeholder="Keresés cím szerint...">
      <input type="text" id="searchAuthor" placeholder="Keresés író szerint...">
      <select id="sortSelect">
        <option value="title">Cím (A-Z)</option>
        <option value="author">Író</option>
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

  filtered.sort((a, b) =>
    (a[sortValue] || "").localeCompare(b[sortValue] || "")
  );

  const grid = document.getElementById("bookGrid");

  grid.innerHTML = filtered.map(book => `
    <div class="book-card" onclick="renderBookDetailById('${book.id}')">
      <img src="${book.cover}">
      <p>${book.title}</p>
    </div>
  `).join("");
}

/* =========================
   FAVORITES
========================= */

function renderFavorites() {
  const main = document.getElementById("mainContent");
  const favorites = books.filter(b => b.favorite);

  main.innerHTML = `
    <h2>Kedvencek</h2>
    <section class="grid">
      ${favorites.map(book => `
        <div class="book-card" onclick="renderBookDetailById('${book.id}')">
          <img src="${book.cover}">
          <p>${book.title}</p>
        </div>
      `).join("")}
    </section>
  `;
}

/* =========================
   DETAIL
========================= */

function renderBookDetailById(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  const main = document.getElementById("mainContent");

  main.innerHTML = `
    <section class="book-detail">
      <div class="detail-left">
        <img src="${book.cover}" class="detail-poster">
      </div>
      <div class="detail-right">
        <h1>${book.title}</h1>
        <p>${book.author}</p>
        <p>${book.year || ""} ${book.genre ? "• " + book.genre : ""}</p>
        <p>${book.description}</p>

        <div class="actions">
          <button onclick="openBookById('${book.id}')">📖 Olvasás</button>
          <button onclick="enableEditMode('${book.id}')">✏️ Szerkesztés</button>
          <button onclick="toggleFavorite('${book.id}')">
            ⭐ ${book.favorite ? "Eltávolítás" : "Kedvencekhez"}
          </button>
          <a href="${book.file}" target="_blank">
            <button>⬇ Letöltés</button>
          </a>
        </div>

        <div id="reader"></div>
      </div>
    </section>
  `;
}

/* =========================
   READER
========================= */

function openBookById(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

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

/* =========================
   EDIT + SAVE
========================= */

function enableEditMode(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  const main = document.getElementById("mainContent");

  main.innerHTML = `
    <section class="book-detail edit-mode">
      <h2>Könyv szerkesztése</h2>
      <div class="edit-form">
        <label>Borító URL</label>
        <input type="text" id="editCover" value="${book.cover}">
        <label>Cím</label>
        <input type="text" id="editTitle" value="${book.title}">
        <label>Szerző</label>
        <input type="text" id="editAuthor" value="${book.author}">
        <label>Kiadási év</label>
        <input type="text" id="editYear" value="${book.year}">
        <label>Műfaj</label>
        <input type="text" id="editGenre" value="${book.genre}">
        <label>Leírás</label>
        <textarea id="editDescription" rows="6">${book.description}</textarea>
        <div class="edit-buttons">
          <button onclick="saveEdit('${book.id}')">💾 Mentés</button>
          <button onclick="renderBookDetailById('${book.id}')">❌ Mégse</button>
        </div>
      </div>
    </section>
  `;
}

function saveEdit(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  book.title = document.getElementById("editTitle").value;
  book.author = document.getElementById("editAuthor").value;
  book.year = document.getElementById("editYear").value;
  book.genre = document.getElementById("editGenre").value;
  book.description = document.getElementById("editDescription").value;
  book.cover = document.getElementById("editCover").value;

  saveBooksToDrive();
  renderBookDetailById(id);
}

function toggleFavorite(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  book.favorite = !book.favorite;
  saveBooksToDrive();
  renderBookDetailById(id);
}

function saveBooksToDrive() {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(books),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "ok") {
      localStorage.setItem(CACHE_KEY, JSON.stringify(books));
      alert("Mentve Drive-ba ✔");
    } else {
      alert("Hiba mentéskor!");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Hálózati hiba mentéskor!");
  });
}
