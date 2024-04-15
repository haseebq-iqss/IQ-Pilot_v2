import EmployeeTypes from "./EmployeeTypes";

type Cabtypes = {
  _id: string;
  cabDriver: string | EmployeeTypes;
  cabNumber: string;
  seatingCapacity: number;
  numberPlate: string;
  carModel: string;
  carColor: string;
};

export default Cabtypes;
