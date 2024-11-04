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
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import {
  AlignVerticalBottom,
  AlignVerticalCenter,
  AlignVerticalTop,
  Done,
  NewReleases,
  Photo,
  Place,
  Style,
  UnfoldLess,
  UnfoldMore,
  ViewInAr,
} from "@mui/icons-material";
import { FormEvent, useContext, useState } from "react";
import MapComponent from "../../components/Map";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import useLocalStorage from "../../hooks/useLocalStorage";
import DefaultSnackPositionContext from "../../context/DefaultSnackPositionContext";
import DefaultCabViewModeContext from "../../context/DefaultCabViewModeContext";
import DefaultMapStyleContext from "../../context/DefaultMapStyleContext";
import EmployeeTypes from "../../types/EmployeeTypes";
import UserDataContext from "../../context/UserDataContext";
import { UserContextTypes } from "../../types/UserContextTypes";

function Settings() {
  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);
  const { getItem, setItem } = useLocalStorage();

  // App Settings Logic

  const { defaultSnackbarPosition, setDefaultSnackbarPosition }: any =
    useContext(DefaultSnackPositionContext);

  const [snackbarPosition, setSnackbarPosition] = useState(
    () => getItem("defaultSnackbarPosition") || defaultSnackbarPosition
  );
  const handleChangeSnackbarPosition = (event: any) => {
    setSnackbarPosition((event.target as HTMLSelectElement).value);
    setDefaultSnackbarPosition((event.target as HTMLSelectElement).value);
    setItem(
      "defaultSnackbarPosition",
      (event.target as HTMLSelectElement).value
    );
    setOpenSnack({
      open: true,
      message: "Snackbar Position Changed!",
      severity: "success",
    });
  };

  const {
    defaultCabView: defaultCabViewValue,
    setDefaultCabView: setDefaultCabViewValue,
  }: any = useContext(DefaultCabViewModeContext);

  const [defaultCabView, setSetDefaultCabView] = useState(
    () => getItem("defaultCabView") || defaultCabViewValue
  );
  const handleChangeDefaultCabView = (event: any) => {
    setItem("defaultCabView", (event.target as HTMLSelectElement).value);
    setDefaultCabViewValue((event.target as HTMLSelectElement).value);
    setSetDefaultCabView((event.target as HTMLSelectElement).value);
  };

  const {
    defaultMapStyle: defaultMapStyleValue,
    setDefaultMapStyle: setDefaultMapStyleValue,
  }: any = useContext(DefaultMapStyleContext);

  const [defaultMapStyle, setSetDefaultMapStyle] = useState(
    () => getItem("defaultMapStyle") || defaultMapStyleValue
  );
  const handleChangeDefaultMapStyle = (event: any) => {
    setItem("defaultMapStyle", (event.target as HTMLSelectElement).value);
    setDefaultMapStyleValue((event.target as HTMLSelectElement).value);
    setSetDefaultMapStyle((event.target as HTMLSelectElement).value);
  };

  // Admin Profile Logic

  const { userData }: UserContextTypes = useContext(UserDataContext);

  console.log(userData);

  const [workLocation, setWorkLocation] = useState(userData?.workLocation);
  const handleWorkLocation = (event: any) => {
    setWorkLocation(event.target.value);
  };

  const [department, setDepartment] = useState(userData?.department);
  const handleChangeDepartment = (event: any) => {
    setDepartment(event.target.value);
  };

  function HandleEditAdminProfile(e: FormEvent) {
    e.preventDefault();
    const currentTarget = e.currentTarget as HTMLFormElement;

    // USING PARTIALS
    // const teamMemberData: Partial<EmployeeTypes> = {
    const teamMemberData: EmployeeTypes = {
      fname: currentTarget.firstName.value,
      lname: currentTarget.lastName.value,
      email: currentTarget.email.value,
      phone: currentTarget.phone.value,
      address: currentTarget.address.value,
      profilePicture: currentTarget.profilePicture.files[0],
      workLocation: workLocation,
      department: department,
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

    // Display the key/value pairs
    // for (var pair of formData.entries()) {
    //   console.log(pair[0] + ", " + pair[1]);
    // }
    // AddTeamMember(formData);
  }

  return (
    <PageContainer
      headerText="Application Settings"
      subHeadingText="Personalize your app and set defaults"
      options={false}
    >
      {/* App Settings */}
      <Box
        sx={{
          ...ColFlex,
          width: "100%",
          height: "auto",
          mt: 2.5,
          alignItems: "flex-start",
        }}
      >
        {/* Options Box */}
        <Box
          sx={{
            ...ColFlex,
            alignSelf: "center",
            width: "95%",
            height: "auto",
            alignItems: "flex-start",
            gap: 5,
          }}
        >
          {/* Position of Alert Bar */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {/* Text */}
            <Box sx={{ ...ColFlex, alignItems: "flex-start" }}>
              <Typography sx={{ ...RowFlex, gap: 1 }} variant="h6">
                <NewReleases /> Default Alert Bar position
              </Typography>
              <Typography
                sx={{ ...RowFlex, gap: 1 }}
                variant="body2"
                color={"GrayText"}
              >
                Set the default behaviours of the Alert bar position on the
                screen.
              </Typography>
            </Box>
            {/* Select */}
            <Box sx={{ width: "40%" }}>
              <FormControl fullWidth>
                <InputLabel
                  sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                  id="position-select-label"
                >
                  Snackbar Position
                </InputLabel>
                <Select
                  size="small"
                  labelId="snackbar-position-label"
                  value={snackbarPosition}
                  onChange={handleChangeSnackbarPosition}
                  label="Snackbar Position"
                >
                  <MenuItem
                    value={"top center"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <AlignVerticalTop /> Top Center
                  </MenuItem>
                  <MenuItem
                    value={"top left"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <AlignVerticalTop /> Top Left
                  </MenuItem>
                  <MenuItem
                    value={"top right"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <AlignVerticalTop /> Top Right
                  </MenuItem>
                  <MenuItem
                    value={"center center"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <AlignVerticalCenter /> Center
                  </MenuItem>
                  <MenuItem
                    value={"center left"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <AlignVerticalCenter /> Center Left
                  </MenuItem>
                  <MenuItem
                    value={"center right"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <AlignVerticalCenter /> Center Right
                  </MenuItem>
                  <MenuItem
                    value={"bottom center"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <AlignVerticalBottom /> Bottom Center
                  </MenuItem>
                  <MenuItem
                    value={"bottom left"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <AlignVerticalBottom /> Bottom Left
                  </MenuItem>
                  <MenuItem
                    value={"bottom right"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <AlignVerticalBottom /> Bottom Right
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          {/* Default View For Active Cabs */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {/* Text */}
            <Box sx={{ ...ColFlex, alignItems: "flex-start" }}>
              <Typography sx={{ ...RowFlex, gap: 1 }} variant="h6">
                <ViewInAr /> Default View Mode for Active Cabs
              </Typography>
              <Typography
                sx={{ ...RowFlex, gap: 1 }}
                variant="body2"
                color={"GrayText"}
              >
                Set the default behaviour of the Active Cabs in the Active Cabs
                Page
              </Typography>
            </Box>
            {/* Select */}
            <Box sx={{ width: "40%" }}>
              <FormControl fullWidth>
                <InputLabel
                  sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                  id="position-select-label"
                >
                  Default View
                </InputLabel>
                <Select
                  size="small"
                  labelId="default-view-label"
                  value={defaultCabView}
                  onChange={handleChangeDefaultCabView}
                  label="Default View"
                >
                  <MenuItem
                    value={"expanded"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <UnfoldMore /> Expanded
                  </MenuItem>
                  <MenuItem
                    value={"restricted"}
                    sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                  >
                    <UnfoldLess /> Restricted
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          {/* Default Map Styles */}
          <Box sx={{ ...ColFlex, width: "100%" }}>
            <Box
              sx={{
                ...RowFlex,
                width: "100%",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {/* Text */}
              <Box sx={{ ...ColFlex, alignItems: "flex-start" }}>
                <Typography sx={{ ...RowFlex, gap: 1 }} variant="h6">
                  <Place /> Default Map Style for iQ Pilot
                </Typography>
                <Typography
                  sx={{ ...RowFlex, gap: 1 }}
                  variant="body2"
                  color={"GrayText"}
                >
                  Set the default Map Styles for this application.
                </Typography>
              </Box>
              {/* Select */}
              <Box sx={{ width: "40%" }}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                    id="style-select-label"
                  >
                    Default Map Style
                  </InputLabel>
                  <Select
                    size="small"
                    labelId="default-style-label"
                    value={defaultMapStyle}
                    onChange={handleChangeDefaultMapStyle}
                    label="Default Style"
                  >
                    <MenuItem
                      value={"vanilla"}
                      sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                    >
                      <Style /> Default (Vanilla)
                    </MenuItem>
                    <MenuItem
                      value={"france-hot"}
                      sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                    >
                      <Style /> France Hot Style
                    </MenuItem>
                    <MenuItem
                      value={"swiss"}
                      sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                    >
                      <Style /> Swiss Style
                    </MenuItem>
                    <MenuItem
                      value={"dutch"}
                      sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                    >
                      <Style /> Dutch Style
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
          {/* Map View */}
          <Box
            sx={{
              width: "100%",
              height: "200px",
              overflow: "hidden",
              borderRadius: "15px",
            }}
          >
            <MapComponent width="100%" height="100%" mode="route-view" />
          </Box>
        </Box>
      </Box>

      {/* Account Settings */}
      <Box
        sx={{
          ...ColFlex,
          width: "100%",
          height: "auto",
          alignItems: "flex-start",
          mt: 5,
        }}
      >
        <PageHeader>Account Settings</PageHeader>
        <Typography color={"GrayText"} variant="body1">
          Edit your account settings and preferences.
        </Typography>

        {/* Profile Box */}
        <Box sx={{ ...ColFlex, width: "100%", height: "auto", mt: 7.5 }}>
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
            onSubmit={HandleEditAdminProfile}
          >
            {/* f & lname */}
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
                defaultValue={userData?.fname}
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
                defaultValue={userData?.lname}
                // onChange={handleFullName}
              />
            </Box>
            {/* email , phone */}
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
                defaultValue={userData?.email}
              />
              <TextField
                required
                fullWidth
                name="phone"
                label="phone"
                type="number"
                placeholder="Enter your phone number"
                InputLabelProps={{ shrink: true }}
                defaultValue={userData?.phone}
              />
            </Box>
            {/* department, Change DP */}
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
                  <MenuItem value={"Operations"}>Operations</MenuItem>
                  <MenuItem value={"Software"}>Software</MenuItem>
                </Select>
              </FormControl>
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
                <Photo sx={{ mr: "0.5rem" }} />
                Change Profile Photp
                <input
                  type="file"
                  accept="image/png, image/gif, image/jpeg"
                  hidden
                  name="profilePicture"
                />
              </Button>
            </Box>
            {/* work location and address */}
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
                  <MenuItem value={"Zaira Tower"}>Zaira Tower</MenuItem>
                  <MenuItem value={"Karanagar"}>Karanagar</MenuItem>
                  <MenuItem value={"Zirakpur"}>Zirakpur</MenuItem>
                  <MenuItem value={"Hyderabad"}>Hyderabad</MenuItem>
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
                defaultValue={userData?.pickUp?.address}
              />
            </Box>
            {/* Submit Button */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                mt: "1rem",
              }}
            >
              <Button
                sx={{
                  width: "49.3%",
                  padding: "0.3rem",
                  height: "3rem",
                  alignSelf: "flex-end",
                  // marginTop: "1.2rem",
                }}
                type="submit"
                // disabled={loginStatus === "pending"}
                color="primary"
                variant="contained"
              >
                <Done sx={{ mr: "0.5rem" }} />
                Confirm & Save Changes
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}

export default Settings;
