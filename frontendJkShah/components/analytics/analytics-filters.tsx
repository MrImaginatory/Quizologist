"use client";

import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DatePicker } from "@/components/ui/date-picker";
import { X } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { useSubjects } from "@/hooks/use-subjects";
import { capitalize } from "@/lib/utils";

interface AnalyticsFiltersProps {
  locationId: string;
  dateFrom: string;
  dateTo: string;
  courseId: string;
  subjectId: string;
  topN: number;
  onLocationChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onTopNChange: (value: number) => void;
  onClear: () => void;
}

// Locations fetched from the database via API
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { locationsApi } from "@/lib/api";

export function AnalyticsFilters({
  locationId,
  dateFrom,
  dateTo,
  courseId,
  subjectId,
  topN,
  onLocationChange,
  onDateFromChange,
  onDateToChange,
  onCourseChange,
  onSubjectChange,
  onTopNChange,
  onClear,
}: AnalyticsFiltersProps) {
  const { token } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses({ limit: 100 });
  const { subjects, isLoading: subjectsLoading } = useSubjects({ limit: 100, courseId: courseId || undefined });

  // Fetch locations from the database using centralized API
  const [locations, setLocations] = useState<{ id: string; city: string; pincode?: string }[]>([]);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await locationsApi.getAll(1, 100, token || undefined);
        if (res.success && res.data?.locations) {
          setLocations(res.data.locations);
        }
      } catch {
        // Use fallback locations
        setLocations([
          { id: "mumbai", city: "Mumbai" },
          { id: "delhi", city: "Delhi" },
          { id: "bangalore", city: "Bangalore" },
        ]);
      }
    };
    fetchLocations();
  }, [token]);

  const hasFilters = locationId || dateFrom || dateTo || courseId || subjectId || topN !== 10;

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Location Filter */}
      <div className="flex-1 min-w-[220px]">
        <SearchableSelect
          value={locationId || "all"}
          onValueChange={(value) => onLocationChange(value === "all" ? "" : value)}
          placeholder="Select Location"
          options={[
            { value: "all", label: "All Locations" },
            ...locations.map(l => ({ value: l.id, label: l.pincode ? `${l.city} - ${l.pincode}` : l.city }))
          ]}
        />
      </div>

      {/* Course Filter */}
      <div className="flex-1 min-w-[220px]">
        <SearchableSelect
          value={courseId || "all"}
          onValueChange={(value) => {
            onCourseChange(value === "all" ? "" : value);
            onSubjectChange("");
          }}
          placeholder="Select Course"
          options={[
            { value: "all", label: "All Courses" },
            ...courses.map(c => ({ value: c.id, label: capitalize(c.name) }))
          ]}
        />
      </div>

      {/* Subject Filter */}
      <div className="flex-1 min-w-[220px]">
        <SearchableSelect
          value={subjectId || "all"}
          onValueChange={(value) => onSubjectChange(value === "all" ? "" : value)}
          disabled={!courseId}
          placeholder="Select Subject"
          options={[
            { value: "all", label: "All Subjects" },
            ...subjects.map(s => ({ value: s.id, label: capitalize(s.name) }))
          ]}
        />
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
      <div className="w-[120px]">
        <CustomSelect
          value={topN.toString()}
          onChange={(value) => onTopNChange(parseInt(value, 10))}
          options={[
            { value: "5", label: "Top 5" },
            { value: "10", label: "Top 10" },
            { value: "20", label: "Top 20" }
          ]}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
