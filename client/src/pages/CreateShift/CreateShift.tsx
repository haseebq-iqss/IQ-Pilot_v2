import {
  Add,
  Close,
  FlightTakeoff,
  LocalTaxi,
  Visibility,
} from "@mui/icons-material";
import { Avatar, Box, Button, ButtonBase, Typography } from "@mui/material";
import { Route, useLocation } from "react-router-dom";
import { ColFlex, RowFlex, PageFlex } from "../../style_extentions/Flex.ts";
import { useState } from "react";
import EmployeeTypes from "../../types/EmployeeTypes.ts";
import TagIcon from "@mui/icons-material/Tag";
import LogoImage from "/images/logo.png";
import RosterCard from "../../components/ui/RosterCard.tsx";
import useAxios from "../../api/useAxios.ts";
import { useMutation } from "@tanstack/react-query";
// import { useQuery } from "@tanstack/react-query";
// import useAxios from "../../api/useAxios.ts";

function CreateShift() {
  const location = useLocation();

  const routeState = location?.state;

  const { data } = useMutation({
    mutationFn: async () => {
      const response = await useAxios.post("/routes/shifts", routeState);
      console.log(response);
    },
  });

  //   const [department, setDepartment] = useState("");
  //   const [selectedPassengers, setSelectedPassengers] = useState<
  //     Array<EmployeeTypes>
  //   >([]);
  //   const [previewMode, setPreviewMode] = useState<boolean>(false);
  //   const driverId: string | undefined = (routeState?.driver as any)?._id;

  return (
    <Box
      sx={{
        ...PageFlex,
        width: "100vw",
        height: "100vh",
        flexDirection: "column",
        gap: "15px",
        // height: "100vh",
        backgroundColor: "white",
      }}
    >
      {/* R1 */}
      <Box
        sx={{
          ...RowFlex,
          width: "100%",
          height: "10%",
          px: "25px",
          pt: "15px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* S1 */}
        <Box sx={{ ...ColFlex, alignItems: "flex-start", width: "60%" }}>
          <Typography variant="h4" fontWeight={600}>
            Zaira Towers
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            Bemina - 2:00PM - 8:30PM
          </Typography>
        </Box>
        {/* S2 */}
        <Box
          sx={{
            ...RowFlex,
            width: "40%",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 7.5,
          }}
        >
          <Box
            sx={{
              //   width: "50%",
              pl: 2.5,
              height: "50px",
              ...RowFlex,
              justifyContent: "space-between",
              gap: 2.5,
              backgroundColor: "white",
              border: "3px solid #2997fc",
              borderRadius: 1.5,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontStyle: "italic",
                fontWeight: "700",
                color: "primary.main",
              }}
            >
              RESERVE
            </Typography>
            <Box
              sx={{
                ...ColFlex,
                width: "100%",
                px: 1.75,
                height: "100%",
                bgcolor: "primary.main",
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color: "white", fontStyle: "italic" }}
                variant="h5"
              >
                10
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              //   width: "50%",
              px: 5,
              height: "50px",
              bgcolor: "primary.main",
              ...RowFlex,
              gap: 2.5,
              borderRadius: 1.5,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontStyle: "italic", fontWeight: "700", color: "white" }}
            >
              DEPLOY
            </Typography>
            <Box
              component={"img"}
              src={LogoImage}
              sx={{ width: "25px", aspectRatio: 1 }}
            />
          </Box>
        </Box>
      </Box>
      {/* R2 */}
      <Box
        sx={{
          ...RowFlex,
          display: "flex",
          height: "90%",
          width: "100vw",
          overflowX: "scroll",
          backgroundColor: "rgba(158, 158, 158, 0.1)",
        }}
      >
        <Box
          sx={{
            ...RowFlex,
            height: "100%",
            width: "100%",
            px: 2.5,
            whiteSpace: "nowrap",
            gap: "3rem",
            // alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <RosterCard key={index} />
          ))}
          {/* <Box
            sx={{ width: "30rem", height: "100%", backgroundColor: "green" }}
          ></Box> */}
          {/* <Box
            sx={{ width: "30rem", height: "100%", backgroundColor: "green" }}
          ></Box> */}
          {/* <Box
            sx={{ width: "40rem", height: "100%", backgroundColor: "green" }}
          ></Box> */}
        </Box>
      </Box>
    </Box>
  );
}

export default CreateShift;
