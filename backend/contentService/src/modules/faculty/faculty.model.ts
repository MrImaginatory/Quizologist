import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";
import { FacultyAttributes } from "../../types";

type FacultyCreationAttributes = Optional<
  FacultyAttributes,
  "id" | "description" | "createdAt" | "updatedAt" | "deletedAt"
>;

class Faculty
  extends Model<FacultyAttributes, FacultyCreationAttributes>
  implements FacultyAttributes
{
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Faculty.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      set(value: string) {
        this.setDataValue("name", value.toLowerCase());
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "faculties",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Faculty",
  }
);

export default Faculty;
