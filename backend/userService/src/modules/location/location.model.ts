import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";
import { LocationAttributes } from "../../types";

type LocationCreationAttributes = Optional<
  LocationAttributes,
  "id" | "address_line_2" | "landmark" | "is_central" | "createdAt" | "updatedAt" | "deletedAt"
>;

class Location
  extends Model<LocationAttributes, LocationCreationAttributes>
  implements LocationAttributes
{
  declare id: string;
  declare address_line_1: string;
  declare address_line_2: string | null;
  declare landmark: string | null;
  declare city: string;
  declare pincode: string;
  declare state: string;
  declare country: string;
  declare is_central: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Location.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    address_line_1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address_line_2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    landmark: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "India",
    },
    is_central: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "locations",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Location",
  }
);

export default Location;
