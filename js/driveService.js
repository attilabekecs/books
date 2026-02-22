import { clamp, showToast } from "./utils.js";
import { getBookProgress, setBookProgress } from "./storage.js";

/**
 * Könyv megnyitása (PDF / EPUB)
 */
export async function openReader({ book, mountEl }) {
  if (!mountEl) return;

  mountEl.innerHTML = "";

  if (!book?.file || !book?.format) {
    mountEl.innerHTML = `<div class="loading">Nincs olvasható fájl ehhez a könyvhöz.</div>`;
    return;
  }

  try {
    if (book.format === "pdf") {
      await openPdf({ book, mountEl });
      return;
    }

    if (book.format === "epub") {
      await openEpub({ book, mountEl });
      return;
    }

    mountEl.innerHTML = `<div class="loading">Nem támogatott formátum: ${book.format}</div>`;
  } catch (err) {
    console.error(err);
    mountEl.innerHTML = `<div class="loading">Hiba történt a megnyitás során.</div>`;
    showToast("Olvasó hiba ❌");
  }
}

/* ===========================
   PDF
=========================== */

async function openPdf({ book, mountEl }) {

  // PDF worker beállítás (kritikus!)
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  }

  const progress = getBookProgress(book.id);
  let currentPage =
    progress?.type === "pdf" && progress.page ? progress.page : 1;

  mountEl.innerHTML = `
    <div class="reader-toolbar">
      <button type="button" id="pdfPrev">⬅ Előző</button>
      <button type="button" id="pdfNext">Következő ➡</button>
      <span class="reader-meta" id="pdfMeta"></span>
    </div>
    <canvas id="pdfCanvas"></canvas>
  `;

  const canvas = mountEl.querySelector("#pdfCanvas");
  const ctx = canvas.getContext("2d");
  const meta = mountEl.querySelector("#pdfMeta");
  const prevBtn = mountEl.querySelector("#pdfPrev");
  const nextBtn = mountEl.querySelector("#pdfNext");

  const loadingTask = pdfjsLib.getDocument(book.file);
  const pdf = await loadingTask.promise;

  currentPage = clamp(currentPage, 1, pdf.numPages);

  async function renderPage(pageNo) {
    const page = await pdf.getPage(pageNo);
    const scale = 1.4;
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    const percent = (pageNo / pdf.numPages) * 100;

    meta.textContent =
      `Oldal: ${pageNo}/${pdf.numPages} • ${percent.toFixed(1)}%`;

    setBookProgress(book.id, {
      type: "pdf",
      page: pageNo,
      pages: pdf.numPages,
      percent: Number(percent.toFixed(2))
    });
  }

  await renderPage(currentPage);

  prevBtn.onclick = async () => {
    currentPage = clamp(currentPage - 1, 1, pdf.numPages);
    await renderPage(currentPage);
  };

  nextBtn.onclick = async () => {
    currentPage = clamp(currentPage + 1, 1, pdf.numPages);
    await renderPage(currentPage);
  };

  showToast("PDF megnyitva ✔");
}

/* ===========================
   EPUB
=========================== */

async function openEpub({ book, mountEl }) {

  const progress = getBookProgress(book.id);
  const savedCfi =
    progress?.type === "epub" ? progress.cfi : null;

  mountEl.innerHTML = `
    <div class="reader-toolbar">
      <button type="button" id="epubPrev">⬅ Előző</button>
      <button type="button" id="epubNext">Következő ➡</button>
      <span class="reader-meta" id="epubMeta"></span>
    </div>
    <div id="epubReader" 
         style="height:600px; border:1px solid var(--border); border-radius:14px; overflow:hidden;">
    </div>
  `;

  const meta = mountEl.querySelector("#epubMeta");
  const prevBtn = mountEl.querySelector("#epubPrev");
  const nextBtn = mountEl.querySelector("#epubNext");

  const epubBook = ePub(book.file);

  const rendition = epubBook.renderTo("epubReader", {
    width: "100%",
    height: "100%"
  });

  rendition.on("relocated", (location) => {

    const cfi = location?.start?.cfi;
    const percent =
      location?.start?.percentage != null
        ? location.start.percentage * 100
        : null;

    meta.textContent = percent != null
      ? `Haladás: ${percent.toFixed(1)}%`
      : "Pozíció mentve";

    setBookProgress(book.id, {
      type: "epub",
      cfi: cfi || null,
      percent:
        percent != null
          ? Number(percent.toFixed(2))
          : null
    });
  });

  await rendition.display(savedCfi || undefined);

  prevBtn.onclick = () => rendition.prev();
  nextBtn.onclick = () => rendition.next();

  showToast("EPUB megnyitva ✔");
}

/* ===========================
   DRIVE SAVE (placeholder)
=========================== */

export async function saveLibraryToDrive(data) {
  // Itt később lehet Google Apps Script / API hívás
  console.log("Drive mentés (placeholder):", data);
  return true;
}
