type EmployeeTypes = {
  _id?: string;
  fName?: string;
  lName?: string;
  phone?: number;
  email?: string;
  role?: "admin" | "employee" | "driver";
  password?: string;
  profilePicture?: string;
  department?: string;
  pickup?: {
    type: "Point";
    coordiantes: [number, number];
    address: string;
    _id?: string;
  };
  address?: string;
  currentShift?: string;
  workLocation?: "Rangreth" | "Zaira Tower";
  isCabCancelled?: {
    leaveType?: "pickup" | "drop" | "both" | number;
    startTime?: number;
  };
  createdAt?: Date;
};

export default EmployeeTypes;
