import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
// import "leaflet-routing-machine";
// import { OpenStreetMapProvider } from "leaflet-geosearch";
import { Icon, LatLngExpression } from "leaflet";
import { useContext } from "react";
import SelectedEmpsContext from "../context/SelectedEmpsContext";
import EmployeeTypes from "../types/EmployeeTypes";
import RoutingMachine from "../utils/RoutingMachine";

type MapTypes = {
  width?: string;
  height?: string;
  employees?: [EmployeeTypes];
  markersArray?: [any];
  activeDrivers?: EmployeeTypes[];
  SOS?: any;
  center?: LatLngExpression;
  zoom?: number;
  driverOnFocus?: any;
};

const MapComponent = ({
  width = "100%",
  height = "500px",
  employees,
  activeDrivers,
  SOS,
  center = [34.0836, 74.7973],
  zoom = 11,
  driverOnFocus,
}: MapTypes) => {
  // const [driversPosition, setDriversPosition] = useState<any>();

  const { selectedEmps } = useContext(SelectedEmpsContext);

  const rangreth = [33.996807, 74.79202];
  const zaira = [34.173415, 74.808653];

  const cabIcon = new Icon({
    iconUrl: "/images/cab-icon.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const empIcon = new Icon({
    iconUrl: "/images/icon-passenger.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  // const empIcon = (name: string) => {
  //   return {
  //     html: `<div>${name}</div>`,
  //     iconSize: [40, 40],
  //   };
  // };

  const officeIcon = new Icon({
    iconUrl: "/images/office-icon.png",
    iconSize: [40, 40], // specify the size of your icon
    iconAnchor: [20, 40],
  });

  function MapController() {
    //@ts-ignore
    const map = useMapEvents({
      //   click() {
      //     map.locate({ watch: true, enableHighAccuracy:true});
      //   },
      //   locationfound(e: any) {
      //     setPosition(e.latlng);
      //     map.flyTo(e.latlng, 17.5);
      //   },
    });
    return null;
  }

  return (
    <div style={{ position: "relative", height, width, overflow: "hidden" }}>
      {/* <button onClick={() => setPosition([34.0836, 74.7973])}>
          Click to change LOC
        </button> */}
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={driverOnFocus?.length ? driverOnFocus : center}
        zoom={zoom}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">Haseeb Qureshi</a>'
        />

        {/* {driversPosition && (
          <Marker icon={cabIcon} position={driversPosition} />
        )} */}

        {/* <Marker icon={officeIcon} position={[34.0837559, 74.8229426]} /> */}

        <MapController />

        {driverOnFocus?.length && (
          <Marker icon={cabIcon} position={driverOnFocus as LatLngExpression}>
            <Tooltip
              className="driver-tooltip"
              direction="top"
              offset={[0, -40]}
              permanent
            >
              <span>You</span>
            </Tooltip>
          </Marker>
        )}

        {activeDrivers &&
          activeDrivers?.length &&
          activeDrivers?.map((drivers) => {
            return (
              <Marker
                icon={cabIcon}
                key={drivers?.fname}
                position={drivers?.pickUp?.coordinates as LatLngExpression}
              >
                <Tooltip
                  className="driver-tooltip"
                  direction="top"
                  offset={[0, -40]}
                  permanent
                >
                  <span>{drivers.fname}</span>
                </Tooltip>
              </Marker>
            );
          })}

        {employees &&
          employees?.length >= 1 &&
          employees.map((employee: EmployeeTypes) => {
            return (
              <Marker
                icon={empIcon}
                key={employee?._id}
                position={employee?.pickUp?.coordinates as LatLngExpression}
              >
                <Tooltip
                  className="employee-tooltip"
                  direction="top"
                  offset={[0, -40]}
                  permanent
                >
                  <span>
                    {(employee?.fname)![0] + "." + " " + employee.lname!}
                  </span>
                </Tooltip>
              </Marker>
            );
          })}

        {SOS && (
          <Marker
            icon={empIcon}
            key={SOS?.name}
            position={SOS?.location as LatLngExpression}
          >
            <Tooltip
              className="employee-tooltip"
              direction="top"
              offset={[0, -40]}
              permanent
            >
              <span>{SOS.sosFrom}</span>
            </Tooltip>
          </Marker>
        )}

        {selectedEmps?.length && <RoutingMachine routes={[...selectedEmps]} />}

        {/* OFFICE ICONS */}
        {/* Rangreth */}
        <Marker
          icon={officeIcon}
          key={"rangrethOffice"}
          position={rangreth as LatLngExpression}
        >
          <Tooltip
            className="office-tooltip"
            direction="top"
            offset={[0, -40]}
            permanent
          >
            <span>{"Rangreth Office"}</span>
          </Tooltip>
        </Marker>
        {/* Zaira */}
        <Marker
          icon={officeIcon}
          key={"zairaTowersOffice"}
          position={zaira as LatLngExpression}
        >
          <Tooltip
            className="office-tooltip"
            direction="top"
            offset={[0, -40]}
            permanent
          >
            <span>{"Zaira Towers"}</span>
          </Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
