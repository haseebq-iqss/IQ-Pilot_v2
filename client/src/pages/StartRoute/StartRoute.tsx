import { Call, Close, Done, Hail, Route } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Modal,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { LatLngExpression } from "leaflet";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import { io } from "socket.io-client";
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
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat";
import useTimer from "../../hooks/useTimer";

type modalPropTypes = {
  openModal: boolean;
  currentPassenger?: EmployeeTypes;
};

// const socket = io(baseURL);

function StartRoute() {
  const location = useLocation();
  const route: RouteTypes = location.state;

  const { userData }: UserContextTypes = useContext(UserDataContext);

  const [myLocation, setMyLocation] = useState<Array<number>>([]);

  const [startTimer, getElapsedTime] = useTimer()

  useEffect(() => {
    startTimer()
  }, [])

  // useEffect(() => {
  //   if (myLocation.length == 2) {
  //     const driverData = {
  //       name: userData?.fname[0] + ". " + userData?.lname,
  //       location: myLocation,
  //     };

  //     console.log(myLocation);

  //     socket.emit("live-drivers", driverData);
  //   }
  // }, [socket, myLocation]);

  type LatLon = [number, number];

  function TrackRoute(): () => string {
    let route: LatLon[] = []; // Array to store latlon coordinates
    let totalDistance = 0; // Total distance covered
  
    // Function to calculate distance between two points using Haversine formula
    function calculateDistance(latlon1: LatLon, latlon2: LatLon): number {
      const [lat1, lon1] = latlon1;
      const [lat2, lon2] = latlon2;
      const earthRadius = 6371; // Radius of the Earth in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = earthRadius * c;
      return distance; // Distance in kilometers
    }
  
    // Function to save route array to local storage
    function saveToLocalStorage() {
      localStorage.setItem('route', JSON.stringify(route));
    }
  
    // Function to retrieve route array from local storage
    function retrieveFromLocalStorage() {
      const storedRoute = localStorage.getItem('route');
      if (storedRoute) {
        route = JSON.parse(storedRoute);
      }
    }
  
    // Call function to retrieve route array from local storage
    retrieveFromLocalStorage();
  
    // Function to check if a latlon is similar to the last one
    function isSimilarToLastLatLon(latlon: LatLon): boolean {
      if (route.length === 0) return false;
      const lastLatLon = route[route.length - 1];
      const [lastLat, lastLon] = lastLatLon;
      const [newLat, newLon] = latlon;
      const threshold = 0.0001; // Adjust this threshold as needed
      return Math.abs(newLat - lastLat) < threshold && Math.abs(newLon - lastLon) < threshold;
    }
  
    // Function to get geolocation and push it to array every 3 seconds
    function getLocationAndStore() {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const newLatLon: LatLon = [lat, lon];
          
          // Check if new coordinate is similar to the last one
          if (!isSimilarToLastLatLon(newLatLon)) {
            // Check if new coordinate is different from the last one
            if (route.length > 0) {
              const lastLatLon = route[route.length - 1];
              const distance = calculateDistance(lastLatLon, newLatLon);
              totalDistance += distance;
            }
            
            // Push new coordinate to array
            route.push(newLatLon);
            
            // Save array to local storage
            saveToLocalStorage();
          }
          
          // Repeat every 3 seconds
          setTimeout(getLocationAndStore, 3000);
        },
        error => {
          console.error('Error getting geolocation:', error);
        }
      );
    }
  
    // Start tracking route
    getLocationAndStore();
  
    // Function to get total distance covered
    function getTotalDistance(): string {
      return totalDistance.toFixed(2); // Return total distance rounded to 2 decimal places
    }
  
    return getTotalDistance;
  }
    
  

  useEffect(() => {
    if (userData?.role === "driver") {
      navigator.geolocation.getCurrentPosition(() => {
        // setDriversPosition([pos.coords.latitude, pos.coords.longitude]);
        console.log("Permission granted");
      });

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

  const tracker = TrackRoute()
  const distTravelled = tracker()
  console.log("Distance Travelled -> ", parseFloat(distTravelled) * 0.621371)

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
      fuelConsumed: ((route?.totalDistance as number) / 15).toFixed(2),
    });
  };

  const { mutate: UpdateRoute, status: UpdateRouteStatus } = useMutation({
    mutationFn: updateRouteStatus,
    onSuccess: (data) => {
      console.log(data.data);
      setOpenSnack({
        open: true,
        message: `Route successfully completed!`,
        severity: "success",
      });
      navigate("/driver/routeCompleted", { state: data.data?.updated_route });
    },
  });

  function HandleCompleteRoute() {
    UpdateRoute();
  }

  const { mutate: markAttendance } = useMutation({
    mutationFn: markAttendanceMF,
    onSuccess(data) {
      console.log(data.data);
      console.log(data.data.attendance);
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
    console.log(markedPassengersArray);
  }, [markedPassengersArray]);

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

  //   console.log(route);
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
          {parseFloat(distTravelled) * 0.621371}
          <span style={{ fontSize: "1rem" }}>kms</span>
        </Typography>
        <Typography variant="h4" fontWeight={600}>
          {getElapsedTime()}
          <span style={{ fontSize: "1rem" }}>{getElapsedTime() < 60 ? "mins": "hr"}</span>
        </Typography>
      </Box>
      {/* MAP */}
      <MapComponent
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
          onClick={HandleCompleteRoute}
          sx={{ width: "75%", borderRadius: "100px" }}
          variant="contained"
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
