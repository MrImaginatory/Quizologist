import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASSWORD,
  {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: "postgres",
    //logging: env.NODE_ENV === "development" ? console.log : false,
    define: {
      timestamps: true,
      paranoid: true,
      underscored: true,
    },
  }
);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    await sequelize.sync({
      alter: env.DB_ALTER_TABLES ? { drop: false } : false,
      force: env.DB_DROP_TABLES,
    });
    console.log("Models synchronized.");
  } catch (error) {
    console.error("Unable to connect to database:", error);
    process.exit(1);
  }
};
