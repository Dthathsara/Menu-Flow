import { BlankContentPage } from "./BlankContentPage";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn, getContentAreaClasses, getDetachedFrameClasses, hasPersistentSidebar } from "./managerUtils";
import type { ReportTab } from "./reports/reports.types";
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
  selectedLanguage: LanguageOption;
  languages: LanguageOption[];
  activeDropdown: "language" | "profile" | null;
  navigationOpen: boolean;
  onSelectNav: (key: ManagerNavKey) => void;
  onToggleNavigation: () => void;
  onCloseNavigation: () => void;
  onToggleTheme: () => void;
  onToggleDropdown: (dropdown: "language" | "profile") => void;
  onCloseDropdowns: () => void;
  onSelectLanguage: (language: LanguageOption) => void;
}

export function VerticalShell({
  settings,
  navItems,
  activeItem,
  activeKey,
  initialReportTab,
  selectedLanguage,
  languages,
  activeDropdown,
  navigationOpen,
  onSelectNav,
  onToggleNavigation,
  onCloseNavigation,
  onToggleTheme,
  onToggleDropdown,
  onCloseDropdowns,
  onSelectLanguage,
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
                onSelect={onSelectNav}
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
                />
              </main>
            </div>
          </div>
        </div>

        <Sidebar
          settings={settings}
          activeKey={activeKey}
          navItems={navItems}
          overlay
          open={navigationOpen}
          onSelect={onSelectNav}
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
            onSelect={onSelectNav}
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
            />
          </main>
        </div>
      </div>

      <Sidebar
        settings={settings}
        activeKey={activeKey}
        navItems={navItems}
        overlay
        open={navigationOpen}
        onSelect={onSelectNav}
        onClose={onCloseNavigation}
      />
    </div>
  );
}
