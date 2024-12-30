import EmployeeTypes from "./EmployeeTypes";

type Cabtypes = {
  _id?: string;
  cabDriver?: string | EmployeeTypes;
  cabNumber?: string;
  seatingCapacity?: number;
  numberPlate?: string;
  carModel?: string;
  carColor?: string;
  typeOfCab?: string;
  mileage?: number;
  androidSetup?: boolean;
  acInstalled?: boolean;
};

export default Cabtypes;
