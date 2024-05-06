import RouteIcon from "@mui/icons-material/Route";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/useAxios";
import SnackbarContext from "../../context/SnackbarContext";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import { ShiftTypes } from "../../types/ShiftTypes";
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
  const [ref_coords, setref_coords] = useState<any>();

  const navigate = useNavigate();

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const createShiftMF = (shiftData: any) => {
    return useAxios.post("/routes/shifts", shiftData);
  };

  const { mutate: createShiftMutation, status } = useMutation({
    mutationFn: createShiftMF,
    onSuccess: (data: any) => {
      // console.log(data);
      navigate("createShift", {
        state: { data: data.data, centralPoint: ref_coords },
      });
    },
  });
  const HandleProceedToCreateShiftPage = () => {
    if (workLocation?.length && currentShift?.length && ref_coords?.length) {
      const shiftData: ShiftTypes = {
        typeOfRoute,
        workLocation,
        currentShift,
        ref_coords: eval(ref_coords),
      };
      createShiftMutation(shiftData);
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
              <InputLabel id="central-point-label">Central Point</InputLabel>
              <Select
                labelId="central-point-label"
                id="central-point-label"
                value={ref_coords}
                label="central-point-label"
                onChange={(e) => setref_coords(e.target.value)}
              >
                <MenuItem value={"[34.07918418861709, 74.76795882716988]"}>
                  Bemina Area
                </MenuItem>
                <MenuItem value={"[34.07884610905441, 74.77249651656975]"}>
                  Lal Bazar Area
                </MenuItem>
                <MenuItem value={"[34.084051032954854, 74.79703437982327]"}>
                  Karanagar Area
                </MenuItem>
                <MenuItem value={"[34.01011349472341, 74.79879001141188]"}>
                  Rangreth Area
                </MenuItem>
                <MenuItem value={"[34.13990801842636, 74.80077605668806]"}>
                  Soura Area
                </MenuItem>
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
            onClick={HandleProceedToCreateShiftPage}
            color="primary"
            disabled={status === "pending"}
            variant="contained"
            endIcon={<RouteIcon />}
          >
            Request a Shift
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
