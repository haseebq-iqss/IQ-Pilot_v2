import EmployeeTypes from "./EmployeeTypes";

export type UserContextTypes = {
  userData?: EmployeeTypes;
  setUserData?: React.Dispatch<React.SetStateAction<EmployeeTypes | undefined>>;
};
