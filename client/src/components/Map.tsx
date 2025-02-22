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
// import baseURL from "../utils/baseURL";
import {
  Close,
  Directions,
  Fullscreen,
  GpsFixed,
  Groups,
  LocationOff,
  People,
  Restore,
} from "@mui/icons-material";
import MapCenterUpdater from "./MapCenterUpdater";
import InterpolateLatLon from "../utils/LatLonAnimator";
import CalculateSpeed from "../utils/CalculateSpeedByCoordinates";
// import InterpolateActiveDrivers from "../utils/InterpolateActiveDrivers";
import CabJoinSound from "../assets/sounds/cab-joined.mp3";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import DefaultMapStyleContext from "../context/DefaultMapStyleContext";

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
  routePathArray?: [];
  highlightedEmployees?: [];
  clusterRadiusValue?: number;
  unrosteredTms?: [any];
  closeAction?: boolean;
  visibleEmployee?: EmployeeTypes;
  visibleOffice?: "All" | "Rangreth" | "Zaira Tower" | "Karanagar";
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
  routePathArray = [],
  highlightedEmployees = [],
  clusterRadiusValue = 75,
  unrosteredTms,
  visibleOffice = "All",
  closeAction = false,
  visibleEmployee,
}: MapTypes) => {
  // const [driversPosition, setDriversPosition] = useState<any>();

  // console.log(unrosteredTms);

  const navigate = useNavigate();
  const location = useLocation();

  const { userData }: UserContextTypes = useContext(UserDataContext);

  const { defaultMapStyle }: any = useContext(DefaultMapStyleContext);

  const { selectedEmps } = useContext(SelectedEmpsContext);
  const [mapDataView, setMapDataView] = useState<
    "TM-View" | "Routes-View" | "Unrostered-View"
  >("TM-View");
  const [viewUnrosteredTms, setViewUnrosteredTms] = useState<boolean>(false);

  // console.log(selectedEmps)
  const [routes, setRoutes] = useState<any>();
  const [rawRouteData, setRawRouteData] = useState<RouteTypes>();
  const [activeEmployees, setActiveEmployees] = useState<any>([]);
  const [cardOpen, setCardOpen] = useState<boolean>(false);
  const [empCard, setEmpCard] = useState<EmployeeTypes>();

  const rangreth = [34.00098208925866, 74.7934441780845];
  const zaira = [34.173415, 74.808653];
  const karanagar = [34.081357, 74.799716];
  const zirakpur = [30.633014690428567, 76.8251843278478];

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
        const res = await useAxios.get("/routes/todayRoute");
        setRawRouteData(res.data.todayRoute);
        const groupedCoordinates = res.data.todayRoute
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

  const [triggerCenterUpdate, setTriggerCenterUpdate] =
    useState<boolean>(false);

  useEffect(() => {
    if ((activeDrivers as [])?.length > 0) {
      // alert("New driver joined");
      PlaySound();
      setTriggerCenterUpdate(!triggerCenterUpdate);
      // console.log(activeDrivers[activeDrivers?.length - 1]?.location)
    }
  }, [activeDrivers?.length]);

  useEffect(() => {
    setTimeout(() => {
      setTriggerCenterUpdate(false);
    }, 5000);
  }, [triggerCenterUpdate]);

  const PlaySound = () => {
    const audio = new Audio(CabJoinSound);
    audio.play();
  };

  const [_positions, setPositions] = useState<Array<[number, number] | null>>([
    null,
    null,
  ]);
  const [animatedDriverOnFocus, setAnimatedDriverOnFocus] = useState<
    [number, number] | null
  >(null);

  const [currSpeed, setCurrSpeed] = useState<number>(0);

  useEffect(() => {
    if (driverOnFocus) {
      setPositions((prevPositions) => {
        // Update the array with the new position
        const newPositions = [...prevPositions.slice(-1), driverOnFocus];

        // If both previous and current positions are available, call interpolateLatLon
        if (newPositions[0] && newPositions[1]) {
          const interpolated = InterpolateLatLon(
            newPositions[0],
            newPositions[1]
          );

          // Calculate the speed
          setCurrSpeed(() => CalculateSpeed(newPositions[0], newPositions[1]));

          // Map over the interpolated values and set them to animatedDriverOnFocus with a delay of 50ms
          interpolated.forEach((point, index): any => {
            setTimeout(() => {
              setAnimatedDriverOnFocus(point as [number, number]);
            }, 50 * index);
          });
        }

        return newPositions;
      });
    }
  }, [driverOnFocus]);

  // DRIVERS LOCATION INTERPOLATION

  // console.log(
  //   "ACTIVE DRIVERS INTERPOLATION -------> ",
  //   activeDrivers?.length && InterpolateActiveDrivers(activeDrivers as any)
  //   );

  // const [mutatedDrivers, setMutatedDrivers] = useState<any>();
  // const [rawActiveDrivers, setRawActiveDrivers] = useState<any>([]);
  // const [dummyArr, setDummyArr] = useState<any>([]);

  // const DriverMutator = () => {
  //   rawActiveDrivers?.length &&
  //     rawActiveDrivers?.map((data: any) => {
  //       console.log("N 1 -> ", data[0]?.name, "N 2 -> ", data[1]?.name);
  //       console.log(
  //         "LOC 1 -> ",
  //         data[0]?.location,
  //         "LOC 2 -> ",
  //         data[1]?.location
  //       );

  //       const pushedDriverNames =
  //         mutatedDrivers?.length && mutatedDrivers.map(({ name }: any) => name);
  //       console.log(pushedDriverNames);

  //           if (pushedDriverNames?.length && !pushedDriverNames.includes(data[0]?.name)) {
  //             setDummyArr((prevDummy:any) => [
  //               ...prevDummy,
  //               {
  //                 name: data[0]?.name,
  //                 startLocation: data[0]?.location,
  //                 endLocation: data[1]?.location,
  //               }
  //             ])
  //           }

  //       console.log(dummyArr);

  //         setMutatedDrivers([
  //           ...dummyArr,
  //           {
  //             name: data[0]?.name,
  //             startLocation: data[0]?.location,
  //             endLocation: data[1]?.location,
  //           },
  //         ]);
  //     });
  // };

  // console.log(mutatedDrivers);

  // useEffect(() => {
  //   if (activeDrivers?.length) {
  //     if (rawActiveDrivers?.length < 2) {
  //       setRawActiveDrivers((prevDrivers: any) => [
  //         ...prevDrivers,
  //         activeDrivers,
  //       ]);
  //     } else {
  //       setRawActiveDrivers((prevDrivers: any) => [
  //         (prevDrivers[0] = prevDrivers[1]),
  //         (prevDrivers[1] = activeDrivers),
  //       ]);
  //     }
  //   }
  //   if (rawActiveDrivers?.length > 1) {
  //     DriverMutator();
  //   }
  // }, [activeDrivers]);

  // console.log(rawActiveDrivers);

  // const [startEndLocs, setStartEndLocs] = useState<any>([]);
  // const [activeDriversMod, setActiveDriversMod] = useState<any>();

  // useEffect(() => {
  //   if (activeDrivers?.length) {
  //     if (startEndLocs?.length < 2) {
  //       setStartEndLocs((prevArr: any) => [
  //         ...prevArr,
  //         (activeDrivers as any)[0]?.location,
  //       ]);
  //     } else {
  //       setStartEndLocs((prevArray: any) => [
  //         (prevArray[0] = prevArray[1]),
  //         (prevArray[1] = (activeDrivers as any)[0]?.location),
  //       ]);
  //     }
  //     if (startEndLocs?.length == 2) {
  //       setActiveDriversMod({
  //         name: (activeDrivers as any)?.name,
  //         startLocation: startEndLocs[0]?.location,
  //         endLocation: startEndLocs[1]?.location,
  //       });
  //     }
  //   }
  // }, [activeDrivers]);

  // console.log(
  //   startEndLocs.length >= 2 &&
  //     InterpolateLatLon(startEndLocs[0], startEndLocs[1])
  // );
  // console.log(activeDriversMod);

  return (
    <div style={{ position: "relative", height, width, overflow: "hidden" }}>
      <MapContainer
        id={"map"}
        // key={activeRoute.length ? "Primary Map" + Math.random() : "Primary Map"}
        className="fade-in"
        key={"Primary Map"}
        style={{ height: "100%", width: "100%" }}
        center={center}
        zoom={zoom}
      >
        {/* <div
          style={{
            position: "absolute",
            top: 50,
            right: 50,
            zIndex: 999,
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "background.default",
            color: "black",
            width: "100px",
            height: "100px",
            gap: "10px",
          }}
        ></div> */}
        {driverOnFocus?.length && (
          <MapCenterUpdater
            center={driverOnFocus?.length ? driverOnFocus : center}
          />
        )}
        {triggerCenterUpdate && (
          <MapCenterUpdater
            center={
              ((activeDrivers as [])[(activeDrivers as [])?.length - 1] as any)
                ?.location as LatLngExpression
            }
          />
        )}
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
          {/*Close  */}
          {closeAction && (
            <div
              onClick={() => navigate(-1)}
              // onClick={() => PlaySound()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "red",
                color: "white",
                padding: "7.5px 7.5px",
                borderRadius: "100px",
                border: "2.5px solid white",
                cursor: "pointer",
                gap: 10,

                // cursor:"grabbing"
              }}
            >
              <Close />
            </div>
          )}

          {/* Full Screen View */}
          {mode === "full-view" && (
            <div
              onClick={() => openFullscreen("map")}
              // onClick={() => PlaySound()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "black",
                color: "white",
                padding: "7.5px 7.5px",
                borderRadius: "100px",
                border: "2.5px solid white",
                cursor: "pointer",
                gap: 10,

                // cursor:"grabbing"
              }}
            >
              {/* <h3>Expand 📺</h3> */}
              <Fullscreen />
            </div>
          )}

          {mode === "full-view" && (
            <>
              <div
                onClick={() => {
                  setMapDataView(
                    mapDataView === "TM-View" ? "Routes-View" : "TM-View"
                  );
                  setViewUnrosteredTms(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "black",
                  color: "white",
                  padding: "7.5px 15px",
                  borderRadius: "100px",
                  border: "2.5px solid white",
                  cursor: "pointer",
                  gap: 10,

                  // cursor:"grabbing"
                }}
              >
                {mapDataView === "Routes-View" ? <Groups /> : <Directions />}
                <h3>
                  {" "}
                  {mapDataView === "Routes-View" ? "View TMs" : "View Routes"}
                </h3>
              </div>
              {/* Live Tracking */}
              <div
                onClick={() =>
                  navigate(
                    !location.pathname.includes("live-driver-tracking")
                      ? "live-driver-tracking"
                      : "/admin"
                  )
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "black",
                  color: "white",
                  padding: "7.5px 15px",
                  borderRadius: "100px",
                  border: "2.5px solid white",
                  cursor: "pointer",
                  gap: 10,

                  // cursor:"grabbing"
                }}
              >
                {!location.pathname.includes("live-driver-tracking") ? (
                  <GpsFixed />
                ) : (
                  <LocationOff />
                )}
                <h3
                  style={{
                    backgroundColor: "background.default",
                    borderRadius: 100,
                    padding: 1.5,
                  }}
                >
                  {/* {mapDataView === "Routes-View" ? "👨🏻‍💻" : "📌"} */}
                  {!location.pathname.includes("live-driver-tracking")
                    ? "Activate Live Tracking"
                    : "Disable Live Tracking"}
                </h3>
              </div>
              {/* Pending Passengers */}
              {mapDataView === "TM-View" && (
                <div
                  onClick={() => setViewUnrosteredTms(!viewUnrosteredTms)}
                  // onClick={() => PlaySound()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "black",
                    color: "white",
                    padding: "7.5px 15px",
                    borderRadius: "100px",
                    border: "2.5px solid white",
                    cursor: "pointer",
                    gap: 10,

                    // cursor:"grabbing"
                  }}
                >
                  <People />
                  <h3>{!viewUnrosteredTms ? "View Pending" : "View All"}</h3>
                </div>
              )}
            </>
          )}
          {/* Reset Routes View */}
          {activePolylineIndex != null && (
            <div
              onClick={() => setActivePolylineIndex(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "orange",
                color: "white",
                padding: "7.5px 15px",
                borderRadius: "100px",
                border: "2.5px solid white",
                cursor: "pointer",
                gap: 10,

                // cursor:"grabbing"
              }}
            >
              <Restore />
              <h3>RESET</h3>
            </div>
          )}
        </div>

        {/* Team Member Card */}
        {mode === "full-view" && cardOpen && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              zIndex: 999,
              width: "35%",
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "black",
              color: "white",
              padding: "15px",
              // gap:"25px",
              borderRadius: "10px",
            }}
          >
            <div
              style={{ display: "flex", gap: "10px", cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/admin/teamMemberProfile/${
                    empCard?.fname + "-" + empCard?.lname
                  }`,
                  { state: empCard }
                )
              }
            >
              <Avatar
                // src={
                //   baseURL + empCard?.profilePicture ||
                //   "/images/default_user.png"
                // }
                src={"/images/default_user.png"}
                sx={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              >
                {(empCard?.fname as any)[0]}
              </Avatar>
              <div>
                <h2 style={{ fontWeight: 500 }}>
                  {empCard?.fname + " " + empCard?.lname}
                </h2>
                <h3 style={{ fontWeight: 600 }}>{empCard?.department}</h3>
                <h4 style={{ fontWeight: 500 }}>{empCard?.pickUp?.address}</h4>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h4 style={{ fontWeight: 500 }}>{empCard?.phone}</h4>
                  <h4 style={{ fontWeight: 500, textDecoration: "underline" }}>
                    view profile
                  </h4>
                </div>
              </div>
            </div>
            <Close
              sx={{ cursor: "pointer" }}
              onClick={() => setCardOpen(false)}
            />
          </div>
        )}

        <TileLayer
          // url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png" // WORLD IMAGERY MAP  >>>REQUIRES DOMAIN SETUP<<<       --- MOST REALISTIC
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"   // VANILLA MAP STYLE
          // url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" // FRANCE HOT MAP         --- MOST CONSISTENT
          // url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png"   // SWISS MAP STYLE (SLOW TO LOAD)
          // url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"   // DUTCH MAP STYLE

          url={
            defaultMapStyle == "france-hot"
              ? "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              : defaultMapStyle == "swiss"
              ? "https://tile.osm.ch/switzerland/{z}/{x}/{y}.png"
              : defaultMapStyle == "dutch"
              ? "https://tile.openstreetmap.de/{z}/{x}/{y}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          // ---> PAID MAP TILES
          // url="https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=1c139e6291de42898b06158aeff2c60c"   // OPENCYCLE MAP STYLE      --- MOST BASIC
          // url="https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=1c139e6291de42898b06158aeff2c60c" // TRANSPORT MAP STYLE     --- MOST CLEAN
          // url="https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=1c139e6291de42898b06158aeff2c60c"   // LANDSCAPE STYLE
          // url="https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=1c139e6291de42898b06158aeff2c60c"   // OUTDOORS STYLE
          // url="https://tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=1c139e6291de42898b06158aeff2c60c"   // TRANSPORT DARK STYLE
          // url="https://tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=1c139e6291de42898b06158aeff2c60c"   // PIONEER STYLE     --- DESERT
          // url="https://tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=1c139e6291de42898b06158aeff2c60c"   // SPINAL MAP STYLE     --- HELL
          // url="https://tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=1c139e6291de42898b06158aeff2c60c"   // MOBILE ATLAS MAP STYLE     --- SKETCH STYLE
          // url="https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=1c139e6291de42898b06158aeff2c60c"   // ATLAS MAP STYLE
          // url="https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=1c139e6291de42898b06158aeff2c60c"   // NEIGHBOURHOOD MAP STYLE
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">Haseeb Qureshi</a>'
        />

        {/* {driversPosition && (
          <Marker icon={cabIcon} position={driversPosition} />
        )} */}

        {/* <Marker icon={officeIcon} position={[34.0837559, 74.8229426]} /> */}

        <MapController />

        {highlightedEmployees.length &&
          highlightedEmployees.map((emp: EmployeeTypes, index: number) => {
            return (
              <Circle
                key={index}
                center={emp?.pickUp?.coordinates as LatLngExpression}
                radius={250}
                fillOpacity={0.25}
                color={"red"}
                stroke={true}
              />
            );
          })}

        {driverOnFocus?.length &&
          animatedDriverOnFocus?.length &&
          !Number.isNaN(animatedDriverOnFocus[0]) && (
            <Marker
              icon={cabIcon}
              // position={animatedDriverOnFocus as LatLngExpression}  REMOVED DUE TO MISBEHAVIOUR AT VARYING SPEEDS.
              position={driverOnFocus as LatLngExpression}
            >
              <Tooltip
                className="driver-tooltip"
                direction="top"
                offset={[0, -40]}
                permanent
              >
                <span>You - {currSpeed.toFixed(1)}km/h</span>
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
                      ? [...route, [34.00098208925866, 74.7934441780845]]
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

        {routePathArray.length && (
          <Polyline
            key={Math.random() * 100}
            positions={routePathArray}
            color={"blue"}
            weight={5}
            // dashArray={[5]}
          />
        )}

        {activeRoute?.length && (
          <>
            {/* <Polyline
              key={Math.random() * 100}
              positions={activeRoute}
              color={"blue"}
              weight={3}
              dashArray={[5]}
            /> */}
            {activeRoute.map((emp: EmployeeTypes) => {
              return (
                <Marker
                  icon={empIcon}
                  key={emp?._id}
                  position={emp?.pickUp?.coordinates as LatLngExpression}
                >
                  <Tooltip
                    className="employee-tooltip"
                    direction="top"
                    offset={[0, -40]}
                    permanent
                  >
                    <span>
                      {emp.fname + " " + emp.lname}
                    </span>
                  </Tooltip>
                </Marker>
              );
            })}
          </>
        )}

        {visibleEmployee && (
          <Marker
            icon={empIcon}
            key={visibleEmployee?.lname}
            position={visibleEmployee?.pickUp?.coordinates as LatLngExpression}
          >
            <Tooltip
              className="employee-tooltip"
              direction="top"
              offset={[0, -40]}
              permanent
            >
              <span>{visibleEmployee.fname + " " + visibleEmployee.lname}</span>
            </Tooltip>
            <Circle
              key={visibleEmployee?.lname}
              center={visibleEmployee?.pickUp?.coordinates as LatLngExpression}
              radius={250}
              fillOpacity={0.25}
              // color={"rgb(26 135 244)"}
              color={"#9329fc"}
              stroke={true}
            />
          </Marker>
        )}

        {activeDrivers &&
          activeDrivers?.length &&
          activeDrivers?.map((drivers: any) => {
            return (
              <Marker
                icon={cabIcon}
                key={drivers?.fname ? drivers?.fname : drivers?.name}
                position={
                  (drivers?.pickUp
                    ? drivers?.pickUp?.coordinates
                    : drivers?.location) as LatLngExpression
                }
              >
                <Tooltip
                  className="driver-tooltip"
                  direction="top"
                  offset={[0, -40]}
                  permanent
                >
                  <span>
                    {drivers.fname ? drivers.fname : drivers.name} - (
                    {drivers?.speed?.toFixed(1)}km/h)
                  </span>
                </Tooltip>
              </Marker>
            );
          })}

        <MarkerClusterGroup
          maxClusterRadius={clusterRadiusValue}
          chunkedLoading
          animate
          spiderfyOnEveryZoom
          disableClusteringAtZoom={
            (employees as [EmployeeTypes])?.length < 10 ? 0 : 16
          }
          animateAddingMarkers
        >
          {employees &&
            !viewUnrosteredTms &&
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
              return activePolylineIndex === null ? (
                <Marker
                  eventHandlers={{
                    click: () => {
                      setEmpCard(employee);
                      setCardOpen(true);
                    },
                    //  mouseover: () => console.log(employee?.fname)
                  }}
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
                    eventHandlers={{
                      click: () => {
                        setEmpCard(employee);
                        setCardOpen(true);
                      },
                      //  mouseover: () => console.log(employee?.fname)
                    }}
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
        </MarkerClusterGroup>

        {/* UNROSTERED TMS */}
        {viewUnrosteredTms &&
          unrosteredTms &&
          unrosteredTms?.length > 1 &&
          unrosteredTms?.map((employee: EmployeeTypes) => {
            return (
              <Marker
                eventHandlers={{
                  click: () => {
                    setEmpCard(employee);
                    setCardOpen(true);
                  },
                  //  mouseover: () => console.log(employee?.fname)
                }}
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
        {visibleOffice === "All" ? (
          <>
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
            <Marker
              icon={officeIcon}
              key={"karanagarOffice"}
              position={karanagar as LatLngExpression}
            >
              <Tooltip
                className="office-tooltip"
                direction="top"
                offset={[0, -40]}
                permanent
              >
                <span>{"Karanagar Office"}</span>
              </Tooltip>
            </Marker>
            <Marker
              icon={officeIcon}
              key={"zirakpurOffice"}
              position={zirakpur as LatLngExpression}
            >
              <Tooltip
                className="office-tooltip"
                direction="top"
                offset={[0, -40]}
                permanent
              >
                <span>{"Zirakpur Office"}</span>
              </Tooltip>
            </Marker>
          </>
        ) : visibleOffice === "Rangreth" ? (
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
        ) : visibleOffice === "Zaira Tower" ? (
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
        ) : (
          <Marker
            icon={officeIcon}
            key={"karanagarOffice"}
            position={karanagar as LatLngExpression}
          >
            <Tooltip
              className="office-tooltip"
              direction="top"
              offset={[0, -40]}
              permanent
            >
              <span>{"Karanagar Office"}</span>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
