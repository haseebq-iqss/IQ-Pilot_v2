import { Avatar, Box, Button, Divider, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import { Call, LocationOn, Mail, Person } from "@mui/icons-material";
import EmployeeTypes from "../../types/EmployeeTypes";
import baseURL from "../../utils/baseURL";
import Convert24To12HourFormat from "../../utils/24HourTo12HourFormat";

function TeamMemberProfile() {
  const location = useLocation();
  const employee: EmployeeTypes = location?.state;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        p: 2.5,
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
      <Box
        sx={{
          height: "30vh",
          ...RowFlex,
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          p: 3,
        }}
      >
        <Box
          sx={{
            borderRadius: 2,
            ...RowFlex,
            gap: 2.5,
          }}
        >
          <Avatar
            alt={employee?.fname}
            src={
              employee?.profilePicture
                ? baseURL + employee?.profilePicture
                : "/images/default_user.png"
            }
            style={{
              width: "10.5rem",
              height: "10.5rem",
              borderRadius: "20px",
              objectFit: "cover",
              aspectRatio: "1.5",
            }}
          />
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "text.primary" }}
            >
              {employee?.fname + " " + employee?.lname}
            </Typography>
            <Box sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}>
              <Typography
                // variant="h5"
                fontWeight={500}
                sx={{ color: "text.primary", mb: 2, fontSize: "1.4rem" }}
              >
                {employee?.department}
              </Typography>
              <Typography
                // variant="h5"
                fontWeight={500}
                sx={{ color: "text.primary", mb: 2, fontSize: "1.4rem" }}
              >
                |
              </Typography>
              <Typography
                fontWeight={500}
                sx={{ color: "text.primary", mb: 2, fontSize: "1.4rem" }}
              >
                {employee?.workLocation}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                ...RowFlex,
                gap: 5,
                justifyContent: "start",
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1rem",
                  ...RowFlex,
                  gap: "6px",
                  color: "text.primary",
                }}
              >
                <Mail
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "warning.main",
                  }}
                />
                <span style={{ fontWeight: 600 }}>Email: </span>
                {employee?.email}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1rem",
                  color: "text.primary",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <Call sx={{ fontSize: "1rem", color: "success.main" }} />
                <span style={{ fontWeight: 700 }}>Phone Number: </span>
                +91-{employee?.phone}
              </Typography>
            </Box>
            <Box
              sx={{
                ...RowFlex,
                justifyContent: "start",
                gap: 4,
                alignItems: "flex-start",
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1rem",
                  color: "text.primary",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <LocationOn sx={{ fontSize: "1rem", color: "error.main" }} />
                <span style={{ fontWeight: 700 }}>Address: </span>
                {employee?.pickUp?.address}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            ...ColFlex,
            height: "10rem",
            alignItems: "end",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ ...ColFlex, gap: 0, alignItems: "flex-end" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "text.primary", m: 0, p: 0 }}
            >
              {(employee?.isCabCancelled as any) === false
                ? "In Office"
                : "Out of Office"}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={500}
              sx={{ color: "text.primary" }}
            >
              {Convert24To12HourFormat(employee?.currentShift as string)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{
              width: "100%",
              bgcolor: "#9329FC",
              color: "white",
              p: "2",
            }}
          >
            <Person sx={{ marginRight: 0.7, fontSize: "1.3rem" }} />
            {`Change ${employee?.fname + "'s "} Profile`}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default TeamMemberProfile;
