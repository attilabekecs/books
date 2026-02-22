import state from "./state.js";
import { VERSION_URL } from "./config.js";
import { fetchBooks, loadBooksFromCache, saveBooksToCache } from "./api.js";
import { saveLibraryToDrive } from "./driveService.js";
import { renderApp } from "./router.js";
import { showToast, normalizeBook } from "./utils.js";
import { getTheme, setTheme } from "./storage.js";
import { openReader } from "./readerService.js";

const root = document.getElementById("mainContent");

state.subscribe((s) => {
  renderApp(s, root);
});

init().catch(err => {
  console.error(err);
  state.set({ loading: false, error: String(err?.message || err) });
});

async function init(){
  initTheme();
  loadVersion();
  setupSidebarNavigation();

  const cached = loadBooksFromCache();

  if (cached?.length){
    state.set({ books: cached, loading: false, error: null });
  } else {
    state.set({ loading: true });
  }

  try {
    const fresh = await fetchBooks();
    saveBooksToCache(fresh);
    state.set({ books: fresh, loading: false, error: null });
  } catch (e) {
    if (!cached?.length){
      state.set({ loading: false, error: "Nem sikerült betölteni a könyveket." });
    } else {
      showToast("Nem sikerült frissíteni, cache marad.");
    }
  }

  setupEvents();

  window.addEventListener("resize", () => {
    const current = state.get();
    if (current.view === "home") state.notify();
  });
}

function initTheme(){
  const saved = getTheme() || "dark";
  document.body.dataset.theme = saved;

  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.body.dataset.theme || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.body.dataset.theme = next;
    setTheme(next);
  });
}

async function loadVersion(){
  const el = document.getElementById("appVersion");
  if (!el) return;

  try {
    const res = await fetch(VERSION_URL + "?t=" + Date.now());
    if (!res.ok) throw new Error("Version fetch failed");
    const data = await res.json();
    el.textContent = "v" + (data?.version || "0.0.0");
  } catch {
    el.textContent = "v0.0.0";
  }
}

function setupSidebarNavigation(){
  document.querySelectorAll(".sidebar a[data-view]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      document.querySelectorAll(".sidebar a[data-view]")
        .forEach(l => l.classList.remove("active"));

      link.classList.add("active");

      const view = link.dataset.view;

      state.set({
        view,
        selectedId: null
      });
    });
  });
}

function setupEvents(){

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    if (t.id === "searchTitle"){
      state.set({ searchTitle: t.value });
    }

    if (t.id === "searchAuthor"){
      state.set({ searchAuthor: t.value });
    }
  });

  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    if (t.id === "sortSelect"){
      state.set({ sortBy: t.value });
    }
  });

  document.addEventListener("click", async (e) => {
    if (!(e.target instanceof Element)) return;

    const el = e.target.closest("[data-action]");
    if (!el) return;

    const action = el.dataset.action;
    const id = el.dataset.id;

    try {

      switch (action) {

        case "openDetail":
  const currentView = state.get().view;

  state.set({
    view: "detail",
    selectedId: id,
    backView: currentView
  });
  return;

        case "openEdit":
          state.set({ view: "edit", selectedId: id });
          return;

        case "cancelEdit":
          state.set({ view: "detail", selectedId: id });
          return;

        case "goBack":
  const current = state.get();

  if (current.view === "detail") {
    state.set({
      view: current.backView || "library",
      selectedId: null
    });
    return;
  }

  if (current.view === "edit") {
    state.set({
      view: "detail",
      selectedId: current.selectedId
    });
    return;
  }

  state.set({
    view: "library",
    selectedId: null
  });
  return;

        case "toggleFavorite":
          await toggleFavoriteAndSave(id);
          return;

        case "saveEdit":
          await saveEditAndSave(id);
          return;

        case "openReader":
          await openReaderInDetail(id);
          return;
      }

    } catch (err) {
      console.error(err);
      showToast("Hiba: " + String(err?.message || err));
    }
  });
}

async function openReaderInDetail(id){
  const current = state.get();
  const book = current.books.find(b => b.id === String(id));
  if (!book) return;

  if (current.view !== "detail"){
    state.set({ view: "detail", selectedId: id });
  }

  requestAnimationFrame(async () => {
    // ✅ a detail nézetben lévő mount pont
    const mountEl = document.getElementById("reader");
    if (!mountEl) return;

    await openReader({ book, mountEl });

    // opcionális: görgessen oda az olvasóhoz
    mountEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function toggleFavoriteAndSave(id){
  const current = state.get();
  const idx = current.books.findIndex(b => b.id === String(id));
  if (idx < 0) return;

  const next = [...current.books];
  next[idx] = normalizeBook({
    ...next[idx],
    favorite: !next[idx].favorite
  });

  state.set({ books: next });
  saveBooksToCache(next);

  try {
    await saveLibraryToDrive(next);
    showToast("Mentve Drive-ba ✔");
  } catch {
    showToast("Drive mentés sikertelen ❌");
  }
}

async function saveEditAndSave(id){
  const current = state.get();
  const idx = current.books.findIndex(b => b.id === String(id));
  if (idx < 0) return;

  const book = current.books[idx];

  const updated = normalizeBook({
    ...book,
    cover: document.getElementById("editCover")?.value ?? book.cover,
    title: document.getElementById("editTitle")?.value ?? book.title,
    author: document.getElementById("editAuthor")?.value ?? book.author,
    year: document.getElementById("editYear")?.value ?? book.year,
    genre: document.getElementById("editGenre")?.value ?? book.genre,
    description: document.getElementById("editDescription")?.value ?? book.description
  });

  const next = [...current.books];
  next[idx] = updated;

  state.set({ books: next, view: "detail", selectedId: id });
  saveBooksToCache(next);

  try {
    await saveLibraryToDrive(next);
    showToast("Mentve Drive-ba ✔");
  } catch {
    showToast("Drive mentés sikertelen ❌");
  }
}
