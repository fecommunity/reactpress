export function getDocumentScrollTop(): number {
  return (
    document.documentElement.scrollTop ||
    window.pageYOffset ||
    window.scrollY ||
    document.body.scrollTop
  );
}
