import User from "../modules/user/user.model";
import Location from "../modules/location/location.model";

User.belongsTo(Location, { foreignKey: "location_id", as: "location" });
Location.hasMany(User, { foreignKey: "location_id", as: "users" });
