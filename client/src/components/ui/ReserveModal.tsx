import { useDroppable } from "@dnd-kit/core";
import { Box } from "@mui/material";
import ReservedPassengersTab from "./ReservedPassengersTab";

const ReserveModal = ({ reservedPassengers }) => {
  const { setNodeRef } = useDroppable({
    id: "reserve-modal",
    data: {
      type: "Reserve",
    },
  });

  return (
    <Box
      sx={{
        zIndex: "1",
        position: "absolute",
        right: "19rem",
        top: "5.5rem",
        backgroundColor: "white",
        borderRadius: "1rem",
        width: "20rem",
        height: "20rem",
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
      }}
      ref={setNodeRef}
    >
      {reservedPassengers.map((rPassenger, index) => (
        <ReservedPassengersTab key={index} passenger={rPassenger} />
      ))}
    </Box>
  );
};

export default ReserveModal;
