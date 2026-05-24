/** Hero carousel slide keys (i18n under `login.heroSlides.*`) and matching illustrations. */
export const LOGIN_HERO_SLIDES = [
  { id: "zeroConfig", image: "/showcase/undraw_docusaurus_mountain.svg" },
  { id: "cli", image: "/showcase/undraw_version_control.svg" },
  { id: "gettingStarted", image: "/showcase/undraw_docusaurus_tree.svg" },
  { id: "modernUi", image: "/showcase/undraw_react.svg" },
  { id: "content", image: "/showcase/undraw_typewriter.svg" },
  { id: "integrations", image: "/showcase/undraw_around_the_world.svg" },
  { id: "i18n", image: "/showcase/undraw_docusaurus_react.svg" },
] as const;

export type LoginHeroSlideId = (typeof LOGIN_HERO_SLIDES)[number]["id"];
