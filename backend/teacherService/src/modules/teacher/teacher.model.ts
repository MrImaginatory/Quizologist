import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Teacher extends Model {
  declare id: string;
  declare fname: string;
  declare lname: string;
  declare email: string;
  declare mobileNumber: string;
  declare role: "student" | "teacher" | "admin";
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Teacher.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "student", "teacher"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    mobileNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "User",
  }
);

export default Teacher;
