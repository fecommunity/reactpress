/** When set (desktop embedded API), reduce bootstrap noise in terminal. */
export function isLocalApiQuiet(): boolean {
  return process.env.REACTPRESS_LOCAL_API_QUIET === '1';
}
