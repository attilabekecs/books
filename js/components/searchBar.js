export function searchBar(value = "") {
  return `
    <div class="search-bar">
      <input 
        type="text" 
        placeholder="🔍 Keresés..."
        value="${value}"
        id="searchInput"
      />
    </div>
  `;
}
