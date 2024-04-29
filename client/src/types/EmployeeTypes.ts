type EmployeeTypes = {
  _id?: string;
  fname?: string;
  lname?: string;
  phone?: number;
  email?: string;
  role?: "admin" | "employee" | "driver";
  password?: string;
  profilePicture?: string;
  department?: string;
  pickUp?: {
    // type: "Point";
    coordinates: [number, number];
    address: string;
    _id?: string;
  };
  address?: string;
  currentShift?: string;
  workLocation?: string;
  isCabCancelled?: {
    leaveType?: "pickup" | "drop" | "both" | number;
    startTime?: number | null;
  };
  createdAt?: Date;
};

export default EmployeeTypes;
