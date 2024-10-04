// @ts-nocheck
import {
  ArrowRight,
  Call,
  Close,
  MeetingRoom,
  Person,
  Settings,
  Warning,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  Modal,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import useAxios from "../../api/useAxios";
import MapComponent from "../../components/Map";
import SelectedEmpsContext from "../../context/SelectedEmpsContext";
import SnackbarContext from "../../context/SnackbarContext";
import UserDataContext from "../../context/UserDataContext";
import RouteTypes from "../../types/RouteTypes";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import baseURL from "../../utils/baseURL";
import { UserContextTypes } from "../../types/UserContextTypes";
import { PageFlex, ColFlex, RowFlex } from "./../../style_extentions/Flex";
import Cabtypes from "../../types/CabTypes";
import GetArrivalTime from "../../utils/ReturnPickupTime";
import GetOfficeCoordinates from "../../utils/OfficeCoordinates";
import EmployeeTypes from "./../../types/EmployeeTypes";
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat";

const socket = io(baseURL, {
  reconnection: true,
  reconnectionAttempts: 10, // Retry 10 times before giving up
  reconnectionDelay: 5000, // Wait 5 seconds between reconnection attempts
});

function EmployeeDashboard() {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [driversLocation, setDriversLocation] = useState<any>();
  // const [passengerPickupNumber] = useState<number>();
  const [myIndexInCab, setMyIndexInCab] = useState<number>(0);

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const { userData, setUserData }: UserContextTypes =
    useContext(UserDataContext);

  const { setSelectedEmps } = useContext(SelectedEmpsContext);

  const navigate = useNavigate();

  const [isCabCancelled, setIsCabCancelled] = useState<boolean>(
    userData?.isCabCancelled
  );

  const qc = useQueryClient();

  function Logout() {
    useAxios
      .post("auth/logout", {})
      .then(() => {
        navigate("/");
        setUserData?.(undefined);
      })
      .catch(() =>
        setOpenSnack({
          open: true,
          message: "something went wrong!",
          severity: "error",
        })
      );
  }

  const SendEmergencyAlert = () => {
    let sosData;
    navigator.geolocation.getCurrentPosition((pos) => {
      sosData = {
        sosFrom: userData?.fname + " " + userData?.lname,
        phone: userData?.phone,
        location: [pos.coords.latitude, pos.coords.longitude],
      };
      socket.emit("SOS", sosData);
      setOpenModal(!openModal);
      setOpenSnack({
        open: true,
        message:
          "Emergency SOS was sent. Admin will get in touch with you shortly.",
        severity: "info",
      });
      // console.log(sosData);
    });
  };

  const getEmployeeRoute = () => {
    return useAxios.get(`cabs/tm/cab/${userData?._id}`);
  };

  const { data: routeData } = useQuery({
    queryFn: getEmployeeRoute,
    queryKey: ["Route Attendance"],
    select: (data: any) => {
      if (data.data?.found_route) {
        return data.data.found_route as RouteTypes;
      }
      return undefined;
    },
  });

  // console.log("RD -> ", routeData?.workLocation)

  const cancelCabMF = () => {
    return useAxios.patch(`users/cancel-cab/${userData?._id}`);
  };

  const {
    mutate: cancelCab,
    status: cabCancelStatus,
    data: cabCancelData,
  } = useMutation({
    mutationFn: cancelCabMF,
    onSuccess: (data) => {
      qc.invalidateQueries("Route Attendance" as never);
      setIsCabCancelled(!isCabCancelled);
      console.log(data.data);
      setOpenSnack({
        open: true,
        message: data.data.cancelCab
          ? "Cab service cancelled!"
          : "Cab service resumed",
        severity: data.data.cancelCab ? "warning" : "success",
      });
    },
  });

  function HandleCancelCab() {
    cancelCab();
  }

  // console.log(cabCancelData);
  useEffect(() => {
    const passengers = routeData?.passengers;
    // console.log(passengers);

    if (passengers) {
      const passengersLatLons: string[] = passengers.map(
        (passenger: any) => passenger.pickUp.coordinates
      );
      // console.log(passengersLatLons);
      // passengers?.workLocation
      setSelectedEmps([
        ...passengersLatLons,
        GetOfficeCoordinates((passengers[0] as any)?.workLocation),
      ]);

      // const numberInList = passengers?.filter((passenger, index) => {
      //   passenger?._id === userData?._id && setPassengerPickupNumber(index + 1);
      // });
      // console.log(numberInList);
    }
    const myIndex = routeData?.passengers?.findIndex((emp: any) => {
      return emp._id?.toString() === userData?._id?.toString();
    });
    setMyIndexInCab(myIndex as number);
  }, [routeData]);

  const extractDriverData = (rawData: any) => {
    const mapTest = new Map(rawData);
    // console.log(routeData)

    const mapValues = Array.from(mapTest.values());
    if (routeData) {
      const formattedDriverName =
        (routeData?.cab as any)?.cabDriver?.fname +
        " " +
        (routeData?.cab as any)?.cabDriver?.lname[0] +
        ".";
      // console.log(route);
      const myDriver = mapValues?.filter(
        ({ name, location }) => name === formattedDriverName
      );
      console.log(formattedDriverName);
      console.log("MY DRIVER -> ", myDriver);
      setDriversLocation(myDriver);
    }
    // else {
    //   setDriversLocation(mapValues)
    // }
  };

  const [counter, setCounter] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prevCount) => prevCount + 1);
    }, 3000);

    // Clear the timer on component unmount
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    socket.on("live-drivers", (data) => {
      // console.log("Live Drivers ------->  ", data);
      // const locations = data;
      extractDriverData(data);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected, attempting to reconnect...");
      socket.connect();
    });
  }, [socket, routeData, counter]);

  return (
    <Box
      sx={{
        ...PageFlex,
        height: "100vh",
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
      {/* SIDEBAR */}
      <Drawer open={openDrawer} onClose={() => setOpenDrawer(!openDrawer)}>
        <Box
          sx={{
            ...ColFlex,
            width: "80vw",
            height: "100vh",
            gap: "40px",
            p: "15px",
            backgroundColor: "background.default",
            color: "text.primary",
          }}
        >
          {/* Logo Header */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-start",
              backgroundColor: "background.default",
              color: "text.primary",
            }}
          >
            <Box
              component={"img"}
              src="/images/logo-blue.png"
              sx={{ width: "35px", aspectRatio: 1, m:0.5 }}
            />
            <Close
              sx={{ width: 30, height: 30 }}
              onClick={() => setOpenDrawer(!openDrawer)}
            />
          </Box>
          {/* Profile Card */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              gap: "15px",
              borderRadius: "10px",
              p: "5px",
              backgroundColor: "background.default",
              color: "text.primary",
            }}
          >
            <Avatar src={baseURL + userData?.profilePicture} />
            <Box sx={{ ...ColFlex, width: "70%", alignItems: "flex-start" }}>
              <Typography variant="h6">
                {userData?.fname + " " + userData?.lname}
              </Typography>
              <Typography variant="caption" color={"lightgrey"}>
                {(userData?.department?.charAt(0).toUpperCase() as string) +
                  userData?.department?.slice(1, 99)}{" "}
                Department
              </Typography>
            </Box>
          </Box>
          {/* OPTIONS/ACTIONS */}
          <Box sx={{ ...ColFlex, width: "100%" }}>
            <Button
              sx={{
                justifyContent: "flex-start",
                p: "15px",
                pl: "20px",
                color: "text.primary",
              }}
              fullWidth
              startIcon={<Person />}
              // variant={"outlined"}
            >
              Profile
            </Button>
            <Button
              sx={{
                justifyContent: "flex-start",
                p: "15px",
                pl: "20px",
                color: "text.primary",
              }}
              fullWidth
              startIcon={<Settings />}
              // variant={"outlined"}
            >
              Settings
            </Button>
          </Box>
          {/* LOGOUT AND SOS */}
          <Box
            sx={{ ...ColFlex, width: "100%", gap: "15px", marginTop: "auto" }}
          >
            <Button
              onClick={() => setOpenModal(!openModal)}
              sx={{
                borderRadius: "10px",
                p: "15px",
                color:"white"
              }}
              color={"warning"}
              fullWidth
              startIcon={<Warning />}
              variant={"contained"}
            >
              EMERGENCY SOS
            </Button>
            <Button
              onClick={() => Logout()}
              sx={{
                backgroundColor: "error.main",
                color: "text.primary",
                borderRadius: "10px",
                p: "15px",
              }}
              startIcon={<MeetingRoom />}
              fullWidth
              variant={"contained"}
            >
              LOG OUT
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* SOS MODAL */}
      <Modal
        sx={{
          ...ColFlex,
          width: "100%",
          height: "100%",
          backgroundColor: "background.default",
          color: "text.primary",
        }}
        open={openModal}
        onClose={() => setOpenModal(!openModal)}
      >
        <Box
          sx={{
            ...ColFlex,
            p: "30px 10px",
            // minHeight: "40vh",
            width: { xs: "90%", lg: "75%" },
            borderRadius: "15px",
            gap: 5,
            alignItems: "center",
            textAlign: "center",
            justifyContent: "center",
            backgroundColor: "background.default",
          }}
        >
          {/* DANGER POPUP */}
          <Box
            sx={{
              ...ColFlex,
              width: "100%",
              textAlign: "center",
              gap: "15px",
              marginTop: "15px",
            }}
          >
            <Typography variant="h5" fontWeight={600} sx={{ mb: "10px" }}>
              Are you in Danger ?
            </Typography>
            <Warning
              sx={{ color: "error.main", width: "50px", height: "50px" }}
            />
            <Typography
              sx={{ width: "60%" }}
              variant="body1"
              color={"GrayText"}
              fontWeight={600}
            >
              The admin will be alerted instantly!
            </Typography>
            <Button
              onClick={() => SendEmergencyAlert()}
              sx={{
                backgroundColor: "error.main",
                color: "background.default",
                padding: "10px 50px",
                borderRadius: "100px",
              }}
              variant="contained"
              size="large"
            >
              Send Alert
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Profile Picture */}
      <Avatar
        src={baseURL + userData?.profilePicture}
        onClick={() => setOpenDrawer(!openDrawer)}
        sx={{ position: "absolute", top: 15, left: 15, zIndex: 999 }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          zIndex: 999,
          ...ColFlex,
          justifyContent: "flex-start",
          width: "100%",
          height: "auto",
          backgroundColor: "background.default",
          color: "text.primary",
          gap: "20px",
          pb: "20px",
        }}
      >
        {/* Arrival Time */}
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            py: "5px",
            backgroundColor: "background.default",
            color: "text.primary",
          }}
        >
          {routeData !== undefined ? (
            routeData?.typeOfRoute == "pickup" ? (
              <Typography
                sx={{ color: "text.primary", fontWeight: 500 }}
                variant="h4"
              >
                Arrival -{" "}
                <span style={{ fontWeight: 600 }}>
                  {/* {ConvertTo12HourFormat(
                    CalculateArrivalTimes(
                      routeData?.shiftTime as string,
                      routeData?.estimatedTime as number,
                      routeData?.passengers?.length as number,
                      passengerPickupNumber ? passengerPickupNumber : 1
                    )
                  )} */}
                  {GetArrivalTime(
                    routeData?.currentShift?.split("-")[0] as string,
                    myIndexInCab
                  )}
                </span>
              </Typography>
            ) : (
              <Typography
                sx={{ color: "text.primary", fontWeight: 500 }}
                variant="h5"
              >
                Onboarding at - {"  "}
                <span style={{ fontWeight: 600 }}>
                  {ConvertShiftTimeTo12HrFormat(
                    routeData?.currentShift as string,
                    routeData?.typeOfRoute
                  )}
                </span>
              </Typography>
            )
          ) : (
            <Typography
              sx={{ color: "text.primary", fontWeight: 500 }}
              variant="h5"
            >
              No Cab Assigned ; {"("}
            </Typography>
          )}
        </Box>
        {/* Driver & Cab */}
        {routeData && (
          <Box
            sx={{
              ...RowFlex,
              justifyContent: "space-between",
              width: "100%",
              px: "25px",
            }}
          >
            <Box sx={{ ...ColFlex, alignItems: "flex-start" }}>
              <Typography variant="h6">
                {(routeData?.cab as any)?.cabDriver?.fname +
                  " " +
                  (routeData?.cab as any)?.cabDriver?.lname}
              </Typography>
              <Typography variant="body2">
                CAB NUMBER -{" "}
                <span style={{ fontWeight: 600 }}>
                  {(routeData?.cab as any)?.cabNumber}
                </span>
              </Typography>
            </Box>
            <Avatar src={baseURL + userData?.profilePicture} />
          </Box>
        )}
        <Divider sx={{ width: "75%" }} />
        {/* Cab Details */}
        {routeData && (
          <Box
            sx={{
              ...ColFlex,
              alignItems: "flex-start",
              width: "100%",
              px: "25px",
            }}
          >
            <Typography variant="h4">
              {(routeData?.cab as Cabtypes)?.carModel?.toUpperCase()}
            </Typography>
            <Box
              sx={{
                ...RowFlex,
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6">
                {(routeData?.cab as Cabtypes)?.numberPlate}
              </Typography>
              <Box sx={{ ...RowFlex, gap: "10px" }}>
                <Box
                  sx={{
                    width: "15px",
                    height: "15px",
                    borderRadius: "100px",
                    backgroundColor: (routeData?.cab as Cabtypes)?.carColor,
                    border: "2px solid black",
                  }}
                ></Box>
                <Typography variant="body2">
                  {(routeData?.cab as Cabtypes)?.carColor}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        {/* EMP Actions */}
        {routeData ? (
          <Box sx={{ ...RowFlex, width: "100%", gap: "10px", px: "15px" }}>
            <Button
              onClick={HandleCancelCab}
              sx={{
                backgroundColor: isCabCancelled ? "info.main" : "error.main",
                borderRadius: "10px",
                color: "text.primary",
                padding: "15px",
                width: "60%",
              }}
              variant="contained"
              startIcon={!isCabCancelled ? <Close /> : <ArrowRight />}
            >
              {isCabCancelled ? "RESUME CAB" : "CANCEL CAB"}
            </Button>
            <Button
              href={`tel:${"00000000"}`}
              sx={{
                backgroundColor: "success.light",
                borderRadius: "10px",
                color: "text.primary",
                padding: "15px",
                width: "40%",
              }}
              variant="contained"
              startIcon={<Call />}
            >
              CALL
            </Button>
          </Box>
        ) : (
          <Button
            onClick={HandleCancelCab}
            sx={{
              // backgroundColor: userData?.cancelCab ? "info.main" : "error.main",
              borderRadius: "10px",
              // color:"text.primary",
              padding: "15px",
              width: "60%",
            }}
            color={!userData?.isCabCancelled ? "error" : "info"}
            variant="contained"
            startIcon={!userData?.isCabCancelled ? <Close /> : <ArrowRight />}
          >
            {userData?.isCabCancelled
              ? "RESUME CAB SERVICE"
              : "CANCEL CAB SERVICE"}
          </Button>
        )}
      </Box>
      <MapComponent
        visibleOffice={routeData?.workLocation}
        height="100%"
        mode="route-view"
        employees={routeData?.passengers as [EmployeeTypes]}
        // {...(driversLocation !== undefined && { activeDrivers: [driversLocation] })}
        activeDrivers={driversLocation}
      />
    </Box>
  );
}

export default EmployeeDashboard;
