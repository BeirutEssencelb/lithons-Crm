interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTitle?: boolean;
  className?: string;
}

const sizes = {
  sm: { img: "h-8 w-auto max-w-[100px]", title: "text-sm", gap: "gap-2" },
  md: { img: "h-10 w-auto max-w-[120px]", title: "text-lg", gap: "gap-3" },
  lg: { img: "h-24 w-auto max-w-[220px]", title: "text-2xl", gap: "gap-4" },
};

export function Logo({
  size = "md",
  showTitle = true,
  className = "",
}: LogoProps) {
  const s = sizes[size];

  if (size === "lg" && showTitle) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="LITHOS CRM"
          className={`${s.img} object-contain`}
        />
        <h1 className={`${s.title} mt-4 font-bold tracking-wide`}>LITHOS CRM</h1>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="LITHOS CRM"
        className={`${s.img} shrink-0 object-contain`}
      />
      {showTitle ? (
        <span className={`${s.title} font-bold tracking-wide`}>LITHOS CRM</span>
      ) : null}
    </div>
  );
}
