import { TimeBasedService } from "./src/modules/timeBased/timeBased.service";
import { connectDatabase } from "./src/config/database";

async function run() {
  await connectDatabase();
  try {
    await TimeBasedService.start({
      duration_minutes: 30,
      selections: [{ course_id: "00000000-0000-0000-0000-000000000000" }]
    }, "00000000-0000-0000-0000-000000000000");
  } catch (e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
  }
  process.exit(0);
}
run();
