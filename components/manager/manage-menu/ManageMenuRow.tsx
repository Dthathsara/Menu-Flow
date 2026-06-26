import Image from "next/image";
import { PencilIcon, TrashIcon } from "../icons";
import {
  cn,
  getFocusRingClasses,
  getManagerBodyTextClasses,
  getManagerTableActionButtonClasses,
  getManagerTableCellPaddingClasses,
  getManagerTableRowTextClasses,
} from "../managerUtils";
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
        getManagerTableRowTextClasses(),
        settings.scheme === "dark"
          ? "hover:bg-white/5"
          : "hover:bg-slate-50/90",
      )}
    >
      <td className={getManagerTableCellPaddingClasses()}>
        <div className="relative size-14 overflow-hidden rounded-lg border border-white/10 bg-slate-200/40 shadow-[0_10px_22px_rgba(15,23,42,0.08)]">
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
      <td className={cn("min-w-[220px]", getManagerTableCellPaddingClasses())}>
        <div className="font-semibold">{item.name}</div>
      </td>
      <td className={getManagerTableCellPaddingClasses()}>
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold",
            settings.scheme === "dark"
              ? "bg-white/8 text-slate-200"
              : "bg-slate-100 text-slate-600",
          )}
        >
          {item.category}
        </span>
      </td>
      <td className={cn("min-w-[280px] max-w-[320px]", getManagerTableCellPaddingClasses())}>
        <p
          className={getManagerBodyTextClasses(settings.scheme)}
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
      <td className={cn(getManagerTableCellPaddingClasses(), "font-semibold")}>
        Rs. {item.prices.small.toLocaleString()}
      </td>
      <td className={cn(getManagerTableCellPaddingClasses(), "font-semibold")}>
        Rs. {item.prices.medium.toLocaleString()}
      </td>
      <td className={cn(getManagerTableCellPaddingClasses(), "font-semibold")}>
        Rs. {item.prices.large.toLocaleString()}
      </td>
      <td className={cn("min-w-[190px]", getManagerTableCellPaddingClasses())}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className={cn(
              getManagerTableActionButtonClasses(settings.scheme),
              "gap-2 px-3.5",
            )}
          >
            <PencilIcon className="size-4" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onRemove(item)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-[14px] font-semibold text-rose-500 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
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
