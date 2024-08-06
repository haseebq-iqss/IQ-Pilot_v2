import {
  Avatar,
  Box,
  Typography,
} from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ColFlex, RowFlex } from "../../style_extentions/Flex.ts";
import baseURL from "../../utils/baseURL.ts";
import EmployeeTypes from "./../../types/EmployeeTypes";
import { useEffect, useMemo, useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ShiftTypes } from "../../types/ShiftTypes.ts";
import { useDroppable } from "@dnd-kit/core";
import {
  AccessTime,
  AirlineSeatReclineNormal,
  LocationOn,
} from "@mui/icons-material";
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat.ts";
import MapComponent from "../Map.tsx";
import AssignedPassengers from "./AssignedPassengers.tsx";

type RosterCardTypes = {
  passengerDetails: EmployeeTypes[];
  column: ShiftTypes;
};

const RosterCard = ({ passengerDetails, column }: RosterCardTypes) => {
  const [activeRouteCoords, setActiveRouteCoords] = useState<Array<any>>([]);
  // const [expanded, setExpanded] = useState<string[]>(["map"]); 

  useEffect(() => {
    const activeRouteCoordinates: any = passengerDetails?.map(
      (employee: EmployeeTypes) => employee?.pickUp?.coordinates
    );

    setActiveRouteCoords(activeRouteCoordinates);
  }, [passengerDetails]);

  const routesCP: any = activeRouteCoords.slice(
    0,
    activeRouteCoords.length / 2
  );
  const routesCentralPoint: any = routesCP.at(-1);

  const tasksIds = useMemo(() => {
    return passengerDetails.map((passenger) => passenger.id);
  }, [passengerDetails]);

  const { setNodeRef } = useDroppable({
    id: column?.id,
    data: {
      type: "Column",
      column: { ...column, passengers: passengerDetails },
    },
  });

  // const handleAccordionChange =
  //   (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
  //     setExpanded((prevExpanded) =>
  //       isExpanded
  //         ? [...prevExpanded, panel]
  //         : prevExpanded.filter((item) => item !== panel)
  //     );
  //   };

  console.log(column)

  return (
    <Box
      sx={{
        ...ColFlex,
        p: "5px 15px",
        minWidth: "27vw",
        maxWidth: "47.5%",
        height: "100%",
        flexDirection: "column",
        borderRadius: "15px",
        justifyContent: "flex-start",
        backgroundColor: "white",
        border:
          column?.typeOfRoute === "pickup"
            ? "8px solid #2997FC"
            : "8px solid #144B7E",
        ":hover": {
          transition: "all 0.4s",
          transform: "scale(1.025)",
        },
        ":not(:hover)": {
          transition: "all 0.2s",
          transform: "scale(1)",
        },
      }}
      ref={setNodeRef}
    >
      <Box
        sx={{
          ...RowFlex,
          gap: "1rem",
          justifyContent: "start",
          width: "100%",
          p: "10px 10px 5px 10px",
        }}
      >
        <Box>
          <Avatar
            src={
              baseURL + (column.cab?.cabDriver as EmployeeTypes)?.profilePicture
            }
          />
        </Box>
        <Box sx={{ ...ColFlex, alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {(column.cab?.cabDriver as EmployeeTypes)?.fname +
                " " +
                (column.cab?.cabDriver as EmployeeTypes)?.lname}
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
              {column?.workLocation}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                color: column?.typeOfRoute === "pickup" ? "#2997FC" : "orange",
              }}
              fontWeight={500}
            >
              <AirlineSeatReclineNormal
                sx={{
                  width: "17px",
                  height: "17px",
                  mr: "2px",
                  color:
                    column?.typeOfRoute === "pickup" ? "#2997FC" : "orange",
                }}
              />
              {column?.typeOfRoute &&
                column.typeOfRoute[0].toUpperCase() +
                  column.typeOfRoute.slice(1, column.typeOfRoute.length)}
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
                column?.currentShift as string,
                column?.typeOfRoute
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          borderRadius: "10px",
          border: "none",
        }}
      >
        <Typography
          sx={{
            color: "black",
            marginBottom: "8px",
          }}
          fontWeight={600}
        >
          Passengers ({passengerDetails.length})
        </Typography>
        <Box
          className="child-scroll"
          sx={{
            ...RowFlex,
            alignItems: "flex-start",
            width: "100%",
            height: "7rem",
            gap: 1.5,
            justifyContent: "flex-start",
            overflowY: "auto",
            px: 1,
            py: 1.2,
            borderRadius: "1rem",
            transition: "all 0.5s ease-in",
            backgroundColor:"primary.main",
            flexWrap: "wrap",
          }}
        >
          <SortableContext
            items={tasksIds}
            strategy={verticalListSortingStrategy}
          >
            {passengerDetails?.map((passenger: EmployeeTypes) => (
              <AssignedPassengers passenger={passenger} key={passenger.id} />
            ))}
          </SortableContext>
        </Box>
      </Box>

      <Box
            className="child-scroll"
            sx={{
              ...ColFlex,
              mt:2.5,
              borderRadius:2,
              alignItems: "flex-start",
              width: "100%",
              height: "100%",
              justifyContent: "flex-start",
              overflowY: "auto",
            }}
          >
            <MapComponent
              mode="route-view"
              activeRoute={
                column.workLocation === "Rangreth"
                  ? [...activeRouteCoords, [33.996807, 74.79202]]
                  : [...activeRouteCoords, [34.173415, 74.808653]]
              }
              zoom={11}
              center={routesCentralPoint}
            />
          </Box>
    </Box>
  );
};

export default RosterCard;