import styles from "@/modules/appearance/components/theme-cover-placeholder.module.css";

type Props = {
  name: string;
  className?: string;
  fill?: boolean;
};

export function ThemeCoverPlaceholder({ name, className, fill }: Props) {
  return (
    <div
      className={`${styles.placeholder} ${fill ? styles.fill : ""} ${className ?? ""}`}
      role="img"
      aria-label={name}
    >
      <div className={styles.bg} />
      <div className={styles.grid} />
      <span className={styles.badge}>REACTPRESS</span>
      <div className={styles.mockup}>
        <div className={styles.chrome}>
          <span className={`${styles.dot} ${styles.dotRed}`} />
          <span className={`${styles.dot} ${styles.dotYellow}`} />
          <span className={`${styles.dot} ${styles.dotGreen}`} />
          <span className={styles.urlBar} />
        </div>
        <div className={styles.body}>
          <div className={styles.hero}>
            <span className={styles.heroLinePrimary} />
            <span className={styles.heroLineSecondary} />
          </div>
          <div className={styles.lines}>
            <span className={styles.line} style={{ width: "72%" }} />
            <span className={`${styles.line} ${styles.lineMuted}`} style={{ width: "88%" }} />
            <span className={`${styles.line} ${styles.lineMuted}`} style={{ width: "64%" }} />
          </div>
          <div className={styles.cards}>
            <span className={styles.card} />
            <span className={styles.card} />
            <span className={styles.card} />
          </div>
        </div>
      </div>
      <p className={styles.name}>{name}</p>
    </div>
  );
}
