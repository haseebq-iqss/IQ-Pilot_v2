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
import {
  DarkMode,
  EmojiTransportation,
  Hail,
  Home,
  LightMode,
  ScheduleSend,
  Send,
  Timelapse,
} from "@mui/icons-material";

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

  const pickupTimings = [
    { t4Time: "10:00", t2Time: "10:00 AM" },
    { t4Time: "14:00", t2Time: "02:00 PM" },
    { t4Time: "16:00", t2Time: "04:00 PM" },
  ];

  const dropTimings = [
    { t4Time: "17:00", t2Time: "05:00 PM" },
    { t4Time: "18:00", t2Time: "06:00 PM" },
    { t4Time: "20:30", t2Time: "08:30 PM" },
    { t4Time: "23:00", t2Time: "11:00 PM" },
    { t4Time: "01:00", t2Time: "01:00 AM" },
  ];

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
          backgroundColor: "background.default",
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
                <MenuItem
                  value={"pickup"}
                  sx={{
                    ...RowFlex,
                    pl: 2.5,
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                >
                  <Hail sx={{ mr: 1 }} />
                  Pickup
                </MenuItem>
                <MenuItem
                  value={"drop"}
                  sx={{
                    ...RowFlex,
                    pl: 2.5,
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                >
                  <Home sx={{ mr: 1 }} />
                  Drop
                </MenuItem>
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
                <MenuItem
                  value={"Zaira Tower"}
                  sx={{
                    ...RowFlex,
                    pl: 2.5,
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                >
                  <EmojiTransportation sx={{ mr: 1 }} />
                  Zaira Tower
                </MenuItem>
                <MenuItem
                  value={"Rangreth"}
                  sx={{
                    ...RowFlex,
                    pl: 2.5,
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                >
                  <EmojiTransportation sx={{ mr: 1 }} />
                  Rangreth
                </MenuItem>
                <MenuItem
                  value={"Karanagar"}
                  sx={{
                    ...RowFlex,
                    pl: 2.5,
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                >
                  <EmojiTransportation sx={{ mr: 1 }} />
                  Karanagar
                </MenuItem>
                <MenuItem
                  value={"Zirakpur"}
                  sx={{
                    ...RowFlex,
                    pl: 2.5,
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                >
                  <EmojiTransportation sx={{ mr: 1 }} />
                  Zirakpur
                </MenuItem>
                <MenuItem
                  value={"Hyderabad"}
                  sx={{
                    ...RowFlex,
                    pl: 2.5,
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                >
                  <EmojiTransportation sx={{ mr: 1 }} />
                  Hyderabad
                </MenuItem>
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
                {typeOfRoute === "pickup"
                  ? pickupTimings.map((time: any) => {
                      return (
                        <MenuItem
                          value={time?.t4Time}
                          sx={{ ...RowFlex, pl: 2.5, fontWeight: 600 }}
                        >
                          <LightMode sx={{ mr: 1 }} />
                          {time.t2Time}
                        </MenuItem>
                      );
                    })
                  : dropTimings.map((time: any) => {
                      return (
                        <MenuItem
                          value={time?.t4Time}
                          sx={{ ...RowFlex, pl: 2.5, fontWeight: 600 }}
                        >
                          <DarkMode sx={{ mr: 1 }} />
                          {time.t2Time}
                        </MenuItem>
                      );
                    })}
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
                <MenuItem
                  value={"immediate"}
                  sx={{
                    ...RowFlex,
                    pl: 2.5,
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                >
                  <Send sx={{ mr: 1 }} />
                  Immediate (Shift will activate right now)
                </MenuItem>
                <MenuItem
                  value={"next-day"}
                  sx={{
                    ...RowFlex,
                    pl: 2.5,
                    fontWeight: 600,
                    justifyContent: "flex-start",
                  }}
                >
                  <ScheduleSend sx={{ mr: 1 }} />
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
                {Array.from({ length: 7 }).map((_, index: any) => {
                  return (
                    <MenuItem
                      value={index + 1}
                      sx={{
                        ...RowFlex,
                        pl: 2.5,
                        fontWeight: 600,
                        justifyContent: "flex-start",
                      }}
                    >
                      <Timelapse sx={{ mr: 1 }} />
                      {index + 1}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
          <Button
            sx={{
              width: "48%",
              fontWeight: 500,
              ml: "auto",
              backgroundColor: "text.primary",
              color: "background.default",
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
                  sx={{ ml: 2.5, color:"text.primary" }}
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
