import type { HTMLAttributes, ReactNode } from "react";

type Stat = { num: string; label: string };

type LayoutCardProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description: string;
  highlight?: string;
  eyebrow?: string;
  stats?: Stat[];
  logo?: ReactNode;
};

const DEFAULT_STATS: Stat[] = [
  { num: "+5.000", label: "Títulos" },
  { num: "+800", label: "Autores" },
  { num: "24h", label: "Reservas" },
];

export default function BannerCard({
  title,
  description,
  highlight,
  eyebrow = "Tu librería en línea",
  stats = DEFAULT_STATS,
  logo = null,
  className,
  ...other
}: LayoutCardProps) {
  const baseClass =
    "relative hidden md:flex md:w-[45%] flex-col justify-between bg-slate-700 p-12 overflow-hidden";
  const classes = className ? `${baseClass} ${className}` : baseClass;
  const BookIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  return (
    <div className={classes} {...other}>
      <div className="absolute -top-20 -right-20 h-[320px] w-[320px] rounded-full bg-blue-600/10" />
      <div className="absolute bottom-20 -left-16 h-[240px] w-[240px] rounded-full bg-blue-600/10" />
      <div className="absolute -bottom-10 right-[20%] h-[160px] w-[160px] rounded-full bg-blue-100/10" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-blue-600">
          {logo || <BookIcon />}
        </div>
        <span className="text-[22px] font-bold text-white tracking-[-0.3px]">NovaLibros</span>
      </div>

      <div className="relative z-10">
        <p className="mb-4 text-[13px] font-medium tracking-[2px] uppercase text-slate-400">
          {eyebrow}
        </p>
        <h2 className="mb-5 text-[36px] font-bold leading-[1.2] tracking-[-0.5px] text-white">
          {title}
          {highlight && (
            <>
              <br />
              <span className="text-blue-100">{highlight}</span>
            </>
          )}
        </h2>
        <p className="max-w-[340px] text-[15px] leading-[1.7] text-slate-400">{description}</p>
      </div>

      <div className="relative z-10 flex gap-8">
        {stats.map(stat => (
          <div key={stat.label}>
            <div className="text-[22px] font-bold text-white">{stat.num}</div>
            <div className="mt-0.5 text-[13px] text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
