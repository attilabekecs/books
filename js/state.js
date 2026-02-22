const state = {
  books: [],
  view: "home",
  search: "",
  listeners: [],

  setBooks(data) {
    this.books = data;
    this.notify();
  },

  setView(view) {
    this.view = view;
    this.notify();
  },

  setSearch(value) {
    this.search = value;
    this.notify();
  },

  subscribe(fn) {
    this.listeners.push(fn);
  },

  notify() {
    this.listeners.forEach(fn => fn(this));
  }
};

export default state;
