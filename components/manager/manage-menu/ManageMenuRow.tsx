import Image from "next/image";
import { PencilIcon, TrashIcon } from "../icons";
import { cn, getFocusRingClasses, getMutedTextClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { MenuItemRecord } from "./types";

interface ManageMenuRowProps {
  item: MenuItemRecord;
  settings: ManagerSettings;
  onEdit: (item: MenuItemRecord) => void;
  onRemove: (item: MenuItemRecord) => void;
}

export function ManageMenuRow({
  item,
  settings,
  onEdit,
  onRemove,
}: ManageMenuRowProps) {
  return (
    <tr
      className={cn(
        "group/menu-row align-top transition-all duration-200 ease-out",
        settings.scheme === "dark"
          ? "hover:bg-white/5"
          : "hover:bg-slate-50/90",
      )}
    >
      <td className="px-4 py-4 sm:px-5">
        <div className="relative size-14 overflow-hidden rounded-md border border-white/10 bg-slate-200/40 shadow-[0_10px_22px_rgba(15,23,42,0.08)]">
          <Image
            src={item.image}
            alt={item.name}
            fill
            unoptimized
            sizes="56px"
            className="h-full w-full object-cover"
          />
        </div>
      </td>
      <td className="min-w-[220px] px-4 py-4 sm:px-5">
        <div className="font-semibold">{item.name}</div>
      </td>
      <td className="px-4 py-4 sm:px-5">
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
            settings.scheme === "dark"
              ? "bg-white/8 text-slate-200"
              : "bg-slate-100 text-slate-600",
          )}
        >
          {item.category}
        </span>
      </td>
      <td className="min-w-[280px] max-w-[320px] px-4 py-4 sm:px-5">
        <p
          className={cn("text-sm leading-6", getMutedTextClasses(settings.scheme))}
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          {item.description}
        </p>
      </td>
      <td className="px-4 py-4 text-sm font-semibold sm:px-5">
        Rs. {item.prices.small.toLocaleString()}
      </td>
      <td className="px-4 py-4 text-sm font-semibold sm:px-5">
        Rs. {item.prices.medium.toLocaleString()}
      </td>
      <td className="px-4 py-4 text-sm font-semibold sm:px-5">
        Rs. {item.prices.large.toLocaleString()}
      </td>
      <td className="min-w-[190px] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
              settings.scheme === "dark"
                ? "border-white/10 bg-white/6 text-slate-100 hover:border-white/16 hover:bg-white/10 hover:shadow-[0_16px_30px_rgba(2,6,23,0.2)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]",
              getFocusRingClasses(settings.scheme),
            )}
          >
            <PencilIcon className="size-4" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onRemove(item)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold text-rose-500 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
              settings.scheme === "dark"
                ? "border-rose-500/20 bg-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/14"
                : "border-rose-200 bg-rose-50 hover:border-rose-300 hover:bg-rose-100",
              getFocusRingClasses(settings.scheme),
            )}
          >
            <TrashIcon className="size-4" />
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}
