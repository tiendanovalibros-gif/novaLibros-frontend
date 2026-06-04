type FolioAvatarSize = "sm" | "md" | "lg";

const sizeMap: Record<FolioAvatarSize, { box: string; icon: number }> = {
  sm: { box: "w-7 h-7", icon: 18 },
  md: { box: "w-9 h-9", icon: 22 },
  lg: { box: "w-11 h-11", icon: 28 },
};

interface FolioAvatarProps {
  size?: FolioAvatarSize;
  bare?: boolean;
  className?: string;
}

/** Robot asistente — estilo mecánico amigable */
function FolioRobotIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-sm"
      aria-hidden
    >
      {/* Antena */}
      <path
        d="M16 4v4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="16"
        cy="3"
        r="1.5"
        fill="#38bdf8"
        stroke="currentColor"
        strokeWidth="0.6"
      />

      {/* Cabeza */}
      <rect
        x="7.5"
        y="8"
        width="17"
        height="12.5"
        rx="3"
        fill="currentColor"
      />
      <rect
        x="8.5"
        y="9"
        width="15"
        height="10.5"
        rx="2"
        fill="#94a3b8"
        fillOpacity="0.35"
      />

      {/* Visor / panel frontal */}
      <rect
        x="9.5"
        y="10.5"
        width="13"
        height="7"
        rx="1.5"
        fill="#0f172a"
        fillOpacity="0.85"
      />

      {/* Ojos LED */}
      <rect x="11.5" y="12.5" width="3.5" height="3" rx="0.8" fill="#38bdf8" />
      <rect x="17" y="12.5" width="3.5" height="3" rx="0.8" fill="#38bdf8" />
      <rect x="12.2" y="13.1" width="1.2" height="1.2" rx="0.3" fill="#e0f2fe" opacity="0.9" />
      <rect x="17.7" y="13.1" width="1.2" height="1.2" rx="0.3" fill="#e0f2fe" opacity="0.9" />

      {/* Indicador sonrisa digital */}
      <path
        d="M12.5 17h7"
        stroke="#38bdf8"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Cuello */}
      <rect x="13.5" y="20.5" width="5" height="1.5" rx="0.5" fill="currentColor" />

      {/* Torso */}
      <rect x="10" y="22" width="12" height="7" rx="2" fill="currentColor" />
      <rect
        x="11.5"
        y="23.5"
        width="9"
        height="4"
        rx="1"
        fill="#38bdf8"
        fillOpacity="0.35"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.5"
      />

      {/* Brazos */}
      <rect x="5" y="22.5" width="3.5" height="5" rx="1.2" fill="currentColor" />
      <rect x="23.5" y="22.5" width="3.5" height="5" rx="1.2" fill="currentColor" />

      {/* Libro en mano */}
      <rect
        x="24"
        y="21"
        width="3"
        height="4.5"
        rx="0.5"
        fill="#e2e8f0"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      <path
        d="M24.5 22.5h2M24.5 23.8h2"
        stroke="#38bdf8"
        strokeWidth="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FolioAvatar({
  size = "md",
  bare = false,
  className = "",
}: FolioAvatarProps) {
  const { box, icon } = sizeMap[size];

  if (bare) {
    return (
      <span className={`inline-flex shrink-0 text-white ${className}`} aria-hidden>
        <FolioRobotIcon size={icon + 8} />
      </span>
    );
  }

  return (
    <span
      className={`${box} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white/30 ${className}`}
      aria-hidden
    >
      <FolioRobotIcon size={icon} />
    </span>
  );
}
