import RouteIcon from "@mui/icons-material/Route";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/useAxios";
import SnackbarContext from "../../context/SnackbarContext";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import GlobalModal from "./Modal";

type CreateShiftModalProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
};
export const CreateShiftModal: React.FC<CreateShiftModalProps> = ({
  openModal,
  setOpenModal,
}) => {
  const [typeOfRoute, settypeOfRoute] = useState<"pickup" | "drop">("pickup");
  const [workLocation, setworkLocation] = useState("");
  const [currentShift, setcurrentShift] = useState("");
  const [activationMode, setActivationMode] = useState<any>();
  const [activeDays, setActiveDays] = useState<number>(1);
  const [artificialDelay, setArtificialDelay] = useState<boolean>(false);

  const navigate = useNavigate();

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const createShiftMF = (shiftData: any) => {
    return useAxios.post("/routes/createShiftK-Means", shiftData);
  };

  const { mutate: createShiftMutation, status } = useMutation({
    mutationFn: createShiftMF,
    onSuccess: (data: any) => {
      console.log("SD --> ", data);
      navigate("createShift", {
        state: { data: data.data, centralPoint: "NOT SET" },
      });
    },
    onError: (err: any) => {
      setArtificialDelay(!artificialDelay);
      setOpenSnack({
        open: true,
        message: err.response.data.message,
        severity: "warning",
      });
    },
  });
  const HandleProceedToCreateShiftPage = () => {
    if (
      workLocation?.length &&
      currentShift?.length &&
      activationMode?.length
    ) {
      setArtificialDelay(!artificialDelay);
      setTimeout(() => {
        setArtificialDelay(!artificialDelay);
        const shiftData: any = {
          typeOfRoute,
          workLocation,
          currentShift,
          daysRouteIsActive: activeDays,
          activationMode,
        };
        createShiftMutation(shiftData);
      }, 2000);
    } else {
      setOpenSnack({
        open: true,
        message: "Missing fields!",
        severity: "warning",
      });
    }
  };

  return (
    <GlobalModal
      headerText={"Configure Shift"}
      // subHeading={"Create a custom shift request here."}
      openModal={openModal}
      setOpenModal={setOpenModal}
    >
      <LinearProgress
        sx={{
          width: artificialDelay ? "100%" : "0%",
          backgroundColor: "white",
          height: 5,
        }}
      />
      <Box sx={{ ...RowFlex, width: "100%", height: "100%", padding: "1rem" }}>
        {/* LS */}
        <Box
          sx={{
            ...ColFlex,
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-start",
            height: "100%",
            gap: "25px",
          }}
        >
          {/* Pickup or Drop and workLocation*/}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "30px",
            }}
          >
            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="pickup-or-drop-label">Shift Type</InputLabel>
              <Select
                labelId="pickup-or-drop-label"
                id="pickup-or-drop"
                value={typeOfRoute}
                label="Pickup or Drop"
                onChange={(e: any) => settypeOfRoute(e.target.value)}
              >
                <MenuItem value="pickup">Pickup</MenuItem>
                <MenuItem value="drop">Drop</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="office-label">Work Location</InputLabel>
              <Select
                labelId="office-label"
                id="office"
                value={workLocation}
                label="workLocation"
                onChange={(e) => setworkLocation(e.target.value)}
              >
                <MenuItem value="Zaira Tower">Zaira Tower</MenuItem>
                <MenuItem value="Rangreth">Rangreth</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {/* Shift time and central point*/}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "30px",
            }}
          >
            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="shift-currentShift-label">
                Current Shift
              </InputLabel>
              <Select
                labelId="shift-currentShift-label"
                id="shift-currentShift-label"
                value={currentShift}
                label="Shift currentShift"
                onChange={(e) => setcurrentShift(e.target.value)}
              >
                <MenuItem value="14:00-20:30">02.00PM - 08.30PM</MenuItem>
                <MenuItem value="14:00-18:00">02:00PM - 06:00PM</MenuItem>
                <MenuItem value="14:00-23:00">02.00PM - 11.00PM</MenuItem>
                <MenuItem value="16:00-20:30">04.00PM - 08.30PM</MenuItem>
                <MenuItem value="16:00-01:00">04.00PM - 01.00AM</MenuItem>
                <MenuItem value="12:30-20:30">12:30PM - 08:30PM</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="central-point-label">Activation Mode</InputLabel>
              <Select
                labelId="central-point-label"
                id="central-point-label"
                value={activationMode}
                label="central-point-label"
                onChange={(e) => setActivationMode(e.target.value)}
              >
                <MenuItem value={"immediate"}>
                  Immediate (Shift will activate right now)
                </MenuItem>
                <MenuItem value={"next-day"}>
                  Next Day (Shift will activate on the next day's start)
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="pickup-or-drop-label">Active for Days</InputLabel>
              <Select
                labelId="active-time"
                id="active-time"
                value={activeDays}
                label="Active For Days"
                onChange={(e: any) => setActiveDays(e.target.value)}
              >
                <MenuItem value="1">1 Day</MenuItem>
                <MenuItem value="2">2 Days</MenuItem>
                <MenuItem value="3">3 Days</MenuItem>
                <MenuItem value="4">4 Days</MenuItem>
                <MenuItem value="5">5 Days</MenuItem>
                <MenuItem value="6">6 Days</MenuItem>
                <MenuItem value="7">7 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            sx={{
              width: "48%",
              fontWeight: 500,
              ml: "auto",
              backgroundColor: "text.primary",
              color: "white",
              marginTop: 2.5,
              py: 1.5,
            }}
            onClick={
              !artificialDelay ? HandleProceedToCreateShiftPage : () => {}
            }
            color="primary"
            disabled={status === "pending"}
            variant="contained"
            endIcon={
              artificialDelay ? (
                <CircularProgress
                  size={"1rem"}
                  sx={{ ml: 2.5, color: "white" }}
                />
              ) : (
                <RouteIcon />
              )
            }
          >
            {artificialDelay ? "Generating Shift" : "Request a Shift"}
          </Button>
        </Box>
        {/* RS */}
        {/* <Box sx={{ ...RowFlex, width: "40%" }}>
          <DateCalendar
          // value={selectedDate}
          // onChange={(e) => setSelectedDate(e)}
          />
        </Box> */}
      </Box>
    </GlobalModal>
  );
};
