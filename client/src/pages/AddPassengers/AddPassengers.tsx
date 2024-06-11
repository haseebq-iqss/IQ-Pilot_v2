// @ts-nocheck
import {
  AccessTimeOutlined,
  Add,
  Cancel,
  Close,
  LocalTaxi,
  NavigationOutlined,
  Remove,
  Route,
  Search,
  Visibility,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxios from "../../api/useAxios";
import MapComponent from "../../components/Map";
import { RMDataPromise } from "../../utils/RoutingMachine.ts";
import SelectedEmpsContext from "../../context/SelectedEmpsContext";
import SnackbarContext from "../../context/SnackbarContext";

import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import { ColFlex, PageFlex, RowFlex } from "../../style_extentions/Flex.ts";
import baseURL from "../../utils/baseURL";
import EmployeeTypes from "../../types/EmployeeTypes.ts";
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat.ts";
import Cabtypes from "../../types/CabTypes.ts";

// export const GetRMData = (RMData:any) => {
//   console.log(RMData)
//   return RMData
// }

function AddPassengers() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);
  //   console.log(location);
  const { setSelectedEmps } = useContext(SelectedEmpsContext);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeTypes[]>();

  const rangreth = [33.996807, 74.79202];
  // const zaira = [34.1639168, 74.8158976];
  const zaira = [34.17342209237591, 74.80831111718207];

  const routeState = location?.state;
  console.log(routeState);

  const { data: employees } = useQuery({
    queryKey: ["all-employees"],
    queryFn: async () => {
      const response = await useAxios.get("/routes/pendingPassengers");
      return response.data.pending_passengers;
    },
  });

  type distNtimeTypes = {
    distanceInKilometers: number;
    totalMinutes: number;
  };

  const [searchField, setSearchField] = useState<string>("");
  const [distNtime, setDistNtime] = useState<distNtimeTypes>({
    distanceInKilometers: 0,
    totalMinutes: 0,
  });

  const [department, setDepartment] = useState("");
  const [selectedPassengers, setSelectedPassengers] = useState<
    Array<EmployeeTypes>
  >([]);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const isPassengerInRoute = (newPassenger: EmployeeTypes) => {
    const isAlreadyAdded = selectedPassengers.some(
      (passenger) => passenger._id === newPassenger._id
    );
    return isAlreadyAdded;
  };

  const handleAddPassengersToCab = (newPassenger: EmployeeTypes) => {
    // Check if the newPassenger is already present in selectedPassengers
    setPreviewMode(false);
    if (
      selectedPassengers?.length < (routeState?.driver as any)?.seatingCapacity
    ) {
      // const isAlreadyAdded = selectedPassengers.some(
      //   (passenger) => passenger._id === newPassenger._id
      // );

      // If not already added, add the newPassenger
      if (!isPassengerInRoute(newPassenger)) {
        setSelectedPassengers((prevPassengers) => [
          ...prevPassengers,
          newPassenger,
        ]);
      }
    }
  };

  const handleRemovePassengersFromCab = (employeeToRemove: EmployeeTypes) => {
    setSelectedEmps([]);

    setSelectedEmps((prevEmployees: EmployeeTypes[]) =>
      prevEmployees.filter(
        (employee: EmployeeTypes) => employee._id !== employeeToRemove._id
      )
    );

    setSelectedPassengers((prevPassengers: EmployeeTypes[]) =>
      prevPassengers.filter(
        (passenger: EmployeeTypes) => passenger._id !== employeeToRemove._id
      )
    );
  };

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleChangeDepartment = (e: any) => {
    setDepartment(e.target.value);
  };

  useEffect(() => {
    if (department?.length) {
      const filteredEmp = employees?.filter(
        (employee: EmployeeTypes) =>
          employee.department?.toLowerCase() === department.toLowerCase()
      );
      setFilteredEmployees(filteredEmp || []);
    } else {
      setFilteredEmployees(employees);
    }
  }, [department]);

  const SearchEmployees = (e: any) => {
    setSearchField(e.target.value);
  };

  const filterEmployees = filteredEmployees?.filter(
    (employee: EmployeeTypes) => {
      return employee?.fname?.toLowerCase().includes(searchField);
    }
  );

  const handleClearFilterAndSearch = () => {
    setSearchField("");
    // setFilteredEmployees(employees);
    setDepartment("");
  };

  const createRouteMF = (routeData: any) => {
    return useAxios.post("/routes", routeData);
  };

  const { mutate, status } = useMutation({
    mutationFn: createRouteMF,
    onSuccess: () => {
      setOpenSnack({
        open: true,
        message: "Route added Successfully",
        severity: "success",
      });
      setSelectedEmps([]);
      navigate("/admin");
    },
    onError: (err) => {
      console.log(err);
    },
  });

  function HandlePreviewRoute() {
    // Extracting only the _id field from passengers array
    setPreviewMode(!previewMode);
    // console.log(passengersLatLons)

    const passengersLatLons: string[] = selectedPassengers.map(
      (passenger: any) => passenger.pickUp.coordinates
    );

    setSelectedEmps([
      ...passengersLatLons,
      routeState?.office === "Rangreth" ? rangreth : zaira,
    ]);

    RMDataPromise.then((res: any) => {
      setDistNtime(res);
      //   console.log(res);
    });

    // setDistNtime(RMDataPromise())
  }

  useEffect(() => {
    setSelectedEmps([]);
  }, [selectedPassengers]);

  function HandleCreateRoute() {
    if (selectedPassengers?.length < 1) {
      setOpenSnack({
        open: true,
        message: "Cab cannot be empty, please add TMs to create a route!",
        severity: "warning",
      });
      return;
    }
    const passengersIds: string[] = selectedPassengers.map(
      (passenger: any) => passenger._id
    );

    // Accessing _id field directly from the driver object
    const driverId: string | undefined = (routeState?.driver as any)?._id;

    // Creating the routeData object with passengersIds and driverId
    // RMDataPromise.then((res: any) => {
    //   setDistNtime(res);

    const combinedData: {
      cab: Cabtypes;
      passengers: EmployeeTypes[];
      availableCapacity: number;
    }[] = [];

    combinedData.push({
      cab: routeState?.driver,
      passengers: selectedPassengers,
    });
    // columns.forEach((column: ShiftTypes) => {
    //   const columnPassengers = passengers.filter(
    //     (passenger: EmployeeTypes) => passenger.columnId === column.id
    //   );
    // });

    const routeData = {
      // ...routeState,
      cabEmployeeGroups: combinedData,
      estimatedTime: distNtime?.totalMinutes,
      totalDistance: distNtime?.distanceInKilometers,
      workLocation: routeState?.office,
      currentShift: routeState?.currentShift,
      typeOfRoute: routeState?.typeOfRoute,
      daysRouteIsActive: routeState?.daysRouteIsActive,
    };

    // console.log(routeData);
    mutate(routeData);
    // });
  }

  if (!routeState) {
    navigate(-1);
  }
  return (
    <Box
      sx={{
        ...PageFlex,
        flexDirection: "row",
        gap: "15px",
        p: "15px",
        height: "100vh",
        backgroundColor: "#D9D9D9",
      }}
    >
      {/* LS */}
      <Box
        sx={{
          ...ColFlex,
          justifyContent: "flex-start",
          alignItems: "flex-start",
          //   flex: 3.5,
          width: "30%",
          backgroundColor: "white",
          height: "100%",
          borderRadius: "15px",
          p: "15px",
          gap: "20px",
        }}
      >
        {/* L-1 */}
        <Box
          sx={{ ...RowFlex, width: "100%", justifyContent: "space-between" }}
        >
          <Box
            sx={{ width: "100px", aspectRatio: 2.6863 }}
            component={"img"}
            src={
              routeState?.typeOfRoute === "pickup"
                ? "/images/pickup-dark.png"
                : "/images/drop-dark.png"
            }
          />
          <Typography variant="body2" fontWeight={600} color={"GrayText"}>
            Shift time -{" "}
            <span
              style={{ fontWeight: 600, fontSize: "1.75rem", color: "#212A3B" }}
            >
              {routeState?.currentShift !== undefined &&
                ConvertShiftTimeTo12HrFormat(
                  routeState?.currentShift,
                  routeState?.typoOfRoute
                )}
            </span>
          </Typography>
        </Box>
        {/* L -2 */}
        <Box sx={{ ...ColFlex, width: "100%", gap: "10px" }}>
          <TextField
            variant="outlined"
            size="small"
            value={searchField}
            onChange={SearchEmployees}
            placeholder="Search Employees"
            InputProps={{
              startAdornment: (
                <IconButton aria-label="search">
                  <Search />
                </IconButton>
              ),
              style: {},
            }}
            fullWidth
          />
          {/* filter and clear */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <Button
              sx={{
                width: "40%",
                fontWeight: 600,
                ml: "auto",
                backgroundColor: "text.primary",
                color: "white",
              }}
              onClick={handleClearFilterAndSearch}
              color="primary"
              variant="contained"
              endIcon={<Cancel />}
            >
              Clear
            </Button>
            <FormControl fullWidth>
              <InputLabel
                sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                id="department-label"
              >
                Department
              </InputLabel>
              <Select
                size="small"
                labelId="department-label"
                id="department-select"
                value={department}
                onChange={handleChangeDepartment}
                label="Department"
              >
                <MenuItem value={"BD"}>BD</MenuItem>
                <MenuItem value={"BD-SD"}>BD-SD</MenuItem>
                <MenuItem value={"BD-SES2"}>BD-SES2</MenuItem>
                <MenuItem value={"Civil-SES2"}>Civil-SES2</MenuItem>
                <MenuItem value={"Cyber"}>Cyber</MenuItem>
                <MenuItem value={"L&D"}>L&D</MenuItem>
                <MenuItem value={"Marketing"}>Marketing</MenuItem>
                <MenuItem value={"PD"}>PD</MenuItem>
                <MenuItem value={"PSD"}>PSD</MenuItem>
                <MenuItem value={"S&S (HR)"}>S&S (HR)</MenuItem>
                <MenuItem value={"S&S (IT)"}>S&S (IT)</MenuItem>
                <MenuItem value={"S&S (OPS)"}>S&S (OPS)</MenuItem>
                <MenuItem value={"Software"}>Software</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        {/* L -3 */}
        <Box
          sx={{
            ...ColFlex,
            justifyContent: "flex-start",
            width: "100%",
            height: "100%",
            overflowY: "scroll",
            gap: "10px",
          }}
        >
          {filterEmployees?.map((employee: EmployeeTypes) => {
            // console.log(employee);
            return (
              <Box key={employee?._id} sx={{ ...RowFlex, width: "100%" }}>
                <Box
                  sx={{
                    ...RowFlex,
                    width: "80%",
                    justifyContent: "flex-start",
                    gap: "10px",
                  }}
                >
                  <Avatar
                    sx={{ width: "30px", height: "30px" }}
                    src={baseURL + employee?.profilePicture}
                  />
                  <Box>
                    <Typography variant="body1">
                      {employee.fname + " " + employee.lname}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Route
                        sx={{
                          width: "12.5px",
                          height: "12.5px",
                          mr: "5px",
                          color: "secondary.main",
                        }}
                      />
                      {employee?.pickUp?.address}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ ...RowFlex, width: "20%" }}>
                  <ButtonBase sx={{ borderRadius: "100px" }}>
                    {!isPassengerInRoute(employee) ? (
                      <Add
                        onClick={() => handleAddPassengersToCab(employee)}
                        sx={{
                          backgroundColor: "primary.main",
                          borderRadius: "100px",
                          p: 0.5,
                          width: "40px",
                          height: "40px",
                          color: "white",
                        }}
                      />
                    ) : (
                      <Remove
                        onClick={() => handleRemovePassengersFromCab(employee)}
                        sx={{
                          backgroundColor: "error.main",
                          borderRadius: "100px",
                          p: 0.5,
                          width: "40px",
                          height: "40px",
                          color: "white",
                        }}
                      />
                    )}
                  </ButtonBase>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      {/* RS */}
      <Box
        sx={{
          ...ColFlex,
          //   flex: 6.5,
          width: "70%",
          backgroundColor: "white",
          height: "100%",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        <MapComponent
          center={
            (selectedPassengers?.length
              ? selectedPassengers[selectedPassengers?.length - 1].pickUp
                  ?.coordinates
              : [34.071635, 74.803872]) as [number, number]
          }
          mode="route-view"
          highlightedEmployees={selectedPassengers as []}
          employees={
            previewMode
              ? (selectedPassengers as [EmployeeTypes])
              : (filterEmployees as [EmployeeTypes])
          }
          height="100%"
        />
        {/* ESTIMATED TIME & DISTANCE */}
        <Box
          sx={{
            ...ColFlex,
            gap: "15px",
            position: "absolute",
            alignItems: "flex-end",
            top: "25px",
            right: "25px",
            zIndex: "999",
          }}
        >
          {/* DISTANCE */}
          <Box
            sx={{
              ...RowFlex,
              gap: "5px",
              backgroundColor: "primary.main",
              padding: "10px 20px",
              borderRadius: "15px",
              minWidth: "10%",
            }}
          >
            <NavigationOutlined
              sx={{ color: "white", width: "30px", height: "30px" }}
            />
            <Typography sx={{ color: "white" }} variant="h5" fontWeight={600}>
              {distNtime?.distanceInKilometers}{" "}
              <span style={{ fontWeight: 500 }}>kms</span>
            </Typography>
          </Box>
          {/* TIME */}
          <Box
            sx={{
              ...RowFlex,
              gap: "5px",
              backgroundColor: "warning.main",
              padding: "10px 20px",
              borderRadius: "15px",
            }}
          >
            <AccessTimeOutlined
              sx={{ color: "white", width: "30px", height: "30px" }}
            />
            <Typography sx={{ color: "white" }} variant="h5" fontWeight={600}>
              {distNtime?.totalMinutes}{" "}
              <span style={{ fontWeight: 500 }}>mins</span>
            </Typography>
          </Box>
        </Box>
        {/* SELECTED EMPS */}
        <Box
          sx={{
            ...ColFlex,
            position: "absolute",
            bottom: "25px",
            right: "25px",
            zIndex: "999",
            width: "30%",
            gap: "10px",
            // border: "2px solid #212A3B",
            p: "15px",
            borderRadius: "15px",
            alignItems: "flex-start",
            backgroundColor: "white",
            transition: "all 1s",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Capacity {selectedPassengers?.length || 0} of{" "}
            {(routeState?.driver as any)?.capacity}
          </Typography>
          {/* DRIVER */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
            }}
          >
            <Box
              sx={{
                ...RowFlex,
                width: "80%",
                justifyContent: "flex-start",
                gap: "10px",
              }}
            >
              <Avatar
                sx={{ width: "30px", height: "30px" }}
                src={baseURL + routeState?.driver?.cabDriver?.profilePicture}
              />
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {"Cab " +
                    routeState?.driver?.cabNumber +
                    " - " +
                    routeState?.driver?.cabDriver?.fname +
                    " " +
                    routeState?.driver.cabDriver?.lname}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <LocalTaxi
                    sx={{
                      width: "12.5px",
                      height: "12.5px",
                      mr: "5px",
                      color: "secondary.main",
                    }}
                  />
                  {routeState?.driver?.carModel}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ ...RowFlex, width: "20%" }}></Box>
          </Box>
          {/* SELECTED EMPS */}
          {!previewMode && selectedPassengers.length > 0
            ? selectedPassengers?.map(
                (employee: EmployeeTypes, index: number) => {
                  return (
                    <Box
                      key={employee?._id}
                      sx={{
                        ...RowFlex,
                        width: "100%",
                        pl: "25px",
                      }}
                    >
                      <Box
                        sx={{
                          ...RowFlex,
                          width: "80%",
                          justifyContent: "flex-start",
                          gap: "10px",
                        }}
                      >
                        <Avatar
                          // src={baseURL + employee?.profilePicture}
                          sx={{
                            width: "25px",
                            height: "25px",
                            backgroundColor:
                              "rgba(10.59%, 38.04%, 98.82%, 0.8)",
                          }}
                        >
                          <Typography fontWeight={600} variant="body1">
                            {index + 1}
                          </Typography>
                        </Avatar>{" "}
                        <Typography
                          sx={{ color: "rgba(10.59%, 38.04%, 98.82%, 0.8)" }}
                          variant="body1"
                        >
                          -{">"}
                        </Typography>
                        <Avatar
                          sx={{ width: "30px", height: "30px" }}
                          src={baseURL + employee?.profilePicture}
                        />
                        <Box>
                          <Typography variant="body1">
                            {employee.fname + " " + employee.lname}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Route
                              sx={{
                                width: "12.5px",
                                height: "12.5px",
                                mr: "5px",
                                color: "secondary.main",
                              }}
                            />
                            {employee?.pickUp?.address}
                          </Typography>
                        </Box>
                      </Box>
                      <ButtonBase
                        onClick={() => handleRemovePassengersFromCab(employee)}
                        sx={{ ...RowFlex, width: "20%", borderRadius: "100px" }}
                      >
                        <Close
                          sx={{
                            backgroundColor: "error.main",
                            borderRadius: "100px",
                            p: 0.5,
                            width: "35px",
                            height: "35px",
                            color: "white",
                          }}
                        />
                      </ButtonBase>
                    </Box>
                  );
                }
              )
            : !previewMode && (
                <Typography sx={{ m: "auto" }} variant="h6">
                  No Passengers Added Yet !
                </Typography>
              )}
          <Box sx={{ ...RowFlex, width: "100%", my: "10px" }}>
            {previewMode ? (
              <Box sx={{ ...RowFlex, gap: "10px", width: "100%" }}>
                <Button
                  onClick={HandlePreviewRoute}
                  sx={{ borderRadius: "10px" }}
                  color="error"
                  endIcon={<Close />}
                ></Button>
                <Button
                  disabled={
                    status === "pending" && selectedPassengers?.length > 0
                  }
                  onClick={HandleCreateRoute}
                  sx={{ borderRadius: "10px" }}
                  fullWidth
                  color="info"
                  variant="contained"
                  endIcon={<Add />}
                >
                  Create Route
                </Button>
              </Box>
            ) : (
              <Button
                onClick={HandlePreviewRoute}
                disabled={selectedPassengers?.length < 1}
                sx={{ borderRadius: "10px" }}
                fullWidth
                color="info"
                endIcon={<Visibility />}
              >
                Preview Route
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AddPassengers;
