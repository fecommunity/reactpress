import { publicAssetUrl } from "@/utils/constants";

/** Hero carousel slide keys (i18n under `login.heroSlides.*`) and matching illustrations. */
export const LOGIN_HERO_SLIDES = [
  { id: "zeroConfig", image: publicAssetUrl("/showcase/undraw_docusaurus_mountain.svg") },
  { id: "cli", image: publicAssetUrl("/showcase/undraw_version_control.svg") },
  { id: "gettingStarted", image: publicAssetUrl("/showcase/undraw_docusaurus_tree.svg") },
  { id: "modernUi", image: publicAssetUrl("/showcase/undraw_react.svg") },
  { id: "content", image: publicAssetUrl("/showcase/undraw_typewriter.svg") },
  { id: "integrations", image: publicAssetUrl("/showcase/undraw_around_the_world.svg") },
  { id: "i18n", image: publicAssetUrl("/showcase/undraw_docusaurus_react.svg") },
] as const;

export type LoginHeroSlideId = (typeof LOGIN_HERO_SLIDES)[number]["id"];
