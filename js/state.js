const state = {
  // data
  books: [],

  // ui
  view: "home",          // home | library | favorites | stats | detail | edit
  selectedId: null,      // detail/edit könyv id
  loading: true,
  error: null,

  // filters
  searchTitle: "",
  searchAuthor: "",
  sortBy: "title",       // title | author

  listeners: [],

  subscribe(fn){
    this.listeners.push(fn);
  },

  notify(){
    for (const fn of this.listeners) fn(this);
  },

  set(partial){
    Object.assign(this, partial);
    this.notify();
  }
};

export default state;
