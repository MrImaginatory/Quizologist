# Backend Services Audit Report

Generated: 2026-07-10

---

## 1. Raw SQL Query Detection

| Service | File Path | Query Method | Status |
|---------|-----------|--------------|--------|
| studentService | `studentService/src/modules/student/student.service.ts` | `sequelize.query()` with `QueryTypes.SELECT` | **NEEDS FIX** - Uses raw SQL for student list with enrollment filters |

**Details:** The `getStudentsWithFilters` method constructs SQL strings manually for counting and fetching students with enrollment joins. Should be converted to Sequelize ORM methods like `findAll`, `findAndCountAll`, and `include`.

---

## 2. API Documentation Status

| Service | File | Current | Missing Endpoints |
|---------|------|---------|-------------------|
| apiGateway | `apiGateway/API.md` | Partially updated | `/api/student/list` (admin-only filtered student listing) |
| studentService | `studentService/API.md` | Outdated | `GET /list` endpoint with faculty_id, subject_id, topic_id filters |
| userService | `userService/API.md` | Complete | None |
| contentService | `contentService/API.md` | Complete | None |
| questionService | `questionService/API.md` | Complete | None |
| testService | `testService/API.md` | Complete | None |

---

## 3. Issues Summary

### Critical (Must Fix)
1. **studentService/student.service.ts** - Raw SQL vulnerability and inconsistency
   - File: `E:\PrabhatTasks\test\QuizNew\backend\studentService\src\modules\student\student.service.ts`
   - Lines 1-70 use `sequelize.query()` instead of ORM methods

### Medium (Should Fix)
2. **studentService/API.md** - Missing documentation for new endpoint
   - File: `E:\PrabhatTasks\test\QuizNew\backend\studentService\API.md`
   - Does not document `GET /list` with filter parameters

3. **apiGateway/API.md** - Missing route documentation
   - File: `E:\PrabhatTasks\test\QuizNew\backend\apiGateway\API.md`
   - Does not document `/api/student/list` route

---

## 4. Files Requiring Changes

| Priority | File | Change Needed |
|----------|------|---------------|
| High | `backend/studentService/src/modules/student/student.service.ts` | Replace raw SQL with Sequelize ORM |
| Medium | `backend/studentService/API.md` | Add `GET /list` endpoint documentation |
| Medium | `backend/apiGateway/API.md` | Add `/api/student/list` route documentation |
