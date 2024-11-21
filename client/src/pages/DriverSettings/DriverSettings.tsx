import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Switch,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ColFlex, RowFlex, PageFlex } from "../../style_extentions/Flex";
import { Place, Style, ArrowBackIos } from "@mui/icons-material";
import { useContext, useState } from "react";
import MapComponent from "../../components/Map";
import useLocalStorage from "../../hooks/useLocalStorage";
import DefaultMapStyleContext from "../../context/DefaultMapStyleContext";
import isXSmall from "./../../utils/isXSmall";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

function DriverSettings() {
  //   const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);
  const { getItem, setItem } = useLocalStorage();

  // App Settings Logic

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

  const { isXS } = isXSmall();
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    getItem("notificationsEnabled") === "true"
  );

  const handleNotificationToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enabled = event.target.checked;
    setNotificationsEnabled(enabled);
    setItem("notificationsEnabled", enabled.toString());
  };

  return (
    <Box
      sx={{
        ...PageFlex,
        // height: "100vh",
        backgroundColor: "background.default",
        color: "text.primary",
        p: 2.5,
      }}
    >
      <Box
        onClick={() => navigate(-1)}
        sx={{
          ...RowFlex,
          width: "100%",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 1.5,
          // p:0.5
        }}
      >
        <ArrowBackIos
          sx={{
            fontSize: 20,
            color: "text.primary",
          }}
        />
        <Box sx={{ ...ColFlex, alignItems: "flex-start" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Settings
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          ...ColFlex,
          width: "100%",
          height: "100%",
          alignItems: "flex-start",
          gap: 3,
          mt: 2.5,
        }}
      >
        {/* Notifications Section */}
        <Box
          sx={{
            ...ColFlex,
            width: "100%",
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              ...(isXSmall() ? ColFlex : RowFlex),
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {/* Enable Notifications */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    ...RowFlex,
                    width: "100%",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "flex-start",
                  }}
                >
                  <NotificationsActiveIcon />
                  Enable Notifications
                </Typography>
                <Typography variant="body2" color="GrayText">
                  Turn notifications on or off for this app.
                </Typography>
              </Box>
              <Switch
                sx={{ p: 0.5, borderRadius: "100px !important" }}
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
                color="primary"
              />
            </Box>
          </Box>
        </Box>

        {/* Default Map Styles */}
        <Box sx={{ ...ColFlex, width: "100%" }}>
          <Box
            sx={{
              ...(isXS ? ColFlex : RowFlex),
              width: "100%",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ ...ColFlex }}>
              <Typography
                variant="h6"
                sx={{
                  ...RowFlex,
                  width: "100%",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "flex-start",
                }}
              >
                <Place /> Default Map Style
              </Typography>
              <Typography variant="body2" color={"GrayText"}>
                Set the default Map Styles for this application.
              </Typography>
            </Box>

            <Box sx={{ width: isXS ? "100%" : "40%", mt: isXS ? 3 : 0 }}>
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
                  <MenuItem value={"vanilla"}>
                    <Style /> Default (Vanilla)
                  </MenuItem>
                  <MenuItem value={"france-hot"}>
                    <Style /> France Hot Style
                  </MenuItem>
                  <MenuItem value={"swiss"}>
                    <Style /> Swiss Style
                  </MenuItem>
                  <MenuItem value={"dutch"}>
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
  );
}

export default DriverSettings;
