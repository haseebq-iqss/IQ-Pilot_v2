import {
  AddCircleOutline,
  ArrowForward,
  DarkMode,
  EmojiTransportation,
  GetApp,
  Hail,
  Home,
  LightMode,
  Notifications,
  Route,
  Settings,
  Timelapse,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import EmployeeTypes from "../../types/EmployeeTypes";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import GlobalModal from "./Modal";
import useAxios from "../../api/useAxios";
import { CreateShiftModal } from "./CreateShiftModal";
import Cabtypes from "./../../types/CabTypes";
import baseURL from "../../utils/baseURL";
import ThemeModeContext from "../../context/ThemeModeContext";

function Appbar() {
  const navigate = useNavigate();

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);
  const { themeMode, setThemeMode }: any = useContext(ThemeModeContext);

  const [onHover, setOnHover] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openShiftModal, setShiftOpenModal] = useState<boolean>(false);

  const [selectedDriver, setSelectedDriver] = useState<any>({});
  const [routeType, setRouteType] = useState<"pickup" | "drop">("pickup");
  const [office, setOffice] = useState("");
  // const qc = useQueryClient();

  // const drivers = (qc.getQueryData(["All Cabs"]) as any)?.data?.drivers;
  const { data: cabs } = useQuery({
    queryKey: ["all-drivers"],
    queryFn: async () => {
      const response = await useAxios.get("/cabs/availableCabs");
      // console.log(response.data.data)
      return response?.data.data;
    },
  });

  const pickupTimings = [
    { t4Time: "10:00", t2Time: "10:00 AM" },
    { t4Time: "14:00", t2Time: "02:00 PM" },
    { t4Time: "16:00", t2Time: "04:00 PM" },
  ];

  const dropTimings = [
    { t4Time: "18:00", t2Time: "06:00 PM" },
    { t4Time: "20:30", t2Time: "08:30 PM" },
    { t4Time: "23:00", t2Time: "11:00 PM" },
    { t4Time: "01:00", t2Time: "01:00 AM" },
  ];

  const [currentShift, setcurrentShift] = useState("");
  const [activeDays, setActiveDays] = useState<number>(1);

  const handleSelectDriver = (event: any) => {
    console.log(event.target.value);
    setSelectedDriver(event.target.value);
  };

  function HandleProceedToAddPassengers() {
    if (currentShift && selectedDriver && routeType && office) {
      const routeStateData = {
        driver: selectedDriver,
        currentShift,
        daysRouteIsActive: activeDays,
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

  const [availableCabsOnShift, setAvailableCabsOnShift] =
    useState<[Cabtypes]>();

  // console.log(cabs)

  const GetAvailableCabsOnShift = () => {
    const availableCabs = cabs?.filter(
      (cab: any) => !cab.occupiedShifts.includes(currentShift)
    );
    setAvailableCabsOnShift(availableCabs);
    // console.log(availableCabs);
  };

  useEffect(() => {
    GetAvailableCabsOnShift();
  }, [cabs, currentShift]);

  const [downloadXlsx, setDownloadXlsx] = useState<boolean>(false);

  // Fetch the XLSX data when downloadXlsx is true
  const { data: exportXlsx, refetch } = useQuery({
    queryKey: ["export-xlsx"],
    enabled: false, // Disable automatic fetching
    queryFn: async () => {
      const response = await useAxios.get("/routes/exports/shifts-data", {
        responseType: "arraybuffer", // Ensure data is received as an ArrayBuffer
      });
      return response.data;
    },
  });

  function getFormattedFileName() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, "0");
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based, so add 1
    const year = today.getFullYear();

    // Construct the file name with the day-first format
    return `iQSS-Team Route Planning (${day}/${month}/${year}).xlsx`;
  }

  useEffect(() => {
    if (exportXlsx && downloadXlsx) {
      // Create a Blob from the ArrayBuffer data
      const blob = new Blob([exportXlsx], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = getFormattedFileName();
      link.setAttribute("download", fileName); // File name for the download
      // link.setAttribute("download", "iQSS-Team Route Planning (10/01).xlsx"); // File name for the download
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link); // Clean up the link
      setDownloadXlsx(false); // Reset the download state
    }
  }, [exportXlsx, downloadXlsx]);

  // Trigger the fetch and download
  const HandleDownloadXlsx = () => {
    setDownloadXlsx(true);
    refetch(); // Manually trigger the query to fetch the XLSX file
  };

  return (
    <Box
      sx={{
        ...RowFlex,
        justifyContent: "flex-end",
        backgroundColor: "background.default",
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
        <Box sx={{ ...RowFlex, width: "100%", height: "100%", p: 3 }}>
          {/* LS */}
          <Box
            sx={{
              ...ColFlex,
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-start",
              height: "100%",
              gap: "15px",
            }}
          >
            <Box
              sx={{
                ...RowFlex,
                width: "100%",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              {/* Route Type */}
              <FormControl sx={{ width: "50%" }}>
                <InputLabel id="pickup-or-drop-label">Shift Type</InputLabel>
                <Select
                  labelId="pickup-or-drop-label"
                  id="pickup-or-drop"
                  value={routeType}
                  label="Pickup or Drop"
                  onChange={(e: any) => setRouteType(e.target.value)}
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
              {/* Work Locations */}
              <FormControl sx={{ width: "50%" }}>
                <InputLabel id="office-label">Work Location</InputLabel>
                <Select
                  labelId="office-label"
                  id="office"
                  value={office}
                  label="workLocation"
                  onChange={(e) => setOffice(e.target.value)}
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
              {/* Current Shift*/}
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
                  {routeType === "pickup"
                    ? pickupTimings.map((time: any) => {
                        return (
                          <MenuItem
                            key={time?.t4Time}
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
                            key={time?.t4Time}
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
              {/* Active for days */}
              <FormControl sx={{ width: "50%" }}>
                <InputLabel id="pickup-or-drop-label">
                  Active for Days
                </InputLabel>
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
                        key={index}
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
                  {/* {console.log(cabs)} */}
                  {availableCabsOnShift?.length ? (
                    availableCabsOnShift?.map((driver: any) => {
                      // console.log(driver);
                      return (
                        <MenuItem
                          key={driver?.cabDriver?.[0]._id}
                          value={driver as any}
                        >
                          <Avatar
                            sx={{ width: 30, height: 30, m: 1 }}
                            src={
                              (baseURL +
                                (driver?.cabDriver[0] as EmployeeTypes)
                                  ?.profilePicture) as string
                            }
                          />
                          {(driver?.cabDriver[0] as EmployeeTypes)?.fname +
                            " " +
                            (driver?.cabDriver[0] as EmployeeTypes)?.lname}
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
                color: "background.default",
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
        </Box>
      </GlobalModal>

      {themeMode === "light" ? (
        <Box onClick={() => setThemeMode("dark")}>
          <LightMode
            sx={{
              width: "30px",
              height: "30px",
              cursor: "pointer",
              color: "text.primary",
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
        </Box>
      ) : (
        <Box onClick={() => setThemeMode("light")}>
          <DarkMode
            sx={{
              width: "30px",
              height: "30px",
              cursor: "pointer",
              color: "text.primary",
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
        </Box>
      )}

      <Notifications
        sx={{
          width: "30px",
          height: "30px",
          cursor: "pointer",
          color: "text.primary",
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
          color: "text.primary",
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
        <Typography sx={{ color:"text.primary" }} fontWeight={600} variant="body2">
          Create a Custom Route
        </Typography>
        <Route sx={{ color:"text.primary", p:0.25 }} />
      </Box> */}

      <Button
        className="HoverButton"
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
        sx={{
          // backgroundColor: "text.primary",
          color: "text.primary",
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
          // backgroundColor: "text.primary",
          color: "text.primary",
          borderRadius: "100px",
          px: 2.5,
        }}
        variant="contained"
        startIcon={<AddCircleOutline />}
        onClick={() => setShiftOpenModal(!openShiftModal)}
      >
        Create a Shift
      </Button>
      <Button
        sx={{
          backgroundColor: "secondary.main",
          color: "text.primary",
          borderRadius: "100px",
          px: 2.5,
        }}
        variant="contained"
        startIcon={<GetApp />}
        onClick={HandleDownloadXlsx}
      >
        Export Roster
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
