import EmployeeTypes from "./EmployeeTypes";
import routeStatusTypes from "./RouteStatusTypes";

type RouteTypes = {
  _id?: string;
  cab?: string;
  passengers?: Array<EmployeeTypes | string>;
  shiftTime?: string;
  shiftDate?: Date;
  typeOfRoute?: "pickup" | "drop" | "supply";
  estimatedTime?: number;
  cabPath?: Array<Array<number>>; /// cabPath = [ [32.123123, 75.342423], [32.123123, 75.342423], [32.123123, 75.342423],][32.123123, 75.342423],
  routeStatus: routeStatusTypes;
  totalDistance?: number;
  createdAt?: Date;
};

export default RouteTypes;
