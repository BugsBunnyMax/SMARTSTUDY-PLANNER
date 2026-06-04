import React from 'react';

const Logo = ({ className = '' }) => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`logo-mark ${className}`}
  >
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <linearGradient id="g2" x1="0" x2="1">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
    </defs>
    <rect
      x="6"
      y="10"
      width="40"
      height="34"
      rx="6"
      fill="url(#g1)"
      opacity="0.95"
    />
    <path
      d="M12 22c6-4 14-6 22-2v18c-8-4-16-2-22 2V22z"
      fill="url(#g2)"
      opacity="0.95"
    />
    <path
      d="M30 30l6-6 8 8"
      stroke="#062e45"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default Logo;
