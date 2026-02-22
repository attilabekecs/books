import { clamp, showToast } from "./utils.js";
import { getBookProgress, setBookProgress } from "./storage.js";

/**
 * Renderel egy könyvet a #reader elembe.
 * - PDF: PDF.js (oldal léptetés)
 * - EPUB: epub.js (cfi mentés)
 */
export async function openReader({ book, mountEl }) {
  if (!mountEl) return;

  mountEl.innerHTML = "";

  if (!book?.file || !book?.format) {
    mountEl.innerHTML = `<div class="loading">Nincs olvasható fájl ehhez a könyvhöz.</div>`;
    return;
  }

  if (book.format === "pdf") {
    await openPdf({ book, mountEl });
    return;
  }

  if (book.format === "epub") {
    await openEpub({ book, mountEl });
    return;
  }

  mountEl.innerHTML = `<div class="loading">Nem támogatott formátum: ${book.format}</div>`;
}

async function openPdf({ book, mountEl }){
  const progress = getBookProgress(book.id);
  let currentPage = progress?.type === "pdf" && progress.page ? progress.page : 1;

  mountEl.innerHTML = `
    <div class="reader-toolbar">
      <button type="button" data-action="pdfPrev">⬅ Előző</button>
      <button type="button" data-action="pdfNext">Következő ➡</button>
      <span class="reader-meta" id="pdfMeta"></span>
    </div>
    <canvas id="pdfCanvas"></canvas>
  `;

  const canvas = mountEl.querySelector("#pdfCanvas");
  const ctx = canvas.getContext("2d");
  const meta = mountEl.querySelector("#pdfMeta");

  // @ts-ignore
  const loadingTask = pdfjsLib.getDocument(book.file);
  const pdf = await loadingTask.promise;

  currentPage = clamp(currentPage, 1, pdf.numPages);

  async function renderPage(pageNo){
    const page = await pdf.getPage(pageNo);

    const scale = 1.4;
    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const percent = (pageNo / pdf.numPages) * 100;
    meta.textContent = `Oldal: ${pageNo}/${pdf.numPages} • ${percent.toFixed(1)}%`;

    setBookProgress(book.id, {
      type: "pdf",
      page: pageNo,
      pages: pdf.numPages,
      percent: Number(percent.toFixed(2))
    });
  }

  await renderPage(currentPage);

  mountEl.querySelector('[data-action="pdfPrev"]').addEventListener("click", async () => {
    currentPage = clamp(currentPage - 1, 1, pdf.numPages);
    await renderPage(currentPage);
  });

  mountEl.querySelector('[data-action="pdfNext"]').addEventListener("click", async () => {
    currentPage = clamp(currentPage + 1, 1, pdf.numPages);
    await renderPage(currentPage);
  });

  showToast("PDF megnyitva ✔");
}

async function openEpub({ book, mountEl }){
  const progress = getBookProgress(book.id);
  const savedCfi = progress?.type === "epub" ? progress.cfi : null;

  mountEl.innerHTML = `
    <div class="reader-toolbar">
      <button type="button" data-action="epubPrev">⬅ Előző</button>
      <button type="button" data-action="epubNext">Következő ➡</button>
      <span class="reader-meta" id="epubMeta"></span>
    </div>
    <div id="epubReader" style="height: 600px; border: 1px solid var(--border); border-radius: 14px; overflow: hidden;"></div>
  `;

  // @ts-ignore
  const epubBook = ePub(book.file);
  const rendition = epubBook.renderTo("epubReader", {
    width: "100%",
    height: "100%"
  });

  const meta = mountEl.querySelector("#epubMeta");

  rendition.on("relocated", (location) => {
    const cfi = location?.start?.cfi;
    // percent nincs mindig stabilan, de próbáljuk:
    const percent = location?.start?.percentage != null ? location.start.percentage * 100 : null;

    meta.textContent = percent != null
      ? `Haladás: ${percent.toFixed(1)}%`
      : `Pozíció mentve`;

    setBookProgress(book.id, {
      type: "epub",
      cfi: cfi || null,
      percent: percent != null ? Number(percent.toFixed(2)) : null
    });
  });

  await rendition.display(savedCfi || undefined);

  mountEl.querySelector('[data-action="epubPrev"]').addEventListener("click", () => rendition.prev());
  mountEl.querySelector('[data-action="epubNext"]').addEventListener("click", () => rendition.next());

  showToast("EPUB megnyitva ✔");
}
