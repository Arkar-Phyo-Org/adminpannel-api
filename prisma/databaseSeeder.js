const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../src/config");
const { hashedPassword } = require("../src/helpers");

const UserSeeder = {
  name: "Super Admin",
  email: ADMIN_EMAIL,
  password: hashedPassword(ADMIN_PASSWORD),
  passwordOption: "default",
  passwordReset: 1,
  phoneNumber: "09789506439",
  role: "super_admin",
};

module.exports = { UserSeeder };
