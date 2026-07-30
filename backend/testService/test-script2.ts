import { TimeBasedService } from "./src/modules/timeBased/timeBased.service";
import { connectDatabase } from "./src/config/database";
import Question from "./src/modules/question/question.model";

async function run() {
  await connectDatabase();
  try {
    const q = await Question.findOne({ raw: true });
    if (!q) {
      console.log("No questions exist");
      return;
    }
    console.log("Found question with course_id:", q.course_id);

    await TimeBasedService.start({
      duration_minutes: 30,
      selections: [{ course_id: q.course_id }]
    }, "00000000-0000-0000-0000-000000000000"); // assuming student logic works
  } catch (e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
  }
  process.exit(0);
}
run();
