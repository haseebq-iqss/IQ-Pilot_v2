import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, Box, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex.ts";
import { Route } from "@mui/icons-material";
import baseURL from "../../utils/baseURL.ts";
import EmployeeTypes from "../../types/EmployeeTypes.ts";

const PassengerTab = ({
  // id,
  passenger,
}: {
  // id: string;
  passenger: EmployeeTypes;
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: passenger.id,
    data: {
      type: "Task",
      task: passenger,
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
          opacity: 0.3,
          backgroundColor: "grey",
          padding: "0.625rem", // 2.5px
          height: "100px",
          minHeight: "20px",
          alignItems: "center",
          display: "flex",
          minWidth: "32%",
          textAlign: "left",
          borderRadius: "0.75rem",
          borderWidth: "2px",
          borderColor: "#FF00A0",
          borderStyle: "solid",
          cursor: "grab",
          position: "relative",
        }}
      />
    );
  }
  return (
    <>
      <Box
        sx={{
          ...ColFlex,
          justifyContent: "flex-start",
          width: "32%",
          height: "5rem",
          minHeight: "4rem",
          backgroundColor: "background.default",
          padding: "4px",
          borderRadius: "1rem",
          // boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
          border: "3px solid rgba(105 105 105 / 0.46)",
          cursor: "grab",
        }}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
      >
        <Box
          sx={{
            ...RowFlex,
            width: "100%",
            // paddingBottom: "4px",
            // borderBottom: "1px solid #BDBDBD",
            height: "100%",
          }}
        >
          <Box
            sx={{
              ...RowFlex,
              width: "90%",
              justifyContent: "flex-start",
              gap: "10px",
            }}
          >
            <Avatar
              sx={{ width: "35px", height: "35px" }}
              src={baseURL + passenger?.profilePicture}
            />
            <Box>
              <Typography fontSize={13} fontWeight={600}>
                {passenger?.fname + " " + passenger?.lname}
              </Typography>
              <Typography
                sx={{
                  width: "100%", // Adjust width if needed
                  fontSize: "0.7rem",
                  color: "grey",
                  wordWrap: "break-word", // Enable word wrapping
                  whiteSpace: "normal", // Allow text to wrap to the next line
                  overflowWrap: "break-word", // Break words if necessary
                }}
                fontWeight={500}
              >
                <Route
                  sx={{
                    width: "12.5px",
                    height: "12.5px",
                    mr: "5px",
                    color: "primary.main",
                  }}
                />
                {passenger?.pickUp?.address}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default PassengerTab;
