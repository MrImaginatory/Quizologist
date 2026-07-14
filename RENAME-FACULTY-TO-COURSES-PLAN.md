# Rename Plan: faculty → courses (7 Phases)

No DB migration needed — drop tables and reseed after each phase.

---

## Phase 1: contentService (source of truth)

**Why first**: All other services depend on the content service's model and API shape.

### Files to rename/move
- `modules/faculty/` → `modules/course/`
  - `faculty.model.ts` → `course.model.ts`
  - `faculty.service.ts` → `course.service.ts`
  - `faculty.controller.ts` → `course.controller.ts`
  - `faculty.validation.ts` → `course.validation.ts`
  - `faculty.routes.ts` → `course.routes.ts`
- `seed/importFacultyData.ts` → `seed/importCourseData.ts`

### Code changes
- `course.model.ts`: Class `Faculty` → `Course`, `tableName: "courses"`
- `course.service.ts`: All `faculty` vars → `course`
- `course.controller.ts`: Class name + method refs
- `course.validation.ts`: `FacultyIdParam` → `CourseIdParam`
- `course.routes.ts`: Import paths
- `modules/subject/subject.model.ts`: `faculty_id` → `course_id`
- `modules/subject/subject.service.ts`: `FACULTY_INCLUDE` → `COURSE_INCLUDE`, all `faculty` refs
- `modules/subject/subject.validation.ts`: `faculty_id` → `course_id`
- `modules/subject/subject.routes.ts`: Route `/faculty/:facultyId` → `/course/:courseId`
- `modules/topic/topic.service.ts`: Faculty import → Course
- `config/associations.ts`: `Faculty.hasMany(Subject)` → `Course.hasMany(Subject)`
- `types/index.ts`: `FacultyAttributes` → `CourseAttributes`
- `utils/responseMessages.ts`: All `FACULTY_*` → `COURSE_*`
- `index.ts`: Mount `/api/content/faculty` → `/api/content/course`

### API.md update
- Replace all "faculty" → "course" in endpoint paths, field names, response keys, descriptions
- `POST /faculty` → `POST /course`
- `GET /faculty` → `GET /course`
- `GET /faculty/:id` → `GET /course/:id`
- `PUT /faculty/:id` → `PUT /course/:id`
- `DELETE /faculty/:id` → `DELETE /course/:id`
- `faculty_id` → `course_id` in Subject section
- `/subject/faculty/:facultyId` → `/subject/course/:courseId`
- Response key `faculties` → `courses`
- Nested `faculty` object → `course` in all response shapes

---

## Phase 2: testService

### Files to rename/move
- `modules/faculty/` → `modules/course/`
  - `faculty.model.ts` → `course.model.ts`

### Code changes
- `course.model.ts`: Class + `tableName: "courses"`
- `modules/testSelection/testSelection.model.ts`: `faculty_id` → `course_id`, FK ref `"courses"`
- `modules/testSession/testSession.service.ts`: `FACULTY_INCLUDE` → `COURSE_INCLUDE`, all `faculty` vars
- `modules/subject/subject.model.ts`: `faculty_id` → `course_id`
- `modules/question/question.model.ts`: `faculty_id` → `course_id`
- `modules/enrollment/enrollment.model.ts`: `faculty_id` → `course_id`
- `config/associations.ts`: All Faculty → Course

### API.md update
- `POST /start`: `faculty_id` → `course_id` in selections
- Response `facultyName` → `courseName`
- Error message: "selected faculty/subject/topic" → "selected course/subject/topic"
- `GET /result`: `facultyName` → `courseName` in questions
- `GET /student/:studentId/results`: same
- `GET /student/:studentId/summary`: `faculties` → `courses`
- Validation rules: "selected faculty" → "selected course"
- Error table: "selected faculty" → "selected course"

---

## Phase 3: teacherService

### Files to rename/move
- `modules/faculty/` → `modules/course/`
  - `faculty.model.ts` → `course.model.ts`

### Code changes
- `course.model.ts`: Class + `tableName: "courses"`
- `modules/teacherAssignment/teacherAssignment.model.ts`: FK ref `"courses"`
- `modules/teacherAssignment/teacherAssignment.service.ts`: `AssignFacultyInput` → `AssignCourseInput`, all refs
- `modules/teacherAssignment/teacherAssignment.controller.ts`: Method + response strings
- `modules/teacherAssignment/teacherAssignment.routes.ts`: `/assign/faculty` → `/assign/course`
- `modules/subject/subject.model.ts`: FK ref `"courses"`
- `config/associations.ts`: Faculty → Course
- `seed/randomTeacherAssignments.ts`: All faculty vars + logs

### API.md update
- `POST /assign/faculty` → `POST /assign/course`
- `faculty_id` → `course_id` in all request/response bodies
- `facultyCount` → `courseCount` in teacher list response
- `faculty` object → `course` in assignment responses
- Error table: "Faculty not found" → "Course not found", "assigned to this faculty" → "assigned to this course"

---

## Phase 4: studentService

### Files to rename/move
- `modules/faculty/` → `modules/course/`
  - `faculty.model.ts` → `course.model.ts`

### Code changes
- `course.model.ts`: Class + `tableName: "courses"`
- `modules/enrollment/enrollment.model.ts`: `faculty_id` → `course_id`, FK ref
- `modules/enrollment/enrollment.service.ts`: `FACULTY_INCLUDE` → `COURSE_INCLUDE`
- `modules/student/student.service.ts`: Faculty include → Course
- `config/associations.ts`: Faculty → Course
- `utils/responseMessages.ts`: `FACULTY_NOT_FOUND` → `COURSE_NOT_FOUND`
- `seed/randomEnrollments.ts`: All faculty vars + messages

### API.md update
- `GET /api/student/list`: `faculty_id` filter → `course_id`, example URL
- `POST /`: `faculty_id` → `course_id` in enrollment items
- `GET /`: `faculty` object → `course` in responses
- `GET /student/:studentId`: same
- Batch rules: "Faculty required" → "Course required", "subject must belong to the given faculty" → "subject must belong to the given course"
- Error table: "Faculty not found" → "Course not found", "Subject does not belong to the specified faculty" → "Subject does not belong to the specified course"

---

## Phase 5: questionService + dashboardService

### questionService files
- `modules/faculty/` → `modules/course/`
  - `faculty.model.ts` → `course.model.ts`
- `modules/question/question.model.ts`: `faculty_id` → `course_id`
- `modules/question/question.service.ts`: `FACULTY_INCLUDE` → `COURSE_INCLUDE`
- `config/associations.ts`: Faculty → Course
- `utils/responseMessages.ts`: `FACULTY_NOT_FOUND` → `COURSE_NOT_FOUND`
- `seed/importQuestions.ts`: All faculty vars + map

### dashboardService files
- `modules/models/index.ts`: Class `Faculty` → `Course`, `tableName: "courses"`, FK refs
- `modules/dashboard/studentAnalytics.service.ts`: Import Course instead of Faculty

### questionService API.md update
- `POST /`: `faculty_id` → `course_id` in body + response
- `GET /`: `faculty_id` in response
- `GET /:id`: same
- `PUT /:id`: same
- Validation table: `faculty_id` must reference active course
- Error table: "Faculty not found" → "Course not found"

### dashboardService API.md update
- Teacher KPIs: `studentsInFaculties` → `studentsInCourses`, `testsSubmitted in faculties` → `testsSubmitted in courses`, `questionsInFaculties` → `questionsInCourses`
- Student KPIs: `questionsInEnrolledFaculties` → `questionsInEnrolledCourses`

### apiGateway API.md update
- Role table: "Faculty" → "Course"
- `POST /api/content/faculty` → `POST /api/content/course` (all CRUD)
- `GET /api/content/subject/faculty/:facultyId` → `/course/:courseId`
- Subject body: `faculty_id` → `course_id`
- Question body: `faculty_id` → `course_id`
- Enrollment body: `faculty_id` → `course_id`
- Test start body: `faculty_id` → `course_id`
- Summary: `faculties` → `courses`
- `POST /api/teacher/assign/faculty` → `/assign/course`
- Teacher assign body: `faculty_id` → `course_id`
- `facultyCount` → `courseCount` in teacher list
- Student list filter: `faculty_id` → `course_id`
- Enrollment response: `faculty` object → `course`
- Dashboard KPI names updated

---

## Phase 6: Frontend (old React app)

### Folder rename
- `src/components/dashboard/faculty/` → `src/components/dashboard/courses/`
- `FacultyTab.tsx` → `CourseTab.tsx`

### Code changes
- `src/components/dashboard/courses/CourseTab.tsx`: All `Faculty` → `Course`, `faculty` → `course`
- `src/components/dashboard/courses/SubjectTab.tsx`: Import path update
- `src/components/dashboard/courses/TopicTab.tsx`: Import path update
- `src/lib/contentService.ts`: Interface `Faculty` → `Course`, methods `getFaculties` → `getCourses`, `createFaculty` → `createCourse`, etc., URL paths
- `src/lib/studentService.ts`: `faculty_id` → `course_id`
- `src/lib/questionService.ts`: `faculty_id` → `course_id`
- `src/lib/teacherService.ts`: `assignFaculty` → `assignCourse`, `faculty_id` → `course_id`, `facultyCount` → `courseCount`
- `src/lib/testService.ts`: `faculty_id` → `course_id`
- Any pages importing from `dashboard/faculty/` → `dashboard/courses/`

---

## Phase 7: Frontend (shadcnui app) + seed data + final sweep

### shadcnui changes
- `lib/api.ts`: Interface `Faculty` → `Course`, `facultiesApi` → `coursesApi`, response keys
- `lib/api-routes.ts`: `/api/content/faculty` → `/api/content/course`, `BY_FACULTY` → `BY_COURSE`
- `hooks/use-faculties.ts` → `hooks/use-courses.ts`: All refs
- `hooks/use-delete-with-undo.ts`: `"faculty"` type → `"course"`

### Seed data
- `Data/FacultyData.json` → `Data/CourseData.json`: Rename file + JSON key `faculty` → `course`

### Final sweep
- Grep entire codebase for any remaining `faculty` references
- Drop all DB tables and reseed
- Test all API endpoints end-to-end

---

## Execution per phase

For each phase:
1. Make code changes
2. Update that service's API.md
3. Drop and reseed DB
4. Run `npm run build` (or equivalent) to verify compilation
5. Spot-check affected API endpoints
