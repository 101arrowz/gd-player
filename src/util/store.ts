const KEY = 'gdb-store';

export type Store = {
  username: string;
  password: string;
  loadMessage: number;
};

const store: Partial<Store> = JSON.parse(localStorage.getItem(KEY) || '{}');

window.addEventListener('beforeunload', () => {
  localStorage.setItem(KEY, JSON.stringify(store));
});

export default store;
