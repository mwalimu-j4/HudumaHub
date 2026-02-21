import type { SVGProps } from "react";

interface HudumaHubLogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  showText?: boolean;
}

export function HudumaHubLogo({
  size = 36,
  showText = true,
  ...props
}: HudumaHubLogoProps) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="HudumaHub Logo"
        {...props}
      >
        {/* Shield shape — government trust */}
        <path
          d="M32 4C32 4 8 14 8 28V42C8 50 18 58 32 62C46 58 56 50 56 42V28C56 14 32 4 32 4Z"
          className="fill-primary"
        />
        {/* Inner shield highlight */}
        <path
          d="M32 8C32 8 12 16.5 12 29V41C12 48 20.5 55 32 58.5C43.5 55 52 48 52 41V29C52 16.5 32 8 32 8Z"
          className="fill-primary-foreground"
          opacity="0.15"
        />
        {/* Kenya stripes — horizontal bands */}
        {/* Green stripe (top) */}
        <rect
          x="20"
          y="22"
          width="24"
          height="5"
          rx="1"
          className="fill-primary-foreground"
          opacity="0.9"
        />
        {/* Red stripe (middle) — accent */}
        <rect
          x="20"
          y="30"
          width="24"
          height="5"
          rx="1"
          fill="oklch(0.55 0.22 25)"
          opacity="0.85"
        />
        {/* Dark stripe (bottom) */}
        <rect
          x="20"
          y="38"
          width="24"
          height="5"
          rx="1"
          className="fill-primary-foreground"
          opacity="0.7"
        />
        {/* Central hub circle */}
        <circle cx="32" cy="33" r="6" className="fill-primary-foreground" />
        <circle cx="32" cy="33" r="3.5" className="fill-primary" />
        {/* Connection dots — representing the 'Hub' */}
        <circle
          cx="32"
          cy="48"
          r="2"
          className="fill-primary-foreground"
          opacity="0.8"
        />
        <circle
          cx="24"
          cy="46"
          r="1.5"
          className="fill-primary-foreground"
          opacity="0.6"
        />
        <circle
          cx="40"
          cy="46"
          r="1.5"
          className="fill-primary-foreground"
          opacity="0.6"
        />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-foreground">
            Huduma<span className="text-primary">Hub</span>
          </span>
          <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Service Excellence
          </span>
        </div>
      )}
    </div>
  );
}
