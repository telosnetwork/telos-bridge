import {autorun, set, toJS} from 'mobx';

// poor mans mobx-persist-store
export function makePersistable<T extends {[key: string]: any}>(
  target: T,
  options: {name: string},
) {
  if (typeof localStorage === 'undefined') return;
  const storedJson = localStorage.getItem(options.name);
  if (storedJson) {
    set(target, JSON.parse(storedJson));
  }
  autorun(() => {
    const value = toJS(target);
    localStorage.setItem(options.name, JSON.stringify(value));
  });
}
