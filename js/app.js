let books = [];
let currentBook = null;

fetch("data/books.json")
  .then(res => res.json())
  .then(data => {
    books = data;
    renderHero();
    renderBooks();
  });

function renderHero() {
  const random = books[Math.floor(Math.random() * books.length)];
  currentBook = random;

  document.getElementById("hero-title").innerText = random.title;
  document.getElementById("hero-author").innerText = random.author;
  document.getElementById("hero-description").innerText = random.description;

  document.getElementById("hero-read").onclick = () => openBook(random);
}

function renderBooks() {
  const grid = document.getElementById("bookGrid");
  grid.innerHTML = "";

  let filtered = filterBooks();

  filtered.forEach(book => {
    const div = document.createElement("div");
    div.className = "book-card";
    div.innerHTML = `
      <img src="${book.cover}" alt="">
      <p>${book.title}</p>
    `;
    div.onclick = () => openDetails(book);
    grid.appendChild(div);
  });
}

function filterBooks() {
  const titleSearch = document.getElementById("searchTitle").value.toLowerCase();
  const authorSearch = document.getElementById("searchAuthor").value.toLowerCase();
  const sortValue = document.getElementById("sortSelect").value;

  let result = books.filter(book =>
    book.title.toLowerCase().includes(titleSearch) &&
    book.author.toLowerCase().includes(authorSearch)
  );

  result.sort((a, b) => a[sortValue] > b[sortValue] ? 1 : -1);

  return result;
}

document.getElementById("searchTitle").oninput = renderBooks;
document.getElementById("searchAuthor").oninput = renderBooks;
document.getElementById("sortSelect").onchange = renderBooks;

function openDetails(book) {
  const modal = document.getElementById("modal");
  const details = document.getElementById("modalDetails");

  details.innerHTML = `
    <h2>${book.title}</h2>
    <p><b>Író:</b> ${book.author}</p>
    <p><b>Kiadás:</b> ${book.year}</p>
    <p>${book.description}</p>
    <button onclick="openBook(${JSON.stringify(book).replace(/"/g, '&quot;')})">
      📖 Olvasás
    </button>
    <a href="${book.file}" download>
      <button>⬇ Letöltés</button>
    </a>
    <div id="reader" style="margin-top:20px;"></div>
  `;

  modal.style.display = "flex";
}

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

document.getElementById("closeModal").onclick = () => {
  document.getElementById("modal").style.display = "none";
};
