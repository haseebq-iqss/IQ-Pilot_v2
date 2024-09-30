import {
  NavigationOutlined,
  AccessTimeOutlined,
  Route,
  DoneAll,
  Tag,
  Groups2,
  FormatColorFill,
  DirectionsCar,
  Close,
  NotListedLocation,
  PeopleAlt,
  Error,
  AccessTime,
  DateRange,
} from "@mui/icons-material";
import { Typography, Avatar, Box, CircularProgress } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";
import MapComponent from "../../components/Map";
import { PageFlex, ColFlex, RowFlex } from "../../style_extentions/Flex";
import RouteTypes from "../../types/RouteTypes";
import baseURL from "../../utils/baseURL";
import Cabtypes from "./../../types/CabTypes";
import EmployeeTypes from "../../types/EmployeeTypes";
import useAxios from "../../api/useAxios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat";
import DaysTillActive from "../../utils/DaysTillActive";
import { LatLngExpression } from "leaflet";

function ViewRoute() {
  const location = useLocation();
  const routeState: RouteTypes = location.state;
  const { rid } = useParams();

  const getAllRouteAttendances = () => {
    return useAxios.get(`attendances/route-attendance/${rid}`);
  };

  const { data: attendanceData } = useQuery({
    queryFn: getAllRouteAttendances,
    queryKey: ["Route Attendance"],
    select: (data: any) => {
      return data.data.route_attendance as Array<EmployeeTypes>;
    },
  });

  const { data: routeData } = useQuery({
    queryFn: async () => {
      const response = await useAxios.get(`/routes/${rid}`);
      return response.data.data;
    },
    queryKey: ["Route Data"],
  });

  const [numberOfPresentPassengers, setNumberOfPresentPassengers] =
    useState<number>(0);

  useEffect(() => {
    if (attendanceData?.length) {
      const getPresentPassengers: any = attendanceData?.filter(
        (attendance: any) => attendance.isPresent === true
      );
      setNumberOfPresentPassengers(() => getPresentPassengers?.length);
    }
  }, [attendanceData]);

  return (
    <Box
      sx={{
        ...PageFlex,
        flexDirection: "row",
        gap: "15px",
        p: "15px",
        height: "100vh",
        backgroundColor: "#D9D9D9",
      }}
    >
      {/* LS */}
      <Box
        sx={{
          ...ColFlex,
          justifyContent: "space-between",
          alignItems: "center",
          //   flex: 3.5,
          width: "30%",
          height: "100%",
          borderRadius: "15px",
          gap: "20px",
        }}
      >
        {/* L-1 */}
        <Box
          sx={{
            ...ColFlex,
            width: "100%",
            height: "20%",
            backgroundColor: "background.default",
            justifyContent: "center",
            alignItems: "flex-start",
            p: "15px",
            borderRadius: "15px",
            gap: 1.5,
          }}
        >
          {/* L1-R1 */}
          <Box
            sx={{ ...RowFlex, width: "100%", justifyContent: "space-between" }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "1.75rem",
                color: "#212A3B",
                ...RowFlex,
              }}
              variant="body2"
              fontWeight={600}
              color={"GrayText"}
            >
              <AccessTime sx={{ fontSize: "2rem", mr: 1 }} />
              {ConvertShiftTimeTo12HrFormat(
                routeState?.currentShift as string,
                routeState?.typeOfRoute
              )}
            </Typography>
            <Box
              sx={{
                padding: "5px 15px",
                backgroundColor:
                  routeState?.routeStatus === "completed"
                    ? "primary.main"
                    : routeState?.routeStatus === "inProgress"
                    ? "purple"
                    : "black",
                color:"text.primary",
                borderRadius: 1,
              }}
            >
              <Typography variant="h6">
                {routeState?.routeStatus?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
          {/* L1 R2 */}
          <Box
            sx={{ ...RowFlex, width: "100%", justifyContent: "space-between" }}
          >
            <Box
              sx={{ width: "100px", aspectRatio: 2.6863 }}
              component={"img"}
              src={
                routeState?.typeOfRoute === "pickup"
                  ? "/images/pickup-dark.png"
                  : "/images/drop-dark.png"
              }
            />
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "1.75rem",
                color: "#212A3B",
                ...RowFlex,
              }}
              variant="body2"
              fontWeight={600}
              color={"GrayText"}
            >
              <DateRange sx={{ fontSize: "2rem", mr: 1 }} />
              {DaysTillActive(
                routeState?.createdAt as any,
                routeState?.daysRouteIsActive as any
              )}
            </Typography>
          </Box>
        </Box>
        {/* L-2 */}
        <Box
          sx={{
            ...ColFlex,
            width: "100%",
            height: "80%",
            backgroundColor: "background.default",
            padding: "15px 20px",
            borderRadius: "15px",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          {attendanceData?.length ? (
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Passengers ({numberOfPresentPassengers} out of{" "}
              {attendanceData?.length} are Present)
            </Typography>
          ) : (
            <Box
              sx={{
                ...ColFlex,
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  ...RowFlex,
                  width: "100%",
                  justifyContent: "flex-start",
                }}
              >
                <PeopleAlt sx={{ mr: 1 }} />
                {routeState?.passengers?.length} Passengers
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "warning.main",
                  fontWeight: 500,
                  mb: 1,
                  ...RowFlex,
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <Error sx={{ mr: 1, color: "warning.main", p: 0.25 }} />
                Route Not Started Yet!
              </Typography>
            </Box>
          )}
          {attendanceData?.length
            ? attendanceData?.map((attendance: any) => {
                // console.log(employee);
                return (
                  <Box
                    key={attendance?.ofEmployee?._id}
                    sx={{ ...RowFlex, width: "100%" }}
                  >
                    <Box
                      sx={{
                        ...RowFlex,
                        width: "80%",
                        justifyContent: "flex-start",
                        gap: "20px",
                      }}
                    >
                      <Avatar
                        sx={{ width: "40px", height: "40px" }}
                        src={baseURL + attendance?.ofEmployee?.profilePicture}
                      />
                      <Box>
                        <Typography
                          sx={{ fontSize: "1.25rem", fontWeight: 500 }}
                        >
                          {attendance.ofEmployee?.fname +
                            " " +
                            attendance.ofEmployee?.lname}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Route
                            sx={{
                              width: "15px",
                              height: "15px",
                              mr: "5px",
                              color: "secondary.main",
                            }}
                          />
                          {attendance?.ofEmployee?.pickUp?.address}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ ...RowFlex, width: "20%" }}>
                      {attendance?.isPresent ? (
                        <DoneAll
                          sx={{
                            backgroundColor: "primary.main",
                            borderRadius: "100px",
                            p: 0.5,
                            width: "40px",
                            height: "40px",
                            color:"text.primary",
                          }}
                        />
                      ) : (
                        <Close
                          sx={{
                            backgroundColor: "error.main",
                            borderRadius: "100px",
                            p: 0.5,
                            width: "40px",
                            height: "40px",
                            color:"text.primary",
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })
            : routeState?.passengers?.map((employee: any) => {
                // console.log(employee);
                return (
                  <Box key={employee?._id} sx={{ ...RowFlex, width: "100%" }}>
                    <Box
                      sx={{
                        ...RowFlex,
                        width: "80%",
                        justifyContent: "flex-start",
                        gap: "20px",
                      }}
                    >
                      <Avatar
                        sx={{ width: "40px", height: "40px" }}
                        src={baseURL + employee.profilePicture}
                      />
                      <Box>
                        <Typography
                          sx={{ fontSize: "1.25rem", fontWeight: 500 }}
                        >
                          {employee.fname + " " + employee.lname}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Route
                            sx={{
                              width: "15px",
                              height: "15px",
                              mr: "5px",
                              color: "secondary.main",
                            }}
                          />
                          {employee.pickUp?.address}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ ...RowFlex, width: "20%" }}>
                      <NotListedLocation
                        sx={{
                          backgroundColor: "info.main",
                          borderRadius: "100px",
                          p: 0.5,
                          width: "40px",
                          height: "40px",
                          color:"text.primary",
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
        </Box>
      </Box>
      {/* RS */}
      <Box
        sx={{
          ...ColFlex,
          //   flex: 6.5,
          width: "70%",
          backgroundColor: "background.default",
          height: "100%",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        {routeData ? (
          <MapComponent
            center={
              routeData?.cabPath
                ? (routeData?.cabPath[
                    Math.floor(routeData?.cabPath?.length / 2)
                  ] as LatLngExpression)
                : [34.071635, 74.803872]
            }
            zoom={12}
            mode="route-view"
            routePathArray={routeData?.cabPath as []}
            employees={routeData?.passengers as [EmployeeTypes]}
            height="100%"
            visibleOffice={routeData?.workLocation}
          />
        ) : (
          <CircularProgress />
        )}
        {/* CALCULATED + MEASURED TIME & DISTANCE */}
        <Box
          sx={{
            ...ColFlex,
            gap: "15px",
            position: "absolute",
            alignItems: "flex-end",
            top: "25px",
            right: "25px",
            zIndex: "999",
          }}
        >
          {/* DISTANCE */}
          <Box
            sx={{
              ...RowFlex,
              gap: "5px",
              backgroundColor: "primary.main",
              padding: "10px 20px",
              borderRadius: "15px",
              minWidth: "10%",
            }}
          >
            <NavigationOutlined
              sx={{ color:"text.primary", width: "30px", height: "30px" }}
            />
            <Typography sx={{ color:"text.primary" }} variant="h5" fontWeight={600}>
              {routeState?.totalDistance}{" "}
              <span style={{ fontWeight: 500 }}>kms</span>
            </Typography>
          </Box>
          {/* TIME */}
          <Box
            sx={{
              ...RowFlex,
              gap: "5px",
              backgroundColor: "warning.main",
              padding: "10px 20px",
              borderRadius: "15px",
            }}
          >
            <AccessTimeOutlined
              sx={{ color:"text.primary", width: "30px", height: "30px" }}
            />
            <Typography sx={{ color:"text.primary" }} variant="h5" fontWeight={600}>
              {routeState?.estimatedTime}{" "}
              <span style={{ fontWeight: 500 }}>mins</span>
            </Typography>
          </Box>
        </Box>
        {/* EMPS */}
        <Box
          sx={{
            ...ColFlex,
            position: "absolute",
            bottom: "25px",
            right: "25px",
            zIndex: "999",
            width: "30%",
            // gap: "10px",
            // border: "2px solid #212A3B",
            p: "15px",
            borderRadius: "15px",
            alignItems: "flex-start",
            backgroundColor: "background.default",
            transition: "all 1s",
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Capacity {routeState?.passengers?.length || 0} of{" "}
            {(routeState?.cab as Cabtypes)?.seatingCapacity} occupied
          </Typography>
          {/* DRIVER */}
          <Box sx={{ ...ColFlex, p: 2.5, gap: 2.5 }}>
            <Box
              sx={{
                ...RowFlex,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  ...RowFlex,
                  width: "100%",
                  justifyContent: "flex-start",
                  gap: "10px",
                }}
              >
                <Avatar
                  sx={{ width: "30px", height: "30px" }}
                  src={
                    baseURL +
                    ((routeState?.cab as Cabtypes)?.cabDriver as EmployeeTypes)
                      ?.profilePicture
                  }
                />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {"Cab " +
                      (routeState?.cab as Cabtypes)?.cabNumber +
                      " - " +
                      (
                        (routeState?.cab as Cabtypes)
                          ?.cabDriver as EmployeeTypes
                      )?.fname +
                      " " +
                      (
                        (routeState?.cab as Cabtypes)
                          ?.cabDriver as EmployeeTypes
                      )?.lname}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                ...RowFlex,
                justifyContent: "space-between",
                width: "100%",
                gap: 2.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  color: "orange",
                }}
                fontWeight={500}
              >
                <Tag
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "orange",
                  }}
                />
                {(routeState?.cab as Cabtypes)?.cabNumber}
              </Typography>

              <Typography
                sx={{
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  color: "primary.main",
                }}
                fontWeight={500}
              >
                <Groups2
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "primary.main",
                  }}
                />
                {(routeState?.cab as Cabtypes)?.seatingCapacity}
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  color: "green",
                }}
                fontWeight={500}
              >
                <FormatColorFill
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "green",
                  }}
                />
                {(routeState?.cab as Cabtypes)?.carColor}
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  color: "black",
                }}
                fontWeight={500}
              >
                <DirectionsCar
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "black",
                  }}
                />
                {(routeState?.cab as Cabtypes)?.numberPlate}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ViewRoute;
