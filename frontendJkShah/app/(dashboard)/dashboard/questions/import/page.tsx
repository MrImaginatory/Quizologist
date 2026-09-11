"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Upload,
  Loader2,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  XCircle,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useCourses } from "@/hooks/use-courses";
import { useSubjects } from "@/hooks/use-subjects";
import { useTopics } from "@/hooks/use-topics";
import { questionsApi, coursesApi, Course, Subject, Topic } from "@/lib/api";
import { capitalize } from "@/lib/utils";

interface ParsedQuestion {
  courseName: string;
  subjectName: string;
  topicName: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  correctAnswer: string;
  difficulty: string;
  explanation: string;
  videoUrl: string;
  questionAddedBy: string;
}

interface ResolvedQuestion {
  type: "mcq";
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation?: string;
  videoUrl?: string;
  difficulty: string;
  topic_id: string;
  subject_id: string;
  course_id: string;
  courseName: string;
  subjectName: string;
  topicName: string;
  status: "ready" | "error";
  error?: string;
}

type ImportStep = "upload" | "confirm_missing" | "preview" | "result";

interface ImportResult {
  totalRows: number;
  imported: number;
  failed: number;
  errors: { row: number; reason: string }[];
}

export default function ImportQuestionsPage() {
  const { token, user } = useAuth();
  const { courses, refetch: refetchCourses } = useCourses({ limit: 10000 });
  const { subjects, refetch: refetchSubjects } = useSubjects({ limit: 10000 });
  const { topics, refetch: refetchTopics } = useTopics({ limit: 10000 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ResolvedQuestion[]>([]);
  const [rawParsedQuestions, setRawParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [missingHierarchy, setMissingHierarchy] = useState<{ name: string; description?: string; subjects: { name: string; description?: string; topics: { name: string; description?: string }[] }[] }[]>([]);
  const [isResolvingMissing, setIsResolvingMissing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [showErrors, setShowErrors] = useState(false);
  const [imageErrorRowIndices, setImageErrorRowIndices] = useState<Set<number>>(new Set());

  const handleDownloadTemplate = async () => {
    try {
      const blob = await questionsApi.getTemplate(token || undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "question_import_template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Failed to download template:", error);
      toast.error(error.message || "Failed to download template");
    }
  };

  // Helper to normalize names for matching (lowercase, trim, collapse spaces)
  const normalizeName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ") // collapse multiple spaces
      .replace(/\u00A0/g, " "); // replace non-breaking spaces
  };

  // Pre-compute lookup maps (rebuilt when data changes)
  const courseMap = useMemo(
    () => new Map(courses.map((c: Course) => [normalizeName(c.name), c])),
    [courses]
  );
  const subjectMap = useMemo(
    () => new Map(subjects.map((s: Subject) => [`${normalizeName(s.name)}|${s.course_id}`, s])),
    [subjects]
  );
  // Build per-subject topic maps to avoid topic name collisions across courses
  const topicsBySubject = useMemo(() => {
    const map = new Map<string, Map<string, Topic>>();
    for (const t of topics) {
      if (!map.has(t.subject_id)) {
        map.set(t.subject_id, new Map());
      }
      map.get(t.subject_id)!.set(normalizeName(t.name), t);
    }
    return map;
  }, [topics]);

  const resolveRow = useCallback(
    (row: ParsedQuestion): ResolvedQuestion => {
      // Validate difficulty value
      const validDifficulties = ["beginner", "normal", "mid", "hard", "expert"];
      const rawDifficulty = row.difficulty.toLowerCase().trim();
      const difficulty = validDifficulties.includes(rawDifficulty) ? rawDifficulty : "normal";
      const difficultyChanged = row.difficulty && rawDifficulty !== "" && !validDifficulties.includes(rawDifficulty);

      const course = courseMap.get(normalizeName(row.courseName));
      if (!course) {
        return {
          type: "mcq",
          question: row.question,
          choices: [],
          correctAnswer: row.correctAnswer,
          difficulty,
          topic_id: "",
          subject_id: "",
          course_id: "",
          courseName: row.courseName,
          subjectName: row.subjectName,
          topicName: row.topicName,
          status: "error",
          error: `Course '${row.courseName}' not found`,
        };
      }

      const subjectKey = `${normalizeName(row.subjectName)}|${course.id}`;
      const subject = subjectMap.get(subjectKey);
      if (!subject) {
        return {
          type: "mcq",
          question: row.question,
          choices: [],
          correctAnswer: row.correctAnswer,
          difficulty,
          topic_id: "",
          subject_id: "",
          course_id: course.id,
          courseName: row.courseName,
          subjectName: row.subjectName,
          topicName: row.topicName,
          status: "error",
          error: `Subject '${row.subjectName}' not found in course '${row.courseName}'`,
        };
      }

      // Look up topic within the resolved subject only (prevents cross-course collisions)
      const subjectTopics = topicsBySubject.get(subject.id);
      const topic = subjectTopics?.get(normalizeName(row.topicName));
      if (!topic) {
        return {
          type: "mcq",
          question: row.question,
          choices: [],
          correctAnswer: row.correctAnswer,
          difficulty,
          topic_id: "",
          subject_id: subject.id,
          course_id: course.id,
          courseName: row.courseName,
          subjectName: row.subjectName,
          topicName: row.topicName,
          status: "error",
          error: `Topic '${row.topicName}' not found in subject '${row.subjectName}'`,
        };
      }

      const choices = [row.option1, row.option2, row.option3, row.option4, row.option5]
        .filter((opt) => opt && opt.trim() !== "");

      if (choices.length < 2) {
        return {
          type: "mcq",
          question: row.question,
          choices,
          correctAnswer: row.correctAnswer,
          difficulty,
          topic_id: topic.id,
          subject_id: subject.id,
          course_id: course.id,
          courseName: row.courseName,
          subjectName: row.subjectName,
          topicName: row.topicName,
          status: "error",
          error: "At least 2 options required",
        };
      }

      if (!choices.includes(row.correctAnswer.trim())) {
        return {
          type: "mcq",
          question: row.question,
          choices,
          correctAnswer: row.correctAnswer,
          difficulty,
          topic_id: topic.id,
          subject_id: subject.id,
          course_id: course.id,
          courseName: row.courseName,
          subjectName: row.subjectName,
          topicName: row.topicName,
          status: "error",
          error: "Correct answer doesn't match any option",
        };
      }

      return {
        type: "mcq",
        question: row.question.trim(),
        choices,
        correctAnswer: row.correctAnswer.trim(),
        explanation: row.explanation || undefined,
        videoUrl: row.videoUrl || undefined,
        difficulty,
        topic_id: topic.id,
        subject_id: subject.id,
        course_id: course.id,
        courseName: row.courseName,
        subjectName: row.subjectName,
        topicName: row.topicName,
        status: "ready",
      };
    },
    [courseMap, subjectMap, topicsBySubject]
  );


  useEffect(() => {
    if (isResolvingMissing) {
      // Check if missing items are now in maps
      const allCoursesPresent = missingHierarchy.every((mc) => courseMap.has(normalizeName(mc.name)));
      if (allCoursesPresent) {
        const resolved = rawParsedQuestions.map((row, idx) => {
          if (imageErrorRowIndices.has(idx)) {
            return {
              type: "mcq" as const,
              question: row.question || `Row ${idx + 1}`,
              choices: [],
              correctAnswer: "",
              difficulty: row.difficulty || "normal",
              topic_id: "",
              subject_id: "",
              course_id: "",
              courseName: row.courseName,
              subjectName: row.subjectName,
              topicName: row.topicName,
              status: "error" as const,
              error: "Row contains an image — only text is allowed in the Excel sheet",
            };
          }
          return resolveRow(row);
        });
        setParsedQuestions(resolved);
        setStep("preview");
        setIsResolvingMissing(false);
      }
    }
  }, [isResolvingMissing, missingHierarchy, courseMap, subjectMap, topicsBySubject, rawParsedQuestions, resolveRow, imageErrorRowIndices]);

  const handleCreateMissing = async () => {
    setIsLoading(true);
    try {
      await coursesApi.bulkCreateHierarchy({ courses: missingHierarchy }, token || undefined);
      await Promise.all([refetchCourses(), refetchSubjects(), refetchTopics()]);
      setIsResolvingMissing(true);
    } catch (err: any) {
      console.error("Failed to create missing entities", err);
      toast.error(err.message || "Failed to create missing entities");
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      // Try to find the "Questions" sheet first, otherwise use the first sheet
      let sheetName = workbook.SheetNames.find(
        (name) => name.toLowerCase() === "questions"
      );
      if (!sheetName) {
        sheetName = workbook.SheetNames[0];
      }

      const sheet = workbook.Sheets[sheetName];

      // Detect rows that contain embedded images.
      // SheetJS stores images in sheet['!images'] as an array of objects with
      // an `from` anchor { r: <0-based row>, c: <0-based col> }.
      // Row 0 is the header row, so data rows start at r=1 → data index 0.
      const imageRowSet = new Set<number>();
      const sheetImages = (sheet as any)["!images"] as any[] | undefined;
      if (sheetImages && sheetImages.length > 0) {
        for (const img of sheetImages) {
          // anchor may live under img.from, img.anchor, or img.position depending on SheetJS version
          const fromRow: number | undefined =
            img?.from?.r ?? img?.anchor?.from?.r ?? img?.position?.r;
          if (fromRow !== undefined && fromRow >= 1) {
            // convert 0-based sheet row to 0-based data-array index (subtract 1 for header)
            imageRowSet.add(fromRow - 1);
          }
        }
      }

      const raw = XLSX.utils.sheet_to_json(sheet);

      // Track which raw rows have images so we can flag them as errors later
      const imageErrorRows = new Set<number>();

      const parsed: ParsedQuestion[] = raw
        .map((row: unknown, rowIndex: number) => {
          const r = row as Record<string, string>;

          // Support multiple column name variations
          const getFieldValue = (possibleNames: string[]): string => {
            for (const name of possibleNames) {
              if (r[name] !== undefined && r[name] !== "") {
                return String(r[name]);
              }
            }
            return "";
          };

          if (imageRowSet.has(rowIndex)) {
            // Mark this row index so resolveRow can emit an error later
            imageErrorRows.add(rowIndex);
          }

          return {
            courseName: getFieldValue(["Course Name", "Course", "course_name", "course"]),
            subjectName: getFieldValue(["Subject Name", "Subject", "subject_name", "subject"]),
            topicName: getFieldValue(["Topic Name", "Topic", "topic_name", "topic"]),
            question: getFieldValue(["Question", "question", "Question Text", "question_text"]),
            option1: getFieldValue(["Option 1", "Option1", "option1", "Choice 1", "Choice1"]),
            option2: getFieldValue(["Option 2", "Option2", "option2", "Choice 2", "Choice2"]),
            option3: getFieldValue(["Option 3", "Option3", "option3", "Choice 3", "Choice3"]),
            option4: getFieldValue(["Option 4", "Option4", "option4", "Choice 4", "Choice4"]),
            option5: getFieldValue(["Option 5", "Option5", "option5", "Choice 5", "Choice5"]),
            correctAnswer: getFieldValue(["Correct Answer", "Correct", "correct_answer", "answer"]),
            difficulty: getFieldValue(["Difficulty", "difficulty", "Level", "level"]),
            explanation: getFieldValue(["Explanation", "explanation", "Note", "note"]),
            videoUrl: getFieldValue(["Video URL", "Video", "video_url", "video"]),
            questionAddedBy: getFieldValue(["Question Added By", "Added By", "added_by"]),
          };
        })
        .filter((row) => row.question.trim() !== "");

      // Persist image-affected row indices to state (needed by the async isResolvingMissing flow)
      setImageErrorRowIndices(new Set(imageErrorRows));

      // Parse Reference sheet if it exists
      let refSheetName = workbook.SheetNames.find(
        (name) => name.toLowerCase() === "reference" || name.toLowerCase() === "references"
      );
      let parsedRefs: any[] = [];
      if (refSheetName) {
        const refSheet = workbook.Sheets[refSheetName];
        const rawRefs = XLSX.utils.sheet_to_json(refSheet);
        parsedRefs = rawRefs.map((row: any) => ({
          courseName: row["Course Name"] || row["Course"] || row["course_name"] || row["course"] || "",
          subjectName: row["Subject Name"] || row["Subject"] || row["subject_name"] || row["subject"] || "",
          topicName: row["Topic Name"] || row["Topic"] || row["topic_name"] || row["topic"] || "",
          description: row["Description"] || row["description"] || "",
        })).filter(r => r.courseName.trim() !== "");
      }

      // Combine questions and references for missing hierarchy detection
      const allRowsToCheck = [
        ...parsed.map(r => ({ courseName: r.courseName, subjectName: r.subjectName, topicName: r.topicName })),
        ...parsedRefs
      ];

      // Detect missing hierarchy
      const missingCoursesMap = new Map<string, Map<string, Set<string>>>();
      const courseDescMap = new Map<string, string>();
      const subjectDescMap = new Map<string, string>();
      const topicDescMap = new Map<string, string>();

      allRowsToCheck.forEach((row) => {
        const cName = normalizeName(row.courseName);
        const sName = normalizeName(row.subjectName);
        const tName = normalizeName(row.topicName);
        const desc = row.description?.trim();
        
        if (desc) {
          if (tName) topicDescMap.set(`${cName}|${sName}|${tName}`, desc);
          else if (sName) subjectDescMap.set(`${cName}|${sName}`, desc);
          else if (cName) courseDescMap.set(cName, desc);
        }


        if (!cName || !sName) return;

        let courseFound = courseMap.has(cName);
        let subjectFound = false;
        let topicFound = false;

        if (courseFound) {
          const course = courseMap.get(cName)!;
          const subjectKey = `${sName}|${course.id}`;
          subjectFound = subjectMap.has(subjectKey);
          if (subjectFound) {
            const subject = subjectMap.get(subjectKey)!;
            topicFound = topicsBySubject.get(subject.id)?.has(tName) || false;
          }
        }

        if (!courseFound || !subjectFound || !topicFound) {
          if (!missingCoursesMap.has(cName)) missingCoursesMap.set(cName, new Map());
          const sMap = missingCoursesMap.get(cName)!;
          if (!sMap.has(sName)) sMap.set(sName, new Set());
          if (!topicFound && tName !== "") sMap.get(sName)!.add(tName);
        }
      });

      if (missingCoursesMap.size > 0 && user?.role === "admin") {
        const missingList = Array.from(missingCoursesMap.entries()).map(([cName, sMap]) => {
          const originalCourseName = allRowsToCheck.find((p) => normalizeName(p.courseName) === cName)?.courseName || cName;
          return {
            name: originalCourseName,
            description: courseDescMap.get(cName),
            subjects: Array.from(sMap.entries()).map(([sName, tSet]) => {
              const originalSubjectName = allRowsToCheck.find((p) => normalizeName(p.subjectName) === sName)?.subjectName || sName;
              return {
                name: originalSubjectName,
                description: subjectDescMap.get(`${cName}|${sName}`),
                topics: Array.from(tSet).map((tName) => {
                  return {
                    name: allRowsToCheck.find((p) => normalizeName(p.topicName) === tName)?.topicName || tName,
                    description: topicDescMap.get(`${cName}|${sName}|${tName}`)
                  };
                })
              };
            })
          };
        });
        setMissingHierarchy(missingList);
        setRawParsedQuestions(parsed);
        // Notify about image rows even in missing-hierarchy flow
        if (imageErrorRows.size > 0) {
          toast.error(
            `${imageErrorRows.size} row(s) contain embedded images and will be skipped. Only text is allowed.`
          );
        }
        setStep("confirm_missing");
      } else {
        const resolved = parsed.map((row, idx) => {
          if (imageErrorRows.has(idx)) {
            // This row had an embedded image — skip it with an error
            return {
              type: "mcq" as const,
              question: row.question || `Row ${idx + 1}`,
              choices: [],
              correctAnswer: "",
              difficulty: row.difficulty || "normal",
              topic_id: "",
              subject_id: "",
              course_id: "",
              courseName: row.courseName,
              subjectName: row.subjectName,
              topicName: row.topicName,
              status: "error" as const,
              error: "Row contains an image — only text is allowed in the Excel sheet",
            };
          }
          return resolveRow(row);
        });
        if (imageErrorRows.size > 0) {
          toast.error(
            `${imageErrorRows.size} row(s) were skipped because they contain embedded images. Only text is allowed.`
          );
        }
        setParsedQuestions(resolved);
        setStep("preview");
      }
    } catch (error) {
      console.error("Failed to parse Excel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setParsedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    setIsLoading(true);
    const BATCH_SIZE = 500;

    const questionsToImport = parsedQuestions
      .filter((q) => q.status === "ready")
      .map((q) => ({
        type: q.type as "mcq",
        question: q.question,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        videoUrl: q.videoUrl || "",
        difficulty: q.difficulty || "normal",
        topic_id: q.topic_id,
        subject_id: q.subject_id,
        course_id: q.course_id,
        questionAddedBy: "",
      }));

    setImportProgress({ current: 0, total: questionsToImport.length });

    let totalImported = 0;
    let totalFailed = 0;
    const allErrors: { row: number; reason: string }[] = [];

    try {
      for (let i = 0; i < questionsToImport.length; i += BATCH_SIZE) {
        const batch = questionsToImport.slice(i, i + BATCH_SIZE);
        const result = await questionsApi.bulkImport(batch, token || undefined);

        totalImported += result.data.imported;
        totalFailed += result.data.failed;
        allErrors.push(...(result.data.errors || []));

        setImportProgress({
          current: Math.min(i + BATCH_SIZE, questionsToImport.length),
          total: questionsToImport.length,
        });
      }

      setImportResult({
        totalRows: parsedQuestions.length,
        imported: totalImported,
        failed: totalFailed,
        errors: allErrors,
      });
      setStep("result");
    } catch (error) {
      console.error("Failed to import:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const readyCount = parsedQuestions.filter((q) => q.status === "ready").length;
  const errorCount = parsedQuestions.filter((q) => q.status === "error").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Questions from Excel</h1>
        <p className="text-muted-foreground">Bulk import MCQ questions using an Excel file</p>
      </div>

      {/* Step 1: Download Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Step 1: Download Template
          </CardTitle>
          <CardDescription>
            Download the Excel template with pre-filled course, subject, and topic names.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Upload Excel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Step 2: Upload Excel
          </CardTitle>
          <CardDescription>
            Upload your filled Excel file. We&apos;ll parse it and validate the questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center w-full h-48
              border-2 border-dashed rounded-xl cursor-pointer
              transition-all duration-200 ease-in-out
              ${isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
              }
              ${isLoading ? "pointer-events-none opacity-50" : ""}
            `}
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processing file...</p>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <FileSpreadsheet className="h-10 w-10 text-green-500" />
                <div className="text-center">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Click or drop to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={`
                  p-4 rounded-full transition-colors duration-200
                  ${isDragging ? "bg-primary/10" : "bg-muted"}
                `}>
                  <Upload className={`h-8 w-8 transition-colors duration-200 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isDragging ? "Drop your file here" : "Drag & drop your Excel file"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or <span className="text-primary font-medium">browse</span> to choose a file
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Supports .xlsx and .xls files</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2.5: Confirm Missing */}
      {step === "confirm_missing" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <AlertCircle className="h-5 w-5" />
              Missing Entities Detected
            </CardTitle>
            <CardDescription>
              Some Courses, Subjects, or Topics in the uploaded file do not exist in the system.
              Would you like to add them before importing the questions?
              <div className="mt-3 flex gap-3">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">
                  {missingHierarchy.filter(c => !courseMap.has(normalizeName(c.name))).length} New Course{missingHierarchy.filter(c => !courseMap.has(normalizeName(c.name))).length !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800">
                  {missingHierarchy.reduce((acc, c) => {
                    const courseExists = courseMap.has(normalizeName(c.name));
                    const courseId = courseExists ? courseMap.get(normalizeName(c.name))!.id : null;
                    return acc + c.subjects.filter(s => !(courseId && subjectMap.has(`${normalizeName(s.name)}|${courseId}`))).length;
                  }, 0)} New Subject{/* Add suffix conditionally later */}
                </Badge>
                <Badge variant="outline" className="bg-pink-500/10 text-pink-600 border-pink-200 dark:text-pink-400 dark:border-pink-800">
                  {missingHierarchy.reduce((acc, c) => {
                    const courseExists = courseMap.has(normalizeName(c.name));
                    const courseId = courseExists ? courseMap.get(normalizeName(c.name))!.id : null;
                    return acc + c.subjects.reduce((sAcc, s) => {
                      const subjectExists = courseId && subjectMap.has(`${normalizeName(s.name)}|${courseId}`);
                      const subjectId = subjectExists ? subjectMap.get(`${normalizeName(s.name)}|${courseId}`)!.id : null;
                      return sAcc + s.topics.filter(t => !(subjectId && topicsBySubject.get(subjectId)?.has(normalizeName(t.name)))).length;
                    }, 0);
                  }, 0)} New Topic{/* Add suffix conditionally later */}
                </Badge>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-auto bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm border">
              {missingHierarchy.map((course, cIdx) => (
                <div key={cIdx} className="mb-4 last:mb-0">
                  <div className="font-bold text-primary">{course.name}</div>
                  {course.subjects.map((subject, sIdx) => (
                    <div key={sIdx} className="ml-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">├──</span>
                        <span className="font-semibold">{subject.name}</span>
                      </div>
                      {subject.topics.map((topic, tIdx) => (
                        <div key={tIdx} className="ml-8 mt-1 flex items-center gap-2">
                          <span className="text-muted-foreground">{tIdx === subject.topics.length - 1 ? '└──' : '├──'}</span>
                          <span>{topic.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setStep("upload")} disabled={isLoading}>
                Cancel Import
              </Button>
              <Button onClick={handleCreateMissing} disabled={isLoading || isResolvingMissing}>
                {(isLoading || isResolvingMissing) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Create Missing Entities
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Step 3: Preview & Import
            </CardTitle>
            <CardDescription>
              Review the parsed questions below. Remove any rows you don&apos;t want to import.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                {readyCount} Ready
              </Badge>
              {errorCount > 0 && (
                <Badge variant="outline" className="bg-red-500/10 text-red-500">
                  {errorCount} Errors
                </Badge>
              )}
            </div>

            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedQuestions.map((q, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{capitalize(q.courseName)}</TableCell>
                      <TableCell>{capitalize(q.subjectName)}</TableCell>
                      <TableCell>{capitalize(q.topicName)}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={q.question}>
                        {q.question}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          q.difficulty === "beginner" ? "bg-green-500/10 text-green-500" :
                          q.difficulty === "normal" ? "bg-blue-500/10 text-blue-500" :
                          q.difficulty === "mid" ? "bg-yellow-500/10 text-yellow-500" :
                          q.difficulty === "hard" ? "bg-orange-500/10 text-orange-500" :
                          q.difficulty === "expert" ? "bg-red-500/10 text-red-500" :
                          "bg-muted"
                        }>
                          {capitalize(q.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {q.status === "ready" ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500" title={q.error}>
                            Error
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveQuestion(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end mt-4">
              {isLoading && importProgress.total > 0 && (
                <div className="flex-1 mr-4 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Importing questions...</span>
                    <span>{importProgress.current} / {importProgress.total}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <Button onClick={handleImport} disabled={isLoading || readyCount === 0}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Import {readyCount} Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Result */}
      {step === "result" && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{importResult.totalRows}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{importResult.imported}</div>
                <div className="text-sm text-green-400/80">Imported</div>
              </div>
              <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{importResult.failed}</div>
                <div className="text-sm text-red-400/80">Failed</div>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-4 space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setShowErrors(!showErrors)}
                  className="flex items-center gap-2 border-red-500/20 hover:border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all duration-200"
                >
                  <AlertCircle className="h-4 w-4" />
                  {showErrors ? "Hide Errors" : "Show Errors"} ({importResult.errors.length})
                  {showErrors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {showErrors && (
                  <div className="mt-2 max-h-[300px] overflow-auto p-4 bg-red-950/20 border border-red-500/20 rounded-lg animate-in fade-in-50 slide-in-from-top-1 duration-200">
                    <h4 className="font-medium mb-3 text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" />
                      Detailed Import Errors:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground text-left">
                      {importResult.errors.map((err, i) => (
                        <li key={i} className="flex gap-2 items-start py-1.5 border-b border-border/45 last:border-0">
                          <span className="font-medium text-red-400/90 whitespace-nowrap">Row {err.row}:</span>
                          <span>{err.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={() => { setStep("upload"); setParsedQuestions([]); setImportResult(null); setShowErrors(false); }}>
                Import More
              </Button>
              <Button onClick={() => window.location.href = "/dashboard/questions"}>
                View Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}