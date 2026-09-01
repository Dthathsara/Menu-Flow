import { BlankContentPage } from "./BlankContentPage";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { ReportTab } from "./reports/reports.types";
import type { RestaurantProfile } from "./settings/settings.types";
import { cn, getContentAreaClasses, getDetachedFrameClasses, hasPersistentSidebar } from "./managerUtils";
import type {
  LanguageOption,
  ManagerNavItem,
  ManagerNavKey,
  ManagerSettings,
} from "./managerTypes";

interface VerticalShellProps {
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
  isLocked?: boolean;
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

export function VerticalShell({
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
  isLocked = false,
  onSelectNav,
  onSelectReportTab,
  onToggleNavigation,
  onCloseNavigation,
  onToggleTheme,
  onToggleDropdown,
  onCloseDropdowns,
  onSelectLanguage,
  onUpdateRestaurantProfile,
}: VerticalShellProps) {
  const persistentSidebar = hasPersistentSidebar(settings.sidebarSize);
  const menuButtonClassName = persistentSidebar ? "lg:hidden" : "inline-flex";

  if (settings.layoutMode === "detached") {
    return (
      <div className="min-h-screen p-4 sm:p-5">
        <div
          className={cn(
            "min-h-[calc(100vh-2rem)] rounded-[20px] border p-3 sm:p-4",
            getDetachedFrameClasses(settings.scheme),
          )}
        >
          <div className="flex min-h-[calc(100vh-3.5rem)] gap-4">
            {persistentSidebar ? (
              <Sidebar
                settings={settings}
                activeKey={activeKey}
                navItems={navItems}
                reportTab={reportTab}
                restaurantProfile={restaurantProfile}
                isLocked={isLocked}
                onSelect={onSelectNav}
                onSelectReportTab={onSelectReportTab}
              />
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-visible">
              <Topbar
                activeItem={activeItem}
                settings={settings}
                selectedLanguage={selectedLanguage}
                languages={languages}
                activeDropdown={activeDropdown}
                menuButtonClassName={menuButtonClassName}
                isLocked={isLocked}
                onToggleNavigation={onToggleNavigation}
                onToggleTheme={onToggleTheme}
                onToggleDropdown={onToggleDropdown}
                onCloseDropdowns={onCloseDropdowns}
                onSelectLanguage={onSelectLanguage}
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
            </div>
          </div>
        </div>

        <Sidebar
          settings={settings}
          activeKey={activeKey}
          navItems={navItems}
          reportTab={reportTab}
          restaurantProfile={restaurantProfile}
          overlay
          open={navigationOpen}
          isLocked={isLocked}
          onSelect={onSelectNav}
          onSelectReportTab={onSelectReportTab}
          onClose={onCloseNavigation}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        {persistentSidebar ? (
          <Sidebar
            settings={settings}
            activeKey={activeKey}
            navItems={navItems}
            reportTab={reportTab}
            restaurantProfile={restaurantProfile}
            isLocked={isLocked}
            onSelect={onSelectNav}
            onSelectReportTab={onSelectReportTab}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col overflow-visible">
          <Topbar
            activeItem={activeItem}
            settings={settings}
            selectedLanguage={selectedLanguage}
            languages={languages}
            activeDropdown={activeDropdown}
            menuButtonClassName={menuButtonClassName}
            isLocked={isLocked}
            onToggleNavigation={onToggleNavigation}
            onToggleTheme={onToggleTheme}
            onToggleDropdown={onToggleDropdown}
            onCloseDropdowns={onCloseDropdowns}
            onSelectLanguage={onSelectLanguage}
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
        </div>
      </div>

      <Sidebar
        settings={settings}
        activeKey={activeKey}
        navItems={navItems}
        reportTab={reportTab}
        restaurantProfile={restaurantProfile}
        overlay
        open={navigationOpen}
        isLocked={isLocked}
        onSelect={onSelectNav}
        onSelectReportTab={onSelectReportTab}
        onClose={onCloseNavigation}
      />
    </div>
  );
}

