import React, { useState, useRef, useEffect, useMemo } from "react";
import styles from "./MultiSelect.module.css";
import { capitalize } from "@/utils/helpers";

interface Option {
  id: string;
  name: string;
  group?: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selectedIds: Set<string>;
  onChange: (selectedIds: Set<string>) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  disabled,
  placeholder = "Select options...",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">("bottom");
  const containerRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!containerRef.current) return;
    
    // Find the nearest scrollable parent
    let scrollParent: HTMLElement | null = containerRef.current.parentElement;
    while (scrollParent && scrollParent !== document.body) {
      const style = window.getComputedStyle(scrollParent);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll') {
        break;
      }
      scrollParent = scrollParent.parentElement;
    }

    const rect = containerRef.current.getBoundingClientRect();
    let spaceBelow = window.innerHeight - rect.bottom;
    let spaceAbove = rect.top;

    if (scrollParent && scrollParent !== document.body) {
      const parentRect = scrollParent.getBoundingClientRect();
      spaceBelow = parentRect.bottom - rect.bottom;
      spaceAbove = rect.top - parentRect.top;
    }

    // If there is less than 220px below and more space above, open upwards
    if (spaceBelow < 220 && spaceAbove > spaceBelow) {
      setDropdownPosition("top");
    } else {
      setDropdownPosition("bottom");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    // Recalculate if window resizes while open
    const handleResize = () => {
      if (isOpen) calculatePosition();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  const toggleOption = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    onChange(newSet);
  };

  const getDisplayText = () => {
    if (selectedIds.size === 0) return placeholder;
    if (selectedIds.size === options.length && options.length > 0) return "All selected";
    if (selectedIds.size <= 2) {
      return options
        .filter((o) => selectedIds.has(o.id))
        .map((o) => capitalize(o.name))
        .join(", ");
    }
    return `${selectedIds.size} selected`;
  };

  const groupedOptions = useMemo(() => {
    const groups: Record<string, Option[]> = {};
    const ungrouped: Option[] = [];

    options.forEach(option => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      } else {
        ungrouped.push(option);
      }
    });

    return { groups, ungrouped };
  }, [options]);

  return (
    <div className={styles.container} ref={containerRef}>
      <label className={styles.label}>{label}</label>
      <div 
        className={`${styles.trigger} ${disabled ? styles.disabled : ""} ${isOpen ? styles.open : ""}`}
        onClick={handleToggle}
      >
        <span className={selectedIds.size === 0 ? styles.placeholder : styles.selectedText}>
          {getDisplayText()}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className={`${styles.dropdown} ${styles[dropdownPosition]}`}>
          {options.length === 0 ? (
            <div className={styles.empty}>No options available</div>
          ) : (
            <>
              <div 
                className={styles.selectAllContainer} 
                onClick={() => {
                  if (selectedIds.size === options.length) {
                    onChange(new Set());
                  } else {
                    onChange(new Set(options.map(o => o.id)));
                  }
                }}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedIds.size === options.length && options.length > 0}
                  readOnly
                />
                <span className={styles.optionText} style={{ fontWeight: 600 }}>Select All</span>
              </div>
              
              {groupedOptions.ungrouped.map((option, index) => (
                <label key={`${option.id}-${index}`} className={styles.option}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedIds.has(option.id)}
                    onChange={() => toggleOption(option.id)}
                  />
                  <span className={styles.optionText}>{capitalize(option.name)}</span>
                </label>
              ))}
              
              {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => {
                const groupIds = groupOptions.map(o => o.id);
                const isGroupAllSelected = groupIds.every(id => selectedIds.has(id));
                const isGroupPartialSelected = !isGroupAllSelected && groupIds.some(id => selectedIds.has(id));

                return (
                  <div key={groupName} className={styles.groupContainer}>
                    <div 
                      className={`${styles.groupHeader} ${styles.groupHeaderInteractive}`}
                      onClick={() => {
                        const newSet = new Set(selectedIds);
                        if (isGroupAllSelected) {
                          groupIds.forEach(id => newSet.delete(id));
                        } else {
                          groupIds.forEach(id => newSet.add(id));
                        }
                        onChange(newSet);
                      }}
                    >
                      <span>{capitalize(groupName)}</span>
                      <input 
                        type="checkbox" 
                        className={styles.checkbox} 
                        style={{ width: '14px', height: '14px', opacity: isGroupPartialSelected ? 0.5 : 1 }}
                        checked={isGroupAllSelected || isGroupPartialSelected}
                        readOnly
                      />
                    </div>
                    {groupOptions.map((option, index) => (
                      <label key={`${option.id}-${index}`} className={`${styles.option} ${styles.groupedOption}`}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={selectedIds.has(option.id)}
                          onChange={() => toggleOption(option.id)}
                        />
                        <span className={styles.optionText}>{capitalize(option.name)}</span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
