import EmployeeTypes from "./EmployeeTypes";

type UserAuthTypes = {
  email: EmployeeTypes["email"];
  password: EmployeeTypes["password"];
};

export default UserAuthTypes;
