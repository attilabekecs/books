/* =========================
   APP VERSION + INIT
========================= */

let APP_VERSION = "0.0.0";

document.addEventListener("DOMContentLoaded", async () => {

  // Verzió betöltés
  try {
    const res = await fetch("version.json?t=" + Date.now());
    const data = await res.json();
    APP_VERSION = data.version;
    document.getElementById("appVersion").textContent = "v" + APP_VERSION;
  } catch {
    document.getElementById("appVersion").textContent = "v0.0.0";
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
   GLOBALS
========================= */

let books = [];
let currentView = "home";

const POSTER_SIZE = 180;

const API_URL = "https://script.google.com/macros/s/AKfycbzaNttQLOSIfmGTMQbVWY2woLEFw0a8wo-3QMixlnQCloAPMlPa1QjbYYIi1jiRFUZBNA/exec";
const CACHE_KEY = "bookplex_cache";


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

      books = data.map(book => ({
        ...book,
        cover: book.cover || "https://via.placeholder.com/300x450?text=No+Cover",
        year: book.year || "",
        genre: book.genre || "",
        description: book.description || "",
        favorite: book.favorite || false,
        format: book.format || ""
      }));

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
   HOME (Modern Layout)
========================= */

function renderHome() {

  const main = document.getElementById("mainContent");
  const random = books[Math.floor(Math.random() * books.length)];

  const desc = (random.description || "").trim();
  const shortDesc = desc.length > 320 ? desc.substring(0, 320) + "..." : desc;

  main.innerHTML = `
    <section class="home-hero">
      <div class="home-hero-poster">
        <img src="${random.cover}" alt="${random.title}">
      </div>

      <div class="home-hero-info">
        <h2>${random.title}</h2>
        <div class="home-hero-meta">${random.author}</div>
        <div class="home-hero-sub">
          ${random.year ? random.year : ""} 
          ${random.genre ? (random.year ? " • " : "") + random.genre : ""}
        </div>

        <p class="home-hero-desc">${shortDesc}</p>

        <div class="home-hero-actions">
          <button onclick="renderBookDetailById('${random.id}')">
            📖 Olvasás
          </button>
        </div>
      </div>
    </section>

    <section class="grid">
      ${renderBookGrid(books)}
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

  document.getElementById("bookGrid").innerHTML = renderBookGrid(filtered);
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
      ${renderBookGrid(favorites)}
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
        <p>${book.year} ${book.genre ? "• " + book.genre : ""}</p>
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

  const formData = new URLSearchParams();
  formData.append("data", JSON.stringify(books));

  fetch(API_URL, {
    method: "POST",
    body: formData
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


/* =========================
   GRID RENDER
========================= */

function renderBookGrid(list) {

  return list.map(book => `
    <div class="book-card" onclick="renderBookDetailById('${book.id}')">
      <img src="${book.cover}" alt="${book.title}">
      <p>${book.title}</p>
    </div>
  `).join("");
}
