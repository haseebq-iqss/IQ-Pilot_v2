// @ts-nocheck
import { Call, Close, Warning } from "@mui/icons-material";
import { Box, Button, Modal, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
import useAxios from "../../api/useAxios";
import MapComponent from "../../components/Map";
// import baseURL from "../../utils/baseURL";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import EmployeeTypes from "../../types/EmployeeTypes";
import { useNavigate } from "react-router-dom";
// import SOSAudio from "../../assets/sounds/emergency.mp3";

// const socket = io(baseURL);

function AdminDashboard() {
  const [activeDrivers, setActiveDrivers] = useState<EmployeeTypes[]>([]);
  const [SOSEmergency, setSOSEmergency] = useState<any>(null);
  const audioRef = useRef<any>();
  const navigate = useNavigate();
  // const emergencyAudio = new Audio(SOSAudio);

  // function extractLocations(input: any) {
  //   input.map((item: any) => {
  //     // Access the first element of the inner array and then access its 'location' property
  //     item.map((data: any) =>
  //       setActiveDrivers((prevState: any) => [...prevState, data.location])
  //     );
  //   });
  //   // return locations;
  // }

  // const extractDriverData = (rawData: any) => {
  //   const mapTest = new Map(rawData);
  //   // console.log(mapTest)

  //   const mapValues = Array.from(mapTest.values());

  //   console.log(mapValues);
  //   setActiveDrivers(mapValues);
  // };

  // useEffect(() => {
  //   socket.on("SOS", (data) => {
  //     console.log("SOS ------->  ", data);
  //     setSOSEmergency(data);
  //     // if (audioRef.current) {
  //     // audioRef.current?.play();
  //     // emergencyAudio?.play();
  //     // }
  //   });
  // }, [socket]);

  // useEffect(() => {
  //   socket.on("live-drivers", (data) => {
  //     console.log("Live Drivers ------->  ", data);
  //     const locations = data;
  //     extractDriverData(locations);
  //   });
  // }, [socket]);

  // ALL ASSIGNED ROUTES
  const getAllAssignedRoutesQF = () => {
    return useAxios.get("routes/activeRoutes");
  };

  const { data: allRoutes, status: allRoutesStatus } = useQuery({
    queryFn: getAllAssignedRoutesQF,
    queryKey: ["All Assigned Routes"],
    select: (data) => {
      console.log(data)
      return data.data.data;
    },
  });

  // console.log(allRoutes)

  // ALL AVAILABLE CABS
  const getAllCabsQF = async () => {
    const response = await useAxios.get("cabs/availableCabs");
    console.log(response);
    return response.data?.no_of_cabs_available;
  };

  const { data: allCabs, status: allCabStatus } = useQuery({
    queryFn: getAllCabsQF,
    queryKey: ["All Cabs"],
  });

  // ALL ROASTERED PASSENGERS
  const getRosteredPassengersQF = () => {
    return useAxios.get("routes/rosteredPassengers");
  };

  const { data: rosteredPassengers, status: rosteredPassengersStatus } =
    useQuery({
      queryFn: getRosteredPassengersQF,
      queryKey: ["All Rostered Passengers"],
      select: (data) => {
        console.log(data.data);
        return data.data;
      },
    });

  // ALL PENDING PASSENGERS
  const getPendingPassengersQF = () => {
    return useAxios.get("routes/pendingPassengers");
  };

  const { data: pendingPassengers, status: pendingPassengersStatus } = useQuery(
    {
      queryFn: getPendingPassengersQF,
      queryKey: ["All Pending Passengers"],
      select: (data) => {
        return data.data;
      },
    }
  );

  // console.log(pendingPassengers)

  // ALL EMPLOYEES
  const getAllEmployees = () => {
    return useAxios.get("/users/tms");
  };

  const { data: allEmployees, status: allEmployeesStatus } = useQuery({
    queryFn: getAllEmployees,
    queryKey: ["All Employees"],
    select: (data) => {
      return data.data.data;
    },
  });

  return (
    <Box
      sx={{
        ...ColFlex,
        width: "100%",
        height: "100%",
        // backgroundColor: "black",
        // borderRadius: "10px",
        gap: "15px",
      }}
    >
      {/* SOS MODAL */}
      <Modal
        sx={{ ...ColFlex, width: "100%", height: "100%" }}
        open={SOSEmergency ? true : false}
        // onClose={() => setSOSEmergency([])}
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
            <Box
              sx={{
                ...RowFlex,
                width: "calc(50% + 15px)",
                justifyContent: "space-between",
                alignSelf: "end",
              }}
            >
              <Warning
                sx={{ color: "error.main", width: "50px", height: "50px" }}
              />
              <Close
                sx={{
                  cursor: "pointer",
                  p: 1.5,
                  width: "100px",
                  height: "50px",
                }}
                onClick={() => {
                  setSOSEmergency(undefined);
                }}
              />
            </Box>
            <audio id="myAudio" ref={audioRef} src={""} autoPlay loop></audio>
            <Typography variant="h5" fontWeight={600} sx={{ mb: "10px" }}>
              {SOSEmergency?.sosFrom} is in Danger !
            </Typography>
            <Box
              sx={{
                width: "70%",
                height: "30vh",
                borderRadius: "15px",
                border: "2px solid red",
                overflow: "hidden",
              }}
            >
              <MapComponent
                width="100%"
                height="30vh"
                SOS={SOSEmergency}
                zoom={13}
                center={SOSEmergency?.location}
                employees={allEmployees}
              />
            </Box>

            <Button
              href={`tel:${SOSEmergency?.phone}`}
              // onClick={() => SendEmergencyAlert()}
              sx={{
                backgroundColor: "primary.main",
                color: "background.default",
                padding: "10px 50px",
                borderRadius: "100px",
              }}
              variant="contained"
              size="large"
              startIcon={<Call />}
            >
              Call : {SOSEmergency?.phone}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* TODAYS PLAN */}
      <Box
        sx={{
          ...RowFlex,
          width: "100%",
          height: "20%",
          backgroundColor: "white",
          borderRadius: "15px",
          justifyContent: "space-between",
        }}
      >
        {/* section-1 */}
        <Box
          sx={{
            ...RowFlex,
            width: "40%",
            height: "20%",
            backgroundColor: "white",
            borderRadius: "15px",
            justifyContent: "flex-start",
            marginLeft: "50px",
          }}
        >
          <Box sx={{ ...ColFlex, alignItems: "flex-start", gap: "5px" }}>
            <Typography variant="h4" fontWeight={700}>
              Today's Plan
            </Typography>
            <Typography color={"GrayText"} variant="body1">
              It’s{" "}
              <span style={{ fontWeight: 600 }}>
                Tuesday, 19th of March - 2024
              </span>
            </Typography>
          </Box>
        </Box>
        {/* section-2 */}
        <Box
          sx={{
            ...RowFlex,
            width: "60%",
            height: "20%",
            backgroundColor: "white",
            borderRadius: "15px",
            justifyContent: "space-evenly",
          }}
        >
          <Box
            sx={{ ...ColFlex, gap: "5px", cursor: "pointer" }}
            onClick={() => {
              navigate("assignedRoutes", { state: allRoutes });
            }}
          >
            <Typography sx={{ fontWeight: 600 }} variant="h4">
              {allRoutesStatus === "success" && allRoutes?.length > 0
                ? allRoutes?.length
                : 0}
            </Typography>
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                color: "text.secondary",
                fontSize: "0.8rem",
                lineHeight: "15px",
                fontWeight: 600,
              }}
              variant="subtitle2"
              color={"GrayText"}
            >
              Routes Assigned
            </Typography>
          </Box>
          <Box sx={{ ...ColFlex, gap: "5px" }}>
            <Typography sx={{ fontWeight: 600 }} variant="h4">
              {allCabStatus === "success" ? allCabs?.length : 0}
            </Typography>
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "0.8rem",
                lineHeight: "15px",
                fontWeight: 600,
              }}
              color={"GrayText"}
              variant="subtitle2"
            >
              Available Cabs
            </Typography>
          </Box>
          <Box sx={{ ...ColFlex, gap: "5px" }}>
            <Typography sx={{ fontWeight: 600 }} variant="h4">
              {rosteredPassengersStatus === "success"
                ? rosteredPassengers?.rostered_passengers?.length
                : 40}
            </Typography>
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "0.8rem",
                lineHeight: "15px",
                fontWeight: 600,
              }}
              variant="subtitle2"
              color={"GrayText"}
            >
              Rostered TMs
            </Typography>
          </Box>
          <Box sx={{ ...ColFlex, gap: "5px" }}>
            <Typography sx={{ fontWeight: 600 }} variant="h4">
              {pendingPassengersStatus === "success"
                ? pendingPassengers?.pending_passengers?.length
                : 6}
            </Typography>
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                // color: "text.secondary",
                fontSize: "0.8rem",
                lineHeight: "15px",
                fontWeight: 600,
              }}
              color={"GrayText"}
              variant="subtitle2"
            >
              Pending TMs
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* MAP */}
      <Box
        sx={{
          width: "100%",
          height: "80%",
          backgroundColor: "white",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        <MapComponent
          height="100%"
          employees={
            allEmployeesStatus === "success" &&
            allEmployees?.length > 1 &&
            allEmployees
          }
          activeDrivers={activeDrivers}
        />
      </Box>
    </Box>
  );
}

export default AdminDashboard;
