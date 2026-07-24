const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || "quizologist_database",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "root",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    dialect: "postgres",
    logging: false,
  }
);

// Load location data from JSON
const JSON_PATH = path.join(__dirname, "../../../Data/JkShahLocations_formatted.json");

async function importLocations() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.\n");

    // Read JSON file
    if (!fs.existsSync(JSON_PATH)) {
      console.error(`JSON file not found: ${JSON_PATH}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(JSON_PATH, "utf-8");
    const locations = JSON.parse(rawData);

    console.log(`Found ${locations.length} locations to import\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const loc of locations) {
      try {
        // Check if location already exists (by address_line_1 + city + pincode)
        const [existing] = await sequelize.query(
          `SELECT id FROM locations 
           WHERE LOWER(address_line_1) = LOWER($1) 
           AND LOWER(city) = LOWER($2) 
           AND pincode = $3 
           AND deleted_at IS NULL`,
          { bind: [loc.address_line_1, loc.city, loc.pincode] }
        );

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Insert new location
        await sequelize.query(
          `INSERT INTO locations (
            id, address_line_1, address_line_2, landmark, 
            city, pincode, state, country, 
            is_central, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, 
            $4, $5, $6, $7, 
            false, NOW(), NOW()
          )`,
          {
            bind: [
              loc.address_line_1 || "",
              loc.address_line_2 || "",
              loc.landmark || "",
              loc.city,
              loc.pincode,
              loc.state,
              loc.country || "India",
            ],
          }
        );

        created++;

        // Progress indicator
        if (created % 10 === 0) {
          console.log(`  Progress: ${created} created, ${skipped} skipped...`);
        }
      } catch (err) {
        errors++;
        console.error(`  Error importing location: ${loc.address_line_1}, ${loc.city}`);
        console.error(`    ${err.message}`);
      }
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log("IMPORT SUMMARY");
    console.log(`  Created:  ${created}`);
    console.log(`  Skipped:  ${skipped} (already exists)`);
    console.log(`  Errors:   ${errors}`);
    console.log(`${"=".repeat(50)}`);
    console.log("\nDone!");
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    await sequelize.close();
  }
}

importLocations();
