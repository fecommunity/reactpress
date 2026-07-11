const subjects = new Map<string, Array<(arg: { top: number; left: number }) => void>>();
const ignore: Record<string, boolean> = {};

export const subjectScrollListener = (
  self: string,
  target: string,
  callback: (arg: { top: number; left: number }) => void,
) => {
  const fns = subjects.get(target) || [];
  fns.push((arg) => {
    callback(arg);
    ignore[self] = true;
  });
  subjects.set(target, fns);
};

export const removeScrollListener = (
  target: string,
  callback: (arg: { top: number; left: number }) => void,
) => {
  const fns = subjects.get(target);
  if (fns?.length) {
    const idx = fns.indexOf(callback);
    if (idx > -1) {
      fns.splice(idx, 1);
    } else {
      subjects.set(target, []);
    }
  }
};

export const registerScollListener = (
  self: string,
  callback: (...args: unknown[]) => { top: number; left: number },
) => {
  return (...args: unknown[]) => {
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
