import "leaflet/dist/leaflet.css";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
// import "leaflet-routing-machine";
// import { OpenStreetMapProvider } from "leaflet-geosearch";
import { Icon, LatLngExpression } from "leaflet";
import { useContext, useEffect, useState } from "react";
import SelectedEmpsContext from "../context/SelectedEmpsContext";
import RoutingMachine from "../utils/RoutingMachine";
import useAxios from "../api/useAxios";
import RouteTypes from "../types/RouteTypes";
import EmployeeTypes from "./../types/EmployeeTypes";

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
  center = [34.071635, 74.803872],
  zoom = 14,
  driverOnFocus,
}: MapTypes) => {
  // const [driversPosition, setDriversPosition] = useState<any>();

  const { selectedEmps } = useContext(SelectedEmpsContext);
  const [mapDataView, setMapDataView] = useState<"TM-View" | "Routes-View">(
    "TM-View"
  );
  const [routes, setRoutes] = useState<any>();
  const [activeEmployees, setActiveEmployees] = useState<any>([]);

  const rangreth = [33.996807, 74.79202];
  const zaira = [34.173415, 74.808653];

  const generateDistinctColors = (count: number) => {
    const colors = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
      const hue = (hueStep * i) % 360;
      const saturation = 100;
      const lightness = 25 + Math.random() * 50; // Adjust the range to generate darker or lighter colors
      const color = `hsl(${hue},${saturation}%,${lightness}%)`;
      colors.push(color);
    }

    return colors;
  };

  useEffect(() => {
    (async () => {
      const res = await useAxios.get("/routes");
      const groupedCoordinates = res.data.data
        ?.map((route: RouteTypes) =>
          route.passengers?.map(
            (employee: any) => employee?.pickUp?.coordinates
          )
        )
        .reduce((acc: any, coordinatesArray: any) => {
          acc.push(coordinatesArray);
          return acc;
        }, []);

      setRoutes(groupedCoordinates);
    })();
  }, []);

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

  const officeIcon = new Icon({
    iconUrl: "/images/office-icon.png",
    iconSize: [40, 40], // specify the size of your icon
    iconAnchor: [20, 40],
  });

  function MapController() {
    //@ts-ignore
    const map = useMapEvents({
    });
    return null;
  }

  const [activePolylineIndex, setActivePolylineIndex] = useState<any>(null);

  const handleSetActivePolyline = (index: any) => {
    setActivePolylineIndex(index);
  };

  function transformLatLngArray(latLngArray: [any]) {
    return latLngArray.map(({ lat, lng }) => [
      Number(lat.toFixed(5)),
      Number(lng.toFixed(5)),
    ]);
  }

  return (
    <div style={{ position: "relative", height, width, overflow: "hidden" }}>
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={driverOnFocus?.length ? driverOnFocus : center}
        zoom={zoom}
      >
        {/* OPTIONS BAR */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 999,
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {/* TMs and Routes View */}
          <div
            onClick={() =>
              setMapDataView(
                mapDataView === "TM-View" ? "Routes-View" : "TM-View"
              )
            }
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#2997FC",
              color: "white",
              padding: "7.5px 15px",
              borderRadius: "100px",
              border: "2.5px solid white",
              gap: 10,

              // cursor:"grabbing"
            }}
          >
            <h3
              style={{
                backgroundColor: "white",
                borderRadius: 100,
                padding: 1.5,
              }}
            >
              {mapDataView === "Routes-View" ? "📌" : "👨🏻‍💻"}
            </h3>
            <h3>
              {" "}
              {mapDataView === "Routes-View"
                ? "Routes View"
                : "Team Members View"}
            </h3>
          </div>
          {/* Reset Routes View */}
          {activePolylineIndex != null && (
            <div
              onClick={() => setActivePolylineIndex(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#2997FC",
                color: "white",
                padding: "7.5px 15px",
                borderRadius: "100px",
                border: "2.5px solid white",
                gap: 10,

                // cursor:"grabbing"
              }}
            >
              <h3
                style={{
                  backgroundColor: "white",
                  borderRadius: 100,
                  padding: 1.5,
                }}
              >
                ♻️
              </h3>
              <h3>RESET</h3>
            </div>
          )}
        </div>

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

        {mapDataView === "Routes-View" &&
          routes &&
          routes?.map((route: any, index: number) => {
            return (
              <>
                <Polyline
                  key={index + activePolylineIndex} // Change the key here
                  positions={route}
                  color={
                    activePolylineIndex === null ||
                    activePolylineIndex === index
                      ? generateDistinctColors(10)[index]
                      : "transparent"
                  }
                  weight={8}
                  eventHandlers={{
                    click: (e) => {
                      handleSetActivePolyline(index);
                      setActiveEmployees(
                        transformLatLngArray(e.target._latlngs)
                      );
                      console.log(transformLatLngArray(e.target._latlngs));
                    },
                  }}
                />
                <Circle
                  center={route[0]}
                  radius={100}
                  fillOpacity={0.4}
                  color={generateDistinctColors(10)[index]}
                >
                  <Tooltip className="start-tooltip" permanent>
                    <span
                      style={{
                        color: "black",
                        fontWeight: 700,
                        textShadow:
                          "1px 1px 0px #fff, 1px 1px 0px rgba(0,0,0,0.15)",
                      }}
                    >
                      START
                    </span>
                  </Tooltip>
                </Circle>
                <Circle
                  center={route[route?.length - 1]}
                  radius={100}
                  fillOpacity={0.4}
                  color={generateDistinctColors(10)[index]}
                >
                  <Tooltip className="end-tooltip" permanent>
                    <span
                      style={{
                        color: "black",
                        fontWeight: 700,
                        textShadow:
                          "1px 1px 0px #fff, 1px 1px 0px rgba(0,0,0,0.15)",
                      }}
                    >
                      END
                    </span>
                  </Tooltip>
                </Circle>
              </>
            );
          })}

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
            // const isCoordinatesIncluded = activeEmployees.find(
            //   (employeeCord: any) =>
            //     JSON.stringify(employeeCord) ===
            //     JSON.stringify(employee?.pickUp?.coordinates)
            // );

            // console.log(isCoordinatesIncluded);

            return (
              // activePolylineIndex === null && isCoordinatesIncluded && (
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
                      {employee?.fname! + " " + employee.lname![0] + "."}
                    </span>
                  </Tooltip>
                </Marker>
              )
            // );
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
