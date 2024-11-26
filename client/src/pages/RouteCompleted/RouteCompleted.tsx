import {
  ArrowBack,
  Close,
  Done,
  DoneAll,
  Route,
  TaskAlt,
} from "@mui/icons-material";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import useAxios from "../../api/useAxios";
import RouteTypes from "../../types/RouteTypes";
import baseURL from "../../utils/baseURL";
import EmployeeTypes from "../../types/EmployeeTypes";
import { ColFlex, RowFlex } from "./../../style_extentions/Flex";
import { useContext, useEffect, useState } from "react";
import ThemeModeContext from "../../context/ThemeModeContext";

function RouteCompleted() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = location.state as RouteTypes;

  const { themeMode }: any = useContext(ThemeModeContext);

  // console.log(route);

  const getAllDriverRoutes = () => {
    return useAxios.get(`attendances/route-attendance/${route?._id}`);
  };

  const { data: attendanceData } = useQuery({
    queryFn: getAllDriverRoutes,
    queryKey: ["Route Attendance"],
    select: (data: any) => {
      return data.data.route_attendance as Array<EmployeeTypes>;
    },
  });

  function GetPresentPeople(attendanceData: any) {
    return attendanceData.filter((person: any) => person.isPresent);
  }

  const [presentPeople, setPresentPeople] = useState<Array<EmployeeTypes>>([]);

  useEffect(() => {
    if (attendanceData?.length) {
      setPresentPeople(GetPresentPeople(attendanceData));
    }
  }, [attendanceData]);

  console.log(presentPeople)

  return (
    <Box
      sx={{
        ...ColFlex,
        width: "100%",
        // minHeight: "100%",
        justifyContent: "flex-start",
        alignItems: "center",
        pb: "50px",
      }}
    >
      {/* ROUTE STATS */}
      <Box
        sx={{
          ...RowFlex,
          width: "100%",
          justifyContent: "space-between",
          p: "30px",
          // backgroundColor: "text.primary",
          // color:"text.primary",
        }}
      >
        <Box sx={{ ...ColFlex }}>
          <Typography variant="h4" fontWeight={600}>
            {route?.totalDistance}
          </Typography>
          <Typography
            sx={{ color: "text.secondary" }}
            variant="body2"
            fontWeight={500}
          >
            Kilometers
          </Typography>
        </Box>
        <Box sx={{ ...ColFlex }}>
          <Typography variant="h4" fontWeight={600}>
            {route?.estimatedTime}
          </Typography>
          <Typography
            sx={{ color: "text.secondary" }}
            variant="body2"
            fontWeight={500}
          >
            Minutes
          </Typography>
        </Box>
        <Box sx={{ ...ColFlex }}>
          <Typography variant="h4" fontWeight={600}>
            {((route?.totalDistance as number) / 15).toFixed(1)}l
          </Typography>
          <Typography
            sx={{ color: "text.secondary" }}
            variant="body2"
            fontWeight={500}
          >
            Petrol
          </Typography>
        </Box>
      </Box>

      {/* PASSENGER BOX */}
      <Box
        sx={{
          ...ColFlex,
          width: "95%",
          margin: "auto",
          my: "15px",
          padding: "15px",
          gap: "40px",
          color:"text.primary",
          backgroundColor: "background.default",
          borderRadius: "15px",
        }}
      >
        <Box
          sx={{ ...RowFlex, width: "100%", justifyContent: "space-between" }}
        >
          <Box sx={{ ...RowFlex, gap: "10px" }}>
            <TaskAlt sx={{ width: "40px", height: "40px" }} />
            {/* <Typography variant="h5">Completed</Typography> */}
          </Box>
          <Box
            sx={{
              ...RowFlex,
              gap: "10px",
              backgroundColor: "primary.main",
              borderRadius: "15px",
              padding: "5px 10px",
            }}
          >
            <DoneAll />
            <Typography variant="h5">
              {presentPeople?.length + "/" + attendanceData?.length} Picked
            </Typography>
          </Box>
        </Box>
        {/* PASSENGERS */}
        <Box sx={{ ...ColFlex, width: "100%", gap: "15px" }}>
          {attendanceData?.length &&
            attendanceData.map((attendance: any) => {
              const employee =
                attendance?.ofEmployee as unknown as EmployeeTypes;
              return (
                // Passenger
                <Box
                  key={attendance?._id}
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
                      sx={{ width: "30px", height: "30px" }}
                      src={baseURL + employee?.profilePicture}
                    />
                    <Box>
                      <Typography variant="body1">
                        {employee?.fname + " " + employee?.lname}
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
                        {employee?.pickUp?.address}
                      </Typography>
                    </Box>
                  </Box>
                  {attendance?.isPresent ? <Done /> : <Close />}
                </Box>
              );
            })}
        </Box>
      </Box>
      {/* BACK TO DASH */}
      <Button
        onClick={() => navigate("/driver")}
        sx={{ backgroundColor: "primary.dark", color:"text.primary", px: 10 }}
        size="large"
        startIcon={<ArrowBack />}
      >
        Back To Dashboard
      </Button>
    </Box>
  );
}

export default RouteCompleted;
