import { Avatar, Box, Divider, Typography } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import {
  AddLocation,
  Business,
  Call,
  Email,
  LocationOn,
  Mail,
  Phone,
} from "@mui/icons-material";

function TeamMemberProfile() {
  const location = useLocation();
  console.log(location.state);

  return (
    <Box
      sx={{
        maxWidth: "100%",
        p: 2.5,
        backgroundColor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      <Box sx={{}}>
        <Box
          sx={{
            borderRadius: 2,
            ...RowFlex,
            gap: 5,
            p: 2.5,
            justifyContent: "start",
          }}
        >
          <Avatar
            // alt={location?.state?.fname}
            // src={baseURL + }
            style={{
              width: "12rem",
              height: "12rem",
              borderRadius: 10,
              objectFit: "cover",
              aspectRatio: "1.5",
            }}
          />
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", color: "text.primary", mb: 0.5 }}
            >
              {location?.state?.fname + " " + location?.state?.lname}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.primary", mb: 2 }}>
              {location?.state?.department}
            </Typography>

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
                  fontSize: "1.2rem",
                  ...RowFlex,
                  gap: "6px",
                  color: "text.primary",
                }}
              >
                <Mail sx={{ fontSize: "1.5rem", fontWeight: 600 }} />
                <span style={{ fontWeight: 600 }}>Email: </span>
                {location?.state?.email}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  color: "text.primary",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <Call sx={{ fontSize: "1.5rem" }} />
                <span style={{ fontWeight: 700 }}>Phone Number: </span>
                +91-{location?.state?.phone}
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
                  fontSize: "1.2rem",
                  color: "text.primary",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <LocationOn sx={{ fontSize: "1.5rem" }} />
                <span style={{ fontWeight: 700 }}>Address: </span>
                {location?.state?.pickUp?.address}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default TeamMemberProfile;
