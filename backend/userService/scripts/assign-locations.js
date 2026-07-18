const { Sequelize } = require("sequelize");
const path = require("path");
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

// Indian cities for random assignment
const CITIES = [
  { city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400001" },
  { city: "Delhi", state: "Delhi", country: "India", pincode: "110001" },
  { city: "Bangalore", state: "Karnataka", country: "India", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", country: "India", pincode: "600001" },
  { city: "Kolkata", state: "West Bengal", country: "India", pincode: "700001" },
  { city: "Hyderabad", state: "Telangana", country: "India", pincode: "500001" },
  { city: "Pune", state: "Maharashtra", country: "India", pincode: "411001" },
  { city: "Ahmedabad", state: "Gujarat", country: "India", pincode: "380001" },
  { city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302001" },
  { city: "Lucknow", state: "Uttar Pradesh", country: "India", pincode: "226001" },
  { city: "Kanpur", state: "Uttar Pradesh", country: "India", pincode: "208001" },
  { city: "Nagpur", state: "Maharashtra", country: "India", pincode: "440001" },
  { city: "Indore", state: "Madhya Pradesh", country: "India", pincode: "452001" },
  { city: "Thane", state: "Maharashtra", country: "India", pincode: "400601" },
  { city: "Bhopal", state: "Madhya Pradesh", country: "India", pincode: "462001" },
  { city: "Visakhapatnam", state: "Andhra Pradesh", country: "India", pincode: "530001" },
  { city: "Patna", state: "Bihar", country: "India", pincode: "800001" },
  { city: "Vadodara", state: "Gujarat", country: "India", pincode: "390001" },
  { city: "Surat", state: "Gujarat", country: "India", pincode: "395001" },
  { city: "Coimbatore", state: "Tamil Nadu", country: "India", pincode: "641001" },
];

function getRandomCity() {
  return CITIES[Math.floor(Math.random() * CITIES.length)];
}

async function assignLocations() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Get all users (students and teachers)
    const [users] = await sequelize.query(
      `SELECT id, role FROM users WHERE role IN ('student', 'teacher') AND deleted_at IS NULL`
    );

    console.log(`Found ${users.length} users (students and teachers)`);

    // Get existing locations
    const [locations] = await sequelize.query(`SELECT id FROM locations`);
    console.log(`Found ${locations.length} existing locations`);

    if (locations.length === 0) {
      console.log("No locations found. Creating locations first...");

      // Create locations
      for (const city of CITIES) {
        await sequelize.query(
          `INSERT INTO locations (id, address_line_1, city, pincode, state, country, is_central, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, false, NOW(), NOW())`,
          { bind: [`${city.city} Main Office`, city.city, city.pincode, city.state, city.country] }
        );
      }
      console.log(`Created ${CITIES.length} locations`);

      // Re-fetch locations
      const [newLocations] = await sequelize.query(`SELECT id FROM locations`);
      locations.length = 0;
      locations.push(...newLocations);
    }

    // Assign random locations to users
    let assigned = 0;
    for (const user of users) {
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      await sequelize.query(
        `UPDATE users SET location_id = $1, updated_at = NOW() WHERE id = $2`,
        { bind: [randomLocation.id, user.id] }
      );
      assigned++;
    }

    console.log(`Successfully assigned locations to ${assigned} users`);
    console.log("Done!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

assignLocations();
