import Course from "../course/course.model";
import Subject from "../subject/subject.model";
import Topic from "../topic/topic.model";
import { Op } from "sequelize";
import { BulkHierarchyInput } from "./bulk.validation";

export class BulkService {
  static async createHierarchy(data: BulkHierarchyInput) {
    const results = {
      coursesCreated: 0,
      subjectsCreated: 0,
      topicsCreated: 0,
    };

    for (const courseData of data.courses) {
      // Find or create course case-insensitively
      let course = await Course.findOne({
        where: { name: { [Op.iLike]: courseData.name } }
      });
      if (!course) {
        course = await Course.create({ name: courseData.name, description: "Auto-created during Excel import" });
        results.coursesCreated++;
      }

      for (const subjectData of courseData.subjects) {
        // Find or create subject within the course case-insensitively
        let subject = await Subject.findOne({
          where: { name: { [Op.iLike]: subjectData.name }, course_id: course.id }
        });
        if (!subject) {
          subject = await Subject.create({ name: subjectData.name, course_id: course.id, description: "Auto-created during Excel import" });
          results.subjectsCreated++;
        }

        for (const topicName of subjectData.topics) {
          // Find or create topic within the subject case-insensitively
          let topic = await Topic.findOne({
            where: { name: { [Op.iLike]: topicName }, subject_id: subject.id }
          });
          if (!topic) {
            topic = await Topic.create({ name: topicName, subject_id: subject.id, description: "Auto-created during Excel import" });
            results.topicsCreated++;
          }
        }
      }
    }

    return results;
  }
}
