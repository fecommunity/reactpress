const subjects = new Map();
const ignore = {};

export const subjectScrollListener = (
  self: string,
  target: string,
  callback: (arg: { top: number; left: number }) => void
) => {
  const fns = subjects.get(target) || [];
  fns.push((arg) => {
    callback(arg);
    ignore[self] = true;
  });
  subjects.set(target, fns);
};

export const removeScrollListener = (target: string, callback) => {
  const fns = subjects.get(target);
  if (fns && fns.length) {
    const idx = fns.indexOf(callback);
    if (idx > -1) {
      fns.splice(idx, 1);
    } else {
      subjects.set(target, []);
    }
  }
};

export const registerScollListener = (self: string, callback: (...args) => { top: number; left: number }) => {
  return (...args) => {
    const tmp = ignore[self];

    ignore[self] = false;
    if (tmp) {
      return;
    }
    const value = callback(...args);

    const subjectFns = subjects.get(self) || [];
    subjectFns.forEach((fn) => {
      fn(value);
    });
  };
};
