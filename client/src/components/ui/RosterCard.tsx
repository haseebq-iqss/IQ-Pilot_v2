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

type RosterCardTypes = {
  passengerDetails: EmployeeTypes[];
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
  column: ShiftTypes;
};

const RosterCard = ({
  passengerDetails,
  // cab,
  column,
}: RosterCardTypes) => {
  const cabDriverDetails = Array.isArray(column?.cab?.cabDriver)
    ? (column?.cab?.cabDriver[0] as EmployeeTypes | undefined)
    : undefined;

  const tasksIds = useMemo(() => {
    return passengerDetails.map((passenger) => passenger.id || "");
  }, [passengerDetails]);

  const { setNodeRef } = useDroppable({
    id: column?.id,
    data: {
      type: "Column",
      column: { ...column, passengers: passengerDetails },
    },
  });
  return (
    <>
      <Box
        sx={{
          ...ColFlex,
          // minWidth: "30.5vw",
          // maxWidth: "32vw",
          width: "100%",
          height: "50%",
          flexDirection: "column",
          p: "20px",
          borderRadius: "15px",
          backgroundColor: "background.default",
          boxShadow:
            passengerDetails?.length !== column?.cab?.seatingCapacity
              ? "0px 9px 10px rgba(227 0 0 / 0.30)"
              : "none",

          scale: "0.975",
          color: "text.primary",
          transition: "all 1s",
          justifyContent: "flex-start",
          border:
            passengerDetails?.length === column?.cab?.seatingCapacity
              ? "none"
              : "3px solid rgba(255 0 0 / 0.66)",
          gap: "0.5rem",
          ":hover": {
            minWidth: "32.5vw",
            transition: "all 0.3s",
            // transition:"all 0.3 ease"
          },
          ":not(:hover)": {
            minWidth: "30.5vw",
            transition: "all 0.2s",
            // transition:"all 0.3 ease"
          },
        }}
        ref={setNodeRef}
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
          sx={{ ...RowFlex, flexDirection: {xs: "column", lg:"row"}, width: "100%", justifyContent: "space-between" }}
        >
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
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ fontSize: "1rem" }}
                >
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
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    color: "orange",
                  }}
                  fontWeight={500}
                >
                  <TagIcon
                    sx={{
                      width: "15px",
                      height: "15px",
                      mr: "2px",
                      color: "orange",
                    }}
                  />
                  {column?.cab?.cabNumber}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    color: "primary.main",
                  }}
                  fontWeight={500}
                >
                  <Groups2Icon
                    sx={{
                      width: "15px",
                      height: "15px",
                      mr: "2px",
                      color: "primary.main",
                    }}
                  />
                  {column?.cab?.seatingCapacity}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    color: column?.cab?.carColor,
                    textShadow:
                      "#FFF 0px 0px 10px, #FF2D95 0px 0px 40px, -24px 5px 3px rgba(206,89,55,0);",
                  }}
                  fontWeight={500}
                >
                  <FormatColorFillIcon
                    sx={{
                      width: "15px",
                      height: "15px",
                      mr: "2px",
                      color: column?.cab?.carColor,
                    }}
                  />
                  {column?.cab?.carColor}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    color: "text.primary",
                  }}
                  fontWeight={500}
                >
                  <DirectionsCarIcon
                    sx={{
                      width: "15px",
                      height: "15px",
                      mr: "2px",
                      color: "text.primary",
                    }}
                  />
                  {column?.cab?.numberPlate}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              ...ColFlex,
              width: "100%",
              alignItems: "end",
              my: 2,
              mb: 0,
              gap: "0.8rem",
            }}
          >
            <Typography fontSize={18} fontWeight={600} sx={{ mr: 2.5 }}>
              <span
                style={{
                  color:
                    passengerDetails?.length !== column?.cab?.seatingCapacity
                      ? "crimson"
                      : "#2997FC",
                }}
              >
                {passengerDetails?.length +
                  " " +
                  "out of " +
                  column?.cab?.seatingCapacity}
              </span>{" "}
              Seats Used
            </Typography>
          </Box>
        </Box>
        <Box
          className="child-scroll"
          sx={{
            ...ColFlex,
            flexDirection: "row",
            mt: 1,
            flexWrap: "wrap",
            alignItems: "flex-start",
            width: "100%",
            gap: 1,
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
