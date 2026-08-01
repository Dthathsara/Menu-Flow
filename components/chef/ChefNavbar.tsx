"use client";

import { Topbar } from "@/components/manager/Topbar";
import type { LanguageOption, ManagerNavItem, ManagerSettings } from "@/components/manager/managerTypes";
import { ChefProfileDropdown } from "./ChefProfileDropdown";

export function ChefNavbar(props: {
  activeItem: ManagerNavItem;
  settings: ManagerSettings;
  selectedLanguage: LanguageOption;
  languages: LanguageOption[];
  activeDropdown: "language" | "profile" | null;
  menuButtonClassName: string;
  onToggleNavigation: () => void;
  onToggleTheme: () => void;
  onToggleDropdown: (dropdown: "language" | "profile") => void;
  onCloseDropdowns: () => void;
  onSelectLanguage: (language: LanguageOption) => void;
}) {
  return (
    <Topbar
      {...props}
      profileDropdown={
        <ChefProfileDropdown
          open={props.activeDropdown === "profile"}
          scheme={props.settings.scheme}
          triggerClassName=""
          onToggle={() => props.onToggleDropdown("profile")}
          onClose={props.onCloseDropdowns}
        />
      }
    />
  );
}
