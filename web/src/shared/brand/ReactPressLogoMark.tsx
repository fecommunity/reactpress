import {
  REACT_PRESS_ORBIT_PATHS,
  REACT_PRESS_P_CENTER,
  REACT_PRESS_P_FONT_SIZE,
  REACT_PRESS_P_FONT_WEIGHT,
  REACT_PRESS_P_LETTER_SPACING,
  REACT_PRESS_WORDMARK_FONT_FAMILY,
} from "./reactPressLogoPaths";

type ReactPressLogoMarkProps = {
  className?: string;
};

/**
 * React atom orbits + ReactPress “P” (Press) center mark.
 */
export function ReactPressLogoMark({ className }: ReactPressLogoMarkProps) {
  return (
    <svg
      className={className}
      width={112}
      height={102}
      viewBox="0 0 112 102"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ReactPress"
    >
      <g stroke="var(--logo)" strokeWidth={5.333} strokeLinecap="round">
        {REACT_PRESS_ORBIT_PATHS.map((d, index) => (
          <path key={index} fill="none" d={d} />
        ))}
      </g>
      <text
        x={REACT_PRESS_P_CENTER.x}
        y={REACT_PRESS_P_CENTER.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--logo)"
        fontFamily={REACT_PRESS_WORDMARK_FONT_FAMILY}
        fontSize={REACT_PRESS_P_FONT_SIZE}
        fontWeight={REACT_PRESS_P_FONT_WEIGHT}
        letterSpacing={REACT_PRESS_P_LETTER_SPACING}
      >
        P
      </text>
    </svg>
  );
}
