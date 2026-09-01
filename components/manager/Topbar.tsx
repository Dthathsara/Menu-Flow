import { LanguageDropdown } from "./LanguageDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import {
  BellIcon,
  ChevronRightIcon,
  MenuToggleIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "./icons";
import {
  cn,
  getMutedTextClasses,
  getSearchInputClasses,
  getToolbarControlClasses,
  getTopbarToneClasses,
} from "./managerUtils";
import type {
  LanguageOption,
  ManagerNavItem,
  ManagerSettings,
} from "./managerTypes";

interface TopbarProps {
  activeItem: ManagerNavItem;
  settings: ManagerSettings;
  selectedLanguage: LanguageOption;
  languages: LanguageOption[];
  activeDropdown: "language" | "profile" | null;
  menuButtonClassName: string;
  isLocked?: boolean;
  profileDropdown?: React.ReactNode;
  onToggleNavigation: () => void;
  onToggleTheme: () => void;
  onToggleDropdown: (dropdown: "language" | "profile") => void;
  onCloseDropdowns: () => void;
  onSelectLanguage: (language: LanguageOption) => void;
}

export function Topbar({
  activeItem,
  settings,
  selectedLanguage,
  languages,
  activeDropdown,
  menuButtonClassName,
  isLocked = false,
  profileDropdown,
  onToggleNavigation,
  onToggleTheme,
  onToggleDropdown,
  onCloseDropdowns,
  onSelectLanguage,
}: TopbarProps) {
  const topbarClasses = getTopbarToneClasses(settings.topbar, settings.scheme);
  const controlClasses = getToolbarControlClasses(settings.topbar, settings.scheme);
  const searchClasses = getSearchInputClasses(settings.topbar, settings.scheme);
  const mutedTextClasses =
    settings.topbar === "brand" || settings.topbar === "dark"
      ? "text-white/74"
      : getMutedTextClasses(settings.scheme);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 overflow-visible border backdrop-blur-xl",
        topbarClasses,
        settings.layoutMode === "detached"
          ? "rounded-[18px] px-4 py-4 sm:px-5"
          : "px-4 py-4 sm:px-5 lg:px-6",
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleNavigation}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-md border",
              controlClasses,
              menuButtonClassName,
            )}
            aria-label="Toggle navigation"
          >
            <MenuToggleIcon className="size-5" />
          </button>

          <div className="min-w-0 flex-1 lg:flex-none">
            <h1 className="truncate text-lg font-bold sm:text-xl">Welcome!</h1>
            <div className={cn("mt-1 flex items-center gap-2 text-sm", mutedTextClasses)}>
              <span>MenuFlow</span>
              <ChevronRightIcon className="size-3.5" />
              <span className="truncate">{activeItem.pageTitle}</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 flex min-w-0 shrink-0 items-center justify-end gap-2">
          <label
            className={cn(
              "hidden h-11 min-w-0 items-center gap-2 rounded-lg border px-3 md:flex md:w-[180px] lg:w-[240px] xl:w-[320px]",
              searchClasses,
            )}
          >
            <SearchIcon className="size-4" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none placeholder:inherit"
            />
          </label>

          <div className="hidden sm:block">
            <LanguageDropdown
              open={activeDropdown === "language"}
              scheme={settings.scheme}
              selectedLanguage={selectedLanguage}
              languages={languages}
              triggerClassName={controlClasses}
              onToggle={() => onToggleDropdown("language")}
              onClose={onCloseDropdowns}
              onSelect={onSelectLanguage}
            />
          </div>

          <button
            type="button"
            className={cn(
              "relative hidden size-11 items-center justify-center rounded-md border sm:inline-flex",
              controlClasses,
            )}
            aria-label="Notifications"
          >
            <BellIcon className="size-4.5" />
            <span className="absolute right-3 top-3 size-2 rounded-full bg-rose-500" />
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-md border",
              controlClasses,
            )}
            aria-label="Toggle theme"
          >
            {settings.scheme === "dark" ? (
              <SunIcon className="size-4.5" />
            ) : (
              <MoonIcon className="size-4.5" />
            )}
          </button>

          {profileDropdown ?? (
            <ProfileDropdown
              open={activeDropdown === "profile"}
              scheme={settings.scheme}
              triggerClassName={controlClasses}
              isLocked={isLocked}
              onToggle={() => onToggleDropdown("profile")}
              onClose={onCloseDropdowns}
            />
          )}
        </div>
      </div>
    </header>
  );
}
