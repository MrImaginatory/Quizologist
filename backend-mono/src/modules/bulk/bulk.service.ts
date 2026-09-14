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
      // Find or create course (case-insensitive)
      let [course, courseCreated] = await Course.findOrCreate({
        where: { name: { [Op.iLike]: courseData.name } },
        defaults: {
          name: courseData.name,
          description: courseData.description ?? "Auto-created during Excel import",
        },
      });
      if (courseCreated) results.coursesCreated++;

      for (const subjectData of courseData.subjects) {
        // Find or create subject within the course (case-insensitive)
        let [subject, subjectCreated] = await Subject.findOrCreate({
          where: { name: { [Op.iLike]: subjectData.name }, course_id: course.id },
          defaults: {
            name: subjectData.name,
            course_id: course.id,
            description: subjectData.description ?? "Auto-created during Excel import",
          },
        });
        if (subjectCreated) results.subjectsCreated++;

        for (const topicData of subjectData.topics) {
          const tName = typeof topicData === "string" ? topicData : topicData.name;
          const tDesc = typeof topicData === "string" ? undefined : topicData.description;

          let [_topic, topicCreated] = await Topic.findOrCreate({
            where: { name: { [Op.iLike]: tName }, subject_id: subject.id },
            defaults: {
              name: tName,
              subject_id: subject.id,
              description: tDesc ?? "Auto-created during Excel import",
            },
          });
          if (topicCreated) results.topicsCreated++;
        }
      }
    }

    return results;
  }
}
