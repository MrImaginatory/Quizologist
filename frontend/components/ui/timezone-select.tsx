"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";

interface TimezoneData {
  "Country Code": string;
  "Country Name": string;
  "Time Zone": string;
  "GMT Offset": string;
}

interface TimezoneSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimezoneSelect({
  value,
  onChange,
  placeholder = "Select timezone",
  className,
}: TimezoneSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [timezones, setTimezones] = React.useState<TimezoneData[]>([]);
  const [userTimezone, setUserTimezone] = React.useState("");

  React.useEffect(() => {
    fetch("/TimeZones.json")
      .then((res) => res.json())
      .then((data: TimezoneData[]) => {
        const unique = deduplicateTimezones(data);
        setTimezones(unique);

        try {
          const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setUserTimezone(userTz);
          if (!value && userTz) {
            onChange?.(userTz);
          }
        } catch {}
      })
      .catch(() => {});
  }, []);

  const deduplicateTimezones = (data: TimezoneData[]): TimezoneData[] => {
    const seen = new Set<string>();
    return data.filter((tz) => {
      if (seen.has(tz["Time Zone"])) return false;
      seen.add(tz["Time Zone"]);
      return true;
    });
  };

  const filteredTimezones = React.useMemo(() => {
    const sorted = [...timezones].sort((a, b) => {
      if (a["Time Zone"] === userTimezone) return -1;
      if (b["Time Zone"] === userTimezone) return 1;
      return a["Country Name"].localeCompare(b["Country Name"]);
    });

    if (!search) return sorted;

    const query = search.toLowerCase();
    const isNumeric = /^\d/.test(search);

    if (isNumeric) {
      return sorted.filter((tz) =>
        tz["GMT Offset"].toLowerCase().includes(query)
      );
    }

    return sorted.filter(
      (tz) =>
        tz["Country Name"].toLowerCase().includes(query) ||
        tz["Time Zone"].toLowerCase().includes(query)
    );
  }, [timezones, search, userTimezone]);

  const selectedTimezone = timezones.find((tz) => tz["Time Zone"] === value);

  const formatDisplay = (tz: TimezoneData) => {
    return `${tz["Country Name"]}  ${tz["Time Zone"]}  ${tz["GMT Offset"]}`;
  };

  const displayValue = selectedTimezone
    ? formatDisplay(selectedTimezone)
    : value || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center justify-between w-full h-9 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          !value && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate text-left font-normal">
          {displayValue}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            placeholder="Search timezone..."
            className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredTimezones.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No timezone found.
            </div>
          ) : (
            filteredTimezones.map((tz) => (
              <div
                key={tz["Time Zone"]}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                  value === tz["Time Zone"] && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  onChange?.(tz["Time Zone"]);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === tz["Time Zone"] ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex-1 flex items-center justify-between gap-2">
                  <span className="font-medium">{tz["Country Name"]}</span>
                  <span className="text-muted-foreground">{tz["Time Zone"]}</span>
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {tz["GMT Offset"]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
