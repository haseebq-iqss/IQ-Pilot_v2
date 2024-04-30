import React, { useContext, useState } from "react";
import GlobalModal from "./Modal";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import RouteIcon from "@mui/icons-material/Route";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import { useNavigate } from "react-router-dom";

type CreateShiftModalProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
};
export const CreateShiftModal: React.FC<CreateShiftModalProps> = ({
  openModal,
  setOpenModal,
}) => {
  const [routeType, setRouteType] = useState<"pickup" | "drop">("pickup");
  const [location, setLocation] = useState("");
  const [timing, setTiming] = useState("");
  const [centralPoint, setCentralPoint] = useState<any>();

  const navigate = useNavigate();

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const HandleProceedToCreateShiftPage = () => {
    if (location?.length && timing?.length && centralPoint?.length) {
      const shiftData = {
        routeType,
        location,
        timing,
        centralPoint: eval(centralPoint),
      };
      // console.log(shiftData);
      navigate("createShift");
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
          {/* Pickup or Drop and Location*/}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "30px",
            }}
          >
            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="pickup-or-drop-label">Pickup or Drop</InputLabel>
              <Select
                labelId="pickup-or-drop-label"
                id="pickup-or-drop"
                value={routeType}
                label="Pickup or Drop"
                onChange={(e: any) => setRouteType(e.target.value)}
              >
                <MenuItem value="pickup">Pickup</MenuItem>
                <MenuItem value="drop">Drop</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="office-label">Location</InputLabel>
              <Select
                labelId="office-label"
                id="office"
                value={location}
                label="Location"
                onChange={(e) => setLocation(e.target.value)}
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
              <InputLabel id="shift-timing-label">Shift Timing</InputLabel>
              <Select
                labelId="shift-timing-label"
                id="shift-timing-label"
                value={timing}
                label="Shift Timing"
                onChange={(e) => setTiming(e.target.value)}
              >
                <MenuItem value="14:00 - 20:30">2.00PM - 8.30PM</MenuItem>
                <MenuItem value="14:00 - 23:00">2.00PM - 11.00PM</MenuItem>
                <MenuItem value="16:00 - 20:30">4.00PM - 8.30PM</MenuItem>
                <MenuItem value="16:00 - 01:00">4.00PM - 01.00AM</MenuItem>
                <MenuItem value="12:30 - 20:30">12:30PM - 8:30PM</MenuItem>
                <MenuItem value="14:00 - 18:00">2:00PM - 6:00PM</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="central-point-label">Central Point</InputLabel>
              <Select
                labelId="central-point-label"
                id="central-point-label"
                value={centralPoint}
                label="central-point-label"
                onChange={(e) => setCentralPoint(e.target.value)}
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
          {/* <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <FormControl sx={{ width: "100%" }}>
              <InputLabel id="select-driver-label">Select Driver</InputLabel>
              <Select
                labelId="select-driver-label"
                id="select-driver"
                // value={selectedDriver}
                label="Pickup or Drop"
                // onChange={handleSelectDriver}
              >
                {cabs?.length ? (
                  cabs?.map((driver: Cabtypes) => {
                    return (
                      <MenuItem key={driver?._id} value={driver as any}>
                        {(driver?.cabDriver as EmployeeTypes)?.fname +
                          " " +
                          (driver?.cabDriver as EmployeeTypes)?.lname}
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem value={"No Driver"}>No Driver</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box> */}
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
