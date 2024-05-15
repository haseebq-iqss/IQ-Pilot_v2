import { Avatar, Box, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex.ts";
import TagIcon from "@mui/icons-material/Tag";
import Groups2Icon from "@mui/icons-material/Groups2";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

import baseURL from "../../utils/baseURL.ts";

import EmployeeTypes from "./../../types/EmployeeTypes";
import { useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import PassengerTab from "./PassengerTab.tsx";
import { ShiftTypes } from "../../types/ShiftTypes.ts";
import { useDroppable } from "@dnd-kit/core";
import AssignedPassengers from "./AssignedPassengers.tsx";
import MapComponent from "../Map.tsx";

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
  scheduledRoutes: [];
};

const ScheduledRouteCard = ({
  //   passengerDetails,
  //   // cab,
  scheduledRoutes,
}: RosterCardTypes) => {
  console.log(scheduledRoutes);
  // const cabDriverDetails = Array.isArray(scheduledRoutes?.cab?.cabDriver)
  //   ? (scheduledRoutes?.cab?.cabDriver as EmployeeTypes | undefined)
  //   : undefined;

  const cabDriverDetails = scheduledRoutes?.cab?.cabDriver;

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
          width: "27.5vw",
          height: "95%",
          flexDirection: "column",

          borderRadius: "15px",
          backgroundColor: "white",
          transition: "all 1s",
          justifyContent: "flex-start",
          gap: "0.5rem",
          border: "8px solid #2997FC",
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
                {cabDriverDetails?.fname + " " + cabDriverDetails?.lname}
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
                  color: "orange",
                }}
                fontWeight={500}
              >
                <TagIcon
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "orange",
                  }}
                />
                {scheduledRoutes?.cab?.cabNumber}
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
                <Groups2Icon
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "primary.main",
                  }}
                />
                {scheduledRoutes?.cab?.seatingCapacity}
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
                <FormatColorFillIcon
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "green",
                  }}
                />
                {scheduledRoutes?.cab?.carColor}
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
                <DirectionsCarIcon
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "black",
                  }}
                />
                {scheduledRoutes?.cab?.numberPlate}
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
            <span>{`Passengers(${scheduledRoutes?.passengers.length})`}</span>{" "}
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
          <MapComponent />
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
