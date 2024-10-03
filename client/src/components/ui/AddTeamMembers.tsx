// @ts-nocheck
import PageContainer from "./PageContainer";
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

export const AddTeamMembers = () => {
  const [department, setDepartment] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [androidSetup, setAndroidSetup] = useState(true);

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
    // console.log(formData);
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

    const teamMemberData: EmployeeTypes = {
      fname: currentTarget.firstName.value,
      lname: currentTarget.lastName.value,
      email: currentTarget.email.value,
      phone: currentTarget.phone.value,
      address: currentTarget.address.value,
      profilePicture: currentTarget.profilePicture.files[0],
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

  const { mutate: bulkUploadMutation } = useMutation({
    mutationFn: bulkUploadMF,
    onSuccess: (data) => {
      console.log(data);
      setOpenSnack({
        open: true,
        message: "Bulk Upload was Successful",
        severity: "success",
      });
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
                //   fullWidth
                sx={{ width: "50%" }}
                name="coordinates"
                label="Coordinates"
                type="string"
                placeholder="Coordinates"
                InputLabelProps={{ shrink: true }}
              />
            )}
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
          <Button
            variant="contained"
            component="label"
            sx={{
              width: "50%",
              height: "3.4rem",
              bgcolor: "warning.dark",
              color: "white",
              p: "0",
            }}
          >
            Upload an Excel file
            <input
              onChange={BulkUploader}
              type="file"
              // accept="image/png, image/gif, image/jpeg"
              hidden
              name="profilePicture"
            />
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
};
