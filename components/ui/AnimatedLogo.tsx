'use client';

export default function AnimatedLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="animated-logo"
    >
      <style>{`
        /* Outer arc — slow spin */
        .arc-outer {
          transform-origin: center;
          animation: spin-cw 6s linear infinite;
        }
        /* Mid arc — reverse spin */
        .arc-mid {
          transform-origin: center;
          animation: spin-ccw 8s linear infinite;
        }
        /* Inner arc — faster spin */
        .arc-inner {
          transform-origin: center;
          animation: spin-cw 4s linear infinite;
        }
        /* Shield pulse */
        .shield {
          transform-origin: 0px 12px;
          animation: pulse 3s ease-in-out infinite;
        }
        /* Checkmark draw */
        .checkmark {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: draw-check 1.2s ease-out 0.3s forwards, glow 3s ease-in-out 1.5s infinite;
        }

        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spin-ccw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.05); }
        }
        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }
        @keyframes glow {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.7; }
        }
      `}</style>

      {/* Outer arc ring — white, slow clockwise */}
      <path
        className="arc-outer"
        d="M -82 0 A 82 82 0 1 1 82 0"
        fill="none"
        stroke="#fff"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* Mid arc ring — blue, counter-clockwise */}
      <path
        className="arc-mid"
        d="M -62 0 A 62 62 0 1 1 62 0"
        fill="none"
        stroke="#4094d9"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Inner arc ring — orange, faster clockwise */}
      <path
        className="arc-inner"
        d="M -42 0 A 42 42 0 1 1 42 0"
        fill="none"
        stroke="#F08530"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Shield body — gentle pulse */}
      <path
        className="shield"
        d="M 0 -18 L -20 -8 L -20 14 Q -20 34 0 42 Q 20 34 20 14 L 20 -8 Z"
        fill="#fff"
      />
      {/* Checkmark — draw-in then glow */}
      <polyline
        className="checkmark"
        points="-9,14 -2,23 12,4"
        fill="none"
        stroke="#160D76"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
