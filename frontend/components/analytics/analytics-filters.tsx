"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { X } from "lucide-react";
import { useTeachingCoursesAndSubjects } from "@/hooks/use-teaching-courses-and-subjects";
import { capitalize } from "@/lib/utils";

interface AnalyticsFiltersProps {
  locationId: string;
  dateFrom: string;
  dateTo: string;
  subjectId: string;
  topN: number;
  onLocationChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onTopNChange: (value: number) => void;
  onClear: () => void;
}

// Sample locations for filter (in production, fetch from API)
const LOCATIONS = [
  { id: "mumbai", name: "Mumbai" },
  { id: "delhi", name: "Delhi" },
  { id: "bangalore", name: "Bangalore" },
  { id: "chennai", name: "Chennai" },
  { id: "kolkata", name: "Kolkata" },
];

export function AnalyticsFilters({
  locationId,
  dateFrom,
  dateTo,
  subjectId,
  topN,
  onLocationChange,
  onDateFromChange,
  onDateToChange,
  onSubjectChange,
  onTopNChange,
  onClear,
}: AnalyticsFiltersProps) {
  const { subjects, isLoading: subjectsLoading } = useTeachingCoursesAndSubjects();

  const hasFilters = locationId || dateFrom || dateTo || subjectId || topN !== 10;

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Location Filter */}
      <div className="flex-1 min-w-[180px]">
        <Select value={locationId || "all"} onValueChange={(value) => onLocationChange(value === "all" ? "" : value)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {locationId ? LOCATIONS.find(l => l.id === locationId)?.name || locationId : "All Locations"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {LOCATIONS.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Filter */}
      <div className="flex-1 min-w-[180px]">
        <Select value={subjectId || "all"} onValueChange={(value) => onSubjectChange(value === "all" ? "" : value)}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {subjectId ? subjects.find(s => s.id === subjectId)?.name || subjectId : "All Subjects"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {capitalize(subject.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2">
        <DatePicker
          value={dateFrom}
          onChange={onDateFromChange}
          placeholder="From date"
        />
        <span className="text-muted-foreground">to</span>
        <DatePicker
          value={dateTo}
          onChange={onDateToChange}
          placeholder="To date"
        />
      </div>

      {/* Top N Selector */}
      <Select value={topN.toString()} onValueChange={(value) => onTopNChange(parseInt(value, 10))}>
        <SelectTrigger className="w-[120px]">
          <SelectValue>Top {topN}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">Top 5</SelectItem>
          <SelectItem value="10">Top 10</SelectItem>
          <SelectItem value="20">Top 20</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
