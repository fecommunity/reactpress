import "./index.css";

export type AuroraProps = {
  className?: string;
};

export function Aurora({ className }: AuroraProps) {
  const rootClass = className ? `aurora__root ${className}` : "aurora__root";
  return (
    <div className={rootClass} aria-hidden>
      <div className="aurora__glow" />
    </div>
  );
}
