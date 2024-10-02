import {
  Call,
  ExpandMore,
  Flag,
  People,
  Route,
  WrongLocation,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/useAxios";
import SnackbarContext from "../../context/SnackbarContext";
import UserDataContext from "../../context/UserDataContext";
import RouteTypes from "../../types/RouteTypes";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import ConvertTo12HourFormat from "../../utils/12HourFormat";
import baseURL from "../../utils/baseURL";
import { UserContextTypes } from "../../types/UserContextTypes";
import { ColFlex, RowFlex } from "./../../style_extentions/Flex";

function DriverDashboard() {
  const { userData }: UserContextTypes = useContext(UserDataContext);

  const navigate = useNavigate();
  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const [isRouteSelected, setIsRouteSelected] = useState<any>({});

  const getAllDriverRoutes = () => {
    return useAxios.get(`routes/driverRoute/${userData?._id}`);
  };

  const { data: DriverRoutes, status: routesStatus } = useQuery({
    queryFn: getAllDriverRoutes,
    queryKey: ["All Driver's Routes"],
    select: (data: any) => {
      // console.log(data.data)
      return data.data.data;
    },
  });

  //   console.log(Object.values(DriverRoutes))

  const updateRouteStatus = (route: RouteTypes) => {
    return useAxios.patch(`routes/${route?._id}`, {
      routeStatus: "inProgress",
    });
  };

  const { mutate: UpdateRoute } = useMutation({
    mutationFn: updateRouteStatus,
    onSuccess: (data) => {
      // console.log(data.data);
      setOpenSnack({
        open: true,
        message: `Route was started!`,
        severity: "info",
      });
      const route = data.data?.updated_route;
      navigate("startRoute", { state: route });
      console.log(route);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  function HandleStartRoute(route: RouteTypes) {
    UpdateRoute(route);
    // console.log(route);
  }

  return (
    // Assigned Routes
    <Box
      sx={{
        ...ColFlex,
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
      {/* AR Header */}
      <Box
        sx={{
          ...RowFlex,
          width: "100%",
          gap: "15px",
          p: "15px",
        }}
      >
        {routesStatus === "success" ? (
          <Typography
            component={"div"}
            variant="h5"
            sx={{ fontWeight: 500, ...RowFlex, gap: "10px" }}
          >
            You have
            <Typography
              sx={{
                backgroundColor: "primary.main",
                color: "text.primary",
                borderRadius: "5px",
                px: "10px",
              }}
              variant="h5"
              fontWeight={600}
            >
              {/* <Route/> */}
              {DriverRoutes?.pickArr
                ? DriverRoutes?.pickArr.length + DriverRoutes?.dropArr.length
                : 0}{" "}
              Routes
            </Typography>{" "}
          </Typography>
        ) : (
          <CircularProgress sx={{ marginTop: 5 }} />
        )}
      </Box>
      {/* PICKUPS */}
      <Box
        sx={{
          ...ColFlex,
          width: "100%",
          gap: "20px",
          px: "0px",
          backgroundColor: "background.default",
          color: "text.primary",
        }}
      >
        {DriverRoutes?.pickArr?.length > 0 &&
          DriverRoutes?.pickArr?.length &&
          DriverRoutes?.pickArr.map((route: RouteTypes) => {
            return (
              <Accordion
                expanded={isRouteSelected === route}
                key={route?._id}
                sx={{
                  width: "100%",
                  backgroundColor:
                    isRouteSelected == route ? "background.default" : "text.primary",
                  color: isRouteSelected == route ? "text.primary" : "background.default",
                }}
                onClick={() => setIsRouteSelected(route)}
                elevation={1}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMore
                      sx={{
                        color: isRouteSelected == route ? "text.primary" : "background.default",
                      }}
                    />
                  }
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Box
                    sx={{
                      ...RowFlex,
                      width: "100%",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Route sx={{ width: "30px", height: "30px" }} />
                    <Typography variant="h5" fontWeight={600}>
                      {ConvertTo12HourFormat(route?.currentShift as string)}
                    </Typography>
                    <Box sx={{ ...RowFlex, gap: 1 }}>
                      <People sx={{ width: "30px", height: "30px" }} />
                      <Typography sx={{ mr: "15px" }} variant="h5">
                        {route?.passengers?.length}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ ...ColFlex, width: "100%", gap: "15px" }}>
                    {/* HEADER */}
                    <Box
                      sx={{
                        ...RowFlex,
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        component={"img"}
                        sx={{ width: "100px", aspectRatio: 2.6863 }}
                        src={
                          route?.typeOfRoute === "pickup"
                            ? "images/pickup-light.png"
                            : "images/drop-light.png"
                        }
                      />
                      <Button
                        onClick={() => HandleStartRoute(route)}
                        size="large"
                        variant="contained"
                        sx={{ borderRadius: "10px" }}
                        endIcon={<Flag />}
                      >
                        {route?.routeStatus === "inProgress"
                          ? "Continue Route"
                          : "Start Route"}
                      </Button>
                    </Box>
                    <Divider sx={{ width: "100%" }} />
                    <Box sx={{ ...ColFlex, width: "100%", gap: "10px" }}>
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
                                  src={baseURL + passenger?.profilePicture}
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
                              {!passenger?.isCabCancelled ? (
                                <ButtonBase
                                  component={"a"}
                                  href={`tel:${passenger?.phone}`}
                                  // onClick={() => handleRemovePassengersFromCab(employee)}
                                  sx={{
                                    ...RowFlex,
                                    width: "20%",
                                    borderRadius: "100px",
                                  }}
                                >
                                  <Call
                                    sx={{
                                      backgroundColor: "success.main",
                                      borderRadius: "100px",
                                      p: 1,
                                      width: "35px",
                                      height: "35px",
                                      color: "text.primary",
                                    }}
                                  />
                                </ButtonBase>
                              ) : (
                                <WrongLocation
                                  sx={{
                                    color: "error.main",
                                    mx: "10%",
                                    m: "auto",
                                  }}
                                />
                              )}
                            </Box>
                          );
                        })}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
      </Box>
      {/* DROPS */}
      <Box sx={{ ...ColFlex, width: "100%", gap: "20px", px: "0px" }}>
        {DriverRoutes?.dropArr?.length > 0 &&
          DriverRoutes?.dropArr?.length &&
          DriverRoutes?.dropArr.map((route: RouteTypes) => {
            return (
              <Accordion
                expanded={isRouteSelected === route}
                key={route?._id}
                sx={{
                  width: "100%",
                  backgroundColor:
                    isRouteSelected == route ? "text.primary" : "white",
                  color: isRouteSelected == route ? "white" : "text.primary",
                }}
                onClick={() => setIsRouteSelected(route)}
                elevation={1}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMore
                      sx={{
                        color: isRouteSelected == route ? "white" : "inherit",
                      }}
                    />
                  }
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Box
                    sx={{
                      ...RowFlex,
                      width: "100%",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Route sx={{ width: "30px", height: "30px" }} />
                    <Typography variant="h5" fontWeight={600}>
                      {ConvertTo12HourFormat(route?.currentShift as string)}
                    </Typography>
                    <Box sx={{ ...RowFlex, gap: 1 }}>
                      <People sx={{ width: "30px", height: "30px" }} />
                      <Typography sx={{ mr: "15px" }} variant="h5">
                        {route?.passengers?.length}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ ...ColFlex, width: "100%", gap: "15px" }}>
                    {/* HEADER */}
                    <Box
                      sx={{
                        ...RowFlex,
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        component={"img"}
                        sx={{ width: "100px", aspectRatio: 2.6863 }}
                        src={
                          route?.typeOfRoute === "pickup"
                            ? "images/pickup-light.png"
                            : "images/drop-light.png"
                        }
                      />
                      <Button
                        onClick={() => HandleStartRoute(route)}
                        size="large"
                        variant="contained"
                        sx={{ borderRadius: "10px" }}
                        endIcon={<Flag />}
                      >
                        {route?.routeStatus === "inProgress"
                          ? "Continue Route"
                          : "Start Route"}
                      </Button>
                    </Box>
                    <Divider sx={{ width: "100%" }} />
                    <Box sx={{ ...ColFlex, width: "100%", gap: "10px" }}>
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
                                  src={baseURL + passenger?.profilePicture}
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
                              {!passenger?.cancelCab ? (
                                <ButtonBase
                                  component={"a"}
                                  href={`tel:${passenger?.phone}`}
                                  // onClick={() => handleRemovePassengersFromCab(employee)}
                                  sx={{
                                    ...RowFlex,
                                    width: "20%",
                                    borderRadius: "100px",
                                  }}
                                >
                                  <Call
                                    sx={{
                                      backgroundColor: "success.main",
                                      borderRadius: "100px",
                                      p: 1,
                                      width: "35px",
                                      height: "35px",
                                      color: "text.primary",
                                    }}
                                  />
                                </ButtonBase>
                              ) : (
                                <WrongLocation
                                  sx={{
                                    color: "error.main",
                                    mx: "10%",
                                    m: "auto",
                                  }}
                                />
                              )}
                            </Box>
                          );
                        })}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
      </Box>
    </Box>
  );
}

export default DriverDashboard;
