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
import { predefinedTestsApi } from "@/lib/api";

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

  // Fetch locations from the database
  const [locations, setLocations] = useState<{ id: string; city: string }[]>([]);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/user/location?limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.locations) {
          setLocations(data.data.locations);
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
      <div className="flex-1 min-w-[180px]">
        <Select value={locationId || "all"} onValueChange={(value) => onLocationChange(value === "all" ? "" : value ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {locationId ? capitalize(locations.find(l => l.id === locationId)?.city || locationId) : "All Locations"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Filter */}
      <div className="flex-1 min-w-[180px]">
        <Select value={courseId || "all"} onValueChange={(value) => {
          onCourseChange(value === "all" ? "" : value ?? "");
          onSubjectChange("");
        }}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {courseId ? capitalize(courses.find(c => c.id === courseId)?.name || courseId) : "All Courses"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {capitalize(course.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Filter */}
      <div className="flex-1 min-w-[180px]">
        <Select value={subjectId || "all"} onValueChange={(value) => onSubjectChange(value === "all" ? "" : value ?? "")} disabled={!courseId}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {subjectId ? capitalize(subjects.find(s => s.id === subjectId)?.name || subjectId) : !courseId ? "Select course first" : "All Subjects"}
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
      <Select value={topN.toString()} onValueChange={(value) => onTopNChange(parseInt(value ?? "10", 10))}>
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
