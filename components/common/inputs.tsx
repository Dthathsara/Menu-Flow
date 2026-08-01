import type { HTMLAttributes, HTMLInputTypeAttribute } from "react";

import {
  cn,
  getAuthInputClasses,
  getAuthLabelClasses,
  type AuthTheme,
} from "@/components/common/theme";

export function AuthInputField({
  theme,
  id,
  label,
  type = "text",
  value,
  placeholder,
  autoComplete,
  inputMode,
  readOnly,
  error,
  onChange,
}: {
  theme: AuthTheme;
  id: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  readOnly?: boolean;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={getAuthLabelClasses(theme)}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className={getAuthInputClasses(theme, Boolean(error))}
        required
      />
      {error ? (
        <p className={cn("text-xs", theme === "dark" ? "text-rose-300" : "text-rose-500")}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
