import { Avatar, Box, Button, Divider, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import {
  ArrowBackIos,
  Call,
  LocationOn,
  Mail,
  Person,
  Route,
} from "@mui/icons-material";
import EmployeeTypes from "../../types/EmployeeTypes";
import baseURL from "../../utils/baseURL";
import Convert24To12HourFormat from "../../utils/24HourTo12HourFormat";
import MapComponent from "../../components/Map";
import AttendanceCalendar from "../../components/ui/AttendanceCalendar";
import useAxios from "../../api/useAxios";
import { useQuery } from "@tanstack/react-query";
import RouteTypes from "../../types/RouteTypes";
import { useContext, useEffect } from "react";
import Cabtypes from "./../../types/CabTypes";
import formatDateString from "../../utils/DateFormatter";
import isXSmall from "./../../utils/isXSmall";
import { UserContextTypes } from "../../types/UserContextTypes";
import UserDataContext from "../../context/UserDataContext";

function TeamMemberProfile() {
  const location = useLocation();
  const employee: EmployeeTypes = location?.state;
  const { userData }: UserContextTypes = useContext(UserDataContext);

  const navigate = useNavigate();
  const { isXS } = isXSmall();

  const dates = [
    "2024-10-03T11:41:36.798000+00:00",
    "2024-10-07T11:41:36.798000+00:00",
    "2024-10-13T11:41:36.798000+00:00",
    "2024-10-26T11:41:36.798000+00:00",
    "2024-10-27T11:41:36.798000+00:00",
    "2024-10-31T11:41:36.798000+00:00",
    "2024-10-11T11:41:36.798000+00:00",
    "2024-10-05T11:41:36.798000+00:00",
    "2024-10-15T11:41:36.798000+00:00",
    "2024-10-23T11:41:36.798000+00:00",
    "2024-10-20T11:41:36.798000+00:00",
    "2024-10-02T11:41:36.798000+00:00",
    "2024-10-01T11:41:36.798000+00:00",
    "2024-10-06T11:41:36.798000+00:00",
  ];

  const getEmployeeRoute = () => {
    return useAxios.get(`cabs/tm/cab/${employee?._id}`);
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

  useEffect(() => {
    console.log(routeData);
  }, [routeData]);

  return (
    <Box
      sx={{
        width: "100%",
        height: isXS ? "auto" : "100vh",
        p: 2.5,
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
      {/* MOBILE ONLY TOOLBAR */}
      {isXS && (
        <Box
          sx={{
            ...RowFlex,
            width: "100%",
            justifyContent: "space-between",
            gap: 2.5,
            mb: 5,
          }}
        >
          <ArrowBackIos
            onClick={() => navigate(-1)}
            sx={{
              fontSize: 40,
              color: "text.primary",
              pl: "10px",
              border: "2px solid white",
              borderRadius: "10px",
            }}
          />
          <Typography variant="h5">Your Profile</Typography>
        </Box>
      )}
      {/* TOP BOX */}
      <Box
        sx={{
          height: isXS ? "auto" : "30vh",
          ...(isXS ? ColFlex : RowFlex),
          width: "100%",
          alignItems: isXS ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: "1rem",
          p: isXS ? 1 : 3,
        }}
      >
        <Box
          sx={{
            borderRadius: 2,
            ...(isXS ? ColFlex : RowFlex),
            gap: 2.5,
          }}
        >
          <Avatar
            alt={employee?.fname}
            src={
              employee?.profilePicture
                ? baseURL + employee?.profilePicture
                : "/images/default_user.png"
            }
            style={{
              width: isXS ? "7.5rem" : "10.5rem",
              height: isXS ? "7.5rem" : "10.5rem",
              borderRadius: isXS ? "100px" : "20px",
              objectFit: "cover",
              aspectRatio: "1.5",
            }}
          />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                textAlign: isXS ? "center" : "start",
              }}
            >
              {employee?.fname + " " + employee?.lname}
            </Typography>
            <Box
              sx={{
                ...(isXS ? ColFlex : RowFlex),
                gap: 2,
                justifyContent: "flex-start",
              }}
            >
              <Typography
                // variant="h5"
                fontWeight={500}
                sx={{ color: "text.primary", mb: 2, fontSize: "1.4rem" }}
              >
                {employee?.department}
              </Typography>
              {!isXS ? (
                <Typography
                  // variant="h5"
                  fontWeight={500}
                  sx={{ color: "text.primary", mb: 2, fontSize: "1.4rem" }}
                >
                  |
                </Typography>
              ) : (
                <Typography
                  // variant="h5"
                  fontWeight={500}
                  sx={{ color: "text.primary", fontSize: "1rem" }}
                >
                  Work Location
                </Typography>
              )}
              <Typography
                fontWeight={500}
                sx={{ color: "text.primary", mb: 2, fontSize: "1.4rem" }}
              >
                {employee?.workLocation}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                ...(isXS ? ColFlex : RowFlex),
                gap: 5,
                justifyContent: "start",
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1rem",
                  ...(isXS ? ColFlex : RowFlex),
                  gap: "6px",
                  color: "text.primary",
                }}
              >
                <Mail
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "warning.main",
                  }}
                />
                <span style={{ fontWeight: 600 }}>Email: </span>
                {employee?.email}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1rem",
                  color: "text.primary",
                  ...(isXS ? ColFlex : RowFlex),
                  gap: "6px",
                }}
              >
                <Call sx={{ fontSize: "1rem", color: "success.main" }} />
                <span style={{ fontWeight: 700 }}>Phone Number: </span>
                +91-{employee?.phone}
              </Typography>
            </Box>
            <Box
              sx={{
                ...(isXS ? ColFlex : RowFlex),
                justifyContent: "start",
                gap: 4,
                alignItems: "flex-start",
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1rem",
                  color: "text.primary",
                  textAlign: isXS ? "center" : "start",
                  ...(isXS ? ColFlex : RowFlex),
                  gap: "6px",
                }}
              >
                <LocationOn sx={{ fontSize: "1rem", color: "error.main" }} />
                <span style={{ fontWeight: 700 }}>Address: </span>
                {employee?.pickUp?.address}
              </Typography>
            </Box>
          </Box>
        </Box>
        {isXS && (
          <Divider
            sx={{
              width: "100%",
              height: "1px",
              backgroundColor: "grey",
              my: isXS ? 2.5 : 0,
            }}
          />
        )}
        <Box
          sx={{
            ...ColFlex,
            height: "10rem",
            alignItems: isXS ? "center" : "end",
            width: isXS ? "100%" : "auto",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              ...ColFlex,
              gap: 0,
              alignItems: isXS ? "center" : "flex-end",
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "text.primary", m: 0, p: 0 }}
            >
              {(employee?.isCabCancelled as any) === false
                ? "In Office"
                : "Out of Office"}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={500}
              sx={{ color: "text.primary" }}
            >
              {Convert24To12HourFormat(employee?.currentShift as string)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{
              width: "100%",
              backgroundColor: "warning.dark",
              color: "white",
              p: "2",
            }}
            onClick={() =>
              userData?.role === "admin"
                ? navigate(`/admin/editDetails/${employee?._id}`)
                : navigate(`/employee/editProfile/${employee?._id}`, {
                    state: employee,
                  })
            }
          >
            <Person sx={{ marginRight: 0.7, fontSize: "1.3rem" }} />
            {isXS ? "Edit Profile" : `Edit ${employee?.fname + "'s "} Profile`}
          </Button>
        </Box>
      </Box>
      {/* BOTTOM BOX */}
      <Box
        sx={{
          ...(isXS ? ColFlex : RowFlex),
          width: "100%",
          height: isXS ? "auto" : "65vh",
          justifyContent: "space-between",
          p: 2.5,
        }}
      >
        {/* Map Box - LEFT Side */}
        <Box
          sx={{
            height: isXS ? "30vh" : "100%",
            width: isXS ? "100%" : "40%",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <MapComponent
            visibleEmployee={employee}
            center={employee?.pickUp?.coordinates}
            width="100%"
            height="100%"
            mode="route-view"
            zoom={15}
          />
        </Box>
        {/* Stat Box - RIGHT Side */}
        <Box
          sx={{
            ...(isXS ? ColFlex : RowFlex),
            height: "100%",
            width: isXS ? "100%" : "57.5%",
            gap: 1,
            borderRadius: "10px",
            // border: "1px solid #E5E5E5",
          }}
        >
          {/* LEFT STATS BOX */}
          <Box
            sx={{
              ...ColFlex,
              justifyContent: "space-between",
              alignItems: isXS ? "center" : "flex-start",
              height: "100%",
              width: isXS ? "100%" : "50%",
              mt: isXS ? 2.5 : 0,
              // p: 2.5,
              borderRadius: "10px",
              // border: "1px solid #E5E5E5",
            }}
          >
            {/* B1 */}
            <Box
              sx={{
                ...ColFlex,
                justifyContent: isXS ? "center" : "flex-start",
                alignItems: isXS ? "center" : "flex-start",
                mt: isXS ? 2.5 : 0,
              }}
            >
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                Assigned Cab
              </Typography>
              <Box
                sx={{
                  ...(isXS ? ColFlex : RowFlex),
                  // width:isXS ? "100%" : "auto",
                  gap: 2.5,
                  justifyContent: isXS ? "center" : "flex-start",
                  textAlign: isXS ? "center" : "start",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 500,
                    color: "text.primary",
                    // fontSize: "1.75rem",
                  }}
                >
                  {routeData == undefined
                    ? "No Assigned Cab"
                    : ((routeData.cab as Cabtypes)?.cabDriver as EmployeeTypes)
                        ?.fname +
                      " " +
                      ((routeData.cab as Cabtypes)?.cabDriver as EmployeeTypes)
                        ?.lname}
                </Typography>
                {!isXS && (
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 200, color: "text.primary" }}
                  >
                    |
                  </Typography>
                )}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 500,
                    color: "text.primary",
                    // fontSize: "1.75rem",
                  }}
                >
                  {routeData == undefined
                    ? "NA"
                    : (("Cab " +
                        (routeData.cab as Cabtypes)?.cabNumber) as string)}
                </Typography>
              </Box>
            </Box>
            <Button
              disabled={routeData == undefined}
              variant="contained"
              size="large"
              sx={{
                width: "80%",
                mt: isXS ? 2.5 : 0,
                backgroundColor: "primary.light",
                color: "white",
                mb: isXS ? 2.5 : 0,
                // p: "2",
              }}
              onClick={() =>
                isXS
                  ? navigate(-1)
                  : navigate(`/admin/viewRoute/${routeData?._id}`, {
                      state: routeData,
                    })
              }
            >
              <Route sx={{ marginRight: 1, fontSize: "1.3rem" }} />
              {isXS ? "View Route" : `View ${employee?.fname + "'s "} Route`}
            </Button>
            {/* R1 */}
            <Box
              sx={{
                ...ColFlex,
                alignItems: isXS ? "center" : "flex-start",
                mb: isXS ? 2 : 0,
              }}
            >
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                Shrinkage Caused :
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  // fontSize: "1.75rem",
                }}
              >
                4% Overall
              </Typography>
            </Box>
            {/* R2 */}
            <Box
              sx={{
                ...ColFlex,
                alignItems: isXS ? "center" : "flex-start",
                mb: isXS ? 2 : 0,
              }}
            >
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                Absent Time :
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  // fontSize: "1.75rem",
                }}
              >
                14 Days
              </Typography>
            </Box>
            {/* R3 */}
            <Box
              sx={{
                ...ColFlex,
                alignItems: isXS ? "center" : "flex-start",
                mb: isXS ? 2 : 0,
              }}
            >
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                Member Since :
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  // fontSize: "1.5rem",
                }}
              >
                {formatDateString(employee?.createdAt as any, true)}
              </Typography>
            </Box>
          </Box>
          {/* Divider */}
          <Box
            sx={{
              width: "2px",
              height: "50%",
              alignSelf: "center",
              backgroundColor: "grey",
            }}
          />
          {/* RIGHT ATTENDANCE BOX */}
          <Box
            sx={{ ...ColFlex, width: isXS ? "100%" : "50%", height: "100%" }}
          >
            {/* R1 */}
            <Box sx={{ width: "100%", textAlign: isXS ? "center" : "start" }}>
              <Typography variant="h5" sx={{ color: "text.primary" }}>
                {employee?.fname + "'s "} Attendance
              </Typography>
            </Box>
            {/* <DateCalendar sx={{ width: "100%", height: "100%" }} /> */}
            <AttendanceCalendar highlightDates={dates} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default TeamMemberProfile;
