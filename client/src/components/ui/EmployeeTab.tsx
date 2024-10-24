import { Box, Avatar, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import baseURL from "../../utils/baseURL";
import { LocationOn, Route } from "@mui/icons-material";
import EmployeeTypes from "../../types/EmployeeTypes";

function EmployeeTab({
  passenger,
  newEmployeeSetter,
}: {
  passenger: EmployeeTypes;
  newEmployeeSetter: (employee: EmployeeTypes) => void;
}) {
  return (
    <Box
      sx={{
        ...ColFlex,
        justifyContent: "flex-start",
        width: "100%",
        height: "5rem",
        minHeight: "4rem",
        backgroundColor: "background.default",
        padding: "4px",
        borderRadius: "1rem",
        // boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        border: "3px solid rgba(105 105 105 / 0.46)",
        cursor: "pointer",
      }}
      onClick={() => {
        newEmployeeSetter(passenger);
      }}
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
            <Typography
              fontSize={13}
              fontWeight={600}
              sx={{ color: "text.primary" }}
            >
              {passenger?.fname + " " + passenger?.lname}
              <LocationOn
                sx={{
                  width: "12.5px",
                  height: "12.5px",
                  ml: "10px",
                  mr: "5px",
                  color: "error.main",
                }}
              />
              {passenger?.workLocation}
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
                  mx: "5px",
                  color: "primary.main",
                }}
              />
              {passenger?.pickUp?.address}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default EmployeeTab;
