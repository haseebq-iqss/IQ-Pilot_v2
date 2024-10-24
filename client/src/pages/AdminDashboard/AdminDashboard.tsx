import { Call, Close, Warning } from "@mui/icons-material";
import { Box, Button, Modal, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useAxios from "../../api/useAxios";
import MapComponent from "../../components/Map";
// import baseURL from "../../utils/baseURL";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import { useNavigate } from "react-router-dom";
import TodayFullDateString from "../../utils/TodayFullDateString";
import baseURL from "../../utils/baseURL";
// import SOSAudio from "../../assets/sounds/emergency.mp3";
import { AnimatedCounter } from "react-animated-counter";

const socket = io(baseURL);

function AdminDashboard() {
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

  useEffect(() => {
    socket.on("SOS", (data) => {
      console.log("SOS ------->  ", data);
      setSOSEmergency(data);
      // if (audioRef.current) {
      // audioRef.current?.play();
      // emergencyAudio?.play();
      // }
    });
  }, [socket]);

  // ALL ASSIGNED ROUTES
  const getAllAssignedRoutesQF = () => {
    return useAxios.get("routes/todayRoute");
  };

  const { data: allRoutes, status: allRoutesStatus } = useQuery({
    queryFn: getAllAssignedRoutesQF,
    queryKey: ["All Assigned Routes"],
    select: (data) => {
      return data.data.todayRoute;
    },
  });

  // console.log(allRoutes)

  // ALL AVAILABLE CABS
  const getAllCabsQF = async () => {
    const response = await useAxios.get("cabs/availableCabs");
    return response.data?.data;
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
        return data.data.pending_passengers;
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
                mode="route-view"
                width="100%"
                height="30vh"
                SOS={SOSEmergency}
                zoom={13}
                center={SOSEmergency?.location}
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
          backgroundColor: "background.default",
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
            backgroundColor: "background.default",
            borderRadius: "15px",
            justifyContent: "flex-start",
            marginLeft: "50px",
          }}
        >
          <Box
            sx={{
              ...ColFlex,
              alignItems: "flex-start",
              gap: "5px",
              color: "text.primary",
            }}
          >
            <Typography variant="h4" fontWeight={600}>
              Today's Plan
            </Typography>
            <Typography sx={{ color: "text.secondary" }} variant="body1">
              It’s{" "}
              <span style={{ fontWeight: 600 }}>{TodayFullDateString()}</span>
            </Typography>
          </Box>
        </Box>
        {/* section-2 */}
        <Box
          sx={{
            ...RowFlex,
            width: "60%",
            height: "20%",
            backgroundColor: "background.default",
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
            <Typography
              sx={{ fontWeight: 500, color: "text.primary" }}
              variant="h4"
            >
              <AnimatedCounter
                decimalPrecision={0}
                fontSize="h3"
                color="text.primary"
                value={
                  allRoutesStatus === "success" && allRoutes?.length > 0
                    ? allRoutes?.length
                    : 0
                }
              />
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
            >
              Active Cabs
            </Typography>
          </Box>
          <Box sx={{ ...ColFlex, gap: "5px" }}>
            <Typography
              sx={{ fontWeight: 500, color: "text.primary" }}
              variant="h4"
            >
              <AnimatedCounter
                decimalPrecision={0}
                fontSize="h3"
                color="text.primary"
                value={allCabStatus === "success" ? allCabs?.length : 0}
              />
            </Typography>
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "0.8rem",
                lineHeight: "15px",
                fontWeight: 600,
                color: "text.secondary",
              }}
              variant="subtitle2"
            >
              Inactive Cabs
            </Typography>
          </Box>
          <Box
            sx={{ ...ColFlex, gap: "5px", cursor: "pointer" }}
            onClick={() => navigate("rosteredTeamMembers")}
          >
            <Typography
              sx={{ fontWeight: 500, color: "text.primary" }}
              variant="h4"
            >
              <AnimatedCounter
                decimalPrecision={0}
                fontSize="h3"
                color="text.primary"
                value={
                  rosteredPassengersStatus === "success"
                    ? rosteredPassengers?.rostered_passengers?.length
                    : 40
                }
              />
            </Typography>
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "0.8rem",
                lineHeight: "15px",
                fontWeight: 600,
                color: "text.secondary",
              }}
              variant="subtitle2"
            >
              Rostered TMs
            </Typography>
          </Box>
          <Box
            sx={{ ...ColFlex, gap: "5px", cursor: "pointer" }}
            onClick={() => navigate("pendingTeamMembers")}
          >
            <Typography
              sx={{ fontWeight: 500, color: "text.primary" }}
              variant="h4"
            >
              <AnimatedCounter
                decimalPrecision={0}
                fontSize="h3"
                color="text.primary"
                value={
                  pendingPassengersStatus === "success"
                    ? pendingPassengers?.length
                    : 0
                }
              />
            </Typography>
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                // color: "text.secondary",
                fontSize: "0.8rem",
                lineHeight: "15px",
                fontWeight: 600,
                color: "text.secondary",
              }}
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
          backgroundColor: "background.default",
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
          unrosteredTms={pendingPassengers}
        />
      </Box>
    </Box>
  );
}

export default AdminDashboard;
