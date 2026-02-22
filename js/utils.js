export function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

export function truncate(text, max = 320){
  const t = (text || "").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) + "..." : t;
}

export function safeText(text){
  // egyszerű XSS védelem render előtt (nem HTML-t renderelünk)
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeBook(book){
  return {
    ...book,
    id: String(book.id),
    title: book.title || "Untitled",
    author: book.author || "",
    description: book.description || "",
    year: book.year || "",
    genre: book.genre || "",
    cover: book.cover || "https://via.placeholder.com/300x450?text=No+Cover",
    favorite: Boolean(book.favorite),
    format: book.format || "",
    file: book.file || "",
    added: book.added || 0
  };
}

export function byLocale(a, b){
  return (a || "").localeCompare((b || ""), "hu", { sensitivity: "base" });
}

export function showToast(message, ms = 2200){
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}
