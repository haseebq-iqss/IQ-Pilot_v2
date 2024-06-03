import { Box, Typography } from "@mui/material";
import { ColFlex } from "../../style_extentions/Flex";
import { useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import EmployeeTypes from "../../types/EmployeeTypes";
import ReservedPassengersTab from "./ReservedPassengersTab";

const ReserveModal = ({ passengerDetails, column }) => {
  const { setNodeRef } = useDroppable({
    id: column?.id,
    data: {
      type: "Reserve-Column",
      reservedColumn: { ...column, passengers: passengerDetails },
    },
  });

  const tasksIds = useMemo(() => {
    return (
      passengerDetails?.map((passenger: EmployeeTypes) => passenger?.id) || []
    );
  }, [passengerDetails]);

  return (
    <Box
      sx={{
        ...ColFlex,
        minWidth: "27.5vw",
        maxWidth: "27.5vw",
        height: "36.5rem",
        flexDirection: "column",
        p: "20px",
        borderRadius: "15px",
        backgroundColor: "white",
        transition: "all 1s",
        justifyContent: "flex-start",
        gap: "0.5rem",
      }}
      ref={setNodeRef}
    >
      <Box sx={{ ...ColFlex, width: "100%", my: 2, gap: "0.8rem" }}>
        <Typography fontSize={24} fontWeight={600}>
          Reserved ({passengerDetails?.length})
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
            <ReservedPassengersTab passenger={passenger} key={passenger?.id} />
          ))}
        </SortableContext>
      </Box>
    </Box>
  );
};

export default ReserveModal;
