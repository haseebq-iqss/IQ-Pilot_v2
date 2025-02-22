// @ts-nocheck
import PageContainer from "./PageContainer";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { FormEvent, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxios from "../../api/useAxios";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import EmployeeTypes from "../../types/EmployeeTypes";
import Cabtypes from "../../types/CabTypes";
import * as XLSX from "xlsx";
import { CloudUpload } from "@mui/icons-material";

export const AddTeamMembers = () => {
  const [department, setDepartment] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [androidSetup, setAndroidSetup] = useState(true);
  const [typeOfCab, setTypeOfCab] = useState("vendor");
  const [hasCabService, setHasCabService] = useState("true");
  const [tmShift, setTmShift] = useState("14:00-20:30");

  const navigate = useNavigate();

  const [fullName, setFullName] = useState({
    firstName: "",
    lastName: "",
  });
  const location = useLocation();
  const driverPath = location.pathname.includes("/admin/addCabDrivers");
  const handleWorkLocation = (event: any) => {
    setWorkLocation(event.target.value);
  };
  const handleChangeDepartment = (event: any) => {
    setDepartment(event.target.value);
  };

  const addTMMF = (teamMemberData: any) => {
    return useAxios.post("auth/signup", teamMemberData);
  };

  type CabDriverType = EmployeeTypes & Cabtypes;
  const addCabDriver = (cabDriverData: CabDriverType) => {
    // console.log(cabDriverData);
    return useAxios.post("auth/signup", cabDriverData);
  };
  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);
  const { mutate: AddTeamMember } = useMutation({
    mutationFn: addTMMF,
    onSuccess: (data) => {
      setOpenSnack({
        open: true,
        message: data.data.message,
        severity: "success",
      });
      navigate(-1);
    },
    onError: (err: any) => {
      setOpenSnack({
        open: true,
        message: err?.response?.data?.message,
        severity: "warning",
      });
    },
  });

  const { mutate: AddCabDriver } = useMutation({
    mutationFn: addCabDriver,
    onSuccess: (data) => {
      setOpenSnack({
        open: true,
        message: data.data.message,
        severity: "success",
      });
      navigate(-1);
    },
    onError: (err: any) => {
      setOpenSnack({
        open: true,
        message: err?.response?.data?.message,
        severity: "warning",
      });
    },
  });

    // Define timing options (removed duplicate entry)
    const pickupTimings = [
      { t4Time: "09:00", t2Time: "09:00 AM" },
      { t4Time: "10:00", t2Time: "10:00 AM" },
      { t4Time: "11:00", t2Time: "11:00 AM" },
      { t4Time: "12:00", t2Time: "12:00 PM" },
      { t4Time: "13:00", t2Time: "01:00 PM" },
      { t4Time: "14:00", t2Time: "02:00 PM" },
      { t4Time: "15:00", t2Time: "03:00 PM" },
      { t4Time: "16:00", t2Time: "04:00 PM" },
      { t4Time: "17:00", t2Time: "05:00 PM" },
      { t4Time: "18:00", t2Time: "06:00 PM" },
    ];
  
    const dropTimings = [
      { t4Time: "13:00", t2Time: "01:00 PM" },
      { t4Time: "17:00", t2Time: "05:00 PM" },
      { t4Time: "17:30", t2Time: "05:30 PM" },
      { t4Time: "18:00", t2Time: "06:00 PM" },
      { t4Time: "18:30", t2Time: "06:30 PM" },
      { t4Time: "20:30", t2Time: "08:30 PM" },
      { t4Time: "22:00", t2Time: "10:00 PM" },
      { t4Time: "22:30", t2Time: "10:30 PM" },
      { t4Time: "23:00", t2Time: "11:00 PM" },
      { t4Time: "01:00", t2Time: "01:00 AM" },
    ];
  
    const combinedTimings = pickupTimings.map((pickup, index) => {
      const drop = dropTimings[index];
      return `${pickup.t4Time}-${drop.t4Time}`;
    });

  function HandleCabDriver(e: FormEvent) {
    e.preventDefault();
    const currentTarget = e.currentTarget as HTMLFormElement;
    interface CabDriverData {
      fname: string;
      lname: string;
      email: string;
      phone: string;
      address: string;
      profilePicture: File;
      password: string;
      seatingCapacity: number;
      cabNumber: string;
      numberPlate: string;
      carModel: string;
      carColor: string;
      role: string;
      androidSetup: boolean;
      typeOfCab: string;
      mileage: string;
    }

    const cabDriverData: CabDriverType = {
      fname: currentTarget.firstName.value,
      lname: currentTarget.lastName.value,
      email: currentTarget.email.value,
      phone: currentTarget.phone.value,
      address: currentTarget.address.value,
      profilePicture: currentTarget.profilePicture.files?.[0] as File,
      password: currentTarget.password.value,
      seatingCapacity: parseInt(currentTarget.seatingCapacity.value, 10),
      cabNumber: currentTarget.cabNumber.value,
      numberPlate: currentTarget.numberPlate.value,
      carModel: currentTarget.carModel.value,
      carColor: currentTarget.carColor.value,
      androidSetup,
      role: "driver",
      typeOfCab,
      mileage: currentTarget.mileage.value,
    };

    const formData = new FormData();

    for (const key in cabDriverData) {
      if (cabDriverData.hasOwnProperty(key)) {
        const value: any = cabDriverData[key as keyof CabDriverData];
        if (key === "profilePicture") {
          formData.append(key, value);
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    }
    const obj = {};
    for (const [key, value] of formData.entries()) {
      obj[key] = value;
    }
    // console.log(obj);
    // console.log(formData.keys());
    AddCabDriver(formData as CabDriverType);
  }

  const handleFullName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setFullName((prevFullName) => ({
      ...prevFullName,
      [name]: value,
    }));
  };

  function HandleAddTM(e: FormEvent) {
    e.preventDefault();
    const currentTarget = e.currentTarget as HTMLFormElement;

    // if (!currentTarget.profilePicture.files) {
    //   return setOpenSnack({
    //     open: true,
    //     message: "Please upload a profile picture",
    //     severity: "error",
    //   })
    // }

    const teamMemberData: EmployeeTypes = {
      fname: currentTarget.firstName.value,
      lname: currentTarget.lastName.value,
      email: currentTarget.email.value,
      phone: currentTarget.phone.value,
      address: currentTarget.address.value,
      profilePicture: currentTarget.profilePicture.files[0],
      currentShift: tmShift,
      pickUp: {
        coordinates: currentTarget.coordinates.value.split(",").map(Number) as [
          number,
          number
        ],
        address: currentTarget.address.value as string,
      },
      password: currentTarget.password.value,
      workLocation: workLocation,
      department: department,
      role: "employee",
      hasCabService,
    };

    const formData = new FormData();

    for (const key in teamMemberData) {
      if (teamMemberData.hasOwnProperty(key)) {
        const value = teamMemberData[key as keyof EmployeeTypes];
        if (key === "profilePicture") {
          formData.append(key, value as File);
        } else if (typeof value === "object") {
          formData.append(
            "pickUp[coordinates][]",
            teamMemberData.pickUp!.coordinates[0].toString()
          );
          formData.append(
            "pickUp[coordinates][]",
            teamMemberData.pickUp!.coordinates[1].toString()
          );
          formData.append("pickUp[address]", teamMemberData.pickUp!.address);
          // console.log(key, value);
          // console.log(JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    }

    AddTeamMember(formData);
  }

  const bulkUploadMF = (bulkUploadData: any) => {
    return useAxios.post("users/bulk-upload", bulkUploadData);
  };

  const { mutate: bulkUploadMutation, status: bulkUploadStatus } = useMutation({
    mutationFn: bulkUploadMF,
    onSuccess: (data) => {
      console.log(data);
      setOpenSnack({
        open: true,
        message: "Bulk Upload was Successful",
        severity: "success",
      });
      navigate(-1);
    },
    onError: (err: any) => {
      setOpenSnack({
        open: true,
        message: "Something went wrong!",
        severity: "error",
      });
    },
  });
  // const [jsonData, setJsonData] = useState(null);
  const BulkUploader = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data: any = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        // setJsonData(json);
        console.log(json);
        bulkUploadMutation(json);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <PageContainer
      headerText={`${
        location.pathname.includes("/admin/addCabDrivers")
          ? " Add Cab Driver"
          : "Add Team Member"
      }`}
      subHeadingText="Add details of new team member"
      parentStyles={{}}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          py: "2rem",
          // height: "65vh",
          // overflow: "scroll",
        }}
      >
        {/* FORM */}
        <Box
          component={"form"}
          sx={{
            ...ColFlex,
            gap: "20px",
            width: "100%",
            // py: "5%",
            // my: "2.5%",
          }}
          onSubmit={
            location.pathname.includes("/admin/addCabDrivers")
              ? HandleCabDriver
              : HandleAddTM
          }
        >
          {/* HEADER */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <TextField
              required
              fullWidth
              name="firstName"
              label="first name"
              type="text"
              placeholder="Enter your first name"
              InputLabelProps={{ shrink: true }}
              onChange={handleFullName}
              autoFocus
            />
            <TextField
              required
              fullWidth
              name="lastName"
              label="last name"
              type="text"
              placeholder="Enter your last name"
              InputLabelProps={{ shrink: true }}
              onChange={handleFullName}
            />
          </Box>
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <TextField
              required
              fullWidth
              name="email"
              label="email"
              type="email"
              placeholder="Enter your email"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              required
              fullWidth
              name="phone"
              label="phone"
              type="number"
              placeholder="Enter your phone number"
              InputLabelProps={{ shrink: true }}
            />
          </Box>{" "}
          {driverPath && (
            <Box
              sx={{
                ...RowFlex,
                width: "100%",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              <TextField
                required
                fullWidth
                name="password"
                label="password"
                type="password"
                placeholder="Password"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                required
                fullWidth
                name="address"
                label="address"
                type="text"
                placeholder="Enter your address"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            {!driverPath && (
              <FormControl fullWidth>
                <InputLabel
                  sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                  id="department-label"
                >
                  Department
                </InputLabel>
                <Select
                  // size="small"
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
            )}
            {!driverPath && (
              <TextField
                required
                fullWidth
                name="password"
                label="password"
                type="password"
                placeholder="Password"
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Box>
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            {!driverPath && (
              <FormControl fullWidth>
                <InputLabel
                  sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                  id="worklocation-label"
                >
                  Work Location
                </InputLabel>
                <Select
                  // size="small"
                  labelId="worklocation-label"
                  id="worklocation-select"
                  value={workLocation}
                  onChange={handleWorkLocation}
                  label="worklocation"
                >
                  <MenuItem value={"Rangreth"}>Rangreth</MenuItem>
                  <MenuItem value={"Zaira Tower"}>Zaira Tower</MenuItem>
                  <MenuItem value={"Karanagar"}>Karanagar</MenuItem>
                  <MenuItem value={"Zirakpur"}>Zirakpur</MenuItem>
                </Select>
              </FormControl>
            )}
            {!driverPath && (
              <TextField
                required
                fullWidth
                name="address"
                label="address"
                type="text"
                placeholder="Enter your address"
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Box>
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            {!driverPath && (
              <TextField
                required
                fullWidth
                name="coordinates"
                label="Coordinates"
                type="string"
                placeholder="Coordinates"
                InputLabelProps={{ shrink: true }}
              />
            )}
            {!driverPath && (
              <FormControl fullWidth>
                <InputLabel
                  sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                  id="hasCabService-label"
                >
                  Cab Service
                </InputLabel>

                <Select
                  // size="small"
                  sx={{ width: "100%" }}
                  labelId="hasCabService"
                  id="hasCabService"
                  value={hasCabService}
                  onChange={(e) => {
                    setHasCabService(e.target.value);
                    console.log(e.target.value);
                  }}
                  label="Cab Service"
                >
                  <MenuItem value={"true"}>Yes</MenuItem>
                  <MenuItem value={"false"}>No</MenuItem>
                </Select>
              </FormControl>
            )}

{!driverPath && (
              <FormControl fullWidth>
                <InputLabel
                  sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                  id="hasCabService-label"
                >
                  TMs Shift
                </InputLabel>

                <Select
                    name="currentShift"
                    label="Current Shift"
                    value={tmShift}
                    onChange={(e) =>
                      setTmShift(e.target.value)
                    }
                    labelId="currentShift-label"
                  >
                    {combinedTimings.map((timeSlot, index) => (
                      <MenuItem key={index} value={timeSlot}>
                        {timeSlot}
                      </MenuItem>
                    ))}
                  </Select>
              </FormControl>
            )}
          </Box>
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            {" "}
            <Button
              variant="contained"
              component="label"
              sx={{
                width: "50%",
                height: "3.4rem",
                bgcolor: "#9329FC",
                color: "white",
                p: "0",
              }}
            >
              + ADD PROFILE PICTURE
              <input
                type="file"
                accept="image/png, image/gif, image/jpeg"
                hidden
                name="profilePicture"
              />
            </Button>
          </Box>
          {driverPath && (
            <>
              <Typography variant="h5">Cab Details</Typography>
              <Box
                sx={{
                  ...RowFlex,
                  width: "100%",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <TextField
                  required={driverPath}
                  fullWidth
                  name="cabNumber"
                  label="cab number"
                  type="cab number"
                  placeholder="Cab Number"
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth>
                  <InputLabel
                    sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                    id="department-label"
                  >
                    Android Setup
                  </InputLabel>

                  <Select
                    // size="small"
                    sx={{ width: "100%" }}
                    labelId="androidsetup"
                    id="androidsetup"
                    value={androidSetup}
                    onChange={(e) => {
                      setAndroidSetup(e.target.value);
                      console.log(e.target.value);
                    }}
                    label="Android Device"
                  >
                    <MenuItem value={true}>Installed</MenuItem>
                    <MenuItem value={false}>Not Installed</MenuItem>
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
                <TextField
                  required={driverPath}
                  fullWidth
                  name="carColor"
                  label="cab color"
                  type="cab color"
                  placeholder="Cab Color"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  required={driverPath}
                  fullWidth
                  name="seatingCapacity"
                  label="seating capacity"
                  type="number"
                  placeholder="Seating Capacity"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box
                sx={{
                  ...RowFlex,
                  width: "100%",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <TextField
                  required={driverPath}
                  fullWidth
                  name="numberPlate"
                  label="number plate"
                  type="text"
                  placeholder="Number plate"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  required={driverPath}
                  fullWidth
                  name="carModel"
                  label="model"
                  type="text"
                  placeholder="Cab Model"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box
                sx={{
                  ...RowFlex,
                  width: "100%",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <TextField
                  required={driverPath}
                  fullWidth
                  name="mileage"
                  label="cab mileage"
                  type="number"
                  placeholder="Mileage in Kilometers"
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth>
                  <InputLabel
                    sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                    id="department-label"
                  >
                    Type Of Cab
                  </InputLabel>

                  <Select
                    // size="small"
                    sx={{ width: "100%" }}
                    labelId="typeOfCab"
                    id="typeOfCab"
                    value={typeOfCab}
                    onChange={(e) => {
                      setTypeOfCab(e.target.value);
                      console.log(e.target.value);
                    }}
                    label="Type of Cab"
                  >
                    <MenuItem value={"personal"}>Personal</MenuItem>
                    <MenuItem value={"vendor"}>Vendor (Outsourced)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </>
          )}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              mt: "1rem",
            }}
          >
            <Button
              sx={{
                width: "49.3%",
                padding: "0.3rem",
                height: "3rem",
                // marginTop: "1.2rem",
              }}
              type="submit"
              // disabled={loginStatus === "pending"}
              color="primary"
              variant="contained"
            >
              {`Confirm and Add ${
                fullName.firstName + " " + fullName.lastName
              }`}
            </Button>
          </Box>
          {/* BULK UPLOAD */}
          {!location.pathname.includes("/admin/addCabDrivers") && (
            <Button
              variant="contained"
              component="label"
              sx={{
                width: "50%",
                height: "3.4rem",
                bgcolor: "warning.dark",
                color: "white",
                p: "0",
                mt: 5,
              }}
              startIcon={
                bulkUploadStatus === "pending" ? (
                  <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                ) : (
                  <CloudUpload sx={{ mr: 1 }} />
                )
              }
              disabled={bulkUploadStatus === "pending"}
            >
              {bulkUploadStatus === "pending"
                ? "Uploading"
                : "Upload an Excel file"}
              <input
                onChange={BulkUploader}
                type="file"
                // accept="image/png, image/gif, image/jpeg"
                hidden
              />
            </Button>
          )}
        </Box>
      </Box>
    </PageContainer>
  );
};
