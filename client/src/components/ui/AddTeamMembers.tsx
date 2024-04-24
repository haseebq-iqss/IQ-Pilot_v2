import PageContainer from "./PageContainer";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { FormEvent, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/useAxios";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import EmployeeTypes from "../../types/EmployeeTypes";

export const AddTeamMembers = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("");
  const [department, setDepartment] = useState("");
  const [workLocation, setWorkLocation] = useState("");

  const handleWorkLocation = (event: any) => {
    setWorkLocation(event.target.value);
  };
  const handleChangeDepartment = (event: any) => {
    setDepartment(event.target.value);
  };

  const addTMMF = (teamMemberData: EmployeeTypes) => {
    console.log(teamMemberData);
    return useAxios.post("auth/signup", teamMemberData);
  };

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);
  function LiveDp(event: any) {
    setProfilePic(event.target.files[0]);
    //   if (event.target.files && event.target.files[0]) {
    //     let reader = new FileReader();
    //     reader.onload = (e: any) => {
    //     };
    //     reader.readAsDataURL(event.target.files[0]);
    //   }
  }
  const { mutate: AddTeamMember } = useMutation({
    mutationFn: addTMMF,
    onSuccess: (data) => {
      setOpenSnack({
        open: true,
        message: data.data.message,
        severity: "success",
      });
    },
    onError: (err: any) => {
      setOpenSnack({
        open: true,
        message: err?.response?.data?.message,
        severity: "warning",
      });
    },
  });

  function HandleAddTM(e: FormEvent) {
    e.preventDefault();
    const currentTarget = e.currentTarget as HTMLFormElement;

    // Assuming EmployeeTypes is defined somewhere and includes all the necessary types
    const teamMemberData: EmployeeTypes = {
      fname: currentTarget.firstName.value,
      lname: currentTarget.lastName.value,
      email: currentTarget.email.value,
      phone: currentTarget.phone.value,
      address: currentTarget.address.value,
      profilePicture: currentTarget.profilePicture.files[0], // Assuming profilePicture is the file input for the profile picture
      pickUp: {
        coordinates: currentTarget.coordinates.value.split(",").map(Number),
        address: currentTarget.address.value,
      },
      password: currentTarget.password.value,
      workLocation: workLocation,
      department: department,
      role: "employee",
    };

    const formData = new FormData();

    for (const key in teamMemberData) {
      if (teamMemberData.hasOwnProperty(key)) {
        const value = teamMemberData[key];
        if (key === "profilePicture") {
          formData.append(key, value as File); // Append file directly
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value)); // Convert nested objects to JSON strings
        } else {
          formData.append(key, String(value)); // Convert other values to strings
        }
      }
    }

    AddTeamMember(formData);
  }

  return (
    <PageContainer
      headerText={`Add Team Member`}
      subHeadingText="Add details of new team member"
      parentStyles={{}}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          py: "2rem",
          height: "65vh",
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
          onSubmit={HandleAddTM}
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
            />
            <TextField
              required
              fullWidth
              name="lastName"
              label="last name"
              type="text"
              placeholder="Enter your last name"
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
            <TextField
              required
              fullWidth
              name="password"
              label="password"
              type="password"
              placeholder="Password"
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
                <MenuItem value={"Zaira Towers"}>Zaira Tower</MenuItem>
              </Select>
            </FormControl>
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
              //   fullWidth
              sx={{ width: "50%" }}
              name="coordinates"
              label="Coordinates"
              type="string"
              placeholder="Coordinates"
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              component="label"
              onChange={LiveDp}
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
                // marginTop: "1.2rem",
              }}
              type="submit"
              // disabled={loginStatus === "pending"}
              color="primary"
              variant="contained"
            >
              {`Confirm and Add john`}
            </Button>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};
