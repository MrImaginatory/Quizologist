"use client";

import * as React from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  className,
  disabled,
  minDate,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = value ? new Date(value) : undefined;
  const hour = date ? date.getHours().toString().padStart(2, "0") : "00";
  const minute = date ? Math.floor(date.getMinutes() / 5).toString().padStart(2, "0") : "00";

  const today = new Date();
  const effectiveMinDate = minDate || today;

  const isDateDisabled = (dateToCheck: Date) => {
    const minDateStart = startOfDay(effectiveMinDate);
    return isBefore(dateToCheck, minDateStart);
  };

  const isTimeDisabled = (h: number, m: number) => {
    if (!minDate) return false;
    const selectedDate = date || new Date();
    const testDate = new Date(selectedDate);
    testDate.setHours(h, m, 0, 0);
    return isBefore(testDate, effectiveMinDate);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (isDateDisabled(selectedDate)) return;

      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hour), parseInt(minute));

      if (isBefore(newDate, effectiveMinDate)) {
        newDate.setHours(effectiveMinDate.getHours(), effectiveMinDate.getMinutes());
      }

      onChange?.(newDate.toISOString());
    } else {
      onChange?.("");
    }
  };

  const handleTimeChange = (type: "hour" | "minute", val: string) => {
    const newDate = date || new Date();
    if (type === "hour") {
      newDate.setHours(parseInt(val));
    } else {
      newDate.setMinutes(parseInt(val));
    }

    if (isBefore(newDate, effectiveMinDate)) {
      onChange?.("");
    } else {
      onChange?.(newDate.toISOString());
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium whitespace-nowrap shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-full",
          !date && "text-muted-foreground",
          className
        )}
        disabled={disabled}
      >
        <CalendarIcon className="h-4 w-4" />
        {date ? format(date, "dd-MM-yyyy HH:mm") : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={isDateDisabled}
        />
        <div className="border-t p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time:</span>
            <Select value={hour} onValueChange={(v) => { if (v) handleTimeChange("hour", v); }}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">:</span>
            <Select value={minute} onValueChange={(v) => { if (v) handleTimeChange("minute", v); }}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MINUTES.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
