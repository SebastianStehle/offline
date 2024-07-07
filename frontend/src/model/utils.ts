export function guid() {
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

export function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

export function removeById<T extends { id: string }>(source: T[], id: string) {
  return source.filter(x => x.id !== id);
}
 
export function addOrReplaceById<T extends { id: string }>(source: T[], newItem: T) {
  if (source.find(x => x.id === newItem.id)) {
    return source.map(x => x.id === newItem.id ? newItem : x);
  } else {
    return [...source, newItem];
  }
}