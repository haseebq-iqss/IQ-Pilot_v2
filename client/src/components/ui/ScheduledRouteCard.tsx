import { Avatar, Box, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex.ts";
import baseURL from "../../utils/baseURL.ts";

import EmployeeTypes from "./../../types/EmployeeTypes";
import AssignedPassengers from "./AssignedPassengers.tsx";
import MapComponent from "../Map.tsx";
import { useEffect, useState } from "react";
import RouteTypes from "../../types/RouteTypes.ts";
import { AccessTime, AirlineSeatReclineNormal, LocationOn } from "@mui/icons-material";
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat.ts";
import { ShiftTypes } from "../../types/ShiftTypes.ts";

type RosterCardTypes = {
  // passengerDetails: EmployeeTypes[];
  // cab: Cabtypes;
  // setRosterData: React.Dispatch<
  //   React.SetStateAction<
  //     {
  //       cab: Cabtypes;
  //       passengers: EmployeeTypes[];
  //     }[]
  //   >
  // >;
  // id: string;
  // column: ShiftTypes;
  scheduledRoutes: ShiftTypes;
};

const ScheduledRouteCard = ({
  //   passengerDetails,
  //   // cab,
  scheduledRoutes,
}: RosterCardTypes) => {
  // console.log("SRC --------> ", scheduledRoutes);
  // const cabDriverDetails = Array.isArray(scheduledRoutes?.cab?.cabDriver)
  //   ? (scheduledRoutes?.cab?.cabDriver as EmployeeTypes | undefined)
  //   : undefined;

  const [activeRouteCoords, setactiveRouteCoords] = useState<Array<any>>([]);

  useEffect(() => {
    const activeRouteCoordinates:any = (
      scheduledRoutes as unknown as RouteTypes
    )?.passengers?.map((employee: any) => employee?.pickUp?.coordinates);

    setactiveRouteCoords(activeRouteCoordinates);
  }, []);

  const routesCP: any = activeRouteCoords.slice(
    0,
    activeRouteCoords.length / 2
  );
  const routesCentralPoint: any = routesCP.at(-1);

  const cabDriverDetails = scheduledRoutes?.cab?.cabDriver as EmployeeTypes;

  // console.log(cabDriverDetails);
  //   const tasksIds = useMemo(() => {
  //     return passengerDetails.map((passenger) => passenger.id);
  //   }, [passengerDetails]);

  // const {
  //   setNodeRef,
  //   attributes,
  //   listeners,
  //   transform,
  //   transition,
  //   isDragging,
  // } = useSortable({
  //   id: column?.id,
  //   data: {
  //     type: "Column",
  //     column: { ...column, passengers: passengerDetails },
  //   },
  // });

  // const style = {
  //   transition,
  //   transform: CSS.Transform.toString(transform),
  // };
  // if (isDragging) {
  //   return (
  //     <div
  //       ref={setNodeRef}
  //       style={{
  //         ...style,
  //         backgroundColor: "grey",
  //         opacity: 0.4,
  //         borderWidth: "2px",
  //         borderColor: "#D946EF",
  //         borderStyle: "solid",
  //         width: "27.5vw",
  //         height: "90rem",
  //         maxHeight: "90%",
  //         borderRadius: "0.375rem",
  //         display: "flex",
  //         flexDirection: "column",
  //       }}
  //     ></div>
  //   );
  // }
  //   const { setNodeRef } = useDroppable({
  //     id: column?.id,
  //     data: {
  //       type: "Column",
  //       column: { ...column, passengers: passengerDetails },
  //     },
  //   });
  return (
    <>
      <Box
        sx={{
          ...ColFlex,
          minWidth: "27.5vw",
          maxWidth: "35vw",
          height: "95%",
          flexDirection: "column",
          
          borderRadius: "15px",
          backgroundColor: "white",
          // transition: "all 0.4s",
          justifyContent: "flex-start",
          gap: "0.5rem",
          border: "8px solid #2997FC",
          
          ":hover" : {
            transition: "all 0.4s",
            transform: "scale(1.025)",
            // minWidth: "35.5vw",
            // transition:"all 0.3 ease"
          },
          ":not(:hover)" : {
            transition: "all 0.2s",
            transform: "scale(1)",
            // minWidth: "27.5vw",
            // transition:"all 0.3 ease"
          }
        }}
        // ref={setNodeRef}
        // {...attributes}
        // {...listeners}
        // style={style}
      >
        {/* <DndContext
          onDragEnd={handleDragEnd}
          // onDragStart={() => setIsDragging(true)}
          collisionDetection={closestCorners}
          // onDragOver={onDragOver}
          sensors={sensors}
        > */}
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
                Cab {scheduledRoutes?.cab?.cabNumber} - {cabDriverDetails?.fname + " " + cabDriverDetails?.lname}
              </Typography>
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
                  color: "blue",
                }}
                fontWeight={600}
              >
                <LocationOn
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "blue",
                  }}
                />
                {(scheduledRoutes?.workLocation)}
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
                <AirlineSeatReclineNormal
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "primary.main",
                  }}
                />
                {scheduledRoutes?.typeOfRoute && (scheduledRoutes?.typeOfRoute)[0].toUpperCase() + (scheduledRoutes?.typeOfRoute).slice(1,scheduledRoutes?.typeOfRoute.length)}
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
                <AccessTime
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "black",
                  }}
                />
                {ConvertShiftTimeTo12HrFormat(scheduledRoutes?.currentShift as string , scheduledRoutes?.typeOfRoute)}
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
            bgcolor: "#2997FC",
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
            <span>{`Passengers(${scheduledRoutes?.passengers && scheduledRoutes?.passengers.length})`}</span>{" "}
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
              {scheduledRoutes?.passengers?.map((passenger: EmployeeTypes) => (
                // <PassengerTab
                //   // id={passenger._id!}
                //   passenger={passenger}
                //   key={passenger.id}
                // />
                <AssignedPassengers passenger={passenger} />
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
            // gap: 1.5,
            justifyContent: "flex-start",
            overflowY: "auto",
            p: 1,
            // borderRadius: "10px",
            // overflow: "hidden",
          }}
        >
          <MapComponent
            mode="route-view"
            activeRoute={scheduledRoutes?.workLocation === "Rangreth" ? [...activeRouteCoords, [33.996807, 74.79202]] : [...activeRouteCoords, [34.173415, 74.808653]]}
            zoom={12}
            center={routesCentralPoint}
          />
          {/* <SortableContext
            // items={tasksIds}
            strategy={verticalListSortingStrategy}
          > */}
          {/* {scheduledRoutes?.passengers?.map((passenger: EmployeeTypes) => (
            // <PassengerTab
            //   // id={passenger._id!}
            //   passenger={passenger}
            //   key={passenger.id}
            // />
            <AssignedPassengers passenger={passenger} />
          ))} */}
          {/* </SortableContext> */}
        </Box>
        {/* </DndContext> */}
      </Box>
    </>
  );
};

export default ScheduledRouteCard;
