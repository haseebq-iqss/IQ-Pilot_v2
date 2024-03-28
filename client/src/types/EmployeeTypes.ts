type EmployeeTypes = {
  id?: string;
  fName: string;
  lName: string;
  phone: number;
  email: string;
  role: "admin" | "employee" | "driver";
  password: string;
  profilePicture: string;
  department: string;
  pickup: [number, number];
  address: string;
  currentShift: string;
  workLocation: "Rangreth" | "Zaira Tower";
  isCabCancelled: boolean;
  leaveType: "pickup" | "drop" | "both";
  startTime: number;
  createdAt?: Date;
};

export default EmployeeTypes;
