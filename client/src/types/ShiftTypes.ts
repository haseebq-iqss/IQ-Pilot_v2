import Cabtypes from "./CabTypes";
import EmployeeTypes from "./EmployeeTypes";

export type ShiftTypes = {
  id: string;
  typeOfRoute?: "pickup" | "drop";
  workLocation?: string;
  currentShift?: string;
  ref_coords?: [number];
  passengers?: EmployeeTypes[];
  cab?: Cabtypes;
};
