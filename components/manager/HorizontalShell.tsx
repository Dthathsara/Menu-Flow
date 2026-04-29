import { BlankContentPage } from "./BlankContentPage";
import { HorizontalNav } from "./HorizontalNav";
import { Topbar } from "./Topbar";
import type { ReportTab } from "./reports/reports.types";
import type { RestaurantProfile } from "./settings/settings.types";
import {
  cn,
  getContentAreaClasses,
  getDetachedFrameClasses,
} from "./managerUtils";
import type {
  LanguageOption,
  ManagerNavItem,
  ManagerNavKey,
  ManagerSettings,
} from "./managerTypes";

interface HorizontalShellProps {
  settings: ManagerSettings;
  navItems: ManagerNavItem[];
  activeItem: ManagerNavItem;
  activeKey: ManagerNavKey;
  initialReportTab: ReportTab;
  reportTab: ReportTab;
  restaurantProfile: RestaurantProfile;
  selectedLanguage: LanguageOption;
  languages: LanguageOption[];
  activeDropdown: "language" | "profile" | null;
  navigationOpen: boolean;
  onSelectNav: (key: ManagerNavKey) => void;
  onSelectReportTab: (tab: ReportTab) => void;
  onToggleNavigation: () => void;
  onCloseNavigation: () => void;
  onToggleTheme: () => void;
  onToggleDropdown: (dropdown: "language" | "profile") => void;
  onCloseDropdowns: () => void;
  onSelectLanguage: (language: LanguageOption) => void;
  onUpdateRestaurantProfile: (profile: RestaurantProfile) => void;
}

export function HorizontalShell({
  settings,
  navItems,
  activeItem,
  activeKey,
  initialReportTab,
  reportTab,
  restaurantProfile,
  selectedLanguage,
  languages,
  activeDropdown,
  navigationOpen,
  onSelectNav,
  onSelectReportTab,
  onToggleNavigation,
  onCloseNavigation,
  onToggleTheme,
  onToggleDropdown,
  onCloseDropdowns,
  onSelectLanguage,
  onUpdateRestaurantProfile,
}: HorizontalShellProps) {
  const frameClasses = getDetachedFrameClasses(settings.scheme);
  void navigationOpen;
  void onCloseNavigation;
  void onSelectReportTab;

  const content = (
    <>
      <Topbar
        activeItem={activeItem}
        settings={settings}
        selectedLanguage={selectedLanguage}
        languages={languages}
        activeDropdown={activeDropdown}
        menuButtonClassName="hidden"
        onToggleNavigation={onToggleNavigation}
        onToggleTheme={onToggleTheme}
        onToggleDropdown={onToggleDropdown}
        onCloseDropdowns={onCloseDropdowns}
        onSelectLanguage={onSelectLanguage}
      />

      <HorizontalNav
        settings={settings}
        navItems={navItems}
        activeKey={activeKey}
        reportTab={reportTab}
        onSelect={onSelectNav}
      />

      <main
        className={cn(
          "relative z-0 min-w-0 flex-1",
          getContentAreaClasses(settings.layoutMode, settings.sidebarSize),
        )}
      >
        <BlankContentPage
          activeItem={activeItem}
          settings={settings}
          initialReportTab={initialReportTab}
          restaurantProfile={restaurantProfile}
          onUpdateRestaurantProfile={onUpdateRestaurantProfile}
        />
      </main>
    </>
  );

  return (
    <div className="min-h-screen">
      {settings.layoutMode === "detached" ? (
        <div className="p-4 sm:p-5">
          <div
            className={cn(
              "min-h-[calc(100vh-2rem)] rounded-[20px] border p-3 sm:p-4",
              frameClasses,
            )}
          >
            <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-4 overflow-visible">
              {content}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col overflow-visible">{content}</div>
      )}
    </div>
  );
}
