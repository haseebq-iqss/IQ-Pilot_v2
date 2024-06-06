import { Avatar, Box, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex.ts";
import baseURL from "../../utils/baseURL.ts";
import EmployeeTypes from "./../../types/EmployeeTypes";
import AssignedPassengers from "./AssignedPassengers.tsx";
import MapComponent from "../Map.tsx";
import { useEffect, useState } from "react";
import {
  AccessTime,
  AirlineSeatReclineNormal,
  LocationOn,
} from "@mui/icons-material";
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat.ts";
import { ShiftTypes } from "../../types/ShiftTypes.ts";

type RosterCardTypes = {
  passengerDetails: EmployeeTypes[];
  scheduledRoutes: ShiftTypes;
};

const ScheduledRouteCard = ({
  passengerDetails,
  //   // cab,
  scheduledRoutes,
}: RosterCardTypes) => {
  const [activeRouteCoords, setactiveRouteCoords] = useState<Array<any>>([]);
  useEffect(() => {
    const activeRouteCoordinates: any = passengerDetails?.map(
      (employee: EmployeeTypes) => employee?.pickUp?.coordinates
    );

    setactiveRouteCoords(activeRouteCoordinates);
  }, [passengerDetails]);

  const routesCP: any = activeRouteCoords.slice(
    0,
    activeRouteCoords.length / 2
  );
  const routesCentralPoint: any = routesCP.at(-1);

  const cabDriverDetails = scheduledRoutes?.cab?.cabDriver as EmployeeTypes;

  return (
    <>
      <Box
        sx={{
          ...ColFlex,
          minWidth: "30.5vw",
          maxWidth: "30vw",
          height: "95%",
          flexDirection: "column",

          borderRadius: "15px",
          backgroundColor: "white",
          // transition: "all 0.4s",
          justifyContent: "flex-start",
          gap: "0.5rem",
          border:
            scheduledRoutes?.typeOfRoute === "pickup"
              ? "8px solid #2997FC"
              : "8px solid #144B7E  ",

          ":hover": {
            transition: "all 0.4s",
            transform: "scale(1.025)",
          },
          ":not(:hover)": {
            transition: "all 0.2s",
            transform: "scale(1)",
          },
        }}
      >
        <Box
          sx={{
            ...RowFlex,
            gap: "1rem",
            justifyContent: "start",
            width: "100%",
            p: "15px",
          }}
        >
          <Box>
            <Avatar src={baseURL + cabDriverDetails?.profilePicture}></Avatar>
          </Box>
          <Box sx={{ ...ColFlex, alignItems: "flex-start" }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Cab {scheduledRoutes?.cab?.cabNumber} -{" "}
                {cabDriverDetails?.fname + " " + cabDriverDetails?.lname}
              </Typography>
            </Box>
            <Box
              sx={{
                ...RowFlex,
                justifyContent: "space-between",
                width: "100%",
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  color: "blue",
                }}
                fontWeight={600}
              >
                <LocationOn
                  sx={{
                    width: "17px",
                    height: "17px",
                    mr: "2px",
                    color: "blue",
                  }}
                />
                {scheduledRoutes?.workLocation}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  color:
                    scheduledRoutes?.typeOfRoute === "pickup"
                      ? "primary.main"
                      : "orange",
                }}
                fontWeight={500}
              >
                <AirlineSeatReclineNormal
                  sx={{
                    width: "17px",
                    height: "17px",
                    mr: "2px",
                    color:
                      scheduledRoutes?.typeOfRoute === "pickup"
                        ? "primary.main"
                        : "orange",
                  }}
                />
                {scheduledRoutes?.typeOfRoute &&
                  scheduledRoutes!.typeOfRoute[0].toUpperCase() +
                    scheduledRoutes!.typeOfRoute.slice(
                      1,
                      scheduledRoutes!.typeOfRoute.length
                    )}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  color: "black",
                }}
                fontWeight={500}
              >
                <AccessTime
                  sx={{
                    width: "17px",
                    height: "17px",
                    mr: "2px",
                    color: "black",
                  }}
                />
                {ConvertShiftTimeTo12HrFormat(
                  scheduledRoutes?.currentShift as string,
                  scheduledRoutes?.typeOfRoute
                )}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  color: "black",
                }}
                fontWeight={500}
              >
                <AccessTime
                  sx={{
                    width: "17px",
                    height: "17px",
                    mr: "2px",
                    color: "black",
                  }}
                />
                {scheduledRoutes?.daysRouteIsActive}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            ...ColFlex,
            width: "100%",
            // my: 2,
            gap: "0.8rem",
            bgcolor:
              scheduledRoutes?.typeOfRoute === "pickup" ? "#2997FC" : "#144B7E",
            alignItems: "flex-start",
          }}
        >
          <Box
            fontSize={20}
            fontWeight={600}
            sx={{
              ...ColFlex,
              color: "white",
              alignItems: "flex-start",
              p: "15px",
              gap: 1,
            }}
            width={"100%"}
          >
            <span>{`Passengers(${
              // scheduledRoutes?.passengers && scheduledRoutes?.passengers.length
              passengerDetails?.length
            })`}</span>{" "}
            <Box
              sx={{
                ...RowFlex,
                flexWrap: "wrap",
                justifyContent: "flex-start",
                width: " 100%",
                gap: 2,
                alignItems: "flex-start",
              }}
            >
              {passengerDetails?.map((passenger: EmployeeTypes) => (
                <AssignedPassengers passenger={passenger} key={passenger.id} />
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          className="child-scroll"
          sx={{
            ...ColFlex,
            alignItems: "flex-start",
            width: "100%",
            justifyContent: "flex-start",
            overflowY: "auto",
            p: 1,
          }}
        >
          <MapComponent
            mode="route-view"
            activeRoute={
              scheduledRoutes?.workLocation === "Rangreth"
                ? [...activeRouteCoords, [33.996807, 74.79202]]
                : [...activeRouteCoords, [34.173415, 74.808653]]
            }
            zoom={12}
            center={routesCentralPoint}
          />
        </Box>
      </Box>
    </>
  );
};

export default ScheduledRouteCard;
