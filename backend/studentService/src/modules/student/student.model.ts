import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Student extends Model {
  declare id: string;
  declare fname: string;
  declare lname: string;
  declare email: string;
  declare mobileNumber: string;
  declare password: string;
  declare role: "student" | "teacher" | "admin";
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      set(value: string) {
        this.setDataValue("fname", value.toLowerCase());
      },
    },
    lname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      set(value: string) {
        this.setDataValue("lname", value.toLowerCase());
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "student", "teacher"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value: string) {
        this.setDataValue("email", value.toLowerCase());
      },
    },
    mobileNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      set(value: string) {
        this.setDataValue("mobileNumber", value.toLowerCase());
      },
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
    indexes: [
      {
        unique: true,
        fields: ["email"],
        where: {
          deleted_at: null,
        },
      },
    ],
  }
);

export default Student;
