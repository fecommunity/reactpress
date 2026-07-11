import { useCallback, useState } from "react";

export function useToggle(initialValue: boolean): [boolean, (arg?: boolean | null) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback((arg: boolean | null = null) => {
    if (arg !== null && typeof arg === "boolean") {
      setValue(arg);
    } else {
      setValue((v) => !v);
    }
  }, []);

  return [value, toggle];
}
