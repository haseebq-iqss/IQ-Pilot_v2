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
import { UserContextTypes } from "../types/UserContextTypes";
import UserDataContext from "../context/UserDataContext";

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
  mode?: "full-view" | "route-view";
  activeRoute?: any;
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
  mode = "full-view",
  activeRoute = [],
}: MapTypes) => {
  // const [driversPosition, setDriversPosition] = useState<any>();

  const { userData }: UserContextTypes = useContext(UserDataContext);

  const { selectedEmps } = useContext(SelectedEmpsContext);
  const [mapDataView, setMapDataView] = useState<"TM-View" | "Routes-View">(
    "TM-View"
  );
  // console.log(selectedEmps)
  const [routes, setRoutes] = useState<any>();
  const [rawRouteData, setRawRouteData] = useState<RouteTypes>();
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
    if (userData?.role === "admin") {
      (async () => {
        const res = await useAxios.get("/routes/currentDayRoutes");
        setRawRouteData(res.data.data);
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

        // console.log("GCOrd ->>>>>>",groupedCoordinates);
        setRoutes(groupedCoordinates);
      })();
    }
  }, []);

  // console.log("NEW -------> ", activeRoute)

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
      keydown: (e) => {
        FSOnScreen(String(e.originalEvent.code).slice(3, 4));
      },
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

  function openFullscreen(elId: string) {
    const root: HTMLElement | null = document.getElementById(elId);
    if (root) {
      if (
        !document.fullscreenElement &&
        !(document as any).mozFullScreenElement &&
        !(document as any).webkitFullscreenElement &&
        !(document as any).msFullscreenElement
      ) {
        if (root.requestFullscreen) {
          root.requestFullscreen();
        } else if ((root as any).mozRequestFullScreen) {
          /* Firefox */
          (root as any).mozRequestFullScreen();
        } else if ((root as any).webkitRequestFullscreen) {
          /* Chrome, Safari & Opera */
          (root as any).webkitRequestFullscreen();
        } else if ((root as any).msRequestFullscreen) {
          /* IE/Edge */
          (root as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          /* Firefox */
          (document as any).mozCancelFullScreen();
        } else if ((document as any).webkitExitFullscreen) {
          /* Chrome, Safari & Opera */
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          /* IE/Edge */
          (document as any).msExitFullscreen();
        }
      }
    }
  }

  function FSOnScreen(e: string) {
    if (e === "F") {
      openFullscreen("map");
    }
  }

  // console.log("center -----> ", center);

  return (
    <div style={{ position: "relative", height, width, overflow: "hidden" }}>
      <MapContainer
        id={"map"}
        key={activeRoute.length ? "Primary Map" + Math.random() : "Primary Map"}
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
          {mode === "full-view" && (
            <div
              onClick={() => openFullscreen("map")}
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
              <h3>Expand 📺</h3>
            </div>
          )}

          {mode === "full-view" && (
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
          )}
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
                  key={index + activePolylineIndex + Math.random() * 100}
                  positions={
                    (rawRouteData as unknown as [RouteTypes])[index]
                      .workLocation === "Rangreth"
                      ? [...route, [33.996807, 74.79202]]
                      : [...route, [34.173415, 74.808653]]
                  }
                  color={
                    activePolylineIndex === null ||
                    activePolylineIndex === index
                      ? generateDistinctColors(10)[index]
                      : "transparent"
                  }
                  dashArray={activePolylineIndex === index ? "15" : "none"}
                  weight={8}
                  eventHandlers={{
                    click: (e) => {
                      handleSetActivePolyline(index);
                      setActiveEmployees(
                        transformLatLngArray(e.target._latlngs)
                      );
                      // console.log(transformLatLngArray(e.target._latlngs));
                    },
                  }}
                />
                {activePolylineIndex === null ||
                  (activePolylineIndex === index &&
                    route.map((pickupPos: [number, number]) => {
                      return (
                        <Circle
                          key={index + Math.random() * 100}
                          center={pickupPos}
                          radius={200}
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
                              PICKUP
                            </span>
                          </Tooltip>
                        </Circle>
                      );
                    }))}
              </>
            );
          })}

        {activeRoute?.length && (
          <>
            <Polyline
              key={Math.random() * 100}
              positions={activeRoute}
              color={"blue"}
              weight={3}
              dashArray={[5]}
            />
            {activeRoute.map((empLoc: any) => {
              return (
                <Marker
                  icon={empIcon}
                  key={empLoc}
                  position={empLoc as LatLngExpression}
                />
              );
            })}
          </>
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
            const isCoordinatesIncluded = activeEmployees.some(
              (coord: [number, number]) => {
                const empCoord1 =
                  String(employee.pickUp?.coordinates[0]).length > 6
                    ? String(employee.pickUp?.coordinates[0]).slice(0, 6)
                    : String(employee.pickUp?.coordinates[0]).slice(0, 4);
                const empCoord2 =
                  String(employee.pickUp?.coordinates[1]).length > 6
                    ? String(employee.pickUp?.coordinates[1]).slice(0, 6)
                    : String(employee.pickUp?.coordinates[1]).slice(0, 4);

                const presentCoord1 =
                  String(coord[0]).length > 6
                    ? String(coord[0]).slice(0, 6)
                    : String(coord[0]).slice(0, 4);
                const presentCoord2 =
                  String(coord[1]).length > 6
                    ? String(coord[1]).slice(0, 6)
                    : String(coord[1]).slice(0, 4);
                if (
                  empCoord1 === presentCoord1 &&
                  empCoord2 === presentCoord2
                ) {
                  console.log(empCoord1, presentCoord1);
                }
                return (
                  empCoord1 === presentCoord1 && empCoord2 === presentCoord2
                );
              }
            );

            // console.log(isCoordinatesIncluded)

            return activePolylineIndex === null ? (
              <Marker
                icon={empIcon}
                key={employee?._id}
                position={employee?.pickUp?.coordinates as LatLngExpression}
              >
                <Tooltip
                  className="employee-tooltip"
                  key={employee?._id}
                  direction="top"
                  offset={[0, -40]}
                  permanent
                >
                  <span>
                    {employee?.fname! + " " + employee.lname![0] + "."}
                  </span>
                </Tooltip>
              </Marker>
            ) : (
              isCoordinatesIncluded && (
                <Marker
                  icon={empIcon}
                  key={employee?._id}
                  position={employee?.pickUp?.coordinates as LatLngExpression}
                >
                  <Tooltip
                    key={employee?._id}
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
            );
          })}

        {SOS && (
          <Marker
            icon={empIcon}
            key={SOS?.name}
            position={SOS?.location as LatLngExpression}
          >
            <Tooltip
              key={SOS?.name}
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
