"use client";

import { useState, useRef, useEffect, useId, useCallback } from "react";
import { createPortal } from "react-dom";
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

interface DropdownRect {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
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
  const [rect, setRect] = useState<DropdownRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const selectedOption = options.find((opt) => opt.value === value);

  // Only render portal after mount (SSR safety)
  useEffect(() => setMounted(true), []);

  // Measure trigger to position the portal dropdown
  const measureAndOpen = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const dropdownHeight = Math.min(options.length * 44 + 12, 252);
    const openUpward = spaceBelow < dropdownHeight && r.top > dropdownHeight;
    setRect({
      top: openUpward ? r.top + window.scrollY - dropdownHeight - 6 : r.bottom + window.scrollY + 6,
      left: r.left + window.scrollX,
      width: r.width,
      openUpward,
    });
    setOpen(true);
  }, [options.length]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll/resize so it doesn't drift — but ignore scrolls inside the dropdown
  useEffect(() => {
    if (!open) return;
    const handleScroll = (e: Event) => {
      // Don't close if the scroll happened inside the dropdown panel itself
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const handleResize = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open ? setOpen(false) : measureAndOpen();
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

  const dropdownPanel = mounted && rect && createPortal(
    <div
      ref={dropdownRef}
      role="listbox"
      aria-label={label}
      style={{
        position: "absolute",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      }}
      className={cn(
        "rounded-2xl border border-border bg-popover shadow-xl overflow-hidden",
        "transition-all duration-200 origin-top",
        open
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
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
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (!option.disabled) {
                    onChange?.(option.value);
                    setOpen(false);
                  }
                }}
                className={cn(
                  "group flex cursor-pointer select-none items-center justify-between",
                  "px-4 py-2.5 text-sm transition-colors",
                  isSelected
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground font-normal",
                  option.disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-primary hover:text-primary-foreground"
                )}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 ml-2 text-primary",
                      "group-hover:text-primary-foreground"
                    )}
                  />
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>,
    document.body
  );

  return (
    <div className={cn("relative w-full", className)}>
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
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (disabled) return;
          open ? setOpen(false) : measureAndOpen();
        }}
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

      {/* Dropdown renders into document.body via portal */}
      {dropdownPanel}
    </div>
  );
}
