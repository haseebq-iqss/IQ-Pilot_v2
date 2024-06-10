import { Typography, List, Divider, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";
import { useParams } from "react-router-dom";
import baseURL from "../../utils/baseURL";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Call } from "@mui/icons-material";
import Groups2Icon from "@mui/icons-material/Groups2";
import TagIcon from "@mui/icons-material/Tag";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

const DriverProfile = () => {
  const { id } = useParams();
  
  const { data: driverDetails } = useQuery({
    queryKey: ["driver-details"],
    queryFn: async () => {
      const response = await useAxios.get(`/cabs/${id}`);
      return response?.data?.data;
    },
  });

  const { data: driverRoutes } = useQuery({
    queryKey: ["driver-routes"],
    queryFn: async () => {
      const response = await useAxios.get(`routes/driverRoutesMonth/${id}`);
      return response?.data?.data;
    },
  });

  console.log(driverRoutes);

  return (
    <Box sx={{ maxWidth: "100%", p: 2.5 }}>
      <Box sx={{}}>
        <Box
          sx={{
            bgcolor: "primary.main",
            borderRadius: 2,
            ...RowFlex,
            gap: 5,
            p: 2.5,
            justifyContent: "start",
          }}
        >
          <img
            alt={driverDetails?.cabDriver?.fname}
            src={baseURL + driverDetails?.cabDriver?.profilePicture}
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
              sx={{ fontWeight: "bold", mb: 2, color: "white" }}
            >
              {driverDetails?.cabDriver?.fname +
                " " +
                driverDetails?.cabDriver?.lname}
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
                  color: "white",
                }}
              >
                <MailOutlineIcon sx={{ fontSize: "1.5rem" }} />
                <span style={{ fontWeight: 700 }}>Email: </span>
                {driverDetails?.cabDriver?.email}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  color: "white",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <Call sx={{ fontSize: "1.5rem" }} />
                <span style={{ fontWeight: 700 }}>Phone Number: </span>
                +91-{driverDetails?.cabDriver?.phone}
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
                  color: "white",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <TagIcon
                  sx={{
                    fontSize: "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Cab Number: </span>
                {driverDetails?.cabNumber}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  color: "white",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <DirectionsCarIcon
                  sx={{
                    fontSize: "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Number Plate: </span>{" "}
                {driverDetails?.numberPlate}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  textTransform: "capitalize",
                  color: "white",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <FormatColorFillIcon
                  sx={{
                    fontSize: "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Cab Color: </span>
                {driverDetails?.carColor}
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
              <Typography sx={{ mb: 1, fontSize: "1.2rem", color: "white" }}>
                <span style={{ fontWeight: 700 }}>Cab Model: </span>{" "}
                {driverDetails?.carModel}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  color: "white",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <Groups2Icon
                  sx={{
                    fontSize: "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Seating Capacity: </span>
                {driverDetails?.seatingCapacity}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            mt: "1.5rem",
            ...RowFlex,
            justifyContent: "space-around",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              ...ColFlex,
              // borderRight: "1px solid lightGray"
            }}
          >
            <span style={{ fontWeight: 500, fontSize: 20 }}>
              Total Amount (INR)
            </span>
            <span style={{ fontSize: 38, fontWeight: 600 }}>
              &#8377; 2300.00
            </span>
          </Typography>
          <Typography variant="body1" sx={{ ...ColFlex }}>
            <span style={{ fontWeight: 500, fontSize: 20 }}>
              Kilometers Traveled
            </span>
            <span style={{ fontSize: 38, fontWeight: 600 }}>23</span>
          </Typography>
          <Typography variant="body1" sx={{ ...ColFlex }}>
            <span style={{ fontWeight: 500, fontSize: 20 }}>Total Routes</span>
            <span style={{ fontSize: 38, fontWeight: 600 }}>
              {driverDetails?.seatingCapacity}
            </span>
          </Typography>
          <Typography variant="body1" sx={{ ...ColFlex }}>
            <span style={{ fontWeight: 500, fontSize: 20 }}>Time Spent</span>
            <span style={{ fontSize: 38, fontWeight: 600 }}>
              {driverDetails?.seatingCapacity}
            </span>
          </Typography>
        </Box>
        <Typography
          variant="h6"
          component="h2"
          sx={{ mt: 2, fontWeight: "bold" }}
        >
          Assigned Routes
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List
          sx={{
            maxHeight: 200,
            overflow: "auto",
            bgcolor: "#f9f9f9",
            borderRadius: 1,
          }}
        >
          {/* {driverData.assignedRoutes.map((route, index) => (
              <ListItem key={index} divider>
                <ListItemText primary={route} />
              </ListItem>
            ))} */}
        </List>
      </Box>
    </Box>
  );
};

export default DriverProfile;
