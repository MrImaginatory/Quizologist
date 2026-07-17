"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { predefinedTestsApi, CreatePredefinedTestPayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { capitalize } from "@/lib/utils";

const DURATION_OPTIONS = [15, 20, 25, 30, 45, 60];
const DIFFICULTY_OPTIONS = ["beginner", "normal", "mid", "hard", "expert", "mixed"];
const TIMEZONE_OPTIONS = ["UTC", "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Tokyo"];

export default function CreatePredefinedTestPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [questionLimit, setQuestionLimit] = useState(30);
  const [difficulty, setDifficulty] = useState("normal");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [isScheduled, setIsScheduled] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [useFixedQuestions, setUseFixedQuestions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: CreatePredefinedTestPayload = {
        title,
        description: description || undefined,
        duration_minutes: duration,
        question_limit: questionLimit,
        difficulty,
        max_attempts: maxAttempts,
        is_scheduled: isScheduled,
        start_time: isScheduled && startTime ? new Date(startTime).toISOString() : undefined,
        end_time: isScheduled && endTime ? new Date(endTime).toISOString() : undefined,
        timezone,
        use_fixed_questions: useFixedQuestions,
        course_ids: [],
      };

      const response = await predefinedTestsApi.create(payload, token || undefined);
      toast.success("Predefined test created successfully!");
      router.push(`/dashboard/tests/${response.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create test");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Predefined Test</h1>
          <p className="text-muted-foreground">Configure a new test for students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Set the test name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Midterm Exam - Direct Tax Laws"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for the test"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Set duration, questions, and difficulty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes) *</Label>
                <Select value={duration.toString()} onValueChange={(v) => { if (v) setDuration(parseInt(v)); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d.toString()}>{d} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Question Limit *</Label>
                <Input
                  type="number"
                  value={questionLimit}
                  onChange={(e) => setQuestionLimit(parseInt(e.target.value) || 0)}
                  min={1}
                  max={200}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty *</Label>
                <Select value={difficulty} onValueChange={(v) => { if (v) setDifficulty(v); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>{capitalize(d)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Attempts</Label>
                <Input
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduling</CardTitle>
            <CardDescription>Optional: Set a time window for the test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Scheduled Test</Label>
                <p className="text-sm text-muted-foreground">Limit when students can take this test</p>
              </div>
              <Button
                type="button"
                variant={isScheduled ? "default" : "outline"}
                size="sm"
                onClick={() => setIsScheduled(!isScheduled)}
              >
                {isScheduled ? "On" : "Off"}
              </Button>
            </div>
            {isScheduled && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required={isScheduled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required={isScheduled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={(v) => { if (v) setTimezone(v); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question Selection</CardTitle>
            <CardDescription>Choose between fixed or dynamic questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Fixed Questions</Label>
                <p className="text-sm text-muted-foreground">Use the same questions for all students</p>
              </div>
              <Button
                type="button"
                variant={useFixedQuestions ? "default" : "outline"}
                size="sm"
                onClick={() => setUseFixedQuestions(!useFixedQuestions)}
              >
                {useFixedQuestions ? "On" : "Off"}
              </Button>
            </div>
            {useFixedQuestions && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Question selection will be available after creating the test.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !title}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Create Test
          </Button>
        </div>
      </form>
    </div>
  );
}
