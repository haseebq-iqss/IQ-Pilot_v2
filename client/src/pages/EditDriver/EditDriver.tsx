// @ts-nocheck
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FormEvent, useContext, useEffect, useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import SnackbarContext from "../../context/SnackbarContext";
import Cabtypes from "../../types/CabTypes";
import PageContainer from "../../components/ui/PageContainer";
import EmployeeTypes from "../../types/EmployeeTypes";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";

export const EditDriver = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const driver: Cabtypes = location?.state;
  // console.log(driver);

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const editCabDriver = (driverData: Cabtypes & EmployeeTypes) => {
    return useAxios.patch(`/users/driver/${id}`, driverData);
  };

  const { mutate: EditCabDriver } = useMutation({
    mutationFn: editCabDriver,
    onSuccess: (data) => {
      setOpenSnack({
        open: true,
        message: "Profile updated successfully!",
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

  const [fname, setFname] = useState(driver?.cabDriver?.fname);
  const [lname, setLname] = useState(driver?.cabDriver?.lname);
  const [phone, setPhone] = useState(driver?.cabDriver?.phone);
  const [email, setEmail] = [driver?.cabDriver?.email];
  const [numberPlate, setNumberPlate] = useState(driver?.numberPlate);

  const [carModel, setCarModel] = useState(driver?.carModel);
  const [cabNumber, setCabNumber] = useState(driver?.cabNumber);
  const [mileage, setMileage] = useState(driver?.mileage || 0);
  const [carColor, setCarColor] = useState(driver?.carColor);
  const [seatingCapacity, setSeatingCapacity] = useState(
    driver?.seatingCapacity
  );
  const [typeOfCab, setTypeOfCab] = useState(driver?.typeOfCab);
  const [androidSetup, setAndroidSetup] = useState(driver?.androidSetup);
  const [acInstalled, setAcInstalled] = useState(driver?.acInstalled);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updatedDriver = {
      numberPlate,
      carModel,
      cabNumber,
      mileage: Number(mileage),
      carColor,
      seatingCapacity,
      typeOfCab,
      acInstalled,
      androidSetup,

      cabDriver: {
        fname,
        lname,
        phone,
        email,
      },
    };
    console.log("submit", updatedDriver);
    // EditCabDriver(updatedDriver);
  };

  return (
    <PageContainer
      headerText={`Edit Details Of ${
        driver?.cabDriver?.fname + " " + driver?.cabDriver?.lname
      }`}
      parentStyles={{ padding: "20px" }}
    >
      <Box
        component={"form"}
        sx={{
          ...ColFlex,
          gap: "20px",
          width: "100%",
        }}
        onSubmit={handleSubmit}
      >
        <Box
          sx={{
            ...RowFlex,
            width: "100%",
            justifyContent: "space-between",
            gap: "15px",
          }}
        >
          <TextField
            fullWidth
            name="firstName"
            type="text"
            label="First Name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            placeholder="Enter your first name"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            name="lastName"
            type="text"
            label="Last Name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            required
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
            fullWidth
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            fullWidth
            label="Number Plate"
            value={numberPlate}
            onChange={(e) => setNumberPlate(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Cab Model"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            required
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
            fullWidth
            label="Cab Color"
            value={carColor}
            onChange={(e) => setCarColor(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Cab Number"
            value={cabNumber}
            onChange={(e) => setCabNumber(e.target.value)}
            required
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
            fullWidth
            label="Mileage"
            value={mileage}
            onChange={(e) => setMileage(Number(e.target.value))}
            required
          />
          <TextField
            fullWidth
            label="Type of Cab"
            value={typeOfCab}
            onChange={(e) => setTypeOfCab(e.target.value)}
            required
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
            fullWidth
            label="Seating Capacity"
            value={seatingCapacity}
            onChange={(e) => setSeatingCapacity(Number(e.target.value))}
            required
          />
          <FormControl fullWidth>
            <InputLabel
              sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
              id="acInstalled-label"
            >
              AC Installed
            </InputLabel>
            <Select
              // size="small"
              label="AC"
              value={acInstalled}
              onChange={(e: any) => setAcInstalled(e.target.value)}
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
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
          <FormControl fullWidth>
            <InputLabel
              sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
              id="androidSetup-label"
            >
              Android Setup
            </InputLabel>
            <Select
              // size="small"
              label="Android Setup"
              value={androidSetup}
              onChange={(e) => setAndroidSetup(e.target.value)}
            >
              <MenuItem value={true}>Installed</MenuItem>
              <MenuItem value={false}>Not Installed</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            mt: "1rem",
          }}
        >
          <Button
            sx={{
              width: "49.3%",
              padding: "0.3rem",
              height: "3rem",
            }}
            type="submit"
            color="primary"
            variant="contained"
          >
            {"Confirm and Edit "}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
};
