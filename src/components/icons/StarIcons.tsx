import React from "react";

export const StarFull = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.834 1.48 8.285L12 18.896l-7.416 4.529 1.48-8.285L0 9.306l8.332-1.151z" />
  </svg>
);

export const StarEmpty = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2l3.09 6.26 6.91.99-5 4.87 1.18 6.88L12 17.77l-6.18 3.23 1.18-6.88-5-4.87 6.91-.99z" />
  </svg>
);

export const StarHalf = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <defs>
      <linearGradient id="halfGrad" x1="0" x2="1" y1="0" y2="0">
        <stop offset="50%" stopColor="currentColor" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.834 1.48 8.285L12 18.896l-7.416 4.529 1.48-8.285L0 9.306l8.332-1.151z"
      fill="url(#halfGrad)"
      stroke="currentColor"
      strokeWidth={1.5}
    />
  </svg>
);

export const StarQuarter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <defs>
      <linearGradient id="quarterGrad" x1="0" x2="1" y1="0" y2="0">
        <stop offset="25%" stopColor="currentColor" />
        <stop offset="25%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.834 1.48 8.285L12 18.896l-7.416 4.529 1.48-8.285L0 9.306l8.332-1.151z"
      fill="url(#quarterGrad)"
      stroke="currentColor"
      strokeWidth={1.5}
    />
  </svg>
);

export const StarThreeQuarter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <defs>
      <linearGradient id="threeQuarterGrad" x1="0" x2="1" y1="0" y2="0">
        <stop offset="75%" stopColor="currentColor" />
        <stop offset="75%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.834 1.48 8.285L12 18.896l-7.416 4.529 1.48-8.285L0 9.306l8.332-1.151z"
      fill="url(#threeQuarterGrad)"
      stroke="currentColor"
      strokeWidth={1.5}
    />
  </svg>
);
