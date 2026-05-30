import pageStyles from "../login-page.module.css";

import { LoginDocsFeatures } from "./-LoginDocsFeatures";
import { LoginDocsHero } from "./-LoginDocsHero";
import { LoginDocsHighlights } from "./-LoginDocsHighlights";
import homeStyles from "./login-docs-home.module.css";

export function LoginDocsHome() {
  return (
    <>
      <section
        className={`${pageStyles.snapScreen} ${homeStyles.snapScreen} ${homeStyles.heroScreen}`}
        data-login-screen="hero"
      >
        <div className={homeStyles.heroScreenBody}>
          <div className={homeStyles.heroScreenHero}>
            <LoginDocsHero merged />
          </div>
          <div className={homeStyles.heroScreenHighlights}>
            <LoginDocsHighlights heroMerged />
          </div>
        </div>
      </section>
      <section
        className={`${pageStyles.snapScreen} ${homeStyles.snapScreen}`}
        data-login-screen="features"
      >
        <div className={homeStyles.snapScreenInner}>
          <LoginDocsFeatures />
        </div>
      </section>
    </>
  );
}
