import { Avatar, Box, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex.ts";
import TagIcon from "@mui/icons-material/Tag";
import Groups2Icon from "@mui/icons-material/Groups2";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

import baseURL from "../../utils/baseURL.ts";
import Cabtypes from "./../../types/CabTypes";
import EmployeeTypes from "./../../types/EmployeeTypes";
import { useEffect, useMemo, useState } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import PassengerTab from "./PassengerTab.tsx";
import { CSS } from "@dnd-kit/utilities";
import { ShiftTypes } from "../../types/ShiftTypes.ts";

type RosterCardTypes = {
  passengerDetails: EmployeeTypes[];
  // cab: Cabtypes;
  setRosterData: React.Dispatch<
    React.SetStateAction<
      {
        cab: Cabtypes;
        passengers: EmployeeTypes[];
      }[]
    >
  >;
  // id: string;
  column: ShiftTypes;
};

const RosterCard = ({
  passengerDetails,
  // cab,
  column,
  setRosterData,
}: RosterCardTypes) => {
  const cabDriverDetails = (column?.cab?.cabDriver)[0];
  const [passengers, setPassengers] = useState(passengerDetails);
  const cab = column.cab;

  useEffect(() => {
    const newData = {
      cab,
      passengers,
    };
    setRosterData((prevData) => {
      if (
        prevData.some(
          (item) => item.cab === cab && item.passengers === passengers
        )
      ) {
        return prevData;
      } else {
        return [...prevData, newData];
      }
    });
  }, [cab, passengers, setRosterData, column]);

  const tasksIds = useMemo(() => {
    return passengerDetails.map((passenger) => passenger.id);
  }, [passengerDetails]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column?.id,
    data: {
      type: "Column",
      column: { ...column, passengers: passengerDetails },
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          backgroundColor: "grey",
          opacity: 0.4,
          borderWidth: "2px",
          borderColor: "#D946EF",
          borderStyle: "solid",
          width: "27.5vw",
          height: "90rem",
          maxHeight: "90%",
          borderRadius: "0.375rem",
          display: "flex",
          flexDirection: "column",
        }}
      ></div>
    );
  }
  return (
    <>
      <Box
        sx={{
          ...ColFlex,
          width: "27.5vw",
          height: "90%",
          flexDirection: "column",
          p: "20px",
          borderRadius: "15px",
          backgroundColor: "white",
          transition: "all 1s",
          justifyContent: "flex-start",
          gap: "0.5rem",
        }}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
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
                {column?.cab?.cabNumber}
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
                {column?.cab?.seatingCapacity}
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
                {column?.cab?.carColor}
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
                {column?.cab?.numberPlate}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ ...ColFlex, width: "100%", my: 2, gap: "0.8rem" }}>
          <Typography fontSize={24} fontWeight={600}>
            <span
              style={{
                color:
                  passengerDetails?.length !== column?.cab?.seatingCapacity
                    ? "crimson"
                    : "#2997FC",
              }}
            >
              {passengerDetails?.length + " " + "out of 6"}
            </span>{" "}
            Seats Used
          </Typography>
          <hr
            style={{
              border: "2px solid #D8D8D8",
              width: "40%",
              borderRadius: 100,
            }}
          />
        </Box>

        <Box
          className="child-scroll"
          sx={{
            ...ColFlex,
            alignItems: "flex-start",
            width: "100%",
            gap: 1.5,
            justifyContent: "flex-start",
            overflowY: "auto",
            px: 1.5,
            py: 1,
          }}
        >
          <SortableContext
            items={tasksIds}
            strategy={verticalListSortingStrategy}
          >
            {passengerDetails?.map((passenger: EmployeeTypes) => (
              <PassengerTab
                // id={passenger._id!}
                passenger={passenger}
                key={passenger.id}
              />
            ))}
          </SortableContext>
        </Box>
        {/* </DndContext> */}
      </Box>
    </>
  );
};

export default RosterCard;
