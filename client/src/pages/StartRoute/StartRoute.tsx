// @ts-nocheck
import {
  Call,
  Close,
  Done,
  Hail,
  Route,
  WrongLocation,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  LinearProgress,
  Modal,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { LatLngExpression } from "leaflet";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import useAxios from "../../api/useAxios";
import MapComponent from "../../components/Map";
import SelectedEmpsContext from "../../context/SelectedEmpsContext";
import SnackbarContext from "../../context/SnackbarContext";
import UserDataContext from "../../context/UserDataContext";
import RouteTypes from "../../types/RouteTypes";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import baseURL from "../../utils/baseURL";
import EmployeeTypes from "../../types/EmployeeTypes";
import { UserContextTypes } from "../../types/UserContextTypes";
import GetOfficeCoordinates from "../../utils/OfficeCoordinates";
import AttendanceTypes from "../../types/AttendanceTypes";
import { ColFlex, RowFlex } from "./../../style_extentions/Flex";
import useTimer from "../../hooks/useTimer";
import useLocalStorage from "../../hooks/useLocalStorage";

type modalPropTypes = {
  openModal: boolean;
  currentPassenger?: EmployeeTypes;
};

const socket = io(baseURL);

function StartRoute() {
  const location = useLocation();
  const route: RouteTypes = location.state;

  const { setItem, getItem, deleteItem, clearLs } = useLocalStorage<String>();

  const { userData }: UserContextTypes = useContext(UserDataContext);

  const [myLocation, setMyLocation] = useState<Array<number>>([]);

  const [startTimer, getElapsedTime] = useTimer();
  const [actionUpdater, setActionUpdater] = useState<number>(0);
  setInterval(() => {
    setActionUpdater((prevActionNumber: number) => prevActionNumber + 1);
  }, 3000);

  const savedElapsedTime = localStorage.getItem("elapsedTime");
  useEffect(() => {
    startTimer(
      savedElapsedTime != undefined && savedElapsedTime > 0 && savedElapsedTime
    );
  }, []);

  useEffect(() => {
    if (getElapsedTime() > savedElapsedTime && UpdateRouteStatus != "success") {
      localStorage.setItem("elapsedTime", getElapsedTime());
    }
  }, [actionUpdater]);

  useEffect(() => {
    if (myLocation.length == 2) {
      console.log(myLocation);
      const driverData = {
        name: userData?.fname[0] + ". " + userData?.lname,
        location: myLocation,
      };

      console.log(myLocation);

      socket.emit("live-drivers", driverData);
    }
  }, [socket, myLocation]);

  useEffect(() => {
    if (userData?.role === "driver") {
      // navigator.geolocation.getCurrentPosition(() => {
      //   // setDriversPosition([pos.coords.latitude, pos.coords.longitude]);
      //   console.log("Permission granted");
      // });

      // MAKE AN ERROR ALERT IF THE PERMISSION WAS REJECTED!

      // ASK FOR THE LOCATION PERMISSION FIRST !

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // console.log("new pos : ",pos.coords);
          setMyLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error.message);
        },
        {
          enableHighAccuracy: true,
          // timeout: 5000,
          maximumAge: 0,
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const { setSelectedEmps } = useContext(SelectedEmpsContext);

  // const [selectedPassengers, setSelectedPassengers] = useState<
  //   Array<UserTypes>
  // >([]);

  //   console.log(route);

  useEffect(() => {
    const passengersLLs = route?.passengers;
    console.log(route);

    if (passengersLLs) {
      const passengersLatLons: string[] = passengersLLs.map(
        (passenger: any) => passenger.pickUp.coordinates
      );
      console.log(passengersLatLons);
      // passengers?.workLocation
      setSelectedEmps([
        ...passengersLatLons,
        GetOfficeCoordinates((passengersLLs[0] as any)?.workLocation),
      ]);
    }

    // const employeesLatLons: any = route?.passengers?.map(
    //   (passenger: UserTypes) => passenger?.pickup
    // );
    // setSelectedPassengers(employeesLatLons);
    // console.log(employeesLatLons);
  }, []);

  //   const { userData, setUserData }: UserContextTypes =
  //     useContext(UserDataContext);

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const [markedPassengersArray, setMarkedPassengersArray] = useState<
    Array<object>
  >([]);
  const navigate = useNavigate();

  const [modalProps, setModalProps] = useState<modalPropTypes>({
    openModal: false,
  });

  const handleModalOpen = (passenger: EmployeeTypes) => {
    setModalProps({
      openModal: true,
      currentPassenger: passenger,
    });
    console.log("Modal Updated!");
  };

  const markAttendanceMF = (attendanceData: AttendanceTypes) => {
    return useAxios.post("attendances", attendanceData);
  };

  const MarkEmployeePresent = () => {
    return HandleCreateAttendance(true);
  };

  const MarkEmployeeAbsent = () => {
    return HandleCreateAttendance(false);
  };

  const updateRouteStatus = () => {
    return useAxios.patch(`routes/${route?._id}`, {
      routeStatus: "completed",
      estimatedTime: getElapsedTime()?.toFixed(3),
      totalDistance: calculatedDistance?.toFixed(3),
      cabPath: routePathArray,
      // fuelConsumed: ((route?.totalDistance as number) / 15).toFixed(2),
    });
  };

  const { mutate: UpdateRoute, status: UpdateRouteStatus } = useMutation({
    mutationFn: updateRouteStatus,
    onSuccess: (data) => {
      deleteItem("CurrentRoute");
      deleteItem("elapsedTime");
      deleteItem("markedPassengers");
      console.log({
        routeStatus: "completed",
        estimatedTime: getElapsedTime()?.toFixed(3),
        totalDistance: calculatedDistance?.toFixed(3),
        cabPath: routePathArray,
      });
      setOpenSnack({
        open: true,
        message: `Route successfully completed!`,
        severity: "success",
      });
      navigate("/driver/routeCompleted", { state: data.data?.updated_route });
    },
  });

  window.onpopstate = (event) => {
    alert(
      "You are Abandoning this route! Please continue this route from the Homepage."
    );
    // console.log(currentLocation, location.state)
    // navigate("/admin/createShift", {state: location.state})
  };
  const [artificialDelay, setArtificialDelay] = useState<boolean>(false);

  function HandleCompleteRoute() {
    console.log({
      estimatedTime: getElapsedTime(),
      totalDistance: calculatedDistance,
      cabPath: routePathArray,
    });
    // alert(`time: ${getElapsedTime()}, dist: ${(calculatedDistance)?.toFixed(3)}, cabPath:${routePathArray}`)
    if (route?.passengers?.length <= markedPassengersArray.length) {
      setArtificialDelay(true);
      setTimeout(() => {
        UpdateRoute();
      }, 1000);
    } else {
      console.log(markedPassengersArray);
      setOpenSnack({
        open: true,
        message: "Please mark all passengers first!",
      });
    }
  }

  useEffect(() => {
    const storedMarkedPassengersArray =
      localStorage.getItem("markedPassengers");
    if (storedMarkedPassengersArray?.length) {
      setMarkedPassengersArray(JSON.parse(storedMarkedPassengersArray));
      console.log(storedMarkedPassengersArray);
      console.log(markedPassengersArray);
    }
  }, []);

  const { mutate: markAttendance } = useMutation({
    mutationFn: markAttendanceMF,
    onSuccess(data) {
      // console.log(data.data);
      // console.log(data.data.attendance);
      setModalProps({
        openModal: false,
      });
      setOpenSnack({
        open: true,
        message: `Attendance Marked for ${modalProps?.currentPassenger?.fname}`,
        severity: "success",
      });
      setMarkedPassengersArray((prevPassengers) => [
        ...prevPassengers,
        {
          passenger: data.data?.attendance?.ofEmployee,
          isPresent: data.data?.attendance?.isPresent,
        },
      ]);
    },
  });

  useEffect(() => {
    const storedMarkedPassengersArray =
      localStorage.getItem("markedPassengers");
    if (markedPassengersArray?.length) {
      localStorage.setItem(
        "markedPassengers",
        JSON.stringify(markedPassengersArray)
      );
    }
  }, [markedPassengersArray]);

  useEffect(() => {
    // console.log(markedPassengersArray);
    // Pull RoutePath if exits already in LS
    const lastRoutePath = localStorage.getItem("CurrentRoute");
    if (lastRoutePath?.length) {
      console.log("Previous Path exists");
      console.log(JSON.parse(lastRoutePath));
      setRoutePathArray(JSON.parse(lastRoutePath));
    }
  }, []);

  const isAttendanceMarked = (pid: string) => {
    let isMarked: any =
      markedPassengersArray.length &&
      markedPassengersArray.filter(
        (passenger: any) => passenger.passenger === pid
      );
    if (isMarked[0]?.isPresent === true) {
      isMarked = true;
    } else if (isMarked[0]?.isPresent === false) {
      isMarked = false;
    } else {
      isMarked = null;
    }
    //   console.log(isMarked)
    return isMarked;
  };

  function HandleCreateAttendance(isPresent: boolean) {
    const attendanceData: AttendanceTypes = {
      ofEmployee: modalProps?.currentPassenger?._id as any,
      isPresent: isPresent,
      ofRoute: route?._id as string,
      // Driver: route?.driver as any,
    };
    console.log(attendanceData);
    markAttendance(attendanceData);
  }

  const [calculatedDistance, setCalculatedDistance] = useState<number>();
  const [extractedCoords, setExtractedCoords] = useState<Array<number>>();
  const [routePathArray, setRoutePathArray] = useState<Array<Array<number>>>(
    []
  );

  // ORIGINAL
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     navigator.geolocation.watchPosition((pos) => {
  //       // setExtractedCoords([pos.coords.latitude, pos.coords.longitude]);
  //       setRoutePathArray((prevPoints) => [
  //         ...prevPoints,
  //         [pos.coords.latitude, pos.coords.longitude],
  //       ]);
  //       if (UpdateRouteStatus != "success") {
  //         localStorage.setItem("CurrentRoute", JSON.stringify(routePathArray));
  //       }
  //       return null
  //     });
  //   }, 3000);

  //   // Cleanup interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, [getElapsedTime()]);

  // T2
  // useEffect(() => {
  //   if (myLocation?.length > 1) {
  //     setRoutePathArray((prevPoints) => {
  //       const newRoutePathArray = [...prevPoints, myLocation];
  //       if (UpdateRouteStatus !== "success") {
  //         localStorage.setItem(
  //           "CurrentRoute",
  //           JSON.stringify(newRoutePathArray)
  //         );
  //       }
  //       console.log(myLocation);
  //       return newRoutePathArray;
  //     });
  //   }
  //   //   return () => clearInterval(intervalId);
  // }, [myLocation]);

  useEffect(() => {
    const locAtCurrMoment = navigator.geolocation.getCurrentPosition((pos) => {
      setRoutePathArray((prevPoints) => [
        ...prevPoints,
        [pos.coords.latitude, pos.coords.longitude],
      ]);
      if (UpdateRouteStatus !== "success") {
        localStorage.setItem("CurrentRoute", JSON.stringify(routePathArray));
      }
      console.log(myLocation);
    });
  }, [getElapsedTime()]);

  type Coordinates = [number, number];

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const haversineDistance = (
    coord1: Coordinates,
    coord2: Coordinates
  ): number => {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  };

  const sumDistances = (coords: Array<any>): number => {
    let totalDistance = 0;

    for (let i = 0; i < coords.length - 1; i++) {
      if (haversineDistance(coords[i], coords[i + 1]) > 0.002) {
        totalDistance += haversineDistance(coords[i], coords[i + 1]);
      }
    }

    return totalDistance;
  };

  useEffect(() => {
    setCalculatedDistance(sumDistances(routePathArray));
  }, [routePathArray]);

  return (
    <Box
      sx={{
        ...ColFlex,
        width: "100%",
        minHeight: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      {/* SCHEDULE A ROUTE MODAL */}
      <Modal
        sx={{ ...ColFlex, width: "100%", height: "100%" }}
        open={modalProps?.openModal}
        onClose={() => setModalProps({ openModal: false })}
      >
        <Box
          sx={{
            ...ColFlex,
            p: { xs: 1, lg: 2.5 },
            minHeight: "50vh",
            width: { xs: "100%", lg: "75%" },
            borderRadius: "5px",
            gap: 5,
            alignItems: "center",
            textAlign: "center",
            justifyContent: "center",
            backgroundColor: "background.default",
          }}
        >
          {/* CALL OPTION */}
          <Box
            sx={{
              ...ColFlex,
              width: "100%",
              textAlign: "center",
              //   gap: "1px",
              marginTop: "15px",
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Call {modalProps?.currentPassenger?.fname} ?
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                width: "70%",
                fontWeight: 600,
                mb: "20px",
              }}
              variant="body1"
            >
              Do you want to make a call on{" "}
              {modalProps?.currentPassenger?.phone} ?
            </Typography>
            <ButtonBase
              component={"a"}
              href={`tel:${modalProps?.currentPassenger?.phone}`}
              // onClick={() => handleRemovePassengersFromCab(employee)}
              sx={{
                ...RowFlex,
                width: "25%",
                backgroundColor: "success.main",
                borderRadius: "100px",
              }}
            >
              <Call
                sx={{
                  borderRadius: "100px",
                  p: 1.75,
                  width: "60px",
                  height: "60px",
                  color: "white",
                }}
              />
            </ButtonBase>
          </Box>
          {/* OR Text */}
          <Typography
            sx={{ color: "text.secondary", width: "70%", fontWeight: 600 }}
            variant="body1"
          >
            OR
          </Typography>
          {/* ATTENDANCE OPTION */}
          <Box
            sx={{
              ...ColFlex,
              width: "100%",
              textAlign: "center",
              //   gap: "10px",
              marginTop: "15px",
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Mark Attendance
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                width: "70%",
                fontWeight: 600,
                mb: "30px",
              }}
              variant="body1"
            >
              Did employee board the cab from their current location?
            </Typography>
            <Box
              sx={{
                ...RowFlex,
                width: "50%",
                justifyContent: "space-between",
                mb: "15px",
              }}
            >
              <Close
                onClick={() => MarkEmployeeAbsent()}
                sx={{
                  borderRadius: "100px",
                  backgroundColor: "error.main",
                  p: 1.75,
                  width: "65px",
                  height: "65px",
                  color: "white",
                }}
              />
              <Done
                onClick={() => MarkEmployeePresent()}
                sx={{
                  borderRadius: "100px",
                  backgroundColor: "info.main",
                  p: 1.75,
                  width: "65px",
                  height: "65px",
                  color: "white",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* ROUTE STATS */}
      <LinearProgress
        sx={{
          width: artificialDelay ? "100%" : "0%",
          backgroundColor: "white",
          height: 5,
        }}
      />

      <Box
        sx={{
          ...RowFlex,
          width: "100%",
          justifyContent: "space-between",
          p: "15px",
          backgroundColor: "text.primary",
          color: "white",
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          {/* {parseFloat(distTravelled) * 0.621371} */}
          {calculatedDistance?.toFixed(3)}
          <span style={{ fontSize: "1rem" }}>
            kms
          </span>
        </Typography>
        <Typography variant="h4" fontWeight={600}>
          {getElapsedTime()}
          <span style={{ fontSize: "1rem" }}>
            {getElapsedTime() < 60 ? "mins" : "hr"}
          </span>
        </Typography>
      </Box>
      {/* MAP */}
      <MapComponent
        mode="route-view"
        zoom={14}
        routePathArray={routePathArray as []}
        mode="route-view"
        height="50vh"
        employees={route?.passengers as [EmployeeTypes]}
        driverOnFocus={myLocation as LatLngExpression}
      />
      {/* PASSENGER BOX */}
      <Box
        sx={{
          ...ColFlex,
          width: "95%",
          margin: "auto",
          my: "15px",
          padding: "15px",
          gap: "30px",
          color: "white",
          backgroundColor: "text.primary",
          borderRadius: "15px",
        }}
      >
        <Button
          disabled={UpdateRouteStatus === "pending"}
          onClick={!artificialDelay ? HandleCompleteRoute : () => {}}
          sx={{ width: "75%", borderRadius: "100px" }}
          variant="contained"
          endIcon={
            artificialDelay && (
              <CircularProgress
                size={"1rem"}
                sx={{ ml: 2.5, color: "white" }}
              />
            )
          }
        >
          Mark as Completed
        </Button>
        {/* PASSENGERS */}
        <Box sx={{ ...ColFlex, width: "100%", gap: "15px" }}>
          {route?.passengers?.length &&
            route?.passengers.map((passenger: any) => {
              return (
                // Passenger
                <Box
                  key={passenger?._id}
                  sx={{
                    ...RowFlex,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      ...RowFlex,
                      width: "80%",
                      justifyContent: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <Avatar
                      src={baseURL + userData?.profilePicture}
                      sx={{ width: "30px", height: "30px" }}
                    />
                    <Box>
                      <Typography variant="body1">
                        {passenger.fname + " " + passenger.lname}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Route
                          sx={{
                            width: "12.5px",
                            height: "12.5px",
                            mr: "5px",
                            color: "secondary.main",
                          }}
                        />
                        {passenger.pickUp.address}
                      </Typography>
                    </Box>
                  </Box>
                  {isAttendanceMarked(passenger._id as string) === true ? (
                    <Done />
                  ) : isAttendanceMarked(passenger._id as string) === false ? (
                    <Close />
                  ) : (
                    <ButtonBase
                      // component={"a"}
                      // href={`tel:${passenger?.phone}`}
                      onClick={() => handleModalOpen(passenger)}
                      sx={{
                        ...RowFlex,
                        width: "20%",
                        borderRadius: "100px",
                      }}
                    >
                      {!passenger?.isCabCancelled ? (
                        <Hail
                          sx={{
                            backgroundColor: "background.default",
                            borderRadius: "100px",
                            p: 1,
                            width: "35px",
                            height: "35px",
                            color: "text.primary",
                          }}
                        />
                      ) : (
                        <WrongLocation
                          sx={{
                            backgroundColor: "error.main",
                            borderRadius: "100px",
                            p: 1,
                            width: "35px",
                            height: "35px",
                            color: "white",
                          }}
                        />
                      )}
                    </ButtonBase>
                  )}
                </Box>
              );
            })}
        </Box>
      </Box>
    </Box>
  );
}

export default StartRoute;
