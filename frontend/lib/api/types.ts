export interface SignupPayload {
  fname: string;
  lname: string;
  role: "student" | "teacher" | "admin";
  email: string;
  mobileNumber: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      fname: string;
      lname: string;
      role: string;
      email: string;
      mobilenumber: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
    token: string;
  };
}

export interface User {
  id: string;
  fname: string;
  lname: string;
  role: string;
  email: string;
  mobileNumber: string;
  location?: {
    id: string;
    address_line_1: string;
    city: string;
    pincode: string;
    state: string;
    country: string;
  } | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: Pagination;
  };
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: {
    role: string;
    // Admin
    testsSubmitted?: number;
    totalQuestions?: number;
    totalTopics?: number;
    topicsCovered?: number;
    studentsCount?: number;
    totalSubjects?: number;
    totalTeachers?: number;
    totalCourses?: number;
    usersByLocation?: Array<{
      id: string;
      city: string;
      state: string;
      user_count: number;
    }>;
    // Teacher
    questionsAdded?: number;
    studentsInCourses?: number;
    questionsInCourses?: number;
    // Student
    questionsInEnrolledCourses?: number;
  };
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  subjectName: string;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  avgTimePerQuestion: number;
  status: "strong" | "moderate" | "weak";
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  avgTimePerQuestion: number;
  status: "strong" | "moderate" | "weak";
}

export interface PerformanceTrend {
  testId: string;
  score: number;
  correct: number;
  incorrect: number;
  totalQuestions: number;
  date: string;
}

export interface StrengthsWeaknessesResponse {
  success: boolean;
  message: string;
  data: {
    strong: TopicPerformance[];
    weak: TopicPerformance[];
    overallAccuracy: number;
    totalTopicsAttempted: number;
    totalTests: number;
  };
}

// Admin Analytics Types
export interface TeacherStudentRatioResponse {
  success: boolean;
  message: string;
  data: {
    locations: {
      id: string;
      city: string;
      state: string;
      teacher_count: number;
      student_count: number;
      ratio: string;
    }[];
    total_teachers: number;
    total_students: number;
  };
}

export interface TopStudentsByLocationResponse {
  success: boolean;
  message: string;
  data: {
    students: {
      id: string;
      fname: string;
      lname: string;
      email: string;
      city: string;
      state: string;
      total_tests: number;
      avg_score: number;
      total_correct: number;
      total_questions: number;
      rank: number;
    }[];
  };
}

export interface LeastQuestionsResponse {
  success: boolean;
  message: string;
  data: {
    topics: {
      topicId: string;
      topicName: string;
      subjectName: string;
      courseName: string;
      questionCount: number;
      status: "needs_questions" | "adequate";
    }[];
  };
}

export interface SubjectsAttentionResponse {
  success: boolean;
  message: string;
  data: {
    subjects: {
      subjectId: string;
      subjectName: string;
      courseName: string;
      avgScore: number;
      studentCount: number;
      belowPassingCount: number;
      lowPerformers: {
        studentId: string;
        fname: string;
        lname: string;
        avgScore: number;
      }[];
    }[];
  };
}

export interface TopicPerformanceResponse {
  success: boolean;
  message: string;
  data: {
    topics: TopicPerformance[];
    totalTests: number;
  };
}

export interface SubjectPerformanceResponse {
  success: boolean;
  message: string;
  data: {
    subjects: SubjectPerformance[];
    totalTests: number;
  };
}

export interface PerformanceTrendsResponse {
  success: boolean;
  message: string;
  data: {
    last15Days: PerformanceTrend[];
    last30Days: PerformanceTrend[];
    last60Days: PerformanceTrend[];
  };
}

export interface Course {
  id: string;
  name: string;
  description: string | null;
}

export interface CoursesResponse {
  success: boolean;
  message: string;
  data: {
    courses: Course[];
    pagination: Pagination;
  };
}

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  course_id: string;
  course: {
    id: string;
    name: string;
  };
}

export interface SubjectsResponse {
  success: boolean;
  message: string;
  data: {
    subjects: Subject[];
    pagination: Pagination;
  };
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  subject_id: string;
  subject: {
    id: string;
    name: string;
    course: {
      id: string;
      name: string;
    };
  };
}

export interface TopicsResponse {
  success: boolean;
  message: string;
  data: {
    topics: Topic[];
    pagination: Pagination;
  };
}

export interface Location {
  id: string;
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  is_central: boolean;
}

export interface CreateLocationPayload {
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
}

export interface LocationsResponse {
  success: boolean;
  message: string;
  data: {
    locations: Location[];
    pagination: Pagination;
  };
}

export interface LocationResponse {
  success: boolean;
  message: string;
  data: Location;
}

export interface Question {
  id: string;
  type: "mcq" | "descriptive";
  question: string;
  choices: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  videoUrl: string | null;
  difficulty: string;
  topic_id: string;
  subject_id: string;
  course_id: string;
  questionAddedBy: string;
}

export interface QuestionsResponse {
  success: boolean;
  message: string;
  data: {
    questions: Question[];
    pagination: Pagination;
  };
}

export interface CreateQuestionPayload {
  type: "mcq" | "descriptive";
  question: string;
  choices: string[] | null;
  correctAnswer: string;
  explanation?: string;
  videoUrl?: string;
  difficulty: string;
  topic_id: string;
  subject_id: string;
  course_id: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course: { id: string; name: string };
  subject: { id: string; name: string } | null;
  topic: { id: string; name: string } | null;
}

export interface EnrollmentsResponse {
  success: boolean;
  message: string;
  data: {
    enrollments: Enrollment[];
    pagination: Pagination;
  };
}

export interface EnrolledCourse {
  id: string;
  name: string;
}

export interface EnrolledCoursesResponse {
  success: boolean;
  message: string;
  data: {
    courses: EnrolledCourse[];
  };
}

export interface EnrolledSubjectsResponse {
  success: boolean;
  message: string;
  data: {
    subjects: { id: string; name: string }[];
  };
}

export interface EnrolledTopicsResponse {
  success: boolean;
  message: string;
  data: {
    topics: { id: string; name: string }[];
  };
}

export interface EnrollmentPayload {
  enrollments: {
    course_id: string;
    subject_id?: string;
    topic_id?: string;
  }[];
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    created: Enrollment[];
    skipped: { enrollment: { course_id: string; subject_id?: string; topic_id?: string }; reason: string }[];
    totalCreated: number;
    totalSkipped: number;
  };
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  course_id: string;
  subject_id: string | null;
  course?: { id: string; name: string };
  subject?: { id: string; name: string } | null;
  teacher?: { id: string; fname: string; lname: string; email: string };
}

export interface TeacherAssignmentsResponse {
  success: boolean;
  message: string;
  data: {
    teacher: {
      id: string;
      fname: string;
      lname: string;
      email: string;
      role: string;
    };
    assignments: {
      id: string;
      name: string;
      subjects: { id: string; name: string }[];
    }[];
  };
}

export interface BulkSubjectPayload {
  teacher_id: string;
  course_id: string;
  subject_ids?: string[];
}

export interface BulkSubjectResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    created: number;
    skipped: number;
    assignments: TeacherAssignment[];
  };
}

export interface TeacherListResponse {
  success: boolean;
  message: string;
  data: {
    teachers: {
      id: string;
      fname: string;
      lname: string;
      email: string;
      mobileNumber: string;
      createdAt: string;
      courseCount: number;
      subjectCount: number;
      totalAssignments: number;
    }[];
    pagination: Pagination;
  };
}

export interface TeacherEnrollmentItem {
  id: string;
  teacher: { id: string; fname: string; lname: string; email: string };
  course: { id: string; name: string };
  subject: { id: string; name: string } | null;
}

export interface TeacherEnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    assignments: TeacherEnrollmentItem[];
    pagination: Pagination;
  };
}

export interface TeachingTest {
  id: string;
  test_id: string;
  student: {
    id: string;
    fname: string;
    lname: string;
    email: string;
  };
  status: string;
  subject_id: string | null;
  topic_id: string | null;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  score: number;
  started_at: string;
  completed_at: string | null;
}

export interface TeachingTestsResponse {
  success: boolean;
  message: string;
  data: {
    tests: TeachingTest[];
    pagination: Pagination;
  };
}

export interface TeachingStudent {
  id: string;
  fname: string;
  lname: string;
  email: string;
  course_id: string;
  subject_id: string;
}

export interface TeachingStudentsResponse {
  success: boolean;
  message: string;
  data: {
    students: TeachingStudent[];
    pagination: Pagination;
  };
}

export interface TeachingCourse {
  id: string;
  name: string;
}

export interface TeachingSubject {
  id: string;
  name: string;
  course_id: string;
}

export interface TeachingCoursesAndSubjectsResponse {
  success: boolean;
  message: string;
  data: {
    courses: TeachingCourse[];
    subjects: TeachingSubject[];
  };
}

export interface TopStudent {
  id: string;
  fname: string;
  lname: string;
  email: string;
  totalTests: number;
  avgScore: number;
  avgCorrect: number;
  avgIncorrect: number;
}

export interface TopStudentsResponse {
  success: boolean;
  message: string;
  data: {
    students: TopStudent[];
  };
}

export interface WeakTopic {
  topicId: string;
  topicName: string;
  subjectName: string;
  courseName: string;
  weakStudentCount: number;
  totalStudents: number;
  avgAccuracy: number;
}

export interface WeaknessSummaryResponse {
  success: boolean;
  message: string;
  data: {
    weakTopics: WeakTopic[];
  };
}

export interface CoverageTopic {
  topicId: string;
  topicName: string;
  subjectName: string;
  courseName: string;
  count: number;
}

export interface QuestionCoverageResponse {
  success: boolean;
  message: string;
  data: {
    topics: CoverageTopic[];
  };
}

export interface TestHistory {
  id: string;
  test_id: string;
  status: string;
  total_questions: number;
  correct: number;
  score: string | number;
  started_at: string;
  course?: { id: string; name: string };
}

export interface TestHistoryResponse {
  success: boolean;
  message: string;
  data: {
    tests: TestHistory[];
    pagination: Pagination;
  };
}

export interface StartTestPayload {
  duration_minutes: number;
  question_limit: number;
  selections: {
    course_id: string;
    subject_id?: string;
    topic_id?: string;
  }[];
}

export interface TestSession {
  id: string;
  test_id: string;
  status: string;
  duration_minutes: number;
  question_limit: number;
  ends_at: string;
  totalQuestions: number;
  questions: {
    index: number;
    questionId: string;
    question: string;
    choices: string[];
    difficulty: string;
    topicName: string;
    subjectName: string;
    courseName: string;
  }[];
}

export interface StartTestResponse {
  success: boolean;
  message: string;
  data: TestSession;
}

export interface SubmitTestResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    test_id: string;
    status: string;
    totalQuestions: number;
    attempted: number;
    skipped: number;
    correct: number;
    incorrect: number;
    score: number;
  };
}

export interface TestResult {
  id: string;
  test_id: string;
  status: string;
  totalQuestions: number;
  attempted: number;
  skipped: number;
  correct: number;
  incorrect: number;
  score: number;
  disconnectCount: number;
  startedAt: string;
  completedAt: string;
  questions: {
    index: number;
    question: string;
    choices: string[];
    selectedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    videoUrl: string;
    timeTaken: number;
    topicName: string;
    subjectName: string;
    courseName: string;
  }[];
}

export interface TestResultResponse {
  success: boolean;
  message: string;
  data: TestResult;
}

export interface StudentResultsResponse {
  success: boolean;
  message: string;
  data: {
    results: TestResult[];
    pagination: Pagination;
  };
}

export interface PredefinedTest {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  status: "draft" | "active" | "inactive" | "archived";
  is_scheduled: boolean;
  start_time: string | null;
  end_time: string | null;
  timezone: string;
  duration_minutes: number;
  question_limit: number;
  difficulty: string;
  difficulty_ratio: { beginner?: number; normal?: number; mid?: number; hard?: number; expert?: number } | null;
  use_fixed_questions: boolean;
  use_specific_students: boolean;
  max_attempts: number;
  course_ids: string[];
  subject_ids: string[] | null;
  topic_ids: string[] | null;
  test_link_token: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PredefinedTestResponse {
  success: boolean;
  message: string;
  data: {
    tests: PredefinedTest[];
    pagination: Pagination;
  };
}

export interface PredefinedTestDetailResponse {
  success: boolean;
  message: string;
  data: PredefinedTest;
}

export interface CreatePredefinedTestPayload {
  title: string;
  description?: string;
  is_scheduled?: boolean;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  duration_minutes: number;
  question_limit: number;
  difficulty?: string;
  difficulty_ratio?: { beginner?: number; normal?: number; mid?: number; hard?: number; expert?: number };
  use_fixed_questions?: boolean;
  use_specific_students?: boolean;
  max_attempts?: number;
  course_ids: string[];
  subject_ids?: string[];
  topic_ids?: string[];
  fixed_question_ids?: string[];
  student_ids?: string[];
}

export interface PredefinedTestStartResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    test_id: string;
    status: string;
    duration_minutes: number;
    question_limit: number;
    ends_at: string;
    totalQuestions: number;
    questions: {
      index: number;
      questionId: string;
      question: string;
      choices: string[];
      difficulty: string;
      topicName: string;
      subjectName: string;
      courseName: string;
    }[];
  };
}