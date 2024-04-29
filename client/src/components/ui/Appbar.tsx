import {
  AddCircleOutline,
  ArrowForward,
  Notifications,
  Route,
  Settings,
} from "@mui/icons-material";
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
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import EmployeeTypes from "../../types/EmployeeTypes";
import DateDifference from "../../utils/DateDifference";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import GlobalModal from "./Modal";
import useAxios from "../../api/useAxios";
import Cabtypes from "../../types/CabTypes";
import { CreateShiftModal } from "./CreateShiftModal";

function Appbar() {
  const navigate = useNavigate();

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const [onHover, setOnHover] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openShiftModal, setShiftOpenModal] = useState<boolean>(false);

  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedDate, setSelectedDate] = useState<any>(dayjs());
  const [selectedDriver, setSelectedDriver] = useState<any>({});
  const [routeType, setRouteType] = useState<"pickup" | "drop">("pickup");
  const [office, setOffice] = useState("");
  // const qc = useQueryClient();

  // const drivers = (qc.getQueryData(["All Cabs"]) as any)?.data?.drivers;
  const { data: cabs } = useQuery({
    queryKey: ["all-drivers"],
    queryFn: async () => {
      const response = await useAxios.get("/cabs");
      return response?.data?.data;
    },
  });

  const todaysDate = new Date();

  const handleTimeChange = (newTime: any) => {
    if (newTime) {
      const newDate = newTime;
      setSelectedTime(String(newDate?.$H) + ":" + String(newDate?.$m));
      console.log(String(newDate?.$H) + ":" + String(newDate?.$m));
    }
  };

  const handlePickupOrDropChange = (event: any) => {
    setRouteType(event.target.value);
  };

  const handleOfficeLocationChange = (event: any) => {
    setOffice(event.target.value);
  };

  const handleSelectDriver = (event: any) => {
    setSelectedDriver(event.target.value);
  };

  function HandleProceedToAddPassengers() {
    if (selectedTime && selectedDriver && routeType && office) {
      const routeStateData = {
        driver: selectedDriver,
        shiftTime: selectedTime,
        shiftDate: selectedDate?.$d,
        typeOfRoute: routeType,
        office,
      };
      // console.log(routeStateData);
      navigate("/admin/addPassengers", { state: routeStateData });
    } else {
      setOpenSnack({
        open: true,
        message: "Fields missing! Please add all the details to proceed!",
        severity: "warning",
      });
    }
  }

  // console.log(drivers);

  return (
    <Box
      sx={{
        ...RowFlex,
        justifyContent: "flex-end",
        backgroundColor: "white",
        width: "100%",
        // border: "",
        // height: "10vh",
        padding: "10px",
        borderRadius: "150px",
        gap: "20px",
        pr: "15px",
      }}
    >
      {/* SCHEDULE A ROUTE MODAL */}
      <GlobalModal
        headerText={"Schedule a Custom Route"}
        openModal={openModal}
        setOpenModal={setOpenModal}
      >
        <Box sx={{ ...RowFlex, width: "100%", height: "100%" }}>
          {/* LS */}
          <Box
            sx={{
              ...ColFlex,
              width: "60%",
              justifyContent: "space-between",
              alignItems: "flex-start",
              height: "100%",
              gap: "15px",
            }}
          >
            {/* Shift time and date*/}
            <Box
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
                  onChange={handleTimeChange}
                />
              </Box>

              <Box sx={{ ...ColFlex, alignItems: "flex-start", width: "70%" }}>
                <Typography sx={{}} variant="caption" fontWeight={500}>
                  Shift Date
                </Typography>
                <TextField
                  fullWidth
                  value={
                    selectedDate
                      ? DateDifference(selectedDate)
                      : DateDifference(todaysDate)
                  }
                />
              </Box>
            </Box>
            <Box
              sx={{
                ...RowFlex,
                width: "100%",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              <FormControl sx={{ width: "50%" }}>
                <InputLabel id="pickup-or-drop-label">
                  Pickup or Drop
                </InputLabel>
                <Select
                  labelId="pickup-or-drop-label"
                  id="pickup-or-drop"
                  value={routeType}
                  label="Pickup or Drop"
                  onChange={handlePickupOrDropChange}
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
                  value={office}
                  label="Location"
                  onChange={handleOfficeLocationChange}
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
                gap: "15px",
              }}
            >
              <FormControl sx={{ width: "100%" }}>
                <InputLabel id="select-driver-label">Select Driver</InputLabel>
                <Select
                  labelId="select-driver-label"
                  id="select-driver"
                  value={selectedDriver}
                  label="Pickup or Drop"
                  onChange={handleSelectDriver}
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
            </Box>
            <Button
              sx={{
                width: "50%",
                fontWeight: 600,
                ml: "auto",
                backgroundColor: "text.primary",
                color: "white",
              }}
              onClick={HandleProceedToAddPassengers}
              color="primary"
              variant="contained"
              endIcon={<ArrowForward />}
            >
              Proceed to add employees
            </Button>
          </Box>
          {/* RS */}
          <Box sx={{ ...RowFlex, width: "40%" }}>
            <DateCalendar
              value={selectedDate}
              onChange={(e) => setSelectedDate(e)}
            />
          </Box>
        </Box>
      </GlobalModal>
      <Notifications
        sx={{
          width: "30px",
          height: "30px",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-2.5px)",
            scale: "1.2",
            transition: "all 0.5s",
          },
          "&:not(:hover)": {
            scale: "1",
            transition: "all 0.4s",
          },
        }}
      />

      <Settings
        sx={{
          width: "30px",
          height: "30px",
          cursor: "pointer",
          "&:hover": {
            rotate: "180deg",
            scale: "1.2",
            transition: "all 0.5s",
          },
          "&:not(:hover)": {
            rotate: "0deg",
            scale: "1",
            transition: "all 0.4s",
          },
        }}
      />

      {/* <Box sx={{ ...RowFlex, gap:1,backgroundColor: "text.primary",  borderRadius:"100px", py:0.75, px:2.5 }}>
        <Typography sx={{ color: "white" }} fontWeight={600} variant="body2">
          Create a Custom Route
        </Typography>
        <Route sx={{ color: "white", p:0.25 }} />
      </Box> */}

      <Button
        className="HoverButton"
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
        sx={{
          backgroundColor: "text.primary",
          color: "white",
          borderRadius: "100px",
          px: 2.5,
        }}
        variant="contained"
        onClick={() => setOpenModal(!openModal)}
        endIcon={<Route />}
      >
        {onHover ? "Create a Custom Route" : "CR"}
      </Button>

      <Button
        sx={{
          backgroundColor: "text.primary",
          color: "white",
          borderRadius: "100px",
          px: 2.5,
        }}
        variant="contained"
        startIcon={<AddCircleOutline />}
        onClick={() => setShiftOpenModal(!openShiftModal)}
      >
        Create a Shift
      </Button>
      {openShiftModal && (
        <CreateShiftModal
          openModal={openShiftModal}
          setOpenModal={setShiftOpenModal}
        />
      )}
    </Box>
  );
}

export default Appbar;
