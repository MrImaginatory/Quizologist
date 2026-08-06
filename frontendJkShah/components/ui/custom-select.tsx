"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  id,
  disabled = false,
  required = false,
  className,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      const next = options[(idx + 1) % options.length];
      if (next && !next.disabled) onChange?.(next.value);
    }
    if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      const prev = options[(idx - 1 + options.length) % options.length];
      if (prev && !prev.disabled) onChange?.(prev.value);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        id={selectId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2",
          "rounded-[50rem] border border-input bg-background",
          "px-4 py-2 text-sm",
          "ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-2 ring-primary ring-offset-2",
          !selectedOption && "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Panel */}
      <div
        role="listbox"
        aria-label={label}
        className={cn(
          "absolute z-50 mt-1.5 w-full",
          "rounded-2xl border border-border bg-popover shadow-xl",
          "overflow-hidden",
          "transition-all duration-200 origin-top",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        <ul
          className={cn(
            "max-h-60 overflow-y-auto py-1.5",
            "[&::-webkit-scrollbar]:w-1.5",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-border"
          )}
        >
          {options.length === 0 ? (
            <li className="px-4 py-2 text-sm text-muted-foreground">
              No options available
            </li>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange?.(option.value);
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer select-none items-center justify-between",
                    "px-4 py-2.5 text-sm transition-colors",
                    isSelected
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground font-normal",
                    option.disabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
