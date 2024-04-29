import React from "react";
import GlobalModal from "./Modal";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DateCalendar, MobileTimePicker } from "@mui/x-date-pickers";
import EmployeeTypes from "../../types/EmployeeTypes";
import Cabtypes from "../../types/CabTypes";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";

type CreateShiftModalProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
};
export const CreateShiftModal: React.FC<CreateShiftModalProps> = ({
  openModal,
  setOpenModal,
}) => {
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
          {/* Shift time and date*/}
          {/* <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <Box sx={{ ...ColFlex, alignItems: "flex-start", width: "30%" }}>
              <Typography sx={{}} variant="caption" fontWeight={500}>
                Shift Time
              </Typography>
              <MobileTimePicker
              // label="Select Time"
              // value={selectedTime}
              // onChange={handleTimeChange}
              />
            </Box>

            <Box sx={{ ...ColFlex, alignItems: "flex-start", width: "70%" }}>
              <Typography sx={{}} variant="caption" fontWeight={500}>
                Shift Date
              </Typography>
              <TextField
                fullWidth
                // value={
                //   selectedDate
                //     ? DateDifference(selectedDate)
                //     : DateDifference(todaysDate)
                // }
              />
            </Box>
          </Box> */}
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
                // value={routeType}
                label="Pickup or Drop"
                // onChange={handlePickupOrDropChange}
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
                // value={office}
                label="Location"
                // onChange={handleOfficeLocationChange}
              >
                <MenuItem value="Zaira Tower">Zaira Tower</MenuItem>
                <MenuItem value="Rangreth">Rangreth</MenuItem>
              </Select>
            </FormControl>
          </Box>
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
                // value={routeType}
                label="Shift Timing"
                // onChange={handlePickupOrDropChange}
              >
                <MenuItem value="2.00PM - 8.30PM">2.00PM - 8.30PM</MenuItem>
                <MenuItem value="2.00PM - 11.00PM">2.00PM - 11.00PM</MenuItem>
                <MenuItem value="4.00PM - 8.30PM">4.00PM - 8.30PM</MenuItem>
                <MenuItem value="4.00PM - 01.00AM">4.00PM - 01.00AM</MenuItem>
                <MenuItem value="12:30PM - 8:30PM">12:30PM - 8:30PM</MenuItem>
                <MenuItem value="2:00PM - 6:00PM">2:00PM - 6:00PM</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: "50%" }}>
              <InputLabel id="central-point-label">Central Point</InputLabel>
              <Select
                labelId="central-point-label"
                id="central-point-label"
                // value={office}
                label="central-point-label"
                // onChange={handleOfficeLocationChange}
              >
                <MenuItem value="Bemina Area">Bemina Area</MenuItem>
                <MenuItem value="Lal Bazar Area">Lal Bazar Area</MenuItem>
                <MenuItem value="Karanagar Area">Karanagar Area</MenuItem>
                <MenuItem value="Rangreth Area">Rangreth Area</MenuItem>
                <MenuItem value="Soura Area">Soura Area</MenuItem>
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
            // onClick={HandleProceedToAddPassengers}
            color="primary"
            variant="contained"
            // endIcon={<ArrowForward  />}
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
