import clsx from 'clsx';
import React from 'react';

import styles from './Logo.module.css';

type LogoProps = {
  className?: string;
};

function Logo({ className }: LogoProps) {
  return (
    <svg
      className={clsx(styles.logo, className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 112 102"
      fill="none"
      role="img"
      aria-label="ReactPress"
      width={112}
      height={102}
    >
      <title>ReactPress</title>
      <g className={styles.rings}>
        <path
          fill="none"
          stroke="#087ea4"
          strokeWidth="5.333"
          strokeLinecap="round"
          d="M56 75.165c29.455 0 53.333-10.745 53.333-24s-23.878-24-53.333-24-53.334 10.745-53.334 24 23.879 24 53.334 24Z"
        />
        <path
          fill="none"
          stroke="#087ea4"
          strokeWidth="5.333"
          strokeLinecap="round"
          d="M35.215 63.165c14.728 25.509 35.972 40.815 47.451 34.188 11.48-6.628 8.846-32.68-5.882-58.188-14.727-25.51-35.972-40.816-47.45-34.188-11.48 6.627-8.846 32.679 5.881 58.188Z"
        />
        <path
          fill="none"
          stroke="#087ea4"
          strokeWidth="5.333"
          strokeLinecap="round"
          d="M35.215 39.165c-14.727 25.509-17.36 51.56-5.882 58.188 11.48 6.627 32.724-8.68 47.451-34.188 14.728-25.51 17.362-51.56 5.883-58.188-11.48-6.628-32.724 8.679-47.452 34.188Z"
        />
      </g>
      <text
        x="56"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#087ea4"
        fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        fontSize="33"
        fontWeight="600"
        letterSpacing="-0.03em"
      >
        P
      </text>
    </svg>
  );
}

export default Logo;
