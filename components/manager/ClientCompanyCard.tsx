import Image from "next/image";
import { cn } from "./managerUtils";

interface ClientCompanyCardProps {
  inverted?: boolean;
}

export function ClientCompanyCard({
  inverted = false,
}: ClientCompanyCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border px-3 py-2.5 transition-all duration-200 ease-out hover:-translate-y-0.5",
        inverted
          ? "border-white/10 bg-white/6 hover:bg-white/10 hover:shadow-[0_18px_34px_rgba(2,6,23,0.2)]"
          : "border-slate-200/80 bg-slate-50/85 hover:bg-white hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)]",
      )}
    >
      <div
        className={cn(
          "relative h-[195px] w-full max-w-[200px] shrink-0 overflow-hidden rounded-md border shadow-[0_10px_24px_rgba(15,23,42,0.12)]",
          inverted ? "border-white/12 bg-white/8" : "border-white bg-white",
        )}
      >
        <div className="relative h-full w-full">
          <Image
            src="/manager/test icon 1.jpg"
            alt="Chinese Dragon Cafe"
            width={234}
            height={185}
            quality={100}
            sizes="(max-width: 1024px) 196px, 210px"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/20 to-transparent px-3 py-2">
            <div className="text-white leading-tight">
              <p className="truncate text-sm font-semibold">Chinese Dragon Cafe</p>
              <p className="text-xs opacity-80">Bambalapitiya</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
