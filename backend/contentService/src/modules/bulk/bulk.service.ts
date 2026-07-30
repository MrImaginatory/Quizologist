import Course from "../course/course.model";
import Subject from "../subject/subject.model";
import Topic from "../topic/topic.model";
import { BulkHierarchyInput } from "./bulk.validation";

export class BulkService {
  static async createHierarchy(data: BulkHierarchyInput) {
    const results = {
      coursesCreated: 0,
      subjectsCreated: 0,
      topicsCreated: 0,
    };

    for (const courseData of data.courses) {
      // Find or create course
      const [course, courseCreated] = await Course.findOrCreate({
        where: { name: courseData.name },
        defaults: { name: courseData.name, description: "Auto-created during Excel import" }
      });
      if (courseCreated) results.coursesCreated++;

      for (const subjectData of courseData.subjects) {
        // Find or create subject within the course
        const [subject, subjectCreated] = await Subject.findOrCreate({
          where: { name: subjectData.name, course_id: course.id },
          defaults: { name: subjectData.name, course_id: course.id, description: "Auto-created during Excel import" }
        });
        if (subjectCreated) results.subjectsCreated++;

        for (const topicName of subjectData.topics) {
          // Find or create topic within the subject
          const [topic, topicCreated] = await Topic.findOrCreate({
            where: { name: topicName, subject_id: subject.id },
            defaults: { name: topicName, subject_id: subject.id, description: "Auto-created during Excel import" }
          });
          if (topicCreated) results.topicsCreated++;
        }
      }
    }

    return results;
  }
}
