import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import {
  AlignVerticalBottom,
  AlignVerticalCenter,
  AlignVerticalTop,
  NewReleases,
  Place,
  Style,
  UnfoldLess,
  UnfoldMore,
  ViewInAr,
} from "@mui/icons-material";
import { useContext, useState } from "react";
import MapComponent from "../../components/Map";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import useLocalStorage from "../../hooks/useLocalStorage";
import DefaultSnackPositionContext from "../../context/DefaultSnackPositionContext";
import DefaultCabViewModeContext from "../../context/DefaultCabViewModeContext";
import DefaultMapStyleContext from "../../context/DefaultMapStyleContext";

function Settings() {
  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);
  const { getItem, setItem } = useLocalStorage();

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
      </Box>
    </PageContainer>
  );
}

export default Settings;
